import { calendarAt, calendarDate, ZonedDate } from "../../../shared/helpers/zoned-date.js";
import type { Job } from "../models/background-model.js";
import type { VillageAgenda, VillageAgendaBlock, VillageState, VillageVillager } from "../models/world.js";
import { AGENDA_NAP_ACTIVITY, fixedRestAgendaBlock, flexibleAgendaBlock } from "./agenda-flexibility.js";
import { agendaDateKey, ordinaryAgendaBlocksFor } from "./agenda-week.js";
import { validateRoutineDay } from "./owned-routine.js";
import { routineVenues } from "./prompt-preset.js";
import { accessibleVenueRoute } from "./venue-path.js";
import { zoneActivityFits } from "./venue-presence.js";
import { canOccupyZone, resolveVenueZone, venueZones, zoneClosed } from "./venue-zones.js";
import { hashString } from "./village-clock.js";
import { conflict } from "./errors.js";

export const AGENDA_WEEK_DAYS = 7;
const dayParts = [360, 720, 1020, 1440];
const minActivityMinutes = 30;
const maxActivityMinutes = 240;
const openBlock = (block: VillageAgendaBlock) => flexibleAgendaBlock(block) && !fixedRestAgendaBlock(block);

export const agendaActivityKey = (activity: string) =>
  activity
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

export function preparedAgendaThrough(agenda: VillageAgenda | null | undefined): string {
  return [agenda?.manualWeek?.through ?? "", agenda?.starterWeekThrough ?? "", agenda?.weeklyThrough ?? ""]
    .sort()
    .at(-1)!;
}

export function agendaReadyOn(agenda: VillageAgenda | null, date: string): boolean {
  if (!agenda) return false;
  if ((agenda.starterWeekThrough ?? "") >= date) return true;
  if (agenda.weeklyFrom && agenda.weeklyThrough && agenda.weeklyFrom <= date && agenda.weeklyThrough >= date)
    return true;
  const manual = agenda.manualWeek;
  if (!manual || manual.through < date) return false;
  const through = Date.parse(manual.through);
  if (!Number.isFinite(through)) return false;
  const from = manual.from ?? new Date(through - (AGENDA_WEEK_DAYS - 1) * 86_400_000).toISOString().slice(0, 10);
  return from <= date;
}

export function weeklyAgendaResidents(state: Pick<VillageState, "villagers" | "foundingPreparation">) {
  if (state.foundingPreparation && state.foundingPreparation.status !== "ready") return [];
  const started = state.villagers.some(
    ({ agenda }) =>
      agenda &&
      (agenda.starterWeekThrough || agenda.manualWeek || agenda.weeklyThrough || agenda.personalizationPending),
  );
  if (!started) return [];
  return state.villagers.filter(({ agenda }) => agenda?.calendarVersion === 1);
}

export function agendaCoverage(state: Pick<VillageState, "villagers" | "foundingPreparation" | "timeZone">, now: Date) {
  const today = agendaCalendar(state, now);
  const residents = weeklyAgendaResidents(state);
  const readyOn = (day: Date) => residents.filter(({ agenda }) => agendaReadyOn(agenda, agendaDateKey(day)));
  const ready = readyOn(today);
  const start = ready.length === residents.length ? shiftAgendaDate(today, 1) : today;
  return { today, start, residents, ready, prepared: readyOn(start) };
}

export function assertTodayAgendas(state: VillageState, now: Date) {
  const { residents, ready } = agendaCoverage(state, now);
  if (ready.length !== residents.length) throw conflict("Wait for today’s Agendas to finish preparing.");
}

export function shiftAgendaDate(date: Date, days: number): Date {
  return calendarDate(date, date.getFullYear(), date.getMonth(), date.getDate() + days, 12);
}

export function agendaCalendar(state: Pick<VillageState, "timeZone">, now: Date): Date {
  return state.timeZone ? new ZonedDate(now, state.timeZone) : now;
}

export function weeklyAgendaVenues(state: VillageState, residentId: string, start: Date) {
  const key = agendaDateKey(start);
  return routineVenues(state.venues).filter((place) =>
    venueZones(place).some(
      (zone) =>
        !zoneClosed(state, place, zone) &&
        [480, 780, 1140].some((minute) =>
          canOccupyZone(place, zone, residentId, { at: calendarAt(start, key, minute), environment: state.narrative }),
        ),
    ),
  );
}

/** Admission uses civil dates, including when a week spans a clock change. */
export function weeklyAgendaDue(prior: Job | null, seed: string, start: string): boolean {
  if (prior?.seed !== seed || !prior.highWaterDate) return true;
  if (prior.replacement || prior.status === "running") return false;
  const elapsed = (Date.parse(start) - Date.parse(prior.highWaterDate)) / 86_400_000;
  return (
    elapsed >= AGENDA_WEEK_DAYS ||
    (elapsed > 0 &&
      ["paused", "queued", "obsolete"].includes(prior.status) &&
      prior.requests === 0 &&
      !prior.attemptHistory?.some(({ requests }) => requests > 0))
  );
}

function freeAgendaPeriods(agenda: VillageAgenda, date: Date) {
  const key = agendaDateKey(date);
  if (agenda.repairedDays?.includes(key)) return [];
  const reservations = (agenda.reservations ?? []).filter((entry) => entry.dateKey === key);
  const spans = ordinaryAgendaBlocksFor(agenda, date)
    .filter(openBlock)
    .flatMap(({ startMinute, endMinute }) => {
      let free = [{ startMinute, endMinute }];
      for (const reserved of reservations) {
        free = free.flatMap((span) =>
          span.endMinute <= reserved.startMinute || span.startMinute >= reserved.endMinute
            ? [span]
            : [
                { startMinute: span.startMinute, endMinute: reserved.startMinute },
                { startMinute: reserved.endMinute, endMinute: span.endMinute },
              ].filter((piece) => piece.startMinute < piece.endMinute),
        );
      }
      return free;
    });
  const joined: typeof spans = [];
  for (const span of spans) {
    const previous = joined.at(-1);
    if (previous?.endMinute === span.startMinute) previous.endMinute = span.endMinute;
    else joined.push(span);
  }
  return joined;
}

/** Give each date its own rhythm within contiguous stretches of free time. */
export function weeklyAgendaSlots(agenda: VillageAgenda, date: Date, residentId: string) {
  const key = agendaDateKey(date);
  const periods = freeAgendaPeriods(agenda, date);
  const slots = dayParts.flatMap((end, part) => {
    const start = dayParts[part - 1] ?? 0;
    return periods.flatMap((span) => {
      const from = Math.max(span.startMinute, start);
      const length = Math.min(span.endMinute, end) - from;
      if (length < minActivityMinutes) return [];
      const count = Math.ceil(length / maxActivityMinutes);
      return Array.from({ length: count }, (_, index) => ({
        date: key,
        part,
        startMinute: from + Math.floor((index * length) / count),
        endMinute: from + Math.floor(((index + 1) * length) / count),
      }));
    });
  });
  // Slide shared boundaries only where both blocks are flexible, in quarter-hour steps.
  for (let index = 1; index < slots.length; index++) {
    const previous = slots[index - 1]!;
    const next = slots[index]!;
    if (previous.endMinute !== next.startMinute) continue;
    const earliest = Math.max(previous.startMinute + minActivityMinutes, next.endMinute - maxActivityMinutes);
    const latest = Math.min(previous.startMinute + maxActivityMinutes, next.endMinute - minActivityMinutes);
    const shift = ((hashString(`${residentId}:${key}:${next.startMinute}`) % 7) - 3) * 15;
    const boundary = Math.max(earliest, Math.min(latest, next.startMinute + shift));
    previous.endMinute = boundary;
    next.startMinute = boundary;
  }
  return slots;
}

export type WeeklyAgendaSlot = ReturnType<typeof weeklyAgendaSlots>[number];
export type WeeklyAgendaChoice = { activity: string; venueId: string; maxMinutes?: number; nap?: true };

export function weeklyChoiceBlock(
  choice: WeeklyAgendaChoice,
  startMinute: number,
  endMinute: number,
): VillageAgendaBlock {
  return {
    activity: choice.activity,
    venueId: choice.venueId,
    startMinute,
    endMinute: Math.min(
      endMinute,
      startMinute + (choice.maxMinutes ?? (choice.activity === AGENDA_NAP_ACTIVITY ? 60 : 1440)),
    ),
    flexible: true,
    ...(choice.nap ? { restKind: "nap" as const } : {}),
  };
}

function venueFits(state: VillageState, residentId: string, date: Date, block: VillageAgendaBlock): boolean {
  if (!block.venueId) return true;
  const venue = state.venues.find(({ id }) => id === block.venueId);
  const zone = venue && resolveVenueZone(venue, block.zoneId ?? "");
  if (!venue || !zone) return false;
  const accessible = (at: Date) =>
    canOccupyZone(venue, zone, residentId, { at, environment: state.narrative }) &&
    accessibleVenueRoute(state, venue, residentId, zone.id, at);
  let available = !!accessible(calendarAt(date, agendaDateKey(date), block.endMinute - 1));
  return (
    available &&
    zoneActivityFits(
      state,
      [residentId],
      venue.id,
      (at) => {
        available &&= !!accessible(at);
        return available ? zone.id : undefined;
      },
      block.startMinute,
      block.endMinute,
      date,
    ) &&
    available
  );
}

/** Recheck free time against live reservations and compose into the owner’s dated Agenda. */
export function applyWeeklyAgenda(
  state: VillageState,
  resident: VillageVillager,
  now: Date,
  offered: readonly WeeklyAgendaSlot[],
  choices: readonly (WeeklyAgendaChoice | null)[],
  {
    preserveThrough = "",
    todayAfter,
    onPlaced,
    preserveDate,
  }: {
    preserveThrough?: string;
    todayAfter?: number;
    onPlaced?: (date: string) => void;
    preserveDate?: (date: string) => boolean;
  } = {},
): number {
  const agenda = resident.agenda;
  if (!agenda) return 0;
  const today = agendaDateKey(now);
  let placed = 0;
  for (const key of new Set(offered.map(({ date }) => date))) {
    const planToday = key === today && todayAfter !== undefined;
    if (
      key <= preserveThrough ||
      preserveDate?.(key) ||
      (!planToday && (key <= today || agenda.activeDay?.dateKey === key))
    )
      continue;
    const date = calendarAt(now, key, 720);
    const livePeriods = freeAgendaPeriods(agenda, date);
    let blocks = ordinaryAgendaBlocksFor(agenda, date);
    const before = placed;
    for (const [index, slot] of offered.entries()) {
      if (slot.date !== key) continue;
      const choice = choices[index];
      if (!choice) continue;
      for (const available of livePeriods) {
        const startMinute = Math.max(available.startMinute, slot.startMinute, planToday ? todayAfter : 0);
        const block = weeklyChoiceBlock(choice, startMinute, Math.min(available.endMinute, slot.endMinute));
        const { endMinute } = block;
        if (endMinute - startMinute < minActivityMinutes) continue;
        const [plan] = validateRoutineDay([block], resident, state, date);
        if (!plan || plan.venueId !== choice.venueId || !venueFits(state, resident.characterId, date, plan)) continue;
        blocks = blocks.flatMap((block) =>
          block.endMinute <= startMinute || block.startMinute >= endMinute
            ? [block]
            : [
                ...(block.startMinute < startMinute ? [{ ...block, endMinute: startMinute }] : []),
                ...(block.endMinute > endMinute ? [{ ...block, startMinute: endMinute }] : []),
              ],
        );
        blocks.push(plan);
        placed++;
        if (choice.maxMinutes !== undefined || choice.activity === AGENDA_NAP_ACTIVITY) break;
      }
    }
    if (placed > before) {
      (agenda.plannedDays ??= {})[key] = blocks.sort((a, b) => a.startMinute - b.startMinute);
      if (agenda.activeDay?.dateKey === key) agenda.activeDay.blocks = blocks;
      onPlaced?.(key);
    }
  }
  return placed;
}
