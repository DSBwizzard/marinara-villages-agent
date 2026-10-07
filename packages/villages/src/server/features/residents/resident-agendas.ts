import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { ResidentAgendas } from "./resident-agenda-service.js";
const binding = createActivationBinding<ResidentAgendas>("Resident Agendas are not configured.");
export function configureResidentAgendas(service: ResidentAgendas): () => void {
  return binding.configure(bindActivationService(service));
}
export async function rollActiveAgendas(...args: Parameters<ResidentAgendas["rollActiveAgendas"]>) {
  return binding.get().rollActiveAgendas(...args);
}
export async function queueVillagerAgenda(...args: Parameters<ResidentAgendas["queueVillagerAgenda"]>) {
  return binding.get().queueVillagerAgenda(...args);
}
export async function backfillAgendas(...args: Parameters<ResidentAgendas["backfillAgendas"]>) {
  return binding.get().backfillAgendas(...args);
}
export async function refreshVillagerRemaps(...args: Parameters<ResidentAgendas["refreshVillagerRemaps"]>) {
  return binding.get().refreshVillagerRemaps(...args);
}
export async function buildVillageAgendas(...args: Parameters<ResidentAgendas["buildVillageAgendas"]>) {
  return binding.get().buildVillageAgendas(...args);
}
export async function clearVillagerAgenda(...args: Parameters<ResidentAgendas["clearVillagerAgenda"]>) {
  return binding.get().clearVillagerAgenda(...args);
}
export async function correctCompletedWish(...args: Parameters<ResidentAgendas["correctCompletedWish"]>) {
  return binding.get().correctCompletedWish(...args);
}
export async function setVillagerScheduleInfluence(
  ...args: Parameters<ResidentAgendas["setVillagerScheduleInfluence"]>
) {
  return binding.get().setVillagerScheduleInfluence(...args);
}
