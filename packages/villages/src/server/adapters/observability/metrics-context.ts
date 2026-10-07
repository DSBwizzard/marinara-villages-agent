import { activationScope, createActivationBinding } from "../engine/activation-scope.js";
import { createMetricsContext, type Metrics, type MetricsContext } from "./metrics-context-service.js";
export type { Metrics } from "./metrics-context-service.js";
const binding = createActivationBinding<MetricsContext>("Villages pipeline metrics are not configured.");
const standalone = createMetricsContext();
function selected(): MetricsContext | undefined {
  return activationScope() ? binding.maybe() : (binding.maybe() ?? standalone);
}
export function configureMetricsContext(context: MetricsContext): () => void {
  return binding.configure(context);
}
export const active = {
  getStore(): Metrics | undefined {
    return selected()?.getStore();
  },
  run<T>(store: Metrics, work: () => T): T {
    const owner = activationScope();
    const context = selected() ?? binding.get();
    return owner ? owner.run(() => context.run(store, work)) : context.run(store, work);
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
