import assert from "node:assert/strict";
import { readVenueActionResult } from "../packages/villages/src/server/features/venues/venue-actions.js";

assert.deepEqual(readVenueActionResult(null), { happened: false, narration: "Nothing changes here." });
assert.deepEqual(
  readVenueActionResult({ happened: "true", narration: "Ada left the parcel on the table." }),
  { happened: false, narration: "Ada left the parcel on the table." },
  "a model's string claim cannot become evidence",
);
assert.deepEqual(
  readVenueActionResult({ happened: true, narration: "" }),
  { happened: false, narration: "Nothing changes here." },
  "an empty result cannot become a village happening",
);
assert.deepEqual(
  readVenueActionResult({ happened: true, narration: "Ada left the parcel on the table." }),
  { happened: true, narration: "Ada left the parcel on the table." },
  "a completed action can be recorded as evidence for a later Wish claim",
);
assert.deepEqual(
  readVenueActionResult(
    {
      happened: true,
      narration: "Ada moved the book into the cupboard.",
      removeItem: "book",
      addItem: "book in cupboard",
    },
    ["book", "cupboard"],
  ),
  {
    happened: true,
    narration: "Ada moved the book into the cupboard.",
    removeItem: "book",
    addItem: "book in cupboard",
  },
  "a successful action can update the venue's item list",
);
assert.deepEqual(
  readVenueActionResult({ happened: true, narration: "Ada took the key.", removeItem: "key" }, ["book"]),
  { happened: false, narration: "That item is not here." },
  "the model cannot remove an item the place does not contain",
);

console.log("villages-venue-entry: ok");
