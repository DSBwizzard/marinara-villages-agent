/** Private diagnostics, bounded across all Scenes. No prompts or connection configuration. */
export const REJECTED_RESPONSE_LIMIT = 5;
export const REJECTED_RESPONSE_TEXT_LIMIT = 24_000;
export type RejectedResponseContext = { model: string; connectionId: string; reason: string };
export type RejectedResponse = RejectedResponseContext & {
  sceneId: string;
  operationId: string;
  attemptId: string;
  stage: string;
  capturedAt: string;
  finishReason: string;
  responseLength: number;
  content: string;
  truncated: boolean;
  syntaxError: string;
};
export function privateRejectedText(value: string): string {
  return value
    .replace(/(Bearer\s+)[A-Za-z0-9._~+\/-]+/giu, "$1[redacted]")
    .replace(/([?&](?:api[_-]?key|access[_-]?token|token|key)=)[^&\s]+/giu, "$1[redacted]")
    .replace(
      /(["']?(?:api[_-]?key|access[_-]?token|secret|authorization)["']?\s*[:=]\s*["']?)[^\s"',;&}]+/giu,
      "$1[redacted]",
    );
}
export function boundedRejectedText(value: string): string {
  const redacted = privateRejectedText(value);
  const half = REJECTED_RESPONSE_TEXT_LIMIT / 2;
  return redacted.length <= REJECTED_RESPONSE_TEXT_LIMIT
    ? redacted
    : redacted.slice(0, half) + "\n[truncated]\n" + redacted.slice(-half + 13);
}
export function rejectedSyntaxError(content: string): string {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start < 0) return "No JSON object found";
  try {
    JSON.parse(content.slice(start, end >= start ? end + 1 : undefined));
    return "Object extraction or Scene validation failed";
  } catch (error) {
    return boundedRejectedText(error instanceof Error ? error.message : "JSON syntax error").slice(0, 500);
  }
}
export function retainRejectedResponses(entries: RejectedResponse[], entry: RejectedResponse): RejectedResponse[] {
  return [...entries, entry].slice(-REJECTED_RESPONSE_LIMIT);
}
