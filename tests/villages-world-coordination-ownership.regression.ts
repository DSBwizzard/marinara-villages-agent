import assert from "node:assert/strict";
import {
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import {
  readVillagerCard,
  readEffectiveVillagerCard,
} from "../packages/villages/src/server/adapters/engine/catalog.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type {
  VillageChronicleEntry,
  VillageSnapshot,
  VillageState,
} from "../packages/villages/src/server/domain/models/world.js";
import type { BackgroundInput } from "../packages/villages/src/server/domain/models/background-model.js";
import { snapshotFromCard } from "../packages/villages/src/server/domain/rules/resident-card-snapshot.js";
import { villageDateLabel } from "../packages/villages/src/server/domain/rules/village-clock.js";
import { expireResidentWishes } from "../packages/villages/src/server/domain/rules/wish-lifecycle-rules.js";
import {
  createWorldCoordination,
  type WorldCoordinationPorts,
} from "../packages/villages/src/server/features/world/village-service.js";
import {
  configureWorldCoordination,
  resetVillage,
  reconcileVillage,
  buildVillageStory,
  buildVillageMemories,
  removeChronicleEntry,
  removeVillageRecollection,
} from "../packages/villages/src/server/features/world/village.js";

const stamp = "2026-10-06T12:00:00.000Z";
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function memory(id: string, name: string): VillageChronicleEntry {
  return {
    id,
    text: name,
    dayIndex: 0,
    clock: "afternoon",
    occurredAt: stamp,
    timePrecision: "exact",
    kind: "chat",
    scope: "private",
    actors: [{ id: "same", name }],
    knownByCharacterIds: ["same"],
    subjectCharacterIds: ["same"],
    sourceVisitId: "visit",
    sourceLineIds: ["line"],
    memoryCategory: "shared-experience",
  };
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
    expireResidentWishes(resident, now) {
      note(`expire:${resident.characterId}`);
      expireResidentWishes(resident, now);
    },
    async reconcileWishLifecycle(now) {
      note("wishes");
      if (now) times.push(now);
    },
    async respondDueVenueMail(now) {
      note("mail");
      if (now) times.push(now);
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
await reconcileVillage({ now });
assert.equal(a.state.simulatedThrough, now.toISOString());
assert.equal(a.queued.length, 0);
assert(a.calls.indexOf("projects") < a.calls.indexOf("mail"));
assert(a.calls.indexOf("roll") < a.calls.indexOf("mail"));
assert(a.calls.indexOf("mail") < a.calls.indexOf("prepare"));
assert(a.calls.indexOf("agendas") < a.calls.indexOf("wishes"));
assert(
  a.times.every((value) => value === now),
  "the caller's exact clock reaches every clocked connection",
);
await reconcileVillage({ now: new Date(stamp) });
assert.equal(a.state.simulatedThrough, now.toISOString(), "backward clocks do not rewind the durable cursor");

// Read projections use their own world and library even with equal character IDs.
a.state.chronicle = [
  memory("same", "remembered A"),
  { ...memory("former", "Former"), actors: [{ id: "gone", name: "Former" }] },
];
b.state.foundedAt = stamp;
b.state.chronicle = [memory("same", "remembered B")];
assert.equal((await buildVillageStory())[0].actors[0].name, "A library");
assert.equal((await buildVillageStory())[1].actors[0].name, "Former");
assert.equal((await buildVillageStory())[0].dateLabel, villageDateLabel(stamp, 0));
assert.equal((await B.scope.run(buildVillageStory))[0].actors[0].name, "B library");
a.state.villagers = [
  {
    characterId: "same",
    cardSnapshot: snapshotFromCard(a.card, 1),
    addedAt: stamp,
    completedWishes: [],
    agenda: null,
    remap: null,
    remapFailure: null,
  },
];
a.state.recollections = [
  {
    id: "transient",
    visitId: "visit",
    occurredAt: stamp,
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    text: "A transient",
    subjectCharacterIds: ["same"],
    knownByCharacterIds: ["same"],
    sourceLineIds: ["line"],
    sourceSubmissionIds: ["submission"],
    evidence: [],
    reinforcementCount: 0,
    lastReinforcedAt: stamp,
  },
];
const memories = await buildVillageMemories();
assert.equal(memories.durable[0].knownBy[0].name, "A library");
assert.deepEqual(memories.durable[0].evidence, { visitId: "visit", lineIds: ["line"] });
assert.equal(memories.recollections.length, 1);
const saves = a.calls.filter((x) => x === "mutate").length;
await assert.rejects(removeChronicleEntry(""), /not a memory/);
assert.equal(a.calls.filter((x) => x === "mutate").length, saves, "invalid deletion fails before mutation");
a.retry((state) => {
  state.name = "Concurrent A";
});
await removeChronicleEntry("same");
assert.equal(a.state.name, "Concurrent A");
assert.equal(a.state.chronicle.length, 1);
assert.equal(b.state.chronicle.length, 1);
await assert.rejects(removeChronicleEntry("same"), /no longer kept/);
await removeVillageRecollection("transient");
await assert.rejects(removeVillageRecollection("transient"), /no longer active/);
await assert.rejects(removeVillageRecollection(""), /not a passing recollection/);

// A direct call binds before the first await; B cannot supply its final snapshot.
const delayed = fixture("Delayed A"),
  D = install(delayed);
removeDefault();
removeDefault = installDefaultActivation(D.scope, () => {});
delayed.state.chronicle = [memory("same", "Remembered")];
delayed.pauseRead();
const pending = buildVillageStory();
await delayed.entered.promise;
removeDefault();
removeDefault = installDefaultActivation(B.scope, () => {});
delayed.gate.resolve();
assert.equal((await pending)[0].actors[0].name, "Delayed A library");
assert(delayed.owners.every((owner) => owner === D.scope));
D.release();
assert.equal((await buildVillageStory())[0].actors[0].name, "B library", "old cleanup cannot unregister B");

// Explicit reset operates only on its selected owner and returns that owner's snapshot.
await B.scope.run(resetVillage);
assert.deepEqual(b.state, defaultVillageState());
assert.equal(delayed.state.chronicle.length, 1);
const missing = createActivationScope();
await assert.rejects(missing.run(buildVillageStory), /not configured/);
B.scope.dispose();
await assert.rejects(buildVillageStory(), /not configured/);
removeDefault();
A.release();
A.scope.dispose();
D.scope.dispose();
missing.dispose();
console.log("World coordination owns projections, clocks, mutations and originating callbacks.");
