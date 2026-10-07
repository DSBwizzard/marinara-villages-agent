import type { Ledger, Totals, UsageRate, UsageRequest } from "../../domain/models/usage-model.js";
export const DOC = "villages-ai-usage";

export const empty = (): Totals => ({
  requests: 0,
  unknownTokens: 0,
  tokens: 0,
  dollars: 0,
  usd: 0,
  yuan: 0,
  unknown: 0,
});

const totals = (raw?: Partial<Totals>): Totals => ({ ...empty(), ...raw, usd: raw?.usd ?? raw?.dollars ?? 0 });

export function coerce(raw: unknown): Ledger {
  const data = raw && typeof raw === "object" ? (raw as Partial<Ledger>) : {};
  return {
    requests: data.requests ?? [],
    since: data.since ?? new Date().toISOString(),
    periodId: data.periodId ?? "initial",
    all: totals(data.all),
    period: totals(data.period),
    days: Object.fromEntries(Object.entries(data.days ?? {}).map(([key, value]) => [key, totals(value)])),
    purposes: Object.fromEntries(Object.entries(data.purposes ?? {}).map(([key, value]) => [key, totals(value)])),
    overrides: data.overrides ?? {},
    linkApiGroups: data.linkApiGroups ?? {},
  };
}

export function day(at: string): string {
  const date = new Date(at);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function tally(ledger: Ledger, request: UsageRequest, start: boolean) {
  const buckets = [ledger.all, (ledger.days[day(request.startedAt)] ??= empty())];
  if ((request.periodId ?? "initial") === ledger.periodId) {
    buckets.push(ledger.period, (ledger.purposes[request.purpose] ??= empty()));
  }
  for (const total of buckets) {
    if (start) total.requests++;
    else {
      if (
        request.usage?.totalTokens === undefined &&
        (request.usage?.promptTokens === undefined || request.usage?.completionTokens === undefined)
      )
        total.unknownTokens++;
      total.tokens +=
        request.usage?.totalTokens ?? (request.usage?.promptTokens ?? 0) + (request.usage?.completionTokens ?? 0);
      total.dollars += request.dollars ?? 0;
      total.yuan += request.yuan ?? 0;
      if (request.rate?.currency !== "CNY") total.usd += request.dollars ?? 0;
      if (request.dollars === null && request.yuan == null) total.unknown++;
    }
  }
}

const checkedAt = "2026-10-02";

export const catalog: Record<string, UsageRate> = {
  "openai:gpt-5-mini": {
    input: 0.25,
    output: 2,
    cached: 0.025,
    source: "https://developers.openai.com/api/docs/models/gpt-5-mini",
    checkedAt,
  },
  "google:gemini-2.5-flash-lite": {
    input: 0.1,
    output: 0.4,
    cached: 0.01,
    source: "https://ai.google.dev/gemini-api/docs/pricing",
    checkedAt,
  },
  "anthropic:claude-haiku-4-5": {
    input: 1,
    output: 5,
    cached: 0.1,
    cacheWrite: 1.25,
    source: "https://platform.claude.com/docs/en/about-claude/pricing",
    checkedAt,
  },
  "anthropic:claude-sonnet-4-5": {
    input: 3,
    output: 15,
    cached: 0.3,
    cacheWrite: 3.75,
    source: "https://platform.claude.com/docs/en/about-claude/pricing",
    checkedAt,
  },
  "anthropic:claude-sonnet-5-5": {
    input: 2,
    output: 10,
    cached: 0.2,
    cacheWrite: 2.5,
    source: "https://platform.claude.com/docs/en/about-claude/pricing",
    checkedAt,
  },
  "anthropic:claude-opus-5-5": {
    input: 4,
    output: 20,
    cached: 0.2,
    cacheWrite: 5,
    source: "https://platform.claude.com/docs/en/about-claude/pricing",
    checkedAt,
  },
};

export function catalogRate(provider: string, model: string, baseUrl = ""): UsageRate | null {
  // Proxies, subscriptions and custom endpoints require their own rates.
  const domains: Record<string, string> = {
    openai: "api.openai.com",
    anthropic: "api.anthropic.com",
    google: "generativelanguage.googleapis.com",
  };
  if (baseUrl) {
    try {
      if (new URL(baseUrl).hostname !== domains[provider]) return null;
    } catch {
      return null;
    }
  }
  const name = model.replace(/-\d{8}$/u, "");
  return catalog[provider + ":" + name] ?? null;
}

export function usageNativeCost(
  usage: Record<string, number> | undefined,
  rate: UsageRate | null,
  provider: string,
): number | null {
  if (!rate) return null;
  if (rate.perRequest !== undefined) return rate.perRequest;
  if (!usage || !Number.isFinite(usage.promptTokens) || !Number.isFinite(usage.completionTokens)) return null;
  const read = usage.cachedPromptTokens ?? 0,
    write = usage.cacheWritePromptTokens ?? 0;
  if (rate.longContext && usage.promptTokens > rate.longContext.above) rate = { ...rate, ...rate.longContext };
  // The Engine's cache-write total does not expose the provider's TTL split.
  if (write && rate.cacheWriteOneHour !== undefined && rate.cacheWriteOneHour !== rate.cacheWrite) return null;
  if ((read && rate.cached === undefined) || (write && rate.cacheWrite === undefined)) return null;
  // Recorded Anthropic usage is normalized to include cache tokens; OpenAI output already includes reasoning.
  const output = usage.completionTokens + (provider === "google" ? (usage.completionReasoningTokens ?? 0) : 0);
  return (
    (Math.max(0, usage.promptTokens - read - write) * rate.input +
      read * (rate.cached ?? 0) +
      write * (rate.cacheWrite ?? 0) +
      output * rate.output) /
    1_000_000
  );
}

export function usageDollars(usage: Record<string, number> | undefined, rate: UsageRate | null, provider: string) {
  const cost = usageNativeCost(usage, rate, provider);
  if (cost === null) return null;
  if (rate?.currency !== "CNY") return cost;
  return rate.yuanPerDollar ? cost / rate.yuanPerDollar : null;
}
