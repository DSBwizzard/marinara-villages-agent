import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const selected = process.argv.slice(2);
if (selected.some((arg) => !arg.startsWith("--test="))) throw new Error("Use explicit --test inventory paths");
const tests = selected.length
  ? selected
  : [
      "villages-test-scheduler.regression.mjs",
      "villages-checkout-operation.regression.mjs",
      "villages-scene-action-lifetimes.e2e.mjs",
      "villages-settings-navigation.e2e.mjs",
      "villages-venue-layout.e2e.mjs",
    ].map((name) => "--test=tests/" + name);
const reports = [];
for (const jobs of [1, 4]) {
  execFileSync(process.execPath, [join(root, "scripts/run-tests.mjs"), "review", ...tests, "--jobs=" + jobs], {
    cwd: root,
    stdio: "inherit",
  });
  const latest = JSON.parse(await readFile(join(root, ".build-tmp/test-results/review-latest.json"), "utf8"));
  reports.push(JSON.parse(await readFile(resolve(root, latest.report), "utf8")));
}
assert.ok(reports.every((report) => report.passed));
assert.deepEqual(
  reports[0].results.map(({ path, code }) => ({ path, code })),
  reports[1].results.map(({ path, code }) => ({ path, code })),
  "serial/parallel selection and outcomes must match",
);
const result = {
  passed: true,
  platform: process.platform,
  selected: tests,
  serialMs: reports[0].durationMs,
  parallelMs: reports[1].durationMs,
  reports: reports.map(({ runId }) => runId),
};
const path = join(root, ".build-tmp/test-results/parity-" + randomUUID() + ".json");
await writeFile(path, JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify({ ...result, report: path }));
