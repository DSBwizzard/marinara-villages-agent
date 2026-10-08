import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { coerceActive, coerceSession } from "../../domain/decoding/scene-codec.js";
import type { ActiveVenue, VenueScene } from "../../domain/models/scene-model.js";
import { notFound } from "../../domain/rules/errors.js";
import { applySceneMutation } from "../../domain/rules/scene-mutation.js";
import { VILLAGES_PACKAGE_ID } from "../engine/runtime-host.js";
import { ACTIVE_ID, SESSION_PREFIX, activeSlot, sessionSlot } from "./scene-slots.js";
export interface SceneRepositoryPorts {
  villagesDocuments(): Pick<CapabilityDocumentStore, "getById">;
  mutateDocument: typeof import("./document-store.js").mutateDocument;
}
/** Scene storage commands resolve only their supplied connections; construction is inert. */
export function createSceneRepository({ villagesDocuments, mutateDocument }: SceneRepositoryPorts) {
  async function readActive(): Promise<ActiveVenue> {
    const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, ACTIVE_ID);
    return coerceActive(record?.data);
  }

  async function readSession(id: string): Promise<VenueScene> {
    const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, `${SESSION_PREFIX}${id}`);
    if (!record) throw notFound("That Scene is no longer available.");
    return coerceSession(record.data);
  }

  async function changeSession(id: string, change: (session: VenueScene) => void): Promise<VenueScene> {
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
  return { readActive, readSession, changeSession, clearActivePointer };
}
export type SceneRepository = ReturnType<typeof createSceneRepository>;
