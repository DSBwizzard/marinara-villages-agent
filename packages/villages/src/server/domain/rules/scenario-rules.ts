import type { VillageScenarioImprint } from "../models/world.js";
import { asTrimmedString } from "./coerce.js";
import { badRequest } from "./errors.js";

export const LIMITS = { origin: 400, worldFacts: 160, openingConditions: 160, visualCues: 120 } as const;
export const MAX_ITEMS = 4;
export type ListKey = "worldFacts" | "openingConditions" | "visualCues";
export function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}
export function lines(value: unknown, key: ListKey, strict: boolean): string[] {
  if (strict && !Array.isArray(value)) throw badRequest(`Scenario ${key} must be a list.`);
  if (!Array.isArray(value)) return [];
  if (strict && value.length > MAX_ITEMS) throw badRequest(`Scenario ${key} can have at most four entries.`);
  if (strict && value.some((item: unknown) => typeof item !== "string" || item.length > LIMITS[key]))
    throw badRequest(`Scenario ${key} entries must be short text.`);
  return value
    .slice(0, MAX_ITEMS)
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, LIMITS[key]))
    .filter(Boolean);
}
export function readScenarioImprint(value: unknown): VillageScenarioImprint {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw badRequest("Review the starting details.");
  const raw = record(value);
  if (typeof raw.origin !== "string" || raw.origin.length > LIMITS.origin)
    throw badRequest("Scenario origin can be at most 400 characters.");
  for (const key of ["worldFacts", "openingConditions", "visualCues"] as const) {
    if (
      !Array.isArray(raw[key]) ||
      raw[key].some((item: unknown) => typeof item !== "string" || item.length > LIMITS[key])
    )
      throw badRequest(`Scenario ${key} entries must be short text.`);
  }
  const imprint: VillageScenarioImprint = {
    origin: raw.origin.trim(),
    worldFacts: lines(raw.worldFacts, "worldFacts", true),
    openingConditions: lines(raw.openingConditions, "openingConditions", true),
    visualCues: lines(raw.visualCues, "visualCues", true),
  };
  if (!imprint.origin && !imprint.worldFacts.length && !imprint.openingConditions.length && !imprint.visualCues.length)
    throw badRequest("Add at least one starting detail.");
  return imprint;
}
export function coerceScenarioImprint(value: unknown): VillageScenarioImprint | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = record(value);
  const imprint: VillageScenarioImprint = {
    origin: asTrimmedString(raw.origin).slice(0, LIMITS.origin),
    worldFacts: lines(raw.worldFacts, "worldFacts", false),
    openingConditions: lines(raw.openingConditions, "openingConditions", false),
    visualCues: lines(raw.visualCues, "visualCues", false),
  };
  return imprint.origin || imprint.worldFacts.length || imprint.openingConditions.length || imprint.visualCues.length
    ? imprint
    : null;
}
export function readWorldFacts(value: unknown): string[] {
  return lines(value, "worldFacts", true);
}
export function coerceWorldFacts(value: unknown): string[] {
  return lines(value, "worldFacts", false);
}
