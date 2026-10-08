import { bindActivationService, createActivationBinding } from "../../../adapters/engine/activation-scope.js";
import type { Handler } from "../../../domain/models/background-model.js";
import type { WishLifecycleService } from "./wish-lifecycle-service.js";
const binding = createActivationBinding<WishLifecycleService>("Villages wish-lifecycle service is not configured.");
export function configureWishLifecycle(service: WishLifecycleService): () => void {
  return binding.configure(
    bindActivationService({ ...service, wishBackgroundHandler: bindActivationService(service.wishBackgroundHandler) }),
  );
}
export function wishLifecycle(): WishLifecycleService {
  return binding.get();
}

export async function retireResidentWish(
  ...args: Parameters<WishLifecycleService["retireResidentWish"]>
): ReturnType<WishLifecycleService["retireResidentWish"]> {
  return binding.get().retireResidentWish(...args);
}

export async function reserveInitialWishAllowance(
  ...args: Parameters<WishLifecycleService["reserveInitialWishAllowance"]>
): ReturnType<WishLifecycleService["reserveInitialWishAllowance"]> {
  return binding.get().reserveInitialWishAllowance(...args);
}

export async function correctResidentWish(
  ...args: Parameters<WishLifecycleService["correctResidentWish"]>
): ReturnType<WishLifecycleService["correctResidentWish"]> {
  return binding.get().correctResidentWish(...args);
}

export async function processWishAttempt(
  ...args: Parameters<WishLifecycleService["processWishAttempt"]>
): ReturnType<WishLifecycleService["processWishAttempt"]> {
  return binding.get().processWishAttempt(...args);
}

export async function reserveWishAttempts(
  ...args: Parameters<WishLifecycleService["reserveWishAttempts"]>
): ReturnType<WishLifecycleService["reserveWishAttempts"]> {
  return binding.get().reserveWishAttempts(...args);
}

export async function reconcileWishLifecycle(
  ...args: Parameters<WishLifecycleService["reconcileWishLifecycle"]>
): ReturnType<WishLifecycleService["reconcileWishLifecycle"]> {
  return binding.get().reconcileWishLifecycle(...args);
}

export const wishBackgroundHandler: Handler = {
  generate: (...args: Parameters<NonNullable<Handler["generate"]>>) =>
    binding.get().wishBackgroundHandler.generate(...args),
  valid: (...args: Parameters<NonNullable<Handler["valid"]>>) => binding.get().wishBackgroundHandler.valid(...args),
  apply: (...args: Parameters<NonNullable<Handler["apply"]>>) => binding.get().wishBackgroundHandler.apply(...args),
};
