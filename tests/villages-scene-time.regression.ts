import assert from "node:assert/strict";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { createExchangeProcessing } from "../packages/villages/src/server/domain/decoding/exchange-codec.js";
import {
  captureSceneContinuity,
  captureSceneWishEffect,
  sceneContinuityView,
} from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import {
  protectSceneWishes,
  releaseSceneWishes,
  sceneWishProtected,
} from "../packages/villages/src/server/domain/rules/scene-wish-protection.js";
import { expireResidentWishes } from "../packages/villages/src/server/domain/rules/wish-lifecycle-rules.js";
import { currentWish } from "../packages/villages/src/server/domain/rules/wish-progress-rules.js";
import { wishFingerprint } from "../packages/villages/src/server/domain/rules/wish-interpretation-rules.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
import { semanticContext } from "../packages/villages/src/server/domain/rules/semantic-contract.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
import { resolveVenueZone } from "../packages/villages/src/server/domain/rules/venue-zones.js";
import {
  defaultRelationshipState,
  neutralRelationship,
  relationshipKey,
} from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { createLiveMemory } from "../packages/villages/src/server/features/residents/live-memory-service.js";
import { createLiveScenes } from "../packages/villages/src/server/features/scenes/live-session-service.js";
import { createVillageStateService } from "../packages/villages/src/server/features/world/village-state-service.js";
import { createWorldCoordination } from "../packages/villages/src/server/features/world/village-service.js";
import { notFound } from "../packages/villages/src/server/domain/rules/errors.js";
import type { VillageChronicleEntry, VillageState } from "../packages/villages/src/server/domain/models/world.js";

const day = 86400000;
const start = Date.now() - 3 * day,
  at = new Date(start).toISOString();
function fixture() {
  const state = coerceVillageState({
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
  resident.agenda.wishes = [
    {
      id: "ride",
      wish: "Show the player my motorcycle",
      tell: "Hop on!",
      intensity: 2,
      addedAt: at,
      expiresAt: new Date(start + 3600000).toISOString(),
    },
  ];
  state.relationshipContext = defaultRelationshipState(state.seed);
  state.relationshipContext.edges[relationshipKey("a", "player")] = {
    ...neutralRelationship("a", "player"),
    warmth: 25,
    familiarity: 1,
  };
  const scene = coerceSession({
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
  return { state, scene, resident, wish: resident.agenda.wishes[0]! };
}
const memory = (id: string, text: string): VillageChronicleEntry => ({
  id,
  text,
  scope: "private",
  kind: "chat",
  dayIndex: 0,
  clock: "morning",
  actors: [{ id: "a", name: "Ada" }],
  knownByCharacterIds: ["a"],
  occurredAt: at,
  timePrecision: "exact",
});

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
    scene.continuity!.facts.relationshipContext!.edges[relationshipKey("a", "player")]!.warmth,
    25,
    "actual Scene setup captures hydrated relationships before world normalization strips them",
  );
  relationships.edges[relationshipKey("a", "player")]!.warmth = -20;
  assert.equal(
    sceneContinuityView(await world.readVillageState(), scene).relationshipContext!.edges[
      relationshipKey("a", "player")
    ]!.warmth,
    25,
  );
}

{
  const { state, scene, resident, wish } = fixture();
  state.setupAt = state.foundedAt;
  state.storyPace = "off";
  protectSceneWishes(state, scene, start);
  let readFailure: "unknown" | "missing" | "" = "";
  const world = createWorldCoordination({
    readVillageState: async () => structuredClone(state),
    mutateVillageState: async (change: (state: VillageState) => void) => {
      change(state);
      return structuredClone(state);
    },
    readScene: async () => {
      if (readFailure === "unknown") throw Error("Temporary storage failure");
      if (readFailure === "missing") throw notFound("Missing Scene");
      return scene;
    },
    buildVillageSnapshot: async () => ({}),
    villagesLogger: () => ({ warn() {} }),
    reconcileProjectLifecycles() {},
    expireResidentWishes,
    rollActiveAgendas: async () => {},
    respondDueVenueMail: async () => {},
    outsideVenueOperation: (work: () => void) => work(),
    preparePrivateSpaces: async () => {},
    backfillAgendas: async (value: VillageState) => value,
    refreshVillagerRemaps: async () => {},
    reconcileWishLifecycle: async () => {},
  } as any);
  await world.reconcileVillage();
  assert.equal(resident.agenda!.wishes.length, 1);
  assert.deepEqual(state.wishRefillIntents, {}, "held expiry cannot enqueue a replacement");
  assert(Date.parse(state.simulatedThrough) > start, "the wider Village advances during the same protected Scene");
  readFailure = "unknown";
  await world.reconcileVillage();
  assert(sceneWishProtected(state, "a", wish), "uncertain Scene reads never discard eligibility");
  readFailure = "missing";
  await world.reconcileVillage();
  assert.equal(sceneWishProtected(state, "a", wish), false, "missing documents release orphan holds");
  assert.equal(resident.agenda!.wishes.length, 0);
  assert(state.wishRefillIntents.a, "ordinary expiry/refill resumes after release");
}

{
  const { state, scene, resident, wish } = fixture();
  protectSceneWishes(state, scene, start);
  const deadline = wish.expiresAt;
  // Simulate restart after hold persistence, before the Scene document write.
  const restarted = coerceVillageState(JSON.parse(JSON.stringify(state)));
  scene.continuity = captureSceneContinuity(restarted, scene, Date.now());
  assert.equal(scene.continuity.facts.villagers[0]!.agenda!.wishes.length, 1);
  const proposal = {
    actorId: "a",
    wishId: wish.id,
    fingerprint: wishFingerprint(wish),
    intent: "check" as const,
    lineIds: [],
  };
  assert(currentWish(state, proposal, Date.now(), scene.id), "this Scene retains exact initial eligibility");
  assert.equal(currentWish(state, proposal, Date.now(), "another"), null, "another Scene receives no expiry exception");
  assert.equal(currentWish(state, proposal, Date.now()), null);
  expireResidentWishes(resident, new Date(), state);
  assert.equal(resident.agenda!.wishes.length, 1);
  assert.equal(wish.expiresAt, deadline, "protection never extends or rewrites the real deadline");
  const changed = { ...wish, wish: "A different motorcycle" };
  assert.equal(sceneWishProtected(state, "a", changed, scene.id), false, "correction replaces the fingerprint");
  resident.agenda!.wishes = [];
  assert.equal(currentWish(state, proposal, Date.now(), scene.id), null, "retirement/deletion still wins");
  resident.agenda!.wishes = [wish];
  scene.status = "closed";
  const processing = createExchangeProcessing({
    seed: state.seed,
    sceneId: scene.id,
    submissionId: "last",
    order: 0,
    lineIds: [],
    actionReceiptIds: [],
  });
  scene.submissions.push({ id: "last", at, processing } as any);
  releaseSceneWishes(state, scene);
  assert(sceneWishProtected(state, "a", wish), "closed final exchange retains its hold during recovery");
  for (const domain of Object.values(processing.domains)) domain.status = "rejected";
  releaseSceneWishes(state, scene);
  assert.equal(sceneWishProtected(state, "a", wish), false, "terminal rejected domains also release the hold");
  expireResidentWishes(resident, new Date(), state);
  assert.equal(resident.agenda!.wishes.length, 0);
}

{
  const { state, scene } = fixture();
  state.chronicle = [memory("old", "Ada likes the morning market")];
  scene.continuity = captureSceneContinuity(state, scene, start);
  const privateSnapshot = structuredClone(scene.continuity);
  state.chronicle.unshift(memory("later", "Ada opened a new shop during the three days"));
  state.villagers[0]!.agenda!.wishes = [];
  state.relationshipContext!.edges[relationshipKey("a", "player")]!.warmth = -20;
  state.simulatedThrough = new Date().toISOString();
  resolveVenueZone(state.venues[0]!, "community")!.state.condition = "A changed Village";
  const packet = semanticContext(scene, state, "I hop on", false, false, sceneContinuityView(state, scene));
  assert(packet.memories.some((row) => row.id === "old"));
  assert(!packet.memories.some((row) => row.id === "later"));
  assert.equal(packet.actors[0]!.wishes[0]!.id, "ride");
  assert.equal(packet.time!.capturedAt, at);
  assert.equal(
    sceneContinuityView(state, scene).relationshipContext!.edges[relationshipKey("a", "player")]!.warmth,
    25,
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
  assert.equal(restored.facts.chronicle[0]!.text, scene.continuity.facts.chronicle[0]!.text);
  assert.equal(restored.facts.villagers[0]!.agenda!.wishes[0]!.id, "ride");
  assert.equal(restored.facts.relationshipContext!.edges[relationshipKey("a", "player")]!.warmth, 25);
  assert.throws(
    () => coerceSession({ ...scene, continuity: { ...scene.continuity, version: 99 } }),
    /captured context/,
  );
}

{
  const { state, scene } = fixture();
  const zone = resolveVenueZone(state.venues[0]!, "community")!;
  zone.state.items = ["motorcycle", "unchanged chair"];
  const priorId = `venue-chat:${scene.id}:prior`;
  state.venueEvents = [
    {
      id: priorId,
      venueId: scene.placeId,
      venueName: "Square",
      zoneId: scene.zoneId,
      at,
      text: "An earlier action",
      actionReceipt: { happened: true, submissionId: "prior", narration: "Earlier", addItem: "removed later" },
    },
  ];
  scene.submissions.push({ id: "prior" } as any);
  scene.continuity = captureSceneContinuity(state, scene, start);
  const id = `venue-chat:${scene.id}:hop`;
  const event = {
    id,
    venueId: scene.placeId,
    venueName: "Square",
    zoneId: scene.zoneId,
    at: new Date().toISOString(),
    text: "Ada moves the motorcycle",
    actionReceipt: {
      happened: true,
      submissionId: "hop",
      narration: "Moves it",
      conditionBefore: "Live condition after outside changes",
      conditionAfter: "Motorcycle parked",
      removeItem: "motorcycle",
      addItem: "helmet",
    },
  };
  state.exchangeReceipts[id] = {
    id,
    sceneId: scene.id,
    submissionId: "hop",
    domain: "physical",
    at: event.at,
    status: "applied",
    evidenceIds: [],
    reason: "Accepted",
    physicalOutcome: event,
  };
  scene.submissions.push({ id: "hop" } as any);
  zone.state.items = ["unrelated later delivery"];
  const before = structuredClone(state);
  const view = sceneContinuityView(state, scene);
  const projected = resolveVenueZone(view.venues[0]!, "community")!.state;
  assert.deepEqual(projected.items, ["unchanged chair", "helmet"]);
  assert.equal(
    projected.condition,
    "Motorcycle parked",
    "accepted after-values project without repeating live preconditions",
  );
  assert(!projected.items.includes("removed later"), "legacy capture does not replay already-reflected receipts");
  assert.deepEqual(state, before, "physical presentation consumes no live resources or stock");
}

{
  const { state, scene, wish } = fixture();
  protectSceneWishes(state, scene, start);
  scene.continuity = captureSceneContinuity(state, scene, start);
  wish.learnedAt = new Date().toISOString();
  state.wishKnowledge.a = [{ wishId: wish.id, text: wish.wish, learnedAt: wish.learnedAt, lineIds: ["said"] }];
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
  state.wishKnowledge.a[0]!.text = "Later private correction";
  wish.wish = "A later different Wish";
  const view = sceneContinuityView(state, scene);
  assert.equal(view.wishKnowledge.a![0]!.text, "Show the player my motorcycle");
  assert.equal(view.villagers[0]!.agenda!.wishes[0]!.wish, "Show the player my motorcycle");
}

{
  const { state, scene } = fixture();
  scene.continuity = captureSceneContinuity(state, scene, start);
  scene.lines = [
    {
      id: "said",
      role: "assistant",
      speakerId: "a",
      name: "Ada",
      kind: "dialogue",
      content: "Hop on my motorcycle!",
      at,
      heardBy: ["a"],
    },
  ];
  scene.submissions.push({
    id: "memory",
    at,
    liveProposals: {
      version: 1,
      memoryChanges: [
        {
          kind: "passing",
          text: "Ada is showing her motorcycle",
          subjectCharacterIds: ["a"],
          knownByCharacterIds: ["a"],
          evidence: [0],
        },
        {
          kind: "durable",
          text: "Ada enjoys sharing her motorcycle",
          category: "preference",
          subjectCharacterIds: ["a"],
          knownByCharacterIds: ["a"],
          evidence: [0],
        },
      ],
      relationshipChanges: { changes: [], permissions: [], disclosures: [] },
      playerLineId: "",
      replyLineIds: ["said"],
      earlierLineIds: [],
      memoryVersions: {},
    },
  } as any);
  const service = createLiveMemory({
    readVillageState: async () => state,
    readVillageAuthority: async () => state,
    mutateVillageState: async (change: (state: VillageState) => void) => {
      change(state);
      return state;
    },
    mutateRelationships: async () => assert.fail("No relationship writes"),
  } as any);
  assert.equal((await service.processLiveMemories(scene, "memory")).status, "applied");
  assert.equal(state.recollections.length, 0, "overdue passing context is not revived in live Village retention");
  const own = state.chronicle[0]!;
  own.text = "Later outside correction";
  own.supersededBy = "later";
  const view = sceneContinuityView(state, scene);
  assert.equal(
    view.recollections[0]!.text,
    "Ada is showing her motorcycle",
    "the same Scene retains its temporary context through delayed recovery",
  );
  assert.equal(
    view.chronicle[0]!.text,
    "Ada enjoys sharing her motorcycle",
    "later mutable memory versions cannot replace accepted Scene context",
  );
  assert.equal(view.chronicle[0]!.supersededBy, undefined);
  const receipts = structuredClone(state.exchangeReceipts);
  await service.processLiveMemories(scene, "memory");
  assert.deepEqual(state.exchangeReceipts, receipts, "recovery reuses the exact accepted context");
}

console.log("PASS persistent Scene time, exact context, expiry holds, restart safety, live authority and privacy");
