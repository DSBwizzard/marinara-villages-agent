import type { RepairTransaction, RepairWrite } from "./repair-gate.js";
import { MEMORY_PAGE_KIND, validateMemoryPageData } from "./memory-pages.js";
import { memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
type PackedWrite = RepairWrite | { memoryPages: string };
function pageWrite(write: RepairWrite): boolean {
  if (write.before !== null || write.after?.kind !== MEMORY_PAGE_KIND) return false;
  try {
    validateMemoryPageData(write.after.data, write.after.id);
    return true;
  } catch {
    return false;
  }
}
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
  }
  memoryRequire(!value.before || !value.after || value.before.id === value.after.id, "repair identity changed");
}

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
    if (!Object.hasOwn(value, "memoryPages")) {
      validateWrite(value);
      return [value];
    }
    memoryObject(value, ["memoryPages"]);
    memoryRequire(typeof value.memoryPages === "string", "invalid repair pages");
    const pages = JSON.parse(value.memoryPages);
    memoryRequire(
      Array.isArray(pages) &&
        pages.length > 0 &&
        pages.every((write) => {
          validateWrite(write);
          return pageWrite(write);
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
  return { reads, lists, writes: decodeRepairWrites(raw.writes) };
}
