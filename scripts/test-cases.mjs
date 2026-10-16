import { writeFileSync } from "node:fs";

const filters = JSON.parse(process.env.VILLAGES_TEST_CASES ?? "[]");
const completed = [];
export function caseMatches(name, filter) {
  return name === filter || name.startsWith(filter + "/");
}
export function wantsCase(name) {
  return !filters.length || filters.some((filter) => caseMatches(name, filter) || caseMatches(filter, name));
}
export async function runCase(name, action) {
  if (!wantsCase(name)) return;
  await action();
  completed.push(name);
}
process.once("beforeExit", () => {
  if (filters.length && !completed.length) {
    process.stderr.write("No requested test case executed. Case filters cannot silently pass.\n");
    process.exitCode = 1;
  }
  if (process.env.VILLAGES_TEST_CASE_REPORT)
    writeFileSync(process.env.VILLAGES_TEST_CASE_REPORT, JSON.stringify({ filters, completed }) + "\n");
});
