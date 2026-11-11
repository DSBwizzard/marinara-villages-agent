import { sceneActorIds } from "./places.js";
import { findLocation } from "./places.js";
import type { VillageState } from "../models/world.js";
import { managesAccess, zoneManagers } from "./venue-access.js";
import { sceneEvidencePerception } from "./scene-evidence-perception.js";
import type { VenueLine } from "../models/scene-model.js";

export const accessOutcomeActions: ReadonlyMap<string, string> = new Map([
  ["invite-now", "invite"],
  ["invite-later", "invite"],
  ["invite-outside-hours", "invite"],
  ["ban-zone", "ban"],
  ["ban-venue", "ban"],
  ["refuse", "refuse-entry"],
  ["dismiss", "leave-now"],
]);

/** Player perception is separate from resident listener IDs; this grants no authority by itself. */
export function accessIssuerWitnessed(
  line: Pick<VenueLine, "heardBy" | "speakerId" | "kind"> & Partial<VenueLine> & { playerHeard?: boolean },
  actorId: string,
) {
  return actorId === "player"
    ? (line.playerHeard ?? sceneEvidencePerception(line).playerPerception === "full")
    : line.heardBy.includes(actorId) || (line.speakerId === actorId && line.kind !== "narration");
}

/** Server-only writing context contains authority and policy, never hidden physical contents or positions. */
export function accessManagementPrompt(village: VillageState, actors: string[], venueId?: string) {
  const locations = venueId ? [findLocation(village, venueId)].filter((venue) => !!venue) : village.venues;
  const scopes = locations
    .filter((venue) => venue.access && venue.id !== village.communityVenueId && (!venueId || venue.id === venueId))
    .flatMap((venue) =>
      actors.flatMap((actor) => {
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
            bans: venue
              .access!.bans.filter(
                (ban) =>
                  ban.active && (ban.zoneId === null ? venueManager : zones.some((zone) => zone.id === ban.zoneId)),
              )
              .map(({ id, zoneId, visitorId, issuerId }) => ({ id, zoneId, visitorId, issuerId })),
            invitations: venue
              .access!.permissions.filter(
                (grant) =>
                  !grant.revoked &&
                  (zones.some((zone) => zone.id === grant.zoneId) ||
                    (venueManager &&
                      venue.access!.bans.some(
                        (ban) => ban.active && ban.zoneId === null && ban.visitorId === grant.visitorId,
                      ))),
              )
              .map(({ id, zoneId, visitorId, issuerId, duration, sceneId, accompaniedBy, outsideHours }) => ({
                id,
                zoneId,
                visitorId,
                issuerId,
                duration,
                sceneId,
                accompaniedBy,
                outsideHours,
              })),
          },
        ];
      }),
    );
  return scopes;
}
