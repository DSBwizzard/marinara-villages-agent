import { createVillagesClientId } from "../../shared/request-id.js";

export function shouldSubmitVenueKey(key: string, shiftKey: boolean, composing: boolean, sendOnEnter = false): boolean {
  return sendOnEnter && key === "Enter" && !shiftKey && !composing;
}

type SceneSendInput = {
  zoneId?: string;
  message?: string;
  mode?: string;
  targetId?: string;
  contact?: { kind?: string; boundaryZoneId?: string };
  attentionChoice?: { id: string; zoneId: string };
};
type SavedSceneRequest = {
  id: string;
  status: string;
  kind?: string;
  attemptId?: string;
  error?: string;
  input?: SceneSendInput | null;
};

/** Only a deliberate Send authorizes another provider request. */
export function sceneResend(
  saved: SavedSceneRequest | null,
  input: SceneSendInput,
  submissionId: string,
): { submissionId: string; retryOfAttemptId?: string; replaceOfOperationId?: string } {
  if (
    !saved?.input ||
    (saved.status === "complete" && (!saved.error || saved.kind === "change-interpretation" || saved.kind === "greet"))
  )
    return { submissionId };
  if (saved.status === "running") throw new Error("This Scene is still responding. Your draft is preserved.");
  const prior = saved.input;
  const same =
    prior.zoneId === input.zoneId &&
    prior.message === input.message &&
    prior.mode === input.mode &&
    (prior.targetId || "") === (input.targetId || "") &&
    prior.contact?.kind === input.contact?.kind &&
    prior.contact?.boundaryZoneId === input.contact?.boundaryZoneId &&
    prior.attentionChoice?.id === input.attentionChoice?.id &&
    prior.attentionChoice?.zoneId === input.attentionChoice?.zoneId;
  if (same) return { submissionId: saved.id, retryOfAttemptId: saved.attemptId };
  if (saved.kind !== "turn")
    throw new Error("Recover the saved request before changing this message or mode. Your edits are preserved.");
  return {
    submissionId: submissionId === saved.id ? createVillagesClientId() : submissionId,
    retryOfAttemptId: saved.attemptId,
    replaceOfOperationId: saved.id,
  };
}
