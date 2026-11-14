import type { VillageVenue } from "../../shared/contracts/village.js";
import type { AccessReason } from "../../shared/helpers/venue-access.js";

const blockedLabels: Partial<Record<AccessReason, string>> = {
  "permission-required": "Permission required",
  "outside-hours": "Outside visitor hours",
  "accompaniment-required": "Escort required",
  refused: "Entry refused for this visit",
  banned: "Entry prohibited",
};

export function zoneAccessStatus(zone: NonNullable<VillageVenue["zones"]>[number], inScene = false) {
  const decision = zone.accessView?.decision;
  if (zone.closed) return { allowed: false, label: "Closed" };
  if (decision?.allowed) {
    let label = "";
    if (decision.invitationDuration === "standing") label = "Standing permission";
    else if (decision.reason === "invitation") label = inScene ? "Invited for this visit" : "Invited for one visit";
    return { allowed: true, label };
  }
  return { allowed: false, label: (decision && blockedLabels[decision.reason]) ?? "Unavailable" };
}
