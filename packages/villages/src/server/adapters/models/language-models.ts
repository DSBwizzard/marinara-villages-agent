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
    throw new Error("This Engine version did not provide a language model to packages.");
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
  return bindActivationService<CapabilityLanguageModelHost>({
    ...languageModels,
    async resolve(connectionId) {
      requireHost();
      const model = await languageModels.resolve(connectionId);
      return trackedModel(model);
    },
    async resolveForRequest(options) {
      requireHost();
      const model = await languageModels.resolveForRequest(options);
      return trackedModel(model);
    },
  });
}
