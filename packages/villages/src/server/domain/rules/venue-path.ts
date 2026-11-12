import type { VillageState, VillageVenue } from "../models/world.js";
import { contactNeighborIds } from "../../../shared/helpers/zone-contact.js";
import { evaluateZoneAccess } from "./venue-access.js";
import { venueZones, zoneClosed } from "./venue-zones.js";
import { ordinaryUseRestricted } from "./narrative-environment.js";

/** Every traversed Zone must admit this actor; physical connectivity alone is insufficient. */
export function accessibleVenueRoute(
  state: Pick<VillageState, "projects" | "narrative">,
  venue: VillageVenue,
  actor: string,
  targetId: string,
  at: Date,
  preparing = false,
  ordinary = true,
): boolean {
  const zones = venueZones(venue),
    reachable = new Set(["exterior"]),
    queue = ["exterior"];
  for (const id of queue)
    for (const next of contactNeighborIds(zones, id)) {
      const zone = zones.find((row) => row.id === next)!;
      if (
        reachable.has(next) ||
        (ordinary && ordinaryUseRestricted(state.narrative, at.toISOString(), venue.id, next)) ||
        !evaluateZoneAccess(venue, zone, actor, {
          at,
          environment: state.narrative,
          unavailable: !preparing && zoneClosed(state, venue, zone),
        }).allowed
      )
        continue;
      reachable.add(next);
      queue.push(next);
    }
  return reachable.has(targetId);
}
