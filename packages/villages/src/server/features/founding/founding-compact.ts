import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { CompactFoundingService } from "./founding-compact-service.js";
const binding = createActivationBinding<CompactFoundingService>("Villages founding-compact service is not configured.");
export function configureCompactFounding(service: CompactFoundingService): () => void {
  return binding.configure(bindActivationService(service));
}

export async function proposeCompactFounding(
  ...args: Parameters<CompactFoundingService["proposeCompactFounding"]>
): ReturnType<CompactFoundingService["proposeCompactFounding"]> {
  return binding.get().proposeCompactFounding(...args);
}
