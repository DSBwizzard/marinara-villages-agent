import type { VillageAgenda, VillageAgendaBlock, VillageState, VillageVillager } from "../models/world.js";
import type { NativeWeekSchedule } from "./schedule-rules.js";
import { canOccupyZone, chooseAgendaZone, venueZones, zoneClosed } from "./venue-zones.js";
import { hashString, VILLAGE_WEEKDAYS } from "./village-clock.js";

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
export type RoutineActivity = Omit<VillageAgendaBlock, "startMinute" | "endMinute" | "sourceTime"> & {
  duration: number;
  parts: number[];
  essential: boolean;
};
export type RoutineProfile = {
  version: 1;
  activities: RoutineActivity[];
  days: number[][];
  rhythm: { startMinute: number; endMinute: number; activity: number }[];
  /** Legacy life is adopted without a paid rewrite. */
  seedWeek?: Record<string, VillageAgendaBlock[]>;
};

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
const text = (value: unknown) => (typeof value === "string" ? value.trim().slice(0, 160) : "");
const dayKey = (at: Date) =>
  `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, "0")}-${String(at.getDate()).padStart(2, "0")}`;
const words = (value: string) => value.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? [];
const commonWords = new Set([
  "home",
  "village",
  "their",
  "with",
  "ordinary",
  "spending",
  "time",
  "taking",
  "care",
  "about",
  "doing",
  "space",
  "own",
  "the",
  "and",
  "for",
  "his",
  "her",
]);
const compatible = (left: string, right: string) =>
  words(left).some((word) => !commonWords.has(word) && words(right).includes(word));
const rest = /\b(?:sleep(?:ing)?|rest(?:ing)?|hibernate|hibernating|recharge|recharging|dormant)\b/iu;
const busy = /\b(?:work(?:ing)?|shift|study(?:ing)?|class|training|appointment|duty|duties)\b/iu;
const hobby =
  /\b(?:read(?:ing)?|garden(?:ing)?|paint(?:ing)?|music|play(?:ing)?|walk(?:ing)?|fish(?:ing)?|craft(?:ing)?|cook(?:ing)?|hobby|hobbies)\b/iu;

export function influenceSettings(value: unknown, legacyEnabled = false): ScheduleInfluence {
  const raw = record(value),
    categories = record(raw.categories);
  return {
    version: 1,
    enabled: typeof raw.enabled === "boolean" ? raw.enabled : legacyEnabled,
    categories: Object.fromEntries(
      INFLUENCE_CATEGORIES.map((key) => [key, categories[key] !== false]),
    ) as ScheduleInfluence["categories"],
  };
}

/** Strict parsing is independent of the Engine's chat availability and weekly date. */
function range(value: string): { startMinute: number; endMinute: number } | null {
  const match = /^(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [h1, m1, h2, m2] = match.slice(1).map(Number);
  if (h1! > 23 || h2! > 24 || m1! > 59 || m2! > 59 || (h2 === 24 && m2 !== 0)) return null;
  const startMinute = h1! * 60 + m1!,
    endMinute = h2! * 60 + m2!;
  return startMinute === endMinute ? null : { startMinute, endMinute };
}

export function deriveInfluence(
  schedule: NativeWeekSchedule | null,
  resident: VillageVillager,
  state: VillageState,
): InfluenceSnapshot {
  const settings = influenceSettings(resident.scheduleInfluence, resident.ingestSchedule === true);
  const result: InfluenceSnapshot = {
    version: 1,
    signature: "",
    available: !!schedule,
    enabled: settings.enabled,
    rhythms: [],
    busy: [],
    interests: [],
    entities: [],
    adopted: [],
    unresolved: [],
  };
  const patternObservations: { weekend: boolean; busy: boolean }[] = [];
  const activities = resident.agenda?.routineProfile?.activities ?? [];
  for (const weekday of VILLAGE_WEEKDAYS)
    for (const value of (Array.isArray(schedule?.days?.[weekday]) ? schedule.days[weekday] : []) ?? []) {
      const entry = record(value);
      const interval = typeof entry.time === "string" ? range(entry.time) : null;
      if (!interval) continue;
      const phrase = text(entry.activity);
      if (/\b(?:chat|conversation|talk(?:ing)?|message|call(?:ing)?|reply|respond)\b/iu.test(phrase)) continue;
      if (busy.test(phrase) || hobby.test(phrase) || /\b(?:free|leisure|relaxing)\b/iu.test(phrase))
        patternObservations.push({ weekend: weekday === "Saturday" || weekday === "Sunday", busy: busy.test(phrase) });
      if (rest.test(phrase))
        result.rhythms.push({
          weekday,
          startMinute: Math.round(interval.startMinute / 60) * 60,
          endMinute: Math.round(interval.endMinute / 60) * 60,
        });
      else if (busy.test(phrase) || /\b(?:free|leisure|relaxing)\b/iu.test(phrase)) {
        const end = interval.endMinute > interval.startMinute ? interval.endMinute : interval.endMinute + 1440;
        for (let minute = interval.startMinute; minute < end; minute += 360)
          result.busy.push({ weekday, part: Math.floor((minute % 1440) / 360), free: !busy.test(phrase) });
      }
      if (hobby.test(phrase)) {
        const matches = activities.filter((item) => item.flexible && compatible(phrase, item.activity));
        if (matches.length) result.interests.push(...matches.map((item) => item.activity));
        else result.unresolved.push(`Interest awaiting compatible village activity: ${phrase}`);
      }
      for (const venue of state.venues) {
        if (venue.name.length < 3 || !phrase.toLowerCase().includes(venue.name.toLowerCase())) continue;
        if (
          venueZones(venue).some(
            (zone) =>
              canOccupyZone(venue, zone, resident.characterId, { relationships: state.relationshipContext }) &&
              !zoneClosed(state, venue, zone),
          ) &&
          venue.constructionStatus !== "worksite"
        )
          result.entities.push(venue.id);
      }
    }
  result.patterns = settings.categories.weekdayWeekend
    ? [false, true].flatMap((weekend) => {
        const known = patternObservations.filter((item) => item.weekend === weekend);
        return known.length ? [{ weekend, busy: known.filter((item) => item.busy).length > known.length / 2 }] : [];
      })
    : [];
  result.rhythms = result.rhythms
    .filter(
      (row, _, all) =>
        row.startMinute !== row.endMinute && all.filter((other) => other.weekday === row.weekday).length === 1,
    )
    .slice(0, 21);
  result.busy = [...new Map(result.busy.map((item) => [`${item.weekday}:${item.part}`, item])).values()];
  result.interests = [...new Set(result.interests)].slice(0, 8);
  result.entities = [...new Set(result.entities)].slice(0, 8);
  result.unresolved = settings.categories.interests ? [...new Set(result.unresolved)].slice(0, 4) : [];
  if (!settings.categories.rhythm) result.rhythms = [];
  if (!settings.categories.busyFree) result.busy = [];
  if (!settings.categories.interests) result.interests = [];
  if (!settings.categories.establishedEntities) result.entities = [];
  if (!settings.categories.weekdayWeekend) {
    result.rhythms = result.rhythms
      .filter((item) => item.weekday === "Monday")
      .flatMap((item) => VILLAGE_WEEKDAYS.map((weekday) => ({ ...item, weekday })));
    result.busy = result.busy
      .filter((item) => item.weekday === "Monday")
      .flatMap((item) => VILLAGE_WEEKDAYS.map((weekday) => ({ ...item, weekday })));
  }
  if (result.rhythms.length) {
    const clock = (minute: number) =>
      String(Math.floor(minute / 60)).padStart(2, "0") + ":" + String(minute % 60).padStart(2, "0");
    result.adopted.push(
      ...result.rhythms.map(
        (row) => row.weekday + ": preferred rest " + clock(row.startMinute) + "–" + clock(row.endMinute),
      ),
    );
  }
  if (result.busy.length)
    result.adopted.push(
      ...result.busy.map(
        (row) =>
          row.weekday +
          ": prefer " +
          (row.free ? "flexible" : "busy") +
          " activities in " +
          ["overnight", "morning", "afternoon", "evening"][row.part],
      ),
    );
  if (settings.categories.weekdayWeekend && result.patterns.length)
    result.adopted.push("Weekday and weekend differences");
  result.adopted.push(
    ...result.interests.map((item) => `Interest: ${item}`),
    ...result.entities.map((id) => `Established place: ${state.venues.find((v) => v.id === id)!.name}`),
  );
  // Hash only normalized, selected preferences; neither status nor weekStart enters.
  result.signature = String(
    hashString(
      JSON.stringify([
        settings,
        result.rhythms,
        result.busy,
        result.patterns,
        result.interests,
        result.entities,
        result.unresolved,
        result.available,
      ]),
    ),
  );
  return result;
}

export function adoptedProfile(week: Record<string, VillageAgendaBlock[]>): RoutineProfile {
  const unique = new Map<string, RoutineActivity>();
  for (const weekday of VILLAGE_WEEKDAYS)
    for (const block of week[weekday] ?? []) {
      const key = JSON.stringify([block.activity, block.venueId, block.zoneId, block.status, block.flexible]);
      const part = Math.min(3, Math.floor(block.startMinute / 360));
      const existing = unique.get(key);
      if (existing) {
        if (!existing.parts.includes(part)) existing.parts.push(part);
        continue;
      }
      const { startMinute, endMinute, sourceTime: _source, ...activity } = block;
      unique.set(key, {
        ...activity,
        duration: Math.max(30, Math.min(240, endMinute - startMinute)),
        parts: [part],
        essential: !block.flexible,
      });
    }
  return {
    version: 1,
    activities: [...unique.values()].slice(0, 16),
    days: Array.from({ length: 7 }, () => []),
    rhythm: [],
    seedWeek: structuredClone(week),
  };
}

export function coerceRoutineProfile(value: unknown): RoutineProfile | undefined {
  const raw = record(value);
  if (
    raw.version !== 1 ||
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
      row.parts.some((part) => !Number.isInteger(part) || part < 0 || part > 3) ||
      !["online", "idle", "dnd", "offline"].includes(String(row.status))
    )
      return undefined;
    activities.push({
      activity: text(row.activity),
      venueId: text(row.venueId),
      zoneId: text(row.zoneId) || undefined,
      reason: text(row.reason),
      status: row.status as RoutineActivity["status"],
      flexible: row.flexible === true && ["online", "idle"].includes(String(row.status)),
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
        (raw.seedWeek ? day.length > 8 : day.length !== 8) ||
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
  const base = profile.seedWeek?.[weekday];
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
          rest.test(prior.activity) && next.flexible
            ? preference.endMinute
            : prior.flexible && rest.test(next.activity)
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
      if (block.essential || !block.flexible || block.status === "offline" || block.status === "dnd") return [block];
      const result: VillageAgendaBlock[] = [];
      let minute = block.startMinute,
        step = 0;
      while (minute < block.endMinute) {
        const part = Math.min(3, Math.floor(minute / 360)),
          next = choice(part, index + step++);
        const end = Math.min(block.endMinute, (part + 1) * 360, minute + Math.max(30, next.duration));
        result.push(
          next.flexible
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
      relationships: state.relationshipContext,
      at: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, block.startMinute),
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
        status: "idle" as const,
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
): boolean {
  const row = record(value),
    profile = agenda.routineProfile;
  if (!profile || row.flexible !== true || !text(row.activity) || agenda.projectWork) return false;
  // Optional repertoire entries cannot create employment, assets or world effects.
  if (
    /\b(?:buy|bought|acquir\w*|purchas\w*|own(?:s|ed|ing)?|new vehicle|employ\w*|hired|promis\w*|contract|paid|debt|injur\w*|destroy\w*|repair\w*|build\w*|deliver\w*|ship|spaceship|aircraft|train|car)\b/iu.test(
      text(row.activity),
    )
  )
    return false;
  const candidate: RoutineActivity = {
    activity: text(row.activity),
    venueId: text(row.venueId),
    zoneId: text(row.zoneId) || undefined,
    reason: "",
    status: "online",
    flexible: true,
    essential: false,
    duration: 90,
    parts: [1, 2, 3],
  };
  if (candidate.venueId) {
    const checked = validateRoutineDay([{ ...candidate, startMinute: 0, endMinute: 90 }], resident, state)[0]!;
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
  if (!profile.seedWeek)
    for (const day of profile.days)
      for (const part of candidate.parts) {
        const at = part * 2 + 1;
        if (!profile.activities[day[at] ?? 0]?.essential) day[at] = index;
      }
  return true;
}

/** Shared prompt projection retains complete coverage and meaningful transitions. */
export function compressAgendaBlocks<
  T extends {
    activity?: string;
    here?: string;
    reason?: string;
    venueId?: string;
    zoneId?: string;
    status?: string;
    flexible?: boolean;
    time?: string;
    startMinute?: number;
    endMinute?: number;
    current?: boolean;
  },
>(blocks: readonly T[]): T[] {
  const result: T[] = [];
  for (const original of blocks) {
    const row = { ...original, reason: "" },
      prior = result.at(-1);
    const same =
      prior &&
      ["activity", "here", "venueId", "zoneId", "status", "flexible", "wishId", "commitmentId"].every(
        (key) => prior[key as keyof T] === row[key as keyof T],
      );
    const contiguous =
      prior &&
      ((prior.endMinute !== undefined && prior.endMinute === row.startMinute) ||
        (prior.time && row.time && prior.time.split("-")[1] === row.time.split("-")[0]));
    if (same && contiguous) {
      if (row.endMinute !== undefined) prior.endMinute = row.endMinute;
      if (row.time && prior.time) prior.time = `${prior.time.split("-")[0]}-${row.time.split("-")[1]}`;
      prior.current = prior.current || row.current;
    } else result.push(row);
  }
  return result;
}

/** Identical complete-day wording for Scenes and Events. */
export function agendaPromptDay(
  blocks: readonly {
    time: string;
    here: string;
    venueId?: string;
    zoneId?: string;
    reason?: string;
    status?: string;
    flexible?: boolean;
    commitmentId?: string;
    wishId?: string;
    current?: boolean;
  }[],
): string {
  return compressAgendaBlocks(blocks)
    .map(
      (block) =>
        block.time +
        " " +
        block.here.trim() +
        (block.venueId ? " [" + block.venueId + (block.zoneId ? "/" + block.zoneId : "") + "]" : "") +
        (block.commitmentId ? " (commitment)" : ""),
    )
    .join("; ");
}
