import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { Development } from "./development-service.js";
const binding = createActivationBinding<Development>("Resident development is not configured.");
export function configureDevelopment(service: Development) {
  return binding.configure(bindActivationService(service));
}
export function inspectDevelopment() {
  return binding.get().inspectDevelopment();
}
export function setDevelopment(enabled: unknown) {
  return binding.get().setDevelopment(enabled);
}
export function reconcileDevelopment(now?: Date, actionId?: string) {
  return binding.get().reconcileDevelopment(now, actionId);
}
