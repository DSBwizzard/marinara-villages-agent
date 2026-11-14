import type { VillageAgenda, VillageAgendaBlock } from "../models/world.js";
import { agendaBlocksFor, agendaDateKey, workingAgendaWeek } from "./agenda-week.js";
import { routineProfileFromWeek } from "./owned-routine.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";

export function restingAgendaBlock(block: Pick<VillageAgendaBlock, "activity"> | null): boolean {
  return /\b(?:sleep(?:ing)?|asleep|hibernate|hibernating|dormant)\b/iu.test(block?.activity ?? "");
}

export function unwrittenVillageAgenda(now = new Date()): VillageAgenda {
  const week = workingAgendaWeek();
  const weekday = VILLAGE_WEEKDAYS[(now.getDay() + 6) % 7]!;
  return {
    routineProfile: routineProfileFromWeek(week),
    routineSummary: "An ordinary day around the village.",
    day: structuredClone(week[weekday]!),
    week,
    activeDay: { dateKey: agendaDateKey(now), weekday, blocks: week[weekday]!, scheduleInformed: false },
    personalizationPending: true,
    generatedAt: "",
  };
}

export function agendaAt(
  agenda: VillageAgenda | null,
  minuteOfDay: number,
  at = new Date(),
): VillageAgendaBlock | null {
  return agenda
    ? (agendaBlocksFor(agenda, at).find((entry) => minuteOfDay >= entry.startMinute && minuteOfDay < entry.endMinute) ??
        null)
    : null;
}
