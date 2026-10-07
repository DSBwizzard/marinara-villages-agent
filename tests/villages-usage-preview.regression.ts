import assert from "node:assert/strict";

import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { previewVillageBurst } from "../packages/villages/src/server/features/settings/usage-preview.js";
import { readUsageMeter, saveUsageRate } from "../packages/villages/src/server/features/settings/usage-meter.js";
import {
  proposeRemap,
  remapBlocks,
  remapBlockKeys,
} from "../packages/villages/src/server/domain/rules/native-remap.js";
import { proposeAgenda } from "../packages/villages/src/server/features/founding/village-bootstrap.js";
import {
  translationBatchSize,
  translationRequestCount,
} from "../packages/villages/src/server/domain/rules/generation-budgets.js";
import { resetNativeScheduleCache } from "../packages/villages/src/server/adapters/engine/native-schedules.js";
const records = new Map<string, any>();
let calls = 0,
  writes = 0,
  failCards = false;
const schedule: any = {
  characterId: "a",
  weekStart: "2026-09-28",
  days: {
    Monday: Array.from({ length: 7 }, (_, i) => ({
      time: String(i).padStart(2, "0") + ":00-" + String(i + 1).padStart(2, "0") + ":00",
      activity: "Studying",
      status: "online",
    })),
  },
};
const model: any = {
  connectionId: "paid",
  model: "gemini-2.5-flash-lite",
  name: "Mock",
  maxContext: 8192,
  maxOutputTokens: 4000,
  fitContext(messages: any, options: any) {
    return { messages, ...options };
  },
  async chatComplete(_messages: any[]) {
    calls++;
    return {
      content: JSON.stringify({
        routine: "Studying quietly.",
        wishes: [],
        palette: Array.from({ length: 6 }, (_, index) => ({
          activity: "Study " + index,
          venue: 0,
          status: "idle",
          flexible: true,
        })),
        days: Array.from({ length: 7 }, () => [0, 1, 2, 3, 4, 5, 0, 1]),
        rhythm: [],
      }),
      usage: { promptTokens: 500, completionTokens: 100, totalTokens: 600 },
    };
  },
};
const release = configureVillagesRuntime({
  isDebugAgentsEnabled: () => false,
  logger: { debugOverride() {}, warn() {}, error() {}, info() {}, debug() {} },
  getAgentConfig: async () => ({ connectionId: "paid", settings: { imageConnectionId: "picture" } }),
  persistence: {
    documents: {
      async getById(_p: string, id: string) {
        return structuredClone(records.get(id) ?? null);
      },
      async list(_p: string, kind: string) {
        return structuredClone([...records.values()].filter((r) => r.kind === kind));
      },
      async create(value: any) {
        writes++;
        const r = { ...structuredClone(value), revision: 1 };
        records.set(value.id, r);
        return r;
      },
      async update(value: any) {
        writes++;
        const r = { ...structuredClone(value), revision: (records.get(value.id)?.revision ?? 0) + 1 };
        records.set(value.id, r);
        return r;
      },
    },
  },
  resources: {
    async listCharacters() {
      if (failCards) throw Error("Unreadable");
      return [{ id: "a", data: { extensions: { conversationSchedule: schedule } } }];
    },
  },
  languageModels: {
    async resolveForRequest() {
      return model;
    },
  },
} as any);
const originalFetch = globalThis.fetch;
globalThis.fetch = async () =>
  new Response(
    JSON.stringify([
      { id: "paid", provider: "google", model: "gemini-2.5-flash-lite" },
      { id: "picture", provider: "custom", model: "image" },
    ]),
  );
const state = coerceVillageState({
  wishSystemVersion: 3,
  seed: "seed",
  setting: "Village",
  venues: [{ id: "park", name: "Park", classes: ["gathering"], form: "Park" }],
  villagers: [
    {
      characterId: "a",
      addedAt: "2026-09-01",
      cardSnapshot: {
        id: "a",
        revision: 1,
        sourceStatus: "available",
        name: "A",
        capturedAt: "2026-09-01T00:00:00.000Z",
      },
      agenda: { generatedAt: "2026-09-01", routineSummary: "Routine", day: [], week: {} },
    },
  ],
});
const storeState = () =>
  records.set("villages-village", { id: "villages-village", data: structuredClone(state), revision: 1 });
async function main() {
  try {
    storeState();
    const plan = await previewVillageBurst({ action: "agenda", characterId: "a" });
    assert.equal(plan.requests, 1, "one owned routine request, no translation");
    assert.equal(plan.residents[0]?.requests, 1);
    assert.ok(plan.dollars);
    assert.equal(calls, 0);
    assert.equal(writes, 0, "previews do not reconcile or write village state");
    const context: any = {
      name: "A",
      village: "V",
      setting: "Village",
      summary: "",
      personality: "",
      description: "",
      tags: [],
      lore: [],
      home: "",
      routineSummary: "",
      venues: [],
    };
    await proposeAgenda(context);
    await assert.rejects(proposeRemap({} as any), /retired/);
    assert.equal(calls, plan.requests, "forecast matches actual mocked generator dispatches");
    const signature = "unused-retired-translation";
    state.villagers[0].remap = {
      signature,
      moves: remapBlockKeys(remapBlocks(schedule)).map((key) => ({
        day: key.split("|")[0],
        time: key.split("|")[1],
        here: "Studying",
        venueId: "",
      })),
      attempts: 1,
      generatedAt: new Date().toISOString(),
      weekStart: schedule.weekStart,
      routine: "",
    } as any;
    storeState();
    assert.equal(
      (await previewVillageBurst({ action: "agenda", characterId: "a" })).requests,
      1,
      "retired translation data cannot add follow-on requests",
    );
    assert.equal((await previewVillageBurst({ action: "change", settings: { setting: state.setting } })).requests, 0);
    assert.equal(
      (await previewVillageBurst({ action: "change", settings: { setting: "A different world" } })).requests,
      0,
    );
    state.villagers[0].agenda!.wishes = [{ wish: "Learn pottery", id: "wish", status: "active" }] as any;
    state.villagers[0].remap!.signature = "unused-retired-translation-with-wish";
    storeState();
    assert.equal(
      (await previewVillageBurst({ action: "agenda", characterId: "a" })).requests,
      1,
      "existing wishes cannot revive retired translation requests",
    );
    const unchanged = structuredClone(records.get("villages-village"));
    await readUsageMeter(true);
    assert.deepEqual(records.get("villages-village"), unchanged, "meter reads cannot reconcile the village");
    records.set("job", {
      id: "job",
      kind: "background-work",
      data: {
        seed: state.seed,
        kind: "agenda",
        subjectId: "a",
        status: "failed",
        finite: true,
        steps: Array.from({ length: 3 }, () => ({ status: "completed" })),
        settings: {},
        input: {},
        failedStep: null,
        completedCount: 0,
      },
    });
    assert.equal(
      (await previewVillageBurst({ action: "agenda", characterId: "a" })).requests,
      0,
      "retries reuse purchased routine responses",
    );
    records.get("job").data.status = "completed";
    assert.equal(
      (await previewVillageBurst({ action: "retry", jobId: "job" })).requests,
      0,
      "completed retry replays cost no new requests",
    );
    await saveUsageRate("picture", "image", { input: 0, output: 0, perRequest: 0.04 });
    const images = await previewVillageBurst({
      action: "images",
      count: 3,
      connectionId: "picture",
    });
    assert.equal(images.requests, 3);
    assert.ok((images.dollars?.min ?? 0) >= 0.12);
    const unknown = await previewVillageBurst({ action: "images", count: 2, connectionId: "unpriced" });
    assert.equal(unknown.unknownCosts, 2);
    assert.equal(unknown.dollars, null);
    for (const limit of [700, 1400, 5000])
      for (const blocks of [0, 1, 12, 40])
        assert.equal(
          translationRequestCount(blocks, translationBatchSize(limit)),
          Math.ceil(blocks / Math.min(10, Math.max(2, Math.floor(limit / 350)))),
        );
    failCards = true;
    resetNativeScheduleCache();
    assert.equal(
      (await previewVillageBurst({ action: "translation", characterId: "a" })).requests,
      0,
      "retired translation stays zero even when cards are unreadable",
    );
    assert.equal(
      (await previewVillageBurst({ action: "retry", jobId: "job" })).requests,
      0,
      "a saved completed retry does not need readable native cards",
    );
    console.log(
      "Burst previews match mocked dispatches; retries, follow-on work, pricing and read-only boundaries passed",
    );
  } finally {
    release();
    globalThis.fetch = originalFetch;
    resetNativeScheduleCache();
  }
}
void main();
