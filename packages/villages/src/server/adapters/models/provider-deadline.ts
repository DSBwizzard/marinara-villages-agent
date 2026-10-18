import { WorkFailureError } from "../../domain/rules/work-failure.js";

export const PROVIDER_REQUEST_TIMEOUT_MS = 30_000;

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
            "The provider request timed out after 30 seconds. It may have been billed; explicitly retry the saved request.",
        }),
      ),
    PROVIDER_REQUEST_TIMEOUT_MS,
  );
  try {
    return await Promise.race([
      Promise.resolve().then(() => {
        controller.signal.throwIfAborted();
        return request(controller.signal);
      }),
      deadline,
    ]);
  } finally {
    clearTimeout(timer);
    parent?.removeEventListener("abort", onAbort);
  }
}
