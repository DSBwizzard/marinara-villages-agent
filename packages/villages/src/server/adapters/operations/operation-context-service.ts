import type { VenueOperation } from "../../domain/models/operation-model.js";
import { VillagesRequestError } from "../../domain/rules/errors.js";
import type { CapabilityRuntimeLogger } from "@marinara-engine/shared";
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
/** Scene authority belongs to its application, including nested asynchronous work. */
export function createVenueOperationContext(villagesLogger: () => CapabilityRuntimeLogger) {
  const context = new AsyncLocalStorage<Context>();
  function venueRefusal(code: string, message: string): VillagesRequestError {
    villagesLogger().debug("[villages] scene refusal code=%s", code);
    return new VillagesRequestError(409, message, code);
  }

  function outsideVenueOperation<T>(work: () => T): T {
    return context.exit(work);
  }
  function venueSavedCheckpoint<T>(stage: string): T | undefined {
    return context.getStore()?.operation.checkpoints[stage] as T | undefined;
  }
  function venueOperationSignal(): AbortSignal | undefined {
    return context.getStore()?.controller.signal;
  }
  function venueOperationId(): string {
    return context.getStore()?.operation.id ?? "uncoordinated";
  }
  function venueRequestMetrics(operation = context.getStore()?.operation) {
    if (!operation) return null;
    return Object.entries(operation.attempts).map(([stage, attempt]) => ({
      stage,
      status: attempt.status,
      elapsedMs: attempt.elapsedMs,
      usage: (attempt.result as { usage?: unknown } | undefined)?.usage ?? null,
    }));
  }
  function assertVenueOwnership(data?: Record<string, unknown>): void {
    const current = context.getStore();
    if (!current) return;
    current.controller.signal.throwIfAborted();
    if (data && (data.operation as VenueOperation | undefined)?.token !== current.operation.token)
      throw venueRefusal("OPERATION_INTERRUPTED", "This Scene operation no longer owns the Scene.");
  }
  function venueOperationSnapshot<T>(): T | undefined {
    return context.getStore()?.operation.snapshot as T | undefined;
  }
  function venueOperationInput(): Record<string, unknown> | undefined {
    return context.getStore()?.operation.input;
  }
  function venueDebugContext(): Record<string, unknown> {
    const current = context.getStore();
    return current
      ? { operationId: current.operation.id, stage: current.scope, attemptId: current.operation.attemptId }
      : {};
  }

  return {
    context,
    venueRefusal,
    outsideVenueOperation,
    venueSavedCheckpoint,
    venueOperationSignal,
    venueOperationId,
    venueRequestMetrics,
    assertVenueOwnership,
    venueOperationSnapshot,
    venueOperationInput,
    venueDebugContext,
  };
}
export type VenueOperationContext = ReturnType<typeof createVenueOperationContext>;
