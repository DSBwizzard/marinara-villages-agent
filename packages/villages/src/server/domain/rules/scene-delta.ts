import type { AcceptedEpisode } from "../models/episode-model.js";
import type { VenueScene } from "../models/scene-model.js";
import { memoryRequire } from "./memory-integrity.js";
import { contactPosition } from "./venue-contact.js";
import { movedAttentionContacts } from "./scene-attention.js";
import { findLocation } from "./places.js";
import { admitNpcParticipants } from "./npc-participation.js";
import { settleTrespassReaction } from "./scene-trespass.js";

/** Applied with the saved turn's receipt; a lost acknowledgement reuses this canonical result. */
export function applyAcceptedSceneDelta(scene: VenueScene, episode: AcceptedEpisode) {
  const delta = episode.sceneDelta;
  if (!delta) return;
  memoryRequire(
    scene.id === episode.sceneId &&
      scene.villageSeed === episode.seed &&
      scene.sceneRevision === delta.expectedRevision,
    "accepted Scene transition needs its admitted revision",
  );
  const before = structuredClone(scene),
    moves = episode.commandReceipts
      .flatMap((receipt) => (receipt.movement ? [{ ...receipt.movement, id: receipt.id }] : []))
      .toSorted((a, b) => a.segment - b.segment);
  admitNpcParticipants(
    scene,
    episode.commandReceipts.flatMap((receipt) => (receipt.admission ? [receipt.admission] : [])),
  );
  for (const receipt of episode.commandReceipts) {
    if (receipt.kind !== "npc-introduction") continue;
    for (const person of [...scene.participants, ...(scene.sceneAttendance?.occupants ?? [])]) {
      if (person.characterId === receipt.targetId) person.name = receipt.text;
    }
  }
  for (const move of moves) {
    const from = move.actorId === "player" ? scene.zoneId : contactPosition(scene, move.actorId);
    memoryRequire(from === move.from, "accepted movement needs its admitted prior position");
    if (move.actorId === "player") {
      scene.enteredFromZoneId = move.from;
      scene.zoneId = move.zoneId;
      delete scene.trespass;
      scene.spaceClass = move.spaceClass;
      scene.area = move.area;
      scene.privateOwnerId = move.privateOwnerId;
      scene.privateAccessOwnerId = "";
      scene.recap = "";
      scene.navigationReceipts ??= [];
      scene.navigationReceipts.push({
        id: move.id,
        originZoneId: move.from,
        destinationZoneId: move.zoneId,
        at: episode.acceptedAt,
      });
      const zone = findLocation(scene.continuity?.facts, scene.placeId)?.zones?.find((zone) => zone.id === move.zoneId);
      if (zone) zone.seen = true;
    } else {
      scene.actorTrespasses = (scene.actorTrespasses ?? []).filter((row) => row.actorId !== move.actorId);
      if (move.trespass)
        scene.actorTrespasses.push({ actorId: move.actorId, zoneId: move.zoneId, reason: move.trespass });
      scene.accessPreviousZones ??= {};
      scene.accessPreviousZones[move.actorId] = move.from;
      scene.accompanying = [
        ...(scene.accompanying ?? []).filter((row) => row.characterId !== move.actorId),
        { characterId: move.actorId, zoneId: move.zoneId },
      ];
    }
  }
  scene.movementAgreements = (scene.movementAgreements ?? []).filter(
    (row) => row.from === scene.zoneId && contactPosition(scene, row.actorId) === row.from,
  );
  for (const decision of episode.commandReceipts
    .flatMap((row) => (row.movementAgreement ? [row.movementAgreement] : []))
    .sort((a, b) => a.segment - b.segment)) {
    scene.movementAgreements = scene.movementAgreements.filter((row) => row.actorId !== decision.actorId);
    if (
      decision.agrees &&
      decision.from === scene.zoneId &&
      contactPosition(scene, decision.actorId) === decision.from
    ) {
      const { agrees: _agrees, segment: _segment, ...agreement } = decision;
      scene.movementAgreements.push(agreement);
    }
  }
  if (moves.length) {
    const venue = scene.contactGeneration?.venue ?? findLocation(scene.continuity?.facts, scene.placeId);
    memoryRequire(venue, "accepted movement lost its captured Place");
    scene.doorwayContacts = movedAttentionContacts(venue, before, scene);
    const ids = [
      ...new Set([...scene.activeIds, ...(scene.sceneAttendance?.occupants ?? []).map((row) => row.characterId)]),
    ];
    scene.activeIds = ids.filter(
      (id) =>
        contactPosition(scene, id) === scene.zoneId || scene.doorwayContacts!.some((row) => row.characterId === id),
    );
  }
  for (const receipt of episode.commandReceipts) {
    const departure = receipt.departure;
    if (!departure) continue;
    memoryRequire(
      contactPosition(scene, departure.actorId) === departure.from,
      "accepted departure needs its admitted prior position",
    );
    scene.departedIds = [...new Set([...(scene.departedIds ?? []), departure.actorId])];
    scene.activeIds = scene.activeIds.filter((id) => id !== departure.actorId);
    scene.accompanying = scene.accompanying?.filter((row) => row.characterId !== departure.actorId);
    scene.actorTrespasses = scene.actorTrespasses?.filter((row) => row.actorId !== departure.actorId);
    scene.movementAgreements = scene.movementAgreements?.filter((row) => row.actorId !== departure.actorId);
    scene.doorwayContacts = scene.doorwayContacts?.filter((row) => row.characterId !== departure.actorId);
  }
  const ended = new Set(delta.contactEndedIds);
  scene.doorwayContacts = scene.doorwayContacts?.filter((row) => !ended.has(row.characterId));
  scene.activeIds = scene.activeIds.filter((id) => !ended.has(id) || contactPosition(scene, id) === scene.zoneId);
  if (delta.closed) {
    scene.status = "closed";
    scene.endedAt = episode.acceptedAt;
    scene.endReason = "scene";
  }
  settleTrespassReaction(scene);
}
