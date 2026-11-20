import type { VillageState } from "../models/world.js";
import type { VisitorHours } from "../../../shared/helpers/venue-access.js";
import { contactNeighborIds } from "../../../shared/helpers/zone-contact.js";
import { ordinaryUseRestricted } from "./narrative-environment.js";
import { zoneClosed } from "./venue-zones.js";
import { MAX_ZONE_VILLAGERS } from "./venue-model.js";
import { conflict } from "./errors.js";

/** Explicit schedules count only when their combined intervals cover every day. */
function alwaysOpen(hours: VisitorHours | null): boolean {
  if (hours === null) return true;
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const minute = (clock: string) => Number(clock.slice(0, 2)) * 60 + Number(clock.slice(3));
  return days.every((day, index) => {
    const intervals: number[][] = [];
    for (const row of hours) {
      const start = minute(row.start),
        end = minute(row.end);
      if (row.days.includes(day)) intervals.push(start === end ? [0, 1440] : [start, start < end ? end : 1440]);
      if (start > end && row.days.includes(days[(index + 6) % 7]!)) intervals.push([0, end]);
    }
    let through = 0;
    for (const [start, end] of intervals.sort((a, b) => a[0]! - b[0]!)) {
      if (start! > through) return false;
      through = Math.max(through, end!);
    }
    return through === 1440;
  });
}

/** Ongoing public access is independent of membership, invitations and a particular visit. */
export function sharedPlayspace(
  state: Pick<VillageState, "venues" | "villagers" | "projects" | "narrative">,
  at: Date,
  unavailable?: { venueId: string; zoneId: string },
) {
  const actors = new Set(["player", ...state.villagers.map((row) => row.characterId)]);
  const venues = [...new Map(state.venues.map((venue) => [venue.id, venue])).values()].flatMap((venue) => {
    const ledger = venue.access;
    if (!ledger || venue.constructionStatus === "worksite") return [];
    const zones = venue.zones ?? [];
    const usable = new Set(
      zones
        .filter((zone) => {
          if (zone.kind === "exterior") return true;
          const policy = zone.access;
          return (
            zone.kind === "public" &&
            !zone.ownerId &&
            policy?.mode === "public" &&
            !policy.accompanied &&
            alwaysOpen(
              policy.visitorHours === "always"
                ? null
                : policy.visitorHours === "inherit"
                  ? ledger.visitorHours
                  : policy.visitorHours,
            ) &&
            !ledger.bans.some(
              (ban) => ban.active && actors.has(ban.visitorId) && (ban.zoneId === null || ban.zoneId === zone.id),
            ) &&
            !zoneClosed(state, venue, zone) &&
            !ordinaryUseRestricted(state.narrative, at.toISOString(), venue.id, zone.id) &&
            !(unavailable?.venueId === venue.id && unavailable.zoneId === zone.id)
          );
        })
        .map((zone) => zone.id),
    );
    const reachable = new Set(["exterior"]),
      queue = ["exterior"];
    for (const id of queue)
      for (const next of contactNeighborIds(zones, id)) {
        if (!usable.has(next) || reachable.has(next)) continue;
        reachable.add(next);
        queue.push(next);
      }
    const zoneIds = [...reachable].filter((id) => id !== "exterior");
    return zoneIds.length ? [{ venueId: venue.id, zoneIds }] : [];
  });
  const requiredZones = Math.max(2, Math.ceil(state.villagers.length / MAX_ZONE_VILLAGERS));
  const zoneCount = venues.reduce((sum, row) => sum + row.zoneIds.length, 0);
  return { venues, requiredZones, zoneCount, sufficient: venues.length >= 2 && zoneCount >= requiredZones };
}

export function assertSharedPlayspace(
  state: Pick<VillageState, "venues" | "villagers" | "projects" | "narrative">,
  at: Date,
): void {
  const space = sharedPlayspace(state, at);
  if (!space.sufficient)
    throw conflict(
      `Keep ${space.requiredZones} usable public Zones across at least two Venues. Open replacement shared space first.`,
    );
}
