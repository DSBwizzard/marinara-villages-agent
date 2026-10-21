import type { VillageState } from "../models/world.js";
import { venueResidentIds } from "./venue-model.js";
import { resolveVenueZone } from "./venue-zones.js";

/** Temporary authored opening positions; recurring agendas remain untouched. */
export function openingPresence(state: VillageState, residentId: string) {
  const opening = state.opening;
  if (
    opening?.version !== 2 ||
    opening.stage !== "conversations" ||
    !opening.residentIds.includes(residentId) ||
    opening.reveals.some((proof) => proof.residentId === residentId) ||
    !state.villagers.some((resident) => resident.characterId === residentId)
  )
    return undefined;
  const home = state.venues.find((venue) => venueResidentIds(venue).includes(residentId));
  const zone = home && resolveVenueZone(home, "exterior");
  return home && zone ? { venueId: home.id, zoneId: zone.id, activity: "Available for a conversation" } : undefined;
}
