import type { VillagerCard } from "../models/catalog-model.js";
import type {
  VillageAgenda,
  VillageCompletedWish,
  VillagePlayerRole,
  VillageRemap,
  VillageRemapMove,
  VillageVenue,
  VillageWish,
} from "../models/world.js";
import { villageAgendaDay } from "./agenda-plan.js";
import { extractJsonObject } from "./json-reply.js";
import { remapBlocks, VILLAGE_UNTRANSLATED_ACTIVITY } from "./native-remap.js";
import { routineDay, validRoutineRhythm } from "./owned-routine.js";
import type { RoutineProfile } from "./owned-routine.js";
import { boundText, coerceWish, MAX_ROUTINE_SUMMARY_LENGTH, MAX_VILLAGER_WISHES } from "./prompt-preset.js";
import type { NativeWeekSchedule } from "./schedule-rules.js";
import { randomVillageSeed, VILLAGE_WEEKDAYS } from "./village-clock.js";
import { selectWishSize, validateGeneratedWishWording } from "./wish-definition.js";

type PaletteEntry = {
  flexible: boolean;
  activity: string;
  venueId: string;
  status: "online" | "idle" | "dnd" | "offline";
  zoneId?: string;
  duration: number;
  essential: boolean;
  parts: number[];
  reason: string;
};

export type CompactFoundingContext = {
  wishAttemptId?: string;
  playerRole?: VillagePlayerRole | null;
  playerPersonaName?: string;
  allowInitialWish?: boolean;
  village: string;
  setting: string;
  home: string;
  card: Partial<Omit<VillagerCard, "tags">> & Pick<VillagerCard, "id" | "name"> & { tags?: readonly string[] };
  venues: readonly VillageVenue[];
  lore: readonly string[];
  completedWishes: readonly VillageCompletedWish[];
  activeWishes: readonly VillageWish[];
  schedule: NativeWeekSchedule | null;
  characterId?: string;
  influenceHints?: readonly string[];
};

export type CompactFoundingResult = { agenda: VillageAgenda; moves: VillageRemapMove[] };

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
    throw new Error("The model did not provide 6–16 village activities.");
  return value.map((raw, index) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw))
      throw new Error(`Village activity ${index + 1} is invalid.`);
    const row = raw as Record<string, unknown>;
    const activity = typeof row.activity === "string" ? row.activity.trim() : "";
    if (row.venue !== undefined && row.venueNumber !== undefined && row.venue !== row.venueNumber)
      throw new Error(`Village activity ${index + 1} has conflicting venue fields.`);
    // Older prompts said "venue number", and some saved replies use that spelling.
    // Preserve exact numeric indexes and reject ambiguous or invented destinations.
    const venue = row.venue ?? row.venueNumber;
    if (!activity || activity.length > 160)
      throw new Error(`Village activity ${index + 1} needs activity text of 1–160 characters.`);
    if (!Number.isInteger(venue) || (venue as number) < 0 || (venue as number) > venues.length)
      throw new Error(`Village activity ${index + 1} needs a numeric venue index from 0 to ${venues.length}.`);
    if (row.status !== "online" && row.status !== "idle" && row.status !== "dnd" && row.status !== "offline")
      throw new Error(`Village activity ${index + 1} has no valid availability.`);
    return {
      activity,
      duration: Math.max(30, Math.min(240, Number(row.duration) || 90)),
      parts:
        Array.isArray(row.parts) &&
        row.parts.length &&
        row.parts.every((part) => Number.isInteger(part) && part >= 0 && part <= 3)
          ? row.parts
          : [0, 1, 2, 3],
      essential: row.essential === true || row.flexible !== true,
      zoneId: typeof row.zoneId === "string" ? row.zoneId : undefined,
      reason: "",
      flexible: row.flexible === true && (row.status === "online" || row.status === "idle"),
      venueId: (venue as number) === 0 ? "" : venues[(venue as number) - 1]!.id,
      status: row.status,
    };
  });
}

export function parseCompactFounding(
  payload: Record<string, unknown>,
  context: CompactFoundingContext,
): CompactFoundingResult {
  const palette = checkedPalette(payload.palette, context.venues);
  const days = payload.days;
  if (
    !Array.isArray(days) ||
    days.length !== 7 ||
    days.some((day) => !Array.isArray(day) || day.length !== 8 || day.some((id) => !validIndex(id, palette.length)))
  )
    throw new Error("The model did not provide a complete seven-day activity pattern.");
  if (typeof payload.routine !== "string" || !payload.routine.trim())
    throw new Error("The model did not describe the villager's routine.");
  const at = new Date().toISOString();
  const wishes: VillageWish[] = [];
  const seen = new Set<string>();
  if (Array.isArray(payload.wishes) && !context.activeWishes.length && context.allowInitialWish !== false) {
    for (const raw of payload.wishes) {
      const wish = coerceWish(
        { ...raw, size: selectWishSize(context.wishAttemptId ?? context.characterId ?? context.card.name) },
        randomVillageSeed(),
        at,
      );
      if (!wish || seen.has(compactKey(wish.wish))) continue;
      validateGeneratedWishWording(wish.wish);
      seen.add(compactKey(wish.wish));
      wishes.push(wish);
      if (wishes.length >= 1) break;
    }
  }
  if (!Array.isArray(payload.rhythm))
    throw new Error("The routine must explicitly describe rest windows, or use an empty list.");
  const rhythm = payload.rhythm.map((value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid resident rest pattern.");
    const row = value as Record<string, unknown>;
    if (
      row.activity !== undefined &&
      row.activityPaletteIndex !== undefined &&
      row.activity !== row.activityPaletteIndex
    )
      throw new Error("Resident rest pattern has conflicting activity fields.");
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
      throw new Error("Invalid resident rest pattern.");
    return { startMinute: row.startMinute as number, endMinute: row.endMinute as number, activity: activity as number };
  });
  if (!validRoutineRhythm(rhythm)) throw new Error("Resident rest windows overlap.");
  const profile: RoutineProfile = { version: 1, activities: palette, days: days as number[][], rhythm };
  const week = Object.fromEntries(
    VILLAGE_WEEKDAYS.map((weekday, index) => [
      weekday,
      routineDay(profile, context.card.id, new Date(2026, 0, 5 + index, 12)),
    ]),
  );
  return {
    agenda: {
      routineProfile: profile,
      wishes: [...context.activeWishes, ...wishes].slice(0, Math.min(2, MAX_VILLAGER_WISHES)),
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
  const payload = extractJsonObject(completion.content ?? "");
  if (completion.finishReason === "length")
    throw new Error("Routine output was truncated. Retry deliberately with enough output room.");
  if (!payload) throw new Error("The System model returned empty or invalid JSON for founding.");
  return parseCompactFounding(payload, context);
}
