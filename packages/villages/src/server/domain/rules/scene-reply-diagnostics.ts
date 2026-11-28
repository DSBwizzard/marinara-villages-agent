import type { VenueSubmission } from "../models/scene-model.js";
import { sceneFailureDiagnostic } from "../../../shared/contracts/scene-failure-diagnostic.js";
import { asRecord } from "./coerce.js";
import {
  MISSING_PRIVATE_STATE_EVIDENCE,
  ROOM_OUTCOME_UNVERIFIED,
  UNWITNESSED_CONTINUITY_SUPPORT,
} from "./continuity.js";
import { ACTOR_MEMORY_TARGETS_ROOM, SCENE_REPLY_NOT_PERCEIVED } from "./narration-acceptance.js";
import { MISSING_CONTINUITY_TEXT } from "./narration-contract.js";
import { SCENE_EXPRESSION_REJECTION } from "./sprite-expressions.js";

const ruleChecks = new Map([
  [SCENE_EXPRESSION_REJECTION, { code: "scene_expression_unavailable", path: [] }],
  [UNWITNESSED_CONTINUITY_SUPPORT, { code: "continuity_evidence_not_witnessed", path: ["source"] }],
  ["continuity actor was not admitted", { code: "continuity_actor_not_admitted", path: ["for"] }],
  [ACTOR_MEMORY_TARGETS_ROOM, { code: "room_target_in_actor_memory", path: ["for"] }],
  [MISSING_CONTINUITY_TEXT, { code: "missing_continuity_text", path: ["text"] }],
  [MISSING_PRIVATE_STATE_EVIDENCE, { code: "missing_private_state_evidence", path: ["source"] }],
  [ROOM_OUTCOME_UNVERIFIED, { code: "room_outcome_unverified", path: ["source"] }],
  [SCENE_REPLY_NOT_PERCEIVED, { code: "no_perceived_scene_lines", path: ["segments"] }],
  [
    "Scene cannot invent a player or an actor's words",
    { code: "invalid_scene_speaker", path: ["segments", "speakerId"] },
  ],
  ["The invitation needs a listed option and its spoken line.", { code: "invalid_scene_invitation", path: ["visit"] }],
  ["The reply would overcrowd a Zone. Your draft is preserved.", { code: "scene_capacity", path: [] }],
  ["an appointment cannot be in the past of its admitted Scene", { code: "past_scene_appointment", path: ["when"] }],
]);

export function schemaChecks(value: unknown, depth = 0, parent: unknown[] = []): unknown[] {
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

export function rejectionChecks(reason: string, id = ""): unknown[] {
  if (typeof reason !== "string" || reason.length > 2000) return [];
  const ruleCheck = ruleChecks.get(reason.replace(/^(?:(?:VillagesRequestError|Error):\s*)?(?:Memory:\s*)?/u, ""));
  if (ruleCheck) return [ruleCheck];
  if (reason.startsWith("Tentative movement routing failed:")) return [{ code: "invalid_movement_route", path: [] }];
  if (reason === "The required effect is missing.") {
    const beat = /^missing-beat-([1-9]|1[0-9]|2[0-4])$/u.exec(id);
    return [{ code: "missing_required_effect", path: beat ? ["segments", Number(beat[1])] : [] }];
  }
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

export function describeSceneReplyRejections(turn: VenueSubmission) {
  // Older saves already contain the fallback validator receipts as strings.
  return describeReplyFailure(
    turn,
    turn.acceptance.rejected.slice(0, 12).flatMap(({ id, reason }) => rejectionChecks(reason, id)),
    turn.acceptance.rejected.length,
  );
}

export function describeReplyFailure(turn: VenueSubmission, checks: unknown[], rejected: number) {
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
