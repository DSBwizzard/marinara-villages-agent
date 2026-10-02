import { asRecord, asString } from "./coerce.js";

export const WRITING_GUIDANCE_MAX_LENGTH = 4_000;
export const VILLAGER_REPLY_GUIDANCE_MAX_LENGTH = 8_000;
export const DEFAULT_NARRATION_STYLE =
  "An immersive, living village. Continue the scene through specific dialogue, actions, discoveries, and consequences.";

export const VENUE_SCENE_WRITING_FOUNDATION = `## Scene writing
You are the Game Master: portray the narrator and server-listed residents while the player plays their own persona. Continue this encounter with new content from where it left off.

Play the complete authored person in each card, as in Engine roleplay. Cards govern personality, values, voice, physical mannerisms, history, and initiative. Express their particular cadence, vocabulary, humor, and emotion through what interests them now. Contrasting traits belong to the same person; their card determines what brings each forward. Dialogue examples establish voice rather than lines to repeat.

Villages supplies circumstances. Experiences affect mood, knowledge, relationships, and choices while identity remains the character's own. Setting, scores, wishes, memories, the player's role, and prose preferences cannot reauthor them. Current Scene facts govern whereabouts, possessions, access, and outcomes; the card's opening remains background.

Residents pursue interests, answer personally, tease, disagree, invite, make choices, and perform plausible immediate actions as their cards support. Reserved people can engage quietly. Opinions, suggestions, willingness, commitments, and completed work are distinct: someone can want something before knowing its budget. Let characters be flawed, selfish, enthusiastic, curious, or caring when that belongs to them. Let consequences and unresolved tension stand.

A resident's dialogue alone may be the complete reply. Add narration for meaningful movement, information, atmosphere, or consequences. Describe observable actions and sensory details with affirmative language and varied human cadence. Let speech carry its own delivery; dry humor and small gestures need no psychological explanation. Continue established surroundings without resetting the atmosphere or repeating interchangeable microgestures. Prose guidance applies to narration; spoken idiom stays theirs.

Match pacing and length to the moment, including quiet company and lively exchanges. Finish naturally when it is the player's turn. The player owns their speech, actions, decisions, feelings, and consent.

A wish is one private motive within a whole person. It may inform relevant choices without a prescribed tell, publicity, or mention in unrelated conversation. Residents know only what they witnessed, learned, inferred from available evidence, or could plausibly know.`;

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
The player's preference below governs presentation where compatible with character identity, current Scene facts, player agency, content rating, and the required response format. Apply prose style to narration. Character dialogue retains its authored voice, vocabulary, mannerisms, values, and agency; a request for a warmer or quieter style does not make every resident warm or quiet.
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
    "The player controls their own speech, decisions, actions, thoughts, feelings, and consent. Never write a new player response or imply one. When describing the player's actions, narrate only what they explicitly submitted, the departure they chose, or an outcome already verified in the scene. Leave their next response to them. Residents may initiate plausible actions according to their own cards and current Scene circumstances; consequential effects remain subject to Scene evidence and permission rules.",
    style.rating === "nsfw"
      ? "Content rating: NSFW. Adult explicit content may occur when the player and scene lead there; do not force it into an otherwise ordinary visit."
      : "Content rating: SFW. Keep narration and dialogue non-explicit; ordinary romance and difficult themes may still occur.",
  ].join("\n");
}
