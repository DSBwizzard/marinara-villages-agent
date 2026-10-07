import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { ConnectionSettings } from "./connection-service.js";
const binding = createActivationBinding<ConnectionSettings>("Villages connection settings are not configured.");
export function configureConnectionSettings(service: ConnectionSettings): () => void {
  return binding.configure(bindActivationService(service));
}
export async function readVillageConnectionSettings(
  ...args: Parameters<ConnectionSettings["readVillageConnectionSettings"]>
): ReturnType<ConnectionSettings["readVillageConnectionSettings"]> {
  return binding.get().readVillageConnectionSettings(...args);
}
export async function saveVillageConnectionSettings(
  ...args: Parameters<ConnectionSettings["saveVillageConnectionSettings"]>
): ReturnType<ConnectionSettings["saveVillageConnectionSettings"]> {
  return binding.get().saveVillageConnectionSettings(...args);
}
export async function validateVillageSetupConnections(
  ...args: Parameters<ConnectionSettings["validateVillageSetupConnections"]>
): ReturnType<ConnectionSettings["validateVillageSetupConnections"]> {
  return binding.get().validateVillageSetupConnections(...args);
}
export async function villagesConnectionIdFor(
  ...args: Parameters<ConnectionSettings["villagesConnectionIdFor"]>
): ReturnType<ConnectionSettings["villagesConnectionIdFor"]> {
  return binding.get().villagesConnectionIdFor(...args);
}
export async function villagesImageConnectionChoice(
  ...args: Parameters<ConnectionSettings["villagesImageConnectionChoice"]>
): ReturnType<ConnectionSettings["villagesImageConnectionChoice"]> {
  return binding.get().villagesImageConnectionChoice(...args);
}
export async function saveVillageConnections(
  ...args: Parameters<ConnectionSettings["saveVillageConnections"]>
): ReturnType<ConnectionSettings["saveVillageConnections"]> {
  return binding.get().saveVillageConnections(...args);
}
