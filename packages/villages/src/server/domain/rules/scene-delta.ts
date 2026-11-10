import type { AcceptedEpisode } from "../models/episode-model.js";
import type { VenueScene } from "../models/scene-model.js";
import { memoryRequire } from "./memory-integrity.js";
import { contactPosition } from "./venue-contact.js";

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
  const ended = new Set(delta.contactEndedIds);
  scene.doorwayContacts = scene.doorwayContacts?.filter((row) => !ended.has(row.characterId));
  scene.activeIds = scene.activeIds.filter((id) => !ended.has(id) || contactPosition(scene, id) === scene.zoneId);
  if (delta.closed) {
    scene.status = "closed";
    scene.endedAt = episode.acceptedAt;
    scene.endReason = "scene";
  }
}
