import type { SceneTurnOutcome } from "../../../shared/contracts/scene-turn-outcome.js";
import { ZonedDate, calendarAt, validTimeZone } from "../../../shared/helpers/zoned-date.js";
import { asRecord } from "./coerce.js";
import { badGateway, VillagesRequestError } from "./errors.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";
import type { VenueScene } from "../models/scene-model.js";

/** The encounter calendar is supplied by code, never inferred from transcript prose. */
export function capturedSceneCalendar(scene: VenueScene, timeZone: string) {
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

/** Expected preacceptance result; never a provider failure or fictional event. */
export class HaltedSceneTurn extends Error {
  constructor(readonly outcome: SceneTurnOutcome) {
    super(outcome);
  }
}

export type SceneBoundaryFinding = { source: "player" | "draft"; outcome: SceneTurnOutcome };

export class GeneratedSceneBoundary extends VillagesRequestError {
  constructor(readonly outcome: SceneTurnOutcome) {
    super(502, "The generated reply exceeded what Villages can support. Retry.");
  }
}

export const SCENE_OUTCOME_BOUNDARY =
  "Cards and lore establish identity and abilities, not authority over Village state. Completed outcomes must fit authoritative Scene facts and supported consequences. Ordinary actions and compatible supernatural effects need no dedicated numerical mechanic. Do not complete death, resurrection, permanent incapacity, time travel, calendar rewrites or large elapsed activity skips without a supported mechanic. Judge actual consequences, including history, time, lasting conditions, agency, movement and witnesses; calling an effect local does not exempt them. Do not invent suppressed powers or compulsory reluctance. Preserve requests, attempts, threats, beliefs and hypotheticals as such; never disguise an unsupported completed outcome as a dream, failed spell or dialogue.";

/** Source attribution is semantic; code checks exact evidence and routes recovery. */
export function readSceneBoundary(
  value: unknown,
  context: { chosenAt: string; timeZone: string },
  message: string,
  lines: readonly { content: string; speakerId?: string }[],
): SceneBoundaryFinding | null {
  const raw = asRecord(value);
  const sourceOf = (row: Record<string, unknown>): "player" | "draft" => {
    if (row.source !== "player" && row.source !== "draft")
      throw badGateway("The Scene boundary check lacks a source. Your input is saved.");
    return row.source;
  };
  const scoped = (row: Record<string, unknown>, appointments: unknown[]) => {
    const source = sourceOf(row);
    const outcome = readSceneHalt(
      { ...row, appointments },
      context,
      source === "player" ? message : "",
      source === "draft" ? lines.filter((line) => line.speakerId !== "player") : [],
    );
    return outcome ? { source, outcome } : null;
  };
  if (raw.reason !== "none" && sourceOf(raw) === "player") return scoped(raw, []);
  if (!Array.isArray(raw.appointments) || raw.appointments.length > 12)
    throw badGateway("The Scene calendar check is incomplete. Your input is saved.");
  const appointments = raw.appointments.map(asRecord);
  appointments.forEach(sourceOf);
  let finding: SceneBoundaryFinding | null = null;
  for (const row of appointments
    .filter((row) => row.source === "player")
    .concat(appointments.filter((row) => row.source === "draft"))) {
    const result = scoped({ reason: "none", source: row.source }, [row]);
    finding ??= result;
  }
  if (finding?.source === "player") return finding;
  if (raw.reason !== "none") return scoped(raw, []) ?? finding;
  // Retain the original shape validation even for a successful empty report.
  readSceneHalt({ ...raw, appointments: [] }, context, message, lines);
  return finding;
}

function dateKey(date: Date): string {
  return `${String(date.getFullYear()).padStart(4, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function readSceneHalt(
  value: unknown,
  context: { chosenAt: string; timeZone: string },
  message: string,
  lines: readonly { content: string }[],
): SceneTurnOutcome | null {
  const raw = asRecord(value);
  const cited = (quote: unknown) =>
    typeof quote === "string" &&
    quote.length > 0 &&
    quote.length <= 600 &&
    (message.includes(quote) || lines.some((line) => line.content.includes(quote)));
  const reasons: Record<string, SceneTurnOutcome> = {
    time: "halt-time",
    activity: "halt-time",
    condition: "halt-state",
    world: "halt-world",
  };
  if (typeof raw.reason !== "string" || !["none", ...Object.keys(reasons)].includes(raw.reason))
    throw badGateway("The Scene boundary check is incomplete. Your draft is preserved.");
  if (raw.reason !== "none") {
    if (!cited(raw.quote))
      throw badGateway("The Scene boundary check lacks current evidence. Your draft is preserved.");
    return reasons[raw.reason];
  }
  if (!Array.isArray(raw.appointments) || raw.appointments.length > 12)
    throw badGateway("The Scene calendar check is incomplete. Your draft is preserved.");
  const chosen = new ZonedDate(context.chosenAt, context.timeZone);
  if (!Number.isFinite(chosen.getTime())) throw badGateway("The saved Scene choice time is invalid.");
  for (const value of raw.appointments) {
    const row = asRecord(value);
    if (
      !cited(row.quote) ||
      typeof row.date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/u.test(row.date) ||
      (row.minute !== null && (!Number.isInteger(row.minute) || Number(row.minute) < 0 || Number(row.minute) > 1439))
    )
      throw badGateway("The Scene calendar check has an invalid date or source. Your draft is preserved.");
    const target = calendarAt(chosen, row.date, row.minute === null ? 720 : Number(row.minute));
    if (dateKey(target) !== row.date) throw badGateway("The Scene calendar date is invalid. Your draft is preserved.");
    if (row.minute === null ? row.date < dateKey(chosen) : target.getTime() <= chosen.getTime())
      return "halt-appointment";
  }
  return null;
}
