import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { TownMapReview } from "./town-map-review-service.js";
const binding = createActivationBinding<TownMapReview>("Town map review is not configured.");
export function configureTownMapReview(service: TownMapReview): () => void {
  return binding.configure(bindActivationService(service));
}
export async function replaceVillageTownMap(...args: Parameters<TownMapReview["replaceVillageTownMap"]>) {
  return binding.get().replaceVillageTownMap(...args);
}
export async function readTownMapSubmission(...args: Parameters<TownMapReview["readTownMapSubmission"]>) {
  return binding.get().readTownMapSubmission(...args);
}
export async function readVillageTownMapImage(...args: Parameters<TownMapReview["readVillageTownMapImage"]>) {
  return binding.get().readVillageTownMapImage(...args);
}
