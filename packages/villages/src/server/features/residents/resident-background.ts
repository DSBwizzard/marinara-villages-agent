import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { createResidentBackgrounds } from "./resident-background-service.js";
const binding = createActivationBinding<ReturnType<typeof createResidentBackgrounds>>(
  "Resident backstories are not configured.",
);
export function configureResidentBackgrounds(service: ReturnType<typeof createResidentBackgrounds>): () => void {
  const release = binding.configure(bindActivationService(service));
  return () => {
    service.stop();
    release();
  };
}
export function draftResidentBackground(value: unknown) {
  return binding.get().draftResidentBackground(value);
}
