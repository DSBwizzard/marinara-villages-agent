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
  "missing_continuity_text",
  "missing_private_state_evidence",
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
]);
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

export type SceneFailureDiagnostic = {
  checks: { code: string; path: (string | number)[] }[];
  rejected: number;
  parseStatus?: string;
  finishReason?: string;
  responseLength?: number;
  modelAttempts?: number;
};

/** Admit only known codes and schema fields at both the HTTP and clipboard boundaries. */
export function sceneFailureDiagnostic(value: unknown): SceneFailureDiagnostic | undefined {
  if (!value || typeof value !== "object") return;
  const row = value as Partial<SceneFailureDiagnostic>;
  const count = (value: unknown) =>
    typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : undefined;
  const rejected = count(row.rejected);
  if (!rejected) return;
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
    checks.push({ code: check.code, path });
    if (checks.length === 3) break;
  }
  return {
    rejected,
    checks,
    parseStatus: row.parseStatus && parseStatuses.has(row.parseStatus) ? row.parseStatus : undefined,
    finishReason: row.finishReason && finishReasons.has(row.finishReason) ? row.finishReason : undefined,
    responseLength: count(row.responseLength),
    modelAttempts: count(row.modelAttempts),
  };
}
