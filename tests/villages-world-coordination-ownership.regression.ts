import assert from "node:assert/strict";
import {
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import {
  readEffectiveVillagerCard,
  readVillagerCard,
} from "../packages/villages/src/server/adapters/engine/catalog.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { BackgroundInput } from "../packages/villages/src/server/domain/models/background-model.js";
import type { VillageSnapshot, VillageState } from "../packages/villages/src/server/domain/models/world.js";
import { snapshotFromCard } from "../packages/villages/src/server/domain/rules/resident-card-snapshot.js";
import { venueDraft } from "../packages/villages/src/server/domain/rules/venue-authoring.js";
import {
  createWorldCoordination,
  type WorldCoordinationPorts,
} from "../packages/villages/src/server/features/world/village-service.js";
import {
  buildVillageMemories,
  configureWorldCoordination,
  forgetMemory,
  reconcileVillage,
  resetVillage,
} from "../packages/villages/src/server/features/world/village.js";
import { addMemory, memoryRepair } from "./helpers/memories-fixture.js";

const stamp = "2026-10-06T12:00:00.000Z";
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function fixture(name: string) {
  const state = defaultVillageState();
  state.name = state.seed = name;
  const card = readVillagerCard({ id: "same", comment: "", data: { name: `${name} library` } });
  const calls: string[] = [],
    owners: unknown[] = [],
    times: Date[] = [],
    queued: BackgroundInput[] = [];
  const entered = deferred(),
    gate = deferred(),
    _modelEntered = deferred(),
    _modelGate = deferred();
  let pauseRead = false,
    fault: Error | undefined,
    retry: ((s: VillageState) => void) | undefined;
  function note(call: string) {
    calls.push(call);
    owners.push(scopedActivation());
    if (scopedActivation()?.active === false) throw Error("Original world is unavailable.");
  }
  const service = createWorldCoordination({
    async mutateMemoryAuthority(update) {
      note("mutate-memory");
      const first = structuredClone(state);
      update(first);
      if (retry) {
        retry(state);
        retry = undefined;
        const next = structuredClone(state);
        update(next);
        Object.assign(state, next);
      } else Object.assign(state, first);
    },
    async readVillageState() {
      note("read");
      if (pauseRead) {
        pauseRead = false;
        entered.resolve();
        await gate.promise;
        note("read-resumed");
      }
      return structuredClone(state);
    },
    async readVillageAuthority() {
      note("read");
      if (pauseRead) {
        pauseRead = false;
        entered.resolve();
        await gate.promise;
        note("read-resumed");
      }
      return structuredClone(state);
    },
    async mutateVillageState(update) {
      note("mutate");
      const first = structuredClone(state);
      update(first);
      if (retry) {
        retry(state);
        retry = undefined;
        const next = structuredClone(state);
        update(next);
        Object.assign(state, next);
      } else Object.assign(state, first);
      return structuredClone(state);
    },
    async buildVillageSnapshot(now) {
      note("snapshot");
      if (now) times.push(now);
      return { village: { name: state.name } } as VillageSnapshot;
    },
    villagesLogger() {
      note("logger");
      const log = () => note("warning");
      return { warn: log, info: log, error: log, debug: log, debugOverride: log };
    },
    async listVillagerCards() {
      note("catalog");
      return [card];
    },
    readEffectiveVillagerCard,
    outsideVenueOperation(work) {
      note("outside");
      return work();
    },
    async completeVillageResidence(id, _force, now) {
      note(`move:${id}`);
      if (now) times.push(now);
      if (fault) throw fault;
      return {} as Awaited<ReturnType<WorldCoordinationPorts["completeVillageResidence"]>>;
    },
    async retryResidencePrivateSpaceAdaptation(id) {
      note(`adapt:${id}`);
      return {} as Awaited<ReturnType<WorldCoordinationPorts["retryResidencePrivateSpaceAdaptation"]>>;
    },
    async backfillAgendas(village, now) {
      note("agendas");
      times.push(now);
      return village;
    },
    async refreshVillagerRemaps(_village, now) {
      note("remaps");
      times.push(now);
    },
    async queueBackgroundJob(input) {
      note("queue");
      queued.push(input);
    },
    async preparePrivateSpaces() {
      note("prepare");
    },
    reconcileProjectLifecycles(_candidate, now) {
      note("projects");
      times.push(now);
    },
    async rollActiveAgendas(now) {
      note("roll");
      if (now) times.push(now);
      return false;
    },
    relationshipWritingPrompt(_village, id) {
      note(`relationship:${id}`);
      return `${name} relationship`;
    },
  });
  return {
    state,
    calls,
    owners,
    times,
    queued,
    card,
    service,
    entered,
    gate,
    pauseRead: () => {
      pauseRead = true;
    },
    fail: (error: Error) => {
      fault = error;
    },
    retry: (edit: (s: VillageState) => void) => {
      retry = edit;
    },
  };
}
function install(f: ReturnType<typeof fixture>) {
  const scope = createActivationScope();
  const release = scope.run(() => configureWorldCoordination(f.service));
  return { scope, release };
}

const a = fixture("A"),
  b = fixture("B");
assert.deepEqual(a.calls, [], "construction is inert");
const A = install(a),
  B = install(b);
let removeDefault = installDefaultActivation(A.scope, () => {});
assert.equal((await reconcileVillage()).village.name, "A");
assert.deepEqual(a.calls, ["read", "snapshot"], "an unfounded world performs no generation or advancement");
a.calls.length = 0;
a.times.length = 0;
a.state.setupAt = a.state.foundedAt = a.state.simulatedThrough = stamp;
a.state.backgroundPace = "off";
const now = new Date("2026-10-07T12:00:00.000Z");
for (const status of ["pending", "failed"] as const) {
  const local = fixture("Local life");
  local.state.setupAt = local.state.foundedAt = local.state.simulatedThrough = stamp;
  local.state.venues = [
    venueDraft(
      { id: "commons", name: "Square", form: "Square", description: "A paved square", classes: ["community"] },
      null,
    ),
  ];
  local.state.foundingPreparation = { status, completedIds: [], currentId: "", error: "Optional request unfinished" };
  await local.service.reconcileVillage({ now });
  assert.equal(local.state.simulatedThrough, now.toISOString());
  assert(local.calls.includes("roll"), "Local routines advance while optional preparation is unfinished");
  assert(local.calls.includes("projects"), "Existing Projects continue");
  assert(
    !local.calls.includes("prepare") && !local.calls.includes("agendas"),
    "A pulse does not redispatch founding generation",
  );
  assert.equal(local.queued.length, 0);
  assert.equal(local.state.foundingPreparation.status, status, "Unfinished work retains its retry state");
}
await reconcileVillage({ now });
assert.equal(a.state.simulatedThrough, now.toISOString());
assert.equal(a.queued.length, 0);
const weatherOnly = fixture("Weather-only"),
  weatherOwner = install(weatherOnly);
weatherOnly.state.setupAt = weatherOnly.state.foundedAt = weatherOnly.state.simulatedThrough = stamp;
weatherOnly.state.storyPace = "balanced";
weatherOnly.state.venues = [{ id: "commons", classes: ["workplace"], occupancy: {} }] as any;
await weatherOwner.scope.run(() => reconcileVillage({ now }));
assert.equal(weatherOnly.queued.length, 0, "Weather alone queues no automatic model work");
assert(!weatherOnly.calls.some((call) => call.startsWith("story:")), "Weather-only fallback makes no provider request");
assert.equal(weatherOnly.state.eventAttempts?.attempts.length ?? 0, 0, "Skipped weather consumes no Events allowance");
weatherOwner.release();
weatherOwner.scope.dispose();
assert(a.calls.indexOf("projects") < a.calls.indexOf("prepare"));
assert(a.calls.indexOf("roll") < a.calls.indexOf("prepare"));
assert(
  a.times.every((value) => value === now),
  "the caller's exact clock reaches every clocked connection",
);
await reconcileVillage({ now: new Date(stamp) });
assert.equal(a.state.simulatedThrough, now.toISOString(), "backward clocks do not rewind the durable cursor");

// Native pages remain owned, scoped and read-only across equal actor IDs.
for (const f of [a, b]) {
  f.state.villagers = [
    {
      characterId: "same",
      cardSnapshot: snapshotFromCard(f.card, 1),
      addedAt: stamp,
      wishes: [],
      agenda: null,
      remap: null,
      remapFailure: null,
    },
  ];
  f.state.memories = addMemory(f.state.memories, {
    text: "remembered " + f.state.name,
    audience: ["player", "same"],
    sourceId: "owned",
  });
}
const memories = await buildVillageMemories({ inspection: true, characterId: "same" });
assert.equal(memories.entries[0].knownBy[0].name, "A library");
assert.match((await B.scope.run(() => buildVillageMemories())).entries[0].text, /remembered B/);
const selected = memories.entries[0],
  operation = memoryRepair(a.state.memories, "forget", ["same"], undefined, selected.id);
a.retry((state) => {
  state.name = "Concurrent A";
});
await forgetMemory(selected.id, { ...operation, seed: a.state.seed });
assert.equal(a.state.name, "Concurrent A");
assert.equal((await buildVillageMemories({ inspection: true, characterId: "same" })).entries[0].forgotten, true);
assert.equal(
  (await B.scope.run(() => buildVillageMemories({ inspection: true, characterId: "same" }))).entries[0].forgotten,
  false,
);

// A direct call binds before the first await; B cannot supply its final snapshot.
const delayed = fixture("Delayed A"),
  D = install(delayed);
removeDefault();
removeDefault = installDefaultActivation(D.scope, () => {});
delayed.state.memories = addMemory(delayed.state.memories, {
  text: "Remembered",
  audience: ["player"],
  sourceId: "delayed",
});
delayed.pauseRead();
const pending = buildVillageMemories();
await delayed.entered.promise;
removeDefault();
removeDefault = installDefaultActivation(B.scope, () => {});
delayed.gate.resolve();
assert.equal((await pending).entries[0].text, "Remembered");
assert(delayed.owners.every((owner) => owner === D.scope));
D.release();
assert.match((await buildVillageMemories()).entries[0].text, /remembered B/, "old cleanup cannot unregister B");

// Explicit reset operates only on its selected owner and returns that owner's snapshot.
await B.scope.run(resetVillage);
assert.deepEqual(b.state, defaultVillageState());
assert.equal(delayed.state.memories.records.length, 1);
const missing = createActivationScope();
await assert.rejects(missing.run(buildVillageMemories), /not configured/);
B.scope.dispose();
await assert.rejects(buildVillageMemories(), /not configured/);
removeDefault();
A.release();
A.scope.dispose();
D.scope.dispose();
missing.dispose();
console.log("World coordination owns projections, clocks, mutations and originating callbacks.");
