import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { ProjectLifecycle } from "./project-lifecycle-service.js";
export { draftNewVenueProject, draftRenovationProject } from "./project-drafts.js";
const binding = createActivationBinding<ProjectLifecycle>("Project lifecycle service is not configured.");
export function configureProjectLifecycle(service: ProjectLifecycle): () => void {
  return binding.configure(bindActivationService(service));
}
export async function createNewVenueProject(
  ...args: Parameters<ProjectLifecycle["createNewVenueProject"]>
): Promise<void> {
  return binding.get().createNewVenueProject(...args);
}
export async function placeNewVenueProject(
  ...args: Parameters<ProjectLifecycle["placeNewVenueProject"]>
): Promise<void> {
  return binding.get().placeNewVenueProject(...args);
}
export async function createRenovationProject(
  ...args: Parameters<ProjectLifecycle["createRenovationProject"]>
): Promise<void> {
  return binding.get().createRenovationProject(...args);
}
export async function requestProjectMailbox(
  ...args: Parameters<ProjectLifecycle["requestProjectMailbox"]>
): Promise<void> {
  return binding.get().requestProjectMailbox(...args);
}
export async function lockProjectBuilder(...args: Parameters<ProjectLifecycle["lockProjectBuilder"]>): Promise<void> {
  return binding.get().lockProjectBuilder(...args);
}
export async function acceptProjectRequirements(
  ...args: Parameters<ProjectLifecycle["acceptProjectRequirements"]>
): Promise<void> {
  return binding.get().acceptProjectRequirements(...args);
}
export async function deliverProjectMaterial(
  ...args: Parameters<ProjectLifecycle["deliverProjectMaterial"]>
): Promise<void> {
  return binding.get().deliverProjectMaterial(...args);
}
export async function startProjectConstruction(
  ...args: Parameters<ProjectLifecycle["startProjectConstruction"]>
): Promise<void> {
  return binding.get().startProjectConstruction(...args);
}
export async function debugCompleteProjectConstruction(
  ...args: Parameters<ProjectLifecycle["debugCompleteProjectConstruction"]>
): Promise<void> {
  return binding.get().debugCompleteProjectConstruction(...args);
}
export async function openFinishedProject(...args: Parameters<ProjectLifecycle["openFinishedProject"]>): Promise<void> {
  return binding.get().openFinishedProject(...args);
}
export async function reviseRenovationProject(
  ...args: Parameters<ProjectLifecycle["reviseRenovationProject"]>
): Promise<void> {
  return binding.get().reviseRenovationProject(...args);
}
export async function renewRenovationApprovals(
  ...args: Parameters<ProjectLifecycle["renewRenovationApprovals"]>
): Promise<void> {
  return binding.get().renewRenovationApprovals(...args);
}
