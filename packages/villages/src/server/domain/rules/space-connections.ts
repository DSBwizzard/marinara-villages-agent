import { connectionProblem, materializeConnections } from "../../../shared/helpers/zone-contact.js";
import type { VillageVenueZone } from "../models/world.js";
import { badRequest } from "./errors.js";
export function readConnectionIds(value: unknown): string[] {
  if (
    !Array.isArray(value) ||
    value.length > 64 ||
    value.some((id) => typeof id !== "string" || !id || id.length > 200) ||
    new Set(value).size !== value.length
  )
    throw badRequest("List distinct connected space IDs.");
  return value as string[];
}
export function validateConnections(zones: VillageVenueZone[]) {
  const problem = connectionProblem(zones);
  if (problem) throw badRequest(problem);
}
export function materializedLayout(zones: VillageVenueZone[]) {
  const result = materializeConnections(zones);
  validateConnections(result);
  return result;
}
