import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { SceneArchive } from "./archive-service.js";
const binding = createActivationBinding<SceneArchive>("Scene archive is not configured.");
export function configureSceneArchive(service: SceneArchive): () => void {
  return binding.configure(bindActivationService(service));
}
export async function listVenueVisits(...args: Parameters<SceneArchive["listVenueVisits"]>) {
  return binding.get().listVenueVisits(...args);
}
export async function readVenueVisit(...args: Parameters<SceneArchive["readVenueVisit"]>) {
  return binding.get().readVenueVisit(...args);
}
export async function resetVenueSessions(...args: Parameters<SceneArchive["resetVenueSessions"]>) {
  return binding.get().resetVenueSessions(...args);
}
