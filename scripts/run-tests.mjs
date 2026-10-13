import { acquireCheckoutOperation } from "./checkout-operation.mjs";
import { mkdir, writeFile, open, unlink } from "node:fs/promises";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { testInventory } from "./test-inventory.mjs";
import { scheduleTests } from "./test-scheduler.mjs";

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
const jobs = Number(args.find((arg) => arg.startsWith("--jobs="))?.slice(7) ?? 4);
const browserJobs = Number(args.find((arg) => arg.startsWith("--browser-jobs="))?.slice(15) ?? Math.min(2, jobs));
for (const arg of args) {
  if (
    arg !== group &&
    arg !== "--list" &&
    !["--filter=", "--test=", "--jobs=", "--browser-jobs="].some((prefix) => arg.startsWith(prefix))
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
const tests = inventory.filter(
  (test) =>
    (group === "all" || (group === "review" ? test.group !== "engine" : test.group === group)) &&
    (!filter || test.path.includes(filter)) &&
    (!selected.length || selected.includes(test.path)),
);
if (!tests.length) throw new Error("No tests matched; validation cannot pass an empty selection.");
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
    const results = await scheduleTests(tests, {
      jobs,
      browserJobs,
      async run(test) {
        if (cancelled) return { ...test, code: 1, signal: "cancelled", durationMs: 0 };
        const testStart = Date.now();
        const result = await new Promise((resolve) => {
          const child = spawn(process.execPath, ["--import", "tsx", test.path], {
            env: {
              ...process.env,
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
        await writeFile(join(directory, test.path.split("/").pop() + ".log"), result.output);
        console.log(`${result.code === 0 ? "PASS" : "FAIL"} ${test.path} (${result.durationMs}ms)`);
        if (result.code !== 0) console.error(result.output.slice(-3500));
        return { ...result, output: undefined };
      },
    });
    const report = {
      runId,
      group,
      jobs,
      browserJobs,
      durationMs: Date.now() - start,
      completeInventory: !filter && !selected.length,
      passed: results.every((result) => result.code === 0),
      results,
    };
    await writeFile(join(directory, "report.json"), JSON.stringify(report, null, 2) + "\n");
    // Compatibility pointer for existing tooling; immutable per-run evidence is above.
    await writeFile(join(root, `${group}.json`), JSON.stringify(results, null, 2) + "\n");
    await writeFile(
      join(root, `${group}-latest.json`),
      JSON.stringify({ report: join(directory, "report.json") }, null, 2) + "\n",
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
