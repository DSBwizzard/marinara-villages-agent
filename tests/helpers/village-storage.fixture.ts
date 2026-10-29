import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { createHash } from "node:crypto";
import { emptyMemoryPayload } from "../../packages/villages/src/server/adapters/storage/memory-payload-store.js";
import { coerceVillageState } from "../../packages/villages/src/server/domain/decoding/village-codec.js";
const wrappers = new WeakMap<CapabilityDocumentStore, CapabilityDocumentStore>();
const wrapped = new WeakSet<CapabilityDocumentStore>();
/** Native fixture authorship is projected into the current saved layout without
 * introducing writes into read-only/ownership tests. Production has no inline reader. */
export function villageFixtureDocuments(store: CapabilityDocumentStore): CapabilityDocumentStore {
  if (wrapped.has(store)) return store;
  const existing = wrappers.get(store);
  if (existing) return existing;
  const virtual = new Map<string, any>();
  const digest = (v: string) => createHash("sha256").update(v).digest("hex");
  const strip = (raw: Record<string, any>) =>
    Object.fromEntries(
      Object.entries(raw).filter(([k]) => !["memories", "memoryScenes", "memoryReceipts"].includes(k)),
    );
  async function ensure(data: unknown) {
    const head = (data as any)?.memoryHead;
    if (!head || !virtual.has(head.id)) return;
    const row = virtual.get(head.id);
    const existing = await store.getById("villages", head.id);
    if (existing?.id !== head.id) {
      try {
        await store.create(row);
      } catch (error) {
        if ((await store.getById("villages", head.id))?.id !== head.id) throw error;
      }
    }
    virtual.delete(head.id);
  }
  const result: CapabilityDocumentStore = {
    ...store,
    async getById(pkg, id) {
      if (virtual.has(id)) return structuredClone(virtual.get(id));
      const row = await store.getById(pkg, id);
      if (!row || id !== "villages-village") return row;
      const metadata = { ...row, id: row.id ?? id, packageId: row.packageId ?? pkg, kind: row.kind ?? "village" };
      const raw = row.data as Record<string, any>;
      if (raw?.version !== 7) return metadata;
      if (Object.hasOwn(raw, "memoryHead")) return { ...metadata, data: { ...strip(raw), memoryHead: raw.memoryHead } };
      if (!raw.memories) return metadata;
      const state = coerceVillageState(raw),
        value = { memories: state.memories, memoryScenes: state.memoryScenes, memoryReceipts: state.memoryReceipts };
      const empty =
        !value.memories.records.length &&
        !value.memories.revision &&
        !Object.keys(value.memoryScenes).length &&
        !Object.keys(value.memoryReceipts).length;
      let head = null;
      if (!empty) {
        const payload = JSON.stringify(value),
          hash = digest(payload),
          world = digest(JSON.stringify([state.seed, state.setupAt])).slice(0, 32);
        const h = hash.slice(0, 32),
          uuid = [h.slice(0, 8), h.slice(8, 12), h.slice(12, 16), h.slice(16, 20), h.slice(20)].join("-");
        const key = "villages-memory-" + world + "-" + uuid;
        head = { id: key, digest: hash, revision: state.memories.revision };
        virtual.set(key, {
          id: key,
          packageId: "villages",
          kind: "memory-payload",
          name: "Fixture history",
          description: "Already committed fixture state",
          data: { format: 1, world, payload },
          revision: 1,
          createdAt: state.setupAt,
          updatedAt: state.setupAt,
        });
      }
      return { ...metadata, data: { ...strip(state), memoryHead: head } };
    },
    async create(input) {
      if (input.id === "villages-village") await ensure(input.data);
      return store.create(input);
    },
    async update(input) {
      if (input.id === "villages-village") await ensure(input.data);
      return store.update(input);
    },
    async remove(pkg, id, revision) {
      virtual.delete(id);
      return store.remove(pkg, id, revision);
    },
  };
  wrappers.set(store, result);
  wrapped.add(result);
  return result;
}
/** Synchronous fixture inspection; protocol regressions use the real repository. */
export function storedVillage(rows: Map<string, any>) {
  return fixtureVillageState(rows.get("villages-village")?.data, rows);
}
export function fixtureVillageState(raw: any, rows?: Map<string, any>) {
  if (!raw || !Object.hasOwn(raw, "memoryHead")) return coerceVillageState(raw);
  const payload = raw.memoryHead ? JSON.parse(rows!.get(raw.memoryHead.id).data.payload) : emptyMemoryPayload();
  return coerceVillageState({ ...raw, ...payload });
}
