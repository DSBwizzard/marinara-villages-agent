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
export async function listVenueVisitSummaries(...args: Parameters<SceneArchive["listVenueVisitSummaries"]>) {
  return binding.get().listVenueVisitSummaries(...args);
}
export async function deleteVenueVisit(...args: Parameters<SceneArchive["deleteVenueVisit"]>) {
  return binding.get().deleteVenueVisit(...args);
}
export async function deleteAllVenueVisits(...args: Parameters<SceneArchive["deleteAllVenueVisits"]>) {
  return binding.get().deleteAllVenueVisits(...args);
}
export async function setVenueVisitRetention(...args: Parameters<SceneArchive["setVenueVisitRetention"]>) {
  return binding.get().setVenueVisitRetention(...args);
}
export async function pruneVenueVisits(...args: Parameters<SceneArchive["pruneVenueVisits"]>) {
  return binding.get().pruneVenueVisits(...args);
}
