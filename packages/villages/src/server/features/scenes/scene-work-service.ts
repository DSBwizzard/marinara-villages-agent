import type { VenueScene } from "../../domain/models/scene-model.js";

type GreetingTask = { task: Promise<VenueScene>; abort: () => void };

/** Navigation admission is shared only by activations selecting the same saved-world backend. */
export function createSceneNavigation() {
  let navigationQueue: Promise<unknown> = Promise.resolve();
  return {
    serializeNavigation<T>(operation: () => Promise<T>): Promise<T> {
      const task = navigationQueue.then(operation, operation);
      navigationQueue = task.catch(() => {});
      return task;
    },
  };
}
export type SceneNavigation = ReturnType<typeof createSceneNavigation>;

/** Live Scene tasks belong to one activation; construction starts no work. */
export function createSceneWork(navigation: SceneNavigation = createSceneNavigation()) {
  const movingSessions = new Set<string>();
  const greetingTasks = new Map<string, GreetingTask>();
  return {
    serializeNavigation<T>(operation: () => Promise<T>): Promise<T> {
      return navigation.serializeNavigation(operation);
    },
    markMovement(id: string) {
      movingSessions.add(id);
    },
    clearMovement(id: string) {
      movingSessions.delete(id);
    },
    isMoving(id: string) {
      return movingSessions.has(id);
    },
    greetingTask(id: string) {
      return greetingTasks.get(id);
    },
    rememberGreeting(id: string, task: Promise<VenueScene>, abort: () => void) {
      greetingTasks.set(id, { task, abort });
    },
    forgetGreeting(id: string) {
      greetingTasks.delete(id);
    },
    abortGreeting(id: string) {
      greetingTasks.get(id)?.abort();
    },
  };
}
export type SceneWork = ReturnType<typeof createSceneWork>;
