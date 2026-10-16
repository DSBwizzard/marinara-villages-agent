import type { VillageState } from "../models/world.js";
import { villageCurrentSetting } from "./prompt-preset.js";
import { backgroundRevision } from "./background-revision.js";
/** Identify saved Agenda inputs without resolving connections. */
export function agendaRevision(village: VillageState, characterId: string): string {
  const resident = village.villagers.find((entry) => entry.characterId === characterId);
  return backgroundRevision([
    villageCurrentSetting(village),
    village.selectedLorebookIds,
    village.loreTokenBudget,
    village.venues.map((venue) => [
      venue.id,
      venue.name,
      venue.form,
      venue.occupancy.residentCharacterId,
      venue.residentIds,
      venue.workerIds,
      venue.zones?.map((zone) => [zone.id, zone.name, zone.kind, zone.ownerId]),
    ]),
    resident?.agendaGeneration,
    ...(resident?.foundingContext ? [resident.foundingContext] : []),
    resident?.addedAt,
    resident && [
      resident.cardSnapshot.capturedAt,
      resident.cardSnapshot.revision,
      resident.cardSnapshot.name,
      resident.cardSnapshot.summary,
      resident.cardSnapshot.tags,
      resident.cardSnapshot.personality,
      resident.cardSnapshot.description,
    ],
  ]);
}
