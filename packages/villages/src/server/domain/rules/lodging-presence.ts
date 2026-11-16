import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import type { VillageState } from "../models/world.js";
import { continuityActor } from "./continuity-actors.js";
import { mayHostStay } from "./venue-access.js";
import { accessibleVenueRoute } from "./venue-path.js";
import { venueZones } from "./venue-zones.js";

export function lodgingLocations(state: VillageState) {
  return [
    ...state.venues,
    ...Object.values(state.worldPlaces.places)
      .filter((row) => !row.disabled)
      .map((row) => row.location),
  ];
}

export function pendingLodging(state: VillageState, actor: string, at: Date) {
  for (const venue of lodgingLocations(state)) {
    for (const permission of venue.access?.permissions ?? []) {
      const pending = permission.pendingStay;
      if (!pending || permission.revoked || permission.visitorId !== actor) continue;
      if (permission.expiresAt && Date.parse(permission.expiresAt) <= at.getTime()) continue;
      const zone = venueZones(venue).find((room) => room.id === permission.zoneId);
      if (
        zone &&
        mayHostStay(venue, zone, permission.issuerId) &&
        continuityActor(state, actor)?.incarnation === pending.guestIncarnation &&
        continuityActor(state, permission.issuerId)?.incarnation === pending.hostIncarnation
      )
        return { venue, zone, permission, pending };
    }
  }
}

export function activeLodging(state: VillageState, actor: string, at: Date) {
  for (const venue of lodgingLocations(state)) {
    const permission = venue.access?.permissions.find(
      (row) =>
        row.duration === "stay" &&
        !row.pendingStay &&
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
