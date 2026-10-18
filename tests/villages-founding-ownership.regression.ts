import { initialOpening } from "../packages/villages/src/server/domain/rules/opening-project.js";
import { agendaRevision } from "../packages/villages/src/server/domain/rules/agenda-revision.js";
import { villageFoundingSetting, remapVenues } from "../packages/villages/src/server/domain/rules/prompt-preset.js";
import { readEffectiveVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import {
  foundingSlot,
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
    readFoundingResidentContext: async (id) => ({ sourceRevision: foundingTaskRevision(state, id, "routine") }) as any,
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
  assert.equal(f.state().foundingPreparation?.status, "failed");
  await f.service.retryFoundedVillagePreparation();
  await until(() => f.counts().seedRequests === 1);
  const pending = f.service.prepareFoundedVillage();
  f.gate.resolve();
  await pending;
  assert.equal(f.state().foundingPreparation?.status, "ready");
  assert.deepEqual(f.calls, ["first", "second"]);
}
async function legacyOpeningRecovery() {
  const f = fixture("legacy-opening"),
    state = f.state();
  state.foundingPreparation!.venueDetailsSeeded = true;
  state.villagers = state.villagers.slice(0, 1);
  const id = state.villagers[0].characterId;
  state.opening = initialOpening([id], "same-venue", "legacy-opening");
  const context = {
    village: state.name,
    setting: villageFoundingSetting(state),
    home: "",
    card: readEffectiveVillagerCard(state.villagers[0]),
    characterId: id,
    venues: remapVenues(state.venues),
    openingProposal: true,
    activeWishes: [],
    completedWishes: [],
    schedule: null,
    lore: [],
  };
  const proposal = {
    name: "Sky Terrace",
    description: "A shared place for watching the sky",
    situation: "Shared evening observations",
    venueClass: "community",
    established: false,
    provenance: "Open sky",
    work: "Arrange observation times",
    firstUse: "Watch the sky together",
  };
  const payload = {
    routine: "Quiet reading and conversation",
    palette: Array.from({ length: 6 }, (_, index) => ({ activity: "Reading chapter " + index, venue: 0 })),
    days: Array.from({ length: 7 }, () => [0, 1, 2, 3, 4, 5, 0, 1]),
    rhythm: [],
    openingProposal: proposal,
  };
  let retired = 0;
  f.ports.backgroundLegacyFounding = async () =>
    ({
      seed: state.seed,
      revision: agendaRevision(state, id),
      status: "interrupted",
      input: { context },
      steps: [
        {
          key: "owned-routine-profile",
          status: "completed",
          response: { content: JSON.stringify(payload), finishReason: "stop" },
        },
      ],
    }) as any;
  f.ports.retireLegacyFounding = async () => {
    retired++;
  };
  f.ports.adoptFoundingRoutine = (live, residentId, agenda, revision) => {
    live.villagers.find((row) => row.characterId === residentId)!.agenda = agenda;
    completeFoundingTask(live, residentId, "routine", revision);
  };
  const service = createFoundingPreparation(f.ports);
  f.gate.resolve();
  await service.prepareFoundedVillage();
  assert.equal(f.state().foundingPreparation?.status, "ready");
  assert.equal(
    f.state().opening?.proposals[0].name,
    proposal.name,
    "Saved legacy response restores its proposal before marking Routine complete",
  );
  assert.deepEqual(f.calls, [], "Recovered Routine does not dispatch another request");
  assert.equal(retired, 1);
  await service.prepareFoundedVillage();
  assert.equal(f.state().opening?.proposals.length, 1, "Replay preserves the single saved proposal");
}
async function main() {
  await legacyOpeningRecovery();
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
