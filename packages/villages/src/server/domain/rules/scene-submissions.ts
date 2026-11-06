import type { VenueScene, VenueSubmission } from "../models/scene-model.js";
import { conflict } from "./errors.js";
import { immutableMemoryValue, memoryRequire } from "./memory-integrity.js";

const canonical = new WeakSet<object>();
export const isImmutableSceneSubmission = (value: VenueSubmission) => canonical.has(value);
export function reuseSceneSubmission(value: unknown, cast: ReadonlySet<string>): VenueSubmission | undefined {
  if (!value || typeof value !== "object" || !canonical.has(value)) return undefined;
  const row = value as VenueSubmission;
  return row.activeIdsAfterTurn?.some((id) => !cast.has(id)) ? undefined : row;
}
export function freezeSceneSubmissions(scene: Pick<VenueScene, "submissions">): VenueSubmission[] {
  return scene.submissions.map((row) => {
    const value = immutableMemoryValue(row);
    canonical.add(value);
    return value;
  });
}
export function assertSceneSubmissionCast(scene: Pick<VenueScene, "submissions" | "participants">) {
  const cast = new Set(scene.participants.map((person) => person.characterId));
  memoryRequire(
    scene.submissions.every((row) => !canonical.has(row) || reuseSceneSubmission(row, cast)),
    "captured Scene submission participant identity was removed",
  );
}
/** A mutation detaches only its selected immutable turn, including nested recovery and proposal state. */
export function mutableSceneSubmission(scene: Pick<VenueScene, "submissions">, id: string) {
  const index = scene.submissions.findIndex((row) => row.id === id);
  if (index < 0) return undefined;
  const row = scene.submissions[index];
  if (!canonical.has(row)) return row;
  return (scene.submissions[index] = structuredClone(row));
}

/** Saved effects must belong to the exact admitted Scene and submission. */
export function requireSceneExchange(scene: VenueScene, turn: VenueSubmission | undefined) {
  const processing = turn?.processing;
  if (
    !scene.villageSeed ||
    !turn ||
    !processing ||
    processing.version !== 1 ||
    processing.seed !== scene.villageSeed ||
    processing.sceneId !== scene.id ||
    processing.submissionId !== turn.id
  )
    throw conflict("The saved Scene exchange has no current processing metadata.");
  return processing;
}
