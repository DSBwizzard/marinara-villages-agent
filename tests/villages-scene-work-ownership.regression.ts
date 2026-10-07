import assert from "node:assert/strict";
import {
  createActivationScope,
  installDefaultActivation,
  activationScope,
  bindActivationService,
  scopedActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { createSceneWork } from "../packages/villages/src/server/features/scenes/scene-work-service.js";
import { configureSceneWork, sceneWork } from "../packages/villages/src/server/features/scenes/scene-work.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import {
  greetVenue,
  enterVenue,
  enterResidencePrivateSpace,
  sendVenueTurn,
  retrySceneChangeInterpretation,
  moveVenueZone,
  configureSceneCommands,
  sceneReplayEffects,
} from "../packages/villages/src/server/features/scenes/venue-session.js";
import {
  createSceneCommands,
  type SceneCommandPorts,
} from "../packages/villages/src/server/features/scenes/command-service.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { createExchangeProcessing } from "../packages/villages/src/server/domain/decoding/exchange-codec.js";
import { VENUE_REPLY_MAX_TOKENS } from "../packages/villages/src/server/features/scenes/writing.js";
import { WISH_PROPOSAL_INSTRUCTION } from "../packages/villages/src/server/features/residents/wishes/wish-progress.js";
import { coordinateVenue } from "../packages/villages/src/server/jobs/venue-coordinator.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { venueDraft } from "../packages/villages/src/server/domain/rules/venue-authoring.js";
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
      assert.deepEqual(input, { message: "Already saved", mode: "chat", targetId: "", interactionScopeVersion: 1 });
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
        revision: 1,
        data: {
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
      { id: "villages-active-venue", revision: 1, data: { sessionId: "same", placeId: "same-place" } },
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
        persistence: { documents },
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
  const venue = venueDraft({ name: "Shared hall", description: "A public hall", classes: ["gathering"] }, null);
  world.venues = [venue];
  world.storyPace = "off";
  shared.rows.set("villages-village", { id: "villages-village", revision: 1, data: world });
  shared.pauseSceneCreation();
  const sharedB = createActivationScope();
  const documentsB = canonical ? { ...shared.documents } : shared.documents;
  let providerAccess = 0;
  const releaseSharedB = sharedB.run(() =>
    configureVillagesRuntime(
      {
        persistence: { documents: documentsB },
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
      assert.equal(after.submissions.length, 0);
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
// Wish recovery keeps its lazy loader and loaded retry command under the initiating owner.
{
  const terminal = new Error("Saved notices ready");
  const first = commandFixture("Retry A", ({ scene, world, touch, stamp }) => {
    const turn = scene.submissions[0];
    turn.processing!.domains.wishes.status = "failed";
    turn.liveProposals = {
      version: 1,
      memoryChanges: [],
      relationshipChanges: {},
      memoryVersions: {},
      earlierLineIds: [],
      playerLineId: "player-line",
      replyLineIds: [],
    };
    return {
      coordinateVenue: async (_id, id, kind, input, _expected, _retry, run) => {
        assert.equal(id, "change:same-turn:wishes");
        assert.equal(kind, "change-interpretation");
        assert.deepEqual(input, { submissionId: "same-turn", domain: "wishes" });
        return run();
      },
      readVillageState: async () => world,
      villagesDocuments: () => ({
        list: async () => [
          {
            id: "same-job",
            packageId: "villages",
            kind: "background-work",
            name: "Wish retry",
            description: "",
            revision: 1,
            createdAt: stamp,
            updatedAt: stamp,
            data: {
              kind: "wish-check",
              seed: world.seed,
              input: { sceneId: scene.id, submissionId: turn.id },
              status: "failed",
              attempt: 2,
            },
          },
        ],
        getById: async () => assert.fail("Wish retry does not read arbitrary documents"),
        remove: async () => assert.fail("Wish retry does not remove documents"),
      }),
      loadBackgroundRetry: async () => {
        await touch("retry-loader");
        return {
          retryBackgroundJob: async (id, attempt, actionId) => {
            assert.equal(id, "same-job");
            assert.equal(attempt, 2);
            assert.match(actionId, /^[a-f0-9]{64}$/);
            await touch("retry-command");
          },
        };
      },
      venueOperationId: () => "Retry A operation",
      venueCheckpoint: async (_id, run) => run(),
      outsideVenueOperation: (run) => run(),
      readSceneChanges: async () => {
        await touch("changes");
        throw terminal;
      },
    };
  });
  const second = commandFixture("Retry B");
  first.pause("retry-loader");
  const releaseFirst = first.owner.run(() => configureSceneCommands(first.service));
  const releaseSecond = second.owner.run(() => configureSceneCommands(second.service));
  const clearFirst = installDefaultActivation(first.owner, () => {});
  const pending = retrySceneChangeInterpretation("same-scene", "same-turn", "wishes");
  const checked = assert.rejects(pending, (error) => error === terminal);
  await first.entered.promise;
  const clearSecond = installDefaultActivation(second.owner, () => {});
  releaseFirst();
  clearFirst();
  first.gate.resolve();
  try {
    await checked;
    assert.equal(first.calls.filter((stage) => stage === "retry-command").length, 1);
    assert.equal(first.calls.filter((stage) => stage === "progress").length, 2);
    assert(first.owners.every((owner) => owner === first.owner));
    assert.deepEqual(second.calls, []);
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

// A detached image callback retains its owner while the lazy module promise is paused.
{
  const generated = deferred();
  const first = commandFixture("Image A", ({ scene, world, touch, stamp }) => {
    const venue = venueDraft({ name: "Staff hall", description: "A staff hall", classes: ["gathering"] }, null);
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
          generateFirstPrivateSpaceImage: async (placeId, zoneId) => {
            assert.equal(placeId, scene.placeId);
            assert.equal(zoneId, "staff-zone");
            await touch("image-command");
            generated.resolve();
          },
        };
      },
    };
  });
  const second = commandFixture("Image B");
  first.pause("image-loader");
  const releaseFirst = first.owner.run(() => configureSceneCommands(first.service));
  const releaseSecond = second.owner.run(() => configureSceneCommands(second.service));
  const clearFirst = installDefaultActivation(first.owner, () => {});
  const pending = moveVenueZone("same-scene", "staff-zone", undefined, undefined, "same-image-operation");
  await first.entered.promise;
  const clearSecond = installDefaultActivation(second.owner, () => {});
  try {
    assert.equal((await pending).placeName, "Image A");
    assert.equal(first.calls.includes("image-command"), false);
    releaseFirst();
    clearFirst();
    first.gate.resolve();
    await generated.promise;
    assert.equal(first.calls.filter((stage) => stage === "image-command").length, 1);
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
