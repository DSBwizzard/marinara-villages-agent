import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
export function localRelationshipDate(at: string, timeZone?: string): string {
  const date = timeZone ? new ZonedDate(at, timeZone) : new Date(at);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
