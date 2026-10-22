import type { RelationshipState, SocialRecord } from "../models/relationship-types.js";
import type { VillageChronicleEntry } from "../models/world.js";
import { defaultRelationshipState } from "./relationship-rules.js";
import { selectPromptMemories } from "./memory-selection.js";
export function selectSocialRecords(
  records: SocialRecord[],
  actors: string[],
  query: string,
  budget = 1200,
): SocialRecord[] {
  const essential = records.filter((row) => row.kind !== "history" && !["fulfilled", "cancelled"].includes(row.status));
  const historical = records.filter((row) => !essential.includes(row));
  const selected = new Set(
    selectPromptMemories(
      historical.map(
        (row) =>
          ({
            id: row.id,
            text: row.text,
            scope: "private",
            kind: "chat",
            actors: row.participants.map((id) => ({ id, name: id })),
            knownByCharacterIds: row.participants,
            occurredAt: "",
            dayIndex: 0,
            clock: "",
          }) as VillageChronicleEntry,
      ),
      actors,
      query,
      budget,
    ).map((row) => row.id),
  );
  return [...essential, ...historical.filter((row) => selected.has(row.id))];
}
/** Bounded projection for an admitted model request; the complete saved ledger remains intact. */
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
    owned.map((edge) => [
      JSON.stringify([edge.fromId, edge.toId]),
      {
        ...structuredClone(edge),
        experiences: [],
        records: Object.fromEntries(Object.entries(edge.records).filter(([id]) => selected.has(id))),
      },
    ]),
  );
  packet.sharedRecords = Object.fromEntries(
    Object.entries(state.sharedRecords).filter(
      ([id, row]) =>
        selected.has(id) ||
        actors.some((actor) => row.participants.includes(actor) && !["fulfilled", "cancelled"].includes(row.status)),
    ),
  );
  packet.invitations = Object.fromEntries(
    Object.entries(state.invitations).filter(([, row]) => row.participantIds.some((id) => actors.includes(id))),
  );
  for (const actor of actors) {
    packet.intentions[actor] = structuredClone(state.intentions[actor] ?? []);
    packet.intentionRevisions[actor] = state.intentionRevisions[actor] ?? 0;
  }
  return packet;
}
