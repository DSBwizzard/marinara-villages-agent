// Villages — the Engine's own API, called over loopback.
//
// A package can reach the Engine's services directly only through the handles
// `package-runtime.ts` exposes, and those deliberately stop short of image
// generation and image storage. What the Engine also has, and what every
// package is allowed to use, is its own HTTP API on its own loopback port — the
// same surface the browser talks to, with no key on it because it never leaves
// the machine. That is the sanctioned door, and this file is the handle on it.
//
// It is written as a thin transport rather than a client of any one endpoint so
// that a reader can see there is no cleverness here: build a URL, fetch it,
// hand back JSON, and turn a refusal into a message a player could act on. The
// endpoints themselves belong to the callers that know what they mean.
//
// ponytail: no timeout. The Engine's generation route can legitimately take
// minutes, and a timeout picked here would cut off a call that was working. The
// upgrade path, if a hung Engine ever needs one, is a generous ceiling applied
// at the generate call site rather than a blanket one here.

import { VillagesRequestError } from "./errors.js";

/** The port the Engine serves on, and the default it ships with. */
const DEFAULT_ENGINE_PORT = 7860;

/**
 * How much of a refused response is worth repeating back to the player.
 *
 * The Engine's own error text is far more useful than anything this file could
 * invent — "no connection key" is actionable and "the request failed" is not —
 * but a stack trace or an HTML error page is not, so the message is cut short
 * rather than allowed to become the whole response.
 */
const MAX_ENGINE_ERROR_LENGTH = 400;

/**
 * Where the Engine is listening, as the Engine itself sees it.
 *
 * Read from the environment rather than from any setting because that is where
 * the truth is: a package is loaded INTO the Engine's process, so the Engine's
 * own `PORT` and TLS pair are simply this process's. A missing or unreadable
 * `PORT` takes the shipped default instead of failing, because a wrong guess
 * here costs one refused connection and a thrown guess would cost the feature.
 *
 * The scheme follows the certificate pair rather than a separate switch: the
 * Engine serves HTTPS exactly when it holds both halves of a certificate, so
 * asking about anything else would be inventing a second source of truth.
 */
export function villageEngineBaseUrl(): string {
  const parsed = Number.parseInt(process.env.PORT ?? "", 10);
  const port = Number.isFinite(parsed) ? parsed : DEFAULT_ENGINE_PORT;
  const secure = hasValue(process.env.SSL_CERT) && hasValue(process.env.SSL_KEY);
  return `${secure ? "https" : "http"}://127.0.0.1:${port}`;
}

/**
 * The most useful sentence out of a refused response.
 *
 * Tried as JSON first because the Engine answers its API in JSON even when it
 * says no, then as plain text. Whatever comes back is collapsed onto one line
 * so it stays readable in a toast rather than arriving as a paragraph of
 * whitespace.
 */
async function readEngineRefusal(response: Response): Promise<string> {
  let detail = "";
  try {
    detail = await response.text();
  } catch {
    return "";
  }
  const trimmed = detail.trim();
  if (trimmed.length === 0) return "";
  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    const message = parsed.message ?? parsed.error ?? parsed.detail;
    if (typeof message === "string" && message.trim().length > 0) {
      const failed = Array.isArray(parsed.failedExpressions) ? parsed.failedExpressions[0] : null;
      const reason = failed && typeof failed === "object" ? (failed as Record<string, unknown>).error : null;
      return condense(typeof reason === "string" && reason.trim() ? `${message}: ${reason}` : message);
    }
  } catch {
    // Not JSON, so the text is the message.
  }
  return condense(trimmed);
}

function condense(value: string): string {
  const flattened = value.replace(/\s+/g, " ").trim();
  return flattened.length > MAX_ENGINE_ERROR_LENGTH ? `${flattened.slice(0, MAX_ENGINE_ERROR_LENGTH - 1)}…` : flattened;
}

function hasValue(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * One call to the Engine, with a refusal turned into something throwable.
 *
 * The status chosen for a refusal is 502 rather than the Engine's own code: the
 * player did not make a bad request, this package did, and passing a 400
 * through would blame the tab for a problem the tab cannot see or fix. The
 * Engine's reason travels in the message, which is the part that matters.
 *
 * A connection that never opened is reported the same way and for the same
 * reason. There is no auth header because there is nothing to authenticate:
 * the request never leaves the machine, which is exactly why this door exists.
 */
async function villageEngineFetch(path: string, init: RequestInit): Promise<Response> {
  const url = `${villageEngineBaseUrl()}${path}`;
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (error) {
    init.signal?.throwIfAborted();
    throw new VillagesRequestError(
      502,
      `Could not reach the Engine at ${url}${error instanceof Error && error.message ? `: ${error.message}` : "."}`,
    );
  }
  if (!response.ok) {
    const detail = await readEngineRefusal(response);
    throw new VillagesRequestError(
      502,
      `The Engine refused ${path} (${response.status})${detail.length > 0 ? `: ${detail}` : "."}`,
    );
  }
  return response;
}

/**
 * Read a response that is supposed to be JSON.
 *
 * A body that will not parse is reported as a broken answer rather than as a
 * transport failure, because by this point the Engine has already said yes and
 * "it answered something I cannot read" is the honest description.
 */
async function readEngineJson<T>(path: string, response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  try {
    return (await response.json()) as T;
  } catch {
    throw new VillagesRequestError(502, `The Engine answered ${path} with something that is not JSON.`);
  }
}

/**
 * A JSON request to the Engine that is expected to be answered with JSON.
 *
 * The body is passed as a value rather than a string so no caller has to
 * remember to serialise it, and the content type follows the body so a bodyless
 * call does not claim to carry one.
 */
export async function villageEngineJson<T>(
  path: string,
  init: { method?: string; body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  const hasBody = init.body !== undefined;
  const response = await villageEngineFetch(path, {
    method: init.method ?? (hasBody ? "POST" : "GET"),
    headers: {
      accept: "application/json",
      ...(hasBody ? { "content-type": "application/json" } : {}),
    },
    ...(hasBody ? { body: JSON.stringify(init.body) } : {}),
    ...(init.signal ? { signal: init.signal } : {}),
  });
  return readEngineJson<T>(path, response);
}

/**
 * A multipart request to the Engine, for the one endpoint that takes a file.
 *
 * No content type is set on purpose: only the platform knows the boundary it
 * generated for this particular form, and setting one by hand produces a
 * request the Engine correctly refuses.
 */
export async function villageEngineForm<T>(path: string, form: FormData): Promise<T> {
  const response = await villageEngineFetch(path, {
    method: "POST",
    headers: { accept: "application/json" },
    body: form,
  });
  return readEngineJson<T>(path, response);
}

/** The sprite deletion route returns 204. A missing owned file is already clean. */
export async function deleteVillageSpriteFile(assetId: string, expression: string): Promise<void> {
  if (!/^villages-[a-f0-9-]{36}$/i.test(assetId) || !/^[a-z0-9_-]{1,40}$/.test(expression))
    throw new Error("Invalid Studio-owned file.");
  try {
    await villageEngineFetch(`/api/sprites/${assetId}/${expression}`, { method: "DELETE" });
  } catch (error) {
    if (error instanceof Error && error.message.includes("(404)")) return;
    throw error;
  }
}
