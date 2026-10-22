import { knownDevelopment } from "./development-knowledge.js";
import type { RelationshipState } from "../models/relationship-types.js";
import type { VillageState } from "../models/world.js";
import type { RelationshipProfile } from "../../../shared/contracts/relationships.js";
export type { RelationshipProfile } from "../../../shared/contracts/relationships.js";

/** Only saved, witnessed disclosures can change the notebook. No hidden thresholds or schedule copying. */
export function captureRelationshipKnowledge(
  state: RelationshipState,
  _village: VillageState,
  _now = new Date(),
): void {
  for (const entry of Object.values(state.disclosures)) {
    if (entry.publicationId && !_village.socialPublications?.[entry.publicationId]) continue;
    const known = (state.knowledge[entry.fromId] ??= {
      fromId: entry.fromId,
      at: "",
      summary: "",
      routine: [],
      interests: "",
    });
    if (entry.kind === "routine" && !known.routine.includes(entry.text)) known.routine.push(entry.text);
    if (entry.kind === "preference" && !known.interests.includes(entry.text))
      known.interests = [known.interests, entry.text].filter(Boolean).join("; ");
    const latestConnection = Object.values(state.disclosures)
      .filter(
        (row) =>
          row.fromId === entry.fromId &&
          row.toId === "player" &&
          row.kind === "connection" &&
          (!row.publicationId || _village.socialPublications?.[row.publicationId]),
      )
      .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))[0];
    known.summary = latestConnection?.text ?? "";
    if (!known.at || Date.parse(entry.at) > Date.parse(known.at)) known.at = entry.at;
  }
}
export function projectRelationshipProfiles(state: RelationshipState, village: VillageState): RelationshipProfile[] {
  state = structuredClone(state);
  state.knowledge = {};
  captureRelationshipKnowledge(state, village);
  const name = (id: string) =>
    id === "player"
      ? "You"
      : (village.villagers.find((person) => person.characterId === id)?.cardSnapshot.name ?? "Former resident");
  return village.villagers.map((resident) => {
    const known = state.knowledge[resident.characterId];
    return {
      characterId: resident.characterId,
      name: resident.cardSnapshot.name,
      summary: known?.summary ?? "",
      knownAt: known?.at ?? "",
      routine: known?.routine ?? [],
      interests: known?.interests ?? "",
      wishes: (village.wishKnowledge[resident.characterId] ?? []).map((entry) => entry.text),
      knownDevelopment: knownDevelopment(village, resident.characterId),
      knownWishes: (village.wishKnowledge[resident.characterId] ?? []).map((entry) => {
        const active = resident.agenda?.wishes.some((wish) => wish.id === entry.wishId);
        const fulfilled = resident.wishLifecycle?.needs.some(
          (need) => need.aliases.includes(entry.text) && need.state === "fulfilled",
        );
        const { evidence: _evidence, ...publicEntry } = entry;
        return {
          ...publicEntry,
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
      learned: Object.values(state.disclosures)
        .filter(
          (entry) =>
            entry.fromId === resident.characterId &&
            (!entry.publicationId || village.socialPublications?.[entry.publicationId]),
        )
        .map(({ text, kind, at, toId }) => ({ text, kind, at, aboutName: name(toId) })),
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
