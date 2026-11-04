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
export function readVillageAuthority(...args: Parameters<VillageStateService["readVillageAuthority"]>) {
  return villageStateService().readVillageAuthority(...args);
}
export function peekVillageAuthority() {
  return villageStateService().peekVillageAuthority();
}
export function readVillageSnapshot(...args: Parameters<VillageStateService["readVillageSnapshot"]>) {
  return villageStateService().readVillageSnapshot(...args);
}
export function readVillageState(...args: Parameters<VillageStateService["readVillageState"]>) {
  return villageStateService().readVillageState(...args);
}
export function mutateVillageState(...args: Parameters<VillageStateService["mutateVillageState"]>) {
  return villageStateService().mutateVillageState(...args);
}

export function withVillageSceneAcceptance<T>(
  work: (state: import("../../domain/models/world.js").VillageState) => Promise<T>,
  options?: import("../../domain/models/world-repository.js").VillageMemoryRead,
) {
  return villageStateService().withVillageSceneAcceptance(work, options);
}

/** Explicit history access for recall, disclosures, Scene capture and learning. */
export function readVillageMemoryState(options?: import("../../domain/models/world-repository.js").VillageMemoryRead) {
  return villageStateService().readVillageState({ ...options, memories: true });
}
export function readVillageMemoryAuthority(
  options?: import("../../domain/models/world-repository.js").VillageMemoryRead,
) {
  return villageStateService().readVillageAuthority({ ...options, memories: true });
}
export function readVillageMemorySnapshot(
  options?: import("../../domain/models/world-repository.js").VillageMemoryRead,
) {
  return villageStateService().readVillageSnapshot({ ...options, memories: true });
}
export function mutateVillageMemoryState(
  update: Parameters<VillageStateService["mutateVillageState"]>[0],
  options?: import("../../domain/models/world-repository.js").VillageMemoryWrite,
) {
  return villageStateService().mutateVillageState(update, { ...options, memories: true });
}
