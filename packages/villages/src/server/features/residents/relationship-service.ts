import type { readVillageLore } from "../../adapters/engine/lorebooks.js";
import type { StartingTie } from "../../domain/models/relationship-types.js";
import { asRecord } from "../../domain/rules/coerce.js";
import { badRequest } from "../../domain/rules/errors.js";
import { relationshipScore } from "../../domain/rules/relationship-policy.js";
import {
  neutralRelationship,
  reconcileRelationships,
  relationshipFor,
  relationshipKey,
} from "../../domain/rules/relationship-rules.js";
import {
  captureRelationshipKnowledge,
  projectRelationshipProfiles,
  proposeStartingTies,
} from "../../domain/rules/relationship-knowledge.js";
import type { readVillageState } from "../world/village-store.js";
import type { mutateRelationships } from "./relationship-store.js";
export type RelationshipPorts = {
  readVillageLore: typeof readVillageLore;
  readVillageState: typeof readVillageState;
  mutateRelationships: typeof mutateRelationships;
};
/** Relationship views and creator edits retain their originating world connections. */
export function createRelationships(ports: RelationshipPorts) {
  const { readVillageLore, readVillageState, mutateRelationships } = ports;

  async function readRelationshipsView() {
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

  async function changeRelationshipCreator(value: unknown) {
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
              (state.edges[playerKey] ??= neutralRelationship(tie.fromId, "player")).knowledgeBlockedUntilContact =
                true;
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

  return { readRelationshipsView, changeRelationshipCreator };
}
export type RelationshipService = ReturnType<typeof createRelationships>;
