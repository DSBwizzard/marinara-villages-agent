import assert from "node:assert/strict";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { establishPlace, projectPlace } from "../packages/villages/src/server/domain/rules/place-discovery.js";
import { findLocation, findNpc, readPlaceRegistry } from "../packages/villages/src/server/domain/rules/places.js";
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
const { fenceIntroductionWitnesses, prepareNpcIntroductions } =
  await import("../packages/villages/src/server/domain/rules/npc-participation.js");
const { applyPlaceExchange } = await import("../packages/villages/src/server/domain/rules/place-exchange.js");
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
  source: "conversation",
  evidenceId: "speech:jo",
  scope: establishmentScope(project),
  at: state.setupAt,
});
const scene = {
  id: "test-scene",
  villageSeed: state.seed,
  placeId: place.id,
  zoneId: "dining",
  startedAt: state.setupAt,
  activeIds: [],
  participants: [],
  lines: [
    {
      id: "meal",
      speakerId: "npc:place:lantern:jo",
      kind: "dialogue",
      content: "We have agreed the recurring trial meal.",
      heardBy: ["player"],
    },
  ],
  sceneAttendance: { capturedAt: state.setupAt, occupants: [] },
} as any;
const progress = {
  id: "agreement",
  at: state.setupAt,
  replyLineIds: ["meal"],
  establishmentProgress: [
    {
      projectId: project.id,
      revision: 1,
      objectiveId: "objective:0",
      segment: 0,
      quote: scene.lines[0].content,
      met: true,
    },
  ],
};
applyPlaceExchange(state, scene, progress);
const evidenceCount = project.establishment!.objectives[0].evidence.length;
applyPlaceExchange(state, scene, progress);
assert.equal(project.establishment!.objectives[0].evidence.length, evidenceCount, "Outcome replay is idempotent");
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
const admission = (id: string, segment: number) => ({
  npc: { ...sameNpc, id },
  segment,
  zoneId: "dining",
  source: "Arrives",
});
const lines = [
  { kind: "narration", speakerId: "", heardBy: ["bob", "jo"], physicalIdsAfter: ["bob"] },
  { kind: "narration", speakerId: "", heardBy: [], physicalIdsAfter: [] },
  { kind: "narration", speakerId: "", heardBy: ["jo"] },
] as any;
fenceIntroductionWitnesses(lines, [], [admission("jo", 2), admission("bob", 0)], []);
assert.deepEqual(lines[2].physicalIdsAfter, ["jo"], "Later arrivals cannot resurrect departed actors");
assert.equal(lines[0].heardBy.includes("jo"), false, "Arrivals never hear earlier dialogue");
assert.throws(
  () =>
    prepareNpcIntroductions(
      {
        segments: [{ kind: "narration", text: "Jo walks up." }],
        npcIntroductions: [{ ref: "new:jo", existingId: sameNpc.id, name: "Jo", characterization: "Host", segment: 0 }],
      },
      state,
      {
        ...scene,
        sceneAttendance: { capturedAt: state.setupAt, occupants: [{ characterId: sameNpc.id, zoneId: "kitchen" }] },
      },
      "request",
    ),
  /already captured/,
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
const workId = "project:physical";
await physical.mutate((world) => {
  const p = world.projects.find((p) => p.id === workId)!;
  p.lifecycle!.builderId = "a";
  p.lifecycle!.candidates = [{ residentId: "a", evidenceId: "lead", scope: projectDesignKey(p), at: world.setupAt }];
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
const { parseRelationshipReview } = await import("../packages/villages/src/server/domain/rules/relationship-review.js");
const { settleStandingAccess, applyAccessCommand } =
  await import("../packages/villages/src/server/domain/rules/venue-access.js");
const { sceneActorIds } = await import("../packages/villages/src/server/domain/rules/places.js");
const speech = {
  id: "standing",
  speakerId: sameNpc.id,
  kind: "dialogue",
  content: "You may always use my kitchen.",
  heardBy: [sameNpc.id, "player"],
  playerHeard: true,
};
const permission = parseRelationshipReview(
  {
    changes: [],
    permissions: [
      {
        controllerId: sameNpc.id,
        visitorId: "player",
        venueId: place.id,
        zoneId: "kitchen",
        action: "grant",
        lineIds: [speech.id],
      },
    ],
    disclosures: [],
  },
  "source",
  [speech] as any,
  state,
).permissions[0];
settleStandingAccess(state.venues[0], permission, state.setupAt, ["player", ...sceneActorIds(state)]);
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
const soundRaw: any = {
  segments: [
    { kind: "narration", text: "A visitor walks up." },
    { kind: "narration", text: "The visitor whistles.", sound: { sourceId: "new:visitor", text: "A whistle." } },
  ],
  npcIntroductions: [{ ref: "new:visitor", name: "Visitor", characterization: "A friendly traveler", segment: 0 }],
};
const prepared = prepareNpcIntroductions(soundRaw, state, scene, "sound-request");
assert.equal(soundRaw.segments[1].sound.sourceId, prepared.admissions[0].npc.id);
console.log("Places: shared Zones, identity, scoped control, private projection and paged persistence passed.");

// A new arrival can be named in two exact scoped changes without losing the Place snapshot.
{
  const { createSceneCommands } = await import("../packages/villages/src/server/features/scenes/command-service.js");
  const { readAccessCommand } = await import("../packages/villages/src/server/domain/rules/venue-access.js");
  const { captureSceneContinuity } = await import("../packages/villages/src/server/domain/rules/scene-continuity.js");
  const { admitNpcParticipants } = await import("../packages/villages/src/server/domain/rules/npc-participation.js");
  const batchWorld = defaultVillageState();
  batchWorld.setupAt = state.setupAt;
  const site = establishPlace(
    batchWorld,
    {
      name: "Shared cafe",
      description: "A cafe",
      controllers: ["alice"],
      people: [{ ref: "alice", name: "Alice", characterization: "The proprietor" }],
      zones: [
        { id: "room", name: "Room", kind: "public", description: "Tables" },
        { id: "annex", name: "Annex", kind: "public", description: "More tables" },
      ],
    },
    "place:batch",
    "map",
    "test",
    state.setupAt,
    true,
  );
  const alice = "npc:place:batch:alice",
    jo = { ...sameNpc, id: "npc:batch:jo", associations: [] };
  const saved: any = {
    id: "batch-scene",
    villageSeed: batchWorld.seed,
    placeId: site.id,
    placeName: site.location.name,
    zoneId: "room",
    startedAt: state.setupAt,
    liveSceneVersion: 1,
    activeIds: [alice],
    participants: [{ characterId: alice, name: "Alice" }],
    sceneAttendance: { capturedAt: state.setupAt, occupants: [{ characterId: alice, zoneId: "room" }] },
    lines: [
      { id: "arrives", kind: "narration", speakerId: "", content: "Jo arrives.", heardBy: [alice] },
      {
        id: "policy1",
        kind: "dialogue",
        speakerId: alice,
        content: "Jo will join me as manager of the room. Other rules stay the same.",
        heardBy: [alice, jo.id],
      },
      {
        id: "policy2",
        kind: "dialogue",
        speakerId: alice,
        content: "Jo will be a member of the annex. Other rules stay the same.",
        heardBy: [alice, jo.id],
      },
    ],
    submissions: [],
  };
  saved.continuity = captureSceneContinuity(batchWorld, saved, Date.parse(state.setupAt));
  const admissions = [{ npc: jo, segment: 0, zoneId: "room", source: "Jo arrives." }];
  admitNpcParticipants(saved, admissions);
  const turn: any = {
    id: "batch",
    at: state.setupAt,
    replyLineIds: saved.lines.map((line: any) => line.id),
    npcAdmissions: admissions,
    zoneIdAtTurn: "room",
  };
  saved.submissions.push(turn);
  applyPlaceExchange(batchWorld, saved, turn);
  const checks = [
    {
      kind: "manage-access",
      actorId: alice,
      venueId: site.id,
      evidence: [1],
      command: {
        action: "zone-policy",
        zoneId: "room",
        policy: { ...site.location.zones![1].access, managerIds: [alice, jo.id] },
      },
    },
    {
      kind: "manage-access",
      actorId: alice,
      venueId: site.id,
      evidence: [2],
      command: {
        action: "zone-policy",
        zoneId: "annex",
        policy: { ...site.location.zones![2].access, memberIds: [jo.id] },
      },
    },
  ].map((event, index) => {
    const operationId = "batch:" + index;
    const revision = findLocation(batchWorld, site.id)!.access!.revision;
    return {
      id: operationId,
      facts: {
        actorId: event.actorId,
        venueId: event.venueId,
        zoneId: event.command.zoneId,
        accessRevision: revision,
        semanticVersion: 2,
        accessCommand: readAccessCommand({ ...event.command, operationId, expectedRevision: revision }),
      },
      evidence: event.evidence.map((segment) => ({ id: "draft:" + segment })),
    };
  });
  assert.equal(checks.length, 2);
  const commands = createSceneCommands({
    readVillageState: async () => batchWorld,
    mutateVillageState: async (fn: any) => {
      fn(batchWorld);
      return batchWorld;
    },
    changeSession: async (_id: string, fn: any) => {
      fn(saved);
      return saved;
    },
  } as any);
  const results = checks.map((check) => ({
    outcome: "access-management",
    evidenceIds: check.evidence.map((line: any) => line.id),
    source: "gm",
    reason: "Exact witnessed policy",
  }));
  await commands.recordRoomAccessEvents(
    saved,
    { checks, results, traces: checks.map(() => ({ applied: "" })) } as any,
    "batch",
  );
  for (const registry of [batchWorld.worldPlaces, saved.continuity.facts.worldPlaces]) {
    assert.deepEqual(registry.places[site.id].location.zones[1].access.managerIds, [alice, jo.id]);
    assert.deepEqual(registry.places[site.id].location.zones[2].access.memberIds, [jo.id]);
    assert.ok(registry.npcs[jo.id]);
  }
}

{
  const { sceneHaltWorldConflict } = await import("../packages/villages/src/server/domain/rules/scene-halt-world.js");
  const { readNpc } = await import("../packages/villages/src/server/domain/rules/places.js");
  const world = defaultVillageState();
  world.seed = "arrival-action";
  world.setupAt = world.foundedAt = "2026-11-03T12:00:00.000Z";
  const cafe = establishPlace(
    world,
    {
      name: "Cafe",
      description: "A cafe",
      controllers: ["host"],
      people: [{ ref: "host", name: "Host", characterization: "The proprietor" }],
    },
    "place:cafe",
    "map",
    "test",
    world.setupAt,
    true,
  );
  const scene: any = {
    id: "arrival",
    villageSeed: world.seed,
    placeId: cafe.id,
    zoneId: "exterior",
    area: "outside",
    spaceClass: "other",
    privateOwnerId: "",
    startedAt: world.setupAt,
    activeIds: [],
    participants: [],
    submissions: [],
  };
  const npc = readNpc({
    id: "npc:new",
    revision: 1,
    name: "Newcomer",
    label: "Newcomer",
    characterization: "A visitor",
    facts: [],
    associations: [],
    availability: "",
    disabled: false,
    source: "scene:arrival:turn:0",
    updatedAt: world.setupAt,
  });
  assert.equal(
    sceneHaltWorldConflict(scene, world, {
      npcAdmissions: [{ npc, segment: 0, zoneId: "exterior", source: "The visitor arrives." }],
      placeUpdate: {
        narration: "The visitor sits down.",
        expectedRevision: 0,
        recent: { text: "A visitor is seated near the entrance." },
      },
      physicalContext: {
        zoneId: "exterior",
        actorIds: [npc.id],
        witnessIds: [npc.id],
        consentIds: [],
        positions: { [npc.id]: "exterior", player: "exterior" },
      },
    }),
    false,
    "An approved arrival can perform ordinary temporary activity",
  );
  assert.equal(cafe.location.zones![0].state.recent, null, "Dry validation cannot write the temporary activity");
  assert.equal(world.worldPlaces.npcs[npc.id], undefined, "Dry validation cannot register a supporting identity");
  const actor = "npc:place:cafe:host";
  const reply = {
    roomInterpretation: {
      checks: [
        {
          facts: {
            actorId: actor,
            venueId: cafe.id,
            zoneId: null,
            accessCommand: { action: "venue-policy", zoneId: null, expectedRevision: cafe.location.access!.revision },
          },
        },
      ],
      results: [{ outcome: "access-management" }],
    },
  };
  assert.equal(sceneHaltWorldConflict(scene, world, reply), false, "Venue-wide authority does not require a Zone");
}

{
  const { projectSpeakerAtTurn } =
    await import("../packages/villages/src/server/domain/rules/project-scene-evidence.js");
  const turn: any = {
    activeIdsAtTurn: [],
    replyLineIds: ["early", "arrival", "consent"],
    npcAdmissions: [{ npc: sameNpc, segment: 1 }],
  };
  assert.equal(projectSpeakerAtTurn(turn, { id: "early", speakerId: sameNpc.id }), false);
  assert.equal(projectSpeakerAtTurn(turn, { id: "consent", speakerId: sameNpc.id }), true);
  assert.deepEqual(turn.activeIdsAtTurn, []);
}

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
  assert.equal(first.location.zones![0].dayNightManual, false);
  first.location.zones![0].dayNight = false;
  first.location.zones![0].dayNightManual = true;
  const next = establishPlace(world, draft, "light-place", "map", "test", "2026-11-05T13:00:00Z", true, first);
  assert.equal(next.location.zones![0].dayNight, true, "preparing a Place uses its automatic lighting decision");
  assert.equal(next.location.zones![0].dayNightManual, false);
  assert.equal(next.location.zones![1].dayNight, false);
  assert.equal(projectPlace(world, next).zones![1].description, "");
  assert.equal(projectPlace(world, next).zones![1].dayNight, undefined, "hidden lighting metadata remains private");
}
