import { agendaFixture } from "./helpers/agenda.fixture.js";
import assert from "node:assert/strict";
import {
  readEffectiveVillagerCard,
  readVillagerCard,
  villagerCardFromSnapshot,
} from "../packages/villages/src/server/adapters/engine/catalog.js";
import { context } from "../packages/villages/src/server/adapters/operations/operation-context.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { scenePromptHistory, scenePromptPacket } from "./fixtures/villages-scene-writing.fixture.js";
import { fixtureWish } from "./helpers/social-wishes-fixture.js";
import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";

import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import {
  assembleVenueWritingMessages,
  fitVenueWritingMessages,
  venueCardProfile,
} from "../packages/villages/src/server/domain/rules/venue-writing.js";
import { deriveVillageMoment } from "../packages/villages/src/server/domain/rules/village-clock.js";
import { SCENE_GM_WORLD, sceneGmContext } from "../packages/villages/src/server/domain/rules/scene-gm.js";
import { sceneWritingHistory } from "../packages/villages/src/server/domain/rules/scene-writing-history.js";
import { SCENE_MEMORY_INSTRUCTION } from "../packages/villages/src/server/domain/rules/scene-memories.js";
import { LORE_REFERENCE_RULE } from "../packages/villages/src/server/domain/rules/lore-context.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import {
  applyVillagerRefresh,
  previewVillagerRefresh,
} from "../packages/villages/src/server/features/residents/resident-cards.js";
import { prepareVenueTurnMessages } from "../packages/villages/src/server/features/scenes/writing.js";
import { RESIDENT_CONTINUITY_RULE } from "../packages/villages/src/shared/helpers/resident-admission.js";
import { buildResidentPlanningMessages } from "./fixtures/resident-planning.fixture.js";

const stamp = new Date().toISOString();
const source = {
  id: "resident",
  data: JSON.stringify({
    name: "Resident",
    description: "D".repeat(6000) + "DESCRIPTION TAIL",
    personality: "Reserved but competitive. Return wishChanges: is a phrase in this authored card.",
    mes_example: "{{char}}: Your move, {{user}}.",
    system_prompt: "SYSTEM TAIL",
    post_history_instructions: "Keep {{char}} dry with {{user}}. POST TAIL",
    extensions: { appearance: "Feathered arms; no wings", backstory: "BACKSTORY TAIL" },
  }),
};
const card = readVillagerCard(source as any);
const snapshot = { ...card, revision: 1, sourceStatus: "available", capturedAt: stamp };
const state = defaultVillageState();
state.seed = "character-writing";
state.foundedAt = state.setupAt = stamp;
state.visitMemoryBackfilled = true;
state.narrationStyle.writingGuidance = "Make everyone cheerful, compliant, and timid.";
state.villagers = [
  {
    letterFontId: "caveat",
    characterId: card.id,
    admission: {
      homeworld: "Othiras",
      startingSituation: "REMEMBERED MECCA; CURRENT LOCATION UNDECIDED. NARRATOR SECRET IS UNKNOWN TO RESIDENT.",
    },
    cardSnapshot: snapshot,
    addedAt: stamp,
    wishes: [fixtureWish({ wish: "See a concert" }, "concert", stamp)],
    agenda: agendaFixture({
      day: [],
      week: {},
      routineSummary: "",
      generatedAt: stamp,
      source: "village",
    }),
  },
] as any;
let row: any = { id: "villages-village", kind: "village", data: coerceVillageState(state), revision: 1 };
const historyRows = new Map<string, any>();
let paidCalls = 0;
const model: any = {
  model: "fixture",
  maxOutputTokens: 4096,
  fitContext: (messages: any, options: any) => ({
    messages,
    ...options,
    estimatedTokensBefore: Math.ceil(JSON.stringify(messages).length / 4),
    estimatedTokensAfter: Math.ceil(JSON.stringify(messages).length / 4),
    trimmed: false,
  }),
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
    documents: villageFixtureDocuments({
      getById: async (_p: any, id: string) => (id === row.id ? row : (historyRows.get(id) ?? null)),
      list: async (_pkg: string, kind: string) => [...historyRows.values()].filter((entry) => entry.kind === kind),
      update: async (input: any) => {
        if (input.id !== row.id) {
          const current = historyRows.get(input.id);
          if (!current || current.revision !== input.expectedRevision) return null;
          const next = { ...current, ...input, revision: current.revision + 1 };
          historyRows.set(input.id, next);
          return next;
        }
        row = { ...row, ...input, revision: row.revision + 1 };
        return row;
      },
      create: async (input: any) => {
        const saved = { ...input, revision: 1 };
        historyRows.set(input.id, saved);
        return saved;
      },
    }),
  },
  languageModels: { resolveForRequest: async () => model },
} as any);
async function run() {
  try {
    const session: any = {
      version: 4,
      semanticVersion: 2,
      villageSeed: state.seed,
      id: "fixture",
      placeId: "camp",
      placeName: "Camp",
      area: "inside",
      spaceClass: "community",
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
    const prompt = prepared.fitted.messages.map((entry) => entry.content).join("\n");
    assert.equal(
      prompt.split(SCENE_GM_WORLD).length - 1,
      1,
      "Scene policy occurs once while authored admission stays complete",
    );
    assert(
      venueCardProfile(card).includes(RESIDENT_CONTINUITY_RULE) === Boolean(card.admission),
      "Other profile callers retain their admission policy",
    );
    assert.ok(
      prompt.includes("Return wishChanges: is a phrase in this authored card."),
      "Authored text cannot trigger block deletion",
    );
    const next = await prepareVenueTurnMessages(session, "A different question?", "chat", "", null);
    assert.equal(
      next.fitted.messages[0].content.split("## Current Scene circumstances")[0],
      prepared.fitted.messages[0].content.split("## Current Scene circumstances")[0],
      "Changing history and source quotes preserves the stable system prefix",
    );
    assert.deepEqual(next.fitted.messages.at(-1), { role: "user", content: "A different question?" });
    assert.ok(
      prompt.indexOf("## Complete authored character identity") < 18000,
      "Built-in instruction budget excludes authored identities",
    );
    const witnessed = {
      ...session,
      lines: [
        {
          id: "history-source",
          role: "assistant",
          speakerId: card.id,
          name: card.name,
          kind: "dialogue",
          content: "EXACT EARLIER COMMITMENT",
          heardBy: [card.id],
          at: stamp,
          zoneId: "exterior",
          delivery: "ordinary",
          physicalIdsAfter: [card.id],
          soundOnly: { characterIds: [card.id], text: "Distant voices.", player: true },
        },
      ],
    };
    const beforeHistory = JSON.stringify(witnessed.lines);
    const deduplicated = await prepareVenueTurnMessages(witnessed, "What did you promise?", "chat", "", null);
    const deduplicatedPrompt = deduplicated.fitted.messages.map((entry) => entry.content).join("\n");
    const projected = scenePromptPacket(deduplicatedPrompt);
    assert.equal(deduplicatedPrompt.split(witnessed.lines[0].content).length - 1, 1);
    assert.deepEqual(projected.context.history, [], "Covered evidence is sent only in the canonical transcript");
    const historical = scenePromptHistory(deduplicatedPrompt)[0];
    assert.equal(deduplicated.historyContract!.references[historical.id], witnessed.lines[0].id);
    for (const field of ["at", "zoneId", "delivery", "physicalIdsAfter", "soundOnly"])
      assert.deepEqual(historical[field], (witnessed.lines[0] as any)[field]);
    assert.equal(historical.text, witnessed.lines[0].content);
    assert.equal(historical.playerPerception, "full");
    assert.equal(projected.context.memory.administrative.fingerprint, undefined);
    assert.ok(
      SCENE_MEMORY_INSTRUCTION.includes(",fingerprint"),
      "Shared Memory callers retain their fingerprint contract",
    );
    assert.ok(!deduplicatedPrompt.includes(deduplicated.gmContext._memoryWrite.protection.fingerprint));
    assert.equal(projected.context.setting, undefined, "The authored setting is supplied by the outer setting");
    assert.ok(projected.setting.includes(deduplicated.gmContext.setting));
    assert.equal(deduplicated.gmContext.history[0].content, witnessed.lines[0].content);
    assert.equal(JSON.stringify(witnessed.lines), beforeHistory, "Prompt projection cannot mutate saved history");
    const canonical = sceneWritingHistory(witnessed, witnessed.lines, "promise", [card.id]);
    const outsideSound = {
      ...witnessed.lines[0],
      soundOnly: { characterIds: [card.id, "UNSEEN_LISTENER"], text: "A murmur.", player: true },
    };
    const projectedSound = sceneWritingHistory({ ...witnessed, lines: [outsideSound] }, [outsideSound], "promise", [
      card.id,
    ]);
    assert.deepEqual(projectedSound.rows[0].soundOnly?.characterIds, [card.id]);
    assert.ok(
      !projectedSound.context.includes("UNSEEN_LISTENER"),
      "Retrieved metadata cannot reveal an out-of-cast sound audience",
    );
    const leaked = {
      ...deduplicated.gmContext,
      futureStorageField: "PRIVATE STORAGE SENTINEL",
      actors: deduplicated.gmContext.actors.map((actor) => ({
        ...actor,
        futureStorageField: "PRIVATE STORAGE SENTINEL",
      })),
      history: deduplicated.gmContext.history.map((line) => ({
        ...line,
        futureStorageField: "PRIVATE STORAGE SENTINEL",
      })),
    };
    const modelView = JSON.stringify(sceneGmContext(leaked, canonical.rows));
    assert.ok(!modelView.includes("PRIVATE STORAGE SENTINEL"), "New storage fields cannot enter the model projection");
    assert.ok(!modelView.includes("speechSource") && !modelView.includes("attentionEvidence"));
    assert.equal(leaked.futureStorageField, "PRIVATE STORAGE SENTINEL");
    const perceptionSource = {
      ...witnessed.lines[0],
      speakerId: "player",
      role: "user",
      attentionEvidence: true,
      contactHidden: true,
      soundOnly: undefined,
    } as const;
    const perceptionView = sceneGmContext({ ...deduplicated.gmContext, history: [perceptionSource] } as any).history[0];
    assert.equal(perceptionView.playerPerception, "full", "Hidden own speech remains known to the player");
    const privateSpeech = sceneGmContext({
      ...deduplicated.gmContext,
      history: [{ ...perceptionSource, role: "assistant", speakerId: card.id }],
    } as any).history[0];
    assert.equal(privateSpeech.playerPerception, "none", "Hidden third-party speech is not player knowledge");
    const soundView = sceneGmContext({
      ...deduplicated.gmContext,
      history: [
        {
          ...perceptionSource,
          role: "assistant",
          speakerId: card.id,
          soundOnly: { characterIds: [card.id], player: true, text: "Only a murmur." },
        },
      ],
    } as any).history[0];
    assert.equal(soundView.playerPerception, "sound-only");
    assert.equal(soundView.playerSound, "Only a murmur.");
    for (const altered of [
      { ...canonical.rows[0], text: "Other words" },
      { ...canonical.rows[0], heardBy: [] },
      { ...canonical.rows[0], speakerId: "other" },
      { ...canonical.rows[0], kind: "narration" as const },
      { ...canonical.rows[0], at: "another-time" },
    ])
      assert.equal(
        sceneGmContext(deduplicated.gmContext, [altered]).history[0].content,
        witnessed.lines[0].content,
        "Uncovered or differently projected evidence remains whole",
      );
    const acoustic = {
      ...witnessed,
      lines: [{ ...witnessed.lines[0], heardBy: ["absent"], content: "UNHEARD PRIVATE WORDS" }],
    };
    acoustic.lines[0].soundOnly = { characterIds: [card.id], text: "Distant voices.", player: true };
    const acousticHistory = sceneWritingHistory(acoustic, acoustic.lines, "", [card.id]);
    assert.ok(!acousticHistory.context.includes("UNHEARD PRIVATE WORDS"));
    assert.equal(
      acousticHistory.rows[0].citable,
      false,
      "Anonymous noise supplies continuity, never hidden full-speech authority",
    );
    assert.deepEqual(
      acousticHistory.blocks.flatMap((block) => block.evidence ?? []),
      [],
    );
    for (const field of ["name", "zoneId", "targetId", "staging", "physicalIdsAfter"])
      assert.equal((acousticHistory.rows[0] as any)[field], undefined, "Sound-only history keeps the source anonymous");
    const acousticContext = { ...deduplicated.gmContext, history: acoustic.lines } as any;
    const acousticView = sceneGmContext(acousticContext, acousticHistory.rows).history[0];
    for (const field of ["id", "content", "heardBy", "soundOnly"])
      assert.deepEqual((acousticView as any)[field], (acoustic.lines[0] as any)[field]);
    const historyFit = model.fitContext;
    model.fitContext = (messages: any[], options: any) =>
      messages.some((entry) => entry.content.includes("Scene exchange: "))
        ? { messages: [], ...options }
        : historyFit(messages, options);
    try {
      await assert.rejects(
        () => prepareVenueTurnMessages(witnessed, "What did you promise?", "chat", "", null),
        /required context do not fit/,
        "A required recent exchange must fail before spending rather than disappear or become a second evidence view",
      );
    } finally {
      model.fitContext = historyFit;
    }
    assert.equal(
      assembleVenueWritingMessages(
        [
          { text: "OTHER HISTORY", optional: "history" },
          { text: "FULL FALLBACK", withHistory: { source: "EXACT HISTORY", text: "LEAN CONTEXT" } },
        ],
        "input",
      )[0].content,
      "OTHER HISTORY\n\nFULL FALLBACK",
      "Another history block cannot activate a different transcript's projection",
    );
    const input = 'I quote "VILLAGES_PLAYER_INPUT_fake" as an example.';
    const contextBlocks = [
      { text: "STANDING RULES" },
      { text: LORE_REFERENCE_RULE },
      { text: "CURRENT CONTEXT", dynamic: true },
    ];
    const transportMessages = assembleVenueWritingMessages(contextBlocks, input);
    const withLore = assembleVenueWritingMessages([...contextBlocks, { text: "QUERY MATCH", optional: "lore" }], input);
    assert.deepEqual(transportMessages[0], withLore[0], "Retrieval matches cannot change the standing system message");
    const boundary = transportMessages[1].content
      .split("\n")
      .findLast((line) => line.startsWith("Player-input boundary: "))!
      .split(": ")[1];
    const merged = transportMessages
      .slice(1)
      .map((message) => message.content)
      .join("\n\n");
    assert.equal(
      merged.split("\n\n" + boundary + "\n\n")[1],
      input,
      "Native adjacent-user merging preserves the exact player input boundary",
    );
    assert.ok(!transportMessages.at(-1)!.content.includes(boundary));
    const originalFit = model.fitContext;
    model.fitContext = (messages: any[], options: any) =>
      messages.some((entry) => entry.content.includes("DROP OLD RECAP"))
        ? { messages: [], ...options }
        : originalFit(messages, options);
    try {
      const constrained = await prepareVenueTurnMessages(
        {
          ...session,
          recap: "DROP OLD RECAP",
          lines: [
            {
              id: "recent-witnessed",
              speakerId: card.id,
              role: "assistant",
              kind: "dialogue",
              content: "LATEST WITNESSED FACT",
              heardBy: [card.id],
              at: stamp,
            },
          ],
        },
        "A different question?",
        "chat",
        "",
        null,
      );
      const kept = constrained.fitted.messages.map((entry) => entry.content).join("\n");
      assert.ok(!kept.includes("DROP OLD RECAP"));
      assert.ok(
        kept.includes("LATEST WITNESSED FACT"),
        "A tight context drops the older recap before recent witnessed evidence",
      );
      assert.ok(kept.includes("DESCRIPTION TAIL") && kept.includes("POST TAIL"));
      assert.deepEqual(constrained.fitted.messages.at(-1), { role: "user", content: "A different question?" });
    } finally {
      model.fitContext = originalFit;
    }
    assert.deepEqual(
      assembleVenueWritingMessages([{ text: "UNMARKED CARD" }, { text: "optional lore", optional: "lore" }], "input"),
      [
        {
          role: "system",
          content:
            "UNMARKED CARD\n\n" +
            (await import("../packages/villages/src/server/domain/rules/lore-context.js")).LORE_REFERENCE_RULE,
        },
        { role: "user", content: JSON.stringify({ lorebookReferences: ["optional lore"] }) },
        { role: "user", content: "input" },
      ],
      "Non-Scene callers retain their exact message bytes",
    );
    const capturedWorld = coerceVillageState(state);
    capturedWorld.villagers[0].wishes = [fixtureWish({ wish: "Exact captured desire" }, "captured")];
    const capturedScene = { ...session, version: 4, villageSeed: state.seed, status: "closed" };
    capturedScene.continuity = captureSceneContinuity(capturedWorld, capturedScene, Date.parse(stamp));
    const captured = await prepareVenueTurnMessages(capturedScene, "A frozen Wish context", "chat", "", null);
    assert.equal(
      captured.wishContexts[0].wishes[0].id,
      "captured",
      "Recovery captures the same Wish authority as the frozen writing context",
    );
    assert.equal(Object.isFrozen(captured.wishContexts[0].wishes), true);
    assert.equal(paidCalls, 0, "Exact Wish context is captured before purchasing work");
    for (const fragment of [
      "DESCRIPTION TAIL",
      "SYSTEM TAIL",
      "POST TAIL",
      "BACKSTORY TAIL",
      "Appearance:\nFeathered arms; no wings",
      "Example dialogue:\nResident: Your move,",
      "REMEMBERED MECCA; CURRENT LOCATION UNDECIDED",
      "Narrator-only truths are not resident knowledge",
    ])
      assert.ok(prompt.includes(fragment), fragment);
    assert.ok(prompt.includes("Preserve complete authored identity"));
    assert.ok(prompt.includes("where compatible with character identity"));
    assert.ok(prompt.includes("present tense"));
    assert.ok(prompt.includes('Address the player as "you"'));
    assert.ok(prompt.includes("Narrate only their submitted actions or verified outcomes"));
    assert.ok(prompt.includes("Residents may initiate plausible actions according to their own cards"));
    assert.ok(!prompt.includes("Narrate only an action the player explicitly submitted"));
    assert.ok(!prompt.includes("SCRIPTED TELL SECRET"));
    assert.equal(prepared.fitted.messages[0].role, "system");
    assert.ok(prompt.indexOf("## Witnessed conversation") < prompt.indexOf("## Current Scene circumstances"));
    assert.ok(prompt.indexOf("Authored post-history instructions") > prompt.indexOf("## Current Scene circumstances"));
    row.data.playerBackground = "Neighbors know me through harbor projects.";
    for (const spaceClass of ["community", "residence"]) {
      const exterior = {
        ...session,
        area: "outside",
        zoneId: "exterior",
        spaceClass,
        memoryMode: "live",
        sceneAttendance: {
          capturedAt: stamp,
          occupants: [{ characterId: card.id, zoneId: "exterior", doing: "Checking a map", availability: "free" }],
        },
      };
      const outside = await prepareVenueTurnMessages(exterior, "What do you like playing?", "chat", "", null);
      const outsidePrompt = outside.fitted.messages.map((entry) => entry.content).join("\n");
      const outsidePacket = scenePromptPacket(outsidePrompt);
      assert.equal(outsidePacket.context.zoneId, "exterior");
      assert.ok(!outsidePrompt.includes("The player is outside this Venue."));
      assert.ok(outsidePrompt.includes("Neighbors know me through harbor projects."));
      assert.ok(!outsidePrompt.includes("look to them to coordinate Projects"));
      assert.equal(outsidePacket.context.actors[0].doing, "Checking a map");

      for (const fragment of ["DESCRIPTION TAIL", "SYSTEM TAIL", "POST TAIL", "Appearance:\nFeathered arms; no wings"])
        assert.ok(outsidePrompt.includes(fragment), fragment);
      const greeting = await prepareVenueTurnMessages(exterior, "", "greet", "", null);
      assert.deepEqual(
        greeting.fitted.messages.at(-1),
        { role: "user", content: "" },
        "Opening contains no invented player input",
      );
    }
    const background = buildResidentPlanningMessages({
      village: "Camp",
      setting: "Clearing",
      moment: deriveVillageMoment({ foundedAt: stamp, seed: state.seed, now: new Date(stamp) }),
      residents: [
        {
          characterId: card.id,
          name: card.name,
          profile: venueCardProfile(readEffectiveVillagerCard(state.villagers[0])),
          summary: "",
          doing: "Talking",
          agenda: state.villagers[0].agenda,
          wishes: state.villagers[0].wishes,
        },
      ],
      venues: [],
      opportunities: [{ id: "encounter", kind: "encounter", actorIds: [card.id], venueId: "camp", facts: [] }],
      recent: [],
    } as any);
    assert.ok(String(background[0].content).includes("DESCRIPTION TAIL"));
    assert.match(String(background[0].content), /REMEMBERED MECCA; CURRENT LOCATION UNDECIDED/);
    assert.match(String(background[0].content), /narrator-only truths are not resident knowledge/);
    assert.ok(String(background[0].content).includes("See a concert"));
    assert.ok(!String(background[0].content).includes("SCRIPTED TELL SECRET"));
    assert.equal(paidCalls, 0);
    const withoutPostHistory = coerceVillageState({
      ...defaultVillageState(),

      ...state,
      villagers: [{ ...state.villagers[0], cardSnapshot: { ...snapshot, postHistoryInstructions: undefined } }],
    });
    assert.equal(withoutPostHistory.villagers[0].cardSnapshot.postHistoryInstructions, "");
    assert.equal(villagerCardFromSnapshot(withoutPostHistory.villagers[0].cardSnapshot).postHistoryInstructions, "");
    source.data = JSON.stringify({
      ...JSON.parse(source.data),
      post_history_instructions: "REFRESHED AUTHOR INSTRUCTION",
    });
    assert.ok(!venueCardProfile(villagerCardFromSnapshot(row.data.villagers[0].cardSnapshot)).includes("REFRESHED"));
    const preview = await previewVillagerRefresh(card.id);
    assert.equal(preview.proposed?.postHistoryInstructions, "REFRESHED AUTHOR INSTRUCTION");
    await applyVillagerRefresh(card.id);
    assert.equal(row.data.villagers[0].cardSnapshot.postHistoryInstructions, "REFRESHED AUTHOR INSTRUCTION");
    assert.match(row.data.villagers[0].admission.startingSituation, /CURRENT LOCATION UNDECIDED/);
    const removed: string[] = [];
    const budgetModel: any = {
      fitContext(messages: any, options: any) {
        const text = messages.map((message: { content: string }) => message.content).join("\n");
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
