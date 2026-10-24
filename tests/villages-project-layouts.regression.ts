import assert from "node:assert/strict";
import { fixture, renovation } from "./fixtures/villages-projects.fixture.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { readProjectPlan } from "../packages/villages/src/server/domain/rules/project-completion.js";
import { parsePlace } from "../packages/villages/src/server/domain/rules/founding-record.js";
const f = fixture(),
  id = await f.newProject(),
  target = f.state().venues[0];
const publicZones = Array.from({ length: 3 }, (_, i) => ({
  id: "garden-" + i,
  name: "Garden " + i,
  purpose: "Open air gathering",
  venueClass: "community",
  description: "An outdoor meeting space.",
  connectedTo: ["exterior"],
}));
const privateZones = Array.from({ length: 3 }, (_, i) => ({
  id: "quiet-" + i,
  name: "Quiet room " + i,
  purpose: "Private reflection",
  venueClass: "community",
  description: "A private interior.",
  controllerIds: ["a"],
  connectedTo: ["exterior"],
}));
const plan = {
  form: "A garden pavilion",
  layoutVersion: 1,
  layout: "both",
  exteriorDescription: "The garden gate.",
  spaces: publicZones,
  privateSpaces: privateZones,
  capacity: 4,
};
assert.equal(readProjectPlan(plan, target).spaces.length + readProjectPlan(plan, target).privateSpaces.length, 6);
assert.throws(
  () => readProjectPlan({ ...plan, spaces: [...publicZones, { ...publicZones[0], id: "seventh" }] }, target),
  /six Zones/,
);
const founding = {
  id: "founding",
  name: "Garden Pavilion",
  classes: ["community"],
  category: "public-center",
  description: "The garden gate.",
  presentation: { image: null, x: 0.5, y: 0.5 },
  occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
  ...plan,
  layout: "common",
  spaces: [...publicZones, ...publicZones.map((zone) => ({ ...zone, id: "extra-" + zone.id }))],
  privateSpaces: [],
};
assert.equal(parsePlace(founding, true).zones!.filter((zone) => zone.id !== "exterior").length, 6);
assert.throws(
  () => parsePlace({ ...founding, spaces: [...founding.spaces, { ...publicZones[0], id: "seventh" }] }, true),
  /six Zones/,
);
const zones = [
  ...publicZones.map((zone) => ({ ...zone, kind: "public" })),
  ...privateZones.map((zone) => ({ ...zone, kind: "restricted" })),
];
await renovation(f, { zones });
await assert.rejects(renovation(f, { zones: [...zones, { ...zones[0], id: "seventh" }] }), /six Zones/);
const saved = structuredClone(f.state());
saved.venues[0].zones = [
  saved.venues[0].zones![0],
  ...zones.map((zone) => ({ ...defaultVenueSpace("community"), ...zone })),
] as any;
assert.equal(coerceVillageState(saved).venues[0].zones!.length, 7, "Entrance is extra");
saved.venues[0].zones!.push({ ...saved.venues[0].zones![1], id: "seventh" });
assert.throws(() => coerceVillageState(saved), /six Zones/);
await assert.rejects(f.service.saveProjectPlan(id, f.body(id, { ...plan, capacity: 5 })), /one to four/);
const distinct = fixture(),
  distinctId = await distinct.newProject();
const physicalDesign = "A timber hall with sheltered work tables, wide windows and a shared gathering space. "
  .repeat(30)
  .slice(0, 2000)
  .trim();
const entranceAppearance = "A narrow gate beside the old oak.";
await distinct.service.saveProjectPlan(
  distinctId,
  distinct.body(distinctId, {
    ...plan,
    form: physicalDesign,
    exteriorDescription: entranceAppearance,
  }),
);
assert.equal(distinct.get(distinctId).plan!.form, physicalDesign, "saving retains the full Physical design");
await distinct.agree(distinctId);
await distinct.service.startProjectConstruction(distinctId, distinct.body(distinctId));
let built = distinct.state().venues.find((venue) => venue.id === distinct.get(distinctId).venueId)!;
assert.equal(built.description, entranceAppearance);
assert.equal(
  built.zones![0].description,
  entranceAppearance,
  "the worksite Entrance never inherits the overall design",
);
assert.equal(built.form, physicalDesign);
await distinct.service.debugCompleteProjectConstruction(distinctId, distinct.body(distinctId));
built = coerceVillageState(distinct.state()).venues.find((venue) => venue.id === built.id)!;
assert.equal(built.form, physicalDesign, "completion and reload retain the full Physical design");
assert.equal(built.description, entranceAppearance);
assert.equal(built.zones![0].description, entranceAppearance);
assert.equal(parsePlace({ ...founding, form: physicalDesign }, true).form, physicalDesign);
console.log(
  "Six non-Entrance Zones across founding, new Venue plans, Renovations and current saves; direct capacity limits passed.",
);
