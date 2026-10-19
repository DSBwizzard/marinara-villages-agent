import { acquireCheckoutOperation } from "./checkout-operation.mjs";
import { mkdir, writeFile, readFile, open, unlink, appendFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { testInventory } from "./test-inventory.mjs";
import { availableParallelism, totalmem, freemem } from "node:os";
import { browserWorkerLimit, scheduleTests } from "./test-scheduler.mjs";
import { caseMatches } from "./test-cases.mjs";

const args = process.argv.slice(2);
const group = args.find((arg) => !arg.startsWith("--")) ?? "regression";
const inventory = await testInventory();
if (args.includes("--list")) {
  console.log(JSON.stringify(inventory, null, 2));
  process.exit(0);
}
if (!["regression", "browser", "engine", "review", "all"].includes(group))
  throw new Error(`Unknown test group: ${group}`);
const filter = args.find((arg) => arg.startsWith("--filter="))?.slice(9);
const selected = args.filter((arg) => arg.startsWith("--test=")).map((arg) => arg.slice(7));
const cases = args.filter((arg) => arg.startsWith("--case=")).map((arg) => arg.slice(7));
if (args.includes("--fail-fast") && args.includes("--keep-going")) throw new Error("Choose fail-fast or keep-going");
const failFast = args.includes("--fail-fast") || (!args.includes("--keep-going") && process.env.CI !== "true");
const jobs = Number(args.find((arg) => arg.startsWith("--jobs="))?.slice(7) ?? 4);
const host = { cpuCount: availableParallelism(), memoryBytes: totalmem(), freeMemoryBytes: freemem() };
const browserJobs = Number(
  args.find((arg) => arg.startsWith("--browser-jobs="))?.slice(15) ??
    browserWorkerLimit({ jobs, ci: process.env.CI === "true", ...host }),
);
for (const arg of args) {
  if (
    arg !== group &&
    arg !== "--list" &&
    arg !== "--fail-fast" &&
    arg !== "--keep-going" &&
    !["--filter=", "--test=", "--case=", "--jobs=", "--browser-jobs="].some((prefix) => arg.startsWith(prefix))
  )
    throw new Error(`Unknown test option: ${arg}`);
}
if (
  !Number.isInteger(jobs) ||
  jobs < 1 ||
  jobs > 16 ||
  !Number.isInteger(browserJobs) ||
  browserJobs < 1 ||
  browserJobs > jobs
)
  throw new Error("Invalid worker limits");
for (const path of selected) {
  const test = inventory.find((test) => test.path === path);
  if (!test) throw new Error(`Unknown test: ${path}`);
  if (!(group === "all" || (group === "review" ? test.group !== "engine" : test.group === group)))
    throw new Error(`Test ${path} is outside group ${group}`);
}
for (const name of cases)
  if (
    !name ||
    !inventory.some((test) => test.cases.some((entry) => caseMatches(entry, name) || caseMatches(name, entry)))
  )
    throw new Error("Unknown test case: " + name);
const tests = inventory.filter(
  (test) =>
    (group === "all" || (group === "review" ? test.group !== "engine" : test.group === group)) &&
    (!filter || test.path.includes(filter)) &&
    (!selected.length || selected.includes(test.path)) &&
    (!cases.length ||
      test.cases.some((entry) => cases.some((name) => caseMatches(entry, name) || caseMatches(name, entry)))),
);
if (!tests.length) throw new Error("No tests matched; validation cannot pass an empty selection.");
for (const name of cases)
  if (!tests.some((test) => test.cases.some((entry) => caseMatches(entry, name) || caseMatches(name, entry))))
    throw new Error("Requested test case is outside the selected files/group: " + name);
const operation = await acquireCheckoutOperation(process.cwd());
try {
  const root = ".build-tmp/test-results";
  await mkdir(root, { recursive: true });
  const lockPath = join(root, "operation.lock");
  let lock;
  try {
    lock = await open(lockPath, "wx");
  } catch (error) {
    if (error.code === "EEXIST")
      throw new Error(
        "Test run is active or interrupted; inspect .build-tmp/test-results/operation.lock before recovery",
        { cause: error },
      );
    throw error;
  }
  const runId = new Date().toISOString().replaceAll(/[:.]/g, "-") + "-" + randomUUID();
  const directory = join(root, runId);
  const children = new Set();
  let cancelled = false;
  function cancel() {
    cancelled = true;
    for (const child of children) child.kill();
  }
  process.once("SIGINT", cancel);
  process.once("SIGTERM", cancel);
  try {
    await lock.writeFile(JSON.stringify({ pid: process.pid, runId, group, startedAt: new Date().toISOString() }));
    await mkdir(directory);
    const start = Date.now();
    console.log(
      `WORKERS total=${jobs} browsers=${browserJobs} cpus=${host.cpuCount} memoryGiB=${(host.memoryBytes / 1024 ** 3).toFixed(1)} freeGiB=${(host.freeMemoryBytes / 1024 ** 3).toFixed(1)}`,
    );
    const progress = join(directory, "progress.jsonl");
    let firstFailure = false;
    const results = await scheduleTests(tests, {
      jobs,
      browserJobs,
      failFast,
      async run(test) {
        if (cancelled) return { ...test, code: 1, signal: "cancelled", durationMs: 0 };
        const testStart = Date.now();
        const testCases = cases.filter((name) =>
          test.cases.some((entry) => caseMatches(entry, name) || caseMatches(name, entry)),
        );
        const caseReport = join(directory, test.path.split("/").pop() + ".cases.json");
        const result = await new Promise((resolve) => {
          const child = spawn(process.execPath, ["--import", "tsx", test.path], {
            env: {
              ...process.env,
              VILLAGES_TEST_CASES: JSON.stringify(testCases),
              VILLAGES_TEST_CASE_REPORT: caseReport,
              ...(process.env.VILLAGES_SCREENSHOT_DIR
                ? { VILLAGES_SCREENSHOT_DIR: join(directory, test.path.split("/").pop(), "screenshots") }
                : {}),
              ...(process.env.VILLAGES_VISUAL_OUTPUT
                ? { VILLAGES_VISUAL_OUTPUT: join(directory, test.path.split("/").pop(), "visual") }
                : {}),
            },
            windowsHide: true,
            stdio: ["ignore", "pipe", "pipe"],
          });
          children.add(child);
          let output = "",
            spawnError,
            timedOut = false;
          const timer = setTimeout(
            () => {
              timedOut = true;
              child.kill();
            },
            test.group === "regression" ? 120_000 : 300_000,
          );
          child.stdout.on("data", (data) => {
            output += data;
          });
          child.stderr.on("data", (data) => {
            output += data;
          });
          child.on("error", (error) => {
            spawnError = error.message;
          });
          child.on("close", (code, signal) => {
            clearTimeout(timer);
            children.delete(child);
            resolve({
              ...test,
              code: timedOut || spawnError ? 1 : code,
              signal,
              timedOut,
              error: spawnError,
              durationMs: Date.now() - testStart,
              output,
            });
          });
        });
        if (testCases.length && result.code === 0) {
          try {
            const coverage = JSON.parse(await readFile(caseReport, "utf8"));
            if (
              !testCases.every((name) =>
                coverage.completed.some((entry) => caseMatches(entry, name) || caseMatches(name, entry)),
              )
            )
              throw new Error("A requested case did not execute");
            result.cases = coverage.completed;
          } catch (error) {
            result.code = 1;
            result.output += "\nCase coverage verification failed: " + error.message + "\n";
          }
        }
        try {
          const coverage = JSON.parse(await readFile(caseReport, "utf8"));
          result.caseTimings = coverage.timings;
        } catch (error) {
          if (error.code !== "ENOENT") {
            result.code = 1;
            result.output += "\nInvalid case diagnostics: " + error.message + "\n";
          }
        }
        await writeFile(join(directory, test.path.split("/").pop() + ".log"), result.output);
        console.log(`${result.code === 0 ? "PASS" : "FAIL"} ${test.path} (${result.durationMs}ms)`);
        await appendFile(
          progress,
          JSON.stringify({
            at: new Date().toISOString(),
            path: test.path,
            code: result.code,
            durationMs: result.durationMs,
          }) + "\n",
        );
        if (result.code !== 0) {
          console.error(result.output.slice(-3500));
          if (!firstFailure) {
            firstFailure = true;
            await writeFile(
              join(directory, "first-failure.json"),
              JSON.stringify({
                path: test.path,
                at: new Date().toISOString(),
                log: join(directory, test.path.split("/").pop() + ".log"),
              }) + "\n",
            );
            if (process.env.GITHUB_ACTIONS === "true") {
              console.error(
                `::error title=First actionable test failure::${test.path}; remaining coverage is still being collected`,
              );
              if (process.env.GITHUB_STEP_SUMMARY)
                await appendFile(
                  process.env.GITHUB_STEP_SUMMARY,
                  `First failing suite: \`${test.path}\`. Remaining coverage continues; logs identify failures.\n`,
                );
            }
          }
        }
        return { ...result, output: undefined };
      },
    });
    const report = {
      startedAt: new Date(start).toISOString(),
      completedAt: new Date().toISOString(),
      runId,
      group,
      jobs,
      browserJobs,
      host: { ...host, freeMemoryAtEnd: freemem() },
      failFast,
      cases,
      durationMs: Date.now() - start,
      completeInventory: !filter && !selected.length && !cases.length && !results.some((row) => row.skipped),
      passed:
        results.every((result) => result.code === 0) &&
        cases.every((name) =>
          results.some((result) => result.cases?.some((entry) => caseMatches(entry, name) || caseMatches(name, entry))),
        ),
      results,
    };
    await writeFile(join(directory, "report.json"), JSON.stringify(report, null, 2) + "\n");
    // Compatibility pointer for existing tooling; immutable per-run evidence is above.
    await writeFile(join(root, `${group}.json`), JSON.stringify(results, null, 2) + "\n");
    await writeFile(
      join(root, `${group}-latest.json`),
      JSON.stringify({ report: join(directory, "report.json") }, null, 2) + "\n",
    );
    const slowest = [...results]
      .filter((row) => row.durationMs)
      .sort((a, b) => b.durationMs - a.durationMs)
      .slice(0, 5);
    console.log(
      "Slowest suites: " + slowest.map((row) => row.path + " " + (row.durationMs / 1000).toFixed(1) + "s").join(", "),
    );
    console.log(
      `Test report: ${directory}/report.json; wall ${(report.durationMs / 1000).toFixed(1)}s; workers ${jobs}/${browserJobs}`,
    );
    if (!report.passed) process.exitCode = 1;
  } finally {
    process.removeListener("SIGINT", cancel);
    process.removeListener("SIGTERM", cancel);
    await lock.close();
    await unlink(lockPath);
  }
} finally {
  await operation.release();
}
