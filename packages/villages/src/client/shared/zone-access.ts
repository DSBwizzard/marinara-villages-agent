import type { VillageVenue } from "../../shared/contracts/village.js";

type Zone = NonNullable<VillageVenue["zones"]>[number];

export function invitationLabel(invitation: NonNullable<NonNullable<Zone["accessView"]>["invitation"]>) {
  if (invitation.duration === "standing") return "Standing invitation";
  return invitation.future ? "Invited for next visit" : "Invited for this visit";
}

export function zoneAccessLabel(zone: Zone, venue: VillageVenue, inScene = false): string {
  const access = zone.accessView;
  if (zone.closed) return "Closed for renovation";
  if (!inScene)
    return (access?.decision.mode ?? zone.access?.mode) === "permission-required"
      ? "Invitation only"
      : "Open to everyone";
  if (inScene && access?.routeBlocked) return "Route blocked";
  if (inScene && access?.accessNeededVia) {
    const via = venue.zones?.find(({ id }) => id === access.accessNeededVia);
    if (via) return `Access needed through ${via.name}`;
  }
  if (inScene && access?.reachable === false && access.decision.allowed) return "Unavailable";
  switch (access?.decision.reason) {
    case "outside-hours":
      return access.nextOpening ? `Opens ${access.nextOpening}` : "Outside visitor hours";
    case "accompaniment-required":
      return "Escort required";
    case "banned":
      return "Entry prohibited";
    case "refused":
      return "Entry refused for this visit";
    case "permission-required":
      return zone.kind === "restricted" ? "Staff only" : "Permission required";
    case "invitation":
      return access.invitation ? invitationLabel(access.invitation) : "Invited";
    case "member":
      return zone.kind === "restricted" ? "Staff access" : "Open to you";
    case "entrance":
    case "public":
      return "Open";
    default:
      return zone.kind === "exterior" ? "Open" : "Unavailable";
  }
}
