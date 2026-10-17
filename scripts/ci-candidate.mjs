import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  checkBlueprint,
  policyKey,
  checkKeys,
  assembleChecks,
  assertCoverage,
  environmentFor,
  supportedPlatforms,
  fingerprint,
} from "./ci-checks.mjs";
import { validationInputs } from "./validation-inputs.mjs";
import { GitHubEvidence } from "./ci-manifests.mjs";
import { validationProfile, candidateChanges } from "./ci-validation-profile.mjs";

import { planShards, workerCount, workerName, mergeShardReceipts } from "./ci-shards.mjs";

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const save = async (path, value) => {
  await mkdir(resolve(path, ".."), { recursive: true });
  await writeFile(path, JSON.stringify(value) + "\n");
};

export async function preparePlan({ root = process.cwd(), github, environment = process.env, fresh = false } = {}) {
  fresh ||= environment.VILLAGES_CI_FRESH === "true" || environment.VILLAGES_CI_MODE === "full";
  const snapshot = await validationInputs(root);
  const digest = policyKey(snapshot);
  let baselines = [];
  if (github) baselines = await github.discover(digest);
  const cached = baselines.find((row) => row.manifest.inputDigest === snapshot.digest)?.manifest.blueprint;
  const profile = fresh || environment.VILLAGES_CI_FRESH === "true" ? "qualification" : validationProfile(environment),
    changedPaths = candidateChanges(root, environment);
  const blueprint = {
    ...(cached ?? (await checkBlueprint(root, { snapshot }))),
    validationProfile: profile,
    changedPaths,
  };
  assert.equal(blueprint.policyDigest, digest);
  assert.equal(blueprint.inputDigest, snapshot.digest);
  const platforms = {};
  const unavailable = new Set();
  for (const baseline of baselines) {
    if (!baseline.manifest.candidate) {
      unavailable.add(baseline.run.id);
      continue;
    }
    try {
      const current = github.api("actions/artifacts/" + baseline.manifest.candidate.id);
      if (current.expired || current.digest !== baseline.manifest.candidate.digest) unavailable.add(baseline.run.id);
    } catch {
      unavailable.add(baseline.run.id);
    }
  }
  for (const platform of supportedPlatforms) {
    let target = environmentFor(blueprint.toolchain, platform, { ImageVersion: "unprepared" });
    for (const baseline of baselines) {
      const previous = baseline.manifest.platforms[platform];
      if (previous)
        try {
          checkKeys(blueprint, previous.environment);
          target = previous.environment;
          break;
        } catch {
          /* Toolchain changed. */
        }
    }
    const specs = checkKeys(blueprint, target);
    const proofs = baselines
      .flatMap((baseline) =>
        (baseline.manifest.platforms[platform]?.checks ?? []).map((proof) => ({
          ...proof,
          from: {
            runId: baseline.run.id,
            attempt: baseline.run.run_attempt,
            artifact: baseline.manifest.candidate,
            ...(proof.id === "build" ? { build: baseline.manifest.platforms[platform].build } : {}),
          },
        })),
      )
      .filter((proof) => !(["build", "package"].includes(proof.id) && unavailable.has(proof.from.runId)));
    const coverage = assembleChecks(specs, proofs, { fresh: fresh || environment.VILLAGES_CI_FRESH === "true" });
    platforms[platform] = { environment: target, ...coverage };
  }
  assert.equal((await validationInputs(root)).digest, snapshot.digest, "Source changed while preparing CI evidence");
  return {
    schemaVersion: 3,
    validationProfile: profile,
    fresh: fresh || environment.VILLAGES_CI_FRESH === "true",
    blueprint,
    platforms,
    sourceRevision: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(),
    createdAt: new Date().toISOString(),
  };
}

export async function collectCandidate({ root = process.cwd(), environment = process.env } = {}) {
  const plan = await readJson(join(root, ".build-tmp/ci-plan.json"));
  const blueprint = plan.blueprint;
  const snapshot = await validationInputs(root);
  assert.equal(snapshot.digest, blueprint.inputDigest, "Source changed after CI planning");
  const platforms = {};
  let ready = true;
  const builds = [];
  for (const platform of supportedPlatforms) {
    const name = platform === "linux" ? "validate" : "validate-windows";
    const directory = join(root, ".build-tmp/platforms", "villages-" + name);
    try {
      let receipt = await readJson(join(directory, ".build-tmp/ci-validation.json")).catch(() => null);
      if (plan.shards) {
        const workers = receipt ? [receipt] : [];
        for (let index = 1; index < workerCount(plan, platform); index++) {
          const worker = await readJson(
            join(
              root,
              ".build-tmp/platforms",
              "villages-" + workerName(platform, index),
              ".build-tmp/ci-validation.json",
            ),
          ).catch(() => null);
          if (worker) workers.push(worker);
        }
        receipt = mergeShardReceipts(plan, platform, workers, { allowPartial: true });
      }
      assert.equal(receipt.sourceRevision, plan.sourceRevision);
      assert.equal(receipt.inputDigest, snapshot.digest);
      assert.equal(receipt.environment.platform, platform);
      assert.equal(receipt.inputsUnchanged, true);
      // Incomplete attempts may carry passing proofs forward, but never satisfy the gate.
      try {
        assertCoverage(receipt, blueprint);
      } catch {
        ready = false;
      }
      platforms[platform] = receipt;
      if (receipt.build) {
        const bytes = await readFile(join(directory, "artifacts", "villages-" + receipt.build.version + ".zip"));
        assert.equal(fingerprint(bytes), receipt.build.sha256);
        builds.push({ platform, receipt: receipt.build, bytes });
      } else ready = false;
    } catch (error) {
      ready = false;
      console.error("Candidate coverage missing for " + platform + ": " + error.message);
    }
  }
  if (builds.length === 2) {
    for (const field of ["version", "sourceDigest", "sha256"])
      if (builds[0].receipt[field] !== builds[1].receipt[field]) {
        ready = false;
        console.error("Package parity mismatch: " + field);
      }
  } else ready = false;
  const candidateDirectory = join(root, ".build-tmp/candidate");
  const hasCandidate =
    builds.length === 2 &&
    ["version", "sourceDigest", "sha256"].every((field) => builds[0].receipt[field] === builds[1].receipt[field]);
  if (hasCandidate) {
    await mkdir(join(candidateDirectory, "artifacts"), { recursive: true });
    await mkdir(join(candidateDirectory, ".build-tmp/platform-builds"), { recursive: true });
    await writeFile(
      join(candidateDirectory, "artifacts", "villages-" + builds[0].receipt.version + ".zip"),
      builds[0].bytes,
    );
    for (const build of builds)
      await save(join(candidateDirectory, ".build-tmp/platform-builds", build.platform + ".json"), build.receipt);
  }
  const manifest = {
    schemaVersion: 3,
    validationProfile: blueprint.validationProfile,
    sourceRevision: plan.sourceRevision,
    inputDigest: snapshot.digest,
    policyDigest: blueprint.policyDigest,
    blueprint,
    platforms,
    ready,
    inputsUnchanged: true,
    producer: {
      runId: environment.GITHUB_RUN_ID,
      attempt: Number(environment.GITHUB_RUN_ATTEMPT ?? 1),
      job: "package-parity",
    },
    candidate: null,
    createdAt: new Date().toISOString(),
  };
  await save(join(root, ".build-tmp/coverage-manifest.json"), manifest);
  if (environment.GITHUB_OUTPUT)
    await writeFile(environment.GITHUB_OUTPUT, "candidate=" + hasCandidate + "\n", { flag: "a" });
  return manifest;
}

export async function sealCandidate({ root = process.cwd(), github } = {}) {
  const path = join(root, ".build-tmp/coverage-manifest.json");
  const manifest = await readJson(path);
  try {
    manifest.candidate = github.artifact(manifest.producer.runId, "villages-candidate");
  } catch {
    manifest.ready = false;
  }
  await save(path, manifest);
  return manifest;
}

async function main(args) {
  const root = process.cwd();
  const github = process.env.GH_TOKEN ? new GitHubEvidence({ root }) : null;
  if (args.includes("--plan")) {
    const plan = await preparePlan({
      root,
      github,
      fresh: args.includes("--fresh") || process.env.VILLAGES_CI_MODE === "full",
    });
    plan.shards = planShards(plan);
    await save(join(root, ".build-tmp/ci-plan.json"), plan);
    const matrix = Object.keys(plan.platforms).flatMap((platform) =>
      Array.from({ length: workerCount(plan, platform) - 1 }, (_, n) => ({
        platform,
        index: n + 1,
        name: workerName(platform, n + 1),
        runner: platform === "linux" ? "ubuntu-24.04" : "windows-2025",
      })),
    );
    if (process.env.GITHUB_OUTPUT)
      await writeFile(
        process.env.GITHUB_OUTPUT,
        "browser-matrix=" + JSON.stringify({ include: matrix }) + "\nbrowser-workers=" + (matrix.length > 0) + "\n",
        { flag: "a" },
      );
    if (process.env.GITHUB_OUTPUT)
      await writeFile(
        process.env.GITHUB_OUTPUT,
        "linux-needed=" +
          (plan.platforms.linux.pending.length > 0) +
          "\nwindows-needed=" +
          (plan.platforms.win32.pending.length > 0) +
          "\n",
        { flag: "a" },
      );
    console.log(
      JSON.stringify({
        baseline: !Object.values(plan.platforms).some((value) => value.reused.length),
        linux: { reused: plan.platforms.linux.reused.length, pending: plan.platforms.linux.pending.length },
        windows: { reused: plan.platforms.win32.reused.length, pending: plan.platforms.win32.pending.length },
      }),
    );
  } else if (args.includes("--collect")) await collectCandidate({ root });
  else if (args.includes("--seal")) await sealCandidate({ root, github });
  else if (args.includes("--gate")) {
    const manifest = await readJson(join(root, ".build-tmp/coverage-manifest.json"));
    assert.equal(manifest.ready, true, "Candidate preparation incomplete; inspect missing/failed check receipts");
    for (const platform of supportedPlatforms) assertCoverage(manifest.platforms[platform], manifest.blueprint);
    console.log("Complete current coverage and package parity verified; prior results are preserved.");
  } else throw Error("Use --plan, --collect, --seal, or --gate");
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url)
  await main(process.argv.slice(2));
