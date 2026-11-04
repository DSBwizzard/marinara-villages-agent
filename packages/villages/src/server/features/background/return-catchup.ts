import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { createReturnCatchup } from "./return-catchup-service.js";

type Service = ReturnType<typeof createReturnCatchup>;
const binding = createActivationBinding<Service>("Village catch-up is not configured.");
export function configureReturnCatchup(service: Service) {
  return binding.configure(bindActivationService(service));
}
export function prepareReturnCatchup(...args: Parameters<Service["prepare"]>) {
  return binding.get().prepare(...args);
}
export function recordReturnVisibility(...args: Parameters<Service["recordVisible"]>) {
  return binding.get().recordVisible(...args);
}
export function advanceReturnCatchup() {
  return binding.get().advance();
}
export function retryReturnCatchup(...args: Parameters<Service["retry"]>) {
  return binding.get().retry(...args);
}
export function continueReturnCatchup(...args: Parameters<Service["continueToVillage"]>) {
  return binding.get().continueToVillage(...args);
}
