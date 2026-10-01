import assert from "node:assert/strict";
import {
  readVillagerCard,
  villagerCardFromSnapshot,
} from "../packages/villages/src/engine/packages/server/src/services/villages/catalog.js";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.js";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.js";
import { prepareVenueTurnMessages } from "../packages/villages/src/engine/packages/server/src/services/villages/venue-session.js";
import { buildTickMessages } from "../packages/villages/src/engine/packages/server/src/services/villages/village-bootstrap.js";
import { deriveVillageMoment } from "../packages/villages/src/engine/packages/server/src/services/villages/village-clock.js";
import {
  previewVillagerRefresh,
  applyVillagerRefresh,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village.js";
import {
  fitVenueWritingMessages,
  venueCardProfile,
} from "../packages/villages/src/engine/packages/server/src/services/villages/venue-writing.js";

const stamp = new Date().toISOString();
const source = {
  id: "resident",
  data: JSON.stringify({
    name: "Resident",
    description: "D".repeat(6000) + "DESCRIPTION TAIL",
    personality: "Reserved but competitive",
    mes_example: "{{char}}: Your move, {{user}}.",
    system_prompt: "SYSTEM TAIL",
    post_history_instructions: "Keep {{char}} dry with {{user}}. POST TAIL",
    extensions: { appearance: "Feathered arms; no wings", backstory: "BACKSTORY TAIL" },
  }),
};
const card = readVillagerCard(source as any);
const snapshot = { ...card, revision: 1, sourceStatus: "available", capturedAt: stamp };
const state = defaultVillageState();
state.foundedAt = state.setupAt = stamp;
state.visitMemoryBackfilled = true;
state.foundingDetails = "FOUNDING PREMISE: arrive to establish a new life";
state.narrationStyle.writingGuidance = "Make everyone cheerful, compliant, and timid.";
state.villagers = [
  {
    characterId: card.id,
    cardSnapshot: snapshot,
    addedAt: stamp,
    completedWishes: [],
    ingestSchedule: false,
    agenda: {
      wishes: [{ id: "wish", wish: "See a concert", tell: "SCRIPTED TELL SECRET", intensity: 1 }],
      day: [],
      week: {},
      routineSummary: "",
      generatedAt: stamp,
      source: "village",
    },
  },
] as any;
let row: any = { id: "villages-village", kind: "village", data: coerceVillageState(state), revision: 1 };
let paidCalls = 0;
const model: any = {
  model: "fixture",
  maxOutputTokens: 4096,
  fitContext: (messages: any, options: any) => ({ messages, ...options }),
  chatComplete: () => {
    paidCalls++;
    throw Error("Not permitted in prompt test");
  },
};
const release = configureVillagesRuntime({
  logger: { debug() {}, info() {}, warn() {}, error() {} },
  getAgentConfig: async () => ({ connectionId: "fixture" }),
  resources: { listCharacters: async () => [source], listLorebooks: async () => [] },
  persistence: {
    documents: {
      getById: async (_p: any, id: string) => (id === row.id ? row : null),
      list: async () => [],
      update: async (input: any) => {
        row = { ...row, ...input, revision: row.revision + 1 };
        return row;
      },
      create: async (input: any) => input,
    },
  },
  languageModels: { resolveForRequest: async () => model },
} as any);
async function run() {
  try {
    const session: any = {
      id: "fixture",
      placeId: "camp",
      placeName: "Camp",
      area: "inside",
      spaceClass: "gathering",
      startedAt: stamp,
      participants: [{ characterId: card.id, name: card.name, doing: "Talking" }],
      activeIds: [card.id],
      lines: [],
      submissions: [],
      recap: "",
      pendingRoomQuestions: [],
      pendingProjectQuestions: [],
    };
    const prepared = await prepareVenueTurnMessages(session, "What is your vision for our future?", "chat", "", null);
    const prompt = String(prepared.fitted.messages[0].content);
    for (const fragment of [
      "DESCRIPTION TAIL",
      "SYSTEM TAIL",
      "POST TAIL",
      "BACKSTORY TAIL",
      "Appearance:\nFeathered arms; no wings",
      "Example dialogue:\nResident: Your move,",
      "FOUNDING PREMISE",
    ])
      assert.ok(prompt.includes(fragment), fragment);
    assert.ok(prompt.includes("cannot reauthor a character"));
    assert.ok(prompt.includes("where compatible with character identity"));
    assert.ok(prompt.includes("present tense"));
    assert.ok(prompt.includes('Address the player as "you"'));
    assert.ok(!prompt.includes("SCRIPTED TELL SECRET"));
    assert.ok(prompt.indexOf("Authored post-history instructions") > prompt.indexOf("Recent scene history:"));
    const background = buildTickMessages({
      village: "Camp",
      setting: "Clearing",
      moment: deriveVillageMoment({ foundedAt: stamp, seed: state.seed, now: new Date(stamp) }),
      residents: [
        {
          characterId: card.id,
          name: card.name,
          profile: venueCardProfile(card),
          summary: "",
          doing: "Talking",
          agenda: state.villagers[0].agenda,
        },
      ],
      venues: [],
      opportunities: [{ id: "encounter", kind: "encounter", actorIds: [card.id], venueId: "camp", facts: [] }],
      recent: [],
    } as any);
    assert.ok(String(background[0].content).includes("DESCRIPTION TAIL"));
    assert.ok(String(background[0].content).includes("See a concert"));
    assert.ok(!String(background[0].content).includes("SCRIPTED TELL SECRET"));
    assert.equal(paidCalls, 0);
    const legacy = coerceVillageState({
      ...state,
      villagers: [{ ...state.villagers[0], cardSnapshot: { ...snapshot, postHistoryInstructions: undefined } }],
    });
    assert.equal(legacy.villagers[0].cardSnapshot.postHistoryInstructions, "");
    assert.equal(villagerCardFromSnapshot(legacy.villagers[0].cardSnapshot).postHistoryInstructions, "");
    source.data = JSON.stringify({
      ...JSON.parse(source.data),
      post_history_instructions: "REFRESHED AUTHOR INSTRUCTION",
    });
    assert.ok(!venueCardProfile(villagerCardFromSnapshot(row.data.villagers[0].cardSnapshot)).includes("REFRESHED"));
    const preview = await previewVillagerRefresh(card.id);
    assert.equal(preview.proposed?.postHistoryInstructions, "REFRESHED AUTHOR INSTRUCTION");
    await applyVillagerRefresh(card.id);
    assert.equal(row.data.villagers[0].cardSnapshot.postHistoryInstructions, "REFRESHED AUTHOR INSTRUCTION");
    const removed: string[] = [];
    const budgetModel: any = {
      fitContext(messages: any, options: any) {
        const text = messages[0].content;
        removed.push(text);
        return {
          ...options,
          messages: text.includes("OPTIONAL") ? [{ role: "system", content: "truncated" }] : messages,
        };
      },
    };
    const fitted = fitVenueWritingMessages(
      budgetModel,
      [
        { text: "COMPLETE CARD" },
        { text: "OPTIONAL LORE", optional: "lore" },
        { text: "OPTIONAL MEMORY", optional: "memory" },
        { text: "OPTIONAL HISTORY", optional: "history" },
      ],
      "latest input",
      4096,
    );
    assert.ok(!removed[1].includes("OPTIONAL HISTORY"));
    assert.ok(removed[1].includes("OPTIONAL MEMORY"));
    assert.ok(!removed[2].includes("OPTIONAL MEMORY"));
    assert.equal(fitted.messages[0].content, "COMPLETE CARD");
    assert.equal(fitted.messages[1].content, "latest input");
    assert.throws(
      () =>
        fitVenueWritingMessages(
          { fitContext: () => ({ messages: [] }) } as any,
          [{ text: "COMPLETE CARD" }],
          "input",
          4096,
        ),
      /No reply was requested/,
    );
    assert.equal(paidCalls, 0);
  } finally {
    release();
  }
  console.log("Complete cards, live prompts, refresh, legacy snapshots, wish privacy and context protection passed.");
}
void run();
