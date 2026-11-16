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
        if (agendaDateKey(at) === agendaDateKey(date))
          include(at.getHours() * 60 + at.getMinutes() + Number(at.getSeconds() > 0 || at.getMilliseconds() > 0));
      }
    }
  }
  for (const minute of boundaries) {
    const at = calendarAt(date, agendaDateKey(date), minute);
    const zoneId = typeof zone === "string" ? zone : zone(at, minute);
    if (!zoneId) continue;
    const others = [...villagePresence(state, minute, at)].filter(
      ([id, position]) => !actorIds.includes(id) && position.id === venueId && position.zoneId === zoneId,
    );
    if (others.length + actorIds.length > MAX_ZONE_VILLAGERS) return false;
  }
  return true;
}
