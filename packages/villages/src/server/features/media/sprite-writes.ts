/** Unbound admission shared only by commands writing to the same saved world. */
export function createSpriteWrites() {
  const writes = new Map<string, Promise<unknown>>();
  function serialize<T>(id: string, action: () => Promise<T>): Promise<T> {
    const task = (writes.get(id) ?? Promise.resolve()).catch(() => undefined).then(action);
    writes.set(id, task);
    return task.finally(() => {
      if (writes.get(id) === task) writes.delete(id);
    });
  }
  return { serialize };
}
export type SpriteWrites = ReturnType<typeof createSpriteWrites>;
