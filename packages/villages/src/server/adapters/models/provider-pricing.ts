import type { UsageRate } from "../../domain/models/usage-model.js";

let cache: { expires: number; checkedAt: string; rows: unknown[] } | undefined;
let pending: Promise<unknown[]> | undefined;

/** Fixed public destination only; connection credentials and URLs are never forwarded. */
export async function openRouterRate(provider: string, model: string, baseUrl: string): Promise<UsageRate | null> {
  if (baseUrl) {
    try {
      const url = new URL(baseUrl);
      if (url.protocol !== "https:" || url.hostname !== "openrouter.ai") return null;
    } catch {
      return null;
    }
  } else if (provider !== "openrouter") return null;
  if (!cache || cache.expires <= Date.now()) {
    pending ??= (async () => {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/models", {
          signal: AbortSignal.timeout(4000),
          redirect: "error",
          credentials: "omit",
        });
        if (!response.ok) throw new Error("Pricing unavailable");
        const text = await response.text();
        if (text.length > 5_000_000) throw new Error("Pricing response too large");
        const data = JSON.parse(text);
        if (!Array.isArray(data.data)) throw new Error("Invalid prices");
        cache = { expires: Date.now() + 15 * 60_000, checkedAt: new Date().toISOString(), rows: data.data };
      } catch {
        cache = { expires: Date.now() + 60_000, checkedAt: new Date().toISOString(), rows: [] };
      }
      return cache.rows;
    })().finally(() => {
      pending = undefined;
    });
    await pending;
  }
  const matches = cache!.rows.filter((raw: any) => raw?.id === model) as { pricing?: Record<string, unknown> }[];
  if (matches.length !== 1 || !matches[0].pricing) return null;
  const pricing = matches[0].pricing;
  const number = (key: string) => {
    const value = pricing[key];
    if (typeof value !== "string" && typeof value !== "number") return undefined;
    if (typeof value === "string" && !value.trim()) return undefined;
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 && n <= 1 ? n : undefined;
  };
  for (const key of ["input_cache_read", "input_cache_write", "input_cache_write_1h"]) {
    if (pricing[key] !== undefined && number(key) === undefined) return null;
  }
  const input = number("prompt"),
    output = number("completion");
  if (input === undefined || output === undefined) return null;
  // Villages never requests OpenRouter web-search tools. Other extra billed dimensions are not exposed in Engine token usage.
  for (const [key, value] of Object.entries(pricing)) {
    if (
      !["prompt", "completion", "input_cache_read", "input_cache_write", "input_cache_write_1h", "web_search"].includes(
        key,
      ) &&
      Number(value) !== 0
    )
      return null;
  }
  const cached = number("input_cache_read"),
    cacheWrite = number("input_cache_write"),
    cacheWriteOneHour = number("input_cache_write_1h");
  return {
    input: input * 1e6,
    output: output * 1e6,
    ...(cached !== undefined ? { cached: cached * 1e6 } : {}),
    ...(cacheWrite !== undefined ? { cacheWrite: cacheWrite * 1e6 } : {}),
    ...(cacheWriteOneHour !== undefined ? { cacheWriteOneHour: cacheWriteOneHour * 1e6 } : {}),
    currency: "USD",
    source: "https://openrouter.ai/api/v1/models",
    checkedAt: cache!.checkedAt,
  };
}
