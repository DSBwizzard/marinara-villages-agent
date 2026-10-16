import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { Residences } from "./residence-service.js";
const binding = createActivationBinding<Residences>("Residence commands are not configured.");
export function configureResidences(service: Residences): () => void {
  return binding.configure(bindActivationService(service));
}
export async function proposeVillageResidence(...args: Parameters<Residences["proposeVillageResidence"]>) {
  return binding.get().proposeVillageResidence(...args);
}
export async function approveVillageResidence(...args: Parameters<Residences["approveVillageResidence"]>) {
  return binding.get().approveVillageResidence(...args);
}
export async function decideVillageResidence(...args: Parameters<Residences["decideVillageResidence"]>) {
  return binding.get().decideVillageResidence(...args);
}
export async function completeVillageResidence(...args: Parameters<Residences["completeVillageResidence"]>) {
  return binding.get().completeVillageResidence(...args);
}
export async function retryResidencePrivateSpaceAdaptation(
  ...args: Parameters<Residences["retryResidencePrivateSpaceAdaptation"]>
) {
  return binding.get().retryResidencePrivateSpaceAdaptation(...args);
}
