import { createSceneNavigation } from "../features/scenes/scene-work-service.js";
import { createSpriteWrites } from "../features/media/sprite-writes.js";
import { createResidentSignatureTasks } from "../features/residents/resident-signature-tasks.js";
import { createSceneWorkFence } from "../jobs/scene-work-fence.js";
import { createRepairAdmission } from "../adapters/storage/repair-gate.js";

// Engine imports replacement packages from distinct module snapshots in the same process.
// A module-local registry cannot fence a still-settling write from the prior snapshot.
const registryKey = Symbol.for("villages.backend-work.v1");
if (!Reflect.has(globalThis, registryKey)) Object.defineProperty(globalThis, registryKey, { value: new WeakMap() });
const workByStore = Reflect.get(globalThis, registryKey) as WeakMap<object, ReturnType<typeof createBackendWork>>;
if (!(workByStore instanceof WeakMap)) throw new Error("Villages backend admission is unavailable.");
function createBackendWork() {
  return {
    navigation: createSceneNavigation(),
    spriteWrites: createSpriteWrites(),
    signatureTasks: createResidentSignatureTasks(),
    sceneFence: createSceneWorkFence(),
    lateResponseFence: createSceneWorkFence(),
    repairAdmission: createRepairAdmission(),
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
