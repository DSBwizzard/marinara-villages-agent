import assert from "node:assert/strict";
import {
  createActivationScope,
  activationScope,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { readVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageSnapshot, VillageState } from "../packages/villages/src/server/domain/models/world.js";
import { snapshotFromCard } from "../packages/villages/src/server/domain/rules/resident-card-snapshot.js";
import { venueDraftFixture as venueDraft } from "./helpers/venues.fixture.js";
import {
  createWorldCoordination,
  type WorldCoordinationPorts,
} from "../packages/villages/src/server/features/world/village-service.js";
import {
  buildVillageMemories,
  configureWorldCoordination,
  forgetMemory,
  readVillageMemoryEvidence,
  reconcileVillage,
  resetVillage,
} from "../packages/villages/src/server/features/world/village.js";
import { retainAuthoredNote } from "./helpers/continuity.fixture.js";

const stamp = "2026-10-06T12:00:00.000Z";
function deferred() {
  return Promise.withResolvers<void>();
}
function fixture(name: string) {
  const state = defaultVillageState();
  state.name = state.seed = name;
  const card = readVillagerCard({ id: "same", comment: "", data: { name: `${name} library` } });
  const calls: string[] = [],
    owners: unknown[] = [],
    times: Date[] = [];
  const entered = deferred(),
    gate = deferred();
  let pauseRead = false,
    retry: ((s: VillageState) => void) | undefined;
  function note(call: string) {
    calls.push(call);
    owners.push(activationScope());
    if (activationScope()?.active === false) throw Error("Original world is unavailable.");
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
    outsideVenueOperation(work) {
      note("outside");
      return work();
    },
    async completeVillageResidence(id, _force, now) {
      note(`move:${id}`);
      if (now) times.push(now);
      return {} as Awaited<ReturnType<WorldCoordinationPorts["completeVillageResidence"]>>;
    },
    async queuePendingAgendas(village, now) {
      note("agendas");
      times.push(now);
      return village;
    },
    async refreshScheduleInfluence(_village, now) {
      note("remaps");
      times.push(now);
    },
    async reconcileResidentPlanning(now) {
      note("resident-planning");
      times.push(now);
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
  });
  return {
    state,
    calls,
    owners,
    times,
    card,
    service,
    entered,
    gate,
    pauseRead: () => {
      pauseRead = true;
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

await A.scope.run(async () => assert.equal((await reconcileVillage()).village.name, "A"));
assert.deepEqual(a.calls, ["read", "snapshot"], "an unfounded world performs no generation or advancement");
a.calls.length = 0;
a.times.length = 0;
a.state.setupAt = a.state.foundedAt = a.state.simulatedThrough = stamp;
a.state.backgroundPace = "off";
const now = new Date("2026-10-07T12:00:00.000Z");
for (const status of ["pending", "failed"] as const) {
  const local = fixture("Local life");
  local.state.setupAt = local.state.foundedAt = local.state.simulatedThrough = stamp;
  A.scope.run(
    () =>
      (local.state.venues = [
        venueDraft(
          { id: "commons", name: "Square", form: "Square", description: "A paved square", classes: ["community"] },
          null,
        ),
      ]),
  );
  local.state.foundingPreparation = { status, completedIds: [], currentId: "", error: "Optional request unfinished" };
  await A.scope.run(() => local.service.reconcileVillage({ now }));
  A.scope.run(() => assert.equal(local.state.simulatedThrough, now.toISOString()));
  assert(local.calls.includes("roll"), "Local routines advance while optional preparation is unfinished");
  assert(local.calls.includes("projects"), "Existing Projects continue");
  assert(
    !local.calls.includes("prepare") && !local.calls.includes("agendas") && !local.calls.includes("resident-planning"),
    "A pulse does not redispatch founding generation",
  );
  assert.equal(local.state.foundingPreparation.status, status, "Unfinished work retains its retry state");
}
await A.scope.run(() => reconcileVillage({ now }));
A.scope.run(() => assert.equal(a.state.simulatedThrough, now.toISOString()));
const weatherOnly = fixture("Weather-only"),
  weatherOwner = A.scope.run(() => install(weatherOnly));
weatherOnly.state.setupAt = weatherOnly.state.foundedAt = weatherOnly.state.simulatedThrough = stamp;
weatherOnly.state.backgroundPace = "balanced";
weatherOnly.state.venues = [{ id: "commons", classes: ["workplace"], occupancy: {} }] as any;
await A.scope.run(() => weatherOwner.scope.run(() => reconcileVillage({ now })));
assert.equal(weatherOnly.state.eventAttempts?.attempts.length ?? 0, 0, "Skipped weather consumes no Events allowance");
A.scope.run(() => weatherOwner.release());
weatherOwner.scope.dispose();
A.scope.run(() => assert(a.calls.indexOf("projects") < a.calls.indexOf("prepare")));
A.scope.run(() => assert(a.calls.indexOf("roll") < a.calls.indexOf("prepare")));
assert(
  a.times.every((value) => value === now),
  "the caller's exact clock reaches every clocked connection",
);
await A.scope.run(() => reconcileVillage({ now: new Date(stamp) }));
A.scope.run(() =>
  assert.equal(a.state.simulatedThrough, now.toISOString(), "backward clocks do not rewind the durable cursor"),
);

// Native pages remain owned, scoped and read-only across equal actor IDs.
for (const f of [a, b]) {
  f.state.setupAt ||= stamp;
  f.state.villagers = [
    {
      letterFontId: "caveat",
      characterId: "same",
      incarnation: "resident-" + f.state.seed,
      cardSnapshot: snapshotFromCard(f.card, 1),
      addedAt: stamp,
      agenda: null,
    },
  ];
  retainAuthoredNote(f.state, "owned", "remembered " + f.state.name, ["player", "same"], stamp);
}
const memories = await A.scope.run(() => buildVillageMemories({ inspection: true, characterId: "same" }));
assert.equal(memories.entries[0].knownBy[0].name, "A library");
await A.scope.run(async () =>
  assert.match((await B.scope.run(() => buildVillageMemories())).entries[0].text, /remembered B/),
);
const selected = memories.entries[0],
  evidence = await A.scope.run(() => readVillageMemoryEvidence(selected.id, true, "same"));
A.scope.run(() =>
  a.retry((state) => {
    state.name = "Concurrent A";
  }),
);
await A.scope.run(() =>
  forgetMemory(selected.id, {
    operationId: "forget-same",
    target: evidence.target!,
    knowers: ["same"],
    seed: evidence.seed,
  }),
);
assert.equal(a.state.name, "Concurrent A");
await A.scope.run(async () =>
  assert.equal((await buildVillageMemories({ inspection: true, characterId: "same" })).entries[0].forgotten, true),
);
await A.scope.run(async () =>
  assert.equal(
    (await B.scope.run(() => buildVillageMemories({ inspection: true, characterId: "same" }))).entries[0].forgotten,
    false,
  ),
);

// A direct call binds before the first await; B cannot supply its final snapshot.
const delayed = fixture("Delayed A"),
  D = A.scope.run(() => install(delayed));

delayed.state.setupAt = stamp;
retainAuthoredNote(delayed.state, "delayed", "Remembered", ["player"], stamp);
D.scope.run(() => delayed.pauseRead());
const pending = D.scope.run(() => buildVillageMemories());
await delayed.entered.promise;

delayed.gate.resolve();
assert.equal((await pending).entries[0].text, "Remembered");
assert(delayed.owners.every((owner) => owner === D.scope));
B.scope.run(() => D.release());
await B.scope.run(async () =>
  assert.match((await buildVillageMemories()).entries[0].text, /remembered B/, "old cleanup cannot unregister B"),
);

// Explicit reset operates only on its selected owner and returns that owner's snapshot.
await B.scope.run(() => B.scope.run(resetVillage));
B.scope.run(() => assert.deepEqual(b.state, defaultVillageState()));
assert.equal(delayed.state.continuity.records.length, 1);
const missing = createActivationScope();
await B.scope.run(() => assert.rejects(missing.run(buildVillageMemories), /not configured/));
B.scope.dispose();
await B.scope.run(() => assert.rejects(buildVillageMemories(), /not configured/));

A.release();
A.scope.dispose();
D.scope.dispose();
missing.dispose();
console.log("World coordination owns projections, clocks, mutations and originating callbacks.");
