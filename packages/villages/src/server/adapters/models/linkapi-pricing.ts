import {
  amount,
  type ExchangeRate,
  modelPrice,
  type PriceAmounts,
  type ProviderRate,
} from "../../domain/rules/linkapi-pricing.js";

// Public metadata only: never reads or forwards connection credentials.

type Table = {
  data: Record<string, unknown>[];
  group_ratio: Record<string, number>;
  usable_group: Record<string, string>;
};
type Metadata = { table: Table; currency: "USD" | "CNY"; unit: number; checkedAt: string };
type Cache<T> = { value: T | null; expires: number; pending?: Promise<T | null> };
const prices: Cache<Metadata> = { value: null, expires: 0 };
const exchange: Cache<ExchangeRate> = { value: null, expires: 0 };
export const LINKAPI_PRICING_URL = "https://linkapi.ai/api/pricing";
const FX_URL = "https://open.er-api.com/v6/latest/USD";
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

async function json(url: string): Promise<Record<string, unknown>> {
  const response = await fetch(url, { signal: AbortSignal.timeout(4000), redirect: "error", credentials: "omit" });
  if (!response.ok) throw new Error("Public pricing unavailable");
  const text = await response.text();
  if (text.length > 2_000_000) throw new Error("Pricing response too large");
  return record(JSON.parse(text));
}
function cached<T>(cache: Cache<T>, ttl: number, load: () => Promise<T>): Promise<T | null> {
  if (Date.now() < cache.expires) return Promise.resolve(cache.value);
  if (cache.pending) return cache.pending;
  cache.pending = load()
    .then((value) => {
      cache.value = value;
      cache.expires = Date.now() + ttl;
      return value;
    })
    .catch(() => {
      // Expired prices are not silently used for new estimates.
      cache.value = null;
      cache.expires = Date.now() + 60_000;
      return null;
    })
    .finally(() => {
      cache.pending = undefined;
    });
  return cache.pending;
}
export function readExchangeRate(): Promise<ExchangeRate | null> {
  return cached(exchange, 24 * 60 * 60_000, async () => {
    const data = await json(FX_URL),
      n = record(data.rates).CNY;
    if (
      data.result !== "success" ||
      data.base_code !== "USD" ||
      !amount(n) ||
      n === 0 ||
      typeof data.time_last_update_unix !== "number"
    )
      throw new Error("Invalid exchange rate");
    const checkedAt = new Date(data.time_last_update_unix * 1000).toISOString();
    if (Date.now() - Date.parse(checkedAt) > 3 * 86400_000 || Date.parse(checkedAt) > Date.now() + 86400_000)
      throw new Error("Stale exchange rate");
    return { yuanPerDollar: n, checkedAt, source: "https://www.exchangerate-api.com" };
  });
}
async function metadata(): Promise<Metadata | null> {
  return cached(prices, 15 * 60_000, async () => {
    const [table, status] = await Promise.all([json(LINKAPI_PRICING_URL), json("https://linkapi.ai/api/status")]);
    const settings = record(status.data),
      currency = settings.quota_display_type;
    if (
      table.success !== true ||
      !Array.isArray(table.data) ||
      !Object.keys(record(table.group_ratio)).length ||
      (currency !== "CNY" && currency !== "USD")
    )
      throw new Error("Invalid LinkAPI pricing");
    const unit = currency === "CNY" ? settings.usd_exchange_rate : 1;
    if (!amount(unit) || unit === 0) throw new Error("Invalid LinkAPI billing unit");
    return { table: table as unknown as Table, currency, unit, checkedAt: new Date().toISOString() };
  });
}

/** A deliberately narrow parser, never eval. Unsupported rules stay unknown. */

export async function linkApiQuote(model: string, chosenGroup = "") {
  const data = await metadata();
  if (!data) return { rate: null, groups: [], note: "LinkAPI public prices unavailable" };
  const rows = data.table.data.filter((row) => row.model_name === model);
  if (rows.length !== 1) return { rate: null, groups: [], note: "Model missing or ambiguous in LinkAPI prices" };
  const row = rows[0];
  const groups = (Array.isArray(row.enable_groups) ? row.enable_groups : [])
    .filter((group): group is string => typeof group === "string" && amount(data.table.group_ratio[group]))
    .map((id) => ({ id, label: data.table.usable_group?.[id] || id, multiplier: data.table.group_ratio[id] }));
  const group = chosenGroup
    ? groups.find((group) => group.id === chosenGroup)
    : groups.length === 1
      ? groups[0]
      : undefined;
  if (!group) return { rate: null, groups, note: "Choose the group assigned to this connection's LinkAPI token" };
  const price = modelPrice(row);
  if (!price) return { rate: null, groups, note: "LinkAPI billing rule needs a manual price" };
  const scale = (price: PriceAmounts): PriceAmounts =>
    Object.fromEntries(
      Object.entries(price)
        .filter(([, n]) => typeof n === "number")
        .map(([key, n]) => [key, n * group.multiplier * data.unit]),
    ) as PriceAmounts;
  const rate: ProviderRate = {
    ...scale(price),
    currency: data.currency,
    group: group.id,
    source: "https://linkapi.ai/pricing",
    checkedAt: data.checkedAt,
    ...(price.longContext ? { longContext: { ...scale(price.longContext), above: price.longContext.above } } : {}),
  };
  return { rate, groups, note: "Live LinkAPI prices; group " + group.id };
}
