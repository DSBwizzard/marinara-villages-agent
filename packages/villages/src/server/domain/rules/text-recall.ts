const stop = new Set(
  "a an and are as at be been but by can could did do does for from had has have he her him his how i if in is it its me my of on or our she so some that the their them then there they this to us was we were what when where which who will with would you your about again remember happened tell said today now please yesterday".split(
    " ",
  ),
);
export const recallTerms = (text: string): string[] =>
  (
    text
      .normalize("NFKC")
      .toLocaleLowerCase("en-US")
      .match(/[\p{L}\p{N}]+/gu) ?? []
  ).filter((term) => !stop.has(term));
export const estimatedTextTokens = (text: string) => Math.ceil(Buffer.byteLength(text, "utf8") / 4);
export const asksForRecallQuote = (text: string) =>
  /\b(?:quote|verbatim|exact (?:words|wording)|what (?:exactly )?did [^.!?]{0,80}\bsay)\b/iu.test(text);
export const sceneQuoteTerms = (text: string) => [
  ...new Set(recallTerms(text.replace(/\b(?:quote|verbatim|exact(?:ly)?|wording|words|line|say)\b/giu, " "))),
];
export function sceneQuoteScore(terms: string[], speaker: string, text: string) {
  if (!terms.length) return 1;
  const words = new Set(recallTerms(text));
  const named = recallTerms(speaker).some((term) => terms.includes(term));
  return terms.filter((term) => words.has(term)).length + (named ? terms.length + 1 : 0);
}

export type RecallRanking = {
  recent?: string;
  /** Optional similarity over already projected candidate texts, indexed by position. */
  semantic?: (texts: readonly string[]) => ReadonlyMap<number, number>;
};

/** Rank eligible prose by term rarity and frequency, with advisory recent and semantic matches. */
export function rankRecall<T>(
  rows: readonly T[],
  query: string,
  prose: (row: T) => string,
  context: RecallRanking = {},
) {
  const terms = new Set(recallTerms(query)),
    weights = new Map(recallTerms(context.recent ?? "").map((term) => [term, 0.45])),
    frequencies = new Map<string, number>();
  for (const term of terms) weights.set(term, 1);
  const texts = rows.map(prose);
  const semantic = context.semantic?.(texts);
  const documents = rows.map((row, index) => {
    const tokens = recallTerms(texts[index]),
      counts = new Map<string, number>();
    for (const term of tokens) counts.set(term, (counts.get(term) ?? 0) + 1);
    for (const term of counts.keys()) frequencies.set(term, (frequencies.get(term) ?? 0) + 1);
    return { row, index, counts, length: tokens.length, score: 0, matchedQuery: false };
  });
  const average = documents.reduce((sum, row) => sum + row.length, 0) / Math.max(1, rows.length);
  for (const row of documents) {
    for (const [term, frequency] of row.counts) {
      const weight = weights.get(term);
      const count = frequencies.get(term)!;
      if (weight) {
        if (weight === 1) row.matchedQuery = true;
        row.score +=
          (Math.log(1 + (rows.length - count + 0.5) / (count + 0.5)) * frequency * 2.2 * weight) /
          (frequency + 1.2 * (0.25 + (0.75 * row.length) / Math.max(1, average)));
      }
    }
    const similarity = semantic?.get(row.index) ?? 0;
    if (similarity >= 0.48) row.score += 2 * (similarity - 0.38);
  }
  return documents.sort((a, b) => b.score - a.score || b.index - a.index);
}
