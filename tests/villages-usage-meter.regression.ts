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
} from "../packages/villages/src/engine/packages/server/src/services/villages/usage-meter.js";
import {
  readRuntimeDebug,
  saveRuntimeDebug,
} from "../packages/villages/src/engine/packages/server/src/services/villages/runtime-debug.js";
const records = new Map<string, any>();
const originalFetch = globalThis.fetch;
globalThis.fetch = async () =>
  new Response(JSON.stringify([{ id: "paid", provider: "google", model: "gemini-2.5-flash-lite" }]));
let calls = 0,
  held: (() => void) | undefined,
  hold = false,
  fail = false,
  missing = false;
const release = configureVillagesRuntime({
  isDebugAgentsEnabled: () => false,
  persistence: {
    documents: {
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
    console.log("Villages usage meter regression passed");
  } finally {
    release();
    globalThis.fetch = originalFetch;
  }
}
void main();
