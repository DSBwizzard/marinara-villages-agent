import type { RelationshipKnowledge, RelationshipState, StartingTie } from "../models/relationship-types.js";
import type { VillageState } from "../models/world.js";
import { agendaBlocksFor } from "./agenda-week.js";
import { relationshipLabel, relationshipScore } from "./relationship-policy.js";
import { relationshipFor } from "./relationship-rules.js";

export type RelationshipProfile = {
  characterId: string;
  name: string;
  warmth: number;
  trust: number;
  warmthLabel: string;
  trustLabel: string;
  familiarity: number;
  friend: boolean;
  close: boolean;
  knownAt: string;
  closeKnownAt: string;
  routine: string[];
  interests: string;
  wishes: string[];
  knownWishes: import("../../domain/rules/wish-journal.js").KnownWish[];
  ties: { toId: string; name: string; warmth: number; trust: number; reasons: string[] }[];
  learned: { text: string; kind: string; at: string }[];
  access: { venueId: string; zoneId: string; active: boolean; name: string }[];
};

export function captureRelationshipKnowledge(state: RelationshipState, village: VillageState, now = new Date()): void {
  for (const resident of village.villagers) {
    const edge = relationshipFor(state, resident.characterId, "player");
    const old = state.knowledge[resident.characterId];
    if ((!edge.friend && !edge.close) || !edge.playerContactAt || edge.knowledgeBlockedUntilContact) continue;
    const knowledge: RelationshipKnowledge = old
      ? structuredClone(old)
      : { fromId: resident.characterId, at: "", closeAt: "", routine: [], interests: "", wishes: [], ties: [] };
    if (edge.friend) {
      knowledge.routine = resident.agenda
        ? agendaBlocksFor(
            { ...resident.agenda, wishActivities: [], socialActivities: [] },
            resident.ingestSchedule !== false,
            now,
          ).map(
            (block) =>
              `${String(Math.floor(block.startMinute / 60)).padStart(2, "0")}:${String(block.startMinute % 60).padStart(2, "0")} · ${block.activity}`,
          )
        : [];
      knowledge.interests = [
        resident.agenda?.routineSummary ?? "",
        ...Object.values(state.disclosures)
          .filter((entry) => entry.fromId === resident.characterId && entry.kind === "preference")
          .map((entry) => entry.text),
      ]
        .filter(Boolean)
        .join("; ");
    }
    if (edge.close) {
      knowledge.wishes = []; // Wishes require witnessed disclosure, even between close friends.
      knowledge.ties = village.villagers
        .filter((person) => person.characterId !== resident.characterId)
        .map((person) => {
          const tie = relationshipFor(state, resident.characterId, person.characterId);
          return { toId: person.characterId, warmth: tie.warmth, trust: tie.trust };
        });
    }
    if (
      !old ||
      JSON.stringify([old.routine, old.interests]) !== JSON.stringify([knowledge.routine, knowledge.interests])
    )
      knowledge.at = now.toISOString();
    if (
      edge.close &&
      (!old || JSON.stringify([old.wishes, old.ties]) !== JSON.stringify([knowledge.wishes, knowledge.ties]))
    )
      knowledge.closeAt = now.toISOString();
    state.knowledge[resident.characterId] = knowledge;
  }
}

export function projectRelationshipProfiles(state: RelationshipState, village: VillageState): RelationshipProfile[] {
  return village.villagers.map((resident) => {
    const edge = relationshipFor(state, resident.characterId, "player"),
      known = state.knowledge[resident.characterId];
    const learned = Object.values(state.disclosures).filter((entry) => entry.fromId === resident.characterId);
    return {
      characterId: resident.characterId,
      name: resident.cardSnapshot.name,
      warmth: edge.warmth,
      trust: edge.trust,
      warmthLabel: relationshipLabel(edge.warmth, "warmth"),
      trustLabel: relationshipLabel(edge.trust, "trust"),
      familiarity: edge.familiarity,
      friend: edge.friend && !edge.knowledgeBlockedUntilContact,
      close: edge.close && !edge.knowledgeBlockedUntilContact,
      knownAt: known?.at ?? "",
      closeKnownAt: known?.closeAt ?? "",
      routine: known?.routine ?? [],
      interests: known?.interests ?? "",
      wishes: (village.wishKnowledge[resident.characterId] ?? []).map((entry) => entry.text),
      knownWishes: (village.wishKnowledge[resident.characterId] ?? []).map((entry) => {
        const active = resident.agenda?.wishes.some((wish) => wish.id === entry.wishId);
        const fulfilled = resident.wishLifecycle?.needs.some(
          (need) => need.aliases.includes(entry.text) && need.state === "fulfilled",
        );
        return {
          ...entry,
          evidence: undefined,
          status:
            entry.status && entry.status !== "active"
              ? entry.status
              : active
                ? "active"
                : fulfilled
                  ? "fulfilled"
                  : "expired",
        };
      }),
      ties: (known?.ties ?? []).map((tie) => ({
        ...tie,
        name:
          village.villagers.find((person) => person.characterId === tie.toId)?.cardSnapshot.name ?? "Former resident",
        reasons: learned
          .filter((entry) => entry.kind === "explanation" && entry.toId === tie.toId)
          .map((entry) => entry.text),
      })),
      learned: learned
        .filter((entry) => entry.kind !== "explanation")
        .map(({ text, kind, at }) => ({ text, kind, at })),
      access: Object.values(state.grants)
        .filter(
          (grant) => grant.controllerId === resident.characterId && grant.visitorId === "player" && !grant.revoked,
        )
        .map((grant) => ({
          venueId: grant.venueId,
          zoneId: grant.zoneId,
          active: grant.active,
          name:
            village.venues.find((place) => place.id === grant.venueId)?.zones?.find((zone) => zone.id === grant.zoneId)
              ?.name ?? "Zone",
        })),
    };
  });
}

const escapeName = (name: string) => name.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");

export function proposeStartingTies(
  village: VillageState,
  state: RelationshipState,
  lore: readonly string[] = [],
): StartingTie[] {
  const pending = new Set(
    village.villagers
      .filter((person) => !state.reviewedActorIds.includes(person.characterId))
      .map((person) => person.characterId),
  );
  const targets = [
    { id: "player", name: village.playerPersonaName || village.playerName || "the player" },
    ...village.villagers.map((person) => ({ id: person.characterId, name: person.cardSnapshot.name })),
  ];
  const result: StartingTie[] = [];
  for (const resident of village.villagers)
    for (const target of targets) {
      if (resident.characterId === target.id || (!pending.has(resident.characterId) && !pending.has(target.id)))
        continue;
      const tie: StartingTie = {
        fromId: resident.characterId,
        toId: target.id,
        warmth: 0,
        trust: 0,
        established: false,
      };
      const historyAllowed = (context: typeof resident.foundingContext) =>
        !context || context.historyMode === "continue" || (context.historyMode === "adapt" && !context.background);
      const importsHistory =
        historyAllowed(resident.foundingContext) &&
        historyAllowed(village.villagers.find((person) => person.characterId === target.id)?.foundingContext);
      const text = importsHistory
        ? [resident.cardSnapshot.description, resident.cardSnapshot.personality, resident.cardSnapshot.backstory].join(
            "\n",
          )
        : "";
      const subject = `(?:${escapeName(resident.cardSnapshot.name)}|(?:s?he|they|I))`;
      const name = escapeName(target.name);
      const shared = [
        ...(importsHistory ? lore : []),
        ...village.chronicle.filter((entry) => entry.memoryCategory === "relationship").map((entry) => entry.text),
      ].join("\n");
      const match = (expression: string) =>
        new RegExp(`${subject}\\s+${expression}\\s+${name}(?=\\W|$)`, "iu").test(text) ||
        new RegExp(`${escapeName(resident.cardSnapshot.name)}\\s+${expression}\\s+${name}(?=\\W|$)`, "iu").test(shared);
      if (match("(?:is|are|am) best friends? with")) {
        tie.warmth = 75;
        tie.trust = 50;
        tie.established = true;
      } else if (match("(?:is|are|am) friends? with")) {
        tie.warmth = 50;
        tie.trust = 25;
        tie.established = true;
      } else if (match("(?:likes?|is fond of)")) {
        tie.warmth = 25;
        tie.established = true;
      } else if (match("(?:hates?|despises?)")) {
        tie.warmth = -75;
        tie.established = true;
      } else if (match("(?:dislikes?)")) {
        tie.warmth = -25;
        tie.established = true;
      }
      if (match("(?:trusts?)")) {
        tie.trust = 50;
        tie.established = true;
      }
      if (match("(?:distrusts?|does not trust|doesn't trust|do not trust|don't trust)")) {
        tie.trust = -50;
        tie.established = true;
      }
      const legacy = village.relationships.find(
        (edge) =>
          (edge.firstCharacterId === resident.characterId && edge.secondCharacterId === target.id) ||
          (edge.secondCharacterId === resident.characterId && edge.firstCharacterId === target.id),
      );
      if (legacy && !tie.established) {
        tie.warmth = relationshipScore(legacy.closeness * 20);
        tie.established = true;
      }
      result.push(tie);
    }
  return result;
}
