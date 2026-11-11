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
