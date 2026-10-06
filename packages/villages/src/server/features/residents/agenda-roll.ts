import type { VillageState } from "../../domain/models/world.js";
import { agendaDateKey } from "../../domain/rules/agenda-week.js";
import { activateVillagerDay, planRoutineDays } from "../../domain/rules/resident-agenda.js";
import { mutateVillageState, readVillageState } from "../world/village-store.js";

export async function rollActiveAgendas(now: Date, known?: VillageState): Promise<boolean> {
  const village = known ?? (await readVillageState());
  if (village.villagers.every((villager) => villager.agenda?.activeDay?.dateKey === agendaDateKey(now))) return false;
  await mutateVillageState((state) => {
    planRoutineDays(state, now);
    for (const villager of state.villagers) {
      if (villager.agenda?.activeDay?.dateKey !== agendaDateKey(now)) activateVillagerDay(villager, now, state);
    }
  });
  return true;
}
