import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { ScenarioImprintService } from "./scenario-imprint-service.js";
const binding = createActivationBinding<ScenarioImprintService>("Villages scenario-imprint service is not configured.");
export function configureScenarioImprint(service: ScenarioImprintService): () => void {
  return binding.configure(bindActivationService(service));
}

export async function draftScenarioImprint(
  ...args: Parameters<ScenarioImprintService["draftScenarioImprint"]>
): ReturnType<ScenarioImprintService["draftScenarioImprint"]> {
  return binding.get().draftScenarioImprint(...args);
}
