import { execFileSync, spawn } from "node:child_process";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import { validationInputs } from "./validation-inputs.mjs";
import { checkKeys, assembleChecks, environmentFor, fingerprint } from "./ci-checks.mjs";
import { preparePlan } from "./ci-candidate.mjs";
import { GitHubEvidence } from "./ci-manifests.mjs";
import { shardSpecs, workerCount, workerName } from "./ci-shards.mjs";
import { restorePackage } from "./ci-package.mjs";

const json = async (path) => JSON.parse(await readFile(path, "utf8"));

export async function executeValidation({
  root = process.cwd(),
  plan,
  platform = process.platform,
  github,
  execute,
  environment = process.env,
  shardIndex = 0,
} = {}) {
  const before = await validationInputs(root);
  assert.equal(before.digest, plan.blueprint.inputDigest, "Source differs from the prepared validation plan");
  const planned = plan.platforms[platform];
  assert.ok(planned, "Unsupported validation target");
  const fresh = plan.fresh || environment.VILLAGES_CI_FRESH === "true";
  let target = planned.environment;
  if (planned.pending.length || fresh) {
    assert.equal(process.platform, platform, "Tests cannot execute on the wrong platform");
    target = environmentFor(plan.blueprint.toolchain, platform, environment);
    assert.equal(process.version, target.node, "CI execution must use the pinned Node version");
  }
  const specs = checkKeys(plan.blueprint, target);
  const sameHead =
    planned.pending.length && !fresh && github?.workerProof
      ? await github.workerProof(platform, plan.blueprint.policyDigest)
      : [];
  const coverage = assembleChecks(specs, [...planned.reused, ...sameHead], { fresh });
  const proofs = new Map(coverage.reused.map((proof) => [proof.id, { ...proof, executed: false }]));
  const shardCount = workerCount(plan, platform);
  const assigned = shardSpecs(specs, shardCount, shardIndex, planned.pending);
  const assignedIds = new Set(assigned.map((spec) => spec.id));
  const pending = coverage.pending.filter((spec) => assignedIds.has(spec.id));

  const origin = {
    runId: environment.GITHUB_RUN_ID ?? null,
    attempt: Number(environment.GITHUB_RUN_ATTEMPT ?? 1),
    job: workerName(platform, shardIndex),
    sourceRevision: plan.sourceRevision,
    platform: target.platform,
    node: target.node,
    environmentDigest: fingerprint(target),
  };
  const record = (spec, code, extra = {}) =>
    proofs.set(spec.id, {
      id: spec.id,
      key: spec.key,
      code,
      passed: code === 0,
      origin,
      environment: target,
      executed: true,
      ...extra,
    });
  const run = async (args) => {
    if (execute) {
      try {
        await execute(process.execPath, args, { cwd: root, env: environment });
        return 0;
      } catch (error) {
        return error.status ?? 1;
      }
    }
    return new Promise((done) => {
      const child = spawn(process.execPath, args, { cwd: root, env: environment, stdio: "inherit", windowsHide: true });
      child.on("error", (error) => {
        console.error(error.message);
        done(1);
      });
      child.on("close", (code) => done(code ?? 1));
    });
  };
  const script = async (name) => {
    const npm = environment.npm_execpath;
    if (!npm) throw Error("Run validation through npm run validate:ci");
    return run([npm, "run", name]);
  };
  let build;
  let failure;
  try {
    const staticChecks = pending.filter((spec) => spec.kind === "static");
    for (let index = 0; index < staticChecks.length; index += 3)
      await Promise.all(
        staticChecks.slice(index, index + 3).map(async (spec) => record(spec, await script(spec.script))),
      );
    if (staticChecks.some((spec) => !proofs.get(spec.id)?.passed)) throw Error("Static checks failed");
    const buildSpec = specs.find((spec) => spec.id === "build");
    const previousBuild = coverage.reused.find((proof) => proof.id === "build");
    if (previousBuild) {
      assert.ok(
        github && previousBuild.from?.artifact && previousBuild.from.build,
        "Cached build lacks authenticated artifact",
      );
      const receipt = previousBuild.from.build;
      const bytes = await github.file(previousBuild.from.artifact, "artifacts/villages-" + receipt.version + ".zip");
      build = await restorePackage(root, bytes, receipt, before);
    } else {
      const code = await run(["scripts/build-villages.mjs"]);
      if (shardIndex === 0) record(buildSpec, code);
      if (code !== 0) throw Error("Package build failed");
      build = await json(join(root, ".build-tmp/package-build.json"));
    }
    const bytes = await readFile(join(root, "artifacts", "villages-" + build.version + ".zip"));
    assert.equal(fingerprint(bytes), build.sha256, "Built package bytes changed");
    for (const id of ["package", "reproducibility"]) {
      const spec = pending.find((spec) => spec.id === id);
      if (!spec) continue;
      const code = await run(
        id === "package"
          ? ["scripts/verify-package.mjs"]
          : ["scripts/verify-build.mjs", "--prior-sha=" + build.sha256, "--prior-input=" + before.digest],
      );
      record(spec, code);
      if (code !== 0) throw Error(id + " failed");
    }
    const tests = pending.filter((spec) => spec.kind === "test");
    if (tests.length) {
      if (tests.some((spec) => spec.group === "browser") && environment.VILLAGES_CI_BROWSER_READY !== "true") {
        const code = await run(["node_modules/playwright/cli.js", "install", "--with-deps", "chromium"]);
        if (code !== 0) throw Error("Browser preparation failed");
      }
      const pointer = join(root, ".build-tmp/test-results/review-latest.json");
      const previous = await readFile(pointer, "utf8").catch(() => null);
      await run(["scripts/run-tests.mjs", "review", "--keep-going", ...tests.map((spec) => "--test=" + spec.path)]);
      const current = await readFile(pointer, "utf8");
      assert.notEqual(current, previous, "Test runner did not produce a fresh report");
      const report = await json(resolve(root, JSON.parse(current).report));
      assert.equal(report.group, "review");
      assert.equal(report.cases.length, 0, "Case-only execution cannot satisfy a suite");
      assert.equal(report.results.length, tests.length);
      for (const spec of tests) {
        const result = report.results.find((result) => result.path === spec.path);
        assert.ok(result, "Requested suite missing from test report");
        record(spec, result.code, { skipped: result.skipped ?? false, signal: result.signal ?? null });
      }
    }
  } catch (error) {
    failure = error;
    console.error(error.message);
  }
  const after = await validationInputs(root);
  const inputsUnchanged = before.digest === after.digest;
  const checks = specs.map((spec) => proofs.get(spec.id)).filter(Boolean);
  const missing = assembleChecks(specs, checks).pending;
  const executed = checks.filter((check) => check.executed);
  const assignedMissing = assembleChecks(assigned, checks).pending;
  const receipt = {
    ...(plan.shards
      ? {
          shard: { index: shardIndex, count: shardCount },
          shardComplete: !failure && inputsUnchanged && assignedMissing.length === 0,
        }
      : {}),
    schemaVersion: 3,
    validationProfile: plan.blueprint.validationProfile ?? "qualification",
    sourceRevision: plan.sourceRevision,
    policyDigest: plan.blueprint.policyDigest,
    inputDigest: before.digest,
    inputsUnchanged,
    environment: target,
    executor: { platform: process.platform, node: process.version },
    checks,
    build,
    coverageComplete: !failure && inputsUnchanged && missing.length === 0,
    executedAllTests: specs
      .filter((spec) => spec.kind === "test")
      .every((spec) => executed.some((check) => check.id === spec.id)),
    missing: missing.map((spec) => spec.id),
    failure: failure?.message ?? null,
    producer: origin,
    createdAt: new Date().toISOString(),
  };
  await mkdir(join(root, ".build-tmp"), { recursive: true });
  await writeFile(join(root, ".build-tmp/ci-validation.json"), JSON.stringify(receipt) + "\n");
  console.log(
    "CI checks: " +
      coverage.reused.length +
      " reused, " +
      executed.length +
      " executed, " +
      missing.length +
      " missing/failed.",
  );
  return receipt;
}

async function main(args) {
  const root = process.cwd();
  const platform =
    args.find((arg) => arg.startsWith("--target="))?.slice(9) ??
    (args.includes("--platform") ? "win32" : process.platform);
  const github = process.env.GH_TOKEN ? new GitHubEvidence({ root }) : null;
  const planPath = join(root, ".build-tmp/ci-plan.json");
  let plan = await json(planPath).catch(() => null);
  if (
    args.includes("--fresh") ||
    args.includes("--full") ||
    !plan ||
    plan.blueprint.inputDigest !== (await validationInputs(root)).digest
  )
    plan = await preparePlan({ root, github, fresh: args.includes("--fresh") || args.includes("--full") });
  if (args.includes("--policy")) {
    const assignedIds = new Set(
      shardSpecs(
        checkKeys(plan.blueprint, plan.platforms[platform].environment),
        workerCount(plan, platform),
        Number(args.find((arg) => arg.startsWith("--shard="))?.slice(8) ?? 0),
        plan.platforms[platform].pending,
      ).map((spec) => spec.id),
    );
    const pending = plan.platforms[platform].pending.filter((spec) => assignedIds.has(spec.id));
    const browser = pending.some((spec) => spec.group === "browser");
    if (process.env.GITHUB_OUTPUT)
      await writeFile(process.env.GITHUB_OUTPUT, "browser=" + browser + "\n", { flag: "a" });
    console.log(
      JSON.stringify({
        required: plan.blueprint.specs.length,
        reused: plan.platforms[platform].reused.length,
        pending: pending.map((spec) => spec.id),
        browser,
      }),
    );
    return;
  }
  const shardIndex = Number(args.find((arg) => arg.startsWith("--shard="))?.slice(8) ?? 0);
  const receipt = await executeValidation({ root, plan, platform, github, shardIndex });
  if (!(receipt.shard ? receipt.shardComplete : receipt.coverageComplete))
    throw Error("Candidate coverage incomplete: " + receipt.missing.join(", "));
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url)
  await main(process.argv.slice(2));
