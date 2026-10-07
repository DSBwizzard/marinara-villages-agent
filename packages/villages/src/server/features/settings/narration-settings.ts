import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { VillageWriting } from "./writing-settings-service.js";
export type { VillageWritingView } from "./writing-settings-service.js";
const binding = createActivationBinding<VillageWriting>("Villages writing settings are not configured.");
export function configureVillageWriting(service: VillageWriting): () => void {
  return binding.configure(bindActivationService(service));
}
export async function readVillageWriting(
  ...args: Parameters<VillageWriting["readVillageWriting"]>
): ReturnType<VillageWriting["readVillageWriting"]> {
  return binding.get().readVillageWriting(...args);
}
export async function saveVillageWriting(
  ...args: Parameters<VillageWriting["saveVillageWriting"]>
): ReturnType<VillageWriting["saveVillageWriting"]> {
  return binding.get().saveVillageWriting(...args);
}
