import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { testInventory } from "./test-inventory.mjs";

const args = process.argv.slice(2);
const group = args.find((arg) => !arg.startsWith("--")) ?? "regression";
const inventory = await testInventory();
if (args.includes("--list")) {
  console.log(JSON.stringify(inventory, null, 2));
  process.exit(0);
}
if (!["regression", "browser", "engine", "all"].includes(group)) throw new Error(`Unknown test group: ${group}`);
const filter = args.find((arg) => arg.startsWith("--filter="))?.slice(9);
const tests = inventory.filter(
  (test) => (group === "all" || test.group === group) && (!filter || test.path.includes(filter)),
);
if (!tests.length) throw new Error("No tests matched; validation cannot pass an empty selection.");
await mkdir(".build-tmp/test-results", { recursive: true });
const results = [];
for (const test of tests) {
  const start = Date.now();
  const result = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["--import", "tsx", test.path], {
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    const timer = setTimeout(() => child.kill(), test.group === "regression" ? 120_000 : 300_000);
    child.stdout.on("data", (data) => {
      output += data;
    });
    child.stderr.on("data", (data) => {
      output += data;
    });
    child.on("error", reject);
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      resolve({ ...test, code, signal, durationMs: Date.now() - start, output });
    });
  });
  await writeFile(`.build-tmp/test-results/${test.path.split("/").pop()}.log`, result.output);
  console.log(`${result.code === 0 ? "PASS" : "FAIL"} ${test.path} (${result.durationMs}ms)`);
  if (result.code !== 0) console.error(result.output.slice(-3500));
  results.push({ ...result, output: undefined });
}
await writeFile(`.build-tmp/test-results/${group}.json`, `${JSON.stringify(results, null, 2)}\n`);
if (results.some((result) => result.code !== 0)) process.exitCode = 1;
