import { bindActivationService, createActivationBinding } from "../../../adapters/engine/activation-scope.js";
import type { WishArchiveService } from "./wish-archive-service.js";
const binding = createActivationBinding<WishArchiveService>("Villages wish-archive service is not configured.");
export function configureWishArchive(service: WishArchiveService): () => void {
  return binding.configure(bindActivationService(service));
}

export async function writeWishArchive(
  ...args: Parameters<WishArchiveService["writeWishArchive"]>
): ReturnType<WishArchiveService["writeWishArchive"]> {
  return binding.get().writeWishArchive(...args);
}

export async function flushWishOutcomes(
  ...args: Parameters<WishArchiveService["flushWishOutcomes"]>
): ReturnType<WishArchiveService["flushWishOutcomes"]> {
  return binding.get().flushWishOutcomes(...args);
}

export async function readWishOutcome(
  ...args: Parameters<WishArchiveService["readWishOutcome"]>
): ReturnType<WishArchiveService["readWishOutcome"]> {
  return binding.get().readWishOutcome(...args);
}

export async function readWishHistoryPage(
  ...args: Parameters<WishArchiveService["readWishHistoryPage"]>
): ReturnType<WishArchiveService["readWishHistoryPage"]> {
  return binding.get().readWishHistoryPage(...args);
}

export async function previousFulfilledNeed(
  ...args: Parameters<WishArchiveService["previousFulfilledNeed"]>
): ReturnType<WishArchiveService["previousFulfilledNeed"]> {
  return binding.get().previousFulfilledNeed(...args);
}
