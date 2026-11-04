import { withRepairWork } from "../../adapters/storage/repair-gate.js";
/** Unbound admission shared only by commands writing to the same saved world. */
export function createSpriteWrites() {
  const writes = new Map<string, Promise<unknown>>();
  function serialize<T>(id: string, action: () => Promise<T>): Promise<T> {
    const previous = writes.get(id) ?? Promise.resolve();
    const task = withRepairWork(() => previous.catch(() => undefined).then(action));
    writes.set(id, task);
    return task.finally(() => {
      if (writes.get(id) === task) writes.delete(id);
    });
  }
  return { serialize };
}
export type SpriteWrites = ReturnType<typeof createSpriteWrites>;
