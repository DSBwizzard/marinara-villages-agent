import { startingHistoryReady } from "../../domain/rules/starting-history.js";
import { continuityRelationships, inspectContinuityRelationships } from "../../domain/rules/continuity-library.js";
import type { RelationshipInspectView, RelationshipView } from "../../../shared/contracts/relationships.js";
import type { readVillageState } from "../world/village-store.js";
export type RelationshipPorts = {
  backgroundWorkSummaries?: typeof import("../../jobs/background-work.js").backgroundWorkSummaries;
  clarifyStartingTies?: (value: unknown) => Promise<void>;
  readVillageState: typeof readVillageState;
  now(): Date;
};
/** Both reads are pure projections. Inspect is an explicit, separate privacy boundary. */
export function createRelationships(ports: RelationshipPorts) {
  async function readRelationshipsView(): Promise<RelationshipView> {
    const village = await ports.readVillageState();
    return {
      profiles: continuityRelationships(village, ports.now().toISOString()),
      starting: { pending: !startingHistoryReady(village) },
    };
  }
  async function readRelationshipsInspect(): Promise<RelationshipInspectView> {
    const village = await ports.readVillageState(),
      at = ports.now().toISOString();
    const name = (id: string) =>
      id === "player"
        ? village.playerPersonaName || village.playerName || "Player"
        : (village.villagers.find((person) => person.characterId === id)?.cardSnapshot.name ?? "Former resident");
    return {
      processing: ((await ports.backgroundWorkSummaries?.()) ?? [])
        .filter((row) => ["starting-ties", "resident-planning", "personal-mail"].includes(row.kind))
        .map((row) => ({
          id: row.id,
          kind: row.kind,
          instanceId: row.instanceId,
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
        initialized: village.startingHistory.reviewed[person.characterId] === person.incarnation,
        entries: inspectContinuityRelationships(village, person.characterId, at),
      })),
      conflicts: village.startingHistory.conflicts.map((row) => ({
        question: row.question,
        residents: row.actorIds.map(name),
        sourceIds: row.citations.map((citation) => citation.sourceId),
        actorIds: row.actorIds,
        sourceHash: village.startingHistory.sourceHash,
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
