import { createVillagesClientId } from "../../shared/request-id.js";

export function shouldSubmitVenueKey(key: string, shiftKey: boolean, composing: boolean, sendOnEnter = false): boolean {
  return sendOnEnter && key === "Enter" && !shiftKey && !composing;
}

type SceneSendInput = {
  zoneId?: string;
  trespass?: true;
  companions?: string[];
  follow?: true;
  message?: string;
  mode?: string;
  targetId?: string;
  contact?: { kind?: string; boundaryZoneId?: string };
};
type SavedSceneRequest = {
  freshReply?: true;
  id: string;
  status: string;
  kind?: string;
  attemptId?: string;
  error?: string;
  acceptance?: string;
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
    (saved.kind === "retry" && saved.status === "interrupted") ||
    (saved.status === "complete" && (!saved.error || saved.kind === "greet"))
  )
    return { submissionId };
  if (saved.status === "running") throw new Error("This Scene is still responding. Your draft is preserved.");
  const prior = saved.input;
  const same =
    prior.zoneId === input.zoneId &&
    prior.trespass === input.trespass &&
    prior.follow === input.follow &&
    JSON.stringify([...(prior.companions ?? [])].sort()) === JSON.stringify([...(input.companions ?? [])].sort()) &&
    prior.message === input.message &&
    prior.mode === input.mode &&
    (prior.targetId || "") === (input.targetId || "") &&
    prior.contact?.kind === input.contact?.kind &&
    prior.contact?.boundaryZoneId === input.contact?.boundaryZoneId;
  if (same && !saved.freshReply && saved.acceptance !== "held" && saved.acceptance !== "abandoned")
    return { submissionId: saved.id, retryOfAttemptId: saved.attemptId };
  if (saved.kind !== "turn")
    throw new Error("Recover the saved request before changing this action. Your edits are preserved.");
  return {
    submissionId: submissionId === saved.id ? createVillagesClientId() : submissionId,
    retryOfAttemptId: saved.attemptId,
    replaceOfOperationId: saved.id,
  };
}
