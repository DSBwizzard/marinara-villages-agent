import { type DomainProcessing, EXCHANGE_DOMAINS, type ExchangeProcessing } from "../models/exchange-model.js";
import { asRecord, asTrimmedString } from "../rules/coerce.js";
import { coerceWorkFailure } from "../rules/work-failure.js";

export const EXCHANGE_PROCESSING_VERSION = 1;
/** References into the saved Scene, never a copy of village state. */

export const strings = (value: unknown): string[] =>
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
