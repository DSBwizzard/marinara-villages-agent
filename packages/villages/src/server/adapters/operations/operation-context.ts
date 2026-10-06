import type { VenueOperation } from "../../domain/models/operation-model.js";
import { VillagesRequestError } from "../../domain/rules/errors.js";
import { villagesLogger } from "../engine/runtime-host.js";
import { AsyncLocalStorage } from "node:async_hooks";

export type { VenueOperation } from "../../domain/models/operation-model.js";

export type Context = {
  decisionRemainingMs?: number;
  sessionId: string;
  operation: VenueOperation;
  controller: AbortController;
  allowPaid: boolean;
  scope: string;
  counts: Map<string, number>;
  usedAttemptKeys: Map<string, string>;
  blocked: Set<string>;
};
export const context = new AsyncLocalStorage<Context>();
export function venueRefusal(code: string, message: string): VillagesRequestError {
  villagesLogger().debug("[villages] scene refusal code=%s", code);
  return new VillagesRequestError(409, message, code);
}
export function operationSummary(operation?: VenueOperation) {
  if (!operation || (operation.status === "complete" && !operation.error)) return null;
  return {
    id: operation.id,
    kind: operation.kind,
    attemptId: operation.attemptId,
    status: operation.status,
    stage: operation.stage,
    error: operation.error,
  };
}
export function outsideVenueOperation<T>(work: () => T): T {
  return context.exit(work);
}
export function venueSavedCheckpoint<T>(stage: string): T | undefined {
  return context.getStore()?.operation.checkpoints[stage] as T | undefined;
}
export function venueOperationSignal(): AbortSignal | undefined {
  return context.getStore()?.controller.signal;
}
export function venueOperationId(): string {
  return context.getStore()?.operation.id ?? "uncoordinated";
}
export function venueRequestMetrics(operation = context.getStore()?.operation) {
  if (!operation) return null;
  return Object.entries(operation.attempts).map(([stage, attempt]) => ({
    stage,
    status: attempt.status,
    elapsedMs: attempt.elapsedMs,
    usage: (attempt.result as { usage?: unknown } | undefined)?.usage ?? null,
  }));
}
export function assertVenueOwnership(data?: Record<string, unknown>): void {
  const current = context.getStore();
  if (!current) return;
  current.controller.signal.throwIfAborted();
  if (data && (data.operation as VenueOperation | undefined)?.token !== current.operation.token)
    throw venueRefusal("OPERATION_INTERRUPTED", "This Scene operation no longer owns the Scene.");
}
export function venueOperationSnapshot<T>(): T | undefined {
  return context.getStore()?.operation.snapshot as T | undefined;
}
export function venueOperationInput(): Record<string, unknown> | undefined {
  return context.getStore()?.operation.input;
}
export function venueDebugContext(): Record<string, unknown> {
  const current = context.getStore();
  return current
    ? { operationId: current.operation.id, stage: current.scope, attemptId: current.operation.attemptId }
    : {};
}
