import { fixtureVillageState } from "./helpers/village-storage.fixture.js";
import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";
import { addMemory } from "./helpers/memories-fixture.js";
import assert from "node:assert/strict";

import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { prepareVenueTurnMessages } from "../packages/villages/src/server/features/scenes/writing.js";
import {
  relationshipPrompt,
  relationshipWritingPrompt,
} from "../packages/villages/src/server/domain/rules/relationship-presentation.js";
import {
  defaultRelationshipState,
  neutralRelationship,
  relationshipKey,
} from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { RELATIONSHIP_REVIEW_INSTRUCTION } from "../packages/villages/src/server/domain/rules/relationship-review.js";

const stamp = new Date().toISOString();
const state = defaultVillageState();
state.foundedAt = state.setupAt = stamp;

state.narrationStyle.writingGuidance = "Make all residents agreeable and reluctant to act.";
state.villagers = ["outgoing", "reserved"].map((id) => ({
  characterId: id,
  addedAt: stamp,
  completedWishes: [],
  cardSnapshot: {
    id,
    name: id,
    description: "FULL CARD ".repeat(500) + id + " DESCRIPTION TAIL",
    personality:
      id === "outgoing"
        ? "Outgoing, energetic, opinionated; enjoys inviting people."
        : "Quiet, selective, competitive; acts readily when a challenge matters.",
    appearance: id + " APPEARANCE",
    backstory: id + " BACKSTORY",
    exampleDialogue: id + " VOICE EXAMPLE",
    postHistoryInstructions: id + " AUTHORED INSTRUCTION",
    revision: 1,
    sourceStatus: "available",
    capturedAt: stamp,
  },
  agenda: {
    day: [],
    week: {},
    routineSummary: "",
    generatedAt: stamp,
    source: "village",
    wishes: [{ id: id + "-wish", wish: "Hear a concert", tell: "LEGACY TELL SECRET" }],
  },
})) as any;
state.venues = [
  {
    id: "camp",
    name: "Camp",
    classes: ["community"],
    residentIds: [],
    workerIds: [],
    occupancy: { playerHome: false, residentCharacterId: null },
    zones: [
      {
        id: "exterior",
        name: "Clearing",
        kind: "exterior",
        description: "A clearing with a bench.",
        state: { condition: "undeveloped", furniture: ["bench"], features: [], publicFacts: [], traces: [] },
      },
    ],
    state: { condition: "undeveloped", furniture: ["bench"], features: [], publicFacts: [], traces: [] },
    editProposals: [],
  },
] as any;
state.memories = addMemory(state.memories, {
  sourceId: "dialogue-0",
  text: "Reserved promised to repair Alex’s violin on Sunday.",
  audience: ["reserved"],
});
state.memories = addMemory(state.memories, {
  sourceId: "dialogue-1",
  text: "ABSENT PERSON SECRET",
  audience: ["absent"],
});
state.memories = addMemory(state.memories, {
  sourceId: "dialogue-2",
  text: "Reserved and the player are discussing the violin.",
  audience: ["reserved"],
});
state.relationshipContext = defaultRelationshipState(state.seed);
const original = structuredClone(state.relationshipContext);
for (const id of ["outgoing", "reserved"]) {
  const writing = relationshipWritingPrompt(state, id);
  assert.ok(writing.includes("Missing history establishes neither distrust nor intimacy"));
  assert.ok(!writing.includes("Unestablished"));
  assert.ok(!writing.includes("warmth 0"));
  assert.ok(!writing.includes("trust 0"));
  assert.ok(!writing.includes("whenever"));
}
assert.deepEqual(state.relationshipContext, original, "Writing rendering does not change relationship state");
state.relationshipContext.edges[relationshipKey("outgoing", "player")] = {
  ...neutralRelationship("outgoing", "player"),
  connection: "Friends",
  stance: "Values the player's reliability",
  revision: 1,
  experiences: ["trust"],
};
state.relationshipContext.edges[relationshipKey("reserved", "player")] = {
  ...neutralRelationship("reserved", "player"),
  connection: "Strained acquaintances",
  stance: "Distrustful after a broken promise",
  revision: 1,
};
const after = structuredClone(state.relationshipContext.edges[relationshipKey("outgoing", "player")]!);
state.relationshipContext.receipts.trust = {
  id: "trust",
  fromId: "outgoing",
  toId: "player",
  beforeRevision: 0,
  sceneAfter: after,
  liveAfter: after,
  at: stamp,
  reason: "Returned the borrowed camera intact",
  sourceId: "earlier",
  lineIds: ["earlier"],
  evidence: [],
};
assert.ok(
  !relationshipWritingPrompt(state, "outgoing").includes("Returned the borrowed camera intact"),
  "Historical receipts cannot bypass Memory recall or player repair",
);
assert.ok(relationshipWritingPrompt(state, "reserved").includes("Distrustful after a broken promise"));
assert.ok(relationshipPrompt(state, "outgoing").includes("Values the player's reliability"));

let paidCalls = 0;
let shrink = false;
const model: any = {
  model: "fixture",
  maxOutputTokens: 4096,
  fitContext: (messages: any, options: any) => ({ ...options, messages: shrink ? [] : messages }),
  chatComplete() {
    paidCalls++;
    throw Error("Prompt regressions must not call a model");
  },
};
const savedRows = new Map<string, any>([
  ["villages-village", { id: "villages-village", packageId: "villages", kind: "village", data: state, revision: 1 }],
]);
const release = configureVillagesRuntime({
  logger: { debug() {}, info() {}, warn() {}, error() {} },
  getAgentConfig: async () => ({ connectionId: "fixture" }),
  resources: { listLorebooks: async () => [], listCharacters: async () => [] },
  persistence: {
    documents: villageFixtureDocuments({
      getById: async (_pkg: any, id: string) => structuredClone(savedRows.get(id) ?? null),
      list: async (_pkg: any, kind: string) =>
        [...savedRows.values()].filter((row) => row.kind === kind).map((row) => structuredClone(row)),
      update: async (input: any) => {
        const old = savedRows.get(input.id);
        if (!old || old.revision !== input.expectedRevision) return null;
        const row = { ...old, ...structuredClone(input), revision: old.revision + 1 };
        savedRows.set(input.id, row);
        if (input.id === "villages-village") Object.assign(state, fixtureVillageState(input.data, savedRows));
        return structuredClone(row);
      },
      create: async (input: any) => {
        const row = { ...structuredClone(input), revision: 1 };
        savedRows.set(input.id, row);
        return structuredClone(row);
      },
      remove: async (_pkg: any, id: string, revision: number) => {
        if (savedRows.get(id)?.revision !== revision) return false;
        savedRows.delete(id);
        return true;
      },
    }),
  },
  languageModels: { resolveForRequest: async () => model },
} as any);
async function run() {
  try {
    const scene: any = {
      version: 2,
      id: "fixture",
      placeId: "camp",
      placeName: "Camp",
      zoneId: "exterior",
      area: "outside",
      spaceClass: "community",
      startedAt: stamp,
      memoryMode: "live",
      processingVersion: 1,
      participants: state.villagers.map((person) => ({
        characterId: person.characterId,
        name: person.cardSnapshot.name,
        doing: "Talking",
      })),
      activeIds: ["outgoing", "reserved"],
      lines: [
        {
          id: "earlier-spoken",
          role: "assistant",
          speakerId: "reserved",
          name: "reserved",
          kind: "dialogue",
          content: "I prefer an early start.",
          heardBy: ["reserved", "outgoing"],
          at: stamp,
        },
      ],
      submissions: [],
      recap: "",
      pendingRoomQuestions: [],
      pendingProjectQuestions: [],
    };
    const prompt = String(
      (await prepareVenueTurnMessages(scene, "What about Alex’s violin music?", "chat", "outgoing", null)).fitted
        .messages[0].content,
    );
    const positions = [
      "## Writing direction",
      "## Complete authored character identity",
      "## Current Scene circumstances",
      "## Witnessed conversation",
      "## Authored post-history direction",
      "## Response format and evidence metadata",
    ].map((heading) => prompt.indexOf(heading));
    assert.ok(positions.every((position, i) => position >= 0 && (!i || position > positions[i - 1])));
    for (const person of state.villagers)
      for (const suffix of ["DESCRIPTION TAIL", "APPEARANCE", "BACKSTORY", "VOICE EXAMPLE", "AUTHORED INSTRUCTION"])
        assert.ok(prompt.includes(person.characterId + " " + suffix), suffix);
    assert.ok(prompt.indexOf('"id":"earlier-spoken"') < prompt.indexOf("outgoing AUTHORED INSTRUCTION"));
    assert.ok(prompt.includes("where compatible with character identity"));
    assert.ok(prompt.includes("Their card determines") || prompt.includes("their card determines"));
    assert.ok(!prompt.includes("LEGACY TELL SECRET"));
    assert.ok(prompt.includes(state.memories.records[0].text), "Relevant native memory is recalled");
    assert.ok(prompt.includes(state.memories.records[2].text), "Contextual memory is recalled");
    assert.ok(prompt.includes('"audience":["reserved"]'));
    assert.ok(prompt.includes('"rootRevision":'));
    assert.ok(!prompt.includes("ABSENT PERSON SECRET"));
    assert.ok(!prompt.includes("Pending exact Residence edit proposals:"));
    assert.ok(!prompt.includes("Pending player requests to move:"));
    for (const field of [
      "contactIntent",
      "sceneChange",
      "residenceRequest",
      "residenceDecision",
      "renovationRequest",
      "venueRequest",
      "editApproval",
      "memoryChanges",
      "relationshipChanges",
      "wishChanges",
      "departures",
      "sceneEnded",
    ])
      assert.ok(prompt.includes(field), field);
    assert.ok(prompt.includes("One-visit permission and unconditional standing invitations are distinct"));
    assert.ok(prompt.includes("Conditional willingness is not an unconditional commitment or standing invitation"));
    assert.ok(prompt.includes("contextual entry cautions remain meaningful"));
    assert.ok(prompt.includes("Only an authorized controller"));
    assert.ok(prompt.includes("Targeting is intent, not isolation"));
    assert.ok(prompt.includes("Never narrate a lasting change without a valid sceneChange"));
    assert.ok(prompt.includes("Every knower must directly witness EVERY cited line"));
    assert.ok(prompt.includes("sceneAfter"));
    assert.ok(RELATIONSHIP_REVIEW_INSTRUCTION.includes("liveAfter"));
    assert.ok(prompt.includes("accepted"));
    const playerGuard = "The player controls their own speech, decisions, actions, thoughts, feelings, and consent";
    assert.ok(prompt.includes(playerGuard));
    scene.memoryMode = "live";
    const opening = String((await prepareVenueTurnMessages(scene, "", "greet", "", null)).fitted.messages[0].content);
    assert.ok(opening.includes("Opening heardPlayerBy is empty"));
    assert.ok(opening.includes("memoryChanges:"));
    assert.ok(!opening.includes("recollections:["));
    assert.ok(!opening.includes("contactIntent:"));
    const currentTurn = String(
      (await prepareVenueTurnMessages(scene, "Your move.", "chat", "reserved", null)).fitted.messages[0].content,
    );
    assert.ok(!currentTurn.includes("recollections:["));
    assert.ok(currentTurn.includes("memoryChanges:"));
    scene.memoryMode = "live";
    scene.area = "private";
    const controlled = String(
      (await prepareVenueTurnMessages(scene, "I rearrange the room.", "chat", "", null)).fitted.messages[0].content,
    );
    assert.ok(controlled.includes("every required resident's explicit approval of the exact Zone edit proposal"));
    assert.ok(controlled.includes("Entry is not edit consent"));
    scene.area = "outside";
    scene.activeIds = ["reserved"];
    const one = String(
      (await prepareVenueTurnMessages(scene, "Your move.", "ask", "reserved", null)).fitted.messages[0].content,
    );
    assert.ok(one.includes("reserved DESCRIPTION TAIL"));
    assert.ok(!one.includes("outgoing DESCRIPTION TAIL"));
    shrink = true;
    await assert.rejects(
      prepareVenueTurnMessages(scene, "Your move.", "ask", "reserved", null),
      /No reply was requested/,
    );
    assert.equal(paidCalls, 0);
  } finally {
    release();
  }
  console.log(
    "Dialogue context: temperament/history separation, full cards, section order, spontaneous effects, live evidence, and fitting passed without model requests.",
  );
}
void run();
