import { pipelineSignal } from "../../adapters/observability/metrics-context.js";
import {
  type DomainProcessing,
  EXCHANGE_DOMAINS,
  type ExchangeDomain,
  type ExchangeHandler,
  type ExchangeProcessing,
} from "../../domain/models/exchange-model.js";
import { asRecord, asTrimmedString } from "../../domain/rules/coerce.js";
import { coerceWorkFailure, WorkFailureError } from "../../domain/rules/work-failure.js";

export type {
  ExchangeDomain,
  DomainProcessing,
  ExchangeProcessing,
  ExchangeHandler,
} from "../../domain/models/exchange-model.js";

export const EXCHANGE_PROCESSING_VERSION = 1;

/** References into the saved Scene, never a copy of village state. */

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === "string" && !!id))] : [];

export function createExchangeProcessing(
  input: Omit<ExchangeProcessing, "version" | "interpretationVersion" | "domains">,
): ExchangeProcessing {
  return {
    ...input,
    version: EXCHANGE_PROCESSING_VERSION,
    interpretationVersion: 1,
    domains: Object.fromEntries(
      EXCHANGE_DOMAINS.map((domain) => [
        domain,
        {
          status: "pending",
          reason: "Saved exchange awaiting application",
          evidenceIds: [...input.lineIds],
          receiptIds: [],
          attempts: 0,
          updatedAt: "",
        },
      ]),
    ) as ExchangeProcessing["domains"],
  };
}

export function coerceExchangeProcessing(value: unknown): ExchangeProcessing | undefined {
  const raw = asRecord(value);
  if (raw.version !== 1 || !raw.seed || !raw.sceneId || !raw.submissionId) return undefined;
  const result = createExchangeProcessing({
    seed: asTrimmedString(raw.seed),
    sceneId: asTrimmedString(raw.sceneId),
    submissionId: asTrimmedString(raw.submissionId),
    order: Math.max(0, Math.floor(Number(raw.order) || 0)),
    lineIds: strings(raw.lineIds),
    actionReceiptIds: strings(raw.actionReceiptIds),
  });
  for (const domain of EXCHANGE_DOMAINS) {
    const row = asRecord(asRecord(raw.domains)[domain]);
    result.domains[domain] = {
      ...(Array.isArray(row.rejectedProposals)
        ? { rejectedProposals: row.rejectedProposals as DomainProcessing["rejectedProposals"] }
        : {}),
      ...(coerceWorkFailure(row.failure) ? { failure: coerceWorkFailure(row.failure) } : {}),
      status: row.status === "applied" || row.status === "rejected" || row.status === "failed" ? row.status : "pending",
      reason: asTrimmedString(row.reason).slice(0, 500),
      evidenceIds: strings(row.evidenceIds),
      receiptIds: strings(row.receiptIds),
      attempts: Math.max(0, Math.floor(Number(row.attempts) || 0)),
      updatedAt: asTrimmedString(row.updatedAt),
      ...(Number.isFinite(row.elapsedMs) ? { elapsedMs: Number(row.elapsedMs) } : {}),
    };
  }
  return result;
}

export function unfinishedExchange(processing: ExchangeProcessing): boolean {
  return EXCHANGE_DOMAINS.some((domain) => ["pending", "failed"].includes(processing.domains[domain].status));
}

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
