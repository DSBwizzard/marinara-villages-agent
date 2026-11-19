import type { VillageVenue } from "../contracts/village.js";

export function foundingVenueShapeProblem(venues: readonly VillageVenue[], openingId: string): string {
  if (venues.length > 16 || !venues.some((venue) => venue.id === openingId))
    return "Choose an opening gathering Venue among at most sixteen Venues.";
  if (venues.filter((venue) => venue.classes?.includes("residence")).length > 4)
    return "Founding supports at most four Residences.";
  if (venues.some((venue) => !venue.classes?.length || venue.classes.length > 2))
    return "Choose one or two Venue Classes.";
  if (
    venues.filter((venue) =>
      venue.spaces?.some(
        (zone) =>
          zone.venueClass !== "residence" &&
          (!zone.access || (zone.access.mode === "public" && !zone.access.accompanied)),
      ),
    ).length < 2
  )
    return "Provide public shared Zones in at least two Venues.";
  if (
    venues.some(
      (venue) =>
        venue.classes?.includes("residence") &&
        Number(venue.occupancy.playerHome) + (venue.residentIds?.length ?? 0) !== 1,
    )
  )
    return "Each starting Residence needs one assigned resident.";
  return "";
}
