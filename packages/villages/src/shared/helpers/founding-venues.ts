import type { VillageVenue } from "../contracts/village.js";
export const FOUNDING_VENUE_LIMIT = 6;
export function foundingVenueShapeProblem(venues: readonly VillageVenue[]): string {
  if (!venues.length) return "A Village requires at least one Venue.";
  return venues.length > FOUNDING_VENUE_LIMIT ? "Keep up to six starting Venues." : "";
}
