import type { VillageAgenda, VillageAgendaBlock, VillageVenue } from "../models/world.js";
import { composeAgenda } from "./agenda-composition.js";
import { routineDay } from "./owned-routine.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";

export const agendaDateKey = (at: Date): string =>
  `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, "0")}-${String(at.getDate()).padStart(2, "0")}`;

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
        .flatMap((entry) => {
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
              ...block(start as number, end as number, venueId, activity),
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

export function agendaBlocksFor(agenda: VillageAgenda, at: Date): VillageAgendaBlock[] {
  const key = agendaDateKey(at);
  const weekday = VILLAGE_WEEKDAYS[(at.getDay() + 6) % 7]!;
  const ordinary =
    agenda.activeDay?.dateKey === key
      ? agenda.activeDay.blocks
      : (agenda.plannedDays?.[key] ??
        (agenda.routineProfile
          ? routineDay(
              agenda.routineProfile,
              agenda.generatedAt || agenda.routineSummary,
              at,
              agenda.scheduleInfluenceSnapshot,
              {
                version: 1,
                enabled: agenda.scheduleInfluenceSnapshot?.enabled === true,
                categories: {
                  rhythm: true,
                  busyFree: true,
                  weekdayWeekend: true,
                  interests: true,
                  establishedEntities: true,
                },
              },
            )
          : undefined) ??
        agenda.week?.[weekday] ??
        agenda.day.map((entry) => ({
          ...block(entry.startMinute, entry.endMinute, entry.venueId, entry.activity),
          zoneId: entry.zoneId,
        })));
  return composeAgenda(ordinary, [
    ...(agenda.socialActivities ?? [])
      .filter((activity) => activity.dateKey === key)
      .map((activity) => ({
        ...activity,
        id: activity.wishId,
        source: "social" as const,
        replaces: "flexible" as const,
      })),
    ...(agenda.reservations ?? []).filter((reservation) => reservation.dateKey === key),
  ]);
}
