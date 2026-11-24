import type { VillageState } from "../models/world.js";
import { conflict } from "./errors.js";
import { assertCanAddVillageVenue } from "./venue-capacity.js";
import { validateLayoutZones } from "./venue-layout.js";

export function admitLocation(state: VillageState, id: string): void {
  const place = state.worldPlaces.places[id];
  if (
    !place ||
    place.disabled ||
    !place.knownBy.includes("player") ||
    !place.visited ||
    !place.prepared ||
    place.report
  )
    throw conflict("Visit and verify this Place before adding it as a Venue.");
  if (state.venues.some((venue) => venue.id === id)) throw conflict("This Place is already a Venue.");
  assertCanAddVillageVenue(state);
  validateLayoutZones(
    place.location,
    (place.location.zones ?? []).filter((zone) => zone.kind !== "exterior").map((zone) => ({ ...zone })),
    state,
  );
  state.venues.push(place.location);
  delete state.worldPlaces.places[id];
  state.worldPlaces.revision++;
}
