import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { InterpretationSettingsService } from "./interpretation-settings-service.js";
export { coerceInterpretationSettings, type InterpretationSettings } from "../../domain/rules/interpretation-policy.js";
const binding = createActivationBinding<InterpretationSettingsService>(
  "Villages interpretation settings are not configured.",
);
export function configureInterpretationSettings(service: InterpretationSettingsService): () => void {
  return binding.configure(bindActivationService(service));
}
export async function readInterpretationSettings(
  ...args: Parameters<InterpretationSettingsService["readInterpretationSettings"]>
): ReturnType<InterpretationSettingsService["readInterpretationSettings"]> {
  return binding.get().readInterpretationSettings(...args);
}
export async function saveInterpretationSettings(
  ...args: Parameters<InterpretationSettingsService["saveInterpretationSettings"]>
): ReturnType<InterpretationSettingsService["saveInterpretationSettings"]> {
  return binding.get().saveInterpretationSettings(...args);
}
