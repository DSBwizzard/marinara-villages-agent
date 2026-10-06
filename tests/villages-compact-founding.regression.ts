import assert from "node:assert/strict";
import {
  DEFAULT_PLAYER_ROLE,
  renderPlayerRoleContext,
} from "../packages/villages/src/engine/packages/server/src/services/villages/player-role.js";
import {
  foundingNativeActivities,
  parseCompactFounding,
  proposeCompactFounding,
} from "../packages/villages/src/engine/packages/server/src/services/villages/founding-compact.ts";

import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/application-runtime.ts";
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
  rhythm: [],
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
    assert.equal(result.moves.length, 0, "native schedules are not translated");
  }
  assert.throws(() => parseCompactFounding({ ...payload(0), days: [] }, context(null) as any), /seven-day/);
  assert.equal(
    parseCompactFounding({ ...payload(0), wishes: [] }, context(null) as any).agenda.wishes.length,
    0,
    "a quiet founding day needs no wish",
  );
  assert.equal(
    parseCompactFounding(payload(0), { ...context(null), allowInitialWish: false } as any).agenda.wishes.length,
    0,
    "an interrupted preparation retry cannot replenish its initial wish",
  );
  assert.throws(() => parseCompactFounding({ ...payload(0), rhythm: undefined }, context(null) as any), /rest windows/);

  for (const wish of ["You want company", "Repair my chair"])
    assert.throws(() => parseCompactFounding({ ...payload(0), wishes: [{ wish }] }, context(null) as any), /neutrally/);

  let calls = 0;
  let capturedPrompt = "";
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
          capturedPrompt = _messages.map((message: any) => message.content).join("\n");
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
    for (const [native, _count] of [
      [null, 0],
      [schedule(50, false), 50],
      [schedule(111, true), 111],
    ] as const) {
      answer = payload(native ? foundingNativeActivities(native).length : 0);
      const before = calls;
      await proposeCompactFounding(context(native) as any, async () => {});
      assert.equal(calls, before + 1, "one package-level request handles this villager's full founding plan");
    }
    for (const playerRole of [
      DEFAULT_PLAYER_ROLE,
      {
        ...DEFAULT_PLAYER_ROLE,
        title: "Harbor Patron",
        explanation: "Neighbors bring me plans because I coordinate harbor repairs.",
      },
      { ...DEFAULT_PLAYER_ROLE, enabled: false },
    ]) {
      const roleContext = { ...context(null), setting: "S".repeat(4000), playerRole, playerPersonaName: "Robin" };
      const before = calls;
      answer = payload(0);
      await proposeCompactFounding(roleContext as any, async () => {});
      assert.ok(
        capturedPrompt.includes(renderPlayerRoleContext(roleContext)),
        "the role is separate from truncated scenery",
      );
      assert.equal(calls, before + 1, "role context adds no generation call");
    }
    assert.match(capturedPrompt, /neutral description/);
    assert.doesNotMatch(
      capturedPrompt,
      /chocolate|identifying a tune|stuck in their head|borrowing a pencil|repair a favorite chair|arrange a picnic|perform a song|"activity":"reading"/,
    );
    assert.equal(options.maxTokens, 4000);
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
