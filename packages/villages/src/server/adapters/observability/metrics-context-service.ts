import { AsyncLocalStorage } from "node:async_hooks";

export type Metrics = {
  reads: number;
  writes: number;
  requests: number;
  reportedInputTokens: number;
  reportedOutputTokens: number;
  unknownUsageRequests: number;
  failedRequests: number;
  modelLatencyMs: number;
  signals: Record<string, number>;
};

/** A nested activation cannot inherit another application's pipeline counters. */
export function createMetricsContext() {
  return new AsyncLocalStorage<Metrics>();
}
export type MetricsContext = ReturnType<typeof createMetricsContext>;
