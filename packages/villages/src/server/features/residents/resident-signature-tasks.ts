import type { ResidentSignatureView } from "../../../shared/helpers/resident-signature.js";

/** Unbound admission for one saved world; cleanup cannot remove a replacement task. */
export function createResidentSignatureTasks() {
  const tasks = new Map<string, Promise<ResidentSignatureView>>();
  return {
    get(id: string) {
      return tasks.get(id);
    },
    has(id: string) {
      return tasks.has(id);
    },
    set(id: string, task: Promise<ResidentSignatureView>) {
      tasks.set(id, task);
    },
    forget(id: string, task: Promise<ResidentSignatureView>) {
      if (tasks.get(id) === task) tasks.delete(id);
    },
  };
}
export type ResidentSignatureTasks = ReturnType<typeof createResidentSignatureTasks>;
