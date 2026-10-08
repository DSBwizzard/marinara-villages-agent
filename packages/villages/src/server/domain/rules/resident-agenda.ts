import type { VillageAgenda, VillageState, VillageVillager } from "../models/world.js";
import { agendaBlocksFor, agendaDateKey } from "./agenda-week.js";
import { influenceSettings, routineDay, validateRoutineDay } from "./owned-routine.js";
import { remapVenues } from "./prompt-preset.js";
import { venueResidentIds } from "./venue-model.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";

export function planRoutineDays(state: VillageState, now: Date): void {
  for (const resident of [...state.villagers].sort((a, b) => a.characterId.localeCompare(b.characterId))) {
    const agenda = resident.agenda;
    if (!agenda?.routineProfile) continue;
    agenda.plannedDays ??= {};
    for (let offset = 0; offset < 7; offset++) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, 12),
        key = agendaDateKey(date);
      if (agenda.activeDay?.dateKey === key) {
        agenda.plannedDays[key] = agenda.activeDay.blocks;
        continue;
      }
      if (agenda.plannedDays[key]) {
        if (offset > 0) agenda.plannedDays[key] = validateRoutineDay(agenda.plannedDays[key]!, resident, state, date);
        continue;
      }
      let blocks = validateRoutineDay(
        routineDay(
          agenda.routineProfile,
          agenda.generatedAt || agenda.routineSummary,
          date,
          agenda.scheduleInfluenceSnapshot,
          influenceSettings(resident.scheduleInfluence),
        ),
        resident,
        state,
        date,
      );
      blocks = blocks.map((block) => {
        if (!block.venueId) return block;
        const otherBlocks = state.villagers
          .filter((other) => other.characterId !== resident.characterId)
          .map((other) => {
            const home = state.venues.find((venue) => venueResidentIds(venue).includes(other.characterId))?.id ?? "";
            return {
              blocks:
                other.agenda?.plannedDays?.[key] ?? (other.agenda ? agendaBlocksFor(other.agenda, false, date) : []),
              home,
            };
          });
        const boundaries = new Set([
          block.startMinute,
          ...otherBlocks.flatMap((other) =>
            other.blocks
              .filter((row) => row.startMinute > block.startMinute && row.startMinute < block.endMinute)
              .map((row) => row.startMinute),
          ),
        ]);
        const full = [...boundaries].some(
          (minute) =>
            otherBlocks.filter(
              (other) =>
                (other.blocks.find((row) => row.startMinute <= minute && row.endMinute > minute)?.venueId ||
                  other.home) === block.venueId,
            ).length >= 4,
        );
        return full
          ? {
              ...block,
              venueId: "",
              zoneId: undefined,
              activity: "Taking care of their own affairs",
              status: "idle" as const,
              flexible: true,
            }
          : block;
      });
      agenda.plannedDays[key] = blocks;
    }
    const today = agendaDateKey(now);
    for (const key of Object.keys(agenda.plannedDays)) if (key < today) delete agenda.plannedDays[key];
  }
}
export function activateVillagerDay(villager: VillageVillager, now: Date, state: VillageState): void {
  const agenda = villager.agenda;
  if (!agenda) return;
  const weekday = VILLAGE_WEEKDAYS[(now.getDay() + 6) % 7]!;
  agenda.activeDay = {
    dateKey: agendaDateKey(now),
    weekday,
    blocks:
      agenda.plannedDays?.[agendaDateKey(now)] ??
      validateRoutineDay(agendaBlocksFor(agenda, false, now), villager, state, now),
    scheduleInformed: false,
  };
}
/** An edited map cannot leave a daily plan pointing at a vanished public place. */
export function keepAgendaPlaces(state: VillageState): void {
  const publicIds = new Set(remapVenues(state.venues).map((venue) => venue.id));
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
                  reason: "The previous place is unavailable",
                }
              : part,
          ),
        ]),
      );
    villager.agenda.week = repair(villager.agenda.week);
    villager.agenda.scheduleWeek = repair(villager.agenda.scheduleWeek ?? undefined) ?? null;
    if (villager.agenda.activeDay) {
      villager.agenda.activeDay.blocks = villager.agenda.activeDay.blocks.map((part) =>
        part.venueId && !publicIds.has(part.venueId)
          ? { ...part, venueId: "", activity: "Taking it easy at home", reason: "The previous place is unavailable" }
          : part,
      );
    }
  }
}
