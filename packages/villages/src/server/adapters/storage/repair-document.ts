import { createHash } from "node:crypto";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
type DocumentRecord = NonNullable<Awaited<ReturnType<CapabilityDocumentStore["getById"]>>>;
export type RepairDocument = Pick<DocumentRecord, "id" | "kind" | "name" | "description" | "data">;
export type RepairWrite = { before: RepairDocument | null; after: RepairDocument | null };
export type RepairRead = { id: string; digest: string };
export type RepairTransaction = {
  reads: RepairRead[];
  lists: { kind: string; digest: string }[];
  writes: RepairWrite[];
};
export const repairDigest = (value: unknown) =>
  createHash("sha256")
    .update(JSON.stringify(value) ?? "undefined")
    .digest("hex");
/** Clock observation can advance during review; administrative edits cannot rewind it. */
export function repairDocumentDigest(row: RepairDocument | null) {
  if (row?.id !== "villages-village") return repairDigest(row);
  const data = { ...(row.data as Record<string, unknown>) };
  delete data.clock;
  return repairDigest({ ...row, data });
}
