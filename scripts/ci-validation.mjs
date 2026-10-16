import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { readFile, writeFile, mkdir, appendFile } from "node:fs/promises";
import { validationInputs } from "./validation-inputs.mjs";
import { needsBrowserPreparation, ciTestPlan } from "./ci-policy.mjs";
import { testConsumers } from "./test-dependencies.mjs";
import { isDocumentation } from "./change-scope.mjs";
import { testInventory } from "./test-inventory.mjs";
import { reusableCi } from "./ci-reuse.mjs";

const root = process.cwd();
const args = process.argv.slice(2);
if (args.some((arg) => !["--platform", "--policy", "--release", "--fresh", "--github-output"].includes(arg)))
  throw new Error("Unknown CI validation option");
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const base = process.env.VILLAGES_CI_BASE;
const paths =
  base && !/^0+$/.test(base)
    ? git("diff", "--name-only", base, "HEAD", "--").split(/\r?\n/).filter(Boolean)
    : ["scripts/unknown-base"];
const forceFull = args.includes("--release") || process.env.GITHUB_EVENT_NAME === "workflow_dispatch";
const release = forceFull || process.env.GITHUB_REF === "refs/heads/main" || process.env.GITHUB_BASE_REF === "main";
const reproducible =
  release ||
  paths.includes("scripts/unknown-base") ||
  paths.some((path) =>
    /^(scripts\/(build-|verify-|deterministic-|package-)|packages\/villages\/package-definition\.mjs|package(?:-lock)?\.json$)/.test(
      path,
    ),
  );
const before = await validationInputs(root);
const inventory = (await testInventory()).filter((test) => test.group !== "engine");
const shared = paths.some(
  (path) =>
    !isDocumentation(path) &&
    ((/^(packages\/|sources\/)/.test(path) && !/src\/(?:client|server)\/features\//.test(path)) ||
      (path.startsWith("tests/") && !inventory.some((test) => test.path === path))),
);
// Test-to-test imports matter when reusing evidence after a test-only correction.
const consumers = await testConsumers(inventory, root, { expandBundles: shared });
const plan = ciTestPlan(paths, inventory, consumers, { release, forceFull, secondary: args.includes("--platform") });
const { full, documentationOnly, tests: expected } = plan;
const preparation = {
  runId: process.env.GITHUB_RUN_ID,
  attempt: process.env.GITHUB_RUN_ATTEMPT,
  job: process.env.GITHUB_JOB,
  node: process.version,
  platform: process.platform,
  inputDigest: before.digest,
  full,
  expected,
};
const preparedPath = ".build-tmp/ci-prepared.json";
let prepared;
if (!args.includes("--policy") && process.env.GITHUB_RUN_ID) {
  try {
    const previous = JSON.parse(await readFile(preparedPath, "utf8"));
    if (JSON.stringify(previous?.identity) === JSON.stringify(preparation)) prepared = previous;
  } catch {
    // Missing or interrupted preparation falls back to authenticated discovery.
  }
}
const reuse =
  !documentationOnly && !args.includes("--fresh") && process.env.VILLAGES_CI_FRESH !== "true"
    ? prepared
      ? prepared.reuse
      : await reusableCi({ current: before, inventory, consumers, full })
    : null;
const reused = new Map(
  (reuse?.tests ?? []).filter((test) => expected.includes(test.path)).map((test) => [test.path, test]),
);
let pending = expected.filter((path) => !reused.has(path));
let browser = inventory.some((test) => pending.includes(test.path) && test.group === "browser");
const policy = { ...plan, reproducible, reused: reused.size, pending, browser };
if (args.includes("--github-output")) {
  if (!process.env.GITHUB_OUTPUT) throw Error("GitHub output file required");
  await appendFile(process.env.GITHUB_OUTPUT, "browser=" + browser + "\n");
}
if (args.includes("--policy")) {
  if (process.env.GITHUB_RUN_ID) {
    await mkdir(".build-tmp", { recursive: true });
    await writeFile(preparedPath, JSON.stringify({ identity: preparation, reuse }));
  }
  console.log(JSON.stringify(policy));
} else {
  const run = (...args) => execFileSync(process.execPath, args, { cwd: root, stdio: "inherit" });
  let tests = [...reused.values()];
  let startedTests = false;
  let priorReport;
  let validReuse = reused.size > 0;
  let reproduced = false;
  let failure;
  try {
    if (!documentationOnly) {
      const npm = process.env.npm_execpath ?? resolve(process.execPath, "../node_modules/npm/bin/npm-cli.js");
      run(npm, "run", "check");
    }
    run("scripts/build-villages.mjs");
    run("scripts/verify-package.mjs");
    const build = JSON.parse(await readFile(".build-tmp/package-build.json", "utf8"));
    if (validReuse && reuse.archiveHash !== build.sha256) {
      console.log("Package differs from prior evidence; running all required tests.");
      validReuse = false;
      tests = [];
      reused.clear();
      pending = expected;
      browser = inventory.some((test) => pending.includes(test.path) && test.group === "browser");
    }
    if (
      process.env.CI === "true" &&
      needsBrowserPreparation({ browser, reused: false, prepared: process.env.VILLAGES_CI_BROWSER_READY })
    )
      run("node_modules/playwright/cli.js", "install", "--with-deps", "chromium");
    if (pending.length) {
      console.log(
        "CI coverage: " + reused.size + " reused, " + pending.length + " to run, " + expected.length + " required.",
      );
      priorReport = await readFile(".build-tmp/test-results/review-latest.json", "utf8").catch(() => null);
      startedTests = true;
      run("scripts/run-tests.mjs", "review", ...pending.map((path) => "--test=" + path), "--keep-going");
    }
    if (reproducible) {
      if (!validReuse || reuse.reproducible !== true) run("scripts/verify-build.mjs");
      reproduced = true;
    }
  } catch (error) {
    failure = error;
  }
  if (startedTests) {
    try {
      const pointer = await readFile(".build-tmp/test-results/review-latest.json", "utf8");
      if (pointer === priorReport) throw Error("Test runner did not produce a fresh report");
      const latest = JSON.parse(pointer);
      const report = JSON.parse(await readFile(latest.report, "utf8"));
      if (report.group !== "review" || report.cases.length || report.results.length !== pending.length)
        throw Error("Test report does not match the requested suites");
      tests.push(...report.results.filter((test) => pending.includes(test.path)));
    } catch (error) {
      failure ??= error;
    }
  }
  tests = expected.map((path) => tests.find((test) => test.path === path)).filter(Boolean);
  const inputsUnchanged = before.digest === (await validationInputs(root)).digest;
  const complete =
    tests.length === expected.length && tests.every((test) => test.code === 0 && !test.skipped && !test.signal);
  if (!inputsUnchanged || !complete) failure ??= Error("CI cannot record incomplete, changed or failing coverage");
  await mkdir(".build-tmp", { recursive: true });
  await writeFile(
    ".build-tmp/ci-validation.json",
    JSON.stringify({
      schemaVersion: 2,
      passed: !failure,
      full,
      reproducible: reproduced,
      sourceRevision: git("rev-parse", "HEAD"),
      inputDigest: before.digest,
      inputs: before.inputs,
      inputsUnchanged,
      platform: process.platform,
      node: process.version,
      tests,
      requestedInventory: expected,
      completeInventory: full && complete,
      documentationOnly,
      selectionReason: plan.reason,
      reusedFrom: validReuse ? reuse.sources : [],
      runId: process.env.GITHUB_RUN_ID ?? null,
      runAttempt: Number(process.env.GITHUB_RUN_ATTEMPT ?? 1),
      job: process.env.GITHUB_JOB ?? null,
      createdAt: new Date().toISOString(),
    }) + "\n",
  );
  if (failure) throw failure;
}
