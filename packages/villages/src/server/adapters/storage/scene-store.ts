import { bindActivationService, createActivationBinding } from "../engine/activation-scope.js";
import type { SceneRepository } from "./scene-repository.js";
const binding = createActivationBinding<SceneRepository>("Scene storage is not configured.");
export function configureSceneRepository(repository: SceneRepository): () => void {
  return binding.configure(bindActivationService(repository));
}
export async function readActive(...args: Parameters<SceneRepository["readActive"]>) {
  return binding.get().readActive(...args);
}
export async function readSession(...args: Parameters<SceneRepository["readSession"]>) {
  return binding.get().readSession(...args);
}
export async function changeSession(...args: Parameters<SceneRepository["changeSession"]>) {
  return binding.get().changeSession(...args);
}
export async function clearActivePointer(...args: Parameters<SceneRepository["clearActivePointer"]>) {
  return binding.get().clearActivePointer(...args);
}
