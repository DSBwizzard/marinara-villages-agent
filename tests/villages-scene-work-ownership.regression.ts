import assert from "node:assert/strict";
import {
  createActivationScope,
  installDefaultActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { createSceneWork } from "../packages/villages/src/server/features/scenes/scene-work-service.js";
import { configureSceneWork, sceneWork } from "../packages/villages/src/server/features/scenes/scene-work.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import {
  greetVenue,
  enterVenue,
  enterResidencePrivateSpace,
  sendVenueTurn,
} from "../packages/villages/src/server/features/scenes/venue-session.js";
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
