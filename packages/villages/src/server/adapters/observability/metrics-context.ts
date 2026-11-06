import { createActivationBinding } from "../engine/activation-scope.js";
import { type Metrics, type MetricsContext } from "./metrics-context-service.js";
export type { Metrics } from "./metrics-context-service.js";
const binding = createActivationBinding<MetricsContext>("Villages pipeline metrics are not configured.");

function selected(): MetricsContext | undefined {
  return binding.maybe();
}
export function configureMetricsContext(context: MetricsContext): () => void {
  return binding.configure(context);
}
export const active = {
  getStore(): Metrics | undefined {
    return selected()?.getStore();
  },
  run<T>(store: Metrics, work: () => T): T {
    return binding.get().run(store, work);
  },
};
export function pipelineSignal(name: string, count = 1) {
  const metrics = active.getStore();
  if (metrics) metrics.signals[name] = (metrics.signals[name] ?? 0) + count;
}
export function pipelineStorage(kind: "reads" | "writes") {
  const metrics = active.getStore();
  if (metrics) metrics[kind]++;
}
