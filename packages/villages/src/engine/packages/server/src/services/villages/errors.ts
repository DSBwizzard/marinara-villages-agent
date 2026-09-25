// Villages — the one error type the routes know how to turn into a response.
//
// Anything else that escapes a handler is a genuine bug and should surface as a
// 500 with the message intact, so this type only exists to carry an intentional
// status code from a service to the route layer.

export class VillagesRequestError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "VillagesRequestError";
    this.statusCode = statusCode;
  }
}

export function badRequest(message: string): VillagesRequestError {
  return new VillagesRequestError(400, message);
}

export function conflict(message: string): VillagesRequestError {
  return new VillagesRequestError(409, message);
}

export function notFound(message: string): VillagesRequestError {
  return new VillagesRequestError(404, message);
}

/**
 * The connection answered, and what it would have said was nothing usable.
 *
 * A 502 rather than a 500 because the fault is upstream of the village: the
 * villager exists, the card exists, the request was well formed, and a model
 * that is down or that returns an empty completion is the reason this failed.
 * Only one caller uses it — a greeting, which is the one turn the village
 * cannot paper over without inventing a line of a character's speech.
 */
export function badGateway(message: string): VillagesRequestError {
  return new VillagesRequestError(502, message);
}

export function statusCodeOf(error: unknown): number {
  const statusCode = (error as { statusCode?: unknown } | null)?.statusCode;
  return typeof statusCode === "number" && statusCode >= 400 && statusCode < 600 ? statusCode : 500;
}
