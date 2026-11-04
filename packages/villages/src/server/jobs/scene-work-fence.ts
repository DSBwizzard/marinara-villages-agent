import { AsyncLocalStorage } from "node:async_hooks";

/** Serialize a Scene's outbox writers and retirement across activations sharing a backend. */
export function createSceneWorkFence() {
  type Owner = { active: boolean; nested: number; drained?: () => void };
  const owners = new AsyncLocalStorage<ReadonlyMap<string, Owner>>();
  const tails = new Map<string, Promise<void>>();
  async function run<T>(sceneId: string, work: () => Promise<T>): Promise<T> {
    const inherited = owners.getStore();
    const existing = inherited?.get(sceneId);
    if (existing?.active) {
      existing.nested++;
      try {
        return await work();
      } finally {
        existing.nested--;
        if (!existing.nested) existing.drained?.();
      }
    }
    if ([...(inherited?.values() ?? [])].some((owner) => owner.active))
      throw new Error("Scene work cannot acquire another Scene while holding its fence.");
    const prior = tails.get(sceneId) ?? Promise.resolve();
    let release!: () => void;
    const done = new Promise<void>((resolve) => {
      release = resolve;
    });
    const tail = prior.then(() => done);
    tails.set(sceneId, tail);
    await prior;
    const owner: Owner = { active: true, nested: 0 };
    try {
      return await owners.run(new Map([...(inherited ?? []), [sceneId, owner]]), work);
    } finally {
      while (owner.nested)
        await new Promise<void>((resolve) => {
          owner.drained = resolve;
        });
      owner.active = false;
      release();
      if (tails.get(sceneId) === tail) tails.delete(sceneId);
    }
  }
  function defer(work: () => void): void {
    owners.exit(() => queueMicrotask(work));
  }
  const isBusy = (sceneId: string) => tails.has(sceneId);
  return { run, defer, isBusy };
}
