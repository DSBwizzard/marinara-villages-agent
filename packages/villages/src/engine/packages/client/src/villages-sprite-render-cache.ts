/** Per-Studio render ownership: deduplicate work, bound memory and CPU concurrency. */
export function createStudioRenderCache<T>() {
  const ready = new Map<string, T>();
  const pending = new Map<string, Promise<T>>();
  const queue: Array<{
    key: string;
    work: () => Promise<T>;
    resolve: (value: T) => void;
    reject: (error: unknown) => void;
  }> = [];
  let running = 0;
  let disposed = false;
  function drain() {
    while (!disposed && running < 2 && queue.length) {
      const task = queue.shift()!;
      running++;
      void Promise.resolve()
        .then(task.work)
        .then(
          (value) => {
            if (!disposed) {
              ready.set(task.key, value);
              if (ready.size > 12) ready.delete(ready.keys().next().value!);
            }
            pending.delete(task.key);
            task.resolve(value);
          },
          (error) => {
            pending.delete(task.key);
            task.reject(error);
          },
        )
        .finally(() => {
          running--;
          drain();
        });
    }
  }
  return {
    get(key: string, work: () => Promise<T>): Promise<T> {
      if (disposed) return Promise.reject(new Error("Sprite Studio closed."));
      if (ready.has(key)) {
        const value = ready.get(key)!;
        ready.delete(key);
        ready.set(key, value);
        return Promise.resolve(value);
      }
      const prior = pending.get(key);
      if (prior) return prior;
      const result = new Promise<T>((resolve, reject) => queue.push({ key, work, resolve, reject }));
      pending.set(key, result);
      drain();
      return result;
    },
    dispose() {
      disposed = true;
      ready.clear();
      pending.clear();
      for (const task of queue.splice(0)) task.reject(new Error("Sprite Studio closed."));
    },
  };
}
export type StudioRenderCache<T> = ReturnType<typeof createStudioRenderCache<T>>;
