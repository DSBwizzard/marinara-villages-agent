import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { SceneChanges } from "./changes-service.js";

const binding = createActivationBinding<SceneChanges>("Scene changes service is not configured.");
export function configureSceneChanges(service: SceneChanges): () => void {
  return binding.configure(bindActivationService(service));
}
export async function readSceneChanges(...args: Parameters<SceneChanges["readSceneChanges"]>) {
  return binding.get().readSceneChanges(...args);
}
export async function dismissSceneNotice(...args: Parameters<SceneChanges["dismissSceneNotice"]>) {
  return binding.get().dismissSceneNotice(...args);
}
export async function replaySceneChanges(...args: Parameters<SceneChanges["replaySceneChanges"]>) {
  return binding.get().replaySceneChanges(...args);
}
