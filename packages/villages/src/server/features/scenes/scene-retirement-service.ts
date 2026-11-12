import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { VILLAGES_PACKAGE_ID } from "../../adapters/engine/runtime-host.js";
import { SESSION_KIND, SESSION_PREFIX } from "../../adapters/storage/scene-slots.js";
import { createSceneHistory, readSceneRetirementSource } from "../../adapters/storage/scene-history.js";
import type { ActiveVenue, VenueScene } from "../../domain/models/scene-model.js";
import type { VillageState } from "../../domain/models/world.js";
import { sceneReadyForRetirement, sceneRetirementSourceIsValid } from "../../domain/rules/scene-retirement.js";
import { createHash } from "node:crypto";

export interface SceneRetirementPorts {
  villagesDocuments(): CapabilityDocumentStore;
  readActive(): Promise<ActiveVenue>;
  readVillageState(): Promise<VillageState>;
  hasVenueOperation(id: string): boolean;
  saveTerminal(scene: VenueScene, revision: number): Promise<void>;
  withRepairWork<T>(work: () => Promise<T>): Promise<T>;
  withSceneWork<T>(id: string, work: () => Promise<T>): Promise<T>;
  withLateResponseWork<T>(id: string, work: () => Promise<T>): Promise<T>;
  onFailure?(id: string, error: unknown): void;
}

/** Publish independent evidence before a revision-checked removal of settled Scene prose. */
export function createSceneRetirement(ports: SceneRetirementPorts) {
  async function retire(id: string): Promise<boolean> {
    return ports.withSceneWork(id, () =>
      ports.withRepairWork(async () => {
        const documents = ports.villagesDocuments();
        const saved = await documents.getById(VILLAGES_PACKAGE_ID, SESSION_PREFIX + id);
        if (!saved || !sceneRetirementSourceIsValid(await readSceneRetirementSource(documents, saved.data)))
          return false;
        const scene = await createSceneHistory(documents).decode(saved.data);
        const village = await ports.readVillageState();
        const active = await ports.readActive();
        if (
          ports.hasVenueOperation(id) ||
          active.playbackSceneId === id ||
          !sceneReadyForRetirement(scene, village, active.sessionId)
        )
          return false;
        const annotationId = `villages-repair-annotation-${createHash("sha256").update(id).digest("hex")}`;
        const annotation = await documents.getById(VILLAGES_PACKAGE_ID, annotationId);
        if (annotation) {
          const data = annotation.data as Record<string, unknown>;
          if (data.seed !== scene.villageSeed || data.sceneId !== id || typeof data.text !== "string") return false;
          if (
            !(await documents.update({
              ...annotation,
              packageId: VILLAGES_PACKAGE_ID,
              expectedRevision: annotation.revision,
              data: { ...data, placeName: scene.placeName, startedAt: scene.startedAt },
              updatedAt: new Date().toISOString(),
            }))
          )
            return false;
        }
        await ports.saveTerminal(scene, saved.revision);
        const currentPointer = await ports.readActive();
        if (ports.hasVenueOperation(id) || currentPointer.sessionId === id || currentPointer.playbackSceneId === id)
          return false;
        if (!sceneReadyForRetirement(scene, await ports.readVillageState(), currentPointer.sessionId)) return false;
        const removed = await ports.withLateResponseWork(id, async () => {
          if (!(await documents.remove(VILLAGES_PACKAGE_ID, saved.id, saved.revision))) return false;
          return true;
        });
        if (!removed) return false;
        return true;
      }),
    );
  }

  async function retireSettled(): Promise<void> {
    const records = await ports.villagesDocuments().list(VILLAGES_PACKAGE_ID, SESSION_KIND);
    for (const row of records) {
      if ((row.data as { status?: unknown }).status !== "closed") continue;
      const id = String((row.data as { id: string }).id);
      try {
        await retire(id);
      } catch (error) {
        ports.onFailure?.(id, error);
      }
    }
  }
  return { retire, retireSettled };
}
