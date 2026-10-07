import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { VillageStateService } from "./village-state-service.js";

export { type DocumentSlot, mutateDocument } from "../../adapters/storage/document-store.js";
export {
  defaultVillageState,
  coerceRemap,
  coerceTownMapView,
  coerceVillageState,
  coerceVillageScene,
} from "../../domain/decoding/village-codec.js";
export { listVillageScenes } from "../../adapters/storage/legacy-scene-links.js";

// Transitional route dispatch; the factory owns state coordination, not this binding.
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
