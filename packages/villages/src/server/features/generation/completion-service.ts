import type { inferredPurpose, withUsagePurpose } from "../../adapters/models/usage-ledger.js";
import type { readRuntimeDebug, runtimeDebug } from "../../adapters/observability/runtime-debug.js";
import type { BackgroundCompletion } from "../../domain/models/background-completion-model.js";
import type { VillageCompletionOptions } from "../../domain/models/completion-model.js";
import { safeFailureMessage } from "../../domain/rules/errors.js";
import { WorkFailureError } from "../../domain/rules/work-failure.js";
import type { coordinatedCompletion } from "../../jobs/venue-coordinator.js";
import type {
  CapabilityLanguageModelCompletion,
  CapabilityLanguageModelMessage,
  CapabilityResolvedLanguageModel,
  CapabilityRuntimeLogger,
} from "@marinara-engine/shared";
import { createHash } from "node:crypto";

export type ModelCompletionPorts = {
  readRuntimeDebug: typeof readRuntimeDebug;
  runtimeDebug: typeof runtimeDebug;
  backgroundCalls: { getStore(): BackgroundCompletion | undefined };
  coordinatedCompletion: typeof coordinatedCompletion;
  withUsagePurpose: typeof withUsagePurpose;
  inferredPurpose: typeof inferredPurpose;
  villagesLogger(): Pick<CapabilityRuntimeLogger, "debug" | "warn">;
  bindCallback<T extends (...args: never[]) => unknown>(callback: T): T;
};

/** A request uses the connections supplied by its application; construction starts no work. */
export function createModelCompletions(ports: ModelCompletionPorts) {
  const {
    readRuntimeDebug,
    runtimeDebug,
    backgroundCalls,
    coordinatedCompletion,
    withUsagePurpose,
    inferredPurpose,
    villagesLogger,
    bindCallback,
  } = ports;
  const RETRY_FLOOR = 1_600;

  const RETRY_CEILING = 8_192;

  function answered(completion: CapabilityLanguageModelCompletion): boolean {
    return (completion.content ?? "").trim().length > 0;
  }

  async function completeWithRoom(
    model: CapabilityResolvedLanguageModel,
    messages: CapabilityLanguageModelMessage[],
    maxTokens: number,
    options: VillageCompletionOptions,
  ): Promise<CapabilityLanguageModelCompletion> {
    await readRuntimeDebug().catch(() => undefined);
    const background = backgroundCalls.getStore();
    runtimeDebug("completion request", {
      model: model.model,
      connectionId: model.connectionId,
      maxTokens,
      background: !!background,
      messages,
    });
    if (background) {
      const started = performance.now();
      try {
        const result = await background(model, messages, maxTokens, options);
        runtimeDebug("background completion", {
          elapsedMs: Math.round(performance.now() - started),
          maxTokens,
          result,
        });
        return result;
      } catch (error) {
        runtimeDebug("background exception", {
          message: String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        throw error;
      }
    }
    const ask = async (tokens: number) => {
      options.signal?.throwIfAborted();
      const started = performance.now();
      const completion = await coordinatedCompletion(
        createHash("sha256")
          .update(
            JSON.stringify([
              model.connectionId,
              model.model,
              messages,
              tokens,
              options.temperature,
              options.reasoningEffort,
              options.verbosity,
              ...(options.responseFormat ? [options.responseFormat] : []),
            ]),
          )
          .digest("hex"),
        bindCallback((operationSignal?: AbortSignal) =>
          withUsagePurpose(options.usagePurpose ?? inferredPurpose(), () =>
            model
              .chatComplete(messages, {
                // Left off entirely when the caller has no temperature to ask for, which is
                // what a preset with temperature switched off means. Sending a number here
                // would be the package overruling a switch it had already read.
                ...(typeof options.temperature === "number" ? { temperature: options.temperature } : {}),
                ...(options.reasoningEffort ? { reasoningEffort: options.reasoningEffort } : {}),
                ...(options.verbosity ? { verbosity: options.verbosity } : {}),
                ...(options.responseFormat ? { responseFormat: options.responseFormat } : {}),
                maxTokens: tokens,
                debugMode: options.debugMode,
                signal:
                  operationSignal && options.signal
                    ? AbortSignal.any([operationSignal, options.signal])
                    : (operationSignal ?? options.signal),
              })
              .catch((error) => {
                if (!options.responseFormat || operationSignal?.aborted || options.signal?.aborted) throw error;
                const message = safeFailureMessage(error);
                const unsupported =
                  /response[_ ]?format|json[_ ]?(?:object|mode|schema)/iu.test(message) &&
                  /unsupported|not support|invalid|unknown|not allowed|unrecognized/iu.test(message);
                throw new WorkFailureError({
                  cause: "provider_exception",
                  stage: "dispatch",
                  requestedOutputTokens: tokens,
                  message: unsupported
                    ? "The selected connection rejected JSON mode. Choose a connection supporting JSON responses, then explicitly retry. No fallback request was made."
                    : message,
                });
              }),
          ),
        ),
        options.responseFormat
          ? createHash("sha256")
              .update(
                JSON.stringify([
                  model.connectionId,
                  model.model,
                  messages,
                  tokens,
                  options.temperature,
                  options.reasoningEffort,
                  options.verbosity,
                ]),
              )
              .digest("hex")
          : undefined,
      ).catch((error) => {
        try {
          villagesLogger().warn(
            "[villages] model=%s connection=%s completion failed: %s",
            model.model,
            model.connectionId,
            safeFailureMessage(error),
          );
        } catch {
          /* Diagnostics cannot replace the request failure. */
        }
        runtimeDebug("completion exception", {
          message: String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        throw error;
      });
      runtimeDebug("completion result", {
        elapsedMs: Math.round(performance.now() - started),
        maxTokens: tokens,
        completion,
      });
      options.onAttempt?.(completion, performance.now() - started, tokens);
      return completion;
    };

    const first = await ask(maxTokens);
    if (answered(first) || options.retryEmpty === false) return first;

    const ceiling = model.maxOutputTokens ?? RETRY_CEILING;
    const roomier = Math.min(Math.max(maxTokens * 2, RETRY_FLOOR), ceiling);
    if (roomier <= maxTokens) return first;

    // The messages were fitted against the SMALLER number, so this knowingly asks
    // for more output room than the fit reserved. On a context too small to hold
    // both, the provider says so and the caller reports that — which is still a
    // better outcome for the player than an empty room and no explanation.
    villagesLogger().debug(
      "[villages] %s answered nothing at %d tokens (finish reason %s); asking again with %d",
      model.model,
      maxTokens,
      first.finishReason,
      roomier,
    );
    return ask(roomier);
  }
  return { completeWithRoom };
}
export type ModelCompletions = ReturnType<typeof createModelCompletions>;
