import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { platformSpecs, validationProfile, requireValidationProfile } from "../scripts/ci-validation-profile.mjs";
import { checkBlueprint, checkKeys, assertCoverage, environmentFor, fingerprint } from "../scripts/ci-checks.mjs";
import { preparedCandidate } from "../scripts/prepare-release.mjs";
import { preparePlan } from "../scripts/ci-candidate.mjs";
import { clientImplementation, clientSourcePath } from "./client-source.ts";

const deferred = "tests/known.e2e.mjs";
const blueprint = {
  schemaVersion: 1,
  inputDigest: "current",
  policyDigest: "policy",
  validationProfile: "staging",
  changedPaths: ["packages/villages/src/client/features/settings/MenuIndexPage.tsx"],
  platformPolicy: { deferredWindowsBrowserSuites: [deferred] },
  catalog: [["input", "content"]],
  toolchain: { node: "24.21.0", arch: "x64", runners: { linux: "ubuntu-24.04", win32: "windows-2025" } },
  specs: [
    { id: "static:lint", kind: "static", inputs: ["input"] },
    ...[deferred, "tests/layout.e2e.mjs", "tests/new.e2e.mjs"].map((path) => ({
      id: "test:" + path,
      path,
      group: "browser",
      kind: "test",
      inputs: ["input"],
    })),
    {
      id: "test:tests/filesystem.mjs",
      path: "tests/filesystem.mjs",
      group: "regression",
      kind: "test",
      inputs: ["input"],
    },
  ],
};
assert.equal(platformSpecs(blueprint, "linux").length, 5);
assert.equal(platformSpecs(blueprint, "win32").length, 4);
for (const changedPaths of [
  null,
  [deferred],
  ["tests/fixtures/helper.mjs"],
  ["package-lock.json"],
  ["scripts/ci-checks.mjs"],
  ["scripts/build-villages.mjs"],
  ["scripts/verify-build.mjs"],
  ["sources/package-shared.ts"],
  ["packages/villages/src/client/entry/styles.tsx"],
])
  assert.equal(
    platformSpecs({ ...blueprint, changedPaths }, "win32").length,
    5,
    "Changed/unknown/platform-sensitive input broadens Windows coverage",
  );
assert.equal(validationProfile({ GITHUB_BASE_REF: "main", VILLAGES_CI_MODE: "prepare" }), "qualification");
assert.equal(validationProfile({ GITHUB_REF: "refs/heads/main" }), "qualification");
assert.equal(validationProfile({ VILLAGES_CI_MODE: "full" }), "qualification");
assert.equal(validationProfile({ GITHUB_BASE_REF: "staging" }), "staging");
requireValidationProfile("staging", "staging");
requireValidationProfile("qualification", "staging");
assert.throws(() => requireValidationProfile("staging"), /Release requires/);
const environment = environmentFor(blueprint.toolchain, "win32", { ImageVersion: "fixture" });
const checks = checkKeys(blueprint, environment).map((spec) => ({
  id: spec.id,
  key: spec.key,
  passed: true,
  code: 0,
  executed: false,
  origin: {
    runId: 1,
    attempt: 1,
    job: "validate-windows",
    sourceRevision: "a".repeat(40),
    platform: "win32",
    node: environment.node,
    environmentDigest: fingerprint(environment),
  },
}));
const receipt = {
  schemaVersion: 3,
  validationProfile: "staging",
  policyDigest: "policy",
  inputDigest: "current",
  inputsUnchanged: true,
  coverageComplete: true,
  environment,
  checks,
};
assertCoverage(receipt, blueprint);
const qualified = { ...blueprint, validationProfile: "qualification" };
assert.throws(() => assertCoverage(receipt, qualified), /profile/);
assert.throws(
  () => assertCoverage({ ...receipt, validationProfile: "qualification" }, qualified),
  /Incomplete candidate coverage/,
  "A staging-to-main promotion of identical bytes still requires the missing Windows test",
);
assert.equal(
  checkKeys(qualified, environment).filter((spec) => checks.some((check) => check.key === spec.key)).length,
  checks.length,
  "Individual passing checks remain reusable across profiles",
);

const root = await mkdtemp(join(tmpdir(), "villages-profile-"));
try {
  const git = (...args) =>
    execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  git("init");
  const files = {
    "scripts/ci-toolchain.json": JSON.stringify(blueprint.toolchain),
    "scripts/ci-platform-policy.json": JSON.stringify(blueprint.platformPolicy),
    "scripts/build-villages.mjs": "export const build = true;",
    "packages/villages/src/client/features/settings/MenuIndexPage.tsx": "export const menu = true;",
    [deferred]: "export const known = true;",
    "tests/new.e2e.mjs": "export const unknown = true;",
  };
  for (const [path, content] of Object.entries(files)) {
    await mkdir(join(root, path, ".."), { recursive: true });
    await writeFile(join(root, path), content);
  }
  git("add", ".");
  git("-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", "commit", "-m", "fixture");
  const base = git("rev-parse", "HEAD");
  await writeFile(join(root, Object.keys(files)[3]), "export const menu = false;");
  git("add", ".");
  git("-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", "commit", "-m", "minor UI");
  const staging = await checkBlueprint(root, { validationProfile: "staging", changedPaths: blueprint.changedPaths });
  const manifest = {
    ready: true,
    inputDigest: staging.inputDigest,
    policyDigest: staging.policyDigest,
    validationProfile: "staging",
    blueprint: staging,
    platforms: {},
    candidate: { id: 1, digest: "fixture" },
  };
  for (const platform of ["linux", "win32"]) {
    const target = environmentFor(staging.toolchain, platform, { ImageVersion: "fixture" });
    manifest.platforms[platform] = {
      ...receipt,
      inputDigest: staging.inputDigest,
      policyDigest: staging.policyDigest,
      environment: target,
      checks: checkKeys(staging, target).map((spec) => ({
        id: spec.id,
        key: spec.key,
        passed: true,
        code: 0,
        executed: false,
        origin: {
          ...checks[0].origin,
          platform,
          job: platform === "linux" ? "validate" : "validate-windows",
          environmentDigest: fingerprint(target),
        },
      })),
    };
  }
  const github = {
    coverage: async () => ({ manifest, run: { id: 1 } }),
    discover: async () => [{ manifest, run: { id: 1, run_attempt: 1 } }],
    api: () => ({ expired: false, digest: "fixture" }),
  };
  await assert.rejects(
    preparedCandidate({ root, github, runId: 1 }),
    /Release requires/,
    "The actual package-restoration API defaults to release qualification",
  );
  const environment = { VILLAGES_CI_BASE: base, GITHUB_BASE_REF: "main" };
  const promotion = await preparePlan({ root, github, environment });
  assert.equal(
    promotion.blueprint.validationProfile,
    "qualification",
    "A cached identical-byte staging plan cannot downgrade main",
  );
  assert.ok(promotion.platforms.win32.pending.some((spec) => spec.path === deferred));
  const full = await preparePlan({
    root,
    github,
    environment: { ...environment, GITHUB_BASE_REF: "staging", VILLAGES_CI_MODE: "full" },
  });
  assert.equal(full.fresh, true);
  assert.equal(full.platforms.win32.reused.length, 0, "Explicit full mode executes every check");
  // Even changing every profile label cannot launder missing Windows membership.
  manifest.validationProfile = manifest.blueprint.validationProfile = "qualification";
  for (const row of Object.values(manifest.platforms)) row.validationProfile = "qualification";
  await assert.rejects(preparedCandidate({ root, github, runId: 1 }), /Incomplete candidate coverage/);
} finally {
  await rm(root, { recursive: true, force: true });
}
// Real reader boundaries: client-only edits must not repeat server saved-data
// scenarios, while changes to server/shared/build inputs must still invalidate.
const live = await checkBlueprint(process.cwd());
const scopeEnvironment = {
  platform: "linux",
  node: "v" + live.toolchain.node,
  arch: live.toolchain.arch,
  runner: live.toolchain.runners.linux,
};
const liveKeys = new Map(checkKeys(live, scopeEnvironment).map((spec) => [spec.id, spec.key]));
const clientPath = "packages/villages/src/client/features/settings/WritingSettings.tsx";
const discoveryPath = "scripts/candidate-history.mjs";
const serverPath = "packages/villages/src/server/domain/models/world.ts";
const sharedPath = "packages/villages/src/shared/contracts/village.ts";
const builderPath = "scripts/build-feature-packages.mjs";
const changedKey = (id, path) => {
  const catalog = live.catalog.map(([input, hash]) => [input, input === path ? fingerprint("changed") : hash]);
  return checkKeys({ ...live, catalog }, scopeEnvironment).find((spec) => spec.id === id).key;
};
for (const name of ["clock", "spinoff", "zone-events"]) {
  const id = "test:tests/villages-" + name + "-packaged.regression.ts";
  const spec = live.specs.find((spec) => spec.id === id);
  assert.ok(spec && !spec.opaque);
  for (const unrelated of [clientPath, discoveryPath]) {
    assert.ok(!spec.inputs.includes(unrelated), name + " does not consume unrelated UI/discovery source");
    assert.equal(changedKey(id, unrelated), liveKeys.get(id));
  }
  for (const required of [serverPath, sharedPath, builderPath, "$definition-behavior"]) {
    assert.ok(spec.inputs.includes(required), name + " retains " + required);
    assert.notEqual(changedKey(id, required), liveKeys.get(id));
  }
}
assert.equal(clientSourcePath(resolve(clientPath)), resolve(clientPath));
assert.equal(clientSourcePath(resolve(sharedPath)), resolve(sharedPath));
assert.throws(() => clientSourcePath(resolve(serverPath)), /escapes reviewed sources/);
assert.throws(() => clientSourcePath(resolve(discoveryPath)), /escapes reviewed sources/);
assert.ok(clientImplementation().length > 0, "The maintained client graph fits its explicit reviewed boundary");
console.log(
  "Platform inventories, main/full qualification, unknown/changed test broadening and no staging-to-release laundering passed.",
);

for (const path of [
  "tests/villages-scene-staging.e2e.mjs",
  "tests/villages-founding-layout.e2e.mjs",
  "tests/villages-founding-phone-layout.e2e.mjs",
  "tests/villages-founding-compact-layout.e2e.mjs",
]) {
  const id = "test:" + path;
  const spec = live.specs.find((spec) => spec.id === id);
  assert.equal(spec.opaque, false);
  assert.ok(!spec.inputs.includes(clientPath), path + " does not load Writing settings");
  assert.equal(changedKey(id, clientPath), liveKeys.get(id));
  assert.ok(spec.inputs.includes("packages/villages/src/client/shell/VillagesFrame.tsx"));
}
