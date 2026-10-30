import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import {
  repairDocumentDigest,
  type RepairDocument,
  type RepairTransaction,
  type RepairWrite,
} from "./repair-document.js";
import { createRepairSnapshots, type SnapshotReference } from "./repair-snapshot-store.js";
import { MEMORY_PAGE_KIND, validateMemoryPageData } from "./memory-pages.js";
import { memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
import { conflict } from "../../domain/rules/errors.js";

export type ReplayWrite = { id: string; beforeDigest: string; after: RepairDocument | null };
type Frame = { id: string; beforeDigest: string; after: SnapshotReference | null } | { memoryPages: string };
function validateWrite(value: unknown): asserts value is RepairWrite {
  memoryObject(value, ["before", "after"]);
  memoryRequire(value.before !== null || value.after !== null, "empty repair write");
  for (const row of [value.before, value.after]) {
    if (row === null) continue;
    memoryObject(row, ["id", "kind", "name", "description", "data"]);
    memoryRequire(
      ["id", "kind", "name", "description"].every((key) => typeof row[key] === "string") &&
        row.id.length > 0 &&
        row.kind.length > 0 &&
        Object.hasOwn(row, "data"),
      "invalid repair document",
    );
    memoryRequire(
      !row.id.startsWith("villages-repair-snapshot-") && row.id !== "villages-repair-control",
      "immutable repair artifacts cannot be changed by their journal",
    );
  }
  memoryRequire(!value.before || !value.after || value.before.id === value.after.id, "repair identity changed");
}
function opaquePage(write: RepairWrite) {
  if (write.before !== null || write.after?.kind !== MEMORY_PAGE_KIND) return false;
  try {
    validateMemoryPageData(write.after.data, write.after.id);
    return true;
  } catch {
    return false;
  }
}
function readSets(raw: unknown) {
  memoryObject(raw, ["format", "reads", "lists", "writes"]);
  memoryRequire(
    raw.format === 3 && typeof raw.reads === "string" && typeof raw.lists === "string",
    "invalid repair transaction",
  );
  const reads = JSON.parse(raw.reads),
    lists = JSON.parse(raw.lists);
  for (const [rows, key] of [
    [reads, "id"],
    [lists, "kind"],
  ] as const) {
    memoryRequire(Array.isArray(rows), "invalid repair read set");
    for (const row of rows) {
      memoryObject(row, [key, "digest"]);
      memoryRequire(
        typeof row[key] === "string" &&
          row[key].length > 0 &&
          typeof row.digest === "string" &&
          /^[a-f0-9]{64}$/.test(row.digest),
        "invalid repair read identity",
      );
    }
  }
  return { reads, lists };
}
/** Immutable after-images own media separately; journals need only before digests and references. */
export function createRepairTransactionCodec(documents: CapabilityDocumentStore) {
  const snapshots = createRepairSnapshots(documents);
  async function encodeWrites(writes: RepairWrite[]): Promise<string> {
    writes.forEach(validateWrite);
    memoryRequire(
      new Set(writes.map((w) => (w.after ?? w.before)!.id)).size === writes.length,
      "duplicate repair write identity",
    );
    const frames: Frame[] = [],
      pages: RepairWrite[] = [];
    const flush = () => {
      if (pages.length) frames.push({ memoryPages: JSON.stringify(pages.splice(0)) });
    };
    for (const write of writes) {
      if (opaquePage(write)) {
        pages.push(write);
        continue;
      }
      flush();
      frames.push({
        id: (write.after ?? write.before)!.id,
        beforeDigest: repairDocumentDigest(write.before),
        after: write.after ? await snapshots.captureOne(write.after) : null,
      });
    }
    flush();
    return JSON.stringify(frames);
  }
  async function decodeWrites(raw: unknown): Promise<ReplayWrite[]> {
    memoryRequire(typeof raw === "string", "invalid repair frames");
    const frames = JSON.parse(raw);
    memoryRequire(Array.isArray(frames), "invalid repair frames");
    const writes: ReplayWrite[] = [];
    for (const frame of frames) {
      memoryObject(frame);
      if (Object.hasOwn(frame, "memoryPages")) {
        memoryObject(frame, ["memoryPages"]);
        memoryRequire(typeof frame.memoryPages === "string", "invalid repair pages");
        const pages = JSON.parse(frame.memoryPages);
        memoryRequire(Array.isArray(pages) && pages.length > 0, "invalid repair pages");
        for (const page of pages) {
          validateWrite(page);
          memoryRequire(opaquePage(page), "invalid repair pages");
          writes.push({ id: page.after!.id, beforeDigest: repairDocumentDigest(null), after: page.after });
        }
      } else {
        memoryObject(frame, ["id", "beforeDigest", "after"]);
        memoryRequire(
          typeof frame.id === "string" &&
            frame.id.length > 0 &&
            !frame.id.startsWith("villages-repair-snapshot-") &&
            frame.id !== "villages-repair-control" &&
            typeof frame.beforeDigest === "string" &&
            /^[a-f0-9]{64}$/.test(frame.beforeDigest) &&
            Object.hasOwn(frame, "after"),
          "invalid repair frame",
        );
        const after = frame.after === null ? null : await snapshots.readOne(frame.after);
        memoryRequire(!after || after.id === frame.id, "repair identity changed");
        writes.push({ id: frame.id, beforeDigest: frame.beforeDigest, after });
      }
    }
    memoryRequire(new Set(writes.map((w) => w.id)).size === writes.length, "duplicate repair write identity");
    return writes;
  }
  async function encode(value: RepairTransaction) {
    return {
      format: 3,
      reads: JSON.stringify(value.reads),
      lists: JSON.stringify(value.lists),
      writes: await encodeWrites(value.writes),
    };
  }
  async function decode(raw: unknown): Promise<RepairTransaction> {
    const sets = readSets(raw),
      writes: RepairWrite[] = [];
    for (const frame of await decodeWrites((raw as { writes: unknown }).writes)) {
      const row = await documents.getById("villages", frame.id);
      const before = row
        ? { id: row.id, kind: row.kind, name: row.name, description: row.description, data: row.data }
        : null;
      if (repairDocumentDigest(before) !== frame.beforeDigest)
        throw conflict("A reviewed record changed. Review the repair again; your draft is kept.");
      const write = { before, after: frame.after };
      validateWrite(write);
      writes.push(write);
    }
    return { ...sets, writes };
  }
  const inspect = async (raw: unknown) => ({
    ...readSets(raw),
    writes: await decodeWrites((raw as { writes: unknown }).writes),
  });
  return { encode, decode, encodeWrites, decodeWrites, inspect };
}
