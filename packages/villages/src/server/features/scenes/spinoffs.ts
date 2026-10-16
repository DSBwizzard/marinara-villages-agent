import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { Spinoffs } from "./spinoff-service.js";
const binding = createActivationBinding<Spinoffs>("Spinoffs are not configured.");
export function configureSpinoffs(service: Spinoffs) {
  return binding.configure(bindActivationService(service));
}
export function spinoffs() {
  return binding.get();
}
