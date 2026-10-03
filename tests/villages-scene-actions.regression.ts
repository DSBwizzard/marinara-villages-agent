import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  readPlayerMovement,
  movementTransition,
} from "../packages/villages/src/engine/packages/server/src/services/villages/venue-movement.js";
import { readVenueSceneChange } from "../packages/villages/src/engine/packages/server/src/services/villages/venue-scene-state.js";
import { defaultVillageNarrationStyle } from "../packages/villages/src/engine/packages/server/src/services/villages/narration-style.js";
import type { VillageVenue } from "../packages/villages/src/engine/packages/server/src/services/villages/types.js";

const samples = JSON.parse(
  readFileSync(new URL("./fixtures/villages-scene-actions.samples.json", import.meta.url), "utf8"),
);
const venue = {
  zones: [
    { id: "exterior", name: "Exterior", kind: "exterior" },
    { id: "hall", name: "Common Space", kind: "public" },
  ],
  state: { condition: "leaky", furniture: ["teapot"], features: [], publicFacts: [], traces: [] },
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
for (const transferTo of ["player", "tina"]) {
  const change = readVenueSceneChange(
    { happened: true, narration: "The teapot is handed over.", removeItem: "teapot", transferTo },
    venue,
    ["tina"],
    ["tina", "bob"],
  );
  assert.equal(change?.transferTo, transferTo);
}
for (const change of [
  { removeItem: "missing", transferTo: "player" },
  { removeItem: "teapot", transferTo: "remote" },
  { transferTo: "tina" },
  { traceKind: "note", traceText: "Hello" },
])
  assert.throws(() => readVenueSceneChange({ happened: true, narration: "Unsupported.", ...change }, venue, ["tina"]));
console.log(
  "Scene actions: labeled movement, nomination binding, six writing styles and transfer/trace validation passed",
);
