import assert from "node:assert/strict";
import { copyFile, mkdir, mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import AdmZip from "adm-zip";
import { build } from "../scripts/esbuild.mjs";
import { unpackCiPackage, downloadCiPackages } from "../scripts/download-ci-packages.mjs";

const root = await mkdtemp(join(tmpdir(), "villages-ci-diagnostics-"));
try {
  await mkdir(join(root, "scripts"));
  await mkdir(join(root, "tests"));
  await writeFile(join(root, "package.json"), JSON.stringify({ type: "module" }));
  for (const name of ["checkout-operation", "test-inventory", "test-resources", "test-scheduler", "test-cases"])
    await copyFile(new URL("../scripts/" + name + ".mjs", import.meta.url), join(root, "scripts", name + ".mjs"));
  const runner = (await readFile(new URL("../scripts/run-tests.mjs", import.meta.url), "utf8")).replace(
    '"tsx"',
    JSON.stringify(import.meta.resolve("tsx")),
  );
  await writeFile(join(root, "scripts/run-tests.mjs"), runner);
  const env = { ...process.env, CI: "true" };
  delete env.VILLAGES_CHECKOUT_OPERATION;
  const probe = async (source, args = []) => {
    await writeFile(join(root, "tests/probe.regression.mjs"), source);
    return spawnSync(process.execPath, ["scripts/run-tests.mjs", "regression", ...args], {
      cwd: root,
      env,
      encoding: "utf8",
      windowsHide: true,
    });
  };
  for (const diagnostic of [
    'console.warn("unexpected warning")',
    'console.error("unexpected error")',
    'process.emitWarning("unexpected process warning")',
  ]) {
    const result = await probe(diagnostic);
    assert.notEqual(result.status, 0, diagnostic);
    assert.match(result.stdout, /FAIL tests\/probe/);
    assert.match(result.stderr, /unexpected/);
  }
  assert.notEqual((await probe('throw Error("actual failure")')).status, 0);
  const missing = await probe(
    '// Test cases: first, second\nimport { runCase } from "../scripts/test-cases.mjs"; await runCase("first", async () => {});',
  );
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr, /case did not execute/);
  assert.notEqual(
    (
      await probe(
        '// Test cases: parent/a, parent/b\nimport { runCase } from "../scripts/test-cases.mjs"; await runCase("parent", async () => {});',
      )
    ).status,
    0,
    "A broad parent cannot certify missing child cases",
  );
  const valid =
    '// Test cases: first, second\nimport { runCase } from "../scripts/test-cases.mjs"; await runCase("first", async () => {}); await runCase("second", async () => {});';
  const full = await probe(valid);
  assert.equal(full.status, 0, full.stdout + full.stderr);
  const focused = await probe(valid, ["--case=first"]);
  assert.equal(focused.status, 0, focused.stdout + focused.stderr);
  assert.notEqual((await probe("// Test cases: first\n", ["--case=first"])).status, 0);

  await assert.rejects(
    build({ stdin: { contents: "console.log({a:1,a:2})", sourcefile: "warning.js" }, write: false }),
    /Duplicate key/,
  );
  assert.equal((await build({ stdin: { contents: "console.log('clean')" }, write: false })).warnings.length, 0);

  const zip = new AdmZip();
  zip.addFile(".build-tmp/package-build.json", Buffer.from("{}"));
  zip.addFile("artifacts/villages-0.7.3.zip", Buffer.from("candidate"));
  const bytes = zip.toBuffer();
  const artifact = { id: 1, digest: "sha256:" + createHash("sha256").update(bytes).digest("hex") };
  await unpackCiPackage(artifact, bytes, join(root, "valid"));
  assert.equal(await readFile(join(root, "valid/artifacts/villages-0.7.3.zip"), "utf8"), "candidate");
  await assert.rejects(
    unpackCiPackage({ ...artifact, digest: "sha256:" + "0".repeat(64) }, bytes, join(root, "corrupt")),
    /digest mismatch/,
  );
  const bad = new AdmZip();
  bad.addFile(".build-tmp/package-build.json", Buffer.from("{}"));
  bad.addFile("unexpected.txt", Buffer.from("unexpected"));
  const badBytes = bad.toBuffer();
  await assert.rejects(
    unpackCiPackage(
      { digest: "sha256:" + createHash("sha256").update(badBytes).digest("hex") },
      badBytes,
      join(root, "unexpected"),
    ),
    /Unexpected CI artifact member/,
  );
  const linked = new AdmZip(bytes);
  linked.getEntry("artifacts/villages-0.7.3.zip").header.attr = ((0xa000 | 0o777) << 16) >>> 0;
  const linkedBytes = linked.toBuffer();
  await assert.rejects(
    unpackCiPackage(
      { digest: "sha256:" + createHash("sha256").update(linkedBytes).digest("hex") },
      linkedBytes,
      join(root, "linked"),
    ),
    /links are forbidden/,
  );
  const request = async (url) =>
    url.includes("/runs/")
      ? {
          ok: true,
          json: async () => ({
            total_count: 2,
            artifacts: ["villages-linux", "villages-windows"].map((name) => ({ ...artifact, name, expired: false })),
          }),
        }
      : { ok: true, arrayBuffer: async () => bytes };
  await downloadCiPackages({
    repository: "example/repo",
    runId: 1,
    token: "synthetic",
    directory: join(root, "platforms"),
    request,
  });
  await assert.rejects(
    downloadCiPackages({
      repository: "example/repo",
      runId: 1,
      token: "synthetic",
      directory: join(root, "failed-download"),
      request: async () => ({ ok: false, status: 503 }),
    }),
    /request failed/,
  );
} finally {
  await rm(root, { recursive: true, force: true });
}
console.log(
  "CI diagnostics: child stderr and esbuild warnings fail, declared cases execute, and artifact bytes are digest-checked before extraction.",
);
