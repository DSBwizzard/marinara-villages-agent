import { bindActivationService, createActivationBinding } from "../engine/activation-scope.js";
import { type RuntimeDebug } from "./runtime-debug-service.js";
import type { LoreInspection, LoreUse } from "../../../shared/contracts/lore.js";
export type { RuntimeDebugView } from "./runtime-debug-service.js";
const binding = createActivationBinding<RuntimeDebug>("Villages runtime diagnostics are not configured.");

function diagnostics(): RuntimeDebug {
  return binding.get();
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
export function readLoreInspections() {
  return diagnostics().readLoreInspections();
}
export async function rememberLoreInspection(report: LoreInspection): Promise<string | undefined> {
  try {
    return await diagnostics().rememberLoreInspection(report);
  } catch {
    return undefined;
  }
}
export async function recordLoreUse(lore: readonly LoreUse[] | undefined, purpose: string) {
  if (!lore?.length) return;
  try {
    await diagnostics().recordLoreUse(lore, purpose);
  } catch {
    // Diagnostic persistence must not discard a purchased response or authorize another request.
    runtimeDebug("lore activity unavailable", { purpose });
  }
}
export function readLoreActivity(summary = false) {
  return diagnostics().readLoreActivity(summary);
}
export async function readLoreScope() {
  try {
    return (await diagnostics().readLoreActivity(true)).scope;
  } catch {
    return undefined;
  }
}
export function readLoreTrigger(inspectionId: unknown, bookId: unknown, entryId: unknown, target?: unknown) {
  return diagnostics().readLoreTrigger(inspectionId, bookId, entryId, target);
}
/** Missing/disposed diagnostics must never replace an operation's result. */
export function runtimeDebug(event: string, detail: unknown): void {
  try {
    diagnostics().runtimeDebug(event, detail);
  } catch {
    /* Diagnostic output is best effort. */
  }
}
