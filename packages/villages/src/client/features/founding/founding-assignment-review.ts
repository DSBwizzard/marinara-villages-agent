import type { VillageVenue } from "../../../shared/contracts/village.js";
import { foundingHomeMembers, reachableFoundingZones } from "./founding-homes.js";
import { workOverlap, workTime, venueWorkProblem } from "../../../shared/helpers/venue-work.js";

export type FoundingAssignmentChange = { id: string; actor: string; kind: "Home" | "Work"; venueId?: string };
const home = (rows: VillageVenue[], actor: string) => {
  const venue = rows.find((row) => foundingHomeMembers(row).includes(actor));
  const destinations = venue?.destinations?.[actor];
  return venue ? { venueId: venue.id, home: destinations?.home, sleep: destinations?.sleep } : null;
};
const work = (venue: VillageVenue | undefined, actor: string) =>
  venue?.access?.work?.find((row) => row.characterId === actor) ?? null;

export function foundingAssignmentChanges(
  before: VillageVenue[],
  proposed: VillageVenue[],
): FoundingAssignmentChange[] {
  const actors = [
    ...new Set(
      [...before, ...proposed].flatMap((row) => [
        ...foundingHomeMembers(row),
        ...(row.access?.work ?? []).map((item) => item.characterId),
      ]),
    ),
  ];
  return actors.flatMap((actor) => [
    ...(JSON.stringify(home(before, actor)) !== JSON.stringify(home(proposed, actor))
      ? [{ id: `home:${actor}`, actor, kind: "Home" as const }]
      : []),
    ...[...new Set([...before, ...proposed].map((row) => row.id))].flatMap((venueId) =>
      JSON.stringify(
        work(
          before.find((row) => row.id === venueId),
          actor,
        ),
      ) !==
      JSON.stringify(
        work(
          proposed.find((row) => row.id === venueId),
          actor,
        ),
      )
        ? [{ id: `work:${venueId}:${actor}`, actor, kind: "Work" as const, venueId }]
        : [],
    ),
  ]);
}

/** Physical drafts and assignment decisions commit together; unchecked changes keep exact prior assignments. */
export function applyFoundingAssignmentReview(before: VillageVenue[], proposed: VillageVenue[], accepted: string[]) {
  const actors = [...new Set([...before, ...proposed].flatMap(foundingHomeMembers))];
  const homes = new Map(
    actors.map((actor) => [actor, home(accepted.includes(`home:${actor}`) ? proposed : before, actor)]),
  );
  const rows = [
    ...proposed,
    ...before.filter(
      (row) =>
        !proposed.some((draft) => draft.id === row.id) &&
        (actors.some((actor) => homes.get(actor)?.venueId === row.id) ||
          row.access?.work?.some((term) => !accepted.includes(`work:${row.id}:${term.characterId}`))),
    ),
  ];
  return rows.map((draft) => {
    const prior = before.find((row) => row.id === draft.id);
    const members = actors.filter((actor) => homes.get(actor)?.venueId === draft.id);
    const workers = [
      ...new Set([...(prior?.access?.work ?? []), ...(draft.access?.work ?? [])].map((row) => row.characterId)),
    ];
    const terms = workers.flatMap((actor) => {
      const value = work(
        accepted.includes(`work:${draft.id}:${actor}`) ? proposed.find((row) => row.id === draft.id) : prior,
        actor,
      );
      return value ? [value] : [];
    });
    const destinations: NonNullable<VillageVenue["destinations"]> = {};
    for (const actor of members) {
      const selected = homes.get(actor)!;
      destinations[actor] = { home: selected.home, sleep: selected.sleep };
    }
    for (const term of terms) destinations[term.characterId] = { ...destinations[term.characterId], work: term.zoneId };
    const access = draft.access ?? prior?.access;
    const result = {
      ...draft,
      residentIds: members.filter((id) => id !== "player"),
      occupancy: { ...draft.occupancy, playerHome: members.includes("player"), residentCharacterId: null },
      workerIds: terms.map((row) => row.characterId),
      destinations,
      ...(access
        ? {
            access: {
              ...access,
              managerIds: prior ? (prior.access?.managerIds ?? foundingHomeMembers(prior)) : [],
              work: terms,
              workOffers: [],
            },
          }
        : {}),
      privateSpaces: draft.privateSpaces?.map((zone) => {
        const old = prior?.privateSpaces?.find((row) => row.id === zone.id);
        const ownerId =
          old?.ownerId && members.includes(old.ownerId)
            ? old.ownerId
            : zone.ownerId && members.includes(zone.ownerId)
              ? zone.ownerId
              : "";
        const removed = zone.ownerId && zone.ownerId !== ownerId ? zone.ownerId : "";
        return {
          ...zone,
          ownerId,
          ...(removed && zone.access
            ? {
                access: {
                  ...zone.access,
                  managerIds: zone.access.managerIds?.filter((id) => id !== removed) ?? null,
                  memberIds: zone.access.memberIds.filter((id) => id !== removed),
                  inviterIds: zone.access.inviterIds.filter((id) => id !== removed),
                },
              }
            : {}),
        };
      }),
    };
    // Entry and schedules may change; operators and exceptional grants stay manual.
    const policy = <T extends NonNullable<VillageVenue["spaces"]>[number]>(zone: T): T => {
      if (!zone.access) return zone;
      const old = [...(prior?.spaces ?? []), ...(prior?.privateSpaces ?? [])].find((row) => row.id === zone.id);
      const previous = old?.access;
      const keep = (id: string) => id !== old?.ownerId || members.includes(id);
      return {
        ...zone,
        access: {
          ...zone.access,
          managerIds: previous?.managerIds?.filter(keep) ?? null,
          memberIds: previous?.memberIds.filter(keep) ?? [],
          inviterIds: previous?.inviterIds.filter(keep) ?? [],
          memberRoles: previous?.memberRoles ?? [],
        },
      };
    };
    result.spaces = result.spaces?.map(policy);
    result.privateSpaces = result.privateSpaces?.map(policy);
    // Rejected proposals must not force a move by changing an assigned room or its route.
    const retained = members.filter((actor) => !accepted.includes(`home:${actor}`));
    if (
      terms.some(
        (term) =>
          !accepted.includes(`work:${draft.id}:${term.characterId}`) &&
          venueWorkProblem({ ...result, zones: undefined }, term),
      ) ||
      retained.some((actor) => {
        const reachable = reachableFoundingZones(result, actor);
        return (
          !reachable.has(destinations[actor]?.sleep ?? "") ||
          (!!destinations[actor]?.home && !reachable.has(destinations[actor].home!))
        );
      })
    ) {
      const preserve = <T extends NonNullable<VillageVenue["spaces"]>[number]>(zone: T): T => {
        const old = [...(prior?.spaces ?? []), ...(prior?.privateSpaces ?? [])].find((row) => row.id === zone.id);
        return old
          ? {
              ...zone,
              access: old.access,
              connectedTo: old.connectedTo,
              ownerId: old.ownerId && members.includes(old.ownerId) ? old.ownerId : "",
            }
          : zone;
      };
      const all = [...(result.spaces ?? []), ...(result.privateSpaces ?? [])].map(preserve).map(policy);
      const personal = (id: string) =>
        prior?.privateSpaces?.some((zone) => zone.id === id) ||
        (!prior?.spaces?.some((zone) => zone.id === id) && draft.privateSpaces?.some((zone) => zone.id === id));
      result.spaces = all.filter((zone) => !personal(zone.id));
      result.privateSpaces = all
        .filter((zone) => personal(zone.id))
        .map((zone) => ({ ...zone, ownerId: zone.ownerId ?? "" }));
    }
    result.spaces = result.spaces?.map((zone) =>
      members.length && zone.access?.mode === "public"
        ? {
            ...zone,
            access: { ...zone.access, memberRoles: [...new Set([...zone.access.memberRoles, "residents" as const])] },
          }
        : zone,
    );
    result.layout = result.spaces?.length
      ? result.privateSpaces?.length
        ? "both"
        : "common"
      : result.privateSpaces?.length
        ? "private"
        : "exterior";
    return result;
  });
}

export function foundingAssignmentValue(rows: VillageVenue[], change: FoundingAssignmentChange): string {
  const assignment = change.kind === "Home" ? home(rows, change.actor) : null;
  const venue = rows.find((row) => row.id === (assignment?.venueId ?? change.venueId));
  const terms = change.kind === "Work" ? work(venue, change.actor) : null;
  if (!venue || (change.kind === "Home" ? !assignment : !terms)) return "None";
  const zoneId = assignment?.sleep ?? terms?.zoneId;
  const zone = [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].find((row) => row.id === zoneId);
  return [
    venue.name,
    zone?.name,
    terms?.activity,
    terms
      ? `${terms.days.map((day) => day.slice(0, 3)).join(", ")} ${workTime(terms.startMinute)}–${workTime(terms.endMinute)}`
      : "",
    terms
      ? "Work access: " +
        terms.accessZoneIds
          .map(
            (id) =>
              [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].find((zone) => zone.id === id)?.name ?? id,
          )
          .join(", ")
      : "",
  ]
    .filter(Boolean)
    .join(", ");
}

export function foundingAssignmentReviewProblem(rows: VillageVenue[]): string {
  if (rows.length > 6)
    return "Keeping these assignments needs more than six Venues. Discard this older replacement and draft your current Venues again.";
  const terms = rows.flatMap((row) => row.access?.work ?? []);
  if (terms.some((term, index) => terms.slice(0, index).some((other) => workOverlap(term, other))))
    return "These Work choices overlap. Keep or accept compatible schedules.";
  for (const row of rows) {
    if (
      foundingHomeMembers(row).some((actor) => {
        const reachable = reachableFoundingZones(row, actor),
          destination = row.destinations?.[actor];
        return !reachable.has(destination?.sleep ?? "") || (!!destination?.home && !reachable.has(destination.home));
      })
    )
      return "Keep an accessible sleeping Zone for each resident.";
    for (const term of row.access?.work ?? []) {
      const problem = venueWorkProblem({ ...row, zones: undefined }, term);
      if (problem) return problem;
    }
  }
  return "";
}
