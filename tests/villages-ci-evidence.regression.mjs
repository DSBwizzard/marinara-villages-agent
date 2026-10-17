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
    "tests/literal.regression.mjs":
      'import {readFile as read} from "node:fs/promises"; await read(new URL("../packages/villages/src/server.ts",import.meta.url));',
    "tests/inline.regression.mjs":
      'import {build} from "esbuild"; await build({stdin:{contents:"export {answer} from \\"./packages/villages/src/server.js\\";",resolveDir:process.cwd()},bundle:true,write:false});',
    "tests/inline-io.regression.mjs":
      'import {build} from "esbuild"; await build({stdin:{contents:"import {readdirSync} from \\"node:fs\\"; readdirSync(process.env.DIR);",resolveDir:process.cwd()},bundle:true,write:false});',
    "tests/escaped-builder.regression.mjs":
      'import * as esbuild from "esbuild"; const compile = esbuild.build; await compile({entryPoints:[process.env.SOURCE]});',
    "tests/alias.regression.mjs":
      'import {build} from "esbuild"; await build({entryPoints:["packages/villages/src/server.ts"],alias:{server:process.env.SOURCE}});',
    "tests/mixed-build.regression.mjs":
      'import {build} from "esbuild"; await build({stdin:{contents:"export const ok=true;",resolveDir:process.cwd()},entryPoints:[process.env.SOURCE]});',
    "tests/loader.regression.mjs":
      'import {build} from "esbuild"; await build({stdin:{contents:"export const ok=true;",resolveDir:process.cwd(),loader:process.env.LOADER}});',
    "tests/promises.regression.mjs": 'import {promises as fs} from "node:fs"; await fs.readFile(process.env.FIXTURE);',
    "tests/method.regression.mjs":
      'import {readFile} from "node:fs/promises"; await readFile.call(null,process.env.FIXTURE);',
    "tests/archive.regression.mjs": 'import AdmZip from "adm-zip"; new AdmZip(process.env.ARCHIVE);',
    "tests/compiler.regression.mjs": 'import ts from "typescript"; ts.createProgram([process.env.SOURCE],{});',
    "tests/escaped.regression.mjs": 'import {readFile} from "node:fs/promises"; globalThis.read = readFile;',
    "tests/namespace.regression.mjs":
      'import * as esbuild from "esbuild"; await esbuild.build({entryPoints:[process.env.SOURCE]});',
    "tests/plugin.regression.mjs":
      'import {build} from "esbuild"; await build({entryPoints:["packages/villages/src/server.ts"],plugins:process.env.PLUGINS});',
    "tests/scoped-helper.mjs":
      'import {readFile} from "node:fs/promises"; export const read = () => readFile(process.env.FIXTURE);',
    "tests/scoped.regression.mjs": 'import {read} from "./scoped-helper.mjs"; await read();',
    "tests/unknown.regression.mjs": 'import {readFile} from "node:fs/promises"; await readFile(process.env.FIXTURE);',
  };
  for (const [path, value] of Object.entries(files)) {
    await mkdir(join(root, path, ".."), { recursive: true });
    await writeFile(join(root, path), value);
  }
  files["scripts/test-inputs.json"] = JSON.stringify({
    "tests/scoped-helper.mjs": {
      sha256: fingerprint(files["tests/scoped-helper.mjs"]),
      inputs: ["packages/villages/src/"],
    },
  });
  await writeFile(join(root, "scripts/test-inputs.json"), files["scripts/test-inputs.json"]);
  const inventory = Object.keys(files)
    .filter((path) => path.endsWith(".regression.mjs"))
    .map((path) => ({ path, group: "regression" }));
  const first = await checkBlueprint(root, { inventory });
  const spec = (path, blueprint = first) =>
    blueprint.specs.find((s) => s.id === "test:tests/" + path + ".regression.mjs");
  assert.equal(spec("literal").opaque, false);
  assert.ok(spec("literal").inputs.includes("packages/villages/src/server.ts"));
  assert.equal(spec("inline").opaque, false, "Literal inline bundles use actual compiler inputs");
  assert.ok(spec("inline").inputs.includes("packages/villages/src/server.ts"));
  for (const name of [
    "archive",
    "compiler",
    "escaped",
    "namespace",
    "plugin",
    "unknown",
    "inline-io",
    "promises",
    "method",
    "mixed-build",
    "loader",
    "escaped-builder",
    "alias",
  ])
    assert.equal(spec(name).opaque, true, name);
  assert.equal(spec("scoped").opaque, false);
  await writeFile(join(root, "tests/scoped-helper.mjs"), files["tests/scoped-helper.mjs"] + "// changed");
  assert.equal(
    spec("scoped", await checkBlueprint(root, { inventory })).opaque,
    true,
    "Stale reviewed scopes fail broad",
  );
  await writeFile(join(root, "tests/scoped-helper.mjs"), files["tests/scoped-helper.mjs"]);
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
