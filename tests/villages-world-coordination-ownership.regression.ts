import assert from "node:assert/strict";
import {
  bindActivationService,
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
  VillageHappening,
  VillageSnapshot,
  VillageState,
} from "../packages/villages/src/server/domain/models/world.js";
import type { BackgroundInput } from "../packages/villages/src/server/domain/models/background-model.js";
import type { VillageTickContext } from "../packages/villages/src/server/domain/rules/village-bootstrap-rules.js";
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
  runVillageReaction,
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
function event(text: string, id = text): VillageHappening {
  return {
    id,
    text,
    narration: text,
    kind: "routine",
    actorIds: [],
    venueId: "",
    dayIndex: 0,
    clock: "afternoon",
    occurredAt: stamp,
    timePrecision: "exact",
    sourceOpportunityId: "",
  };
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
    modelEntered = deferred(),
    modelGate = deferred();
  let pauseRead = false,
    pauseModel = false,
    fault: Error | undefined,
    retry: ((s: VillageState) => void) | undefined;
  let reaction = [event(`${name} reaction`)],
    story = [event(`${name} story`)];
  function note(call: string) {
    calls.push(call);
    owners.push(scopedActivation());
    if (scopedActivation()?.active === false) throw Error("Original world is unavailable.");
  }
  const modelPause = async () => {
    if (pauseModel) {
      pauseModel = false;
      modelEntered.resolve();
      await modelGate.promise;
      note("model-resumed");
    }
    if (fault) throw fault;
  };
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
      return { village: { name: state.name }, happenings: state.happenings } as VillageSnapshot;
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
    async readVillageLore() {
      note("lore");
      return [`${name} lore`];
    },
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
    async proposeHappenings(context) {
      note(`story:${context.village}`);
      await modelPause();
      return {
        happenings: story,
        housingRequests: [],
        model: name,
      };
    },
    async proposeReaction(context) {
      note(`reaction:${context.deed}`);
      await modelPause();
      return { happenings: reaction, model: name };
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
    modelEntered,
    modelGate,
    pauseRead: () => {
      pauseRead = true;
    },
    pauseModel: () => {
      pauseModel = true;
    },
    fail: (error: Error) => {
      fault = error;
    },
    retry: (edit: (s: VillageState) => void) => {
      retry = edit;
    },
    setReaction: (value: VillageHappening[]) => {
      reaction = value;
    },
    setStory: (value: VillageHappening[]) => {
      story = value;
    },
  };
}
function install(f: ReturnType<typeof fixture>) {
  const scope = createActivationScope();
  const release = scope.run(() => configureWorldCoordination(f.service));
  const handler = scope.run(() => bindActivationService(f.service.storyBackgroundHandler));
  return { scope, release, handler };
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
a.state.storyPace = "off";
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
await reconcileVillage({ now, forceStory: true, actionId: "owned-story", expectedAttempt: 4 });
assert.equal(a.queued.length, 1);
assert.equal(a.queued[0].kind, "story");
assert.equal(a.queued[0].finite, true);
assert.equal(a.queued[0].revision, "manual:owned-story");
assert.equal(a.queued[0].expectedAttempt, 4);
const queuedContext = (a.queued[0].input as { context: VillageTickContext }).context;
assert.equal(queuedContext.village, a.state.name);
assert.deepEqual(queuedContext.lore, ["A lore"]);
assert.equal(queuedContext.residents[0].name, "A library");
assert(!a.calls.some((call) => call.startsWith("story:")), "reconciliation admits work without calling its provider");
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

// Reactions retain diff-only/dedup behavior and do not advance time.
const cursor = a.state.simulatedThrough;
const beforeEmpty = a.calls.length;
await runVillageReaction({ villagerName: "A", playerName: "Player", deed: " " });
assert.equal(a.calls.length, beforeEmpty);
a.setReaction([event("Existing"), event("Fresh"), event("fresh")]);
a.state.happenings = [event("existing")];
await runVillageReaction({ villagerName: "A", playerName: "Player", deed: "Helped a neighbour." });
assert.deepEqual(
  a.state.happenings.map((e) => e.text),
  ["Fresh", "existing"],
);
assert.equal(a.state.simulatedThrough, cursor);
const failure = Error("Originating provider failed");
a.fail(failure);
await assert.rejects(
  runVillageReaction({ villagerName: "A", playerName: "Player", deed: "Failed deed" }),
  (e) => e === failure,
);
assert.equal(a.calls.filter((x) => x === "reaction:Failed deed").length, 1, "no automatic provider retry");

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

// Nested handler callbacks are bound explicitly by entry and retain A's model connections.
const background = fixture("Background A"),
  C = install(background);
background.pauseModel();
const generated = C.handler.generate({ context: { village: "background context" } });
await background.modelEntered.promise;
assert.equal(scopedActivation(), undefined);
background.modelGate.resolve();
const proposal = (await generated) as Awaited<ReturnType<typeof background.service.storyBackgroundHandler.generate>>;
assert.deepEqual((proposal as { happenings: VillageHappening[] }).happenings, [event("Background A story")]);
assert(background.owners.every((owner) => owner === C.scope));
assert(!b.calls.some((call) => call.startsWith("story:")));

const retired = fixture("Retired A"),
  R = install(retired);
retired.pauseModel();
const retiring = R.scope.run(() =>
  runVillageReaction({ villagerName: "A", playerName: "Player", deed: "Retired deed" }),
);
await retired.modelEntered.promise;
R.release();
R.scope.dispose();
retired.modelGate.resolve();
await assert.rejects(retiring, /Original world is unavailable/);
assert.deepEqual(retired.state.happenings, []);
assert.deepEqual(b.state.happenings, []);

// Reset/founding identity must fence responses from the former world within
// one still-active application, including replacement during a save retry.
for (const replacement of ["reset", "new-world", "save-retry"] as const) {
  const race = fixture(`Reset race ${replacement}`),
    owner = install(race);
  race.state.setupAt = race.state.foundedAt = stamp;
  race.pauseModel();
  const oldReaction = owner.scope.run(() =>
    runVillageReaction({ villagerName: "A", playerName: "Player", deed: "Old world deed" }),
  );
  await race.modelEntered.promise;
  const replace = (state: VillageState) => {
    Object.assign(state, defaultVillageState());
    if (replacement !== "reset") {
      state.seed = "new-world";
      state.name = "New world";
      state.setupAt = state.foundedAt = "2026-10-07T12:00:00.000Z";
      state.happenings = [event("New world's own event")];
    }
  };
  if (replacement === "save-retry") race.retry(replace);
  else if (replacement === "reset") await owner.scope.run(resetVillage);
  else replace(race.state);
  race.modelGate.resolve();
  await oldReaction;
  assert.deepEqual(
    race.state.happenings.map((e) => e.text),
    replacement === "reset" ? [] : ["New world's own event"],
    `${replacement} cannot receive an old world's reaction`,
  );
  assert.equal(
    race.calls.filter((call) => call === "reaction:Old world deed").length,
    1,
    "reset discards a reply without repeating provider work",
  );
  owner.release();
  owner.scope.dispose();
}

// Explicit reset operates only on its selected owner and returns that owner's snapshot.
await B.scope.run(resetVillage);
assert.deepEqual(b.state, defaultVillageState());
assert.equal(delayed.state.chronicle.length, 1);
const missing = createActivationScope();
await assert.rejects(missing.run(buildVillageStory), /not configured/);
C.release();
await assert.rejects(C.scope.run(buildVillageStory), /not configured/);
B.scope.dispose();
await assert.rejects(buildVillageStory(), /not configured/);
removeDefault();
A.release();
A.scope.dispose();
D.scope.dispose();
C.scope.dispose();
missing.dispose();
console.log("World coordination owns projections, clocks, mutations and originating callbacks.");
