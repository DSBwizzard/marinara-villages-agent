import assert from "node:assert/strict";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { createSceneCommands } from "../packages/villages/src/server/features/scenes/command-service.js";
import { createLiveScenes } from "../packages/villages/src/server/features/scenes/live-session-service.js";
import { createVillageSnapshot } from "../packages/villages/src/server/features/world/snapshot-service.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
import {
  defaultRelationshipState,
  neutralRelationship,
  relationshipKey,
} from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { villagePresence } from "../packages/villages/src/server/domain/rules/village-projections.js";
import { zoneActivityFits } from "../packages/villages/src/server/domain/rules/venue-presence.js";
import { captureSceneAttendance, accessExits } from "../packages/villages/src/server/domain/rules/scene-attendance.js";
import {
  captureSceneContinuity,
  sceneContinuityView,
} from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { zoneEventScene, routeZoneEvents } from "../packages/villages/src/server/domain/rules/zone-events.js";
import { assertSceneMovementCapacity } from "../packages/villages/src/server/domain/rules/resident-movement.js";
import { semanticContext } from "../packages/villages/src/server/domain/rules/semantic-contract.js";
import { contactCanEnter } from "../packages/villages/src/server/domain/rules/venue-contact.js";
import {
  applyVenueSceneChange,
  readVenueSceneChange,
} from "../packages/villages/src/server/domain/rules/venue-scene-state.js";
import { resolveVenueZone } from "../packages/villages/src/server/domain/rules/venue-zones.js";
import {
  initializeVenueAccess,
  applyAccessCommand,
} from "../packages/villages/src/server/domain/rules/venue-access.js";

const stamp = "2026-10-22T12:00:00Z",
  at = new Date(stamp);
function fixture(count: number) {
  const ids = Array.from({ length: count }, (_, i) => "resident" + String(i).padStart(2, "0"));
  const zone = (id: string, kind: string, links: string[], ownerId?: string) => ({
    ...defaultVenueSpace("residence"),
    venueClass: kind === "public" ? "community" : "residence",
    id,
    name: id,
    kind,
    connectedTo: links,
    ownerId,
  });
  const state = coerceVillageState({
    seed: "capacity",
    foundedAt: stamp,
    setupAt: stamp,
    venues: [
      {
        id: "hall",
        layoutVersion: 1,
        name: "Hall",
        classes: ["community"],
        zones: [
          zone("exterior", "exterior", ["a"]),
          zone("a", "public", ["exterior", "b"]),
          zone("b", "public", ["a"]),
        ],
      },
      ...Array.from({ length: Math.ceil((count + 1) / 4) }, (_, i) => ({
        id: "home" + i,
        layoutVersion: 1,
        residenceCapacity: 4,
        name: "Home " + i,
        classes: ["residence"],
        occupancy: { playerHome: i === 0, homeKind: "house", residentCharacterId: null },
        residentIds: ids.filter((_, index) => Math.floor((index + 1) / 4) === i),
        zones: [
          zone("exterior", "exterior", ["common"]),
          zone("common", "shared-residence", ["exterior", "private"]),
          zone(
            "private",
            "private-residence",
            ["common"],
            ids.find((_, index) => Math.floor((index + 1) / 4) === i),
          ),
        ],
      })),
    ],
    villagers: ids.map((id, i) => ({
      characterId: id,
      addedAt: stamp,
      cardSnapshot: { id, name: id, revision: 1, sourceStatus: "available", capturedAt: stamp },
      agenda: {
        generatedAt: stamp,
        day: [
          {
            startMinute: 0,
            endMinute: 1440,
            venueId: "hall",
            zoneId: i < 4 ? "a" : i < 8 ? "b" : "exterior",
            activity: "Gathering",
            flexible: true,
          },
        ],
        wishes: [],
      },
    })),
  });
  return { state, ids };
}

for (let count = 1; count <= 12; count++) {
  const { state } = fixture(count);
  for (const crowded of [false, true]) {
    if (crowded)
      for (const person of state.villagers) {
        // Project work is the final agenda overlay; it must not bypass capacity.
        person.agenda!.projectWork = {
          projectId: "work",
          venueId: "hall",
          zoneId: "a",
          startsAt: stamp,
          endsAt: "2026-10-23T12:00:00Z",
        };
      }
    const positions = [...villagePresence(state, 720, at).values()];
    assert.equal(positions.length, count);
    for (const position of positions)
      assert(positions.filter((other) => other.id === position.id && other.zoneId === position.zoneId).length <= 4);
    const attendance = captureSceneAttendance(state, "hall", at);
    for (const person of attendance.occupants)
      assert.equal(person.zoneId, villagePresence(state, 720, at).get(person.characterId)!.zoneId);
  }
}

const { state, ids } = fixture(12),
  venue = state.venues[0];
assert.equal(
  [...villagePresence(state, 720, at).values()].filter((row) => row.id === "hall").length,
  12,
  "the Venue can hold twelve across three Zones",
);
assert.equal(zoneActivityFits(state, ids.slice(0, 4), "hall", "b", 720, 780, at), false);
assert.equal(zoneActivityFits(state, ids.slice(0, 2), "home0", "exterior", 720, 780, at), true);

const scene = coerceSession({
  id: "crowd",
  villageSeed: state.seed,
  placeId: "hall",
  placeName: "Hall",
  zoneId: "a",
  status: "active",
  startedAt: stamp,
  lastActivityAt: stamp,
  activeIds: ids.slice(0, 4),
  participants: ids.slice(0, 4).map((characterId) => ({ characterId, name: characterId, doing: "Gathering" })),
  sceneAttendance: captureSceneAttendance(state, "hall", at),
  lines: [],
  submissions: [],
});
const selected = zoneEventScene(scene, venue, { targetId: ids[4], message: ids[4] + ", hello!" });
assert.equal(selected.participants.length, 4);
assert.equal(selected.contactGeneration!.actorIds![0], ids[4]);
assert.equal(selected.activeIds.length, 4, "all four locals remain physically present");
assert.equal(semanticContext(selected, state, "Hello").actors.length, 4);
assert.deepEqual(
  zoneEventScene(structuredClone(scene), venue, { targetId: ids[4] }).contactGeneration!.actorIds,
  selected.contactGeneration!.actorIds,
  "selection is stable for the same admitted Scene",
);
const parsed = {
  lines: [{ kind: "dialogue" as const, speakerId: ids[0], content: "Hello", heardBy: [] as string[] }],
  heardPlayerBy: [] as string[],
};
routeZoneEvents({ segments: [{ kind: "dialogue", speakerId: ids[0], text: "Hello" }] }, selected, parsed, []);
assert(parsed.lines[0].heardBy.includes(ids[3]), "the unselected fourth local still witnesses speech");
const overflowMoves = ids
  .slice(0, 4)
  .map((characterId) => ({ characterId, zoneId: "b", segment: 0, quote: "They cross", path: ["a", "b"] }));
assert.throws(() => assertSceneMovementCapacity(scene, overflowMoves), /overcrowd/);
assert.equal(
  scene.sceneAttendance!.occupants.filter((row) => row.zoneId === "a").length,
  4,
  "failure preserves positions",
);

// A background closure/ban cannot alter Scene navigation or attendance.
initializeVenueAccess(venue);
venue.access!.managerIds = [ids[0]];
scene.continuity = captureSceneContinuity(state, scene, at.getTime());
applyAccessCommand(
  venue,
  {
    action: "ban",
    operationId: "outside-ban",
    expectedRevision: venue.access!.revision,
    zoneId: "b",
    visitorId: "player",
  },
  ids[0],
  stamp,
  ["player", ...ids],
);
resolveVenueZone(venue, "b")!.closed = true;
assert.equal(contactCanEnter(state, venue, "b", "player", scene), true);
assert.equal(contactCanEnter(state, venue, "b", "player"), false);
assert.deepEqual(accessExits(scene, state, venue), []);
// A witnessed in-Scene access change does take effect, without restoring current-world rules.
const capturedVenue = scene.continuity.facts.venues[0];
applyAccessCommand(
  capturedVenue,
  {
    action: "ban",
    operationId: "scene-ban",
    expectedRevision: capturedVenue.access!.revision,
    zoneId: "b",
    visitorId: "player",
  },
  ids[0],
  stamp,
  ["player", ...ids],
);
assert.equal(contactCanEnter(state, venue, "b", "player", scene), false);
assert.equal(venue.access!.bans[0].id, "outside-ban");

// An older Scene can save a later ordinary property update, but cannot revive a removed target/item.
const paint = resolveVenueZone(venue, "a")!;
paint.state.condition = "blue motorcycle";
scene.continuity = captureSceneContinuity(state, scene, at.getTime());
const red = readVenueSceneChange(
  {
    happened: true,
    narration: "The motorcycle is painted red.",
    conditionBefore: "blue motorcycle",
    conditionAfter: "red motorcycle",
  },
  { ...venue, state: { ...venue.state, condition: "blue motorcycle" } },
)!;
paint.state.condition = "yellow motorcycle";
applyVenueSceneChange(state, "hall", red, "red", stamp, "community", "public", "", "a", true);
assert.equal(paint.state.condition, "red motorcycle", "red saved after yellow wins");
state.venueEvents.push({
  id: "venue-chat:crowd:red",
  venueId: "hall",
  venueName: "Hall",
  zoneId: "a",
  text: red.narration,
  at: stamp,
  actionReceipt: { ...red, happened: true, submissionId: "red", witnessIds: ids.slice(0, 4) },
});
scene.submissions.push({ id: "red" } as any);
paint.state.condition = "yellow motorcycle";
assert.equal(resolveVenueZone(sceneContinuityView(state, scene).venues[0], "a")!.state.condition, "red motorcycle");
scene.status = "closed";
assert.equal(
  paint.state.condition,
  "yellow motorcycle",
  "ending the Scene does not replay red over a later yellow save",
);
assert.throws(
  () =>
    applyVenueSceneChange(
      state,
      "hall",
      { narration: "Take vanished paint", removeItem: "paint" },
      "missing",
      stamp,
      "community",
      "public",
      "",
      "a",
      true,
    ),
  /no longer here/,
);

// Captured consent cannot modify a Zone that now belongs to someone else.
{
  const { state, ids } = fixture(4),
    venue = state.venues[0];
  const zone = resolveVenueZone(venue, "a")!;
  zone.ownerId = ids[0];
  zone.state.condition = "blue motorcycle";
  const saved = coerceSession({
    ...scene,
    id: "ownership-fence",
    status: "active",
    continuity: undefined,
    submissions: [],
  });
  saved.continuity = captureSceneContinuity(state, saved, at.getTime());
  zone.ownerId = ids[1];
  const service = createSceneCommands({
    readVillageState: async () => state,
    bindReplayEffects: (effects: any) => effects,
    mutateVillageState: async (change: any) => {
      const next = structuredClone(state);
      change(next);
      Object.assign(state, next);
      return state;
    },
  } as any);
  await assert.rejects(
    () =>
      service.sceneReplayEffects().applyVenueTurnChange(saved, {
        id: "red",
        at: stamp,
        areaAtTurn: "public",
        zoneIdAtTurn: "a",
        activeIdsAtTurn: ids,
        semanticProvenance: { version: 2 },
        sceneChange: {
          narration: "Painted red.",
          conditionBefore: "blue motorcycle",
          conditionAfter: "red motorcycle",
        },
      } as any),
    /Authority over this Zone changed/,
  );
  assert.equal(resolveVenueZone(state.venues[0], "a")!.state.condition, "blue motorcycle");
  assert.equal(state.exchangeReceipts["venue-chat:ownership-fence:red"], undefined);
}

// Village polling and Scene navigation survive background removal of the captured current Zone.
{
  const { state, ids } = fixture(4);
  const saved = coerceSession({ ...scene, id: "removed-zone", status: "active", continuity: undefined });
  saved.continuity = captureSceneContinuity(state, saved, at.getTime());
  state.venues[0].zones = state.venues[0].zones!.filter((zone) => zone.id !== "a");
  resolveVenueZone(state.venues[0], "b")!.closed = true;
  const snapshot = await createVillageSnapshot({
    readVillageState: async () => structuredClone(state),
    mutateVillageState: async (change: any) => {
      change(state);
      return state;
    },
    rollActiveAgendas: async () => false,
    listVillagerCards: async () => [],
    captureMissingVillagerCardColors: (card: any) => ({ ...card, nameColor: "", dialogueColor: "" }),
    sceneQueries: () => ({ activeVenueSession: async () => saved }),
    backgroundWorkSummaries: async () => [],
    privatePreparationRooms: () => [],
  } as any).buildVillageSnapshot(at);
  assert.equal(snapshot.villagers.find((person) => person.characterId === ids[0])!.place!.zoneId, "a");
  assert(!snapshot.settings.venues[0].zones!.some((zone) => zone.id === "a"));
  assert(snapshot.sceneVenue!.venue.zones!.some((zone) => zone.id === "a"));
  assert.equal(snapshot.sceneVenue!.venue.zones!.find((zone) => zone.id === "b")!.closed, false);
  assert.equal(snapshot.sceneVenue!.venue.access, undefined, "the Scene presentation reuses the sanitized projection");
}

// Access interpretation and readiness use the Scene receipt even when the live write is stale.
{
  const { state, ids } = fixture(4),
    venue = state.venues[0];
  initializeVenueAccess(venue);
  venue.access!.managerIds = [ids[0]];
  const saved = coerceSession({
    ...scene,
    id: "access-recovery",
    status: "active",
    continuity: undefined,
    submissions: [],
    lines: [],
  });
  saved.continuity = captureSceneContinuity(state, saved, at.getTime());
  const command = {
    action: "invite",
    operationId: "inside-invitation",
    expectedRevision: venue.access!.revision,
    zoneId: "b",
    visitorId: "player",
    duration: "visit",
    accompanied: false,
    outsideHours: false,
    sceneId: saved.id,
  };
  applyAccessCommand(
    venue,
    {
      action: "zone-policy",
      operationId: "new-owner",
      expectedRevision: venue.access!.revision,
      zoneId: "b",
      policy: { ...resolveVenueZone(venue, "b")!.access!, managerIds: [ids[1]] },
    },
    ids[0],
    stamp,
    ["player", ...ids],
  );
  const quote = "You can come into room b now.";
  saved.lines.push({
    id: "invitation-line",
    speakerId: ids[0],
    content: quote,
    kind: "dialogue",
    heardBy: ids,
    at: stamp,
  } as any);
  const check = {
    id: "invitation-check",
    domain: "room",
    question: "An invitation?",
    facts: {
      actorId: ids[0],
      venueId: "hall",
      zoneId: "b",
      accessRevision: 0,
      semanticVersion: 2,
      accessCommand: command,
    },
    evidence: [{ id: "draft:0", speakerId: ids[0], content: quote, current: true }],
    outcomes: [{ id: "invite-now", statement: quote }],
  };
  const result = { outcome: "invite-now", source: "system", evidenceIds: ["draft:0"] };
  const turn = {
    id: "invite",
    at: stamp,
    replyLineIds: ["invitation-line"],
    semanticProvenance: { version: 2, sourceHash: "accepted" },
    accessEvents: [{ id: check.id, interpretationVersion: 1, facts: check.facts, outcome: result.outcome }],
  } as any;
  saved.submissions.push(turn);
  const service = createSceneCommands({
    readVillageState: async () => structuredClone(state),
    readSession: async () => structuredClone(saved),
    changeSession: async (_id: string, change: any) => {
      change(saved);
      return structuredClone(saved);
    },
    mutateVillageState: async (change: any) => {
      change(state);
      return structuredClone(state);
    },
  } as any);
  const batch = { checks: [check], results: [result], traces: [{}] } as any;
  await service.recordRoomAccessEvents(saved, batch, turn.id);
  assert.equal(
    state.venues[0].access!.receipts[command.operationId].outcome,
    "rejected",
    "stale world authority is not restored",
  );
  assert.notEqual(saved.continuity!.facts.venues[0].access!.receipts[command.operationId].outcome, "rejected");
  await service.finishSemanticScene(saved.id);
  assert.equal(
    saved.submissions[0].semanticReady,
    true,
    "Scene readiness does not wait forever for a rejected world write",
  );
  const before = structuredClone(saved.continuity);
  await service.recordRoomAccessEvents(saved, batch, turn.id);
  assert.deepEqual(saved.continuity, before, "recovery reuses the Scene permission receipt");
}

// A witnessed relationship change can establish regular-visitor access in this same Scene.
{
  const { state, ids } = fixture(4),
    venue = state.venues[0];
  initializeVenueAccess(venue);
  venue.access!.managerIds = [ids[0]];
  const zone = resolveVenueZone(venue, "b")!;
  zone.access!.mode = "permission-required";
  zone.access!.regularVisitors = [{ inviterId: ids[0], relationship: "friend", accompanied: false }];
  state.relationshipContext = defaultRelationshipState(state.seed);
  state.relationshipContext.edges[relationshipKey(ids[0], "player")] = {
    ...neutralRelationship(ids[0], "player"),
    warmth: 24,
    trust: 30,
  };
  const saved = coerceSession({ ...scene, id: "friendship", status: "active", continuity: undefined });
  saved.continuity = captureSceneContinuity(state, saved, at.getTime());
  assert.equal(contactCanEnter(state, venue, "b", "player", saved), false);
  state.relationshipContext.receipts.friend = {
    id: "friend",
    sceneId: saved.id,
    fromId: ids[0],
    toId: "player",
    dimension: "warmth",
    before: 24,
    after: 26,
    at: stamp,
  } as any;
  assert.equal(contactCanEnter(state, venue, "b", "player", saved), true);
}

// A forced departure from a full Exterior chooses a real free destination and retains it privately.
{
  const { state, ids } = fixture(5),
    venue = state.venues[0];
  initializeVenueAccess(venue);
  venue.access!.managerIds = [ids[1]];
  resolveVenueZone(venue, "b")!.adaptationPending = true;
  let saved = coerceSession({
    ...scene,
    id: "forced",
    status: "active",
    zoneId: "exterior",
    activeIds: ids.slice(1),
    continuity: undefined,
    lines: [],
    submissions: [],
    sceneAttendance: {
      capturedAt: stamp,
      occupants: ids.map((characterId, i) => ({
        characterId,
        name: characterId,
        doing: "Here",
        zoneId: i ? "exterior" : "a",
      })),
    },
  });
  saved.continuity = captureSceneContinuity(state, saved, at.getTime());
  const captured = saved.continuity.facts.venues[0];
  applyAccessCommand(
    captured,
    {
      action: "ban",
      operationId: "scene-boundary",
      expectedRevision: captured.access!.revision,
      zoneId: "a",
      visitorId: ids[0],
    },
    ids[1],
    stamp,
    ["player", ...ids],
  );
  const live = createLiveScenes({
    readVillageState: async () => structuredClone(state),
    hasVenueOperation: () => false,
    readSession: async () => structuredClone(saved),
    changeSession: async (_id: string, change: any) => {
      const next = structuredClone(saved);
      change(next);
      saved = coerceSession(next);
      return structuredClone(saved);
    },
  } as any);
  saved = await live.refreshZoneParticipants(saved);
  assert(
    saved.departedIds!.includes(ids[0]),
    JSON.stringify({
      accompanying: saved.accompanying,
      occupants: saved.sceneAttendance?.occupants,
      destinations: saved.departureDestinations,
      exits: accessExits(saved, state, venue),
    }),
  );
  assert.equal(saved.departureDestinations![ids[0]].venueId, "home0");
  assert.equal(saved.activeIds.length, 4);
  assert.deepEqual(coerceSession(JSON.parse(JSON.stringify(saved))).departureDestinations, saved.departureDestinations);
  assert(!JSON.stringify(publicSceneResponse(saved)).includes("departureDestinations"));
}

console.log(
  "PASS Zone occupancy through twelve villagers, shared homes, generation budget, offscreen movement and Scene priority",
);
