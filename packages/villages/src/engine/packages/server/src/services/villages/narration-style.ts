import { asRecord, asString } from "./coerce.js";

export const WRITING_GUIDANCE_MAX_LENGTH = 4_000;
export const VILLAGER_REPLY_GUIDANCE_MAX_LENGTH = 8_000;
export const DEFAULT_NARRATION_STYLE =
  "Grounded slice-of-life prose. Notice concrete actions and ordinary sensory details without forcing drama or a resolution.";

export const VENUE_SCENE_WRITING_FOUNDATION = `## Scene writing
${DEFAULT_NARRATION_STYLE}
The resident card is the authority on who is speaking: their personality, history, values, habits, speech examples, and private motivations come first. Do not smooth residents into one friendly village voice.

Ground each resident in their own card. Let their cadence, vocabulary, formality, emotional state, humor, interruptions, hesitations, implication, and what they choose not to say come from that card. Use example dialogue for voice, not lines to repeat. Their initiative and the length of a response belong to them and to this moment. A reply may be a word, a longer thought, an interruption, or no speech when the scene genuinely calls for it. Do not make a brief acknowledgment stand in for an answer the resident would naturally give.

Narration can show observable gestures, pauses, attention, activity, and the room around the speakers. It may come before, between, or after dialogue, or be absent when speech carries the moment. Let the scene determine its amount and order; do not follow a fixed alternation, length, or segment count. Stop at a natural handoff to the player.

The village context is true background, not a script. The place, time, agenda, people nearby, verified venue actions, memories, relationships, and wishes may shape what a resident notices or brings up, but they do not require a topic, confession, conflict, or resolution. Keep life ordinary by default; an answer may be small, unfinished, practical, awkward, funny, affectionate, or uneventful. Recent lines establish continuity, not a pattern of wording or segment shapes to imitate.

A wish is private motivation, not a quest. Let it show only through plausible attention, mood, avoidance, or its visible tell unless that resident would genuinely choose to discuss it. Nobody is omniscient: a resident knows only what they witnessed, inferred, were told, or could plausibly know.`;

/** Kept for the retired narration settings document; venue replies use the fixed foundation above. */
export const DEFAULT_VILLAGER_REPLY_GUIDANCE = VENUE_SCENE_WRITING_FOUNDATION;

export type VillageNarrationStyle = {
  tense: "present" | "past";
  person: "first" | "second" | "third";
  rating: "sfw" | "nsfw";
  /** Optional player preference. The scene foundation and resident cards remain in force. */
  writingGuidance: string;
};

export function defaultVillageNarrationStyle(): VillageNarrationStyle {
  return { tense: "present", person: "second", rating: "sfw", writingGuidance: "" };
}

export function coerceVillageNarrationStyle(value: unknown): VillageNarrationStyle {
  const raw = asRecord(value);
  return {
    tense: raw.tense === "past" ? "past" : "present",
    person: raw.person === "first" || raw.person === "third" ? raw.person : "second",
    rating: raw.rating === "nsfw" ? "nsfw" : "sfw",
    writingGuidance: asString(raw.writingGuidance).trim().slice(0, WRITING_GUIDANCE_MAX_LENGTH),
  };
}

export function venueAdditionalWritingGuidance(style: VillageNarrationStyle): string {
  return style.writingGuidance
    ? `## Additional writing guidance
The player's preference below may influence narration and dialogue where it fits the resident cards, current scene facts, player agency, and required response format. It does not replace those instructions.
${style.writingGuidance}`
    : "";
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
    `Write narration segments and other non-dialogue scene description in ${style.tense} tense. ${person}`,
    "Tense and person govern scene prose, not a resident's spoken grammar or pronouns.",
    "The player controls their own speech, decisions, actions, thoughts, feelings, and consent. Never write a new player response or imply one. Narrate only an action the player explicitly submitted, the departure they chose, or an outcome already verified in the scene. Leave their next response to them.",
    style.rating === "nsfw"
      ? "Content rating: NSFW. Adult explicit content may occur when the player and scene lead there; do not force it into an otherwise ordinary visit."
      : "Content rating: SFW. Keep narration and dialogue non-explicit; ordinary romance and difficult themes may still occur.",
  ].join("\n");
}
