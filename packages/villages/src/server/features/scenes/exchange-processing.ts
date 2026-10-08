import { pipelineSignal } from "../../adapters/observability/metrics-context.js";
import {
  type DomainProcessing,
  EXCHANGE_DOMAINS,
  type ExchangeDomain,
  type ExchangeHandler,
  type ExchangeProcessing,
} from "../../domain/models/exchange-model.js";
import { WorkFailureError } from "../../domain/rules/work-failure.js";

export type {
  ExchangeDomain,
  DomainProcessing,
  ExchangeProcessing,
  ExchangeHandler,
} from "../../domain/models/exchange-model.js";

/** Small ordered dispatcher. Domain writes own their receipts; this bookkeeping is replayable. No generation here. */
export async function dispatchExchange(
  processing: ExchangeProcessing,
  handlers: Partial<Record<ExchangeDomain, ExchangeHandler>>,
  save: (domain: ExchangeDomain, result: DomainProcessing) => Promise<void>,
): Promise<void> {
  const bookkeepingErrors: unknown[] = [];
  for (const domain of EXCHANGE_DOMAINS) {
    const handler = handlers[domain];
    const prior = processing.domains[domain];
    if (!handler) continue;
    if (prior.status === "applied" || prior.status === "rejected") {
      pipelineSignal("replayDomainsSkipped");
      continue;
    }
    const started = performance.now();
    let result: DomainProcessing;
    try {
      const applied = await handler();
      result = {
        ...prior,
        status: "applied",
        reason: "Saved evidence checked and application completed",
        failure: undefined,
        ...applied,
        attempts: prior.attempts + 1,
        updatedAt: new Date().toISOString(),
        elapsedMs: Math.round(performance.now() - started),
      };
    } catch (error) {
      result = {
        ...prior,
        status: "failed",
        reason: (error instanceof Error ? error.message : String(error)).slice(0, 500),
        failure:
          error instanceof WorkFailureError
            ? error.failure
            : { cause: "storage_application", stage: "application", message: String(error).slice(0, 500) },
        attempts: prior.attempts + 1,
        updatedAt: new Date().toISOString(),
        elapsedMs: Math.round(performance.now() - started),
      };
    }
    if (result.rejectedProposals) pipelineSignal("rejectedProposals", result.rejectedProposals.length);
    if (result.status === "rejected") pipelineSignal("rejectedDomains");
    try {
      await save(domain, result);
      processing.domains[domain] = result;
    } catch (error) {
      bookkeepingErrors.push(error);
    }
  }
  // Continue other domains even when one Scene bookkeeping write fails.
  if (bookkeepingErrors.length)
    throw new AggregateError(bookkeepingErrors, "Exchange status could not be saved; replay saved work");
}
