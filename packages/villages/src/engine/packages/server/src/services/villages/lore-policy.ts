import { badRequest } from "./errors.js";

export const MAX_BOOKS = 24;
export const DEFAULT_LORE_TOKEN_BUDGET = 1_600;
export const MIN_LORE_TOKEN_BUDGET = 200;
export const MAX_LORE_TOKEN_BUDGET = 3_200;
export function readLoreTokenBudget(value: unknown): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < MIN_LORE_TOKEN_BUDGET ||
    value > MAX_LORE_TOKEN_BUDGET
  )
    throw badRequest(`Lorebook token budget must be between ${MIN_LORE_TOKEN_BUDGET} and ${MAX_LORE_TOKEN_BUDGET}.`);
  return value;
}
export function coerceLoreTokenBudget(value: unknown): number {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= MIN_LORE_TOKEN_BUDGET &&
    value <= MAX_LORE_TOKEN_BUDGET
    ? value
    : DEFAULT_LORE_TOKEN_BUDGET;
}
export function readSelectedLorebookIds(value: unknown): string[] {
  if (!Array.isArray(value) || value.length > MAX_BOOKS) throw badRequest(`Choose at most ${MAX_BOOKS} lorebooks.`);
  const ids = value.map((id) => (typeof id === "string" ? id.trim() : ""));
  if (ids.some((id) => !id || id.length > 160)) throw badRequest("Lorebook IDs must be valid text.");
  return [...new Set(ids)];
}
export function coerceSelectedLorebookIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value
        .filter((id): id is string => typeof id === "string")
        .map((id) => id.trim())
        .filter((id) => id.length > 0 && id.length <= 160),
    ),
  ].slice(0, MAX_BOOKS);
}
