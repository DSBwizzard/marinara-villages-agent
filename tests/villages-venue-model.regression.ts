import assert from "node:assert/strict";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { applyVenueSceneChange } from "../packages/villages/src/server/domain/rules/venue-scene-state.js";
import {
  defaultVenueSpace,
  venueCapacity,
  venueInArea,
  venueInSpace,
  validVenueClasses,
} from "../packages/villages/src/server/domain/rules/venue-model.js";
assert.equal(validVenueClasses(["residence", "workplace"]), true);
assert.equal(validVenueClasses(["residence", "workplace", "community"]), false);
assert.equal(validVenueClasses(["residence", "residence"]), false);
const residence = defaultVenueSpace("residence", "A curtained sleeping alcove with a bed.");
const workplace = defaultVenueSpace("workplace", "An oil-stained repair bench with a lathe.");
workplace.image = { id: "work-image", ref: "global-gallery:work-image", url: "/work.webp" };
const state = coerceVillageState({
  ...defaultVillageState(),
  villagers: [
    {
      characterId: "bob",
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
    {
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
      privateSpaces: [
        {
          ...defaultVenueSpace("residence", "Bob's private nook. A letter on the desk."),
          id: "private:bob",
          ownerId: "bob",
        },
      ],
    },
  ],
});
const venue = state.venues[0];
assert.match(venueInSpace(venue, "residence").description, /bed/);
assert.match(venueInSpace(venue, "workplace").description, /lathe/);
assert.equal(venueInSpace(venue, "workplace").presentation.image?.id, "work-image");
assert.equal(venueCapacity(venue), 2);
assert.match(venueInArea(venue, "outside", "residence").description, /gate/);
assert.match(venueInArea(venue, "private", "residence", "bob").description, /letter/);
assert.doesNotMatch(venueInArea(venue, "outside", "residence").description, /private/);
const oldInside = structuredClone(venue.zones!.filter((zone) => zone.kind !== "exterior"));
const exterior = venue.zones!.find((zone) => zone.kind === "exterior")!;
applyVenueSceneChange(
  state,
  "shop",
  { narration: "A sign is planted by the gate.", expectedRevision: 0, append: "A sign beside the gate." },
  "outside-action",
  "2026-10-28T12:00:00.000Z",
  "residence",
  "outside",
  "",
  "exterior",
  { actorIds: ["bob"], witnessIds: ["bob"], consentIds: [], positions: { bob: "exterior" } },
);
assert.match(exterior.description, /A sign beside the gate/);
assert.deepEqual(
  venue.zones!.filter((zone) => zone.kind !== "exterior"),
  oldInside,
  "an exterior change preserves every interior",
);
const decoded = coerceVillageState(JSON.parse(JSON.stringify(state)));
assert.deepEqual(decoded.venues[0].classes, ["residence", "workplace"]);
assert.equal(venueCapacity(decoded.venues[0]), 2);
assert.deepEqual(coerceVillageState(JSON.parse(JSON.stringify(decoded))), decoded);
