import type { VillageAgenda, VillageAgendaBlock, VillageState } from "../models/world.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { agendaBlocksFor, agendaDateKey } from "./agenda-week.js";
import { scheduledAgendaActivity } from "./agenda-plan.js";

export const MAX_AGENDA_CHANGES = 6;
type AgendaSource = Pick<
  VillageAgenda,
  | "calendarVersion"
  | "restLabelFormat"
  | "week"
  | "day"
  | "activeDay"
  | "plannedDays"
  | "repairedDays"
  | "reservations"
  | "routineProfile"
  | "routineSummary"
  | "generatedAt"
>;
const source = (agenda: AgendaSource): AgendaSource => ({
  calendarVersion: agenda.calendarVersion,
  restLabelFormat: agenda.restLabelFormat,
  routineProfile: agenda.routineProfile,
  routineSummary: agenda.routineSummary,
  generatedAt: agenda.generatedAt,
  day: agenda.day,
  week: agenda.week,
  activeDay: agenda.activeDay,
  plannedDays: agenda.plannedDays,
  repairedDays: agenda.repairedDays,
  reservations: agenda.reservations,
});

export function agendaChangeSources(state: VillageState) {
  return new Map(
    state.villagers.flatMap(({ characterId, incarnation, agenda }) =>
      agenda?.calendarVersion
        ? [[characterId, { incarnation, calendar: JSON.stringify(source(agenda)) }] as const]
        : [],
    ),
  );
}

export function recentAgendaChanges(agenda: VillageAgenda, when: ZonedDate) {
  const yesterday = new ZonedDate(when, when.zone);
  yesterday.setDate(yesterday.getDate() - 1);
  const oldest = agendaDateKey(yesterday);
  return (agenda.recentChanges ?? []).filter((change) => {
    const changed = new ZonedDate(change.changedAt, when.zone);
    return changed <= when && agendaDateKey(changed) >= oldest;
  });
}

const sameActivity = (a: VillageAgendaBlock, b: VillageAgendaBlock) =>
  a.activity === b.activity && a.venueId === b.venueId && (!a.zoneId || !b.zoneId || a.zoneId === b.zoneId);

/** Compare effective schedules at the same civil time, after a successful world mutation. */
export function recordAgendaChanges(state: VillageState, before: ReturnType<typeof agendaChangeSources>, now: Date) {
  if (!before.size) return;
  const when = new ZonedDate(now, state.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone);
  const today = agendaDateKey(when);
  const minute = when.getHours() * 60 + when.getMinutes();
  for (const { characterId, incarnation, agenda } of state.villagers) {
    if (!agenda) continue;
    const previous = before.get(characterId);
    if (!previous || previous.incarnation !== incarnation) continue;
    const retained = recentAgendaChanges(agenda, when);
    const changes: NonNullable<VillageAgenda["recentChanges"]> = [];
    if (previous.calendar !== JSON.stringify(source(agenda))) {
      const oldAgenda = JSON.parse(previous.calendar) as AgendaSource;
      const date = new ZonedDate(when, when.zone);
      for (let offset = 0; offset < 7 && changes.length < MAX_AGENDA_CHANGES; offset++) {
        if (offset) date.setDate(date.getDate() + 1);
        const key = agendaDateKey(date);
        const nowBlocks = agendaBlocksFor(agenda, date);
        for (const old of agendaBlocksFor(oldAgenda, date)) {
          if (changes.length >= MAX_AGENDA_CHANGES) break;
          const start = Math.max(old.startMinute, key === today ? minute : 0);
          if (old.endMinute <= start || !scheduledAgendaActivity(old)) continue;
          const replacement = nowBlocks.find(
            (block) => block.startMinute < old.endMinute && block.endMinute > start && !sameActivity(old, block),
          );
          // A plain rollover can materialize a date without changing the activity.
          if (!replacement) continue;
          changes.push({
            changedAt: now.toISOString(),
            date: key,
            startMinute: Math.max(start, replacement.startMinute),
            endMinute: Math.min(old.endMinute, replacement.endMinute),
            previous: old.activity,
            ...(scheduledAgendaActivity(replacement) && old.activity !== replacement.activity
              ? { replacement: replacement.activity }
              : {}),
          });
        }
      }
    }
    const recent = [...changes, ...retained].slice(0, MAX_AGENDA_CHANGES);
    if (recent.length) agenda.recentChanges = recent;
    else delete agenda.recentChanges;
  }
}
