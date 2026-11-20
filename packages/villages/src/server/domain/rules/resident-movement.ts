import type { VenueScene } from "../models/scene-model.js";
import type { VillageState, VillageVenue } from "../models/world.js";
import { NPC_PREFIX } from "./places.js";
import { badGateway } from "./errors.js";
import {
  actorTrespassReason,
  contactPath,
  contactPosition,
  contactNeighbors,
  sceneAccessContext,
  physicallyUsableZone,
  sceneTrespassReason,
  type ContactMove,
} from "./venue-contact.js";
import { venueZones } from "./venue-zones.js";
import { MAX_ZONE_VILLAGERS } from "./venue-model.js";
import { sceneLayoutVenue, sceneAccessState } from "./scene-layout.js";
import { continuityActor } from "./continuity-actors.js";
import { evaluateZoneAccess } from "./venue-access.js";
import { sceneZoneOccupants } from "./scene-attendance.js";
import type { ActorTrespass } from "./scene-trespass.js";
type FollowingMove = { actorId: string; permissionId?: string; permissionIds: string[]; trespass?: ActorTrespass };

/** One ordinary movement plan for followers, with the same captured/live checks at every hop. */
export function followingMovementParty(
  state: VillageState,
  venue: VillageVenue,
  scene: VenueScene,
  to: string,
  escort = scene.accompanying,
) {
  const from = scene.zoneId ?? "",
    at = sceneAccessContext(scene, undefined, state.timeZone).at!;
  const capturedState = sceneAccessState(state, scene),
    captured = sceneLayoutVenue(venue, scene);
  const local = (scene.movementAgreements ?? []).filter(
    (row) =>
      contactPosition(scene, row.actorId) === from &&
      !scene.departedIds?.includes(row.actorId) &&
      (row.following || (row.from === from && row.zoneId === to)),
  );
  const candidates = [...new Set(local.map((row) => row.actorId))].sort();
  let selected = candidates.filter((id) =>
    local.some((row) => row.actorId === id && continuityActor(state, id)?.incarnation === row.incarnation),
  );
  const required = (escort ?? [])
    .filter((row) => contactPosition(scene, row.characterId) !== row.zoneId)
    .map((row) => row.characterId);
  selected = selected.filter((id) => !required.includes(id));
  const staying = () => ({
    accompanying: scene.accompanying ?? [],
    moves: [] as FollowingMove[],
    staying: [...new Set([...candidates, ...required])],
    path: undefined as string[] | undefined,
    playerPermissionIds: [] as string[],
    playerTrespass: false,
  });
  if (!candidates.length && !required.length)
    return {
      accompanying: escort ?? [],
      moves: [] as FollowingMove[],
      staying: [],
      path: undefined as string[] | undefined,
      playerPermissionIds: [] as string[],
      playerTrespass: false,
    };
  const positions = (zoneId: string) =>
    [
      ...(escort ?? []).filter((row) => !selected.includes(row.characterId)),
      ...selected.map((characterId) => ({ characterId, zoneId })),
    ].map((row) =>
      selected.includes(row.characterId) || required.includes(row.characterId) ? { ...row, zoneId } : row,
    );
  for (;;) {
    const accompanying = positions(to),
      projected = { ...scene, accompanying };
    const destination = captured.zones?.find((row) => row.id === to);
    let path: string[] | undefined;
    for (const together of [true, false]) {
      const routes = [[from]],
        seen = new Set([from]);
      for (const route of routes) {
        const last = route.at(-1)!;
        if (last === to) {
          path = route;
          break;
        }
        for (const nextId of contactNeighbors(captured, last, scene)) {
          if (seen.has(nextId) || !contactNeighbors(venue, last).includes(nextId)) continue;
          const liveZone = venue.zones?.find((row) => row.id === nextId),
            savedZone = captured.zones?.find((row) => row.id === nextId);
          if (
            !liveZone ||
            !savedZone ||
            !physicallyUsableZone(state, venue, liveZone, at) ||
            !physicallyUsableZone(capturedState, captured, savedZone, at)
          )
            continue;
          const next = { ...projected, zoneId: nextId, accompanying: positions(nextId) };
          if (
            !evaluateZoneAccess(venue, liveZone, "player", {
              ...sceneAccessContext(next, at),
              accepting: true,
              environment: state.narrative,
            }).allowed ||
            !evaluateZoneAccess(captured, savedZone, "player", {
              ...sceneAccessContext(next, at),
              accepting: true,
              environment: capturedState.narrative,
            }).allowed
          )
            continue;
          if (together) {
            if (
              sceneZoneOccupants(next, captured, nextId).filter((row) => !row.characterId.startsWith(NPC_PREFIX))
                .length > MAX_ZONE_VILLAGERS
            )
              continue;
            const fits = [...required, ...selected].every((actorId) => {
              if (
                !required.includes(actorId) &&
                !local.some((row) => row.actorId === actorId && row.following) &&
                (route.length !== 1 || nextId !== to)
              )
                return false;
              const live = evaluateZoneAccess(venue, liveZone, actorId, {
                ...sceneAccessContext(next, at),
                accepting: true,
                environment: state.narrative,
              });
              const admitted = evaluateZoneAccess(captured, savedZone, actorId, {
                ...sceneAccessContext(next, at),
                accepting: true,
                environment: capturedState.narrative,
              });
              return live.allowed && admitted.allowed && live.permissionId === admitted.permissionId;
            });
            if (!fits) continue;
          }
          seen.add(nextId);
          routes.push([...route, nextId]);
        }
      }
      if (path) break;
    }
    path ??=
      destination && sceneTrespassReason(capturedState, captured, destination, scene, at) ? [from, to] : undefined;
    const moves: FollowingMove[] = [];
    const playerPermissionIds: string[] = [];
    let playerTrespass = false;
    let blocked: string | undefined;
    if (!path || path.length < 2) return staying();
    for (let hop = 1; hop < path.length && !blocked; hop++) {
      const zoneId = path[hop]!,
        previous = path[hop - 1]!,
        zone = venue.zones?.find((row) => row.id === zoneId),
        saved = captured.zones?.find((row) => row.id === zoneId);
      const here = { ...scene, zoneId: previous, accompanying: positions(previous) },
        next = { ...here, zoneId, accompanying: positions(zoneId) };
      if (
        !zone ||
        !saved ||
        !contactNeighbors(venue, previous).includes(zoneId) ||
        !contactNeighbors(captured, previous, scene).includes(zoneId) ||
        !physicallyUsableZone(state, venue, zone, at) ||
        !physicallyUsableZone(capturedState, captured, saved, at)
      )
        return staying();
      {
        const livePlayer = evaluateZoneAccess(venue, zone, "player", {
          ...sceneAccessContext(next, at),
          accepting: true,
          environment: state.narrative,
        });
        const savedPlayer = evaluateZoneAccess(captured, saved, "player", {
          ...sceneAccessContext(next, at),
          accepting: true,
          environment: capturedState.narrative,
        });
        if (livePlayer.allowed && savedPlayer.allowed) {
          if (livePlayer.permissionId !== savedPlayer.permissionId) return staying();
          if (livePlayer.permissionId && !playerPermissionIds.includes(livePlayer.permissionId))
            playerPermissionIds.push(livePlayer.permissionId);
        }
        if (!livePlayer.allowed || !savedPlayer.allowed) {
          const reason = path.length === 2 && actorTrespassReason(state, venue, zone, next, "player", previous, at);
          if (!reason || actorTrespassReason(capturedState, captured, saved, next, "player", previous, at) !== reason)
            return staying();
          playerTrespass = true;
        }
      }
      if (
        sceneZoneOccupants(next, captured, zoneId).filter((row) => !row.characterId.startsWith(NPC_PREFIX)).length >
        MAX_ZONE_VILLAGERS
      ) {
        blocked = selected.findLast((id) => !id.startsWith(NPC_PREFIX));
        if (!blocked) return staying();
      }
      for (const actorId of [...required, ...selected]) {
        if (blocked) break;
        if (
          !required.includes(actorId) &&
          path.length !== 2 &&
          !local.some((row) => row.actorId === actorId && row.following)
        ) {
          blocked = actorId;
          break;
        }
        const live = evaluateZoneAccess(venue, zone, actorId, {
          ...sceneAccessContext(next, at),
          accepting: true,
          environment: state.narrative,
        });
        const admitted = evaluateZoneAccess(captured, saved, actorId, {
          ...sceneAccessContext(next, at),
          accepting: true,
          environment: capturedState.narrative,
        });
        let member = moves.find((row) => row.actorId === actorId);
        if (!member) {
          member = { actorId, permissionIds: [] };
          moves.push(member);
        }
        if (live.allowed && admitted.allowed) {
          if (live.permissionId !== admitted.permissionId) {
            blocked = actorId;
            break;
          }
          if (live.permissionId && !member.permissionIds.includes(live.permissionId))
            member.permissionIds.push(live.permissionId);
          if (hop === path.length - 1) member.permissionId = live.permissionId;
        } else {
          const willing = local.some(
            (row) =>
              row.actorId === actorId &&
              row.incarnation === continuityActor(state, actorId)?.incarnation &&
              row.trespass &&
              (row.following || (row.from === previous && row.zoneId === zoneId)),
          );
          const reason =
            willing && path.length === 2 && actorTrespassReason(state, venue, zone, next, actorId, previous, at);
          if (!reason || actorTrespassReason(capturedState, captured, saved, next, actorId, previous, at) !== reason) {
            blocked = actorId;
            break;
          }
          member.trespass = { actorId, zoneId, reason };
        }
      }
    }
    if (!blocked)
      return {
        accompanying,
        moves,
        staying: candidates.filter((id) => !selected.includes(id) && !required.includes(id)),
        path,
        playerPermissionIds,
        playerTrespass,
      };
    if (required.includes(blocked)) return staying();
    selected = selected.filter((id) => id !== blocked);
  }
}

function sceneResidentIds(scene: VenueScene): string[] {
  return [
    ...new Set([
      ...(scene.sceneAttendance?.occupants ?? []).map((person) => person.characterId),
      ...scene.activeIds,
      ...(scene.contactGeneration?.remoteIds ?? []),
    ]),
  ].filter((id) => !scene.departedIds?.includes(id));
}

/** Private writing choices, not resident knowledge or evidence of unseen attendance. */
export function residentMovementOptions(
  state: VillageState,
  venue: VillageVenue,
  scene: VenueScene,
  ids: string[],
  at?: Date,
) {
  venue = sceneLayoutVenue(venue, scene);
  const zones = venueZones(venue);
  const occupancy = new Map<string, number>();
  for (const id of sceneResidentIds(scene).filter((id) => !id.startsWith(NPC_PREFIX))) {
    const position = contactPosition(scene, id);
    if (position) occupancy.set(position, (occupancy.get(position) ?? 0) + 1);
  }
  const routes = ids.map((characterId) => ({
    characterId,
    trespassZoneIds: zones
      .filter((zone) =>
        actorTrespassReason(
          state,
          venue,
          zone,
          scene,
          characterId,
          contactPosition(scene, characterId),
          at ?? new Date(scene.sceneAttendance?.capturedAt ?? scene.startedAt),
        ),
      )
      .map((zone) => zone.id),
    zoneIds: zones
      .filter(
        (zone) =>
          (contactPath(state, venue, contactPosition(scene, characterId), zone.id, characterId, scene, at, true)
            ?.length ?? 0) > 1,
      )
      .map((zone) => zone.id),
  }));
  const fits = (zoneId: string, arrivals: number) => (occupancy.get(zoneId) ?? 0) + arrivals <= MAX_ZONE_VILLAGERS;
  const knownZones = zones.filter((zone) => zone.id === scene.zoneId || zone.seen);
  const cohorts = knownZones.flatMap((zone) => {
    const members = routes.filter((row) => contactPosition(scene, row.characterId) !== zone.id);
    return members.length < 2
      ? []
      : [
          {
            zoneId: zone.id,
            characterIds: members.map((row) => row.characterId),
            canCrossTogether:
              members.every((row) => row.zoneIds.includes(zone.id)) &&
              fits(zone.id, members.filter((row) => !row.characterId.startsWith(NPC_PREFIX)).length),
          },
        ];
  });
  // The selected writing cast is at most four: only eleven possible multi-person cohorts.
  const groups: { characterIds: string[]; zoneIds: string[] }[] = [];
  if (ids.length <= MAX_ZONE_VILLAGERS)
    for (let mask = 1; mask < 1 << ids.length; mask++) {
      const members = routes.filter((_, index) => mask & (1 << index));
      if (members.length < 2) continue;
      const zoneIds = members[0]!.zoneIds.filter(
        (zoneId) =>
          members.every((member) => member.zoneIds.includes(zoneId)) &&
          fits(zoneId, members.filter((row) => !row.characterId.startsWith(NPC_PREFIX)).length),
      );
      if (zoneIds.length) groups.push({ characterIds: members.map((row) => row.characterId), zoneIds });
    }
  return {
    zones: knownZones.map((zone) => ({ id: zone.id, name: zone.name, connectedTo: zone.connectedTo })),
    cohorts,
    destinations: routes.map((row) => ({
      ...row,
      zoneIds: row.zoneIds.filter((zoneId) => fits(zoneId, row.characterId.startsWith(NPC_PREFIX) ? 0 : 1)),
      trespassZoneIds: row.trespassZoneIds.filter((zoneId) =>
        fits(zoneId, row.characterId.startsWith(NPC_PREFIX) ? 0 : 1),
      ),
    })),
    groups,
  };
}

/** Display eligibility and capacity once per destination. The native move checks still use the full options. */
export function residentMovementPrompt(options: ReturnType<typeof residentMovementOptions>) {
  return options.zones.map(({ id, name, connectedTo }) => {
    const eligible = options.destinations.filter((row) => row.zoneIds.includes(id)).map((row) => row.characterId);
    const trespass = options.destinations
      .filter((row) => row.trespassZoneIds.includes(id))
      .map((row) => row.characterId);
    const villagers = (actors: string[]) => actors.filter((actor) => !actor.startsWith(NPC_PREFIX)).length;
    const maxVillagers = Math.max(
      eligible.some((actor) => !actor.startsWith(NPC_PREFIX)) ? 1 : 0,
      ...options.groups.filter((group) => group.zoneIds.includes(id)).map((group) => villagers(group.characterIds)),
    );
    return {
      id,
      name,
      connectedTo,
      ...(eligible.length ? { eligible } : {}),
      ...(trespass.length ? { trespass } : {}),
      ...(maxVillagers < villagers(eligible) ? { maxVillagers } : {}),
    };
  });
}

/** Validate all captured occupants, including passive witnesses and offscreen destinations. */
export function assertSceneMovementCapacity(
  scene: VenueScene,
  moves: readonly Pick<ContactMove, "characterId" | "zoneId" | "segment">[],
): void {
  const positions = new Map(sceneResidentIds(scene).map((id) => [id, contactPosition(scene, id)]));
  const segments = [...new Set(moves.map((move) => move.segment))].sort((a, b) => a - b);
  for (const segment of segments) {
    for (const move of moves.filter((row) => row.segment === segment)) positions.set(move.characterId, move.zoneId);
    const counts = new Map<string, number>();
    for (const [id, position] of positions) {
      if (!position || id.startsWith(NPC_PREFIX)) continue;
      counts.set(position, (counts.get(position) ?? 0) + 1);
      if (counts.get(position)! > MAX_ZONE_VILLAGERS)
        throw badGateway("The reply would overcrowd a Zone. Your draft is preserved.");
    }
  }
}
