import { carryLateProviderResponse, retainLateProviderResponse } from "../../adapters/models/provider-deadline.js";
import type { mutateDocument } from "../../adapters/storage/document-store.js";
import { isVillageClockError } from "../../adapters/time/clock-gate.js";
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
import { claimSavedResponse } from "./saved-response.js";

export type ModelCompletionPorts = {
  mutateDocument?: typeof mutateDocument;
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
  const pending = new Map<string, { fingerprint: string; task: Promise<CapabilityLanguageModelCompletion> }>();
  function completeWithRoom(...args: Parameters<typeof completeOnce>): ReturnType<typeof completeOnce> {
    const key = args[3].savedRequest?.key;
    if (!key) return completeOnce(...args);
    const fingerprint = JSON.stringify(args[1]);
    const running = pending.get(key);
    if (running)
      return running.fingerprint === fingerprint
        ? running.task
        : Promise.reject(new Error("Saved generation inputs changed."));
    const task = completeOnce(...args).finally(() => {
      if (pending.get(key)?.task === task) pending.delete(key);
    });
    pending.set(key, { fingerprint, task });
    return task;
  }
  async function completeOnce(
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
                if (isVillageClockError(error)) throw error;
                if (!options.responseFormat || operationSignal?.aborted || options.signal?.aborted) throw error;
                const message = safeFailureMessage(error);
                const unsupported =
                  /response[_ ]?format|json[_ ]?(?:object|mode|schema)/iu.test(message) &&
                  /unsupported|not support|invalid|unknown|not allowed|unrecognized/iu.test(message);
                const failure = new WorkFailureError({
                  cause: "provider_exception",
                  stage: "dispatch",
                  requestedOutputTokens: tokens,
                  message: unsupported
                    ? "The selected connection rejected JSON mode. Choose a connection supporting JSON responses, then explicitly retry. No fallback request was made."
                    : message,
                });
                carryLateProviderResponse(error, failure);
                throw failure;
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
                  options.replayReasoningEffort ?? options.reasoningEffort,
                  options.verbosity,
                  ...(options.replayReasoningEffort ? [options.responseFormat] : []),
                ]),
              )
              .digest("hex")
          : undefined,
        {
          inputTokens:
            (typeof model.fitContext === "function"
              ? model.fitContext(messages, { maxTokens: tokens }).estimatedTokensBefore
              : undefined) ?? Buffer.byteLength(JSON.stringify(messages), "utf8"),
          outputTokens: tokens,
        },
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

    // An empty result is still a purchased response; replacement requires explicit authorization.
    if (!options.savedRequest) return ask(maxTokens);
    if (!ports.mutateDocument) throw new Error("Saved model request storage is unavailable.");
    const receipt = await claimSavedResponse(ports.mutateDocument, options.savedRequest, messages, () => {
      try {
        villagesLogger().warn("[villages] Could not retain rejected generation diagnostics");
      } catch {
        /* Diagnostics cannot replace the request outcome. */
      }
    });
    if (receipt.cached) return receipt.cached;
    try {
      const result = await ask(maxTokens);
      return await receipt.retain(result, true);
    } catch (error) {
      retainLateProviderResponse(error, async (value) => {
        await receipt.retain(value as CapabilityLanguageModelCompletion, false);
      });
      throw error;
    }
  }
  return { completeWithRoom };
}
export type ModelCompletions = ReturnType<typeof createModelCompletions>;
