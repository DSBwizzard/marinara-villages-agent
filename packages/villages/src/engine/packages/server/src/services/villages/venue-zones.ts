import type { VillageVenue, VillageVenueClass, VillageVenueZone, VillageZoneKind, VillageState } from "./types.js";
import { defaultVenueSpace, venueResidentIds, venueSpaces } from "./venue-model.js";
import { conflict } from "./errors.js";

export const ZONE_KINDS: readonly VillageZoneKind[] = [
  "exterior",
  "public",
  "shared-residence",
  "private-residence",
  "staff",
  "restricted",
];
export function effectiveVenueClasses(venue: VillageVenue): VillageVenueClass[] {
  return [
    ...new Set([
      ...(venue.baseClasses ?? venue.classes ?? ["other"]),
      ...(venue.improvements ?? []).flatMap((upgrade) =>
        upgrade?.classContribution ? [upgrade.classContribution] : [],
      ),
    ]),
  ];
}
/** Legacy fields remain write adapters; zones are the saved scene identities. */
export function legacyVenueZones(venue: VillageVenue): VillageVenueZone[] {
  return [
    {
      ...defaultVenueSpace(venue.classes?.[0] ?? "other"),
      id: "exterior",
      name: "Exterior",
      kind: "exterior",
      description: venue.description,
      image: venue.presentation?.image ?? null,
      state: venue.exteriorState ?? defaultVenueSpace("other").state,
      seen: true,
    },
    ...venueSpaces({
      ...venue,
      presentation: venue.presentation ?? { image: null, x: null, y: null },
      state: { condition: "", upgrades: [], furniture: [], publicFacts: [], updatedAt: "", ...venue.state },
    }).map((space) => ({
      ...space,
      name: space.venueClass === "residence" ? "Shared living space" : "Interior",
      kind: space.venueClass === "residence" ? ("shared-residence" as const) : ("public" as const),
      seen:
        space.venueClass === "residence"
          ? !!(venue.playerSeenShared || venue.occupancy.playerHome)
          : !!venue.playerSeenPublic,
    })),
    ...(venue.privateSpaces ?? [])
      .filter(
        (space) =>
          venueResidentIds(venue).includes(space.ownerId) || (space.ownerId === "player" && venue.occupancy.playerHome),
      )
      .map((space) => ({
        ...space,
        name: space.ownerId === "player" ? "Your personal space" : "Private space",
        kind: "private-residence" as const,
        seen: space.ownerId === "player" || !!venue.playerSeenPrivateIds?.includes(space.ownerId),
      })),
  ];
}
export function venueZones(venue: VillageVenue): VillageVenueZone[] {
  return venue.zones ?? legacyVenueZones(venue);
}
export function resolveVenueZone(venue: VillageVenue, zoneId: string): VillageVenueZone | undefined {
  return venueZones(venue).find((zone) => zone.id === zoneId);
}
export function legacyZoneId(venue: VillageVenue, area: string, spaceClass?: VillageVenueClass, ownerId = ""): string {
  if (area === "outside") return "exterior";
  if (area === "private") return venueZones(venue).find((zone) => zone.id === ownerId)?.id ?? "private:" + ownerId;
  spaceClass ??=
    area === "shared" ? "residence" : (venue.classes?.find((entry) => entry !== "residence") ?? venue.classes?.[0]);
  return (
    venueZones(venue).find(
      (zone) =>
        !zone.upgradeId &&
        zone.kind !== "exterior" &&
        ["public", "shared-residence"].includes(zone.kind) &&
        zone.venueClass === spaceClass,
    )?.id ??
    spaceClass ??
    "exterior"
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
export function canOccupyZone(venue: VillageVenue, zone: VillageVenueZone, actorId: string): boolean {
  if (zone.kind === "exterior" || zone.kind === "public") return true;
  if (actorId === "player" && venue.occupancy.playerHome && zone.kind === "shared-residence") return true;
  if (zone.kind === "private-residence")
    return (
      zone.ownerId === actorId &&
      (actorId === "player" ? venue.occupancy.playerHome : venueResidentIds(venue).includes(actorId))
    );
  if (zone.kind === "restricted") return !!zone.controllerIds?.includes(actorId);
  return zone.kind === "staff" ? !!venue.workerIds?.includes(actorId) : venueResidentIds(venue).includes(actorId);
}
export function canInviteToZone(venue: VillageVenue, zone: VillageVenueZone, actorId: string): boolean {
  if (zone.kind === "private-residence") return zone.ownerId === actorId && venueResidentIds(venue).includes(actorId);
  if (zone.kind === "staff") return !!venue.workerIds?.includes(actorId);
  if (zone.kind === "restricted") return !!zone.controllerIds?.includes(actorId);
  return zone.kind === "shared-residence" && venueResidentIds(venue).includes(actorId);
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
      project.kind !== "renovation" ||
      project.venueId !== venue.id ||
      !["construction", "finishing"].includes(project.lifecycle?.phase ?? "")
    )
      return false;
    const change = project.lifecycle?.change;
    const upgrade = change?.slot !== undefined ? venue.improvements?.[change.slot] : null;
    return !!(
      (upgrade && zone.upgradeId === upgrade.id) ||
      change?.improvement?.spaceId === zone.id ||
      (change?.improvement?.spaceId === zone.venueClass && !zone.upgradeId) ||
      upgrade?.spaceId === zone.id ||
      (change?.homeKind !== undefined && zone.venueClass === "residence") ||
      (change?.capacity !== undefined && zone.venueClass === "residence") ||
      (change?.classes && !change.classes.includes(zone.venueClass) && !zone.upgradeId)
    );
  });
}
export function chooseAgendaZone(
  venue: VillageVenue,
  actorId: string,
  activity = "",
  requestedId = "",
  state?: Pick<VillageState, "projects">,
): VillageVenueZone {
  const eligible = venueZones(venue).filter(
    (zone) => canOccupyZone(venue, zone, actorId) && (!state || !zoneClosed(state, venue, zone)),
  );
  const requested = eligible.find((zone) => zone.id === requestedId);
  if (requested) return requested;
  const preferred = /sleep|bed|dress|wash|private|personal|journal/i.test(activity)
    ? "private-residence"
    : /breakfast|supper|meal|eat|home|house|tidy/i.test(activity)
      ? "shared-residence"
      : /work|repair|build|shift|help/i.test(activity)
        ? "staff"
        : "public";
  return (
    eligible.find((zone) => zone.kind === preferred) ??
    eligible.find((zone) => zone.kind === "public") ??
    eligible.find((zone) => zone.kind === "exterior") ??
    legacyVenueZones(venue)[0]!
  );
}
export function venueInZone(venue: VillageVenue, zoneId: string): VillageVenue {
  const zone = resolveVenueZone(venue, zoneId);
  if (!zone) throw conflict("That zone is no longer here.");
  return {
    ...venue,
    improvements: venue.improvements?.map((upgrade) =>
      upgrade &&
      (upgrade.spaceId === zone.id ||
        upgrade.id === zone.upgradeId ||
        (upgrade.spaceId === zone.venueClass && !zone.upgradeId))
        ? upgrade
        : null,
    ),
    description: zone.description,
    presentation: { ...venue.presentation, image: zone.image },
    state: {
      ...venue.state,
      condition: zone.state.condition,
      furniture: zone.state.items,
      publicFacts: zone.state.publicFacts,
      features: zone.state.features,
      traces: zone.state.traces,
      updatedAt: zone.state.updatedAt,
    },
  };
}
/** Reconcile only legacy adapters that changed during this transaction. */
export function synchronizeVenueZones(venue: VillageVenue, previous?: VillageVenue): void {
  if (previous && JSON.stringify(previous.state) !== JSON.stringify(venue.state)) {
    const primary = venue.spaces?.find((space) => space.venueClass !== "residence") ?? venue.spaces?.[0];
    const zone = primary && venue.zones?.find((entry) => entry.id === primary.id);
    const oldZone = zone && previous.zones?.find((entry) => entry.id === zone.id);
    if (primary && zone && JSON.stringify(zone) === JSON.stringify(oldZone))
      primary.state = {
        condition: venue.state.condition,
        items: venue.state.furniture,
        publicFacts: venue.state.publicFacts,
        features: venue.state.features ?? [],
        traces: venue.state.traces ?? [],
        updatedAt: venue.state.updatedAt,
      };
  }
  const legacy = legacyVenueZones(venue),
    oldLegacy = previous ? legacyVenueZones(previous) : [];
  const old = previous?.zones ?? [];
  let zones = venue.zones ?? legacy;
  if (
    venue.occupancy.playerHome &&
    !zones.some((zone) => zone.kind === "private-residence" && zone.ownerId === "player")
  )
    zones.push({
      ...defaultVenueSpace("residence"),
      id: "private:player",
      name: "Your personal space",
      kind: "private-residence",
      ownerId: "player",
      seen: true,
      purpose: "Personal space",
    });
  if (effectiveVenueClasses(venue).includes("workplace") && !zones.some((zone) => zone.kind === "staff"))
    zones.push({
      ...defaultVenueSpace("workplace"),
      id: "staff",
      name: "Private work area",
      kind: "staff",
      purpose: "Restricted work area appropriate to the venue form",
      seen: false,
      preparation: { status: "pending", error: "" },
      controllerIds: [],
      ownerId: undefined,
      upgradeId: undefined,
      initialImageAttemptedAt: "",
      adaptationPending: false,
      adaptationSourceArchiveAt: "",
    });
  zones = zones.filter(
    (zone) =>
      zone.kind !== "private-residence" ||
      venueResidentIds(venue).includes(zone.ownerId ?? "") ||
      (zone.ownerId === "player" && venue.occupancy.playerHome),
  );
  for (const adapter of legacy) {
    const priorAdapter = oldLegacy.find((zone) => zone.id === adapter.id);
    const index = zones.findIndex((zone) => zone.id === adapter.id);
    if (index < 0) {
      zones.push(adapter);
      continue;
    }
    if (!previous) continue;
    const priorZone = old.find((zone) => zone.id === adapter.id);
    if (priorZone && JSON.stringify(priorZone) !== JSON.stringify(zones[index])) continue;
    if (!priorAdapter || JSON.stringify(priorAdapter) !== JSON.stringify(adapter))
      zones[index] = {
        ...zones[index]!,
        ...adapter,
        name: zones[index]!.name,
        seen: zones[index]!.seen || (adapter.seen && !priorAdapter?.seen),
      };
  }
  venue.zones = zones;
  venue.baseClasses ??= [...(venue.classes ?? ["other"])];
  venue.classes = effectiveVenueClasses(venue);
  const exterior = zones.find((zone) => zone.kind === "exterior");
  if (exterior) {
    venue.exteriorState = exterior.state;
    venue.presentation.image = exterior.image;
    venue.description = exterior.description;
  }
  venue.spaces = zones.filter((zone) => !zone.upgradeId && ["public", "shared-residence"].includes(zone.kind));
  venue.privateSpaces = zones
    .filter((zone) => zone.kind === "private-residence")
    .map((zone) => ({ ...zone, ownerId: zone.ownerId! }));
  const primary = venue.spaces.find((zone) => zone.venueClass !== "residence") ?? venue.spaces[0];
  if (primary)
    venue.state = {
      ...venue.state,
      condition: primary.state.condition,
      furniture: primary.state.items,
      publicFacts: primary.state.publicFacts,
      features: primary.state.features,
      traces: primary.state.traces,
      updatedAt: primary.state.updatedAt,
    };
  venue.playerSeenShared = zones.some((zone) => zone.kind === "shared-residence" && zone.seen);
  venue.playerSeenPublic = zones.some((zone) => zone.kind === "public" && zone.seen);
  venue.playerSeenPrivateIds = zones
    .filter((zone) => zone.kind === "private-residence" && zone.seen)
    .map((zone) => zone.ownerId!);
}

export function zoneControllerIds(venue: VillageVenue, zone: VillageVenueZone | undefined): string[] {
  if (!zone) return [];
  if (zone.kind === "staff") return [...(venue.workerIds ?? [])];
  if (zone.kind === "restricted") return [...(zone.controllerIds ?? [])];
  if (zone.kind === "private-residence") return zone.ownerId && zone.ownerId !== "player" ? [zone.ownerId] : [];
  return zone.kind === "shared-residence" ? venueResidentIds(venue) : [];
}
export function privateTarget(
  venue: VillageVenue,
  zoneId?: string,
  privateSpaceId?: string,
  privateOwnerId = "",
): string | undefined {
  const ownerTarget = privateOwnerId ? "private:" + privateOwnerId : undefined;
  const targets = [zoneId, privateSpaceId, ownerTarget].filter(Boolean);
  if (new Set(targets).size > 1) throw conflict("Conflicting private space targets.");
  const target = targets[0];
  if (target && !resolveVenueZone(venue, target)) throw conflict("That space is no longer here.");
  return target;
}
