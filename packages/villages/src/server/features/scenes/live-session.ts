import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { LiveScenes } from "./live-session-service.js";
const binding = createActivationBinding<LiveScenes>("Live Scene service is not configured.");
export function configureLiveScenes(service: LiveScenes): () => void {
  return binding.configure(bindActivationService(service));
}
export async function activeVenueSession(...args: Parameters<LiveScenes["activeVenueSession"]>) {
  return binding.get().activeVenueSession(...args);
}
export async function requireLiveVenueSession(...args: Parameters<LiveScenes["requireLiveVenueSession"]>) {
  return binding.get().requireLiveVenueSession(...args);
}
export async function touchVenueSession(...args: Parameters<LiveScenes["touchVenueSession"]>) {
  return binding.get().touchVenueSession(...args);
}
export async function refreshZoneParticipants(...args: Parameters<LiveScenes["refreshZoneParticipants"]>) {
  return binding.get().refreshZoneParticipants(...args);
}
