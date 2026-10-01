import { asRecord } from "./coerce.js";
import { badRequest } from "./errors.js";
import { readVillageState } from "./village-store.js";
import { agendaBlocksFor } from "./agenda-week.js";
import { readVillageLore } from "./lorebooks.js";
import { relationshipScore, relationshipLabel } from "./relationship-policy.js";
import {
  relationshipFor,
  relationshipKey,
  neutralRelationship,
  mutateRelationships,
  reconcileRelationships,
} from "./relationship-store.js";
import type {
  RelationshipState,
  RelationshipReceipt,
  StartingTie,
  RelationshipKnowledge,
} from "./relationship-types.js";
import type { VillageState } from "./types.js";

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

export function relationshipClosingNotices(
  receipts: RelationshipReceipt[],
  state: RelationshipState,
  village: VillageState,
) {
  const name = (id: string) =>
    id === "player"
      ? "you"
      : (village.villagers.find((person) => person.characterId === id)?.cardSnapshot.name ?? "a villager");
  return receipts
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
  ties: { toId: string; name: string; warmth: number; trust: number; reasons: string[] }[];
  learned: { text: string; kind: string; at: string }[];
  access: { venueId: string; zoneId: string; active: boolean; name: string }[];
};

/** Captured knowledge stays dated when privileges lapse; it is not recomputed from secret current state. */
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
      knowledge.wishes = resident.agenda?.wishes.map((wish) => wish.wish) ?? [];
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
      wishes: [
        ...new Set([
          ...(known?.wishes ?? []),
          ...(village.wishKnowledge[resident.characterId] ?? []).map((wish) => wish.text),
        ]),
      ],
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
/** Conservative explicit-history extraction. Ambiguous prose stays neutral for creator review. */
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
      const text = [
        resident.cardSnapshot.description,
        resident.cardSnapshot.personality,
        resident.cardSnapshot.backstory,
      ].join("\n");
      const subject = `(?:${escapeName(resident.cardSnapshot.name)}|(?:s?he|they|I))`;
      const name = escapeName(target.name);
      const shared = [
        ...lore,
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

export async function readRelationshipsView() {
  const village = await readVillageState();
  let current = village.relationshipContext;
  if (!current) return { profiles: [], starting: { pending: false, spoilers: false, summaries: [] } };
  const preview = structuredClone(current);
  captureRelationshipKnowledge(preview, village);
  if (
    JSON.stringify(preview.knowledge) !== JSON.stringify(current.knowledge) ||
    JSON.stringify(preview.edges) !== JSON.stringify(current.edges)
  ) {
    current = await mutateRelationships(village.seed, (state) => {
      reconcileRelationships(state, village);
      captureRelationshipKnowledge(state, village);
    });
  }
  const pendingIds = village.villagers
    .filter((person) => !current!.reviewedActorIds.includes(person.characterId))
    .map((person) => person.characterId);
  if (pendingIds.length && JSON.stringify(pendingIds) !== JSON.stringify(current.startingActorIds)) {
    const lore = await readVillageLore(
      village.selectedLorebookIds,
      village.villagers.map((person) => person.cardSnapshot.name).join(" "),
      undefined,
      village.loreTokenBudget,
    );
    current = await mutateRelationships(village.seed, (state) => {
      state.startingTies = proposeStartingTies(village, state, lore);
      state.startingActorIds = pendingIds;
    });
  }
  const label = (tie: StartingTie) =>
    !tie.established
      ? "No established history"
      : (tie.warmth > 0 && tie.trust < 0) || (tie.warmth < 0 && tie.trust > 0)
        ? "Mixed"
        : tie.warmth < 0 || tie.trust < 0
          ? "Strained"
          : "Friendly";
  const names = (id: string) =>
    id === "player"
      ? "You"
      : (village.villagers.find((person) => person.characterId === id)?.cardSnapshot.name ?? "Former resident");
  return {
    profiles: projectRelationshipProfiles(current, village),
    starting: {
      pending: pendingIds.length > 0,
      spoilers: current.spoilers,
      summaries: current.startingTies.map((tie) => ({
        fromId: tie.fromId,
        toId: tie.toId,
        fromName: names(tie.fromId),
        toName: names(tie.toId),
        status: label(tie),
      })),
      ...(current.spoilers
        ? {
            values: village.villagers.flatMap((person) =>
              ["player", ...village.villagers.map((resident) => resident.characterId)]
                .filter((toId) => toId !== person.characterId)
                .map((toId) => {
                  const proposal = pendingIds.length
                    ? current!.startingTies.find((tie) => tie.fromId === person.characterId && tie.toId === toId)
                    : undefined;
                  const edge = relationshipFor(current, person.characterId, toId);
                  return {
                    fromId: person.characterId,
                    toId,
                    fromName: names(person.characterId),
                    toName: names(toId),
                    warmth: proposal?.warmth ?? edge.warmth,
                    trust: proposal?.trust ?? edge.trust,
                    proposed: !!proposal,
                  };
                }),
            ),
          }
        : {}),
    },
  };
}

export async function changeRelationshipCreator(value: unknown) {
  const raw = asRecord(value),
    village = await readVillageState();
  await mutateRelationships(village.seed, (state) => {
    if (raw.action === "acknowledge") {
      if (raw.spoilerAcknowledged !== true)
        throw badRequest("Acknowledge that relationship values are gameplay spoilers.");
      state.spoilers = true;
      return;
    }
    if (raw.action === "hide") {
      state.spoilers = false;
      return;
    }
    if (raw.action === "accept" || raw.action === "neutral") {
      if (raw.action === "accept")
        for (const tie of state.startingTies) {
          if (!state.startingActorIds.includes(tie.fromId) && !state.startingActorIds.includes(tie.toId)) continue;
          const key = relationshipKey(tie.fromId, tie.toId),
            edge = (state.edges[key] ??= neutralRelationship(tie.fromId, tie.toId));
          // Add the approved baseline without wiping interactions played while setup was pending.
          edge.warmth = relationshipScore(edge.warmth + tie.warmth);
          edge.trust = relationshipScore(edge.trust + tie.trust);
          if (tie.established) {
            edge.familiarity = Math.max(1, edge.familiarity);
            edge.lastContactAt ||= new Date().toISOString();
            const playerKey = relationshipKey(tie.fromId, "player");
            (state.edges[playerKey] ??= neutralRelationship(tie.fromId, "player")).knowledgeBlockedUntilContact = true;
          }
        }
      state.reviewedActorIds = [...new Set([...state.reviewedActorIds, ...state.startingActorIds])];
      state.startingTies = [];
      state.startingActorIds = [];
    } else if (raw.action === "edit") {
      if (!state.spoilers) throw badRequest("Reveal and acknowledge gameplay spoilers before editing values.");
      const fromId = String(raw.fromId ?? ""),
        toId = String(raw.toId ?? "");
      const residents = new Set(village.villagers.map((person) => person.characterId));
      if (!residents.has(fromId) || (toId !== "player" && !residents.has(toId)) || fromId === toId)
        throw badRequest("Choose a current villager and a different subject.");
      if (
        ![raw.warmth, raw.trust].every(
          (score) => typeof score === "number" && Number.isInteger(score) && score >= -100 && score <= 100,
        )
      )
        throw badRequest("Warmth and trust must be integers from -100 to 100.");
      const proposal = state.startingTies.find((tie) => tie.fromId === fromId && tie.toId === toId);
      if (proposal) {
        proposal.warmth = Number(raw.warmth);
        proposal.trust = Number(raw.trust);
        proposal.established = true;
      } else {
        const edge = (state.edges[relationshipKey(fromId, toId)] ??= neutralRelationship(fromId, toId));
        edge.warmth = Number(raw.warmth);
        edge.trust = Number(raw.trust);
        edge.lastContactAt ||= new Date().toISOString();
        const playerKey = relationshipKey(fromId, "player");
        (state.edges[playerKey] ??= neutralRelationship(fromId, "player")).knowledgeBlockedUntilContact = true;
      }
    } else throw badRequest("Unknown relationship creator action.");
    reconcileRelationships(state, village);
  });
  return readRelationshipsView();
}
