import type { VillageVenue } from "../contracts/village.js";

export function foundingVenueShapeProblem(venues: readonly VillageVenue[], communityId: string): string {
  if (
    venues.length > 5 ||
    venues.filter((venue) => venue.id === communityId).length !== 1 ||
    venues.some((venue) => {
      const community = venue.id === communityId;
      const members = Number(venue.occupancy.playerHome) + (venue.residentIds?.length ?? 0);
      return (
        venue.classes?.length !== 1 ||
        venue.classes[0] !== (community ? "community" : "residence") ||
        members !== (community ? 0 : 1) ||
        !!venue.workerIds?.length
      );
    })
  )
    return "Founding needs separate Residences for each person and one Community Venue.";
  return "";
}
