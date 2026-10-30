import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { createHash } from "node:crypto";
import { emptyMemoryPayload } from "../../packages/villages/src/server/adapters/storage/memory-payload-store.js";
import { coerceVillageState } from "../../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  encodeRelationshipPages,
  decodeRelationshipPagesSync,
} from "../../packages/villages/src/server/adapters/storage/relationship-pages.js";
import { relationshipWorldKey } from "../../packages/villages/src/server/adapters/storage/relationship-payload-store.js";
import {
  encodeMemoryPages,
  decodeMemoryPagesSync,
  MEMORY_PAGE_KIND,
} from "../../packages/villages/src/server/adapters/storage/memory-pages.js";
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
    const head = (data as any)?.memoryHead ?? (data as any)?.head;
    if (!head || !virtual.has(head.id)) return;
    // All virtual page documents are committed before a real root may reference them.
    for (const [id, row] of virtual) {
      const existing = await store.getById("villages", id);
      if (existing?.id !== id) {
        try {
          await store.create(row);
        } catch (error) {
          if ((await store.getById("villages", id))?.id !== id) throw error;
        }
      }
      virtual.delete(id);
    }
  }
  const result: CapabilityDocumentStore = {
    ...store,
    async getById(pkg, id) {
      if (virtual.has(id)) return structuredClone(virtual.get(id));
      const row = await store.getById(pkg, id);
      if (row?.kind === "relationships" && (row.data as any)?.version === 3) {
        const world = (await store.getById(pkg, "villages-village"))!.data as any;
        const data = authorRelationshipFixture(virtual, row.data, world);
        return { ...row, id, packageId: pkg, data };
      }
      if (!row || id !== "villages-village") return row;
      const metadata = { ...row, id: row.id ?? id, packageId: row.packageId ?? pkg, kind: row.kind ?? "village" };
      const raw = row.data as Record<string, any>;
      if (raw?.version !== 9) return metadata;
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
        const world = digest(JSON.stringify([state.seed, state.setupAt])).slice(0, 32),
          encoded = encodeMemoryPages(value, world),
          payload = JSON.stringify(encoded.manifest),
          hash = digest(payload);
        for (const [id, data] of encoded.pages)
          virtual.set(id, {
            id,
            packageId: "villages",
            kind: MEMORY_PAGE_KIND,
            name: "Fixture history page",
            description: "Fixture page",
            data,
            revision: 1,
            createdAt: state.setupAt,
            updatedAt: state.setupAt,
          });
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
          data: { format: 2, world, payload },
          revision: 1,
          createdAt: state.setupAt,
          updatedAt: state.setupAt,
        });
      }
      return { ...metadata, data: { ...strip(state), memoryHead: head } };
    },
    async create(input) {
      if (input.id === "villages-village" || input.kind === "relationships") await ensure(input.data);
      return store.create(input);
    },
    async update(input) {
      if (input.id === "villages-village" || (input.data as any)?.format === 4) await ensure(input.data);
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
/** Author logical current-contract fixtures directly in the current physical layout. */
export function authorRelationshipFixture(
  rows: Map<string, any>,
  value: any,
  scope: { seed: string; setupAt: string },
) {
  const world = relationshipWorldKey(scope),
    encoded = encodeRelationshipPages(value, world),
    payload = JSON.stringify(encoded.manifest),
    digest = createHash("sha256").update(payload).digest("hex"),
    head = { id: "villages-relationship-history-" + world + "-" + digest, digest };
  const put = (id: string, kind: string, data: unknown) =>
    rows.set(id, {
      id,
      packageId: "villages",
      kind,
      data,
      revision: 1,
      name: "Fixture history",
      description: "",
      createdAt: scope.setupAt,
      updatedAt: scope.setupAt,
    });
  for (const [id, data] of encoded.pages) put(id, MEMORY_PAGE_KIND, data);
  put(head.id, "relationship-payload", { format: 1, world, payload });
  return { format: 4, seed: scope.seed, setupAt: scope.setupAt, head };
}
export function fixtureRelationshipState(row: any, rows: Map<string, any>) {
  const body = rows.get(row.data.head.id).data;
  return decodeRelationshipPagesSync(JSON.parse(body.payload), body.world, (id) => rows.get(id)?.data ?? null).value;
}
/** Synchronous fixture inspection; protocol regressions use the real repository. */
export function storedVillage(rows: Map<string, any>) {
  return fixtureVillageState(rows.get("villages-village")?.data, rows);
}
export function fixtureVillageState(raw: any, rows?: Map<string, any>) {
  if (!raw || !Object.hasOwn(raw, "memoryHead")) return coerceVillageState(raw);
  const root = raw.memoryHead ? rows!.get(raw.memoryHead.id).data : null;
  const payload = root
    ? decodeMemoryPagesSync(JSON.parse(root.payload), root.world, (id) => rows!.get(id)?.data ?? null).value
    : emptyMemoryPayload();
  return coerceVillageState({ ...raw, ...payload });
}
