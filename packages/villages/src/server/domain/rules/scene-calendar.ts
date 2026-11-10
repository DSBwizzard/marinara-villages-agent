import { z } from "zod";
import { ZonedDate, validTimeZone } from "../../../shared/helpers/zoned-date.js";
import { asRecord } from "./coerce.js";
import { badGateway } from "./errors.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";
import type { VenueScene } from "../models/scene-model.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
export const sceneDateKey = (date: Date) =>
  String(date.getFullYear()).padStart(4, "0") +
  "-" +
  String(date.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(date.getDate()).padStart(2, "0");
const dateKey = sceneDateKey;
/** The encounter calendar is supplied by code, never inferred from transcript prose. */
export function capturedSceneCalendar(
  scene: Pick<VenueScene, "startedAt" | "sceneAttendance" | "continuity">,
  timeZone: string,
) {
  const instant = scene.continuity?.capturedAt ?? scene.sceneAttendance?.capturedAt ?? scene.startedAt;
  if (!validTimeZone(timeZone)) timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const local = new ZonedDate(instant, timeZone);
  if (!Number.isFinite(local.getTime()))
    throw badGateway("The saved encounter calendar is invalid. Your draft is preserved.");
  return {
    instant,
    date: dateKey(local),
    weekday: VILLAGE_WEEKDAYS[(local.getDay() + 6) % 7]!,
    time: `${String(local.getHours()).padStart(2, "0")}:${String(local.getMinutes()).padStart(2, "0")}`,
    timeZone,
  };
}

/** The model identifies the intended day; code performs calendar arithmetic. */
export function sceneAppointment(value: Record<string, unknown>, calendar: { date: string; weekday: string }) {
  const when = asRecord(value.when);
  if (Object.keys(value).some((key) => !["source", "quote", "when", "minute"].includes(key)))
    throw badGateway("The appointment includes unsupported fields. Your draft is preserved.");
  let date = calendar.date;
  if (typeof when.date === "string" && Object.keys(when).length === 1) date = when.date;
  else {
    let offset: number;
    if (
      Object.keys(when).length === 1 &&
      Number.isSafeInteger(when.dayOffset) &&
      Math.abs(Number(when.dayOffset)) <= 3660
    )
      offset = Number(when.dayOffset);
    else if (
      Object.keys(when).every((key) => ["weekday", "afterToday"].includes(key)) &&
      VILLAGE_WEEKDAYS.includes(when.weekday as (typeof VILLAGE_WEEKDAYS)[number]) &&
      (when.afterToday === undefined || typeof when.afterToday === "boolean")
    ) {
      offset =
        (VILLAGE_WEEKDAYS.indexOf(when.weekday as (typeof VILLAGE_WEEKDAYS)[number]) -
          VILLAGE_WEEKDAYS.indexOf(calendar.weekday as (typeof VILLAGE_WEEKDAYS)[number]) +
          7) %
        7;
      if (!offset && when.afterToday === true) offset = 7;
    } else throw badGateway("The appointment has no supported day. Your draft is preserved.");
    const day = new Date(calendar.date + "T12:00:00.000Z");
    day.setUTCDate(day.getUTCDate() + offset);
    date = day.toISOString().slice(0, 10);
  }
  return { source: value.source, quote: value.quote, date, minute: value.minute ?? null };
}

const calendar = z
  .object({
    instant: z.string().refine((value) => Number.isFinite(Date.parse(value))),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    weekday: z.enum(VILLAGE_WEEKDAYS),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    timeZone: z.string().refine(validTimeZone),
  })
  .strict();
export function readSceneCalendar(raw: unknown) {
  const value = calendar.parse(raw);
  memoryRequire(
    memoryHash(value) === memoryHash(capturedSceneCalendar({ startedAt: value.instant }, value.timeZone)),
    "captured calendar identity changed",
  );
  return value;
}
