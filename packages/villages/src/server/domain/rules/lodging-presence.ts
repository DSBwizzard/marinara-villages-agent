import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import type { VillageState } from "../models/world.js";
import { mayHostStay } from "./venue-access.js";
import { accessibleVenueRoute } from "./venue-path.js";
import { venueZones } from "./venue-zones.js";

export function activeLodging(state: VillageState, actor: string, at: Date) {
  const venues = [
    ...state.venues,
    ...Object.values(state.worldPlaces.places)
      .filter((row) => !row.disabled)
      .map((row) => row.location),
  ];
  for (const venue of venues) {
    const permission = venue.access?.permissions.find(
      (row) =>
        row.duration === "stay" &&
        row.visitorId === actor &&
        !row.revoked &&
        Date.parse(row.issuedAt) <= at.getTime() &&
        Date.parse(row.expiresAt ?? "") > at.getTime(),
    );
    const zone = permission && venueZones(venue).find((row) => row.id === permission.zoneId);
    if (
      permission &&
      zone &&
      mayHostStay(venue, zone, permission.issuerId) &&
      accessibleVenueRoute(state, venue, actor, zone.id, new ZonedDate(at, state.timeZone || "UTC"))
    )
      return { venue, zone, permission };
  }
}
