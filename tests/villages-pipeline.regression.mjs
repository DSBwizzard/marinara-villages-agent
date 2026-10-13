import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, relative, isAbsolute } from "node:path";
import { pathToFileURL } from "node:url";
import { scheduleTests } from "../scripts/test-scheduler.mjs";
import { testResources } from "../scripts/test-resources.mjs";
import { checkPlan } from "../scripts/check-changed.mjs";
import { fullPlatformValidation } from "../scripts/ci-policy.mjs";
import { selectAffectedTests } from "../scripts/select-tests.mjs";
import { validationInputs } from "../scripts/validation-inputs.mjs";

const invoked = [];
const stopped = await scheduleTests(
  [
    { path: "failure", group: "regression", parallelSafe: true },
    { path: "not-started", group: "regression", parallelSafe: true },
  ],
  {
    jobs: 1,
    browserJobs: 1,
    failFast: true,
    run: async (test) => {
      invoked.push(test.path);
      return { ...test, code: 1 };
    },
  },
);
assert.deepEqual(invoked, ["failure"]);
assert.equal(stopped[1].skipped, true);
assert.equal(stopped[1].code, null, "Unexecuted coverage never counts as passing");

const held = new Set();
let overlap = false;
await scheduleTests(
  [
    { path: "a", group: "regression", parallelSafe: true, resources: ["shared-file"] },
    { path: "b", group: "regression", parallelSafe: true, resources: ["shared-file"] },
    { path: "c", group: "regression", parallelSafe: true, resources: [] },
  ],
  {
    jobs: 3,
    browserJobs: 1,
    run: async (test) => {
      for (const resource of test.resources) {
        assert.ok(!held.has(resource));
        held.add(resource);
      }
      if (test.path === "c") overlap = held.has("shared-file");
      await new Promise((done) => setTimeout(done, 10));
      for (const resource of test.resources) held.delete(resource);
      return { ...test, code: 0 };
    },
  },
);
assert.equal(overlap, true, "Independent resources may overlap; shared resources may not");
assert.equal(testResources("tests/villages-application.regression.ts", "regression").parallelSafe, true);
assert.equal(testResources("tests/unreviewed.regression.ts", "regression").parallelSafe, false);
assert.equal(testResources("tests/villages-application.regression.ts", "engine").parallelSafe, false);
assert.deepEqual(checkPlan(["docs/example.md"]), {
  format: [],
  lint: [],
  types: false,
  architecture: false,
  engineTypes: false,
});
assert.equal(checkPlan(["packages/villages/src/client/example.tsx"]).types, true);
assert.equal(checkPlan(["packages/villages/src/client/example.tsx"]).architecture, true);
assert.equal(fullPlatformValidation(["packages/villages/src/client/features/home/styles.ts"]), false);
assert.equal(fullPlatformValidation(["scripts/run-tests.mjs"]), true);
assert.equal(fullPlatformValidation([], { release: true }), true);
const domain = "packages/villages/src/server/domain/rules/memory-selection.ts";
const candidates = [
  { path: "tests/privacy.regression.ts", group: "regression" },
  { path: "tests/other.e2e.mjs", group: "browser" },
];
assert.deepEqual(selectAffectedTests([domain], candidates, new Map([[domain, ["tests/privacy.regression.ts"]]])), [
  "tests/privacy.regression.ts",
]);
assert.equal(
  selectAffectedTests([domain], candidates).length,
  2,
  "Unknown shared consumers cannot receive a misleading smoke-only pass",
);
const omitted = spawnSync(
  process.execPath,
  [
    "scripts/run-tests.mjs",
    "review",
    "--test=tests/villages-settings-navigation.e2e.mjs",
    "--case=settings/hooks",
    "--case=scene/exit",
  ],
  {
    env: { ...process.env, VILLAGES_TEST_CASE_REPORT: "" },
    encoding: "utf8",
  },
);
assert.equal(omitted.status, 1);
assert.match(omitted.stderr, /outside the selected files\/group: scene\/exit/);

const directory = await mkdtemp(join(tmpdir(), "villages-pipeline-"));
try {
  const fixture = join(directory, "inputs");
  await mkdir(join(fixture, ".github/workflows"), { recursive: true });
  execFileSync("git", ["init", fixture], { stdio: "ignore" });
  const workflow = join(fixture, ".github/workflows/ci.yml");
  await writeFile(workflow, "name: CI\n");
  const first = await validationInputs(fixture);
  await writeFile(workflow, "name: CI\r\n");
  assert.equal((await validationInputs(fixture)).digest, first.digest, "Cross-platform newline normalization");
  await writeFile(join(fixture, "README.md"), "Documentation only");
  assert.equal(
    (await validationInputs(fixture)).digest,
    first.digest,
    "Documentation does not invalidate code evidence",
  );
  await writeFile(workflow, "name: changed gates\n");
  assert.notEqual((await validationInputs(fixture)).digest, first.digest, "Workflow changes invalidate CI evidence");
  const report = join(directory, "cases.json");
  const module = pathToFileURL(resolve("scripts/test-cases.mjs")).href;
  const code =
    "import {runCase} from " +
    JSON.stringify(module) +
    '; await runCase("wrong", () => {throw Error("must skip")}); await runCase("settings/hooks/desktop", async () => {});';
  const env = { ...process.env, VILLAGES_TEST_CASES: '["settings/hooks"]', VILLAGES_TEST_CASE_REPORT: report };
  execFileSync(process.execPath, ["--input-type=module", "-e", code], { env });
  assert.deepEqual(JSON.parse(await readFile(report, "utf8")).completed, ["settings/hooks/desktop"]);
  const missing = spawnSync(process.execPath, ["--input-type=module", "-e", "import " + JSON.stringify(module)], {
    env: { ...env, VILLAGES_TEST_CASES: '["missing"]' },
    encoding: "utf8",
  });
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /No requested test case executed/);
} finally {
  const cleanupPath = relative(tmpdir(), directory);
  assert.ok(cleanupPath && !cleanupPath.startsWith("..") && !isAbsolute(cleanupPath));
  await rm(directory, { recursive: true, force: true });
}
console.log("Fast failure, shared resources, case coverage, affected checks and CI scope passed.");
