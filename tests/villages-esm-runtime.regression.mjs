import assert from "node:assert/strict";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { villagesDocuments } from "../packages/villages/src/server/adapters/engine/runtime-host.js";
import {
  coordinateVenue,
  coordinatedCompletion,
  venueCheckpoint,
  readVenueOperation,
  stopVenueCoordinator,
  venueOperationId,
  assertVenueOwnership,
} from "../packages/villages/src/server/jobs/venue-coordinator.js";

// Named ESM imports must select the same bindings that TypeScript entry assembly registered.
const rows = new Map([
  [
    "villages-venue-visit-esm",
    { id: "villages-venue-visit-esm", revision: 1, data: { sceneRevision: 0, status: "active" } },
  ],
]);
const documents = {
  async getById(_package, id) {
    return structuredClone(rows.get(id) ?? null);
  },
  async update(input) {
    const row = rows.get(input.id);
    if (row?.revision !== input.expectedRevision) return null;
    const next = { ...row, ...structuredClone(input), revision: row.revision + 1 };
    rows.set(input.id, next);
    return structuredClone(next);
  },
};
const logger = { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} };
const release = configureVillagesRuntime({ persistence: { documents }, logger, isDebugAgentsEnabled: () => false });
let providerCalls = 0;
try {
  assert.equal((await villagesDocuments().getById("villages", "villages-venue-visit-esm")).revision, 1);
  const work = () =>
    venueCheckpoint("reply", () =>
      coordinatedCompletion("esm-reply", async () => {
        providerCalls++;
        assert.equal(venueOperationId(), "esm-submission");
        assertVenueOwnership(rows.get("villages-venue-visit-esm").data);
        return "saved reply";
      }),
    );
  assert.equal(
    await coordinateVenue("esm", "esm-submission", "turn", { message: "fixture" }, 0, undefined, work),
    "saved reply",
  );
  assert.equal((await readVenueOperation("esm")).status, "complete");
  assert.equal(providerCalls, 1, "entry assembly dispatches through the source ESM coordinator exactly once");
  await stopVenueCoordinator();
  console.log("ESM source imports share runtime, coordinator and Scene context bindings registered by entry assembly.");
} finally {
  release();
}
