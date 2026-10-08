import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";

import type { InterpretationService } from "./interpretation-service.js";

const binding = createActivationBinding<InterpretationService>("Villages interpretation is not configured.");

export function configureInterpretation(service: InterpretationService): () => void {
  return binding.configure(bindActivationService(service));
}

export async function interpretChecks(
  ...args: Parameters<InterpretationService["interpretChecks"]>
): ReturnType<InterpretationService["interpretChecks"]> {
  return binding.get().interpretChecks(...args);
}

export async function recordInterpretationRouting(
  ...args: Parameters<InterpretationService["recordInterpretationRouting"]>
): ReturnType<InterpretationService["recordInterpretationRouting"]> {
  return binding.get().recordInterpretationRouting(...args);
}
