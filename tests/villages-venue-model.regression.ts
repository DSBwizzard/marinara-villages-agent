import assert from "node:assert/strict";
import { assertVillagePresence } from "../packages/villages/src/server/domain/rules/venue-presence.js";
import { applyVenueSceneChange } from "../packages/villages/src/server/domain/rules/venue-scene-state.js";
import {
  defaultVenueSpace,
  venueCapacity,
  venueInArea,
  venueInSpace,
  validVenueClasses,
} from "../packages/villages/src/server/domain/rules/venue-model.js";

assert.equal(validVenueClasses(["residence", "workplace"]), true);
assert.equal(validVenueClasses(["residence", "workplace", "gathering"]), false);
assert.equal(validVenueClasses(["residence", "residence"]), false);

const residence = defaultVenueSpace("residence", "A curtained sleeping alcove.");
const workplace = defaultVenueSpace("workplace", "An oil-stained repair bench.");
residence.state.items.push("bed");
workplace.state.items.push("lathe");
workplace.image = { id: "work-image", url: "/work.webp", mime: "image/webp" } as any;
const venue = {
  id: "shop",
  name: "The Rolling Workshop",
  classes: ["residence", "workplace"],
  spaces: [residence, workplace],
  presentation: { image: null, x: 0.3, y: 0.4 },
  description: "A vehicle parked by the road.",
  state: { condition: "", furniture: [], publicFacts: [], features: [], traces: [], upgrades: [], updatedAt: "" },
  occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
  residenceCapacity: 1,
  improvements: [
    null,
    {
      id: "bed",
      title: "Foldout bed",
      description: "A second bed.",
      spaceId: "residence",
      extraBeds: 1,
      approvedAt: "",
    },
  ],
} as any;
venue.exteriorState = {
  condition: "roadside",
  items: ["gate"],
  publicFacts: [],
  features: [],
  traces: [],
  updatedAt: "",
};
venue.privateSpaces = [
  {
    ...defaultVenueSpace("residence", "Bob's private nook."),
    id: "private:bob",
    ownerId: "bob",
    state: { ...defaultVenueSpace("residence").state, items: ["Bob's letter"] },
  },
];
assert.deepEqual(venueInSpace(venue, "residence").state.furniture, ["bed"]);
assert.deepEqual(venueInSpace(venue, "workplace").state.furniture, ["lathe"]);
assert.equal(venueInSpace(venue, "workplace").presentation.image?.id, "work-image");
assert.equal(venueCapacity(venue), 2);
assert.deepEqual(venueInArea(venue, "outside", "residence").state.furniture, ["gate"]);
assert.deepEqual(venueInArea(venue, "private", "residence", "bob").state.furniture, ["Bob's letter"]);
assert.equal(venueInArea(venue, "outside", "residence").description.includes("private"), false);
applyVenueSceneChange(
  { venues: [venue], venueEvents: [], happenings: [], narrativeItems: [] } as any,
  "shop",
  { narration: "The player plants a sign by the gate.", addItem: "sign" },
  "outside-action",
  new Date().toISOString(),
  "residence",
  "outside",
);
assert.deepEqual(venue.exteriorState.items, ["gate", "sign"]);
assert.deepEqual(venue.spaces[0].state.items, ["bed"], "outside changes do not alter shared furnishings");
assert.deepEqual(
  venue.privateSpaces[0].state.items,
  ["Bob's letter"],
  "outside changes do not alter private belongings",
);

const block = (venueId: string) => ({ startMinute: 540, endMinute: 600, venueId });
const state = {
  venues: [venue, { ...venue, id: "square", name: "The Square" }],
  villagers: Array.from({ length: 5 }, (_, index) => ({
    characterId: `resident-${index}`,
    ingestSchedule: false,
    agenda: { day: [block("shop")] },
  })),
} as any;
assert.throws(() => assertVillagePresence(state), /five villagers/u);
state.villagers[4].agenda.day = [block("square")];
assert.doesNotThrow(() => assertVillagePresence(state));

console.log("villages-venue-model: ok");
