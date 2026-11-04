import type { VillageState } from "../models/world.js";
import { agendaBlocksFor, agendaDateKey } from "./agenda-week.js";
import { calendarAt } from "../../../shared/helpers/zoned-date.js";
import { villagePresence } from "./village-projections.js";
import { MAX_ZONE_VILLAGERS } from "./venue-model.js";

/** Check every occupied interval, counting a requested group atomically. */
export function zoneActivityFits(
  state: VillageState,
  actorIds: readonly string[],
  venueId: string,
  zoneId: string,
  startMinute: number,
  endMinute: number,
  date: Date,
): boolean {
  if (actorIds.length > MAX_ZONE_VILLAGERS) return false;
  const boundaries = new Set([startMinute]);
  for (const resident of state.villagers) {
    if (!resident.agenda) continue;
    for (const block of agendaBlocksFor(resident.agenda, resident.ingestSchedule !== false, date)) {
      for (const minute of [block.startMinute, block.endMinute])
        if (minute > startMinute && minute < endMinute) boundaries.add(minute);
    }
  }
  for (const minute of boundaries) {
    const at = calendarAt(date, agendaDateKey(date), minute);
    const others = [...villagePresence(state, minute, at)].filter(
      ([id, position]) => !actorIds.includes(id) && position.id === venueId && position.zoneId === zoneId,
    );
    if (others.length + actorIds.length > MAX_ZONE_VILLAGERS) return false;
  }
  return true;
}
