import { venueFixture } from "./helpers/venues.fixture.js";
import assert from "node:assert/strict";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  defaultVenueSpace,
  venueCapacity,
  validVenueClasses,
} from "../packages/villages/src/server/domain/rules/venue-model.js";
import { venueInZone } from "../packages/villages/src/server/domain/rules/venue-zones.js";
import { initializeRoomContinuity } from "../packages/villages/src/server/domain/rules/native-continuity.js";
import { observableRoomDescription } from "../packages/villages/src/server/domain/rules/zone-picture.js";
import { acceptNarration } from "../packages/villages/src/server/domain/rules/narration-native.js";
import {
  fittedNarrationReadset,
  narrationContinuityContext,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { sceneryPrompt } from "../packages/villages/src/server/domain/rules/scenery-context.js";
import {
  MAX_IMAGE_PROMPT_LENGTH,
  readPrompt,
} from "../packages/villages/src/server/domain/rules/image-generation-rules.js";
import { MAX_VENUE_DESCRIPTION_LENGTH } from "../packages/villages/src/server/domain/rules/prompt-preset.js";
assert.equal(validVenueClasses(["residence", "workplace"]), true);
assert.equal(validVenueClasses(["residence", "workplace", "community"]), false);
assert.equal(validVenueClasses(["residence", "residence"]), false);
const residence = defaultVenueSpace("residence", "A curtained sleeping alcove with a bed.");
const workplace = defaultVenueSpace("workplace", "An oil-stained repair bench with a lathe.");
workplace.image = { id: "work-image", ref: "global-gallery:work-image", url: "/work.webp" };
const at = "2026-10-28T12:00:00.000Z";
const state = coerceVillageState({
  ...defaultVillageState(),
  seed: "rolling-workshop",
  setupAt: at,
  foundedAt: at,
  villagers: [
    {
      letterFontId: "caveat",
      characterId: "bob",
      incarnation: "bob-incarnation",
      addedAt: "2026-10-28T12:00:00.000Z",
      cardSnapshot: {
        id: "bob",
        name: "Bob",
        revision: 1,
        sourceStatus: "available",
        capturedAt: "2026-10-28T12:00:00.000Z",
      },
    },
  ],
  venues: [
    venueFixture({
      id: "shop",
      name: "The Rolling Workshop",
      classes: ["residence", "workplace"],
      layoutVersion: 1,
      zones: [
        {
          ...defaultVenueSpace("other", "A vehicle parked by the road. A gate."),
          id: "exterior",
          kind: "exterior",
          name: "Exterior",
          seen: true,
        },
        { ...residence, id: "residence", kind: "shared-residence", name: "Room", seen: true },
        { ...workplace, id: "workplace", kind: "public", name: "Workshop", seen: true },
        {
          ...defaultVenueSpace("residence", "Bob's private nook. A letter on the desk."),
          id: "private:bob",
          ownerId: "bob",
          kind: "private-residence",
          name: "Nook",
          seen: true,
        },
      ],
      presentation: { image: null, x: 0.3, y: 0.4 },
      description: "A vehicle parked by the road. A gate.",
      occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
      residenceCapacity: 2,
      residentIds: ["bob"],
    }),
  ],
});
const venue = state.venues[0];
assert.match(venueInZone(venue, "residence").description, /bed/);
assert.match(venueInZone(venue, "workplace").description, /lathe/);
assert.equal(venueInZone(venue, "workplace").presentation.image?.id, "work-image");
assert.equal(venueCapacity(venue), 2);
assert.match(venueInZone(venue, "exterior").description, /gate/);
assert.match(venueInZone(venue, "private:bob").description, /letter/);
assert.doesNotMatch(venueInZone(venue, "exterior").description, /private/);
venue.access!.managerIds = ["player"];
for (const zone of venue.zones!) initializeRoomContinuity(state, venue.id, zone.id, zone.description, "workshop", at);
const appearance = (zoneId: string, authority = state) => observableRoomDescription(authority, venue.id, zoneId, at);
const interiorIds = venue.zones!.filter((zone) => zone.kind !== "exterior").map((zone) => zone.id);
const oldInside = interiorIds.map((id) => appearance(id));
const scene = zoneEventScene(
  coerceSession({
    version: 5,
    id: "outside-action",
    villageSeed: state.seed,
    placeId: venue.id,
    zoneId: "exterior",
    status: "active",
    startedAt: at,
    sceneAttendance: { capturedAt: at, layout: captureSceneLayout(venue), occupants: [] },
  }),
  venue,
);
const context = narrationContinuityContext(state, scene, venue, "turn", "I put a sign beside the gate.", at);
const raw = {
  segments: [{ id: "sign", kind: "narration", text: "The sign is planted beside the gate.", requires: ["room"] }],
  keep: [
    {
      id: "room",
      for: "room",
      text: "A sign beside the gate.",
      source: [{ segment: "sign", perceive: { kind: "seen", by: ["player"] } }],
    },
  ],
};
const publication = {
  raw,
  responseDigest: memoryHash(raw),
  readset: fittedNarrationReadset(
    state,
    context,
    context.parts.flatMap(({ block }) => block.evidenceId ?? []),
  ),
};
const result = acceptNarration(state, publication, "turn", at);
assert.equal(result.held, false, JSON.stringify(result.rejected));
assert.match(appearance("exterior"), /A sign beside the gate/);
assert.deepEqual(
  interiorIds.map((id) => appearance(id)),
  oldInside,
  "an exterior change preserves every interior",
);
const decoded = coerceVillageState(JSON.parse(JSON.stringify(state)));
assert.deepEqual(decoded.venues[0].classes, ["residence", "workplace"]);
assert.equal(venueCapacity(decoded.venues[0]), 2);
assert.deepEqual(coerceVillageState(JSON.parse(JSON.stringify(decoded))), decoded);
assert.equal(appearance("exterior", decoded), appearance("exterior"));
assert(acceptNarration(decoded, publication, "turn", at).replayed);

const longDescription = "x".repeat(MAX_VENUE_DESCRIPTION_LENGTH - "FINAL DETAIL".length) + "FINAL DETAIL";
const longVenue = structuredClone(decoded);
longVenue.venues[0].zones!.find((zone) => zone.id === "workplace")!.description = longDescription;
assert.equal(venueInZone(coerceVillageState(longVenue).venues[0], "workplace").description, longDescription);
longVenue.venues[0].zones!.find((zone) => zone.id === "workplace")!.description += "x";
assert.throws(() => coerceVillageState(longVenue), /at most/);
const prompt = sceneryPrompt(["A single room, no people."], [], "Watercolor", ["Physical account: " + longDescription]);
assert(prompt.includes(longDescription));
assert(prompt.length < MAX_IMAGE_PROMPT_LENGTH);
assert.equal(readPrompt("x".repeat(MAX_IMAGE_PROMPT_LENGTH)).length, MAX_IMAGE_PROMPT_LENGTH);
assert.throws(() => readPrompt("x".repeat(MAX_IMAGE_PROMPT_LENGTH + 1)), /at most/);
