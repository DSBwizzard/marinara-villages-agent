import type { VenueScene, VenueSubmission } from "../../domain/models/scene-model.js";
import { memoryHash } from "../../domain/rules/memory-integrity.js";
import { privateRejectedText } from "../../domain/rules/rejected-response.js";
import { describeReplyFailure, rejectionChecks, schemaChecks } from "../../domain/rules/scene-reply-diagnostics.js";
import { badGateway } from "../../domain/rules/errors.js";
import { sceneFailureMetadata, type WorkFailure } from "../../domain/rules/work-failure.js";

export function sceneReplyFailure(
  turn: VenueSubmission,
  message: string,
  details: { issues: readonly unknown[] } | { reasons: readonly string[] },
) {
  const diagnostic = describeReplyFailure(
    turn,
    "issues" in details
      ? schemaChecks(details.issues)
      : details.reasons.slice(0, 12).flatMap((reason) => rejectionChecks(reason)),
    "issues" in details ? details.issues.length : details.reasons.length,
  );
  const failure: WorkFailure = { cause: "invalid_reply", stage: "reply-validation", message, diagnostic };
  return Object.assign(badGateway(message), { failure });
}

export const sceneChangeDiagnosticId = (turn: VenueSubmission) => turn.id + ":narration:" + memoryHash(turn.acceptance);
/** Explicit saved diagnostics omit prompts, fitted private knowledge and connection configuration. */
export function sceneErrorDetails(scene: VenueScene) {
  const errors: { id: string; details: string }[] = [];
  let remaining = 24_000;
  const add = (id: string, details: unknown) => {
    if (!remaining) return false;
    const text = privateRejectedText(JSON.stringify(details, null, 2)),
      limit = Math.min(6000, remaining);
    const suffix = "\n[truncated]".slice(0, limit);
    const body = text.length <= limit ? text : text.slice(0, limit - suffix.length) + suffix;
    errors.push({ id, details: body });
    remaining -= body.length;
    return true;
  };
  const operation = scene.operation;
  if (operation && (operation.error || operation.status === "interrupted"))
    add("operation:" + operation.id + ":" + operation.attemptId, {
      id: operation.id,
      attemptId: operation.attemptId,
      kind: operation.kind,
      stage: operation.stage,
      status: operation.status,
      startedAt: operation.startedAt,
      sceneRevision: operation.sceneRevision,
      error: operation.error,
      cause: operation.failure?.cause,
      failureStage: operation.failure?.stage,
      diagnostic: sceneFailureMetadata(operation.failure)?.diagnostic,
    });
  const rejected = scene.submissions.filter(
    (turn) => turn.acceptance.status === "held" || turn.acceptance.rejected.length,
  );
  let shown = 0;
  for (const turn of rejected.toReversed().slice(0, 50)) {
    if (
      !add(sceneChangeDiagnosticId(turn), {
        submissionId: turn.id,
        at: turn.at,
        status: turn.acceptance.status,
        rejected: turn.acceptance.rejected,
        episodeId: turn.episodeId,
        responseDigest: turn.narration?.responseDigest,
      })
    )
      break;
    shown++;
  }
  return { errors, omittedErrors: Math.max(0, rejected.length - shown) };
}
