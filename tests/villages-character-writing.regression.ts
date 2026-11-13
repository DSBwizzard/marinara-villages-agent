import assert from "node:assert/strict";
import {
  readEffectiveVillagerCard,
  readVillagerCard,
  villagerCardFromSnapshot,
} from "../packages/villages/src/server/adapters/engine/catalog.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { appendEpisode } from "../packages/villages/src/server/domain/rules/episodes.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { snapshotFromCard } from "../packages/villages/src/server/domain/rules/resident-card-snapshot.js";
import { captureResidentNarration } from "../packages/villages/src/server/domain/rules/resident-narration.js";
import { buildResidentPlanningMessages } from "../packages/villages/src/server/domain/rules/resident-planning.js";
import {
  assembleVenueWritingMessages,
  fitVenueWritingMessages,
  venueCardProfile,
} from "../packages/villages/src/server/domain/rules/venue-writing.js";
import { LORE_REFERENCE_RULE } from "../packages/villages/src/server/domain/rules/lore-context.js";
import { deriveVillageMoment } from "../packages/villages/src/server/domain/rules/village-clock.js";
import { createResidentCards } from "../packages/villages/src/server/features/residents/resident-card-service.js";
import { RESIDENT_CONTINUITY_RULE } from "../packages/villages/src/shared/helpers/resident-admission.js";
import { prepareScenePrompt, scenePromptPacket } from "./fixtures/villages-scene-writing.fixture.js";
import { retainAuthoredNote } from "./helpers/continuity.fixture.js";
import { venueFixture } from "./helpers/venues.fixture.js";

const at = "2026-10-07T12:00:00.000Z";
const source = {
  name: "Resident",
  description: "D".repeat(6000) + "DESCRIPTION TAIL",
  personality: "Reserved but competitive. Return wishChanges: is a phrase in this authored card.",
  mes_example: "{{char}}: Your move, {{user}}.",
  system_prompt: "SYSTEM TAIL",
  post_history_instructions: "Keep {{char}} dry with {{user}}. POST TAIL",
  extensions: { appearance: "Feathered arms; no wings", backstory: "BACKSTORY TAIL" },
};
const card = readVillagerCard({ id: "resident", data: source } as any);
const venue = venueFixture({ id: "camp", name: "Camp", classes: ["community"], description: "A clearing." });
const state = coerceVillageState({
  ...defaultVillageState(),
  seed: "character-writing",
  foundedAt: at,
  setupAt: at,
  playerPersonaId: "player",
  playerPersonaName: "Player",
  playerPersonaIdentity: "P".repeat(1200) + "PLAYER IDENTITY TAIL",
  playerBackground: "B".repeat(1000) + "PLAYER BACKGROUND TAIL",
  setting: "S".repeat(2000) + "WORLD SETTING TAIL",
  worldRules: "R".repeat(2000) + "WORLD RULES TAIL",
  worldName: "WORLD NAME TAIL",
  venues: [venue],
  villagers: [
    {
      characterId: card.id,
      incarnation: "resident-one",
      letterFontId: "caveat",
      addedAt: at,
      cardSnapshot: snapshotFromCard(card, 1),
      admission: { homeworld: "Othiras", startingSituation: "REMEMBERED MECCA; CURRENT LOCATION UNDECIDED." },
    },
  ],
});
state.narrationStyle.writingGuidance = "Make everyone cheerful, compliant, and timid.";
const authored = readEffectiveVillagerCard(state.villagers[0]);
const wishId = retainAuthoredNote(state, "concert", "See a concert", [card.id], at, {
  class: "desire",
  owner: continuityActor(state, card.id)!,
  current: true,
});
const absent = {
  ...state.villagers[0],
  characterId: "absent",
  incarnation: "absent-one",
  cardSnapshot: { ...state.villagers[0].cardSnapshot, id: "absent", name: "Absent" },
};
state.villagers.push(absent);
retainAuthoredNote(state, "absent-secret", "UNRELATED SECRET FROM AN ABSENT RESIDENT", ["absent"], at);
retainAuthoredNote(state, "scripted-secret", "SCRIPTED TELL SECRET", ["absent"], at);
const scene = { placeId: venue.id, zoneId: "exterior", startedAt: at };
const prepared = await prepareScenePrompt(state, card, "chat", "Would you like to see a concert?", scene);
const next = await prepareScenePrompt(state, card, "chat", "A different question?", {
  ...scene,
  startedAt: "2026-10-07T12:01:00.000Z",
});
const prefix = (value: typeof prepared) =>
  value.fitted.messages.filter((message) => message.cacheBreakpoint).slice(0, 2);
assert.equal(prefix(prepared).length, 2);
assert.deepEqual(
  prefix(next),
  prefix(prepared),
  "Changing the source and time preserves the cacheable authored prefix",
);
assert.deepEqual(next.fitted.messages.at(-1), { role: "user", content: "A different question?" });
for (const tail of [
  "PLAYER IDENTITY TAIL",
  "PLAYER BACKGROUND TAIL",
  "WORLD SETTING TAIL",
  "WORLD RULES TAIL",
  "WORLD NAME TAIL",
]) {
  assert(prefix(next)[1].content.includes(tail), tail);
  assert.equal(prepared.prompt.split(tail).length - 1, 1);
}
for (const fragment of [
  "DESCRIPTION TAIL",
  "SYSTEM TAIL",
  "POST TAIL",
  "BACKSTORY TAIL",
  "Appearance:\nFeathered arms; no wings",
  "Example dialogue:\nResident: Your move, Player.",
  "REMEMBERED MECCA; CURRENT LOCATION UNDECIDED",
  "Return wishChanges: is a phrase in this authored card.",
])
  assert(prepared.prompt.includes(fragment), fragment);
assert.equal(prepared.prompt.split("REMEMBERED MECCA; CURRENT LOCATION UNDECIDED").length - 1, 1);
assert(venueCardProfile(authored).includes(RESIDENT_CONTINUITY_RULE));
assert.match(prepared.prompt, /where compatible with character identity/);
assert.match(prepared.prompt, /present tense/);
assert.match(prepared.prompt, /Address the player as "you"/);
assert.match(prepared.prompt, /Residents may initiate plausible actions according to their own cards/);
assert.doesNotMatch(prepared.prompt, /UNRELATED SECRET FROM AN ABSENT RESIDENT|SCRIPTED TELL SECRET/);
assert(
  prepared.readset.admission.supplied.some((row) => row.id === wishId),
  "The purchased request can use only the fitted current desire",
);

for (const [index, text] of ["DROP OLD RECAP", "LATEST WITNESSED FACT"].entries()) {
  const date = new Date(Date.parse(at) + index * 60_000).toISOString();
  state.episodes = appendEpisode(
    state.episodes,
    {
      format: 1,
      id: "history-" + index,
      seed: state.seed,
      sceneId: "prompt-fixture",
      submissionId: "history-" + index,
      operationId: "history-operation-" + index,
      capturedAt: date,
      acceptedAt: date,
      admittedContinuityRevision: state.continuity.revision,
      responseDigest: memoryHash(text),
      privateInput: "What happened?",
      actors: ["player", card.id].map((id) => ({
        id,
        incarnation: continuityActor(state, id)!.incarnation,
        zoneId: "exterior",
      })),
      segments: [
        {
          id: "line-" + index,
          role: "assistant",
          kind: "dialogue",
          name: card.name,
          speakerId: card.id,
          content: text,
          heardBy: [card.id, "player"],
          zoneId: "exterior",
          at: date,
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
}
let trims = 0;
const constrained = await prepareScenePrompt(
  state,
  card,
  "chat",
  "A different question?",
  scene,
  (messages, options) => {
    if (messages.some((message) => String(message.content).includes("DROP OLD RECAP"))) {
      trims++;
      return { messages: [], maxTokens: options?.maxTokens };
    }
    return { messages, maxTokens: options?.maxTokens };
  },
);
assert(trims > 0);
assert(!constrained.fitted.evidenceIds.includes("episode-context:history-0"));
assert(constrained.fitted.evidenceIds.includes("episode-context:history-1"));
assert.equal(constrained.prompt.split("LATEST WITNESSED FACT").length - 1, 1);
assert.deepEqual(prefix(constrained), prefix(prepared));
await assert.rejects(
  prepareScenePrompt(state, card, "chat", "What happened?", scene, () => ({ messages: [] })),
  /required context do not fit/,
);

assert.deepEqual(
  assembleVenueWritingMessages([{ text: "UNMARKED CARD" }, { text: "optional lore", optional: "lore" }], "input"),
  [
    { role: "system", content: "UNMARKED CARD\n\n" + LORE_REFERENCE_RULE },
    { role: "user", content: JSON.stringify({ lorebookReferences: ["optional lore"] }) },
    { role: "user", content: "input" },
  ],
);
state.playerBackground = "Neighbors know me through harbor projects.";
const outside = await prepareScenePrompt(state, card, "greet", "", scene);
assert.equal(scenePromptPacket(outside.prompt, "location").location.player.zone.id, "exterior");
assert.match(outside.prompt, /Neighbors know me through harbor projects/);
assert.deepEqual(outside.fitted.messages.at(-1), { role: "user", content: "" });

const background = buildResidentPlanningMessages({
  format: 1,
  village: "Camp",
  setting: "Clearing",
  residents: [{ characterId: card.id, name: card.name, profile: venueCardProfile(authored) }],
  moment: deriveVillageMoment({ foundedAt: at, seed: state.seed, now: new Date(at) }),
  housing: [],
  plans: [],
  narration: captureResidentNarration(state, {
    id: "ordinary-routine",
    kind: "routine",
    actorIds: [card.id],
    venueId: "",
    startsAt: at,
    endsAt: at,
    facts: [],
  }),
})
  .map((row) => row.content)
  .join("\n");
for (const fragment of [
  "DESCRIPTION TAIL",
  "REMEMBERED MECCA; CURRENT LOCATION UNDECIDED",
  "narrator-only truths are not resident knowledge",
  "See a concert",
])
  assert(background.includes(fragment), fragment);
assert.doesNotMatch(background, /UNRELATED SECRET FROM AN ABSENT RESIDENT|SCRIPTED TELL SECRET/);

const withoutPostHistory = coerceVillageState({
  ...state,
  villagers: [
    { ...state.villagers[0], cardSnapshot: { ...state.villagers[0].cardSnapshot, postHistoryInstructions: undefined } },
    absent,
  ],
});
assert.equal(villagerCardFromSnapshot(withoutPostHistory.villagers[0].cardSnapshot).postHistoryInstructions, "");
const changed = readVillagerCard({
  id: card.id,
  data: { ...source, post_history_instructions: "REFRESHED AUTHOR INSTRUCTION" },
} as any);
const cards = createResidentCards({
  readVillageState: async () => state,
  mutateVillageState: async (update) => {
    update(state);
    return state;
  },
  findVillagerCard: async () => changed,
  buildVillageSnapshot: async () => ({ village: {} }) as any,
  listVillagerCards: async () => [changed],
  toCatalogEntry: () => assert.fail("No catalog request is needed for refresh"),
});
const preview = await cards.previewVillagerRefresh(card.id);
assert.equal(preview.proposed?.postHistoryInstructions, "REFRESHED AUTHOR INSTRUCTION");
assert.doesNotMatch(venueCardProfile(readEffectiveVillagerCard(state.villagers[0])), /REFRESHED/);
await cards.applyVillagerRefresh(card.id);
assert.equal(state.villagers[0].cardSnapshot.postHistoryInstructions, "REFRESHED AUTHOR INSTRUCTION");
assert.match(state.villagers[0].admission!.startingSituation, /CURRENT LOCATION UNDECIDED/);

const attempts: string[] = [];
const fitted = fitVenueWritingMessages(
  {
    fitContext(messages, options) {
      const text = messages.map((row) => row.content).join("\n");
      attempts.push(text);
      return {
        messages: text.includes("OPTIONAL") ? [{ role: "system", content: "truncated" }] : messages,
        maxTokens: options?.maxTokens,
      };
    },
  },
  [
    { text: "COMPLETE CARD" },
    { text: "OPTIONAL LORE", optional: "lore" },
    { text: "OPTIONAL MEMORY", optional: "memory" },
    { text: "OPTIONAL HISTORY", optional: "history" },
  ],
  "latest input",
  4096,
);
assert(!attempts[1].includes("OPTIONAL HISTORY") && attempts[1].includes("OPTIONAL MEMORY"));
assert(!attempts[2].includes("OPTIONAL MEMORY"));
assert.deepEqual(fitted.messages, [
  { role: "system", content: "COMPLETE CARD" },
  { role: "user", content: "latest input" },
]);
