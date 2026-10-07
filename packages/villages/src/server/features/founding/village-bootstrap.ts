import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { VillageBootstrapService } from "./village-bootstrap-service.js";
const binding = createActivationBinding<VillageBootstrapService>(
  "Villages village-bootstrap service is not configured.",
);
export function configureVillageBootstrap(service: VillageBootstrapService): () => void {
  return binding.configure(bindActivationService(service));
}

export async function draftVillageVenueDescriptions(
  ...args: Parameters<VillageBootstrapService["draftVillageVenueDescriptions"]>
): ReturnType<VillageBootstrapService["draftVillageVenueDescriptions"]> {
  return binding.get().draftVillageVenueDescriptions(...args);
}

export async function proposeVillage(
  ...args: Parameters<VillageBootstrapService["proposeVillage"]>
): ReturnType<VillageBootstrapService["proposeVillage"]> {
  return binding.get().proposeVillage(...args);
}

export async function proposePublicVenueNames(
  ...args: Parameters<VillageBootstrapService["proposePublicVenueNames"]>
): ReturnType<VillageBootstrapService["proposePublicVenueNames"]> {
  return binding.get().proposePublicVenueNames(...args);
}

export async function proposeHappenings(
  ...args: Parameters<VillageBootstrapService["proposeHappenings"]>
): ReturnType<VillageBootstrapService["proposeHappenings"]> {
  return binding.get().proposeHappenings(...args);
}

export async function proposeReaction(
  ...args: Parameters<VillageBootstrapService["proposeReaction"]>
): ReturnType<VillageBootstrapService["proposeReaction"]> {
  return binding.get().proposeReaction(...args);
}
