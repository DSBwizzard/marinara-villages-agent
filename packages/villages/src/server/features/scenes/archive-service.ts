import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { VILLAGES_PACKAGE_ID } from "../../adapters/engine/runtime-host.js";
import { ACTIVE_ID, SESSION_KIND } from "../../adapters/storage/scene-slots.js";
import { readSceneIndex, readSceneTranscriptIndex } from "../../adapters/storage/scene-history.js";
import { withRepairWork } from "../../adapters/storage/repair-gate.js";
import type { ActiveVenue, VenueScene } from "../../domain/models/scene-model.js";
import { conflict, notFound } from "../../domain/rules/errors.js";

export interface SceneArchivePorts {
  villagesDocuments(): Pick<CapabilityDocumentStore, "list" | "getById" | "remove">;
  readActive(): Promise<ActiveVenue>;
  readSession(id: string): Promise<VenueScene>;
}
/** Owns archive commands and their lazy connections. Construction performs no work. */
export function createSceneArchive({ villagesDocuments, readActive, readSession }: SceneArchivePorts) {
  async function listVenueVisits(filter: { placeId?: string; characterId?: string } = {}): Promise<VenueScene[]> {
    return withRepairWork(async () => {
      const documents = villagesDocuments();
      const records = await documents.list(VILLAGES_PACKAGE_ID, SESSION_KIND);
      const selected = records
        .map((record) => ({ record, session: readSceneIndex(record.data) }))
        .filter(
          ({ session }) =>
            session.status === "closed" &&
            (!filter.placeId || session.placeId === filter.placeId) &&
            (!filter.characterId || session.participants.some((person) => person.characterId === filter.characterId)),
        )
        .sort((a, b) => b.session.startedAt.localeCompare(a.session.startedAt));
      const scenes: VenueScene[] = [];
      for (const { record } of selected) scenes.push(await readSceneTranscriptIndex(documents, record.data));
      return scenes;
    });
  }

  async function readVenueVisit(id: string): Promise<VenueScene> {
    const session = await readSession(id);
    if (session.status !== "closed") throw notFound("That Scene is not closed.");
    return session;
  }

  /** A village reset also removes the previous village's private Scene archive. */
  async function resetVenueSessions(): Promise<void> {
    if ((await readActive()).sessionId) throw conflict("Finish the active Scene before starting the village over.");
    const documents = villagesDocuments();
    const visits = [
      ...(await documents.list(VILLAGES_PACKAGE_ID, SESSION_KIND)),
      ...(await documents.list(VILLAGES_PACKAGE_ID, "spinoff")),
      ...(await documents.list(VILLAGES_PACKAGE_ID, "scene-terminal")),
      ...(await documents.list(VILLAGES_PACKAGE_ID, "project-scene-evidence")),
    ];
    for (const visit of visits)
      if (!(await documents.remove(VILLAGES_PACKAGE_ID, visit.id, visit.revision)))
        throw conflict("A venue archive changed while the village was being reset. Try again.");
    const pointer = await documents.getById(VILLAGES_PACKAGE_ID, ACTIVE_ID);
    if (pointer && !(await documents.remove(VILLAGES_PACKAGE_ID, ACTIVE_ID, pointer.revision)))
      throw conflict("The active venue changed while the village was being reset. Try again.");
  }
  return {
    listVenueVisits,
    readVenueVisit,
    resetVenueSessions,
  };
}
export type SceneArchive = ReturnType<typeof createSceneArchive>;
