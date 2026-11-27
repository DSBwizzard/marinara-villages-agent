import type { VillagerCard } from "../models/catalog-model.js";
import type { VillageAgenda, VillageAgendaBlock, VillagePlayerBackground, VillageVenue } from "../models/world.js";
import { extractModelJsonObject } from "./json-reply.js";
import type { RoutineProfile } from "./owned-routine.js";
import { routineDay, routineProfileFromWeek, validRoutineRhythm } from "./owned-routine.js";
import { boundText, MAX_ROUTINE_SUMMARY_LENGTH } from "./prompt-preset.js";
import { generatedIdentityDescription } from "./resident-description.js";
import { ROUTINE_CONTRACT } from "./routine-contract.js";
import { backgroundRevision } from "./background-revision.js";
import { asRecord } from "./coerce.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";
import { generatedAgendaActivityLabel } from "./agenda-plan.js";
import { completeAgendaWeek, workingAgendaWeek, agendaDateKey } from "./agenda-week.js";
import { AGENDA_NAP_ACTIVITY, restingAgendaBlock } from "./agenda-flexibility.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import {
  AGENDA_WEEK_DAYS,
  agendaActivityKey,
  shiftAgendaDate,
  weeklyAgendaSlots,
  type WeeklyAgendaChoice,
  type WeeklyAgendaSlot,
} from "./weekly-agenda.js";

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
  continuity: {
    fingerprint: string;
    sources: string[];
    protectionFingerprint: string;
    protections: ReturnType<typeof import("./continuity.js").continuityConstraints>;
  };
  loreUse?: import("../../../shared/contracts/lore.js").LoreUse[];
  identityDescriptionRevision?: string;
  sourceRevision?: string;
  circumstances?: { worldFacts: readonly string[]; worldRules: string };
  playerBackground?: VillagePlayerBackground | null;
  playerPersonaName?: string;
  village: string;
  setting: string;
  home: string;
  card: Partial<Omit<VillagerCard, "tags">> & Pick<VillagerCard, "id" | "name"> & { tags?: readonly string[] };
  venues: readonly VillageVenue[];
  lore: readonly string[];
  wishes: readonly string[];
  characterId?: string;
  activityLabelFormat?: 1;
  starterWeekStart?: string;
  starterRestFormat?: 1;
};

export type CompactFoundingResult = {
  identityDescription?: string;
  agenda: VillageAgenda;
  starterWeek?: {
    slots: WeeklyAgendaSlot[];
    choices: (WeeklyAgendaChoice | null)[];
    fallbackWeek: Record<string, VillageAgendaBlock[]>;
    through: string;
  };
};

const validIndex = (value: unknown, length: number): value is number =>
  Number.isInteger(value) && (value as number) >= 0 && (value as number) < length;

function checkedPalette(value: unknown, { venues, activityLabelFormat }: CompactFoundingContext): PaletteEntry[] {
  if (!Array.isArray(value) || value.length < 6 || value.length > 16)
    throw new RoutineResponseError("The model did not provide 6–16 village activities.");
  return value.map((raw, index) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw))
      throw new RoutineResponseError(`Village activity ${index + 1} is invalid.`);
    const row = raw as Record<string, unknown>;
    const activity = typeof row.activity === "string" ? row.activity.trim() : "";
    const venue = row.venue;
    if (!activity || activity.length > ROUTINE_CONTRACT.maxActivityCharacters)
      throw new RoutineResponseError(`Village activity ${index + 1} needs activity text of 1–160 characters.`);
    if (!Number.isInteger(venue) || (venue as number) < 0 || (venue as number) > venues.length)
      throw new RoutineResponseError(
        `Village activity ${index + 1} needs a numeric venue index from 0 to ${venues.length}.`,
      );
    return {
      activity: activityLabelFormat === 1 ? generatedAgendaActivityLabel(activity) : activity,
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
  const seed = Number.parseInt(backgroundRevision(residentId).slice(0, 8), 16);
  return VILLAGE_WEEKDAYS.map((_, day) =>
    Array.from({ length: 8 }, (_, slot) => {
      const candidates = palette.flatMap((activity, index) =>
        activity.parts.includes(Math.floor(slot / 2)) && (!activity.weekdays || activity.weekdays.includes(day))
          ? [index]
          : [],
      );
      if (!candidates.length) throw new RoutineResponseError("Agenda activities must cover every daypart.");
      return candidates[(seed + day * 2 + slot) % candidates.length]!;
    }),
  );
}

export function parseCompactFounding(
  payload: Record<string, unknown>,
  context: CompactFoundingContext,
): CompactFoundingResult {
  if (context.starterWeekStart) return parseStarterWeek(payload, context, context.starterWeekStart);
  if (Array.isArray(payload.palette))
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
          `Agenda activity ${index + 1} duration ${typeof row.duration === "number" && Number.isFinite(row.duration) ? row.duration : "non-numeric"}; expected ${ROUTINE_CONTRACT.minMinutes}–${ROUTINE_CONTRACT.maxMinutes} minutes.`,
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
        throw new RoutineResponseError("Agenda activity fields are incomplete or invalid.");
      if (
        row.weekdays !== undefined &&
        (!Array.isArray(row.weekdays) ||
          !row.weekdays.length ||
          row.weekdays.some((day) => !Number.isInteger(day) || Number(day) < 0 || Number(day) > 6))
      )
        throw new RoutineResponseError("Agenda weekday preferences must use Monday–Sunday indexes 0–6.");
      if (
        row.zoneId !== undefined &&
        (typeof row.zoneId !== "string" ||
          !(context.venues[Number(row.venue) - 1]?.zones ?? []).some(
            (zone) => zone.id === row.zoneId && ["exterior", "public"].includes(zone.kind),
          ))
      )
        throw new RoutineResponseError("Agenda activity has an unavailable Zone identifier.");
    }
  const palette = checkedPalette(payload.palette, context);
  if (!Array.isArray(payload.palette) || payload.palette.length > ROUTINE_CONTRACT.maxActivities)
    throw new RoutineResponseError("An Agenda requires 6–8 activities.");
  const days = compileRoutineDays(palette, context.card.id);
  if (typeof payload.routine !== "string" || !payload.routine.trim())
    throw new RoutineResponseError("The model did not describe the villager's Agenda.");
  const at = new Date().toISOString();
  if (!Array.isArray(payload.rhythm))
    throw new RoutineResponseError("The Agenda must explicitly describe rest windows, or use an empty list.");
  const rhythm = payload.rhythm.map((value) => {
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new RoutineResponseError("Invalid resident rest pattern.");
    const row = value as Record<string, unknown>;
    const activity = row.activity;
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
    semanticVersion: 2,
    activities: palette,
    days,
    rhythm,
  };
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
      calendarVersion: 1,
      routineProfile: profile,
      routineSummary: boundText(payload.routine, MAX_ROUTINE_SUMMARY_LENGTH),
      day: week[VILLAGE_WEEKDAYS[(new Date(at).getDay() + 6) % 7]!]!,
      week,
      personalizationPending: false,
      personalizationFailure: "",
      generatedAt: at,
    },
  };
}

function invalidStarter(message: string): never {
  throw new RoutineResponseError(message);
}

function starterActivityTitle(value: unknown): string {
  const text = typeof value === "string" ? generatedAgendaActivityLabel(value.trim()) : "";
  if (!agendaActivityKey(text) || text.length > 80 || /[\u0000-\u001f]/u.test(text))
    invalidStarter("Each starter Agenda activity needs a short standalone label.");
  return text;
}

export function starterAgendaBase(payload: Record<string, unknown>, start: string, restFormat?: 1) {
  const first = new ZonedDate(`${start}T12:00:00.000Z`, "UTC");
  const invalid = invalidStarter;
  if (
    typeof payload.routine !== "string" ||
    !payload.routine.trim() ||
    !Number.isFinite(first.getTime()) ||
    !Array.isArray(payload.rest) ||
    payload.rest.length > 2
  )
    return invalid("The starter Agenda needs a summary and up to two recurring rest windows.");
  const restBlocks: VillageAgendaBlock[] = [];
  for (const rest of payload.rest) {
    let activity: unknown, from: unknown, to: unknown;
    if (restFormat === 1) {
      const { kind, label, startMinute, endMinute } = asRecord(rest);
      if (kind !== "sleep" && kind !== "nap" && kind !== "other")
        return invalid("A starter Agenda rest window needs a valid kind.");
      activity = kind === "sleep" ? "Sleeping" : kind === "nap" ? AGENDA_NAP_ACTIVITY : label;
      from = startMinute;
      to = endMinute;
    } else {
      if (!Array.isArray(rest) || (rest.length !== 2 && rest.length !== 3))
        return invalid("A starter Agenda rest window is invalid.");
      [activity, from, to] = rest.length === 2 ? ["Resting at home", ...rest] : rest;
    }
    if (
      typeof from !== "number" ||
      typeof to !== "number" ||
      !Number.isInteger(from) ||
      !Number.isInteger(to) ||
      from < 0 ||
      from >= 1440 ||
      to < 0 ||
      to > 1440 ||
      from === to
    )
      return invalid("A starter Agenda rest window is invalid.");
    const label = starterActivityTitle(activity);
    for (const [startMinute, endMinute] of from < to
      ? [[from, to]]
      : [
          [0, to],
          [from, 1440],
        ]) {
      if (startMinute < endMinute)
        restBlocks.push({ startMinute, endMinute, activity: label, venueId: "", essential: true, flexible: false });
    }
  }
  restBlocks.sort((a, b) => a.startMinute - b.startMinute);
  if (restBlocks.some((row, index) => index > 0 && row.startMinute < restBlocks[index - 1]!.endMinute))
    return invalid("Starter Agenda rest windows overlap.");
  const week = completeAgendaWeek(
    Object.fromEntries(VILLAGE_WEEKDAYS.map((day) => [day, restBlocks])),
    workingAgendaWeek(),
  );
  const agenda: VillageAgenda = {
    calendarVersion: 1,
    routineProfile: routineProfileFromWeek(week),
    routineSummary: boundText(payload.routine, MAX_ROUTINE_SUMMARY_LENGTH),
    day: week[VILLAGE_WEEKDAYS[(first.getDay() + 6) % 7]!]!,
    week,
    personalizationPending: false,
    personalizationFailure: "",
    generatedAt: new Date().toISOString(),
  };
  return { agenda, restBlocks, first };
}

function parseStarterWeek(
  payload: Record<string, unknown>,
  context: CompactFoundingContext,
  start: string,
): CompactFoundingResult {
  const { agenda, restBlocks, first } = starterAgendaBase(payload, start, context.starterRestFormat);
  const invalid = invalidStarter;
  if (!Array.isArray(payload.starterDays) || payload.starterDays.length !== AGENDA_WEEK_DAYS)
    return invalid("The starter Agenda needs plans for all seven days.");
  const slots: WeeklyAgendaSlot[] = [],
    choices: (WeeklyAgendaChoice | null)[] = [],
    fallback: Record<string, VillageAgendaBlock[]> = {};
  const distinct = new Set<string>();
  for (const [offset, entries] of payload.starterDays.entries()) {
    const date = shiftAgendaDate(first, offset);
    const blocks = [...restBlocks];
    fallback[VILLAGE_WEEKDAYS[(date.getDay() + 6) % 7]!] = blocks;
    const offered = weeklyAgendaSlots(agenda, date, context.characterId ?? context.card.id).slice(0, 8);
    if (!Array.isArray(entries) || entries.length !== 8 || !offered.length)
      return invalid("Each starter Agenda day needs eight activity choices and some waking time.");
    const wakingChoices = entries.flatMap((entry): WeeklyAgendaChoice[] => {
      if (!Array.isArray(entry) || entry.length !== 2) return invalid("A starter Agenda activity is invalid.");
      const [label, place] = entry;
      if (!Number.isInteger(place) || place < 0 || place > context.venues.length)
        return invalid("A starter Agenda activity has an unavailable place.");
      const activity = starterActivityTitle(label);
      if (restingAgendaBlock({ activity })) {
        if (!restBlocks.length) return invalid("Put recurring rest in the starter Agenda rest windows.");
        return [];
      }
      return [{ activity, venueId: place === 0 ? "" : context.venues[place - 1]!.id }];
    });
    if (!wakingChoices.length) return invalid("Each starter Agenda day needs waking activities.");
    const dayTitles = new Set<string>();
    for (const [index, slot] of offered.entries()) {
      const suggestion = wakingChoices[index];
      const key = suggestion ? agendaActivityKey(suggestion.activity) : "";
      const choice = suggestion && !dayTitles.has(key) ? suggestion : null;
      slots.push(slot);
      choices.push(choice);
      if (choice) {
        blocks.push({ ...choice, startMinute: slot.startMinute, endMinute: slot.endMinute, flexible: true });
        dayTitles.add(key);
        distinct.add(key);
      }
    }
  }
  if (distinct.size < Math.ceil(slots.length * 0.6)) return invalid("The starter Agenda repeats too many activities.");
  return {
    ...(context.identityDescriptionRevision
      ? { identityDescription: generatedIdentityDescription(payload.identityDescription) }
      : {}),
    agenda,
    starterWeek: {
      slots,
      choices,
      fallbackWeek: completeAgendaWeek(fallback, agenda.week!),
      through: agendaDateKey(shiftAgendaDate(first, AGENDA_WEEK_DAYS - 1)),
    },
  };
}

export function parseCompactFoundingCompletion(
  completion: { content?: string | null; finishReason?: string | null },
  context: CompactFoundingContext,
): CompactFoundingResult {
  const payload = extractModelJsonObject(completion);
  if (completion.finishReason === "length")
    throw new RoutineResponseError("Agenda output was truncated. Retry deliberately with enough output room.");
  if (!payload) throw new RoutineResponseError("The System model returned empty or invalid JSON for founding.");
  return parseCompactFounding(payload, context);
}
