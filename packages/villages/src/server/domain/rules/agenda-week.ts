import type { VillageAgenda, VillageAgendaBlock, VillageVenue } from "../models/world.js";
import { composeAgenda, type CapturedAgendaShape } from "./agenda-composition.js";
import {
  fixedRestAgendaBlock,
  flexibleAgendaBlock,
  normalizeAgendaNap,
  readAgendaPurpose,
  scheduledAgendaActivity,
} from "./agenda-flexibility.js";
import { calendarAt } from "../../../shared/helpers/zoned-date.js";
import { routineDay } from "./owned-routine.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";

export { agendaDateKey } from "../../../shared/helpers/calendar-day.js";
import { agendaDateKey } from "../../../shared/helpers/calendar-day.js";
import { AGENDA_WEEK_DAYS } from "../../../shared/contracts/agenda.js";

const block = (startMinute: number, endMinute: number, venueId: string, activity: string): VillageAgendaBlock => ({
  startMinute,
  endMinute,
  venueId,
  activity,
});

const openDay = (): VillageAgendaBlock[] => [
  {
    ...block(0, 1440, "", "Taking care of their own affairs"),
    purpose: "unplanned",
    flexible: true,
  },
];

/** Open intervals can receive dated plans and commitments. */
export function workingAgendaWeek(): Record<string, VillageAgendaBlock[]> {
  return Object.fromEntries(VILLAGE_WEEKDAYS.map((weekday) => [weekday, openDay()]));
}

export function agendaReadyOn(agenda: VillageAgenda | null, date: string): boolean {
  if (!agenda) return false;
  if ((agenda.starterWeekThrough ?? "") >= date && (agenda.starterWeekFrom ?? "") <= date) return true;
  if (agenda.weeklyFrom && agenda.weeklyThrough && agenda.weeklyFrom <= date && agenda.weeklyThrough >= date)
    return true;
  const manual = agenda.manualWeek;
  if (!manual || manual.through < date) return false;
  const through = Date.parse(manual.through);
  if (!Number.isFinite(through)) return false;
  const from = manual.from ?? new Date(through - (AGENDA_WEEK_DAYS - 1) * 86_400_000).toISOString().slice(0, 10);
  return from <= date;
}

export function agendaTracksDatedPlans(agenda: VillageAgenda | null): boolean {
  return !!(
    agenda?.calendarVersion === 1 &&
    (agenda.starterWeekFrom ||
      agenda.starterWeekThrough ||
      agenda.manualWeek ||
      agenda.weeklyThrough ||
      agenda.personalizationPending)
  );
}

export function agendaPersonalPlansPending(agenda: VillageAgenda, date: string): boolean {
  return agendaTracksDatedPlans(agenda) && !agendaReadyOn(agenda, date);
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
              ...(readAgendaPurpose(row.purpose) ? { purpose: readAgendaPurpose(row.purpose) } : {}),
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
  if (agendaPersonalPlansPending(agenda, day.dateKey)) return;
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

export function ordinaryAgendaBlocksFor(
  agenda: VillageAgenda,
  at: Date,
  activating = false,
  captured = false,
): VillageAgendaBlock[] {
  const key = agendaDateKey(at);
  const weekday = VILLAGE_WEEKDAYS[(at.getDay() + 6) % 7]!;
  const dated = agenda.activeDay?.dateKey === key ? agenda.activeDay.blocks : agenda.plannedDays?.[key];
  const pending = agendaPersonalPlansPending(agenda, key);
  const preserved = agenda.repairedDays?.includes(key) || (agenda.activeDay && key < agenda.activeDay.dateKey);
  // Old saves may already have written copies of the starter week into dated rows.
  if (!captured && agendaTracksDatedPlans(agenda) && (!dated || (pending && !preserved))) {
    const sleep = (agenda.week?.[weekday] ?? []).filter(
      (row) => row.restKind === "sleep" || (row.activity === "Sleeping" && !flexibleAgendaBlock(row)),
    );
    return withRecurringRest(agenda, key, sleep, openDay(), 0);
  }
  const influence = !agenda.calendarVersion ? agenda.scheduleInfluenceSnapshot : undefined;
  const blocks =
    dated ??
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
      ...(entry.purpose ? { purpose: entry.purpose } : {}),
      zoneId: entry.zoneId,
    }));
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

export function agendaBlocksFor(
  agenda: VillageAgenda,
  at: Date,
  capturedShape?: CapturedAgendaShape,
): VillageAgendaBlock[] {
  const blocks = composeAgenda(
    ordinaryAgendaBlocksFor(agenda, at),
    (agenda.reservations ?? []).filter((reservation) => reservation.dateKey === agendaDateKey(at)),
    capturedShape,
  );
  if (capturedShape !== "untyped-joined") return blocks;
  return blocks.map(({ purpose, ...row }) =>
    purpose === "unplanned" && row.activity === "Taking care of their own affairs" ? row : { ...row, purpose },
  );
}
