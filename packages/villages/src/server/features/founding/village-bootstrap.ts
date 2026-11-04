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

export async function interpretSocialSource(
  ...args: Parameters<VillageBootstrapService["interpretSocialSource"]>
): ReturnType<VillageBootstrapService["interpretSocialSource"]> {
  return binding.get().interpretSocialSource(...args);
}
