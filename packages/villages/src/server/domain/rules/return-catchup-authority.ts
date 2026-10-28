import type { VillageState } from "../models/world.js";
import { planRoutineDays } from "./resident-agenda.js";
import { localDateKey } from "./resident-planning.js";

export const returnCatchupSubject = (batchId: string, opportunityId: string): string =>
  "return:" + batchId + ":" + opportunityId;
export class ReturnOpportunityUnavailable extends Error {}

/** Current-day projection may roll over while the captured routine stays unchanged. */
export function sameReturnResident(
  before: VillageState["villagers"][number],
  live: VillageState["villagers"][number],
  at: Date,
  historical: VillageState,
): boolean {
  const date = localDateKey(at);
  const { agenda: oldAgenda, ...oldResident } = before;
  const { agenda: newAgenda, ...newResident } = live;
  if (JSON.stringify(oldResident) !== JSON.stringify(newResident)) return false;
  if (!oldAgenda || !newAgenda) return oldAgenda === newAgenda;
  const { activeDay: oldDay, plannedDays: oldPlans, ...oldRoutine } = oldAgenda;
  const { activeDay: newDay, plannedDays: newPlans, ...newRoutine } = newAgenda;
  if (JSON.stringify(oldRoutine) !== JSON.stringify(newRoutine)) return false;
  if (oldDay?.dateKey === newDay?.dateKey && JSON.stringify(oldDay) !== JSON.stringify(newDay)) return false;
  if (newPlans?.[date]) {
    let expected = oldPlans?.[date] ?? (oldDay?.dateKey === date ? oldDay.blocks : undefined);
    if (!expected) {
      const projected = structuredClone(historical);
      planRoutineDays(projected, at);
      expected = projected.villagers.find((row) => row.characterId === before.characterId)?.agenda?.plannedDays?.[date];
    }
    if (JSON.stringify(expected) !== JSON.stringify(newPlans[date])) return false;
  }
  return true;
}
