import type { VillageState } from "../models/world.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { accessibleVenueRoute } from "./venue-path.js";
import { evaluateZoneAccess } from "./venue-access.js";
import { ordinaryUseRestricted } from "./narrative-environment.js";
import { zoneClosed } from "./venue-zones.js";
import { MAX_ZONE_VILLAGERS } from "./venue-model.js";

/** Only the opening gathering needs a place that admits the whole founding group. */
export function openingPlayspace(
  state: Pick<VillageState, "venues" | "projects" | "narrative"> & { timeZone?: string },
  residentIds: readonly string[],
  at: Date,
) {
  if (residentIds.length > MAX_ZONE_VILLAGERS) return [];
  const actors = ["player", ...residentIds];
  const now = state.timeZone ? new ZonedDate(at, state.timeZone) : at;
  return state.venues.flatMap((venue) => {
    const zoneIds = (venue.zones ?? [])
      .filter(
        (zone) =>
          !zoneClosed(state, venue, zone) &&
          !ordinaryUseRestricted(state.narrative, now.toISOString(), venue.id, zone.id) &&
          actors.every(
            (actor) =>
              evaluateZoneAccess(venue, zone, actor, { at: now, environment: state.narrative }).allowed &&
              accessibleVenueRoute(state, venue, actor, zone.id, now),
          ),
      )
      .sort((a, b) => Number(a.kind === "exterior") - Number(b.kind === "exterior"))
      .map((zone) => zone.id);
    return zoneIds.length ? [{ venueId: venue.id, zoneIds }] : [];
  });
}
