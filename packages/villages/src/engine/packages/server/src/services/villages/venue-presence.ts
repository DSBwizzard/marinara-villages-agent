import { conflict } from "./errors.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";
import type { VillageAgenda, VillageAgendaBlock, VillageState, VillageVillager } from "./types.js";
import { venueResidentIds } from "./venue-model.js";

/** Reject a schedule that would put a fifth villager in any Venue at once. */
export function assertVillagePresence(state: VillageState, candidateId = "", candidate?: VillageAgenda): void {
  for (const weekday of VILLAGE_WEEKDAYS) {
    const rows = state.villagers.map((villager) => {
      const agenda = villager.characterId === candidateId ? (candidate ?? villager.agenda) : villager.agenda;
      const blocks: Array<Pick<VillageAgendaBlock, "startMinute" | "endMinute" | "venueId">> =
        agenda?.week?.[weekday] ?? agenda?.day ?? [];
      const homeId = state.venues.find((venue) => venueResidentIds(venue).includes(villager.characterId))?.id ?? "";
      return { villager, blocks, homeId };
    });
    const boundaries = new Set([0, 1440]);
    for (const row of rows)
      for (const block of row.blocks) {
        boundaries.add(block.startMinute);
        boundaries.add(block.endMinute);
      }
    for (const minute of [...boundaries].sort((a, b) => a - b).slice(0, -1)) {
      const present = new Map<string, VillageVillager[]>();
      for (const row of rows) {
        const venueId =
          row.blocks.find((block) => block.startMinute <= minute && minute < block.endMinute)?.venueId || row.homeId;
        if (!venueId || !state.venues.some((venue) => venue.id === venueId)) continue;
        const people = present.get(venueId) ?? [];
        people.push(row.villager);
        present.set(venueId, people);
        if (people.length > 4) {
          const venue = state.venues.find((entry) => entry.id === venueId)!;
          const time = `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
          throw conflict(
            `${venue.name} would have five villagers at ${weekday} ${time}. Choose another Venue or time.`,
          );
        }
      }
    }
  }
}
