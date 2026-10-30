import assert from "node:assert/strict";
import {
  activationScope,
  bindActivationService,
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { createExchangeProcessing } from "../packages/villages/src/server/domain/decoding/exchange-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { bindLiveProposals } from "../packages/villages/src/server/domain/rules/live-exchange.js";
import { venueDraft } from "../packages/villages/src/server/domain/rules/venue-authoring.js";
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
  enterResidencePrivateSpace,
  enterVenue,
  greetVenue,
  moveVenueZone,
  sceneReplayEffects,
  sendVenueTurn,
} from "../packages/villages/src/server/features/scenes/venue-session.js";
import { VENUE_REPLY_MAX_TOKENS } from "../packages/villages/src/server/features/scenes/writing.js";
import { coordinateVenue } from "../packages/villages/src/server/jobs/venue-coordinator.js";
import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
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
    version: 3,
    id: "same-scene",
    villageSeed: world.seed,
    placeId: "same-place",
    placeName: label,
    status: "active",
    processingVersion: 1,
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
    owners.push(scopedActivation());
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
    readSession: async (id) => {
      assert.equal(id, scene.id);
      await touch("session");
      return scene;
    },
    coordinateVenue: async (id, submissionId, kind, input, expected, retry, run, options) => {
      assert.equal(id, scene.id);
      assert.equal(submissionId, "same-turn");
      assert.equal(kind, "turn");
      assert.deepEqual(input, { message: "Already saved", mode: "chat", targetId: "", interactionScopeVersion: 6 });
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
          version: 3,
          id: "same",
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
const clearA = installDefaultActivation(selectedA, () => {});
const selectedGate = deferred(),
  selectedEntered = deferred();
const pendingSelected = sceneWork().serializeNavigation(async () => {
  selectedEntered.resolve();
  await selectedGate.promise;
  assert.equal(sceneWork().greetingTask("same")!.task, sceneA);
  return "origin A";
});
await selectedEntered.promise;
const clearB = installDefaultActivation(selectedB, () => {});
assert.equal(sceneWork().greetingTask("same"), undefined);
selectedGate.resolve();
assert.equal(await pendingSelected, "origin A");
releaseSelectedA();
clearA();
assert.equal(await sceneWork().serializeNavigation(async () => "current B"), "current B");
assert.throws(() => selectedA.run(sceneWork), /not configured/);
const missing = createActivationScope();
assert.throws(() => missing.run(sceneWork), /not configured/);
selectedB.dispose();
assert.throws(() => selectedB.run(sceneWork), /not configured/);
releaseSelectedB();
clearB();
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

// Residence's first Scene read must pin the application before its later Village read.
const residenceA = fixture("Residence A", true),
  residenceB = fixture("Residence B");
const clearResidenceA = installDefaultActivation(residenceA.scope, () => {});
const residence = enterResidencePrivateSpace("same", "resident");
await residenceA.entered.promise;
const clearResidenceB = installDefaultActivation(residenceB.scope, () => {});
try {
  residenceA.gate.resolve();
  await assert.rejects(residence, /Residence is no longer here/);
  assert(residenceA.allReads.includes("villages-village"));
  assert.deepEqual(residenceB.allReads, [], "default replacement cannot redirect the pending residence to B's Village");
} finally {
  residenceA.gate.resolve();
  clearResidenceA();
  clearResidenceB();
  residenceA.release();
  residenceB.release();
  residenceA.scope.dispose();
  residenceB.scope.dispose();
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
  const clearFirst = installDefaultActivation(first.owner, () => {});
  const pending = sendVenueTurn(savedInput);
  await first.entered.promise;
  const clearSecond = installDefaultActivation(second.owner, () => {});
  try {
    assert.deepEqual(first.scene.submissions[0].recordEvents, []);
    const resultB = await sendVenueTurn(savedInput);
    assert.equal(resultB.session.placeName, "Command B");
    assert.deepEqual(
      resultB.recordEvents.map((event) => event.text),
      ["Command B saved effect"],
    );
    releaseFirst();
    clearFirst();
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
    await pending.catch(() => {});
    releaseFirst();
    releaseSecond();
    clearFirst();
    clearSecond();
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
  const clearFirst = installDefaultActivation(first.owner, () => {});
  const captured = sceneReplayEffects();
  const clearSecond = installDefaultActivation(second.owner, () => {});
  releaseFirst();
  clearFirst();
  try {
    const events = await captured.receiptForTurn(first.scene, first.scene.submissions[0]);
    assert.deepEqual(
      events.map((event) => event.text),
      ["Captured A saved effect"],
    );
    assert(first.owners.every((owner) => owner === first.owner));
    assert.deepEqual(second.calls, [], "escaped A callbacks cannot use the selected B connections");
    const resultB = await sendVenueTurn(savedInput);
    assert.equal(resultB.session.placeName, "Selected B", "old command cleanup must leave B configured");
    assert.equal(first.modelAccess + second.modelAccess, 0);
  } finally {
    releaseFirst();
    releaseSecond();
    clearFirst();
    clearSecond();
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
  const clearFirst = installDefaultActivation(first.owner, () => {});
  const pending = sendVenueTurn(savedInput);
  await first.entered.promise;
  const clearSecond = installDefaultActivation(second.owner, () => {});
  first.owner.dispose();
  const rejected = assert.rejects(pending, (error) => error === first.exact);
  first.gate.resolve();
  try {
    await rejected;
    assert.deepEqual(first.scene.submissions[0].recordEvents, []);
    const resultB = await sendVenueTurn(savedInput);
    assert.equal(resultB.session.placeName, "Surviving B");
    assert.equal(first.modelAccess + second.modelAccess, 0);
  } finally {
    releaseFirst();
    releaseSecond();
    clearFirst();
    clearSecond();
    second.owner.dispose();
  }
}
// Free navigation replay retains its owner and never starts image work.
{
  const first = commandFixture("Image A", ({ scene, world, touch, stamp }) => {
    const venue = venueDraft({ name: "Staff hall", description: "A staff hall", classes: ["community"] }, null);
    venue.id = scene.placeId;
    venue.zones = [{ ...venue.spaces[0], id: "staff-zone", name: "Staff room", kind: "staff" }];
    world.venues = [venue];
    scene.zoneId = "staff-zone";
    scene.sceneAttendance = { capturedAt: stamp, occupants: [] };
    scene.submissions[0].movement = {
      operationId: "same-image-operation",
      originZoneId: "outside",
      destinationZoneId: "staff-zone",
      transitionLineId: "line",
    };
    return {
      coordinateVenue: async (_id, id, kind, input, _expected, _retry, run) => {
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
  const clearFirst = installDefaultActivation(first.owner, () => {});
  const pending = moveVenueZone("same-scene", "staff-zone", undefined, undefined, "same-image-operation");
  const clearSecond = installDefaultActivation(second.owner, () => {});
  try {
    assert.equal((await pending).placeName, "Image A");
    assert.equal(first.calls.includes("image-command"), false);
    releaseFirst();
    clearFirst();
    first.gate.resolve();
    assert.equal(first.calls.includes("image-loader"), false);
    assert.equal(first.calls.filter((stage) => stage === "image-command").length, 0);
    assert(first.owners.every((owner) => owner === first.owner));
    assert.deepEqual(second.calls, []);
    assert.equal(first.modelAccess + second.modelAccess, 0);
  } finally {
    first.gate.resolve();
    releaseFirst();
    releaseSecond();
    clearFirst();
    clearSecond();
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
    const home = venueDraft({ name: "Home", description: "A small home", classes: ["residence"] }, null);
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
      scope: "shared" as const,
      timing: "later" as const,
      ownerId: "",
      quote: "Visit tomorrow.",
      sourceLineId: "invite-line",
    };
    await effects.recordSpokenInvitation(pending.scene, invitation);
    assert.equal(worldWrites, 0);
    assert(pending.scene.pendingRoomQuestions?.some((question) => question.includes("lacks validated")));
    assert.equal(pending.world.venues[0].playerInvitations?.length ?? 0, 0);
    await effects.recordSpokenInvitation(pending.scene, { ...invitation, interpretationVersion: 1 });
    assert.equal(pending.world.venues[0].playerInvitations?.length, 1, "validated saved invitations still replay");
    const before = worldWrites;
    await effects.applySavedAccessEvents(pending.scene, {
      ...pending.scene.submissions[0],
      replyLineIds: ["invite-line"],
      accessEvents: [
        {
          id: "old-access",
          facts: { actorId: "ada", venueId: pending.scene.placeId, zoneId: "residence", accessRevision: 0 },
          outcome: "invite-outside-hours",
          evidenceIds: ["draft:0"],
        },
      ],
    });
    assert.equal(worldWrites, before, "unversioned access effects do not enter mutation");
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
  for (const failingRead of ["session", "world"] as const) {
    const timeout = new AbortController();
    AbortSignal.timeout = () => timeout.signal;
    const exactFailure = new Error("failed greeting " + failingRead);
    const failed = commandFixture("Failed greeting", ({ scene }) => ({
      readSession: async () => {
        if (failingRead === "session") throw exactFailure;
        return scene;
      },
      readVillageState: async () => {
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

// Conclude must admit the same current writing/privacy contract as an ordinary new turn.
for (const legacy of [false, true]) {
  let admitted: any;
  const terminal = new Error("Admission observed");
  const frozen = { message: "Good night.", mode: "leave", targetId: "", semanticBudget: { maxRequests: 4 } };
  const current = commandFixture("Conclude admission", ({ scene, world }) => {
    const venue = venueDraft({ name: "Shared hall", description: "A public hall", classes: ["community"] }, null);
    venue.id = scene.placeId;
    world.venues = [venue];
    scene.semanticVersion = 2;
    scene.submissions = [];
    if (legacy) scene.operation = { id: "conclude", input: frozen } as any;
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
  if (legacy) assert.deepEqual(admitted, frozen, "Frozen legacy Conclude input is not upgraded on retry");
  else {
    assert.equal(admitted.interactionScopeVersion, 6);
    assert.equal(admitted.writingContractVersion, 3);
    assert.equal(admitted.semanticPipelineVersion, 3);
    assert.equal(admitted.residentActionsVersion, 2);
    assert(admitted.writingCapabilities);
  }
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
