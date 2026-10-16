import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, relative, isAbsolute } from "node:path";
import { pathToFileURL } from "node:url";
import { scheduleTests } from "../scripts/test-scheduler.mjs";
import { testResources } from "../scripts/test-resources.mjs";
import { checkPlan } from "../scripts/check-changed.mjs";
import {
  fullPlatformValidation,
  needsBrowserPreparation,
  pipelineOnlyChanges,
  ciTestPlan,
} from "../scripts/ci-policy.mjs";
import { isDocumentation } from "../scripts/change-scope.mjs";
import { assertReusableCi } from "../scripts/ci-reuse.mjs";
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
const selectionInventory = [
  { path: "tests/villages-settings-navigation.e2e.mjs", group: "browser" },
  { path: "tests/villages-venue-layout.e2e.mjs", group: "browser" },
  { path: "tests/villages-other.regression.ts", group: "regression" },
];
const oneOwner = "packages/villages/src/client/features/settings/actions.tsx";
const twoOwner = "packages/villages/src/client/features/settings/draft-session.tsx";
assert.deepEqual(
  selectAffectedTests([oneOwner], selectionInventory),
  selectAffectedTests([oneOwner, twoOwner], selectionInventory),
);
assert.deepEqual(selectAffectedTests(["packages/villages/README.md"], selectionInventory), []);
assert.equal(selectAffectedTests(["tests/unknown-helper.mjs"], selectionInventory).length, 3);
assert.deepEqual(
  selectAffectedTests(
    ["tests/helper.mjs"],
    selectionInventory,
    new Map([["tests/helper.mjs", ["tests/villages-other.regression.ts"]]]),
  ),
  ["tests/villages-other.regression.ts"],
);
assert.equal(checkPlan(["packages/villages/engine-boundary.json"]).engineTypes, true);
assert.deepEqual(checkPlan(["sources/engine-public/types/capability-runtime.d.ts"]), {
  format: [],
  lint: [],
  types: false,
  architecture: false,
  engineTypes: true,
});
assert.equal(fullPlatformValidation(["packages/villages/engine-boundary.json"]), true);
assert.equal(fullPlatformValidation(["scripts/select-tests.mjs"]), false);
assert.equal(isDocumentation("README.ts"), false);
assert.equal(isDocumentation("packages/villages/AGENTS.mjs"), false);
assert.equal(needsBrowserPreparation({ full: true, reused: false, prepared: "false" }), true);
assert.equal(needsBrowserPreparation({ full: true, reused: true, prepared: "false" }), false);
assert.equal(needsBrowserPreparation({ full: true, reused: false, prepared: "true" }), false);
const ciContext = {
  run: {
    id: 5,
    event: "pull_request",
    status: "completed",
    conclusion: "success",
    path: ".github/workflows/ci.yml",
    head_sha: "head",
  },
  receipt: {
    schemaVersion: 1,
    passed: true,
    runId: 5,
    platform: "linux",
    node: "v24.11.0",
    full: true,
    completeInventory: true,
    sourceRevision: "head",
    inputDigest: "inputs",
    inputs: [],
    inventory: ["a"],
    tests: [{ path: "a", code: 0 }],
  },
  testedCommit: { sha: "head", tree: { sha: "tree" } },
  tree: "tree",
  current: { digest: "inputs", inputs: [] },
  inventory: ["a"],
  platform: "linux",
  node: "v24.11.0",
  full: true,
};
assert.equal(assertReusableCi(ciContext), ciContext.receipt);
const mergedContext = {
  ...ciContext,
  base: "base",
  run: { ...ciContext.run, pull_requests: [] },
  receipt: { ...ciContext.receipt, sourceRevision: "tested-merge" },
  testedCommit: { sha: "tested-merge", tree: { sha: "tree" }, parents: [{ sha: "base" }, { sha: "head" }] },
};
assert.equal(assertReusableCi(mergedContext), mergedContext.receipt, "Closed PR links are not provenance");
assert.throws(() => assertReusableCi({ ...mergedContext, base: "wrong-base" }));
assert.equal(pipelineOnlyChanges(["scripts/ci-reuse.mjs", ".github/workflows/ci.yml", "DEVELOPMENT.md"]), true);
for (const path of [
  "scripts/run-tests.mjs",
  "package-lock.json",
  "packages/villages/src/client/main.ts",
  "scripts/unknown-base",
  "tests/unknown-helper.mjs",
])
  assert.equal(pipelineOnlyChanges(["scripts/ci-policy.mjs", path]), false);
assert.equal(pipelineOnlyChanges([]), false);
const ciInventory = [
  ...["pipeline", "test-scheduler", "checkout-operation", "package-verifier"].map((name) => ({
    path: "tests/villages-" + name + ".regression.mjs",
    group: "regression",
  })),
  { path: "tests/villages-settings-navigation.e2e.mjs", group: "browser" },
  { path: "tests/villages-settings-ownership.regression.ts", group: "regression" },
  { path: "tests/villages-venue-layout.e2e.mjs", group: "browser" },
  { path: "tests/villages-other.regression.ts", group: "regression" },
];
const focused = ciTestPlan([oneOwner, twoOwner], ciInventory);
assert.equal(focused.full, false);
assert.equal(focused.tests.length, 2);
assert.equal(focused.browser, true);
const personaTests = ["persona-cache-race", "persona-cache-ownership", "persona-ownership"].map((name) => ({
  path: "tests/villages-" + name + ".regression.ts",
  group: "regression",
}));
const personaPath = "packages/villages/src/server/features/settings/persona-cache-service.ts";
const personaPlan = ciTestPlan(
  [personaPath],
  [...ciInventory, ...personaTests],
  new Map([[personaPath, personaTests.map((test) => test.path)]]),
);
assert.equal(personaPlan.full, false);
for (const test of personaTests) assert.ok(personaPlan.tests.includes(test.path));
assert.ok(
  ciTestPlan([oneOwner], ciInventory, new Map([[oneOwner, [ciInventory[7].path]]])).tests.includes(ciInventory[7].path),
  "Feature-family names never override actual dependency consumers",
);
assert.equal(needsBrowserPreparation({ full: false, browser: true, reused: false, prepared: "false" }), true);
assert.equal(ciTestPlan([oneOwner], ciInventory, new Map(), { secondary: true }).tests.length, 4);
assert.equal(ciTestPlan(["docs/guide.md"], ciInventory).tests.length, 0);
for (const paths of [
  ["package-lock.json"],
  ["scripts/build-villages.mjs"],
  ["unknown.data"],
  [oneOwner, "unknown.data"],
])
  assert.equal(ciTestPlan(paths, ciInventory).full, true);
assert.equal(ciTestPlan([oneOwner], ciInventory, new Map(), { release: true }).tests.length, ciInventory.length);
assert.equal(ciTestPlan([domain], ciInventory, new Map([[domain, [ciInventory[7].path]]])).tests.length, 1);
for (const changed of [{ tree: "changed" }, { node: "v24.12.0" }, { platform: "win32" }, { inventory: ["missing"] }])
  assert.throws(() => assertReusableCi({ ...ciContext, ...changed }));
assert.throws(() => assertReusableCi({ ...ciContext, run: { ...ciContext.run, conclusion: "failure" } }));
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
