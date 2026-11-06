import assert from "node:assert/strict";
import type { InterpretationBatch } from "../packages/villages/src/server/domain/models/interpretation-model.js";
import { applyInterpretedRoomEvents } from "../packages/villages/src/server/domain/rules/scene-room-application.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { venueFixture } from "./helpers/venues.fixture.js";

const village = defaultVillageState();
const venue = venueFixture({
  id: "home",
  residentIds: ["aqua"],
  classes: ["residence"],
  zones: [
    { ...defaultVenueSpace("residence"), id: "exterior", kind: "exterior", name: "Entrance" },
    { ...defaultVenueSpace("residence"), id: "bedroom", kind: "private-residence", ownerId: "aqua", name: "Bedroom" },
  ],
});
village.venues = [venue];
const batch: InterpretationBatch = {
  checks: [
    {
      id: "current-invitation",
      domain: "room",
      question: "Current invitation",
      facts: { actorId: "aqua", venueId: "home", zoneId: "bedroom", semanticVersion: 2, accompanies: true },
      outcomes: [{ id: "invite-now", statement: "Current entry invitation" }],
      evidence: [{ id: "answer", speakerId: "aqua", name: "Aqua", content: "Come in with me.", current: true }],
    },
  ],
  results: [{ outcome: "invite-now", source: "gm", evidenceIds: ["answer"], reason: "Current witnessed invitation" }],
};
function freshScene() {
  return coerceSession({ version: 3, id: "same-scene", placeId: "home", zoneId: "exterior", semanticVersion: 2 });
}
const scene = freshScene(),
  ledger = structuredClone(venue.access);
applyInterpretedRoomEvents(scene, batch, village);
assert.equal(scene.id, "same-scene");
assert.equal(scene.zoneId, "exterior", "An entry offer does not move the player");
assert.deepEqual(scene.grantedZoneIds, ["bedroom"]);
assert.deepEqual(scene.entryOffers, [{ zoneId: "bedroom", label: "Bedroom", controllerId: "aqua", accompanies: true }]);
assert.deepEqual(venue.access, ledger, "The native access receipt is settled separately");
for (const kind of ["actor", "noncurrent", "uncited"] as const) {
  const rejected = freshScene(),
    invalid = structuredClone(batch);
  if (kind === "actor") (invalid.checks[0].facts as { actorId: string }).actorId = "stranger";
  if (kind === "noncurrent") invalid.checks[0].evidence[0].current = false;
  if (kind === "uncited") invalid.results[0].evidenceIds = [];
  applyInterpretedRoomEvents(rejected, invalid, village);
  assert.equal(rejected.entryOffers?.length ?? 0, 0, kind);
  assert.equal(rejected.grantedZoneIds?.length ?? 0, 0, kind);
}
