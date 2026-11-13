import { bindActivationService, createActivationBinding } from "../engine/activation-scope.js";
import { type UsageLedger } from "./usage-ledger-service.js";
import type { UsagePurpose } from "../../domain/models/usage-model.js";
import { randomUUID } from "node:crypto";
const binding = createActivationBinding<UsageLedger>("Villages usage accounting is not configured.");
/** Recovery distinguishes earlier processes, including overlapping live activations of one store. */
export const usageProcessOwner = randomUUID();

function ledger(): UsageLedger {
  return binding.get();
}
export function configureUsageLedger(service: UsageLedger): () => void {
  return binding.configure(bindActivationService(service));
}
export function withUsagePurpose<T>(purpose: UsagePurpose, work: () => T): T {
  return ledger().withUsagePurpose(purpose, work);
}
export function inferredPurpose(): UsagePurpose {
  return ledger().inferredPurpose();
}
export function trackUsage<T>(
  meta: Parameters<UsageLedger["trackUsage"]>[0],
  work: (onLateResult: (result: T) => Promise<void>) => Promise<T>,
): Promise<T> {
  return ledger().trackUsage(meta, work);
}
export function readUsageLedger(details = true) {
  return ledger().readUsageLedger(details);
}
export function resetUsagePeriod() {
  return ledger().resetUsagePeriod();
}
export function saveUsageRate(connectionId: string, model: string, raw: unknown) {
  return ledger().saveUsageRate(connectionId, model, raw);
}
export function quoteUsageRate(connectionId: string, model: string) {
  return ledger().quoteUsageRate(connectionId, model);
}
export function saveLinkApiGroup(connectionId: string, group: unknown, model = "") {
  return ledger().saveLinkApiGroup(connectionId, group, model);
}
