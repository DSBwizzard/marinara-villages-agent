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
export async function requestVillageHomeUpgrade(...args: Parameters<VenueRequests["requestVillageHomeUpgrade"]>) {
  return binding.get().requestVillageHomeUpgrade(...args);
}
export async function decideVillageHomeUpgrade(...args: Parameters<VenueRequests["decideVillageHomeUpgrade"]>) {
  return binding.get().decideVillageHomeUpgrade(...args);
}
