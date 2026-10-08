import type { BackgroundCompletion } from "../../domain/models/background-completion-model.js";
import { AsyncLocalStorage } from "node:async_hooks";
export type { BackgroundCompletion } from "../../domain/models/background-completion-model.js";
/** Completion checkpoints and frozen settings belong to one application. */
export function createBackgroundContext() {
  const backgroundCalls = new AsyncLocalStorage<BackgroundCompletion>();
  function requireBackgroundSuccess(error: unknown): void {
    if (backgroundCalls.getStore()) throw error;
  }

  /** Freeze stage layout even when a player changes model limits before retrying. */
  async function backgroundSetting<T>(key: string, create: () => T | Promise<T>): Promise<T> {
    return backgroundCalls.getStore()?.setting?.(key, create) ?? create();
  }

  return { backgroundCalls, requireBackgroundSuccess, backgroundSetting };
}
export type BackgroundContext = ReturnType<typeof createBackgroundContext>;
