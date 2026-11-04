import assert from "node:assert/strict";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  createSceneTranscriptStore,
  encodeSceneTranscript,
} from "../packages/villages/src/server/adapters/storage/scene-transcript-pages.js";
import {
  createHistoryPageWriter,
  createHistoryPageReader,
  pageDigest,
  type MemoryPageData,
  type HistoryPageRef,
} from "../packages/villages/src/server/adapters/storage/memory-pages.js";

const world = "a".repeat(32);
function run<T>(read: Generator<string, T, MemoryPageData | null>, pages: Map<string, MemoryPageData>) {
  let reads = 0,
    bytes = 0,
    next = read.next();
  while (!next.done) {
    const value = pages.get(next.value) ?? null;
    reads++;
    bytes += Buffer.byteLength(JSON.stringify(value), "utf8");
    next = read.next(value);
  }
  return { value: next.value, reads, bytes };
}
for (const count of [1000, 10_000, 25_000]) {
  const rows: [string, unknown][] = Array.from({ length: count }, (_, index) => [
    "line:" + index,
    { id: "line:" + index, text: "Exact café 東京 evidence, " + index + "\n" + "x".repeat(120) },
  ]);
  const writer = createHistoryPageWriter(world),
    tree = writer.tree(rows);
  for (const start of [0, Math.floor(count / 2), count - 40]) {
    const reader = createHistoryPageReader(world);
    const selected = run(reader.range(tree.root, count, start, start + 40), writer.pages);
    assert.deepEqual(selected.value, rows.slice(start, start + 40));
    assert(selected.reads < 12 && selected.bytes < 40 * 1024, "A cold fixed range must not read the full history");
    console.log(`History ${count}/${start}: ${selected.reads} reads, ${selected.bytes} bytes`);
  }
  const reader = createHistoryPageReader(world);
  let reads = 0,
    bytes = 0;
  for (const position of Array.from({ length: 40 }, (_, index) => Math.floor((index * count) / 40))) {
    const selected = run(reader.range(tree.root, count, position, position + 1), writer.pages);
    assert.deepEqual(selected.value, rows.slice(position, position + 1));
    reads += selected.reads;
    bytes += selected.bytes;
  }
  assert(reads < 128 && bytes < 1024 * 1024, "Sparse public positions reuse only this request's selected pages");
  assert.throws(() => run(createHistoryPageReader(world).range(tree.root, count, -1, 2), writer.pages), /interval/);
  assert.throws(
    () => run(createHistoryPageReader(world).range(tree.root, count, 0, count + 1), writer.pages),
    /interval/,
  );
}

// A valid digest does not make a sparse directory safe for positional addressing.
const writer = createHistoryPageWriter(world);
const rows: [string, unknown][] = Array.from({ length: 33 * 64 }, (_, index) => [String(index), { id: String(index) }]);
const tree = writer.tree(rows);
function branch(children: HistoryPageRef[], height: number): HistoryPageRef {
  const node = { type: "branch" as const, children },
    digest = pageDigest(JSON.stringify(node));
  const id = `villages-memory-page-${world}-${digest}`;
  writer.pages.set(id, { format: 1, world, node });
  return { id, digest, height };
}
const leaves = tree.groups.map((group) => group.ref);
const sparse = branch([branch(leaves.slice(0, 31), 1), branch(leaves.slice(31), 1)], 2);
assert.throws(
  () => run(createHistoryPageReader(world).range(sparse, rows.length, 0, 40), writer.pages),
  /packed history branch/,
);
assert.throws(
  () => run(createHistoryPageReader(world).tree(sparse, { count: rows.length, items: 64 }), writer.pages),
  /packed history branch/,
);
assert.throws(() => run(createHistoryPageReader(world).range(tree.root, rows.length, 0, 40), new Map()), /missing/);
assert.deepEqual(run(createHistoryPageReader(world).range(null, 0, 0, 0), new Map()).value, []);
{
  const scene = coerceSession({
    version: 3,
    id: "selected-Scene",
    villageSeed: "range-world",
    participants: [],
    submissions: [],
    lines: Array.from({ length: 1000 }, (_, index) => ({
      id: "exact:" + index,
      role: "assistant",
      kind: "narration",
      speakerId: "__venue_scene__",
      name: "Narration",
      content: "Exact café 東京 paragraph " + index,
      at: "2026-10-31T00:00:00.000Z",
      heardBy: [],
    })),
  });
  const saved = encodeSceneTranscript(scene.lines, scene);
  let reads = 0;
  const store = createSceneTranscriptStore({
    getById: async (_packageId, id) => {
      reads++;
      const data = saved.pages.get(id);
      return data ? ({ id, packageId: "villages", kind: "memory-page", revision: 1, data } as any) : null;
    },
    create: () => assert.fail("Selected reads never write"),
  });
  const positions = [0, 503, 999];
  assert.deepEqual(
    await store.readPositions(saved.head, scene, positions),
    positions.map((index) => scene.lines[index]),
  );
  assert(reads < 12, "The typed transcript adapter performs selected reads without full hydration");
  assert.equal(
    (await store.read(saved.head, scene)).lines.length,
    1000,
    "A partial read cannot poison the full-head cache",
  );
  await assert.rejects(store.readPositions(saved.head, scene, [1, 1]), /duplicate/);
}
console.log("Dense history ranges: exact cold/sparse reads, bounded I/O and malformed layout rejection passed.");
