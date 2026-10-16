import { activationScope, bindActivationService, createActivationBinding } from "../engine/activation-scope.js";
import { villagesDocuments, villagesLogger } from "../engine/runtime-host.js";
import { villageEngineJson } from "../engine/engine-transport.js";
import { backgroundCalls } from "../operations/background-context.js";
import { venueDebugContext } from "../operations/operation-context.js";
import { linkApiQuote, readExchangeRate } from "./linkapi-pricing.js";
import { createUsageLedger, type UsageLedger } from "./usage-ledger-service.js";
import type { UsagePurpose } from "../../domain/models/usage-model.js";
import { randomUUID } from "node:crypto";
const binding = createActivationBinding<UsageLedger>("Villages usage accounting is not configured.");
/** Recovery distinguishes earlier processes, including overlapping live activations of one store. */
export const usageProcessOwner = randomUUID();
const standalone = createUsageLedger({
  owner: usageProcessOwner,
  villagesDocuments,
  villagesLogger,
  villageEngineJson,
  backgroundCalls,
  venueDebugContext,
  linkApiQuote,
  readExchangeRate,
});
function ledger(): UsageLedger {
  if (activationScope()) return binding.get();
  return binding.maybe() ?? standalone;
}
export function configureUsageLedger(service: UsageLedger): () => void {
  return binding.configure(bindActivationService(service));
}
export function withUsagePurpose<T>(purpose: UsagePurpose, work: () => T): T {
  const owner = activationScope(),
    service = ledger();
  return owner ? owner.run(() => service.withUsagePurpose(purpose, work)) : service.withUsagePurpose(purpose, work);
}
export function inferredPurpose(): UsagePurpose {
  return ledger().inferredPurpose();
}
export function trackUsage<T>(meta: Parameters<UsageLedger["trackUsage"]>[0], work: () => Promise<T>): Promise<T> {
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
