import assert from "node:assert/strict";
import type { VillageVenue } from "../packages/villages/src/server/domain/models/world.js";
import { readVenueSceneChange } from "../packages/villages/src/server/domain/rules/venue-scene-state.js";

const venue: VillageVenue = {
  id: "room",
  name: "Common room",
  description: "A shared room",
  category: "gathering",
  presentation: { image: null, x: null, y: null },
  occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
  capabilities: [],
  state: { condition: "tidy", upgrades: [], furniture: ["book", "cupcake"], publicFacts: [], updatedAt: "" },
};
const before = structuredClone(venue);
assert.equal(readVenueSceneChange(null, venue), null);
assert.equal(readVenueSceneChange({ happened: "true", narration: "A book moves.", removeItem: "book" }, venue), null);
const reject = (value: unknown, place: VillageVenue | undefined = venue, presentIds: string[] = []) =>
  assert.throws(() => readVenueSceneChange(value, place, presentIds, ["resident"]), /could not record/);
reject({ happened: true, narration: "", removeItem: "book" });
reject({ happened: true, narration: "A claimed action happened." });
reject({ happened: true, narration: "The missing key is taken.", removeItem: "key" });
reject({ happened: true, narration: "The stain is gone.", resolveTraceId: "missing" });
reject({ happened: true, narration: "A note is left.", traceKind: "note", traceText: "For the resident" });
assert.throws(
  () => readVenueSceneChange({ happened: true, narration: "The book moves.", removeItem: "book" }, undefined),
  /could not record/,
);
reject({ happened: true, narration: "The cupcake is given away.", removeItem: "cupcake", transferTo: "resident" });
reject({ happened: true, narration: "The room is rearranged.", conditionBefore: "messy", conditionAfter: "tidy" });
reject({ happened: true, narration: "Something changes.", traceKind: "invalid kind", traceText: "a trace" });
reject({ happened: true, narration: "Something changes.", traceKind: "open-window", traceText: "" });
assert.deepEqual(
  readVenueSceneChange(
    { happened: true, narration: "The room is cleaned.", conditionBefore: "tidy", conditionAfter: "clean" },
    venue,
  ),
  { narration: "The room is cleaned.", conditionBefore: "tidy", conditionAfter: "clean" },
);
assert.deepEqual(
  readVenueSceneChange(
    { happened: true, narration: "The book is put in the cupboard.", removeItem: "book", addItem: "book in cupboard" },
    venue,
  ),
  { narration: "The book is put in the cupboard.", addItem: "book in cupboard", removeItem: "book" },
);
assert.deepEqual(
  readVenueSceneChange(
    {
      happened: true,
      narration: "The cupcake is handed to the resident.",
      removeItem: "cupcake",
      transferTo: "resident",
    },
    venue,
    ["resident"],
  ),
  { narration: "The cupcake is handed to the resident.", removeItem: "cupcake", transferTo: "resident" },
);
assert.equal(
  readVenueSceneChange(
    { happened: true, narration: "The player picks up the book.", removeItem: "book", transferTo: "player" },
    venue,
  )?.transferTo,
  "player",
);
assert.equal(
  readVenueSceneChange(
    { happened: true, narration: "The window opens.", traceKind: "open-window", traceText: "an open window" },
    venue,
  )?.traceKind,
  "open-window",
);
assert.equal(
  readVenueSceneChange(
    {
      happened: true,
      narration: "A note is left.",
      traceKind: "note",
      traceText: "For the resident",
      recipientId: "resident",
    },
    venue,
    [],
    ["resident"],
  )?.recipientId,
  "resident",
  "note addressing does not invent a present transfer recipient",
);
assert.deepEqual(venue, before, "admission never mutates the source Venue");
console.log("villages-venue-entry: current Scene physical admission passed; no Engine or providers.");
