import type { Ledger, UsagePurpose, UsageRate, UsageRequest } from "../../domain/models/usage-model.js";
import { badRequest } from "../../domain/rules/errors.js";
import { isLinkApi } from "../../domain/rules/linkapi-pricing.js";
import type { villageEngineJson } from "../engine/engine-transport.js";
import { VILLAGES_PACKAGE_ID } from "../engine/runtime-host.js";
import type { villagesDocuments, villagesLogger } from "../engine/runtime-host.js";
import type { backgroundCalls } from "../operations/background-context.js";
import type { venueDebugContext } from "../operations/operation-context.js";
import type { linkApiQuote, readExchangeRate } from "./linkapi-pricing.js";
import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

import {
  empty,
  coerce,
  day,
  tally,
  catalogRate,
  usageNativeCost,
  usageDollars,
  catalog,
  DOC,
} from "./usage-accounting.js";
export type UsageLedgerPorts = {
  owner: string;
  villagesDocuments: typeof villagesDocuments;
  villagesLogger: typeof villagesLogger;
  villageEngineJson: typeof villageEngineJson;
  backgroundCalls: typeof backgroundCalls;
  venueDebugContext: typeof venueDebugContext;
  linkApiQuote: typeof linkApiQuote;
  readExchangeRate: typeof readExchangeRate;
};
/** Queue, purpose context and connection cache belong to one activation. */
export function createUsageLedger(ports: UsageLedgerPorts) {
  const {
    villagesDocuments,
    villagesLogger,
    villageEngineJson,
    backgroundCalls,
    venueDebugContext,
    linkApiQuote,
    readExchangeRate,
  } = ports;
  const owner = ports.owner;

  const purposeContext = new AsyncLocalStorage<UsagePurpose>();

  let queue: Promise<unknown> = Promise.resolve();

  let connections: { at: number; rows: Record<string, unknown>[] } | undefined;

  let lastFailure = "";

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

  function withUsagePurpose<T>(purpose: UsagePurpose, work: () => T): T {
    return purposeContext.run(purpose, work);
  }

  function inferredPurpose(): UsagePurpose {
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

  async function resolveRate(connectionId: string, info: Awaited<ReturnType<typeof identity>>, ledger: Ledger) {
    const override = ledger.overrides[connectionId + ":" + info.model];
    const link = isLinkApi(info.baseUrl) ? await linkApiQuote(info.model, ledger.linkApiGroups[connectionId]) : null;
    const raw = override ?? link?.rate ?? catalogRate(info.provider, info.model, info.baseUrl);
    const fx = raw?.currency === "CNY" ? await readExchangeRate() : null;
    return {
      rate: raw ? { ...raw, ...(fx ? { yuanPerDollar: fx.yuanPerDollar } : {}) } : null,
      groups: link?.groups ?? [],
      group: ledger.linkApiGroups[connectionId] ?? link?.rate?.group ?? "",
      isLinkApi: isLinkApi(info.baseUrl),
      note: override ? "Manual override" : (link?.note ?? (raw ? "Reviewed provider price" : "No recognized price")),
    };
  }

  async function trackUsage<T>(
    meta: { connectionId?: string; model?: string; purpose?: UsagePurpose; stage?: string },
    work: () => Promise<T>,
  ): Promise<T> {
    const id = randomUUID(),
      connectionId = meta.connectionId ?? "";
    let request: UsageRequest | undefined;
    try {
      const info = await identity(connectionId, meta.model ?? "");
      const ledger = coerce((await villagesDocuments().getById(VILLAGES_PACKAGE_ID, DOC))?.data);
      const pricing = await resolveRate(connectionId, info, ledger);
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
          (backgroundCalls.getStore()?.metadata?.kind === "agenda"
            ? "routine-profile"
            : ["story", "wish"].includes(backgroundCalls.getStore()?.metadata?.kind ?? "")
              ? backgroundCalls.getStore()!.metadata!.kind + " (optional routine idea included)"
              : backgroundCalls.getStore()?.metadata?.kind) ??
          String(venueDebugContext().stage ?? "")
        ).slice(0, 160),
        startedAt: new Date().toISOString(),
        status: "running",
        rate: pricing.rate,
        priceNote: pricing.note,
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
        yuan:
          status === "complete" && saved.rate?.currency === "CNY"
            ? usageNativeCost(usage, saved.rate, saved.provider)
            : null,
      });
      tally(ledger, saved, false);
    });
  }

  async function readUsageLedger(details = true) {
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
      return readUsageLedger(details);
    }
    return {
      since: ledger.since,
      totals: ledger.period,
      today: ledger.days[day(new Date().toISOString())] ?? empty(),
      purposes: ledger.purposes,
      running: ledger.requests.filter((r) => r.status === "running").length,
      requests: details ? ledger.requests.filter((r) => (r.periodId ?? "initial") === ledger.periodId).reverse() : [],
      models: details ? await usageModels(ledger) : [],
      exchangeRate: await readExchangeRate(),
      overrides: details ? ledger.overrides : {},
      catalog: details ? catalog : {},
      error: lastFailure,
      scope: "Villages requests only; Engine chats and provider-internal retries/fallbacks may add costs.",
    };
  }

  async function resetUsagePeriod() {
    await write((ledger) => {
      ledger.since = new Date().toISOString();
      ledger.periodId = randomUUID();
      ledger.period = empty();
      ledger.purposes = {};
    });
    lastFailure = "";
    return readUsageLedger();
  }

  async function saveUsageRate(connectionId: string, model: string, raw: unknown) {
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
            currency: value?.currency ?? "USD",
            source: "Manual override",
            checkedAt: new Date().toISOString(),
          };
    if (
      rate &&
      (!["USD", "CNY"].includes(rate.currency) ||
        typeof rate.input !== "number" ||
        typeof rate.output !== "number" ||
        Object.values(rate).some((n) => typeof n === "number" && (!Number.isFinite(n) || n < 0 || n > 1_000_000)))
    )
      throw badRequest("Rates must be nonnegative finite USD or CNY amounts.");
    await write((ledger) => {
      const key = connectionId + ":" + model;
      if (rate) ledger.overrides[key] = rate as UsageRate;
      else delete ledger.overrides[key];
    });
    return readUsageLedger();
  }

  /** Preview the same rate snapshot policy without recording or dispatching a request. */
  async function quoteUsageRate(connectionId: string, model: string) {
    const info = await identity(connectionId, model);
    const ledger = coerce((await villagesDocuments().getById(VILLAGES_PACKAGE_ID, DOC))?.data);
    return {
      ...info,
      ...(await resolveRate(connectionId, info, ledger)),
    };
  }

  async function usageModels(ledger: Ledger) {
    await identity("", "");
    const choices = new Map<string, { connectionId: string; model: string }>();
    for (const row of connections?.rows ?? []) {
      const connectionId = String(row.id ?? ""),
        model = String(row.model ?? "");
      if (connectionId && model) choices.set(connectionId + ":" + model, { connectionId, model });
    }
    for (const row of ledger.requests) {
      if (row.connectionId && row.model)
        choices.set(row.connectionId + ":" + row.model, { connectionId: row.connectionId, model: row.model });
    }
    return Promise.all(
      [...choices.values()].map(async (row) => ({ ...row, ...(await quoteUsageRate(row.connectionId, row.model)) })),
    );
  }

  async function saveLinkApiGroup(connectionId: string, group: unknown, model = "") {
    if (!connectionId || connectionId.length > 128 || typeof group !== "string" || group.length > 128)
      throw badRequest("Choose a LinkAPI connection and token group.");
    const info = await identity(connectionId, model);
    if (!isLinkApi(info.baseUrl)) throw badRequest("This connection does not use LinkAPI.");
    const quote = await linkApiQuote(info.model, group);
    if (group && !quote.groups.some((choice) => choice.id === group))
      throw badRequest("Group is not available for this model.");
    await write((ledger) => {
      if (group) ledger.linkApiGroups[connectionId] = group;
      else delete ledger.linkApiGroups[connectionId];
    });
    return readUsageLedger();
  }
  return {
    withUsagePurpose,
    inferredPurpose,
    trackUsage,
    readUsageLedger,
    resetUsagePeriod,
    saveUsageRate,
    quoteUsageRate,
    saveLinkApiGroup,
  };
}
export type UsageLedger = ReturnType<typeof createUsageLedger>;
