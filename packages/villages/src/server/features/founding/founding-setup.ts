import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { FoundingSetup } from "./founding-setup-service.js";
const binding = createActivationBinding<FoundingSetup>("Founding setup is not configured.");
export function configureFoundingSetup(service: FoundingSetup): () => void {
  return binding.configure(bindActivationService(service));
}
export async function runVillageSetup(...args: Parameters<FoundingSetup["runVillageSetup"]>) {
  return binding.get().runVillageSetup(...args);
}
export async function draftVenueDescriptions(...args: Parameters<FoundingSetup["draftVenueDescriptions"]>) {
  return binding.get().draftVenueDescriptions(...args);
}
