import type { VillageAgenda, VillageAgendaBlock, VillageState, VillageVillager } from "../models/world.js";
import { flexibleAgendaBlock } from "./agenda-flexibility.js";
import type { NativeWeekSchedule } from "./schedule-rules.js";
import { canOccupyZone, chooseAgendaZone, venueZones, zoneClosed } from "./venue-zones.js";
import { backgroundRevision } from "./background-revision.js";
import { hashString, VILLAGE_WEEKDAYS } from "./village-clock.js";
import { calendarAt } from "../../../shared/helpers/zoned-date.js";

export const INFLUENCE_CATEGORIES = [
  "rhythm",
  "busyFree",
  "weekdayWeekend",
  "interests",
  "establishedEntities",
] as const;
export type InfluenceCategory = (typeof INFLUENCE_CATEGORIES)[number];
export type ScheduleInfluence = { version: 1; enabled: boolean; categories: Record<InfluenceCategory, boolean> };
export type InfluenceSnapshot = {
  version: 1;
  signature: string;
  available: boolean;
  enabled: boolean;
  rhythms: { weekday: string; startMinute: number; endMinute: number }[];
  busy: { weekday: string; part: number; free?: boolean }[];
  patterns?: { weekend: boolean; busy: boolean }[];
  interests: string[];
  entities: string[];
  adopted: string[];
  unresolved: string[];
};
export type RoutineActivity = Omit<VillageAgendaBlock, "startMinute" | "endMinute"> & {
  duration: number;
  parts: number[];
  essential: boolean;
};
export type RoutineProfile = {
  semanticVersion: 2;
  influence?: InfluenceSnapshot;
  influenceSource?: string;
  version: 1;
  activities: RoutineActivity[];
  days: number[][];
  rhythm: { startMinute: number; endMinute: number; activity: number }[];
  /** Exact authored intervals for provisional and manually repaired routines. */
  baseWeek?: Record<string, VillageAgendaBlock[]>;
};

/** Weekly refresh dates are not authored schedule changes. */
export const scheduleSemanticSource = (schedule: NativeWeekSchedule | null, settings: ScheduleInfluence) =>
  backgroundRevision([schedule?.characterId, schedule?.days, settings]);

export function readPreparedInfluence(value: unknown): InfluenceSnapshot | undefined {
  const raw = record(value);
  const list = (value: unknown): value is string[] =>
    Array.isArray(value) && value.length <= 64 && value.every((item) => typeof item === "string" && item.length <= 320);
  if (
    raw.version !== 1 ||
    typeof raw.enabled !== "boolean" ||
    typeof raw.available !== "boolean" ||
    typeof raw.signature !== "string" ||
    !Array.isArray(raw.rhythms) ||
    raw.rhythms.length > 21 ||
    !Array.isArray(raw.busy) ||
    raw.busy.length > 28 ||
    ![raw.interests, raw.entities, raw.adopted, raw.unresolved].every(list)
  )
    return undefined;
  if (
    raw.patterns !== undefined &&
    (!Array.isArray(raw.patterns) ||
      raw.patterns.length > 2 ||
      raw.patterns.some(
        (value) => typeof record(value).weekend !== "boolean" || typeof record(value).busy !== "boolean",
      ))
  )
    return undefined;
  if (
    raw.rhythms.some((value) => {
      const row = record(value);
      return (
        !VILLAGE_WEEKDAYS.includes(row.weekday as any) ||
        !Number.isInteger(row.startMinute) ||
        !Number.isInteger(row.endMinute) ||
        Number(row.startMinute) < 0 ||
        Number(row.startMinute) >= 1440 ||
        Number(row.endMinute) < 0 ||
        Number(row.endMinute) > 1440 ||
        row.startMinute === row.endMinute
      );
    })
  )
    return undefined;
  if (
    raw.busy.some((value) => {
      const row = record(value);
      return (
        !VILLAGE_WEEKDAYS.includes(row.weekday as any) ||
        !Number.isInteger(row.part) ||
        Number(row.part) < 0 ||
        Number(row.part) > 3 ||
        typeof row.free !== "boolean"
      );
    })
  )
    return undefined;
  return structuredClone(raw) as InfluenceSnapshot;
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
const text = (value: unknown) => (typeof value === "string" ? value.trim().slice(0, 160) : "");
const dayKey = (at: Date) =>
  `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, "0")}-${String(at.getDate()).padStart(2, "0")}`;
export function influenceSettings(value: unknown): ScheduleInfluence {
  const raw = record(value),
    categories = record(raw.categories);
  return {
    version: 1,
    enabled: raw.enabled === true,
    categories: Object.fromEntries(
      INFLUENCE_CATEGORIES.map((key) => [key, categories[key] !== false]),
    ) as ScheduleInfluence["categories"],
  };
}

export function canInterpretSchedule(agenda: VillageAgenda | null | undefined): boolean {
  return (
    agenda?.routineProfile?.semanticVersion === 2 && !agenda.personalizationPending && !agenda.personalizationFailure
  );
}

export function deriveInfluence(schedule: NativeWeekSchedule | null, resident: VillageVillager): InfluenceSnapshot {
  const settings = influenceSettings(resident.scheduleInfluence);
  const profile = resident.agenda?.routineProfile;

  const source = scheduleSemanticSource(schedule, settings);
  const saved = profile?.influenceSource === source ? profile.influence : undefined;
  return saved && settings.enabled
    ? {
        ...saved,
        enabled: true,
        available: !!schedule,
        rhythms: settings.categories.rhythm
          ? saved.rhythms
              .filter((row) => settings.categories.weekdayWeekend || row.weekday === "Monday")
              .flatMap((row) =>
                settings.categories.weekdayWeekend ? [row] : VILLAGE_WEEKDAYS.map((weekday) => ({ ...row, weekday })),
              )
          : [],
        busy: settings.categories.busyFree
          ? saved.busy
              .filter((row) => settings.categories.weekdayWeekend || row.weekday === "Monday")
              .flatMap((row) =>
                settings.categories.weekdayWeekend ? [row] : VILLAGE_WEEKDAYS.map((weekday) => ({ ...row, weekday })),
              )
          : [],
        interests: settings.categories.interests ? saved.interests : [],
        patterns: settings.categories.weekdayWeekend ? saved.patterns : [],
        entities: settings.categories.establishedEntities ? saved.entities : [],
      }
    : {
        version: 1,
        signature: source,
        available: !!schedule,
        enabled: settings.enabled,
        rhythms: [],
        busy: [],
        interests: [],
        entities: [],
        adopted: [],
        unresolved: settings.enabled && schedule ? ["Schedule interpretation pending"] : [],
      };
}

export function routineProfileFromWeek(week: Record<string, VillageAgendaBlock[]>): RoutineProfile {
  const unique = new Map<string, RoutineActivity>();
  for (const weekday of VILLAGE_WEEKDAYS)
    for (const block of week[weekday] ?? []) {
      const key = JSON.stringify([
        block.activity,
        block.venueId,
        block.zoneId,
        block.flexible,
        block.essential,
        block.commitmentId,
      ]);
      const part = Math.min(3, Math.floor(block.startMinute / 360));
      const existing = unique.get(key);
      if (existing) {
        if (!existing.parts.includes(part)) existing.parts.push(part);
        continue;
      }
      const { startMinute, endMinute, ...activity } = block;
      unique.set(key, {
        ...activity,
        duration: Math.max(30, Math.min(240, endMinute - startMinute)),
        parts: [part],
        essential: block.essential === true || !block.flexible,
      });
    }
  return {
    version: 1,
    semanticVersion: 2,
    activities: [...unique.values()].slice(0, 16),
    days: Array.from({ length: 7 }, () => []),
    rhythm: [],
    baseWeek: structuredClone(week),
  };
}

export function coerceRoutineProfile(value: unknown): RoutineProfile | undefined {
  const raw = record(value);
  if (
    raw.version !== 1 ||
    raw.semanticVersion !== 2 ||
    !Array.isArray(raw.activities) ||
    !raw.activities.length ||
    raw.activities.length > 16 ||
    !Array.isArray(raw.days) ||
    raw.days.length !== 7 ||
    !Array.isArray(raw.rhythm)
  )
    return undefined;
  const activities: RoutineActivity[] = [];
  for (const value of raw.activities) {
    const row = record(value);
    if (
      !text(row.activity) ||
      !Array.isArray(row.parts) ||
      !row.parts.length ||
      row.parts.some((part) => !Number.isInteger(part) || part < 0 || part > 3)
    )
      return undefined;
    activities.push({
      activity: text(row.activity),
      venueId: text(row.venueId),
      zoneId: text(row.zoneId) || undefined,
      flexible: row.flexible === true,
      essential: row.essential === true,
      duration: Math.max(30, Math.min(240, Number(row.duration) || 90)),
      parts: row.parts as number[],
    });
  }
  const days = raw.days as number[][];
  if (
    days.some(
      (day) =>
        !Array.isArray(day) ||
        (raw.baseWeek ? day.length > 8 : day.length !== 8) ||
        day.some((id) => !Number.isInteger(id) || id < 0 || id >= activities.length),
    )
  )
    return undefined;
  const rhythm = (raw.rhythm as unknown[]).flatMap((value) => {
    const row = record(value);
    return Number.isInteger(row.startMinute) &&
      Number.isInteger(row.endMinute) &&
      (row.startMinute as number) >= 0 &&
      (row.startMinute as number) < 1440 &&
      (row.endMinute as number) >= 0 &&
      (row.endMinute as number) <= 1440 &&
      row.startMinute !== row.endMinute &&
      Number.isInteger(row.activity) &&
      (row.activity as number) >= 0 &&
      (row.activity as number) < activities.length
      ? [row as RoutineProfile["rhythm"][number]]
      : [];
  });
  if (rhythm.length !== raw.rhythm.length || !validRoutineRhythm(rhythm)) return undefined;
  return {
    version: 1,
    semanticVersion: 2,
    influence: readPreparedInfluence(raw.influence),
    influenceSource: text(raw.influenceSource),
    activities,
    days,
    rhythm,
  };
}

/** Overnight windows are split only for validation; overlaps are invalid profiles. */
export function validRoutineRhythm(rows: RoutineProfile["rhythm"]): boolean {
  const intervals = rows
    .flatMap((row) =>
      row.endMinute > row.startMinute
        ? [{ start: row.startMinute, end: row.endMinute }]
        : [
            { start: row.startMinute, end: 1440 },
            { start: 0, end: row.endMinute },
          ],
    )
    .filter((row) => row.end > row.start)
    .sort((a, b) => a.start - b.start);
  return intervals.every((row, index) => !index || intervals[index - 1]!.end <= row.start);
}

/** No model, date-based local choices. Today's persisted plan always wins at the caller. */
export function routineDay(
  profile: RoutineProfile,
  seed: string,
  at: Date,
  influence?: InfluenceSnapshot,
  settings?: ScheduleInfluence,
): VillageAgendaBlock[] {
  const index = (at.getDay() + 6) % 7,
    weekday = VILLAGE_WEEKDAYS[index]!,
    pattern = profile.days[index] ?? [];
  const base = profile.baseWeek?.[weekday];
  const salt = hashString(`${seed}:${dayKey(at)}`);
  const enabled = settings?.enabled === true;
  const choice = (part: number, step: number): RoutineActivity => {
    let candidates = pattern
      .filter((_, position) => Math.floor(position / 2) === part)
      .map((id) => profile.activities[id]!)
      .filter(Boolean);
    if (!candidates.length) candidates = profile.activities.filter((item) => item.parts.includes(part));
    if (!candidates.length) candidates = profile.activities;
    const weekPattern = enabled ? influence?.patterns?.find((item) => item.weekend === index >= 5) : undefined;
    const busyPart =
      enabled &&
      (influence?.busy.some((item) => item.weekday === weekday && item.part === part && !item.free) ||
        weekPattern?.busy);
    const preferred = candidates.filter((item) => (busyPart ? !item.flexible : item.flexible));
    if (preferred.length && enabled && (influence?.busy.length || weekPattern)) candidates = preferred;
    const interested = enabled
      ? candidates.filter(
          (item) => influence?.interests.includes(item.activity) || influence?.entities.includes(item.venueId),
        )
      : [];
    if (interested.length && (salt + step) % 3 === 0) candidates = interested;
    return candidates[hashString(seed + ":" + dayKey(at) + ":choice:" + part + ":" + step) % candidates.length]!;
  };
  if (base) {
    const retained = base.map((block) => ({ ...block }));
    const preference = enabled ? influence?.rhythms.find((item) => item.weekday === weekday) : undefined;
    if (preference)
      for (let index = 1; index < retained.length; index++) {
        const prior = retained[index - 1]!,
          next = retained[index]!;
        const desired =
          profile.rhythm.some((row) => profile.activities[row.activity]?.activity === prior.activity) &&
          flexibleAgendaBlock(next)
            ? preference.endMinute
            : flexibleAgendaBlock(prior) &&
                profile.rhythm.some((row) => profile.activities[row.activity]?.activity === next.activity)
              ? preference.startMinute
              : undefined;
        if (desired === undefined) continue;
        const boundary = Math.max(
          prior.startMinute + 30,
          Math.min(next.endMinute - 30, prior.endMinute + Math.max(-60, Math.min(60, desired - prior.endMinute))),
        );
        prior.endMinute = boundary;
        next.startMinute = boundary;
      }
    return retained.flatMap((block, index) => {
      if (!flexibleAgendaBlock(block)) return [block];
      const result: VillageAgendaBlock[] = [];
      let minute = block.startMinute,
        step = 0;
      while (minute < block.endMinute) {
        const part = Math.min(3, Math.floor(minute / 360)),
          next = choice(part, index + step++);
        const end = Math.min(block.endMinute, (part + 1) * 360, minute + Math.max(30, next.duration));
        result.push(
          flexibleAgendaBlock(next)
            ? { ...block, ...next, startMinute: minute, endMinute: end }
            : { ...block, startMinute: minute, endMinute: end },
        );
        minute = end;
      }
      return result;
    });
  }
  const result: VillageAgendaBlock[] = [];
  const rhythms = profile.rhythm
    .flatMap((row) => {
      const preference = enabled ? influence?.rhythms.find((item) => item.weekday === weekday) : undefined;
      const start = Math.max(
          0,
          Math.min(
            1439,
            row.startMinute + (preference ? Math.max(-60, Math.min(60, preference.startMinute - row.startMinute)) : 0),
          ),
        ),
        end = Math.max(
          0,
          Math.min(
            1440,
            row.endMinute + (preference ? Math.max(-60, Math.min(60, preference.endMinute - row.endMinute)) : 0),
          ),
        );
      if (start === end)
        return row.endMinute > row.startMinute
          ? [{ start: row.startMinute, end: row.endMinute, activity: row.activity }]
          : [
              { start: row.startMinute, end: 1440, activity: row.activity },
              { start: 0, end: row.endMinute, activity: row.activity },
            ];
      return end > start
        ? [{ start, end, activity: row.activity }]
        : [
            { start, end: 1440, activity: row.activity },
            { start: 0, end, activity: row.activity },
          ];
    })
    .filter((row) => row.start < row.end)
    .sort((a, b) => a.start - b.start);
  let minute = 0,
    step = 0;
  while (minute < 1440) {
    const rhythm = rhythms.find((row) => row.start <= minute && row.end > minute);
    const part = Math.min(3, Math.floor(minute / 360));
    const activity = rhythm ? profile.activities[rhythm.activity]! : choice(part, step++);
    const boundary = rhythms.find((row) => row.start > minute)?.start ?? 1440;
    const end = rhythm
      ? rhythm.end
      : Math.min(
          1440,
          (part + 1) * 360,
          boundary,
          minute +
            Math.max(
              30,
              Math.min(
                240,
                activity.duration + ((hashString(seed + ":" + dayKey(at) + ":duration:" + step) % 5) - 2) * 30,
              ),
            ),
        );
    result.push({ ...activity, startMinute: minute, endMinute: end });
    minute = end;
  }
  return result;
}

/** Local venue/zone admission; an invalid destination becomes the assigned living space. */
export function validateRoutineDay(
  blocks: VillageAgendaBlock[],
  resident: VillageVillager,
  state: VillageState,
  date: Date = new Date(),
): VillageAgendaBlock[] {
  return blocks.map((block) => {
    if (!block.venueId) return block;
    const venue = state.venues.find((item) => item.id === block.venueId);
    const accessContext = {
      at: calendarAt(date, dayKey(date), block.startMinute),
    };
    const zone =
      venue &&
      (block.zoneId
        ? venueZones(venue).find((item) => item.id === block.zoneId)
        : chooseAgendaZone(venue, resident.characterId, block.activity, "", state, accessContext));
    if (
      !venue ||
      !zone ||
      venue.constructionStatus === "worksite" ||
      !canOccupyZone(venue, zone, resident.characterId, accessContext) ||
      zoneClosed(state, venue, zone)
    )
      return {
        ...block,
        venueId: "",
        zoneId: undefined,
        activity: "Taking care of their own affairs",
        flexible: true,
      };
    return { ...block, zoneId: zone.id };
  });
}

/** One bounded, optional future activity from an already-paid request. Never a world-state effect. */
export function addRoutineIdea(
  agenda: VillageAgenda,
  value: unknown,
  resident: VillageVillager,
  state: VillageState,
  now = new Date(),
): boolean {
  const row = record(value),
    profile = agenda.routineProfile;
  if (!profile || row.flexible !== true || !text(row.activity)) return false;
  const candidate: RoutineActivity = {
    activity: text(row.activity),
    venueId: text(row.venueId),
    zoneId: text(row.zoneId) || undefined,
    flexible: true,
    essential: false,
    duration: 90,
    parts: [1, 2, 3],
  };
  if (candidate.venueId) {
    const checked = validateRoutineDay([{ ...candidate, startMinute: 0, endMinute: 90 }], resident, state, now)[0]!;
    if (checked.venueId !== candidate.venueId) return false;
  }
  if (profile.activities.some((item) => item.activity.toLowerCase() === candidate.activity.toLowerCase())) return false;
  let index = profile.activities.length;
  if (index >= 16) {
    index = profile.activities.findIndex((item, i) => !item.essential && !profile.days.some((day) => day.includes(i)));
    if (index < 0) return false;
    profile.activities[index] = candidate;
  } else profile.activities.push(candidate);
  // The seed routine remains intact; only optional alternatives evolve.
  if (!profile.baseWeek)
    for (const day of profile.days)
      for (const part of candidate.parts) {
        const at = part * 2 + 1;
        if (!profile.activities[day[at] ?? 0]?.essential) day[at] = index;
      }
  return true;
}
