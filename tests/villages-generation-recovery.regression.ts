import assert from "node:assert/strict";

import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { proposeCompactFounding } from "../packages/villages/src/server/features/founding/founding-compact.js";
import { proposeRemap } from "../packages/villages/src/server/domain/rules/native-remap.js";
let mode = "truncated",
  ceiling = 900,
  calls = 0;
const release = configureVillagesRuntime({
  logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
  isDebugAgentsEnabled: () => false,
  getAgentConfig: async () => ({ connectionId: null }),
  persistence: { documents: { getById: async () => null } },
  languageModels: {
    async resolveForRequest() {
      return {
        model: "fixture",
        name: "Fixture",
        maxContext: 16000,
        maxOutputTokens: ceiling,
        fitContext(messages: any[], options: any) {
          return { messages, ...options };
        },
        async chatComplete(_messages: any[], options: any) {
          calls++;
          assert.ok(options.maxTokens <= 4000);
          assert.equal(options.reasoningEffort, "none");
          return {
            finishReason: mode === "truncated" ? "length" : "stop",
            content: JSON.stringify({
              routine: "An ordinary week",
              wishes: [{ wish: "A quiet walk", intensity: 1 }],
              palette: Array.from({ length: 6 }, (_, i) => ({
                activity: "Reading " + i,
                venue: 0,
                status: "idle",
                flexible: true,
                duration: 180,
                parts: [0, 1, 2, 3],
              })),
              days: Array.from({ length: 7 }, () => [0, 1, 2, 3, 4, 5, 0, 1]),
              rhythm: [],
            }),
          };
        },
      };
    },
  },
} as any);
async function main() {
  try {
    const context = {
      village: "Willow",
      setting: "Quiet",
      venues: [],
      card: { id: "a", name: "Aqua", summary: "Curious", tags: [], personality: "Patient", description: "Reads" },
      home: "",
      lore: [],
      activeWishes: [],
      completedWishes: [],
      schedule: null,
      allowInitialWish: false,
    };
    await assert.rejects(
      proposeCompactFounding(context, async () => {}),
      /too little output room/,
    );
    assert.equal(calls, 0);
    ceiling = 8192;
    await assert.rejects(
      proposeCompactFounding(context, async () => {}),
      /truncated/,
    );
    assert.equal(calls, 1, "truncated answers do not trigger paid repair");
    mode = "complete";
    const { agenda } = await proposeCompactFounding(context, async () => {});
    assert.equal(calls, 2);
    assert.equal(agenda.wishes.length, 0, "routine generation cannot manufacture Wishes");
    assert.equal(agenda.personalizationPending, false);
    assert.equal(Object.keys(agenda.week!).length, 7);
    assert.ok(
      Object.values(agenda.week!).every(
        (day) => day.length && day[0]!.startMinute === 0 && day.at(-1)!.endMinute === 1440,
      ),
    );
    await assert.rejects(proposeRemap({} as any), /retired/i);
    assert.equal(calls, 2, "retired translation never dispatches");
  } finally {
    release();
  }
  console.log("Routine recovery: one request, no automatic repairs; translation deprecated.");
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
