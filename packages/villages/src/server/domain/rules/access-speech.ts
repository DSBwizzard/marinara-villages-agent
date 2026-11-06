import { sceneActorIds } from "./places.js";
import { findLocation } from "./places.js";
import type { VillageState } from "../models/world.js";
import { managesAccess, zoneManagers } from "./venue-access.js";

/** Server-only writing context contains authority and policy, never hidden physical contents or positions. */
export function accessManagementPrompt(village: VillageState, actors: string[], venueId?: string): string {
  const locations = venueId ? [findLocation(village, venueId)].filter((venue) => !!venue) : village.venues;
  const scopes = locations
    .filter((venue) => venue.access && (!venueId || venue.id === venueId))
    .flatMap((venue) =>
      actors
        .filter((actor) => actor !== "player")
        .flatMap((actor) => {
          const venueManager = managesAccess(venue, null, actor);
          const zones =
            venue.zones
              ?.filter((zone) => zone.kind !== "exterior" && managesAccess(venue, zone.id, actor))
              .map((zone) => ({ id: zone.id, name: zone.name, policy: zone.access })) ?? [];
          if (!venueManager && !zones.length) return [];
          return [
            {
              actorId: actor,
              venueId: venue.id,
              venueName: venue.name,
              ...(venueManager
                ? { venuePolicy: { managerIds: venue.access!.managerIds, visitorHours: venue.access!.visitorHours } }
                : {}),
              zones,
              ...(venueManager
                ? {
                    recoverableZones:
                      venue.zones
                        ?.filter(
                          (zone) =>
                            zone.kind !== "exterior" &&
                            !zoneManagers(venue, zone).some((id) => ["player", ...sceneActorIds(village)].includes(id)),
                        )
                        .map((zone) => ({ id: zone.id, name: zone.name })) ?? [],
                  }
                : {}),
              bans: venue.access!.bans.filter(
                (ban) =>
                  ban.active && (ban.zoneId === null ? venueManager : zones.some((zone) => zone.id === ban.zoneId)),
              ),
              invitations: venue.access!.permissions.filter(
                (grant) =>
                  !grant.revoked &&
                  (zones.some((zone) => zone.id === grant.zoneId) ||
                    (venueManager &&
                      venue.access!.bans.some(
                        (ban) => ban.active && ban.zoneId === null && ban.visitorId === grant.visitorId,
                      ))),
              ),
            },
          ];
        }),
    );
  return scopes.length
    ? `Access management available to current speakers (server-only): ${JSON.stringify(scopes)}. Emit a manage-access roomEvent only when actual current speech explicitly changes these rules. Use exact existing IDs. Never infer a policy change from admitting a guest, friendship or employment. Entrance is always Unrestricted.`
    : "";
}
