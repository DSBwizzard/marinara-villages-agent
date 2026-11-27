import { calendarAt, ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { badRequest } from "./errors.js";
export function repairLocalTime(instant: string | null | undefined, zone: string): string {
  if (!instant) return "";
  zone ||= Intl.DateTimeFormat().resolvedOptions().timeZone;
  const date = new ZonedDate(instant, zone),
    two = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}T${two(date.getHours())}:${two(date.getMinutes())}`;
}
export function repairInstant(value: unknown, zone: string): string | null {
  zone ||= Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (value === "") return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T[0-2]\d:[0-5]\d$/.test(value))
    throw badRequest("Choose a valid Village date and time.");
  const [date, time] = value.split("T"),
    [hour, minute] = time!.split(":").map(Number);
  const instant = calendarAt(new ZonedDate(0, zone), date!, hour! * 60 + minute!);
  if (!Number.isFinite(instant.getTime()) || repairLocalTime(instant.toISOString(), zone) !== value)
    throw badRequest("That local time does not exist. Choose another time.");
  return instant.toISOString();
}
