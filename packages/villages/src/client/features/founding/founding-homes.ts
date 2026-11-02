import type { VillageVenue } from "../../../shared/contracts/village.js";
import { newSetupVenue } from "./FoundingPanels.js";
import { startingZone } from "./founding-template.js";

function homeMembers(venue: VillageVenue, members: string[]): VillageVenue {
  const occupied = members.length > 0 || !!venue.workerIds?.length;
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
    const common = venue.spaces?.find((zone) => zone.venueClass === "residence");
    const sleeping = venue.privateSpaces?.find((zone) => zone.ownerId === id) ?? common;
    if (sleeping)
      destinations[id] = {
        ...destinations[id],
        home: destinations[id]?.home ?? common?.id ?? sleeping.id,
        sleep: destinations[id]?.sleep ?? sleeping.id,
      };
  }
  return {
    ...venue,
    residentIds: members.filter((id) => id !== "player"),
    occupancy: { ...venue.occupancy, playerHome: members.includes("player"), residentCharacterId: null },
    residenceCapacity: Math.max(venue.residenceCapacity ?? 1, members.length),
    destinations,
    ...(!occupied ? { access: undefined } : {}),
    spaces: occupied ? venue.spaces : venue.spaces?.map((zone) => ({ ...zone, access: undefined })),
    privateSpaces: venue.privateSpaces?.map((zone) =>
      zone.venueClass === "residence" && !members.includes(zone.ownerId)
        ? { ...zone, ownerId: "", access: undefined }
        : zone,
    ),
  };
}

/** Starting assignments change membership, never the identity or physical details of a place. */
export function assignFoundingHome(
  rows: VillageVenue[],
  venueId: string,
  actorId: string,
  assigned: boolean,
): VillageVenue[] {
  if (!rows.some((venue) => venue.id === venueId && venue.classes?.includes("residence"))) return rows;
  return rows.map((venue) => {
    const members = [...(venue.occupancy.playerHome ? ["player"] : []), ...(venue.residentIds ?? [])];
    const next = members.filter((id) => id !== actorId);
    if (venue.id === venueId && assigned) next.push(actorId);
    else if (!assigned && venue.id !== venueId) return venue;
    if (JSON.stringify(members) === JSON.stringify(next)) return venue;
    return homeMembers(venue, next);
  });
}

export function reconcileFoundingRoster(
  rows: VillageVenue[],
  actors: { id: string; name: string }[],
  addedIds: string[],
  communityVenueId: string,
): VillageVenue[] {
  const ids = actors.map((actor) => actor.id);
  const next = rows.map((venue) => {
    const members = [...(venue.occupancy.playerHome ? ["player"] : []), ...(venue.residentIds ?? [])];
    return members.some((id) => !ids.includes(id))
      ? homeMembers(
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
      const updated = assignFoundingHome(next, id, actor.id, true);
      next.splice(0, next.length, ...updated);
    } else {
      if (next.length >= 16) continue;
      const venue = newSetupVenue(id, "residence", 0.5, 0.5, actor.id === "player");
      venue.name = `${actor.name} home`;
      venue.residentIds = actor.id === "player" ? [] : [actor.id];
      venue.presentation = { ...venue.presentation, x: null, y: null };
      venue.spaces = [startingZone(venue, false)];
      venue.privateSpaces = [startingZone(venue, true)];
      next.push(venue);
    }
  }
  if (!next.some((venue) => venue.id === communityVenueId) && next.length < 16) {
    const venue = newSetupVenue(communityVenueId, "community", 0.5, 0.5);
    venue.presentation = { ...venue.presentation, x: null, y: null };
    next.push(venue);
  }
  return next;
}
