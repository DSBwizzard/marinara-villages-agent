import { activationScope } from "../adapters/engine/activation-scope.js";
import { VillagesRequestError } from "../domain/rules/errors.js";

export function createSnapshotScheduler(run: () => Promise<unknown>, onFailure: (error: unknown) => void) {
  let active = true,
    running: Promise<void> | undefined;
  const tick = () => {
    if (!active || running) return running;
    running = Promise.resolve()
      .then(run)
      .then(() => undefined)
      .catch((error) => {
        if (!(error instanceof VillagesRequestError && error.statusCode === 409)) onFailure(error);
      })
      .finally(() => {
        running = undefined;
      });
    return running;
  };
  return {
    tick,
    start() {
      const callback = activationScope()?.bind(tick) ?? tick;
      const timer = setInterval(() => {
        void callback();
      }, 60_000);
      timer.unref?.();
      void callback();
      return async () => {
        active = false;
        clearInterval(timer);
        await running;
      };
    },
  };
}
