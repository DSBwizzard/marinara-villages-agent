import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { RelationshipStoreService } from "./relationship-store-service.js";
const binding = createActivationBinding<RelationshipStoreService>(
  "Villages relationship-store service is not configured.",
);
export function configureRelationshipStore(service: RelationshipStoreService): () => void {
  return binding.configure(bindActivationService(service));
}

export async function readRelationshipState(
  ...args: Parameters<RelationshipStoreService["readRelationshipState"]>
): ReturnType<RelationshipStoreService["readRelationshipState"]> {
  return binding.get().readRelationshipState(...args);
}

export async function mutateRelationships(
  ...args: Parameters<RelationshipStoreService["mutateRelationships"]>
): ReturnType<RelationshipStoreService["mutateRelationships"]> {
  return binding.get().mutateRelationships(...args);
}

export async function persistRelationshipAuthority(
  ...args: Parameters<RelationshipStoreService["persistRelationshipAuthority"]>
): ReturnType<RelationshipStoreService["persistRelationshipAuthority"]> {
  return binding.get().persistRelationshipAuthority(...args);
}
