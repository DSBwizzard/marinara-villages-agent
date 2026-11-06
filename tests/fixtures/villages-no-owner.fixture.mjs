import assert from "node:assert/strict";
import {
  activationScope,
  createActivationBinding,
} from "../../packages/villages/src/server/adapters/engine/activation-scope.js";
import { configureVillagesRuntime } from "../../packages/villages/src/server/entry/runtime.js";

import { context } from "../../packages/villages/src/server/adapters/operations/operation-context.js";
import { backgroundCalls } from "../../packages/villages/src/server/adapters/operations/background-context.js";
import { active } from "../../packages/villages/src/server/adapters/observability/metrics-context.js";
import { readUsageLedger } from "../../packages/villages/src/server/adapters/models/usage-ledger.js";
import { readRuntimeDebug } from "../../packages/villages/src/server/adapters/observability/runtime-debug.js";
import { ensureVillagesGalleryFolder } from "../../packages/villages/src/server/adapters/engine/global-gallery.js";
import { readNativeScheduleSnapshot } from "../../packages/villages/src/server/adapters/engine/native-schedules.js";

assert.equal(activationScope(), undefined);
for (const api of [
  context.getStore,
  backgroundCalls.getStore,
  readUsageLedger,
  readRuntimeDebug,
  ensureVillagesGalleryFolder,
])
  assert.throws(api, /not configured/);
await assert.rejects(readNativeScheduleSnapshot(new Date()), /not configured/);
assert.equal(active.getStore(), undefined, "unowned diagnostics have no counters");
assert.throws(() => active.run({}, () => {}), /not configured/);
const binding = createActivationBinding("Missing owned service");
assert.throws(() => binding.configure({}), /explicit Villages activation/);
assert.throws(binding.get, /Missing owned service/);
let hostReads = 0;
const host = new Proxy(
  {},
  {
    get() {
      hostReads++;
      throw Error("Unowned host access");
    },
  },
);
assert.throws(() => configureVillagesRuntime(host), /explicit Villages activation/);
assert.equal(hostReads, 0, "Unowned configuration performs no host reads or registrations");
console.log("Unowned runtime and service configuration refused without host access.");
