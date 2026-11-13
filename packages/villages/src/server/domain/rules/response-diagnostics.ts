import { asRecord, asTrimmedString } from "./coerce.js";
import { readModelJsonObject } from "./json-reply.js";

/** Bounded metadata only; response text and private evidence remain in privileged saved records. */
export type ResponseDiagnostics = {
  model: string;
  connectionId: string;
  finishReason: string;
  requestedOutputTokens: number;
  responseLength: number;
  parseStatus: "complete" | "salvaged" | "invalid";
};

export function responseDiagnostics(
  model: { model: string; connectionId: string },
  completion: { content: string | null; finishReason?: string },
  requestedOutputTokens: number,
  raw?: Record<string, unknown> | null,
  parsed = readModelJsonObject(completion),
): ResponseDiagnostics {
  return {
    model: asTrimmedString(model.model).slice(0, 160),
    connectionId: asTrimmedString(model.connectionId).slice(0, 160),
    finishReason: (completion.finishReason ?? "unknown").slice(0, 80),
    requestedOutputTokens,
    responseLength: (completion.content ?? "").trim().length,
    parseStatus: (raw === undefined ? parsed.value : raw)
      ? parsed.repaired || !parsed.value
        ? "salvaged"
        : "complete"
      : "invalid",
  };
}
export function coerceResponseDiagnostics(value: unknown): ResponseDiagnostics | undefined {
  const raw = asRecord(value);
  if (!["complete", "salvaged", "invalid"].includes(String(raw.parseStatus))) return undefined;
  return {
    model: asTrimmedString(raw.model).slice(0, 160),
    connectionId: asTrimmedString(raw.connectionId).slice(0, 160),
    finishReason: asTrimmedString(raw.finishReason).slice(0, 80),
    requestedOutputTokens: Math.max(0, Math.floor(Number(raw.requestedOutputTokens) || 0)),
    responseLength: Math.max(0, Math.floor(Number(raw.responseLength) || 0)),
    parseStatus: raw.parseStatus as ResponseDiagnostics["parseStatus"],
  };
}
