import type { VenueScene, VenueSubmission } from "../models/scene-model.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";

/** Own playback only: raw roleplay input has no fictional speaker, audience or evidence source. */
export function appendSceneInput(scene: VenueScene, turn: VenueSubmission) {
  if (!turn.message) return;
  const line = {
    id: "submission-input-" + memoryHash([scene.id, turn.id]).slice(0, 32),
    inputOf: turn.id,
    speakerId: "player",
    name: "You",
    role: "user" as const,
    kind: "input" as const,
    content: turn.message,
    at: turn.at,
    heardBy: [],
  };
  const prior = scene.lines.find((row) => row.id === line.id);
  memoryRequire(!prior || memoryHash(prior) === memoryHash(line), "original input playback identity changed");
  if (!prior) scene.lines.push(line);
}
