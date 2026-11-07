import { agendaFixture } from "./helpers/agenda.fixture.js";
import assert from "node:assert/strict";
import { mapScenePeople } from "../packages/villages/src/server/domain/rules/scene-prompt-references.js";
import { context } from "../packages/villages/src/server/adapters/operations/operation-context.js";
import { addMemory } from "./helpers/memories-fixture.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import { fixtureVillageState, villageFixtureDocuments } from "./helpers/village-storage.fixture.js";

import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { relationshipWritingPrompt } from "../packages/villages/src/server/domain/rules/relationship-presentation.js";
import { RELATIONSHIP_REVIEW_INSTRUCTION } from "../packages/villages/src/server/domain/rules/relationship-review.js";
import {
  defaultRelationshipState,
  neutralRelationship,
  relationshipKey,
} from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { prepareVenueTurnMessages } from "../packages/villages/src/server/features/scenes/writing.js";
import { scenePromptHistory, scenePromptPacket } from "./fixtures/villages-scene-writing.fixture.js";

const stamp = new Date().toISOString();
const state = defaultVillageState();
state.seed = "dialogue-context";
state.foundedAt = state.setupAt = stamp;

state.narrationStyle.writingGuidance = "Make all residents agreeable and reluctant to act.";
state.villagers = ["outgoing", "reserved"].map((id) => ({
  letterFontId: "caveat",
  characterId: id,
  addedAt: stamp,
  wishes: [],
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
  agenda: agendaFixture({
    day: [],
    week: {},
    routineSummary: "",
    generatedAt: stamp,
    source: "village",
  }),
})) as any;
state.venues = [
  venueFixture({
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
        state: { revision: 0, updatedAt: "", recent: null },
      },
    ],
    state: { revision: 0, updatedAt: "", recent: null },
  }),
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
  sceneBeforeRevision: 0,
  sequence: ++state.relationshipContext.eventSequence,
  liveAfter: {
    connection: after.connection,
    stance: after.stance,
    expectations: after.expectations,
    concerns: after.concerns,
    records: Object.values(after.records),
  },
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
assert.ok(relationshipWritingPrompt(state, "outgoing").includes("Values the player's reliability"));

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
      semanticVersion: 2,
      villageSeed: state.seed,
      version: 4,
      id: "fixture",
      placeId: "camp",
      placeName: "Camp",
      zoneId: "exterior",
      area: "outside",
      spaceClass: "community",
      startedAt: stamp,
      memoryMode: "live",
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
      (
        await prepareVenueTurnMessages(scene, "What about Alex’s violin music?", "chat", "outgoing", null)
      ).fitted.messages
        .map((entry) => entry.content)
        .join("\n"),
    );
    const changing = await prepareVenueTurnMessages(
      {
        ...scene,
        startedAt: new Date(Date.parse(stamp) + 60_000).toISOString(),
        sceneRevision: 99,
        participants: [...scene.participants].reverse(),
        activeIds: [...scene.activeIds].reverse(),
        lines: [...scene.lines, { ...scene.lines[0], id: "another-source", content: "A newly witnessed fact." }],
      },
      "A new input.",
      "chat",
      "",
      null,
    );
    const original = await prepareVenueTurnMessages(scene, "What about Alex’s violin music?", "chat", "outgoing", null);
    const originalSystem = original.fitted.messages[0];
    assert.deepEqual(
      changing.fitted.messages[0],
      originalSystem,
      "The entire system message is stable, not merely its opening prefix",
    );
    assert.equal(changing.fitted.messages[1].role, "user");
    assert.ok(changing.fitted.messages[1].content.includes("A newly witnessed fact."));
    assert.ok(Object.values(changing.historyContract!.references).includes("another-source"));
    assert.ok(originalSystem.content.includes("## World and player context"));
    assert.ok(!originalSystem.content.includes("earlier-spoken"));
    assert.ok(!originalSystem.content.includes('"calendar":'));
    assert.equal(changing.gmContext.revision, 99);
    assert.deepEqual(changing.fitted.messages.at(-1), { role: "user", content: "A new input." });
    const changedPrompt = changing.fitted.messages.map((entry) => entry.content).join("\n");
    assert.deepEqual(
      scenePromptPacket(changedPrompt).scene,
      scenePromptPacket(prompt).scene,
      "Clock, query and actor ordering leave reusable Scene facts unchanged",
    );
    for (const row of scenePromptHistory(prompt))
      assert.deepEqual(
        scenePromptHistory(changedPrompt).find((next) => next.id === row.id),
        row,
        "Appending history cannot rewrite prior evidence records",
      );
    assert.equal(
      scenePromptPacket(changedPrompt).context.revision,
      undefined,
      "Global CAS revision stays in captured authority, not model data",
    );
    const positions = [
      "## Writing direction",
      "## Complete authored character identity",
      "## Witnessed conversation",
      "## Scene facts",
      "## Current Scene circumstances",
      "## Authored post-history direction",
    ].map((heading) => prompt.indexOf(heading));
    assert.ok(positions.every((position, i) => position >= 0 && (!i || position > positions[i - 1])));
    for (const person of state.villagers)
      for (const suffix of ["DESCRIPTION TAIL", "APPEARANCE", "BACKSTORY", "VOICE EXAMPLE", "AUTHORED INSTRUCTION"])
        assert.ok(prompt.includes(person.characterId + " " + suffix), suffix);
    const historyAt = prompt.indexOf("I prefer an early start.");
    assert.ok(historyAt >= 0 && historyAt < prompt.indexOf("outgoing AUTHORED INSTRUCTION"));
    assert.ok(prompt.includes("where compatible with character identity"));
    assert.ok(prompt.includes("Preserve complete authored identity"));
    assert.ok(!prompt.includes("LEGACY TELL SECRET"));
    assert.ok(prompt.includes(state.memories.records[0].text), "Relevant native memory is recalled");
    assert.ok(prompt.includes(state.memories.records[2].text), "Contextual memory is recalled");
    const recalled = prompt
      .split("\n")
      .filter((line) => line.startsWith("Recalled Memory: "))
      .map(
        (line) =>
          mapScenePeople(JSON.parse(line.slice("Recalled Memory: ".length)), original.historyContract!.people!) as any,
      );
    assert(
      recalled.some((row) => JSON.stringify(Object.keys(row.knowers)) === '["reserved"]'),
      "Read DTO preserves the private Memory's exact knower scope",
    );
    assert.ok(!prompt.includes('"rootRevision":'));
    assert.ok(
      original.gmContext._memoryWrite.recall.candidates.some((row) => typeof row.rootRevision === "number"),
      "Captured Memory revisions remain available for stale-write validation",
    );
    assert.ok(!prompt.includes("ABSENT PERSON SECRET"));
    assert.ok(!prompt.includes("Pending exact Residence edit proposals:"));
    assert.ok(!prompt.includes("Pending player requests to move:"));
    assert.match(prompt, /server validation determines what applies/);

    assert.ok(RELATIONSHIP_REVIEW_INSTRUCTION.includes("liveAfter"));

    const playerGuard = "The player controls their own speech, decisions, actions, thoughts, feelings, and consent";
    assert.ok(prompt.includes(playerGuard));
    scene.memoryMode = "live";
    const opening = (await prepareVenueTurnMessages(scene, "", "greet", "", null)).fitted.messages
      .map((entry) => entry.content)
      .join("\n");

    assert.ok(!opening.includes("recollections:["));
    assert.ok(!opening.includes("contactIntent:"));
    const currentTurn = String(
      (await prepareVenueTurnMessages(scene, "Your move.", "chat", "reserved", null)).fitted.messages
        .map((entry) => entry.content)
        .join("\n"),
    );
    assert.ok(!currentTurn.includes("recollections:["));

    scene.memoryMode = "live";
    scene.area = "private";
    const controlled = String(
      (await prepareVenueTurnMessages(scene, "I rearrange the room.", "chat", "", null)).fitted.messages
        .map((entry) => entry.content)
        .join("\n"),
    );
    assert.match(controlled, /Optional access:/);
    scene.area = "outside";
    scene.activeIds = ["reserved"];
    const one = String(
      (await prepareVenueTurnMessages(scene, "Your move.", "chat", "reserved", null)).fitted.messages
        .map((entry) => entry.content)
        .join("\n"),
    );
    assert.ok(one.includes("reserved DESCRIPTION TAIL"));
    assert.ok(!one.includes("outgoing DESCRIPTION TAIL"));
    shrink = true;
    await assert.rejects(
      prepareVenueTurnMessages(scene, "Your move.", "chat", "reserved", null),
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
await context.run(
  {
    controller: new AbortController(),
    operation: {
      id: "prompt",
      input: {
        writingContractVersion: 3,
        semanticPipelineVersion: 3,
        residentActionsVersion: 2,
        interactionScopeVersion: 6,
      },
      checkpoints: {},
    },
  } as any,
  run,
);
