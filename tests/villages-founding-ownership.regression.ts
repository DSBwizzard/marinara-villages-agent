import assert from "node:assert/strict";
import {
  createActivationScope,
  installDefaultActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
import {
  createFoundingPreparation,
  type FoundingPreparationPorts,
} from "../packages/villages/src/server/features/founding/preparation-service.js";
import {
  configureFoundingPreparation,
  prepareFoundedVillage,
  foundingPreparationSnapshot,
} from "../packages/villages/src/server/features/founding/preparation.js";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
const tick = () => new Promise<void>((resolve) => setImmediate(resolve));
async function until(ready: () => boolean) {
  for (let i = 0; i < 300; i++) {
    if (ready()) return;
    await tick();
  }
  throw new Error("Founding did not reach the expected checkpoint");
}
function fixture(name: string) {
  const stamp = new Date().toISOString();
  let state = coerceVillageState({
    seed: "same-seed",
    name,
    setting: name,
    wishSystemVersion: 3,
    setupAt: stamp,
    foundedAt: stamp,
    foundingPreparation: { status: "pending", completedIds: [], currentId: "", error: "", venueDetailsSeeded: false },
    villagers: ["first", "second"].map((id) => ({
      characterId: id,
      addedAt: stamp,
      cardSnapshot: { id, name: id, revision: 1, sourceStatus: "available", capturedAt: stamp },
    })),
    venues: [{ id: "same-venue", name: "Hall", form: "Station", classes: ["gathering"] }],
  });
  for (const resident of state.villagers)
    resident.agenda = unwrittenVillageAgenda(state.venues, resident.cardSnapshot.name);
  const gate = deferred(),
    entered = deferred();
  const calls: string[] = [],
    retries: string[] = [],
    stages: string[] = [];
  const jobs = new Map<string, any>();
  let fail = false;
  let seedRequests = 0;
  let preparationRequests = 0;
  let conflicts = 2;
  const ports: FoundingPreparationPorts = {
    readVillageState: async () => structuredClone(state),
    mutateVillageState: async (mutator) => {
      if (conflicts-- > 0) mutator(structuredClone(state));
      const next = structuredClone(state);
      mutator(next);
      state = next;
      return structuredClone(state);
    },
    buildVillageSnapshot: async () =>
      ({ name: state.name, preparation: structuredClone(state.foundingPreparation) }) as any,
    villagesLogger: () => ({ debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} }),
    reportFoundingProgress: async (seed, progress) => {
      assert.equal(seed, state.seed);
      assert.equal(state.foundingPreparation!.status, "pending");
      Object.assign(state.foundingPreparation!, progress);
      if (progress.stage) stages.push(progress.stage);
    },
    seedFoundingVenueDetails: async () => {
      seedRequests++;
      entered.resolve();
      await gate.promise;
      return { "same-venue": { condition: name, items: [], publicFacts: [], features: [] } };
    },
    preparePrivateSpaces: async () => {
      preparationRequests++;
    },
    queueVillagerAgenda: async (id, finite) => {
      assert.equal(finite, true);
      calls.push(id);
      const resident = state.villagers.find((row) => row.characterId === id)!;
      const status = fail ? "interrupted" : "completed";
      jobs.set(id, {
        id: `job-${id}`,
        kind: "agenda",
        subjectId: id,
        attempt: 2,
        status,
        error: "Unknown paid outcome",
      });
      if (!fail) {
        resident.agenda!.personalizationPending = false;
        resident.agenda!.generatedAt = stamp;
      }
    },
    settleBackgroundWork: async () => {},
    backgroundStatus: async (_kind, id) => jobs.get(id)?.status ?? "none",
    backgroundWorkSummaries: async () => structuredClone([...jobs.values()]),
    retryBackgroundJob: async (id, attempt, requestId) => {
      assert.equal(attempt, 2);
      assert.ok(requestId);
      retries.push(id);
      return {} as any;
    },
  };
  const service = createFoundingPreparation(ports);
  return {
    service,
    state: () => state,
    calls,
    retries,
    stages,
    gate,
    entered,
    setFailure: (next: boolean) => {
      fail = next;
    },
    counts: () => ({ seedRequests, preparationRequests }),
  };
}
async function independentFounding() {
  const a = fixture("A"),
    b = fixture("B");
  a.setFailure(true);
  const pendingA = a.service.prepareFoundedVillage();
  assert.equal(pendingA, a.service.prepareFoundedVillage(), "same owner returns its exact in-flight Promise");
  const pendingB = b.service.prepareFoundedVillage();
  assert.notEqual(pendingA, pendingB);
  try {
    await Promise.all([a.entered.promise, b.entered.promise]);
    b.gate.resolve();
    await pendingB;
    assert.equal(b.state().foundingPreparation?.status, "ready");
    assert.deepEqual(b.state().foundingPreparation?.completedIds, ["first", "second"]);
    assert.deepEqual(b.calls, ["first", "second"], "resident order is unchanged");
    assert.equal(b.state().venues[0].state.condition, "B");
    assert.equal(a.state().foundingPreparation?.status, "pending");
    assert.equal(a.counts().preparationRequests, 0);
    a.gate.resolve();
    await pendingA;
    assert.equal(a.state().foundingPreparation?.status, "failed");
    assert.match(a.state().foundingPreparation!.error, /Unknown paid outcome/);
    assert.deepEqual(a.calls, ["first"], "failure stops later resident requests");
    await a.service.foundingPreparationSnapshot();
    await a.service.prepareFoundedVillage();
    assert.deepEqual(a.calls, ["first"], "discovery does not retry an interrupted paid request");
    await assert.rejects(a.service.assertFoundedVillageReady(), /still preparing/);
    a.setFailure(false);
    await a.service.retryFoundedVillagePreparation();
    await a.service.prepareFoundedVillage();
    assert.deepEqual(a.retries, ["job-first"]);
    assert.deepEqual(a.calls, ["first", "first", "second"]);
    assert.equal(a.counts().seedRequests, 1, "deliberate retry preserves completed Venue details");
    assert.equal(a.state().venues[0].state.condition, "A");
    assert.equal(a.state().foundingPreparation?.status, "ready");
    await a.service.assertFoundedVillageReady();
    await a.service.retryFoundedVillagePreparation();
    assert.deepEqual(a.retries, ["job-first"], "repeated retry after completion sends no request");
    assert.deepEqual(b.calls, ["first", "second"], "another world's retry leaves this owner intact");
  } finally {
    a.gate.resolve();
    b.gate.resolve();
    await Promise.allSettled([pendingA, pendingB]);
  }
}
async function scopedAndDefaultDispatch() {
  const a = fixture("scoped-A"),
    b = fixture("scoped-B");
  const ownerA = createActivationScope(),
    ownerB = createActivationScope(),
    missing = createActivationScope();
  const releaseA = ownerA.run(() => configureFoundingPreparation(a.service));
  const releaseB = ownerB.run(() => configureFoundingPreparation(b.service));
  const clearA = installDefaultActivation(ownerA, () => {});
  const pendingA = prepareFoundedVillage();
  assert.equal(pendingA, ownerA.run(prepareFoundedVillage));
  const clearB = installDefaultActivation(ownerB, () => {});
  const pendingB = prepareFoundedVillage();
  try {
    assert.throws(() => missing.run(prepareFoundedVillage), /founding preparation is not configured/);
    await Promise.all([a.entered.promise, b.entered.promise]);
    a.gate.resolve();
    await pendingA;
    assert.equal(a.state().venues[0].state.condition, "scoped-A");
    releaseA();
    ownerA.dispose();
    clearA();
    assert.throws(() => ownerA.run(prepareFoundedVillage), /founding preparation is not configured/);
    b.gate.resolve();
    await pendingB;
    assert.equal(b.state().venues[0].state.condition, "scoped-B");
    const snapshot = await foundingPreparationSnapshot();
    assert.equal(snapshot.name, "scoped-B");
    await prepareFoundedVillage();
    assert.deepEqual(b.calls, ["first", "second"]);
  } finally {
    a.gate.resolve();
    b.gate.resolve();
    await Promise.allSettled([pendingA, pendingB]);
    if (ownerA.active) {
      releaseA();
      ownerA.dispose();
    }
    releaseB();
    ownerB.dispose();
    missing.dispose();
    clearA();
    clearB();
  }
}
async function pendingSnapshotResumes() {
  const f = fixture("snapshot");
  await f.service.foundingPreparationSnapshot();
  await until(() => f.counts().seedRequests === 1);
  const pending = f.service.prepareFoundedVillage();
  f.gate.resolve();
  await pending;
  assert.equal(f.state().foundingPreparation?.status, "ready");
  assert.deepEqual(f.calls, ["first", "second"]);
}
async function main() {
  await independentFounding();
  await scopedAndDefaultDispatch();
  await pendingSnapshotResumes();
  console.log(
    "Founding ownership passed: independent same-ID promises, phase/resident order, saved progress, deliberate retry, scoped/default dispatch and old cleanup (synthetic ports).",
  );
}
const watchdog = setTimeout(() => {
  throw new Error("Founding ownership scenarios did not finish");
}, 20000);
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => clearTimeout(watchdog));
