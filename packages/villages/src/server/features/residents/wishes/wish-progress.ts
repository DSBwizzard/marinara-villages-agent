import { bindActivationService, createActivationBinding } from "../../../adapters/engine/activation-scope.js";
import type { Handler } from "../../../domain/models/background-model.js";
import type { WishProgressService } from "./wish-progress-service.js";
const binding = createActivationBinding<WishProgressService>("Villages wish-progress service is not configured.");
export function configureWishProgress(service: WishProgressService): () => void {
  return binding.configure(
    bindActivationService({
      ...service,
      wishCheckBackgroundHandler: bindActivationService(service.wishCheckBackgroundHandler),
    }),
  );
}
export function wishProgress(): WishProgressService {
  return binding.get();
}

export async function processProjectWishOutbox(
  ...args: Parameters<WishProgressService["processProjectWishOutbox"]>
): ReturnType<WishProgressService["processProjectWishOutbox"]> {
  return binding.get().processProjectWishOutbox(...args);
}

export async function processWishExchange(
  ...args: Parameters<WishProgressService["processWishExchange"]>
): ReturnType<WishProgressService["processWishExchange"]> {
  return binding.get().processWishExchange(...args);
}

export const wishCheckBackgroundHandler: Handler = {
  generate: (...args: Parameters<NonNullable<Handler["generate"]>>) =>
    binding.get().wishCheckBackgroundHandler.generate(...args),
  valid: (...args: Parameters<NonNullable<Handler["valid"]>>) =>
    binding.get().wishCheckBackgroundHandler.valid(...args),
  apply: (...args: Parameters<NonNullable<Handler["apply"]>>) =>
    binding.get().wishCheckBackgroundHandler.apply(...args),
  afterApply: (...args: Parameters<NonNullable<Handler["afterApply"]>>) =>
    binding.get().wishCheckBackgroundHandler.afterApply!(...args),
  afterFailure: (...args: Parameters<NonNullable<Handler["afterFailure"]>>) =>
    binding.get().wishCheckBackgroundHandler.afterFailure!(...args),
};
