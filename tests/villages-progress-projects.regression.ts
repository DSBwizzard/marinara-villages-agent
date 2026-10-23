import assert from "node:assert/strict";
import { fixture, renovation } from "./fixtures/villages-projects.fixture.js";
import {
  reconcileProjectLifecycles,
  PROJECT_DURATION_MS,
} from "../packages/villages/src/server/domain/rules/project-lifecycle-rules.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { wishReceiptRecords } from "../packages/villages/src/server/domain/rules/wish-interpretation-rules.js";
const f = fixture(),
  now = new Date("2026-10-24T00:00:00Z");
const first = await f.newProject("Art Hall", "a", { x: 0.5, y: 0.5 }),
  second = await f.newProject("Garden", "b", { x: 0.8, y: 0.8 }),
  third = await f.newProject("Third", "c", { x: 0.5, y: 0.8 });
assert.equal(f.state().venues.length, 1, "drafts create no live sites");
await assert.rejects(
  f.service.startProjectConstruction(first, { requestId: "stale", expectedRevision: 0 }, now),
  /changed/,
);
const request = f.body(first);
await f.service.startProjectConstruction(first, request, now);
await f.service.startProjectConstruction(first, request, now);
assert.equal(f.state().venues.length, 2, "retry creates exactly one worksite");
assert.equal(Date.parse(f.get(first).lifecycle!.workOrder!.completesAt) - now.getTime(), PROJECT_DURATION_MS);
await f.service.startProjectConstruction(second, f.body(second), now);
await assert.rejects(f.service.startProjectConstruction(third, f.body(third), now), /Two Projects/);
await assert.rejects(f.service.reviseRenovationProject(first, f.body(first)), /before starting/);
await f.mutate((state) => {
  for (const resident of state.villagers) if (resident.agenda) resident.agenda.activeDay = null;
});
await f.mutate((state) => reconcileProjectLifecycles(state, new Date(now.getTime() + PROJECT_DURATION_MS)));
assert.equal(f.get(first).status, "complete", "ordinary schedule changes cannot stop completion");
assert.equal(f.get(second).status, "complete");
assert.equal(f.state().projectWishOutbox.length, 2);
assert.equal(
  wishReceiptRecords(f.state(), "a").filter((receipt) => receipt.completedProject).length,
  2,
  "current completion supplies factual Wish evidence",
);
await f.mutate((state) => reconcileProjectLifecycles(state, new Date(now.getTime() + PROJECT_DURATION_MS * 2)));
assert.equal(f.state().projectWishOutbox.length, 2, "completion is exactly once");
assert.equal(f.state().progressTasks.length, 0, "Projects do not create old progress tasks");
const r = await renovation(f),
  r2 = await renovation(f, { capacity: 4 });
await f.agree(r);
await f.agree(r2, "b");
await f.service.startProjectConstruction(r, f.body(r), now);
await assert.rejects(f.service.startProjectConstruction(r2, f.body(r2), now), /Venue already/);
const before = structuredClone(f.state().venues.find((venue) => venue.id === "cafe"));
await f.service.cancelProject(r, f.body(r));
assert.deepEqual(
  f.state().venues.find((venue) => venue.id === "cafe"),
  before,
  "cancel never applies a Renovation",
);
await f.mutate((state) => reconcileProjectLifecycles(state, new Date(now.getTime() + PROJECT_DURATION_MS * 3)));
assert.equal(f.get(r).status, "cancelled");
assert.equal(coerceVillageState(undefined).version, 3);
for (const old of [{ version: 2 }, {}, { version: 0 }])
  assert.throws(() => coerceVillageState(old), /Unsupported Village format/);
const fresh = defaultVillageState();
assert.deepEqual(coerceVillageState(fresh).projects, []);
console.log("Fresh Project lifecycle, atomic starts, deadlines, cancellation and format checks passed.");
