import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { SceneWriting } from "./writing-service.js";
export type { SceneReply } from "./writing-service.js";
export { VENUE_REPLY_MAX_TOKENS } from "./writing-service.js";
const binding = createActivationBinding<SceneWriting>("Scene writing service is not configured.");
export function configureSceneWriting(service: SceneWriting): () => void {
  return binding.configure(bindActivationService(service));
}
export async function prepareVenueTurnMessages(...args: Parameters<SceneWriting["prepareVenueTurnMessages"]>) {
  return binding.get().prepareVenueTurnMessages(...args);
}
export async function interpretRoomDraft(...args: Parameters<SceneWriting["interpretRoomDraft"]>) {
  return binding.get().interpretRoomDraft(...args);
}
export async function generate(...args: Parameters<SceneWriting["generate"]>) {
  return binding.get().generate(...args);
}
export async function generateContactResponse(...args: Parameters<SceneWriting["generateContactResponse"]>) {
  return binding.get().generateContactResponse(...args);
}
export function explicitSceneActions(...args: Parameters<SceneWriting["explicitSceneActions"]>) {
  return binding.get().explicitSceneActions(...args);
}
