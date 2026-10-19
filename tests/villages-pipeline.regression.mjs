import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { checkPlan } from "../scripts/check-changed.mjs";
assert.equal(checkPlan(["README.md"]).types, false);
assert.equal(checkPlan(["packages/villages/src/shared/example.ts"]).types, true);
for (const args of [["--filter=does-not-exist"], ["--case=does-not-exist"], ["--reuse"]]) {
  const result = spawnSync(process.execPath, ["scripts/run-tests.mjs", ...args], {
    encoding: "utf8",
    windowsHide: true,
  });
  assert.notEqual(result.status, 0, "Unknown or empty selections must fail");
}
console.log("Focused static checks and invalid test selections passed.");
