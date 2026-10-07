import { activationScope, bindActivationService, createActivationBinding } from "../engine/activation-scope.js";
import { villagesLogger } from "../engine/runtime-host.js";
import { createVenueOperationContext, type Context, type VenueOperationContext } from "./operation-context-service.js";
import type { VenueOperation } from "../../domain/models/operation-model.js";
import type { VillagesRequestError } from "../../domain/rules/errors.js";
export type { Context, VenueOperation, VenueOperationContext } from "./operation-context-service.js";
export { operationSummary } from "./operation-context-service.js";
const binding = createActivationBinding<VenueOperationContext>("Villages Scene operation context is not configured.");
const standalone = createVenueOperationContext(villagesLogger);
function operations(): VenueOperationContext {
  if (activationScope()) return binding.get();
  return binding.maybe() ?? standalone;
}
export function configureVenueOperationContext(service: VenueOperationContext): () => void {
  return binding.configure(bindActivationService(service));
}
/** Existing callers use the selected owner's context; no process-wide Scene authority. */
export const context = {
  getStore(): Context | undefined {
    return operations().context.getStore();
  },
  run<T>(store: Context, work: () => T): T {
    return operations().context.run(store, work);
  },
  exit<T>(work: () => T): T {
    return operations().context.exit(work);
  },
};
export function venueRefusal(code: string, message: string): VillagesRequestError {
  return operations().venueRefusal(code, message);
}
export function outsideVenueOperation<T>(work: () => T): T {
  return operations().outsideVenueOperation<T>(work);
}
export function venueSavedCheckpoint<T>(stage: string): T | undefined {
  return operations().venueSavedCheckpoint<T>(stage);
}
export function venueOperationSignal(): AbortSignal | undefined {
  return operations().venueOperationSignal();
}
export function venueOperationId(): string {
  return operations().venueOperationId();
}
export function venueRequestMetrics(operation = context.getStore()?.operation) {
  return operations().venueRequestMetrics(operation);
}
export function assertVenueOwnership(data?: Record<string, unknown>): void {
  return operations().assertVenueOwnership(data);
}
export function venueOperationSnapshot<T>(): T | undefined {
  return operations().venueOperationSnapshot<T>();
}
export function venueOperationInput(): Record<string, unknown> | undefined {
  return operations().venueOperationInput();
}
export function venueDebugContext(): Record<string, unknown> {
  return operations().venueDebugContext();
}
