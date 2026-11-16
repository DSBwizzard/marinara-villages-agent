import type { VillageState, VillageVenue } from "../models/world.js";
import { contactNeighborIds } from "../../../shared/helpers/zone-contact.js";
import { evaluateZoneAccess } from "./venue-access.js";
import { venueZones, zoneClosed } from "./venue-zones.js";
import { ordinaryUseRestricted } from "./narrative-environment.js";

export function accessibleVenueRoute(
  state: Pick<VillageState, "projects" | "narrative">,
  venue: VillageVenue,
  actor: string,
  targetId: string,
  at: Date,
  preparing = false,
  ordinary = true,
): boolean {
  return !!permittedVenuePath(state, venue, actor, targetId, at, preparing, ordinary);
}

/** Every traversed Zone must admit this actor; physical connectivity alone is insufficient. */
export function permittedVenuePath(
  state: Pick<VillageState, "projects" | "narrative">,
  venue: VillageVenue,
  actor: string,
  targetId: string,
  at: Date,
  preparing = false,
  ordinary = true,
): string[] | undefined {
  const zones = venueZones(venue),
    reachable = new Map([["exterior", ["exterior"]]]),
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
      reachable.set(next, [...reachable.get(id)!, next]);
      queue.push(next);
    }
  return reachable.get(targetId);
}
