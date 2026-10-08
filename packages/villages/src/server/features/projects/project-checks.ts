import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { ProjectChecks } from "./project-check-service.js";
const binding = createActivationBinding<ProjectChecks>("Project checks service is not configured.");
export function configureProjectChecks(service: ProjectChecks): () => void {
  return binding.configure(bindActivationService(service));
}
export async function interpretProjectDraft(...args: Parameters<ProjectChecks["interpretProjectDraft"]>) {
  return binding.get().interpretProjectDraft(...args);
}
export async function finalizeProjectDiagnostics(...args: Parameters<ProjectChecks["finalizeProjectDiagnostics"]>) {
  return binding.get().finalizeProjectDiagnostics(...args);
}
export async function applyProjectPickup(...args: Parameters<ProjectChecks["applyProjectPickup"]>) {
  return binding.get().applyProjectPickup(...args);
}
