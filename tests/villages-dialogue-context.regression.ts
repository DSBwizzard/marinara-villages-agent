import assert from "node:assert/strict";
import { readVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { snapshotFromCard } from "../packages/villages/src/server/domain/rules/resident-card-snapshot.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import {
  changeContinuityMemory,
  inspectContinuityMemory,
} from "../packages/villages/src/server/domain/rules/continuity-library.js";
import { appendEpisode } from "../packages/villages/src/server/domain/rules/episodes.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { prepareScenePrompt, scenePromptPacket } from "./fixtures/villages-scene-writing.fixture.js";
import { retainAuthoredNote } from "./helpers/continuity.fixture.js";
import { venueFixture } from "./helpers/venues.fixture.js";

const at = "2026-11-10T12:00:00.000Z";
const cards = ["outgoing", "reserved", "absent"].map((id) =>
  readVillagerCard({
    id,
    data: {
      name: id,
      description: "FULL CARD ".repeat(500) + id + " DESCRIPTION TAIL",
      personality:
        id === "outgoing" ? "Energetic, opinionated and quick to invite people." : "Quiet, selective and competitive.",
      mes_example: id + " VOICE EXAMPLE",
      post_history_instructions: id + " AUTHORED INSTRUCTION",
      extensions: { appearance: id + " APPEARANCE", backstory: id + " BACKSTORY" },
    },
  } as any),
);
const venue = venueFixture({
  id: "camp",
  name: "Camp",
  classes: ["community"],
  description: "A clearing with a bench.",
});
const state = coerceVillageState({
  ...defaultVillageState(),
  seed: "dialogue-context",
  setupAt: at,
  foundedAt: at,
  venues: [venue],
  villagers: cards.map((card) => ({
    characterId: card.id,
    incarnation: card.id + "-one",
    letterFontId: "caveat",
    addedAt: at,
    cardSnapshot: snapshotFromCard(card, 1),
  })),
});
state.narrationStyle.writingGuidance = "Make all residents agreeable and reluctant to act.";
const perspective = (id: string, text: string) =>
  retainAuthoredNote(state, "perspective-" + id, text, [id], at, {
    class: "perspective",
    current: true,
    owner: continuityActor(state, id)!,
    about: ["player"],
  });
perspective("outgoing", "Values the player's reliability.");
perspective("reserved", "Distrustful after a broken promise.");
retainAuthoredNote(state, "violin", "Reserved promised to repair Alex’s violin on Sunday.", ["reserved"], at, {
  class: "commitment",
  current: true,
  owner: continuityActor(state, "reserved")!,
});
retainAuthoredNote(state, "talk", "Reserved and the player are discussing the violin.", ["reserved"], at);
retainAuthoredNote(state, "absent-secret", "ABSENT PERSON SECRET", ["absent"], at);
const old = "Returned the borrowed camera intact.";
const oldRoot = retainAuthoredNote(state, "camera", old, ["outgoing"], at);
const oldEvidence = inspectContinuityMemory(state, oldRoot, "outgoing", true, at);
state.continuity = changeContinuityMemory(
  state,
  oldRoot,
  { operationId: "forget-camera", seed: state.seed, target: oldEvidence.target!, knowers: ["outgoing"] },
  "forget",
  at,
);

const participants = cards.slice(0, 2).map((card) => ({ characterId: card.id, name: card.name, doing: "Talking" }));
const previous = "I prefer an early start.";
state.episodes = appendEpisode(
  state.episodes,
  {
    format: 1,
    id: "prior",
    seed: state.seed,
    sceneId: "prompt-fixture",
    submissionId: "prior-submission",
    operationId: "prior-operation",
    capturedAt: at,
    acceptedAt: at,
    admittedContinuityRevision: state.continuity.revision,
    responseDigest: memoryHash(previous),
    privateInput: "When should we start?",
    actors: ["player", "reserved", "outgoing"].map((id) => ({
      id,
      incarnation: continuityActor(state, id)!.incarnation,
      zoneId: "exterior",
    })),
    segments: [
      {
        id: "earlier-spoken",
        role: "assistant",
        kind: "dialogue",
        name: "reserved",
        speakerId: "reserved",
        content: previous,
        zoneId: "exterior",
        heardBy: ["reserved", "outgoing", "player"],
        at,
      },
    ],
    grounding: [],
    continuityVersionIds: [],
    offered: [],
    commandReceipts: [],
    dependencies: {},
  },
  state.seed,
);
const scene = {
  placeId: venue.id,
  zoneId: "exterior",
  startedAt: at,
  participants,
  activeIds: participants.map((row) => row.characterId),
};
const baseline = memoryHash(state);
const prepared = await prepareScenePrompt(state, cards[0], "chat", "What about Alex’s violin music?", scene);
const { prompt } = prepared;
const positions = [
  "## Writing direction",
  "## Response format and evidence metadata",
  "## Complete authored character identity",
  "## Authored post-history direction",
  "## Witnessed conversation",
  "## Current Scene circumstances",
].map((heading) => prompt.indexOf(heading));
assert(positions.every((position, index) => position >= 0 && (!index || position > positions[index - 1])));
for (const { characterId } of participants)
  for (const field of ["DESCRIPTION TAIL", "APPEARANCE", "BACKSTORY", "VOICE EXAMPLE", "AUTHORED INSTRUCTION"])
    assert(prompt.includes(characterId + " " + field));
assert(prompt.indexOf(previous) > prompt.indexOf("outgoing AUTHORED INSTRUCTION"));
const ordered = await prepareScenePrompt(state, cards[0], "chat", "A different topic", {
  ...scene,
  participants: participants.toReversed(),
  activeIds: scene.activeIds.toReversed(),
});
const prefix = (messages: typeof prepared.fitted.messages) =>
  messages.filter((message) => message.cacheBreakpoint).slice(0, 2);
assert.equal(prefix(prepared.fitted.messages).length, 2);
assert.deepEqual(prefix(ordered.fitted.messages), prefix(prepared.fitted.messages));
assert.match(prompt, /where compatible with character identity/);
assert.match(prompt, /Residents may initiate plausible actions/);
assert.match(prompt, /The player controls their own speech, decisions, actions, thoughts, feelings, and consent/);
assert.doesNotMatch(prompt, /permission\.grant or permission\.revoke/);
assert.doesNotMatch(prompt, /ABSENT PERSON SECRET|"rootRevision"/);

const notes = prompt
  .split("\n")
  .filter((line) => line.startsWith('{"privateContinuity":'))
  .flatMap((line) => JSON.parse(line).privateContinuity) as { for: string; text: string }[];
assert(notes.some((row) => row.for === "outgoing" && row.text === "Values the player's reliability."));
assert(notes.some((row) => row.for === "reserved" && row.text === "Distrustful after a broken promise."));
assert(
  notes.some((row) => row.for === "reserved" && row.text === "Reserved promised to repair Alex’s violin on Sunday."),
);
assert(
  notes.some((row) => row.for === "reserved" && row.text === "Reserved and the player are discussing the violin."),
);
assert(!notes.some((row) => row.text === old), "Forgotten history cannot reappear as resident knowledge");
assert(
  scenePromptPacket(prompt, "calendar").protections.some(
    (row: { for: string; forbidden: string[] }) => row.for === "outgoing" && row.forbidden.includes(old),
  ),
);

const reserved = participants.find((row) => row.characterId === "reserved")!;
const one = await prepareScenePrompt(state, cards[1], "greet", "", {
  ...scene,
  participants: [reserved],
  activeIds: ["reserved"],
});
assert.match(one.prompt, /reserved DESCRIPTION TAIL/);
assert.doesNotMatch(one.prompt, /outgoing DESCRIPTION TAIL/);
await assert.rejects(
  prepareScenePrompt(state, cards[0], "chat", "Your move.", scene, (_messages, options) => ({
    messages: [],
    maxTokens: options?.maxTokens,
  })),
  /No reply was requested/,
);
assert.equal(memoryHash(state), baseline, "Prompt preparation leaves native and individual continuity untouched");
