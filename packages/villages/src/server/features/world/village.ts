import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { WorldCoordination } from "./village-service.js";
const binding = createActivationBinding<WorldCoordination>("World coordination is not configured.");
export function configureWorldCoordination(service: WorldCoordination): () => void {
  return binding.configure(bindActivationService(service));
}
export {
  readPlayerIdentity,
  projectHomeLines,
  villagerPlaceView,
  readVenueImageContext,
} from "../../domain/rules/village-projections.js";
export async function resetVillage(...args: Parameters<WorldCoordination["resetVillage"]>) {
  return binding.get().resetVillage(...args);
}
export async function reconcileVillage(...args: Parameters<WorldCoordination["reconcileVillage"]>) {
  return binding.get().reconcileVillage(...args);
}
export async function runVillageReaction(...args: Parameters<WorldCoordination["runVillageReaction"]>) {
  return binding.get().runVillageReaction(...args);
}
export async function buildVillageStory(...args: Parameters<WorldCoordination["buildVillageStory"]>) {
  return binding.get().buildVillageStory(...args);
}
export async function buildVillageMemories(...args: Parameters<WorldCoordination["buildVillageMemories"]>) {
  return binding.get().buildVillageMemories(...args);
}
export async function removeChronicleEntry(...args: Parameters<WorldCoordination["removeChronicleEntry"]>) {
  return binding.get().removeChronicleEntry(...args);
}
export async function removeVillageRecollection(...args: Parameters<WorldCoordination["removeVillageRecollection"]>) {
  return binding.get().removeVillageRecollection(...args);
}
