import type { VillageState } from "../models/world.js";
import { planRoutineDays } from "./resident-agenda.js";
import { localDateKey } from "./resident-planning.js";
import { cloneVillageContext } from "./world-context-copy.js";

export const returnCatchupSubject = (batchId: string, opportunityId: string): string =>
  "return:" + batchId + ":" + opportunityId;
export class ReturnOpportunityUnavailable extends Error {}

/** Current-day projection may roll over while the captured routine stays unchanged. */
export function sameReturnResident(
  before: VillageState["villagers"][number],
  live: VillageState["villagers"][number],
  at: Date,
  historical: VillageState,
  current: VillageState,
): boolean {
  const work = (world: VillageState) =>
    world.venues
      .flatMap((venue) =>
        (venue.access?.work ?? [])
          .filter((row) => row.characterId === before.characterId)
          .map((terms) => ({ venueId: venue.id, terms })),
      )
      .sort((a, b) => a.venueId.localeCompare(b.venueId));
  if (JSON.stringify(work(historical)) !== JSON.stringify(work(current))) return false;
  const date = localDateKey(at);
  const { agenda: oldAgenda, ...oldResident } = before;
  const { agenda: newAgenda, ...newResident } = live;
  if (JSON.stringify(oldResident) !== JSON.stringify(newResident)) return false;
  if (!oldAgenda || !newAgenda) return oldAgenda === newAgenda;
  const {
    activeDay: oldDay,
    plannedDays: oldPlans,
    manualWeek: _oldManualWeek,
    repairedDays: _oldRepairs,
    calendarVersion: _oldCalendarVersion,
    recentChanges: _oldChanges,
    ...oldRoutine
  } = oldAgenda;
  const {
    activeDay: newDay,
    plannedDays: newPlans,
    manualWeek: _newManualWeek,
    repairedDays: _newRepairs,
    calendarVersion: _newCalendarVersion,
    recentChanges: _newChanges,
    ...newRoutine
  } = newAgenda;
  // Work dates are a derived query window; compare their accepted terms above instead.
  const withoutWork = (routine: typeof oldRoutine) => ({
    ...routine,
    reservations: routine.reservations?.filter((row) => row.source !== "work"),
  });
  if (JSON.stringify(withoutWork(oldRoutine)) !== JSON.stringify(withoutWork(newRoutine))) return false;
  if (oldDay?.dateKey === newDay?.dateKey && JSON.stringify(oldDay) !== JSON.stringify(newDay)) return false;
  if (newPlans?.[date]) {
    let expected = oldPlans?.[date] ?? (oldDay?.dateKey === date ? oldDay.blocks : undefined);
    if (!expected) {
      const projected = cloneVillageContext(historical);
      planRoutineDays(projected, at);
      expected = projected.villagers.find((row) => row.characterId === before.characterId)?.agenda?.plannedDays?.[date];
    }
    if (JSON.stringify(expected) !== JSON.stringify(newPlans[date])) return false;
  }
  return true;
}
