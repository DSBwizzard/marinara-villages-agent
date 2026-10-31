import type { VillagerCard } from "../models/catalog-model.js";
import type {
  VillageAgenda,
  VillagePlayerBackground,
  VillageRemap,
  VillageRemapMove,
  VillageVenue,
  VillageWish,
} from "../models/world.js";
import { villageAgendaDay } from "./agenda-plan.js";
import { extractModelJsonObject } from "./json-reply.js";
import { remapBlocks, VILLAGE_UNTRANSLATED_ACTIVITY } from "./native-remap.js";
import type { RoutineProfile } from "./owned-routine.js";
import {
  influenceSettings,
  readPreparedInfluence,
  routineDay,
  scheduleSemanticSource,
  validRoutineRhythm,
} from "./owned-routine.js";
import { boundText, MAX_ROUTINE_SUMMARY_LENGTH } from "./prompt-preset.js";
import { generatedIdentityDescription } from "./resident-description.js";
import { ROUTINE_CONTRACT } from "./routine-contract.js";
import type { NativeWeekSchedule } from "./schedule-rules.js";
import { semanticHash } from "./semantic-contract.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";

export class RoutineResponseError extends Error {}

type PaletteEntry = {
  flexible: boolean;
  activity: string;
  venueId: string;
  zoneId?: string;
  duration: number;
  essential: boolean;
  parts: number[];
  weekdays?: number[];
};

export type CompactFoundingContext = {
  identityDescriptionRevision?: string;
  openingVersion?: 2 | 3;
  playerAgencyVersion?: 1;
  sourceRevision?: string;
  contractVersion?: 1 | 2;
  circumstances?: unknown;
  semanticVersion?: 2;
  playerBackground?: VillagePlayerBackground | null;
  playerPersonaName?: string;
  village: string;
  setting: string;
  home: string;
  card: Partial<Omit<VillagerCard, "tags">> & Pick<VillagerCard, "id" | "name"> & { tags?: readonly string[] };
  venues: readonly VillageVenue[];
  lore: readonly string[];
  wishes: readonly VillageWish[];
  schedule: NativeWeekSchedule | null;
  characterId?: string;
  influenceHints?: readonly string[];
  influenceSettings?: import("./owned-routine.js").ScheduleInfluence;
};

export type CompactFoundingResult = {
  identityDescription?: string;
  agenda: VillageAgenda;
  moves: VillageRemapMove[];
};

const compactKey = (activity: string): string => activity.trim().replace(/\s+/g, " ").toLocaleLowerCase();

export function foundingNativeActivities(schedule: NativeWeekSchedule | null): string[] {
  if (!schedule) return [];
  const seen = new Set<string>();
  return remapBlocks(schedule).flatMap((block) => {
    const key = compactKey(block.activity);
    if (!key || seen.has(key)) return [];
    seen.add(key);
    return [block.activity];
  });
}

export function rebaseFoundingRemap(
  remap: VillageRemap,
  schedule: NativeWeekSchedule,
  signature: string,
): VillageRemap {
  const known = new Map(remap.moves.map((move) => [compactKey(move.activity), move]));
  return {
    ...remap,
    weekStart: schedule.weekStart,
    signature,
    moves: remapBlocks(schedule).map((entry) => {
      const prior = known.get(compactKey(entry.activity));
      return {
        day: entry.day,
        time: entry.time,
        activity: entry.activity,
        here: prior?.here ?? VILLAGE_UNTRANSLATED_ACTIVITY,
        venueId: prior?.venueId ?? "",
        wishId: prior?.wishId ?? "",
        flexible: prior?.flexible === true,
      };
    }),
    attempts: 1,
    generatedAt: new Date().toISOString(),
  };
}

const validIndex = (value: unknown, length: number): value is number =>
  Number.isInteger(value) && (value as number) >= 0 && (value as number) < length;

function checkedPalette(value: unknown, venues: readonly VillageVenue[]): PaletteEntry[] {
  if (!Array.isArray(value) || value.length < 6 || value.length > 16)
    throw new RoutineResponseError("The model did not provide 6–16 village activities.");
  return value.map((raw, index) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw))
      throw new RoutineResponseError(`Village activity ${index + 1} is invalid.`);
    const row = raw as Record<string, unknown>;
    const activity = typeof row.activity === "string" ? row.activity.trim() : "";
    if (row.venue !== undefined && row.venueNumber !== undefined && row.venue !== row.venueNumber)
      throw new RoutineResponseError(`Village activity ${index + 1} has conflicting venue fields.`);
    // Older prompts said "venue number", and some saved replies use that spelling.
    // Preserve exact numeric indexes and reject ambiguous or invented destinations.
    const venue = row.venue ?? row.venueNumber;
    if (!activity || activity.length > ROUTINE_CONTRACT.maxActivityCharacters)
      throw new RoutineResponseError(`Village activity ${index + 1} needs activity text of 1–160 characters.`);
    if (!Number.isInteger(venue) || (venue as number) < 0 || (venue as number) > venues.length)
      throw new RoutineResponseError(
        `Village activity ${index + 1} needs a numeric venue index from 0 to ${venues.length}.`,
      );
    return {
      activity,
      ...(Array.isArray(row.weekdays) ? { weekdays: row.weekdays as number[] } : {}),
      duration: Math.max(
        ROUTINE_CONTRACT.minMinutes,
        Math.min(ROUTINE_CONTRACT.maxMinutes, Number(row.duration) || 90),
      ),
      parts:
        Array.isArray(row.parts) &&
        row.parts.length &&
        row.parts.every((part) => Number.isInteger(part) && part >= 0 && part <= 3)
          ? row.parts
          : [0, 1, 2, 3],
      essential: row.essential === true,
      zoneId: typeof row.zoneId === "string" ? row.zoneId : undefined,
      flexible: row.flexible === true,
      venueId: (venue as number) === 0 ? "" : venues[(venue as number) - 1]!.id,
    };
  });
}

/** Models select activities and dayparts; code owns the repeated calendar structure. */
export function compileRoutineDays(palette: readonly PaletteEntry[], residentId: string): number[][] {
  const seed = Number.parseInt(semanticHash(residentId).slice(0, 8), 16);
  return VILLAGE_WEEKDAYS.map((_, day) =>
    Array.from({ length: 8 }, (_, slot) => {
      const candidates = palette.flatMap((activity, index) =>
        activity.parts.includes(Math.floor(slot / 2)) && (!activity.weekdays || activity.weekdays.includes(day))
          ? [index]
          : [],
      );
      if (!candidates.length) throw new RoutineResponseError("Routine activities must cover every daypart.");
      return candidates[(seed + day * 2 + slot) % candidates.length]!;
    }),
  );
}

export function parseCompactFounding(
  payload: Record<string, unknown>,
  context: CompactFoundingContext,
): CompactFoundingResult {
  if (context.contractVersion && Array.isArray(payload.palette))
    for (const [index, value] of payload.palette.entries()) {
      const row = value as Record<string, unknown>;
      if (
        row &&
        typeof row === "object" &&
        (typeof row.duration !== "number" ||
          !Number.isFinite(row.duration) ||
          row.duration < ROUTINE_CONTRACT.minMinutes ||
          row.duration > ROUTINE_CONTRACT.maxMinutes)
      )
        throw new RoutineResponseError(
          `Routine activity ${index + 1} duration ${typeof row.duration === "number" && Number.isFinite(row.duration) ? row.duration : "non-numeric"}; expected ${ROUTINE_CONTRACT.minMinutes}–${ROUTINE_CONTRACT.maxMinutes} minutes.`,
        );
      if (
        !row ||
        typeof row !== "object" ||
        typeof row.flexible !== "boolean" ||
        typeof row.essential !== "boolean" ||
        typeof row.duration !== "number" ||
        !Number.isFinite(row.duration) ||
        row.duration < ROUTINE_CONTRACT.minMinutes ||
        row.duration > ROUTINE_CONTRACT.maxMinutes ||
        !Array.isArray(row.parts) ||
        !row.parts.length ||
        row.parts.some((part) => !Number.isInteger(part) || part < 0 || part > 3)
      )
        throw new RoutineResponseError("Routine activity fields are incomplete or invalid.");
      if (
        row.weekdays !== undefined &&
        (!Array.isArray(row.weekdays) ||
          !row.weekdays.length ||
          row.weekdays.some((day) => !Number.isInteger(day) || Number(day) < 0 || Number(day) > 6))
      )
        throw new RoutineResponseError("Routine weekday preferences must use Monday–Sunday indexes 0–6.");
      if (
        row.zoneId !== undefined &&
        (typeof row.zoneId !== "string" ||
          !(context.venues[Number(row.venue ?? row.venueNumber) - 1]?.zones ?? []).some(
            (zone) => zone.id === row.zoneId && ["exterior", "public"].includes(zone.kind),
          ))
      )
        throw new RoutineResponseError("Routine activity has an unavailable Zone identifier.");
    }
  const palette = checkedPalette(payload.palette, context.venues);
  if (
    context.contractVersion &&
    (!Array.isArray(payload.palette) || payload.palette.length > ROUTINE_CONTRACT.maxActivities)
  )
    throw new RoutineResponseError("Routine requires 6–8 activities.");
  const days = context.contractVersion === 2 ? compileRoutineDays(palette, context.card.id) : payload.days;
  if (
    !Array.isArray(days) ||
    days.length !== 7 ||
    days.some(
      (day) => !Array.isArray(day) || ![4, 8].includes(day.length) || day.some((id) => !validIndex(id, palette.length)),
    )
  )
    throw new RoutineResponseError("The model did not provide a complete seven-day activity pattern.");
  if (typeof payload.routine !== "string" || !payload.routine.trim())
    throw new RoutineResponseError("The model did not describe the villager's routine.");
  const at = new Date().toISOString();
  if (!Array.isArray(payload.rhythm))
    throw new RoutineResponseError("The routine must explicitly describe rest windows, or use an empty list.");
  const rhythm = payload.rhythm.map((value) => {
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new RoutineResponseError("Invalid resident rest pattern.");
    const row = value as Record<string, unknown>;
    if (
      row.activity !== undefined &&
      row.activityPaletteIndex !== undefined &&
      row.activity !== row.activityPaletteIndex
    )
      throw new RoutineResponseError("Resident rest pattern has conflicting activity fields.");
    const activity = row.activity ?? row.activityPaletteIndex;
    if (
      !Number.isInteger(row.startMinute) ||
      !Number.isInteger(row.endMinute) ||
      (row.startMinute as number) < 0 ||
      (row.startMinute as number) >= 1440 ||
      (row.endMinute as number) < 0 ||
      (row.endMinute as number) > 1440 ||
      row.startMinute === row.endMinute ||
      !validIndex(activity, palette.length)
    )
      throw new RoutineResponseError("Invalid resident rest pattern.");
    return { startMinute: row.startMinute as number, endMinute: row.endMinute as number, activity: activity as number };
  });
  if (!validRoutineRhythm(rhythm)) throw new RoutineResponseError("Resident rest windows overlap.");
  const profile: RoutineProfile = {
    version: 1,
    ...(context.semanticVersion === 2 ? { semanticVersion: 2 as const } : {}),
    activities: palette,
    // A single supplied option per daypart is also a complete plan; duplicate only its choice slot.
    days: (days as number[][]).map((day) => (day.length === 4 ? day.flatMap((id) => [id, id]) : [...day])),
    rhythm,
  };
  const influence = payload.scheduleInfluence;
  if (
    context.semanticVersion === 2 &&
    context.schedule &&
    context.influenceSettings?.enabled &&
    (!influence || typeof influence !== "object" || Array.isArray(influence))
  )
    throw new RoutineResponseError("System schedule interpretation is missing.");
  if (influence && typeof influence === "object" && !Array.isArray(influence)) {
    const row = influence as Record<string, unknown>;
    profile.influence = {
      version: 1,
      signature: semanticHash(influence),
      available: !!context.schedule,
      enabled: true,
      rhythms: Array.isArray(row.rhythms)
        ? row.rhythms.filter(
            (item: any) =>
              typeof item.weekday === "string" &&
              Number.isInteger(item.startMinute) &&
              Number.isInteger(item.endMinute) &&
              item.startMinute >= 0 &&
              item.endMinute <= 1440,
          )
        : [],
      busy: Array.isArray(row.busy)
        ? row.busy.filter(
            (item: any) =>
              typeof item.weekday === "string" &&
              Number.isInteger(item.part) &&
              item.part >= 0 &&
              item.part <= 3 &&
              typeof item.free === "boolean",
          )
        : [],
      interests: Array.isArray(row.interests)
        ? row.interests.filter(
            (item: unknown) => typeof item === "string" && palette.some((activity) => activity.activity === item),
          )
        : [],
      entities: Array.isArray(row.entities)
        ? row.entities.filter(
            (item: unknown) => typeof item === "string" && context.venues.some((venue) => venue.id === item),
          )
        : [],
      adopted: [],
      unresolved: [],
    };
    if (
      context.semanticVersion === 2 &&
      (!readPreparedInfluence(profile.influence) ||
        ["rhythms", "busy", "interests", "entities"].some(
          (key) =>
            !Array.isArray(row[key]) || (row[key] as unknown[]).length !== (profile.influence as any)[key].length,
        ))
    )
      throw new RoutineResponseError("System schedule interpretation has invalid fields.");
    profile.influenceSource = scheduleSemanticSource(
      context.schedule,
      context.influenceSettings ?? influenceSettings(undefined),
    );
  }
  const week = Object.fromEntries(
    VILLAGE_WEEKDAYS.map((weekday, index) => [
      weekday,
      routineDay(profile, context.card.id, new Date(2026, 0, 5 + index, 12)),
    ]),
  );
  return {
    ...(context.identityDescriptionRevision
      ? { identityDescription: generatedIdentityDescription(payload.identityDescription) }
      : {}),
    agenda: {
      routineProfile: profile,
      routineSummary: boundText(payload.routine, MAX_ROUTINE_SUMMARY_LENGTH),
      day: villageAgendaDay(null, context.venues, context.card.name),
      week,
      scheduleWeek: null,
      personalizationPending: false,
      personalizationFailure: "",
      source: "village",
      generatedAt: at,
    },
    moves: [],
  };
}

export function parseCompactFoundingCompletion(
  completion: { content?: string | null; finishReason?: string | null },
  context: CompactFoundingContext,
): CompactFoundingResult {
  const payload = extractModelJsonObject(completion);
  if (completion.finishReason === "length")
    throw new RoutineResponseError("Routine output was truncated. Retry deliberately with enough output room.");
  if (!payload) throw new RoutineResponseError("The System model returned empty or invalid JSON for founding.");
  return parseCompactFounding(payload, context);
}
