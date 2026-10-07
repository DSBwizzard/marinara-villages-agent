import { bindActivationService, createActivationBinding } from "../adapters/engine/activation-scope.js";
import type { TownMapGenerationService } from "./town-map-service.js";

export type { TownMapGeneration } from "./town-map-service.js";
const generationBinding = createActivationBinding<TownMapGenerationService>(
  "Villages map generation is not configured.",
);
export function configureTownMapGeneration(service: TownMapGenerationService): () => void {
  return generationBinding.configure(bindActivationService(service));
}
export function startTownMapGeneration(): () => void {
  return generationBinding.get().startTownMapGeneration();
}
export function requestTownMapGeneration(...args: Parameters<TownMapGenerationService["requestTownMapGeneration"]>) {
  return generationBinding.get().requestTownMapGeneration(...args);
}
export function readTownMapGeneration(...args: Parameters<TownMapGenerationService["readTownMapGeneration"]>) {
  return generationBinding.get().readTownMapGeneration(...args);
}
