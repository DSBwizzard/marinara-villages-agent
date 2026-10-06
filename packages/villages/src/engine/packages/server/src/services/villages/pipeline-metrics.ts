import { active, type Metrics } from "./metrics-context.js";
import { runtimeDebug } from "./runtime-debug.js";

export { pipelineSignal, pipelineStorage } from "./metrics-context.js";

export async function measurePipeline<T>(
  name: string,
  tags: Record<string, unknown>,
  run: () => Promise<T>,
): Promise<T> {
  const metrics: Metrics = {
      reads: 0,
      writes: 0,
      requests: 0,
      reportedInputTokens: 0,
      reportedOutputTokens: 0,
      unknownUsageRequests: 0,
      failedRequests: 0,
      modelLatencyMs: 0,
      signals: {},
    },
    start = performance.now();
  return active.run(metrics, async () => {
    try {
      return await run();
    } finally {
      runtimeDebug("pipeline measurement", {
        name,
        ...tags,
        ...metrics,
        elapsedMs: Math.round(performance.now() - start),
        providerUsage: !metrics.requests ? "no requests" : metrics.unknownUsageRequests ? "unknown" : "reported",
      });
    }
  });
}
export async function measureModel<T extends { usage?: { promptTokens?: number; completionTokens?: number } }>(
  run: () => Promise<T>,
): Promise<T> {
  if (!active.getStore()) return measurePipeline("model request", {}, () => measureModel(run));
  const metrics = active.getStore(),
    start = performance.now();
  if (metrics) metrics.requests++;
  try {
    const completion = await run();
    if (metrics) {
      const usage = completion.usage;
      if (Number.isFinite(usage?.promptTokens) && Number.isFinite(usage?.completionTokens)) {
        metrics.reportedInputTokens += usage!.promptTokens!;
        metrics.reportedOutputTokens += usage!.completionTokens!;
      } else metrics.unknownUsageRequests++;
    }
    return completion;
  } catch (error) {
    if (metrics) {
      metrics.failedRequests++;
      metrics.unknownUsageRequests++;
    }
    throw error;
  } finally {
    if (metrics) metrics.modelLatencyMs += Math.round(performance.now() - start);
  }
}
