import { venueZones, canOccupyZone } from "./venue-zones.js";
// Villages — translate the Engine's week into this village's own terms.
//
// This is the join between the two systems, and it exists because of one
// asymmetry that cannot be fixed from the village's side.
//
// Conversation mode invents a weekly agenda from the CARD alone. The model
// writing it knows the character, their world, and nothing about where they are
// about to live — so a pilot gets mornings "in the cockpit of the Halcyon", and
// that sentence is stored as a character-level fact shared across every chat
// they appear in. A village cannot correct it. Writing the schedule would mean
// `chat-write` on a whole-blob replace with no optimistic lock, over a fact that
// belongs to every other chat, over a week the Engine regenerates on its own.
// Two writers and no tiebreak is not a fix; it is a second bug.
//
// So the village does not touch the schedule. It TRANSLATES it, once a week and
// again whenever the week or the village's own vocabulary changes, into its own
// words, and keeps the translation beside the villager.
//
// The rule is four clauses and every one of them is load-bearing:
//
//   * TRANSLATE THE VERB, KEEP THE SLOT. What somebody is doing stays the same
//     KIND of thing, at the same point in the week, for the same number of hours.
//     A three-hour flight becomes a three-hour drive, not a walk round the block,
//     and it happens at the same hours the flight did. This is what makes the
//     translation a translation rather than a second invention.
//   * REPLACE THE NOUN. The place and the machinery are the village's to name,
//     and the village already has a list of them — its venues. That list is the
//     whole vocabulary of nouns available, and it is the reason a translated
//     week is a week the village can actually draw on its own map.
//   * HONOUR THE STATUS. The Engine's `online`/`idle`/`dnd`/`offline` is its only
//     statement about whether an hour is the character's own or committed to
//     something else. A translation that turned a committed hour into free time
//     would be the village overriding the one thing the schedule is for.
//   * NEVER LEAK THE ENGINE'S WORDS. This clause used to read "degrade to the
//     Engine's own words", and it was the bug. A fallback is read by the same
//     prompts as a translation is, so a fallback in the Engine's words is the
//     leak this whole file exists to close, arriving one hour late: the village
//     translated a pilot's week into haymaking and then quietly said "in the
//     cockpit of the Halcyon" for the one hour the translator missed. A miss is
//     answered with the village's own default — see
//     `VILLAGE_UNTRANSLATED_ACTIVITY` — and never with the sentence that named
//     the spaceship.
//
// The work is done ONCE per week rather than per prompt, because a translation
// is a lookup table and not a call: `lookupRemap` is a string comparison, and
// rendering a villager at three in the morning costs nothing.
//
// The unit of translation is the BLOCK, not the phrase. The version before this
// one grouped the week's fifty-odd blocks by their sentence, summed the hours
// behind each one, and asked for one phrase per DISTINCT sentence — which is
// cheaper and which produced a translation nobody could check. "Sleeping, 50
// hours a week" tells a player nothing about Tuesday at eleven, and a card whose
// week had a distinct activity in every hour came back as a dilution of it. Both
// ends of the round trip are the slot now: the model is handed the week day by
// day and hour by hour and answers once per slot, the lookup is keyed by
// `day|time`, and the tab prints the Engine's sentence beside the village's, one
// row per block. That is the only version of this a person can hold against the
// card they wrote.
import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import { asRecord, condense } from "./coerce.js";
import { villagesConnectionIdFor } from "./connections.js";
import { extractJsonObject } from "./village-bootstrap.js";
import {
  villagesDebugAgentsEnabled,
  villagesLanguageModels,
  villagesLogger,
  completeWithRoom,
  completionFailure,
} from "./package-runtime.js";
import {
  boundText,
  describeStatus,
  MAX_REMAP_HERE_LENGTH,
  MAX_REMAP_SLOT_LENGTH,
  MAX_ROUTINE_SUMMARY_LENGTH,
  MAX_VENUES,
  MAX_VILLAGER_WISHES,
  remapVenues,
  wishWeightWords,
} from "./prompt-preset.js";
import type { NativeDayBlock, NativeRoutine, NativeWeekSchedule } from "./native-schedules.js";
import { parseBlockRange } from "./native-schedules.js";
import type {
  RemapBlock,
  VillageDayBlock,
  VillagePromptMessage,
  VillageRemap,
  VillageRemapMove,
  VillageVenue,
  VillageWish,
} from "./types.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";

/**
 * Output room for one bounded translation batch, including reasoning tokens.
 */
export const REMAP_TOKENS_PER_BLOCK = 150;
/**
 * A small batch still needs room to reason before writing JSON.
 */
export const REMAP_TOKENS_FLOOR = 2_600;
/**
 * The host's configured max output takes precedence when smaller.
 */
export const REMAP_TOKENS_CEILING = 6_000;

/**
 * How much output room one translation of this many blocks is asked for.
 *
 * The prompt asks for one move per source block in this batch.
 *
 * `REMAP_TOKENS_PER_BLOCK` is above the longest a legal move can be — a day, an
 * hour range, a `MAX_REMAP_HERE_LENGTH` phrase and a place number — rather than
 * at it, because a model that has been asked to copy a day and an hour range
 * exactly will sometimes spell the day out twice before it settles.
 */
export function remapAnswerBudget(blockCount: number): number {
  const wanted = Math.max(REMAP_TOKENS_FLOOR, Math.floor(blockCount) * REMAP_TOKENS_PER_BLOCK);
  return Math.min(REMAP_TOKENS_CEILING, wanted);
}
/**
 * Cool, because this is a translation rather than an invention. Everything the
 * answer needs is already in the prompt, and a warm model asked to keep the
 * shape of something will happily improve on it instead.
 */
const REMAP_TEMPERATURE = 0.5;
/**
 * The card's description again, cut at the same length the agenda call cuts it.
 * This call reads it for a narrower reason than that one does — the translation
 * only needs to know what somebody's week is FOR, so that a job stays a job and
 * a hobby stays a hobby — but it is the same
 * ponytail: the front of the card, not a summary of it.
 */
const REMAP_DESCRIPTION_MAX = 1_200;

/**
 * The one sentence in the translation prompt that the place rule is built from.
 *
 * Hoisted out of the array only so that the two places it is needed — the rule
 * itself and the place list it refers to — cannot drift apart. It is written as
 * a question in the model's own terms rather than as an instruction, because the
 * field it is asking for is the one the model has no natural reason to produce:
 * everything else in the JSON is something a person writing that week would have
 * written anyway, and a number off a list is not.
 */
const PLACE_QUESTION = "Pick the place the move actually happens in, not the sort of place it is.";

/**
 * What a villager's hour reads as when the village has no translation for
 * the hour.
 */
export const VILLAGE_UNTRANSLATED_ACTIVITY = "at home";

/**
 * How many times the village will ask about one week before settling for what it
 * has.
 *
 * One retry, and the cap is the whole reason the completeness check can be
 * allowed to run at all. The ordinary cause of a missing move is a model that
 * answered about forty blocks out of fifty, and that is worth asking again for.
 * The other cause is a slot the model will never copy back exactly — a day or an
 * hour range it keeps tidying up as it writes — and a village that asked about it
 * on every part of every day would spend a model call a day forever learning the
 * same nothing. Past the cap the village keeps the table it has, and the hours
 * that table cannot explain read as `VILLAGE_UNTRANSLATED_ACTIVITY`.
 *
 * ponytail: the retry is capped rather than exhaustive, so a week the model
 * cannot finish keeps a few hours at the village's default. Ceiling accepted
 * because the alternative is an unbounded loop over somebody else's model.
 * Upgrade path if it ever matters: ask for the missing keys alone, in one
 * follow-up call, instead of re-asking for the whole week.
 */
export const MAX_REMAP_ATTEMPTS = 2;

const REMAP_SYSTEM_PROMPT = [
  "You are writing one person's weekly agenda as it happens in a particular village, for a text roleplay. You are not writing dialogue and you are not addressing anyone.",
  "The original week was written for this character before anything knew which village they would live in, so it may describe places, vehicles and machines that do not exist here. Your job is to say the SAME thing happening HERE, at the SAME time.",
  "Keep the shape: how long each block takes, when in the week it falls, whether it is work or rest, whether they are away from home or at it, and whether they are asleep. Replace the NOUNS — the places, the vehicles, the machinery — and nothing else.",
  "Answer with JSON only, in exactly this shape and nothing else:",
  '{"agenda":"...","moves":[{"day":"...","time":"...","here":"...","place":1,"zoneId":"exact zone id"}]}',
  "Rules:",
  '- "moves" has exactly one entry for every block you were given, and no others. One block of their week, one entry. Do not merge two blocks into one entry, do not summarise a day, do not leave a block out, and do not invent one.',
  '- "day" is the day that block was listed under, copied back EXACTLY as it was written. "time" is that block\'s hour range with its start and end, copied back EXACTLY as it was written, including the hyphen and the leading zeroes. Together they are the key the village finds your answer by, so one changed character means that whole block of the week is dropped and reads as nonsense here.',
  '- Do not echo the activity sentence back. It is given to you so you know what each block is FOR; what the village stores for the block is your "here" phrase.',
  `- "here" is under ${MAX_REMAP_HERE_LENGTH} characters and says what that same block is, here. Write it as a phrase that follows "Right now you are", so begin with a lowercase verb: "out on the", "mending the", "asleep in". Never begin with "they", a name, or a capital letter, and never write a whole sentence.`,
  '- "here" must be about something this village HAS. Use the places listed below by their own names where one fits. If what they are doing has no place here, describe it as the nearest thing this village could hold, or as part of an ordinary day in a place like this.',
  `- "place" is the NUMBER of the one place in the numbered list below where this block happens, as a number and not a name. ${PLACE_QUESTION} Write 0 when there is no place on that list for it — somebody asleep, somebody walking between two places, somebody doing something this village has no room for. Do not invent a number, and do not leave the field out. Say the same place twice if two blocks happen at the same one.`,
  "- The person's wishes may subtly influence how they carry out an activity. Keep each block about the activity itself; do not turn an hour into a wish, errand, or request.",
  "- Current village places and confirmed outcomes outrank lorebook descriptions of older desires. Never portray an already fulfilled wish as still unmet.",
  "- A desire in lore does not prove that an object exists or belongs to this person. Only current venue facts and confirmed outcomes establish present assets.",
  "- Keep the availability you were given. Somebody whose block is busy is busy doing this; somebody whose block is asleep is asleep through it. Do not turn a committed hour into free time, or the other way round.",
  `- "agenda" is one sentence under ${MAX_ROUTINE_SUMMARY_LENGTH} characters describing an ordinary day for them HERE, in the same terms as your moves. It must not mention anything this village does not have.`,
  "- Never mention anything this village does not have: no technology, no vehicles, no travel to other worlds, no countries, no companies, no institutions, no places and no people the description does not imply. Somebody whose week involves flying a ship does not fly one here; they do the nearest thing this village could actually hold.",
  "- Keep it ordinary. Nobody here is saving anybody, and nothing you write may need explaining.",
  "- Say nothing about the village having translated anything, and never refer to the original activity as unusual, foreign, or out of place. As far as anyone here is concerned, this is simply what they do.",
  '- Give the same block the same "here" phrase every time it comes round. The agenda repeats, so somebody who spends every weekday morning the same way spends every weekday morning the same way here too.',
  "- Stay inside the description of the village given to you.",
  "- Do not name a real town, country, company, person or existing fictional setting.",
  "- Plain prose only. No markdown, no numbering, no commentary outside the JSON.",
];

/**
 * Everything one translation is written from.
 *
 * The places are the point of the whole call: they are the nouns the village is
 * willing to have named, and a translator given them cannot land somewhere the
 * village has no room for. The description is here for the same reason the
 * agenda call takes it — a therapist's week and a blacksmith's week translate
 * differently, and only the card knows which one this is.
 */
export type VillageRemapContext = {
  characterId?: string;
  village: string;
  setting: string;
  lore: readonly string[];
  completedWishes: readonly string[];
  loreKey: string;
  venues: readonly VillageVenue[];
  /**
   * What this villager wishes for, in the order the agenda holds them.
   *
   * The second list of nouns this call is handed, and a reader who has met the
   * first one has to be told how this one differs, because the difference is the
   * feature. A PLACE decides the shape of an hour: choose one and the block
   * happens somewhere, and the phrase is written around that. A WISH must not —
   * it may only colour an hour whose shape was decided by the week and the place
   * — and the prompt says so in as many words, because a numbered list of things
   * somebody wants is precisely the thing a model will build a week out of.
   *
   * Empty is ordinary and is not a failure. A villager whose agenda has not been
   * written yet, one who genuinely wishes for nothing, and every translation the
   * village wrote before this release all send an empty list, and all of them
   * translate exactly as a week with no wishes in it should.
   */
  wishes: readonly VillageWish[];
  name: string;
  /** The card's blurb, and the tags, as the agenda call takes them. */
  summary: string;
  tags: readonly string[];
  /** The card's description, cut at `REMAP_DESCRIPTION_MAX`. */
  description: string;
  /** The Monday the Engine generated this week for. The translation is keyed on it. */
  weekStart: string;
  blocks: readonly RemapBlock[];
};

/**
 * One character's whole week, block by block, in the order the Engine wrote it.
 *
 * No grouping and no summing, which is the difference that matters. The version
 * before this one collapsed the week into one entry per distinct sentence and
 * totalled the hours behind each, and what the player got back was a list that
 * could not be held against their card: five separate "sleeping" blocks in five
 * different slots became one line reading "50h a week".
 *
 * The days are walked in `VILLAGE_WEEKDAYS` order rather than in the order the
 * Engine happened to key its record, and the blocks inside a day are kept in the
 * order the Engine wrote them — which is hour order. That gives the model one
 * unambiguous reading of the week, and it is also the order the tab prints.
 */
export function remapBlocks(schedule: NativeWeekSchedule): RemapBlock[] {
  const blocks: RemapBlock[] = [];
  for (const day of VILLAGE_WEEKDAYS) {
    for (const block of schedule.days[day] ?? []) {
      blocks.push({ day, time: block.time, activity: block.activity, status: block.status });
    }
  }
  return blocks;
}

/**
 * All source blocks participate in the signature and completeness check.
 * `proposeRemap` slices this list only while making bounded model calls.
 */
function remapBlocksInPrompt(blocks: readonly RemapBlock[]): readonly RemapBlock[] {
  return blocks;
}

/**
 * The wishes one translation actually sends, in the order it sends them.
 *
 * The cap is shared by the prompt and the signature that decides whether the
 * translation changed. Order remains the agenda's own; wishes are context for
 * phrasing, not labels or numbered references in the response.
 */
function remapWishes(wishes: readonly VillageWish[]): readonly VillageWish[] {
  return wishes.slice(0, MAX_VILLAGER_WISHES);
}

/**
 * The keys an answer has to come back with, in the order the prompt asked for
 * them.
 *
 * Shared with `buildRemapMessages` rather than derived a second time, because
 * the completeness check must be about exactly the blocks that were SENT. A list
 * built any other way would eventually disagree with the prompt, and the
 * disagreement would fail in the worst direction: the village would settle for a
 * table it believed complete while some block of somebody's day read
 * `VILLAGE_UNTRANSLATED_ACTIVITY` instead.
 */
export function remapBlockKeys(blocks: readonly RemapBlock[]): string[] {
  return remapBlocksInPrompt(blocks).map((entry) => remapBlockKey(entry.day, entry.time));
}

/**
 * The key one block of the Engine's week is translated and looked up under.
 *
 * `day|time`, lowercased, because that is what makes the translation a
 * TIMETABLE: two blocks that say the same sentence are two entries here when they
 * fall in different slots, and the same entry when they fall in the same one.
 *
 * The hour range has its whitespace STRIPPED rather than merely trimmed, and the
 * day is only trimmed. Both halves are copied out of the prompt by a model, and a
 * model asked to copy a string exactly will still tidy the spacing around a
 * hyphen — "18:00-20:00" comes back as "18:00 - 20:00" often enough to matter.
 * No hour range means anything different for having a space in it, so the space
 * is noise and is dropped; the day is a word, so its internal spacing does mean
 * something and only the ends are trimmed.
 *
 * Exported because the stored record is read back through exactly this rule — see
 * `coerceRemapMove`. A key built one way when the translation is written and
 * another way when it is loaded is a translation that loads as empty the first
 * time either rule is edited, so both sides go through this one function.
 */
export function remapBlockKey(day: string, time: string): string {
  return `${day.trim().toLowerCase()}|${time.replace(/\s+/g, "")}`;
}

/**
 * The key the block a villager is in RIGHT NOW is found under, or "" when the
 * Engine has them outside every block of the day.
 *
 * The bridge between the narrow read and the wide one, and it lives here because
 * the key format belongs to the translation rather than to the schedule reader.
 * Every caller that used to hand `lookupRemap` an activity string has the same
 * three facts in hand — the weekday, the block, and nothing else — so they all
 * read through this one line instead of each assembling a key of their own.
 *
 * "" is an ordinary answer and matches nothing, which is what "the Engine has
 * them outside every block" should say: a villager between two blocks is doing
 * nothing this village was asked to translate, and the caller's own default is
 * the right sentence for that.
 */
export function routineKey(routine: NativeRoutine | null): string {
  if (!routine || !routine.block) return "";
  return remapBlockKey(routine.weekday, routine.block.time);
}

/**
 * The digest a translation is invalidated by, or "" when there is nothing to key
 * one on.
 *
 * Five things can make a translation wrong and the Engine's `weekStart` catches
 * only the first: the Engine can regenerate a week for the SAME Monday with
 * different activities in it, the player can add, rename or re-describe a place,
 * the player can rewrite the setting the village is described by, and the
 * villager's own wishes can change — one written, one answered, one aged out. The
 * first is the Engine editing the week; the next two are the player correcting
 * the lens the week is seen through, and a translation that survived either would
 * go on translating a week that no longer happens into words the village no
 * longer uses. The last is the villager themself changing, and it is the one of
 * the five that moves on its own.
 *
 * Deliberately NOT in here: anything off the character card. Editing a summary
 * or a tag mid-week would otherwise re-translate every villager in the village
 * over a change that says nothing about what anybody is doing.
 *
 * The blocks are the CAPPED, keyed slots with the sentence and the status each
 * one carried, which is exactly the question the prompt asked. That is
 * deliberate: the village owes a new answer when the question changes, even when
 * the week's Monday has not. The sentence is in here beside the slot because an
 * Engine week regenerated under the same Monday can move a different activity
 * into the same hour, and a translation that survived that would go on claiming
 * what Tuesday used to hold.
 *
 * FNV-1a, inline and hex, for the reason `hashString` in `village-clock.ts` is
 * inline: the digest has to be deterministic enough for a test to pin it, and
 * this is not worth a dependency. The separators are non-printing on purpose —
 * without them one activity's tail and the next one's head would join into the
 * same string as a third pair, and two different weeks would sign the same.
 *
 * The lists in here are the SENDABLE ones — see `remapVenues` and `remapWishes` —
 * and they are read through those two functions rather than filtered here,
 * because the numbered lists the model is handed and this digest must be the same
 * lists. A translation argued over a different list than the one it was written
 * from is a translation that re-asks for ever, and that failure is silent.
 *
 * The wishes are in here for the reason the places are: a translation was written
 * from a question that included them, so the question changing has to re-ask. A
 * wish arriving or leaving therefore costs that one villager ONE TRANSLATION
 * CALL, which is the expensive call in this package. That is the honest price of
 * the influence rather than a defect — the answer that mentions a wish is not
 * interchangeable with the answer that does not — and it is bounded by the cap: a
 * villager holds a small number of wishes, so a villager cannot cost a call per
 * wish per week for ever.
 *
 * A wish contributes its id, its words, the surface the words are given away by,
 * and its weight, and only the first of those is load-bearing. The rest are in
 * here because they are part of the question: the translator is handed all three
 * — the text on its own, the surface in brackets beside it, and what the wish is
 * worth — so a wish re-weighted under the same id, or a hand-edited document that
 * rewrote the text or the surface and kept the id, is a different question about
 * the same row, and a translation that survived any of them would be an answer to
 * something nobody asked. The surface is the one field here that is easy to leave
 * out and impossible to notice missing: it reaches the prompt, so a translation
 * that outlived it would go on naming what used to give the wish away.
 *
 * Both the words and the surface are read through `phraseKey`, the same
 * normalisation the blocks' sentences are digested under, so that a wish
 * re-spaced or re-capitalised does not cost a model call over a difference no
 * reader could see. The weight is floored rather than keyed, because the number
 * the prompt says and the number the villager's own block says are the same
 * rounded one.
 *
 * A wish's two DATES are deliberately not in here, and it is worth saying why
 * because they are the only fields of a wish that are absent. Neither of them
 * reaches the prompt — the translator is shown what they wish for, how much it is
 * on their mind and what gives it away, and never how old it is — so a wish that
 * merely got older is not a different question and must not cost a villager a
 * model call. A wish leaving the list is a different question and does change
 * this, which is the path that already exists.
 *
 * "" is returned for a week with no `weekStart`, and it is not an error: a
 * translation keyed on nothing can never be recognised as stale, so that one
 * case is left alone exactly as `remapNeedsWriting` describes.
 */
export function remapSignature(input: {
  setting: string;
  loreKey?: string;
  venues: readonly VillageVenue[];
  wishes: readonly VillageWish[];
  weekStart: string;
  blocks: readonly RemapBlock[];
}): string {
  const weekStart = input.weekStart.trim();
  if (weekStart.length === 0) return "";
  const asked = remapBlocksInPrompt(input.blocks).map(
    (entry) =>
      `${remapBlockKey(entry.day, entry.time)}\u0000${phraseKey(entry.activity)}\u0000${entry.status.trim().toLowerCase()}`,
  );
  const wished = remapWishes(input.wishes).map(
    (wish) => `${wish.id}\u0000${phraseKey(wish.wish)}\u0000${phraseKey(wish.tell)}\u0000${Math.floor(wish.intensity)}`,
  );
  const lens = remapVenues(input.venues)
    .slice(0, MAX_VENUES)
    .map(
      (venue) =>
        `${venue.id}\u0000${venue.name.trim()}\u0000${venue.classes?.join("/") ?? ""}\u0000${venue.form?.trim() ?? ""}\u0000${venue.state.condition.trim()}\u0000${venue.state.publicFacts.slice(0, 4).join("\u0000")}`,
    );
  const digest = [weekStart, ...asked, ...wished, input.setting.trim(), input.loreKey ?? "", ...lens].join("\u0001");
  let hash = 2166136261;
  for (let index = 0; index < digest.length; index += 1) {
    hash ^= digest.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * The normalisation a phrase is digested under.
 *
 * Case and repeated whitespace only, matching what the lookup used to tolerate
 * when a phrase WAS the key. It exists now only so that the digest does not
 * change over a difference no reader could see — an Engine week re-read with the
 * same sentences in the same slots must not re-ask for a translation because one
 * of them came back with a double space in it.
 */
function phraseKey(activity: string): string {
  return activity.trim().toLowerCase().replace(/\s+/g, " ");
}

function buildRemapMessages(context: VillageRemapContext): CapabilityLanguageModelMessage[] {
  const world = context.setting.trim();
  const description = condense(context.description, REMAP_DESCRIPTION_MAX);
  const known = [
    context.summary.trim().length > 0 ? `One line about them: ${context.summary.trim()}` : "",
    context.tags.length > 0 ? `They are tagged: ${context.tags.join(", ")}` : "",
    description.length > 0 ? `Description:\n${description}` : "",
  ].filter((line) => line.length > 0);
  const places = remapVenues(context.venues)
    .slice(0, MAX_VENUES)
    .map((venue, index) => {
      const description = [
        venue.classes?.join(" / ") ?? "",
        venue.form?.trim() ?? "",
        venue.state.condition.trim(),
        ...venue.state.publicFacts.slice(0, 4),
      ]
        .filter(Boolean)
        .map((part) => condense(part, 160))
        .join("; ");
      return description.length > 0 ? `${index + 1}. ${venue.name}: ${description}` : `${index + 1}. ${venue.name}`;
    });
  // Wishes are private context, not numbered labels for agenda hours. Weight is
  // said in words so it matches the villager's own panel and narration context.
  const wishes = remapWishes(context.wishes).map((wish) => {
    const surface = wish.tell.trim().length > 0 ? ` (it shows: ${wish.tell.trim()})` : "";
    return `- ${wish.wish.trim()}${surface} — ${wishWeightWords(wish.intensity)}`;
  });
  const week = remapBlocksInPrompt(context.blocks).reduce<{ day: string; lines: string[] }[]>((days, entry) => {
    const words = describeStatus(entry.status);
    const line =
      words.length > 0
        ? `- ${entry.time}: ${JSON.stringify(entry.activity)} (when they are ${words})`
        : `- ${entry.time}: ${JSON.stringify(entry.activity)}`;
    const open = days[days.length - 1];
    if (open && open.day === entry.day) open.lines.push(line);
    else days.push({ day: entry.day, lines: [line] });
    return days;
  }, []);

  // The brief and the rules are two messages rather than one, and the split is
  // the whole of what this function decides.
  //
  // It used to be ONE system message holding the village, the places, the person
  // and the week, with the rules spliced into the end of it, and a user message
  // that was the single sentence "How does that week happen in X?". Two things
  // were wrong with that. The rules are an ARRAY, and joining it into a string
  // ran every rule of the prompt together into one comma-spliced paragraph — the
  // JSON shape, the here rule and the agenda rule all landing mid-line in the
  // middle of somebody else's sentence. And the turn a model reads as the
  // instruction was a four-word question while everything worth answering sat in
  // the wall above it.
  //
  // So: the role and the rules stay in `system`, where they belong and where a
  // model weights them, one rule per line; and the WEEK, the places, the person
  // and the actual ask go in the user turn, which is now the brief rather than a
  // riddle pointing at one. The reader who opens the debug panel sees the same
  // two halves a model does, and can tell which half is which.
  const brief = [
    world.length > 0
      ? `The village is like this:\n"""\n${world}\n"""`
      : "Nobody has described the village beyond its name, so keep everything small and ordinary.",
    places.length > 0
      ? [
          "The places that exist here, numbered. These are the only named places you may use, and the numbers are what the place field of each move answers with:",
          ...places,
        ].join("\n")
      : "Nobody has said what is in this village. There are no numbered places, so every move has a place of 0, and you describe everything in terms of an ordinary day in a small, quiet place.",
    "Playable zones: " + remapVenues(context.venues).map(venue => venue.id + ": " + venueZones(venue).filter(zone => !context.characterId || canOccupyZone(venue, zone, context.characterId)).map(zone => zone.id + " (" + zone.name + "; " + zone.kind + ")").join("; ")).join("\n") + ". Copy the exact zoneId into each move without changing its times or activity.",
    wishes.length > 0 ? ["What is privately on their mind:", ...wishes].join("\n") : "",
    known.length > 0 ? ["What is already known about this person:", ...known].join("\n") : "",
    week.length > 0
      ? [
          'Their week, day by day and hour by hour. The day and the hour range of every line below are the key of its entry in "moves", so copy both back exactly:',
          ...week.map((day) => [day.day, ...day.lines].join("\n")),
        ].join("\n")
      : "",
    context.lore.length
      ? `Established lore, used only when consistent with the existing week and current village:\n${context.lore.join("\n")}`
      : "",
    context.completedWishes.length
      ? `Already fulfilled; these older desires are not unmet errands:\n${context.completedWishes.join("\n")}`
      : "",
    `Write their week as it happens in ${context.village}.`,
  ].filter((section) => section.length > 0);

  return [
    {
      role: "system",
      content: [
        `You are translating one person's week so that it happens in a small village called ${context.village}. Their name is ${context.name}, and their week was written somewhere else.`,
        // Joined with a newline and not with a blank line: these are one list, and
        // twenty rules each separated by an empty line read as twenty unrelated
        // notes rather than as the one set of instructions they are.
        REMAP_SYSTEM_PROMPT.join("\n"),
      ].join("\n\n"),
    },
    { role: "user", content: brief.join("\n\n") },
  ];
}

/**
 * The exact prompt one translation is written from, as the flat pair a tab can
 * hold.
 *
 * Exported for the debug tab, which shows it verbatim so the wording can be
 * argued with while the feature is being built. It is deliberately rendered by
 * the SAME builder the real call uses rather than a second copy assembled for
 * display, because a debug view that shows something other than what was sent is
 * worse than no debug view at all.
 *
 * The role is narrowed rather than cast. A translation is a system message and a
 * question, and if either ever became an assistant turn this should say so by
 * failing to compile rather than by showing the tab a role it cannot render.
 */
export function buildRemapPrompt(context: VillageRemapContext): VillagePromptMessage[] {
  return buildRemapMessages(context).map((message) => ({
    role: message.role === "user" ? "user" : "system",
    content: message.content,
  }));
}

/**
 * Bound a translation reply to what the village will actually store.
 *
 * Total in both directions, and neither is a repair. A move naming a block the
 * prompt never asked about is DROPPED — see below — and a move with no sentence
 * is dropped, because an empty passage would render as an empty line where the
 * village's own default would have done. A duplicate slot keeps the first, since
 * the lookup is by slot and a second answer for the same one is an answer the
 * village will never read.
 *
 * Every move is resolved against the blocks the prompt ACTUALLY SENT, and that
 * is the whole of the round trip's integrity. A model asked to copy a day and an
 * hour range back will occasionally tidy them, invent one, or answer about a
 * Tuesday that is not there — and resolving through the sent list means all three
 * land the same way: the slot is looked up by its normalised key, a key that was
 * not asked about is a miss, and a key that WAS asked about yields the ENGINE'S
 * own day, hour range and sentence rather than the model's copy of them. So the
 * stored record can never carry a slot the week does not have, and the sentence
 * the tab prints beside the village's phrase is always the one the Engine wrote.
 *
 * The result is always a remap, even an empty one. An empty remap is stored WITH
 * the week it was written for, which is what stops the village asking again —
 * the same distinction `coerceAgenda` draws between an answer that was empty and
 * an answer that never came.
 *
 * `weekStart` comes from the context rather than from the model. It is the
 * village's own bookkeeping about which week it translated, and a model asked to
 * copy a Monday back is a model that can corrupt the one field the whole cache
 * is invalidated by. `signature` comes from the context for exactly the same
 * reason — it is computed from the week and the lens, which the village has, and
 * a model asked to reproduce a hash would produce a different one every time.
 * `attempts` is passed in rather than counted here, because it is a fact about
 * how many times the village has ASKED, which a function that only sees the
 * answer cannot know.
 *
 * The place number is resolved to an id HERE, while the venue list that produced
 * the number is still in hand, and that is the whole reason the model is asked
 * for a number rather than a name. A name would have to be matched at read time,
 * which means the read would depend on the venue still being called what it was
 * called when the answer was written — and a venue renamed in the settings panel
 * would silently re-point every week already translated. Resolving now means the
 * table points at the PLACE, and a place that has since been deleted is a miss
 * rather than a different building.
 *
 * Anything the numbering cannot explain becomes "". Out of range, absent,
 * fractional, a string the model wrote instead of a number, a list of them — all
 * of it is a translation that was willing to say where and was not understood,
 * and "not anywhere in particular" is the honest reading of that. It is also the
 * cheap one: "" draws exactly what no place at all draws.
 *
 * Wishes influence the phrasing as private context, but do not identify or own
 * individual agenda hours. Legacy wish tags in a model reply are ignored.
 */
export function coerceRemap(
  payload: Record<string, unknown>,
  context: VillageRemapContext,
  at: string,
  attempts = 1,
): VillageRemap {
  // The week as the prompt sent it, keyed the same way an answer is keyed, so a
  // move can only be resolved against a block that was actually asked about.
  const asked = new Map(
    remapBlocksInPrompt(context.blocks).map((block) => [remapBlockKey(block.day, block.time), block]),
  );
  const moves: VillageRemapMove[] = [];
  const seen = new Set<string>();
  if (Array.isArray(payload.moves)) {
    for (const entry of payload.moves) {
      const raw = asRecord(entry);
      const day = boundText(raw.day, MAX_REMAP_SLOT_LENGTH);
      const time = boundText(raw.time, MAX_REMAP_SLOT_LENGTH);
      const here = boundText(raw.here, MAX_REMAP_HERE_LENGTH);
      if (day.length === 0 || time.length === 0 || here.length === 0) continue;
      const key = remapBlockKey(day, time);
      const block = asked.get(key);
      if (!block || seen.has(key)) continue;
      seen.add(key);
      moves.push({
        day: block.day,
        time: block.time,
        activity: block.activity,
        here,
        venueId: venueIdFromPlace(raw.place, context.venues),
        ...(typeof raw.zoneId === "string" ? { zoneId: raw.zoneId } : {}),
        wishId: "",
      });
    }
  }
  return {
    weekStart: context.weekStart,
    moves,
    routine: boundText(payload.agenda ?? payload.routine, MAX_ROUTINE_SUMMARY_LENGTH),
    signature: remapSignature(context),
    attempts: Number.isFinite(attempts) && attempts > 0 ? Math.floor(attempts) : 1,
    generatedAt: at,
  };
}

/**
 * The numbered place a move answered with, turned into the venue's own id.
 *
 * One-based, because that is what a numbered list is to a reader, and the places
 * in the prompt are written as a numbered list for exactly that reason. 1 is the
 * first venue the village has; 0 is the model saying the list has nothing for
 * this move, which is an answer and not a miss.
 *
 * The list is the sendable places, capped at `MAX_VENUES` when it is written, so
 * a number past the cap resolves against nothing and comes back "". It is the
 * same read as any other out-of-range number: the answer was given against a
 * list the village does not have.
 */
function venueIdFromPlace(value: unknown, venues: readonly VillageVenue[]): string {
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value.trim()) : Number.NaN;
  if (!Number.isInteger(number) || number < 1) return "";
  const venue = remapVenues(venues).slice(0, MAX_VENUES)[number - 1];
  return venue ? venue.id : "";
}

/**
 * The translation as a table keyed by slot, built once per day rather than
 * searched once per block.
 *
 * `findRemapMove` walks the list, which is the right shape for a single lookup
 * and the wrong one for a plan: a day of somebody's week is fifty blocks and a
 * translation of it is fifty entries, so the walk would be twenty-five hundred
 * key constructions to answer one question. The index makes it one.
 */
function remapMoveIndex(remap: VillageRemap | null): Map<string, VillageRemapMove> {
  const index = new Map<string, VillageRemapMove>();
  for (const move of remap?.moves ?? []) {
    const key = remapBlockKey(move.day, move.time);
    if (!index.has(key)) index.set(key, move);
  }
  return index;
}

/**
 * What this villager is doing, in this village's words, or "" when the village
 * has nothing to say about it.
 *
 * The key is a `day|time` slot, NOT an activity sentence, and that is the change
 * that made the translation a timetable. Looked up by sentence, a week with five
 * copies of "sleeping" had one entry answering for all five and an hour nobody
 * could check; looked up by slot, every hour of the week has its own answer and
 * the tab can print them side by side.
 *
 * This is the whole read-time cost of the feature: a normalised string compare
 * against the bounded stored list of moves, one per source block.
 * There is no model call here, no date arithmetic, and no failure path — which is
 * the point of having paid for the table once.
 *
 * Matching is normalised rather than exact because the two sides come from
 * different places. The key was copied by a model out of a prompt, and a model
 * asked to copy a string exactly will still sometimes tidy its spacing. That is
 * the only tolerance: see `remapBlockKey`, which drops whitespace inside an hour
 * range and nothing else. A different hour, a different day or a word inserted
 * is a miss, because a fuzzy match there would guess which hour somebody meant.
 */
export function lookupRemap(remap: VillageRemap | null, key: string): string {
  return findRemapMove(remap, key)?.here ?? "";
}

/**
 * The entry a slot is found by, or null when the village has no such entry.
 *
 * The ONE match. Two readers that need different halves of the same entry — the
 * sentence and the place — used to walk the list separately with the same three
 * lines each, and the comment that justified it admitted the risk: "a second
 * lookup written slightly differently would be a second lookup that could land
 * on a different move". Sharing the walk is the real fix, and it also makes the
 * day plan cost one lookup per block instead of three.
 */
function findRemapMove(remap: VillageRemap | null, key: string): VillageRemapMove | null {
  if (!remap || remap.moves.length === 0) return null;
  if (key.length === 0) return null;
  for (const move of remap.moves) {
    if (remapBlockKey(move.day, move.time) === key) return move;
  }
  return null;
}

/**
 * Where this villager is, as a venue id, or "" when the village cannot place
 * them.
 *
 * The `here` sentence and the place come out of the SAME entry — literally, now
 * that both are read through `findRemapMove` — so they can never disagree about
 * which part of the week the question was about. A portrait of the wrong
 * building beside the right sentence is worse than no portrait at all.
 *
 * Every "" this can return is ordinary and draws the same thing — no place at
 * all. A villager with no translation yet, a week translated before the village
 * knew about places, a slot the model never answered about, a place the settings
 * panel has since deleted. The caller does not tell them apart because the player
 * cannot see the difference.
 */
export function lookupRemapVenue(remap: VillageRemap | null, key: string): string {
  return findRemapMove(remap, key)?.venueId ?? "";
}

/**
 * One day of somebody's week, block by block, in the village's words.
 *
 * The join the whole feature rests on, and it is a join rather than a call: the
 * week's TIMES live only in the Engine's raw read while the week's WORDS live
 * only in the stored translation, so neither alone can answer "what are they
 * doing at four, and where". One entry per block the Engine wrote, in the order
 * it wrote them, each carrying its own hour range untouched.
 *
 * Nothing is grouped, merged or summarised. The village's own rule is that a
 * card with a distinct activity in every hour of the day gives that villager a
 * distinct hour here, and every one of the ways a plan could be tidied — a
 * morning, an afternoon, "mostly" anything — is the village deciding which of
 * somebody's hours are the same hour.
 *
 * The day it belongs to is a parameter because the translation is keyed by the
 * SLOT and not by the noun. The Engine's week is a weekly pattern keyed by
 * weekday name and holds no dates, so a plan for Thursday is asked for BY NAME
 * and its blocks are looked up under `Thursday|hour`, exactly as the translation
 * was written. Nothing here converts a time, and nothing here matches on the
 * sentence: an hour the village cannot translate appears as its own default with
 * `translated` false, which is the difference a reader can see.
 * One key is built per block and one index is built per day, so the whole plan
 * costs a single walk of the translation rather than a walk per lookup.
 *
 * `at` is passed in rather than read off a clock here, for the reason
 * `activityAt` takes an hour and a minute: time is derived once at the edge and
 * flows inward as plain data, so the prompt cannot disagree with itself about
 * what time it is. It marks the one block the given minute falls in and does
 * nothing else with it.
 *
 * A block the village has no words for does NOT vanish and is not skipped: it
 * arrives as the village's own default with `translated` false, so a reader can
 * both count the hours and see which of them the village failed to translate.
 * Dropping it would be the plan silently becoming shorter than the day.
 */
export function dayPlan(
  day: string,
  blocks: readonly NativeDayBlock[],
  remap: VillageRemap | null,
  at: { hour: number; minute: number },
): VillageDayBlock[] {
  const now = at.hour * 60 + at.minute;
  const index = remapMoveIndex(remap);
  return blocks.map((block) => {
    const move = index.get(remapBlockKey(day, block.time)) ?? null;
    const range = parseBlockRange(block.time);
    const wraps = range ? range.end <= range.start : false;
    return {
      time: block.time,
      activity: block.activity,
      // The same default `translateBlock` answers a miss with, read off the
      // entry that was already found rather than found a second time.
      here: move ? move.here : VILLAGE_UNTRANSLATED_ACTIVITY,
      translated: move !== null,
      venueId: move?.venueId ?? "",
      // Kept in the response shape for older consumers, but no agenda hour is
      // labelled as belonging to a wish, even when a stored remap has old tags.
      wishId: "",
      status: block.status,
      current: range ? (wraps ? now >= range.start || now < range.end : now >= range.start && now < range.end) : false,
    };
  });
}

/**
 * The phrases in somebody's week that the day being described does not already
 * cover.
 *
 * The narrator is given today block by block, which is precise and is also
 * today-shaped: a reader shown one day of a miller's life has no way to tell a
 * daily grind from a Tuesday errand. This is the rest of the week as the
 * translation knows it — the phrases from the OTHER six days, deduplicated — so
 * the line is about the days the plan is not.
 *
 * It reads the moves for the other days rather than diffing against the rendered
 * plan, which is what the version before this one did. It had to, because a move
 * carried no day and the only way to know whether a phrase was today's was to
 * look at what today had already said. Now the day is ON the entry, so "the rest
 * of the week" is a filter rather than a subtract, and the result no longer
 * depends on how many of today's blocks were translated.
 *
 * It reads `moves` rather than the raw week on purpose. Those phrases are already
 * the village's own; a list built from the Engine's activities would be the leak
 * one hop further out, and this line exists to give the narrator more of this
 * village rather than less.
 */
export function restOfWeek(remap: VillageRemap | null, day: string): readonly string[] {
  const today = day.trim().toLowerCase();
  const notes: string[] = [];
  for (const move of remap?.moves ?? []) {
    if (move.day.trim().toLowerCase() === today) continue;
    const here = move.here.trim();
    if (here.length === 0 || notes.includes(here)) continue;
    notes.push(here);
  }
  return notes;
}

/**
 * What this villager is doing right now, translated into this village's terms.
 *
 * A miss answers with `fallback` — the village's own default — and NEVER with
 * the Engine's sentence. That is the whole of the fix this clause used to be on
 * the wrong side of: the Engine's words name the world the card was written for,
 * and the prompts that read this line are the prompts that write the village. A
 * fallback that leaks is not a graceful degradation, it is the leak, arriving by
 * the one path nobody was watching.
 *
 * There is deliberately no separate case for an empty key. An hour with no block
 * over it and an hour the village could not translate are the same answer to a
 * reader — "the village has no words for this hour" — and "at home" is what this
 * village says about those. A villager with no schedule at all never reaches this
 * function; the callers pass "" themselves.
 *
 * It takes a KEY rather than an activity sentence, which is the change the whole
 * file records: "what is this villager doing" is a question about a slot in their
 * week, and no two slots sharing a sentence share an answer any more.
 */
export function translateBlock(
  remap: VillageRemap | null,
  key: string,
  fallback: string = VILLAGE_UNTRANSLATED_ACTIVITY,
): string {
  const here = lookupRemap(remap, key);
  return here.length > 0 ? here : fallback;
}

/**
 * The one-line description of an ordinary day, in the village's words when it
 * has any.
 *
 * `summary` is whatever the CALLER is allowed to fall back on, and the caller is
 * the only thing that knows. The village's own agenda summary is fine; the
 * Engine's `routineSummary` is not, for the same reason its activities are not —
 * it was written from the card alone and may describe a life this village has no
 * room for. So this function makes no judgement of its own: it prefers the
 * translation and hands back the summary it was given, and passing the Engine's
 * prose here is a mistake the caller has to make on purpose.
 *
 * An empty return is an ordinary answer rather than a fault. A villager whose
 * week is not translated yet simply has nothing written about their ordinary day,
 * which is a shorter prompt and not a wrong one.
 */
export function translateRoutine(remap: VillageRemap | null, summary: string): string {
  if (remap && remap.routine.length > 0) return remap.routine;
  return summary.trim();
}

/**
 * Whether the village still owes this villager a translation.
 *
 * Three questions, in the order that makes each one cheap to answer and cheap to
 * stop at.
 *
 *   1. Is there a week to translate at all? A week with no `weekStart` is a week
 *      the village cannot tell the age of, and "" signatures are refused here.
 *      Translating one would write a record that could never be recognised as
 *      stale, and re-translating it would pay for the same answer on every part
 *      of every day, so that one case is left exactly as it reads today.
 *   2. Has the QUESTION changed? `signature` digests the week's Monday, the
 *      slots with the sentence and status each one carried, and the
 *      village's own places and setting. It is compared instead of `weekStart`
 *      alone because the Engine can regenerate a week under the same Monday with
 *      different hours in it, and because the player can correct the lens the
 *      week is read through. Either one leaves a stored translation saying
 *      something that is no longer true, and both used to survive.
 *   3. Is the ANSWER complete? Slot-level fidelity means every block the prompt
 *      asked about needs a move of its own, or that hour of somebody's day reads
 *      as the village's default while they are plainly doing something else. So a
 *      key with no move makes the translation owed again — up to
 *      `MAX_REMAP_ATTEMPTS`, after which the village keeps what it has rather
 *      than asking a model the same question forever.
 *
 * The table it settles for is not silent, and that is the other half of the same
 * rule: `VillageAgendaView.missingMoves` counts the keys of the week this returns
 * false for, so a week the village gave up on reads as a half-translated week with
 * a number on it rather than as a finished one whose hours quietly read as
 * `VILLAGE_UNTRANSLATED_ACTIVITY`. Settling is a decision about spending, not a
 * claim that the answer was good.
 *
 * A missing day or hour range in the stored record — an entry the model half
 * wrote, or one from a document hand-edited into a shape the lookup cannot
 * build a key from — simply never matches, which reads as an incomplete answer
 * and asks again. That is the behaviour a record nobody can parse should have:
 * one more call, and the scheme repairs itself.
 *
 * An empty remap with the right signature and an exhausted retry budget is
 * therefore FINAL, which is what stops a week the model answered badly costing a
 * call per day for the life of the village. It is also what makes a card that has
 * been deleted terminate: that case stores an empty remap at the current
 * signature.
 */
export function remapNeedsWriting(
  remap: VillageRemap | null,
  signature: string,
  blockKeys: readonly string[],
): boolean {
  if (signature.length === 0) return false;
  if (!remap) return true;
  if (remap.signature !== signature) return true;
  if (remap.attempts >= MAX_REMAP_ATTEMPTS) return false;
  return blockKeys.some((key) => lookupRemap(remap, key).length === 0);
}

/**
 * Ask the model to translate one week. The caller decides where the answer is kept.
 *
 * Shaped exactly like `proposeAgenda`, including the debug override: every model
 * call this package makes logs its own prompt when debug mode is on, and a
 * translation whose prompt could not be read would be the one call in the
 * package that could not be argued with.
 *
 * `attempts` is the village's own count of how many times it has asked about
 * THIS signature, and it is carried onto the record rather than used here. It
 * exists so the completeness check knows when to stop asking — see
 * `remapNeedsWriting`.
 */
export async function proposeRemap(
  context: VillageRemapContext,
  options: { signal?: AbortSignal; attempts?: number } = {},
): Promise<{ remap: VillageRemap; failure: string | null }> {
  const model = await villagesLanguageModels().resolveForRequest({
    connectionId: await villagesConnectionIdFor("system"),
  });
  const debugEnabled = villagesDebugAgentsEnabled();
  const batchSize = Math.min(10, Math.max(2, Math.floor((model.maxOutputTokens ?? 5_000) / 350)));
  const moves: VillageRemapMove[] = [];
  let routine = "";
  let failure: string | null = null;
  for (let offset = 0; offset < context.blocks.length; offset += batchSize) {
    const batch = { ...context, blocks: context.blocks.slice(offset, offset + batchSize) };
    const budget = remapAnswerBudget(batch.blocks.length);
    const requestedMaxTokens = Math.min(model.maxOutputTokens ?? budget, budget);
    const fitted = model.fitContext(buildRemapMessages(batch), { maxTokens: requestedMaxTokens });
    villagesLogger().debugOverride(debugEnabled, "[villages] translation prompt: %s", JSON.stringify(fitted.messages));
    try {
      const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? requestedMaxTokens, {
        temperature: REMAP_TEMPERATURE,
        debugMode: debugEnabled,
        signal: options.signal,
      });
      const payload = extractJsonObject(completion.content ?? "");
      if (!payload)
        throw new Error(completionFailure("Schedule translation", completion, fitted.maxTokens ?? requestedMaxTokens));
      const part = coerceRemap(payload, batch, new Date().toISOString(), options.attempts);
      moves.push(...part.moves);
      routine ||= part.routine;
    } catch (error) {
      failure ??= error instanceof Error ? error.message : String(error);
    }
  }
  return {
    remap: {
      weekStart: context.weekStart,
      moves,
      routine,
      signature: remapSignature(context),
      attempts: options.attempts ?? 1,
      generatedAt: new Date().toISOString(),
    },
    failure,
  };
}

/** The translation as one line, for a log or a debug tab: the Engine's words on the left, the village's on the right. */
export function describeRemap(remap: VillageRemap): string {
  return remap.moves.map((move) => `${move.day} ${move.time}: ${move.activity} → ${move.here}`).join("; ");
}

/**
 * How long a stored refusal may be.
 *
 * A record rather than a message: the tab prints this beside a villager, and the
 * useful part of a model host's complaint is at the front of it. A host that
 * answers with a page of HTML lands here as its first three hundred characters,
 * which is enough to recognise and not enough to stuff a village document with.
 */
export const MAX_REMAP_FAILURE_LENGTH = 300;

/**
 * One thrown failure as a line a villager's record can hold.
 *
 * `Error.message` rather than the whole error, because `String(error)` prefixes
 * "Error: " and the tab writes its own sentence around this one. Anything else is
 * stringified, which is what a model host that rejects with a plain object leaves.
 *
 * Total, because it runs inside a catch block: a function that can throw while
 * reporting a throw loses the original failure and replaces it with a crash. The
 * fallback sentence is not a placeholder — a throw with nothing to say is a real
 * shape, and "refused, reason unknown" is the honest report of it.
 */
export function remapFailureText(error: unknown): string {
  let text = "";
  try {
    text = error instanceof Error ? error.message : String(error);
  } catch {
    text = "";
  }
  const trimmed = text.trim();
  if (trimmed.length === 0) return "The village was refused and the model gave no reason.";
  return trimmed.length > MAX_REMAP_FAILURE_LENGTH ? `${trimmed.slice(0, MAX_REMAP_FAILURE_LENGTH - 1)}…` : trimmed;
}
