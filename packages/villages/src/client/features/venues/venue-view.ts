import type { VillageVenue, SceneView } from "../../../shared/contracts/village.js";
import { venueClassesFor, venueSpaceFor } from "../../shared/venue.js";

/** Layout identity is public; interior details and entry permission remain separate. */
export function venueDisplayZones(place: VillageVenue, room: SceneView) {
  const classes = venueClassesFor(place);
  const zones: NonNullable<VillageVenue["zones"]> = place.zones?.length
    ? place.zones
    : [
        {
          id: "exterior",
          name: "Exterior",
          kind: "exterior",
          venueClass: classes[0]!,
          description: place.form || place.description,
          image: place.presentation.image,
          state: place.exteriorState ?? {
            revision: 0,
            recent: null,
            updatedAt: "",
          },
        },
        ...classes.map((venueClass) => ({
          ...venueSpaceFor(place, venueClass),
          id: `class:${venueClass}`,
          name: "Common Space",
          kind: venueClass === "residence" ? ("shared-residence" as const) : ("public" as const),
          seen: venueClass === "residence" ? place.playerSeenShared : place.playerSeenPublic,
        })),
        ...(place.privateSpaces ?? []).map((zone) => ({
          ...zone,
          name: zone.name || "Private Space",
          kind: "private-residence" as const,
          seen: place.playerSeenPrivateIds?.includes(zone.ownerId),
        })),
      ];
  return zones.map((zone) => {
    const exterior = zone.kind === "exterior";
    const active = room?.status !== "closed" && room?.placeId === place.id && room.zoneId === zone.id;
    const known = exterior || !!zone.seen || active || (zone.kind === "shared-residence" && place.occupancy.playerHome);
    const invited = place.playerInvitations?.some(
      (invitation) =>
        invitation.zoneId === zone.id ||
        (!invitation.zoneId &&
          (zone.kind === "shared-residence" ||
            (zone.kind === "private-residence" &&
              invitation.scope === "private" &&
              invitation.ownerId === zone.ownerId))),
    );
    const allowed =
      exterior ||
      (zone.accessView
        ? zone.accessView.decision.allowed
        : !zone.closed &&
          (zone.kind === "public" ||
            !!zone.relationshipAccess ||
            !!invited ||
            (place.occupancy.playerHome && (zone.kind === "shared-residence" || zone.ownerId === "player")) ||
            (room?.placeId === place.id && !!room.grantedZoneIds?.includes(zone.id))));
    const restricted =
      !exterior && (zone.accessView ? zone.accessView.decision.mode === "permission-required" : zone.kind !== "public");
    const accessLabel =
      exterior || allowed
        ? "Open to you"
        : zone.closed
          ? "Closed for renovation"
          : restricted
            ? "Permission needed"
            : "Currently unavailable";
    return {
      ...zone,
      name: exterior ? "Entrance" : zone.name,
      known,
      allowed,
      restricted,
      accessLabel,
      image: known ? zone.image : null,
      description: known ? zone.description : "",
      isPrivate: zone.kind === "private-residence",
    };
  });
}
export type VenueDisplayZone = ReturnType<typeof venueDisplayZones>[number];
