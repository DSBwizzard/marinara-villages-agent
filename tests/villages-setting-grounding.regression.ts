import assert from "node:assert/strict";
import {
  buildVillagerMessages,
  type VillagePromptContext,
} from "../packages/villages/src/engine/packages/server/src/services/villages/chat.js";
import { readVillagerCard } from "../packages/villages/src/engine/packages/server/src/services/villages/catalog.js";
import { proposeCompactFounding } from "../packages/villages/src/engine/packages/server/src/services/villages/founding-compact.js";
import { VILLAGE_SHARED_SETTING_RULE } from "../packages/villages/src/engine/packages/server/src/services/villages/narrative-grounding.js";
import { builtInNarrationTurn } from "../packages/villages/src/engine/packages/server/src/services/villages/narration-settings.js";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.js";
import { DEFAULT_PLAYER_ROLE } from "../packages/villages/src/engine/packages/server/src/services/villages/player-role.js";
import {
  villageCurrentSetting,
  villageFoundingSetting,
  villageRelevantOrigin,
} from "../packages/villages/src/engine/packages/server/src/services/villages/prompt-preset.js";
import { draftScenarioImprint } from "../packages/villages/src/engine/packages/server/src/services/villages/scenario-imprint.js";
import { sceneryPrompt } from "../packages/villages/src/engine/packages/server/src/services/villages/scenery-context.js";
import { buildTownMapPrompt } from "../packages/villages/src/engine/packages/server/src/services/villages/town-map-image.js";
import { buildTickMessages } from "../packages/villages/src/engine/packages/server/src/services/villages/village-bootstrap.js";
import { deriveVillageMoment } from "../packages/villages/src/engine/packages/server/src/services/villages/village-clock.js";
import { coerceVillageState } from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.js";
import { validateFirstDayDescription } from "../packages/villages/src/engine/packages/server/src/services/villages/village.js";

const scenarios = [
  [
    "Mall",
    "An unused shopping mall in a city where housing is scarce.",
    "Housing elsewhere is unavailable, so we share the mall.",
    "Occupied storefront",
  ],
  [
    "Field",
    "An empty grassy field beside a stream.",
    "We have permission to camp here while deciding where to go.",
    "Tent",
  ],
  [
    "Servers",
    "A server facility whose equipment needs continuous supervision.",
    "Our assignment requires an onsite resident team.",
    "Staff bunk",
  ],
  ["Prison", "An operating prison with cells and a common room.", "We are housed in the same cell block.", "Cell"],
  [
    "Station",
    "A space station orbiting a black hole.",
    "We have accommodation here for separate research assignments.",
    "Crew cabin",
  ],
  [
    "Village",
    "A conventional village with cottages and a market.",
    "We share this place because our families live here.",
    "Cottage",
  ],
  [
    "Denny's",
    "A local Denny's is a refuge during an ongoing zombie outbreak.",
    "We shelter together here because it is the last safe refuge.",
    "Partitioned booth",
  ],
] as const;

async function main() {
  const card = readVillagerCard({
    id: "casey",
    data: { name: "Casey", description: "An observant technician.", personality: "Independent and practical." },
  } as any);
  const moment = deriveVillageMoment({
    foundedAt: "2026-10-01T12:00:00Z",
    seed: "grounding",
    now: new Date("2026-10-02T12:00:00Z"),
  });
  const context: VillagePromptContext = {
    roster: [],
    present: [],
    lore: [],
    homes: [],
    memory: [],
    moment,
    routine: null,
    remap: null,
    agenda: null,
  };
  const narration = builtInNarrationTurn({ maxTokens: 4096, temperature: 0.8 });
  const palette = ["Resting", "Reading", "Preparing a meal", "Maintaining equipment", "Talking", "Taking a break"].map(
    (activity) => ({ activity, venue: 0, status: "idle" }),
  );
  let answer: unknown = null;
  let captured = "";
  let calls = 0;
  const release = configureVillagesRuntime({
    isDebugAgentsEnabled: () => false,
    getAgentConfig: async () => ({ connectionId: "grounding-test" }),
    persistence: { documents: { getById: async () => null } },
    languageModels: {
      resolveForRequest: async () => ({
        name: "Grounding fixture",
        maxOutputTokens: 4000,
        fitContext: (messages: unknown[]) => ({ messages, maxTokens: 4000 }),
        chatComplete: async (messages: { content: string }[]) => {
          calls++;
          captured = messages.map((message) => message.content).join("\n");
          return { content: JSON.stringify(answer), finishReason: "stop" };
        },
      }),
    },
  } as any);
  try {
    for (const [name, setting, circumstances, home] of scenarios) {
      validateFirstDayDescription(circumstances, true);
      const state = coerceVillageState({
        name,
        setting,
        foundingReason: "custom",
        foundingDetails: circumstances,
        setupAt: "2026-10-01T12:00:00Z",
        playerRole: DEFAULT_PLAYER_ROLE,
      });
      const before = JSON.stringify(state);
      const current = villageCurrentSetting(state);
      const founding = villageFoundingSetting(state);
      const map = buildTownMapPrompt(undefined, setting);
      for (const prompt of [current, founding, map, sceneryPrompt(["Entrance of " + home], ["Setting: " + current])]) {
        assert.ok(prompt.includes(setting), name + ": authored setting is retained");
        assert.ok(prompt.includes(VILLAGE_SHARED_SETTING_RULE), name + ": shared setting framing is supplied");
        assert.doesNotMatch(prompt, /a small (fictional )?village|The village begins on Day 1|natural clearings/);
      }
      assert.ok(founding.includes(circumstances), "preparation sees the shared circumstances");
      assert.equal(current.includes(circumstances), false, "starting circumstances are not a recurring script");
      assert.ok(villageRelevantOrigin(state, "Why are we staying here?").includes(circumstances));
      assert.equal(villageRelevantOrigin(state, "What is for dinner?"), "");
      assert.equal(villageRelevantOrigin(state, "What is for dinner here?"), "");
      const dialogue = buildVillagerMessages(card, state, [], "Why are we here?", context, narration)
        .map((message) => message.content)
        .join("\n");
      assert.ok(dialogue.includes(setting));
      assert.ok(dialogue.includes(VILLAGE_SHARED_SETTING_RULE));
      const events = buildTickMessages({
        village: name,
        setting: current,
        moment,
        foundedAt: state.setupAt,
        residents: [],
        recent: [],
        noticeboard: [],
        venues: [],
        pendingVenueNames: [],
        opportunities: [],
        lastSimulatedAt: state.setupAt,
        forced: false,
      })
        .map((message) => message.content)
        .join("\n");
      assert.ok(events.includes(setting));
      assert.ok(events.includes(VILLAGE_SHARED_SETTING_RULE));
      answer = {
        routine: "Casey tends to ordinary responsibilities here.",
        wishes: [],
        palette,
        days: Array.from({ length: 7 }, () => [0, 1, 2, 3, 4, 5, 0, 1]),
        rhythm: [],
      };
      const previousCalls = calls;
      const result = await proposeCompactFounding(
        {
          village: name,
          setting: founding,
          home,
          card,
          venues: [],
          lore: [],
          completedWishes: [],
          activeWishes: [],
          schedule: null,
        },
        async () => {},
      );
      assert.equal(calls, previousCalls + 1, "grounding adds no generation requests");
      assert.equal(result.agenda.wishes.length, 0);
      assert.ok(captured.includes(setting));
      assert.ok(captured.includes(circumstances));
      assert.match(captured, /Starting play does not mean this place has just been established/);
      assert.equal(JSON.stringify(state), before, "prompt assembly does not rewrite saved facts or history");
      if (name === "Denny's") {
        assert.match(current, /ongoing zombie outbreak/);
        assert.match(map, /ongoing zombie outbreak/);
        assert.match(dialogue, /ongoing zombie outbreak/);
        assert.match(events, /ongoing zombie outbreak/);
      }
    }
    // Maximum authored world context must not truncate the separate starting circumstances.
    const full = {
      setting: "x".repeat(2000),
      foundingReason: "custom",
      foundingDetails: "We share the rent.",
      foundingGuidance: "",
    };
    await proposeCompactFounding(
      {
        village: "Long context",
        setting: villageFoundingSetting(full),
        home: "Room",
        card,
        venues: [],
        lore: [],
        completedWishes: [],
        activeWishes: [],
        schedule: null,
      },
      async () => {},
    );
    assert.ok(captured.includes(full.foundingDetails));
    answer = { origin: "", worldFacts: ["The outbreak is ongoing"], openingConditions: [], visualCues: [] };
    await draftScenarioImprint({ setting: scenarios[6][1], foundingReason: "none", foundingDetails: scenarios[6][2] });
    assert.match(captured, /Distinguish earlier background, ongoing world conditions/);
    assert.doesNotMatch(captured, /Never claim the village was already founded|The village begins on Day 1/);
    assert.match(
      buildTownMapPrompt(undefined, scenarios[4][1], { roads: "exclude", structures: "exclude", water: "exclude" }),
      /retain enclosing architecture/,
    );
    for (const choice of ["auto", "include", "exclude"] as const) {
      assert.throws(
        () =>
          buildTownMapPrompt(
            undefined,
            "x".repeat(2000),
            { roads: choice, structures: choice, water: choice },
            "",
            null,
            "s".repeat(600),
          ),
        /characters over.*no image request was made/,
        "individually valid maximum inputs share a final allowance",
      );
    }
    assert.throws(() => validateFirstDayDescription("   ", true), /brings you and the others together/);
    assert.doesNotThrow(() => validateFirstDayDescription("", false));
    const legacy = coerceVillageState({
      setupAt: "2025-01-01T00:00:00Z",
      setting: "Old harbor",
      foundingDetails: "On Day 1 we arrived.",
      promptKnowledge: "My custom prompt",
      playerRole: { ...DEFAULT_PLAYER_ROLE, title: "Village Steward" },
    });
    assert.equal(legacy.foundingDetails, "On Day 1 we arrived.");
    assert.equal(legacy.promptKnowledge, "My custom prompt");
    assert.equal(legacy.playerRole?.title, "Village Steward");
    assert.equal(coerceVillageState({ setupAt: legacy.setupAt }).playerRole, null);
  } finally {
    release();
  }
  console.log(
    "Villages setting grounding: seven settings, founding/dialogue/Events/image prompts, ongoing refuge, and legacy compatibility passed.",
  );
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
