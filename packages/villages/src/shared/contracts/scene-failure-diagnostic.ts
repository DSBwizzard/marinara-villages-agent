const validationCodes = new Set([
  "invalid_type",
  "invalid_format",
  "invalid_value",
  "invalid_union",
  "unrecognized_keys",
  "too_small",
  "too_big",
  "custom",
  "missing_required_effect",
  "invalid_effect_dependency",
  "unwitnessed_requested_memory",
  "invalid_movement_route",
  "continuity_evidence_not_witnessed",
  "continuity_actor_not_admitted",
  "room_target_in_actor_memory",
  "room_outcome_unverified",
  "missing_continuity_text",
  "missing_private_state_evidence",
  "scene_capacity",
  "invalid_scene_speaker",
  "invalid_scene_invitation",
  "past_scene_appointment",
]);
const schemaFields = new Set([
  "segment",
  "segments",
  "source",
  "for",
  "keep",
  "effects",
  "commands",
  "at",
  "id",
  "kind",
  "type",
  "requires",
  "independent",
  "perceive",
  "ground",
  "input",
  "text",
  "to",
  "who",
  "by",
  "visitor",
  "venue",
  "zone",
  "agenda",
  "time",
  "venueId",
  "actorId",
  "speakerId",
  "place",
  "project",
  "when",
  "date",
  "minute",
  "decision",
  "outcome",
  "conditions",
  "roomKeeps",
  "holders",
  "target",
  "name",
  "label",
  "localKey",
  "existingId",
  "targetId",
  "arrivalId",
  "delivery",
  "presentation",
  "visit",
  "option",
  "escort",
  "class",
  "owner",
  "about",
  "profile",
]);
const schemaTypes = new Set(["string", "number", "int", "boolean", "object", "array", "null"]);
const finishReasons = new Set([
  "stop",
  "length",
  "max_tokens",
  "content_filter",
  "tool_calls",
  "end_turn",
  "stop_sequence",
]);
const parseStatuses = new Set(["complete", "salvaged", "invalid"]);

export const sceneJsonIssues = {
  missing_object: "no JSON object found",
  incomplete_json: "incomplete JSON object or string",
  unexpected_envelope: "unexpected content around the JSON object",
  duplicate_key: "duplicate object key",
  invalid_syntax: "invalid JSON syntax",
  parser_limits: "response exceeded parser limits",
  unsupported_finish: "completion ended in a mode the parser cannot use",
} as const;

export type SceneJsonIssue = keyof typeof sceneJsonIssues;

export function readSceneJsonIssue(value: unknown): SceneJsonIssue | undefined {
  return typeof value === "string" && Object.hasOwn(sceneJsonIssues, value) ? (value as SceneJsonIssue) : undefined;
}

export type SceneFailureDiagnostic = {
  checks: { code: string; path: (string | number)[]; expected?: string }[];
  rejected: number;
  parseStatus?: string;
  jsonIssue?: SceneJsonIssue;
  finishReason?: string;
  responseLength?: number;
  requestedOutputTokens?: number;
  modelAttempts?: number;
};

export type SceneFailureMetadata = {
  failureCause?: string;
  failureStage?: string;
  diagnostic?: SceneFailureDiagnostic;
};

/** Admit only known codes and schema fields at both the HTTP and clipboard boundaries. */
export function sceneFailureDiagnostic(value: unknown): SceneFailureDiagnostic | undefined {
  if (!value || typeof value !== "object") return;
  const row = value as Partial<SceneFailureDiagnostic>;
  const count = (value: unknown) =>
    typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : undefined;
  const rejected = count(row.rejected);
  if (rejected === undefined) return;
  const checks: SceneFailureDiagnostic["checks"] = [];
  for (const check of Array.isArray(row.checks) ? row.checks.slice(0, 12) : []) {
    if (!check || !validationCodes.has(check.code) || !Array.isArray(check.path)) continue;
    const path = check.path
      .slice(0, 6)
      .map((field) =>
        typeof field === "string" && schemaFields.has(field)
          ? field
          : typeof field === "number" && Number.isInteger(field) && field >= 0 && field < 256
            ? field
            : "?",
      );
    if (checks.some((prior) => prior.code === check.code && prior.path.join(".") === path.join("."))) continue;
    checks.push({
      code: check.code,
      path,
      ...(check.expected && schemaTypes.has(check.expected) ? { expected: check.expected } : {}),
    });
    if (checks.length === 3) break;
  }
  return {
    rejected,
    checks,
    parseStatus: row.parseStatus && parseStatuses.has(row.parseStatus) ? row.parseStatus : undefined,
    ...(row.parseStatus === "invalid" ? { jsonIssue: readSceneJsonIssue(row.jsonIssue) } : {}),
    finishReason: row.finishReason && finishReasons.has(row.finishReason) ? row.finishReason : undefined,
    responseLength: count(row.responseLength),
    requestedOutputTokens: count(row.requestedOutputTokens),
    modelAttempts: count(row.modelAttempts),
  };
}
