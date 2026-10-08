import { bindActivationService, createActivationBinding } from "../../../adapters/engine/activation-scope.js";

/** Invocation clocks are ephemeral; saved attempts and job admission remain authoritative. */
export function createWishAttemptClocks() {
  const clocks = new Map<string, () => Date>();
  return {
    remember(id: string, clock: () => Date) {
      clocks.set(id, clock);
    },
    read(id: string) {
      return clocks.get(id);
    },
    forget(id: string) {
      clocks.delete(id);
    },
  };
}
type WishAttemptClocks = ReturnType<typeof createWishAttemptClocks>;
const binding = createActivationBinding<WishAttemptClocks>("Villages Wish attempt clocks are not configured.");
export function configureWishAttemptClocks(clocks: WishAttemptClocks): () => void {
  return binding.configure(bindActivationService(clocks));
}
export function wishAttemptClocks(): WishAttemptClocks {
  return binding.get();
}
/** Pure handler application keeps its wall-clock fallback without borrowing another owner. */
export function readWishAttemptClock(id: string): (() => Date) | undefined {
  return binding.maybe()?.read(id);
}
