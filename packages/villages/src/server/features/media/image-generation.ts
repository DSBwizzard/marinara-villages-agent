import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { ImageGenerationService } from "./image-generation-service.js";
const binding = createActivationBinding<ImageGenerationService>("Villages image-generation service is not configured.");
export function configureImageGeneration(service: ImageGenerationService): () => void {
  return binding.configure(bindActivationService(service));
}

export async function resolveVillageImageConnectionId(
  ...args: Parameters<ImageGenerationService["resolveVillageImageConnectionId"]>
): ReturnType<ImageGenerationService["resolveVillageImageConnectionId"]> {
  return binding.get().resolveVillageImageConnectionId(...args);
}

export async function generateVillageImage(
  ...args: Parameters<ImageGenerationService["generateVillageImage"]>
): ReturnType<ImageGenerationService["generateVillageImage"]> {
  return binding.get().generateVillageImage(...args);
}
