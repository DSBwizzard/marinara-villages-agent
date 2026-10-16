import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { ResidentCards } from "./resident-card-service.js";
export type { ResidentCards } from "./resident-card-service.js";
const binding = createActivationBinding<ResidentCards>("Resident card commands are not configured.");
export function configureResidentCards(service: ResidentCards): () => void {
  return binding.configure(bindActivationService(service));
}
export function residentCards(): ResidentCards {
  return binding.get();
}
export async function buildVillageCatalog(...args: Parameters<ResidentCards["buildVillageCatalog"]>) {
  return residentCards().buildVillageCatalog(...args);
}
export async function previewVillagerRefresh(...args: Parameters<ResidentCards["previewVillagerRefresh"]>) {
  return residentCards().previewVillagerRefresh(...args);
}
export async function applyVillagerRefresh(...args: Parameters<ResidentCards["applyVillagerRefresh"]>) {
  return residentCards().applyVillagerRefresh(...args);
}
