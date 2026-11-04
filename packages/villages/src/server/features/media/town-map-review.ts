import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { TownMapReview } from "./town-map-review-service.js";
const binding = createActivationBinding<TownMapReview>("Map editing is not configured.");
export function configureTownMapReview(service: TownMapReview): () => void {
  return binding.configure(bindActivationService(service));
}
export function prepareVillageMap(...args: Parameters<TownMapReview["prepareVillageMap"]>) {
  return binding.get().prepareVillageMap(...args);
}
export function createVillageMap(...args: Parameters<TownMapReview["createVillageMap"]>) {
  return binding.get().createVillageMap(...args);
}
export function updateVillageMap(...args: Parameters<TownMapReview["updateVillageMap"]>) {
  return binding.get().updateVillageMap(...args);
}
