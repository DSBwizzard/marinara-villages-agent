import { VILLAGES_PACKAGE_ID, villagesDocuments } from "../engine/runtime-host.js";
import { assertVenueOwnership } from "../operations/operation-context.js";

export const MAX_WRITE_ATTEMPTS = 3;
export type DocumentSlot<T> = {
  kind: string;
  name: string;
  description: string;
  coerce(data: unknown): T;
  label(state: T): string;
};
export async function mutateDocument<T>(
  documentId: string,
  slot: DocumentSlot<T>,
  mutate: (state: T) => void | false | Promise<void | false>,
): Promise<void> {
  const documents = villagesDocuments();
  for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt += 1) {
    const record = await documents.getById(VILLAGES_PACKAGE_ID, documentId);
    assertVenueOwnership(
      documentId.startsWith("villages-venue-visit-") ? (record?.data as Record<string, unknown>) : undefined,
    );
    const state = slot.coerce(record?.data);
    const changed = await mutate(state);
    assertVenueOwnership();
    if (changed === false) return;
    const stamp = new Date().toISOString();
    try {
      if (!record) {
        await documents.create({
          id: documentId,
          packageId: VILLAGES_PACKAGE_ID,
          kind: slot.kind,
          name: slot.label(state) || slot.name,
          description: slot.description,
          data: state,
          createdAt: stamp,
          updatedAt: stamp,
        });
        return;
      }
      const updated = await documents.update({
        id: documentId,
        packageId: VILLAGES_PACKAGE_ID,
        expectedRevision: record.revision,
        name: slot.label(state) || slot.name,
        description: slot.description,
        data: state,
        updatedAt: stamp,
      });
      if (updated) return;
    } catch (error) {
      if (record || !(await documents.getById(VILLAGES_PACKAGE_ID, documentId))) throw error;
      // Most likely a concurrent create claimed the id between our read and our
      // write. Re-read and try the whole mutation again.
    }
  }
  throw new Error("The village kept changing while it was being saved. Please try again.");
}
