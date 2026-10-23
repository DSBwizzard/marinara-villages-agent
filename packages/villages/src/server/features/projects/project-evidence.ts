import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { ProjectEvidence } from "./project-evidence-service.js";

const binding = createActivationBinding<ProjectEvidence>("Project evidence service is not configured.");
export function configureProjectEvidence(service: ProjectEvidence): () => void {
  return binding.configure(bindActivationService(service));
}
export async function recordProjectSpokenEvidence(...args: Parameters<ProjectEvidence["recordProjectSpokenEvidence"]>) {
  return binding.get().recordProjectSpokenEvidence(...args);
}
export async function processProjectSpeechTurn(...args: Parameters<ProjectEvidence["processProjectSpeechTurn"]>) {
  return binding.get().processProjectSpeechTurn(...args);
}
export async function listProjectEvidenceCandidates(
  ...args: Parameters<ProjectEvidence["listProjectEvidenceCandidates"]>
) {
  return binding.get().listProjectEvidenceCandidates(...args);
}
