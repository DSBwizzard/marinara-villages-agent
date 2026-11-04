import assert from "node:assert/strict";
import type { VillageVenue } from "../packages/villages/src/server/domain/models/world.js";
import { readVenueSceneChange } from "../packages/villages/src/server/domain/rules/venue-scene-state.js";
const at = "2026-10-28T12:00:00.000Z";
const venue = {
  id: "room",
  description: "White walls. A window. A table.",
  state: { revision: 4, updatedAt: at, recent: null },
} as VillageVenue;
const before = structuredClone(venue);
assert.equal(readVenueSceneChange(null, venue, at), null);
for (const value of [
  { happened: "true", narration: "Moved.", expectedRevision: 4, append: "Shelves." },
  { happened: true, narration: "", expectedRevision: 4, append: "Shelves." },
  { happened: true, narration: "Unchanged.", expectedRevision: 4 },
  { happened: true, narration: "Stale.", expectedRevision: 3, append: "Shelves." },
  ...["featureId", "conditionAfter", "addItem", "removeItem", "traceText"].map((key) => ({
    happened: true,
    narration: "Legacy.",
    expectedRevision: 4,
    [key]: "old",
  })),
])
  assert.throws(() => readVenueSceneChange(value, venue, at));
assert.throws(() => readVenueSceneChange({ happened: true }, undefined, at), /no longer/);
const update = {
  narration: "Shelves installed.",
  expectedRevision: 4,
  append: "Shelves are installed beside the window.",
};
assert.deepEqual(readVenueSceneChange({ happened: true, ...update }, venue, at), update);
const temporary = {
  narration: "Tea laid out.",
  expectedRevision: 4,
  recent: { text: "Cups and a teapot on the table." },
};
assert.deepEqual(readVenueSceneChange({ happened: true, ...temporary }, venue, at), temporary);
assert.deepEqual(venue, before, "admission never mutates current physical truth");
