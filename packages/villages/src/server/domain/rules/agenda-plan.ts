import type { VillageAgenda, VillageAgendaBlock } from "../models/world.js";
import { agendaBlocksFor, agendaDateKey, workingAgendaWeek } from "./agenda-week.js";
import { routineProfileFromWeek } from "./owned-routine.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";
import { flexibleAgendaBlock } from "./agenda-flexibility.js";

export const scheduledAgendaActivity = (block: VillageAgendaBlock) =>
  !(!block.venueId && flexibleAgendaBlock(block) && block.activity === "Taking care of their own affairs");

export { restingAgendaBlock } from "./agenda-flexibility.js";

export function generatedAgendaActivityLabel(activity: string): string {
  const label = activity.replace(/^right now,?\s+you(?:\s+are|['’]re)[\s,:-]+(?=\p{L})/iu, "");
  return label === activity ? activity : label.replace(/^\p{L}/u, (letter) => letter.toUpperCase());
}

export function unwrittenVillageAgenda(now = new Date()): VillageAgenda {
  const week = workingAgendaWeek();
  const weekday = VILLAGE_WEEKDAYS[(now.getDay() + 6) % 7]!;
  return {
    calendarVersion: 1,
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
