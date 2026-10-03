// Public metadata only: never reads or forwards connection credentials.
export type PriceAmounts = {
  input: number;
  output: number;
  cached?: number;
  cacheWrite?: number;
  cacheWriteOneHour?: number;
  perRequest?: number;
};
export type ProviderRate = PriceAmounts & {
  currency?: "USD" | "CNY";
  source: string;
  checkedAt: string;
  group?: string;
  longContext?: PriceAmounts & { above: number };
};
export type ExchangeRate = { yuanPerDollar: number; checkedAt: string; source: string };
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
const amount = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 1e6;
export function isLinkApi(baseUrl: string): boolean {
  try {
    const url = new URL(baseUrl);
    return (
      url.protocol === "https:" &&
      [
        "linkapi.ai",
        "www.linkapi.ai",
        "api.linkapi.ai",
        "home.linkapi.ai",
        "jp.linkapi.ai",
        "hk.linkapi.ai",
        "linkapi.cc",
        "linkapi.pro",
      ].includes(url.hostname.toLowerCase())
    );
  } catch {
    return false;
  }
}
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
export function parseLinkApiExpression(
  expression: string,
): (PriceAmounts & { longContext?: PriceAmounts & { above: number } }) | null {
  if (expression.length > 4000) return null;
  const tier = (text: string): PriceAmounts | null => {
    const match = text.trim().match(/^tier\("[^"\\]*",\s*(.+)\)$/u);
    if (!match) return null;
    const fixed = match[1].match(/^fixed\((\d+(?:\.\d+)?(?:e[+-]?\d+)?)\)$/iu);
    if (fixed) {
      const n = Number(fixed[1]);
      return amount(n) ? { input: 0, output: 0, perRequest: n } : null;
    }
    const values: Record<string, number> = {};
    for (const part of match[1].split(/\s+\+\s+/u)) {
      const term = part.trim().match(/^(p|c|cr|cc|cc1h)\s*\*\s*(\d+(?:\.\d+)?(?:e[+-]?\d+)?)$/iu);
      if (!term || term[1] in values || !amount(Number(term[2]))) return null;
      values[term[1]] = Number(term[2]);
    }
    if (values.p === undefined) return null;
    return {
      input: values.p,
      output: values.c ?? 0,
      ...(values.cr !== undefined ? { cached: values.cr } : {}),
      ...(values.cc !== undefined ? { cacheWrite: values.cc } : {}),
      ...(values.cc1h !== undefined ? { cacheWriteOneHour: values.cc1h } : {}),
    };
  };
  const split = expression.trim().match(/^len\s*<=\s*(\d+)\s*\?\s*(tier\(.+\))\s*:\s*(tier\(.+\))$/u);
  if (!split) return tier(expression);
  const base = tier(split[2]),
    long = tier(split[3]),
    above = Number(split[1]);
  if (!base || !long || !Number.isSafeInteger(above) || base.perRequest !== undefined || long.perRequest !== undefined)
    return null;
  return { ...base, longContext: { ...long, above } };
}
function modelPrice(row: Record<string, unknown>): ReturnType<typeof parseLinkApiExpression> {
  if (row.billing_mode === "tiered_expr")
    return typeof row.billing_expr === "string" ? parseLinkApiExpression(row.billing_expr) : null;
  if (row.billing_mode && row.billing_mode !== "ratio") return null;
  if (row.quota_type === 1)
    return amount(row.model_price) ? { input: 0, output: 0, perRequest: row.model_price } : null;
  if (row.quota_type !== 0 || !amount(row.model_ratio) || !amount(row.completion_ratio)) return null;
  const input = row.model_ratio * 2;
  return {
    input,
    output: input * row.completion_ratio,
    ...(amount(row.cache_ratio) ? { cached: input * row.cache_ratio } : {}),
    ...(amount(row.create_cache_ratio) ? { cacheWrite: input * row.create_cache_ratio } : {}),
  };
}
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
