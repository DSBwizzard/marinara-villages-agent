import { createHash } from "node:crypto";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";

type Row = NonNullable<Awaited<ReturnType<CapabilityDocumentStore["getById"]>>>;
export const BACKGROUND_COMPLETION_KIND = "background-completion";
export type BackgroundCompletionProof = { format: 1; seed: string; slotId: string; jobId: string };
export const backgroundCompletionId = (value: BackgroundCompletionProof) =>
  "villages-background-completion-" +
  createHash("sha256")
    .update(JSON.stringify([value.format, value.seed, value.slotId, value.jobId]))
    .digest("hex");

function completionData(value: unknown) {
  memoryObject(value, ["format", "seed", "slotId", "jobId"]);
  memoryRequire(
    value.format === 1 &&
      typeof value.seed === "string" &&
      typeof value.slotId === "string" &&
      /^villages-background-[a-f0-9]{64}$/.test(value.slotId) &&
      typeof value.jobId === "string" &&
      value.jobId.length > 0,
    "background completion scope changed",
  );
  return value as BackgroundCompletionProof;
}
export function readBackgroundCompletion(row: Pick<Row, "id" | "kind" | "data"> & Partial<Row>) {
  const value = completionData(row.data);
  memoryRequire(
    row.kind === BACKGROUND_COMPLETION_KIND &&
      row.packageId === "villages" &&
      row.revision === 1 &&
      row.id === backgroundCompletionId(value),
    "background completion proof changed",
  );
  return value;
}
export function worldBackgroundCompletions(raw: unknown): BackgroundCompletionProof[] {
  memoryObject(raw);
  if (raw.backgroundReceipts === undefined) return [];
  memoryObject(raw.backgroundReceipts);
  return Object.entries(raw.backgroundReceipts).map(([slotId, jobId]) =>
    completionData({ format: 1, seed: raw.seed, slotId, jobId }),
  );
}

/** Archive only a physical committed receipt, before a World write can erase its positive acknowledgement. */
export async function retainReplacedBackgroundReceipts(
  documents: CapabilityDocumentStore,
  before: Row,
  after?: unknown,
) {
  memoryRequire(
    before.id === "villages-village" && before.packageId === "villages" && before.kind === "village",
    "background completion World identity changed",
  );
  const receipts = worldBackgroundCompletions(before.data);
  if (after !== undefined) memoryObject(after);
  const next = after as Record<string, unknown> | undefined;
  if (next?.backgroundReceipts !== undefined) memoryObject(next.backgroundReceipts);
  for (const data of receipts) {
    if (
      next?.seed === data.seed &&
      (next?.backgroundReceipts as Record<string, unknown> | undefined)?.[data.slotId] === data.jobId
    )
      continue;
    const id = backgroundCompletionId(data),
      stamp = new Date().toISOString();
    readBackgroundCompletion({ id, kind: BACKGROUND_COMPLETION_KIND, packageId: "villages", revision: 1, data });
    try {
      await documents.create({
        id,
        packageId: "villages",
        kind: BACKGROUND_COMPLETION_KIND,
        name: "Background completion",
        description: "Committed effect acknowledgement",
        data,
        createdAt: stamp,
        updatedAt: stamp,
      });
    } catch (error) {
      const saved = await documents.getById("villages", id);
      if (!saved) throw error;
      memoryRequire(saved.id === id, "background completion proof changed");
      readBackgroundCompletion(saved);
    }
  }
}
