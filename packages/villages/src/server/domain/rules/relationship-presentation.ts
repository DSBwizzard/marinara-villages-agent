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
  const name = (id: string) => targets.find((target) => target.id === id)?.name ?? id;
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
  const experiences = Object.values(state?.receipts ?? {})
    .filter((receipt) => receipt.fromId === fromId && receipt.before !== receipt.after)
    .slice(-6)
    .map((receipt) => `Your experience with ${name(receipt.toId)} (${receipt.at}): ${receipt.reason}`);
  const encounters = (state?.socialEncounters ?? [])
    .filter((entry) => entry.actorIds.includes(fromId))
    .slice(-3)
    .map(
      (entry) =>
        `Your recent shared experience (${entry.at}): ${entry.lines.map((line) => `${name(line.speakerId)}: ${line.content}`).join(" | ")}`,
    );
  return [
    "Relationship context for this character's own perspective:",
    "Where no Village history is recorded, use the card's usual approach to people. Missing history establishes neither distrust nor intimacy. Authored relationships still belong to the character; do not invent shared Village events.",
    ...ties,
    ...experiences,
    ...encounters,
    "These particular relationships and experiences can affect trust, affection, boundaries, and choices; they do not replace temperament, humor, expressiveness, or initiative. Friendship does not imply romance. Private reasons are known only to this character until they choose to share them.",
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
    ...Object.values(state?.receipts ?? {})
      .filter((receipt) => receipt.fromId === fromId && receipt.before !== receipt.after)
      .slice(-6)
      .map(
        (receipt) =>
          `Your recorded experience about ${receipt.toId} (${receipt.at}): ${receipt.reason}. This is your own perspective; other people do not automatically know it. Repeating this evidence earns no further change.`,
      ),
    ...(state?.socialEncounters ?? [])
      .filter((entry) => entry.actorIds.includes(fromId))
      .slice(-3)
      .map(
        (entry) =>
          "Your recent shared experience (" +
          entry.at +
          "): " +
          entry.lines.map((line) => line.speakerId + ": " + line.content).join(" | "),
      ),
    "Let feelings and personality influence reactions without forcing hostility or intimacy. Strong warmth is friendship, not automatic romance. Do not disclose private reasons you have not chosen to share. You may offer explicit one-visit entry or a standing invitation for an exact zone you control. Say the zone name, visitor, and 'whenever' or 'from now on' for a standing grant. Guest permission is never authority to invite others or change the space.",
  ].join("\n");
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
    .filter(
      (receipt) =>
        receipt.toId === "player" ||
        (relationshipFor(state, receipt.fromId, "player").close &&
          !relationshipFor(state, receipt.fromId, "player").knowledgeBlockedUntilContact &&
          !!state.knowledge[receipt.fromId]?.closeAt),
    )
    .map((receipt) => ({
      id: receipt.id,
      kind: receipt.after > receipt.before ? ("relationship-up" as const) : ("relationship-down" as const),
      text: `${name(receipt.fromId)}'s ${receipt.dimension} toward ${name(receipt.toId)} ${receipt.after > receipt.before ? "increased" : "decreased"} (${receipt.before} → ${receipt.after}).`,
      // A reviewer inference is not a disclosure. Private reasons remain in the domain ledger.
      ...(state.disclosures[receipt.id] ? { detail: receipt.reason } : {}),
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
    return !receipt || receipt.before !== receipt.after;
  });
}
