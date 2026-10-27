import { API_PATH } from "./constants.js";
import { normalizeVillageSnapshot } from "./villages-snapshot-normalization";

/**
 * Where the Engine keeps the admin secret this browser was given.
 *
 * The key is the Engine's, not the village's, and it holds the plain value the
 * owner typed into Settings → Advanced → Admin Access. Reading it here is what
 * makes that one paste serve this tab too, with nothing of the village's own to
 * fill in and nothing for the player to find twice.
 */
const ADMIN_SECRET_STORAGE_KEY = "marinara_admin_secret";

/**
 * The headers a village call arrives with.
 *
 * Every route the package serves is privileged, and the Engine answers a
 * privileged call from any address but its own loopback one **only** when the
 * request carries the admin secret the owner set on the server. The Engine's own
 * client attaches that header to every call it makes, and Noodle, Slurp and
 * Long-Term Memory attach it to theirs; the village was the one tab asking bare,
 * which is why it worked on the machine the Engine runs on and was refused
 * everywhere else, whatever the owner had pasted.
 *
 * Nothing changes for anybody playing on the machine the Engine runs on: there
 * is nothing stored under that key there, and the request goes out exactly as it
 * always did, because loopback does not want a secret. Neither does a browser
 * that refuses storage — the call still leaves, without the header, and the
 * refusal that comes back is the one it would have got anyway.
 */
function villagesRequestHeaders(init?: RequestInit): Headers {
  const headers = new Headers(init?.headers);
  try {
    const secret = window.localStorage.getItem(ADMIN_SECRET_STORAGE_KEY)?.trim();
    if (secret) headers.set("X-Admin-Secret", secret);
  } catch {
    // Storage is blocked (private mode, a locked-down origin). Ask without it.
  }
  // Only a body this tab serialized itself is ours to label. A FormData or a
  // Blob writes its own Content-Type, and naming one here would take the
  // boundary off a multipart body.
  if (typeof init?.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
}

/**
 * What the tab says when the Engine turns a call down for want of that secret.
 *
 * The sentence is the Engine's own, kept word for word rather than paraphrased,
 * so a player who has met this refusal anywhere else in the app reads the same
 * words here: the same setting on the server, and the same box in this browser
 * that has to carry the matching value. A refusal that describes the problem in
 * one vocabulary and the remedy in another is how the remedy goes unread, and a
 * second wording of it would have to be kept in step by hand.
 *
 * The vendored copy of the Engine's client is compared against this string by
 * the package's own regression proof, so a re-worded Engine fails the village's
 * tests rather than leaving two sentences to drift apart.
 */
const PRIVILEGED_ACCESS_HINT =
  "This action needs loopback access or admin access. Open the app through localhost, or set ADMIN_SECRET=<secret> in the server .env and paste the same value in Settings → Advanced → Admin Access. Marinara sends it as the X-Admin-Secret header.";

/**
 * The error for a call the Engine refused.
 *
 * Two of the gate's refusals are about the admin secret — "ADMIN_SECRET is
 * required for privileged APIs" and "Invalid or missing X-Admin-Secret header" —
 * and both are recoverable from the browser, so both are reported the way the
 * Engine's own panels report them: the hint first, then the gate's own sentence
 * in brackets, so the player is told what to do and what happened. Every other
 * refusal is the Engine's own sentence about the Engine's own front door (Basic
 * Auth, an untrusted host, a loopback-only rule) and is passed through
 * untouched, because the tab has nothing to add to it.
 */
export class VillageApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "VillageApiError";
  }
}

const GENERIC_HTTP_ERROR =
  /^(?:Bad Request|Unauthorized|Forbidden|Not Found|Conflict|Payload Too Large|Too Many Requests|Internal Server Error|Bad Gateway|Service Unavailable|Gateway Timeout)$/iu;

function requestRefusal(payload: unknown, status: number, fallback: string): Error {
  const response = payload as { message?: unknown; error?: unknown } | null;
  const detail = [response?.message, response?.error].find(
    (value) => typeof value === "string" && value.trim() && !GENERIC_HTTP_ERROR.test(value.trim()),
  );
  const message = typeof detail === "string" ? detail : fallback;
  if (status === 409 && /clock/i.test(message)) window.dispatchEvent(new Event("villages-clock-changed"));
  if (status === 403 && /admin[-_ ]?secret/iu.test(message)) {
    return new VillageApiError(
      `${PRIVILEGED_ACCESS_HINT} (${message})`,
      status,
      (payload as { code?: string } | null)?.code,
    );
  }
  return new VillageApiError(message, status, (payload as { code?: string } | null)?.code);
}

function requestContext(path: string, init?: RequestInit): string {
  return `${init?.method?.toUpperCase() ?? "GET"} ${path.split("?")[0]}`;
}

function requestFailure(path: string, init: RequestInit | undefined, status: number): string {
  const reason =
    status === 401
      ? "Authentication is required."
      : status === 403
        ? "Access was denied by the server or review gateway."
        : status === 404
          ? "The requested API route or resource was not found."
          : status === 409
            ? "The request conflicts with the current saved state. Reload before trying again."
            : status === 413
              ? "The request is too large. Reduce the uploaded file or content."
              : status === 429
                ? "The request was rate limited. Wait before trying again."
                : status >= 500
                  ? "The server could not complete the request. Check the current state before retrying."
                  : "The server rejected the request. Check the submitted details.";
  const action =
    path.split("?")[0] === "/api/villages/setup/reset" ? "Could not reset the village." : "Request failed.";
  return `${action} ${reason} (HTTP ${status}; ${requestContext(path, init)})`;
}

function connectionFailure(cause: unknown, path: string, init?: RequestInit): never {
  if (init?.signal?.aborted || (cause instanceof Error && cause.name === "AbortError")) throw cause;
  throw new VillageApiError(
    `Could not reach the server (${requestContext(path, init)}). Check your connection and reload to see whether the action completed before trying again.`,
    0,
    "NETWORK_ERROR",
  );
}

async function readApiResponse(response: Response, path: string, init?: RequestInit): Promise<unknown> {
  let text: string;
  try {
    text = await response.text();
  } catch (cause) {
    if (init?.signal?.aborted || (cause instanceof Error && cause.name === "AbortError")) throw cause;
    throw new VillageApiError(
      `Could not read the server response (HTTP ${response.status}; ${requestContext(path, init)}). Reload to check whether the action completed before trying again.`,
      response.status,
      "RESPONSE_READ_FAILED",
    );
  }
  let payload: unknown;
  let validJson = false;
  try {
    payload = JSON.parse(text);
    validJson = true;
  } catch {
    // Non-JSON failures may be a plain-text gateway refusal. HTML is never displayed.
  }
  if (!response.ok) {
    if (
      !validJson &&
      /^text\/plain\b/iu.test(response.headers.get("Content-Type") ?? "") &&
      !/<!doctype|<\/?[a-z][a-z0-9:-]*(?:\s|>)/iu.test(text)
    ) {
      const detail = text.trim().slice(0, 1200);
      if (detail && !GENERIC_HTTP_ERROR.test(detail))
        payload = { message: `${detail} (HTTP ${response.status}; ${requestContext(path, init)})` };
    }
    throw requestRefusal(payload, response.status, requestFailure(path, init, response.status));
  }
  if (!text.trim() && (response.status === 204 || response.status === 205 || init?.method?.toUpperCase() === "HEAD"))
    return null;
  if (!validJson || payload === null) {
    throw new VillageApiError(
      `The server returned an invalid or empty JSON response (HTTP ${response.status}; ${requestContext(path, init)}). Reload to check the current state before trying again.`,
      response.status,
      "INVALID_RESPONSE",
    );
  }
  return payload;
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_PATH}${path}`;
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: villagesRequestHeaders(init),
    });
  } catch (cause) {
    return connectionFailure(cause, url, init);
  }
  const payload = await readApiResponse(response, url, init);
  return normalizeVillageSnapshot(payload) as T;
}

/**
 * The Engine's own API, read and written as the signed-in owner.
 *
 * A separate helper from `request` above because it is a different server. The
 * path is absolute rather than prefixed and it carries the session so the host
 * can answer it as the owner. Three callers, and all three are about something
 * only the Engine knows: the connection list, which it masks before the list
 * leaves, so no key ever crosses this call; the portraits, which are the Engine's
 * own pictures of its own characters; and the picture of the Persona the player
 * is being, which is the Engine's own picture of the player and is written by the
 * same editor as the first.
 *
 * None of them is a village route and none reads or writes village state. This
 * is how the tab asks the Engine the questions the Engine's own panels ask, in
 * the same shape they ask them, so any change the Engine makes to its own front
 * door lands on this the same morning rather than on a private copy of it.
 *
 * Nothing here is cached, in either direction. A character's portrait is not a
 * document, and a browser answering a stale copy of it would be showing the
 * player somebody they had already re-dressed.
 */
export async function requestHost<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      cache: "no-store",
      credentials: "same-origin",
      ...init,
      headers: villagesRequestHeaders(init),
    });
  } catch (cause) {
    return connectionFailure(cause, path, init);
  }
  return (await readApiResponse(response, path, init)) as T;
}

export function messageFrom(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}
