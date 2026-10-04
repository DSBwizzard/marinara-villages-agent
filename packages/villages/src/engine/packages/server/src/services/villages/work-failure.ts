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
