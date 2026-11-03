import type { SetupVenueDraft } from "../../shared/types.js";
import { newSetupVenue } from "./FoundingPanels.js";
import { draftZonePolicy } from "./villages-founding-zones.js";

export const foundingHomeMembers = (venue: SetupVenueDraft): string[] => [
  ...(venue.occupancy.playerHome ? ["player"] : []),
  ...(venue.residentIds ?? []),
];

export function foundingSleepZones(venue: SetupVenueDraft, actor: string) {
  return [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].filter(
    (zone) =>
      zone.venueClass === "residence" &&
      (!zone.ownerId || zone.ownerId === actor) &&
      (!venue.privateSpaces?.some((room) => room.id === zone.id) || zone.ownerId === actor) &&
      (!zone.access ||
        zone.access.mode === "public" ||
        zone.ownerId === actor ||
        zone.access.memberRoles.includes("residents") ||
        zone.access.memberIds.includes(actor)),
  );
}

export function reconcileFoundingHome(venue: SetupVenueDraft, members = foundingHomeMembers(venue)): SetupVenueDraft {
  if (!venue.classes?.includes("residence")) return venue;
  const occupied = members.length > 0 || !!venue.workerIds?.length;
  const vacated = !occupied && foundingHomeMembers(venue).length > 0;
  const household = {
    ...venue,
    residentIds: members.filter((id) => id !== "player"),
    occupancy: { ...venue.occupancy, playerHome: members.includes("player"), residentCharacterId: null },
  };
  const updated = {
    ...venue,
    residentIds: members.filter((id) => id !== "player"),
    occupancy: { ...venue.occupancy, playerHome: members.includes("player"), residentCharacterId: null },
    residenceCapacity:
      venue.foundingCapacity === null
        ? Math.max(1, members.length)
        : (venue.foundingCapacity ?? venue.residenceCapacity ?? 1),
    ...(vacated ? { access: undefined } : {}),
    spaces: venue.spaces?.map((zone) => ({
      ...zone,
      access: vacated ? undefined : occupied ? (zone.access ?? draftZonePolicy(household, zone)) : zone.access,
    })),
    privateSpaces: venue.privateSpaces?.map((zone) =>
      zone.venueClass === "residence" && zone.ownerId && !members.includes(zone.ownerId)
        ? { ...zone, ownerId: "", access: undefined, controllerIds: undefined }
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
    const sleeping = choices.find((zone) => zone.ownerId === id) ?? common;
    if (sleeping)
      destinations[id] = {
        ...destinations[id],
        home: choices.some((zone) => zone.id === destinations[id]?.home)
          ? destinations[id].home
          : (common?.id ?? sleeping.id),
        sleep: choices.some((zone) => zone.id === destinations[id]?.sleep) ? destinations[id].sleep : sleeping.id,
      };
    else destinations[id] = { ...destinations[id], home: undefined, sleep: undefined };
  }
  return {
    ...updated,
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
  if (!rows.some((venue) => venue.id === venueId && venue.classes?.includes("residence"))) return rows;
  return rows.map((venue) => {
    const members = [...(venue.occupancy.playerHome ? ["player"] : []), ...(venue.residentIds ?? [])];
    const next = members.filter((id) => id !== actorId);
    if (venue.id === venueId && assigned) next.push(actorId);
    else if (!assigned && venue.id !== venueId) return venue;
    if (JSON.stringify(members) === JSON.stringify(next)) return venue;
    const updated = reconcileFoundingHome(venue, next);
    if (next.length > (updated.residenceCapacity ?? 1))
      throw new Error("This home is full. Increase its capacity or choose Automatic.");
    return updated;
  });
}

export function reconcileFoundingRoster(
  rows: SetupVenueDraft[],
  actors: { id: string; name: string }[],
  addedIds: string[],
  communityVenueId: string,
): SetupVenueDraft[] {
  const ids = actors.map((actor) => actor.id);
  const next = rows.map((venue) => {
    const members = [...(venue.occupancy.playerHome ? ["player"] : []), ...(venue.residentIds ?? [])];
    return members.some((id) => !ids.includes(id))
      ? reconcileFoundingHome(
          venue,
          members.filter((id) => ids.includes(id)),
        )
      : venue;
  });
  for (const actor of actors.filter((actor) => !rows.length || addedIds.includes(actor.id))) {
    if (
      next.some((venue) => (actor.id === "player" ? venue.occupancy.playerHome : venue.residentIds?.includes(actor.id)))
    )
      continue;
    const id = `founding-home:${actor.id}`;
    const existing = next.find((venue) => venue.id === id);
    if (existing) {
      const capacity =
        existing.foundingCapacity === null ? 4 : (existing.foundingCapacity ?? existing.residenceCapacity ?? 1);
      if (foundingHomeMembers(existing).length >= capacity) continue;
      const updated = assignFoundingHome(next, id, actor.id, true);
      next.splice(0, next.length, ...updated);
    } else {
      if (next.length >= 16) continue;
      const venue = newSetupVenue(id, "residence", 0.5, 0.5, actor.id === "player");
      venue.name = `${actor.name} home`;
      venue.residentIds = actor.id === "player" ? [] : [actor.id];
      venue.presentation = { ...venue.presentation, x: null, y: null };
      next.push(reconcileFoundingHome(venue));
    }
  }
  if (!next.some((venue) => venue.id === communityVenueId) && next.length < 16) {
    const venue = newSetupVenue(communityVenueId, "community", 0.5, 0.5);
    venue.presentation = { ...venue.presentation, x: null, y: null };
    next.push(venue);
  }
  return next;
}

export function assignFoundingPrivateZone(venue: SetupVenueDraft, zoneId: string, actor: string): SetupVenueDraft {
  if (!foundingHomeMembers(venue).includes(actor)) return venue;
  const next = {
    ...venue,
    privateSpaces: venue.privateSpaces?.map((zone) =>
      zone.id === zoneId
        ? {
            ...zone,
            ownerId: actor,
            controllerIds: undefined,
            access: draftZonePolicy(venue, { ...zone, ownerId: actor }, true),
          }
        : zone,
    ),
    destinations: { ...venue.destinations, [actor]: { ...venue.destinations?.[actor], sleep: zoneId } },
  };
  return reconcileFoundingHome(next);
}
