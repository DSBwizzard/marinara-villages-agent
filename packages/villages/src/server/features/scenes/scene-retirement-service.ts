import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { VILLAGES_PACKAGE_ID } from "../../adapters/engine/runtime-host.js";
import { SESSION_KIND, SESSION_PREFIX } from "../../adapters/storage/scene-slots.js";
import { coerceSession } from "../../domain/decoding/scene-codec.js";
import type { ActiveVenue, VenueScene } from "../../domain/models/scene-model.js";
import type { VillageState } from "../../domain/models/world.js";
import { releaseSceneMemories } from "../../domain/rules/scene-memory-lifecycle.js";
import { sceneReadyForRetirement, sceneRetirementSourceIsValid } from "../../domain/rules/scene-retirement.js";
import { SCENE_TERMINAL_KIND } from "./scene-terminal.js";
import { createHash } from "node:crypto";

export interface SceneRetirementPorts {
  villagesDocuments(): Pick<CapabilityDocumentStore, "getById" | "list" | "remove" | "update">;
  readActive(): Promise<ActiveVenue>;
  readVillageState(): Promise<VillageState>;
  readVillageMemoryState(): Promise<VillageState>;
  /** This port must load and commit the referenced native memory payload. */
  mutateVillageMemoryState(update: (state: VillageState) => void): Promise<VillageState>;
  hasVenueOperation(id: string): boolean;
  saveProjectEvidence(scene: VenueScene, revision: number): Promise<void>;
  saveTerminal(scene: VenueScene, revision: number): Promise<void>;
  readTerminal(id: string): Promise<import("../../domain/models/scene-terminal-model.js").SceneTerminal | null>;
  removeInterpretationDiagnostics(id: string): Promise<void>;
  withRepairWork<T>(work: () => Promise<T>): Promise<T>;
  withSceneWork<T>(id: string, work: () => Promise<T>): Promise<T>;
  withLateResponseWork<T>(id: string, work: () => Promise<T>): Promise<T>;
  onFailure?(id: string, error: unknown): void;
}

/** Publish independent evidence before a revision-checked removal of settled Scene prose. */
export function createSceneRetirement(ports: SceneRetirementPorts) {
  async function removeLateResponses(
    id: string,
    responses?: Awaited<ReturnType<CapabilityDocumentStore["list"]>>,
  ): Promise<void> {
    const documents = ports.villagesDocuments();
    for (const response of responses ?? (await documents.list(VILLAGES_PACKAGE_ID, "generation-response"))) {
      const signature = (response.data as { signature?: unknown } | null)?.signature;
      if (typeof signature !== "string") continue;
      let parts: unknown;
      try {
        parts = JSON.parse(signature);
      } catch {
        continue;
      }
      if (!Array.isArray(parts) || parts.length !== 5 || parts[0] !== id) continue;
      if (!(await documents.remove(VILLAGES_PACKAGE_ID, response.id, response.revision)))
        throw new Error("A saved late response changed during Scene cleanup.");
    }
  }
  async function retire(id: string): Promise<boolean> {
    return ports.withSceneWork(id, () =>
      ports.withRepairWork(async () => {
        const documents = ports.villagesDocuments();
        const saved = await documents.getById(VILLAGES_PACKAGE_ID, SESSION_PREFIX + id);
        if (!saved || !sceneRetirementSourceIsValid(saved.data)) return false;
        const scene = coerceSession(saved.data);
        const village = await ports.readVillageState();
        const active = await ports.readActive();
        if (ports.hasVenueOperation(id) || !sceneReadyForRetirement(scene, village, active.sessionId)) return false;
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
        await ports.saveProjectEvidence(scene, saved.revision);
        await ports.saveTerminal(scene, saved.revision);
        if (ports.hasVenueOperation(id) || (await ports.readActive()).sessionId === id) return false;
        if ((await ports.readVillageState()).seed !== scene.villageSeed) return false;
        const removed = await ports.withLateResponseWork(id, async () => {
          if (!(await documents.remove(VILLAGES_PACKAGE_ID, saved.id, saved.revision))) return false;
          await removeLateResponses(id);
          return true;
        });
        if (!removed) return false;
        await ports.mutateVillageMemoryState((state) => releaseSceneMemories(state, scene));
        await ports.removeInterpretationDiagnostics(id);
        return true;
      }),
    );
  }

  async function retireSettled(): Promise<void> {
    await ports.withRepairWork(async () => {
      // A crash can occur after the Scene is removed and before its memory reservation is released.
      // The durable terminal receipt is the recovery intent; a still-present Scene always wins.
      const terminals = await ports.villagesDocuments().list(VILLAGES_PACKAGE_ID, SCENE_TERMINAL_KIND);
      const responses = await ports.villagesDocuments().list(VILLAGES_PACKAGE_ID, "generation-response");
      const memoryState = await ports.readVillageMemoryState();
      const releasable: string[] = [];
      for (const row of terminals) {
        const data = row.data as { version?: unknown; sceneId?: unknown; villageSeed?: unknown };
        if (data.version !== 1 || typeof data.sceneId !== "string" || typeof data.villageSeed !== "string") continue;
        if (data.villageSeed !== memoryState.seed) continue;
        if (await ports.villagesDocuments().getById(VILLAGES_PACKAGE_ID, SESSION_PREFIX + data.sceneId)) continue;
        const terminal = await ports.readTerminal(data.sceneId);
        if (!terminal || terminal.villageSeed !== data.villageSeed) continue;
        await ports.withLateResponseWork(data.sceneId, () => removeLateResponses(data.sceneId as string, responses));
        await ports.removeInterpretationDiagnostics(data.sceneId);
        if (memoryState.memoryScenes[data.sceneId]) releasable.push(data.sceneId);
      }
      if (releasable.length)
        await ports.mutateVillageMemoryState((state) => {
          if (state.seed === memoryState.seed) for (const id of releasable) delete state.memoryScenes[id];
        });
    });
    const records = await ports.villagesDocuments().list(VILLAGES_PACKAGE_ID, SESSION_KIND);
    for (const row of records) {
      if (!sceneRetirementSourceIsValid(row.data)) continue;
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
