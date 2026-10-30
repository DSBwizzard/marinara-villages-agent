import assert from "node:assert/strict";
import { readVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { buildLocationPrompt } from "../packages/villages/src/server/domain/rules/location-image-rules.js";
import { VILLAGE_SHARED_SETTING_RULE } from "../packages/villages/src/server/domain/rules/narrative-grounding.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { applyVenueSceneChange } from "../packages/villages/src/server/domain/rules/venue-scene-state.js";
import { venueInZone, venueZones } from "../packages/villages/src/server/domain/rules/venue-zones.js";
import { proposeCompactFounding } from "../packages/villages/src/server/features/founding/founding-compact.js";
import { currentScenePrompt } from "./fixtures/villages-scene-writing.fixture.js";
import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";

import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { DEFAULT_PLAYER_BACKGROUND } from "../packages/villages/src/server/domain/rules/player-background.js";
import {
  villageCurrentSetting,
  villageFoundingSetting,
  villageRelevantOrigin,
} from "../packages/villages/src/server/domain/rules/prompt-preset.js";
import { sceneryPrompt } from "../packages/villages/src/server/domain/rules/scenery-context.js";
import { buildTownMapPrompt } from "../packages/villages/src/server/domain/rules/town-map-image-rules.js";
import { deriveVillageMoment } from "../packages/villages/src/server/domain/rules/village-clock.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { buildResidentPlanningMessages } from "./fixtures/resident-planning.fixture.js";

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
  const palette = ["Resting", "Reading", "Preparing a meal", "Maintaining equipment", "Talking", "Taking a break"].map(
    (activity) => ({ activity, venue: 0, status: "idle" }),
  );
  let answer: unknown = null;
  let captured = "";
  let calls = 0;
  let usageDocument: any = null;
  const release = configureVillagesRuntime({
    isDebugAgentsEnabled: () => false,
    getAgentConfig: async () => ({ connectionId: "grounding-test" }),
    persistence: {
      documents: villageFixtureDocuments({
        getById: async () => structuredClone(usageDocument),
        create: async (input: any) => {
          assert.equal(usageDocument, null);
          usageDocument = { ...structuredClone(input), revision: 1 };
          return structuredClone(usageDocument);
        },
        update: async (input: any) => {
          assert.equal(input.expectedRevision, usageDocument.revision);
          usageDocument = { ...structuredClone(input), revision: usageDocument.revision + 1 };
          return structuredClone(usageDocument);
        },
      }),
    },
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
    assert.equal(
      coerceVillageState({ ...defaultVillageState(), version: 8 }).name,
      "",
      "new worlds have no invented village name",
    );
    assert.equal(
      coerceVillageState({ ...defaultVillageState(), name: "Willowbrook" }).name,
      "Willowbrook",
      "authored names remain intact",
    );
    for (const [name, setting, circumstances, home] of scenarios) {
      const state = coerceVillageState({
        ...defaultVillageState(),

        wishSystemVersion: 3,
        name,
        setting,
        foundingReason: "custom",
        foundingDetails: circumstances,
        setupAt: "2026-10-01T12:00:00Z",
        playerBackground: DEFAULT_PLAYER_BACKGROUND,
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
      const dialogue = await currentScenePrompt(state, card, "chat", "Why are we here?");
      assert.ok(dialogue.includes(setting));
      assert.ok(dialogue.includes(VILLAGE_SHARED_SETTING_RULE));
      const events = buildResidentPlanningMessages({
        descriptionVersion: 1,
        village: name,
        setting: current,
        moment,
        residents: [],
        recent: [],
        venues: [],
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
          wishes: [],
          activeWishes: [],
          schedule: null,
        },
        async () => {},
      );
      assert.equal(calls, previousCalls + 1, "grounding adds no generation requests");
      assert.equal(Object.hasOwn(result, "wishes"), false);
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
      foundingGuidance: "RETIRED_DIRECTION_SENTINEL",
    };
    await proposeCompactFounding(
      {
        village: "Long context",
        setting: villageFoundingSetting(full),
        home: "Room",
        card,
        venues: [],
        lore: [],
        wishes: [],
        activeWishes: [],
        schedule: null,
      },
      async () => {},
    );
    assert.ok(captured.includes(full.foundingDetails));
    assert.doesNotMatch(captured, /RETIRED_DIRECTION_SENTINEL|Player-authored creative preferences/);
    const map = buildTownMapPrompt("No water or decorative buildings.", scenarios[4][1]);
    assert.match(map, /Map details take priority over conflicting Village description/);
    assert.match(map, /Map details: No water or decorative buildings/);
    assert.throws(
      () => buildTownMapPrompt(undefined, "x".repeat(2000), "", null, "s".repeat(600)),
      /characters over.*no image request was made/,
      "individually valid maximum inputs share a final allowance",
    );
    // Later physical receipts remain authoritative even when the starting description is unchanged.
    const common = defaultVenueSpace("community", "A farmhouse kitchen");
    common.description += ". The roof leaks";
    const farm = coerceVillageState({
      ...defaultVillageState(),

      wishSystemVersion: 3,
      seed: "farm-progress",
      setupAt: "2026-10-01T12:00:00Z",
      setting: "An abandoned farm. " + "Fields and trees. ".repeat(40) + "The farmhouse roof leaks.",
      venues: [
        {
          id: "common-room",
          name: "Farmhouse",
          form: "Farmhouse",
          classes: ["community"],
          description: "A farmhouse with a leaking roof",
          spaces: [common],
          playerSeenPublic: true,
        },
      ],
    });
    const farmhouse = farm.venues[0]!;
    const zone = venueZones(farmhouse).find((row) => row.kind === "public")!;
    applyVenueSceneChange(
      farm,
      farmhouse.id,
      {
        narration: "The roof is repaired.",
        expectedRevision: 0,
        edits: [{ before: "The roof leaks", after: "The repaired roof is watertight" }],
      },
      "roof-repair",
      "2026-10-02T12:00:00Z",
      "community",
      "public",
      "",
      zone.id,
      { actorIds: ["player"], witnessIds: [], consentIds: [], positions: { player: zone.id } },
    );
    const savedFarm = coerceVillageState(JSON.parse(JSON.stringify(farm)));
    const currentFarmhouse = savedFarm.venues[0]!;
    const currentZone = venueZones(currentFarmhouse).find((row) => row.kind === "public")!;
    assert.match(currentZone.description, /The repaired roof is watertight/);
    const farmPrompt = await currentScenePrompt(savedFarm, card, "chat", "How is the farmhouse?", {
      zoneId: zone.id,
      area: "public",
      spaceClass: "community",
    });
    assert.ok(farmPrompt.includes("The repaired roof is watertight"));
    assert.ok(farmPrompt.includes(savedFarm.setting), "the complete authored background remains intact");
    const farmImage = buildLocationPrompt(
      savedFarm,
      venueInZone(currentFarmhouse, currentZone.id),
      moment,
      "",
      "interior",
    );
    assert.ok(farmImage.includes("The repaired roof is watertight"));
    assert.ok(
      farmImage.includes(savedFarm.setting),
      "image context retains conditions beyond its former 400-character cut",
    );
    const storyContext = {
      village: "Farm",
      setting: savedFarm.setting,
      moment,
      residents: [],
      recent: [],
      venues: [],
      opportunities: [],
      lastSimulatedAt: farm.setupAt,
      forced: false,
    };
    const legacyStory = buildResidentPlanningMessages(storyContext)
      .map((row) => row.content)
      .join("\\n");
    assert.equal(legacyStory.includes(savedFarm.setting), true, "resident planning keeps the complete setting");
    const currentStory = buildResidentPlanningMessages({ ...storyContext, descriptionVersion: 1 })
      .map((row) => row.content)
      .join("\\n");
    assert.ok(currentStory.includes(savedFarm.setting), "new story jobs carry the complete description");
    assert.equal(savedFarm.setting, farm.setting, "recording a repair never rewrites authored background");

    const legacy = coerceVillageState({
      ...defaultVillageState(),

      wishSystemVersion: 3,
      setupAt: "2025-01-01T00:00:00Z",
      setting: "Old harbor",
      foundingDetails: "On Day 1 we arrived.",
      promptKnowledge: "My custom prompt",
      playerBackground: "I arrived to help the harbor.",
    });
    assert.equal(legacy.foundingDetails, "On Day 1 we arrived.");
    assert.equal(legacy.promptKnowledge, "My custom prompt");
    assert.equal(legacy.playerBackground, "I arrived to help the harbor.");
    assert.equal(
      coerceVillageState({ ...defaultVillageState(), wishSystemVersion: 3, setupAt: legacy.setupAt }).playerBackground,
      "",
    );
    assert.equal(usageDocument.data.requests.length, calls, "every grounding request is accounted for");
    assert.ok(usageDocument.data.requests.every((request: any) => request.status === "complete"));
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
