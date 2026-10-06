import {
  DEFAULT_RESIDENT_FOUNDING_CONTEXT,
  readResidentFoundingContext,
  type ResidentFoundingContext,
} from "../../../../shared/src/villages/resident-founding-context.js";
import { badRequest } from "./errors.js";

export {
  renderResidentFoundingContext,
  RESIDENT_CONTINUITY_RULE,
} from "../../../../shared/src/villages/resident-founding-context.js";
export function readFoundingResidentContexts(
  value: unknown,
  roster: readonly string[],
): Record<string, ResidentFoundingContext> {
  if (value !== undefined && (!value || typeof value !== "object" || Array.isArray(value)))
    throw badRequest("Resident backgrounds must be keyed by selected character.");
  const input = (value ?? {}) as Record<string, unknown>;
  if (Object.keys(input).some((id) => !roster.includes(id)))
    throw badRequest("Resident backgrounds must belong to selected founding villagers.");
  const result: Record<string, ResidentFoundingContext> = Object.create(null);
  for (const id of roster) {
    const context = Object.hasOwn(input, id)
      ? readResidentFoundingContext(input[id])
      : { ...DEFAULT_RESIDENT_FOUNDING_CONTEXT };
    if (!context)
      throw badRequest(
        "Choose a valid resident history and story position, describe Custom, and keep backgrounds within their text limits.",
      );
    result[id] = context;
  }
  return result;
}
