import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { VenueRequests } from "./venue-request-service.js";
export { queueVillageVenueRequest } from "../../domain/rules/venue-request-state.js";
const binding = createActivationBinding<VenueRequests>("Venue requests are not configured.");
export function configureVenueRequests(service: VenueRequests): () => void {
  return binding.configure(bindActivationService(service));
}
export async function recordVillageVenueRequest(...args: Parameters<VenueRequests["recordVillageVenueRequest"]>) {
  return binding.get().recordVillageVenueRequest(...args);
}
export async function decideVillageVenueRequest(...args: Parameters<VenueRequests["decideVillageVenueRequest"]>) {
  return binding.get().decideVillageVenueRequest(...args);
}
