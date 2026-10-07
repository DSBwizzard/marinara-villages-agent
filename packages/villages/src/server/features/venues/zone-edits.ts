import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { VenueZoneEdits } from "./zone-edit-service.js";

export type { VenueZoneEdits } from "./zone-edit-service.js";

// Existing route dispatch is transitional until complete activation isolation.
const editsBinding = createActivationBinding<VenueZoneEdits>("Villages Venue Zone edits are not configured.");
export function configureVenueZoneEdits(edits: VenueZoneEdits): () => void {
  return editsBinding.configure(bindActivationService(edits));
}
export function venueZoneEdits(): VenueZoneEdits {
  return editsBinding.get();
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
