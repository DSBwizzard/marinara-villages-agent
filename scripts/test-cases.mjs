import { writeFileSync } from "node:fs";

const filters = JSON.parse(process.env.VILLAGES_TEST_CASES ?? "[]");
const completed = [];
const timings = [];
let recording = false;
export function caseMatches(name, filter) {
  return name === filter || name.startsWith(filter + "/");
}
export function wantsCase(name) {
  return !filters.length || filters.some((filter) => caseMatches(name, filter) || caseMatches(filter, name));
}
export async function runCase(name, action) {
  if (!recording) {
    recording = true;
    process.once("beforeExit", recordCompletion);
  }
  if (!wantsCase(name)) return;
  const started = performance.now();
  let passed = false;
  try {
    await action();
    completed.push(name);
    passed = true;
  } finally {
    timings.push({ name, durationMs: Math.round(performance.now() - started), passed });
  }
}
function recordCompletion() {
  if (filters.length && !completed.length) {
    process.stderr.write("No requested test case executed. Case filters cannot silently pass.\n");
    process.exitCode = 1;
  }
  if (process.env.VILLAGES_TEST_CASE_REPORT)
    writeFileSync(process.env.VILLAGES_TEST_CASE_REPORT, JSON.stringify({ filters, completed, timings }) + "\n");
}
