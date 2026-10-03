import { previewBackgroundJobs } from "./background-work.js";
import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { villagesDocuments, VILLAGES_PACKAGE_ID, villagesLogger } from "./package-runtime.js";
import { villageEngineJson } from "./engine-loopback.js";
import { venueDebugContext } from "./venue-coordinator.js";
import { backgroundCalls } from "./background-context.js";
import { badRequest } from "./errors.js";

export type UsagePurpose = "conversation" | "checks" | "background" | "images" | "other";
export type UsageRate = {
  input: number;
  output: number;
  cached?: number;
  cacheWrite?: number;
  perRequest?: number;
  source: string;
  checkedAt: string;
};
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
};
type Totals = { requests: number; tokens: number; dollars: number; unknown: number };
type Ledger = {
  requests: UsageRequest[];
  since: string;
  periodId: string;
  all: Totals;
  period: Totals;
  days: Record<string, Totals>;
  purposes: Partial<Record<UsagePurpose, Totals>>;
  overrides: Record<string, UsageRate>;
};
const DOC = "villages-ai-usage";
const owner = randomUUID();
const purposeContext = new AsyncLocalStorage<UsagePurpose>();
let queue: Promise<unknown> = Promise.resolve();
let connections: { at: number; rows: Record<string, unknown>[] } | undefined;
let lastFailure = "";
const empty = (): Totals => ({ requests: 0, tokens: 0, dollars: 0, unknown: 0 });
function coerce(raw: unknown): Ledger {
  const data = raw && typeof raw === "object" ? (raw as Partial<Ledger>) : {};
  return {
    requests: data.requests ?? [],
    since: data.since ?? new Date().toISOString(),
    periodId: data.periodId ?? "initial",
    all: data.all ?? empty(),
    period: data.period ?? empty(),
    days: data.days ?? {},
    purposes: data.purposes ?? {},
    overrides: data.overrides ?? {},
  };
}
function day(at: string): string {
  const date = new Date(at);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}
/** Separate CAS accounting: late responses must remain countable after Scene ownership ends. */
async function write(mutate: (ledger: Ledger) => void): Promise<void> {
  const task = queue.then(async () => {
    const store = villagesDocuments();
    for (let attempt = 0; attempt < 12; attempt++) {
      const row = await store.getById(VILLAGES_PACKAGE_ID, DOC);
      const data = coerce(structuredClone(row?.data));
      mutate(data);
      const completed = data.requests.filter((r) => r.status !== "running").slice(-200);
      data.requests = [...completed, ...data.requests.filter((r) => r.status === "running")];
      const stamp = new Date().toISOString();
      if (row) {
        const saved = await store.update({
          id: DOC,
          packageId: VILLAGES_PACKAGE_ID,
          expectedRevision: row.revision,
          name: "Villages AI usage",
          description: "Request accounting without conversation text",
          data,
          updatedAt: stamp,
        });
        if (saved) return;
      } else {
        try {
          await store.create({
            id: DOC,
            packageId: VILLAGES_PACKAGE_ID,
            kind: "settings",
            name: "Villages AI usage",
            description: "Request accounting without conversation text",
            data,
            createdAt: stamp,
            updatedAt: stamp,
          });
          return;
        } catch (error) {
          if (!(await store.getById(VILLAGES_PACKAGE_ID, DOC))) throw error;
        }
      }
    }
    throw new Error("Usage accounting could not be saved.");
  });
  queue = task.catch(() => {});
  await task;
}
function tally(ledger: Ledger, request: UsageRequest, start: boolean) {
  const buckets = [ledger.all, (ledger.days[day(request.startedAt)] ??= empty())];
  if ((request.periodId ?? "initial") === ledger.periodId) {
    buckets.push(ledger.period, (ledger.purposes[request.purpose] ??= empty()));
  }
  for (const total of buckets) {
    if (start) total.requests++;
    else {
      total.tokens +=
        request.usage?.totalTokens ?? (request.usage?.promptTokens ?? 0) + (request.usage?.completionTokens ?? 0);
      total.dollars += request.dollars ?? 0;
      if (request.dollars === null) total.unknown++;
    }
  }
}
export function withUsagePurpose<T>(purpose: UsagePurpose, work: () => T): T {
  return purposeContext.run(purpose, work);
}
export function inferredPurpose(): UsagePurpose {
  const stage = String(venueDebugContext().stage ?? "");
  return (
    purposeContext.getStore() ??
    (backgroundCalls.getStore()
      ? "background"
      : /interpretation|verdict|judgment|comparison/u.test(stage)
        ? "checks"
        : /reply|response/u.test(stage)
          ? "conversation"
          : "other")
  );
}
const checkedAt = "2026-10-02";
const catalog: Record<string, UsageRate> = {
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
async function identity(connectionId: string, model: string) {
  if (!connections || Date.now() - connections.at > 30_000) {
    try {
      const listed = await villageEngineJson<unknown>("/api/connections");
      connections = {
        at: Date.now(),
        rows: Array.isArray(listed)
          ? listed.map((raw) => {
              const row = raw as Record<string, unknown>;
              return { id: row.id, provider: row.provider, model: row.model, baseUrl: row.baseUrl };
            })
          : [],
      };
    } catch {
      connections = { at: Date.now(), rows: [] };
    }
  }
  const row = connections.rows.find((row) => row.id === connectionId);
  return {
    provider: String(row?.provider ?? ""),
    model: model || String(row?.model ?? ""),
    baseUrl: String(row?.baseUrl ?? ""),
  };
}
export function usageDollars(
  usage: Record<string, number> | undefined,
  rate: UsageRate | null,
  provider: string,
): number | null {
  if (!rate) return null;
  if (rate.perRequest !== undefined) return rate.perRequest;
  if (!usage || !Number.isFinite(usage.promptTokens) || !Number.isFinite(usage.completionTokens)) return null;
  const read = usage.cachedPromptTokens ?? 0,
    write = usage.cacheWritePromptTokens ?? 0;
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
export async function trackUsage<T>(
  meta: { connectionId?: string; model?: string; purpose?: UsagePurpose; stage?: string },
  work: () => Promise<T>,
): Promise<T> {
  const id = randomUUID(),
    connectionId = meta.connectionId ?? "";
  let request: UsageRequest | undefined;
  try {
    const info = await identity(connectionId, meta.model ?? "");
    const ledger = coerce((await villagesDocuments().getById(VILLAGES_PACKAGE_ID, DOC))?.data);
    request = {
      id,
      owner,
      connectionId,
      model: info.model,
      provider: info.provider,
      purpose: meta.purpose ?? inferredPurpose(),
      jobId: backgroundCalls.getStore()?.metadata?.id,
      cause: backgroundCalls.getStore()?.metadata?.cause,
      stage: (
        meta.stage ??
        backgroundCalls.getStore()?.metadata?.kind ??
        String(venueDebugContext().stage ?? "")
      ).slice(0, 160),
      startedAt: new Date().toISOString(),
      status: "running",
      rate: ledger.overrides[connectionId + ":" + info.model] ?? catalogRate(info.provider, info.model, info.baseUrl),
      dollars: null,
    };
    await write((ledger) => {
      request!.periodId = ledger.periodId;
      ledger.requests.push(request!);
      tally(ledger, request!, true);
    });
  } catch (error) {
    lastFailure = "Usage accounting is incomplete";
    villagesLogger().warn("[villages] usage recording failed: %s", String(error));
  }
  try {
    const result = await work();
    if (request) {
      const raw = (result as { usage?: Record<string, unknown> } | null)?.usage;
      const usage = raw
        ? (Object.fromEntries(
            Object.entries(raw).filter(([, n]) => typeof n === "number" && Number.isFinite(n) && n >= 0),
          ) as Record<string, number>)
        : undefined;
      if (usage && request.provider === "anthropic") {
        const cache = (usage.cachedPromptTokens ?? 0) + (usage.cacheWritePromptTokens ?? 0);
        if (usage.promptTokens !== undefined) usage.promptTokens += cache;
        if (usage.totalTokens !== undefined) usage.totalTokens += cache;
      }
      await finish(request, "complete", usage).catch(() => {
        lastFailure = "Usage accounting is incomplete";
      });
    }
    return result;
  } catch (error) {
    if (request)
      await finish(request, "unknown").catch(() => {
        lastFailure = "Usage accounting is incomplete";
      });
    throw error;
  }
}
async function finish(request: UsageRequest, status: UsageRequest["status"], usage?: Record<string, number>) {
  await write((ledger) => {
    const saved = ledger.requests.find((r) => r.id === request.id);
    if (!saved || saved.status !== "running") return;
    Object.assign(saved, {
      status,
      usage,
      finishedAt: new Date().toISOString(),
      dollars: status === "complete" ? usageDollars(usage, saved.rate, saved.provider) : null,
    });
    tally(ledger, saved, false);
  });
}
export async function readUsageMeter(details = true) {
  await queue;
  const ledger = coerce((await villagesDocuments().getById(VILLAGES_PACKAGE_ID, DOC))?.data);
  const abandoned = ledger.requests.filter((r) => r.status === "running" && r.owner !== owner);
  if (abandoned.length) {
    await write((data) => {
      for (const old of abandoned) {
        const saved = data.requests.find((r) => r.id === old.id && r.status === "running");
        if (saved) {
          saved.status = "unknown";
          saved.interrupted = true;
          saved.finishedAt = new Date().toISOString();
          tally(data, saved, false);
        }
      }
    });
    return readUsageMeter(details);
  }
  return {
    since: ledger.since,
    totals: ledger.period,
    today: ledger.days[day(new Date().toISOString())] ?? empty(),
    purposes: ledger.purposes,
    running: ledger.requests.filter((r) => r.status === "running").length,
    requests: details ? ledger.requests.slice().reverse() : [],
    bursts: details
      ? (await previewBackgroundJobs())
          .filter((job) => !["completed", "obsolete"].includes(job.status))
          .map(({ id, kind, label, status, cause, remainingRequests, remainingBlocks }) => ({
            id,
            kind,
            label,
            status,
            cause,
            remainingRequests,
            remainingBlocks,
          }))
      : [],
    overrides: details ? ledger.overrides : {},
    catalog: details ? catalog : {},
    error: lastFailure,
    scope: "Villages requests only; Engine chats and provider-internal retries/fallbacks may add costs.",
  };
}
export async function resetUsagePeriod() {
  await write((ledger) => {
    ledger.since = new Date().toISOString();
    ledger.periodId = randomUUID();
    ledger.period = empty();
    ledger.purposes = {};
  });
  return readUsageMeter();
}
export async function saveUsageRate(connectionId: string, model: string, raw: unknown) {
  if (!connectionId || connectionId.length > 128 || !model || model.length > 160)
    throw badRequest("Choose a connection and model.");
  const value = raw as Partial<UsageRate> | null;
  const rate =
    value === null
      ? null
      : {
          input: value?.input,
          output: value?.output,
          cached: value?.cached,
          cacheWrite: value?.cacheWrite,
          perRequest: value?.perRequest,
          source: "Manual override",
          checkedAt: new Date().toISOString(),
        };
  if (
    rate &&
    (typeof rate.input !== "number" ||
      typeof rate.output !== "number" ||
      Object.values(rate).some((n) => typeof n === "number" && (!Number.isFinite(n) || n < 0 || n > 1_000_000)))
  )
    throw badRequest("Rates must be nonnegative finite USD amounts.");
  await write((ledger) => {
    const key = connectionId + ":" + model;
    if (rate) ledger.overrides[key] = rate as UsageRate;
    else delete ledger.overrides[key];
  });
  return readUsageMeter();
}

/** Preview the same rate snapshot policy without recording or dispatching a request. */
export async function quoteUsageRate(connectionId: string, model: string) {
  const info = await identity(connectionId, model);
  const ledger = coerce((await villagesDocuments().getById(VILLAGES_PACKAGE_ID, DOC))?.data);
  return {
    ...info,
    rate: ledger.overrides[connectionId + ":" + info.model] ?? catalogRate(info.provider, info.model, info.baseUrl),
  };
}
