import assert from "node:assert/strict";
import { readVenueSceneChange } from "../packages/villages/src/server/domain/rules/venue-scene-state.js";
import type { VillageVenue } from "../packages/villages/src/server/domain/models/world.js";

const venue = {
  zones: [
    { id: "exterior", name: "Exterior", kind: "exterior" },
    { id: "hall", name: "Common Space", kind: "public" },
  ],
  description: "A leaky roof. A teapot on the table.",
  state: { revision: 0, updatedAt: "", recent: null },
} as unknown as VillageVenue;
const change = readVenueSceneChange(
  {
    happened: true,
    narration: "The teapot is moved.",
    expectedRevision: 0,
    recent: { text: "The teapot is in the cupboard." },
  },
  venue,
  "2026-10-28T12:00:00.000Z",
);
assert.equal(change?.recent?.text, "The teapot is in the cupboard.");
for (const change of [
  { recent: { text: 42 } },
  { recent: { text: "x".repeat(601) } },
  { edits: [{ before: "Missing detail", after: "Changed detail" }] },
  { append: "A change.", unsupported: true },
])
  assert.throws(() =>
    readVenueSceneChange(
      { happened: true, narration: "Unsupported.", expectedRevision: 0, ...change },
      venue,
      "2026-10-28T12:00:00.000Z",
    ),
  );
console.log("Scene actions: bounded physical admission passed");
