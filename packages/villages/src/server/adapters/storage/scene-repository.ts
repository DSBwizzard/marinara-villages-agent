import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { coerceActive } from "../../domain/decoding/scene-codec.js";
import type { ActiveVenue, VenueScene } from "../../domain/models/scene-model.js";
import { notFound, conflict } from "../../domain/rules/errors.js";
import { spinoffLocksScene } from "../../domain/models/spinoff-model.js";
import { applySceneMutation } from "../../domain/rules/scene-mutation.js";
import { VILLAGES_PACKAGE_ID } from "../engine/runtime-host.js";
import { ACTIVE_ID, SESSION_PREFIX, activeSlot, sessionSlot } from "./scene-slots.js";
import { createSceneHistory, readActiveSceneOwner, sceneWishOwners } from "./scene-history.js";
import { wishHistoryStore } from "./wish-history.js";
import { withRepairWork } from "./repair-gate.js";
import { memoryRequire } from "../../domain/rules/memory-integrity.js";
export interface SceneRepositoryPorts {
  villagesDocuments(): CapabilityDocumentStore;
  mutateDocument: typeof import("./document-store.js").mutateDocument;
}
/** Scene storage commands resolve only their supplied connections; construction is inert. */
export function createSceneRepository({ villagesDocuments, mutateDocument }: SceneRepositoryPorts) {
  async function readActive(): Promise<ActiveVenue> {
    return withRepairWork(async () => {
      const documents = villagesDocuments();
      const active = await readActiveSceneOwner(documents);
      wishHistoryStore(documents).retainScene(active.scene ? sceneWishOwners(active.scene.data) : []);
      return coerceActive(active.pointer?.data);
    });
  }

  async function readSession(id: string): Promise<VenueScene> {
    return withRepairWork(async () => {
      const documents = villagesDocuments(),
        record = await documents.getById(VILLAGES_PACKAGE_ID, `${SESSION_PREFIX}${id}`);
      if (!record) throw notFound("That Scene is no longer available.");
      memoryRequire(
        record.id === SESSION_PREFIX + id && record.packageId === VILLAGES_PACKAGE_ID && record.kind === "venue-visit",
        "invalid Scene owner identity",
      );
      const scene = await createSceneHistory(documents).decode(record.data);
      memoryRequire(scene.id === id, "Scene owner identity changed");
      return scene;
    });
  }

  async function changeSession(id: string, change: (session: VenueScene) => void): Promise<VenueScene> {
    return changeSpinoffSession(id, (session) => {
      if (spinoffLocksScene(session.spinoff))
        throw conflict("Finish or discard your spinoff before continuing in Villages.");
      change(session);
    });
  }

  /** Explicit ownership port for spinoff lifecycle writes, never normal Scene commands. */
  async function changeSpinoffSession(id: string, change: (session: VenueScene) => void): Promise<VenueScene> {
    let result: VenueScene | null = null;
    await mutateDocument(`${SESSION_PREFIX}${id}`, sessionSlot, (session) => {
      const changed = applySceneMutation(session, id, change);
      result = session;
      return changed;
    });
    return result!;
  }

  async function clearActivePointer(id: string): Promise<void> {
    await mutateDocument(ACTIVE_ID, activeSlot, (state) => {
      if (state.sessionId === id) {
        state.sessionId = "";
        state.placeId = "";
      }
    });
  }
  return { readActive, readSession, changeSession, changeSpinoffSession, clearActivePointer };
}
export type SceneRepository = ReturnType<typeof createSceneRepository>;
