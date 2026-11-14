import { bindActivationService, createActivationBinding } from "../engine/activation-scope.js";
import { type BackgroundContext } from "./background-context-service.js";
import type { BackgroundCompletion } from "../../domain/models/background-completion-model.js";
export type { BackgroundCompletion, BackgroundContext } from "./background-context-service.js";
const binding = createActivationBinding<BackgroundContext>("Villages background context is not configured.");

function backgroundContext(): BackgroundContext {
  return binding.get();
}
export function configureBackgroundContext(service: BackgroundContext): () => void {
  return binding.configure(bindActivationService(service));
}
export function backgroundProviderDispatch(): (() => void) | undefined {
  return binding.maybe()?.backgroundCalls.getStore()?.beforeProviderDispatch;
}
export const backgroundCalls = {
  getStore(): BackgroundCompletion | undefined {
    return backgroundContext().backgroundCalls.getStore();
  },
  run<T>(store: BackgroundCompletion, work: () => T): T {
    return backgroundContext().backgroundCalls.run(store, work);
  },
};
export function requireBackgroundSuccess(error: unknown): void {
  return backgroundContext().requireBackgroundSuccess(error);
}
