import { bindActivationService, createActivationBinding } from "./activation-scope.js";
import { type GlobalGallery } from "./global-gallery-service.js";
import type { VillageGalleryUpload } from "./global-gallery-service.js";
import type { VillageVenueImage } from "../../domain/models/world.js";
export type { VillageGalleryUpload } from "./global-gallery-service.js";

const binding = createActivationBinding<GlobalGallery>("Villages global-gallery is not configured.");

function selected(): GlobalGallery {
  return binding.get();
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
