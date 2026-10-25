import type { readVillageLore } from "../../adapters/engine/lorebooks.js";
import { projectRelationshipProfiles } from "../../domain/rules/relationship-knowledge.js";
import type { RelationshipInspectView, RelationshipView } from "../../../shared/contracts/relationships.js";
import type { readVillageState } from "../world/village-store.js";
import type { mutateRelationships } from "./relationship-store.js";
export type RelationshipPorts = {
  backgroundWorkSummaries?: typeof import("../../jobs/background-work.js").backgroundWorkSummaries;
  clarifyStartingTies?: (value: unknown) => Promise<void>;
  prepareStartingTies?: () => Promise<void>;
  applySavedStartingTies?: () => Promise<void>;
  readVillageLore: typeof readVillageLore;
  readVillageState: typeof readVillageState;
  mutateRelationships: typeof mutateRelationships;
};
/** Both reads are pure projections. Inspect is an explicit, separate privacy boundary. */
export function createRelationships(ports: RelationshipPorts) {
  async function readRelationshipsView(): Promise<RelationshipView> {
    const village = await ports.readVillageState(),
      current = village.relationshipContext;
    return {
      profiles: current ? projectRelationshipProfiles(current, village) : [],
      starting: {
        pending: village.villagers.some((person) => !current?.reviewedActorIds.includes(person.characterId)),
      },
    };
  }
  async function readRelationshipsInspect(): Promise<RelationshipInspectView> {
    const village = await ports.readVillageState(),
      state = village.relationshipContext;
    const name = (id: string) =>
      id === "player"
        ? village.playerPersonaName || village.playerName || "Player"
        : (village.villagers.find((person) => person.characterId === id)?.cardSnapshot.name ?? "Former resident");
    return {
      recovery: (village.socialOutbox ?? [])
        .filter((row) => !!row.error)
        .map((row) => ({ id: row.id, message: row.error!, reinterpretRequired: !!row.reinterpretRequired })),
      processing: ((await ports.backgroundWorkSummaries?.()) ?? [])
        .filter((row) => ["starting-ties", "story", "personal-mail", "social-recovery"].includes(row.kind))
        .map((row) => ({
          id: row.id,
          attempt: row.attempt,
          label: row.label,
          status: row.status,
          message: row.error,
          requests: row.requests,
          tokens: row.tokens,
        })),
      residents: village.villagers.map((person) => ({
        characterId: person.characterId,
        name: name(person.characterId),
        initialized: !!state?.reviewedActorIds.includes(person.characterId),
        intentions: (state?.intentions[person.characterId] ?? []).map((item) => ({
          text: item.text,
          reason: item.reason,
          targets: item.targetIds.map(name),
          status: item.status,
        })),
        perspectives: Object.values(state?.edges ?? {})
          .filter((edge) => edge.fromId === person.characterId)
          .map((edge) => ({
            aboutName: name(edge.toId),
            connection: edge.connection,
            stance: edge.stance,
            expectations: edge.expectations,
            concerns: edge.concerns,
            updatedAt: edge.updatedAt,
            revision: edge.revision,
            records: Object.values(edge.records).map((record) => ({
              ...record,
              currentStatus: state?.sharedRecords[record.id]?.status,
              participants: record.participants.map(name),
            })),
            experiences: edge.experiences.flatMap((id) => {
              const receipt = state?.receipts[id];
              return receipt
                ? [
                    {
                      reason: receipt.reason,
                      at: receipt.at,
                      sourceId: receipt.sourceId,
                      evidence: receipt.evidence.map((row) => ({ speaker: name(row.speakerId), text: row.content })),
                    },
                  ]
                : [];
            }),
            technical: { fromId: edge.fromId, toId: edge.toId, receiptIds: edge.experiences },
          })),
      })),
      conflicts: (state?.initializationConflicts ?? []).map((row) => ({
        question: row.question,
        residents: row.actorIds.map(name),
        sourceIds: row.sourceIds,
        actorIds: row.actorIds,
        sourceHash: village.semanticStartingTies?.sourceHash ?? "",
      })),
    };
  }
  async function clarifyRelationships(value: unknown) {
    if (!ports.clarifyStartingTies) throw new Error("History clarification unavailable.");
    await ports.clarifyStartingTies(value);
    return readRelationshipsInspect();
  }
  return { readRelationshipsView, readRelationshipsInspect, clarifyRelationships };
}
export type RelationshipService = ReturnType<typeof createRelationships>;
