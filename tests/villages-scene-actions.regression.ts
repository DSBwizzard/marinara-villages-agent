import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readPlayerMovement, movementTransition } from "../packages/villages/src/server/domain/rules/venue-movement.js";
import { readVenueSceneChange } from "../packages/villages/src/server/domain/rules/venue-scene-state.js";
import { defaultVillageNarrationStyle } from "../packages/villages/src/server/domain/rules/narration-style.js";
import type { VillageVenue } from "../packages/villages/src/server/domain/models/world.js";

const samples = JSON.parse(
  readFileSync(new URL("./fixtures/villages-scene-actions.samples.json", import.meta.url), "utf8"),
);
const venue = {
  zones: [
    { id: "exterior", name: "Exterior", kind: "exterior" },
    { id: "hall", name: "Common Space", kind: "public" },
  ],
  description: "A leaky roof. A teapot on the table.",
  state: { revision: 0, updatedAt: "", recent: null },
} as unknown as VillageVenue;
for (const row of samples.movement) {
  // The local path never makes a model request. The optional nomination is independently bound to player words.
  if (row.clarify) assert.throws(() => readPlayerMovement(row.text, venue, row.nomination), undefined, row.label);
  else assert.equal(readPlayerMovement(row.text, venue, row.nomination)?.zoneId ?? null, row.zoneId, row.label);
}
const ambiguous = structuredClone(venue);
for (const text of ["I go outside and say hello", "I enter Common Space then pour tea"])
  assert.throws(() => readPlayerMovement(text, venue), /separately/);
ambiguous.zones!.push({ ...ambiguous.zones![1]!, id: "other-hall" });
assert.throws(() => readPlayerMovement("I walk to Common Space", ambiguous), /one exact Zone/);
for (const person of ["first", "second", "third"] as const)
  for (const tense of ["present", "past"] as const) {
    const line = movementTransition(
      "Exterior",
      "Common Space",
      { ...defaultVillageNarrationStyle(), person, tense },
      "Alex",
    );
    const subject = person === "first" ? "I" : person === "second" ? "You" : "Alex";
    const verb = tense === "past" ? "moved" : person === "third" ? "moves" : "move";
    assert.equal(line, `${subject} ${verb} from Exterior to Common Space.`);
  }
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
console.log("Scene actions: movement, writing styles and bounded physical admission passed");
