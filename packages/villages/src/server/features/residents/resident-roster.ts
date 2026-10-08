import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { ResidentRoster } from "./resident-roster-service.js";
const binding = createActivationBinding<ResidentRoster>("Resident roster commands are not configured.");
export function configureResidentRoster(service: ResidentRoster): () => void {
  return binding.configure(bindActivationService(service));
}
export async function addVillager(...args: Parameters<ResidentRoster["addVillager"]>) {
  return binding.get().addVillager(...args);
}
export async function removeVillager(...args: Parameters<ResidentRoster["removeVillager"]>) {
  return binding.get().removeVillager(...args);
}
