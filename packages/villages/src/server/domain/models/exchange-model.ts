import type { WorkFailure } from "../rules/work-failure.js";

export type ExchangeDomain = (typeof EXCHANGE_DOMAINS)[number];
export type DomainProcessing = {
  failure?: WorkFailure;
  rejectedProposals?: { kind: string; index: number; reason: string }[];
  status: "pending" | "applied" | "rejected" | "failed";
  reason: string;
  evidenceIds: string[];
  receiptIds: string[];
  attempts: number;
  updatedAt: string;
  elapsedMs?: number;
};
export type ExchangeProcessing = {
  version: 1;
  seed: string;
  sceneId: string;
  submissionId: string;
  order: number;
  lineIds: string[];
  actionReceiptIds: string[];
  interpretationVersion: 1;
  domains: Record<ExchangeDomain, DomainProcessing>;
};
export type ExchangeHandler = () => Promise<Partial<DomainProcessing> | void>;
export const EXCHANGE_DOMAINS = ["projects", "wishes", "memories", "relationships"] as const;
