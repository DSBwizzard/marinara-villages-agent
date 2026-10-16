import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { executeValidation } from "../../scripts/ci-validation.mjs";
import { validationInputs } from "../../scripts/validation-inputs.mjs";
import { checkKeys, environmentFor, fingerprint } from "../../scripts/ci-checks.mjs";
import AdmZip from "adm-zip";

export async function ciValidationFixture(root) {
  await mkdir(join(root, "scripts"), { recursive: true });
  await mkdir(join(root, "tests"), { recursive: true });
  await mkdir(join(root, ".build-tmp"), { recursive: true });
  execFileSync("git", ["init", root], { stdio: "ignore" });
  await writeFile(join(root, "tests/a.regression.mjs"), "// test fixture");
  const archive = new AdmZip();
  archive.addFile("manifest.json", Buffer.from(JSON.stringify({ version: "1.2.3", files: [] })));
  const bytes = archive.toBuffer();
  const build = {
    version: "1.2.3",
    sourceDigest: "d".repeat(64),
    sourceRevision: "a".repeat(40),
    sha256: fingerprint(bytes),
  };
  const snapshot = await validationInputs(root);
  const toolchain = {
    node: process.version.slice(1),
    arch: process.arch,
    runners: { linux: "ubuntu-24.04", win32: "windows-2025" },
  };
  const target = environmentFor(toolchain);
  const blueprint = {
    inputDigest: snapshot.digest,
    policyDigest: "e".repeat(64),
    toolchain,
    catalog: [],
    specs: [
      { id: "static:lint", kind: "static", script: "lint", inputs: [] },
      { id: "build", kind: "build", inputs: [] },
      { id: "package", kind: "package", inputs: [] },
      { id: "reproducibility", kind: "reproducibility", inputs: [] },
      {
        id: "test:tests/a.regression.mjs",
        kind: "test",
        path: "tests/a.regression.mjs",
        group: "regression",
        inputs: [],
      },
    ],
  };
  const specs = checkKeys(blueprint, target);
  const plan = {
    schemaVersion: 3,
    sourceRevision: "a".repeat(40),
    blueprint,
    platforms: { [process.platform]: { environment: target, pending: specs, reused: [] } },
  };
  const environment = {
    ...process.env,
    GITHUB_RUN_ID: "123",
    GITHUB_RUN_ATTEMPT: "1",
    GITHUB_JOB: process.platform === "linux" ? "validate" : "validate-windows",
    npm_execpath: "npm-fixture",
    VILLAGES_CI_FRESH: "false",
  };
  let mode = "pass",
    counter = 0;
  const calls = [];
  const execute = async (command, args) => {
    calls.push(args);
    if (args[0] === "scripts/build-villages.mjs") {
      await mkdir(join(root, "artifacts"), { recursive: true });
      await writeFile(join(root, "artifacts/villages-1.2.3.zip"), bytes);
      await writeFile(join(root, ".build-tmp/package-build.json"), JSON.stringify(build));
    }
    if (args[0] === "scripts/run-tests.mjs") {
      if (mode === "blocked") throw Error("Blocked before tests");
      await mkdir(join(root, ".build-tmp/test-results"), { recursive: true });
      const report = ".build-tmp/test-results/" + ++counter + ".json";
      await writeFile(
        join(root, report),
        JSON.stringify({
          group: "review",
          cases: [],
          results: [{ path: "tests/a.regression.mjs", code: mode === "fail" ? 1 : 0 }],
        }),
      );
      await writeFile(join(root, ".build-tmp/test-results/review-latest.json"), JSON.stringify({ report }));
    }
  };
  const run = () => executeValidation({ root, plan, execute, environment });
  const passed = await run();
  assert.equal(passed.coverageComplete, true);
  assert.equal(passed.executedAllTests, true);
  mode = "fail";
  const failed = await run();
  assert.equal(failed.coverageComplete, false);
  assert.equal(failed.checks.find((check) => check.id.startsWith("test:")).code, 1);
  mode = "blocked";
  const blocked = await run();
  assert.equal(blocked.coverageComplete, false);
  assert.ok(!blocked.checks.some((check) => check.id.startsWith("test:")), "A stale report cannot become new proof");
  const reused = passed.checks.map((proof) => ({ ...proof, from: { artifact: { id: 7 }, build } }));
  plan.platforms[process.platform] = { environment: target, pending: [], reused };
  const before = calls.length;
  const warm = await executeValidation({ root, plan, execute, environment, github: { file: async () => bytes } });
  assert.equal(warm.coverageComplete, true);
  assert.equal(warm.executedAllTests, false);
  assert.equal(calls.length, before, "Warm validation runs no static/build/gameplay checks");
  assert.equal(
    JSON.parse(await readFile(join(root, ".build-tmp/ci-validation.json"), "utf8")).checks.filter(
      (check) => check.executed,
    ).length,
    0,
  );
}
