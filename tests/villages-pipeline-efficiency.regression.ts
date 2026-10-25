import assert from "node:assert/strict";
import {
  measurePipeline,
  measureModel,
} from "../packages/villages/src/server/adapters/observability/pipeline-metrics.js";
import {
  pipelineSignal,
  pipelineStorage,
} from "../packages/villages/src/server/adapters/observability/metrics-context.js";

import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
async function run() {
  const logs: string[] = [];
  const release = configureVillagesRuntime({
    persistence: { documents: { getById: async () => null, list: async () => [] } },
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
  console.log("Pipeline efficiency: actual usage, unknown usage and concurrent metric isolation passed");
}
void run();
