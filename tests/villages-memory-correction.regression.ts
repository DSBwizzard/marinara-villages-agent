// Test cases: memory-correction/scope, memory-correction/guards, memory-correction/concurrency, memory-correction/runtime
import assert from "node:assert/strict";
import Fastify from "fastify";
import { runCase } from "../scripts/test-cases.mjs";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
import { retainAuthoredNote } from "./helpers/continuity.fixture.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageState } from "../packages/villages/src/server/domain/models/world.js";
import { continuityHolderKey } from "../packages/villages/src/server/domain/rules/continuity.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import {
  continuityMemoryLibrary,
  changeContinuityMemory,
  inspectContinuityMemory,
} from "../packages/villages/src/server/domain/rules/continuity-library.js";
import { createWorldCoordination } from "../packages/villages/src/server/features/world/village-service.js";
import { configureWorldCoordination } from "../packages/villages/src/server/features/world/village.js";
import { registerHistoryRoutes } from "../packages/villages/src/server/features/world/routes.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { villagesRoutes } from "../packages/villages/src/server/entry/routes.js";

const at = "2026-11-11T00:00:00.000Z";
const originalText = "Aqua offered to lend the telescope and promised to polish it.";
const correctedText = "Aqua offered to lend the telescope, with no commitment to polish it.";
const visible = (state: VillageState, id: string) =>
  continuityMemoryLibrary(state, { inspection: id !== "player", characterId: id }, at).entries;
function request(state: VillageState, id: string, operationId: string, knowers = ["player"]) {
  const inspection = inspectContinuityMemory(state, id, "player", true, at);
  return { seed: state.seed, target: inspection.target!, operationId, knowers };
}
function unchangedNative(state: VillageState) {
  const { continuity: _continuity, ...native } = state;
  return native;
}

async function fixture() {
  const storage = sceneHistoryFixture();
  const repository = () => createVillageRepository(() => storage.gate.documents);
  const repo = repository();
  const initial = coerceVillageState({
    ...defaultVillageState(),
    seed: "correction-world",
    setupAt: at,
    foundedAt: at,
    villagers: ["aqua", "ella"].map((id) => ({
      characterId: id,
      incarnation: id + "-one",
      letterFontId: "caveat",
      addedAt: at,
      cardSnapshot: { id, name: id, revision: 1, sourceStatus: "available", capturedAt: at },
    })),
  });
  const id = retainAuthoredNote(initial, "original", originalText, ["aqua", "player"], at);
  retainAuthoredNote(initial, "private", "Ella privately prefers plum tea.", ["aqua", "ella"], at);
  await repo.mutateAuthority((state) => Object.assign(state, initial), { memories: true });
  const api = createWorldCoordination({
    readVillageAuthority: () => repo.readAuthority({ memories: true }),
    mutateMemoryAuthority: (update) => repo.mutateAuthority(update, { memories: true }),
  } as any);
  const release = configureWorldCoordination(api),
    app = Fastify();
  registerHistoryRoutes(app);
  const update = storage.documents.update;
  let beforeRoot: (() => Promise<unknown>) | undefined;
  storage.documents.update = async (input: any) => {
    if (input.id === "villages-village" && beforeRoot) {
      const hook = beforeRoot;
      beforeRoot = undefined;
      await hook();
    }
    return update(input);
  };
  const input = { ...request(initial, id, "correct-player"), text: correctedText };
  return {
    id,
    input,
    initial,
    api,
    app,
    repo,
    repository,
    storage,
    read: () => repo.readAuthority({ memories: true }),
    post: (payload: unknown = input) => app.inject({ method: "POST", url: `/memories/${id}/correct`, payload }),
    beforeRoot: (hook: () => Promise<unknown>) => {
      beforeRoot = hook;
    },
    close: async () => {
      await app.close();
      release();
      storage.release();
      storage.gate.dispose();
    },
  };
}

await runCase("memory-correction/scope", async () => {
  const f = await fixture();
  try {
    const original = await f.read();
    const response = await f.post();
    assert.equal(response.statusCode, 200, response.body);
    assert.deepEqual(response.json(), { corrected: true });
    let current = await f.read();
    assert.equal(visible(current, "player")[0].text, correctedText);
    assert.equal(visible(current, "aqua").find((row) => row.id === f.id)?.text, originalText);
    assert.deepEqual(visible(current, "ella"), visible(original, "ella"));
    assert.deepEqual(
      unchangedNative(current),
      unchangedNative(original),
      "Manual correction keeps native state and accepted episodes intact",
    );
    const ordinary = (await f.app.inject({ url: `/memories/${f.id}/evidence` })).json();
    assert.deepEqual(
      ordinary.knowers.map((row: any) => row.person.id),
      ["player"],
    );
    assert.deepEqual(ordinary.knowers[0].support, []);
    assert(!JSON.stringify(ordinary).includes(originalText));
    const inspection = await f.api.readVillageMemoryEvidence(f.id, true);
    assert.equal(inspection.knowers.find((row) => row.person.id === "player")?.text, correctedText);
    assert(inspection.knowers.find((row) => row.person.id === "player")?.playerCorrection);
    assert.equal(inspection.knowers.find((row) => row.person.id === "aqua")?.support[0].excerpt, originalText);
    assert.equal((await f.api.buildVillageMemories({ query: "lend the telescope" })).total, 1);
    assert.equal((await f.api.buildVillageMemories({ query: "promised to polish" })).total, 0);
    assert.deepEqual(await f.repository().readAuthority({ memories: true }), current);
    assert.equal((await f.post()).statusCode, 200, "Lost response replay returns the exact saved effect");
    assert.deepEqual(await f.read(), current);
    await f.api.forgetMemory(f.id, request(current, f.id, "forget-corrected"));
    current = await f.read();
    const invalid = await f.post({ ...request(current, f.id, "restore-forgotten"), text: "A further correction." });
    assert.equal(invalid.statusCode, 409);
    assert.deepEqual(visible(await f.read(), "player"), []);
    assert((await f.api.buildVillageMemories({ inspection: true, characterId: "player" })).entries[0].forgotten);
  } finally {
    await f.close();
  }
});

await runCase("memory-correction/guards", async () => {
  const f = await fixture();
  try {
    const original = await f.read();
    const key = continuityHolderKey(continuityActor(original, "player")!);
    for (const patch of [
      { seed: "another-world" },
      { expectedCollectionRevision: 0 },
      { target: { ...f.input.target, heads: { ...f.input.target.heads, [key]: 99 } } },
      { target: { ...f.input.target, recordRevision: 99 } },
      { target: { ...f.input.target, id: "different" } },
      ...[["ella"], ["player", "ella"], ["player", "player"], ["constructor"], []].map((knowers) => ({ knowers })),
      ...[" ", "é".repeat(1201), 1, undefined].map((text) => ({ text })),
      { operationId: "" },
    ]) {
      const result = await f.post({ ...f.input, ...patch });
      assert.equal(result.statusCode, 409, JSON.stringify(patch));
      assert.deepEqual(await f.read(), original, "Rejected correction is atomic");
    }
    const text = "é".repeat(1200);
    assert.equal((await f.post({ ...f.input, knowers: ["aqua", "player"], text })).statusCode, 200);
    const state = await f.read();
    assert.equal(visible(state, "player")[0].text, text);
    assert.equal(visible(state, "aqua").find((row) => row.id === f.id)?.text, text);
    assert.equal((await f.post({ ...f.input, text: "Reused identity with different contents." })).statusCode, 409);
    assert.deepEqual(await f.read(), state);
  } finally {
    await f.close();
  }
});

await runCase("memory-correction/concurrency", async () => {
  const f = await fixture();
  try {
    f.beforeRoot(() =>
      f.repository().mutateAuthority((state) => {
        state.name = "Concurrent native edit";
      }),
    );
    assert.equal((await f.post()).statusCode, 200);
    const latest = await f.read();
    assert.equal(latest.name, "Concurrent native edit");
    const correction = { ...request(latest, f.id, "stale-correction"), text: "Uncommitted edit." };
    f.beforeRoot(() =>
      f.repository().mutateAuthority(
        (state) => {
          state.continuity = changeContinuityMemory(state, f.id, request(state, f.id, "racing-forget"), "forget", at);
        },
        { memories: true },
      ),
    );
    assert.equal((await f.post(correction)).statusCode, 409);
    const final = await f.read();
    assert.deepEqual(visible(final, "player"), []);
    assert.equal(
      final.continuity.versions.some((row) => row.text === correction.text),
      false,
    );
    assert.equal(
      final.continuity.versions.some((row) => row.text === correctedText),
      true,
    );
    assert.deepEqual(final.episodes, f.initial.episodes);
  } finally {
    await f.close();
  }
});

await runCase("memory-correction/runtime", async () => {
  const f = await fixture();
  await f.repo.mutateAuthority((state) => {
    state.clock = { revision: 1, trustedAt: at, recovery: null, replayUntilDate: "", advanceMs: 86400000 };
    state.timeZone = "UTC";
  });
  const original = await f.read();
  const release = configureVillagesRuntime({
    persistence: { documents: f.storage.documents },
    resources: {},
    languageModels: { resolveForRequest: () => assert.fail("Manual edits cannot request a model") },
    logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
    isDebugAgentsEnabled: () => false,
    getAgentConfig: async () => ({ connectionId: "" }),
  } as any);
  const app = Fastify();
  try {
    await villagesRoutes(app);
    const started = Date.now();
    const response = await app.inject({ method: "POST", url: `/memories/${f.id}/correct`, payload: f.input });
    assert.equal(response.statusCode, 200, response.body);
    const corrected = await f.read(),
      root = corrected.continuity.records.find((row) => row.id === f.id)!;
    const key = continuityHolderKey(continuityActor(corrected, "player")!);
    assert.equal(visible(corrected, "player")[0].text, correctedText);
    const correctedAt = Date.parse(root.protection[key].at);
    assert(correctedAt >= started + 86400000 && correctedAt <= Date.now() + 86400000);
    assert.deepEqual(unchangedNative(corrected), unchangedNative(original));
    const forgotten = await app.inject({
      method: "POST",
      url: `/memories/${f.id}/forget`,
      payload: request(corrected, f.id, "runtime-forget"),
    });
    assert.equal(forgotten.statusCode, 200, forgotten.body);
    const final = await f.read();
    assert.deepEqual(visible(final, "player"), []);
    assert.deepEqual(unchangedNative(final), unchangedNative(original));
    assert(
      [...f.storage.rows.values()].every((row) =>
        ["village", "memory-payload", "memory-page", "memory-payload-intent"].includes(row.kind),
      ),
    );
  } finally {
    await app.close();
    release();
    await f.close();
  }
});
