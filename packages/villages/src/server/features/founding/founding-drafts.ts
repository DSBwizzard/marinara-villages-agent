import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { FoundingDraftsService } from "./founding-drafts-service.js";
const binding = createActivationBinding<FoundingDraftsService>("Villages founding-drafts service is not configured.");
export function configureFoundingDrafts(service: FoundingDraftsService): () => void {
  return binding.configure(bindActivationService(service));
}

export async function suggestStartingVenues(
  ...args: Parameters<FoundingDraftsService["suggestStartingVenues"]>
): ReturnType<FoundingDraftsService["suggestStartingVenues"]> {
  return binding.get().suggestStartingVenues(...args);
}

export async function seedFoundingVenueDetails(
  ...args: Parameters<FoundingDraftsService["seedFoundingVenueDetails"]>
): ReturnType<FoundingDraftsService["seedFoundingVenueDetails"]> {
  return binding.get().seedFoundingVenueDetails(...args);
}

export async function generateFoundingVenueImage(
  ...args: Parameters<FoundingDraftsService["generateFoundingVenueImage"]>
): ReturnType<FoundingDraftsService["generateFoundingVenueImage"]> {
  return binding.get().generateFoundingVenueImage(...args);
}

export async function uploadFoundingVenueImage(
  ...args: Parameters<FoundingDraftsService["uploadFoundingVenueImage"]>
): ReturnType<FoundingDraftsService["uploadFoundingVenueImage"]> {
  return binding.get().uploadFoundingVenueImage(...args);
}
