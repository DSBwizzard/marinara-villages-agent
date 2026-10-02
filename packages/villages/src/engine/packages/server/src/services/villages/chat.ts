import { VILLAGE_SHARED_SETTING_RULE } from "./narrative-grounding.js";
import { relationshipWritingPrompt } from "./relationships.js";
import { renderPlayerRoleContext } from "./player-role.js";
// Villages — shared resident prompt and memory helpers.
//
// This is the package's own dialogue system. It borrows the *shape* of the
// Engine's chat pipeline (a system prompt, then turns). Scenes own their
// transcript and submission path in venue-session.ts.
//
// The card supplies identity and voice; the village supplies the preset that
// says how anyone here behaves and what the village knows. That ordering
// matters — the card's own `system_prompt` goes in first and is not rewritten,
// and the card's identity sheet and example dialogue bracket the preset.
//
// `buildVillagerMessages` is pure: everything it needs is passed in, so the
// prompt shape can be exercised without a runtime behind it.
import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import { residentsFromSnapshots, type VillagerCard } from "./catalog.js";
import { condense } from "./coerce.js";
import { villagesConnectionIdFor } from "./connections.js";
import { readVillageLore } from "./lorebooks.js";
import { selectPromptMemories } from "./memory-selection.js";
import type { NativeRoutine } from "./native-schedules.js";
import { agendaAt, agendaDayPlan } from "./agenda-plan.js";
import { assembleNarrationMessages, type NarrationPlayer } from "./narration-prompt.js";
import type { VillageNarrationTurn } from "./narration-settings.js";
import {
  villagesDebugAgentsEnabled,
  villagesLanguageModels,
  villagesLogger,
  completeWithRoom,
} from "./package-runtime.js";
import {
  boundText,
  buildPromptValues,
  HAPPENING_RULES,
  isCommittedStatus,
  MAX_CHRONICLE_LENGTH,
  MAX_CHRONICLE_PER_WRITE,
  MAX_HAPPENINGS_PER_WRITE,
  MAX_RESIDENT_SUMMARY_LENGTH,
  remapVenues,
  renderModeBlock,
  renderVillagePrompt,
  type VillageHomeLine,
  type VillagePresentGroup,
  type VillagePromptValues,
  villageCurrentSetting,
  villageRelevantOrigin,
} from "./prompt-preset.js";
import { VILLAGES_FAREWELL_MARK } from "./turn-beats.js";
import { describeSpriteExpressions } from "./sprite-expressions.js";
import type {
  VillageAgenda,
  VillageChatMessage,
  VillageChatMode,
  VillageChronicleEntry,
  VillageDayBlock,
  VillageHappening,
  VillageRemap,
  VillageState,
} from "./types.js";
import { coerceHappeningList, extractJsonObject } from "./village-bootstrap.js";
import { readConversationVenueRequest, type VenueRequestCore } from "./venue-requests.js";
import { projectHomeLines, villagerPlaceView } from "./village.js";
import { describeMoment, deriveVillageMoment, randomVillageSeed, type VillageMoment } from "./village-clock.js";

// Venue greetings and replies are generated in venue-session.ts with
// per-village narration controls. This module retains village background work.

/**
 * The end-of-conversation call writes a memory rather than a scene, so it is
 * short, and it is answered COLD: this is a summary of something that has
 * already happened, and a warm model asked to summarise invents.
 *
 * "Short" describes the ANSWER, not the budget. Nothing between this constant
 * and the model adds room to it, and a model that reasons before it answers
 * spends the same budget on the reasoning — so a cap sized for the answer alone
 * is a cap that buys thinking and no answer. At 400 a live thinking model
 * returned an empty string, and the caller told the player the villager had
 * nothing to say about the conversation they had just finished. The failure was
 * real; the sentence was not.
 */
const DISTILL_MAX_TOKENS = 1_200;
const DISTILL_TEMPERATURE = 0.4;
/** Longest user line the village will accept, so one paste cannot wedge a transcript. */
export const MAX_MESSAGE_LENGTH = 4000;

/**
 * The village-supplied half of the prompt: who else is here, and what the
 * village knows. Gathered by the caller so the prompt builder stays pure.
 *
 * `moment` and `routine` are part of the context for the same reason
 * `buildVillagerMessages` is pure: time is derived at the edge (one read per
 * send, shared by the prompt and nothing else) and the routine is read from the
 * Engine's native schedules, which is a permissioned read that must not happen
 * inside a pure function.
 */
export type VillagePromptContext = {
  /** Labels for the other villagers, already formatted, speaker excluded. */
  roster: string[];
  /**
   * Who else is out and about, grouped by the place each of them is standing in,
   * with the speaker's own place first.
   *
   * The question `roster` cannot answer. The roster is who LIVES here and is the
   * same list at three in the morning as at noon, which is why a villager given
   * nothing else answers "who is around?" with the entire village. This is the
   * same people read at this hour and grouped by where they are, so a villager
   * standing in a room can say who is standing in it with them — and, because
   * the grouping is the map's own answer, say where everybody else is too.
   *
   * Grouped rather than listed because grouping is what the fact IS: a place
   * with people in it. The room turn reads the group marked `here` as the cast it
   * is writing, and the block renderer reads the whole thing as a report.
   *
   * Built at the edge for the same reason the roster and the homes are: placing
   * anybody means reading the Engine's schedules, which is a permissioned read a
   * pure prompt builder must not start. It comes out of the ONE schedule read
   * this file already performs per turn, so one send is still one derivation of
   * the moment.
   */
  present: VillagePresentGroup[];
  /** Bounded, relevant excerpts from the village's selected Engine lorebooks. */
  lore: string[];
  /**
   * Where everyone in the village lives, with each occupant already named.
   *
   * Lines rather than places, because a place only becomes one of these by
   * having somebody in it. Names come from the residents' adopted card snapshots.
   */
  homes: VillageHomeLine[];
  /**
   * The memories THIS villager is allowed to have: the village's shared story,
   * plus whatever is remembered privately about them and nobody else. Selected
   * at the edge, where the speaker's id is known, so the pure prompt builder
   * cannot be handed a memory that someone else is supposed to keep.
   */
  memory: VillageChronicleEntry[];
  /** The derived moment the reply happens at. */
  moment: VillageMoment;
  /** The Engine's native routine for this character, when one exists. */
  routine: NativeRoutine | null;
  /**
   * How that routine happens HERE, or null when the village has no translation
   * for the week the Engine is currently keeping for this character.
   *
   * Null is the ordinary fallback and not a degraded state: the Engine's own
   * sentence is then used unchanged, which is exactly what this prompt said
   * before translations existed. Passed in beside the routine rather than folded
   * into it because the two are read differently — `routine` is what the Engine
   * says and stays verbatim, `remap` is the village's reading of the same week,
   * and `doingFor` is where the one wins over the other.
   */
  remap: VillageRemap | null;
  /**
   * What THIS villager is privately after, exactly as the village wrote it down.
   *
   * Passed in rather than appended to the prompt here, because it is the same
   * material the narrator was given and it must read the same way in both places:
   * a private motivation with a visible tell, never an announced goal. The
   * `{{wishes}}` block says the rest, including why it is never voiced.
   */
  agenda: VillageAgenda | null;
};

/** The context a villager has when nobody supplies one: alone, with no lore. */
export const EMPTY_PROMPT_CONTEXT: VillagePromptContext = {
  roster: [],
  present: [],
  lore: [],
  homes: [],
  memory: [],
  agenda: null,
  remap: null,
};

/**
 * What one villager may remember: everything shared, plus what is theirs.
 *
 * This is where a private memory either belongs to somebody or is not seen at
 * all, and it is the whole of the privacy rule — there is no filter deeper in,
 * because the block renderer is never handed a list it has to prune. Matching is
 * on the card id rather than the name, since a name is a thing the player can
 * edit and an id is not.
 *
 * The two budgets are separate on purpose. The shared story is the same for
 * everybody, so it is capped at what one villager's prompt can hold. A private
 * memory is only ever about one person, so it is capped far lower — a villager
 * who cannot forget the player's one visit is a character trait, and a villager
 * reciting a dozen of them is a log file.
 *
 * The list arrives newest first and leaves newest first, so it is trimmed from
 * the oldest end, which is the end a villager would forget.
 */
export function memoryForVillager(
  chronicle: readonly VillageChronicleEntry[],
  characterId: string,
  query = "",
): VillageChronicleEntry[] {
  return selectPromptMemories(chronicle, [characterId], query, 600);
}

/**
 * What the `{{doing}}` macro renders for one villager.
 *
 * Native wins for timing: the Engine's schedule was generated for this exact
 * character and is keyed to real weekdays, so it is the authority on when a
 * villager does things. `readNativeRoutines` has already resolved "right now"
 * against today's blocks, so the activity arrives as a plain string — when no
 * schedule exists the villager is doing nothing in particular, which renders
 * nothing rather than inventing an activity.
 *
 * Both halves are then translated into the terms of THIS village, and NEITHER of
 * them falls back to the Engine's words. That is the correction this file took,
 * and it is the whole point of the feature rather than a detail of it: a fallback
 * is read by exactly the prompt a translation is read by, so an hour the village
 * could not place used to put "in the cockpit of the Halcyon" into a village with
 * no spaceship — the leak the translation exists to close, arriving through the
 * one path nobody was watching. An hour with no translation now reads as the
 * village's own default, which is what the villagers who were never translated
 * at all are already doing.
 *
 * The summary is passed as empty rather than left off, and that is deliberate:
 * the only sentence available at this call site is the Engine's `routineSummary`,
 * which is prose about the character in the world the CARD describes and is the
 * same leak in a longer form. A villager with no translation has nothing written
 * about their ordinary day, which is a shorter prompt rather than a wrong one.
 * The village's OWN routine summary does reach this block — see the narrator's
 * briefing, which is allowed it because those are the village's words.
 *
 * `status` and `today` ride along with the same schedule and cost nothing to
 * produce: the status came out of the very block the activity came from, and the
 * day plan is the join of the stored translation onto the blocks that same read
 * already returned. They are the whole of what keeps `{{doing}}` from being one
 * clause, which matters because a single clause about the present leaves a wish
 * as the largest piece of writing in the prompt about what this person is
 * actually doing.
 *
 * `today` is the WHOLE of their day rather than the rest of their week, and the
 * moment is passed in so the plan can mark which block they are in and the
 * session list at the top of the block can say how long they have had it. A
 * villager told only what they are doing right now knows a state; a villager told
 * their own hours knows a day they are in the middle of, and can answer "not
 * until four" if somebody asks.
 *
 * Exported, and not because anything outside this file calls it: it is the
 * composition that decides what a villager is told they are doing, and the only
 * way to prove without a host that the Engine's own sentence cannot reach a
 * prompt through it is to build the block here and read it.
 */
export function doingFor(
  _remap: VillageRemap | null,
  _routine: NativeRoutine | null,
  at: { hour: number; minute: number },
  agenda: VillageAgenda | null = null,
): { activity: string; routineSummary: string; status: string; today: VillageDayBlock[] } {
  const minuteOfDay = at.hour * 60 + at.minute;
  return {
    activity: agendaAt(agenda, minuteOfDay)?.activity ?? "",
    routineSummary: agenda?.routineSummary ?? "",
    status: agendaAt(agenda, minuteOfDay)?.status ?? "",
    today: agendaDayPlan(agenda, minuteOfDay),
  };
}

/**
 * Every value a block of this prompt can be filled from, gathered once.
 *
 * One function and two callers — the preset that writes a villager's turn, and
 * the scene context block appended live to somebody else's roleplay prompt. It
 * used to be the same object literal written out twice, which is exactly how a
 * macro comes to mean one thing in a conversation and another thing in a scene.
 */
function promptValuesFor(
  card: VillagerCard,
  village: VillageState,
  context: VillagePromptContext,
): VillagePromptValues {
  return buildPromptValues({
    char: card.name,
    village: village.name,
    setting: villageCurrentSetting(village),
    // The SENDABLE places only — see `remapVenues`. The houses are covered by
    // the homes block below, which names the person in each one; listing them
    // here as well would put the same building name in the prompt four times
    // over, with nothing beside it to say who lives behind which door.
    venues: remapVenues(village.venues),
    homes: context.homes,
    playerName: village.playerName,
    playerDescription: village.playerDescription,
    time: describeMoment(context.moment),
    weather: context.moment.weather,
    doing: doingFor(context.remap, context.routine, context.moment, context.agenda),
    agenda: context.agenda,
    noticeboard: village.noticeboard,
    happenings: village.happenings,
    memory: context.memory,
    foundedAt: village.foundedAt,
    moment: context.moment,
    roster: context.roster,
    present: context.present,
    lore: context.lore,
  });
}

/** The player, as the assembler wants them named. */
function narrationPlayerFor(village: VillageState): NarrationPlayer {
  return { name: village.playerName, description: village.playerDescription };
}

/**
 * The two registers a villager has to be TOLD about.
 *
 * The card reads an ordinary answer by shape — a paragraph that closes on a
 * quote was somebody speaking, everything else was the room — and that rule is
 * the villager's own writing and nothing this package imposes on them. These two
 * are the exception, and they are the exception for a reason a shape cannot
 * solve: a remark muttered under somebody's breath and a line said to one person
 * only are ordinary sentences. There is no punctuation that makes them that.
 *
 * So they are tagged, and the tag is taught here rather than in the preset. This
 * is the same argument the mode block and the three directions are here on: what
 * a villager is being asked to do with THIS turn is a fact about the village's
 * own turn types, and no Engine preset has ever heard of a venue or an aside.
 * The line between that and the preset is drawn where it has always been drawn —
 * this block says how to MARK a line, and says nothing at all about how to
 * write one. Nothing about prose, voice, emphasis or stage directions appears in
 * it, and that is deliberate: those are the player's preset's business.
 *
 * It is offered and not required, in two places, because the failure mode of a
 * register instruction is a villager who performs it. An aside in every turn is
 * a character who has stopped talking and started annotating themselves.
 *
 * The third place it is not offered is the one 0.4.58 added, and it is the
 * opposite case. A player who ASKS for one — "say something only to me", "just
 * between us", "don't let anybody else hear it" — has asked for a line, and a
 * villager who answers that in ordinary prose has answered the wrong question.
 * So the asking is named as the one case that is not the villager's own choice,
 * and it is named in the same breath as the tag, because a direction that only
 * says how to mark something the player cannot ask for is a direction the player
 * cannot use.
 *
 * The name in the whisper tag is the PLAYER's, resolved rather than templated:
 * the assembler resolves macros in the preset, not in a direction this file
 * wrote, and a literal `{{user}}` in a whisper tag would be a tag the model
 * copies with the braces still on it.
 */
function sideLineDirection(playerName: string): string {
  const listener = playerName.trim() || "the one you are speaking to";
  return [
    "## If you say something on the side",
    "How you write is yours and this changes none of it. Your prose, your voice, and whatever marks you use for emphasis or for what your body is doing are all exactly as they were.",
    "It adds one thing, and you may use it or not. An answer written as ordinary paragraphs is read as the room going on around you and as the things you say out loud, and that is right for almost every turn you will ever write.",
    `When you mutter something under your breath — said aloud, but not offered to whoever is in front of you — start that line with [side]. When you say something to one person alone and do not want anybody else to hear it, start the line with [whisper:${listener}]. Start it on a fresh line and put nothing else in front of it, because that is the whole of how it is told apart from the rest of your answer.`,
    `And when the player asks for one — something said only to them, something just between the two of you, something nobody else in the room is to hear — that asking IS the line. Write it, and start it with [whisper:${listener}]. The mark is the whole of how they are shown the difference, so a request answered without it has been answered in the wrong voice.`,
    "Do not use either of them to make an answer longer. Most turns have no such line in them at all, and an answer without one is a whole answer.",
  ].join("\n");
}

function spriteExpressionDirection(village: VillageState, characterId: string): string {
  const slots = describeSpriteExpressions(village.villagers.find((entry) => entry.characterId === characterId)?.sprite);
  if (!slots) return "";
  return `When a line has a visible expression, you may start its paragraph with [expression:id]. Filled expressions: ${slots}. Choose a listed stable id, using its name and Use when guidance. Omit the tag for the default scene image. Use a pose-specific image only when that action is already happening in the scene; choosing a picture does not cause an action.`;
}

/**
 * The villager's answer as registers, and the same answer as prose.
 *
 * Both readings come out of ONE parse so the stored text and the stored
 * registers cannot disagree about where a line is: `content` is written from the
 * beats themselves, which is what takes the tags off the wire and keeps them out
 * of the transcript that six other readers share. Nothing about a register is
 * ever stored in `content` — see `turn-beats.ts` for why that matters.
 *
 * An answer with no tag in it is stored exactly as it arrived and carries no
 * beats at all. That is the ordinary case, it is every turn written before this
 * release, and it is why `parseVillagesTurnBeats` answers `null` rather than a
 * list of tag-less beats: an unchanged answer must stay unchanged on disk.
 *
 * The terminal marker is read FIRST, off the same raw answer and before the
 * beats are parsed, because it is a line and a line left in the text would come
 * back as prose. `farewell` travels beside the two readings rather than inside
 * either of them: it is not a register, and `content` is the villager's own
 * words with the marker already gone.
 */
function narrationTurn(
  card: VillagerCard,
  village: VillageState,
  context: VillagePromptContext,
  narration: VillageNarrationTurn,
  parts: {
    history: readonly VillageChatMessage[];
    message: string | null;
    direction: string;
    mode: VillageChatMode;
    settled: boolean | null;
  },
): CapabilityLanguageModelMessage[] {
  const values = promptValuesFor(card, village, context);
  // The one turn that may be allowed to end itself, and the narrowest gate in
  // this function on purpose. `mode === "chat"` leaves out the ask framing and
  // the wish path, `settled === null` leaves out the turn that has just been
  // ruled on, and an empty direction leaves out the greeting, the goodbye and
  // every room — a room is told who is in it by its own direction, and a room is
  // the one place the marker is stripped and ignored, so offering it there would
  // be offering something the caller has already decided not to honour.
  const ordinaryTurn =
    parts.mode === "chat" &&
    parts.settled === null &&
    parts.direction.trim().length === 0 &&
    parts.history.filter((entry) => entry.role === "user").length >= 2;
  const turnBlock = [
    // First, because it is the one part of the block that is not about THIS turn:
    // it is a standing note about how a line is marked, and the mode, the ruling
    // and the direction are all statements about the turn in hand. See
    // `sideLineDirection` for why it is here rather than in the preset.
    sideLineDirection(village.playerName),
    renderPlayerRoleContext(village),
    "The player controls their own words, decisions, actions, thoughts, feelings, and consent. Never write or imply a new player response. You may refer only to what the player explicitly said or chose in the supplied turn or what the village has already verified. Leave the player's next response to them.",
    spriteExpressionDirection(village, card.id),
    narration.voiceGuidance,
    renderModeBlock(parts.mode, isCommittedStatus(agendaAt(context.agenda, context.moment.minuteOfDay)?.status ?? "")),
    parts.settled === null ? "" : renderSettledBlock(card.name, parts.settled),
    parts.direction,
    ordinaryTurn ? ENDING_DIRECTION : "",
  ]
    .filter((block) => block.trim().length > 0)
    .join("\n\n");
  return assembleNarrationMessages({
    preset: narration.preset,
    // Structurally, `VillagerCard` already IS a `NarrationCard`: the eight fields
    // the assembler can name are the eight this package reads off a card, with
    // no optionals on either side. A conversion function here would be four
    // lines that could drift.
    card,
    player: narrationPlayerFor(village),
    knowledge: [
      renderVillagePrompt(village.promptKnowledge, { ...values, lore: "" }),
      relationshipWritingPrompt(village, card.id),
    ].join("\n\n"),
    lore: values.lore,
    history: parts.history.map((entry) => ({ role: entry.role, content: entry.content })),
    message: parts.message,
    turnBlock,
    choices: narration.choices,
    values,
    speakerId: card.id,
  });
}

/**
 * What the village tells a villager about itself inside a SCENE.
 *
 * A scene is an ordinary Engine roleplay chat, so almost all of the prompt is
 * built by the Engine: the chat's preset, the character card, the persona, the
 * history, whatever roleplay settings the player has. The village's only way in
 * is the `prompt-context` permission, which this package appends live to the
 * system message of every turn — and this function is what it appends.
 *
 * It is deliberately NOT the narration turn. Three of that function's four
 * remaining parts would be wrong here on their own terms:
 *
 *   * the card's own `systemPrompt` and the identity sheet are the Engine's
 *     material, and the Engine has already put both in the prompt for this chat.
 *     Sending them twice is the package arguing with the host about who this
 *     character is, with the last copy winning.
 *   * the mode block is the village's framing for its OWN turn types, and it
 *     names things — asks, favours, a leaving — that a roleplay chat has no
 *     concept of. A villager told "this is an ordinary conversation" inside a
 *     roleplay scene is being told what kind of turn they are in by a package
 *     that is not running the turn.
 *   * the narration preset itself, because this is not a narration turn. The
 *     Engine is assembling this prompt from the chat's own preset, and appending
 *     a second preset's sections to it would be two documents arguing in one
 *     system message.
 *
 * What is left is exactly the part the village owns: the knowledge box, folded
 * with this villager's live values. The "How everyone talks" box that used to
 * feed this block as well is GONE, and the reason it could go is the whole shape
 * of this release — how a character talks is the player's Engine preset, and a
 * scene already has one. A village that wanted to sound like itself in a scene
 * says so in the preset it asked the Engine to use for that chat.
 *
 * The heading is not decoration. The block lands in the system message of a chat
 * whose preset the player chose and whose character the Engine described, so the
 * one thing it has to establish before any of it is read is that these are facts
 * about where the villager is rather than somebody else's instructions about what
 * to do — and, second, that nothing in it is a line to say. Both are stated
 * plainly, because a bare run of blocks appended to a roleplay prompt reads as
 * more prompt material and gets performed.
 */
export function renderSceneContextBlock(
  card: VillagerCard,
  village: VillageState,
  context: VillagePromptContext,
): string {
  const body = renderVillagePrompt(village.promptKnowledge, promptValuesFor(card, village, context));
  const playerRoleContext = renderPlayerRoleContext(village);
  if (body.length === 0 && !playerRoleContext) return "";
  return [
    `## ${village.name}, and ${card.name}'s part in it`,
    `You are ${card.name}, and you live in ${village.name}. Everything below is true at this moment, and it is what you know about the place you are in.`,
    "It is background, not a script. Nobody here is waiting for you to say any particular thing, and nothing below is a line to repeat.",
    body,
    body.includes(VILLAGE_SHARED_SETTING_RULE) ? "" : VILLAGE_SHARED_SETTING_RULE,
    playerRoleContext,
  ]
    .filter(Boolean)
    .join("\n\n");
}

/**
 * What the villager has just been told about their wish, and how to take it.
 *
 * The villager is given the OUTCOME and nothing else. The judge's sentence is
 * deliberately withheld: it is written for the player, it explains a decision,
 * and putting a judge's words in a villager's mouth would be the package putting
 * words in a character at the exact moment the character matters most.
 *
 * Both branches exist because the failure they prevent is the same one in two
 * directions. Told nothing, a villager handed "I mended your fence" will simply
 * thank the player for something that did not happen, and a transcript that says
 * so is a village that believes the player about its own history — which is the
 * whole thing this feature exists to stop. Told too much, the villager becomes a
 * referee, and a villager who talks like a rulebook is not a villager.
 */
function renderSettledBlock(name: string, settled: boolean): string {
  if (settled) {
    return [
      "## What has just happened",
      "Somebody has just told you they have done the thing you had been wishing for, and it is true — it has been checked against what has actually happened here, and it is settled.",
      `You are answering them now, as ${name}. Say whatever you make of that the way you would say it, and do not be told about it twice. You do not have to be warm about it, and you do not have to be gracious; you do have to know it is done.`,
    ].join("\n");
  }
  return [
    "## What has just happened",
    "Somebody has just told you they have done the thing you had been wishing for. It is NOT true — it has been checked against what has actually happened here, and it has not been done.",
    `You are answering them now, as ${name}. Be however you actually are about that: disbelieving, disappointed, indifferent, or willing to let it go. What you must not do is accept it as done, thank them for it, or pretend to be pleased.`,
  ].join("\n");
}

/**
 * An ordinary turn, or the answer to a wish.
 *
 * Still pure, and now pure in a second sense: it touches neither the model host
 * nor the document store. The preset, the resolved choices and the generation
 * parameters all arrive in `narration`, which the caller read before it got
 * here, so the whole prompt shape can be exercised with a hand-built preset and
 * no runtime behind it — which is the only way to prove the marker table, the
 * grouping and the depth injection are right.
 */
export function buildVillagerMessages(
  card: VillagerCard,
  village: VillageState,
  history: VillageChatMessage[],
  message: string,
  context: VillagePromptContext,
  narration: VillageNarrationTurn,
  mode: VillageChatMode = "chat",
  settled: boolean | null = null,
): CapabilityLanguageModelMessage[] {
  return narrationTurn(card, village, context, narration, {
    history,
    message,
    direction: "",
    mode,
    settled,
  });
}

/**
 * The direction that turns a turn into a goodbye.
 *
 * A departure is not something the player SAYS, and this block exists rather
 * than a line of the player's because of what happens when it is a line. Handed
 * "you get ready to leave" as something they were just told, a villager does the
 * only thing a character can do with a remark: they answer it. The conversation
 * then ends on the player narrating their own exit while somebody reacts to the
 * narration, which is two voices doing the wrong job — and it is the last thing
 * anybody reads of that conversation, which is the worst place to have it.
 *
 * Handed the fact instead, the villager answers the departure. The block says
 * what has happened and what this turn is, and it says it last, where it is
 * nearest the reply.
 */
const LEAVING_DIRECTION = [
  "## Right now",
  "The player has chosen to end the visit. They are getting ready to leave; do not invent anything they said or did while leaving.",
  "Say goodbye the way you actually would: a line or two, in your own voice, about them going or about the rest of your own day. Do not ask them to stay, do not open a new subject, and do not answer as though the conversation were still going — this is the last thing you say to them.",
].join("\n");

/**
 * The line that lets a villager end a conversation, and the reason it is rare.
 *
 * Until this existed, the only thing that could end a conversation was the
 * player pressing End. A villager who had somewhere to be and nothing left to
 * say had no way of saying so, and the player had no way of knowing that the
 * natural end of a conversation was not theirs to find.
 *
 * What it must NOT become is a villager who tidies the player out of the room.
 * So the whole of the frequency control is in the writing, and it is deliberately
 * three sentences of discouragement against one of permission:
 *
 *   * it is allowed only when the conversation has genuinely run out AND they
 *     have somewhere to be — said as a conditional, not as an instruction;
 *   * most turns are stated to be not-that, and the ordinary end is stated to be
 *     the player leaving, so that "nothing here" is the answer the wording points
 *     at;
 *   * an awkward pause is named as the one thing it must not be reached for,
 *     because that is the shape a too-eager model takes: a lull read as an
 *     ending.
 *
 * The marker is shown to the model in full because it IS the wire format and
 * there is nothing else to say it with. It goes on a line of its own at the very
 * end, which is the only position `readVillagesFarewell` counts — so a model that
 * writes it in the middle of an answer has written something that is stripped and
 * ignored rather than something that ends a conversation nobody asked to end.
 *
 * The first two player turns omit this permission so a new conversation cannot
 * end before the player has had a chance to continue it. Later turns still rely
 * on the model's judgment about when the conversation has run its course.
 */
const ENDING_DIRECTION = [
  "## If this conversation has run its course",
  "You may end this conversation yourself, and it is rarely the right thing to do. Only do it when the talk has genuinely run out AND you have somewhere to be — somewhere you are expected, a job still open, the light going. It is never a way past an awkward pause: a lull is not an ending, and closing a conversation that is still going is worse than letting it trail off.",
  "Most conversations end because they leave, not because you do. Most turns are not this one.",
  `When it IS true, say so in your own words — what you have to get back to, or that you will see them again — and then, on a line of its own at the very end of your answer with nothing else on it, write ${VILLAGES_FAREWELL_MARK}. That line is the whole of how it is known you meant to finish, and without it nothing ends.`,
].join("\n");

/**
 * The goodbye turn.
 *
 * The mirror of `buildGreetingMessages`, and shared with it for the same reason
 * that one shares the ordinary turn: a villager who said goodbye in a different
 * register from the one they talked in would be two characters. What differs is
 * only the direction on the end of the prompt.
 *
 * The player's exit arrives as a third-person cue in the user turn — the line
 * about them, not a line of theirs — and as a direction in the turn block, and
 * the distinction is the whole reason this builder exists. A departure written
 * as speech makes the villager do the only thing a character can do with a
 * remark: answer it. The conversation then ends on the player narrating their own
 * exit while somebody reacts to the narration, which is two voices doing the
 * wrong job in the last thing anybody reads of that conversation. The cue is
 * what the villager is looking at when they decide what to say; the direction
 * tells them it is the last thing they get to say.
 */
export function buildLeavingMessages(
  card: VillagerCard,
  village: VillageState,
  history: VillageChatMessage[],
  context: VillagePromptContext,
  narration: VillageNarrationTurn,
): CapabilityLanguageModelMessage[] {
  return narrationTurn(card, village, context, narration, {
    history,
    // Named when the player has a name to be named by, and described when they do
    // not — a village nobody has said who they are in is a real village, and the
    // cue has to read as a sentence either way.
    message: `${village.playerName.trim() || "The person you are talking to"} is getting ready to leave.`,
    direction: LEAVING_DIRECTION,
    mode: "chat",
    settled: null,
  });
}

/**
 * Who else is out and about, grouped by the place each of them is standing in.
 *
 * The question `{{roster}}` cannot answer — the roster is who LIVES here — and
 * the one the room work is built on: a villager in a room has to know who is in
 * the room with them. It is a group-by over facts the village has kept on disk
 * since venues existed and had never put in front of anybody: `villagerPlaceView`
 * is the same place whose name is on the plate in the drawer, and the same
 * schedule read that says what this villager is doing says where everyone else is.
 *
 * Pure, and exported, because it is a group-by over data the caller has already
 * read: the proof hands it a village and a map of routines with no host behind
 * either. It is GIVEN the routines rather than reading them, and that is the
 * whole of how one send stays one derivation of the moment — the speaker's own
 * routine comes out of the same map, so a villager cannot be standing somewhere
 * in a neighbour's answer and somewhere else in their own.
 *
 * Placed by the same function that DRAWS a place, called with the same things, so
 * the building on the speaker's own plate and the group their neighbour is put in
 * cannot come from two readings of the clock. Anybody the village cannot place at
 * all — no venue and no home, which is the ordinary state for a card that was
 * dragged around the map by hand — is left out rather than gathered under a
 * heading that names nothing.
 *
 * `names` comes from the adopted card snapshots, so the name heard here is the
 * name heard on a house even after a source card is deleted.
 *
 * The speaker's own place comes first and the speaker is in none of the groups. A
 * report that opened with the reader's own name would be a cast list rather than
 * what they can see, and an entry for somebody already in the room is the one
 * thing the block does not need to tell them.
 */
export function presentFor(
  village: VillageState,
  speakerId: string,
  routines: ReadonlyMap<string, NativeRoutine>,
  names: ReadonlyMap<string, string>,
): VillagePresentGroup[] {
  const minuteOfDay = deriveVillageMoment({
    foundedAt: village.foundedAt,
    seed: village.seed,
    now: new Date(),
  }).minuteOfDay;
  const speaker = village.villagers.find((villager) => villager.characterId === speakerId) ?? null;
  // Where the SPEAKER is standing, decided here rather than passed in, so that
  // the room they are told they are in and the room they are told others are in
  // are one decision. "" when the village cannot place them, which no place id
  // ever is, so no group needs a special case for it.
  const hereId = speaker
    ? (villagerPlaceView(village, speaker, routines.get(speakerId) ?? null, minuteOfDay)?.id ?? "")
    : "";
  const groups = new Map<string, VillagePresentGroup>();
  for (const villager of village.villagers) {
    if (villager.characterId === speakerId) continue;
    const routine = routines.get(villager.characterId) ?? null;
    const place = villagerPlaceView(village, villager, routine, minuteOfDay);
    if (!place) continue;
    let group = groups.get(place.id);
    if (!group) {
      group = { id: place.id, name: place.name, kind: place.kind, here: place.id === hereId, people: [] };
      groups.set(place.id, group);
    }
    group.people.push({
      characterId: villager.characterId,
      name: names.get(villager.characterId) ?? villager.cardSnapshot.name,
      // The village's own phrase for the hour, read WITHOUT a fallback. This is
      // deliberately not `translateBlock`, which answers with the village's
      // "at home" default whenever it has nothing of its own to say — the one
      // sentence that must not be printed beside a line that has just said where
      // somebody is. `lookupRemap` is the same lookup with the fallback left off,
      // and it reads only the village's own translation, so the Engine's words
      // have no path here either.
      doing: agendaAt(villager.agenda, minuteOfDay)?.activity ?? "",
    });
  }
  // The speaker's own room first, and a stable sort, so the order the villagers
  // moved in still decides everything below it.
  return [...groups.values()].sort((left, right) => Number(right.here) - Number(left.here));
}

/**
 * Who else the speaker can see, and when and where they are all standing.
 *
 * The moment is derived ONCE here, at the edge, and the routine is read once:
 * both then flow into the pure prompt builder as plain data. One send = one
 * derivation, so the prompt cannot disagree with itself about the time.
 *
 * Exported for the SCENE lane, which is the second caller and the only other
 * place a villager is written as. It is the same gathering on purpose: a scene in
 * which the villager knows a different day, a different memory or a different
 * roster from the one they know in the drawer would be two people wearing one
 * name, and the whole point of the scene is that it is the same person somewhere
 * else. Sharing the builder is also what makes the two channels unable to drift:
 * there is one answer to "what does this villager know right now" and both read
 * it.
 */
export async function buildPromptContext(
  village: VillageState,
  speakerId: string,
  topic = "",
): Promise<VillagePromptContext> {
  const now = new Date();
  const moment = deriveVillageMoment({ foundedAt: village.foundedAt, seed: village.seed, now });
  // Every villager's hour, off the ONE read this turn performs. The speaker's own
  // routine is taken out of the same map rather than asked for on its own
  // afterwards: `readNativeSchedules` answers for the whole village at once from
  // the thirty-second cache, so a per-speaker read followed by a per-village read
  // would be the same cached answer fetched twice and two chances for the two
  // halves of the turn to describe different hours.
  const residentIds = village.villagers.map((villager) => villager.characterId);
  const routines = new Map<string, NativeRoutine>();
  const residents = residentsFromSnapshots(village.villagers);
  const routine = routines.get(speakerId) ?? null;
  const others = residentIds.filter((characterId) => characterId !== speakerId);
  // The adopted snapshots answer both questions, so a roster and a house use
  // the same name without another character-library read.
  // The speaker's own record, read once for both of the derived facts the
  // village keeps about them. Two separate `find`s would be two chances for the
  // two lookups to disagree about who is speaking.
  const speaker = village.villagers.find((villager) => villager.characterId === speakerId) ?? null;
  const speakerPlace = speaker ? (villagerPlaceView(village, speaker, routine, moment.minuteOfDay)?.name ?? "") : "";
  return {
    roster: others.flatMap((characterId) => {
      const label = residents.labels.get(characterId);
      return label ? [label] : [];
    }),
    // Names for rooms and houses come from the same adopted snapshots.
    present: presentFor(village, speakerId, routines, residents.names),
    lore: [
      ...(await readVillageLore(
        village.selectedLorebookIds,
        [villageCurrentSetting(village), speakerPlace, speaker?.cardSnapshot.name ?? "", topic].join("\n"),
        undefined,
        village.loreTokenBudget,
      )),
      villageRelevantOrigin(village, topic),
    ].filter(Boolean),
    homes: projectHomeLines(village, residents.names),
    memory: memoryForVillager(village.chronicle, speakerId),
    moment,
    routine,
    // Read off the roster entry that was already loaded, rather than through a
    // second read: a translation is one of the facts the village keeps about a
    // resident, exactly like the agenda below it. Null here is the ordinary
    // case — most characters have no native schedule at all, and a schedule the
    // Engine has regenerated leaves a translation that no longer matches its
    // week — so it is a value rather than an error, and `doingFor` reads the
    // Engine's own words instead.
    remap: speaker?.remap ?? null,
    // Read in the same place and for the same reason. A villager who has not
    // been written for yet has none, and an empty `{{wishes}}` is the right
    // prompt for them — the block renders nothing at all.
    agenda: speaker?.agenda ?? null,
  };
}

const GREETING_DIRECTION = [
  "## Right now",
  "Somebody has just walked up to you in the middle of your day, and you have not greeted them yet.",
  "Say hello the way you actually would: a line or two, in your own voice, the way you talk, and something about where you are or what you were doing when they arrived. Do not introduce yourself, do not explain the village, and do not ask a list of questions.",
  "This is the first thing they will ever hear you say. What it is, is yours to decide.",
].join("\n");

/**
 * The greeting turn.
 *
 * An ordinary turn, an empty transcript and one direction block, which is what
 * it always was. What changed is that the thing on the front is now the player's
 * preset rather than a string this package wrote, so a villager greets a player
 * in the same register they will answer them in, in whatever format the player's
 * own Engine chats use.
 *
 * The transcript is empty on a first hello and is NOT always empty here: the
 * greeting turn is also what a room re-opens with when it has one line in it, so
 * the history is passed rather than assumed away.
 */
export function buildGreetingMessages(
  card: VillagerCard,
  village: VillageState,
  context: VillagePromptContext,
  narration: VillageNarrationTurn,
  history: VillageChatMessage[] = [],
): CapabilityLanguageModelMessage[] {
  return narrationTurn(card, village, context, narration, {
    history,
    // The third-person cue the greeting has always ended on. It stays in the
    // user slot rather than moving into the turn block, because it is the turn
    // the villager answers: with nothing on the end of the prompt but system
    // text, a provider that requires a user message refuses the call and a model
    // that does not still has nothing to speak into.
    message: `Somebody has just walked up to ${card.name}.`,
    direction: GREETING_DIRECTION,
    mode: "chat",
    settled: null,
  });
}

/**
 * The direction that turns a greeting into the opening of a SCENE.
 *
 * A scene opens on the same fact a greeting does — somebody has just walked up
 * in the middle of the day — and the greeting direction already asks for a line
 * about where the villager is and what they were doing. What it does not ask
 * for, because a conversation does not have it, is the two things that make a
 * roleplay opening rather than a hello: prose around the speech, and the
 * paragraph being written from inside the scene rather than after it.
 *
 * The instruction to keep it short is doing real work. This line is the first
 * message of a chat the player is about to write in, and an opening that runs
 * to eight sentences is a wall between them and their turn. It is also what the
 * model will read as its own prior output on every later turn, so a long one
 * teaches the chat to be long.
 *
 * The last line is the greeting's last line, kept because it is the same fact
 * and it has the same effect: told what this is for, the villager writes
 * something. Told it is an example, they write a specimen.
 *
 * 0.4.56 took the ban on asterisks out of it, and the ban was wrong for a reason
 * worth writing down. What a mark MEANS in this chat is the player's own
 * Engine preset's business and not the village's: a preset that turns asterisks
 * into narration and one that turns them into emphasis in spoken word are both
 * correct presets, and a direction that forbade the character outright was the
 * village overruling the player's own chosen way of writing. It was also already
 * being ignored — real replies carry stage directions in asterisks, which the
 * tab has read as emphasis since 0.4.52 — so the clause was doing nothing but
 * putting a rule in the prompt that the words below it contradicted.
 *
 * The same release stopped the direction requiring the villager to have noticed
 * the player the moment they arrived. Being absorbed in what you were doing and
 * coming to somebody a beat later is the ordinary way a person is interrupted,
 * and the sentence above already asks where they were and what they were doing;
 * saying they must already be attending to the player is what turned that into a
 * greeting. It matters more, not less, once a room is what is being opened:
 * somebody in the middle of something may not have looked up yet, and picking
 * that beat to open on is the scene, not a failure to greet.
 */
const SCENE_OPENING_DIRECTION = [
  "## This is a scene",
  "Somebody has just walked up to you in the middle of your day and the two of you are now in a scene together, so open it yourself.",
  "Write the scene's first turn: where you are, what you were doing when they arrived, and something to them, in your own voice. Prose and speech together is right here — write what you do in plain sentences, and write what you say the way you say it. You do not have to have noticed them the moment they arrived: somebody who was absorbed in what they were doing can open on that and look up a beat later. Do not introduce yourself, do not explain the village, and do not ask a list of questions.",
  "Keep it to three or four sentences. It is the first line of a scene somebody is about to write into, not a report about your day.",
  "This is the first thing they will ever read from you here. What it is, is yours to decide.",
].join("\n");

/**
 * Open a SCENE with a line from the villager.
 *
 * Built on the greeting deliberately rather than on a second prompt of its own.
 * Both turns answer the same question — what do you say when somebody walks up
 * to you in the middle of your day — and the greeting's version of it is already
 * the one that has been run against real connections and had its token budget
 * raised twice for empty answers. Two builders for one question is how the
 * village ends up with a villager who opens a conversation one way and a scene
 * another, for no reason the player could ever see.
 *
 * The only difference is the direction block, and it is a second block rather
 * than a replacement so that everything the greeting direction gets right about
 * register is still stated. It is also the reason this function does not simply
 * take a `mode` argument: the mode blocks in `renderModeBlock` are about the
 * village's own turn types, and a scene is not one of them.
 */
export function buildSceneOpeningMessages(
  card: VillagerCard,
  village: VillageState,
  context: VillagePromptContext,
  narration: VillageNarrationTurn,
): CapabilityLanguageModelMessage[] {
  return narrationTurn(card, village, context, narration, {
    history: [],
    message: `Somebody has just walked up to ${card.name}.`,
    // Two directions rather than one, and in this order, so that everything the
    // greeting gets right about register is still stated and then narrowed.
    direction: `${GREETING_DIRECTION}\n\n${SCENE_OPENING_DIRECTION}`,
    mode: "chat",
    settled: null,
  });
}

// ── Ending a conversation ────────────────────────────────────────────────────
//
// A conversation is the one thing that happens in this village which nothing
// else can see. Everything a villager says is answered from their own transcript
// and written nowhere else, so before this call the only trace of an afternoon
// spent talking to somebody was the lines themselves — which end up deleted,
// because a village's memory of a conversation has to be a memory and not a log
// file.
//
// So a conversation is closed the way a part of the day is: one call, asked for
// what is worth still knowing in a month, and the answer is stored as memory and
// not as dialogue. What makes this different from the tick is who it is about.
// The tick writes about the village; this writes about ONE villager, and the
// villager is the subject of every line it is allowed to write — which is why
// the shape below has no "who" at all. There is nobody else it could name.

/**
 * Everything the end-of-conversation call is allowed to read.
 *
 * Assembled at the edge for the same reason `VillagePromptContext` is: reading a
 * card and resolving who the player is are async and the prompt builder is not.
 */
export type VillageDistillContext = {
  village: VillageState;
  moment: VillageMoment;
  card: VillagerCard;
  /** Who the player is, already resolved from the Persona or the typed name. */
  playerName: string;
  playerDescription: string;
  /** What this villager already remembers, so they do not write it down twice. */
  memories: readonly VillageChronicleEntry[];
  transcript: readonly VillageChatMessage[];
};

/** One thing a conversation left behind, before it is filed against a day. */
export type VillageDistilledMemory = {
  text: string;
  private: boolean;
};

function buildDistillMessages(context: VillageDistillContext): CapabilityLanguageModelMessage[] {
  const { card, village } = context;
  const world = villageCurrentSetting(village).trim();
  const player = context.playerName.trim() || "the player";
  const who = [
    card.description ? `Description:\n${condense(card.description, MAX_RESIDENT_SUMMARY_LENGTH)}` : "",
    card.personality ? `Personality:\n${condense(card.personality, MAX_RESIDENT_SUMMARY_LENGTH)}` : "",
  ]
    .filter((section) => section.length > 0)
    .join("\n");
  const said = context.transcript
    .map((line) => `${line.role === "user" ? player : line.speakerName || card.name}: ${line.content.trim()}`)
    .filter((line) => line.length > 0);
  const known = context.memories.map((entry) => entry.text.trim()).filter((line) => line.length > 0);

  const sections = [
    `You are writing down what was said between ${card.name}, a villager, and ${player}. You are not writing as either of them, and you are not continuing the conversation.`,
    [
      `The village is called ${village.name}.`,
      world.length > 0
        ? `The player describes it like this:\n"""\n${world}\n"""`
        : "Nobody has described it beyond its name, so keep everything small and ordinary.",
      `It is ${describeMoment(context.moment)}.`,
    ].join("\n"),
    // The one fact the transcript cannot carry any more. Since 0.4.31 the
    // departure is a flag rather than a line of the player's, so this call is
    // handed a conversation that simply stops after a goodbye — and its own
    // rules tell it to leave greetings out, which a goodbye reads as. The
    // visit ending is therefore stated here rather than left to be inferred:
    // the village should remember that the player chose to go, and when, and
    // not only what happened to be said before they did.
    [
      `${player} ended the visit and left. That is why this conversation is over, and ${card.name} said goodbye as they went.`,
      `The goodbye is the last line below, and the reason nothing follows it.`,
    ].join("\n"),
    [`Who ${card.name} is:`, who.length > 0 ? who : `${card.name} lives here.`].join("\n"),
    context.playerDescription.trim().length > 0
      ? `Who ${player} is:\n${condense(context.playerDescription, MAX_RESIDENT_SUMMARY_LENGTH)}`
      : `${player} lives here too.`,
    known.length > 0
      ? ["What is already remembered about this, so do not write it again:", ...known.map((line) => `- ${line}`)].join(
          "\n",
        )
      : "",
    ["What was said, in order:", ...said.map((line) => `- ${line}`)].join("\n"),
    [
      "Answer with JSON only, in exactly this shape and nothing else:",
      '{"memory":[{"text":"...","private":false}],"happenings":["..."],"venueRequest":null}',
    ].join("\n"),
    [
      "Rules:",
      `- Write between 0 and ${MAX_CHRONICLE_PER_WRITE} entries in "memory". An empty list is a good answer for a conversation that settled nothing.`,
      `- One entry is one or two short sentences, under ${MAX_CHRONICLE_LENGTH} characters, in the past tense, and says what was SAID or SETTLED rather than that a conversation happened.`,
      "- Write nothing that was not in the conversation above. Do not invent a detail, a promise or a feeling that neither of them expressed.",
      `- Set "venueRequest" to {"quote":"...","name":"...","classes":["gathering"]} only if ${card.name} explicitly asked ${player} to add a new place. Copy an exact excerpt of ${card.name}'s own words into "quote"; another speaker's words do not count. Use the place and Venue Class ${card.name} actually asked for. Otherwise use null. A private wish or the player's suggestion alone is not a request.`,
      '- "private" true means it passed between the two of them and only ' +
        `${card.name} knows it. "private" false means it is something the whole village now knows or could see for itself.`,
      `- The subject is always ${card.name} and ${player}. Do not name anyone else, and do not name a real place, company or person.`,
      `- Say who did what. Write "${card.name} told ${player}..." rather than "we discussed..." or "you asked me about...", and never write "the player" — use the name above.`,
      `- Leave out small talk, greetings, and anything about the weather unless the weather was the whole of it. ${player} ending the visit is not small talk: the goodbye is worth keeping when it is what the conversation came to, written as something the two of them did — "${card.name} said goodbye to ${player} and watched them go."`,
      [
        `- Also write between 0 and ${MAX_HAPPENINGS_PER_WRITE} happenings in "happenings": what REST OF THE VILLAGE saw or heard of the conversation above, whoever else was around to notice it.`,
        "- Most conversations are nobody's business, so an empty list is the usual answer and the right one. Write one only if somebody outside this conversation could have seen or heard it happening.",
        "- Do not write the conversation back out as news, and do not write anything that a memory above already says.",
        HAPPENING_RULES.shape,
        HAPPENING_RULES.ordinary,
        HAPPENING_RULES.people,
        HAPPENING_RULES.harm,
        HAPPENING_RULES.strangers,
        HAPPENING_RULES.noWish,
        HAPPENING_RULES.setting,
        HAPPENING_RULES.names,
      ].join("\n"),
      "- No markdown, no numbering, no commentary outside the JSON.",
    ].join("\n"),
  ].filter((section) => section.length > 0);

  return [
    { role: "system", content: sections.join("\n") },
    { role: "user", content: `What has ${card.name} taken from that conversation?` },
  ];
}

/**
 * Bound a distillation reply to what the village will store.
 *
 * The rules here are the same two the tick's memory follows, for the same
 * reasons: a memory the village already holds is dropped rather than stored
 * twice, because a model shown its own last entry will happily write it again;
 * and a line that says nothing is dropped rather than filed as a blank.
 *
 * The attribution is not read from the reply at all. Every line this call
 * produces is about the villager who was spoken to, so the caller supplies them
 * and the model is never asked who a memory is about — the one answer it could
 * give that would be wrong is the one it is not offered.
 *
 * `seen` is passed in and mutated rather than built here, because the reply also
 * carries the happenings and a memory and a happening must not be the same
 * sentence. The caller owns the one set both lists are read against.
 */
function coerceDistilledMemory(payload: Record<string, unknown>, seen: Set<string>): VillageDistilledMemory[] {
  const memory: VillageDistilledMemory[] = [];
  for (const entry of Array.isArray(payload.memory) ? payload.memory : []) {
    // A bare string is read as well as an object, for the same reason the
    // tick's memory is: the reply is written by a model and both shapes are
    // things models produce. All a string can lose is the scope, and the
    // default scope is the one that tells everybody something true.
    const record: Record<string, unknown> =
      typeof entry === "object" && entry !== null && !Array.isArray(entry)
        ? (entry as Record<string, unknown>)
        : { text: entry };
    const text = boundText(record.text, MAX_CHRONICLE_LENGTH);
    const key = text.toLowerCase();
    if (text.length === 0 || seen.has(key)) continue;
    seen.add(key);
    memory.push({ text, private: record.private === true });
    if (memory.length >= MAX_CHRONICLE_PER_WRITE) break;
  }
  return memory;
}

/**
 * Ask the model what this conversation left behind, and what the village saw of it.
 *
 * The prompt states outright that the player ended the visit and left. That is
 * the one fact a transcript no longer holds — since 0.4.31 the departure is a
 * flag rather than a line of the player's — and a closing call left to infer it
 * from a goodbye was free to read the goodbye as the small talk it is told to
 * leave out, which would close a conversation and remember nothing about why it
 * ended.
 *
 * Throws only when the call itself failed or the reply held no usable JSON — an
 * empty memory list and an empty happening list are both perfectly good answers.
 * The caller is expected to catch it and keep the conversation: nothing is
 * cleared until this has returned.
 *
 * The happenings ride along on this call rather than costing one of their own,
 * because this is the only moment the package already has the transcript in
 * front of a model and the only moment it knows the conversation is over. A
 * second call here would be a second call for something the model has already
 * read.
 */
export async function proposeConversationMemory(
  context: VillageDistillContext,
  options: { signal?: AbortSignal } = {},
): Promise<{
  memory: VillageDistilledMemory[];
  happenings: VillageHappening[];
  venueRequest: VenueRequestCore | null;
  model: string;
}> {
  const model = await villagesLanguageModels().resolveForRequest({
    connectionId: await villagesConnectionIdFor("narration"),
  });
  const requestedMaxTokens = Math.min(model.maxOutputTokens ?? DISTILL_MAX_TOKENS, DISTILL_MAX_TOKENS);
  const fitted = model.fitContext(buildDistillMessages(context), { maxTokens: requestedMaxTokens });
  const debugEnabled = villagesDebugAgentsEnabled();
  villagesLogger().debugOverride(
    debugEnabled,
    "[villages] %s closing prompt for card %s: %s",
    model.model,
    context.card.id,
    JSON.stringify(fitted.messages),
  );

  const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? requestedMaxTokens, {
    temperature: DISTILL_TEMPERATURE,
    debugMode: debugEnabled,
    signal: options.signal,
  });

  const content = completion.content ?? "";
  const payload = extractJsonObject(content);
  if (!payload) {
    // Never "had nothing to say about that". That sentence was a verdict on the
    // VILLAGER, and every state it was reached from is a fact about the CALL: a
    // model that spent its budget before answering, or one that answered prose
    // where JSON was asked for. A player was told that the person they had just
    // spent an evening with had nothing to say about it, while the conversation
    // sat unremembered and the transcript was left exactly where it was — one
    // sentence blaming the wrong party, twice over.
    //
    // The ordering around this is deliberate and unchanged: nothing is written
    // and nothing is cleared until this returns, so a failure here leaves the
    // conversation whole and endable again. What is new is that the player is
    // told that, instead of being told about the villager.
    if (content.trim().length === 0) {
      throw new Error(
        completion.finishReason === "length"
          ? `${context.card.name} ran out of room before writing down what the conversation left behind, so nothing was written and the conversation is still here. Try ending it again.`
          : `${context.card.name} did not answer, so nothing was written down and the conversation is still here. Try ending it again.`,
      );
    }
    throw new Error(
      `${context.card.name}'s answer about the conversation could not be read, so nothing was written down and the conversation is still here. Try ending it again.`,
    );
  }
  const seen = new Set(context.memories.map((entry) => entry.text.trim().toLowerCase()));
  // Memory first, so a line the model put in both lists is kept as the memory:
  // the record is the half that lasts, and a happening is dropped for free when
  // its moment passes.
  const memory = coerceDistilledMemory(payload, seen);
  const happenings = coerceHappeningList(payload.happenings, seen, context.moment, MAX_HAPPENINGS_PER_WRITE);
  return {
    memory,
    happenings,
    venueRequest: readConversationVenueRequest(payload.venueRequest, context.transcript),
    model: model.model,
  };
}

/** Build the chronicle entries one ended conversation produced. */
export function conversationMemoryEntries(
  distilled: readonly VillageDistilledMemory[],
  context: Pick<VillageDistillContext, "card" | "moment" | "village"> & { at: string },
): VillageChronicleEntry[] {
  const actor = { id: context.card.id, name: context.card.name };
  return distilled.map((entry) => ({
    id: randomVillageSeed(),
    dayIndex: context.moment.dayIndex,
    clock: context.moment.dayPhase,
    occurredAt: context.at,
    timePrecision: "exact",
    // The villager is the only person a private memory can be about, because
    // the villager is the only person who was there. A shared memory names them
    // too: it is what the village knows, and it is about them.
    scope: entry.private ? "private" : "village",
    actors: [actor],
    kind: "chat",
    text: entry.text,
  }));
}
