import type { ProviderRate } from "../rules/linkapi-pricing.js";

export type UsagePurpose = "conversation" | "checks" | "background" | "images" | "other";
export type UsageRate = ProviderRate & { yuanPerDollar?: number };
export type UsageRequest = {
  periodId?: string;
  id: string;
  owner: string;
  connectionId: string;
  model: string;
  provider: string;
  purpose: UsagePurpose;
  stage: string;
  jobId?: string;
  cause?: string;
  interrupted?: boolean;
  startedAt: string;
  finishedAt?: string;
  status: "running" | "complete" | "unknown";
  usage?: Record<string, number>;
  rate: UsageRate | null;
  dollars: number | null;
  yuan?: number | null;
  priceNote?: string;
};
export type Totals = {
  requests: number;
  unknownTokens: number;
  tokens: number;
  dollars: number;
  usd: number;
  yuan: number;
  unknown: number;
};
export type Ledger = {
  requests: UsageRequest[];
  since: string;
  periodId: string;
  all: Totals;
  period: Totals;
  days: Record<string, Totals>;
  purposes: Partial<Record<UsagePurpose, Totals>>;
  overrides: Record<string, UsageRate>;
  linkApiGroups: Record<string, string>;
};
