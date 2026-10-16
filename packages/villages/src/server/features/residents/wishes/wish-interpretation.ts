import { bindActivationService, createActivationBinding } from "../../../adapters/engine/activation-scope.js";
import type { WishInterpretationService } from "./wish-interpretation-service.js";
const binding = createActivationBinding<WishInterpretationService>(
  "Villages wish-interpretation service is not configured.",
);
export function configureWishInterpretation(service: WishInterpretationService): () => void {
  return binding.configure(bindActivationService(service));
}

export async function cachedWishCriteria(
  ...args: Parameters<WishInterpretationService["cachedWishCriteria"]>
): ReturnType<WishInterpretationService["cachedWishCriteria"]> {
  return binding.get().cachedWishCriteria(...args);
}

export async function interpretWishBatch(
  ...args: Parameters<WishInterpretationService["interpretWishBatch"]>
): ReturnType<WishInterpretationService["interpretWishBatch"]> {
  return binding.get().interpretWishBatch(...args);
}
