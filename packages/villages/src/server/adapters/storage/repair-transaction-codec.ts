import type { RepairTransaction, RepairWrite } from "./repair-gate.js";
import { MEMORY_PAGE_KIND } from "./memory-pages.js";
import { memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
type PackedWrite = RepairWrite | { memoryPages: string };
const pageWrite = (write: RepairWrite) =>
  [write.before, write.after].every(
    (row) =>
      row === null ||
      (row.kind === MEMORY_PAGE_KIND && /^villages-memory-page-[a-f0-9]{32}-[a-f0-9]{64}$/.test(row.id)),
  );

/** Only immutable Memory pages contain no Gallery ownership. Keep other document bodies native. */
export function encodeRepairWrites(writes: RepairWrite[]): PackedWrite[] {
  const result: PackedWrite[] = [];
  let pages: RepairWrite[] = [];
  const flush = () => {
    if (pages.length) result.push({ memoryPages: JSON.stringify(pages) });
    pages = [];
  };
  for (const write of writes) {
    if (pageWrite(write)) pages.push(write);
    else {
      flush();
      result.push(write);
    }
  }
  flush();
  return result;
}
export function decodeRepairWrites(raw: unknown): RepairWrite[] {
  memoryRequire(Array.isArray(raw), "invalid repair writes");
  return raw.flatMap((value) => {
    memoryObject(value);
    if (!Object.hasOwn(value, "memoryPages")) return [value as RepairWrite];
    memoryObject(value, ["memoryPages"]);
    memoryRequire(typeof value.memoryPages === "string", "invalid repair pages");
    const pages = JSON.parse(value.memoryPages);
    memoryRequire(
      Array.isArray(pages) &&
        pages.length > 0 &&
        pages.every((write) => {
          memoryObject(write, ["before", "after"]);
          memoryRequire(write.before !== null || write.after !== null, "empty repair write");
          return pageWrite(write as RepairWrite);
        }),
      "invalid repair pages",
    );
    return pages;
  });
}
export function encodeRepairTransaction(value: RepairTransaction) {
  return {
    format: 2,
    reads: JSON.stringify(value.reads),
    lists: JSON.stringify(value.lists),
    writes: encodeRepairWrites(value.writes),
  };
}
export function decodeRepairTransaction(raw: unknown): RepairTransaction {
  memoryObject(raw, ["format", "reads", "lists", "writes"]);
  memoryRequire(
    raw.format === 2 && typeof raw.reads === "string" && typeof raw.lists === "string",
    "invalid repair transaction",
  );
  return { reads: JSON.parse(raw.reads), lists: JSON.parse(raw.lists), writes: decodeRepairWrites(raw.writes) };
}
