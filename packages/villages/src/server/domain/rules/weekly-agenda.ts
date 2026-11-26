import { calendarAt, calendarDate, ZonedDate } from "../../../shared/helpers/zoned-date.js";
import type { Job } from "../models/background-model.js";
import type { VillageAgenda, VillageAgendaBlock, VillageState, VillageVillager } from "../models/world.js";
import { flexibleAgendaBlock, restingAgendaBlock } from "./agenda-flexibility.js";
import { agendaDateKey, ordinaryAgendaBlocksFor } from "./agenda-week.js";
import { validateRoutineDay } from "./owned-routine.js";
import { routineVenues } from "./prompt-preset.js";
import { accessibleVenueRoute } from "./venue-path.js";
import { zoneActivityFits } from "./venue-presence.js";
import { canOccupyZone, resolveVenueZone, venueZones, zoneClosed } from "./venue-zones.js";

export const AGENDA_WEEK_DAYS = 7;
const dayParts = [360, 720, 1020, 1440];
const openBlock = (block: VillageAgendaBlock) => flexibleAgendaBlock(block) && !restingAgendaBlock(block);

export const agendaActivityKey = (activity: string) =>
  activity
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

export function preparedAgendaThrough(agenda: VillageAgenda | null | undefined): string {
  const manual = agenda?.manualWeek?.through ?? "";
  const starter = agenda?.starterWeekThrough ?? "";
  return manual > starter ? manual : starter;
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

/** Plan contiguous stretches of free time, keeping activities within a part of the day. */
export function weeklyAgendaSlots(agenda: VillageAgenda, date: Date) {
  const periods = freeAgendaPeriods(agenda, date);
  return dayParts.flatMap((end, part) => {
    const start = dayParts[part - 1] ?? 0;
    return periods.flatMap((span) => {
      const from = Math.max(span.startMinute, start);
      const length = Math.min(span.endMinute, end) - from;
      if (length < 30) return [];
      const count = Math.ceil(length / 240);
      return Array.from({ length: count }, (_, index) => ({
        date: agendaDateKey(date),
        part,
        startMinute: from + Math.floor((index * length) / count),
        endMinute: from + Math.floor(((index + 1) * length) / count),
      }));
    });
  });
}

export type WeeklyAgendaSlot = ReturnType<typeof weeklyAgendaSlots>[number];
export type WeeklyAgendaChoice = { activity: string; venueId: string };

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
  preserveThrough = "",
): number {
  const agenda = resident.agenda;
  if (!agenda) return 0;
  const today = agendaDateKey(now);
  let placed = 0;
  for (const key of new Set(offered.map(({ date }) => date))) {
    if (key <= today || key <= preserveThrough || agenda.activeDay?.dateKey === key) continue;
    const date = calendarAt(now, key, 720);
    const livePeriods = freeAgendaPeriods(agenda, date);
    let blocks = ordinaryAgendaBlocksFor(agenda, date);
    const before = placed;
    for (const [index, slot] of offered.entries()) {
      if (slot.date !== key) continue;
      const choice = choices[index];
      if (!choice) continue;
      for (const available of livePeriods) {
        const startMinute = Math.max(available.startMinute, slot.startMinute);
        const endMinute = Math.min(available.endMinute, slot.endMinute);
        if (endMinute - startMinute < 30) continue;
        const [plan] = validateRoutineDay(
          [{ ...choice, startMinute, endMinute, flexible: true }],
          resident,
          state,
          date,
        );
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
      }
    }
    if (placed > before) (agenda.plannedDays ??= {})[key] = blocks.sort((a, b) => a.startMinute - b.startMinute);
  }
  return placed;
}
