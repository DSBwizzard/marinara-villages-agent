import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { LocationImageService } from "./location-image-service.js";
const binding = createActivationBinding<LocationImageService>("Villages location-image service is not configured.");
export async function requestZonePicture(...args: Parameters<LocationImageService["requestZonePicture"]>) {
  return binding.get().requestZonePicture(...args);
}
export async function setZonePictureFrozen(...args: Parameters<LocationImageService["setZonePictureFrozen"]>) {
  return binding.get().setZonePictureFrozen(...args);
}
export async function retryZonePicture(...args: Parameters<LocationImageService["retryZonePicture"]>) {
  return binding.get().retryZonePicture(...args);
}
export async function updateZonePicture(...args: Parameters<LocationImageService["updateZonePicture"]>) {
  return binding.get().updateZonePicture(...args);
}
export function configureLocationImages(service: LocationImageService): () => void {
  return binding.configure(bindActivationService(service));
}

export async function generateVillageLocationImage(
  ...args: Parameters<LocationImageService["generateVillageLocationImage"]>
): ReturnType<LocationImageService["generateVillageLocationImage"]> {
  return binding.get().generateVillageLocationImage(...args);
}

export async function generateFirstZoneImage(
  ...args: Parameters<LocationImageService["generateFirstZoneImage"]>
): ReturnType<LocationImageService["generateFirstZoneImage"]> {
  return binding.get().generateFirstZoneImage(...args);
}

export async function storeVillageVenueImage(
  ...args: Parameters<LocationImageService["storeVillageVenueImage"]>
): ReturnType<LocationImageService["storeVillageVenueImage"]> {
  return binding.get().storeVillageVenueImage(...args);
}
