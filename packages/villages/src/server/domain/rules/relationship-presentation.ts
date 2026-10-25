import { projectMemories } from "./memory-views.js";
import type { RelationshipReceipt, RelationshipState } from "../models/relationship-types.js";
import type { VillageState } from "../models/world.js";
import { relationshipLabel } from "./relationship-policy.js";
import { relationshipFor } from "./relationship-rules.js";
/** Pure character-perspective prompts and player-visible relationship notices. */

/** Writing context describes particular relationships, never a replacement temperament. */
export function relationshipWritingPrompt(village: VillageState, fromId: string): string {
  const state = village.relationshipContext;
  const targets = [
    { id: "player", name: "the player" },
    ...village.villagers.map((person) => ({ id: person.characterId, name: person.cardSnapshot.name })),
  ].filter((target) => target.id !== fromId);
  const ties = targets.flatMap((target) => {
    const edge = relationshipFor(state, fromId, target.id);
    const established = state?.startingTies.some(
      (tie) => tie.fromId === fromId && tie.toId === target.id && tie.established,
    );
    if (!edge.familiarity && !edge.lastContactAt && !edge.warmth && !edge.trust && !established) return [];
    const feelings = [
      edge.warmth ? `warmth: ${relationshipLabel(edge.warmth, "warmth").toLowerCase()}` : "",
      edge.trust ? `trust: ${relationshipLabel(edge.trust, "trust").toLowerCase()}` : "",
    ].filter(Boolean);
    return [`Toward ${target.name} (${target.id}): ${feelings.join("; ") || "shared contact or established history"}.`];
  });
  return [
    "Relationship context for this character's own perspective:",
    "Where no Village history is recorded, use the card's usual approach to people. Missing history establishes neither distrust nor intimacy. Authored relationships still belong to the character; do not invent shared Scene changes.",
    ...ties,
    "These particular relationships can affect trust, affection, boundaries, and choices; they do not replace temperament, humor, expressiveness, or initiative. Friendship does not imply romance. Private reasons are known only to this character until they choose to share them.",
  ].join("\n");
}

export function relationshipPrompt(village: VillageState, fromId: string): string {
  const state = village.relationshipContext;
  const targets = [
    { id: "player", name: "the player" },
    ...village.villagers.map((person) => ({ id: person.characterId, name: person.cardSnapshot.name })),
  ];
  return [
    "Your own established feelings (not other people's private feelings):",
    ...targets
      .filter((target) => target.id !== fromId)
      .map((target) => {
        const edge = relationshipFor(state, fromId, target.id);
        return `${target.name} (${target.id}): warmth ${edge.warmth} (${relationshipLabel(edge.warmth, "warmth")}), trust ${edge.trust} (${relationshipLabel(edge.trust, "trust")}); ${edge.familiarity ? "known through contact or established history" : "no established familiarity"}.`;
      }),
    "Let feelings and personality influence reactions without forcing hostility or intimacy. Strong warmth is friendship, not automatic romance. Do not disclose private reasons you have not chosen to share. You may offer explicit one-visit entry or a standing invitation for an exact zone you control. Say the zone name, visitor, and 'whenever' or 'from now on' for a standing grant. Guest permission is never authority to invite others or change the space.",
  ].join("\n");
}

function visibleRelationship(receipt: RelationshipReceipt, state: RelationshipState) {
  const edge = relationshipFor(state, receipt.fromId, "player");
  return (
    receipt.toId === "player" ||
    (edge.close && !edge.knowledgeBlockedUntilContact && !!state.knowledge[receipt.fromId]?.closeAt)
  );
}

export function relationshipChangeNotices(
  receipts: RelationshipReceipt[],
  state: RelationshipState,
  village: VillageState,
) {
  const name = (id: string) =>
    id === "player"
      ? "you"
      : (village.villagers.find((person) => person.characterId === id)?.cardSnapshot.name ?? "a villager");
  return receipts
    .filter((receipt) => receipt.before !== receipt.after)
    .filter((receipt) => visibleRelationship(receipt, state))
    .map((receipt) => ({
      id: receipt.id,
      kind: receipt.after > receipt.before ? ("relationship-up" as const) : ("relationship-down" as const),
      text: `${name(receipt.fromId)}'s ${receipt.dimension} toward ${name(receipt.toId)} ${receipt.after > receipt.before ? "increased" : "decreased"} (${receipt.before} → ${receipt.after}).`,
      // A reviewer inference is not a disclosure. Private reasons remain in the domain ledger.
      ...(() => {
        const rows = projectMemories(village.memories, ["player"]).filter(
          (row) => row.domainRef?.kind === "relationship" && row.domainRef.id === receipt.id,
        );
        return rows.length ? { detail: rows.map((row) => row.text).join("\n") } : {};
      })(),
    }));
}

/** Old saved notices may include contact-only or capped receipts. Keep the ledger intact. */
export function filterRelationshipNotices<T extends { id: string; kind: string }>(
  notices: readonly T[],
  state: RelationshipState | undefined,
): T[] {
  return notices.filter((notice) => {
    if (notice.kind !== "relationship-up" && notice.kind !== "relationship-down") return true;
    const receipt = state?.receipts[notice.id];
    return !receipt || (receipt.before !== receipt.after && visibleRelationship(receipt, state!));
  });
}
