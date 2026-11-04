import { WorkFailureError } from "../../domain/rules/work-failure.js";

const lateResponses = new WeakMap<object, Promise<unknown>>();
/** Retain evidence only; the callback cannot turn a cancelled request into a committed outcome. */
export function retainLateProviderResponse(error: unknown, retain: (result: unknown) => Promise<void>): boolean {
  const response = error && typeof error === "object" ? lateResponses.get(error) : undefined;
  if (!response) return false;
  void response.then(retain).catch(() => {});
  return true;
}
export function carryLateProviderResponse(from: unknown, to: object): void {
  const response = from && typeof from === "object" ? lateResponses.get(from) : undefined;
  if (response) lateResponses.set(to, response);
}

export const PROVIDER_REQUEST_TIMEOUT_MS = 120_000;

/** Bound one dispatched request even when a provider ignores cancellation. Never retries. */
export async function withProviderDeadline<T>(
  request: (signal: AbortSignal) => Promise<T>,
  parent?: AbortSignal,
): Promise<T> {
  parent?.throwIfAborted();
  const controller = new AbortController();
  let rejectDeadline!: (reason: unknown) => void;
  const deadline = new Promise<never>((_resolve, reject) => {
    rejectDeadline = reject;
  });
  const abort = (reason: unknown) => {
    rejectDeadline(reason);
    controller.abort(reason);
  };
  const onAbort = () => abort(parent!.reason);
  parent?.addEventListener("abort", onAbort, { once: true });
  const timer = setTimeout(
    () =>
      abort(
        new WorkFailureError({
          cause: "provider_exception",
          stage: "dispatch",
          message:
            "The provider request timed out after 120 seconds. It may have been billed; explicitly retry the saved request.",
        }),
      ),
    PROVIDER_REQUEST_TIMEOUT_MS,
  );
  const response = Promise.resolve().then(() => {
    controller.signal.throwIfAborted();
    return request(controller.signal);
  });
  try {
    return await Promise.race([response, deadline]);
  } catch (error) {
    if (controller.signal.aborted && error && typeof error === "object") lateResponses.set(error, response);
    throw error;
  } finally {
    clearTimeout(timer);
    parent?.removeEventListener("abort", onAbort);
  }
}
