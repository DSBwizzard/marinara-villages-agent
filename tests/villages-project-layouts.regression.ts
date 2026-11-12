import { venueFixture } from "./helpers/venues.fixture.js";
import assert from "node:assert/strict";
import { fixture, renovation } from "./fixtures/villages-projects.fixture.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { initializeVenueAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { readProjectPlan } from "../packages/villages/src/server/domain/rules/project-completion.js";
import { parsePlace } from "../packages/villages/src/server/domain/rules/founding-record.js";
import { currentRoomViews } from "../packages/villages/src/server/domain/rules/continuity-retrieval.js";
import {
  retainNativeFact,
  WORKSITE_DESCRIPTION,
} from "../packages/villages/src/server/domain/rules/native-continuity.js";
import {
  PROJECT_DURATION_MS,
  reconcileProjectLifecycles,
} from "../packages/villages/src/server/domain/rules/project-lifecycle-rules.js";
import { rememberZoneArtwork } from "../packages/villages/src/server/domain/rules/zone-observation.js";
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
const founding = venueFixture({
  residentIds: [null].filter((id) => typeof id === "string" && !!id),
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
});
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
saved.venues[0].zones![0].connectedTo = zones.map((zone) => zone.id);
initializeVenueAccess(saved.venues[0]);
assert.equal(coerceVillageState(saved).venues[0].zones!.length, 7, "Entrance is extra");
saved.venues[0].zones!.push({ ...saved.venues[0].zones![1], id: "seventh" });
assert.throws(() => coerceVillageState(saved), /six Zones/);
await assert.rejects(f.service.saveProjectPlan(id, f.body(id, { ...plan, capacity: 5 })), /one to four/);
const distinct = fixture(),
  distinctId = await distinct.newProject("Workshop", "a", { x: 0.7, y: 0.7 }, "r".repeat(200));
const physicalDesign = "A timber hall with sheltered work tables, wide windows and a shared gathering space. "
  .repeat(30)
  .slice(0, 2000)
  .trim();
const entranceParagraphs = [
  "A narrow gate beside the old oak.",
  "A stone bench faces the path.",
  "A low wall frames the approach.",
  "A stone bench faces the path.",
];
const entranceAppearance = entranceParagraphs.join("\n\n");
const longZoneId = "z".repeat(160);
await distinct.service.saveProjectPlan(
  distinctId,
  distinct.body(distinctId, {
    ...plan,
    form: physicalDesign,
    exteriorDescription: entranceAppearance,
    spaces: [{ ...publicZones[0], id: longZoneId }, ...publicZones.slice(1)],
  }),
);
assert.equal(distinct.get(distinctId).plan!.form, physicalDesign, "saving retains the full Physical design");
await distinct.agree(distinctId);
const start = new Date("2026-10-24T00:00:00Z");
const due = new Date(start.getTime() + PROJECT_DURATION_MS);
await distinct.service.startProjectConstruction(distinctId, distinct.body(distinctId), start);
let built = distinct.state().venues.find((venue) => venue.id === distinct.get(distinctId).venueId)!;
const entrance = { kind: "room" as const, placeId: built.id, zoneId: "exterior" };
const appearance = (zoneId = "exterior", at = due.toISOString()) => {
  const { continuity, episodes } = distinct.state();
  return currentRoomViews(continuity, episodes, { ...entrance, zoneId }, at);
};
assert.equal(built.description, WORKSITE_DESCRIPTION);
assert.equal(built.zones![0].observed?.description, WORKSITE_DESCRIPTION);
assert(!built.form);
assert.deepEqual(
  appearance().map((row) => row.version.text),
  [WORKSITE_DESCRIPTION],
);
assert.deepEqual(
  built.zones!.map((zone) => zone.id),
  ["exterior"],
);
const art = { id: "site-art", ref: "global-gallery:site-art", url: "/gallery/site-art" };
await distinct.mutate((state) => {
  const zone = state.venues.find((venue) => venue.id === entrance.placeId)!.zones![0];
  zone.image = art;
  zone.picture = { base: art, daylight: true, context: zone.observed!.context, dirty: true };
  zone.pictureRevision = 3;
  rememberZoneArtwork(zone);
  for (const [index, text] of [entranceParagraphs[1], "A red planter sits beside the path."].entries())
    retainNativeFact(
      state,
      {
        id: "worksite-detail:" + index,
        kind: "structure",
        targetId: JSON.stringify([entrance.placeId, "exterior"]),
        revision: 1,
        text,
        witnesses: [],
      },
      start.toISOString(),
      { room: entrance },
    );
  retainNativeFact(
    state,
    {
      id: "temporary-worksite-wall",
      kind: "room",
      targetId: JSON.stringify([entrance.placeId, "exterior"]),
      revision: 1,
      text: entranceParagraphs[2],
      witnesses: [],
    },
    start.toISOString(),
    { room: entrance, roomChange: { expiresInMinutes: 1441 } },
  );
});
const existing = appearance().slice(1, 3);
const temporary = appearance().at(-1)!;
assert(temporary.version.room?.expiresAt);
await distinct.mutate((state) => reconcileProjectLifecycles(state, due));
built = coerceVillageState(distinct.state()).venues.find((venue) => venue.id === built.id)!;
assert.equal(distinct.get(distinctId).status, "complete", distinct.get(distinctId).lifecycle?.blockedReason);
assert.equal(built.form, physicalDesign, "completion and reload retain the full Physical design");
assert.equal(built.description, entranceAppearance);
assert.equal(built.zones![0].description, entranceAppearance);
assert.deepEqual(built.zones![0].image, art);
assert.deepEqual(built.zones![0].observed?.image, art);
assert.equal(built.zones![0].picture?.context, built.zones![0].observed?.context);
assert.equal(
  built.zones![0].picture?.dirty,
  false,
  "completion does not queue an automatic art edit for changed prose",
);
assert.equal(built.zones![0].pictureRevision, 4);
assert.equal(
  built.zones![0].observed?.description,
  WORKSITE_DESCRIPTION,
  "the saved observation still describes the last known visit",
);
assert.deepEqual(appearance().slice(0, 2), existing, "independent worksite details keep their exact heads");
assert.deepEqual(
  appearance()
    .slice(2)
    .map((row) => row.version.text),
  [entranceParagraphs[0], entranceParagraphs[2], entranceParagraphs[3]],
);
const permanentWall = appearance("exterior", "2026-10-26T00:00:00.000Z").find(
  (row) => row.version.text === entranceParagraphs[2],
);
assert(permanentWall && !permanentWall.version.room?.expiresAt && permanentWall.id !== temporary.id);
assert(distinct.state().continuity.versions.some((row) => row.id === temporary.version.id));
assert.deepEqual(
  appearance(longZoneId).map((row) => row.version.text),
  [publicZones[0].description],
);
assert.equal(appearance(privateZones[0].id).length, 0, "private preparation owns its future authored description");
assert.equal(built.zones!.find((zone) => zone.id === privateZones[0].id)?.observed, undefined);
assert.equal(parsePlace({ ...founding, form: physicalDesign }, true).form, physicalDesign);
console.log(
  "Six non-Entrance Zones across founding, new Venue plans, Renovations and current saves; direct capacity limits passed.",
);
