import type { VillagePlaceView, VillagePlayerIdentity, VillageState, VillageVillager } from "../models/world.js";
import { agendaAt } from "./agenda-plan.js";
import { badRequest } from "./errors.js";
import { homeBuildingOptions, isHousePlace, type VillageHomeLine } from "./prompt-preset.js";
import type { NativeRoutine } from "./schedule-rules.js";
import { venueResidentIds } from "./venue-model.js";
import { chooseAgendaZone } from "./venue-zones.js";
import { deriveVillageMoment } from "./village-clock.js";

export function readPlayerIdentity(village: VillageState): VillagePlayerIdentity {
  if (village.playerPersonaId.length === 0) {
    return { name: "", description: "", personaId: "", missing: false };
  }
  return {
    name: village.playerPersonaName,
    description: village.playerPersonaIdentity,
    personaId: village.playerPersonaId,
    missing: village.playerPersonaMissing,
  };
}
export function projectHomeLines(
  village: Pick<VillageState, "venues" | "villagers"> & Partial<Pick<VillageState, "homeBuildingNames">>,
  names: ReadonlyMap<string, string>,
): VillageHomeLine[] {
  const occupants = new Map(
    village.villagers.map((villager) => [
      villager.characterId,
      names.get(villager.characterId) ?? villager.cardSnapshot.name,
    ]),
  );
  const lines: VillageHomeLine[] = [];
  for (const place of village.venues) {
    if (place.occupancy.playerHome) {
      lines.push({
        isPlayerHome: true,
        occupant: "",
        building: place.occupancy.homeKind,
        buildingName: place.occupancy.homeKind ? village.homeBuildingNames?.[place.occupancy.homeKind] : undefined,
        venueName: place.name,
      });
    }
    for (const residentId of venueResidentIds(place)) {
      const occupant = occupants.get(residentId) ?? names.get(residentId) ?? "";
      if (!occupant) continue;
      lines.push({
        isPlayerHome: false,
        occupant,
        building: place.occupancy.homeKind,
        buildingName: place.occupancy.homeKind ? village.homeBuildingNames?.[place.occupancy.homeKind] : undefined,
        venueName: place.name,
      });
    }
  }
  return lines;
}
export function villagerPlaceView(
  village: VillageState,
  villager: VillageVillager,
  _routine: NativeRoutine | null,
  minuteOfDay = deriveVillageMoment({ foundedAt: village.foundedAt, seed: village.seed, now: new Date() }).minuteOfDay,
  at = new Date(),
): VillagePlaceView | null {
  const agenda = agendaAt(villager.agenda, minuteOfDay, at, villager.ingestSchedule !== false);
  const venueId = agenda?.venueId ?? "";
  // A translation can name a place that has since been deleted from the village,
  // so the lookup is by id against the current list rather than by position into
  // the one the translation was written from. A place that is gone reads as
  // unplaced, which is where the fallback below picks the villager up.
  const venue =
    venueId.length > 0
      ? village.venues.find(
          (entry) =>
            entry.id === venueId &&
            (entry.constructionStatus === "worksite" ||
              !isHousePlace(entry) ||
              (entry.classes?.some((item) => item !== "residence") ?? false)),
        )
      : undefined;
  if (venue) {
    const zone = chooseAgendaZone(venue, villager.characterId, agenda?.activity, agenda?.zoneId, village);
    return {
      id: venue.id,
      name: venue.name,
      image: venue.presentation.image,
      kind: "venue",
      zoneId: zone.id,
      zoneName: zone.name,
    };
  }
  // Where they are when nothing has sent them anywhere: their own house. Named
  // after the BUILDING rather than after whoever lives there, because the name
  // of the person is already on the plate in front of them and the tab reads
  // that one — what this answers is only what kind of house it is.
  const home = village.venues.find((entry) => venueResidentIds(entry).includes(villager.characterId));
  if (!home) return null;
  const building = homeBuildingOptions().find((option) => option.kind === home.occupancy.homeKind);
  const zone = chooseAgendaZone(home, villager.characterId, agenda?.activity, agenda?.zoneId, village);
  return {
    id: home.id,
    name: building?.name ?? home.name,
    image: home.presentation.image,
    kind: "home",
    zoneId: zone.id,
    zoneName: zone.name,
  };
}

export function readBool(value: unknown): boolean {
  if (typeof value !== "boolean") throw badRequest("Image context controls must be on or off.");
  return value;
}
export function readVenueImageContext(value: unknown) {
  const row = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    useAssignedVillagerContext:
      row.useAssignedVillagerContext === undefined ? true : readBool(row.useAssignedVillagerContext),
    useVisualLore: row.useVisualLore === undefined ? true : readBool(row.useVisualLore),
  };
}
