import assert from "node:assert/strict";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { validationInputs } from "./validation-inputs.mjs";
import { policyKey, assertCoverage, supportedPlatforms, fingerprint } from "./ci-checks.mjs";
import { GitHubEvidence } from "./ci-manifests.mjs";
import { restorePackage } from "./ci-package.mjs";
import { checkBlueprint } from "./ci-checks.mjs";
import { requireValidationProfile } from "./ci-validation-profile.mjs";

/** Authenticate complete current coverage and restore the exact prepared bytes. Never rebuild here. */
export async function preparedCandidate({
  root = process.cwd(),
  runId,
  github,
  version,
  requiredProfile = "qualification",
} = {}) {
  const before = await validationInputs(root);
  const { manifest, run } = await github.coverage(runId, policyKey(before));
  assert.equal(manifest.ready, true, "Candidate preparation is incomplete");
  assert.equal(manifest.inputDigest, before.digest, "Prepared candidate has stale maintained inputs");
  assert.equal(manifest.blueprint.inputDigest, before.digest);
  assert.equal(manifest.blueprint.policyDigest, policyKey(before));
  const profile = manifest.validationProfile ?? "qualification";
  requireValidationProfile(profile, requiredProfile);
  // Reconstruct required membership from this source and policy; ready/profile
  // flags cannot turn a missing Windows check into release qualification.
  const canonical = await checkBlueprint(root, {
    snapshot: before,
    validationProfile: profile,
    changedPaths: manifest.blueprint.changedPaths,
  });
  for (const platform of supportedPlatforms) assertCoverage(manifest.platforms[platform], canonical);
  const artifact = manifest.candidate;
  assert.ok(artifact, "Prepared package artifact missing");
  const live = github.api("actions/artifacts/" + artifact.id);
  assert.equal(live.expired, false, "Prepared package artifact expired");
  assert.equal(live.digest, artifact.digest, "Prepared package artifact identity changed");
  assert.equal(String(live.workflow_run.id), String(artifact.runId));
  const builds = [];
  for (const platform of supportedPlatforms) {
    const build = await github.jsonFile(artifact, ".build-tmp/platform-builds/" + platform + ".json");
    assert.deepEqual(build, manifest.platforms[platform].build, "Package receipt differs from verified coverage");
    builds.push(build);
  }
  for (const field of ["version", "sourceDigest", "sha256"])
    assert.equal(builds[0][field], builds[1][field], "Platform package parity changed");
  const build = builds[0];
  if (version) assert.equal(build.version, version, "Prepare the intended release version during development");
  const bytes = await github.file(artifact, "artifacts/villages-" + build.version + ".zip");
  assert.equal(fingerprint(bytes), build.sha256, "Prepared release bytes changed");
  assert.equal((await validationInputs(root)).digest, before.digest, "Source changed during release verification");
  return { manifest, run, build: await restorePackage(root, bytes, build, before), artifact };
}

export function assertAcceptance(acceptance, build, { image } = {}) {
  assert.equal(acceptance.passed, true, "Pinned Engine acceptance is required");
  assert.equal(acceptance.package.archiveHash, build.sha256);
  assert.match(acceptance.image, /^sha256:[a-f0-9]{64}$/);
  if (image) assert.equal(acceptance.image, image, "Acceptance used a different Engine pin");
}

async function main(args) {
  const runId = args.find((arg) => arg.startsWith("--run="))?.slice(6);
  assert.match(runId ?? "", /^[1-9]\d*$/, "Use --run=<candidate CI run>");
  const root = process.cwd(),
    github = new GitHubEvidence({
      root,
      repository: process.env.GITHUB_REPOSITORY ?? "DSBwizzard/marinara-villages-agent",
    });
  const started = Date.now();
  const candidate = await preparedCandidate({ root, github, runId });
  console.log(
    JSON.stringify({
      prepared: true,
      runId,
      version: candidate.build.version,
      sha256: candidate.build.sha256,
      archive: candidate.build.retainedArchivePath,
      receipt: join(root, ".build-tmp/package-build.json"),
      elapsedMs: Date.now() - started,
    }),
  );
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url)
  await main(process.argv.slice(2));
