import { testCost } from "./test-costs.mjs";

/** Keep local feedback conservative; allow one additional browser on capable CI hosts. */
export function browserWorkerLimit({ jobs, ci, cpuCount, memoryBytes, freeMemoryBytes }) {
  const capable = ci && cpuCount >= 4 && memoryBytes >= 8 * 1024 ** 3 && freeMemoryBytes >= 4 * 1024 ** 3;
  return Math.min(jobs, capable ? 3 : 2);
}

/** Resource ownership controls concurrency; unclassified suites retain an exclusive barrier. */
export async function scheduleTests(tests, { jobs = 4, browserJobs = 2, failFast = false, run }) {
  if (
    !Number.isInteger(jobs) ||
    jobs < 1 ||
    jobs > 16 ||
    !Number.isInteger(browserJobs) ||
    browserJobs < 1 ||
    browserJobs > jobs
  )
    throw new Error("Invalid worker limits");
  // Reorder only within safe segments. Unknown/exclusive suites retain their
  // barrier position, and results retain the requested inventory order.
  const pending = [];
  let segment = [];
  const flush = () => {
    pending.push(...segment.sort((a, b) => testCost(b.test) - testCost(a.test) || a.index - b.index));
    segment = [];
  };
  tests.forEach((test, index) => {
    if (test.parallelSafe) segment.push({ test, index });
    else {
      flush();
      pending.push({ test, index });
    }
  });
  flush();
  const active = new Map();
  const results = new Array(tests.length);
  let failed = false;
  while (pending.length || active.size) {
    if (failed && failFast) {
      for (const row of pending.splice(0))
        results[row.index] = { ...row.test, code: null, signal: "not-run", skipped: true, durationMs: 0 };
    }
    if (!active.size && !pending.length) break;
    let browsers = [...active.values()].filter((row) => row.test.group === "browser").length;
    let exclusive = [...active.values()].some((row) => !row.test.parallelSafe);
    for (let index = 0; index < pending.length && active.size < jobs && !exclusive;) {
      const row = pending[index];
      if (!row.test.parallelSafe) {
        if (active.size) break;
        exclusive = true;
      } else if (row.test.group === "browser" && browsers >= browserJobs) {
        index++;
        continue;
      } else if (
        row.test.resources?.some((resource) =>
          [...active.values()].some((entry) => entry.test.resources?.includes(resource)),
        )
      ) {
        index++;
        continue;
      }
      pending.splice(index, 1);
      if (row.test.group === "browser") browsers++;
      const promise = Promise.resolve()
        .then(() => run(row.test))
        .then(
          (result) => ({ index: row.index, result }),
          (error) => ({ index: row.index, result: { ...row.test, code: 1, error: error.message } }),
        );
      active.set(row.index, { ...row, promise });
    }
    const completed = await Promise.race([...active.values()].map((row) => row.promise));
    results[completed.index] = completed.result;
    if (completed.result.code !== 0) failed = true;
    active.delete(completed.index);
  }
  return results;
}
