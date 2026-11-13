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
        (community ? members !== 0 : members > 4) ||
        !!venue.workerIds?.length
      );
    })
  )
    return "Founding supports up to four Residences and one Community Venue.";
  return "";
}
