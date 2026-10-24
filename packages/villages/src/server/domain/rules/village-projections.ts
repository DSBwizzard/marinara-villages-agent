import { openingPresence } from "./opening-presence.js";
import type { VillagePlaceView, VillagePlayerIdentity, VillageState, VillageVillager } from "../models/world.js";
import { agendaAt } from "./agenda-plan.js";
import { badRequest, conflict } from "./errors.js";
import { homeBuildingOptions, type VillageHomeLine } from "./prompt-preset.js";
import type { NativeRoutine } from "./schedule-rules.js";
import { MAX_ZONE_VILLAGERS, venueResidentIds } from "./venue-model.js";
import { canOccupyZone, chooseAgendaZone, venueZones, zoneClosed } from "./venue-zones.js";
import { evaluateZoneAccess } from "./venue-access.js";
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
function preferredVillagerPlace(
  village: VillageState,
  villager: VillageVillager,
  _routine: NativeRoutine | null,
  minuteOfDay = deriveVillageMoment({ foundedAt: village.foundedAt, seed: village.seed, now: new Date() }).minuteOfDay,
  at = new Date(),
): VillagePlaceView | null {
  const staged = openingPresence(village, villager.characterId);
  if (staged) {
    const venue = village.venues.find((row) => row.id === staged.venueId)!;
    return {
      id: venue.id,
      name: venue.name,
      image: venue.presentation.image,
      kind: "home",
      zoneId: staged.zoneId,
      zoneName: "Entrance",
    };
  }
  const agenda = agendaAt(villager.agenda, minuteOfDay, at, villager.ingestSchedule !== false);
  const venueId = agenda?.venueId ?? "";
  // A translation can name a place that has since been deleted from the village,
  // so the lookup is by id against the current list rather than by position into
  // the one the translation was written from. A place that is gone reads as
  // unplaced, which is where the fallback below picks the villager up.
  const venue = venueId.length > 0 ? village.venues.find((entry) => entry.id === venueId) : undefined;
  if (venue) {
    const zone = chooseAgendaZone(venue, villager.characterId, agenda?.activity, agenda?.zoneId, village, {
      at,
      relationships: village.relationshipContext,
    });
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
  const zone = chooseAgendaZone(home, villager.characterId, agenda?.activity, agenda?.zoneId, village, {
    at,
    relationships: village.relationshipContext,
  });
  return {
    id: home.id,
    name: building?.name ?? home.name,
    image: home.presentation.image,
    kind: "home",
    zoneId: zone.id,
    zoneName: zone.name,
  };
}

/** Resolve the entire roster together, after every agenda overlay. Never hide overflow. */
export function villagePresence(village: VillageState, minuteOfDay: number, at: Date) {
  const result = new Map<string, VillagePlaceView>();
  const counts = new Map<string, number>();
  const key = (venueId: string, zoneId: string) => JSON.stringify([venueId, zoneId]);
  const residents = [...village.villagers].sort((a, b) => a.characterId.localeCompare(b.characterId));
  const pending: typeof residents = [];
  const place = (resident: VillageVillager, view: VillagePlaceView) => {
    const id = key(view.id, view.zoneId ?? "exterior");
    if ((counts.get(id) ?? 0) >= MAX_ZONE_VILLAGERS) return false;
    counts.set(id, (counts.get(id) ?? 0) + 1);
    result.set(resident.characterId, view);
    return true;
  };
  for (const resident of residents) {
    const preferred = preferredVillagerPlace(village, resident, null, minuteOfDay, at);
    if (preferred && !place(resident, preferred)) pending.push(resident);
  }
  for (const resident of pending) {
    const preferred = preferredVillagerPlace(village, resident, null, minuteOfDay, at)!;
    const origin = village.venues.find((venue) => venue.id === preferred.id)!;
    const home = village.venues.find((venue) => venueResidentIds(venue).includes(resident.characterId));
    const destinations = [...new Set([origin, home, ...village.venues].filter((venue) => !!venue))];
    let placed = false;
    for (const venue of destinations) {
      for (const zone of venueZones(venue)) {
        // Other households' interiors are never a generic overflow destination.
        if (venue !== origin && venue !== home && zone.kind !== "exterior") continue;
        if (
          zoneClosed(village, venue, zone) ||
          !(venue.access
            ? evaluateZoneAccess(venue, zone, resident.characterId, {
                at,
                relationships: village.relationshipContext,
              }).allowed
            : canOccupyZone(venue, zone, resident.characterId))
        )
          continue;
        if (
          place(resident, {
            id: venue.id,
            name: venue.name,
            image: venue.presentation.image,
            kind: venueResidentIds(venue).includes(resident.characterId) ? "home" : "venue",
            zoneId: zone.id,
            zoneName: zone.name,
          })
        ) {
          placed = true;
          break;
        }
      }
      if (placed) break;
    }
    if (!placed) throw conflict("No permitted Zone has room for this villager. Saved positions are preserved.");
  }
  return result;
}

export function villagerPlaceView(
  village: VillageState,
  villager: VillageVillager,
  _routine: NativeRoutine | null,
  minuteOfDay = deriveVillageMoment({ foundedAt: village.foundedAt, seed: village.seed, now: new Date() }).minuteOfDay,
  at = new Date(),
): VillagePlaceView | null {
  return villagePresence(village, minuteOfDay, at).get(villager.characterId) ?? null;
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
