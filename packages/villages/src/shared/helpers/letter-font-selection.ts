import { LETTER_FONTS } from "./letter-fonts.js";

// The first 100 entries are frozen for worlds predating persisted assignments.
// Append new fonts; never reorder or remove these IDs.
const LEGACY_FONT_COUNT = 100;
function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return h >>> 0;
}
export function legacyLetterFont(characterId: string): string {
  return LETTER_FONTS[hash("legacy-v1:" + characterId) % LEGACY_FONT_COUNT]!.id;
}
export function chooseLetterFont(randomSeed: string): string {
  // A broad draw avoids inferring a writing tool from ambiguous character prose.
  return LETTER_FONTS[hash(randomSeed + ":font") % LETTER_FONTS.length]!.id;
}
export function findLetterFont(id: string | undefined) {
  return LETTER_FONTS.find((font) => font.id === id);
}
