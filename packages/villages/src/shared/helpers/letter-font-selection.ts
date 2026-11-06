import { LETTER_FONTS } from "./letter-fonts.js";

function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return h >>> 0;
}
export function chooseLetterFont(randomSeed: string): string {
  // A broad draw avoids inferring a writing tool from ambiguous character prose.
  return LETTER_FONTS[hash(randomSeed + ":font") % LETTER_FONTS.length]!.id;
}
export function findLetterFont(id: string | undefined) {
  return LETTER_FONTS.find((font) => font.id === id);
}
