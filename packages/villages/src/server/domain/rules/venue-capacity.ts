import type { VillageState, VillageVenue } from "../models/world.js";
import { conflict } from "./errors.js";

export function villageVenueLimit(_state?: unknown): number {
  return 16;
}
/** Count each existing Venue or outstanding creation exactly once, including worksites. */
export function villageVenueUsage(state: VillageState, venues = state.venues, exceptProjectId = "") {
  const pending = state.projects.filter(
    (project) =>
      project.id !== exceptProjectId &&
      project.kind === "new-venue" &&
      ["working", "paused"].includes(project.status) &&
      !venues.some((venue) => venue.id === project.venueId || venue.buildProjectId === project.id),
  );
  return {
    total: venues.length + pending.length,
  };
}
export function assertVillageVenueCapacity(state: VillageState, venues = state.venues, exceptProjectId = ""): void {
  const usage = villageVenueUsage(state, venues, exceptProjectId);
  const limit = villageVenueLimit(state);
  if (usage.total > limit)
    throw conflict(
      "The Village has no room for another Venue (maximum " +
        limit +
        " total, including living Venues and reserved worksites).",
    );
}
export function assertCanAddVillageVenue(state: VillageState, exceptProjectId = ""): void {
  assertVillageVenueCapacity(
    state,
    [
      ...state.venues,
      {
        id: "__capacity_candidate__",
        occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
      } as VillageVenue,
    ],
    exceptProjectId,
  );
}
