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

export function venueWritingDirection(style: VillageNarrationStyle, playerName: string, compact: boolean): string {
  const person =
    style.person === "first"
      ? 'Use "I" for the player in scene prose.'
      : style.person === "third"
        ? `Refer to the player in scene prose as ${JSON.stringify(playerName.trim() || "the player")}.`
        : 'Address the player as "you" in scene prose.';
  const rating =
    style.rating === "nsfw"
      ? "NSFW: Explicit adult intimacy and graphic violence are permitted when the player and Scene lead there."
      : "SFW: Mature themes, romance, and conflict can play out. Keep violence non-graphic and leave explicit intimacy off-page.";
  if (compact)
    return [
      "## Venue writing",
      `Use ${style.tense} tense for narration. ${person} Dialogue keeps its authored grammar.`,
      "The player supplies their speech, actions, thoughts, feelings and consent. Describe only their submitted actions or verified results. Leave their next choice open. Residents can initiate within evidence and permissions.",
      rating,
    ].join("\n");
  return [
    "## Venue writing",
    `Write narration segments and other non-dialogue scene description in ${style.tense} tense. ${person}`,
    "Tense and person govern scene prose, not a resident's spoken grammar or pronouns.",
    "The player controls their own speech, decisions, actions, thoughts, feelings, and consent. Never write a new player response or imply one. When describing the player's actions, narrate only what they explicitly submitted, the departure they chose, or an outcome already verified in the scene. Leave their next response to them. Residents may initiate plausible actions according to their own cards and current Scene circumstances; consequential effects remain subject to Scene evidence and permission rules.",
    rating,
  ].join("\n");
}
