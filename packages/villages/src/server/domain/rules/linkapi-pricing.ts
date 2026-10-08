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
export const amount = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 1e6;
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
export function modelPrice(row: Record<string, unknown>): ReturnType<typeof parseLinkApiExpression> {
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
