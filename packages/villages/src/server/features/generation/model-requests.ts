import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { ModelCompletions } from "./completion-service.js";
const binding = createActivationBinding<ModelCompletions>("Villages model completions are not configured.");
export function configureModelCompletions(service: ModelCompletions): () => void {
  return binding.configure(bindActivationService(service));
}
export async function completeWithRoom(
  ...args: Parameters<ModelCompletions["completeWithRoom"]>
): ReturnType<ModelCompletions["completeWithRoom"]> {
  return binding.get().completeWithRoom(...args);
}
