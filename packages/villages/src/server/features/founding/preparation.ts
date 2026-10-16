import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { FoundingPreparationService } from "./preparation-service.js";
import type { VillageSnapshot } from "../../domain/models/world.js";
const preparationBinding = createActivationBinding<FoundingPreparationService>(
  "Villages founding preparation is not configured.",
);
export function configureFoundingPreparation(service: FoundingPreparationService): () => void {
  return preparationBinding.configure(bindActivationService(service));
}
export function prepareFoundedVillage(): Promise<void> {
  return preparationBinding.get().prepareFoundedVillage();
}
export async function retryFoundedVillagePreparation(): Promise<VillageSnapshot> {
  return preparationBinding.get().retryFoundedVillagePreparation();
}
export async function foundingPreparationSnapshot(): Promise<VillageSnapshot> {
  return preparationBinding.get().foundingPreparationSnapshot();
}
export async function assertFoundedVillageReady(): Promise<void> {
  return preparationBinding.get().assertFoundedVillageReady();
}
