import type { VenueReplyLine, VenueScene } from "../models/scene-model.js";
import type { VillageState, VillageVenue } from "../models/world.js";
import { badGateway } from "./errors.js";
import { contactNeighbors, contactPath, contactPosition, type ContactMove } from "./venue-contact.js";
import { venueZones } from "./venue-zones.js";
import { MAX_ZONE_VILLAGERS } from "./venue-model.js";
import { sceneLayoutVenue } from "./scene-layout.js";
import { asRecord } from "./coerce.js";
import type { SemanticIntent } from "../models/semantic-model.js";

/** Private control signal, handled as an expected result before coordinator failure handling. */
export class UnavailableResidentMovement extends Error {}

/** Bind System's immediate-request nominations; code alone decides mechanical availability. */
export function residentMovementUnavailable(
  value: unknown,
  intent: SemanticIntent,
  state: VillageState,
  scene: VenueScene,
): boolean {
  const invalid = () => badGateway("System movement request interpretation is incomplete. Your draft is preserved.");
  if (!Array.isArray(value) || value.length > 8) throw invalid();
  const venue = state.venues.find((row) => row.id === scene.placeId);
  if (!venue) throw invalid();
  const zones = venueZones(sceneLayoutVenue(venue, scene));
  const residents = sceneResidentIds(scene);
  const cohorts = new Map<string, Set<string>>();
  const destinations = new Map<string, string>();
  for (const entry of value) {
    const row = asRecord(entry);
    const source = Number.isSafeInteger(row.source) ? intent.timeline[Number(row.source)] : undefined;
    if (
      !source ||
      !["speech", "action"].includes(source.kind) ||
      typeof row.zoneId !== "string" ||
      !zones.some((zone) => zone.id === row.zoneId && (zone.seen || zone.id === scene.zoneId)) ||
      !Array.isArray(row.characterIds) ||
      !row.characterIds.length ||
      row.characterIds.length > residents.length ||
      new Set(row.characterIds).size !== row.characterIds.length ||
      row.characterIds.some((id) => typeof id !== "string" || !residents.includes(id))
    )
      throw invalid();
    const cohort = cohorts.get(row.zoneId) ?? new Set<string>();
    for (const id of row.characterIds as string[]) {
      if (destinations.has(id) && destinations.get(id) !== row.zoneId) throw invalid();
      destinations.set(id, row.zoneId);
      if (contactPosition(scene, id) !== row.zoneId) cohort.add(id);
    }
    cohorts.set(row.zoneId, cohort);
  }
  for (const [zoneId, cohort] of cohorts) {
    const ids = [...cohort];
    if (!ids.length) continue;
    const options = residentMovementOptions(state, venue, scene, ids);
    const allowed =
      ids.length === 1
        ? options.destinations[0]?.zoneIds.includes(zoneId)
        : options.groups.some((group) => group.characterIds.length === ids.length && group.zoneIds.includes(zoneId));
    if (!allowed) return true;
  }
  return false;
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
export function residentMovementOptions(state: VillageState, venue: VillageVenue, scene: VenueScene, ids: string[]) {
  venue = sceneLayoutVenue(venue, scene);
  const zones = venueZones(venue);
  const occupancy = new Map<string, number>();
  for (const id of sceneResidentIds(scene)) {
    const position = contactPosition(scene, id);
    if (position) occupancy.set(position, (occupancy.get(position) ?? 0) + 1);
  }
  const routes = ids.map((characterId) => ({
    characterId,
    zoneIds: zones
      .filter(
        (zone) =>
          (contactPath(state, venue, contactPosition(scene, characterId), zone.id, characterId, scene)?.length ?? 0) >
          1,
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
            canCrossTogether: members.every((row) => row.zoneIds.includes(zone.id)) && fits(zone.id, members.length),
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
        (zoneId) => members.every((member) => member.zoneIds.includes(zoneId)) && fits(zoneId, members.length),
      );
      if (zoneIds.length) groups.push({ characterIds: members.map((row) => row.characterId), zoneIds });
    }
  return {
    zones: knownZones.map((zone) => ({ id: zone.id, name: zone.name, connectedTo: zone.connectedTo })),
    cohorts,
    destinations: routes.map((row) => ({ ...row, zoneIds: row.zoneIds.filter((zoneId) => fits(zoneId, 1)) })),
    groups,
  };
}

/** Validate all captured occupants, including passive witnesses and offscreen destinations. */
export function assertSceneMovementCapacity(scene: VenueScene, moves: readonly ContactMove[]): void {
  const positions = new Map(sceneResidentIds(scene).map((id) => [id, contactPosition(scene, id)]));
  const segments = [...new Set(moves.map((move) => move.segment ?? Infinity))].sort((a, b) => a - b);
  for (const segment of segments) {
    for (const move of moves.filter((row) => (row.segment ?? Infinity) === segment))
      positions.set(move.characterId, move.zoneId);
    const counts = new Map<string, number>();
    for (const position of positions.values()) {
      if (!position) continue;
      counts.set(position, (counts.get(position) ?? 0) + 1);
      if (counts.get(position)! > MAX_ZONE_VILLAGERS)
        throw badGateway("The reply would overcrowd a Zone. Your draft is preserved.");
    }
  }
}

export function residentPositionsAt(
  scene: VenueScene,
  moves: readonly ContactMove[],
  segment: number,
): Record<string, string> {
  return Object.fromEntries(
    sceneResidentIds(scene).map((id) => {
      const move = moves.find(
        (entry) => entry.characterId === id && entry.segment !== undefined && entry.segment <= segment,
      );
      return [id, move?.zoneId ?? contactPosition(scene, id)];
    }),
  );
}
export function residentLocalIdsAt(scene: VenueScene, moves: ContactMove[], segment: number): string[] {
  return Object.entries(residentPositionsAt(scene, moves, segment))
    .filter(([, zoneId]) => zoneId === (scene.zoneId ?? "exterior"))
    .map(([id]) => id);
}

export function residentMovementPrompt(
  state: VillageState,
  venue: VillageVenue,
  scene: VenueScene,
  ids: string[],
  reliable = false,
) {
  const destinations = ids.map((characterId) => ({
    characterId,
    ...(!scene.contactGeneration?.zoneEvents ? { fromZoneId: contactPosition(scene, characterId) } : {}),
    zoneIds: venueZones(venue)
      .filter(
        (zone) =>
          (contactPath(state, venue, contactPosition(scene, characterId), zone.id, characterId, scene)?.length ?? 0) >
          1,
      )
      .map((zone) => zone.id),
  }));
  if (reliable) {
    const origin = scene.zoneId ?? "exterior";
    const local = ids.filter((id) => contactPosition(scene, id) === origin);
    const doorway = ids.filter(
      (id) => !local.includes(id) && scene.doorwayContacts?.some((entry) => entry.characterId === id),
    );
    const bounded = !scene.operation || scene.operation.input.castLimitVersion === 1;
    const options = bounded ? residentMovementOptions(state, venue, scene, ids) : undefined;
    return `${options ? `Known recorded Zones: ${JSON.stringify(options.zones)}. These names ground recorded destinations; omission is not proof that a door or fictional space does not exist. Do not replace a known connected Zone with a wall or a different room.\n` : ""}Resident movement destinations: ${JSON.stringify(options?.destinations ?? destinations)}. ${options ? `Complete selected crossing cohorts: ${JSON.stringify(options.cohorts)}. Each result applies only when that exact cohort is requested; canCrossTogether:false means none of that requested cohort crosses this reply. Smaller crossing choices, only for explicitly requested smaller groups: ${JSON.stringify(options.groups)}. Private movement planning only: a maximum of four villagers per Zone; the player uses no villager slot. Individual choices do not authorize a combined move: every multi-resident crossing into one destination must fit a listed group. Count only residents changing Zones, not those already there. Determine the requested movers first, then check that exact group. A listed smaller group is usable only when that smaller group was requested; never choose it as a fallback for a larger request. If the requested whole group has no listed choice, nobody in that group crosses in this reply, including in separate segments. Keep them in place and respond naturally; do not invent an access refusal or promise an impossible crossing. Missing choices reveal no reason, occupant, headcount or interior. Never turn these private constraints into character knowledge, dialogue explanations or memory evidence. A resident can decline or wait for an established reason. When a resident willingly accepts a permitted immediate crossing, complete it in this reply rather than repeatedly preparing or promising. Ordinary future plans remain plans.\n` : ""}ALREADY in player Zone ${origin}: ${JSON.stringify(local)}. Continue captured positions; never stage these residents arriving from a kitchen, doorway or other Zone. Same-Zone steps/seating need no metadata. ${doorway.length ? `Actual remote doorway speakers ${JSON.stringify(doorway)} may willingly enter or remain remote.` : "No doorway arrival is required."} Others stay offstage unless a completed permitted crossing brings them here. contactMoves only for a DIFFERENT listed destination; no player movement/access is granted.`;
  }
  return `Resident movement: ${JSON.stringify(destinations)}. A willing resident continuing an in-person doorway conversation normally steps into the player's Zone (${scene.zoneId}). They may instead explicitly stay inside, decline, or speak remotely. Opening a door alone is not movement. Residents already here may stay or willingly return to another permitted Zone during this reply. Return contactMoves:[{characterId,zoneId,segment,quote}] only for a completed voluntary move. segment is the zero-based visible narration segment describing that resident crossing into the exact destination; quote is the exact completed-movement narration, naming the resident. No ceremonial spoken agreement is required. One move per resident per reply. Dialogue after that segment uses the new position; earlier words are never retroactively heard. Narrate only movement visible from the player's Zone, not unseen journeys or destination interiors. Do not narrate a crossing without matching movement metadata. Movement never grants player access or moves the player.`;
}

/** Project a validated reply in order; never infer positions from decorative staging or prose alone. */
export function applyResidentMovementTimeline(
  scene: VenueScene,
  venue: VillageVenue,
  lines: VenueReplyLine[],
  moves: ContactMove[],
) {
  assertSceneMovementCapacity(scene, moves);
  if (!moves.some((move) => move.segment !== undefined)) return;
  const origin = scene.zoneId ?? "exterior";
  const ids = sceneResidentIds(scene);
  const positions = new Map(ids.map((id) => [id, contactPosition(scene, id)]));
  const localIds = () => ids.filter((id) => positions.get(id) === origin);
  for (const [index, line] of lines.entries()) {
    // Hidden attention fragments occurred in the player input, before any reply movement.
    if (line.contactHidden) continue;
    const before = localIds();
    const crossing = moves.filter((move) => move.segment === index);
    for (const move of crossing) positions.set(move.characterId, move.zoneId);
    const local = localIds();
    if (crossing.length) line.physicalIdsAfter = local;
    if (local.length > 4) throw badGateway("The reply would overcrowd this Zone. Your draft is preserved.");
    const remote = positions.get(line.speakerId) !== origin;
    if (line.kind === "narration") {
      // Acoustic witnesses already distinguish visual movement from noise-only receipts.
      if (!scene.contactGeneration?.acoustics && !scene.contactGeneration?.zoneEvents)
        line.heardBy = [...new Set([...before, ...local, ...crossing.map((move) => move.characterId)])];
    } else {
      const speakerZone = positions.get(line.speakerId) ?? "";
      const unchangedChannel =
        scene.contactGeneration?.delivery === "loud" && speakerZone === contactPosition(scene, line.speakerId);
      if (
        !scene.contactGeneration?.acoustics &&
        !scene.contactGeneration?.zoneEvents &&
        remote &&
        !unchangedChannel &&
        !contactNeighbors(venue, origin, scene).includes(speakerZone)
      )
        throw badGateway("The reply speaks from beyond the established contact. Your draft is preserved.");
      const permissible = scene.contactGeneration?.replyAudiences?.[line.speakerId];
      if (!scene.contactGeneration?.acoustics && !scene.contactGeneration?.zoneEvents)
        line.heardBy = line.heardBy.filter(
          (id) =>
            id === line.speakerId ||
            local.includes(id) ||
            (line.kind !== "whisper" &&
              line.kind !== "side" &&
              !!permissible?.includes(id) &&
              (positions.get(id) === speakerZone ||
                contactNeighbors(venue, speakerZone, scene).includes(positions.get(id) ?? "") ||
                (unchangedChannel && positions.get(id) === contactPosition(scene, id)))),
        );
      if (remote) line.viaDoorway = true;
      else {
        delete line.viaDoorway;
        delete line.remoteDelivery;
      }
      if (!scene.contactGeneration?.zoneEvents && remote && (line.kind === "whisper" || line.kind === "side"))
        throw badGateway("An inaudible remote whisper cannot be delivered. Your draft is preserved.");
    }
    line.staging = line.staging?.filter((cue) => local.includes(cue.characterId));
  }
}
