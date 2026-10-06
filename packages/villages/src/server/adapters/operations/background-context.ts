import type { BackgroundCompletion } from "../../domain/models/background-completion-model.js";
import { AsyncLocalStorage } from "node:async_hooks";

export type { BackgroundCompletion } from "../../domain/models/background-completion-model.js";

// A completion checkpoint belongs to a background job, never to foreground dialogue.

export const backgroundCalls = new AsyncLocalStorage<BackgroundCompletion>();
export function requireBackgroundSuccess(error: unknown): void {
  if (backgroundCalls.getStore()) throw error;
}

/** Freeze stage layout even when a player changes model limits before retrying. */
export async function backgroundSetting<T>(key: string, create: () => T | Promise<T>): Promise<T> {
  return backgroundCalls.getStore()?.setting?.(key, create) ?? create();
}
