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
export const asksForPastExchange = (text: string) => /\b(?:which|what) [^?!.]{0,80}\bdid (?:i|we|you)\b/iu.test(text);

export function requestsMemoryChange(text: string) {
  const request = text.trim().replace(/^["“]\s*/u, "");
  const polite = /^(?:(?:can|could|would|will) you\s+(?:please\s+)?|please\s+|i (?:want|need) you to\s+)/iu.exec(
    request,
  );
  const body = request.slice(polite?.[0].length ?? 0);
  const recallQuestion = /^(?:can|could) you\s+remember (?:who|what|when|where|why|how|which|whether|if)\b/iu;
  if (/^[^.!?\r\n]*\?/u.test(body) && (!polite || recallQuestion.test(request))) return false;
  return (
    /^(?:remember|forget|don['’]t forget)\s+\S/iu.test(body) ||
    /^(?:correct|change|update|replace|record)\s+(?:(?:(?:the|this|that|my|our|your)\s+)?(?:memory|memories|record|notes?)|what (?:i|we|you) (?:said|told|remember|recorded)|the way you remember)\b/iu.test(
      body,
    )
  );
}
export const sceneQuoteTerms = (text: string) => [
  ...new Set(recallTerms(text.replace(/\b(?:quote|verbatim|exact(?:ly)?|wording|words|line|say)\b/giu, " "))),
];
export function sceneQuoteScore(terms: string[], speaker: string, text: string) {
  if (!terms.length) return 1;
  const words = new Set(recallTerms(text));
  const named = recallTerms(speaker).some((term) => terms.includes(term));
  return terms.filter((term) => words.has(term)).length + (named ? terms.length + 1 : 0);
}
