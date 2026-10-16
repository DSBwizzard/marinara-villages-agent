import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { SceneProgress } from "./progress-service.js";
const binding = createActivationBinding<SceneProgress>("Scene progress service is not configured.");
export function configureSceneProgress(service: SceneProgress): () => void {
  return binding.configure(bindActivationService(service));
}
export async function processSavedProgressSubmission(
  ...args: Parameters<SceneProgress["processSavedProgressSubmission"]>
) {
  return binding.get().processSavedProgressSubmission(...args);
}
export async function processSavedExchange(...args: Parameters<SceneProgress["processSavedExchange"]>) {
  return binding.get().processSavedExchange(...args);
}
export function startProgressRecovery(...args: Parameters<SceneProgress["startProgressRecovery"]>) {
  return binding.get().startProgressRecovery(...args);
}
