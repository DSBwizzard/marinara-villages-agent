import type { VillageState, VillageVenue } from "../models/world.js";
import type { VenueWork } from "../../../shared/helpers/venue-work.js";
import { WORK_DAYS, workOverlap } from "../../../shared/helpers/venue-work.js";
import { calendarDate, ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { agendaDateKey } from "../../../shared/helpers/calendar-day.js";
import { badRequest } from "./errors.js";
import { contactNeighborIds } from "../../../shared/helpers/zone-contact.js";

export function validateVenueWork(venue: VillageVenue, work: VenueWork): void {
  const zones = venue.zones ?? [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])];
  if (
    !work.accessZoneIds.includes(work.zoneId) ||
    new Set(work.accessZoneIds).size !== work.accessZoneIds.length ||
    new Set(work.days).size !== work.days.length ||
    work.accessZoneIds.some((id) => {
      const zone = zones.find((row) => row.id === id);
      return (
        !zone ||
        ("kind" in zone && zone.kind === "exterior") ||
        ("ownerId" in zone && zone.ownerId && zone.ownerId !== work.characterId)
      );
    })
  )
    throw badRequest("Choose the work Zone and only the rooms this worker may use.");
  const reachable = new Set(["exterior"]),
    queue = ["exterior"];
  for (const id of queue)
    for (const next of contactNeighborIds(zones, id))
      if (work.accessZoneIds.includes(next) && !reachable.has(next)) {
        reachable.add(next);
        queue.push(next);
      }
  if (!reachable.has(work.zoneId)) throw badRequest("Include every Zone on the worker’s route from Entrance.");
}
export function assertWorkSchedules(venues: VillageVenue[], workers?: readonly string[]): void {
  const accepted: VenueWork[] = [];
  for (const venue of venues)
    for (const work of venue.access?.work ?? []) {
      validateVenueWork(venue, work);
      if (workers && !workers.includes(work.characterId)) throw badRequest("Choose a current Villager as the worker.");
      if (!venue.workerIds?.includes(work.characterId) || accepted.some((other) => workOverlap(work, other)))
        throw badRequest("A worker cannot have overlapping work arrangements.");
      accepted.push(work);
    }
}
/** Rebuild for the queried civil week, including historical absence projections. */
export function refreshWorkReservations(state: VillageState, now: Date): void {
  for (const resident of state.villagers) {
    if (!resident.agenda) continue;
    resident.agenda.reservations = (resident.agenda.reservations ?? []).filter((row) => row.source !== "work");
    for (const venue of state.venues)
      for (const work of venue.access?.work ?? []) {
        if (work.characterId !== resident.characterId) continue;
        for (let offset = 0; offset < 8; offset++) {
          const date = calendarDate(now, now.getFullYear(), now.getMonth(), now.getDate() + offset, 12);
          if (!work.days.includes(WORK_DAYS[(date.getDay() + 6) % 7]!)) continue;
          resident.agenda.reservations.push({
            id: `work:${venue.id}:${work.characterId}`,
            source: "work",
            dateKey: agendaDateKey(date),
            startMinute: work.startMinute,
            endMinute: work.endMinute,
            venueId: venue.id,
            zoneId: work.zoneId,
            activity: work.activity,
            replaces: "routine",
          });
        }
      }
  }
}
export function workClock(state: VillageState): Date {
  const instant = Date.parse(state.simulatedThrough || state.setupAt || state.foundedAt);
  return state.timeZone ? new ZonedDate(instant, state.timeZone) : new Date(instant);
}
