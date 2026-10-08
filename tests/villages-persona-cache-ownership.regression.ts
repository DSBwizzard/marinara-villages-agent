import assert from "node:assert/strict";
import Fastify from "fastify";
import { readPersona } from "../packages/villages/src/server/adapters/engine/catalog.js";
import {
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageState } from "../packages/villages/src/server/domain/models/world.js";
import {
  MAX_PLAYER_PERSONA_IDENTITY_LENGTH,
  MAX_PLAYER_PERSONA_NAME_LENGTH,
} from "../packages/villages/src/server/domain/rules/prompt-preset.js";
import { createPersonaCache } from "../packages/villages/src/server/features/settings/persona-cache-service.js";
import {
  configurePersonaCache,
  refreshPlayerPersona,
} from "../packages/villages/src/server/features/settings/persona-cache.js";
import { registerPersonaRoutes } from "../packages/villages/src/server/features/settings/routes.js";
import { mutateVillageState, readVillageState } from "../packages/villages/src/server/features/world/village-store.js";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function fixture(name: string) {
  const state = defaultVillageState();
  state.playerPersonaId = "same";
  state.playerPersonaName = "Cached name";
  state.playerPersonaIdentity = "Cached identity";
  const persona = readPersona({ id: "same", data: JSON.stringify({ name, description: `Identity ${name}` }) } as any);
  const calls: string[] = [],
    owners: unknown[] = [];
  const gate = deferred(),
    entered = deferred();
  let pause = false,
    missing = false,
    failure = false,
    retry: ((state: VillageState) => void) | undefined;
  const note = (operation: string) => {
    calls.push(operation);
    owners.push(scopedActivation());
  };
  const service = createPersonaCache({
    async readVillageState() {
      note("read");
      return structuredClone(state);
    },
    async findPlayerPersona(id) {
      note(`find:${id}`);
      if (pause) {
        pause = false;
        entered.resolve();
        await gate.promise;
        owners.push(scopedActivation());
      }
      if (failure) throw new Error("Library unavailable");
      return missing ? null : structuredClone(persona);
    },
    async mutateVillageState(update) {
      note("mutate");
      const first = structuredClone(state);
      update(first);
      if (retry) {
        retry(state);
        retry = undefined;
        const second = structuredClone(state);
        update(second);
        Object.assign(state, second);
      } else Object.assign(state, first);
      return structuredClone(state);
    },
  });
  assert.deepEqual(calls, [], "Constructing the cache performs no storage, library or model work.");
  return {
    state,
    persona,
    service,
    calls,
    owners,
    gate,
    entered,
    pause() {
      pause = true;
    },
    missing(value = true) {
      missing = value;
    },
    fail() {
      failure = true;
    },
    retryWith(work: (state: VillageState) => void) {
      retry = work;
    },
  };
}
const a = fixture("A"),
  b = fixture("B");
assert.equal(await a.service.refreshPlayerPersona(), true);
assert.equal(await b.service.refreshPlayerPersona(), true);
assert.equal(a.state.playerPersonaIdentity, "Identity A");
assert.equal(b.state.playerPersonaIdentity, "Identity B");
assert.equal(await a.service.refreshPlayerPersona(), false);
assert.equal(a.calls.filter((operation) => operation === "mutate").length, 1);
a.persona.name = "n".repeat(MAX_PLAYER_PERSONA_NAME_LENGTH + 30);
a.persona.identity = "i".repeat(MAX_PLAYER_PERSONA_IDENTITY_LENGTH + 30);
assert.equal(await a.service.refreshPlayerPersona(), true);
assert.equal(a.state.playerPersonaName.length, MAX_PLAYER_PERSONA_NAME_LENGTH);
assert.equal(a.state.playerPersonaIdentity.length, MAX_PLAYER_PERSONA_IDENTITY_LENGTH);
assert.equal(await a.service.refreshPlayerPersona(), false, "Overlong source text does not cause repeated writes.");
const cache = [a.state.playerPersonaName, a.state.playerPersonaIdentity];
a.missing();
assert.equal(await a.service.refreshPlayerPersona(), true);
assert.equal(a.state.playerPersonaMissing, true);
assert.deepEqual([a.state.playerPersonaName, a.state.playerPersonaIdentity], cache);
assert.equal(await a.service.refreshPlayerPersona(), false);
a.missing(false);
assert.equal(await a.service.refreshPlayerPersona(), true);
assert.equal(a.state.playerPersonaMissing, false);
const empty = fixture("Empty");
empty.state.playerPersonaId = "";
assert.equal(await empty.service.refreshPlayerPersona(), false);
assert.deepEqual(empty.calls, ["read"]);
const failed = fixture("Failure");
failed.fail();
const before = structuredClone(failed.state);
await assert.rejects(failed.service.refreshPlayerPersona(), /Library unavailable/);
assert.deepEqual(failed.state, before);
assert.deepEqual(failed.calls, ["read", "find:same"]);
const retried = fixture("Retry");
retried.retryWith((state) => {
  state.name = "Concurrent village name";
});
await retried.service.refreshPlayerPersona();
assert.equal(retried.state.name, "Concurrent village name");
assert.equal(retried.state.playerPersonaIdentity, "Identity Retry");
assert.equal(retried.calls.filter((operation) => operation === "find:same").length, 1);

const one = createActivationScope(),
  two = createActivationScope();
const first = fixture("First"),
  second = fixture("Second");
const releaseFirst = one.run(() => configurePersonaCache(first.service));
const releaseSecond = two.run(() => configurePersonaCache(second.service));
const clearFirst = installDefaultActivation(one, () => {});
first.pause();
const pending = refreshPlayerPersona();
await first.entered.promise;
const clearSecond = installDefaultActivation(two, () => {});
await refreshPlayerPersona();
first.gate.resolve();
assert.equal(await pending, true);
assert.equal(first.state.playerPersonaIdentity, "Identity First");
assert.equal(second.state.playerPersonaIdentity, "Identity Second");
assert(first.owners.every((owner) => owner === one));
assert(second.owners.every((owner) => owner === two));
one.run(releaseFirst);
one.dispose();
clearFirst();
assert.equal(await refreshPlayerPersona(), false, "Older cleanup cannot remove the newer default cache.");
const missing = createActivationScope();
await assert.rejects(missing.run(refreshPlayerPersona), /not configured/);
two.run(releaseSecond);
two.dispose();
clearSecond();
await assert.rejects(two.run(refreshPlayerPersona), /not configured/);
missing.dispose();
await assert.rejects(refreshPlayerPersona(), /not configured/);

// Actual endpoint and entry assembly, with independent provider-free document/library stubs.
const rows = new Map<string, any>();
let libraryMissing = false,
  libraryReads = 0;
const documents = {
  async getById(_package: string, id: string) {
    return structuredClone(rows.get(id) ?? null);
  },
  async list() {
    return [];
  },
  async create(input: any) {
    const row = { ...structuredClone(input), revision: 1 };
    rows.set(input.id, row);
    return structuredClone(row);
  },
  async update(input: any) {
    const row = rows.get(input.id);
    if (row?.revision !== input.expectedRevision) return null;
    const next = { ...row, ...structuredClone(input), revision: row.revision + 1 };
    rows.set(input.id, next);
    return structuredClone(next);
  },
};
const releaseRuntime = configureVillagesRuntime({
  persistence: { documents },
  resources: {
    listCharacters: async () => [],
    async listPersonas(ids?: string[]) {
      libraryReads++;
      assert.deepEqual(ids, ["same"]);
      return libraryMissing
        ? []
        : [{ id: "same", data: JSON.stringify({ name: "Routed player", description: "Private routed identity" }) }];
    },
  },
  logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
  isDebugAgentsEnabled: () => false,
} as any);
const app = Fastify();
try {
  await mutateVillageState((state) => {
    state.playerPersonaId = "same";
    state.playerPersonaName = "Old player";
    state.playerPersonaIdentity = "Old identity";
  });
  registerPersonaRoutes(app);
  const refreshed = await app.inject({ method: "POST", url: "/persona/refresh" });
  assert.equal(refreshed.statusCode, 200, refreshed.body);
  assert.equal(refreshed.json().settings.playerPersonaName, "Routed player");
  assert(!refreshed.body.includes("Private routed identity"), "The ordinary snapshot excludes private Persona prose.");
  assert.equal((await readVillageState()).playerPersonaIdentity, "Private routed identity");
  libraryMissing = true;
  const gone = await app.inject({ method: "POST", url: "/persona/refresh" });
  assert.equal(gone.statusCode, 200, gone.body);
  assert.equal((await readVillageState()).playerPersonaMissing, true);
  assert.equal((await readVillageState()).playerPersonaName, "Routed player");
  assert.equal(libraryReads, 2);
} finally {
  await app.close();
  releaseRuntime();
}
console.log(
  "Persona cache: bounded diff-only writes, missing identity retention, independent owners, retry ordering, cleanup and assembled refresh endpoint passed (mocked storage/library; no models).",
);
