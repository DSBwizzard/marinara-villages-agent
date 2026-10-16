import { bindActivationService, createActivationBinding } from "../adapters/engine/activation-scope.js";
import type { PrivateSpacePreparationService } from "./private-space-service.js";
export { privatePreparationKey, privatePreparationRooms } from "./private-space-service.js";
const preparationBinding = createActivationBinding<PrivateSpacePreparationService>(
  "Villages private-space preparation is not configured.",
);
export function configurePrivateSpacePreparation(service: PrivateSpacePreparationService): () => void {
  return preparationBinding.configure(bindActivationService(service));
}
export function preparePrivateSpaces(signal?: AbortSignal): Promise<void> {
  return preparationBinding.get().preparePrivateSpaces(signal);
}
export async function retryPrivateSpaces(): Promise<void> {
  return preparationBinding.get().retryPrivateSpaces();
}
export function startPrivateSpacePreparation(): () => void {
  return preparationBinding.get().startPrivateSpacePreparation();
}
