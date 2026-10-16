import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import AdmZip from "adm-zip";
import {
  checkBlueprint,
  checkKeys,
  assembleChecks,
  assertCoverage,
  environmentFor,
  fingerprint,
} from "../scripts/ci-checks.mjs";
import { GitHubEvidence, assertManifestOrigin, assertWorkerOrigin } from "../scripts/ci-manifests.mjs";
const root = await mkdtemp(join(tmpdir(), "villages-ci-proof-"));
try {
  execFileSync("git", ["init", root], { stdio: "ignore" });
  const files = {
    "scripts/ci-toolchain.json": JSON.stringify({
      node: "24.21.0",
      arch: "x64",
      runners: { linux: "ubuntu-24.04", win32: "windows-2025" },
    }),
    "scripts/build-villages.mjs": "// builder",
    "packages/villages/package-definition.mjs":
      'export const villagesDefinition={version:"1.2.3",serverImport:"src/server.ts",clientImport:"src/client.ts"};',
    "packages/villages/src/server.ts": "export const answer=42;",
    "packages/villages/src/client.ts": "export const client=true;",
    "tests/a.regression.mjs": 'import {answer} from "../packages/villages/src/server.ts"; export {answer};',
    "tests/b.regression.mjs": 'export {answer} from "./a.regression.mjs";',
    "tests/payload.regression.mjs": 'export {answer} from "../packages/villages/server.mjs";',
    "tests/metadata.regression.mjs": 'export {villagesDefinition} from "../packages/villages/package-definition.mjs";',
    "tests/unknown.regression.mjs": 'import {readFile} from "node:fs/promises"; await readFile(process.env.FIXTURE);',
  };
  for (const [path, value] of Object.entries(files)) {
    await mkdir(join(root, path, ".."), { recursive: true });
    await writeFile(join(root, path), value);
  }
  const inventory = Object.keys(files)
    .filter((path) => path.startsWith("tests/"))
    .map((path) => ({ path, group: "regression" }));
  const first = await checkBlueprint(root, { inventory });
  const environment = environmentFor(first.toolchain, "linux", { ImageVersion: "fixture" });
  const specs = checkKeys(first, environment);
  const origin = {
    runId: 5,
    attempt: 1,
    job: "validate",
    sourceRevision: "a".repeat(40),
    platform: "linux",
    node: environment.node,
    environmentDigest: fingerprint(environment),
  };
  const checks = specs.map((spec) => ({ id: spec.id, key: spec.key, passed: true, code: 0, executed: false, origin }));
  const receipt = {
    schemaVersion: 3,
    inputDigest: first.inputDigest,
    policyDigest: first.policyDigest,
    inputsUnchanged: true,
    coverageComplete: true,
    environment,
    executor: { platform: "linux", node: environment.node },
    checks,
  };
  assert.equal(assertCoverage(receipt, first).pending.length, 0);
  for (const change of [{ passed: false }, { code: 1 }, { skipped: true }, { signal: "SIGTERM" }, { key: "stale" }])
    assert.equal(
      assembleChecks(
        specs,
        checks.map((proof, index) => (index ? proof : { ...proof, ...change })),
      ).pending.length,
      1,
    );
  for (const change of [
    { platform: "win32" },
    { node: "v24.11.0" },
    { runner: "ubuntu-latest" },
    { arch: "arm64" },
    { image: "different" },
  ])
    assert.throws(() => assertCoverage({ ...receipt, environment: { ...environment, ...change } }, first));
  assert.throws(() => assertCoverage({ ...receipt, inputDigest: "stale" }, first));
  const pending = async (path, value) => {
    await writeFile(join(root, path), value);
    return assembleChecks(checkKeys(await checkBlueprint(root, { inventory }), environment), checks).pending.map(
      (spec) => spec.id,
    );
  };
  const version = await pending(
    "packages/villages/package-definition.mjs",
    files["packages/villages/package-definition.mjs"].replace("1.2.3", "1.2.4"),
  );
  for (const id of ["test:tests/a.regression.mjs", "test:tests/payload.regression.mjs"])
    assert.ok(!version.includes(id), id);
  for (const id of ["build", "package", "test:tests/metadata.regression.mjs", "test:tests/unknown.regression.mjs"])
    assert.ok(version.includes(id), id);
  await writeFile(
    join(root, "packages/villages/package-definition.mjs"),
    files["packages/villages/package-definition.mjs"],
  );
  const feature = await pending("packages/villages/src/server.ts", "export const answer=43;");
  for (const id of [
    "test:tests/a.regression.mjs",
    "test:tests/b.regression.mjs",
    "test:tests/payload.regression.mjs",
    "test:tests/unknown.regression.mjs",
  ])
    assert.ok(feature.includes(id), id);
  assert.ok(!feature.includes("test:tests/metadata.regression.mjs"));
  await writeFile(join(root, "packages/villages/src/server.ts"), files["packages/villages/src/server.ts"]);
  const test = await pending("tests/a.regression.mjs", files["tests/a.regression.mjs"] + "// change");
  assert.ok(test.includes("test:tests/b.regression.mjs"));
  assert.ok(!test.includes("test:tests/payload.regression.mjs"));
  const run = {
    id: 5,
    run_attempt: 1,
    path: ".github/workflows/ci.yml",
    event: "pull_request",
    head_sha: "a".repeat(40),
    head_repository: { full_name: "example/villages" },
  };
  const manifest = {
    schemaVersion: 3,
    sourceRevision: run.head_sha,
    policyDigest: first.policyDigest,
    inputDigest: first.inputDigest,
    inputsUnchanged: true,
    ready: true,
    producer: { runId: 5, attempt: 1, job: "package-parity" },
    platforms: { linux: { ...receipt, sourceRevision: run.head_sha, producer: origin } },
  };
  const job = {
    name: "package-parity",
    status: "completed",
    conclusion: "success",
    steps: [{ name: "Verify complete candidate coverage", conclusion: "success" }],
  };
  const verify = (r = run, j = job) =>
    assertManifestOrigin(manifest, r, { sha: run.head_sha }, j, "example/villages", first.policyDigest);
  verify();
  const workerReceipt = { ...manifest.platforms.linux, checks: checks.map((check) => ({ ...check, executed: true })) };
  const workerJob = {
    name: "validate",
    status: "completed",
    labels: [environment.runner],
    steps: [{ name: "Validate maintained source and package", conclusion: "success" }],
  };
  assertWorkerOrigin(workerReceipt, run, workerJob);
  assert.throws(
    () =>
      assertWorkerOrigin({ ...workerReceipt, executor: { platform: "win32", node: environment.node } }, run, workerJob),
    /platform/,
  );
  assert.throws(() => assertWorkerOrigin(workerReceipt, run, { ...workerJob, labels: ["windows-2025"] }), /runner/);
  assert.throws(() =>
    assertWorkerOrigin(
      {
        ...workerReceipt,
        checks: workerReceipt.checks.map((check) => ({ ...check, origin: { ...check.origin, runId: 4 } })),
      },
      run,
      workerJob,
    ),
  );
  for (const change of [
    { run_attempt: 2 },
    { head_repository: { full_name: "fork/villages" } },
    { path: "other.yml" },
    { head_sha: "b".repeat(40) },
  ])
    assert.throws(() => verify({ ...run, ...change }));
  assert.throws(() => verify(run, { ...job, status: "in_progress" }));
  const zip = new AdmZip();
  zip.addFile("proof.json", Buffer.from('{"passed":true}'));
  const bytes = zip.toBuffer(),
    artifact = { id: 7, digest: "sha256:" + fingerprint(bytes) };
  const github = new GitHubEvidence({ root, repository: "example/villages", execute: () => bytes });
  assert.deepEqual(await github.jsonFile(artifact, "proof.json"), { passed: true });
  await assert.rejects(() => github.zip({ ...artifact, digest: "sha256:" + "a".repeat(64) }), /digest changed/);
  const tampered = new GitHubEvidence({ root, repository: "example/villages", execute: () => Buffer.from("tampered") });
  await assert.rejects(() => tampered.zip({ ...artifact, id: 8 }), /digest/);
  await writeFile(join(root, ".build-tmp/ci-artifacts/7.zip"), "corrupt");
  const fresh = new GitHubEvidence({ root, repository: "example/villages", execute: () => bytes });
  assert.deepEqual(await fresh.jsonFile(artifact, "proof.json"), { passed: true });
  const discovery = new GitHubEvidence({
    root,
    repository: "example/villages",
    environment: {
      VILLAGES_CI_HEAD: "a".repeat(40),
      VILLAGES_CI_BASE: "b".repeat(40),
      GITHUB_HEAD_REF: "candidate",
      GITHUB_RUN_ID: "14",
    },
  });
  discovery.api = (path) => {
    if (path.startsWith("actions/")) return { workflow_runs: [{ id: 14 }, { id: 12 }] };
    return {
      check_runs: [
        {
          name: "package-parity",
          status: "completed",
          conclusion: "success",
          details_url: "https://github.com/example/villages/actions/runs/" + (path.includes("b".repeat(40)) ? 13 : 11),
        },
      ],
    };
  };
  const attempted = [];
  discovery.coverage = async (id) => {
    attempted.push(String(id));
    if (String(id) !== "13") throw Error("Unavailable earlier attempt");
    return { manifest: { integrated: true } };
  };
  assert.deepEqual(await discovery.discover("policy"), [{ manifest: { integrated: true } }]);
  assert.deepEqual(attempted, ["11", "12", "13"], "Unavailable attempts must not hide the integrated baseline");
  console.log("Per-check invalidation, version reuse, provenance, toolchain and tamper rejection passed.");
} finally {
  await rm(root, { recursive: true, force: true });
}
