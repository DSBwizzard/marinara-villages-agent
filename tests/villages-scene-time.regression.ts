import assert from "node:assert/strict";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageState } from "../packages/villages/src/server/domain/models/world.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
import {
  defaultRelationshipState,
  neutralRelationship,
  relationshipKey,
} from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import {
  captureSceneContinuity,
  captureSceneWishEffect,
  sceneContinuityView,
} from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
import { semanticContext } from "../packages/villages/src/server/domain/rules/semantic-contract.js";
import { resolveVenueZone } from "../packages/villages/src/server/domain/rules/venue-zones.js";
import {
  applyVillageMemory,
  forgetVillageMemory,
} from "../packages/villages/src/server/domain/rules/village-memories.js";
import { createLiveScenes } from "../packages/villages/src/server/features/scenes/live-session-service.js";
import { createVillageStateService } from "../packages/villages/src/server/features/world/village-state-service.js";
import { memoryProposal, memoryRepair } from "./helpers/memories-fixture.js";
import { fixtureWish } from "./helpers/social-wishes-fixture.js";

const day = 86400000;
const start = Date.now() - 3 * day,
  at = new Date(start).toISOString();
function fixture() {
  const state = coerceVillageState({
    ...defaultVillageState(),

    seed: "time-world",
    foundedAt: new Date(start - day).toISOString(),
    timeZone: "America/Los_Angeles",
    venues: [{ id: "square", name: "Square", classes: ["community"], description: "A quiet square" }],
    villagers: [
      {
        characterId: "a",
        addedAt: at,
        cardSnapshot: { id: "a", name: "Ada", capturedAt: at, revision: 1, sourceStatus: "available" },
      },
    ],
  });
  const resident = state.villagers[0]!;
  resident.agenda = unwrittenVillageAgenda(state.venues, "Ada");
  resident.wishes = [fixtureWish({ wish: "Share stories about motorcycles" }, "ride", at)];
  state.relationshipContext = defaultRelationshipState(state.seed);
  state.relationshipContext.reviewedActorIds = ["a"];
  state.relationshipContext.edges[relationshipKey("a", "player")] = {
    ...neutralRelationship("a", "player"),
    connection: "Friends",
  };
  const scene = coerceSession({
    version: 3,
    id: "morning",
    processingVersion: 1,
    villageSeed: state.seed,
    placeId: "square",
    placeName: "Square",
    status: "active",
    zoneId: "community",
    area: "public",
    spaceClass: "community",
    startedAt: at,
    lastActivityAt: at,
    participants: [{ characterId: "a", name: "Ada", doing: "Showing a motorcycle" }],
    activeIds: ["a"],
    sceneAttendance: {
      capturedAt: at,
      occupants: [
        {
          characterId: "a",
          name: "Ada",
          doing: "Showing a motorcycle",
          zoneId: "community",
          availability: "online",
        },
      ],
    },
    lines: [],
    submissions: [],
  });
  return { state, scene, resident, wish: resident.wishes[0]! };
}
function learn(state: VillageState, text: string, sceneId?: string) {
  const next = memoryProposal(state.memories, { text, audience: ["a"], patch: { kind: "information" } });
  if (sceneId) next.proposal.source.sceneId = sceneId;
  applyVillageMemory(state, next.proposal, next.context);
  return state.memories.records.at(-1)!;
}

{
  const { state, scene } = fixture();
  let raw = structuredClone(state);
  const relationships = structuredClone(state.relationshipContext!);
  delete raw.relationshipContext;
  const world = createVillageStateService(
    {
      readAuthority: async () => structuredClone(raw),
      mutateAuthority: async (update) => {
        const candidate = structuredClone(raw);
        await update(candidate);
        raw = candidate;
      },
    },
    () => ({
      readRelationshipState: async () => structuredClone(relationships),
      reconcileRelationships() {},
      persistRelationshipAuthority: async () => {},
      processSocialOutbox: async () => false,
      projectSocialActivities() {},
      reconcileSocialPlans() {},
    }),
  );
  const live = createLiveScenes({
    ...world,
    readActive: async () => ({ sessionId: scene.id, placeId: scene.placeId }),
    readSession: async () => structuredClone(scene),
    changeSession: async (_id, change) => {
      change(scene);
      return structuredClone(scene);
    },
    clearActivePointer: async () => {},
    hasVenueOperation: () => false,
  });
  await live.requireLiveVenueSession(scene.id);
  assert.equal(raw.relationshipContext, undefined, "world DTO remains separate from relationship authority");
  assert.equal(
    scene.continuity!.facts.relationshipContext!.edges[relationshipKey("a", "player")]!.connection,
    "Friends",
    "actual Scene setup captures hydrated relationships before world normalization strips them",
  );
  relationships.edges[relationshipKey("a", "player")]!.connection = "Former friends";
  assert.equal(
    sceneContinuityView(await world.readVillageState(), scene).relationshipContext!.edges[
      relationshipKey("a", "player")
    ]!.connection,
    "Friends",
  );
}

{
  const { state, scene } = fixture();
  const oldMemory = learn(state, "Ada likes the morning market");
  scene.continuity = captureSceneContinuity(state, scene, start);
  const privateSnapshot = structuredClone(scene.continuity);
  state.playerPersonaName = "Future player identity";
  state.venues[0]!.name = "Future venue name";
  state.venues[0]!.occupancy.residentCharacterId = "a";
  state.residences.push({ id: "future-move", characterId: "a", status: "pending", proposedVenueId: "square" } as any);
  const laterMemory = learn(state, "Ada opened a new shop during the three days");
  state.villagers[0]!.wishes = [];
  state.relationshipContext!.edges[relationshipKey("a", "player")]!.connection = "Former friends";
  state.simulatedThrough = new Date().toISOString();
  resolveVenueZone(state.venues[0]!, "community")!.description = "A changed Village";
  const packet = semanticContext(scene, state, "market shop", false, false, sceneContinuityView(state, scene));
  assert(
    packet.memory.memories.some((row) => row.id === laterMemory.id),
    "System sees fresh memory for write screening",
  );
  const frozen = sceneContinuityView(state, scene).memories;
  assert(frozen.records.some((row) => row.id === oldMemory.id));
  assert(!frozen.records.some((row) => row.id === laterMemory.id));
  assert.equal(packet.actors[0]!.wishes[0]!.id, "ride");
  assert.equal(packet.requests.residences.length, 0, "background housing is outside the Scene snapshot");
  assert.equal(packet.requests.venues[0]!.name, "Square");
  assert.equal(packet.requests.venues[0]!.occupancy.residentCharacterId, null);
  assert.notEqual((publicSceneResponse(scene) as any).playerName, "Future player identity");
  assert.equal(packet.time!.capturedAt, at);
  assert.equal(
    sceneContinuityView(state, scene).relationshipContext!.edges[relationshipKey("a", "player")]!.connection,
    "Friends",
  );
  assert.equal(
    sceneContinuityView(state, scene).simulatedThrough,
    state.simulatedThrough,
    "the world clock stays live",
  );
  assert.deepEqual(scene.continuity, privateSnapshot, "projection does not mutate captured facts");
  assert.equal((publicSceneResponse(scene) as any).continuity, undefined);
  const restored = coerceSession(JSON.parse(JSON.stringify(scene))).continuity!;
  assert.equal(restored.capturedAt, at, "capture survives a restart");
  assert(!("memories" in restored.facts), "A Scene never copies the memory collection");
  assert.equal(restored.facts.villagers[0]!.wishes[0]!.id, "ride");
  assert.equal(restored.facts.relationshipContext!.edges[relationshipKey("a", "player")]!.connection, "Friends");
  assert.throws(
    () => coerceSession({ version: 3, ...scene, continuity: { ...scene.continuity, version: 99 } }),
    /captured context/,
  );
}

{
  const { state, scene } = fixture();
  const zone = resolveVenueZone(state.venues[0]!, "community")!;
  zone.description = "A motorcycle and an unchanged chair.";
  scene.continuity = captureSceneContinuity(state, scene, start);
  const after = {
    description: "A parked motorcycle, helmet and unchanged chair.",
    state: { revision: 1, updatedAt: at, recent: null },
  };
  const id = `venue-chat:${scene.id}:hop`;
  const event: any = {
    id,
    venueId: scene.placeId,
    venueName: "Square",
    zoneId: scene.zoneId,
    at,
    text: "Ada parks the motorcycle.",
    actionReceipt: { happened: true, submissionId: "hop", narration: "Parks it", expectedRevision: 0, after },
  };
  state.exchangeReceipts[id] = {
    id,
    sceneId: scene.id,
    submissionId: "hop",
    domain: "physical",
    at,
    status: "applied",
    evidenceIds: [],
    reason: "Accepted",
    physicalOutcome: event,
  };
  scene.submissions.push({ id: "hop" } as any);
  zone.description = "An unrelated later delivery.";
  zone.state.revision++;
  const before = structuredClone(state);
  const view = sceneContinuityView(state, scene);
  const projected = resolveVenueZone(view.venues[0]!, "community")!;
  assert.equal(projected.description, after.description);
  assert.deepEqual(projected.state, after.state);
  assert.deepEqual(state, before, "physical presentation does not mutate live reality");
}

{
  const { state, scene, wish } = fixture();
  scene.continuity = captureSceneContinuity(state, scene, start);
  const facts = captureSceneWishEffect(state, "a", wish.id);
  state.exchangeReceipts.reveal = {
    id: "reveal",
    sceneId: scene.id,
    submissionId: "reveal",
    domain: "wishes",
    actorId: "a",
    wishId: wish.id,
    at: new Date().toISOString(),
    status: "applied",
    reason: "Disclosed",
    evidenceIds: ["said"],
    sceneFacts: facts,
  };
  scene.submissions.push({ id: "reveal" } as any);
  wish.wish = "A later different Wish";
  const view = sceneContinuityView(state, scene);
  assert.equal(view.villagers[0]!.wishes[0]!.wish, "Share stories about motorcycles");
}

{
  const { state, scene } = fixture();
  scene.continuity = captureSceneContinuity(state, scene, start);
  const own = learn(state, "Ada enjoys sharing her motorcycle", scene.id);
  forgetVillageMemory(
    state,
    memoryRepair(state.memories, "forget", ["a"], undefined, own.id),
    new Date().toISOString(),
  );
  assert.equal(
    sceneContinuityView(state, scene).memories.records[0].text,
    "Ada enjoys sharing her motorcycle",
    "External Forget does not rewrite this Scene",
  );
}

{
  const { state, scene } = fixture();
  scene.continuity = captureSceneContinuity(state, scene, start);
  const rel = state.relationshipContext!;
  const future = { ...neutralRelationship("a", "player"), connection: "Partners", stance: "FUTURE", revision: 2 };
  rel.edges[relationshipKey("a", "player")] = future;
  assert.equal(
    sceneContinuityView(state, scene).relationshipContext!.edges[relationshipKey("a", "player")]!.connection,
    "Friends",
    "Later global perspectives cannot rewrite a captured Scene",
  );
  const local = { ...neutralRelationship("a", "player"), connection: "Friends", stance: "Said here", revision: 1 };
  rel.receipts.local = {
    id: "local",
    sceneId: scene.id,
    submissionId: "own-turn",
    sourceId: "local",
    fromId: "a",
    toId: "player",
    beforeRevision: 0,
    sceneAfter: local,
    liveAfter: future,
    reason: "Shared here",
    at,
    lineIds: [],
    evidence: [],
  };
  scene.submissions.push({ id: "own-turn" } as any);
  const known = sceneContinuityView(state, scene).relationshipContext!;
  assert.equal(
    known.edges[relationshipKey("a", "player")]!.connection,
    "Friends",
    "This Scene's own social evidence advances its captured perspective",
  );
  assert.equal(known.edges[relationshipKey("a", "player")]!.stance, "Said here");
}

{
  const { state, scene } = fixture();
  state.opening = {
    id: "opening",
    version: 2,
    stage: "project",
    projectId: "opening-project",
    reveals: [],
    residentIds: ["a"],
    proposals: [],
    declinedIds: [],
    outcome: "",
    communityVenueId: "square",
    gatheringSceneId: "gathering",
  };
  scene.continuity = captureSceneContinuity(state, scene, start);
  state.opening.stage = "first-use";
  assert.equal(
    semanticContext(scene, state, "hello", false, false, sceneContinuityView(state, scene)).opening!.stage,
    "project",
    "background completion cannot advance an old Scene's opening context",
  );
  const legacy = JSON.parse(JSON.stringify(scene));
  delete legacy.continuity.facts.opening;
  const restoredLegacy = coerceSession(legacy);
  assert.equal(restoredLegacy.continuity!.facts.opening, undefined);
  assert.equal(
    sceneContinuityView(state, restoredLegacy).opening,
    undefined,
    "Missing captured opening context cannot import future background guidance",
  );
  state.opening.reveals.push({
    residentId: "a",
    sceneId: scene.id,
    submissionId: "pitch",
    lineId: "spoken",
    quote: "Our idea",
  });
  assert.equal(sceneContinuityView(state, scene).opening!.reveals.length, 1, "own spoken pitch remains established");
}

console.log("PASS persistent Scene time, exact context, expiry holds, restart safety, live authority and privacy");
