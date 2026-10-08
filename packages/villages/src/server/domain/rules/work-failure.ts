import { asRecord, asTrimmedString } from "./coerce.js";
import { coerceResponseDiagnostics, type ResponseDiagnostics } from "./response-diagnostics.js";

/** Technical failures are distinct from a valid negative or uncertain interpretation. */
export type WorkFailure = {
  cause:
    | "empty_output"
    | "output_limit"
    | "invalid_json"
    | "missing_result"
    | "duplicate_result"
    | "unsupported_outcome"
    | "invalid_citation"
    | "provider_exception"
    | "unknown_request"
    | "storage_application"
    | "insufficient_budget";
  stage: string;
  message: string;
  finishReason?: string;
  requestedOutputTokens?: number;
  checkIds?: string[];
  responseDiagnostics?: ResponseDiagnostics;
};
export class WorkFailureError extends Error {
  constructor(public readonly failure: WorkFailure) {
    super(failure.message);
  }
}
export function completionFailure(
  answer: { content: string | null; finishReason?: string },
  stage: string,
  requestedOutputTokens: number,
): WorkFailure | undefined {
  const metadata = { stage, finishReason: answer.finishReason, requestedOutputTokens };
  if (["length", "max_tokens"].includes(answer.finishReason ?? ""))
    return {
      ...metadata,
      cause: "output_limit",
      message: "Response reached the output limit; explicit retry required.",
    };
  if (!(answer.content ?? "").trim())
    return { ...metadata, cause: "empty_output", message: "The model returned no answer; explicit retry required." };
}

export function metadataFailure(message: string, diagnostics?: ResponseDiagnostics): WorkFailure {
  return {
    cause: ["length", "max_tokens"].includes(diagnostics?.finishReason ?? "") ? "output_limit" : "missing_result",
    stage: "metadata",
    message,
    ...(diagnostics
      ? {
          finishReason: diagnostics.finishReason,
          requestedOutputTokens: diagnostics.requestedOutputTokens,
          responseDiagnostics: diagnostics,
        }
      : {}),
  };
}
export function coerceWorkFailure(value: unknown): WorkFailure | undefined {
  const raw = asRecord(value);
  const causes = [
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
  ];
  if (!causes.includes(String(raw.cause))) return undefined;
  const diagnostics = coerceResponseDiagnostics(raw.responseDiagnostics);
  return {
    cause: raw.cause as WorkFailure["cause"],
    stage: asTrimmedString(raw.stage).slice(0, 80),
    message: asTrimmedString(raw.message).slice(0, 500),
    ...(typeof raw.finishReason === "string" ? { finishReason: raw.finishReason.slice(0, 80) } : {}),
    ...(Number.isFinite(raw.requestedOutputTokens) ? { requestedOutputTokens: Number(raw.requestedOutputTokens) } : {}),
    ...(Array.isArray(raw.checkIds)
      ? {
          checkIds: raw.checkIds
            .filter((id): id is string => typeof id === "string")
            .slice(0, 64)
            .map((id) => id.slice(0, 160)),
        }
      : {}),
    ...(diagnostics ? { responseDiagnostics: diagnostics } : {}),
  };
}
