import type { VenueScene, VenueSubmission } from "../../domain/models/scene-model.js";
import { memoryHash } from "../../domain/rules/memory-integrity.js";
import { privateRejectedText } from "../../domain/rules/rejected-response.js";
import { sceneFailureDiagnostic } from "../../../shared/contracts/scene-failure-diagnostic.js";
import { asRecord } from "../../domain/rules/coerce.js";

function schemaChecks(value: unknown, depth = 0, parent: unknown[] = []): unknown[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 4).flatMap((value) => {
    const issue = asRecord(value);
    const path = [...parent, ...(Array.isArray(issue.path) ? issue.path.slice(0, 6) : [])].slice(0, 6);
    const check = { code: issue.code, path };
    if (depth < 2 && issue.code === "invalid_union" && Array.isArray(issue.errors)) {
      const nested = issue.errors.slice(0, 4).flatMap((branch) => schemaChecks(branch, depth + 1, path));
      return [...nested, check];
    }
    return [check];
  });
}

function rejectionChecks(reason: string): unknown[] {
  if (typeof reason !== "string" || reason.length > 2000) return [];
  if (reason.startsWith("Tentative movement routing failed:")) return [{ code: "invalid_movement_route", path: [] }];
  if (reason === "The required effect is missing.") return [{ code: "missing_required_effect", path: [] }];
  if (/^Required effect .+ did not validate\.$/u.test(reason)) return [{ code: "invalid_effect_dependency", path: [] }];
  if (reason === "The requested memory needs a saved entry with the resident's witnessed player words.")
    return [{ code: "unwitnessed_requested_memory", path: [] }];
  try {
    const value: unknown = JSON.parse(reason.replace(/^(?:ZodError|Error):\s*/u, ""));
    return schemaChecks(value);
  } catch {
    return [];
  }
}

export function describeHeldSceneReply(turn: VenueSubmission) {
  // Older saves already contain the fallback validator receipts as strings.
  return sceneFailureDiagnostic({
    checks: turn.acceptance.rejected.slice(0, 12).flatMap(({ reason }) => rejectionChecks(reason)),
    rejected: turn.acceptance.rejected.length,
    parseStatus: turn.responseDiagnostics?.parseStatus,
    finishReason: turn.responseDiagnostics?.finishReason,
    responseLength: turn.responseDiagnostics?.responseLength,
    modelAttempts: turn.requestMetrics?.length,
  });
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
