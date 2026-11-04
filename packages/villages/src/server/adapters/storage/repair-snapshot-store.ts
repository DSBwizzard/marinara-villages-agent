import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { repairDigest, type RepairDocument, type RepairWrite } from "./repair-document.js";
import { memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";

export const REPAIR_SNAPSHOT_KIND = "repair-snapshot";
const VILLAGES_PACKAGE_ID = "villages";
export type SnapshotReference = Omit<RepairDocument, "data"> & { body: string };
const bodyId = (value: RepairDocument) => "villages-repair-snapshot-" + repairDigest(value);

export function readSnapshotReferences(value: unknown): SnapshotReference[] {
  memoryRequire(typeof value === "string", "invalid snapshot references");
  const refs = JSON.parse(value);
  memoryRequire(Array.isArray(refs), "invalid snapshot references");
  for (const ref of refs) {
    memoryObject(ref, ["id", "kind", "name", "description", "body"]);
    memoryRequire(
      ["id", "kind", "name", "description", "body"].every((key) => typeof ref[key] === "string") &&
        ref.id.length > 0 &&
        ref.kind.length > 0 &&
        /^villages-repair-snapshot-[a-f0-9]{64}$/.test(ref.body),
      "invalid snapshot reference",
    );
  }
  return refs;
}

/** Body data stays native and identical to its source so Engine retains the same media owners. */
export function createRepairSnapshots(documents: CapabilityDocumentStore) {
  async function read(ref: SnapshotReference): Promise<RepairDocument> {
    const row = await documents.getById(VILLAGES_PACKAGE_ID, ref.body);
    memoryRequire(
      row &&
        row.id === ref.body &&
        row.packageId === VILLAGES_PACKAGE_ID &&
        row.kind === REPAIR_SNAPSHOT_KIND &&
        row.revision === 1,
      "saved snapshot is missing or changed",
    );
    const { body: _body, ...source } = ref;
    const value = { ...source, data: structuredClone(row.data) };
    memoryRequire(bodyId(value) === ref.body, "saved snapshot digest changed");
    return value;
  }
  async function capture(rows: RepairDocument[]): Promise<string> {
    const refs: SnapshotReference[] = [];
    for (const row of rows) {
      const { data, ...source } = row,
        ref = { ...source, body: bodyId(row) };
      const existing = await documents.getById(VILLAGES_PACKAGE_ID, ref.body);
      if (existing) await read(ref);
      else {
        const stamp = new Date().toISOString();
        try {
          await documents.create({
            id: ref.body,
            packageId: VILLAGES_PACKAGE_ID,
            kind: REPAIR_SNAPSHOT_KIND,
            name: "Retained repair snapshot",
            description: "Immutable checkpoint and Undo body",
            data: structuredClone(data),
            createdAt: stamp,
            updatedAt: stamp,
          });
        } catch (error) {
          // A concurrent or ambiguously acknowledged immutable create is reusable only after verification.
          try {
            await read(ref);
          } catch {
            throw error;
          }
        }
      }
      refs.push(ref);
    }
    return JSON.stringify(refs);
  }
  async function restore(value: unknown): Promise<RepairDocument[]> {
    const refs = readSnapshotReferences(value);
    memoryRequire(new Set(refs.map((ref) => ref.id)).size === refs.length, "duplicate snapshot identity");
    const rows: RepairDocument[] = [];
    for (const ref of refs) rows.push(await read(ref));
    return rows;
  }
  async function captureWrites(writes: RepairWrite[]) {
    const rows = writes.flatMap((write) => [write.before, write.after].filter((row): row is RepairDocument => !!row));
    // Repeated source identities represent different versions, so preserve the ordered reference sequence.
    return {
      references: await capture(rows),
      presence: JSON.stringify(writes.map((write) => [!!write.before, !!write.after])),
    };
  }
  async function restoreWrites(value: { references: string; presence: string }): Promise<RepairWrite[]> {
    memoryObject(value, ["references", "presence"]);
    const refs = readSnapshotReferences(value.references),
      rows: RepairDocument[] = [];
    for (const ref of refs) rows.push(await read(ref));
    memoryRequire(typeof value.presence === "string", "invalid Undo write references");
    const presence = JSON.parse(value.presence);
    memoryRequire(
      Array.isArray(presence) &&
        presence.every(
          (pair) =>
            Array.isArray(pair) &&
            pair.length === 2 &&
            pair.every((flag) => typeof flag === "boolean") &&
            pair.some(Boolean),
        ),
      "invalid Undo write references",
    );
    let index = 0;
    const writes = presence.map(([before, after]) => ({
      before: before ? rows[index++] : null,
      after: after ? rows[index++] : null,
    }));
    memoryRequire(
      index === rows.length &&
        new Set(writes.map((write) => (write.after ?? write.before)?.id)).size === writes.length &&
        writes.every(
          (write) =>
            (write.before || write.after) && (!write.before || !write.after || write.before.id === write.after.id),
        ),
      "invalid Undo snapshot sequence",
    );
    return writes;
  }
  const captureOne = async (row: RepairDocument): Promise<SnapshotReference> =>
    readSnapshotReferences(await capture([row]))[0];
  const readOne = async (value: unknown) => read(readSnapshotReferences(JSON.stringify([value]))[0]);
  return { capture, restore, captureWrites, restoreWrites, captureOne, readOne };
}
