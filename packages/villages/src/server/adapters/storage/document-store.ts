import { assertVillageClockWrite, withVillageClockCommit } from "../time/clock-gate.js";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { VILLAGES_PACKAGE_ID, villagesDocuments } from "../engine/runtime-host.js";
import { assertVenueOwnership } from "../operations/operation-context.js";
import { withRepairWork } from "./repair-gate.js";
import { memoryRequire } from "../../domain/rules/memory-integrity.js";

export const MAX_WRITE_ATTEMPTS = 3;
export type DocumentSlot<T> = {
  kind: string;
  name: string;
  description: string;
  coerce(data: unknown, expectedRevision?: number): T;
  encode?(state: T, expectedRevision?: number): unknown;
  label(state: T): string;
};
export type HydratedDocumentSlot<T> = Omit<DocumentSlot<T>, "coerce"> & {
  coerce(data: unknown, expectedRevision?: number): Promise<T>;
};
export type DocumentSlotFactory<T> = (documents: CapabilityDocumentStore) => DocumentSlot<T> | HydratedDocumentSlot<T>;
/** A mutation captures its document store once, then retains it across CAS retries. */
export function createDocumentMutator(getDocuments: () => CapabilityDocumentStore) {
  async function mutateDocument<T>(
    documentId: string,
    slot: DocumentSlot<T> | HydratedDocumentSlot<T> | DocumentSlotFactory<T>,
    mutate: (state: T) => void | false | Promise<void | false>,
  ): Promise<void> {
    return withRepairWork(() => performMutation(documentId, slot, mutate));
  }
  async function performMutation<T>(
    documentId: string,
    input: DocumentSlot<T> | HydratedDocumentSlot<T> | DocumentSlotFactory<T>,
    mutate: (state: T) => void | false | Promise<void | false>,
  ): Promise<void> {
    const documents = getDocuments();
    const slot = typeof input === "function" ? input(documents) : input;
    for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt += 1) {
      const record = await documents.getById(VILLAGES_PACKAGE_ID, documentId);
      if (record && slot.encode)
        memoryRequire(
          record.id === documentId && record.packageId === VILLAGES_PACKAGE_ID && record.kind === slot.kind,
          "invalid hydrated document owner identity",
        );
      assertVenueOwnership(
        documentId.startsWith("villages-venue-visit-") ? (record?.data as Record<string, unknown>) : undefined,
      );
      const state = await slot.coerce(record?.data, record?.revision ?? 0);
      await assertVillageClockWrite();
      const changed = await mutate(state);
      await assertVillageClockWrite();
      assertVenueOwnership();
      if (changed === false) return;
      const data = slot.encode ? await slot.encode(state, record?.revision ?? 0) : state;
      await assertVillageClockWrite();
      assertVenueOwnership();
      // Compare the bounded saved representation, never a hydrated history, when an encoder owns publication.
      if (record && slot.encode && JSON.stringify(data) === JSON.stringify(record.data)) return;
      const stamp = new Date().toISOString();
      try {
        if (!record) {
          await withVillageClockCommit(() =>
            documents.create({
              id: documentId,
              packageId: VILLAGES_PACKAGE_ID,
              kind: slot.kind,
              name: slot.label(state) || slot.name,
              description: slot.description,
              data,
              createdAt: stamp,
              updatedAt: stamp,
            }),
          );
          return;
        }
        const updated = await withVillageClockCommit(() =>
          documents.update({
            id: documentId,
            packageId: VILLAGES_PACKAGE_ID,
            expectedRevision: record.revision,
            name: slot.label(state) || slot.name,
            description: slot.description,
            data,
            updatedAt: stamp,
          }),
        );
        if (updated) return;
      } catch (error) {
        if (record || !(await documents.getById(VILLAGES_PACKAGE_ID, documentId))) throw error;
        // Most likely a concurrent create claimed the id between our read and our
        // write. Re-read and try the whole mutation again.
      }
    }
    throw new Error("The village kept changing while it was being saved. Please try again.");
  }
  return mutateDocument;
}
export const mutateDocument = createDocumentMutator(villagesDocuments);
