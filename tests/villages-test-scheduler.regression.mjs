import assert from "node:assert/strict";
import { scheduleTests } from "../scripts/test-scheduler.mjs";
const tests = [
  { path: "b1", group: "browser", parallelSafe: true },
  { path: "b2", group: "browser", parallelSafe: true },
  { path: "b3", group: "browser", parallelSafe: true },
  { path: "r1", group: "regression", parallelSafe: true },
  { path: "unknown", group: "regression", parallelSafe: false },
  { path: "r2", group: "regression", parallelSafe: true },
];
let active = 0,
  browsers = 0,
  max = 0;
const seen = [];
const results = await scheduleTests(tests, {
  jobs: 4,
  browserJobs: 2,
  async run(test) {
    active++;
    if (test.group === "browser") browsers++;
    max = Math.max(max, active);
    assert.ok(active <= 4);
    assert.ok(browsers <= 2);
    if (!test.parallelSafe) assert.equal(active, 1, "unknown takes entire pool");
    seen.push(test.path);
    await new Promise((resolve) => setTimeout(resolve, 15));
    active--;
    if (test.group === "browser") browsers--;
    if (test.path === "r2") throw Error("synthetic spawn failure");
    return { path: test.path, code: 0 };
  },
});
assert.ok(max > 1);
assert.deepEqual(
  results.map((row) => row.path),
  tests.map((row) => row.path),
);
assert.equal(results.at(-1).code, 1);
assert.equal(results.at(-1).error, "synthetic spawn failure");
assert.equal(new Set(seen).size, tests.length);
await assert.rejects(scheduleTests(tests, { jobs: 0, run() {} }), /Invalid worker/);
const ordered = [
  { path: "short", group: "regression", parallelSafe: true },
  { path: "tests/villages-venue-layout.e2e.mjs", group: "browser", parallelSafe: true },
  { path: "barrier", group: "regression", parallelSafe: false },
  { path: "tests/villages-sprite-manager.e2e.mjs", group: "browser", parallelSafe: true },
];
const starts = [];
const orderedResults = await scheduleTests(ordered, {
  jobs: 1,
  browserJobs: 1,
  run: async (test) => {
    starts.push(test.path);
    return { path: test.path, code: 0 };
  },
});
assert.deepEqual(
  starts,
  ordered.map((row) => row.path),
);
assert.deepEqual(
  orderedResults.map((row) => row.path),
  ordered.map((row) => row.path),
);

const firstDone = Promise.withResolvers();
const laterDone = Promise.withResolvers();
const running = new Set();
const backfillStarts = [];
const backfill = scheduleTests(
  [
    { path: "first", parallelSafe: true, resources: ["shared"] },
    { path: "exclusive", parallelSafe: false },
    { path: "conflict", parallelSafe: true, resources: ["shared"] },
    { path: "later", parallelSafe: true },
  ],
  {
    jobs: 3,
    browserJobs: 1,
    async run(test) {
      if (test.path === "exclusive") assert.equal(running.size, 0);
      else assert.ok(!running.has("exclusive"));
      if (test.path === "conflict") assert.ok(!running.has("first"));
      running.add(test.path);
      backfillStarts.push(test.path);
      if (test.path === "first") await firstDone.promise;
      if (test.path === "later") {
        await laterDone.promise;
      }
      running.delete(test.path);
      return { path: test.path, code: 0 };
    },
  },
);
await new Promise(setImmediate);
assert.deepEqual(backfillStarts, ["first", "later"], "Isolated work fills idle slots past a waiting exclusive");
firstDone.resolve();
laterDone.resolve();
const backfilled = await backfill;
assert.ok(
  backfilled.every((result) => result.code === 0),
  JSON.stringify(backfilled),
);
assert.deepEqual(
  backfilled.map((result) => result.path),
  ["first", "exclusive", "conflict", "later"],
);
assert.equal(new Set(backfillStarts).size, 4, "Keep-going executes every suite exactly once");

const drain = Promise.withResolvers();
const activeStarted = Promise.withResolvers();
const failed = scheduleTests(
  [
    { path: "failure", parallelSafe: true },
    { path: "active", parallelSafe: true },
    { path: "pending", parallelSafe: false },
  ],
  {
    jobs: 2,
    browserJobs: 1,
    failFast: true,
    async run(test) {
      assert.notEqual(test.path, "pending");
      if (test.path === "active") {
        activeStarted.resolve();
        await drain.promise;
      }
      return { path: test.path, code: test.path === "failure" ? 1 : 0 };
    },
  },
);
await activeStarted.promise;
drain.resolve();
const failureResults = await failed;
assert.equal(failureResults[0].code, 1);
assert.equal(failureResults[1].code, 0, "Fail-fast drains work already running");
assert.equal(failureResults[2].skipped, true, "Fail-fast never certifies pending work");
console.log("Scheduler bounds, exclusive resources, backfill, complete inventory and failure handling passed.");
