// Test cases: retained-storage/checkpoint-owners, retained-storage/virtual-review, retained-storage/partial-preparation, retained-storage/shared-pages, retained-storage/foreign-owner, retained-storage/allocation-budget, retained-storage/frozen-scene, retained-storage/repeated-head, retained-storage/checkpoint-integrity, retained-storage/growth, retained-storage/payload-identity
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { runCase } from "../scripts/test-cases.mjs";
import { createRepairGate } from "../packages/villages/src/server/adapters/storage/repair-gate.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { createRepairService } from "../packages/villages/src/server/features/repair/repair-service.js";
import {
  collectRetainedStorage,
  createRetainedStorageCleanup,
} from "../packages/villages/src/server/features/repair/retained-storage-cleanup.js";
import { createRepairSnapshots } from "../packages/villages/src/server/adapters/storage/repair-snapshot-store.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { memoryDigest } from "../packages/villages/src/server/adapters/storage/memory-payload-store.js";
import {
  createMemoryPageTracer,
  encodeMemoryPages,
} from "../packages/villages/src/server/adapters/storage/memory-pages.js";
import { repairId } from "../packages/villages/src/server/domain/rules/repair-records.js";
import { addMemory, memoryTime, realisticMemoryHistory, memoryRepair } from "./helpers/memories-fixture.js";
import {
  reserveMemoryScene,
  forgetVillageMemory,
  sceneMemories,
} from "../packages/villages/src/server/domain/rules/village-memories.js";
import { venue } from "./fixtures/villages-projects.fixture.js";
import { projectMemories } from "../packages/villages/src/server/domain/rules/memory-views.js";

async function fixture() {
  const rows = new Map<string, any>(),
    lists: string[] = [];
  const store: any = {
    async getById(_pkg: string, id: string) {
      return structuredClone(rows.get(id) ?? null);
    },
    async list(_pkg: string, kind: string) {
      lists.push(kind);
      return [...rows.values()].filter((r) => r.kind === kind).map((r) => structuredClone(r));
    },
    async create(input: any) {
      assert.ok(!rows.has(input.id));
      const row = { ...structuredClone(input), revision: 1 };
      rows.set(row.id, row);
      return structuredClone(row);
    },
    async update(input: any) {
      const old = rows.get(input.id);
      if (!old || old.revision !== input.expectedRevision) return null;
      const row = { ...old, ...structuredClone(input), revision: old.revision + 1 };
      rows.set(row.id, row);
      return structuredClone(row);
    },
    async remove(_pkg: string, id: string, revision: number) {
      if (rows.get(id)?.revision !== revision) return false;
      return rows.delete(id);
    },
  };
  const gate = createRepairGate(store),
    repo = createVillageRepository(() => gate.documents);
  const api = createRepairService({
    gate,
    repository: repo,
    resumeProject: async () => {},
    cancelProject: async () => {},
    replaySaved: async () => {},
    continueSaved: async () => {},
  });
  await repo.mutateAuthority(
    (state) => {
      Object.assign(state, defaultVillageState());
      state.seed = "retained-storage";
      state.setupAt = memoryTime();
      state.foundedAt = memoryTime();
      state.venues = [venue()];
      state.memories = addMemory(state.memories, { audience: ["player"], sourceId: "first" });
    },
    { memories: true },
  );
  const insert = (id: string, kind: string, data: unknown) =>
    store.create({
      id,
      kind,
      packageId: "villages",
      name: id,
      description: "",
      data,
      createdAt: memoryTime(),
      updatedAt: memoryTime(),
    });
  return { rows, lists, gate, repo, api, store, insert, head: () => rows.get("villages-village").data.memoryHead };
}
await runCase("retained-storage/checkpoint-owners", async () => {
  const f = await fixture(),
    checkpoint = await f.api.createCheckpoint("Keep old history", "manual-history");
  const old = f.head();
  await f.repo.mutateAuthority(
    (state) => {
      state.memories = addMemory(state.memories, { sourceId: "later", audience: ["player"] });
    },
    { memories: true },
  );
  for (let i = 0; i < 11; i++) {
    const record = await f.api.inspect(repairId("zone", "cafe", "common"));
    const values = Object.fromEntries(record.fields.map((field) => [field.key, field.value]));
    values.description = `Retained physical account ${i}`;
    const review = await f.api.prepare({
      operationId: `change-${i}`,
      recordId: record.id,
      expectedRecord: record.token!,
      action: "correct",
      values,
      knowers: [],
    });
    await f.api.apply(review.id, review.token);
  }
  const first = await collectRetainedStorage(f.gate);
  assert.ok(first.removed > 0, "Superseded journal and preview bodies are reclaimable.");
  assert.ok(f.rows.has(old.id), "A manual checkpoint protects an older Memory head.");
  assert.equal([...f.rows.values()].filter((row) => row.kind === "repair-undo").length, 10);
  assert.equal((await f.api.index()).history.length, 11);
  await f.api.deleteCheckpoint(checkpoint.id, checkpoint.token);
  await collectRetainedStorage(f.gate);
  assert.equal(f.rows.has(old.id), false, "The last explicit owner can release superseded immutable history.");
  const undo = await f.api.undo("change-10", "consume-undo");
  await f.api.apply(undo.id, undo.token);
  await collectRetainedStorage(f.gate);
  assert.equal([...f.rows.values()].filter((row) => row.kind === "repair-undo").length, 9);
  assert.equal((await f.api.index()).history.length, 12);
  assert.equal((await f.repo.readAuthority({ memories: true })).memories.records.length, 2);
  assert.equal((await collectRetainedStorage(f.gate)).removed, 0, "Repeated cleanup is idempotent.");
});
await runCase("retained-storage/virtual-review", async () => {
  const f = await fixture();
  const state = await f.repo.readAuthority({ memories: true }),
    record = await f.api.inspect(repairId("memory", state.memories.records[0].id));
  const review = await f.api.prepare({
    operationId: "virtual-forget",
    recordId: record.id,
    expectedRecord: record.token!,
    action: "forget",
    values: {},
    knowers: ["player"],
  });
  const plan = [...f.rows.values()].find((row) => row.kind === "repair-plan")!;
  const frames = JSON.parse(plan.data.transaction.writes);
  assert.ok(
    frames.some((frame: any) => frame.memoryPages),
    "The retained review owns proposed pages before physical publication.",
  );
  await collectRetainedStorage(f.gate);
  const checkpoint = await f.api.createCheckpoint("Physical owner", "physical-owner");
  const header = [...f.rows.values()].find((row) => row.kind === "repair-checkpoint" && row.data.id === checkpoint.id)!;
  const original = header.data.snapshots;
  const proposedVillage = frames.find((frame: any) => frame.id === "villages-village").after;
  header.data.snapshots = JSON.stringify([proposedVillage]);
  const before = structuredClone(f.rows);
  await assert.rejects(collectRetainedStorage(f.gate), /owned history is missing/);
  assert.deepEqual(f.rows, before, "A virtual Plan cannot validate a missing physical checkpoint dependency.");
  header.data.snapshots = original;
  await collectRetainedStorage(f.gate);
  await f.api.apply(review.id, review.token);
  const repaired = await f.repo.readAuthority({ memories: true });
  assert.equal(repaired.memories.records[0].knowers.player.forgotten?.operationId, "virtual-forget");
});
await runCase("retained-storage/partial-preparation", async () => {
  const f = await fixture(),
    root = f.rows.get("villages-village"),
    world = memoryDigest(JSON.stringify([root.data.seed, root.data.setupAt])).slice(0, 32);
  const value = { memories: realisticMemoryHistory(100), memoryScenes: {}, memoryReceipts: {} };
  const encoded = encodeMemoryPages(value, world),
    candidate = {
      id: `villages-memory-${world}-${randomUUID()}`,
      digest: memoryDigest(JSON.stringify(encoded.manifest)),
      revision: value.memories.revision,
    };
  await f.insert(candidate.id, "memory-payload", { format: 2, world, payload: JSON.stringify(encoded.manifest) });
  const [page, data] = [...encoded.pages][0];
  await f.insert(page, "memory-page", data);
  const intent = `villages-memory-intent-${randomUUID()}`;
  await f.insert(intent, "memory-payload-intent", {
    candidate,
    previous: f.head(),
    expectedRevision: root.revision,
    phase: "preparing",
  });
  f.gate.dispose();
  const restarted = createRepairGate(f.store);
  await collectRetainedStorage(restarted);
  assert.equal(f.rows.has(candidate.id), false);
  assert.equal(f.rows.has(page), false);
  assert.equal(f.rows.has(intent), false, "A stopped partial preparation is not a permanent recovery hold.");
  const read = await createVillageRepository(() => restarted.documents).readAuthority({ memories: true });
  assert.equal(read.memories.records.length, 1);
  await f.insert(`villages-memory-intent-${randomUUID()}`, "memory-payload-intent", { candidate: false });
  const before = structuredClone(f.rows);
  await assert.rejects(collectRetainedStorage(restarted));
  assert.deepEqual(f.rows, before, "Malformed ownership defers the entire deletion pass.");
});
await runCase("retained-storage/shared-pages", async () => {
  const world = "a".repeat(32),
    pages = new Map<string, any>(),
    manifests: unknown[] = [];
  let value = { memories: realisticMemoryHistory(1000), memoryScenes: {}, memoryReceipts: {} };
  let layout;
  for (let i = 0; i < 40; i++) {
    const encoded = encodeMemoryPages(value, world, layout);
    layout = encoded.layout;
    for (const row of encoded.pages) pages.set(...row);
    manifests.push(encoded.manifest);
    value = { ...value, memories: addMemory(value.memories, { sourceId: `append-${i}`, audience: ["player"] }) };
  }
  const reads = new Map<string, number>();
  const tracer = createMemoryPageTracer(async (id) => {
    reads.set(id, (reads.get(id) ?? 0) + 1);
    return pages.get(id) ?? null;
  });
  for (const manifest of manifests) await tracer.trace(manifest, world);
  assert.ok(reads.size > 50);
  assert.ok(
    [...reads.values()].every((count) => count === 1),
    "Shared pages are visited once across retained history versions.",
  );
});
await runCase("retained-storage/foreign-owner", async () => {
  const f = await fixture();
  await f.api.createCheckpoint("Another Village", "another-village");
  const head = f.head();
  await f.repo.mutateAuthority(
    (state) => {
      state.seed = "replacement-world";
      state.setupAt = memoryTime(10);
    },
    { memories: true },
  );
  assert.equal((await f.api.index()).checkpointTotal, 0);
  await collectRetainedStorage(f.gate);
  assert.ok(f.rows.has(head.id), "UI scope filtering never releases a retained foreign-world owner.");
});
await runCase("retained-storage/allocation-budget", async () => {
  const f = await fixture(),
    failures: unknown[] = [];
  const cleanup = createRetainedStorageCleanup(f.gate, (error) => failures.push(error));
  const unsubscribe = f.gate.whenIdle(() => {
    void cleanup.request();
  });
  try {
    await cleanup.request();
    const passes = () => f.lists.filter((kind) => kind === "repair-snapshot").length;
    assert.equal(passes(), 1);
    for (let i = 0; i < 100; i++)
      await f.repo.mutateAuthority((state) => {
        state.name = `Ordinary save ${i}`;
      });
    await cleanup.request();
    assert.equal(passes(), 1, "Ordinary gameplay does not mark full retained history on each save.");
    const artifact = await f.gate.work(() =>
      createRepairSnapshots(f.gate.raw).captureOne({
        id: "unused-source",
        kind: "test",
        name: "Unused",
        description: "",
        data: { text: "x".repeat(2 * 1024 * 1024) },
      }),
    );
    await cleanup.request();
    assert.equal(passes(), 2, "Allocated bytes schedule a coalesced follow-up sweep.");
    assert.equal(f.rows.has(artifact.body), false);
    assert.deepEqual(failures, []);
  } finally {
    unsubscribe();
    cleanup.dispose();
  }
});
await runCase("retained-storage/frozen-scene", async () => {
  const f = await fixture();
  await f.repo.mutateAuthority(
    (state) => {
      state.memories = realisticMemoryHistory(200);
      reserveMemoryScene(state, "held", memoryTime());
      const ownEffect = {
        ...state.memories.records[2],
        knowers: Object.fromEntries(
          Object.entries(state.memories.records[2].knowers).filter(([id]) => id === "player"),
        ),
      };
      state.memoryScenes.held.effects[ownEffect.id] = ownEffect;
    },
    { memories: true },
  );
  const original = sceneMemories(await f.repo.readAuthority({ memories: true }), "held");
  await f.repo.mutateAuthority(
    (state) => {
      forgetVillageMemory(state, memoryRepair(state.memories, "forget", ["player"]), memoryTime(20));
    },
    { memories: true },
  );
  const preserved = await f.repo.readAuthority({ memories: true });
  await collectRetainedStorage(f.gate);
  const cold = await createVillageRepository(() => f.gate.documents).readAuthority({ memories: true });
  assert.deepEqual(
    projectMemories(sceneMemories(cold, "held"), ["player"]),
    projectMemories(original, ["player"]),
    "Serialized Scene headers retain sparse preimages and own effects.",
  );
  assert.deepEqual(cold.memoryScenes.held, preserved.memoryScenes.held);
  assert.ok(cold.memories.records[0].knowers.player.forgotten);
});
await runCase("retained-storage/repeated-head", async () => {
  const f = await fixture();
  const checkpoint = await f.api.createCheckpoint("Corrupt reference", "repeated-head");
  const header = [...f.rows.values()].find((row) => row.kind === "repair-checkpoint" && row.data.id === checkpoint.id)!;
  const root = f.rows.get("villages-village");
  for (const field of ["digest", "revision"]) {
    const source = {
      id: root.id,
      kind: root.kind,
      name: root.name,
      description: root.description,
      data: structuredClone(root.data),
    };
    source.data.memoryHead[field] = field === "digest" ? "0".repeat(64) : source.data.memoryHead.revision + 1;
    const snapshot = await createRepairSnapshots(f.gate.raw).captureOne(source);
    header.data.snapshots = JSON.stringify([snapshot]);
    const before = structuredClone(f.rows);
    await assert.rejects(collectRetainedStorage(f.gate), /owned history reference changed/);
    assert.deepEqual(f.rows, before, "A previously visited head cannot conceal a malformed later owner.");
  }
});
await runCase("retained-storage/checkpoint-integrity", async () => {
  const f = await fixture();
  const checkpoint = await f.api.createCheckpoint("Validate all sources", "source-integrity");
  const header = [...f.rows.values()].find((row) => row.kind === "repair-checkpoint" && row.data.id === checkpoint.id)!;
  const root = f.rows.get("villages-village"),
    original = header.data.snapshots;
  const sources = await createRepairSnapshots(f.gate.raw).restore(original);
  const foreign = { ...sources[0], data: { ...root.data, seed: "foreign-owner", memoryHead: null } };
  const foreignRef = await createRepairSnapshots(f.gate.raw).captureOne(foreign);
  for (const refs of [
    "[]",
    JSON.stringify([foreignRef]),
    JSON.stringify([JSON.parse(original)[0], JSON.parse(original)[0]]),
  ]) {
    header.data.snapshots = refs;
    const before = structuredClone(f.rows);
    await assert.rejects(collectRetainedStorage(f.gate), /checkpoint|ownership/);
    assert.deepEqual(f.rows, before, "Malformed aggregate checkpoint ownership permits no deletions.");
  }
});
await runCase("retained-storage/growth", async () => {
  for (const count of [1000, 10000, 25000]) {
    const f = await fixture();
    await f.repo.mutateAuthority(
      (state) => {
        state.memories = realisticMemoryHistory(count);
        reserveMemoryScene(state, "large-frozen", memoryTime());
      },
      { memories: true },
    );
    const initial = await collectRetainedStorage(f.gate);
    const targets = (await f.repo.readAuthority({ memories: true })).memories.records
      .filter((row) => row.knowers.player && !row.knowers.player.forgotten)
      .slice(0, 20)
      .map((row) => row.id);
    for (let i = 0; i < 20; i++) {
      await f.repo.mutateAuthority(
        (state) => {
          forgetVillageMemory(
            state,
            memoryRepair(state.memories, "forget", ["player"], undefined, targets[i]),
            memoryTime(20 + i),
          );
        },
        { memories: true },
      );
    }
    const preserved = await f.repo.readAuthority({ memories: true });
    const pageLists = f.lists.filter((kind) => kind === "memory-page").length;
    const result = await collectRetainedStorage(f.gate);
    assert.equal(f.lists.filter((kind) => kind === "memory-page").length - pageLists, 1);
    const cold = await createVillageRepository(() => f.gate.documents).readAuthority({ memories: true });
    assert.deepEqual(cold.memories, preserved.memories);
    assert.deepEqual(cold.memoryScenes, preserved.memoryScenes);
    assert.equal(cold.memories.records.length, count);
    assert.ok(result.removedBytes > 0);
    assert.ok(
      result.retainedBytes < initial.retainedBytes * 1.1 + 256 * 1024,
      "Twenty corrections retain shared current/frozen history rather than twenty whole-history copies.",
    );
    console.log(
      JSON.stringify({
        workload: "retained-history",
        records: count,
        operations: 20,
        initialBytes: initial.retainedBytes,
        retainedBytes: result.retainedBytes,
        reclaimedBytes: result.removedBytes,
      }),
    );
  }
});
await runCase("retained-storage/payload-identity", async () => {
  const f = await fixture();
  await f.insert("not-a-memory-id", "memory-payload", { format: 2, payload: "{}" });
  const before = structuredClone(f.rows);
  await assert.rejects(collectRetainedStorage(f.gate), /invalid retained history identity/);
  assert.deepEqual(
    f.rows,
    before,
    "Missing namespace and malformed identity cannot jointly validate an unknown candidate.",
  );
});
