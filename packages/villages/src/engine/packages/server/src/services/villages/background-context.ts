// A completion checkpoint belongs to a background job, never to foreground dialogue.
import { AsyncLocalStorage } from "node:async_hooks";
import type {
  CapabilityLanguageModelCompletion,
  CapabilityLanguageModelMessage,
  CapabilityResolvedLanguageModel,
} from "@marinara-engine/shared";
import type { VillageCompletionOptions } from "./package-runtime.js";

export type BackgroundCompletion = ((
  model: CapabilityResolvedLanguageModel,
  messages: CapabilityLanguageModelMessage[],
  maxTokens: number,
  options: VillageCompletionOptions,
) => Promise<CapabilityLanguageModelCompletion>) & {
  setting?<T>(key: string, create: () => T | Promise<T>): Promise<T>;
};

export const backgroundCalls = new AsyncLocalStorage<BackgroundCompletion>();
export function requireBackgroundSuccess(error: unknown): void {
  if (backgroundCalls.getStore()) throw error;
}

/** Freeze stage layout even when a player changes model limits before retrying. */
export async function backgroundSetting<T>(key: string, create: () => T | Promise<T>): Promise<T> {
  return backgroundCalls.getStore()?.setting?.(key, create) ?? create();
}
