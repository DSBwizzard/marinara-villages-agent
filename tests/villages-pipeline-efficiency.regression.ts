import assert from "node:assert/strict";
import {
  selectPromptMemories,
  selectPromptRecollections,
} from "../packages/villages/src/engine/packages/server/src/services/villages/memory-selection.js";
import {
  measurePipeline,
  measureModel,
  pipelineSignal,
  pipelineStorage,
} from "../packages/villages/src/engine/packages/server/src/services/villages/pipeline-metrics.js";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.js";
async function run() {
  const memory = (id: string, text: string, audience = ["a"], weight = 1) =>
    ({
      id,
      text,
      scope: "private",
      kind: "favour",
      knownByCharacterIds: audience,
      actors: audience.map((id) => ({ id })),
      weight,
    }) as any;
  const recent = Array.from({ length: 30 }, (_, index) => memory("new" + index, "Unrelated weather", ["a"], 100));
  const relevant = memory("alex", "Alex’s violin requires careful repair.", ["a"], 1);
  assert.equal(
    selectPromptMemories([...recent, relevant], ["a"], "Alex", 40)[0].id,
    "alex",
    "Exact short-name relevance outranks importance and recency",
  );
  assert.equal(
    selectPromptMemories([memory("wrong", "Alexandra has a violin."), relevant], ["a"], "Alex", 40)[0].id,
    "alex",
    "Names match complete Unicode tokens",
  );
  assert.equal(
    selectPromptMemories(
      [memory("unicode", "José promised repairs."), memory("other", "A greeting.")],
      ["a"],
      "José",
      40,
    )[0].id,
    "unicode",
  );
  assert.equal(
    selectPromptMemories([memory("hidden", "Alex secret", ["hidden"]), relevant], ["a"], "Alex", 600).some(
      (row) => row.id === "hidden",
    ),
    false,
  );
  const rows = [
    ...Array.from({ length: 12 }, (_, index) => memory("a" + index, "A memory " + "x".repeat(26))),
    memory("b", "B memory " + "y".repeat(26), ["b"]),
  ];
  const selected = selectPromptMemories(rows, ["a", "b"], "", 120);
  assert.ok(
    selected.some((row) => row.id === "b"),
    "Equal reserved allocation protects quieter participants",
  );
  assert.ok(selected.reduce((sum, row) => sum + row.text.length + 24, 0) <= 120 * 4);
  assert.ok(
    selected.filter((row) => row.id.startsWith("a")).length > 2,
    "Unused participant allocation returns to shared pool",
  );
  const passing = [
    { ...relevant, expiresAt: new Date(Date.now() + 86400000).toISOString(), reinforcementCount: 0 },
    { ...memory("expired", "Alex"), expiresAt: new Date(0).toISOString(), reinforcementCount: 5 },
  ];
  assert.deepEqual(
    selectPromptRecollections(passing, ["a"], "Alex", 100).map((row) => row.id),
    ["alex"],
  );
  const logs: string[] = [];
  const release = configureVillagesRuntime({
    isDebugAgentsEnabled: () => true,
    logger: {
      debugOverride(_enabled: boolean, _format: string, text: string) {
        logs.push(text);
      },
    },
  } as any);
  try {
    await measurePipeline("fixture", {}, async () => {
      pipelineStorage("reads");
      pipelineStorage("writes");
      pipelineSignal("projectRelevanceSkips", 2);
      await measureModel(async () => ({ usage: { promptTokens: 12, completionTokens: 3 } }));
      await measureModel(async () => ({ usage: undefined }));
    });
    const metrics = JSON.parse(logs.at(-1)!).detail;
    assert.equal(metrics.requests, 2);
    assert.equal(metrics.reads, 1);
    assert.equal(metrics.writes, 1);
    assert.equal(metrics.reportedInputTokens, 12);
    assert.equal(metrics.reportedOutputTokens, 3);
    assert.equal(metrics.unknownUsageRequests, 1);
    assert.equal(metrics.providerUsage, "unknown");
    assert.equal(metrics.signals.projectRelevanceSkips, 2);
    await Promise.all([
      measurePipeline("one", {}, async () => {
        await Promise.resolve();
        pipelineStorage("reads");
      }),
      measurePipeline("two", {}, async () => {
        pipelineStorage("writes");
      }),
    ]);
    const tail = logs.slice(-2).map((line) => JSON.parse(line).detail);
    assert.equal(tail.find((row) => row.name === "one").writes, 0);
    assert.equal(tail.find((row) => row.name === "two").reads, 0);
  } finally {
    release();
  }
  console.log(
    "Pipeline efficiency: Unicode relevance, fair allocation, budgets, privacy, expiry, actual usage, unknown usage and concurrent metric isolation passed",
  );
}
void run();
