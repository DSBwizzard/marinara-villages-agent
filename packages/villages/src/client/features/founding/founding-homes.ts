import type { SetupVenueDraft } from "../../shared/types.js";
import { contactNeighborIds } from "../../../shared/helpers/zone-contact.js";
import { newSetupVenue } from "./FoundingPanels.js";
import { quickStartTemplates, separateFoundingTemplates } from "./quick-start-drafts.js";
import { draftZonePolicy, foundingLayoutZones } from "./villages-founding-zones.js";

export const foundingHomeMembers = (venue: SetupVenueDraft): string[] => [
  ...(venue.occupancy.playerHome ? ["player"] : []),
  ...(venue.residentIds ?? []),
];

function reachableFoundingZones(venue: SetupVenueDraft, actor: string, sleep = venue.destinations?.[actor]?.sleep) {
  const members = foundingHomeMembers(venue),
    zones = foundingLayoutZones(venue);
  const accessible = new Set(
    zones
      .filter((zone) => {
        if (zone.kind === "exterior" || zone.id === sleep) return true;
        const area = zone as NonNullable<SetupVenueDraft["spaces"]>[number];
        const access = area.access ?? draftZonePolicy(venue, area, zone.kind === "personal");
        return (
          access.mode === "public" ||
          area.ownerId === actor ||
          (access.managerIds ?? members).includes(actor) ||
          access.memberIds.includes(actor) ||
          (access.memberRoles.includes("residents") && members.includes(actor))
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
    residenceCapacity:
      venue.foundingCapacity === null
        ? Math.max(0, members.length)
        : (venue.foundingCapacity ?? venue.residenceCapacity ?? 0),
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
    if (next.length > (updated.residenceCapacity ?? 0))
      throw new Error("This home is full. Increase its capacity or choose Automatic.");
    return updated;
  });
}

export function reconcileFoundingRoster(
  rows: SetupVenueDraft[],
  actors: { id: string; name: string }[],
  addedIds: string[],
  openingVenueId: string,
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
        existing.foundingCapacity === null ? 4 : (existing.foundingCapacity ?? existing.residenceCapacity ?? 0);
      if (foundingHomeMembers(existing).length >= capacity) continue;
      const updated = assignFoundingHome(next, id, actor.id, true);
      next.splice(0, next.length, ...updated);
    } else {
      if (next.filter((venue) => foundingHomeMembers(venue).length > 0).length >= 4) {
        const vacant = next.find(
          (venue) =>
            !foundingHomeMembers(venue).length &&
            foundingSleepZones(reconcileFoundingHome(venue, [actor.id]), actor.id).length,
        );
        if (vacant) {
          const updated = assignFoundingHome(next, vacant.id, actor.id, true);
          next.splice(0, next.length, ...updated);
        }
        continue;
      }
      const venue = newSetupVenue(id, 0.5, 0.5, actor.id === "player");
      venue.name = `${actor.name} home`;
      venue.residentIds = actor.id === "player" ? [] : [actor.id];
      venue.presentation = { ...venue.presentation, x: null, y: null };
      const template = quickStartTemplates([venue])[0]!;
      next.push(
        reconcileFoundingHome({
          ...venue,
          layout: template.layout,
          spaces: template.spaces,
          privateSpaces: template.privateSpaces,
        }),
      );
    }
  }
  for (const [id, name] of [
    [openingVenueId, "Meeting place"],
    ["founding-garden", "Shared space"],
    ["founding-community", "Meeting place"],
  ]) {
    if (next.filter((venue) => venue.spaces?.some((zone) => zone.access?.mode === "public")).length >= 2) break;
    if (next.some((venue) => venue.id === id) || next.length >= 16) continue;
    const venue = quickStartTemplates([{ ...newSetupVenue(id!, 0.5, 0.5), category: "public-center" }])[0]!;
    venue.name = name!;
    while (next.some((row) => row.name === venue.name)) venue.name += " 2";
    venue.presentation = { ...venue.presentation, x: null, y: null };
    next.push(venue);
  }
  return next;
}

/** People changes keep a former resident's authored home available if that resident returns. */
export function selectFoundingHomes(
  venues: SetupVenueDraft[],
  unusedHomes: SetupVenueDraft[],
  actors: { id: string; name: string }[],
  openingVenueId: string,
  removedIds: string[] = [],
) {
  const chosen = new Set(actors.map((actor) => actor.id));
  const active = venues.filter(
    (venue) =>
      !!venue.workerIds?.length ||
      foundingHomeMembers(venue).length !== 1 ||
      foundingHomeMembers(venue).some((id) => chosen.has(id)),
  );
  const unused = [...unusedHomes, ...venues.filter((venue) => !active.includes(venue))];
  const removed = new Set([
    ...removedIds,
    ...[...venues, ...unusedHomes].flatMap(foundingHomeMembers).filter((id) => !chosen.has(id)),
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
    ...(zone.ownerId && removed.has(zone.ownerId) ? { access: undefined, controllerIds: undefined } : {}),
  });
  const templates = separateFoundingTemplates(
    actors.filter((actor) => actor.id !== "player").map((actor) => actor.id),
    openingVenueId,
    [...venues, ...unusedHomes].map((venue) => venue.id),
  );
  for (const actor of actors) {
    if (active.some((venue) => foundingHomeMembers(venue).includes(actor.id))) continue;
    const index = unused.findIndex((venue) => foundingHomeMembers(venue)[0] === actor.id);
    const template = templates.find((venue) => foundingHomeMembers(venue)[0] === actor.id)!;
    const home =
      index >= 0
        ? unused.splice(index, 1)[0]!
        : reconcileFoundingHome({
            ...template,
            name: `${actor.name} home`,
            presentation: { ...template.presentation, x: null, y: null },
          });
    active.push(home);
  }
  // Dormant homes retain their authored assignments; only active places lose departed founders.
  const reconciled = active.map((venue) =>
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
  return { venues: reconcileFoundingRoster(reconciled, actors, [], openingVenueId), unusedHomes: unused };
}
