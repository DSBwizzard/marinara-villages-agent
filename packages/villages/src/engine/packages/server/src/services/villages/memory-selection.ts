import type { VillageChronicleEntry, VillageRecollection } from "./types.js";

const STOP = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "you",
  "your",
  "are",
  "was",
  "were",
  "have",
  "has",
  "had",
  "what",
  "where",
  "when",
  "why",
  "how",
  "can",
  "could",
  "would",
  "will",
  "its",
  "they",
  "them",
  "from",
  "into",
  "about",
  "there",
  "their",
  "our",
  "but",
  "not",
  "yes",
  "some",
  "to",
  "of",
  "in",
  "is",
  "it",
  "as",
  "at",
  "on",
  "be",
  "an",
  "or",
  "we",
  "he",
  "she",
  "my",
  "me",
  "do",
  "by",
  "if",
  "so",
]);
function tokens(text: string) {
  return new Set(
    (
      text
        .normalize("NFKC")
        .toLocaleLowerCase()
        .match(/[\p{L}\p{N}]+/gu) ?? ([] as string[])
    ).filter((word) => word.length >= 2 && !STOP.has(word)),
  );
}
type Ranked<T> = { entry: T; index: number; relevance: number; importance: number; audience: string[]; cost: number };
function allocate<T>(ranked: Ranked<T>[], participants: readonly string[], tokenBudget: number): T[] {
  const ids = [...new Set(participants)],
    budget = Math.max(0, Math.floor(tokenBudget * 4)),
    chosen = new Set<Ranked<T>>();
  let remaining = budget;
  const quota = ids.length ? Math.floor(budget / 2 / ids.length) : 0;
  for (const id of ids) {
    let allocation = quota;
    for (const row of ranked) {
      if (chosen.has(row) || !row.audience.includes(id) || row.cost > allocation) continue;
      chosen.add(row);
      allocation -= row.cost;
      remaining -= row.cost;
    }
  }
  for (const row of ranked) {
    if (chosen.has(row) || row.cost > remaining) continue;
    chosen.add(row);
    remaining -= row.cost;
  }
  return ranked.filter((row) => chosen.has(row)).map((row) => row.entry);
}
function rank<T extends { text: string }>(
  entries: readonly T[],
  query: string,
  audience: (entry: T) => string[],
  importance: (entry: T) => number,
  eligible: (entry: T) => boolean,
) {
  const words = tokens(query);
  return entries
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => eligible(entry))
    .map(({ entry, index }) => {
      const entryWords = tokens(entry.text);
      return {
        entry,
        index,
        audience: audience(entry),
        cost: entry.text.length + 24,
        relevance: [...words].filter((word) => entryWords.has(word)).length,
        importance: importance(entry),
      };
    })
    .sort((a, b) => b.relevance - a.relevance || b.importance - a.importance || a.index - b.index);
}
/** No embeddings. Half the existing character budget is reserved equally; unused allocations rejoin the shared pool. */
export function selectPromptMemories(
  chronicle: readonly VillageChronicleEntry[],
  characterIds: readonly string[],
  query: string,
  tokenBudget: number,
): VillageChronicleEntry[] {
  const allowed = new Set(characterIds),
    audience = (entry: VillageChronicleEntry) =>
      entry.scope === "village"
        ? [...characterIds]
        : (entry.knownByCharacterIds ?? entry.actors.map((actor) => actor.id));
  return allocate(
    rank(
      chronicle,
      query,
      audience,
      (entry) => (entry.kind === "favour" ? 8 + (entry.weight ?? 1) : (entry.weight ?? 0)),
      (entry) => entry.kind !== "tick" && !entry.supersededBy && audience(entry).some((id) => allowed.has(id)),
    ),
    characterIds,
    tokenBudget,
  );
}
export function selectPromptRecollections(
  recollections: readonly VillageRecollection[],
  characterIds: readonly string[],
  query: string,
  tokenBudget: number,
  now = Date.now(),
): VillageRecollection[] {
  const allowed = new Set(characterIds);
  return allocate(
    rank(
      recollections,
      query,
      (entry) => entry.knownByCharacterIds,
      (entry) => Math.min(3, entry.reinforcementCount),
      (entry) => Date.parse(entry.expiresAt) > now && entry.knownByCharacterIds.some((id) => allowed.has(id)),
    ),
    characterIds,
    tokenBudget,
  );
}
