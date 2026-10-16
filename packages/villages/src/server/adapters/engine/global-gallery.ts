import { activationScope, bindActivationService, createActivationBinding } from "./activation-scope.js";
import { villageEngineForm, villageEngineJson } from "./engine-transport.js";
import { createGlobalGallery, type GlobalGallery } from "./global-gallery-service.js";
import type { VillageGalleryUpload } from "./global-gallery-service.js";
import type { VillageVenueImage } from "../../domain/models/world.js";
export type { VillageGalleryUpload } from "./global-gallery-service.js";

const binding = createActivationBinding<GlobalGallery>("Villages global-gallery is not configured.");
const standalone = createGlobalGallery({ villageEngineJson, villageEngineForm });
function selected(): GlobalGallery {
  if (activationScope()) return binding.get();
  return binding.maybe() ?? standalone;
}
export function configureGlobalGallery(service: GlobalGallery): () => void {
  return binding.configure(bindActivationService(service));
}
export function ensureVillagesGalleryFolder(): Promise<string | null> {
  return selected().ensureVillagesGalleryFolder();
}
export async function uploadVillageGalleryImage(input: VillageGalleryUpload): Promise<VillageVenueImage> {
  return selected().uploadVillageGalleryImage(input);
}
