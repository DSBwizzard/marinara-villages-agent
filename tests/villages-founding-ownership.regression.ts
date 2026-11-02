import { venueFixture } from "./helpers/venues.fixture.js";
import assert from "node:assert/strict";
import {
  createActivationScope,
  installDefaultActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { readEffectiveVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
import {
  completeFoundingTask,
  foundingCompletedIds,
  foundingSlot,
  foundingTaskRevision,
} from "../packages/villages/src/server/domain/rules/founding-tasks.js";
import { initialOpening } from "../packages/villages/src/server/domain/rules/opening-project.js";
import { remapVenues } from "../packages/villages/src/server/domain/rules/prompt-preset.js";
import {
  createFoundingPreparation,
  type FoundingPreparationPorts,
} from "../packages/villages/src/server/features/founding/preparation-service.js";
import {
  configureFoundingPreparation,
  foundingPreparationSnapshot,
  prepareFoundedVillage,
} from "../packages/villages/src/server/features/founding/preparation.js";

function deferred() {
  return Promise.withResolvers<void>();
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
    ...defaultVillageState(),

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
    venues: [
      venueFixture({
        id: "same-venue",
        name: "Hall",
        form: "Station",
        description: name,
        classes: ["community"],
        presentation: { mapId: "", image: null, x: null, y: null },
        occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
      }),
    ],
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
  const seedRequests = 0;
  let preparationRequests = 0;
  let conflicts = 2;
  function finish(kind: "routine" | "wish", id: string, attempt = 2) {
    const revision = foundingTaskRevision(state, id, kind),
      slot = foundingSlot(kind, id);
    jobs.set(slot, {
      id: slot,
      instanceId: jobs.get(slot)?.instanceId ?? "40000000-0000-4000-8000-000000000000",
      kind: kind === "routine" ? "agenda" : "wish",
      subjectId: id,
      attempt,
      status: fail ? "interrupted" : "completed",
      error: fail ? "Unknown paid outcome" : "",
      input: { foundingContract: 1 },
      revision,
    });
    if (!fail) {
      if (kind === "routine") {
        const resident = state.villagers.find((row) => row.characterId === id)!;
        resident.agenda!.personalizationPending = false;
        resident.agenda!.generatedAt = stamp;
      }
      completeFoundingTask(state, id, kind, revision);
    }
  }
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
    preparePrivateSpaces: async () => {
      preparationRequests++;
      entered.resolve();
      await gate.promise;
    },
    backgroundLegacyFounding: async () => null,
    retireLegacyFounding: async () => {},
    readFoundingResidentContext: async (id) =>
      ({
        sourceRevision: foundingTaskRevision(state, id, "routine"),
        card: readEffectiveVillagerCard(state.villagers.find((row) => row.characterId === id)!),
        venues: remapVenues(state.venues),
        circumstances: { worldRules: state.worldRules },
      }) as any,
    adoptFoundingRoutine: () => {},
    backgroundJobSnapshot: async (kind, id) =>
      structuredClone(jobs.get(foundingSlot(kind === "agenda" ? "routine" : "wish", id)) ?? null),
    queueVillagerAgenda: async (id, finite) => {
      assert.equal(finite, true);
      calls.push(id);
      finish("routine", id);
    },
    queueFoundingWish: async (id) => {
      finish("wish", id);
    },
    settleBackgroundWork: async () => {},
    backgroundWorkSummaries: async () => structuredClone([...jobs.values()]),
    retryBackgroundJob: async (id, attempt, requestId, instanceId) => {
      const job = jobs.get(id);
      assert.equal(attempt, job.attempt);
      assert.equal(instanceId, job.instanceId);
      assert.ok(requestId);
      retries.push(id);
      finish(job.kind === "agenda" ? "routine" : "wish", job.subjectId, job.attempt + 1);
      return {} as any;
    },
  };
  const service = createFoundingPreparation(ports);
  return {
    service,
    ports,
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
    assert.match(b.state().venues[0].zones!.find((zone) => zone.kind === "public")!.description, /B$/);
    assert.equal(a.state().foundingPreparation?.status, "pending");
    assert.equal(a.counts().preparationRequests, 1);
    a.gate.resolve();
    await pendingA;
    assert.equal(a.state().foundingPreparation?.status, "failed");
    assert.match(a.state().foundingPreparation!.error, /Resident preparation incomplete/);
    assert.deepEqual(a.calls, ["first", "second"], "request failure leaves other tasks eligible");
    await a.service.foundingPreparationSnapshot();
    await a.service.prepareFoundedVillage();
    assert.deepEqual(a.calls, ["first", "second"], "discovery does not retry an interrupted paid request");
    await a.service.assertFoundedVillageReady();
    a.setFailure(false);
    await a.service.retryFoundedVillagePreparation();
    await a.service.prepareFoundedVillage();
    assert.deepEqual(a.retries, [
      foundingSlot("routine", "first"),
      foundingSlot("routine", "second"),
      foundingSlot("wish", "first"),
      foundingSlot("wish", "second"),
    ]);
    assert.deepEqual(a.calls, ["first", "second"]);
    assert.equal(a.counts().seedRequests, 0, "preparation never regenerates reviewed physical descriptions");
    assert.match(a.state().venues[0].zones!.find((zone) => zone.kind === "public")!.description, /A$/);
    assert.equal(a.state().foundingPreparation?.status, "ready");
    await a.service.assertFoundedVillageReady();
    await a.service.retryFoundedVillagePreparation();
    assert.deepEqual(
      a.retries,
      [
        foundingSlot("routine", "first"),
        foundingSlot("routine", "second"),
        foundingSlot("wish", "first"),
        foundingSlot("wish", "second"),
      ],
      "repeated retry after completion sends no request",
    );
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
    assert.match(a.state().venues[0].zones!.find((zone) => zone.kind === "public")!.description, /scoped-A$/);
    releaseA();
    ownerA.dispose();
    clearA();
    assert.throws(() => ownerA.run(prepareFoundedVillage), /founding preparation is not configured/);
    b.gate.resolve();
    await pendingB;
    assert.match(b.state().venues[0].zones!.find((zone) => zone.kind === "public")!.description, /scoped-B$/);
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
  assert.equal(f.counts().seedRequests, 0, "GET never starts provider work");
  assert.equal(f.state().foundingPreparation?.status, "pending", "GET is observational");
  await f.service.retryFoundedVillagePreparation();
  await until(() => f.counts().preparationRequests === 1);
  const pending = f.service.prepareFoundedVillage();
  f.gate.resolve();
  await pending;
  assert.equal(f.state().foundingPreparation?.status, "ready");
  assert.deepEqual(f.calls, ["first", "second"]);
}
async function partialOpeningCount() {
  const f = fixture("partial-opening");
  f.state().opening = initialOpening(["first", "second"], "same-venue", "partial-opening");
  f.gate.resolve();
  await f.service.prepareFoundedVillage();
  assert.equal(f.state().foundingPreparation!.status, "ready");
  assert.deepEqual(
    f.state().foundingPreparation!.completedIds,
    ["first", "second"],
    "Missing proposals cannot roll back successful task counts",
  );
  const marker = f.state().foundingPreparation!;
  marker.completedIds = [];
  marker.tasks!.second!.routine!.status = "failed";
  assert.deepEqual(
    foundingCompletedIds(f.state()),
    ["first"],
    "Visible count follows current task receipts even if saved aggregate is stale",
  );
}
async function interactiveOpeningNeedsNoIdeas() {
  const f = fixture("interactive-opening");
  f.state().opening = initialOpening(["first", "second"], "same-venue", "interactive-opening");
  let calls = 0;
  f.ports.proposeOpeningIdea = async () => {
    calls++;
    throw new Error("Interactive openings must not request a proposal");
  };
  f.gate.resolve();
  await createFoundingPreparation(f.ports).prepareFoundedVillage();
  assert.equal(calls, 0);
  assert.equal(f.state().foundingPreparation!.status, "ready");
  assert.equal(f.state().projects.length, 0);
}
async function main() {
  await interactiveOpeningNeedsNoIdeas();
  await partialOpeningCount();
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
