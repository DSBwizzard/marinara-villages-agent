import { createHash } from "node:crypto";
import type { MemoryCollection, MemoryRecord } from "../models/memories.js";

export const MEMORY_TEXT_LIMIT = 600;
export const MEMORY_EXCERPT_LIMIT = 320;
export const MEMORY_RECORD_BYTES = 32768;
export const memoryHash = (value: unknown): string => createHash("sha256").update(stable(value)).digest("hex");
function stable(value: unknown): string {
  if (Array.isArray(value)) return "[" + value.map(stable).join(",") + "]";
  if (value && typeof value === "object")
    return (
      "{" +
      Object.keys(value)
        .filter((key) => value[key] !== undefined)
        .sort()
        .map((key) => JSON.stringify(key) + ":" + stable(value[key]))
        .join(",") +
      "}"
    );
  return JSON.stringify(value) ?? "null";
}
export function memoryRequire(condition: unknown, reason: string): asserts condition {
  if (!condition) throw new Error("Memory: " + reason);
}
export function memoryObject(value: unknown, keys?: string[]): asserts value is Record<string, any> {
  memoryRequire(
    !!value && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype,
    "invalid object",
  );
  memoryRequire(!keys || Object.keys(value).every((key) => keys.includes(key)), "unknown field");
}
const object: typeof memoryObject = memoryObject;
export function memoryString(value: unknown, max = MEMORY_TEXT_LIMIT): asserts value is string {
  memoryRequire(
    typeof value === "string" && value.trim().length > 0 && Buffer.byteLength(value, "utf8") <= max,
    "invalid string",
  );
}
export function memoryKnowerId(value: unknown): asserts value is string {
  memoryString(value, 160);
  memoryRequire(!Object.hasOwn(Object.prototype, value), "reserved knower identity");
}
function integer(value: unknown, min = 1) {
  memoryRequire(Number.isSafeInteger(value) && Number(value) >= min, "invalid revision");
}
export function memoryTimestamp(value: unknown) {
  memoryString(value, 32);
  memoryRequire(Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value, "invalid time");
}
const timestamp = memoryTimestamp;
function strings(value: unknown, empty = false): asserts value is string[] {
  memoryRequire(Array.isArray(value) && (empty || value.length > 0), "invalid audience");
  for (const item of value) memoryString(item, 160);
  memoryRequire(new Set(value).size === value.length, "duplicate identity");
}
export function validateMemorySource(value: unknown) {
  object(value, ["kind", "id", "revision", "fingerprint", "sceneId"]);
  if (value.sceneId !== undefined) memoryString(value.sceneId, 160);
  memoryRequire(["scene", "offscreen", "domain"].includes(value.kind), "invalid source kind");
  memoryString(value.id, 160);
  integer(value.revision);
  memoryString(value.fingerprint, 64);
  memoryRequire(/^[a-f0-9]{64}$/.test(value.fingerprint), "invalid source fingerprint");
}
export function validateMemoryDomain(value: unknown) {
  object(value, ["kind", "id", "characterId"]);
  memoryRequire(
    ["wish", "project", "pursuit", "relationship", "physical"].includes(value.kind),
    "invalid domain reference",
  );
  memoryString(value.id, 160);
  if (value.characterId !== undefined) memoryString(value.characterId, 160);
}
export function validateMemoryLearning(value: unknown, knower: string, saved = false) {
  memoryKnowerId(knower);
  object(value, [
    "basis",
    "attributedTo",
    "support",
    "disclosed",
    ...(saved ? ["learnedAt", "reinforcedAt", "forgotten", "repair", "learnedVia"] : []),
  ]);
  memoryRequire(
    ["observation", "report", "interpretation", "validated-event"].includes(value.basis),
    "invalid learning basis",
  );
  if (value.attributedTo !== undefined) memoryString(value.attributedTo, 160);
  memoryRequire(value.basis !== "report" || !!value.attributedTo, "report requires attribution");
  memoryRequire(
    Array.isArray(value.support) && value.support.length > 0 && value.support.length <= 2,
    "invalid support",
  );
  for (const evidence of value.support) {
    object(evidence, ["source", "lineId", "excerpt", "audience"]);
    validateMemorySource(evidence.source);
    memoryString(evidence.lineId, 160);
    memoryString(evidence.excerpt, MEMORY_EXCERPT_LIMIT);
    strings(evidence.audience);
    memoryRequire(evidence.audience.includes(knower), "unwitnessed support");
  }
  if (value.disclosed !== undefined) {
    object(value.disclosed);
    for (const [key, field] of Object.entries(value.disclosed)) {
      memoryString(key, 80);
      if (typeof field !== "boolean") memoryString(field);
    }
  }
  if (saved) {
    if (value.learnedVia !== undefined) memoryString(value.learnedVia, 160);
    timestamp(value.learnedAt);
    timestamp(value.reinforcedAt);
    memoryRequire(value.reinforcedAt >= value.learnedAt, "learning time reversed");
    for (const field of ["forgotten", "repair"])
      if (value[field] !== undefined) {
        object(value[field], field === "repair" ? ["text", "at", "operationId", "repairs"] : ["at", "operationId"]);
        timestamp(value[field].at);
        memoryString(value[field].operationId, 160);
        if (field === "repair") {
          memoryString(value[field].text);
          object(value[field].repairs, ["id", "revision"]);
          memoryString(value[field].repairs.id, 160);
          integer(value[field].repairs.revision);
        }
      }
  }
}
export function validateMemoryRecord(value: unknown): asserts value is MemoryRecord {
  object(value, [
    "id",
    "rootId",
    "revision",
    "createdRevision",
    "updatedRevision",
    "kind",
    "text",
    "subjects",
    "knowers",
    "origin",
    "occurredAt",
    "recordedAt",
    "domainRef",
    "committedEffect",
    "corrects",
    "resolves",
    "lastApplication",
  ]);
  memoryRequire(Buffer.byteLength(JSON.stringify(value), "utf8") <= MEMORY_RECORD_BYTES, "record too large");
  memoryString(value.id, 160);
  memoryRequire(!Object.hasOwn(Object.prototype, value.id), "reserved memory identity");
  memoryString(value.rootId, 160);
  integer(value.revision);
  integer(value.createdRevision);
  integer(value.updatedRevision);
  memoryRequire(value.updatedRevision >= value.createdRevision, "record revision reversed");
  memoryRequire(["experience", "information", "open-matter"].includes(value.kind), "invalid memory kind");
  memoryString(value.text);
  strings(value.subjects, true);
  object(value.knowers);
  memoryRequire(Object.keys(value.knowers).length, "missing knowers");
  for (const [id, state] of Object.entries(value.knowers)) {
    memoryString(id, 160);
    validateMemoryLearning(state, id, true);
    memoryRequire(
      value.id === value.rootId || (!state.repair && !state.forgotten && !state.learnedVia),
      "protection belongs on canonical root",
    );
  }
  validateMemorySource(value.origin);
  timestamp(value.occurredAt);
  timestamp(value.recordedAt);
  memoryRequire(value.recordedAt >= value.occurredAt, "recorded before occurrence");
  if (value.domainRef !== undefined) validateMemoryDomain(value.domainRef);
  for (const link of ["corrects", "resolves"]) if (value[link] !== undefined) memoryString(value[link], 160);
  memoryRequire(!(value.corrects && value.resolves), "conflicting links");
  object(value.lastApplication, ["id", "fingerprint"]);
  memoryString(value.lastApplication.id, 160);
  memoryString(value.lastApplication.fingerprint, 64);
  memoryRequire(/^[a-f0-9]{64}$/.test(value.lastApplication.fingerprint), "invalid application fingerprint");
  if (value.committedEffect !== undefined) {
    const effect = value.committedEffect;
    object(effect, ["status", "id", "source", "domainRef", "occurredAt", "committedAt", "audience"]);
    memoryRequire(effect.status === "committed", "effect is not committed");
    memoryString(effect.id, 160);
    validateMemorySource(effect.source);
    validateMemoryDomain(effect.domainRef);
    timestamp(effect.occurredAt);
    timestamp(effect.committedAt);
    strings(effect.audience);
    memoryRequire(
      effect.committedAt >= effect.occurredAt &&
        effect.committedAt <= value.recordedAt &&
        effect.occurredAt === value.occurredAt &&
        memoryHash(effect.domainRef) === memoryHash(value.domainRef) &&
        memoryHash(effect.source) === memoryHash(value.origin),
      "invalid committed effect",
    );
  }
  for (const [id, state] of Object.entries(value.knowers) as [string, any][])
    if (state.basis === "validated-event")
      memoryRequire(state.learnedVia || value.committedEffect?.audience.includes(id), "missing committed authority");
}
/** Fail closed. No legacy decoding, migration, coercion, dropping invalid rows or reset-to-empty. */
export function readMemoryCollection(value: unknown): MemoryCollection {
  object(value, ["format", "revision", "records"]);
  memoryRequire(value.format === 1, "unsupported format");
  integer(value.revision, 0);
  memoryRequire(Array.isArray(value.records), "invalid records");
  const records = new Map<string, MemoryRecord>();
  for (const record of value.records) {
    validateMemoryRecord(record);
    memoryRequire(!records.has(record.id) && record.updatedRevision <= value.revision, "duplicate or future record");
    records.set(record.id, record);
  }
  for (const record of records.values()) {
    const root = records.get(record.rootId);
    memoryRequire(root && root.rootId === root.id && !root.corrects, "missing canonical root");
    memoryRequire(record.id === root.id || record.corrects === root.id, "invalid root identity");
    memoryRequire(
      Object.keys(record.knowers).every((id) => !!root.knowers[id]),
      "missing root audience",
    );
    if (record.corrects)
      memoryRequire(record.corrects !== record.id && record.rootId === record.corrects, "invalid correction");
    for (const [id, state] of Object.entries(record.knowers))
      if (state.learnedVia) {
        const via = records.get(state.learnedVia);
        memoryRequire(
          record.id === root.id && via?.corrects === root.id && !!via.knowers[id],
          "invalid learned correction",
        );
        if (state.basis === "validated-event")
          memoryRequire(via.committedEffect?.audience.includes(id), "missing correction authority");
        memoryRequire(state.basis === via.knowers[id].basis, "inconsistent correction knowledge");
      }
    if (record.resolves)
      memoryRequire(
        record.resolves !== record.id &&
          records.get(record.resolves)?.kind === "open-matter" &&
          records.get(record.resolves)?.rootId === record.resolves,
        "invalid resolution",
      );
    for (const state of Object.values(record.knowers))
      if (state.repair) {
        const repaired = records.get(state.repair.repairs.id);
        memoryRequire(
          repaired?.rootId === record.rootId && repaired.revision >= state.repair.repairs.revision,
          "invalid repair link",
        );
      }
  }
  return structuredClone(value) as MemoryCollection;
}
