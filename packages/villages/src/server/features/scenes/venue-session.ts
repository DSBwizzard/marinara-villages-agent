import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { SceneCommands } from "./command-service.js";

export type {
  VenueLine,
  VenueParticipant,
  SceneAttendance,
  VenueSubmission,
  VenueMemory,
  VenueRecollection,
  VenueRecordEvent,
  VenueScene,
  VenueSession,
  ActiveVenue,
  GreetingTrace,
  VenueReplyFailureKind,
  VenueReplyLine,
  SavedAccessEvent,
} from "../../domain/models/scene-model.js";

export { venueCardProfile } from "../../domain/rules/venue-writing.js";
const binding = createActivationBinding<SceneCommands>("Scene commands are not configured.");
export function configureSceneCommands(service: SceneCommands): () => void {
  return binding.configure(bindActivationService(service));
}
export async function retrySceneChangeInterpretation(
  ...args: Parameters<SceneCommands["retrySceneChangeInterpretation"]>
) {
  return binding.get().retrySceneChangeInterpretation(...args);
}
export async function moveVenueZone(...args: Parameters<SceneCommands["moveVenueZone"]>) {
  return binding.get().moveVenueZone(...args);
}
export function enterVenue(...args: Parameters<SceneCommands["enterVenue"]>) {
  return binding.get().enterVenue(...args);
}
export async function enterResidencePrivateSpace(...args: Parameters<SceneCommands["enterResidencePrivateSpace"]>) {
  return binding.get().enterResidencePrivateSpace(...args);
}
export async function greetVenue(...args: Parameters<SceneCommands["greetVenue"]>) {
  return binding.get().greetVenue(...args);
}
export async function continueVenueWithoutGreeting(...args: Parameters<SceneCommands["continueVenueWithoutGreeting"]>) {
  return binding.get().continueVenueWithoutGreeting(...args);
}
export async function sendVenueTurn(...args: Parameters<SceneCommands["sendVenueTurn"]>) {
  return binding.get().sendVenueTurn(...args);
}
export async function leaveVenueSession(...args: Parameters<SceneCommands["leaveVenueSession"]>) {
  return binding.get().leaveVenueSession(...args);
}
export async function recordRoomAccessEvents(...args: Parameters<SceneCommands["recordRoomAccessEvents"]>) {
  return binding.get().recordRoomAccessEvents(...args);
}
export async function recordSpokenInvitation(...args: Parameters<SceneCommands["recordSpokenInvitation"]>) {
  return binding.get().recordSpokenInvitation(...args);
}
export async function endVenueSession(...args: Parameters<SceneCommands["endVenueSession"]>) {
  return binding.get().endVenueSession(...args);
}
export async function endVenueSessionWithReceipts(...args: Parameters<SceneCommands["endVenueSessionWithReceipts"]>) {
  return binding.get().endVenueSessionWithReceipts(...args);
}
export async function closeVenueSession(...args: Parameters<SceneCommands["closeVenueSession"]>) {
  return binding.get().closeVenueSession(...args);
}
export async function closeVenueSessionWithReceipts(
  ...args: Parameters<SceneCommands["closeVenueSessionWithReceipts"]>
) {
  return binding.get().closeVenueSessionWithReceipts(...args);
}
export async function discardVenueVisitDebug(...args: Parameters<SceneCommands["discardVenueVisitDebug"]>) {
  return binding.get().discardVenueVisitDebug(...args);
}
export async function recoverVenueSceneWork(...args: Parameters<SceneCommands["recoverVenueSceneWork"]>) {
  return binding.get().recoverVenueSceneWork(...args);
}
export function sceneReplayEffects(...args: Parameters<SceneCommands["sceneReplayEffects"]>) {
  return binding.get().sceneReplayEffects(...args);
}
