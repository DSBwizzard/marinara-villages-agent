/** Technical admission failures are separate from individual request outcomes. */
export type ConnectionFailureKind = "configuration" | "request";
export function connectionFailureKind(error: unknown, jsonMode = false): ConnectionFailureKind {
  const row = error && typeof error === "object" ? (error as Record<string, unknown>) : {},
    status = Number(row.status ?? row.statusCode),
    message = error instanceof Error ? error.message : String(error);
  if (
    [401, 403].includes(status) ||
    /(?:\b401\b|\b403\b|invalid api key|no (?:language model |system )?connection|(?:selected|choose a?).*(?:connection|base URL).*(?:no longer exists|before generating)|selected connection has no base URL|missing.*connection|language model connection not found|selected language model connection has no model|unsupported (?:language )?model)/iu.test(
      message,
    )
  )
    return "configuration";
  if (
    (jsonMode &&
      /response[_ ]?format|json[_ ]?(?:object|mode|schema)/iu.test(message) &&
      /unsupported|not support|invalid|unknown|not allowed|unrecognized/iu.test(message)) ||
    /connection rejected JSON mode/iu.test(message)
  )
    return "configuration";
  return "request";
}
