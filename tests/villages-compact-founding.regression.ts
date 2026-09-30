import assert from "node:assert/strict";
import {
  foundingNativeActivities,
  parseCompactFounding,
  proposeCompactFounding,
  rebaseFoundingRemap,
} from "../packages/villages/src/engine/packages/server/src/services/villages/founding-compact.ts";
import { scheduleInformedWeek } from "../packages/villages/src/engine/packages/server/src/services/villages/agenda-week.ts";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.ts";
import { VILLAGE_WEEKDAYS } from "../packages/villages/src/engine/packages/server/src/services/villages/village-clock.ts";

const card = {
  id: "a",
  name: "Ada",
  summary: "A patient gardener",
  personality: "Kind",
  tags: [],
  description: "Grows herbs",
};
const days = Array.from({ length: 7 }, () => [0, 1, 2, 3, 4, 5, 0, 1]);
const palette = [
  "Tending the herb beds",
  "Reading at home",
  "Walking in the village",
  "Preparing lunch",
  "Sharing garden advice",
  "Resting at home",
].map((activity) => ({ activity, venue: 0, status: "idle" }));
const payload = (count: number) => ({
  routine: "Ada tends herbs and spends quiet time at home.",
  wishes: [{ wish: "A new watering can", intensity: 1, tell: "She checks the old one for leaks" }],
  palette,
  days,
  native: Array.from({ length: count }, () => 0),
});
const schedule = (count: number, unique: boolean) => ({
  characterId: "a",
  weekStart: "2026-09-28",
  routineSummary: "",
  talkativeness: null,
  days: Object.fromEntries(
    VILLAGE_WEEKDAYS.map((day, index) => [
      day,
      Array.from({ length: Math.min(16, Math.max(0, count - index * 16)) }, (_, slot) => ({
        time: `${String(slot).padStart(2, "0")}:00-${String(slot + 1).padStart(2, "0")}:00`,
        activity: unique ? `Native activity ${index * 16 + slot}` : "Tending the remote starship",
        status: slot % 2 ? "dnd" : "online",
      })),
    ]),
  ),
});
const context = (native: ReturnType<typeof schedule> | null) => ({
  village: "Willow",
  setting: "A quiet valley",
  home: "Cottage",
  card,
  venues: [],
  lore: ["Bridge: The bridge is old."],
  completedWishes: [],
  activeWishes: [],
  schedule: native,
});

async function main() {
  const unscheduled = parseCompactFounding(payload(0), context(null) as any);
  assert.equal(unscheduled.agenda.wishes.length, 1);
  assert.equal(Object.keys(unscheduled.agenda.week ?? {}).length, 7);
  for (const weekday of VILLAGE_WEEKDAYS) {
    const blocks = unscheduled.agenda.week![weekday]!;
    assert.equal(blocks[0]!.startMinute, 0);
    assert.equal(blocks.at(-1)!.endMinute, 1440);
    assert.ok(blocks.some((block) => block.activity === "Tending the herb beds"));
  }
  for (const count of [50, 111]) {
    const native = schedule(count, count === 111);
    const unique = foundingNativeActivities(native);
    assert.equal(unique.length, count === 111 ? 111 : 1);
    const result = parseCompactFounding(payload(unique.length), context(native) as any);
    assert.equal(result.moves.length, count);
    const remap = {
      weekStart: native.weekStart,
      moves: result.moves,
      routine: result.agenda.routineSummary,
      signature: "test",
      attempts: 1,
      generatedAt: "",
    };
    const informed = scheduleInformedWeek(result.agenda.week!, native, remap);
    assert.equal(informed.Monday![0]!.startMinute, 0);
    assert.equal(informed.Monday![0]!.status, "online");
    assert.equal(informed.Monday![1]!.status, "dnd");
    assert.equal(result.moves[0]!.time, "00:00-01:00");
    assert.equal(result.moves[0]!.activity, native.days.Monday![0]!.activity);
    const shifted = schedule(count, count === 111);
    shifted.weekStart = "2026-10-05";
    shifted.days.Monday![0]!.activity = "A newly scheduled errand";
    const rebased = rebaseFoundingRemap(remap, shifted, "new-signature");
    assert.equal(rebased.moves.length, count);
    assert.equal(rebased.moves[0]!.here, "at home", "unknown native wording gets a village-safe fallback");
    assert.equal(rebased.moves[1]!.here, "Tending the herb beds", "known wording reuses its village translation");
  }
  assert.throws(() => parseCompactFounding({ ...payload(0), days: [] }, context(null) as any), /seven-day/);
  assert.equal(
    parseCompactFounding({ ...payload(0), wishes: [] }, context(null) as any).agenda.wishes.length,
    0,
    "a quiet founding day needs no wish",
  );
  assert.throws(
    () => parseCompactFounding({ ...payload(1), native: [] }, context(schedule(1, true)) as any),
    /mapped 0 of 1/,
  );

  let calls = 0;
  let options: Record<string, unknown> = {};
  let answer = payload(0);
  const release = configureVillagesRuntime({
    isDebugAgentsEnabled: () => false,
    getAgentConfig: async () => ({ connectionId: "flash-class" }),
    persistence: { documents: { getById: async () => null } },
    languageModels: {
      resolveForRequest: async () => ({
        name: "Flash-class test model",
        maxOutputTokens: 4_000,
        fitContext: (messages: unknown[]) => ({ messages, maxTokens: 4_000, estimatedTokensAfter: 900 }),
        chatComplete: async (_messages: unknown[], next: Record<string, unknown>) => {
          calls += 1;
          options = next;
          return {
            content: JSON.stringify(answer),
            finishReason: "stop",
            usage: { promptTokens: 900, completionTokens: 500 },
          };
        },
      }),
    },
  } as any);
  try {
    for (const [native, count] of [
      [null, 0],
      [schedule(50, false), 50],
      [schedule(111, true), 111],
    ] as const) {
      answer = payload(native ? foundingNativeActivities(native).length : 0);
      const before = calls;
      const result = await proposeCompactFounding(context(native) as any, async () => {});
      assert.equal(result.moves.length, count);
      assert.equal(calls, before + 1, "one package-level request handles this villager's full founding plan");
    }
    assert.deepEqual(options.responseFormat, { type: "json_object" });
    assert.equal(options.reasoningEffort, "none");
  } finally {
    release();
  }
  console.log("Villages compact founding regressions passed.");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
