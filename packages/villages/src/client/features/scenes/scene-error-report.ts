import type { RoomOperation } from "../../../shared/contracts/village.js";
import { messageFrom, VillageApiError, villageRequestFailure } from "../../shared/api.js";
import { sceneErrorCategory, sceneErrorCause } from "./scene-error-message.js";
import {
  sceneFailureDiagnostic,
  type SceneFailureDiagnostic,
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
};

export type SceneFailure = { message: string; trace: RequestTrace };

const codes = new Set([
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
]);
const causes = new Set([
  "empty_output",
  "output_limit",
  "invalid_json",
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
]);
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
    },
  };
}

export type SceneErrorReportItem = {
  id: string;
  title: string;
  message: string;
  trace?: RequestTrace;
  operation?: Pick<RoomOperation, "kind" | "stage" | "status" | "failureCause"> | null;
  held?: boolean;
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
    const diagnostic = sceneFailureDiagnostic(item.diagnostic);
    const action =
      trace?.action ??
      (operation && Object.hasOwn(operationLabels, operation.kind) ? operationLabels[operation.kind] : undefined);
    const label =
      action && Object.hasOwn(actions, action)
        ? actions[action]
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
      const failureCause = operation?.failureCause;
      if (failureCause && causes.has(failureCause))
        lines.push(`${diagnostic?.checks.length ? "Operation code" : "Cause"}: ${failureCause}`);
      if (diagnostic && item.held) {
        if (diagnostic.checks.length) lines.push("Phase: reply validation");
        else lines.push("Validator details: unavailable");
        for (const { code, path } of diagnostic.checks)
          lines.push(`Validator: ${code}${path.length ? " · " + path.join(".") : ""}`);
        lines.push(`Rejected effects: ${diagnostic.rejected}`);
        const completion = [
          diagnostic.parseStatus && `parse ${diagnostic.parseStatus}`,
          diagnostic.finishReason && `finish ${diagnostic.finishReason}`,
          diagnostic.responseLength !== undefined && `${diagnostic.responseLength} response characters`,
          diagnostic.modelAttempts !== undefined && `${diagnostic.modelAttempts} recorded model attempts`,
        ].filter(Boolean);
        if (completion.length) lines.push(`Completion: ${completion.join(" · ")}`);
      } else if (category) lines.push(`Detail: ${category}`);
    }
    const stage = operation?.stage?.split(":")[0];
    const saved = [
      item.held ? "reply held" : operation?.status && resultStates.has(operation.status) ? operation.status : "",
      stage && stages.has(stage) ? `${diagnostic ? "last checkpoint" : "stage"} ${stage}` : "",
    ].filter(Boolean);
    if (saved.length) lines.push(`Saved request: ${saved.join(" · ")}`);
    if (item.id === "reply-recovery") lines.push("Recovery: checking for a saved reply");
  }
  const report = lines.join("\n");
  return report.length <= 1900 ? report : report.slice(0, report.lastIndexOf("\n", 1880)) + "\n[More omitted]";
}
