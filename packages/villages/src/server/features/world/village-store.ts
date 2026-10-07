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
let current: VillageStateService | null = null;
let registration = 0;
export function configureVillageStateService(service: VillageStateService): () => void {
  const token = ++registration;
  current = service;
  return () => {
    if (registration === token) current = null;
  };
}
function villageStateService(): VillageStateService {
  if (!current) throw new Error("Villages state service is not configured.");
  return current;
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
