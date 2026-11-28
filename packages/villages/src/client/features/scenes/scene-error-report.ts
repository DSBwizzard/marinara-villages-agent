import type { RoomOperation } from "../../../shared/contracts/village.js";
import { messageFrom, VillageApiError, villageRequestFailure } from "../../shared/api.js";
import { sceneErrorCategory, sceneErrorCause } from "./scene-error-message.js";
import {
  sceneFailureDiagnostic,
  sceneJsonIssues,
  sceneReplyIssues,
  type SceneFailureDiagnostic,
  type SceneFailureMetadata,
} from "../../../shared/contracts/scene-failure-diagnostic.js";

declare const VILLAGES_REPORT_VERSION: string;
declare const VILLAGES_REPORT_SERVER_BUILD: string;

const actions = {
  send: "Send message",
  move: "Move between Zones",
  open: "Open Scene",
  greet: "Generate opening",
  continue: "Continue without opening",
  close: "Conclude Scene",
  retry: "Retry saved request",
  replay: "Replay saved reply",
  notice: "Dismiss Scene notice",
  discard: "Discard Scene",
  read: "Read Scene playback",
  history: "Read Scene history",
  review: "Check saved action",
} as const;
type SceneAction = keyof typeof actions;

type RequestTrace = {
  action: SceneAction;
  /** Client-only identity for matching a transport failure to its saved outcome. */
  submissionId?: string;
  request?: string;
  status?: number;
  code?: string;
  elapsedMs?: number;
  failure?: SceneFailureMetadata;
};

export type SceneFailure = { message: string; trace: RequestTrace };
export type SceneGreetingFailure = { sessionId: string; message: string; trace?: RequestTrace };

const codes = new Set([
  "AI_CONNECTION_NOT_CONFIGURED",
  "SCENE_MESSAGE_TOO_LONG",
  "SCENE_BUSY",
  "SCENE_STALE",
  "SUBMISSION_MISMATCH",
  "OPERATION_INTERRUPTED",
  "NETWORK_ERROR",
  "RESPONSE_READ_FAILED",
  "INVALID_RESPONSE",
  "TIMEOUT",
  "ABORTED",
  "SCENE_RETRY_UNAVAILABLE",
]);
const causes = new Set([
  "empty_output",
  "output_limit",
  "invalid_json",
  "invalid_reply",
  "missing_result",
  "duplicate_result",
  "unsupported_outcome",
  "invalid_citation",
  "provider_exception",
  "unknown_request",
  "storage_application",
  "insufficient_budget",
]);
const stages = new Set([
  "admission",
  "scene-layout",
  "scene-response",
  "writing-request",
  "writing-completion",
  "greeting-reply",
  "turn-reply",
  "metadata",
  "complete",
  "interrupted",
  "reply",
]);
const failureStages = new Set([...stages, "reply-validation", "dispatch", "context-fit", "storage"]);
const resultStates = new Set(["running", "interrupted", "complete"]);
const sceneStates = new Set(["opening", "active", "closing", "closed"]);
const operationLabels: Partial<Record<string, SceneAction>> = {
  turn: "send",
  move: "move",
  greet: "greet",
  close: "close",
};
const routes = new Set([
  "/rooms",
  "/rooms/turn",
  "/rooms/zone",
  "/rooms/leave",
  "/rooms/end",
  "/rooms/greet",
  "/rooms/active",
  "/rooms/continue",
  "/rooms/react",
  "/rooms/retry",
  "/rooms/debug/discard",
  "/rooms/:scene/operation",
  "/rooms/:scene/operations/:request",
  "/rooms/:scene/changes/replay",
  "/rooms/:scene/recovery",
  "/rooms/:scene/playback",
  "/rooms/:scene/history",
  "/rooms/:scene/notices/dismiss",
  "/places/:place",
]);

function requestLabel(method: string, path: string) {
  const route = path
    .replace(/^\/api\/villages/u, "")
    .replace(
      /^\/rooms\/[^/]+\/(operation|changes\/replay|recovery|playback|history|notices\/dismiss)$/u,
      "/rooms/:scene/$1",
    )
    .replace(/^\/rooms\/[^/]+\/operations\/[^/]+$/u, "/rooms/:scene/operations/:request")
    .replace(/^\/places\/[^/]+$/u, "/places/:place");
  return (method === "GET" || method === "POST" || method === "DELETE") && routes.has(route)
    ? method + " /api/villages" + route
    : undefined;
}

export function sceneFailure(
  cause: unknown,
  fallback: string,
  action: SceneAction,
  submissionId?: string,
): SceneFailure {
  const request = villageRequestFailure(cause);
  const api = cause instanceof VillageApiError ? cause : undefined;
  const failure = api?.sceneFailure;
  const code =
    api?.code ??
    (cause instanceof Error
      ? cause.name === "TimeoutError"
        ? "TIMEOUT"
        : cause.name === "AbortError"
          ? "ABORTED"
          : undefined
      : undefined);
  return {
    message: messageFrom(cause, fallback),
    trace: {
      action,
      submissionId,
      request: request && requestLabel(request.method, request.path),
      status: api?.status,
      code: code && codes.has(code) ? code : undefined,
      elapsedMs: request?.elapsedMs,
      ...(failure
        ? {
            failure: {
              failureCause: failure.failureCause && causes.has(failure.failureCause) ? failure.failureCause : undefined,
              failureStage:
                failure.failureStage && failureStages.has(failure.failureStage) ? failure.failureStage : undefined,
              diagnostic: sceneFailureDiagnostic(failure.diagnostic),
            },
          }
        : {}),
    },
  };
}

export type SceneErrorReportItem = {
  id: string;
  title: string;
  message: string;
  trace?: RequestTrace;
  operation?: (Pick<RoomOperation, "kind" | "stage" | "status"> & SceneFailureMetadata) | null;
  held?: boolean;
  appliedWithWarnings?: boolean;
  diagnostic?: SceneFailureDiagnostic;
};

type ReportContext = {
  sceneStatus?: string;
  revision?: number;
  mobile?: boolean;
  draftRetained?: boolean;
};

export function anonymousSceneErrorReport(items: SceneErrorReportItem[], context?: ReportContext) {
  const version = typeof VILLAGES_REPORT_VERSION === "string" ? VILLAGES_REPORT_VERSION : "development";
  const lines = [`Villages Scene error trace · ${version}`];
  if (typeof VILLAGES_REPORT_SERVER_BUILD === "string") lines.push(`Server build: ${VILLAGES_REPORT_SERVER_BUILD}`);
  const status = context?.sceneStatus;
  if (status && sceneStates.has(status))
    lines.push(`Scene: ${status}${Number.isSafeInteger(context?.revision) ? ` · revision ${context?.revision}` : ""}`);
  if (context)
    lines.push(
      `View: ${context.mobile ? "phone" : "desktop"} · Draft: ${context.draftRetained ? "retained" : "empty"}`,
    );

  for (const [index, item] of items.slice(0, 8).entries()) {
    const { trace, operation } = item;
    const diagnostic = sceneFailureDiagnostic(item.diagnostic ?? operation?.diagnostic ?? trace?.failure?.diagnostic);
    const action =
      trace?.action ??
      (operation && Object.hasOwn(operationLabels, operation.kind) ? operationLabels[operation.kind] : undefined);
    const label =
      action && Object.hasOwn(actions, action)
        ? actions[action]
        : item.appliedWithWarnings
          ? "Scene reply applied with warnings"
          : item.held
            ? "Apply saved reply"
            : item.id === "reply-recovery"
              ? "Reconcile reply"
              : item.id === "reading"
                ? "Read Scene playback"
                : item.id === "greeting" || item.id === "opening-notice"
                  ? "Open Scene"
                  : "Scene request";
    lines.push("", `${index + 1}. ${label}`);
    const [method, route] = typeof trace?.request === "string" ? trace.request.split(" ") : [];
    const request = method && route ? requestLabel(method, route) : undefined;
    if (request) lines.push(`Request: ${request}`);
    const result = [
      trace?.status === 0
        ? "No HTTP response"
        : typeof trace?.status === "number" &&
            Number.isInteger(trace.status) &&
            trace.status >= 100 &&
            trace.status <= 599
          ? `HTTP ${trace.status}`
          : "",
      trace?.code && codes.has(trace.code) ? trace.code : "",
      Number.isSafeInteger(trace?.elapsedMs) && Number(trace?.elapsedMs) >= 0 ? `${trace?.elapsedMs} ms` : "",
    ].filter(Boolean);
    if (result.length) lines.push(`Result: ${result.join(" · ")}`);
    if (trace?.code === "SCENE_MESSAGE_TOO_LONG")
      lines.push("Cause: A line can be at most 4000 characters.", "Stage: input validation, before model dispatch");
    else {
      const category = sceneErrorCategory(sceneErrorCause(item.message));
      const failureCause = operation?.failureCause ?? trace?.failure?.failureCause;
      const phase = operation?.failureStage ?? trace?.failure?.failureStage;
      if (failureCause && causes.has(failureCause))
        lines.push(`${diagnostic && item.held ? "Operation code" : "Cause"}: ${failureCause}`);
      if (phase && failureStages.has(phase)) lines.push(`Phase: ${phase.replaceAll("-", " ")}`);
      else if (diagnostic && (item.held || item.appliedWithWarnings)) lines.push("Phase: reply validation");
      if (diagnostic) {
        if (diagnostic.replyIssue)
          lines.push("Reply parser: " + sceneReplyIssues[diagnostic.replyIssue] + " (" + diagnostic.replyIssue + ")");
        if (diagnostic.jsonIssue)
          lines.push(`JSON parser: ${sceneJsonIssues[diagnostic.jsonIssue]} (${diagnostic.jsonIssue})`);
        if (diagnostic.checks.some(({ code }) => code === "missing_required_effect"))
          lines.push("Why: The reply described a change without the game action needed to save it.");
        if (diagnostic.checks.some(({ code }) => code === "scene_expression_unavailable"))
          lines.push("Why: The requested expression was unavailable for the character’s sprite.");
        if (diagnostic.rejected && !diagnostic.checks.length) lines.push("Validator details: unavailable");
        for (const { code, path, expected } of diagnostic.checks)
          lines.push(
            `Validator: ${code}${path.length ? " at " + path.join(".") : ""}${expected ? ` (expected ${expected})` : ""}`,
          );
        if (diagnostic.rejected)
          lines.push(
            `${item.appliedWithWarnings ? "Dropped details" : item.held ? "Rejected effects" : "Validation issues"}: ${diagnostic.rejected}`,
          );
        const completion = [
          diagnostic.parseStatus && `parse ${diagnostic.parseStatus}`,
          diagnostic.finishReason && `finish ${diagnostic.finishReason}`,
          diagnostic.responseLength !== undefined && `${diagnostic.responseLength} response characters`,
          diagnostic.requestedOutputTokens !== undefined && `${diagnostic.requestedOutputTokens} token output limit`,
          diagnostic.modelAttempts !== undefined && `${diagnostic.modelAttempts} recorded model attempts`,
        ].filter(Boolean);
        if (completion.length) lines.push(`Completion: ${completion.join(" · ")}`);
      }
      if (category) lines.push(`Detail: ${category}`);
    }
    const stage = operation?.stage?.split(":")[0];
    const saved = [
      item.held ? "reply held" : operation?.status && resultStates.has(operation.status) ? operation.status : "",
      stage && stages.has(stage) ? `${item.held && diagnostic ? "last checkpoint" : "stage"} ${stage}` : "",
    ].filter(Boolean);
    if (saved.length) lines.push(`Saved request: ${saved.join(" · ")}`);
    if (item.id === "reply-recovery") lines.push("Recovery: checking for a saved reply");
  }
  const report = lines.join("\n");
  return report.length <= 1900 ? report : report.slice(0, report.lastIndexOf("\n", 1880)) + "\n[More omitted]";
}
