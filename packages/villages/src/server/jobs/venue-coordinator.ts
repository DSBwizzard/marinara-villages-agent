import { bindActivationService, createActivationBinding } from "../adapters/engine/activation-scope.js";
import type { VenueCoordinatorService } from "./venue-coordinator-service.js";
import type { InterpretationSettings } from "../domain/rules/interpretation-policy.js";
import type { VenueOperation } from "../domain/models/operation-model.js";
export {
  VenueOperation,
  venueRefusal,
  operationSummary,
  outsideVenueOperation,
  venueSavedCheckpoint,
  venueOperationSignal,
  venueOperationId,
  venueRequestMetrics,
  assertVenueOwnership,
  venueOperationSnapshot,
  venueOperationInput,
  venueDebugContext,
} from "../adapters/operations/operation-context.js";
const coordinatorBinding = createActivationBinding<VenueCoordinatorService>(
  "Villages Scene coordinator is not configured.",
);
export function configureVenueCoordinator(service: VenueCoordinatorService): () => void {
  return coordinatorBinding.configure(bindActivationService(service));
}
export function hasVenueOperation(id: string): boolean {
  return coordinatorBinding.get().hasVenueOperation(id);
}
export function venueInterpretationSettings(): InterpretationSettings {
  return coordinatorBinding.get().venueInterpretationSettings();
}
export async function coordinatedOptionalCompletion<T>(
  fingerprint: string,
  work: (signal: AbortSignal) => Promise<T>,
): Promise<T | undefined> {
  return coordinatorBinding.get().coordinatedOptionalCompletion<T>(fingerprint, work);
}
export async function venueCheckpoint<T>(stage: string, work: () => Promise<T>): Promise<T> {
  return coordinatorBinding.get().venueCheckpoint<T>(stage, work);
}
export async function coordinatedCompletion<T>(
  fingerprint: string,
  work: (signal?: AbortSignal) => Promise<T>,
  legacyFingerprint?: string,
): Promise<T> {
  return coordinatorBinding.get().coordinatedCompletion<T>(fingerprint, work, legacyFingerprint);
}
export async function rejectVenueCompletion(): Promise<void> {
  return coordinatorBinding.get().rejectVenueCompletion();
}
export async function coordinateVenue<T>(
  sessionId: string,
  id: string,
  kind: string,
  input: Record<string, unknown>,
  expected: number | undefined,
  retryOfAttemptId: string | undefined,
  work: () => Promise<T>,
  options: { replay?: boolean; recovery?: boolean; replaceOfOperationId?: string } = {},
): Promise<T> {
  return coordinatorBinding
    .get()
    .coordinateVenue<T>(sessionId, id, kind, input, expected, retryOfAttemptId, work, options);
}
export async function cancelVenueOperation(id: string) {
  return coordinatorBinding.get().cancelVenueOperation(id);
}
export async function readVenueOperation(id: string, operationId?: string) {
  return coordinatorBinding.get().readVenueOperation(id, operationId);
}
export async function recoverVenueOperations(recover: (id: string, operation: VenueOperation) => Promise<unknown>) {
  return coordinatorBinding.get().recoverVenueOperations(recover);
}
export async function stopVenueCoordinator() {
  return coordinatorBinding.get().stopVenueCoordinator();
}
