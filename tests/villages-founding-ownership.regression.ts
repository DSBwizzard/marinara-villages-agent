import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { initialOpening } from "../packages/villages/src/server/domain/rules/opening-project.js";
import { remapVenues } from "../packages/villages/src/server/domain/rules/prompt-preset.js";
import { readEffectiveVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import {
  foundingSlot,
  foundingCompletedIds,
  foundingTaskRevision,
  completeFoundingTask,
} from "../packages/villages/src/server/domain/rules/founding-tasks.js";
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
    ...defaultVillageState(),
    version: 5,
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
    venues: [{ id: "same-venue", name: "Hall", form: "Station", classes: ["community"] }],
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
  function finish(kind: "routine" | "wish", id: string, attempt = 2) {
    const revision = foundingTaskRevision(state, id, kind),
      slot = foundingSlot(kind, id);
    jobs.set(slot, {
      id: slot,
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
    seedFoundingVenueDetails: async () => {
      seedRequests++;
      entered.resolve();
      await gate.promise;
      return { "same-venue": { condition: name, items: [], publicFacts: [], features: [] } };
    },
    preparePrivateSpaces: async () => {
      preparationRequests++;
    },
    backgroundLegacyFounding: async () => null,
    retireLegacyFounding: async () => {},
    readFoundingResidentContext: async (id) =>
      ({
        sourceRevision: foundingTaskRevision(state, id, "routine"),
        card: readEffectiveVillagerCard(state.villagers.find((row) => row.characterId === id)!),
        venues: remapVenues(state.venues),
        circumstances: { worldFacts: state.worldFacts, details: state.foundingDetails, imprint: state.scenarioImprint },
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
    retryBackgroundJob: async (id, attempt, requestId) => {
      const job = jobs.get(id);
      assert.equal(attempt, job.attempt);
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
    assert.equal(b.state().venues[0].state.condition, "B");
    assert.equal(a.state().foundingPreparation?.status, "pending");
    assert.equal(a.counts().preparationRequests, 0);
    a.gate.resolve();
    await pendingA;
    assert.equal(a.state().foundingPreparation?.status, "failed");
    assert.match(a.state().foundingPreparation!.error, /Resident preparation incomplete/);
    assert.deepEqual(a.calls, ["first", "second"], "request failure leaves other tasks eligible");
    await a.service.foundingPreparationSnapshot();
    await a.service.prepareFoundedVillage();
    assert.deepEqual(a.calls, ["first", "second"], "discovery does not retry an interrupted paid request");
    await assert.rejects(a.service.assertFoundedVillageReady(), /still preparing/);
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
    assert.equal(a.counts().seedRequests, 1, "deliberate retry preserves completed Venue details");
    assert.equal(a.state().venues[0].state.condition, "A");
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
  assert.equal(f.counts().seedRequests, 0, "GET never starts provider work");
  assert.equal(f.state().foundingPreparation?.status, "pending", "GET is observational");
  await f.service.retryFoundedVillagePreparation();
  await until(() => f.counts().seedRequests === 1);
  const pending = f.service.prepareFoundedVillage();
  f.gate.resolve();
  await pending;
  assert.equal(f.state().foundingPreparation?.status, "ready");
  assert.deepEqual(f.calls, ["first", "second"]);
}
async function partialOpeningCount() {
  const f = fixture("partial-opening");
  f.state().foundingPreparation!.venueDetailsSeeded = true;
  f.state().opening = initialOpening(["first", "second"], "same-venue", "partial-opening");
  f.gate.resolve();
  await f.service.prepareFoundedVillage();
  assert.equal(f.state().foundingPreparation!.status, "failed");
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
async function independentOpeningIdeas() {
  const f = fixture("independent-ideas");
  f.state().opening = initialOpening(["first", "second"], "same-venue", "independent-ideas");
  const calls: string[] = [];
  let failFirst = true;
  f.ports.proposeOpeningIdea = async (_context, key) => {
    const id = key.split(":").at(-1)!;
    calls.push(id);
    if (id === "first" && failFirst) throw Error("Invalid idea; saved response retained");
    return {
      residentId: id,
      name: id + " terrace",
      description: "A place to meet",
      venueClass: "community",
      established: false,
      provenance: "Open space",
      work: "Arrange meeting times",
      firstUse: "Meet together",
    };
  };
  const service = createFoundingPreparation(f.ports);
  f.gate.resolve();
  await service.prepareFoundedVillage();
  assert.deepEqual(
    f.state().foundingPreparation!.completedIds,
    ["first", "second"],
    "idea failure cannot roll back Routine or Wish receipts",
  );
  assert.deepEqual(
    f.state().opening!.proposals.map((row) => row.residentId),
    ["second"],
    "other resident idea commits independently",
  );
  assert.equal(f.state().foundingPreparation!.status, "failed");
  await service.foundingPreparationSnapshot();
  await service.prepareFoundedVillage();
  assert.deepEqual(calls, ["first", "second"], "status and repeated preparation never authorize paid retries");
  failFirst = false;
  await service.retryFoundedVillagePreparation({ actionId: "explicit-idea-retry" });
  await service.prepareFoundedVillage();
  assert.deepEqual(calls, ["first", "second", "first"], "explicit retry skips valid committed ideas");
  assert.deepEqual(f.calls, ["first", "second"], "idea retry reuses all resident receipts");
  assert.equal(f.state().opening!.proposals.length, 2);
  assert.equal(f.state().foundingPreparation!.status, "ready");
  // Resident scheduling failure likewise cannot prevent independent opening ideas.
  const failed = fixture("invalid-routines");
  failed.state().opening = initialOpening(["first", "second"], "same-venue", "invalid-routines");
  failed.setFailure(true);
  failed.ports.proposeOpeningIdea = f.ports.proposeOpeningIdea;
  failed.gate.resolve();
  await createFoundingPreparation(failed.ports).prepareFoundedVillage();
  assert.equal(failed.state().opening!.proposals.length, 2);
  assert.equal(failed.state().foundingPreparation!.status, "failed", "required routines still gate entry");
}
async function changedOpeningSource(worldFacts = false) {
  const keys: string[] = [];
  let changed = false;
  const f = fixture("changed-source");
  f.state().opening = initialOpening(["first"], "same-venue", "changed-source");
  f.ports.proposeOpeningIdea = async (_context, key) => {
    keys.push(key);
    if (!changed) {
      if (worldFacts) f.state().worldFacts.push("Changed world fact during generation");
      else f.state().villagers[0].cardSnapshot.personality = "Changed identity during generation";
    }
    changed = true;
    return {
      residentId: "first",
      name: "Terrace",
      description: "A place to meet",
      venueClass: "community",
      established: false,
      provenance: "Open space",
      work: "Arrange meeting times",
      firstUse: "Meet together",
    };
  };
  f.gate.resolve();
  await createFoundingPreparation(f.ports).prepareFoundedVillage();
  assert.equal(
    f.state().opening!.proposals.length,
    0,
    "a completed old-context response cannot commit after identity changes",
  );
  assert.equal(f.state().foundingPreparation!.status, "failed");
  const service = createFoundingPreparation(f.ports);
  await service.retryFoundedVillagePreparation({ actionId: "changed-source-explicit-retry" });
  await service.prepareFoundedVillage();
  assert.equal(f.state().foundingPreparation!.status, "ready");
  assert.equal(f.state().opening!.proposals.length, 1);
  assert.equal(keys.length, 2);
  assert.notEqual(keys[0], keys[1], "current-source retry retains the old paid receipt under its original key");
}

async function main() {
  await changedOpeningSource();
  await changedOpeningSource(true);
  await independentOpeningIdeas();
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
