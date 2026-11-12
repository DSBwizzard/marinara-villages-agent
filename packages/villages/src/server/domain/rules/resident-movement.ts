import type { VenueScene } from "../models/scene-model.js";
import type { VillageState, VillageVenue } from "../models/world.js";
import { NPC_PREFIX } from "./places.js";
import { badGateway } from "./errors.js";
import { contactPath, contactPosition, type ContactMove } from "./venue-contact.js";
import { venueZones } from "./venue-zones.js";
import { MAX_ZONE_VILLAGERS } from "./venue-model.js";
import { sceneLayoutVenue } from "./scene-layout.js";

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
    zoneIds: zones
      .filter(
        (zone) =>
          (contactPath(state, venue, contactPosition(scene, characterId), zone.id, characterId, scene, at)?.length ??
            0) > 1,
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
    })),
    groups,
  };
}

/** Display eligibility and capacity once per destination. The native move checks still use the full options. */
export function residentMovementPrompt(options: ReturnType<typeof residentMovementOptions>) {
  return options.zones.map(({ id, name, connectedTo }) => {
    const eligible = options.destinations.filter((row) => row.zoneIds.includes(id)).map((row) => row.characterId);
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
