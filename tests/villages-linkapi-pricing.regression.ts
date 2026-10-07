import assert from "node:assert/strict";

import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { linkApiQuote, readExchangeRate } from "../packages/villages/src/server/adapters/models/linkapi-pricing.js";
import { isLinkApi, parseLinkApiExpression } from "../packages/villages/src/server/domain/rules/linkapi-pricing.js";
import {
  readUsageMeter,
  resetUsagePeriod,
  saveUsageRate,
  saveLinkApiGroup,
} from "../packages/villages/src/server/features/settings/usage-meter.js";
import { trackUsage, quoteUsageRate } from "../packages/villages/src/server/adapters/models/usage-ledger.js";
import { usageDollars, usageNativeCost } from "../packages/villages/src/server/adapters/models/usage-accounting.js";
const originalFetch = globalThis.fetch;
const originalNow = Date.now;
let failExchange = false,
  failPricing = false;
const records = new Map<string, any>();
let pricingReads = 0,
  paidCalls = 0;
const table = {
  success: true,
  group_ratio: { gemini: 1.6, cheap: 0.5 },
  usable_group: { gemini: "Official", cheap: "Discounted" },
  data: [
    {
      model_name: "gemini-test",
      enable_groups: ["gemini", "cheap"],
      billing_mode: "tiered_expr",
      model_ratio: 37.5,
      billing_expr:
        'len <= 200000 ? tier("base", p * 1.25 + c * 10 + cr * 0.125) : tier("long", p * 2.5 + c * 15 + cr * 0.25)',
    },
    {
      model_name: "image-test",
      enable_groups: ["gemini"],
      quota_type: 0,
      model_ratio: 99,
      billing_mode: "tiered_expr",
      billing_expr: 'tier("request", fixed(0.2))',
    },
    {
      model_name: "unsafe-test",
      enable_groups: ["gemini"],
      billing_mode: "tiered_expr",
      billing_expr: 'tier("base", p * 1 + image_count * 2)',
    },
    {
      model_name: "ratio-test",
      enable_groups: ["gemini"],
      quota_type: 0,
      model_ratio: 0.5,
      completion_ratio: 4,
      cache_ratio: 0.1,
    },
  ],
};
globalThis.fetch = async (input, init) => {
  const url = String(input);
  if (!url.includes("127.0.0.1")) assert.ok(!init?.headers, "public metadata has no credentials");
  if (url.includes("/api/connections"))
    return new Response(
      JSON.stringify([
        {
          id: "link",
          provider: "google",
          model: "gemini-test",
          baseUrl: "https://jp.linkapi.ai/v1beta",
          apiKey: "NEVER COPY THIS",
        },
        { id: "picture", provider: "custom", model: "image-test", baseUrl: "https://api.linkapi.ai/v1" },
      ]),
    );
  if (url === "https://linkapi.ai/api/pricing") {
    if (failPricing) throw new Error("pricing offline");
    pricingReads++;
    return new Response(JSON.stringify(table));
  }
  if (url === "https://linkapi.ai/api/status")
    return new Response(JSON.stringify({ data: { quota_display_type: "CNY", usd_exchange_rate: 1 } }));
  if (url === "https://open.er-api.com/v6/latest/USD") {
    if (failExchange) throw new Error("exchange offline");
    return new Response(
      JSON.stringify({
        result: "success",
        base_code: "USD",
        time_last_update_unix: Math.floor(Date.now() / 1000),
        rates: { CNY: 8 },
      }),
    );
  }
  throw new Error("Unexpected network request: " + url);
};
const release = configureVillagesRuntime({
  logger: { warn() {}, debug() {}, info() {}, error() {} },
  persistence: {
    documents: {
      async list() {
        return [];
      },
      async getById(_package: string, id: string) {
        return structuredClone(records.get(id) ?? null);
      },
      async create(input: any) {
        const row = { ...structuredClone(input), revision: 1 };
        records.set(input.id, row);
        return row;
      },
      async update(input: any) {
        const row = records.get(input.id);
        if (row.revision !== input.expectedRevision) return null;
        const next = { ...row, ...structuredClone(input), revision: row.revision + 1 };
        records.set(input.id, next);
        return next;
      },
    },
  },
} as any);
async function main() {
  try {
    assert.ok(isLinkApi("https://hk.linkapi.ai/v1"));
    assert.ok(isLinkApi("https://linkapi.pro/v1"));
    assert.equal(isLinkApi("https://linkapi.ai.evil.test/v1"), false);
    assert.equal(isLinkApi("http://linkapi.ai"), false);
    for (const text of [
      'tier("base", p * -2)',
      'tier("base", p * 1 + p * 2)',
      'tier("base", p * 1 + process.exit())',
      'tier("base", ai * 2)',
      'time() ? tier("base", p * 1) : tier("base", p * 2)',
    ])
      assert.equal(parseLinkApiExpression(text), null, text);
    const first = await quoteUsageRate("link", "gemini-test");
    assert.equal(first.rate, null, "model alone cannot identify the token group");
    assert.equal(first.groups.length, 2);
    const details = await readUsageMeter();
    assert.equal(details.models.length, 2, "configured models visible before first use");
    assert.ok(!JSON.stringify(details).includes("NEVER COPY THIS"));
    await assert.rejects(saveLinkApiGroup("link", "missing"));
    await saveLinkApiGroup("link", "gemini");
    const quote = await quoteUsageRate("link", "gemini-test");
    assert.equal(quote.rate?.input, 2, "expression takes precedence over obsolete model_ratio");
    assert.equal(quote.rate?.output, 16);
    assert.equal(quote.rate?.currency, "CNY");
    assert.equal(quote.rate?.yuanPerDollar, 8);
    assert.equal(
      usageNativeCost({ promptTokens: 1e6, completionTokens: 0 }, quote.rate, "google"),
      4,
      "long-context tier applies",
    );
    assert.equal(usageDollars({ promptTokens: 1e6, completionTokens: 0 }, quote.rate, "google"), 0.5);
    assert.equal(
      usageNativeCost({ promptTokens: 200000, completionTokens: 0 }, quote.rate, "google"),
      0.4,
      "tier boundary is inclusive",
    );
    await trackUsage({ connectionId: "link" }, async () => {
      paidCalls++;
      return {
        usage: { promptTokens: 100000, completionTokens: 1000, totalTokens: 101000, cachedPromptTokens: 10000 },
      };
    });
    const recorded = await readUsageMeter();
    const native = (90000 * 2 + 10000 * 0.2 + 1000 * 16) / 1e6;
    assert.equal(recorded.totals.yuan, native);
    assert.equal(recorded.totals.usd, 0);
    assert.equal(recorded.totals.dollars, native / 8);
    await saveLinkApiGroup("link", "cheap");
    assert.equal((await readUsageMeter()).requests[0].rate?.input, 2, "past rate snapshots stay unchanged");
    assert.equal((await quoteUsageRate("link", "gemini-test")).rate?.input, 0.625);
    await saveUsageRate("link", "gemini-test", { input: 3, output: 6, currency: "CNY" });
    assert.equal((await quoteUsageRate("link", "gemini-test")).rate?.input, 3, "manual prices take precedence");
    await saveUsageRate("link", "gemini-test", null);
    await assert.rejects(saveUsageRate("link", "gemini-test", { input: 1, output: 1, currency: "EUR" }));
    await trackUsage({ connectionId: "picture" }, async () => ({ image: "not retained" }));
    assert.equal((await readUsageMeter()).requests[0].yuan, 0.2 * 1.6, "unique-group fixed charges need no tokens");
    assert.equal((await linkApiQuote("unsafe-test")).rate, null);
    assert.equal((await linkApiQuote("not-listed")).rate, null);
    assert.equal((await linkApiQuote("ratio-test")).rate?.input, 1.6);
    const cacheRate = { input: 2, output: 10, cacheWrite: 2.5, cacheWriteOneHour: 4, source: "test", checkedAt: "now" };
    assert.equal(
      usageNativeCost({ promptTokens: 100, completionTokens: 20, cacheWritePromptTokens: 10 }, cacheRate, "anthropic"),
      null,
      "unknown TTL cannot guess a cache-write price",
    );
    assert.equal((await readExchangeRate())?.yuanPerDollar, 8);
    const saved = records.get("villages-ai-usage").data;
    const lifetime = saved.all.requests;
    await resetUsagePeriod();
    const reset = await readUsageMeter();
    assert.equal(reset.totals.yuan, 0);
    assert.deepEqual(reset.requests, []);
    assert.equal(records.get("villages-ai-usage").data.all.requests, lifetime);
    assert.equal((await quoteUsageRate("link", "gemini-test")).group, "cheap");
    assert.equal(pricingReads, 1, "polling uses a shared metadata cache");
    assert.equal(paidCalls, 1, "pricing and reset never dispatch paid generation");
    const legacy = records.get("villages-ai-usage").data;
    legacy.period = { requests: 1, tokens: 100, dollars: 2, unknown: 0 };
    assert.equal((await readUsageMeter()).totals.usd, 2, "legacy USD-only totals migrate correctly");
    Date.now = () => originalNow() + 2 * 86400_000;
    failExchange = true;
    assert.equal(await readExchangeRate(), null);
    await trackUsage({ connectionId: "link" }, async () => ({ usage: { promptTokens: 1000, completionTokens: 20 } }));
    const withoutFx = await readUsageMeter();
    assert.ok(withoutFx.totals.yuan > 0, "native CNY survives unavailable FX");
    assert.equal(withoutFx.totals.unknown, 0);
    assert.equal(withoutFx.requests[0].dollars, null);
    assert.equal(withoutFx.exchangeRate, null);
    Date.now = () => originalNow() + 3 * 86400_000;
    failPricing = true;
    assert.equal((await linkApiQuote("gemini-test", "cheap")).rate, null, "expired prices never silently reused");
    console.log("LinkAPI pricing, tiers, group selection, native CNY accounting, USD conversion and reset passed");
  } finally {
    release();
    globalThis.fetch = originalFetch;
    Date.now = originalNow;
  }
}
void main();
