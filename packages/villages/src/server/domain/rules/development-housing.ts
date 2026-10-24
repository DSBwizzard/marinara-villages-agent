import type { VillageState, VillageVenue } from "../models/world.js";
import { backgroundRevision } from "./background-revision.js";
import { venueZones } from "./venue-zones.js";
export function housingSignature(venue: VillageVenue) {
  return backgroundRevision([
    venue.id,
    venue.classes,
    venue.occupancy,
    venue.residentIds,
    venue.residenceCapacity,
    venue.access,
    venue.constructionStatus,
    venueZones(venue).map((z) => [z.id, z.kind, z.ownerId, z.access, z.connectedTo]),
  ]);
}
/** One current fact floor per home; unknown changes are conservatively dated to discovery, never invented in the past. */
export function recordHousingAvailability(state: VillageState, at: string) {
  const d = state.development;
  if (!d) return;
  d.housing ??= {};
  for (const venue of state.venues) {
    const signature = housingSignature(venue);
    if (d.housing[venue.id]?.signature !== signature) d.housing[venue.id] = { signature, availableAt: at };
  }
  for (const id of Object.keys(d.housing)) if (!state.venues.some((v) => v.id === id)) delete d.housing[id];
}
export function housingAvailableAt(state: VillageState, at: string) {
  return Object.fromEntries(
    state.venues.map((v) => [
      v.id,
      state.development?.housing?.[v.id]?.signature === housingSignature(v)
        ? state.development.housing[v.id]!.availableAt
        : at,
    ]),
  );
}
