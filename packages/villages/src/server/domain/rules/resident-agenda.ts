import { refreshWorkReservations } from "./venue-work.js";
import { calendarDate } from "../../../shared/helpers/zoned-date.js";
import type { VillageAgenda, VillageState, VillageVillager } from "../models/world.js";
import { activeAgendaSleep, agendaDateKey, ordinaryAgendaBlocksFor } from "./agenda-week.js";
import { influenceSettings, routineDay, validateRoutineDay } from "./owned-routine.js";
import { routineVenues } from "./prompt-preset.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";
import { AGENDA_WEEK_DAYS, shiftAgendaDate } from "./weekly-agenda.js";

export function planRoutineDays(state: VillageState, now: Date): void {
  refreshWorkReservations(state, now);
  for (const resident of [...state.villagers].sort((a, b) => a.characterId.localeCompare(b.characterId))) {
    const agenda = resident.agenda;
    if (!agenda) continue;
    agenda.plannedDays ??= {};
    for (let offset = 0; offset < 7; offset++) {
      const date = calendarDate(now, now.getFullYear(), now.getMonth(), now.getDate() + offset, 12),
        key = agendaDateKey(date);
      if (agenda.activeDay?.dateKey === key) {
        const sleep = activeAgendaSleep(agenda, now);
        if (sleep) agenda.activeDay.blocks = sleep;
        agenda.plannedDays[key] = agenda.activeDay.blocks;
        continue;
      }
      if (agenda.plannedDays[key]) {
        if (offset > 0)
          agenda.plannedDays[key] = validateRoutineDay(ordinaryAgendaBlocksFor(agenda, date), resident, state, date);
        continue;
      }
      const blocks = validateRoutineDay(
        !agenda.calendarVersion && agenda.routineProfile
          ? routineDay(
              agenda.routineProfile,
              agenda.generatedAt || agenda.routineSummary,
              date,
              agenda.scheduleInfluenceSnapshot,
              influenceSettings(resident.scheduleInfluence),
            )
          : ordinaryAgendaBlocksFor(agenda, date),
        resident,
        state,
        date,
      );
      agenda.plannedDays[key] = blocks;
    }
    const today = agendaDateKey(now);
    const oldest = agendaDateKey(shiftAgendaDate(now, -AGENDA_WEEK_DAYS));
    for (const key of Object.keys(agenda.plannedDays)) if (key < oldest) delete agenda.plannedDays[key];
    if (agenda.repairedDays) {
      agenda.repairedDays = agenda.repairedDays.filter(
        (key) => key >= today && Object.hasOwn(agenda.plannedDays!, key),
      );
      if (!agenda.repairedDays.length) delete agenda.repairedDays;
    }
  }
}
export function activateVillagerDay(villager: VillageVillager, now: Date, state: VillageState): void {
  const agenda = villager.agenda;
  if (!agenda) return;
  const key = agendaDateKey(now);
  const weekday = VILLAGE_WEEKDAYS[(now.getDay() + 6) % 7]!;
  const blocks = ordinaryAgendaBlocksFor(agenda, now, true);
  agenda.activeDay = {
    dateKey: key,
    weekday,
    blocks: agenda.plannedDays?.[key] ? blocks : validateRoutineDay(blocks, villager, state, now),
    scheduleInformed: false,
  };
}
/** An edited map cannot leave a daily plan pointing at a vanished public place. */
export function keepAgendaPlaces(state: VillageState): void {
  const publicIds = new Set(routineVenues(state.venues).map((venue) => venue.id));
  for (const villager of state.villagers) {
    if (!villager.agenda) continue;
    villager.agenda.day = villager.agenda.day.map((part) =>
      part.venueId && !publicIds.has(part.venueId)
        ? { ...part, venueId: "", activity: "taking it easy at home" }
        : part,
    );
    const repair = (week: VillageAgenda["week"]) =>
      week &&
      Object.fromEntries(
        Object.entries(week).map(([weekday, blocks]) => [
          weekday,
          blocks.map((part) =>
            part.venueId && !publicIds.has(part.venueId)
              ? {
                  ...part,
                  venueId: "",
                  activity: "Taking it easy at home",
                }
              : part,
          ),
        ]),
      );
    villager.agenda.week = repair(villager.agenda.week);
    if (villager.agenda.activeDay) {
      villager.agenda.activeDay.blocks = villager.agenda.activeDay.blocks.map((part) =>
        part.venueId && !publicIds.has(part.venueId)
          ? { ...part, venueId: "", activity: "Taking it easy at home" }
          : part,
      );
    }
  }
}
