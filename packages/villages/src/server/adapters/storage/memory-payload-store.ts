import { createHash, randomUUID } from "node:crypto";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
type CapabilityDocumentRecord = NonNullable<Awaited<ReturnType<CapabilityDocumentStore["getById"]>>>;
import type { VillageState } from "../../domain/models/world.js";
import { memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
import { VILLAGES_PACKAGE_ID } from "../engine/runtime-host.js";

export const MEMORY_PAYLOAD_KIND = "memory-payload";
const INTENT_KIND = "memory-payload-intent";
const PAYLOAD_ID = /^villages-memory-([a-f0-9]{32})-[a-f0-9-]{36}$/;
export type MemoryHead = { id: string; digest: string; revision: number };
export type MemoryPayload = Pick<VillageState, "memories" | "memoryScenes" | "memoryReceipts">;
export const memoryDigest = (text: string) => createHash("sha256").update(text).digest("hex");
const worldKey = (state: Pick<VillageState, "seed" | "setupAt">) =>
  memoryDigest(JSON.stringify([state.seed, state.setupAt])).slice(0, 32);
export function readMemoryHead(value: unknown): MemoryHead | null {
  if (value === null) return null;
  memoryObject(value, ["id", "digest", "revision"]);
  memoryRequire(
    typeof value.id === "string" &&
      PAYLOAD_ID.test(value.id) &&
      typeof value.digest === "string" &&
      /^[a-f0-9]{64}$/.test(value.digest) &&
      Number.isSafeInteger(value.revision) &&
      value.revision >= 0,
    "invalid history reference",
  );
  return value as MemoryHead;
}
export function assertMemoryWorld(head: MemoryHead, state: Pick<VillageState, "seed" | "setupAt">) {
  memoryRequire(head.id.startsWith("villages-memory-" + worldKey(state) + "-"), "history belongs to another world");
}
export function memoryPayload(state: VillageState): MemoryPayload {
  return { memories: state.memories, memoryScenes: state.memoryScenes, memoryReceipts: state.memoryReceipts };
}
export function emptyMemoryPayload(): MemoryPayload {
  return { memories: { format: 1, revision: 0, records: [] }, memoryScenes: {}, memoryReceipts: {} };
}
function isEmpty(payload: MemoryPayload) {
  return (
    !payload.memories.records.length &&
    !payload.memories.revision &&
    !Object.keys(payload.memoryScenes).length &&
    !Object.keys(payload.memoryReceipts).length
  );
}
/** Bulk records are immutable. The Village's CAS is their only publication point. */
export function createMemoryPayloadStore(documents: CapabilityDocumentStore) {
  function validateRecord(record: CapabilityDocumentRecord, head: MemoryHead) {
    memoryRequire(
      record.id === head.id &&
        record.packageId === VILLAGES_PACKAGE_ID &&
        record.kind === MEMORY_PAYLOAD_KIND &&
        record.revision === 1,
      "history document identity changed",
    );
    memoryObject(record.data, ["format", "world", "payload"]);
    memoryRequire(
      record.data.format === 1 &&
        record.data.world === PAYLOAD_ID.exec(head.id)?.[1] &&
        typeof record.data.payload === "string" &&
        memoryDigest(record.data.payload) === head.digest,
      "history payload changed",
    );
  }
  async function read(head: MemoryHead, state: Pick<VillageState, "seed" | "setupAt">): Promise<MemoryPayload | null> {
    assertMemoryWorld(head, state);
    const record = await documents.getById(VILLAGES_PACKAGE_ID, head.id);
    if (!record) return null;
    validateRecord(record, head);
    const value: unknown = JSON.parse((record.data as { payload: string }).payload);
    memoryObject(value, ["memories", "memoryScenes", "memoryReceipts"]);
    memoryObject(value.memoryReceipts);
    memoryRequire((value.memories as { revision?: unknown })?.revision === head.revision, "history revision changed");
    // The domain decoder validates every native row, receipt and frozen preimage.
    return value as MemoryPayload;
  }
  async function prepare(
    state: VillageState,
    previous: MemoryHead | null,
    expectedRevision: number,
  ): Promise<MemoryHead | null> {
    const value = memoryPayload(state),
      serialized = JSON.stringify(value),
      digest = memoryDigest(serialized);
    if (previous?.digest === digest && previous.id.startsWith("villages-memory-" + worldKey(state) + "-"))
      return previous;
    const candidate = isEmpty(value)
      ? null
      : {
          id: "villages-memory-" + worldKey(state) + "-" + randomUUID(),
          digest,
          revision: value.memories.revision,
        };
    if (!candidate && !previous) return null;
    const stamp = new Date().toISOString();
    // A small intent survives a crash before payload creation or root publication.
    const intentId = "villages-memory-intent-" + randomUUID();
    const intent = { candidate, previous, expectedRevision, phase: candidate ? "preparing" : "ready" };
    try {
      await documents.create({
        id: intentId,
        packageId: VILLAGES_PACKAGE_ID,
        kind: INTENT_KIND,
        name: "Memory publication",
        description: "Unfinished payload housekeeping",
        data: intent,
        createdAt: stamp,
        updatedAt: stamp,
      });
    } catch (error) {
      // The payload-create call has not been made. Mark a known intent cancelled;
      // unavailable storage retains the small intent for recovery.
      try {
        const saved = await documents.getById(VILLAGES_PACKAGE_ID, intentId);
        if (saved)
          await documents.update({
            id: intentId,
            packageId: VILLAGES_PACKAGE_ID,
            expectedRevision: saved.revision,
            name: saved.name,
            description: saved.description,
            data: { ...intent, phase: "cancelled" },
            updatedAt: stamp,
          });
      } catch {
        /* Keep uncertain preparation metadata. */
      }
      throw error;
    }
    if (candidate)
      await documents.create({
        id: candidate.id,
        packageId: VILLAGES_PACKAGE_ID,
        kind: MEMORY_PAYLOAD_KIND,
        name: "Memories",
        description: "Immutable private history",
        // Opaque prose has no media ownership and must fit the host's reference scan.
        data: { format: 1, world: worldKey(state), payload: serialized },
        createdAt: stamp,
        updatedAt: stamp,
      });
    if (candidate)
      await documents.update({
        id: intentId,
        packageId: VILLAGES_PACKAGE_ID,
        expectedRevision: 1,
        name: "Memory publication",
        description: "Unfinished payload housekeeping",
        data: { ...intent, phase: "ready" },
        updatedAt: stamp,
      });
    return candidate;
  }
  async function remove(head: MemoryHead) {
    const record = await documents.getById(VILLAGES_PACKAGE_ID, head.id);
    if (!record) return;
    validateRecord(record, head);
    if (!(await documents.remove(VILLAGES_PACKAGE_ID, record.id, record.revision)))
      memoryRequire(!(await documents.getById(VILLAGES_PACKAGE_ID, record.id)), "history cleanup changed");
  }
  async function cleanup(readRoot: () => Promise<{ revision: number; head: MemoryHead | null }>) {
    for (const record of await documents.list(VILLAGES_PACKAGE_ID, INTENT_KIND)) {
      memoryRequire(
        record.packageId === VILLAGES_PACKAGE_ID &&
          record.kind === INTENT_KIND &&
          /^villages-memory-intent-[a-f0-9-]{36}$/.test(record.id) &&
          (record.revision === 1 || record.revision === 2),
        "invalid history intent",
      );
      memoryObject(record.data, ["candidate", "previous", "expectedRevision", "phase"]);
      memoryRequire(["preparing", "ready", "cancelled"].includes(String(record.data.phase)), "invalid intent phase");
      const candidate = readMemoryHead(record.data.candidate),
        previous = readMemoryHead(record.data.previous);
      const expectedRevision = record.data.expectedRevision as number;
      memoryRequire(Number.isSafeInteger(expectedRevision) && expectedRevision >= 0, "invalid publication revision");
      const root = await readRoot();
      // An expected-R update cannot publish after R is superseded. A still-current
      // R may belong to an active writer, so leave its intent and payload alone.
      if (root.revision <= expectedRevision) continue;
      // A preparing writer may not have issued its create yet. Keep its intent
      // until the payload exists or the attempt explicitly settles/cancels it.
      if (
        candidate &&
        record.data.phase === "preparing" &&
        !(await documents.getById(VILLAGES_PACKAGE_ID, candidate.id))
      )
        continue;
      if (candidate && root.head?.id !== candidate.id) await remove(candidate);
      if (previous && root.head?.id !== previous.id) await remove(previous);
      if (!(await documents.remove(VILLAGES_PACKAGE_ID, record.id, record.revision)))
        memoryRequire(!(await documents.getById(VILLAGES_PACKAGE_ID, record.id)), "intent cleanup changed");
    }
  }
  return { read, prepare, cleanup };
}
