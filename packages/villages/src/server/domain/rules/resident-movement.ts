import type { VenueReplyLine, VenueScene } from "../models/scene-model.js";
import type { VillageState, VillageVenue } from "../models/world.js";
import { badGateway } from "./errors.js";
import { contactNeighbors, contactPath, contactPosition, type ContactMove } from "./venue-contact.js";
import { venueZones } from "./venue-zones.js";

export function residentLocalIdsAt(scene: VenueScene, moves: ContactMove[], segment: number): string[] {
  const ids = [...new Set([...scene.activeIds, ...(scene.contactGeneration?.remoteIds ?? [])])];
  return ids.filter((id) => {
    const move = moves.find(
      (entry) => entry.characterId === id && entry.segment !== undefined && entry.segment <= segment,
    );
    return (move?.zoneId ?? contactPosition(scene, id)) === (scene.zoneId ?? "exterior");
  });
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
    return `Resident movement destinations: ${JSON.stringify(destinations)}. ALREADY in player Zone ${origin}: ${JSON.stringify(local)}. Continue captured positions; never stage these residents arriving from a kitchen, doorway or other Zone. Same-Zone steps/seating need no metadata. ${doorway.length ? `Actual remote doorway speakers ${JSON.stringify(doorway)} may willingly enter or remain remote.` : "No doorway arrival is required."} Others stay offstage unless a completed permitted crossing brings them here. contactMoves only for a DIFFERENT listed destination; no player movement/access is granted.`;
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
  if (!moves.some((move) => move.segment !== undefined)) return;
  const origin = scene.zoneId ?? "exterior";
  const ids = [...new Set([...scene.activeIds, ...(scene.contactGeneration?.remoteIds ?? [])])];
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
        (scene.contactGeneration?.delivery === "loud" || scene.contactGeneration?.delivery === "device") &&
        speakerZone === contactPosition(scene, line.speakerId);
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
