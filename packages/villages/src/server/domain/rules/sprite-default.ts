import type { SpriteSetupDraft } from "../../../shared/contracts/sprites.js";

/** Compare completed image analyses locally; stable assignment order breaks ties. */
export function suggestDefaultSprite(draft: SpriteSetupDraft): string {
  let best = "",
    bestRank = -1;
  for (const assignment of draft.assignments) {
    if (!assignment.included) continue;
    const item = draft.suggestions.find((entry) => entry.artworkId === assignment.artworkId) ?? assignment;
    const traits = draft.analysisTraits?.[assignment.artworkId];
    // Partial/failed sets must not silently choose an early candidate.
    if (draft.errors[assignment.artworkId] || (!traits && !assignment.name.trim())) return "";
    if (!traits || !item.name.trim() || item.direction !== "front" || traits.expression !== "neutral") continue;
    const rank = traits.pose === "relaxed-standing" ? 2 : traits.pose === "other" ? 1 : 0;
    if (rank > bestRank) {
      best = item.artworkId;
      bestRank = rank;
    }
  }
  return best;
}
