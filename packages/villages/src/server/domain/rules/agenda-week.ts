import type { VillageAgenda, VillageAgendaBlock, VillageVenue } from "../models/world.js";
import { composeAgenda } from "./agenda-composition.js";
import {
  fixedRestAgendaBlock,
  flexibleAgendaBlock,
  normalizeAgendaNap,
  scheduledAgendaActivity,
} from "./agenda-flexibility.js";
import { calendarAt } from "../../../shared/helpers/zoned-date.js";
import { routineDay } from "./owned-routine.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";

export { agendaDateKey } from "../../../shared/helpers/calendar-day.js";
import { agendaDateKey } from "../../../shared/helpers/calendar-day.js";

const block = (startMinute: number, endMinute: number, venueId: string, activity: string): VillageAgendaBlock => ({
  startMinute,
  endMinute,
  venueId,
  activity,
});

/** A complete, varied week exists before any model or schedule is consulted. */
export function workingAgendaWeek(): Record<string, VillageAgendaBlock[]> {
  return Object.fromEntries(
    VILLAGE_WEEKDAYS.map((weekday) => [
      weekday,
      [
        {
          startMinute: 0,
          endMinute: 1440,
          venueId: "",
          activity: "Taking care of their own affairs",
          flexible: true,
        },
      ],
    ]),
  ) as Record<string, VillageAgendaBlock[]>;
}

/** Preserve valid proposed intervals and fill every gap with the working week. */
export function completeAgendaWeek(
  proposed: unknown,
  fallback: Record<string, VillageAgendaBlock[]>,
  venues?: readonly VillageVenue[],
): Record<string, VillageAgendaBlock[]> {
  const source =
    proposed && typeof proposed === "object" && !Array.isArray(proposed) ? (proposed as Record<string, unknown>) : {};
  const validPlaces = new Set(venues?.map((venue) => venue.id));
  return Object.fromEntries(
    VILLAGE_WEEKDAYS.map((weekday) => {
      const raw = Array.isArray(source[weekday]) ? (source[weekday] as unknown[]) : [];
      const candidates = raw
        .flatMap((entry): VillageAgendaBlock[] => {
          if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
          const row = entry as Record<string, unknown>;
          const start = row.startMinute;
          const end = row.endMinute;
          const activity = typeof row.activity === "string" ? row.activity.trim().slice(0, 240) : "";
          if (
            !Number.isInteger(start) ||
            !Number.isInteger(end) ||
            (start as number) < 0 ||
            (end as number) > 1440 ||
            (start as number) >= (end as number) ||
            !activity
          )
            return [];
          const venueId =
            typeof row.venueId === "string" && (venues === undefined || validPlaces.has(row.venueId))
              ? row.venueId
              : "";
          return [
            {
              ...block(start as number, end as number, venueId, normalizeAgendaNap(activity)),
              ...(row.restKind === "sleep" || row.restKind === "other" || row.restKind === "nap"
                ? { restKind: row.restKind }
                : {}),
              zoneId: typeof row.zoneId === "string" ? row.zoneId : undefined,
              ...(row.essential === true ? { essential: true } : {}),
              ...(typeof row.commitmentId === "string" ? { commitmentId: row.commitmentId } : {}),
              flexible: row.flexible === true,
            },
          ];
        })
        .sort((a, b) => a.startMinute - b.startMinute)
        .slice(0, 1440);
      const result: VillageAgendaBlock[] = [];
      let cursor = 0;
      for (const candidate of candidates) {
        if (candidate.startMinute < cursor) continue;
        if (candidate.startMinute > cursor)
          result.push(...fillFromFallback(fallback[weekday]!, cursor, candidate.startMinute));
        result.push(candidate);
        cursor = candidate.endMinute;
      }
      if (cursor < 1440) result.push(...fillFromFallback(fallback[weekday]!, cursor, 1440));
      return [weekday, result];
    }),
  ) as Record<string, VillageAgendaBlock[]>;
}

function fillFromFallback(fallback: VillageAgendaBlock[], start: number, end: number): VillageAgendaBlock[] {
  return fallback.flatMap((entry) => {
    const from = Math.max(start, entry.startMinute);
    const to = Math.min(end, entry.endMinute);
    return from < to ? [{ ...entry, startMinute: from, endMinute: to }] : [];
  });
}

const intersects = (a: VillageAgendaBlock, b: Pick<VillageAgendaBlock, "startMinute" | "endMinute">) =>
  a.startMinute < b.endMinute && b.startMinute < a.endMinute;

function withRecurringRest(
  agenda: VillageAgenda,
  key: string,
  base: readonly VillageAgendaBlock[],
  blocks: VillageAgendaBlock[],
  restoreAfter: number,
) {
  const windows = base.filter(
    (block) => (block.restKind || block.activity === "Sleeping") && !flexibleAgendaBlock(block),
  );
  if (!windows.length || agenda.repairedDays?.includes(key)) return blocks;
  let result = blocks;
  // Existing commitments keep their times when composing a dated plan with recurring sleep.
  const commitments = (agenda.reservations ?? []).filter((entry) => entry.dateKey === key && entry.source !== "work");
  const protectedBlocks = result.filter((block) => !flexibleAgendaBlock(block) || fixedRestAgendaBlock(block));
  for (const window of windows) {
    if (window.endMinute <= restoreAfter) continue;
    let pieces = [{ ...window, startMinute: Math.max(window.startMinute, restoreAfter) }];
    for (const occupied of [...protectedBlocks, ...commitments])
      pieces = pieces.flatMap((part) => withoutInterval(part, occupied));
    for (const piece of pieces) {
      result = result.flatMap((block) => withoutInterval(block, piece));
      result.push(piece);
    }
  }
  return result === blocks ? blocks : result.sort((a, b) => a.startMinute - b.startMinute);
}

export function activeAgendaSleep(agenda: VillageAgenda | null, now: Date) {
  const day = agenda?.activeDay;
  if (!agenda?.calendarVersion || !day || day.dateKey !== agendaDateKey(now)) return;
  const minute = now.getHours() * 60 + now.getMinutes();
  const activeBlocks = composeAgenda(
    day.blocks,
    (agenda.reservations ?? []).filter((reservation) => reservation.dateKey === day.dateKey),
  );
  const current = activeBlocks.find(({ startMinute, endMinute }) => minute >= startMinute && minute < endMinute);
  const blocks = withRecurringRest(
    agenda,
    day.dateKey,
    agenda.week?.[day.weekday] ?? [],
    day.blocks,
    current && scheduledAgendaActivity(current) ? current.endMinute : minute,
  );
  if (blocks !== day.blocks) return blocks;
}

function withoutInterval(block: VillageAgendaBlock, interval: Pick<VillageAgendaBlock, "startMinute" | "endMinute">) {
  if (!intersects(block, interval)) return [block];
  return [
    ...(block.startMinute < interval.startMinute ? [{ ...block, endMinute: interval.startMinute }] : []),
    ...(block.endMinute > interval.endMinute ? [{ ...block, startMinute: interval.endMinute }] : []),
  ];
}

export function ordinaryAgendaBlocksFor(agenda: VillageAgenda, at: Date, activating = false): VillageAgendaBlock[] {
  const key = agendaDateKey(at);
  const weekday = VILLAGE_WEEKDAYS[(at.getDay() + 6) % 7]!;
  const influence = !agenda.calendarVersion ? agenda.scheduleInfluenceSnapshot : undefined;
  const blocks =
    agenda.activeDay?.dateKey === key
      ? agenda.activeDay.blocks
      : (agenda.plannedDays?.[key] ??
        (agenda.calendarVersion && agenda.routineProfile?.baseWeek ? agenda.week?.[weekday] : undefined) ??
        (agenda.routineProfile
          ? routineDay(agenda.routineProfile, agenda.generatedAt || agenda.routineSummary, at, influence, {
              version: 1,
              enabled: influence?.enabled === true,
              categories: {
                rhythm: true,
                busyFree: true,
                weekdayWeekend: true,
                interests: true,
                establishedEntities: true,
              },
            })
          : undefined) ??
        agenda.week?.[weekday] ??
        agenda.day.map((entry) => ({
          ...block(entry.startMinute, entry.endMinute, entry.venueId, entry.activity),
          zoneId: entry.zoneId,
        })));
  return agenda.calendarVersion === 1 && (agenda.activeDay ? key > agenda.activeDay.dateKey : activating)
    ? withRecurringRest(agenda, key, agenda.week?.[weekday] ?? [], blocks, 0)
    : blocks;
}

export function bookedAgendaDays(agenda: VillageAgenda, now: Date) {
  const today = agendaDateKey(now);
  const dates = new Set(
    (agenda.reservations ?? [])
      .filter((row) => row.source !== "work" && row.dateKey >= today)
      .map((row) => row.dateKey),
  );
  return Object.fromEntries([...dates].map((key) => [key, ordinaryAgendaBlocksFor(agenda, calendarAt(now, key, 720))]));
}

export function agendaBlocksFor(agenda: VillageAgenda, at: Date): VillageAgendaBlock[] {
  return composeAgenda(
    ordinaryAgendaBlocksFor(agenda, at),
    (agenda.reservations ?? []).filter((reservation) => reservation.dateKey === agendaDateKey(at)),
  );
}
