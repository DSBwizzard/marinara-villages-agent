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
  connectionIssue?: import("./connection-failure.js").ConnectionFailureKind;
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

/** Public summaries contain fixed validation vocabulary, never model/provider text or evidence. */
export function workFailureSummary(failure: WorkFailure): string {
  const stages: Record<string, string> = {
    "proposal-witnesses": "The proposal has missing or invalid resident witnesses.",
    "proposal-evidence": "A citation is unavailable or was not witnessed by every affected resident.",
    "proposal-memory-version": "A referenced memory is missing, obsolete or changed.",
    "proposal-context": "Proposal evidence exceeds the verification context limit.",
    "proposal-budget": "System verification has insufficient output budget.",
    "proposal-count": "More than 16 proposals need verification.",
    "proposal-provider": "System verification failed during the model request.",
    "proposal-rejected": "System rejected the proposal as unsupported by its evidence.",
    "proposal-unresolved": "System could not determine whether the evidence supports the proposal.",
    "proposal-result": "System returned a missing, duplicate or invalid verification result.",
  };
  if (stages[failure.stage]) return stages[failure.stage];
  if (failure.stage === "metadata") {
    const shape =
      /^Error: Malformed (memory|Wish|relationship) proposal: ((?:memories|wishes|changes|permissions|disclosures)(?:\[\d{1,2}\]\.(?:kind|text|category|subjectCharacterIds|knownByCharacterIds|evidence|actorId|wishId|intent|fromId|toId|dimension|strength|direction|reason|lineIds|controllerId|visitorId|venueId|zoneId|action|ordinary|disclosed))? must be (?:a nonempty string|an array|a boolean|an array with at most 16 rows))$/u.exec(
        failure.message,
      );
    if (shape) return shape[2] + ".";
  }
  const causes: Record<WorkFailure["cause"], string> = {
    empty_output: "The model returned no answer.",
    output_limit: "The response reached its output limit.",
    invalid_json: "The response was not valid JSON.",
    missing_result: "Required response metadata is missing or invalid.",
    duplicate_result: "The response contains duplicate results.",
    unsupported_outcome: "System could not verify the proposal against its evidence.",
    invalid_citation: "The proposal cites unavailable or unwitnessed evidence.",
    provider_exception: "The model request failed.",
    unknown_request: "The model request outcome is unknown.",
    storage_application: "The saved update could not be applied to storage.",
    insufficient_budget: "The request exceeds the available budget.",
  };
  return causes[failure.cause];
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
    ...(["configuration", "request"].includes(String(raw.connectionIssue))
      ? { connectionIssue: raw.connectionIssue as WorkFailure["connectionIssue"] }
      : {}),
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
