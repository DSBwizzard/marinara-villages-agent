import type { BackgroundCompletion } from "../../domain/models/background-completion-model.js";
import { AsyncLocalStorage } from "node:async_hooks";
export type { BackgroundCompletion } from "../../domain/models/background-completion-model.js";
/** Completion checkpoints belong to one application. */
export function createBackgroundContext() {
  const backgroundCalls = new AsyncLocalStorage<BackgroundCompletion>();
  function requireBackgroundSuccess(error: unknown): void {
    if (backgroundCalls.getStore()) throw error;
  }

  return { backgroundCalls, requireBackgroundSuccess };
}
export type BackgroundContext = ReturnType<typeof createBackgroundContext>;
