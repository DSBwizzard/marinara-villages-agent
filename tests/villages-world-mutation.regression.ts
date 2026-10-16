import assert from "node:assert/strict";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageVenue } from "../packages/villages/src/server/domain/models/world.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { normalizeVillageMutation } from "../packages/villages/src/server/domain/rules/world-mutation.js";

// Domain-only aggregate rules with deterministic clocks/IDs; no Engine, storage or providers.
const fresh = defaultVillageState();
const events: string[] = [];
let clock = 0;
const sources = {
  now() {
    events.push("clock");
    return new Date(Date.UTC(2026, 9, 6, 12, clock++));
  },
  seed() {
    events.push("seed");
    return "stable-world-seed";
  },
};
normalizeVillageMutation(
  fresh,
  fresh.seed,
  (state) => {
    events.push("mutation");
    for (const id of ["first", "second"])
      state.exchangeReceipts[id] = {
        id,
        sceneId: "scene",
        submissionId: id,
        domain: "memories",
        at: "",
        evidenceIds: [],
        reason: "Recorded evidence",
        notice: { id, kind: "memory", text: "A recorded memory" },
      };
  },
  sources,
);
assert.deepEqual(events, ["mutation", "clock", "clock", "clock", "clock", "seed"]);
assert.equal(fresh.exchangeReceipts.first.noticeSequence, 1);
assert.equal(fresh.exchangeReceipts.second.noticeSequence, 2);
assert.equal(fresh.exchangeReceipts.first.committedAt, "2026-10-06T12:00:00.000Z");
assert.equal(fresh.exchangeReceipts.second.committedAt, "2026-10-06T12:01:00.000Z");
assert.equal(fresh.foundedAt, "2026-10-06T12:03:00.000Z");
assert.equal(fresh.seed, "stable-world-seed");
events.length = 0;
normalizeVillageMutation(fresh, fresh.seed, () => {}, sources);
assert.deepEqual(events, ["clock"], "existing notice order, founding stamp and seed are never regenerated");
assert.equal(fresh.noticeSequence, 2);
assert.equal(fresh.foundedAt, "2026-10-06T12:03:00.000Z");

function venue(index: number): VillageVenue {
  return {
    id: `venue-${index}`,
    name: `Venue ${index}`,
    classes: ["residence"],
    description: "A usable room",
    category: "",
    spaces: [defaultVenueSpace("residence", "A usable room")],
    presentation: { image: null, x: null, y: null },
    occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
    capabilities: [],
    state: { condition: "standing", upgrades: [], furniture: [], publicFacts: [], updatedAt: "" },
  };
}
const oversizedSave = {
  ...defaultVillageState(),
  foundedAt: fresh.foundedAt,
  seed: fresh.seed,
  venues: Array.from({ length: 17 }, (_, index) => venue(index)),
};
assert.doesNotThrow(
  () =>
    normalizeVillageMutation(
      oversizedSave,
      oversizedSave.seed,
      (state) => {
        state.name = "Renamed";
      },
      sources,
    ),
  "an existing over-capacity save still accepts unrelated edits",
);
events.length = 0;
assert.throws(
  () =>
    normalizeVillageMutation(
      oversizedSave,
      oversizedSave.seed,
      (state) => {
        state.venues.push(venue(18));
      },
      sources,
    ),
  /maximum 16 total/,
);
assert.deepEqual(events, [], "rejected capacity growth never stamps notices or generates identities");
console.log(
  "Village mutation domain passed: deterministic stamp/ID admission, notice order/replay, and existing-save capacity compatibility; no Engine or providers.",
);
