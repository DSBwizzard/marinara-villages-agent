import type { VillageChronicleEntry, VillageRecollection } from "./types.js";

/** Select prompt memories without deleting durable notes. Four characters approximate one token. */
export function selectPromptMemories(
  chronicle: readonly VillageChronicleEntry[],
  characterIds: readonly string[],
  query: string,
  tokenBudget: number,
): VillageChronicleEntry[] {
  const allowed = new Set(characterIds);
  const words = [...new Set(query.toLowerCase().match(/[a-z]{4,}/gu) ?? [])];
  const ranked = chronicle
    .map((entry, index) => ({ entry, index }))
    .filter(
      ({ entry }) =>
        entry.kind !== "tick" &&
        !entry.supersededBy &&
        (entry.scope === "village" ||
          (entry.knownByCharacterIds ?? entry.actors.map((actor) => actor.id)).some((id) => allowed.has(id))),
    )
    .map(({ entry, index }) => ({
      entry,
      index,
      score:
        words.reduce((score, word) => score + (entry.text.toLowerCase().includes(word) ? 3 : 0), 0) +
        (entry.kind === "favour" ? 8 + (entry.weight ?? 1) : 0) +
        Math.max(0, 5 - Math.floor(index / 8)),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index);
  let remaining = Math.max(0, Math.floor(tokenBudget * 4));
  const chosen: typeof ranked = [];
  for (const candidate of ranked) {
    const cost = candidate.entry.text.length + 24;
    if (cost > remaining) continue;
    chosen.push(candidate);
    remaining -= cost;
  }
  return chosen.sort((a, b) => a.index - b.index).map(({ entry }) => entry);
}

/** Select still-live conversational context for at least one present witness. */
export function selectPromptRecollections(
  recollections: readonly VillageRecollection[],
  characterIds: readonly string[],
  query: string,
  tokenBudget: number,
  now = Date.now(),
): VillageRecollection[] {
  const allowed = new Set(characterIds);
  const words = [...new Set(query.toLowerCase().match(/[a-z]{4,}/gu) ?? [])];
  const ranked = recollections
    .map((entry, index) => ({ entry, index }))
    .filter(
      ({ entry }) =>
        Date.parse(entry.expiresAt) > now && entry.knownByCharacterIds.some((characterId) => allowed.has(characterId)),
    )
    .map(({ entry, index }) => ({
      entry,
      index,
      score:
        words.reduce((score, word) => score + (entry.text.toLowerCase().includes(word) ? 3 : 0), 0) +
        Math.min(3, entry.reinforcementCount) +
        Math.max(0, 5 - Math.floor(index / 8)),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index);
  let remaining = Math.max(0, Math.floor(tokenBudget * 4));
  const chosen: typeof ranked = [];
  for (const candidate of ranked) {
    const cost = candidate.entry.text.length + 24;
    if (cost > remaining) continue;
    chosen.push(candidate);
    remaining -= cost;
  }
  return chosen.sort((a, b) => a.index - b.index).map(({ entry }) => entry);
}
