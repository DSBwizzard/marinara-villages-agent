// Test cases: memories/history-1000, memories/history-10000, memories/history-25000, memories/shared-budget
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { runCase } from "../scripts/test-cases.mjs";
import { applyMemoryRepair } from "../packages/villages/src/server/domain/rules/memory-application.js";
import { readMemoryCollection } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import {
  estimatedMemoryTokens,
  memoryProtectionContext,
} from "../packages/villages/src/server/domain/rules/memory-protection.js";
import { recallMemories } from "../packages/villages/src/server/domain/rules/memory-recall.js";
import {
  captureMemoryScene,
  pagePlayerMemories,
  playerMemoryEvidence,
  sceneMemoryCollection,
} from "../packages/villages/src/server/domain/rules/memory-views.js";
import { memoryRepair, memoryTime, realisticMemoryHistory } from "./helpers/memories-fixture.js";

for (const count of [1000, 10000, 25000])
  await runCase("memories/history-" + count, () => {
    const baselineHeap = process.memoryUsage().heapUsed;
    const generated = realisticMemoryHistory(count);
    const serialized = JSON.stringify(generated);
    const start = performance.now();
    const collection = readMemoryCollection(JSON.parse(serialized));
    const recoveryMs = performance.now() - start;
    assert.equal(collection.records.length, count);
    const captureStart = performance.now();
    const snapshots = Array.from({ length: 8 }, (_, i) =>
      captureMemoryScene(collection, "simultaneous-" + i, i % 2 ? ["player"] : ["aqua"], memoryTime(count * 5 + 2)),
    );
    const captureMs = performance.now() - captureStart;
    const snapshotBytes = Buffer.byteLength(JSON.stringify(snapshots));
    assert.ok(snapshotBytes < 2000, "Capture retains no full-history copies for any active Scene.");
    const timings: number[] = [];
    let promptBytes = 0;
    for (let i = 0; i < 6; i++) {
      const lookupStart = performance.now();
      const lookup = recallMemories(collection, {
        query: i % 2 ? "what happened?" : "brass telescope lens meteor",
        narration: i % 2 ? "Aqua sets the brass telescope lens beside the star chart." : "",
        audience: ["aqua", "player"],
        purpose: "system",
      });
      timings.push(performance.now() - lookupStart);
      assert.equal(
        lookup.candidates[0].rootId,
        "history-memory-0",
        "Find an oldest promise from input or the current Narration reply.",
      );
      assert.ok(lookup.targetIds.includes("history-memory-0"));
      assert.ok(lookup.tokens <= 1800);
      assert.equal(lookup.tokens, estimatedMemoryTokens(lookup.serialized));
      assert.doesNotMatch(lookup.serialized, /stolen|locked attic/u);
      promptBytes = Math.max(promptBytes, Buffer.byteLength(lookup.serialized));
    }
    assert.equal(
      recallMemories(collection, { query: "what happened?", audience: ["player"], purpose: "system" }).candidates
        .length,
      0,
    );
    const sourceCue = recallMemories(collection, {
      query: "bring star chart",
      audience: ["player"],
      purpose: "narration",
    });
    assert.equal(
      sourceCue.candidates[0].rootId,
      "history-memory-0",
      "Search retained exact support as well as summary text.",
    );
    const identity = recallMemories(collection, { query: "history-memory-0", audience: ["aqua"], purpose: "system" });
    assert.ok(identity.targetIds.includes("history-memory-0"));
    const mutationStart = performance.now();
    const repaired = applyMemoryRepair(
      collection,
      memoryRepair(collection, "repair", ["aqua"], "Aqua promised a star chart."),
      memoryTime(count * 5 + 3),
      snapshots,
    );
    const mutationMs = performance.now() - mutationStart;
    assert.ok(
      Buffer.byteLength(JSON.stringify(repaired.snapshots)) < 15000,
      "Only one changed root per eligible active Scene is retained.",
    );
    const stillFrozen = recallMemories(repaired.collection, {
      query: "brass telescope lens",
      audience: ["aqua"],
      purpose: "narration",
      snapshot: repaired.snapshots[0],
    });
    assert.match(stillFrozen.candidates[0].text, /telescope/u);
    assert.equal(sceneMemoryCollection(repaired.collection, repaired.snapshots[1]).records.length, count);
    const pageStart = performance.now();
    const firstPage = pagePlayerMemories(collection);
    const secondPage = pagePlayerMemories(collection, { cursor: firstPage.next! });
    const search = pagePlayerMemories(collection, { query: "brass telescope" });
    const evidence = playerMemoryEvidence(collection, "history-memory-0");
    const pageSearchEvidenceMs = performance.now() - pageStart;
    assert.equal(firstPage.rows.length, 50);
    assert.equal(secondPage.rows.length, 50);
    assert.equal(new Set([...firstPage.rows, ...secondPage.rows].map((row) => row.id)).size, 100);
    assert.ok(!JSON.stringify(firstPage.rows).includes("support"), "Evidence loads on demand.");
    assert.equal(search.rows[0].id, "history-memory-0");
    assert.match(evidence!.support[0].excerpt, /star chart/u);
    assert.equal(playerMemoryEvidence(collection, "history-memory-1"), null);
    assert.throws(() => pagePlayerMemories(repaired.collection, { cursor: firstPage.next! }), /stale page/u);
    const protection = memoryProtectionContext(repaired.collection, { knowers: ["aqua"], query: "star chart" });
    const system = recallMemories(repaired.collection, {
      query: "star chart",
      audience: ["aqua"],
      purpose: "system",
      protection,
    });
    assert.ok(system.tokens <= 1800);
    assert.ok(JSON.parse(system.serialized).administrative);
    const broadStart = performance.now();
    const broad = recallMemories(collection, {
      query: "orchard festival meeting",
      audience: ["aqua", "gidget", "ella", "player"],
      purpose: "narration",
    });
    const broadMs = performance.now() - broadStart;
    assert.ok(broad.tokens <= 1000);
    // Data, not brittle CI thresholds: PR 2 measures real atomic saves, HTTP and desktop/phone rendering.
    const serializationStart = performance.now();
    JSON.stringify(repaired.collection);
    const serializationMs = performance.now() - serializationStart;
    console.log(
      JSON.stringify({
        count,
        collectionBytes: Buffer.byteLength(serialized),
        recoveryMs: Math.round(recoveryMs),
        captureMs: +captureMs.toFixed(2),
        snapshotBytes,
        mutationMs: +mutationMs.toFixed(2),
        serializationMs: Math.round(serializationMs),
        recallAssemblyP95Ms: Math.round([...timings].sort((a, b) => a - b)[Math.ceil(timings.length * 0.95) - 1]),
        broadRecallMs: Math.round(broadMs),
        pageSearchEvidenceMs: Math.round(pageSearchEvidenceMs),
        promptBytes,
        heapDeltaBytes: process.memoryUsage().heapUsed - baselineHeap,
      }),
    );
  });

await runCase("memories/shared-budget", () => {
  const collection = realisticMemoryHistory(2);
  const root = collection.records[0],
    original = root.knowers.aqua;
  root.knowers = Object.fromEntries(
    ["aqua", "gidget", "ella", "milo", "sora", "tessa", "orin", "fern"].map((id) => [
      id,
      {
        ...structuredClone(original),
        support: [0, 1].map((n) => ({
          ...structuredClone(original.support[0]),
          lineId: "long-" + n,
          excerpt: "brass telescope lens " + "meaningful exact supporting words ".repeat(7),
          audience: [id],
        })),
      },
    ]),
  );
  assert.doesNotThrow(() => readMemoryCollection(JSON.parse(JSON.stringify(collection))));
  const lookup = recallMemories(collection, {
    query: root.id,
    audience: Object.keys(root.knowers),
    purpose: "narration",
  });
  assert.ok(lookup.candidates.length > 0, "A large shared root remains recallable as complete audience slices.");
  assert.ok(lookup.targetIds.includes(root.id));
  assert.ok(lookup.tokens <= 1000);
  assert.equal(Object.keys(lookup.candidates[0].knowers).length, 1);
});
