import { bindActivationService, createActivationBinding } from "../adapters/engine/activation-scope.js";
import type { BackgroundWorkService } from "./background-service.js";
import type {
  BackgroundInput,
  BackgroundKind,
  BackgroundStatus,
  BackgroundSummary,
  Handler,
} from "../domain/models/background-model.js";
export type {
  BackgroundKind,
  BackgroundStatus,
  BackgroundSummary,
  Step,
  BackgroundInput,
  Job,
  Handler,
  Ticket,
} from "../domain/models/background-model.js";
export { retireBackgroundResident } from "./background-service.js";
const binding = createActivationBinding<BackgroundWorkService>("Villages background work is not configured.");
export function configureBackgroundWork(service: BackgroundWorkService): () => void {
  return binding.configure(bindActivationService(service));
}
export function registerBackgroundHandler(kind: BackgroundKind, handler: Handler): void {
  return binding.get().registerBackgroundHandler(kind, handler);
}
export async function backgroundStatus(
  kind: BackgroundKind,
  subjectId: string,
  expectedInputId?: string,
): Promise<BackgroundStatus | null> {
  return binding.get().backgroundStatus(kind, subjectId, expectedInputId);
}
export function hasVillagePresence(): boolean {
  return binding.get().hasVillagePresence();
}
export async function villageBackgroundPresence<T = void>(
  sessionId: string,
  visible: boolean,
  options: {
    beforeResume?: () => Promise<T>;
    afterResume?: () => Promise<void>;
    onVisible?: () => Promise<void>;
    onHidden?: () => Promise<void>;
  } = {},
): Promise<T | undefined> {
  return binding.get().villageBackgroundPresence<T>(sessionId, visible, options);
}
export function queueBackgroundJob(work: BackgroundInput): Promise<void> {
  return binding.get().queueBackgroundJob(work);
}
export function cancelReturnCatchup(batchId: string): Promise<void> {
  return binding.get().cancelReturnCatchup(batchId);
}
export async function retryBackgroundJob(id: string, expectedAttempt: number, actionId: string): Promise<void> {
  return binding.get().retryBackgroundJob(id, expectedAttempt, actionId);
}
export async function recoverBackgroundWork(): Promise<void> {
  return binding.get().recoverBackgroundWork();
}
export async function backgroundWorkSummaries(): Promise<BackgroundSummary[]> {
  return binding.get().backgroundWorkSummaries();
}
export function startBackgroundWork(options: { now?: () => number } = {}): () => void {
  return binding.get().startBackgroundWork(options);
}
export async function settleBackgroundWork(): Promise<void> {
  return binding.get().settleBackgroundWork();
}
export async function previewBackgroundJobs(_defaultBatchSize?: number) {
  return binding.get().previewBackgroundJobs(_defaultBatchSize);
}

/** Private server-only frozen inputs and response receipts for deliberate migration. */
export function backgroundJobSnapshot(kind: BackgroundKind, subjectId: string) {
  return binding.get().backgroundJobSnapshot(kind, subjectId);
}

export function backgroundLegacyFounding(subjectId: string, seed: string, revision: string) {
  return binding.get().backgroundLegacyFounding(subjectId, seed, revision);
}

export function retireLegacyFounding(...args: Parameters<BackgroundWorkService["retireLegacyFounding"]>) {
  return binding.get().retireLegacyFounding(...args);
}
