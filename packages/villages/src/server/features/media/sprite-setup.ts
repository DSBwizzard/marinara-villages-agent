import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { createSpriteSetup } from "./sprite-setup-service.js";
const binding = createActivationBinding<ReturnType<typeof createSpriteSetup>>("Sprite setup is not configured.");
export function configureSpriteSetup(service: ReturnType<typeof createSpriteSetup>) {
  return binding.configure(bindActivationService(service));
}
export function spriteSetup() {
  return binding.get();
}
export function preparedSpriteManager(id: string, revision?: number) {
  return spriteSetup().preparedManager(id, revision);
}
