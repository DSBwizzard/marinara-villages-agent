import type { VenueZoneEdits } from "./zone-edit-service.js";

export type { VenueZoneEdits } from "./zone-edit-service.js";

// Existing route dispatch is transitional until complete activation isolation.
let current: VenueZoneEdits | null = null;
let registration = 0;
export function configureVenueZoneEdits(edits: VenueZoneEdits): () => void {
  const token = ++registration;
  current = edits;
  return () => {
    if (registration === token) current = null;
  };
}
export function venueZoneEdits(): VenueZoneEdits {
  if (!current) throw new Error("Villages Venue Zone edits are not configured.");
  return current;
}
export function updateVillageZone(...args: Parameters<VenueZoneEdits["updateVillageZone"]>) {
  return venueZoneEdits().updateVillageZone(...args);
}
export function proposeResidenceSpaceEdit(...args: Parameters<VenueZoneEdits["proposeResidenceSpaceEdit"]>) {
  return venueZoneEdits().proposeResidenceSpaceEdit(...args);
}
export function applyResidenceEditApproval(...args: Parameters<VenueZoneEdits["applyResidenceEditApproval"]>) {
  return venueZoneEdits().applyResidenceEditApproval(...args);
}
