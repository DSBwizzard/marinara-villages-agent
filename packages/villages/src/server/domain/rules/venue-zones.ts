import { ordinaryUseRestricted } from "./narrative-environment.js";
import type {
  VillageState,
  VillageVenue,
  VillageVenueClass,
  VillageVenueZone,
  VillageZoneKind,
} from "../models/world.js";
import { conflict } from "./errors.js";
import { evaluateZoneAccess, mayInvite, zoneManagers } from "./venue-access.js";

export const ZONE_KINDS: readonly VillageZoneKind[] = [
  "exterior",
  "public",
  "shared-residence",
  "private-residence",
  "staff",
  "restricted",
];
export function effectiveVenueClasses(venue: VillageVenue): VillageVenueClass[] {
  return venue.classes ?? ["other"];
}
export function venueZones(venue: VillageVenue): VillageVenueZone[] {
  return venue.zones ?? [];
}
export function resolveVenueZone(venue: VillageVenue, zoneId: string): VillageVenueZone | undefined {
  return venueZones(venue).find((zone) => zone.id === zoneId);
}
export function defaultVenueZoneId(
  venue: VillageVenue,
  area: string,
  spaceClass?: VillageVenueClass,
  ownerId = "",
): string {
  if (area === "outside") return "exterior";
  if (area === "private") {
    const choices = venueZones(venue).filter((zone) => zone.kind === "private-residence" && zone.ownerId === ownerId);
    const sleep = venue.destinations?.[ownerId]?.sleep;
    return choices.find((zone) => zone.id === sleep)?.id ?? (choices.length === 1 ? choices[0].id : "");
  }
  spaceClass ??=
    area === "shared" ? "residence" : (venue.classes?.find((entry) => entry !== "residence") ?? venue.classes?.[0]);
  return (
    venueZones(venue).find(
      (zone) =>
        zone.kind !== "exterior" &&
        ["public", "shared-residence"].includes(zone.kind) &&
        zone.venueClass === spaceClass,
    )?.id ?? "exterior"
  );
}
export function zoneArea(zone: VillageVenueZone): "outside" | "public" | "shared" | "private" {
  return zone.kind === "exterior"
    ? "outside"
    : zone.kind === "shared-residence"
      ? "shared"
      : zone.kind === "private-residence"
        ? "private"
        : "public";
}
export function canOccupyZone(
  venue: VillageVenue,
  zone: VillageVenueZone,
  actorId: string,
  context?: import("./venue-access.js").AccessContext,
): boolean {
  return evaluateZoneAccess(venue, zone, actorId, context).allowed;
}
export function canInviteToZone(venue: VillageVenue, zone: VillageVenueZone, actorId: string): boolean {
  return !!venue.access && !zone.closed && mayInvite(venue, zone, actorId);
}
/** Withdrawal requires controller authority, not availability to admit a visitor. */
export function canRevokeZonePermission(venue: VillageVenue, zone: VillageVenueZone, actorId: string): boolean {
  return !!venue.access && mayInvite(venue, zone, actorId);
}
export function zoneClosed(
  state: Pick<VillageState, "projects">,
  venue: VillageVenue,
  zone: VillageVenueZone,
): boolean {
  if (zone.kind === "exterior") return false;
  if (zone.preparation && zone.preparation.status !== "ready") return true;
  if (venue.constructionStatus === "worksite") return true;
  return (state.projects ?? []).some((project) => {
    if (
      (project.kind !== "renovation" && !(project.kind === "establishment" && project.establishment?.physical)) ||
      project.venueId !== venue.id ||
      !["working", "paused"].includes(project.lifecycle?.phase ?? "")
    )
      return false;
    return project.lifecycle?.changedZoneIds.includes(zone.id) ?? false;
  });
}
export function chooseAgendaZone(
  venue: VillageVenue,
  actorId: string,
  activity = "",
  requestedId = "",
  state?: Pick<VillageState, "projects" | "narrative">,
  accessContext?: import("./venue-access.js").AccessContext,
): VillageVenueZone {
  const eligible = venueZones(venue).filter(
    (zone) =>
      (!ordinaryUseRestricted(state?.narrative, (accessContext?.at ?? new Date()).toISOString(), venue.id, zone.id) ||
        /repair|inspect|restore|clear|correct/iu.test(activity)) &&
      evaluateZoneAccess(venue, zone, actorId, {
        ...accessContext,
        unavailable: !!state && zoneClosed(state, venue, zone),
      }).allowed &&
      (!state || !zoneClosed(state, venue, zone)),
  );
  const requested = eligible.find((zone) => zone.id === requestedId);
  if (requested) return requested;
  const destinations = venue.destinations?.[actorId];
  const assigned = /sleep|bed|dress|wash/i.test(activity)
    ? destinations?.sleep
    : /work|repair|build|shift|help/i.test(activity)
      ? destinations?.work
      : destinations?.home;
  const designated = eligible.find((zone) => zone.id === assigned);
  if (designated) return designated;
  if (venue.access && destinations)
    return (
      eligible.find((zone) => zone.kind === "exterior") ?? venueZones(venue).find((zone) => zone.kind === "exterior")!
    );
  const preferred = /sleep|bed|dress|wash|private|personal|journal/i.test(activity)
    ? "private-residence"
    : /breakfast|supper|meal|eat|home|house|tidy/i.test(activity)
      ? "shared-residence"
      : /work|repair|build|shift|help/i.test(activity)
        ? "staff"
        : "public";
  return (
    eligible.find((zone) => zone.kind === preferred) ??
    (preferred === "private-residence" ? eligible.find((zone) => zone.kind === "shared-residence") : undefined) ??
    eligible.find((zone) => zone.kind === "public") ??
    eligible.find((zone) => zone.kind === "exterior") ??
    venueZones(venue).find((zone) => zone.kind === "exterior")!
  );
}
export function venueInZone(venue: VillageVenue, zoneId: string): VillageVenue {
  const zone = resolveVenueZone(venue, zoneId);
  if (!zone) throw conflict("That zone is no longer here.");
  return {
    ...venue,
    description: zone.description,
    presentation: { ...venue.presentation, image: zone.image },
  };
}
/** Zones own physical truth; adapters below are derived views. */
export function synchronizeVenueZones(venue: VillageVenue, previous?: VillageVenue): void {
  if (venue.access && previous) {
    for (const zone of venue.zones ?? [])
      if (zone.access) {
        const old = previous.zones?.find((row) => row.id === zone.id);
        if (old?.ownerId && !zone.ownerId) {
          zone.access.managerIds = null;
          zone.access.memberIds = [];
          zone.access.inviterIds = [];
        }
        if (zone.ownerId && old?.ownerId !== zone.ownerId) {
          zone.access.managerIds = [zone.ownerId];
          zone.access.memberIds = [zone.ownerId];
          zone.access.inviterIds = [];
        }
        if (zone.access.memberRoles.includes("workers"))
          zone.access.inviterIds = zone.access.inviterIds.filter(
            (actor) =>
              !previous.workerIds?.includes(actor) ||
              !!venue.workerIds?.includes(actor) ||
              (zone.access?.managerIds ?? venue.access!.managerIds).includes(actor),
          );
      }
  }
  const zones = venue.zones ?? [];
  venue.zones = zones;
  venue.classes = effectiveVenueClasses(venue);
  const exterior = zones.find((zone) => zone.kind === "exterior");
  if (exterior) {
    venue.presentation.image = exterior.image;
    venue.description = exterior.description;
  }
  venue.spaces = zones.filter((zone) => ["public", "shared-residence"].includes(zone.kind));
  venue.privateSpaces = zones
    .filter((zone) => zone.kind === "private-residence")
    .map((zone) => ({ ...zone, ownerId: zone.ownerId! }));
  venue.playerSeenShared = zones.some((zone) => zone.kind === "shared-residence" && zone.seen);
  venue.playerSeenPublic = zones.some((zone) => zone.kind === "public" && zone.seen);
  venue.playerSeenPrivateIds = zones
    .filter((zone) => zone.kind === "private-residence" && zone.seen)
    .map((zone) => zone.ownerId!);
}

export function zoneControllerIds(venue: VillageVenue, zone: VillageVenueZone | undefined): string[] {
  return venue.access && zone ? zoneManagers(venue, zone) : [];
}
