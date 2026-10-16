import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
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
assert.equal(validVenueClasses(["residence", "workplace", "community"]), false);
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

// Old classes become Community; saved identities and authored writing stay intact.
assert.equal(validVenueClasses(["community"]), true);
assert.equal(validVenueClasses(["gathering"]), false);
const legacy = {
  ...defaultVillageState(),
  venues: [
    {
      ...venue,
      id: "gathering",
      name: "Gathering Place",
      description: "A gathering by the river.",
      classes: ["gathering", "workplace"],
      baseClasses: ["gathering", "workplace"],
      spaces: [{ ...defaultVenueSpace("community"), venueClass: "gathering", id: "gathering" }],
      zones: [
        {
          ...defaultVenueSpace("community"),
          venueClass: "gathering",
          id: "gathering",
          name: "Gathering room",
          kind: "public",
          seen: true,
        },
      ],
      improvements: [
        {
          id: "extension",
          title: "Hall",
          description: "Hall",
          extraBeds: 0,
          classContribution: "gathering",
          spaceId: "gathering",
        },
        null,
      ],
    },
  ],
  projects: [
    {
      id: "project",
      title: "New hall",
      kind: "new-venue",
      venueDraft: { name: "Hall", description: "Hall", classes: ["gathering"] },
      lifecycle: {
        version: 2,
        phase: "concept",
        change: {
          classes: ["gathering"],
          baseZones: [{ id: "gathering", name: "Hall", description: "Hall", kind: "public", venueClass: "gathering" }],
          improvement: { id: "addition", title: "Hall", classContribution: "gathering" },
        },
      },
    },
  ],
  pendingDecisions: [
    {
      id: "decision",
      title: "Hall",
      kind: "venue",
      proposedAt: new Date().toISOString(),
      venueDraft: { name: "Hall", classes: ["gathering"] },
    },
  ],
  venueMail: [
    {
      id: "mail",
      venueId: "gathering",
      kind: "counteroffer",
      proposedClasses: ["gathering"],
      counterofferDraft: { name: "Hall", description: "Hall", classes: ["gathering"] },
    },
  ],
};
const decoded = coerceVillageState(legacy);
assert.deepEqual(decoded.venues[0]!.classes, ["community", "workplace"]);
assert.deepEqual(decoded.venues[0]!.baseClasses, ["community", "workplace"]);
assert.equal(decoded.venues[0]!.spaces![0]!.venueClass, "community");
assert.equal(decoded.venues[0]!.spaces![0]!.id, "gathering");
assert.equal(decoded.venues[0]!.zones![0]!.venueClass, "community");
assert.equal(decoded.venues[0]!.zones![0]!.id, "gathering");
assert.equal(decoded.venues[0]!.improvements![0]!.classContribution, "community");
assert.equal(decoded.venues[0]!.improvements![0]!.spaceId, "gathering");
assert.equal(decoded.venues[0]!.name, "Gathering Place");
assert.equal(decoded.venues[0]!.description, "A gathering by the river.");
assert.deepEqual(decoded.projects[0]!.venueDraft!.classes, ["community"]);
assert.deepEqual(decoded.projects[0]!.lifecycle!.change!.classes, ["community"]);
assert.equal(decoded.projects[0]!.lifecycle!.change!.baseZones![0]!.venueClass, "community");
assert.equal(decoded.projects[0]!.lifecycle!.change!.improvement!.classContribution, "community");
assert.deepEqual(decoded.pendingDecisions[0]!.venueDraft!.classes, ["community"]);
assert.deepEqual(decoded.venueMail[0]!.proposedClasses, ["community"]);
assert.deepEqual(decoded.venueMail[0]!.counterofferDraft!.classes, ["community"]);
assert.equal(legacy.venues[0]!.classes[0], "gathering", "decoding leaves its input untouched");
assert.deepEqual(coerceVillageState(JSON.parse(JSON.stringify(decoded))), decoded, "canonical save reload is stable");
const implicit = coerceVillageState({
  ...defaultVillageState(),
  venues: [{ ...legacy.venues[0], spaces: undefined, zones: undefined }],
});
assert.equal(implicit.venues[0]!.spaces![0]!.id, "gathering", "implicit legacy Zone identity survives");
const operation = { id: "operation", input: { spaceClass: "gathering" }, requestHash: "unchanged" };
const scene = coerceSession({
  id: "scene",
  spaceClass: "gathering",
  zoneId: "gathering",
  operation,
  lines: [{ id: "line", content: "Gathering here.", role: "user" }],
});
assert.equal(scene.spaceClass, "community");
assert.equal(scene.zoneId, "gathering");
assert.deepEqual(scene.operation, operation, "admitted operation evidence is not rewritten");
assert.equal(scene.lines[0]!.content, "Gathering here.");
assert.equal(coerceSession(JSON.parse(JSON.stringify(scene))).spaceClass, "community");
console.log("villages-venue-model: ok");
