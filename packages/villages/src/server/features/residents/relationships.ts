import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { RelationshipService } from "./relationship-service.js";
const binding = createActivationBinding<RelationshipService>("Villages relationships service is not configured.");
export function configureRelationships(service: RelationshipService): () => void {
  return binding.configure(bindActivationService(service));
}

export async function readRelationshipsView(
  ...args: Parameters<RelationshipService["readRelationshipsView"]>
): ReturnType<RelationshipService["readRelationshipsView"]> {
  return binding.get().readRelationshipsView(...args);
}

export async function changeRelationshipCreator(
  ...args: Parameters<RelationshipService["changeRelationshipCreator"]>
): ReturnType<RelationshipService["changeRelationshipCreator"]> {
  return binding.get().changeRelationshipCreator(...args);
}
