import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";

import type { SystemInterpretation } from "./system-interpretation-service.js";

const binding = createActivationBinding<SystemInterpretation>("Villages System interpretation is not configured.");

export function configureSystemInterpretation(service: SystemInterpretation): () => void {
  return binding.configure(bindActivationService(service));
}

export async function systemInterpretations(
  ...args: Parameters<SystemInterpretation["systemInterpretations"]>
): ReturnType<SystemInterpretation["systemInterpretations"]> {
  return binding.get().systemInterpretations(...args);
}
