import { activationScope, bindActivationService, createActivationBinding } from "../engine/activation-scope.js";
import { createBackgroundContext, type BackgroundContext } from "./background-context-service.js";
import type { BackgroundCompletion } from "../../domain/models/background-completion-model.js";
export type { BackgroundCompletion, BackgroundContext } from "./background-context-service.js";
const binding = createActivationBinding<BackgroundContext>("Villages background context is not configured.");
const standalone = createBackgroundContext();
function backgroundContext(): BackgroundContext {
  if (activationScope()) return binding.get();
  return binding.maybe() ?? standalone;
}
export function configureBackgroundContext(service: BackgroundContext): () => void {
  return binding.configure(bindActivationService(service));
}
export const backgroundCalls = {
  getStore(): BackgroundCompletion | undefined {
    return backgroundContext().backgroundCalls.getStore();
  },
  run<T>(store: BackgroundCompletion, work: () => T): T {
    const owner = activationScope();
    const calls = backgroundContext().backgroundCalls;
    return owner ? owner.run(() => calls.run(store, work)) : calls.run(store, work);
  },
};
export function requireBackgroundSuccess(error: unknown): void {
  return backgroundContext().requireBackgroundSuccess(error);
}
export async function backgroundSetting<T>(key: string, create: () => T | Promise<T>): Promise<T> {
  return backgroundContext().backgroundSetting<T>(key, create);
}
