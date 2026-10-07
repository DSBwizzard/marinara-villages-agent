import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { VenueCommands } from "./venue-service.js";

export type { VillageVenueDeletionDependencies, VenueCommands } from "./venue-service.js";

// Transitional dispatch for existing routes. The factory owns command behavior;
// runtime and queue isolation are separate parts of the activation migration.
const commandsBinding = createActivationBinding<VenueCommands>("Villages Venue commands are not configured.");
export function configureVenueCommands(commands: VenueCommands): () => void {
  return commandsBinding.configure(bindActivationService(commands));
}
export function venueCommands(): VenueCommands {
  return commandsBinding.get();
}

export function imageTarget(...args: Parameters<VenueCommands["imageTarget"]>) {
  return venueCommands().imageTarget(...args);
}

export function setVillageVenues(...args: Parameters<VenueCommands["setVillageVenues"]>) {
  return venueCommands().setVillageVenues(...args);
}
export function setVillageVenueImage(...args: Parameters<VenueCommands["setVillageVenueImage"]>) {
  return venueCommands().setVillageVenueImage(...args);
}
export function assertVenueImageAccess(...args: Parameters<VenueCommands["assertVenueImageAccess"]>) {
  return venueCommands().assertVenueImageAccess(...args);
}
export function setVillageHomeBuildingNames(...args: Parameters<VenueCommands["setVillageHomeBuildingNames"]>) {
  return venueCommands().setVillageHomeBuildingNames(...args);
}
export function previewVillageVenueDeletion(...args: Parameters<VenueCommands["previewVillageVenueDeletion"]>) {
  return venueCommands().previewVillageVenueDeletion(...args);
}
export function createVillageVenue(...args: Parameters<VenueCommands["createVillageVenue"]>) {
  return venueCommands().createVillageVenue(...args);
}
export function changeVenueAccess(...args: Parameters<VenueCommands["changeVenueAccess"]>) {
  return venueCommands().changeVenueAccess(...args);
}
export function updateVillageVenue(...args: Parameters<VenueCommands["updateVillageVenue"]>) {
  return venueCommands().updateVillageVenue(...args);
}
export function deleteVillageVenue(...args: Parameters<VenueCommands["deleteVillageVenue"]>) {
  return venueCommands().deleteVillageVenue(...args);
}
