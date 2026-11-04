// Test cases: memory-correction/scope, memory-correction/guards, memory-correction/concurrency, memory-correction/runtime
import assert from "node:assert/strict";
import Fastify from "fastify";
import { runCase } from "../scripts/test-cases.mjs";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { projectMemories, captureMemoryScene } from "../packages/villages/src/server/domain/rules/memory-views.js";
import { forgetVillageMemory, sceneMemories } from "../packages/villages/src/server/domain/rules/village-memories.js";
import { createWorldCoordination } from "../packages/villages/src/server/features/world/village-service.js";
import { configureWorldCoordination } from "../packages/villages/src/server/features/world/village.js";
import { registerHistoryRoutes } from "../packages/villages/src/server/features/world/routes.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { villagesRoutes } from "../packages/villages/src/server/entry/routes.js";
import { addMemory, memoryRepair, memoryTime } from "./helpers/memories-fixture.js";

async function fixture() {
  const rows = new Map<string, any>();
  const clone = (value: any) => (value === undefined ? null : structuredClone(value));
  let beforeRoot: (() => Promise<void>) | undefined;
  const store: any = {
    async getById(_pkg: string, id: string) {
      return clone(rows.get(id));
    },
    async list(_pkg: string, kind: string) {
      return [...rows.values()].filter((row) => row.kind === kind).map(clone);
    },
    async create(input: any) {
      assert.ok(!rows.has(input.id));
      const row = { ...clone(input), revision: 1 };
      rows.set(row.id, row);
      return clone(row);
    },
    async update(input: any) {
      if (input.id === "villages-village" && beforeRoot) {
        const hook = beforeRoot;
        beforeRoot = undefined;
        await hook();
      }
      const prior = rows.get(input.id);
      if (!prior || prior.revision !== input.expectedRevision) return null;
      const row = { ...prior, ...clone(input), revision: prior.revision + 1 };
      rows.set(row.id, row);
      return clone(row);
    },
    async remove(_pkg: string, id: string, revision: number) {
      if (rows.get(id)?.revision !== revision) return false;
      rows.delete(id);
      return true;
    },
  };
  const repository = () =>
    createVillageRepository(
      () => store,
      (message) => {
        throw Error(message);
      },
    );
  const repo = repository();
  const initial = defaultVillageState();
  initial.seed = "correction-world";
  initial.setupAt = memoryTime();
  initial.memories = addMemory(initial.memories);
  initial.memories = addMemory(initial.memories, {
    sourceId: "private",
    audience: ["aqua", "ella"],
    text: "Ella privately prefers plum tea.",
  });
  initial.memoryScenes.frozen = {
    snapshot: captureMemoryScene(initial.memories, "frozen", ["aqua", "player"], memoryTime(4)),
    effects: {},
  };
  await repo.mutateAuthority(
    (state) => {
      Object.assign(state, initial);
    },
    { memories: true },
  );
  const api = createWorldCoordination({
    readVillageAuthority: () => repo.readAuthority({ memories: true }),
    mutateMemoryAuthority: (update: any) => repo.mutateAuthority(update, { memories: true }),
    readScene: () => {
      throw Error("Correction cannot read or change a transcript.");
    },
  } as any);
  const release = configureWorldCoordination(api);
  const app = Fastify();
  registerHistoryRoutes(app);
  const inspection = await api.readVillageMemoryEvidence(initial.memories.records[0].id, true, "player");
  const input = {
    operationId: "player-correction",
    seed: inspection.seed,
    expectedCollectionRevision: inspection.revision,
    target: {
      id: inspection.entry.id,
      revision: inspection.entry.revision,
      rootRevision: inspection.entry.rootRevision,
    },
    knowers: ["player"],
    text: "Aqua offered to lend the telescope, without promising to polish it.",
  };
  return {
    store,
    rows,
    api,
    app,
    input,
    initial,
    inspection,
    repo,
    repository,
    read: () => repo.readAuthority({ memories: true }),
    post: (payload: any = input, id = input.target.id) =>
      app.inject({ method: "POST", url: `/memories/${id}/correct`, payload }),
    beforeRoot(hook: () => Promise<void>) {
      beforeRoot = hook;
    },
    async close() {
      await app.close();
      release();
    },
  };
}
function mechanics(state: any) {
  return Object.fromEntries(
    Object.entries(state).filter(([key]) => !["memories", "memoryScenes", "memoryHead"].includes(key)),
  );
}

await runCase("memory-correction/scope", async () => {
  const f = await fixture();
  try {
    const original = await f.read();
    assert.deepEqual(f.inspection.knowers.map((k) => k.person.id).sort(), ["aqua", "player"]);
    const response = await f.post();
    assert.equal(response.statusCode, 200, response.body);
    assert.deepEqual(response.json(), { corrected: true });
    let current = await f.read();
    assert.equal(projectMemories(current.memories, ["player"])[0].text, f.input.text);
    assert.equal(projectMemories(current.memories, ["aqua"])[0].text, original.memories.records[0].text);
    assert.deepEqual(projectMemories(current.memories, ["ella"]), projectMemories(original.memories, ["ella"]));
    assert.deepEqual(
      mechanics(current),
      mechanics(original),
      "Correction cannot change gameplay, time, receipts or settings.",
    );
    assert.deepEqual(sceneMemories(current, "frozen"), sceneMemories(original, "frozen"));
    const retained = current.memories.records[0];
    assert.deepEqual(retained.knowers.player.support, original.memories.records[0].knowers.player.support);
    assert.deepEqual(retained.knowers.player.repair?.repairs, { id: retained.id, revision: 1 });
    assert.equal(retained.recordedAt, original.memories.records[0].recordedAt);
    assert.equal(projectMemories(current.memories, ["player"])[0].knowers.player.support.length, 0);
    const ordinary = await f.app.inject({ url: `/memories/${retained.id}/evidence` });
    assert.deepEqual(
      ordinary.json().knowers.map((k: any) => k.person.id),
      ["player"],
    );
    assert.deepEqual(
      ordinary.json().knowers[0].support,
      [],
      "Ordinary projection cannot reintroduce replaced source prose.",
    );
    const inspect = await f.api.readVillageMemoryEvidence(retained.id, true);
    assert.equal(inspect.knowers.find((k) => k.person.id === "player")?.text, f.input.text);
    assert.ok(inspect.knowers.find((k) => k.person.id === "player")?.playerCorrection);
    assert.equal(inspect.knowers[0].support[0].excerpt, original.memories.records[0].text);
    assert.equal((await f.api.buildVillageMemories({ query: "lend the telescope" })).total, 1);
    assert.equal((await f.api.buildVillageMemories({ query: "promised to polish" })).total, 0);
    // Independent repository and serialized document bytes simulate a cold service reopen.
    for (const [key, value] of f.rows) f.rows.set(key, JSON.parse(JSON.stringify(value)));
    assert.deepEqual(await f.repository().readAuthority({ memories: true }), current);
    assert.equal((await f.post()).statusCode, 200, "Lost-response retry remains idempotent after reopen.");
    assert.deepEqual(await f.read(), current);
    await f.api.forgetMemory(retained.id, {
      ...memoryRepair(current.memories, "forget", ["player"]),
      seed: current.seed,
    });
    current = await f.read();
    const repairForgotten = {
      ...memoryRepair(current.memories, "repair", ["player"], "A further correction."),
      seed: current.seed,
    };
    assert.equal((await f.post(repairForgotten)).statusCode, 200);
    assert.equal(projectMemories((await f.read()).memories, ["player"]).length, 0, "Correct never undoes Forget.");
    assert.ok((await f.api.buildVillageMemories({ inspection: true, characterId: "player" })).entries[0].forgotten);
  } finally {
    await f.close();
  }
});

await runCase("memory-correction/guards", async () => {
  const f = await fixture();
  try {
    const original = await f.read();
    for (const patch of [
      { seed: "replaced-world" },
      { expectedCollectionRevision: 0 },
      { target: { ...f.input.target, revision: 99 } },
      { target: { ...f.input.target, rootRevision: 99 } },
      { knowers: ["ella"] },
      { knowers: ["player", "ella"] },
      { knowers: ["player", "player"] },
      { knowers: ["constructor"] },
    ]) {
      assert.equal((await f.post({ ...f.input, ...patch })).statusCode, 409);
      assert.deepEqual(await f.read(), original, "Rejected correction is atomic even with a valid earlier knower.");
    }
    for (const patch of [
      { text: " " },
      { text: "é".repeat(301) },
      { text: 1 },
      { text: undefined },
      { operationId: "" },
      { knowers: [] },
      { target: { ...f.input.target, id: "different" } },
    ])
      assert.equal((await f.post({ ...f.input, ...patch })).statusCode, 400);
    assert.deepEqual(await f.read(), original);
    assert.equal((await f.post({ ...f.input, knowers: ["aqua", "player"], text: "é".repeat(300) })).statusCode, 200);
    const current = await f.read();
    assert.ok(
      projectMemories(current.memories, ["aqua", "player"]).some((row) => Object.keys(row.knowers).length === 2),
    );
    assert.equal((await f.post({ ...f.input, text: "Reused identity with different contents." })).statusCode, 409);
    assert.deepEqual(await f.read(), current);
  } finally {
    await f.close();
  }
});

await runCase("memory-correction/concurrency", async () => {
  const f = await fixture();
  try {
    f.beforeRoot(async () => {
      await f.repo.mutateAuthority((state) => {
        state.name = "Concurrent mechanical edit";
      });
    });
    assert.equal((await f.post()).statusCode, 200);
    assert.equal((await f.read()).name, "Concurrent mechanical edit");
    const latest = await f.read();
    const next = { ...memoryRepair(latest.memories, "repair", ["player"], "Uncommitted edit."), seed: latest.seed };
    f.beforeRoot(async () => {
      await f.repo.mutateAuthority(
        (state) => {
          forgetVillageMemory(state, memoryRepair(state.memories, "forget", ["player"]), memoryTime(12));
        },
        { memories: true },
      );
    });
    assert.equal((await f.post(next)).statusCode, 409, "A Memory conflict is never silently rebased.");
    const final = await f.read();
    assert.equal(projectMemories(final.memories, ["player"]).length, 0);
    assert.equal(final.memories.records[0].knowers.player.repair?.text, f.input.text);
    assert.deepEqual(sceneMemories(final, "frozen"), sceneMemories(f.initial, "frozen"));
  } finally {
    await f.close();
  }
});

await runCase("memory-correction/runtime", async () => {
  const f = await fixture();
  await f.repo.mutateAuthority((state) => {
    state.clock = { revision: 1, trustedAt: memoryTime(), recovery: null, replayUntilDate: "", advanceMs: 86400000 };
    state.timeZone = "UTC";
  });
  const original = await f.read();
  const release = configureVillagesRuntime({
    persistence: { documents: f.store },
    resources: {},
    languageModels: {
      resolveForRequest() {
        throw Error("Manual edits must never request a model.");
      },
    },
    isDebugAgentsEnabled: () => false,
    getAgentConfig: async () => ({ connectionId: "" }),
    json: { parseJsonish: (value: string) => JSON.parse(value) },
  } as any);
  const app = Fastify();
  try {
    await villagesRoutes(app);
    const evidence = (await app.inject({ url: `/memories/inspect/${f.input.target.id}?characterId=player` })).json();
    assert.equal(evidence.seed, original.seed);
    const correctionStarted = Date.now();
    const response = await app.inject({
      method: "POST",
      url: `/memories/${f.input.target.id}/correct`,
      payload: f.input,
    });
    assert.equal(response.statusCode, 200, response.body);
    const corrected = await f.read();
    const correctedAt = Date.parse(corrected.memories.records[0].knowers.player.repair!.at);
    assert.ok(
      correctedAt >= correctionStarted + 86400000 && correctedAt <= Date.now() + 86400000,
      "Cold manual correction uses the saved time advance without observing the clock.",
    );
    assert.deepEqual(
      mechanics(corrected),
      mechanics(original),
      "Actual runtime wiring cannot observe/write the old clock, found the world, or reconcile relationships/mechanics.",
    );
    assert.deepEqual(sceneMemories(corrected, "frozen"), sceneMemories(original, "frozen"));
    assert.equal(projectMemories(corrected.memories, ["player"])[0].text, f.input.text);
    const forgetStarted = Date.now();
    const forgotten = await app.inject({
      method: "POST",
      url: `/memories/${f.input.target.id}/forget`,
      payload: {
        ...memoryRepair(corrected.memories, "forget", ["player"]),
        seed: corrected.seed,
      },
    });
    assert.equal(forgotten.statusCode, 200, forgotten.body);
    const forgottenState = await f.read();
    const forgottenAt = Date.parse(forgottenState.memories.records[0].knowers.player.forgotten!.at);
    assert.ok(forgottenAt >= forgetStarted + 86400000 && forgottenAt <= Date.now() + 86400000);
    assert.deepEqual(mechanics(forgottenState), mechanics(original), "Forget uses the same history-only boundary.");
    assert.ok(
      [...f.rows.values()].every((row) =>
        ["village", "memory-payload", "memory-page", "memory-payload-intent"].includes(row.kind),
      ),
      "No relationship, Scene, settings or other domain documents are written.",
    );
  } finally {
    await app.close();
    release();
    await f.close();
  }
});
