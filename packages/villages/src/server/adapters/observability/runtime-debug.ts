import { activationScope, bindActivationService, createActivationBinding } from "../engine/activation-scope.js";
import { villagesDebugAgentsEnabled, villagesDocuments, villagesLogger } from "../engine/runtime-host.js";
import { venueDebugContext } from "../operations/operation-context.js";
import { mutateDocument } from "../storage/document-store.js";
import { createRuntimeDebug, type RuntimeDebug } from "./runtime-debug-service.js";
export type { RuntimeDebugView } from "./runtime-debug-service.js";
const binding = createActivationBinding<RuntimeDebug>("Villages runtime diagnostics are not configured.");
const standalone = createRuntimeDebug({
  villagesDebugAgentsEnabled,
  villagesDocuments,
  villagesLogger,
  venueDebugContext,
  mutateDocument,
});
function diagnostics(): RuntimeDebug {
  if (activationScope()) return binding.get();
  return binding.maybe() ?? standalone;
}
export function configureRuntimeDebug(service: RuntimeDebug): () => void {
  return binding.configure(bindActivationService(service));
}
export function resetRuntimeDebug(): void {
  diagnostics().resetRuntimeDebug();
}
export function readRuntimeDebug() {
  return diagnostics().readRuntimeDebug();
}
export function saveRuntimeDebug(value: unknown, meter?: unknown) {
  return diagnostics().saveRuntimeDebug(value, meter);
}
/** Missing/disposed diagnostics must never replace an operation's result. */
export function runtimeDebug(event: string, detail: unknown): void {
  try {
    diagnostics().runtimeDebug(event, detail);
  } catch {
    /* Diagnostic output is best effort. */
  }
}
