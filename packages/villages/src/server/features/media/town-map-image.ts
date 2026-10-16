import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { TownMapImageService } from "./town-map-image-service.js";
const binding = createActivationBinding<TownMapImageService>("Villages town-map-image service is not configured.");
export function configureTownMapImage(service: TownMapImageService): () => void {
  return binding.configure(bindActivationService(service));
}

export async function generateVillageTownMap(
  ...args: Parameters<TownMapImageService["generateVillageTownMap"]>
): ReturnType<TownMapImageService["generateVillageTownMap"]> {
  return binding.get().generateVillageTownMap(...args);
}
