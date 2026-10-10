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
console.log("Scheduler bounds, exclusive barriers, complete inventory, ordering and failures passed.");
