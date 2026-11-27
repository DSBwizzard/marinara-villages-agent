import type { VillageAgenda } from "../../packages/villages/src/server/domain/models/world.js";
import { completeAgendaWeek, workingAgendaWeek } from "../../packages/villages/src/server/domain/rules/agenda-week.js";
import { routineProfileFromWeek } from "../../packages/villages/src/server/domain/rules/owned-routine.js";
import { VILLAGE_WEEKDAYS } from "../../packages/villages/src/server/domain/rules/village-clock.js";

export function starterAgendaReply(label = "Starter activity", place: number | string = 0) {
  return {
    rest: [{ kind: "sleep", startMinute: 1320, endMinute: 480 }],
    starterDays: Array.from({ length: 7 }, (_, day) =>
      Array.from({ length: 8 }, (_, slot) => [`${label} ${day + 1}/${slot + 1}`, place]),
    ),
  };
}

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
