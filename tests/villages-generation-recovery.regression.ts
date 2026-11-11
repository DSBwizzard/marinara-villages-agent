import assert from "node:assert/strict";
import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { proposeCompactFounding } from "../packages/villages/src/server/features/founding/founding-compact.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { continuityPreparationContext } from "../packages/villages/src/server/domain/rules/continuity-library.js";
let mode = "truncated",
  ceiling = 900,
  calls = 0;
const release = configureVillagesRuntime({
  logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
  isDebugAgentsEnabled: () => false,
  getAgentConfig: async () => ({ connectionId: null }),
  persistence: { documents: villageFixtureDocuments({ getById: async () => null }) },
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
          assert.ok(options.maxTokens <= 2048);
          assert.equal(options.reasoningEffort, "none");
          return {
            finishReason: mode === "truncated" ? "length" : "stop",
            content: JSON.stringify({
              routine: "An ordinary week",
              wishes: [{ wish: "A quiet walk", intensity: 1 }],
              palette: Array.from({ length: 6 }, (_, i) => ({
                activity: "Reading " + i,
                venue: 0,
                flexible: true,
                essential: false,
                duration: 180,
                parts: [0, 1, 2, 3],
              })),
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
      continuity: continuityPreparationContext(defaultVillageState(), "a", "2026-11-10T12:00:00.000Z"),
      village: "Willow",
      setting: "Quiet",
      venues: [],
      card: { id: "a", name: "Aqua", summary: "Curious", tags: [], personality: "Patient", description: "Reads" },
      home: "",
      lore: [],
      activeWishes: [],
      wishes: [],
      schedule: null,
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
    assert.equal(Object.hasOwn(agenda, "wishes"), false, "routine generation cannot manufacture Wishes");
    assert.equal(agenda.personalizationPending, false);
    assert.equal(Object.keys(agenda.week!).length, 7);
    assert.ok(
      Object.values(agenda.week!).every(
        (day) => day.length && day[0]!.startMinute === 0 && day.at(-1)!.endMinute === 1440,
      ),
    );
  } finally {
    release();
  }
  console.log("Routine recovery: one request, no automatic repairs.");
}
await main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
