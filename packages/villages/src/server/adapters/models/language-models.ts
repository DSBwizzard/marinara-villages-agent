import { MODEL_CONNECTION_UNAVAILABLE } from "../../../shared/contracts/founding.js";
import { VillagesRequestError, safeFailureMessage } from "../../domain/rules/errors.js";
import { connectionFailureKind } from "../../domain/rules/connection-failure.js";
import { retainJsonRepair } from "../observability/json-repair-diagnostics.js";
import { withProviderDeadline } from "./provider-deadline.js";
import { guardedClockGeneration } from "../time/clock-gate.js";
import { requireHost } from "../engine/runtime-host.js";
import { bindActivationService } from "../engine/activation-scope.js";
import { measureModel } from "../observability/pipeline-metrics.js";
import { trackUsage } from "./usage-ledger.js";
import { backgroundProviderDispatch } from "../operations/background-context.js";
import type { CapabilityLanguageModelHost, CapabilityResolvedLanguageModel } from "@marinara-engine/shared";

const trackedModels = new WeakSet<CapabilityResolvedLanguageModel>();
export const tracksProviderDispatch = (model: CapabilityResolvedLanguageModel): boolean => trackedModels.has(model);

export function villagesLanguageModels(): CapabilityLanguageModelHost {
  const languageModels = requireHost().languageModels;
  if (!languageModels) {
    throw new VillagesRequestError(
      503,
      "This Engine version did not provide a language model to packages.",
      MODEL_CONNECTION_UNAVAILABLE,
    );
  }
  function trackedModel(model: CapabilityResolvedLanguageModel): CapabilityResolvedLanguageModel {
    const tracked = bindActivationService<CapabilityResolvedLanguageModel>({
      ...model,
      chatComplete: (messages, requestOptions) => {
        requireHost();
        const beforeDispatch = backgroundProviderDispatch();
        let submitted = false;
        return guardedClockGeneration(() =>
          trackUsage(
            {
              connectionId: model.connectionId,
              model: model.model,
              refusedBeforeDispatch: () => !!beforeDispatch && !submitted,
            },
            async (onLateResult) => {
              // A usage claim may await storage; recheck before dispatching the provider.
              requireHost();
              const result = await withProviderDeadline(
                (signal) => {
                  beforeDispatch?.();
                  submitted = true;
                  return measureModel(() => model.chatComplete(messages, { ...requestOptions, signal }));
                },
                requestOptions?.signal,
                onLateResult,
              );
              await retainJsonRepair(model, result, requestOptions?.maxTokens);
              return result;
            },
          ),
        );
      },
    });
    trackedModels.add(tracked);
    return tracked;
  }
  async function resolveTracked(resolve: () => Promise<CapabilityResolvedLanguageModel>) {
    try {
      return trackedModel(await resolve());
    } catch (cause) {
      if (connectionFailureKind(cause) === "configuration")
        throw new VillagesRequestError(503, safeFailureMessage(cause), MODEL_CONNECTION_UNAVAILABLE);
      throw cause;
    }
  }
  return bindActivationService<CapabilityLanguageModelHost>({
    ...languageModels,
    async resolve(connectionId) {
      requireHost();
      return resolveTracked(() => languageModels.resolve(connectionId));
    },
    async resolveForRequest(options) {
      requireHost();
      return resolveTracked(() => languageModels.resolveForRequest(options));
    },
  });
}
