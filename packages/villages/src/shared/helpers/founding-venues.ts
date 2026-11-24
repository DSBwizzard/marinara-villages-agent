import type { VillageVenue } from "../contracts/village.js";
export const FOUNDING_VENUE_LIMIT = 6;
export function foundingVenueShapeProblem(venues: readonly VillageVenue[]): string {
  return !venues.length || venues.length > FOUNDING_VENUE_LIMIT ? "Keep one to six starting Venues." : "";
}
