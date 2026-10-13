import { badRequest } from "./errors.js";
export function readSceneryStyleProfileId(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string" || !/^[a-zA-Z0-9_-]{0,80}$/.test(value))
    throw badRequest("Choose an image style profile from Engine settings.");
  return value;
}
