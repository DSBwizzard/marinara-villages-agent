import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import { draftNewVenueProject, draftRenovationProject } from "../projects/project-lifecycle.js";
import { createVenueMailRules, type VenueMailRules } from "./venue-mail-rules-service.js";
import type { VenueMailbox } from "./venue-mailbox-service.js";
const binding = createActivationBinding<VenueMailbox>("Villages Venue mailbox is not configured.");
const queues = createVenueMailRules({ draftNewVenueProject, draftRenovationProject });
export function configureVenueMailbox(service: VenueMailbox): () => void {
  return binding.configure(
    bindActivationService({ ...service, mailBackgroundHandler: bindActivationService(service.mailBackgroundHandler) }),
  );
}
export function venueMailbox(): VenueMailbox {
  return binding.get();
}
export async function proposeVenueChange(
  ...args: Parameters<VenueMailbox["proposeVenueChange"]>
): ReturnType<VenueMailbox["proposeVenueChange"]> {
  return binding.get().proposeVenueChange(...args);
}
export async function proposePlayerMove(
  ...args: Parameters<VenueMailbox["proposePlayerMove"]>
): ReturnType<VenueMailbox["proposePlayerMove"]> {
  return binding.get().proposePlayerMove(...args);
}
export async function recordVillagerVenueImprovement(
  ...args: Parameters<VenueMailbox["recordVillagerVenueImprovement"]>
): ReturnType<VenueMailbox["recordVillagerVenueImprovement"]> {
  return binding.get().recordVillagerVenueImprovement(...args);
}
export async function decideVillagerVenueImprovement(
  ...args: Parameters<VenueMailbox["decideVillagerVenueImprovement"]>
): ReturnType<VenueMailbox["decideVillagerVenueImprovement"]> {
  return binding.get().decideVillagerVenueImprovement(...args);
}
export async function respondDueVenueMail(
  ...args: Parameters<VenueMailbox["respondDueVenueMail"]>
): ReturnType<VenueMailbox["respondDueVenueMail"]> {
  return binding.get().respondDueVenueMail(...args);
}
export function queueSharedMoveConsent(
  ...args: Parameters<VenueMailRules["queueSharedMoveConsent"]>
): ReturnType<VenueMailRules["queueSharedMoveConsent"]> {
  return queues.queueSharedMoveConsent(...args);
}
export function queueVenueCounteroffer(
  ...args: Parameters<VenueMailRules["queueVenueCounteroffer"]>
): ReturnType<VenueMailRules["queueVenueCounteroffer"]> {
  return queues.queueVenueCounteroffer(...args);
}
