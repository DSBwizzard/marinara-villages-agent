import { readNarrationSubmission } from "../decoding/narration-submission.js";
import type { VenueScene } from "../models/scene-model.js";
import type { VillageState } from "../models/world.js";
import { pendingProgressTurns } from "./scene-record.js";
import { asRecord } from "./coerce.js";

/** Corrupt saved work cannot become a settled Scene. */
export function sceneRetirementSourceIsValid(value: unknown): boolean {
  const raw = asRecord(value);
  if (raw.version !== 5 || raw.status !== "closed" || typeof raw.id !== "string" || !raw.id) return false;
  if (
    typeof raw.villageSeed !== "string" ||
    !raw.villageSeed ||
    !Array.isArray(raw.lines) ||
    !Array.isArray(raw.submissions)
  )
    return false;
  const lineIds = new Set<string>();
  for (const value of raw.lines) {
    const line = asRecord(value);
    if (
      typeof line.id !== "string" ||
      !line.id ||
      lineIds.has(line.id) ||
      typeof line.content !== "string" ||
      !line.content
    )
      return false;
    if (
      line.heardBy !== undefined &&
      (!Array.isArray(line.heardBy) || line.heardBy.some((id) => typeof id !== "string"))
    )
      return false;
    if (line.role !== "user" && line.role !== "assistant") return false;
    if (line.kind !== undefined && !["narration", "dialogue", "side", "whisper", "input"].includes(String(line.kind)))
      return false;
    if (line.delivery !== undefined && !["ordinary", "whisper", "shout"].includes(String(line.delivery))) return false;
    if (
      ["contactHidden", "contactReport", "attentionEvidence"].some(
        (key) => line[key] !== undefined && typeof line[key] !== "boolean",
      )
    )
      return false;
    if (line.targetId !== undefined && typeof line.targetId !== "string") return false;
    if (line.soundOnly !== undefined) {
      const sound = asRecord(line.soundOnly);
      if (
        typeof sound.text !== "string" ||
        typeof sound.player !== "boolean" ||
        !Array.isArray(sound.characterIds) ||
        sound.characterIds.some((id) => typeof id !== "string")
      )
        return false;
    }
    lineIds.add(line.id);
  }
  if (raw.operation !== undefined) {
    const operation = asRecord(raw.operation);
    if (operation.status !== "complete" || typeof operation.id !== "string" || typeof operation.kind !== "string")
      return false;
  }
  const submissionIds = new Set<string>();
  return raw.submissions.every((value) => {
    const turn = asRecord(value);
    if (typeof turn.id !== "string" || !turn.id || submissionIds.has(turn.id)) return false;
    submissionIds.add(turn.id);
    if (typeof turn.at !== "string" || !Number.isFinite(Date.parse(turn.at))) return false;
    try {
      readNarrationSubmission(turn);
    } catch {
      return false;
    }
    return true;
  });
}

/** A closed Scene remains an outbox until every saved effect and operation settles. */
export function sceneReadyForRetirement(scene: VenueScene, village: VillageState, activeId: string): boolean {
  if (!scene.id || !scene.villageSeed || scene.villageSeed !== village.seed || scene.status !== "closed") return false;
  if (scene.id === activeId) return false;
  if (scene.operation && scene.operation.status !== "complete") return false;
  if (
    Object.keys(scene.operation?.checkpoints ?? {}).length ||
    Object.keys(scene.operation?.attempts ?? {}).length ||
    Object.keys(scene.operation?.checkpointClaims ?? {}).length
  )
    return false;
  if (scene.operation?.error || scene.abandonedOperations?.length) return false;
  if (pendingProgressTurns(scene, village.foundedAt).length) return false;
  // Abandoned purchases retain their exact outbox and opaque evidence in the closed Scene.
  return scene.submissions.every((turn) => {
    const episode = village.episodes.records.find((row) => row.id === turn.episodeId);
    return (
      turn.acceptance.status === "applied" &&
      !turn.narration &&
      episode?.sceneId === scene.id &&
      episode.submissionId === turn.id &&
      episode.privateInput === turn.message &&
      JSON.stringify(episode.segments.map((row) => row.id)) === JSON.stringify(turn.replyLineIds ?? [])
    );
  });
}
