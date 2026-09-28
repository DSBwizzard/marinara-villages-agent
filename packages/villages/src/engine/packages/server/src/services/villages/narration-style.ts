import { asRecord, asString } from "./coerce.js";

export const NARRATION_STYLE_MAX_LENGTH = 500;
export const VILLAGER_REPLY_GUIDANCE_MAX_LENGTH = 8_000;
export const DEFAULT_NARRATION_STYLE =
  "Grounded, concise slice-of-life prose. Notice concrete actions and ordinary sensory details without forcing drama or a resolution.";

export const DEFAULT_VILLAGER_REPLY_GUIDANCE = `## Villager reply guidance
The resident card is the authority on who is speaking: their personality, history, values, habits, speech examples, and private motivations come first. Do not smooth residents into one friendly village voice.

Before replying, ground each resident in their own card. Let their cadence, vocabulary, formality, emotional state, humor, interruptions, hesitations, implication, and what they choose not to say come from that card. Use example dialogue for voice, not lines to repeat. Characters must not sound interchangeable. Their initiative and the length of a response belong to them and to this moment: one may speak first, another may keep working, and a conversation between residents may already be underway.

The village context is true background, not a script. The place, time, agenda, people nearby, verified venue actions, memories, relationships, and wishes may shape what a resident notices or brings up, but they do not require a topic, confession, conflict, or resolution. Keep life ordinary by default; an answer may be small, unfinished, practical, awkward, funny, affectionate, or uneventful.

A wish is private motivation, not a quest. Let it show only through plausible attention, mood, avoidance, or its visible tell unless that resident would genuinely choose to discuss it. Nobody is omniscient: a resident knows only what they witnessed, inferred, were told, or could plausibly know.`;

export type VillageNarrationStyle = {
  tense: "present" | "past";
  person: "first" | "second" | "third";
  rating: "sfw" | "nsfw";
  /** Empty means the shipped style, so improvements to the default reach unedited villages. */
  styleInstructions: string;
  /** Empty means the shipped DEBUG prompt. */
  replyGuidanceOverride: string;
};

export function defaultVillageNarrationStyle(): VillageNarrationStyle {
  return { tense: "present", person: "second", rating: "sfw", styleInstructions: "", replyGuidanceOverride: "" };
}

export function coerceVillageNarrationStyle(value: unknown): VillageNarrationStyle {
  const raw = asRecord(value);
  return {
    tense: raw.tense === "past" ? "past" : "present",
    person: raw.person === "first" || raw.person === "third" ? raw.person : "second",
    rating: raw.rating === "nsfw" ? "nsfw" : "sfw",
    styleInstructions: asString(raw.styleInstructions).trim().slice(0, NARRATION_STYLE_MAX_LENGTH),
    replyGuidanceOverride: asString(raw.replyGuidanceOverride).trim().slice(0, VILLAGER_REPLY_GUIDANCE_MAX_LENGTH),
  };
}

export function effectiveNarrationStyle(style: VillageNarrationStyle): string {
  return style.styleInstructions || DEFAULT_NARRATION_STYLE;
}

export function effectiveVillagerReplyGuidance(style: VillageNarrationStyle): string {
  return style.replyGuidanceOverride || DEFAULT_VILLAGER_REPLY_GUIDANCE;
}

export function venueWritingDirection(style: VillageNarrationStyle, playerName: string): string {
  const person =
    style.person === "first"
      ? 'Use "I" for the player in scene prose.'
      : style.person === "third"
        ? `Refer to the player in scene prose as ${JSON.stringify(playerName.trim() || "the player")}.`
        : 'Address the player as "you" in scene prose.';
  return [
    "## Venue writing",
    `Narration style: ${effectiveNarrationStyle(style)}`,
    `Write narration segments and other non-dialogue scene description in ${style.tense} tense. ${person}`,
    "These choices govern scene prose around residents' replies, not their spoken dialogue. Each resident's own card governs their dialogue, including its natural grammar and pronouns.",
    "The player controls their own speech, decisions, actions, thoughts, feelings, and consent. Never write a new player response or imply one. Narrate only an action the player explicitly submitted, the departure they chose, or an outcome already verified in the scene. Leave their next response to them.",
    style.rating === "nsfw"
      ? "Content rating: NSFW. Adult explicit content may occur when the player and scene lead there; do not force it into an otherwise ordinary visit."
      : "Content rating: SFW. Keep narration and dialogue non-explicit; ordinary romance and difficult themes may still occur.",
  ].join("\n");
}
