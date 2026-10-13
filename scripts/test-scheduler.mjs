/** Unknown or changed suites take the entire pool; browser workers share the total cap. */
export async function scheduleTests(tests, { jobs = 4, browserJobs = 2, run }) {
  if (
    !Number.isInteger(jobs) ||
    jobs < 1 ||
    jobs > 16 ||
    !Number.isInteger(browserJobs) ||
    browserJobs < 1 ||
    browserJobs > jobs
  )
    throw new Error("Invalid worker limits");
  const pending = tests.map((test, index) => ({ test, index }));
  const active = new Map();
  const results = new Array(tests.length);
  while (pending.length || active.size) {
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
    active.delete(completed.index);
  }
  return results;
}
