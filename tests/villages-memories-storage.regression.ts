// Test cases: memories-storage/1000, memories-storage/10000, memories-storage/25000, memories-storage/conflict, memories-storage/malformed
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  forgetVillageMemory,
  reserveMemoryScene,
  sceneMemories,
} from "../packages/villages/src/server/domain/rules/village-memories.js";
import {
  realisticMemoryHistory,
  realisticMemoryReceipts,
  memoryRepair,
  memoryTime,
} from "./helpers/memories-fixture.js";
// Model the pinned host's actual 200k-value Gallery traversal boundary, including
// retained native receipts. The installed pinned Engine is also checked separately.
function hostReferences(data: any) {
  const values = [data],
    references: string[] = [];
  let scanned = 0;
  while (values.length) {
    const next = values.pop();
    assert.ok(++scanned <= 200000, "Host reference scan ceiling");
    if (typeof next === "string" && next.startsWith("global-gallery:")) references.push(next);
    else if (Array.isArray(next)) values.push(...next);
    else if (next && typeof next === "object") values.push(...Object.values(next));
  }
  return { scanned, references };
}
for (const count of [1000, 10000, 25000])
  await runCase("memories-storage/" + count, async () => {
    const initial = defaultVillageState();
    initial.seed = "storage-scale";
    initial.memories = realisticMemoryHistory(count);
    initial.exchangeReceipts = realisticMemoryReceipts(initial.memories);
    initial.maps = [
      {
        id: "map",
        name: "Map",
        artwork: { ref: "global-gallery:map-owner", url: "/api/global-gallery/images/map-owner", id: "map-owner" },
        width: 100,
        height: 100,
        view: {},
        revision: 1,
      },
    ] as any;
    initial.exchangeReceipts.physical = {
      id: "physical",
      sceneId: "scene",
      submissionId: "turn",
      domain: "physical",
      at: memoryTime(),
      evidenceIds: [],
      reason: "global-gallery:domain-reference",
    };
    reserveMemoryScene(initial, "frozen", memoryTime());
    let saved: any;
    let native: any;
    const store: any = {
      getById: async () => (saved ? structuredClone(saved) : null),
      create: async (input: any) => {
        const scanned = hostReferences(input.data);
        assert.ok(scanned.references.includes("global-gallery:map-owner"));
        assert.ok(scanned.references.includes("global-gallery:domain-reference"));
        saved = { ...structuredClone(input), revision: 1 };
        return saved;
      },
    };
    const repository = createVillageRepository(() => store);
    await repository.mutateAuthority((state) => {
      Object.assign(state, structuredClone(initial));
      native = state;
    });
    assert.equal(typeof native.memories, "object", "Encoding cannot mutate returned runtime authority");
    assert.equal(typeof saved.data.memories, "string");
    assert.equal(typeof saved.data.memoryScenes, "string");
    assert.equal(typeof saved.data.memoryReceipts, "string");
    assert.equal(saved.data.exchangeReceipts.physical.reason, initial.exchangeReceipts.physical.reason);
    const restored = await repository.readAuthority();
    assert.deepEqual(restored.memories, initial.memories);
    assert.deepEqual(restored.memoryScenes, initial.memoryScenes);
    assert.deepEqual(restored.exchangeReceipts, initial.exchangeReceipts);
    assert.deepEqual(restored.maps[0].artwork, initial.maps[0].artwork);
    console.log(
      JSON.stringify({
        count,
        storedBytes: Buffer.byteLength(JSON.stringify(saved.data)),
        scannedValues: hostReferences(saved.data).scanned,
        retainedReceipts: Object.keys(restored.exchangeReceipts).length,
      }),
    );
  });
await runCase("memories-storage/conflict", async () => {
  let saved: any;
  let writes = 0;
  const attempts: any[] = [];
  const repository = createVillageRepository(
    () =>
      ({
        getById: async () => (saved ? structuredClone(saved) : null),
        create: async (input: any) => {
          saved = { ...structuredClone(input), revision: 1 };
          return saved;
        },
        update: async (input: any) => {
          attempts.push(structuredClone(input.data));
          if (++writes === 1) {
            saved.data.name = "Concurrent name";
            saved.revision++;
            return null;
          }
          assert.equal(input.expectedRevision, saved.revision);
          saved = { ...saved, data: structuredClone(input.data), revision: saved.revision + 1 };
          return saved;
        },
      }) as any,
  );
  await repository.mutateAuthority((state) => {
    state.seed = "retry";
    state.memories = realisticMemoryHistory(10);
    reserveMemoryScene(state, "frozen", memoryTime());
  });
  await repository.mutateAuthority((state) => {
    forgetVillageMemory(state, memoryRepair(state.memories, "forget", ["player"]), memoryTime(100));
  });
  assert.equal(attempts.length, 2);
  const restored = await repository.readAuthority();
  assert.equal(restored.name, "Concurrent name");
  assert.ok(restored.memories.records[0].knowers.player.forgotten);
  assert.equal(sceneMemories(restored, "frozen").records[0].knowers.player.forgotten, undefined);
  for (const data of attempts) {
    assert.ok(JSON.parse(data.memories).records[0].knowers.player.forgotten);
    assert.ok(JSON.parse(data.memoryScenes).frozen.snapshot.before["history-memory-0"]);
  }
});
await runCase("memories-storage/malformed", () => {
  const good = defaultVillageState();
  for (const memoryReceipts of [null, [], 3, true])
    assert.throws(() => coerceVillageState({ ...good, memoryReceipts }));
  for (const field of ["memories", "memoryScenes", "memoryReceipts"])
    for (const value of [
      "{bad",
      "null",
      "[]",
      JSON.stringify(JSON.stringify(field === "memories" ? good.memories : {})),
    ])
      assert.throws(() => coerceVillageState({ ...good, [field]: value }), undefined, field + " must fail closed");
  assert.throws(
    () => coerceVillageState({ ...good, memoryReceipts: JSON.stringify({ bad: { id: "bad", domain: "physical" } }) }),
    /invalid encoded memory receipt/,
  );
  assert.throws(
    () =>
      coerceVillageState({
        ...good,
        exchangeReceipts: { same: { id: "same", domain: "memories" } },
        memoryReceipts: JSON.stringify({ same: { id: "same", domain: "memories" } }),
      }),
    /duplicate memory receipt/,
  );
  assert.throws(() => coerceVillageState({ ...good, version: 3 }), /Unsupported Village format/);
});
