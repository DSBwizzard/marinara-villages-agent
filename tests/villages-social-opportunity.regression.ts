import assert from "node:assert/strict";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { residentPlanningOpportunity } from "../packages/villages/src/server/domain/rules/resident-planning.js";
import { deriveVillageMoment } from "../packages/villages/src/server/domain/rules/village-clock.js";

const state = defaultVillageState();
state.seed = "social-opportunity";
state.venues = [{ id: "commons", classes: ["workplace"], occupancy: {} }] as any;
state.villagers = ["ada", "ben"].map((characterId) => ({
  characterId,
  cardSnapshot: { name: characterId },
  wishes: [],
  agenda: { day: [] },
})) as any;
const now = new Date("2026-10-26T17:00:00.000Z");
const moment = deriveVillageMoment({ foundedAt: now.toISOString(), seed: state.seed, now });
const opportunity = () => residentPlanningOpportunity(state, moment, now.toISOString())!;
assert.equal(
  opportunity().kind,
  "routine",
  "An available resident is a social opportunity without a physical encounter",
);
assert.deepEqual(opportunity().actorIds, ["ada"]);
state.eventAttempts = {
  highWaterDate: "2026-10-26",
  lastAttemptAt: now.toISOString(),
  attempts: [{ id: "first", date: "2026-10-26", at: now.toISOString() }],
};
assert.deepEqual(
  opportunity().actorIds,
  ["ben"],
  "Fallback contact consideration rotates rather than always choosing the first resident",
);
assert.equal(opportunity().kind, "routine", "Different residents are never asserted to share a Zone");
assert.equal(opportunity().venueId, "", "No current location is invented for an available correspondent");
state.villagers = [];
state.venues = [{ id: "commons", classes: ["workplace"], occupancy: {} }] as any;
assert.equal(opportunity(), null, "Weather alone does not admit paid resident activity");
console.log("Resident fallback opportunities, rotation and weather-only classification passed.");
