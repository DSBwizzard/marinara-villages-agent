import { requireHost } from "../engine/runtime-host.js";
import { measureModel } from "../observability/pipeline-metrics.js";
import { trackUsage } from "./usage-ledger.js";
import type { CapabilityLanguageModelHost } from "@marinara-engine/shared";

export function villagesLanguageModels(): CapabilityLanguageModelHost {
  const languageModels = requireHost().languageModels;
  if (!languageModels) {
    throw new Error("This Engine version did not provide a language model to packages.");
  }
  return {
    ...languageModels,
    async resolve(connectionId) {
      const model = await languageModels.resolve(connectionId);
      return {
        ...model,
        chatComplete: (messages, requestOptions) =>
          trackUsage({ connectionId: model.connectionId, model: model.model }, () =>
            measureModel(() => model.chatComplete(messages, requestOptions)),
          ),
      };
    },
    async resolveForRequest(options) {
      const model = await languageModels.resolveForRequest(options);
      return {
        ...model,
        chatComplete: (messages, requestOptions) =>
          trackUsage({ connectionId: model.connectionId, model: model.model }, () =>
            measureModel(() => model.chatComplete(messages, requestOptions)),
          ),
      };
    },
  };
}
