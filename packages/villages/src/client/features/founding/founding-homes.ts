import type { SetupVenueDraft } from "../../shared/types.js";
import { contactNeighborIds } from "../../../shared/helpers/zone-contact.js";
import { draftZonePolicy, foundingLayoutZones } from "./villages-founding-zones.js";

export const foundingHomeMembers = (venue: SetupVenueDraft): string[] => [
  ...(venue.occupancy.playerHome ? ["player"] : []),
  ...(venue.residentIds ?? []),
];

export function reachableFoundingZones(
  venue: SetupVenueDraft,
  actor: string,
  sleep = venue.destinations?.[actor]?.sleep,
) {
  const members = foundingHomeMembers(venue),
    zones = foundingLayoutZones(venue);
  const accessible = new Set(
    zones
      .filter((zone) => {
        if (zone.kind === "exterior" || zone.id === sleep) return true;
        const area = zone as NonNullable<SetupVenueDraft["spaces"]>[number];
        const access = area.access ?? draftZonePolicy(venue, area, zone.kind === "personal");
        const operators = venue.access?.managerIds ?? members;
        const sleepers = members.filter((id) => venue.destinations?.[id]?.sleep === zone.id);
        const managers =
          zone.kind === "personal" || area.ownerId
            ? sleepers.length
              ? [...sleepers, area.ownerId ?? ""]
              : (access.managerIds ?? operators)
            : [...operators, ...(access.managerIds ?? [])];
        return (
          access.mode === "public" ||
          area.ownerId === actor ||
          managers.includes(actor) ||
          (access.memberIds ?? []).includes(actor) ||
          ((access.memberRoles ?? []).includes("residents") && members.includes(actor))
        );
      })
      .map((zone) => zone.id),
  );
  const path = ["exterior"];
  accessible.delete("exterior");
  for (const id of path) for (const next of contactNeighborIds(zones, id)) if (accessible.delete(next)) path.push(next);
  return new Set(path);
}
export function foundingSleepZones(venue: SetupVenueDraft, actor: string) {
  return [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].filter((zone) =>
    reachableFoundingZones(venue, actor, zone.id).has(zone.id),
  );
}

export function reconcileFoundingHome(venue: SetupVenueDraft, members = foundingHomeMembers(venue)): SetupVenueDraft {
  const occupied = members.length > 0 || !!venue.workerIds?.length;
  const household = {
    ...venue,
    residentIds: members.filter((id) => id !== "player"),
    occupancy: { ...venue.occupancy, playerHome: members.includes("player"), residentCharacterId: null },
  };
  const updated = {
    ...venue,
    residentIds: members.filter((id) => id !== "player"),
    occupancy: { ...venue.occupancy, playerHome: members.includes("player"), residentCharacterId: null },

    spaces: venue.spaces?.map((zone) => ({
      ...zone,
      access: occupied
        ? (() => {
            const policy = zone.access ?? draftZonePolicy(household, zone);
            return members.length && policy.mode === "public"
              ? { ...policy, memberRoles: [...new Set([...policy.memberRoles, "residents" as const])] }
              : policy;
          })()
        : zone.access,
    })),
    privateSpaces: venue.privateSpaces?.map((zone) =>
      zone.ownerId && !members.includes(zone.ownerId)
        ? {
            ...zone,
            ownerId: "",
            access: zone.access
              ? {
                  ...zone.access,
                  managerIds: zone.access.managerIds?.filter((id) => id !== zone.ownerId) ?? null,
                  memberIds: zone.access.memberIds.filter((id) => id !== zone.ownerId),
                  inviterIds: zone.access.inviterIds.filter((id) => id !== zone.ownerId),
                }
              : undefined,
            controllerIds: zone.controllerIds?.filter((id) => id !== zone.ownerId),
          }
        : zone,
    ),
  };
  const destinations = Object.fromEntries(
    Object.entries(venue.destinations ?? {}).flatMap(([id, roles]) =>
      members.includes(id)
        ? [[id, roles]]
        : venue.workerIds?.includes(id) && roles.work
          ? [[id, { work: roles.work }]]
          : [],
    ),
  );
  for (const id of members) {
    const choices = foundingSleepZones(updated, id);
    const common = choices.find((zone) => !zone.ownerId);
    const sleeping =
      choices.find((zone) => zone.id === destinations[id]?.sleep) ??
      choices.find((zone) => zone.ownerId === id) ??
      common;
    if (sleeping) {
      const reachable = reachableFoundingZones(updated, id, sleeping.id);
      destinations[id] = {
        ...destinations[id],
        home: reachable.has(destinations[id]?.home ?? "")
          ? destinations[id].home
          : common && reachable.has(common.id)
            ? common.id
            : sleeping.id,
        sleep: choices.some((zone) => zone.id === destinations[id]?.sleep) ? destinations[id].sleep : sleeping.id,
      };
    } else destinations[id] = { ...destinations[id], home: undefined, sleep: undefined };
  }
  return {
    ...updated,
    layout: updated.spaces?.length
      ? updated.privateSpaces?.length
        ? "both"
        : "common"
      : updated.privateSpaces?.length
        ? "private"
        : "exterior",
    destinations,
  };
}

/** Starting assignments change membership, never the identity or physical details of a place. */
export function assignFoundingHome(
  rows: SetupVenueDraft[],
  venueId: string,
  actorId: string,
  assigned: boolean,
): SetupVenueDraft[] {
  if (!rows.some((venue) => venue.id === venueId)) return rows;
  return rows.map((venue) => {
    const members = [...(venue.occupancy.playerHome ? ["player"] : []), ...(venue.residentIds ?? [])];
    const next = members.filter((id) => id !== actorId);
    if (venue.id === venueId && assigned) next.push(actorId);
    else if (!assigned && venue.id !== venueId) return venue;
    if (JSON.stringify(members) === JSON.stringify(next)) return venue;
    const updated = reconcileFoundingHome(venue, next);
    return updated;
  });
}

/** Roster changes remove departed people, never create or assign places. */
export function selectFoundingHomes(
  venues: SetupVenueDraft[],
  unusedHomes: SetupVenueDraft[],
  actors: { id: string; name: string }[],
  _openingVenueId: string,
  removedIds: string[] = [],
) {
  const chosen = new Set(actors.map((actor) => actor.id));
  const removed = new Set([
    ...removedIds,
    ...venues
      .flatMap((venue) => [
        ...foundingHomeMembers(venue),
        ...(venue.workerIds ?? []),
        ...(venue.access?.managerIds ?? []),
      ])
      .filter((id) => !chosen.has(id)),
  ]);
  const keep = (id: string) => !removed.has(id);
  const cleanZone = <T extends NonNullable<SetupVenueDraft["spaces"]>[number]>(zone: T): T => ({
    ...zone,
    ...(zone.ownerId && removed.has(zone.ownerId) ? { ownerId: "" } : {}),
    ...(zone.controllerIds ? { controllerIds: zone.controllerIds.filter(keep) } : {}),
    ...(zone.access
      ? {
          access: {
            ...zone.access,
            managerIds: zone.access.managerIds?.some((id) => !keep(id))
              ? zone.access.managerIds.filter(keep).length
                ? zone.access.managerIds.filter(keep)
                : null
              : zone.access.managerIds,
            memberIds: zone.access.memberIds.filter(keep),
            inviterIds: zone.access.inviterIds.filter(keep),
          },
        }
      : {}),
  });
  const reconciled = venues.map((venue) =>
    removed.size &&
    [
      ...foundingHomeMembers(venue),
      ...(venue.workerIds ?? []),
      ...(venue.access?.managerIds ?? []),
      ...(venue.access?.work?.map((row) => row.characterId) ?? []),
      ...[...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].flatMap((zone) => [
        zone.ownerId ?? "",
        ...(zone.controllerIds ?? []),
        ...(zone.access?.managerIds ?? []),
        ...(zone.access?.memberIds ?? []),
        ...(zone.access?.inviterIds ?? []),
      ]),
    ].some((id) => removed.has(id))
      ? reconcileFoundingHome({
          ...venue,
          ...(venue.access
            ? {
                access: {
                  ...venue.access,
                  managerIds: venue.access.managerIds.filter(keep),
                  work: venue.access.work?.filter((row) => keep(row.characterId)),
                  workOffers: [],
                },
              }
            : {}),
          ...(venue.residentIds ? { residentIds: venue.residentIds.filter(keep) } : {}),
          ...(venue.workerIds ? { workerIds: venue.workerIds.filter(keep) } : {}),
          occupancy: {
            ...venue.occupancy,
            ...(venue.occupancy.residentCharacterId && removed.has(venue.occupancy.residentCharacterId)
              ? { residentCharacterId: null }
              : {}),
          },
          ...(venue.destinations
            ? { destinations: Object.fromEntries(Object.entries(venue.destinations).filter(([id]) => keep(id))) }
            : {}),
          ...(venue.spaces ? { spaces: venue.spaces.map(cleanZone) } : {}),
          ...(venue.privateSpaces ? { privateSpaces: venue.privateSpaces.map(cleanZone) } : {}),
          ...(venue.zones ? { zones: venue.zones.map(cleanZone) } : {}),
        })
      : venue,
  );
  return { venues: reconciled, unusedHomes };
}
