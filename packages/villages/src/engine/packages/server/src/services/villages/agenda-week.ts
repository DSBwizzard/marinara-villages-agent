import { parseBlockRange, type NativeWeekSchedule } from "./native-schedules.js";
import { lookupRemap, remapBlockKey } from "./native-remap.js";
import { hashString, VILLAGE_WEEKDAYS } from "./village-clock.js";
import { routineRevision } from "./wish-policy.js";
import type { VillageAgenda, VillageAgendaBlock, VillageRemap, VillageVenue } from "./types.js";

export const agendaDateKey = (at: Date): string =>
  `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, "0")}-${String(at.getDate()).padStart(2, "0")}`;

const status = (value: unknown): VillageAgendaBlock["status"] =>
  value === "online" || value === "idle" || value === "dnd" || value === "offline" ? value : "idle";

const reasonFor = (activity: string): string =>
  /sleep|rest/i.test(activity)
    ? "To rest"
    : /eat|meal|breakfast|dinner/i.test(activity)
      ? "To eat"
      : "Part of their daily life";

const block = (
  startMinute: number,
  endMinute: number,
  venueId: string,
  activity: string,
  reason?: string,
  availability?: unknown,
): VillageAgendaBlock => ({
  startMinute,
  endMinute,
  venueId,
  activity,
  reason: reason?.trim() || reasonFor(activity),
  status: status(availability),
});

/** A complete, varied week exists before any model or schedule is consulted. */
export function workingAgendaWeek(venues: readonly VillageVenue[], name: string): Record<string, VillageAgendaBlock[]> {
  const places = venues.filter((venue) => !venue.occupancy.playerHome && !venue.occupancy.residentCharacterId);
  return Object.fromEntries(
    VILLAGE_WEEKDAYS.map((weekday, index) => {
      const seed = hashString(`${name}:${weekday}`);
      const wake = 360 + (seed % 5) * 30;
      const sleep = 1260 + (seed % 3) * 30;
      const place = places.length ? places[(seed + index) % places.length] : null;
      const otherPlace = places.length ? places[(seed + index + 1) % places.length] : null;
      const activities = [
        ["Washing and getting dressed", "", "idle"],
        ["Making breakfast", "", "idle"],
        ["Eating breakfast", "", "idle"],
        ["Tidying the house", "", "idle"],
        ["Walking through the village", place?.id ?? "", "online"],
        [place ? `Looking around ${place.name}` : "Taking a walk", place?.id ?? "", "online"],
        [place ? `Helping with small tasks at ${place.name}` : "Taking care of small tasks", place?.id ?? "", "dnd"],
        ["Stopping for a meal", "", "idle"],
        [otherPlace ? `Visiting ${otherPlace.name}` : "Spending time outdoors", otherPlace?.id ?? "", "online"],
        ["Talking with neighbors", otherPlace?.id ?? "", "online"],
        ["Returning home", "", "idle"],
        ["Preparing supper", "", "idle"],
        ["Eating supper", "", "idle"],
        ["Reading or enjoying a quiet hobby", "", "online"],
        ["Putting things away for the night", "", "idle"],
        ["Writing a letter or keeping a journal", "", "online"],
        ["Stepping outside for fresh air", "", "online"],
        ["Sharing the day's news", "", "online"],
        ["Washing up after supper", "", "idle"],
        ["Enjoying a quiet hour at home", "", "online"],
        ["Preparing for bed", "", "idle"],
        ["Settling in with a book", "", "online"],
        ["Getting ready to sleep", "", "idle"],
      ] as const;
      const entries: VillageAgendaBlock[] = [block(0, wake, "", "Sleeping at home", "To get some rest", "offline")];
      let minute = wake;
      let slot = 0;
      while (minute < sleep) {
        const duration = (seed + slot + index) % 3 === 0 ? 30 : 60;
        const end = Math.min(sleep, minute + duration);
        const [activity, venueId, availability] = activities[slot % activities.length]!;
        entries.push({
          ...block(minute, end, venueId, activity, undefined, availability),
          flexible: availability === "online",
        });
        minute = end;
        slot += 1;
      }
      entries.push(block(sleep, 1440, "", "Sleeping at home", "To get some rest", "offline"));
      return [weekday, entries];
    }),
  ) as Record<string, VillageAgendaBlock[]>;
}

/** Keep elapsed time exactly as it was while adopting a new plan for the rest of today. */
export function replaceRemainingAgendaDay(
  previous: readonly VillageAgendaBlock[],
  next: readonly VillageAgendaBlock[],
  minute: number,
): VillageAgendaBlock[] {
  const at = Math.max(0, Math.min(1440, minute));
  return [
    ...previous
      .filter((part) => part.startMinute < at)
      .map((part) => ({ ...part, endMinute: Math.min(part.endMinute, at) })),
    ...next
      .filter((part) => part.endMinute > at)
      .map((part) => ({ ...part, startMinute: Math.max(part.startMinute, at) })),
  ].filter((part) => part.startMinute < part.endMinute);
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
              ...block(
                start as number,
                end as number,
                venueId,
                activity,
                typeof row.reason === "string" ? row.reason.slice(0, 240) : "",
                row.status,
              ),
              zoneId: typeof row.zoneId === "string" ? row.zoneId : undefined,
              flexible: row.flexible === true && (row.status === "online" || row.status === "idle"),
              ...(typeof row.sourceTime === "string" ? { sourceTime: row.sourceTime } : {}),
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

export function legacyAgendaWeek(
  agenda: VillageAgenda,
  fallback: Record<string, VillageAgendaBlock[]>,
): Record<string, VillageAgendaBlock[]> {
  if (agenda.week) return completeAgendaWeek(agenda.week, fallback);
  const day = agenda.day.map((entry) => ({
    ...block(entry.startMinute, entry.endMinute, entry.venueId, entry.activity),
    zoneId: entry.zoneId,
  }));
  if (!day.length) return fallback;
  return completeAgendaWeek(Object.fromEntries(VILLAGE_WEEKDAYS.map((weekday) => [weekday, day])), fallback);
}

/** Native slots may guide an agenda, but only the persisted village plan is read during play. */
export function scheduleInformedWeek(
  base: Record<string, VillageAgendaBlock[]>,
  native: NativeWeekSchedule,
  remap: VillageRemap | null,
): Record<string, VillageAgendaBlock[]> {
  const proposals: Record<string, VillageAgendaBlock[]> = Object.fromEntries(
    VILLAGE_WEEKDAYS.map((weekday) => [weekday, []]),
  );
  for (const [index, weekday] of VILLAGE_WEEKDAYS.entries()) {
    for (const entry of native.days[weekday] ?? []) {
      const range = parseBlockRange(entry.time);
      if (!range) continue;
      const key = remapBlockKey(weekday, entry.time);
      const move = remap?.moves.find((candidate) => remapBlockKey(candidate.day, candidate.time) === key);
      const translated = lookupRemap(remap, key);
      const add = (day: string, start: number, end: number) => {
        if (start >= end) return;
        const villageBlock = base[day]?.find(
          (candidate) => candidate.startMinute <= start && candidate.endMinute > start,
        );
        proposals[day]!.push({
          ...block(
            start,
            end,
            move?.venueId ?? villageBlock?.venueId ?? "",
            translated || villageBlock?.activity || "Taking care of ordinary things",
            villageBlock?.reason,
            entry.status,
          ),
          sourceTime: entry.time,
          flexible: move?.flexible === true && entry.status !== "dnd" && entry.status !== "offline",
          zoneId:
            move?.zoneId ??
            (move?.venueId && move.venueId !== villageBlock?.venueId ? undefined : villageBlock?.zoneId),
        });
      };
      if (range.end > range.start) {
        add(weekday, range.start, range.end);
      } else {
        add(weekday, range.start, 1440);
        add(VILLAGE_WEEKDAYS[(index + 1) % VILLAGE_WEEKDAYS.length]!, 0, range.end);
      }
    }
  }
  return Object.fromEntries(
    VILLAGE_WEEKDAYS.map((weekday) => {
      return [weekday, completeAgendaWeek({ [weekday]: proposals[weekday] }, base)[weekday]];
    }),
  ) as Record<string, VillageAgendaBlock[]>;
}

export function agendaBlocksFor(agenda: VillageAgenda, ingestSchedule: boolean, at: Date): VillageAgendaBlock[] {
  const key = agendaDateKey(at);
  const weekday = VILLAGE_WEEKDAYS[(at.getDay() + 6) % 7]!;
  let ordinary =
    agenda.activeDay?.dateKey === key
      ? agenda.activeDay.blocks
      : ((ingestSchedule ? agenda.scheduleWeek?.[weekday] : undefined) ??
        agenda.week?.[weekday] ??
        agenda.day.map((entry) => ({
          ...block(entry.startMinute, entry.endMinute, entry.venueId, entry.activity),
          zoneId: entry.zoneId,
        })));
  const revision = routineRevision(agenda);
  for (const adjustment of [...(agenda.wishActivities ?? []), ...(agenda.socialActivities ?? [])]) {
    if (adjustment.dateKey !== key) continue;
    const started = agenda.activeDay?.dateKey === key && adjustment.startMinute <= at.getHours() * 60 + at.getMinutes();
    if (adjustment.baseRevision !== revision && !started) continue;
    ordinary = ordinary.flatMap((entry) => {
      const start = Math.max(entry.startMinute, adjustment.startMinute),
        end = Math.min(entry.endMinute, adjustment.endMinute);
      if (start >= end || !entry.flexible || entry.status === "dnd" || entry.status === "offline") return [entry];
      return [
        ...(entry.startMinute < start ? [{ ...entry, endMinute: start }] : []),
        {
          ...entry,
          startMinute: start,
          endMinute: end,
          venueId: adjustment.venueId,
          zoneId: adjustment.zoneId,
          activity: adjustment.activity,
          reason: adjustment.reason,
        },
        ...(entry.endMinute > end ? [{ ...entry, startMinute: end }] : []),
      ];
    });
  }
  const work = agenda.projectWork;
  if (!work) return ordinary;
  const dayStart = new Date(at.getFullYear(), at.getMonth(), at.getDate()).getTime();
  const dayEnd = new Date(at.getFullYear(), at.getMonth(), at.getDate() + 1).getTime();
  const start = Math.max(dayStart, Date.parse(work.startsAt));
  const end = Math.min(dayEnd, Date.parse(work.endsAt));
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) return ordinary;
  const from = Math.max(0, Math.floor((start - dayStart) / 60_000));
  const through = Math.min(1440, Math.ceil((end - dayStart) / 60_000));
  const remaining = ordinary.flatMap((entry) => {
    if (entry.endMinute <= from || entry.startMinute >= through) return [entry];
    return [
      ...(entry.startMinute < from ? [{ ...entry, endMinute: from }] : []),
      ...(entry.endMinute > through ? [{ ...entry, startMinute: through }] : []),
    ];
  });
  const essential = ordinary
    .filter(
      (entry) =>
        /\b(?:sleep|rest|meal|breakfast|lunch|dinner|eat|wash|bathe)\b/iu.test(entry.activity) ||
        entry.endMinute <= 360 ||
        entry.startMinute >= 1320,
    )
    .map((entry) => ({
      ...entry,
      startMinute: Math.max(from, entry.startMinute),
      endMinute: Math.min(through, entry.endMinute),
    }))
    .filter((entry) => entry.endMinute > entry.startMinute)
    .sort((left, right) => left.startMinute - right.startMinute);
  const workBlocks: VillageAgendaBlock[] = [];
  let cursor = from;
  for (const breakBlock of essential) {
    if (breakBlock.startMinute > cursor)
      workBlocks.push({
        startMinute: cursor,
        endMinute: breakBlock.startMinute,
        venueId: work.venueId,
        zoneId: work.zoneId ?? "exterior",
        activity: "Build the agreed venue",
        reason: "Committed project work order",
        status: "online",
      });
    workBlocks.push(breakBlock);
    cursor = Math.max(cursor, breakBlock.endMinute);
  }
  if (cursor < through)
    workBlocks.push({
      startMinute: cursor,
      endMinute: through,
      venueId: work.venueId,
      zoneId: work.zoneId ?? "exterior",
      activity: "Build the agreed venue",
      reason: "Committed project work order",
      status: "online",
    });
  return [...remaining, ...workBlocks].sort((left, right) => left.startMinute - right.startMinute);
}
