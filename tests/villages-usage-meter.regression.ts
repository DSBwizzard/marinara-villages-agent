import assert from "node:assert/strict";
import {
  configureVillagesRuntime,
  completeWithRoom,
  villagesLanguageModels,
} from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.js";
import {
  readUsageMeter,
  resetUsagePeriod,
  saveUsageRate,
  usageDollars,
  catalogRate,
  trackUsage,
} from "../packages/villages/src/engine/packages/server/src/services/villages/usage-meter.js";
import {
  readRuntimeDebug,
  saveRuntimeDebug,
} from "../packages/villages/src/engine/packages/server/src/services/villages/runtime-debug.js";
import { villageEngineJson } from "../packages/villages/src/engine/packages/server/src/services/villages/engine-loopback.js";
const records = new Map<string, any>();
const originalFetch = globalThis.fetch;
let imageCalls = 0;
globalThis.fetch = async (input) => {
  if (String(input).includes("open.er-api.com"))
    return new Response(
      JSON.stringify({
        result: "success",
        base_code: "USD",
        rates: { CNY: 7 },
        time_last_update_unix: Math.floor(Date.now() / 1000),
      }),
    );
  if (String(input).includes("/api/connections"))
    return new Response(
      JSON.stringify([
        { id: "paid", provider: "google", model: "gemini-2.5-flash-lite" },
        { id: "picture", provider: "custom", model: "image" },
        { id: "claude", provider: "anthropic", model: "claude-sonnet-4-5" },
      ]),
    );
  imageCalls++;
  return new Response(JSON.stringify({ image: "mock" }));
};
let calls = 0,
  held: (() => void) | undefined,
  hold = false,
  fail = false,
  missing = false;
const release = configureVillagesRuntime({
  isDebugAgentsEnabled: () => false,
  persistence: {
    documents: {
      async list(_p: string, kind: string) {
        return [...records.values()].filter((r) => r.kind === kind);
      },
      async getById(_p: string, id: string) {
        return structuredClone(records.get(id) ?? null);
      },
      async create(input: any) {
        if (records.has(input.id)) throw new Error("Duplicate");
        const row = { ...structuredClone(input), revision: 1 };
        records.set(input.id, row);
        return row;
      },
      async update(input: any) {
        const row = records.get(input.id);
        if (row?.revision !== input.expectedRevision) return null;
        const next = { ...row, ...structuredClone(input), revision: row.revision + 1 };
        records.set(input.id, next);
        return next;
      },
    },
  },
  languageModels: {
    async resolve() {
      return this.resolveForRequest();
    },
    async resolveForRequest() {
      return {
        connectionId: "paid",
        model: "gemini-2.5-flash-lite",
        async chatComplete() {
          calls++;
          if (hold)
            await new Promise<void>((r) => {
              held = r;
            });
          if (fail) throw new Error("uncertain");
          return {
            content: "answer",
            usage: missing
              ? undefined
              : {
                  promptTokens: 100,
                  completionTokens: 20,
                  totalTokens: 130,
                  completionReasoningTokens: 10,
                  cachedPromptTokens: 30,
                },
          };
        },
      };
    },
  },
} as any);
async function main() {
  try {
    const rate = catalogRate("google", "gemini-2.5-flash-lite")!;
    assert.equal(catalogRate("openrouter", "gemini-2.5-flash-lite"), null);
    assert.equal(catalogRate("google", "gemini-2.5-flash-lite", "https://proxy.test"), null);
    assert.equal(
      usageDollars(
        { promptTokens: 100, completionTokens: 20, cachedPromptTokens: 30, completionReasoningTokens: 10 },
        rate,
        "google",
      ),
      (70 * 0.1 + 30 * 0.01 + 30 * 0.4) / 1e6,
    );
    assert.equal(
      usageDollars(
        { promptTokens: 100, completionTokens: 20, completionReasoningTokens: 10 },
        { input: 1, output: 5, source: "test", checkedAt: "now" },
        "openai",
      ),
      200 / 1e6,
    );
    assert.equal(usageDollars(undefined, rate, "google"), null);
    assert.equal((await readRuntimeDebug()).showUsageMeter, true);
    await saveRuntimeDebug(undefined, false);
    assert.equal((await readRuntimeDebug()).showUsageMeter, false);
    await saveRuntimeDebug(true);
    assert.equal((await readRuntimeDebug()).showUsageMeter, false);
    await saveRuntimeDebug(false);
    const model = await villagesLanguageModels().resolveForRequest({});
    hold = true;
    const running = completeWithRoom(model, [{ role: "user", content: "DO NOT STORE THIS" }], 100, {
      temperature: null,
      debugMode: false,
      retryEmpty: false,
    });
    while (!held) await new Promise((r) => setTimeout(r, 1));
    const live = await readUsageMeter();
    assert.equal(live.running, 1);
    assert.equal(live.totals.requests, 1);
    const before = calls;
    await readUsageMeter();
    await readUsageMeter();
    assert.equal(calls, before, "polling is free");
    held();
    hold = false;
    await running;
    const first = await readUsageMeter();
    assert.equal(first.totals.tokens, 130);
    assert.equal(first.totals.unknown, 0);
    assert.ok(!JSON.stringify([...records.values()]).includes("DO NOT STORE THIS"));
    await saveUsageRate("paid", "gemini-2.5-flash-lite", { input: 2, output: 8, cached: 0.2 });
    await Promise.all([model.chatComplete([], {}), model.chatComplete([], {})]);
    const next = await readUsageMeter();
    assert.equal(next.totals.requests, 3);
    assert.equal(next.requests.at(-1)?.rate?.input, 0.1, "past rates remain snapshotted");
    fail = true;
    await assert.rejects(model.chatComplete([], {}));
    fail = false;
    missing = true;
    await model.chatComplete([], {});
    missing = false;
    assert.equal((await readUsageMeter()).totals.unknown, 2);
    const all = records.get("villages-ai-usage").data.all.requests;
    await resetUsagePeriod();
    assert.equal((await readUsageMeter()).totals.requests, 0);
    assert.equal(records.get("villages-ai-usage").data.all.requests, all);
    await assert.rejects(saveUsageRate("paid", "x", { input: -1, output: 2 }));
    for (let i = 0; i < 202; i++) await model.chatComplete([], {});
    assert.equal((await readUsageMeter()).requests.length, 200);

    const directBefore = calls;
    const direct = await villagesLanguageModels().resolve(null);
    await direct.chatComplete([], {});
    assert.equal(calls, directBefore + 1);
    assert.equal((await readUsageMeter()).totals.requests, 203, "direct resolution shares the accounting boundary");

    held = undefined;
    hold = true;
    const pending = model.chatComplete([], {});
    while (!held) await new Promise((r) => setTimeout(r, 1));
    await resetUsagePeriod();
    hold = false;
    held();
    await pending;
    assert.equal((await readUsageMeter()).totals.tokens, 0, "a pre-reset request cannot bill the new display period");
    assert.equal((await readUsageMeter()).totals.requests, 0);
    assert.ok(records.get("villages-ai-usage").data.all.requests > all);

    await saveUsageRate("picture", "image", { input: 0, output: 0, perRequest: 0.04 });
    await villageEngineJson("/api/characters/avatar-generation", { body: { connectionId: "picture" } });
    const images = await readUsageMeter();
    assert.equal(imageCalls, 1);
    assert.equal(images.purposes.images?.requests, 1);
    assert.equal(images.purposes.images?.dollars, 0.04);
    assert.equal(
      images.totals.unknownTokens,
      1,
      "fixed-price image requests have unavailable token totals, not zero tokens",
    );
    assert.equal(images.requests[0].dollars, 0.04, "fixed image pricing does not require token usage");

    await trackUsage({ connectionId: "claude", purpose: "checks" }, async () => ({
      usage: {
        promptTokens: 100,
        completionTokens: 20,
        totalTokens: 120,
        cachedPromptTokens: 30,
        cacheWritePromptTokens: 10,
      },
    }));
    const cached = (await readUsageMeter()).requests[0];
    assert.equal(cached.usage?.totalTokens, 160);
    assert.equal(cached.dollars, (100 * 3 + 30 * 0.3 + 10 * 3.75 + 20 * 15) / 1e6);

    const persisted = records.get("villages-ai-usage").data;
    const interrupted = {
      ...structuredClone(persisted.requests.at(-1)),
      id: "restart-request",
      owner: "previous-server",
      status: "running",
      finishedAt: undefined,
      usage: undefined,
      dollars: null,
      periodId: persisted.periodId,
    };
    persisted.requests.push(interrupted);
    persisted.all.requests++;
    persisted.period.requests++;
    const beforeRestartUnknown = persisted.period.unknown;
    const recovered = await readUsageMeter();
    assert.equal(recovered.running, 0);
    assert.equal(recovered.requests[0].interrupted, true);
    assert.equal(recovered.totals.unknown, beforeRestartUnknown + 1);
    assert.equal((await readUsageMeter()).totals.unknown, recovered.totals.unknown, "restart recovery counts once");
    console.log("Villages usage meter regression passed");
  } finally {
    release();
    globalThis.fetch = originalFetch;
  }
}
void main();
