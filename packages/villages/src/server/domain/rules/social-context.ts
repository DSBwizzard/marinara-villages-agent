import type { RelationshipState, SocialRecord } from "../models/relationship-types.js";
import { defaultRelationshipState } from "./relationship-rules.js";
/** Active terms are authority; remembered history is recalled from native Memories. */
export function selectSocialRecords(
  records: SocialRecord[],
  _actors: string[],
  _query: string,
  _budget = 1200,
): SocialRecord[] {
  return records.filter((row) => row.kind !== "history" && !["fulfilled", "cancelled"].includes(row.status));
}
/** Admitted requests keep active terms; remembered history lives in native Memories. */
export function socialContextState(
  state: RelationshipState | undefined,
  actors: string[],
  query = "",
): RelationshipState | undefined {
  if (!state) return undefined;
  const packet = defaultRelationshipState(state.seed);
  const owned = Object.values(state.edges).filter((edge) => actors.includes(edge.fromId));
  const records = selectSocialRecords(
    owned.flatMap((edge) => Object.values(edge.records)),
    actors,
    query,
  );
  const selected = new Set(records.map((row) => row.id));
  packet.edges = Object.fromEntries(
    owned.map((edge) => {
      const { experiences: _experiences, records: _records, ...facts } = edge;
      return [
        JSON.stringify([edge.fromId, edge.toId]),
        {
          ...structuredClone(facts),
          experiences: [],
          records: Object.fromEntries(Object.entries(edge.records).filter(([id]) => selected.has(id))),
        },
      ];
    }),
  );
  packet.sharedRecords = Object.fromEntries(
    Object.entries(state.sharedRecords).filter(
      ([id, row]) =>
        selected.has(id) ||
        actors.some((actor) => row.participants.includes(actor) && !["fulfilled", "cancelled"].includes(row.status)),
    ),
  );
  for (const actor of actors) {
    packet.intentions[actor] = structuredClone(state.intentions[actor] ?? []);
    packet.intentionRevisions[actor] = state.intentionRevisions[actor] ?? 0;
  }
  return packet;
}
