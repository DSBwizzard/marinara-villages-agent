import assert from "node:assert/strict";
import { readPersona } from "../packages/villages/src/server/adapters/engine/catalog.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageState } from "../packages/villages/src/server/domain/models/world.js";
import { createPersonaCache } from "../packages/villages/src/server/features/settings/persona-cache-service.js";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function fixture(missing = false) {
  const state = defaultVillageState();
  state.playerPersonaId = "a";
  state.playerPersonaName = "Cached A";
  state.playerPersonaIdentity = "Identity A";
  const gate = deferred(),
    entered = deferred(),
    bothEntered = deferred();
  const lookups: string[] = [],
    attempts: VillageState[] = [];
  let writes = 0,
    retry: ((state: VillageState) => void) | undefined;
  const cache = createPersonaCache({
    async readVillageState() {
      return structuredClone(state);
    },
    async findPlayerPersona(id) {
      lookups.push(id);
      entered.resolve();
      if (lookups.length === 2) bothEntered.resolve();
      await gate.promise;
      return missing
        ? null
        : readPersona({
            id: "a",
            data: JSON.stringify({ name: "Refreshed A", description: "Refreshed identity A" }),
          } as any);
    },
    async mutateVillageState(update) {
      const first = structuredClone(state);
      update(first);
      attempts.push(first);
      let winning = first;
      if (retry) {
        retry(state);
        retry = undefined;
        winning = structuredClone(state);
        update(winning);
        attempts.push(winning);
      }
      if (JSON.stringify(winning) !== JSON.stringify(state)) writes++;
      Object.assign(state, winning);
      return structuredClone(state);
    },
  });
  return {
    state,
    gate,
    entered,
    bothEntered,
    lookups,
    attempts,
    cache,
    retryWith(work: (state: VillageState) => void) {
      retry = work;
    },
    get writes() {
      return writes;
    },
  };
}
function selectB(state: VillageState) {
  state.playerPersonaId = "b";
  state.playerPersonaName = "Selected B";
  state.playerPersonaIdentity = "Identity B";
}

const switched = fixture(),
  pendingSwitch = switched.cache.refreshPlayerPersona();
await switched.entered.promise;
selectB(switched.state);
switched.gate.resolve();
assert.equal(await pendingSwitch, false, "A delayed lookup cannot authorize a cache write under another Persona link.");
assert.equal(switched.state.playerPersonaName, "Selected B");
assert.equal(switched.state.playerPersonaIdentity, "Identity B");
assert.equal(switched.writes, 0);
assert.deepEqual(switched.lookups, ["a"]);

const retried = fixture(),
  pendingRetry = retried.cache.refreshPlayerPersona();
await retried.entered.promise;
retried.retryWith(selectB);
retried.gate.resolve();
assert.equal(await pendingRetry, false, "Only the winning mutation attempt can report that it saved.");
assert.equal(retried.attempts[0]!.playerPersonaName, "Refreshed A");
assert.equal(retried.attempts[1]!.playerPersonaName, "Selected B");
assert.equal(retried.state.playerPersonaId, "b");
assert.equal(retried.writes, 0);
assert.deepEqual(retried.lookups, ["a"]);

const unlinked = fixture(),
  pendingUnlink = unlinked.cache.refreshPlayerPersona();
await unlinked.entered.promise;
unlinked.state.playerPersonaId = "";
unlinked.state.playerPersonaName = "";
unlinked.state.playerPersonaIdentity = "";
unlinked.gate.resolve();
assert.equal(await pendingUnlink, false);
assert.equal(unlinked.state.playerPersonaIdentity, "");
assert.equal(unlinked.writes, 0);

const duplicate = fixture();
const first = duplicate.cache.refreshPlayerPersona(),
  second = duplicate.cache.refreshPlayerPersona();
await duplicate.bothEntered.promise;
duplicate.gate.resolve();
assert.deepEqual(await Promise.all([first, second]), [true, false]);
assert.equal(
  duplicate.writes,
  1,
  "Same-candidate overlapping refreshes save once and report the winning write accurately.",
);
assert.deepEqual(
  duplicate.lookups,
  ["a", "a"],
  "Each explicit refresh retains its single library read, without automatic retries.",
);
assert.equal(duplicate.state.playerPersonaIdentity, "Refreshed identity A");

const missing = fixture(true),
  pendingMissing = missing.cache.refreshPlayerPersona();
await missing.entered.promise;
missing.state.playerPersonaName = "Latest cached A";
missing.state.playerPersonaIdentity = "Latest identity A";
missing.gate.resolve();
assert.equal(await pendingMissing, true);
assert.equal(missing.state.playerPersonaMissing, true);
assert.equal(
  missing.state.playerPersonaName,
  "Latest cached A",
  "A missing source keeps the current authoritative cache.",
);
assert.equal(missing.state.playerPersonaIdentity, "Latest identity A");
assert.equal(missing.writes, 1);

const ordinary = fixture(),
  pendingOrdinary = ordinary.cache.refreshPlayerPersona();
await ordinary.entered.promise;
ordinary.gate.resolve();
assert.equal(await pendingOrdinary, true);
assert.equal(ordinary.state.playerPersonaName, "Refreshed A");
assert.equal(await ordinary.cache.refreshPlayerPersona(), false);
assert.equal(ordinary.writes, 1);
console.log(
  "Persona cache race: link changes/unlinking and losing retries retain selected identity, duplicate candidates save once, missing sources retain the live cache, and ordinary refresh keeps one read per request (mocked storage/library; no models).",
);
