import { createSceneNavigation } from "../features/scenes/scene-work-service.js";
import { createSpriteWrites } from "../features/media/sprite-writes.js";
import { createResidentSignatureTasks } from "../features/residents/resident-signature-tasks.js";

const workByStore = new WeakMap<object, ReturnType<typeof createBackendWork>>();
function createBackendWork() {
  return {
    navigation: createSceneNavigation(),
    spriteWrites: createSpriteWrites(),
    signatureTasks: createResidentSignatureTasks(),
  };
}

/** Admission is shared by canonical backend identity, never bound to a connection owner. */
export function backendWorkFor(identity: object | undefined) {
  if (!identity) return createBackendWork();
  let work = workByStore.get(identity);
  if (!work) {
    work = createBackendWork();
    workByStore.set(identity, work);
  }
  return work;
}
