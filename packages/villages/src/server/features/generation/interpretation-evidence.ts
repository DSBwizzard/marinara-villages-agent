import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";

import type { InterpretationEvidenceService } from "./interpretation-evidence-service.js";

const binding = createActivationBinding<InterpretationEvidenceService>(
  "Villages saved interpretation evidence is not configured.",
);

export function configureInterpretationEvidence(service: InterpretationEvidenceService): () => void {
  return binding.configure(bindActivationService(service));
}

export async function contextualChecks(
  ...args: Parameters<InterpretationEvidenceService["contextualChecks"]>
): ReturnType<InterpretationEvidenceService["contextualChecks"]> {
  return binding.get().contextualChecks(...args);
}

export async function saveInterpretationContext(
  ...args: Parameters<InterpretationEvidenceService["saveInterpretationContext"]>
): ReturnType<InterpretationEvidenceService["saveInterpretationContext"]> {
  return binding.get().saveInterpretationContext(...args);
}
