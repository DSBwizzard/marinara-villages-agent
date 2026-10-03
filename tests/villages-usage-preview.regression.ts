import assert from "node:assert/strict";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.js";
import { coerceVillageState } from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.js";
import { previewVillageBurst } from "../packages/villages/src/engine/packages/server/src/services/villages/usage-preview.js";
import {
  readUsageMeter,
  saveUsageRate,
} from "../packages/villages/src/engine/packages/server/src/services/villages/usage-meter.js";
import {
  proposeRemap,
  remapBlocks,
  remapBlockKeys,
} from "../packages/villages/src/engine/packages/server/src/services/villages/native-remap.js";
import { remapSignatureFor } from "../packages/villages/src/engine/packages/server/src/services/villages/village.js";
import { proposeAgenda } from "../packages/villages/src/engine/packages/server/src/services/villages/village-bootstrap.js";
import { studioRetryRequests } from "../packages/villages/src/engine/packages/server/src/services/villages/studio-preview.js";
import {
  translationBatchSize,
  translationRequestCount,
  studioBatchSize,
} from "../packages/villages/src/engine/packages/server/src/services/villages/generation-budgets.js";
import { resetNativeScheduleCache } from "../packages/villages/src/engine/packages/server/src/services/villages/native-schedules.js";
const records = new Map<string, any>();
let calls = 0,
  writes = 0,
  failCards = false,
  translation = false;
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
  maxOutputTokens: 1400,
  fitContext(messages: any, options: any) {
    return { messages, ...options };
  },
  async chatComplete(messages: any[]) {
    calls++;
    const ranges = [...String(messages[1]?.content).matchAll(/^- ([0-9:]+-[0-9:]+):/gm)].map((match) => match[1]);
    return {
      content: JSON.stringify(
        translation
          ? { moves: ranges.map((time) => ({ day: "Monday", time, here: "Studying", place: 0 })) }
          : {
              agenda: "Studying quietly.",
              blocks: [
                {
                  startMinute: 0,
                  endMinute: 1440,
                  venue: 1,
                  activity: "Studying",
                  reason: "Learning",
                  status: "dnd",
                },
              ],
            },
      ),
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
    assert.equal(plan.requests, 10, "8 agenda requests plus 2 translation batches");
    assert.equal(plan.residents[0]?.requests, 10);
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
      routineSummary: "",
      venues: [],
    };
    await proposeAgenda(context);
    translation = true;
    await proposeRemap({
      ...context,
      card: {},
      wishes: [],
      weekStart: schedule.weekStart,
      blocks: remapBlocks(schedule),
      loreKey: "",
      lore: [],
      completedWishes: [],
    } as any);
    assert.equal(calls, plan.requests, "forecast matches actual mocked generator dispatches");
    const signature = remapSignatureFor(state, "a", schedule.weekStart, remapBlocks(schedule), []);
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
      8,
      "valid translation adds no follow-on requests",
    );
    assert.equal((await previewVillageBurst({ action: "change", settings: { setting: state.setting } })).requests, 0);
    assert.equal(
      (await previewVillageBurst({ action: "change", settings: { setting: "A different world" } })).requests,
      2,
    );
    state.villagers[0].agenda!.wishes = [{ wish: "Learn pottery", id: "wish", status: "active" }] as any;
    state.villagers[0].remap!.signature = remapSignatureFor(
      state,
      "a",
      schedule.weekStart,
      remapBlocks(schedule),
      state.villagers[0].agenda!.wishes,
    );
    storeState();
    assert.equal(
      (await previewVillageBurst({ action: "agenda", characterId: "a" })).requests,
      8,
      "existing wishes must share the actual dispatch signature",
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
      5,
      "retries subtract purchased steps",
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
      systemRequests: 1,
      connectionId: "picture",
    });
    assert.equal(images.requests, 4);
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
    assert.equal(studioBatchSize(false), 6);
    assert.equal(studioBatchSize(true), 1);
    const job: any = {
      planned: 3,
      sheets: [{}],
      status: "interrupted",
      connectionId: "picture",
      preparation: { status: "ready" },
    };
    assert.deepEqual(studioRetryRequests(job), { imageRequests: 2, systemRequests: 0, connectionId: "picture" });
    job.pendingSource = {};
    assert.equal(studioRetryRequests(job).imageRequests, 1, "saved original is not generated again");
    failCards = true;
    resetNativeScheduleCache();
    assert.equal(
      (await previewVillageBurst({ action: "translation", characterId: "a" })).requests,
      null,
      "unreadable schedules are unknown, not zero",
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
