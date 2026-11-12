import assert from "node:assert/strict";
import { createActivationScope } from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { venueDraftFixture as venueDraft } from "./helpers/venues.fixture.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { createSceneWork } from "../packages/villages/src/server/features/scenes/scene-work-service.js";
import { configureSceneWork, sceneWork } from "../packages/villages/src/server/features/scenes/scene-work.js";
import {
  enterVenue,
  greetVenue,
  moveVenueZone,
  sendVenueTurn,
} from "../packages/villages/src/server/features/scenes/venue-session.js";
import { coordinateVenue } from "../packages/villages/src/server/jobs/venue-coordinator.js";
import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";

function deferred() {
  return Promise.withResolvers<void>();
}

function fixture(name: string, pause = false, navigationIdentity?: object) {
  const gate = deferred(),
    entered = deferred();
  const stamp = new Date().toISOString();
  const venue = venueDraft({ id: "same-place", name, description: "A hall." }, null);
  const world = { ...defaultVillageState(), seed: "same-seed", setupAt: stamp, foundedAt: stamp, venues: [venue] };
  const rows = new Map<string, any>([
    ["villages-village", { id: "villages-village", kind: "village", packageId: "villages", revision: 1, data: world }],
    [
      "villages-venue-visit-same",
      {
        id: "villages-venue-visit-same",
        kind: "venue-visit",
        packageId: "villages",
        revision: 1,
        data: {
          version: 5,
          id: "same",
          villageSeed: "same-seed",
          placeId: "same-place",
          placeName: name,
          zoneId: "exterior",
          status: "active",
          startedAt: stamp,
          lastActivityAt: stamp,
          sceneRevision: 0,
          lines: [],
          submissions: [],
          sceneAttendance: { capturedAt: stamp, layout: captureSceneLayout(venue), occupants: [] },
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
    async list(_package: string, kind: string) {
      return structuredClone([...rows.values()].filter((row) => row.kind === kind));
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
  world.setupAt = world.foundedAt = new Date().toISOString();
  const venue = venueDraft({ name: "Shared hall", description: "A public hall", classes: ["community"] }, null);
  world.venues = [venue];
  world.backgroundPace = "off";
  shared.rows.set("villages-village", {
    id: "villages-village",
    kind: "village",
    packageId: "villages",
    revision: 1,
    data: world,
  });
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
  await assert.rejects(residence, /not in this Venue/);
  assert(residenceA.allReads.includes("villages-village"));
  assert.deepEqual(residenceB.allReads, [], "the calling B activation cannot redirect pending movement to its Village");
} finally {
  residenceA.gate.resolve();

  residenceA.release();
  residenceB.release();
  residenceA.scope.dispose();
  residenceB.scope.dispose();
}

// Cancellation while the admission read is paused must not start coordinated work.
{
  const f = fixture("Cancelled", true);
  const pending = f.scope.run(() => greetVenue("same"));
  const rejected = assert.rejects(pending, (error: any) => error?.name === "AbortError");
  try {
    await f.entered.promise;
    f.scope.run(() => {
      assert.ok(sceneWork().greetingTask("same"));
      sceneWork().abortGreeting("same");
    });
    await rejected;
    assert.equal(
      f.scope.run(() => sceneWork().greetingTask("same")),
      undefined,
    );
    f.gate.resolve();
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.equal(f.rows.get("villages-venue-visit-same").data.operation, undefined);
    assert.ok(!f.allReads.includes("villages-village"));
  } finally {
    f.gate.resolve();
    f.release();
    f.scope.dispose();
  }
}
