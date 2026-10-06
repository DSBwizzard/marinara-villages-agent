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
export const active = new AsyncLocalStorage<Metrics>();
export function pipelineSignal(name: string, count = 1) {
  const metrics = active.getStore();
  if (metrics) metrics.signals[name] = (metrics.signals[name] ?? 0) + count;
}
export function pipelineStorage(kind: "reads" | "writes") {
  const metrics = active.getStore();
  if (metrics) metrics[kind]++;
}
