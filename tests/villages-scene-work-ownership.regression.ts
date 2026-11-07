import { savedAccessEvents } from "../packages/villages/src/server/domain/rules/scene-reply.js";
import { SEMANTIC_OPERATION_BUDGET } from "../packages/villages/src/server/domain/rules/semantic-contract.js";
import assert from "node:assert/strict";
import {
  activationScope,
  bindActivationService,
  createActivationScope,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { createExchangeProcessing } from "../packages/villages/src/server/domain/decoding/exchange-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { rememberDomainFact } from "../packages/villages/src/server/domain/rules/domain-memories.js";
import { initializeVenueAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { bindLiveProposals } from "../packages/villages/src/server/domain/rules/live-exchange.js";
import { venueDraftFixture as venueDraft } from "./helpers/venues.fixture.js";
import { WISH_PROPOSAL_INSTRUCTION } from "../packages/villages/src/server/domain/rules/wish-progress-rules.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import {
  createSceneCommands,
  type SceneCommandPorts,
} from "../packages/villages/src/server/features/scenes/command-service.js";
import { createSceneWork } from "../packages/villages/src/server/features/scenes/scene-work-service.js";
import { configureSceneWork, sceneWork } from "../packages/villages/src/server/features/scenes/scene-work.js";
import {
  configureSceneCommands,
  enterVenue,
  greetVenue,
  moveVenueZone,
  sceneReplayEffects,
  sendVenueTurn,
} from "../packages/villages/src/server/features/scenes/venue-session.js";
import { VENUE_REPLY_MAX_TOKENS } from "../packages/villages/src/server/features/scenes/writing.js";
import { coordinateVenue } from "../packages/villages/src/server/jobs/venue-coordinator.js";
import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
import { fixtureWish, wishWorld } from "./helpers/social-wishes-fixture.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import {
  captureSceneContinuity,
  captureSceneWishEffect,
} from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { mutableSocialWish } from "../packages/villages/src/server/domain/rules/social-wishes.js";
import { reserveMemoryScene } from "../packages/villages/src/server/domain/rules/village-memories.js";
import { defaultRelationshipState } from "../packages/villages/src/server/domain/rules/relationship-rules.js";
function deferred() {
  return Promise.withResolvers<void>();
}
function commandFixture(
  label: string,
  configure?: (context: {
    scene: ReturnType<typeof coerceSession>;
    world: ReturnType<typeof defaultVillageState>;
    touch(stage: string): Promise<void>;
    stamp: string;
  }) => Partial<SceneCommandPorts>,
) {
  const stamp = "2026-10-07T12:00:00.000Z";
  const world = defaultVillageState();
  world.seed = "same-seed";
  world.exchangeReceipts["same-effect"] = {
    id: "same-effect",
    sceneId: "same-scene",
    submissionId: "same-turn",
    domain: "physical",
    at: stamp,
    committedAt: stamp,
    status: "applied",
    evidenceIds: [],
    reason: "Confirmed physical outcome",
    notice: { id: "same-notice", kind: "venue", text: label + " saved effect" },
  };
  const scene = coerceSession({
    version: 4,
    id: "same-scene",
    villageSeed: world.seed,
    semanticVersion: 2,
    placeId: "same-place",
    placeName: label,
    status: "active",
    startedAt: stamp,
    participants: [],
    lines: [],
    submissions: [
      {
        id: "same-turn",
        mode: "chat",
        message: "Already saved",
        targetId: "",
        at: stamp,
        wishId: "",
        wishMemory: "",
        verdict: null,
        recordEvents: [],
        processing: createExchangeProcessing({
          seed: world.seed,
          sceneId: "same-scene",
          submissionId: "same-turn",
          order: 1,
          lineIds: [],
          actionReceiptIds: [],
        }),
      },
    ],
  });
  const calls: string[] = [],
    owners: unknown[] = [],
    unexpected: string[] = [];
  const owner = createActivationScope(),
    work = createSceneWork();
  const gate = deferred(),
    entered = deferred(),
    exact = new Error(label + " exact failure");
  let pause = "",
    fail = "",
    paused = false,
    guardDisposed = false,
    modelAccess = 0;
  async function touch(stage: string) {
    calls.push(stage);
    owners.push(activationScope());
    if (guardDisposed && !owner.active) throw exact;
    if (stage === fail) throw exact;
    if (stage === pause && !paused) {
      paused = true;
      entered.resolve();
      await gate.promise;
      if (guardDisposed && !owner.active) throw exact;
    }
  }
  const supplied: Partial<SceneCommandPorts> = {
    sceneNarrative: undefined,
    activationScope,
    bindReplayEffects: bindActivationService,
    VENUE_REPLY_MAX_TOKENS,
    WISH_PROPOSAL_INSTRUCTION,
    sceneWork: () => work,
    readVillageState: async () => {
      await touch("world-read");
      return world;
    },
    readActive: async () => {
      await touch("presence");
      return { sessionId: scene.id, placeId: scene.placeId };
    },
    readSession: async (id) => {
      assert.equal(id, scene.id);
      await touch("session");
      return scene;
    },
    coordinateVenue: async (id, submissionId, kind, input, expected, retry, run, options) => {
      assert.equal(id, scene.id);
      assert.equal(submissionId, "same-turn");
      assert.equal(kind, "turn");
      assert.deepEqual(input, {
        message: "Already saved",
        mode: "chat",
        targetId: "",
        semanticBudget: SEMANTIC_OPERATION_BUDGET,
      });
      assert.equal(expected, undefined);
      assert.equal(retry, undefined);
      assert.equal(options?.replay, true);
      await touch("admission");
      return run();
    },
    processSavedExchange: async (id, submissionId) => {
      assert.equal(id, scene.id);
      assert.equal(submissionId, "same-turn");
      await touch("progress");
    },
    mutateVillageState: async (change) => {
      await touch("world");
      await change(world);
      return world;
    },
    readVillageSnapshot: async () => {
      await touch("snapshot");
      return world;
    },
    changeSession: async (id, change) => {
      assert.equal(id, scene.id);
      await touch("persistence");
      await change(scene);
      return scene;
    },
    runtimeDebug: () => {},
    villagesLogger: () => ({
      debug() {},
      info() {},
      warn() {
        calls.push("warning");
      },
    }),
    villagesLanguageModels: () => {
      modelAccess++;
      throw new Error("Saved replay may not resolve a model");
    },
    completeWithRoom: async () => {
      modelAccess++;
      throw new Error("Saved replay may not request a completion");
    },
  };
  Object.assign(supplied, configure?.({ scene, world, touch, stamp }));
  for (const turn of scene.submissions)
    if (turn.liveProposals)
      turn.liveProposals = bindLiveProposals(
        turn.liveProposals,
        turn.liveProposals.playerLineId,
        turn.liveProposals.replyLineIds,
        scene.lines,
      );
  // Unused typed connections fail if this replay unexpectedly enters another command path.
  const ports = new Proxy(supplied, {
    get(target, property) {
      if (property in target) return Reflect.get(target, property);
      return () => {
        unexpected.push(String(property));
        throw new Error("Unexpected command connection: " + String(property));
      };
    },
  }) as SceneCommandPorts;
  const service = createSceneCommands(ports);
  assert.deepEqual(calls, [], "Scene command construction must be inert");
  assert.equal(modelAccess, 0);
  return {
    scene,
    world,
    work,
    calls,
    owners,
    unexpected,
    owner,
    service,
    gate,
    entered,
    exact,
    pause(stage: string) {
      pause = stage;
    },
    fail(stage: string) {
      fail = stage;
    },
    guardDisposal() {
      guardDisposed = true;
    },
    get modelAccess() {
      return modelAccess;
    },
  };
}
{
  let writes = 0;
  const physical = commandFixture("Missing captured physical Zone", ({ scene, world, stamp }) => {
    const venue = venueDraft({ name: "Hall", description: "A hall", classes: ["other"] }, null);
    venue.id = scene.placeId;
    world.venues = [venue];
    scene.zoneId = "other";
    scene.navigationReceipts = [
      {
        id: "later-move",
        originZoneId: "exterior",
        destinationZoneId: "other",
        at: new Date(Date.parse(stamp) + 1000).toISOString(),
      },
    ];
    return {
      mutateVillageState: async (change) => {
        const draft = structuredClone(world);
        await change(draft);
        writes++;
        Object.assign(world, draft);
        return world;
      },
    };
  });
  try {
    const turn = physical.scene.submissions[0];
    turn.placeUpdate = { narration: "The wall is blue.", expectedRevision: 0, append: "Blue paint." };
    turn.areaAtTurn = "outside";
    turn.privateOwnerIdAtTurn = "";
    turn.semanticProvenance = { version: 2 } as any;
    turn.physicalContext = {
      actorIds: ["player"],
      witnessIds: [],
      consentIds: [],
      positions: { player: "exterior" },
    } as any;
    const effects = physical.owner.run(() => physical.service.sceneReplayEffects());
    const before = structuredClone(physical.world);
    await assert.rejects(effects.applyVenueTurnChange(physical.scene, turn), /physical source.*captured Zone/);
    assert.equal(writes, 0);
    assert.equal(physical.modelAccess, 0);
    assert.deepEqual(physical.world, before, "Later navigation cannot supply a missing physical source address");
    turn.physicalContext.zoneId = "exterior";
    await assert.rejects(effects.applyVenueTurnChange(physical.scene, turn), /current outcome receipt/);
    assert.equal(writes, 0);
    assert.equal(physical.modelAccess, 0);
    assert.deepEqual(physical.world, before, "missing outcome metadata cannot create bare physical events");
    const id = "venue-chat:" + physical.scene.id + ":" + turn.id;
    physical.world.exchangeReceipts[id] = {
      ...physical.world.exchangeReceipts["same-effect"],
      id,
      sceneId: physical.scene.id,
      submissionId: turn.id,
    };
    const committed = structuredClone(physical.world);
    await effects.applyVenueTurnChange(physical.scene, turn);
    assert.deepEqual(physical.world, committed, "Committed receipt replay never reinterprets missing source data");
    assert.equal(physical.modelAccess, 0);
  } finally {
    physical.owner.dispose();
  }
}

for (const sourceVersion of [undefined, 2] as const) {
  const physical = commandFixture("Delayed physical Memory", ({ scene, world, stamp }) => {
    const place = venueDraft({ name: "Hall", description: "A hall.", classes: ["other"] }, null);
    place.id = scene.placeId;
    initializeVenueAccess(place);
    place.access!.managerIds = ["player"];
    world.venues = [place];
    scene.zoneId = "exterior";
    rememberDomainFact(world, {
      id: "earlier",
      at: stamp,
      recordedAt: stamp,
      text: "An unrelated established fact.",
      knowers: ["player"],
      subjects: [],
    });
    return {
      mutateVillageState: async (change, options) => {
        assert.equal(options?.memories, true);
        const draft = structuredClone(world);
        await change(draft);
        Object.assign(world, draft);
        return world;
      },
    };
  });
  try {
    const turn = physical.scene.submissions[0]!;
    Object.assign(turn, {
      ...(sourceVersion ? { sceneHearingVersion: sourceVersion } : {}),
      placeUpdate: { narration: "Paint was applied.", expectedRevision: 0, append: "Blue paint on the wall." },
      areaAtTurn: "outside",
      privateOwnerIdAtTurn: "",
      semanticProvenance: { version: 2 },
      physicalOutcomeVersion: 1,
      physicalContext: {
        zoneId: "exterior",
        actorIds: ["player"],
        witnessIds: [],
        consentIds: [],
        positions: { player: "exterior" },
      },
    });
    const restored = coerceSession(structuredClone(physical.scene));
    restored.operation = { id: "another-turn", input: { ...(sourceVersion ? {} : { sceneHearingVersion: 2 }) } } as any;
    const effects = physical.owner.run(() => physical.service.sceneReplayEffects());
    await effects.applyVenueTurnChange(restored, restored.submissions[0]!);
    const memories = physical.world.memories.records.length;
    assert.equal(
      memories,
      sourceVersion ? 2 : 1,
      "Delayed work uses its saved source version, never another operation's version",
    );
    assert.equal(physical.world.exchangeReceipts[`venue-chat:${restored.id}:${turn.id}`]?.status, "applied");
    await effects.applyVenueTurnChange(restored, restored.submissions[0]!);
    assert.equal(physical.world.memories.records.length, memories, "Mechanical Memory replay is idempotent");
    assert.equal(physical.modelAccess, 0);
  } finally {
    physical.owner.dispose();
  }
}

function fixture(name: string, pause = false, navigationIdentity?: object) {
  const gate = deferred(),
    entered = deferred();
  const stamp = new Date().toISOString();
  const rows = new Map<string, any>([
    [
      "villages-venue-visit-same",
      {
        id: "villages-venue-visit-same",
        kind: "venue-visit",
        packageId: "villages",
        revision: 1,
        data: {
          version: 4,
          id: "same",
          villageSeed: "same-seed",
          semanticVersion: 2,
          placeId: "same-place",
          placeName: name,
          status: "active",
          startedAt: stamp,
          lastActivityAt: stamp,
          sceneRevision: 0,
          lines: [],
          submissions: [],
        },
      },
    ],
    [
      "villages-active-venue",
      {
        id: "villages-active-venue",
        packageId: "villages",
        kind: "venue-active",
        revision: 1,
        data: { sessionId: "same", placeId: "same-place" },
      },
    ],
  ]);
  let reads = 0,
    sceneCreates = 0,
    pauseCreation = false;
  const allReads: string[] = [];
  const documents = {
    async getById(_package: string, id: string) {
      allReads.push(id);
      if (id === "villages-venue-visit-same") {
        reads++;
        if (pause) {
          pause = false;
          entered.resolve();
          await gate.promise;
        }
      }
      return structuredClone(rows.get(id) ?? null);
    },
    async list() {
      return [];
    },
    async update(input: any) {
      const row = rows.get(input.id);
      if (row?.revision !== input.expectedRevision) return null;
      const next = { ...row, ...structuredClone(input), revision: row.revision + 1 };
      rows.set(input.id, next);
      return structuredClone(next);
    },
    async create(input: any) {
      if (input.kind === "venue-visit") {
        sceneCreates++;
        if (pauseCreation) {
          pauseCreation = false;
          entered.resolve();
          await gate.promise;
        }
      }
      const next = { ...structuredClone(input), revision: 1 };
      rows.set(input.id, next);
      return structuredClone(next);
    },
  };
  const scope = createActivationScope();
  const release = scope.run(() =>
    configureVillagesRuntime(
      {
        persistence: { documents: villageFixtureDocuments(documents) },
        resources: { listCharacters: async () => [] },
        logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
        isDebugAgentsEnabled: () => false,
      } as any,
      navigationIdentity,
    ),
  );
  return {
    scope,
    release,
    gate,
    entered,
    rows,
    documents,
    allReads,
    pauseSceneCreation() {
      pauseCreation = true;
    },
    get sceneCreates() {
      return sceneCreates;
    },
    get reads() {
      return reads;
    },
  };
}
// A paused queue, its movement and cancellation state cannot block or mutate B's same-ID work.
const workA = createSceneWork(),
  workB = createSceneWork();
const queueGate = deferred(),
  queueEntered = deferred();
let firstFinished = false,
  secondFinished = false,
  bAborts = 0,
  aAborts = 0;
const firstNavigation = workA.serializeNavigation(async () => {
  workA.markMovement("same");
  queueEntered.resolve();
  await queueGate.promise;
  workA.clearMovement("same");
  firstFinished = true;
  return "A";
});
await queueEntered.promise;
const queuedA = workA.serializeNavigation(async () => {
  assert(firstFinished);
  secondFinished = true;
  return "A second";
});
assert.equal(await workB.serializeNavigation(async () => "B"), "B");
assert.equal(secondFinished, false);
assert.equal(workA.isMoving("same"), true);
assert.equal(workB.isMoving("same"), false);
const sceneA = Promise.resolve({ placeName: "A" } as any),
  sceneB = Promise.resolve({ placeName: "B" } as any);
workA.rememberGreeting("same", sceneA, () => {
  aAborts++;
});
workB.rememberGreeting("same", sceneB, () => {
  bAborts++;
});
assert.equal(workA.greetingTask("same")!.task, sceneA);
assert.equal(workB.greetingTask("same")!.task, sceneB);
workB.abortGreeting("same");
assert.equal(bAborts, 1);
assert.equal(aAborts, 0);
workB.forgetGreeting("same");
assert.equal(workB.greetingTask("same"), undefined);
assert.equal(workA.greetingTask("same")!.task, sceneA);
queueGate.resolve();
assert.equal(await firstNavigation, "A");
assert.equal(await queuedA, "A second");
assert.equal(workA.isMoving("same"), false);
const failure = new Error("navigation failed");
await assert.rejects(
  workA.serializeNavigation(async () => {
    throw failure;
  }),
  (error) => error === failure,
);
assert.equal(await workA.serializeNavigation(async () => "recovered"), "recovered");

// Queued callbacks retain their originating activation after the default selection changes.
const selectedA = createActivationScope(),
  selectedB = createActivationScope();
const releaseSelectedA = selectedA.run(() => configureSceneWork(workA));
const releaseSelectedB = selectedB.run(() => configureSceneWork(workB));

const selectedGate = deferred(),
  selectedEntered = deferred();
const pendingSelected = selectedA.run(() =>
  sceneWork().serializeNavigation(async () => {
    selectedEntered.resolve();
    await selectedGate.promise;
    assert.equal(sceneWork().greetingTask("same")!.task, sceneA);
    return "origin A";
  }),
);
await selectedEntered.promise;

selectedB.run(() => assert.equal(sceneWork().greetingTask("same"), undefined));
selectedGate.resolve();
assert.equal(await pendingSelected, "origin A");
selectedB.run(() => releaseSelectedA());

await selectedB.run(async () =>
  assert.equal(await sceneWork().serializeNavigation(async () => "current B"), "current B"),
);
selectedB.run(() => assert.throws(() => selectedA.run(sceneWork), /not configured/));
const missing = createActivationScope();
selectedB.run(() => assert.throws(() => missing.run(sceneWork), /not configured/));
selectedB.dispose();
selectedB.run(() => assert.throws(() => selectedB.run(sceneWork), /not configured/));
selectedB.run(() => releaseSelectedB());

selectedA.dispose();
missing.dispose();
assert.throws(sceneWork, /not configured/);

const a = fixture("Private A", true),
  b = fixture("Private B");
try {
  const pendingA = a.scope.run(() => greetVenue("same"));
  await a.entered.promise;
  const pendingB = b.scope.run(() => greetVenue("same"));
  const duplicateA = a.scope.run(() => greetVenue("same"));
  a.gate.resolve();
  const [first, second] = await Promise.all([pendingA, pendingB]);
  assert.equal(await duplicateA, first, "same-owner duplicate greetings still join the existing task");
  assert.equal(first.placeName, "Private A");
  assert.equal(
    second.placeName,
    "Private B",
    "a Scene greeting must not join another world's task and return its private Scene",
  );
  assert(b.reads > 0, "both stores admit independent Scene work");
  console.log("Same-ID greetings retain independent world results.");
} finally {
  a.release();
  b.release();
  a.scope.dispose();
  b.scope.dispose();
}

// Both a shared document capability and separate facades with an opaque backend identity retain admission.
for (const canonical of [false, true]) {
  const identity = canonical ? {} : undefined;
  const shared = fixture("Shared", false, identity);
  shared.rows.clear();
  const world = defaultVillageState();
  world.seed = "shared-world";
  const venue = venueDraft({ name: "Shared hall", description: "A public hall", classes: ["community"] }, null);
  world.venues = [venue];
  world.backgroundPace = "off";
  shared.rows.set("villages-village", { id: "villages-village", revision: 1, data: world });
  shared.pauseSceneCreation();
  const sharedB = createActivationScope();
  const documentsB = canonical ? { ...shared.documents } : shared.documents;
  let providerAccess = 0;
  const releaseSharedB = sharedB.run(() =>
    configureVillagesRuntime(
      {
        persistence: { documents: villageFixtureDocuments(documentsB) },
        resources: { listCharacters: async () => [] },
        get languageModels() {
          providerAccess++;
          throw new Error("No provider may be requested by refused navigation");
        },
        logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
        isDebugAgentsEnabled: () => false,
      } as any,
      identity,
    ),
  );
  try {
    const first = shared.scope.run(() => enterVenue(venue.id));
    await shared.entered.promise;
    const second = sharedB.run(() => enterVenue(venue.id));
    await new Promise<void>((done) => setImmediate(done));
    assert.equal(shared.sceneCreates, 1, "shared-store B cannot save an orphan Scene while A's admission is paused");
    shared.gate.resolve();
    const [sceneA, sceneB] = await Promise.all([first, second]);
    assert.equal(sceneA.id, sceneB.id);
    assert.equal(shared.sceneCreates, 1);
    assert.equal([...shared.rows.values()].filter((row) => row.kind === "venue-visit").length, 1);
    assert.equal(shared.rows.get("villages-active-venue").data.sessionId, sceneA.id);
    const moveGate = deferred(),
      moveEntered = deferred();
    const moving = shared.scope.run(() =>
      coordinateVenue(
        sceneA.id,
        "live-move",
        "move",
        { zoneId: sceneA.zoneId },
        sceneA.sceneRevision,
        undefined,
        async () => {
          const own = sceneWork();
          own.markMovement(sceneA.id);
          moveEntered.resolve();
          try {
            await moveGate.promise;
            return "move completed";
          } finally {
            own.clearMovement(sceneA.id);
          }
        },
      ),
    );
    await moveEntered.promise;
    try {
      assert.equal(
        sharedB.run(() => sceneWork().isMoving(sceneA.id)),
        false,
      );
      const before = structuredClone(shared.rows.get(`villages-venue-visit-${sceneA.id}`).data.operation);
      await assert.rejects(
        sharedB.run(() =>
          sendVenueTurn({
            sessionId: sceneA.id,
            submissionId: "B turn",
            message: "hello",
            mode: "chat",
            targetId: "",
            expectedSceneRevision: sceneA.sceneRevision,
          }),
        ),
        /Recover|interrupted|explicitly retry/i,
      );
      const after = shared.rows.get(`villages-venue-visit-${sceneA.id}`).data;
      assert.equal(after.operation.token, before.token);
      assert.equal(after.operation.status, "running");
      assert.equal(after.submissionHistory.count, 0);
      assert.equal(providerAccess, 0, "persisted admission refuses B before requesting any model");
    } finally {
      moveGate.resolve();
      await moving;
    }
  } finally {
    shared.gate.resolve();
    releaseSharedB();
    shared.release();
    sharedB.dispose();
    shared.scope.dispose();
  }
}

// Movement's first Scene read pins its owner before subsequent Village reads.
const residenceA = fixture("Residence A", true),
  residenceB = fixture("Residence B");
const residence = residenceA.scope.run(() => moveVenueZone("same", "bedroom", 0));

await residenceA.entered.promise;

try {
  residenceB.scope.run(() => residenceA.gate.resolve());
  await assert.rejects(residence, /current live admission/);
  assert(residenceA.allReads.includes("villages-village"));
  assert.deepEqual(residenceB.allReads, [], "the calling B activation cannot redirect pending movement to its Village");
} finally {
  residenceA.gate.resolve();

  residenceA.release();
  residenceB.release();
  residenceA.scope.dispose();
  residenceB.scope.dispose();
}

for (const source of ["fresh", "same-zone", "captured"] as const) {
  const invalid = commandFixture("Missing entry authority " + source, ({ scene, world }) => {
    const place = venueDraft({ name: "Hall", description: "A public hall", classes: ["community"] }, null);
    place.id = scene.placeId;
    place.playerInvitations = [{ zoneId: "community", residentId: "player", sourceLineId: "forged" } as any];
    world.venues = [place];
    scene.zoneId = "community";
    if (source === "captured") {
      scene.continuity = captureSceneContinuity(world, scene, Date.parse(scene.startedAt));
      delete scene.continuity.facts.venues[0]!.access;
    } else delete place.access;
    return {
      readActive: async () => ({ sessionId: source === "fresh" ? "" : scene.id, placeId: scene.placeId }),
      hasVenueOperation: () => false,
      activeVenueSession: async () => (source === "fresh" ? null : scene),
      applySavedStartingTies: async () => {},
      rollActiveAgendas: async () => {},
    };
  });
  try {
    const before = structuredClone({ scene: invalid.scene, world: invalid.world });
    await assert.rejects(
      invalid.owner.run(() => invalid.service.enterVenue(invalid.scene.placeId, "community")),
      /no native access record/,
    );
    assert.deepEqual({ scene: invalid.scene, world: invalid.world }, before);
    assert(!invalid.calls.includes("world") && !invalid.calls.includes("persistence"));
    assert.equal(invalid.modelAccess, 0);
    assert.deepEqual(invalid.unexpected, []);
  } finally {
    invalid.owner.dispose();
  }
}

const savedInput = {
  sessionId: "same-scene",
  submissionId: "same-turn",
  message: "Already saved",
  mode: "chat" as const,
  targetId: "",
};
for (const stage of ["session", "admission", "progress", "snapshot", "persistence"]) {
  const first = commandFixture("Command A"),
    second = commandFixture("Command B");
  first.pause(stage);
  const releaseFirst = first.owner.run(() => configureSceneCommands(first.service));
  const releaseSecond = second.owner.run(() => configureSceneCommands(second.service));

  const pending = first.owner.run(() => sendVenueTurn(savedInput));
  await first.entered.promise;

  try {
    assert.deepEqual(first.scene.submissions[0].recordEvents, []);
    const resultB = await second.owner.run(() => sendVenueTurn(savedInput));
    assert.equal(resultB.session.placeName, "Command B");
    assert.deepEqual(
      resultB.recordEvents.map((event) => event.text),
      ["Command B saved effect"],
    );
    second.owner.run(() => releaseFirst());

    first.gate.resolve();
    const resultA = await pending;
    assert.equal(resultA.session.placeName, "Command A");
    assert.deepEqual(
      resultA.recordEvents.map((event) => event.text),
      ["Command A saved effect"],
    );
    assert(
      first.owners.every((owner) => owner === first.owner),
      stage + " must retain A's actual scope",
    );
    assert(second.owners.every((owner) => owner === second.owner));
    assert.deepEqual(first.unexpected, []);
    assert.deepEqual(second.unexpected, []);
    assert.equal(first.modelAccess + second.modelAccess, 0);
  } finally {
    first.gate.resolve();
    await second.owner.run(() => pending.catch(() => {}));
    second.owner.run(() => releaseFirst());
    second.owner.run(() => releaseSecond());

    first.owner.dispose();
    second.owner.dispose();
  }
}

for (const stage of ["session", "admission", "snapshot", "persistence"]) {
  const current = commandFixture("Failure " + stage);
  current.fail(stage);
  const release = current.owner.run(() => configureSceneCommands(current.service));
  try {
    await assert.rejects(
      current.owner.run(() => sendVenueTurn(savedInput)),
      (error) => error === current.exact,
    );
    assert.deepEqual(current.scene.submissions[0].recordEvents, []);
    assert.equal(current.modelAccess, 0);
    assert.deepEqual(current.unexpected, []);
  } finally {
    release();
    current.owner.dispose();
  }
}

// The returned replay callbacks can escape their getter's scope; they must still own A.
{
  const first = commandFixture("Captured A"),
    second = commandFixture("Selected B");
  const releaseFirst = first.owner.run(() => configureSceneCommands(first.service));
  const releaseSecond = second.owner.run(() => configureSceneCommands(second.service));

  const captured = first.owner.run(() => sceneReplayEffects());

  second.owner.run(() => releaseFirst());

  try {
    const events = await second.owner.run(() => captured.receiptForTurn(first.scene, first.scene.submissions[0]));
    assert.deepEqual(
      events.map((event) => event.text),
      ["Captured A saved effect"],
    );
    assert(first.owners.every((owner) => owner === first.owner));
    assert.deepEqual(second.calls, [], "escaped A callbacks cannot use the selected B connections");
    const resultB = await second.owner.run(() => sendVenueTurn(savedInput));
    assert.equal(resultB.session.placeName, "Selected B", "old command cleanup must leave B configured");
    assert.equal(first.modelAccess + second.modelAccess, 0);
  } finally {
    second.owner.run(() => releaseFirst());
    second.owner.run(() => releaseSecond());

    first.owner.dispose();
    second.owner.dispose();
  }
}

// An originating connection's disposal guard rejects rather than borrowing B's storage.
{
  const first = commandFixture("Disposed A"),
    second = commandFixture("Surviving B");
  first.pause("snapshot");
  first.guardDisposal();
  const releaseFirst = first.owner.run(() => configureSceneCommands(first.service));
  const releaseSecond = second.owner.run(() => configureSceneCommands(second.service));

  const pending = first.owner.run(() => sendVenueTurn(savedInput));
  await first.entered.promise;

  first.owner.dispose();
  const rejected = assert.rejects(pending, (error) => error === first.exact);
  first.gate.resolve();
  try {
    await rejected;
    assert.deepEqual(first.scene.submissions[0].recordEvents, []);
    const resultB = await second.owner.run(() => sendVenueTurn(savedInput));
    assert.equal(resultB.session.placeName, "Surviving B");
    assert.equal(first.modelAccess + second.modelAccess, 0);
  } finally {
    second.owner.run(() => releaseFirst());
    second.owner.run(() => releaseSecond());

    second.owner.dispose();
  }
}
// Recovery validates current ownership before admission can replace saved paid evidence.
for (const kind of ["turn", "greet"] as const)
  for (const defect of ["seed", "semantic", "processing", "identity"] as const) {
    let admissions = 0;
    const held = commandFixture("Invalid recovered " + kind, ({ scene }) => {
      const turn = scene.submissions[0];
      if (kind === "greet") {
        turn.id = "greeting";
        turn.processing!.submissionId = turn.id;
        turn.semanticReady = true;
      }
      scene.operation = {
        id: turn.id,
        kind,
        status: "interrupted",
        attemptId: "paid-attempt",
        input: { message: "Exact saved words — retained", mode: "chat", targetId: "" },
        attempts: { paid: { status: "complete", result: { content: "Exact paid result", finishReason: "stop" } } },
        checkpoints: { "turn-reply": { retained: "Original response evidence" } },
      } as any;
      if (defect === "seed") scene.villageSeed = "";
      if (defect === "semantic") delete scene.semanticVersion;
      if (defect === "processing") delete turn.processing;
      if (defect === "identity") turn.processing!.sceneId = "another-scene";
      return {
        recoverVenueOperations: async (recover) => {
          await recover(scene.id, scene.operation!);
        },
        coordinateVenue: async () => {
          admissions++;
          throw Error("Invalid recovered Scene reached admission");
        },
      };
    });
    const before = structuredClone({ scene: held.scene, world: held.world });
    try {
      await assert.rejects(
        held.service.recoverVenueSceneWork(),
        /Unsupported Scene format|current processing metadata/,
      );
      assert.equal(admissions, 0);
      assert.deepEqual({ scene: held.scene, world: held.world }, before);
      assert.deepEqual(held.calls, ["session"]);
      assert.equal(held.modelAccess, 0);
      assert.deepEqual(held.unexpected, []);
    } finally {
      held.owner.dispose();
    }
  }
// Unsupported persisted modes cannot enter admission or discard saved paid evidence.
for (const mode of ["ask", "act", "fulfill", "greet", "unknown", null, undefined]) {
  const held = commandFixture("Unsupported mode", ({ scene }) => {
    scene.operation = {
      id: "held-action",
      kind: "turn",
      status: "interrupted",
      attemptId: "paid-attempt",
      input: { message: "Exact saved words", mode, targetId: "", semanticBudget: SEMANTIC_OPERATION_BUDGET },
      attempts: { paid: { status: "complete", result: { content: "Exact paid result", finishReason: "stop" } } },
      checkpoints: { "turn-reply": { retained: "Original response evidence" } },
    } as any;
    return {
      recoverVenueOperations: async (recover) => {
        await recover(scene.id, scene.operation!);
      },
      coordinateVenue: async () => {
        throw Error("Unsupported action reached admission");
      },
    };
  });
  const before = structuredClone(held.scene);
  try {
    await assert.rejects(held.service.recoverVenueSceneWork(), /Unsupported Scene action/);
    await assert.rejects(
      held.service.sendVenueTurn({
        sessionId: held.scene.id,
        submissionId: "held-action",
        message: "Exact saved words",
        mode,
        targetId: "",
      } as any),
      /Unsupported Scene action/,
    );
    assert.deepEqual(held.scene, before);
    assert.deepEqual(held.calls, []);
    assert.equal(held.modelAccess, 0);
    assert.deepEqual(held.unexpected, []);
    const raw = { version: 4, id: "invalid-mode", status: "closed", submissions: [{ id: "turn", mode }] };
    assert.throws(() => coerceSession(raw), /Unsupported saved Scene action/);
    assert.deepEqual(raw.submissions[0].mode, mode);
  } finally {
    held.owner.dispose();
  }
}
for (const mode of ["chat", "contact", "leave"] as const)
  assert.equal(
    coerceSession({
      version: 4,
      id: "current-mode",
      status: "closed",
      submissions: [
        {
          id: "turn",
          mode,
          ...(mode === "contact"
            ? { contact: { kind: "call", boundaryZoneId: "interior", quote: "Hello", targetId: "" } }
            : {}),
        },
      ],
    }).submissions[0].mode,
    mode,
  );
for (const scenario of ["missing-same-zone", "missing-move", "forged-checkpoint"] as const) {
  let destination = "";
  const refused = commandFixture(scenario, ({ scene, world, stamp }) => {
    const home = venueDraft({ name: "Home", description: "A home", classes: ["residence"] }, null);
    home.id = scene.placeId;
    home.access!.managerIds = ["jim"];
    destination =
      scenario === "missing-same-zone" ? "exterior" : home.zones!.find((zone) => zone.kind === "shared-residence")!.id;
    home.usedInvitationIds = ["retired-line"];
    home.playerInvitations = [{ zoneId: destination, residentId: "jim", sourceLineId: "retired-line" }] as any;
    if (scenario !== "forged-checkpoint") delete home.access;
    world.venues = [home];
    scene.zoneId = "exterior";
    scene.submissions = [];
    scene.sceneAttendance = { capturedAt: stamp, occupants: [] };
    scene.grantedZoneIds = [destination];
    scene.zoneGrants = [{ zoneId: destination, controllerId: "jim" }];
    scene.operation = {
      id: "refused-move",
      kind: "move",
      status: "running",
      checkpoints: { "move-invitation": { sourceLineId: "retired-line", zoneId: destination, residentId: "jim" } },
    } as any;
    return {
      coordinateVenue: async (_id, _operation, _kind, _input, _expected, _retry, run) => run(),
      requireLiveVenueSession: async () => scene,
      assertVenueOwnership: () => {},
      venueOperationId: () => "refused-move",
    };
  });
  const before = structuredClone({ scene: refused.scene, world: refused.world });
  try {
    await assert.rejects(
      refused.service.moveVenueZone("same-scene", destination, undefined, undefined, "refused-move"),
      scenario === "forged-checkpoint" ? /no permitted connection/ : /no native access record/,
    );
    assert.deepEqual({ scene: refused.scene, world: refused.world }, before);
    assert(!refused.calls.some((call) => call === "persistence" || call === "world"));
    assert.equal(refused.modelAccess, 0);
    assert.deepEqual(refused.unexpected, []);
  } finally {
    refused.owner.dispose();
  }
}
// A delayed navigation retry cannot move the player back after a later accepted move.
{
  const replay = commandFixture("Navigation replay", ({ scene, stamp, touch }) => {
    scene.zoneId = "zone-b";
    scene.submissions = [];
    scene.navigationReceipts = [
      { id: "move-a", originZoneId: "exterior", destinationZoneId: "zone-a", at: stamp },
      { id: "move-b", originZoneId: "zone-a", destinationZoneId: "zone-b", at: stamp },
    ];
    return {
      requireLiveVenueSession: async () => {
        await touch("require-live");
        return scene;
      },
      coordinateVenue: async () => {
        throw Error("Settled navigation must not acquire new work");
      },
    };
  });
  const before = structuredClone(replay.scene);
  try {
    const result = await replay.service.moveVenueZone("same-scene", "zone-a", undefined, undefined, "move-a");
    assert.equal(result.zoneId, "zone-b");
    assert.deepEqual(replay.scene, before);
    await assert.rejects(
      replay.service.moveVenueZone("same-scene", "zone-c", undefined, undefined, "move-a"),
      /different Zone/,
    );
    assert.deepEqual(replay.scene, before);
    assert.equal(replay.modelAccess, 0);
    assert(!replay.calls.includes("progress"));
  } finally {
    replay.owner.dispose();
  }
}
// Interrupted free navigation replay retains its owner and never starts image work.
{
  const first = commandFixture("Image A", ({ scene, world, touch, stamp }) => {
    const venue = venueDraft({ name: "Staff hall", description: "A staff hall", classes: ["community"] }, null);
    venue.id = scene.placeId;
    venue.zones = [{ ...venue.spaces[0], id: "staff-zone", name: "Staff room", kind: "staff" }];
    world.venues = [venue];
    scene.zoneId = "staff-zone";
    scene.sceneAttendance = { capturedAt: stamp, occupants: [] };
    scene.operation = { id: "same-image-operation", kind: "move", status: "interrupted" } as any;
    scene.navigationReceipts = [
      {
        id: "same-image-operation",
        originZoneId: "exterior",
        destinationZoneId: "staff-zone",
        at: stamp,
      },
    ];
    return {
      coordinateVenue: async (_id, id, kind, input, _expected, _retry, run, options) => {
        assert.equal(options?.replay, true);
        assert.equal(id, "same-image-operation");
        assert.equal(kind, "move");
        assert.deepEqual(input, { zoneId: "staff-zone" });
        return run();
      },
      assertVenueOwnership: () => {},
      requireLiveVenueSession: async () => scene,
      refreshZoneParticipants: async () => scene,
      venueOperationId: () => "same-image-operation",
      mutateVillageState: async (change) => {
        await change(world);
        return world;
      },
      readVillageState: async () => world,
      outsideVenueOperation: (run) => run(),
      loadPrivateSpaceImages: async () => {
        await touch("image-loader");
        return {
          generateFirstZoneImage: async (placeId, zoneId) => {
            assert.equal(placeId, scene.placeId);
            assert.equal(zoneId, "staff-zone");
            await touch("image-command");
          },
        };
      },
    };
  });
  const second = commandFixture("Image B");
  const releaseFirst = first.owner.run(() => configureSceneCommands(first.service));
  const releaseSecond = second.owner.run(() => configureSceneCommands(second.service));

  const pending = first.owner.run(() =>
    moveVenueZone("same-scene", "staff-zone", undefined, undefined, "same-image-operation"),
  );

  try {
    assert.equal((await pending).placeName, "Image A");
    assert.equal(first.scene.navigationReceipts!.length, 1, "recovery cannot duplicate committed navigation");
    assert.equal(first.scene.submissions.length, 1, "navigation creates no conversational submission");
    assert.equal(first.calls.includes("image-command"), false);
    second.owner.run(() => releaseFirst());

    first.gate.resolve();
    assert.equal(first.calls.includes("image-loader"), false);
    assert.equal(first.calls.filter((stage) => stage === "image-command").length, 0);
    assert(first.owners.every((owner) => owner === first.owner));
    assert.deepEqual(second.calls, []);
    assert.equal(first.modelAccess + second.modelAccess, 0);
  } finally {
    first.gate.resolve();
    second.owner.run(() => releaseFirst());
    second.owner.run(() => releaseSecond());

    first.owner.dispose();
    second.owner.dispose();
  }
}
console.log(
  "Scene command construction, paused replay, captured effects, lazy connections, errors and disposal retain their owners.",
);

// Pending effects predating interpreter provenance cannot acquire authority on saved-turn replay.
{
  let worldWrites = 0;
  const pending = commandFixture("Pending access", ({ scene, world, stamp }) => {
    const home = venueDraft(
      { name: "Home", description: "A small home", classes: ["residence"], residentIds: ["ada"] },
      null,
    );
    home.id = scene.placeId;
    home.residentIds = ["ada"];
    world.venues = [home];
    scene.lines.push({
      id: "invite-line",
      speakerId: "ada",
      name: "Ada",
      kind: "dialogue",
      role: "assistant",
      content: "Visit tomorrow.",
      at: stamp,
      heardBy: ["ada"],
    });
    return {
      mutateVillageState: async (change) => {
        worldWrites++;
        await change(world);
        return world;
      },
    };
  });
  try {
    const effects = pending.owner.run(() => pending.service.sceneReplayEffects());
    const invitation = {
      residentId: "ada",
      venueId: pending.scene.placeId,
      zoneId: "residence",
      zoneLabel: "Common Space",
      timing: "later" as const,
      quote: "Visit tomorrow.",
    };
    const before = JSON.stringify([pending.scene, pending.world]);
    await assert.rejects(effects.recordSpokenInvitation(pending.scene, invitation as any), /needs recovery/);
    assert.equal(worldWrites, 0);
    assert.equal(
      JSON.stringify([pending.scene, pending.world]),
      before,
      "Retired invitation metadata cannot write authority",
    );
    const current = {
      ...pending.scene.submissions[0],
      replyLineIds: ["invite-line"],
      accessEvents: [
        {
          id: "current-access",
          interpretationVersion: 1 as const,
          facts: {
            actorId: "ada",
            venueId: pending.scene.placeId,
            zoneId: "residence",
            accessRevision: 0,
            semanticVersion: 2 as const,
            accessCommand: {
              action: "invite" as const,
              operationId: "current-access",
              expectedRevision: 0,
              zoneId: "residence",
              visitorId: "player",
              duration: "visit" as const,
              accompanied: false,
              outsideHours: false,
            },
          },
          outcome: "invite-later",
          evidenceIds: ["draft:0"],
        },
      ],
    };
    const obsolete = structuredClone(current);
    delete (obsolete.accessEvents[0] as any).interpretationVersion;
    await assert.rejects(effects.applySavedAccessEvents(pending.scene, obsolete), /needs current evidence/);
    assert.equal(worldWrites, 0, "An unsupported batch is rejected before mutation");
    assert.equal(JSON.stringify([pending.scene, pending.world]), before);
    for (const version of [undefined, 1]) {
      const unsupported = structuredClone(current.accessEvents[0]);
      (unsupported.facts as any).semanticVersion = version;
      const mixed = {
        checks: [current.accessEvents[0], unsupported],
        results: [current.accessEvents[0], unsupported],
      } as any;
      assert.throws(() => savedAccessEvents(mixed), /needs current evidence/);
      await assert.rejects(
        effects.applySavedAccessEvents(pending.scene, {
          ...current,
          accessEvents: [current.accessEvents[0], unsupported],
        }),
        /needs current evidence/,
      );
      await assert.rejects(
        pending.owner.run(() => pending.service.recordRoomAccessEvents(pending.scene, mixed)),
        /needs current evidence/,
      );
      assert.equal(worldWrites, 0, "No valid prefix is applied from an unsupported access batch");
      assert.equal(JSON.stringify([pending.scene, pending.world]), before);
    }
    pending.scene.submissions[0] = current;
    await effects.applySavedAccessEvents(pending.scene, current);
    const native = { ...invitation, accessOperationId: "current-access" };
    await effects.recordSpokenInvitation(pending.scene, native);
    await effects.applySavedAccessEvents(pending.scene, current);
    await effects.recordSpokenInvitation(pending.scene, native);
    assert.equal(pending.world.venues[0].access!.permissions.length, 1, "Native replay settles one permission");
    assert(pending.world.venues[0].access!.receipts["current-access"]);
    assert.equal(pending.modelAccess, 0);
    assert.deepEqual(pending.unexpected, []);
  } finally {
    pending.owner.dispose();
  }
}

// Greeting admission is observed and cancellable before storage reads settle.
const originalGreetingTimeout = AbortSignal.timeout;
const greetingUnhandled: unknown[] = [];
const captureGreetingUnhandled = (error: unknown) => greetingUnhandled.push(error);
process.on("unhandledRejection", captureGreetingUnhandled);
try {
  for (const failingRead of ["session", "coordination"] as const) {
    const timeout = new AbortController();
    AbortSignal.timeout = () => timeout.signal;
    const exactFailure = new Error("failed greeting " + failingRead);
    const failed = commandFixture("Failed greeting", ({ scene }) => ({
      readSession: async () => {
        if (failingRead === "session") throw exactFailure;
        return scene;
      },
      coordinateVenue: async () => {
        throw exactFailure;
      },
    }));
    try {
      await assert.rejects(
        failed.owner.run(() => failed.service.greetVenue("same-scene")),
        (error) => error === exactFailure,
      );
      assert.equal(failed.work.greetingTask("same-scene"), undefined);
      timeout.abort(new DOMException("test timeout after read failure", "TimeoutError"));
      await new Promise((resolve) => setImmediate(resolve));
    } finally {
      failed.owner.dispose();
    }
  }
  const timeout = new AbortController();
  AbortSignal.timeout = () => timeout.signal;
  const admissionGate = deferred(),
    admissionEntered = deferred();
  let coordination = 0,
    worldReads = 0;
  const blocked = commandFixture("Blocked greeting", ({ scene }) => ({
    readSession: async () => {
      admissionEntered.resolve();
      await admissionGate.promise;
      return scene;
    },
    readVillageState: async () => {
      worldReads++;
      throw new Error("cancelled admission may not read world");
    },
    coordinateVenue: async () => {
      coordination++;
      throw new Error("cancelled admission may not coordinate");
    },
  }));
  try {
    const pending = blocked.owner.run(() => blocked.service.greetVenue("same-scene"));
    await admissionEntered.promise;
    assert(blocked.work.greetingTask("same-scene"), "blocked admission is already registered");
    const rejected = assert.rejects(pending, (error: any) => error?.name === "AbortError");
    blocked.work.abortGreeting("same-scene");
    await rejected;
    assert.equal(blocked.work.greetingTask("same-scene"), undefined);
    admissionGate.resolve();
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(coordination, 0);
    assert.equal(worldReads, 0);
  } finally {
    admissionGate.resolve();
    blocked.owner.dispose();
  }
  assert.deepEqual(greetingUnhandled, [], "failed or cancelled admission leaves no orphan timeout rejection");
} finally {
  AbortSignal.timeout = originalGreetingTimeout;
  process.off("unhandledRejection", captureGreetingUnhandled);
}

// A saved interpretation retry exposes truncation and never dispatches an automatic second request.
{
  let calls = 0;
  const current = commandFixture("Truncated wish recovery", ({ scene, world }) => {
    const turn = scene.submissions[0];
    turn.processing!.domains.wishes.status = "failed";
    turn.wishContexts = [];
    turn.semanticProvenance = { version: 2 } as any;
    turn.liveProposals = {
      version: 1,
      memoryChanges: [],
      relationshipChanges: {},
      memoryVersions: {},
      earlierLineIds: [],
      playerLineId: "",
      replyLineIds: [],
    };
    const model = {
      connectionId: "fake",
      model: "fake",
      fitContext: (messages: any, options: any) => ({ messages, maxTokens: options.maxTokens }),
    };
    return {
      coordinateVenue: async (_id, _request, _kind, _input, _expected, _retry, run) => run(),
      readVillageState: async () => world,
      villagesDocuments: () => ({ list: async () => [] }) as any,
      villagesConnectionIdFor: async () => "fake",
      villagesLanguageModels: () => ({ resolveForRequest: async () => model }) as any,
      venueCheckpoint: async (_key, run) => run(),
      venueOperationSignal: () => new AbortController().signal,
      completeWithRoom: async () => {
        calls++;
        return { content: "", finishReason: "length" };
      },
      rejectVenueCompletion: async () => {},
    };
  });
  const before = JSON.stringify(current.scene);
  await assert.rejects(
    current.owner.run(() => current.service.retrySceneChangeInterpretation("same-scene", "same-turn", "wishes")),
    (error: any) => error.failure?.cause === "output_limit" && /output limit/.test(error.message),
  );
  assert.equal(calls, 1);
  assert.equal(JSON.stringify(current.scene), before, "A truncated retry preserves the saved exchange");
  current.owner.dispose();
}

// Relationship Retry uses only social context, even when an unrelated exact Wish body is unavailable.
{
  const storage = sceneHistoryFixture(),
    repository = createVillageRepository(() => storage.gate.documents);
  let current: ReturnType<typeof commandFixture> | undefined;
  try {
    const initial = wishWorld();
    initial.seed = "same-seed";
    initial.villagers[0].wishes = [fixtureWish({ wish: "Original private desire" })];
    await repository.mutateAuthority((state) => {
      Object.assign(state, initial);
    });
    const frozen = await repository.readAuthority({ memories: true, wishes: true });
    frozen.relationshipContext = defaultRelationshipState(frozen.seed);
    let completions = 0,
      wishReads = 0;
    current = commandFixture("Relationship retry with a prior Wish effect", ({ scene, world }) => {
      Object.assign(world, frozen);
      scene.activeIds = ["a"];
      scene.participants = [{ characterId: "a", name: "Ada" }] as any;
      scene.continuity = captureSceneContinuity(world, scene, Date.parse(scene.startedAt));
      const turn = scene.submissions[0];
      turn.processing!.domains.relationships.status = "failed";
      turn.liveProposals = {
        version: 1,
        memoryChanges: [],
        relationshipChanges: {},
        memoryVersions: {},
        earlierLineIds: [],
        playerLineId: "",
        replyLineIds: [],
      };
      const model = {
        connectionId: "synthetic",
        model: "synthetic",
        fitContext: (messages: any, options: any) => ({ messages, maxTokens: options.maxTokens }),
      };
      return {
        coordinateVenue: async (_id, _request, _kind, _input, _expected, _retry, run) => run(),
        readVillageState: async (options) => ({
          ...(await repository.readAuthority({ memories: true, ...options })),
          relationshipContext: frozen.relationshipContext,
        }),
        villagesDocuments: () => storage.gate.documents,
        villagesConnectionIdFor: async () => "synthetic",
        villagesLanguageModels: () => ({ resolveForRequest: async () => model }) as any,
        venueCheckpoint: async (_key, run) => run(),
        venueOperationSignal: () => new AbortController().signal,
        venueRequestMetrics: () => [],
        readSceneChanges: async () => ({}) as any,
        completeWithRoom: async (_model, messages) => {
          completions++;
          const input = JSON.parse(messages[1].content);
          assert.ok(input.social.capturedAndScene);
          assert.ok(input.social.live);
          assert.doesNotMatch(JSON.stringify(input), /Original private desire|Latest exact private desire/);
          return {
            content: JSON.stringify({ relationshipChanges: { changes: [], permissions: [], disclosures: [] } }),
            finishReason: "stop",
          };
        },
      };
    });
    await repository.mutateAuthority(
      (state) => {
        reserveMemoryScene(state, "same-scene", current!.scene.continuity!.capturedAt);
        const wish = mutableSocialWish(state.villagers[0].wishes[0]);
        wish.wish = "Latest exact private desire";
        wish.revision++;
        state.villagers[0].wishes[0] = wish;
        state.exchangeReceipts["wish-effect"] = {
          id: "wish-effect",
          sceneId: "same-scene",
          submissionId: "same-turn",
          domain: "wishes",
          status: "applied",
          at: initial.foundedAt,
          reason: "Earlier accepted effect",
          evidenceIds: [],
          sceneFacts: captureSceneWishEffect(state, "a", wish.id),
        };
      },
      { memories: true, wishes: ["a"] },
    );
    const head = storage.rows.get("villages-village").data.exchangeReceipts["wish-effect"].sceneFacts.wish.head;
    storage.rows.delete(head.root.id);
    const get = storage.documents.getById;
    storage.documents.getById = async (pkg: string, id: string) => {
      if (id === head.root.id) wishReads++;
      return get(pkg, id);
    };
    await current.owner.run(() =>
      current!.service.retrySceneChangeInterpretation("same-scene", "same-turn", "relationships"),
    );
    await current.owner.run(() =>
      current!.service.retrySceneChangeInterpretation("same-scene", "same-turn", "relationships"),
    );
    assert.equal(completions, 1, "One explicit Retry purchases once; a now-pending interpretation is not repeated");
    assert.equal(wishReads, 0, "Relationship context never loads unrelated private Wish evidence");
    assert.equal(storage.rows.has(head.root.id), false, "Retry does not fabricate the missing body");
  } finally {
    current?.owner.dispose();
    storage.release();
  }
}

// Conclude must admit the same current writing/privacy contract as an ordinary new turn.
{
  let admitted: any;
  const terminal = new Error("Admission observed");
  const current = commandFixture("Conclude admission", ({ scene, world }) => {
    const venue = venueDraft({ name: "Shared hall", description: "A public hall", classes: ["community"] }, null);
    venue.id = scene.placeId;
    world.venues = [venue];
    scene.semanticVersion = 2;
    scene.submissions = [];
    return {
      requireLiveVenueSession: async () => scene,
      readVillageState: async () => world,
      coordinateVenue: async (_id, _submission, _kind, input) => {
        admitted = input;
        throw terminal;
      },
    };
  });
  await assert.rejects(
    current.owner.run(() => current.service.leaveVenueSession("same-scene", "conclude", "Good night.")),
    (error) => error === terminal,
  );
  assert.deepEqual(admitted, {
    sceneHearingVersion: 2,
    message: "Good night.",
    mode: "leave",
    targetId: "",
    semanticBudget: SEMANTIC_OPERATION_BUDGET,
  });
  assert.equal(current.modelAccess, 0);
  current.owner.dispose();
}

// Missing live Venue authority must preserve the Scene and offer ordinary End before admission.
{
  let admitted = 0;
  const current = commandFixture("Removed Venue Conclude", ({ scene, world }) => {
    scene.semanticVersion = 2;
    scene.submissions = [];
    world.venues = [];
    return {
      requireLiveVenueSession: async () => scene,
      readVillageState: async () => world,
      coordinateVenue: async () => {
        admitted++;
        throw new Error("Unexpected admission");
      },
    };
  });
  const before = JSON.stringify(current.scene);
  await assert.rejects(
    current.owner.run(() => current.service.leaveVenueSession("same-scene", "conclude", "Good night.")),
    /Venue is no longer available\. End the Scene/,
  );
  assert.equal(admitted, 0);
  assert.equal(current.modelAccess, 0);
  assert.equal(JSON.stringify(current.scene), before);
  current.owner.dispose();
}
