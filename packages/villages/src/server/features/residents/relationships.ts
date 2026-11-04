import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { RelationshipService } from "./relationship-service.js";
const binding = createActivationBinding<RelationshipService>("Villages relationships service is not configured.");
export async function clarifyRelationships(
  ...args: Parameters<RelationshipService["clarifyRelationships"]>
): ReturnType<RelationshipService["clarifyRelationships"]> {
  return binding.get().clarifyRelationships(...args);
}
export function configureRelationships(service: RelationshipService): () => void {
  return binding.configure(bindActivationService(service));
}
export async function readRelationshipsView(
  ...args: Parameters<RelationshipService["readRelationshipsView"]>
): ReturnType<RelationshipService["readRelationshipsView"]> {
  return binding.get().readRelationshipsView(...args);
}
export async function readRelationshipsInspect(
  ...args: Parameters<RelationshipService["readRelationshipsInspect"]>
): ReturnType<RelationshipService["readRelationshipsInspect"]> {
  return binding.get().readRelationshipsInspect(...args);
}
