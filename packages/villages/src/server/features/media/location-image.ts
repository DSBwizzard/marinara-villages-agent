import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { LocationImageService } from "./location-image-service.js";
const binding = createActivationBinding<LocationImageService>("Villages location-image service is not configured.");
export function configureLocationImages(service: LocationImageService): () => void {
  return binding.configure(bindActivationService(service));
}

export async function generateVillageLocationImage(
  ...args: Parameters<LocationImageService["generateVillageLocationImage"]>
): ReturnType<LocationImageService["generateVillageLocationImage"]> {
  return binding.get().generateVillageLocationImage(...args);
}

export async function generateFirstPrivateSpaceImage(
  ...args: Parameters<LocationImageService["generateFirstPrivateSpaceImage"]>
): ReturnType<LocationImageService["generateFirstPrivateSpaceImage"]> {
  return binding.get().generateFirstPrivateSpaceImage(...args);
}

export async function storeVillageVenueImage(
  ...args: Parameters<LocationImageService["storeVillageVenueImage"]>
): ReturnType<LocationImageService["storeVillageVenueImage"]> {
  return binding.get().storeVillageVenueImage(...args);
}
