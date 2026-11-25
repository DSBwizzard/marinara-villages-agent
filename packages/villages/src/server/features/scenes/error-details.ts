import type { VenueScene, VenueSubmission } from "../../domain/models/scene-model.js";
import { memoryHash } from "../../domain/rules/memory-integrity.js";
import { privateRejectedText } from "../../domain/rules/rejected-response.js";
import { sceneFailureDiagnostic } from "../../../shared/contracts/scene-failure-diagnostic.js";
import { asRecord } from "../../domain/rules/coerce.js";
import {
  MISSING_PRIVATE_STATE_EVIDENCE,
  ROOM_OUTCOME_UNVERIFIED,
  UNWITNESSED_CONTINUITY_SUPPORT,
} from "../../domain/rules/continuity.js";
import { ACTOR_MEMORY_TARGETS_ROOM } from "../../domain/rules/narration-acceptance.js";
import { MISSING_CONTINUITY_TEXT } from "../../domain/rules/narration-contract.js";
import { badGateway } from "../../domain/rules/errors.js";
import { sceneFailureMetadata, type WorkFailure } from "../../domain/rules/work-failure.js";

const ruleChecks = new Map([
  [UNWITNESSED_CONTINUITY_SUPPORT, { code: "continuity_evidence_not_witnessed", path: ["source"] }],
  ["continuity actor was not admitted", { code: "continuity_actor_not_admitted", path: ["for"] }],
  [ACTOR_MEMORY_TARGETS_ROOM, { code: "room_target_in_actor_memory", path: ["for"] }],
  [MISSING_CONTINUITY_TEXT, { code: "missing_continuity_text", path: ["text"] }],
  [MISSING_PRIVATE_STATE_EVIDENCE, { code: "missing_private_state_evidence", path: ["source"] }],
  [ROOM_OUTCOME_UNVERIFIED, { code: "room_outcome_unverified", path: ["source"] }],
  [
    "Scene cannot invent a player or an actor's words",
    { code: "invalid_scene_speaker", path: ["segments", "speakerId"] },
  ],
  ["The invitation needs a listed option and its spoken line.", { code: "invalid_scene_invitation", path: ["visit"] }],
  ["The reply would overcrowd a Zone. Your draft is preserved.", { code: "scene_capacity", path: [] }],
  ["an appointment cannot be in the past of its admitted Scene", { code: "past_scene_appointment", path: ["when"] }],
]);

function schemaChecks(value: unknown, depth = 0, parent: unknown[] = []): unknown[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 4).flatMap((value) => {
    const issue = asRecord(value);
    const path = [...parent, ...(Array.isArray(issue.path) ? issue.path.slice(0, 6) : [])].slice(0, 6);
    const check = { code: issue.code, path, expected: issue.expected };
    if (depth < 2 && issue.code === "invalid_union" && Array.isArray(issue.errors)) {
      const nested = issue.errors.slice(0, 4).flatMap((branch) => schemaChecks(branch, depth + 1, path));
      return [...nested, check];
    }
    if (issue.code === "unrecognized_keys" && Array.isArray(issue.keys) && issue.keys.length)
      return issue.keys.slice(0, 3).map((key) => ({ ...check, path: [...path, key] }));
    return [check];
  });
}

function rejectionChecks(reason: string): unknown[] {
  if (typeof reason !== "string" || reason.length > 2000) return [];
  const ruleCheck = ruleChecks.get(reason.replace(/^(?:(?:VillagesRequestError|Error):\s*)?(?:Memory:\s*)?/u, ""));
  if (ruleCheck) return [ruleCheck];
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
  return describeReplyFailure(
    turn,
    turn.acceptance.rejected.slice(0, 12).flatMap(({ reason }) => rejectionChecks(reason)),
    turn.acceptance.rejected.length,
  );
}

function describeReplyFailure(turn: VenueSubmission, checks: unknown[], rejected: number) {
  return sceneFailureDiagnostic({
    checks,
    rejected,
    parseStatus: turn.responseDiagnostics?.parseStatus,
    finishReason: turn.responseDiagnostics?.finishReason,
    responseLength: turn.responseDiagnostics?.responseLength,
    requestedOutputTokens: turn.responseDiagnostics?.requestedOutputTokens,
    modelAttempts: turn.requestMetrics?.length,
  });
}

export function sceneReplyFailure(
  turn: VenueSubmission,
  message: string,
  details: { issues: readonly unknown[] } | { reasons: readonly string[] },
) {
  const diagnostic = describeReplyFailure(
    turn,
    "issues" in details ? schemaChecks(details.issues) : details.reasons.slice(0, 12).flatMap(rejectionChecks),
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
