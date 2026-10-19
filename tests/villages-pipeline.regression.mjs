import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { checkPlan } from "../scripts/check-changed.mjs";
assert.equal(checkPlan(["README.md"]).types, false);
assert.equal(checkPlan(["packages/villages/src/shared/example.ts"]).types, true);
for (const args of [
  ["--filter=does-not-exist"],
  ["--case=does-not-exist"],
  ["--reuse"],
  ["--shard=0/2"],
  ["--shard="],
]) {
  const result = spawnSync(process.execPath, ["scripts/run-tests.mjs", ...args], {
    encoding: "utf8",
    windowsHide: true,
  });
  assert.notEqual(result.status, 0, "Unknown or empty selections must fail");
}
console.log("Focused static checks and invalid test selections passed.");

const list = (...args) => {
  const result = spawnSync(process.execPath, ["scripts/run-tests.mjs", "browser", "--list", ...args], {
    encoding: "utf8",
    windowsHide: true,
  });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout).map((row) => row.path);
};
const full = list();
const first = list("--shard=1/2"),
  second = list("--shard=2/2");
assert.equal(new Set([...first, ...second]).size, first.length + second.length, "Partitions cannot overlap");
assert.deepEqual([...first, ...second].sort(), full, "Fixed partitions must include every browser suite");
