import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { WorldCoordination } from "./village-service.js";
const binding = createActivationBinding<WorldCoordination>("World coordination is not configured.");
export function configureWorldCoordination(service: WorldCoordination): () => void {
  return binding.configure(bindActivationService(service));
}
export async function resetVillage(...args: Parameters<WorldCoordination["resetVillage"]>) {
  return binding.get().resetVillage(...args);
}
export async function reconcileVillage(...args: Parameters<WorldCoordination["reconcileVillage"]>) {
  return binding.get().reconcileVillage(...args);
}
export async function buildVillageMemories(...args: Parameters<WorldCoordination["buildVillageMemories"]>) {
  return binding.get().buildVillageMemories(...args);
}
export async function readVillageMemoryEvidence(...args: Parameters<WorldCoordination["readVillageMemoryEvidence"]>) {
  return binding.get().readVillageMemoryEvidence(...args);
}
export async function forgetMemory(...args: Parameters<WorldCoordination["forgetMemory"]>) {
  return binding.get().forgetMemory(...args);
}
export async function correctMemory(...args: Parameters<WorldCoordination["correctMemory"]>) {
  return binding.get().correctMemory(...args);
}
