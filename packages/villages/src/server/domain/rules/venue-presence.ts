import type { VillageState } from "../models/world.js";
import { agendaBlocksFor, agendaDateKey } from "./agenda-week.js";
import { calendarAt, ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { villagePresence } from "./village-projections.js";
import { MAX_ZONE_VILLAGERS } from "./venue-model.js";

/** Check every occupied interval, counting a requested group atomically. */
export function zoneActivityFits(
  state: VillageState,
  actorIds: readonly string[],
  venueId: string,
  zone: string | ((at: Date, minute: number) => string | undefined),
  startMinute: number,
  endMinute: number,
  date: Date,
): boolean {
  if (actorIds.length > MAX_ZONE_VILLAGERS) return false;
  const boundaries = new Set([startMinute]);
  const exact: [Date, number][] = [];
  const dateKey = agendaDateKey(date);
  const include = (minute: number) => {
    if (minute > startMinute && minute < endMinute) boundaries.add(minute);
  };
  for (const resident of state.villagers) {
    if (!resident.agenda) continue;
    for (const block of agendaBlocksFor(resident.agenda, date)) {
      include(block.startMinute);
      include(block.endMinute);
    }
  }
  if (typeof zone === "function") {
    for (const venue of state.venues) {
      for (const hours of [
        venue.access?.visitorHours,
        ...(venue.zones ?? []).map((entry) => entry.access?.visitorHours),
      ]) {
        if (!Array.isArray(hours)) continue;
        for (const { start, end } of hours) {
          for (const clock of [start, end]) include(Number(clock.slice(0, 2)) * 60 + Number(clock.slice(3)));
        }
      }
    }
    for (const condition of state.narrative?.conditions ?? []) {
      for (const instant of [condition.startsAt, condition.endsAt, condition.clearedAt]) {
        if (!instant) continue;
        const at = date instanceof ZonedDate ? new ZonedDate(instant, date.zone) : new Date(instant);
        const minute = at.getHours() * 60 + at.getMinutes();
        if (minute >= startMinute && minute < endMinute && agendaDateKey(at) === dateKey) exact.push([at, minute]);
      }
    }
    const offsetChange =
      calendarAt(date, dateKey, 1440).getTimezoneOffset() - calendarAt(date, dateKey).getTimezoneOffset();
    if (offsetChange > 0) {
      // A civil-time Agenda also runs during the later occurrence of a repeated minute.
      for (let minute = startMinute; minute < endMinute; minute++) {
        const at = calendarAt(date, dateKey, minute);
        at.setTime(at.getTime() + offsetChange * 60_000);
        if (at.getHours() * 60 + at.getMinutes() === minute && agendaDateKey(at) === dateKey) exact.push([at, minute]);
      }
    }
  }
  for (const [at, minute] of [
    ...Array.from(boundaries, (minute) => [calendarAt(date, dateKey, minute), minute] as const),
    ...exact,
  ]) {
    const zoneId = typeof zone === "string" ? zone : zone(at, minute);
    if (!zoneId) continue;
    const others = [...villagePresence(state, minute, at)].filter(
      ([id, position]) => !actorIds.includes(id) && position.id === venueId && position.zoneId === zoneId,
    );
    if (others.length + actorIds.length > MAX_ZONE_VILLAGERS) return false;
  }
  return true;
}
