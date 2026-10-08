import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { RelationshipSocialService } from "./relationship-social-service.js";
const binding = createActivationBinding<RelationshipSocialService>(
  "Villages relationship-social service is not configured.",
);
export function configureRelationshipSocial(service: RelationshipSocialService): () => void {
  return binding.configure(bindActivationService(service));
}

export async function processSocialOutbox(
  ...args: Parameters<RelationshipSocialService["processSocialOutbox"]>
): ReturnType<RelationshipSocialService["processSocialOutbox"]> {
  return binding.get().processSocialOutbox(...args);
}
