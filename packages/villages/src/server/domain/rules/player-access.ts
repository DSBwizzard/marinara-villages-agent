import type { PlayerAccessChange, PlayerAccessEntry } from "../../../shared/helpers/venue-access.js";
import type { VenueScene } from "../models/scene-model.js";
import type { VillageState, VillageVenueZone } from "../models/world.js";
import { activeLodging } from "./lodging-presence.js";
import { memoryHash } from "./memory-integrity.js";
import { evaluateZoneAccess, managesAccess, mayInvite } from "./venue-access.js";
import { venueZones } from "./venue-zones.js";
import { observedZone } from "./zone-observation.js";
import { accessibleVenueRoute } from "./venue-path.js";

export function playerAccess(
  state: VillageState,
  at: Date,
  scene?: Pick<VenueScene, "id" | "placeId"> | null,
): PlayerAccessEntry[] {
  const stay = activeLodging(state, "player", at);
  const entries = new Map<string, PlayerAccessEntry>();
  const venues = [
    ...state.venues,
    ...Object.values(state.worldPlaces.places)
      .filter((place) => !place.disabled && place.knownBy.includes("player"))
      .map((place) => place.location),
  ];

  for (const venue of venues) {
    const ledger = venue.access;
    function add(kind: PlayerAccessEntry["kind"], zone?: VillageVenueZone, info?: Partial<PlayerAccessEntry>) {
      const id = memoryHash([venue.id, zone?.id, kind, info?.thisVisit, info?.escorted, info?.visitorHours]);
      const currentEnd = entries.get(id)?.endsAt;
      if (currentEnd && info?.endsAt && Date.parse(currentEnd) > Date.parse(info.endsAt)) return;
      entries.set(id, { id, kind, placeId: venue.id, place: venue.name, ...(zone && { room: zone.name }), ...info });
    }
    if (venue.occupancy.playerHome) {
      const sleep = venue.destinations?.player?.sleep;
      add(
        "home",
        venueZones(venue).find((zone) => zone.id === sleep),
      );
    }
    if (stay?.venue.id === venue.id) add("stay", stay.zone, { endsAt: stay.permission.expiresAt });
    if (!ledger) continue;
    const currentVisit = scene?.placeId === venue.id ? scene.id : undefined;
    const bans = ledger.bans.filter((ban) => ban.active && ban.visitorId === "player");
    const venueBan = bans.some((ban) => ban.zoneId === null);
    if (venueBan) add("ban");
    const playerGrants = ledger.permissions.filter((grant) => grant.visitorId === "player" && !grant.revoked);

    for (const zone of venueZones(venue)) {
      if (zone.kind === "exterior") continue;
      const visibleZone = zone.seen || managesAccess(venue, zone.id, "player") ? zone : observedZone(zone, false);
      const refused = ledger.visitDenials.some(
        (denial) => denial.sceneId === currentVisit && denial.visitorId === "player" && denial.zoneId === zone.id,
      );
      if (
        !venue.occupancy.playerHome &&
        zone.access?.mode === "permission-required" &&
        evaluateZoneAccess(venue, zone, "player", { at }).reason === "member"
      )
        add("member", visibleZone);
      if (!venueBan && bans.some((ban) => ban.zoneId === zone.id)) add("ban", visibleZone);
      if (refused) add("refused", visibleZone, { thisVisit: true });

      for (const grant of playerGrants) {
        if (
          grant.zoneId !== zone.id ||
          grant.duration === "stay" ||
          (grant.duration === "visit" && grant.sceneId !== null && (refused || grant.sceneId !== currentVisit)) ||
          Date.parse(grant.issuedAt) > at.getTime() ||
          !mayInvite(venue, zone, grant.issuerId)
        )
          continue;
        const associatedBans = bans.filter((ban) => ban.zoneId === null || ban.zoneId === zone.id);
        if (
          !associatedBans.every((ban) =>
            ledger.exceptions.some((row) => row.permissionId === grant.id && row.banIds.includes(ban.id)),
          )
        )
          continue;
        const escorted = !!(grant.accompaniedBy || zone.access?.accompanied);
        const hours = zone.access?.visitorHours === "inherit" ? ledger.visitorHours : zone.access?.visitorHours;
        const visitorHours = !grant.outsideHours && Array.isArray(hours);
        if (grant.duration === "timed") {
          if (
            !refused &&
            managesAccess(venue, zone.id, grant.issuerId) &&
            !zone.access?.accompanied &&
            Date.parse(grant.expiresAt ?? "") > at.getTime() &&
            accessibleVenueRoute(state, venue, "player", zone.id, at)
          )
            add("stay", zone, { endsAt: grant.expiresAt });
          continue;
        }
        add(grant.duration, visibleZone, {
          ...(grant.sceneId && grant.duration === "visit" && { thisVisit: true }),
          ...(escorted && { escorted: true }),
          ...(visitorHours && { visitorHours: true }),
        });
      }
    }
  }
  return [...entries.values()].sort(
    (a, b) =>
      a.place.localeCompare(b.place) || a.kind.localeCompare(b.kind) || (a.room ?? "").localeCompare(b.room ?? ""),
  );
}

export function playerAccessChanges(before: PlayerAccessEntry[], after: PlayerAccessEntry[]): PlayerAccessChange[] {
  const previous = new Map(before.map((entry) => [entry.id, entry]));
  const changes: PlayerAccessChange[] = [];
  for (const entry of after) {
    const earlier = previous.get(entry.id);
    if (!earlier) changes.push({ action: "added", entry });
    else if (earlier.endsAt !== entry.endsAt) changes.push({ action: "changed", entry });
    previous.delete(entry.id);
  }
  for (const entry of previous.values()) changes.push({ action: "removed", entry });
  return changes;
}
