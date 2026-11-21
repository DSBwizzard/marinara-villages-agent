import type { VillageState } from "../models/world.js";
import { badRequest, conflict } from "./errors.js";
import { assertCanAddVillageVenue } from "./venue-capacity.js";
import { validVenueClasses } from "./venue-model.js";
import { validateLayoutZones } from "./venue-layout.js";

export function admitLocation(state: VillageState, id: string, classes: unknown): void {
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
  if (!validVenueClasses(classes)) throw badRequest("Choose one or two Venue Classes.");
  if (state.venues.some((venue) => venue.id === id)) throw conflict("This Place is already a Venue.");
  assertCanAddVillageVenue(state, classes);
  const zones = (place.location.zones ?? []).map((zone) => ({
    ...zone,
    venueClass:
      zone.kind === "staff" ? ("workplace" as const) : classes.includes(zone.venueClass) ? zone.venueClass : classes[0],
  }));
  validateLayoutZones(
    place.location,
    zones.filter((zone) => zone.kind !== "exterior"),
    classes,
    state,
  );
  place.location.classes = classes;
  for (const zone of place.location.zones ?? []) zone.venueClass = zones.find((row) => row.id === zone.id)!.venueClass;
  state.venues.push(place.location);
  delete state.worldPlaces.places[id];
  state.worldPlaces.revision++;
}
