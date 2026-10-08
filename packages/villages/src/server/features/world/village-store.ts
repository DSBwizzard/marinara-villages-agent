import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { VillageStateService } from "./village-state-service.js";

// World state commands delegate to the activation's owned service.
const stateBinding = createActivationBinding<VillageStateService>("Villages state service is not configured.");
export function configureVillageStateService(service: VillageStateService): () => void {
  return stateBinding.configure(bindActivationService(service));
}
function villageStateService(): VillageStateService {
  return stateBinding.get();
}
export function readVillageAuthority() {
  return villageStateService().readVillageAuthority();
}
export function readVillageSnapshot() {
  return villageStateService().readVillageSnapshot();
}
export function readVillageState() {
  return villageStateService().readVillageState();
}
export function mutateVillageState(...args: Parameters<VillageStateService["mutateVillageState"]>) {
  return villageStateService().mutateVillageState(...args);
}
