import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { FoundingProgressService } from "./founding-progress-service.js";
const binding = createActivationBinding<FoundingProgressService>(
  "Villages founding-progress service is not configured.",
);
export function configureFoundingProgress(service: FoundingProgressService): () => void {
  return binding.configure(bindActivationService(service));
}

export async function reportFoundingProgress(
  ...args: Parameters<FoundingProgressService["reportFoundingProgress"]>
): ReturnType<FoundingProgressService["reportFoundingProgress"]> {
  return binding.get().reportFoundingProgress(...args);
}
