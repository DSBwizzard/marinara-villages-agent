import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { SceneWork } from "./scene-work-service.js";

const binding = createActivationBinding<SceneWork>("Villages Scene work is not configured.");
export function configureSceneWork(service: SceneWork): () => void {
  return binding.configure(bindActivationService(service));
}
export function sceneWork(): SceneWork {
  return binding.get();
}
