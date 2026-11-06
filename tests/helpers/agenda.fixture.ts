import type { VillageAgenda } from "../../packages/villages/src/server/domain/models/world.js";
import { completeAgendaWeek, workingAgendaWeek } from "../../packages/villages/src/server/domain/rules/agenda-week.js";
import { routineProfileFromWeek } from "../../packages/villages/src/server/domain/rules/owned-routine.js";
import { VILLAGE_WEEKDAYS } from "../../packages/villages/src/server/domain/rules/village-clock.js";

export function agendaFixture(value: Partial<VillageAgenda> = {}): VillageAgenda {
  const week = completeAgendaWeek(
    value.week ?? Object.fromEntries(VILLAGE_WEEKDAYS.map((day) => [day, value.day ?? []])),
    workingAgendaWeek(),
  );
  return {
    routineSummary: "",
    day: week.Monday!,
    generatedAt: "",
    ...value,
    week,
    routineProfile: value.routineProfile ?? routineProfileFromWeek(week),
  };
}
