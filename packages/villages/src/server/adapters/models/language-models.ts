import { requireHost } from "../engine/runtime-host.js";
import { bindActivationService } from "../engine/activation-scope.js";
import { measureModel } from "../observability/pipeline-metrics.js";
import { trackUsage } from "./usage-ledger.js";
import type { CapabilityLanguageModelHost, CapabilityResolvedLanguageModel } from "@marinara-engine/shared";

export function villagesLanguageModels(): CapabilityLanguageModelHost {
  const languageModels = requireHost().languageModels;
  if (!languageModels) {
    throw new Error("This Engine version did not provide a language model to packages.");
  }
  function trackedModel(model: CapabilityResolvedLanguageModel): CapabilityResolvedLanguageModel {
    return bindActivationService<CapabilityResolvedLanguageModel>({
      ...model,
      chatComplete: (messages, requestOptions) => {
        requireHost();
        return trackUsage({ connectionId: model.connectionId, model: model.model }, () => {
          // A usage claim may await storage; recheck before dispatching the provider.
          requireHost();
          return measureModel(() => model.chatComplete(messages, requestOptions));
        });
      },
    });
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
