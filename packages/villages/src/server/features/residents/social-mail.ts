import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { SocialMailService } from "./social-mail-service.js";
const binding = createActivationBinding<SocialMailService>("Personal mail is not configured.");
export function configureSocialMail(service: SocialMailService): () => void {
  return binding.configure(bindActivationService(service));
}
export function socialMail(): SocialMailService {
  return binding.get();
}
export function processPersonalMailOutbox(...args: Parameters<SocialMailService["processOutbox"]>) {
  return binding.get().processOutbox(...args);
}
