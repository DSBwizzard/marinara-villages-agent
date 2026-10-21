import {
  EMPTY_RESIDENT_ADMISSION,
  readResidentAdmission,
  type ResidentAdmission,
} from "../../../shared/helpers/resident-admission.js";
import { badRequest } from "./errors.js";
export {
  renderResidentAdmission,
  admissionLoreContext,
  RESIDENT_CONTINUITY_RULE,
} from "../../../shared/helpers/resident-admission.js";
export function readFoundingResidentAdmissions(
  value: unknown,
  roster: readonly string[],
): Record<string, ResidentAdmission> {
  if (value !== undefined && (!value || typeof value !== "object" || Array.isArray(value)))
    throw badRequest("Starting situations must be keyed by selected character.");
  const input = (value ?? {}) as Record<string, unknown>;
  if (Object.keys(input).some((id) => !roster.includes(id)))
    throw badRequest("Starting situations must belong to selected founding villagers.");
  const result: Record<string, ResidentAdmission> = Object.create(null);
  for (const id of roster) {
    const admission = Object.hasOwn(input, id) ? readResidentAdmission(input[id]) : { ...EMPTY_RESIDENT_ADMISSION };
    if (!admission)
      throw badRequest("Use a homeworld within 120 characters and starting situation within 1,200 characters.");
    result[id] = admission;
  }
  return result;
}
