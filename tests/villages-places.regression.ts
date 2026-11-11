import assert from "node:assert/strict";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { establishPlace, projectPlace } from "../packages/villages/src/server/domain/rules/place-discovery.js";
import { findLocation, findNpc, readPlaceRegistry } from "../packages/villages/src/server/domain/rules/places.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import {
  encodeContinuityPages,
  decodeContinuityPagesSync,
} from "../packages/villages/src/server/adapters/storage/continuity-pages.js";
import { memoryPayload } from "../packages/villages/src/server/adapters/storage/memory-payload-store.js";

const state = defaultVillageState();
state.seed = "world";
const place = establishPlace(
  state,
  {
    name: "The Lantern",
    description: "A restaurant facing the square.",
    controllers: ["jo"],
    people: [{ ref: "jo", name: "Jo", characterization: "A reserved, attentive host.", role: "Proprietor" }],
    zones: [
      { id: "dining", name: "Dining room", kind: "public", description: "Wooden tables beside the windows." },
      { id: "kitchen", name: "Kitchen", kind: "staff", description: "The private kitchen.", controllers: ["jo"] },
    ],
  },
  "place:lantern",
  "map",
  "request:test",
  "2026-11-03T12:00:00.000Z",
  true,
);
assert.equal(state.venues.length, 0, "A discovered Place consumes no Venue slot");
assert.equal(findLocation(state, place.id), place.location);
assert.equal(findNpc(state, "npc:place:lantern:jo")?.name, "Jo");
assert.deepEqual(place.location.access?.managerIds, ["npc:place:lantern:jo"]);
const projected = projectPlace(state, place);
place.location.zones!.find((zone) => zone.id === "kitchen")!.picture = {
  base: { id: "secret", ref: "global-gallery:secret", url: "/api/global-gallery/file/secret.png" },
  baseline: "Private kitchen details",
  context: "Hidden interior context",
};
assert.equal(projectPlace(state, place).zones?.find((zone) => zone.id === "kitchen")?.picture, undefined);
assert.equal(projected.access, undefined);
assert.equal(projected.zones?.find((zone) => zone.id === "kitchen")?.description, "");
assert.equal(projected.zones?.find((zone) => zone.id === "kitchen")?.access, undefined);
const encoded = encodeContinuityPages(memoryPayload(state), "a".repeat(32));
const decoded = decodeContinuityPagesSync(
  encoded.manifest,
  "a".repeat(32),
  state.seed,
  (id) => encoded.pages.get(id) ?? null,
);
assert.deepEqual(
  decoded.value.worldPlaces,
  JSON.parse(JSON.stringify(state.worldPlaces)),
  "Private history preserves Place and NPC identities",
);
const restored = readPlaceRegistry(decoded.value.worldPlaces);
for (const missing of ["ledger", "zone-policy"] as const) {
  const incomplete = structuredClone(state.worldPlaces);
  const location = incomplete.places[place.id].location;
  if (missing === "ledger") delete location.access;
  else delete location.zones!.find((zone) => zone.id === "kitchen")!.access;
  const before = structuredClone(incomplete);
  assert.throws(() => readPlaceRegistry(incomplete), missing === "ledger" ? /no access record/ : /access policy/);
  assert.deepEqual(incomplete, before, "decoding never constructs missing authority or changes saved evidence");
}
assert.deepEqual(restored.places[place.id].location.access, place.location.access);
assert.equal(projectPlace(state, place).access, undefined, "the required saved ledger stays private");

restored.places[place.id].location.name = "Renamed";
assert.equal(state.worldPlaces.places[place.id].location.name, "The Lantern");
assert.throws(
  () =>
    establishPlace(
      state,
      { name: "Forgery", description: "A building.", controllers: ["unknown"] },
      "place:forgery",
      "map",
      "test",
      "2026-11-03T12:00:00.000Z",
      true,
    ),
  /established identity/,
);
assert.throws(() =>
  establishPlace(
    state,
    {
      name: "Bad layout",
      description: "A building.",
      zones: [{ id: "room", name: "Room", kind: "public", description: "A room.", connectedTo: ["unknown"] }],
    },
    "place:bad",
    "map",
    "test",
    "2026-11-03T12:00:00.000Z",
    true,
  ),
);
const { draftEstablishmentProject } =
  await import("../packages/villages/src/server/features/projects/project-drafts.js");
const { completeProject } = await import("../packages/villages/src/server/domain/rules/project-completion.js");
const { establishmentScope } = await import("../packages/villages/src/server/domain/rules/establishment.js");
const { villageVenueUsage } = await import("../packages/villages/src/server/domain/rules/venue-capacity.js");
const { coerceVillageState } = await import("../packages/villages/src/server/domain/decoding/village-codec.js");
state.setupAt = "2026-11-03T12:00:00.000Z";
state.maps = [
  {
    id: "map",
    name: "Village",
    revision: 1,
    width: 1440,
    height: 900,
    view: { fit: "cover", focusX: 50, focusY: 50, zoom: 1 },
    artwork: { id: "art", ref: "global-gallery:art", url: "/map.png" },
  },
] as any;
place.location.presentation.x = 0.3;
place.location.presentation.y = 0.3;
const project = draftEstablishmentProject(
  state,
  place.id,
  {
    classes: ["workplace"],
    establishment: {
      goal: "Host a weekly village meal",
      physical: false,
      zoneIds: ["dining"],
      objectives: ["Agree a recurring trial meal"],
    },
  },
  "project:establish",
);
assert.equal(villageVenueUsage(state).total, 0, "Drafts reserve no Venue slot");
project.status = project.lifecycle!.phase = "working";
assert.equal(villageVenueUsage(state).total, 1, "Active establishment reserves one slot");
assert.throws(() => completeProject(state, project, state.setupAt), /objectives|agreements/);
project.lifecycle!.approvals.push({
  residentId: "npc:place:lantern:jo",
  incarnation: continuityActor(state, "npc:place:lantern:jo")!.incarnation,
  source: "conversation",
  evidenceId: "speech:jo",
  scope: establishmentScope(project),
  at: state.setupAt,
});
project.establishment!.objectives[0].met = true;
const sameZone = place.location.zones![1],
  sameNpc = state.worldPlaces.npcs["npc:place:lantern:jo"];
completeProject(state, project, state.setupAt);
assert.equal(state.venues[0], place.location, "Promotion retains the same location");
assert.equal(state.venues[0].zones![1], sameZone, "Promotion retains Zone identities and history");
assert.equal(state.worldPlaces.npcs[sameNpc.id], sameNpc, "Promotion retains supporting identities");
assert.equal(state.worldPlaces.places[place.id], undefined, "Only one authoritative location remains");
assert.equal(villageVenueUsage(state).total, 1);
assert.equal(state.venues[0].access?.managerIds.includes("player"), false, "Promotion does not grant ownership");
assert.equal(
  coerceVillageState(JSON.parse(JSON.stringify(state))).projects[0].establishment?.objectives[0].met,
  true,
  "Social establishment survives restart without a construction deadline",
);
assert.throws(
  () =>
    readPlaceRegistry({
      ...state.worldPlaces,
      places: { [place.id]: { ...place, location: { ...place.location, access: {} } } },
    }),
  /access record/,
);
const { fixture } = await import("./fixtures/villages-projects.fixture.js");
const { projectDesignKey } = await import("../packages/villages/src/server/domain/rules/project-terms.js");
const { finishConstruction } = await import("../packages/villages/src/server/domain/rules/project-lifecycle-rules.js");
const physical = fixture();
await physical.mutate((world) => {
  const site = establishPlace(
    world,
    {
      name: "Old shed",
      description: "A standing wooden shed.",
      zones: [{ id: "room", name: "Room", kind: "public", description: "A dry room." }],
    },
    "place:shed",
    "map-projects",
    "authored",
    world.setupAt,
    true,
  );
  site.location.presentation.x = 0.75;
  site.location.presentation.y = 0.75;
});
await physical.service.createEstablishmentProject("place:shed", {
  requestId: "physical",
  classes: ["community"],
  detail: "Add a ramp",
  form: "A wooden shed with a wheelchair ramp",
  establishment: { goal: "A shared workshop", physical: true, zoneIds: ["exterior", "room"], objectives: [] },
});
const workId = physical.state().projects.find((row) => Object.hasOwn(row.lifecycle!.commandReceipts, "physical"))!.id;
await physical.mutate((world) => {
  const p = world.projects.find((p) => p.id === workId)!;
  p.lifecycle!.builderId = "a";
  p.lifecycle!.candidates = [
    {
      residentId: "a",
      incarnation: continuityActor(world, "a")!.incarnation,
      evidenceId: "lead",
      scope: projectDesignKey(p),
      at: world.setupAt,
    },
  ];
});
await physical.service.startProjectConstruction(workId, physical.body(workId), new Date("2026-11-03T12:00:00Z"));
assert.equal(physical.get(workId).status, "working", "A native work reservation can target a Place");
assert.equal(physical.get(workId).lifecycle!.workOrder!.focus!.remainingMs, 360 * 60000);
assert.equal(
  physical.state().venues.some((venue) => venue.id === "place:shed"),
  false,
  "Physical Start does not promote early",
);
await physical.mutate((world) =>
  finishConstruction(world, world.projects.find((p) => p.id === workId)! as any, "2026-11-04T12:00:00.000Z"),
);
assert.equal(physical.get(workId).status, "complete", physical.get(workId).lifecycle!.blockedReason);
assert.equal(
  physical.state().venues.find((venue) => venue.id === "place:shed")?.form,
  "A wooden shed with a wheelchair ramp",
);
const { applyAccessCommand } = await import("../packages/villages/src/server/domain/rules/venue-access.js");
const { sceneActorIds } = await import("../packages/villages/src/server/domain/rules/places.js");
applyAccessCommand(
  state.venues[0],
  {
    action: "invite",
    operationId: "standing-kitchen",
    expectedRevision: state.venues[0].access!.revision,
    zoneId: "kitchen",
    visitorId: "player",
    duration: "standing",
    accompanied: false,
    outsideHours: false,
  },
  sameNpc.id,
  state.setupAt,
  ["player", ...sceneActorIds(state)],
  ["standing"],
);
assert.equal(
  state.venues[0].access?.permissions.some((grant) => grant.issuerId === sameNpc.id && !grant.revoked),
  true,
  "A proprietor can issue a scoped native standing grant",
);
assert.throws(
  () =>
    applyAccessCommand(
      state.venues[0],
      {
        operationId: "takeover",
        expectedRevision: state.venues[0].access!.revision,
        zoneId: null,
        action: "recover-managers",
      } as any,
      "player",
      state.setupAt,
      ["player", ...sceneActorIds(state)],
    ),
  /manage|control|recover/i,
  "A living NPC proprietor cannot be recovered away",
);
{
  const world = defaultVillageState();
  const draft = {
    name: "Sunroom",
    description: "A conservatory with a glass roof.",
    dayNight: true,
    zones: [{ id: "cellar", name: "Cellar", kind: "public", description: "A windowless cellar.", dayNight: false }],
  };
  const first = establishPlace(world, draft, "light-place", "map", "test", "2026-11-05T12:00:00Z", true);
  assert.equal(first.location.zones![0].dayNight, true);
  first.location.zones![0].dayNight = false;
  const next = establishPlace(world, draft, "light-place", "map", "test", "2026-11-05T13:00:00Z", true, first);
  assert.equal(next.location.zones![0].dayNight, true, "preparing a Place uses its automatic lighting decision");
  assert.equal(next.location.zones![1].dayNight, false);
  assert.equal(projectPlace(world, next).zones![1].description, "");
  assert.equal(projectPlace(world, next).zones![1].dayNight, undefined, "hidden lighting metadata remains private");
}
