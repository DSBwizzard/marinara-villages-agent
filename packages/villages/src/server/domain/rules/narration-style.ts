import { asRecord, asString } from "./coerce.js";

export const WRITING_GUIDANCE_MAX_LENGTH = 4_000;
export const DEFAULT_NARRATION_STYLE =
  "An immersive, living village. Continue the scene through specific dialogue, actions, discoveries, and consequences.";

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
    style.rating === "nsfw"
      ? "Content rating: NSFW. Adult explicit content may occur when the player and scene lead there; do not force it into an otherwise ordinary visit."
      : "Content rating: SFW. Keep narration and dialogue non-explicit; ordinary romance and difficult themes may still occur.",
  ].join("\n");
}
