import type { ProviderDispatch, VillageCompletionOptions } from "./completion-model.js";
import type {
  CapabilityLanguageModelCompletion,
  CapabilityLanguageModelMessage,
  CapabilityResolvedLanguageModel,
} from "@marinara-engine/shared";

export type BackgroundProviderDispatch = ProviderDispatch;

export type BackgroundCompletion = ((
  model: CapabilityResolvedLanguageModel,
  messages: CapabilityLanguageModelMessage[],
  maxTokens: number,
  options: VillageCompletionOptions,
) => Promise<CapabilityLanguageModelCompletion>) & {
  metadata?: { id: string; kind: string; cause: string; attempt?: number };
  signal?: AbortSignal;
  providerDispatch?: BackgroundProviderDispatch;
};
