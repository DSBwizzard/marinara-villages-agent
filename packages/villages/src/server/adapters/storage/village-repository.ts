import { VILLAGES_PACKAGE_ID } from "../engine/runtime-host.js";
import { AsyncLocalStorage } from "node:async_hooks";
import { coerceVillageState, defaultVillageState } from "../../domain/decoding/village-codec.js";
import type { VillageRepository, VillageMemoryWrite } from "../../domain/models/world-repository.js";
import type { VillageState } from "../../domain/models/world.js";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
type CapabilityDocumentRecord = NonNullable<Awaited<ReturnType<CapabilityDocumentStore["getById"]>>>;
import { memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
import { assertVenueOwnership } from "../operations/operation-context.js";
import { MAX_WRITE_ATTEMPTS } from "./document-store.js";
import { withRepairWork } from "./repair-gate.js";
import {
  createMemoryPayloadStore,
  emptyMemoryPayload,
  readMemoryHead,
  assertMemoryWorld,
  type MemoryHead,
} from "./memory-payload-store.js";
const VILLAGE_DOC_ID = "villages-village";
const historyFields = ["memories", "memoryScenes", "memoryReceipts"] as const;
function rootData(record: CapabilityDocumentRecord | null) {
  if (!record) return null;
  memoryRequire(
    record.id === VILLAGE_DOC_ID &&
      record.packageId === VILLAGES_PACKAGE_ID &&
      record.kind === "village" &&
      Number.isSafeInteger(record.revision) &&
      record.revision > 0,
    "invalid Village document identity",
  );
  const raw = record.data;
  memoryObject(raw);
  if (raw.version !== 5) throw new Error("Unsupported Village format. Start a fresh Village.");
  memoryRequire(!historyFields.some((key) => Object.hasOwn(raw, key)), "history cannot be stored in the Village root");
  readMemoryHead(raw.memoryHead);
  return raw;
}
function blockHistory(state: VillageState) {
  for (const key of historyFields)
    Object.defineProperty(state, key, {
      configurable: true,
      enumerable: false,
      get() {
        throw new Error("Memories were not loaded for this operation.");
      },
      set() {
        throw new Error("Memories were not loaded for this operation.");
      },
    });
}
function encodeRoot(state: VillageState, memoryHead: MemoryHead | null) {
  return {
    ...Object.fromEntries(
      Object.keys(state)
        .filter((key) => !historyFields.includes(key as never))
        .map((key) => [key, state[key as keyof VillageState]]),
    ),
    memoryHead,
  };
}
/** Ordinary world reads never materialize history; memory consumers opt in. */
export function createVillageRepository(
  documents: () => CapabilityDocumentStore,
  warn: (message: string) => void = () => {},
): VillageRepository {
  const ownership = new AsyncLocalStorage<{ active: boolean }>();
  let tail: Promise<void> = Promise.resolve();
  async function withAuthorityLock<T>(work: () => Promise<T>): Promise<T> {
    if (ownership.getStore()?.active) return work();
    const previous = tail;
    let release!: () => void;
    tail = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    const token = { active: true };
    try {
      return await ownership.run(token, work);
    } finally {
      token.active = false;
      release();
    }
  }
  async function load(store: CapabilityDocumentStore, include: VillageMemoryWrite["memories"]) {
    const payloads = createMemoryPayloadStore(store);
    for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
      const record = await store.getById(VILLAGES_PACKAGE_ID, VILLAGE_DOC_ID),
        raw = rootData(record);
      if (!raw) return { record, head: null, state: defaultVillageState(), loaded: true };
      const head = readMemoryHead(raw.memoryHead);
      let state = coerceVillageState({ ...raw, ...emptyMemoryPayload() });
      if (head) assertMemoryWorld(head, state);
      const loaded = !head || include === true || (typeof include === "function" && include(state));
      if (loaded && head) {
        const payload = await payloads.read(head, state);
        if (!payload) {
          const fresh = await store.getById(VILLAGES_PACKAGE_ID, VILLAGE_DOC_ID);
          const current = rootData(fresh);
          if (current && readMemoryHead(current.memoryHead)?.id !== head.id) continue;
          throw new Error("The committed Memories payload is missing.");
        }
        state = coerceVillageState({ ...raw, ...payload });
      } else if (!loaded) blockHistory(state);
      return { record, head, state, loaded };
    }
    throw new Error("Memories kept changing while being read. Please try again.");
  }
  return {
    withAuthorityLock,
    async readAuthority(options) {
      return (await load(documents(), options?.memories)).state;
    },
    async mutateAuthority(update, options) {
      return withRepairWork(() =>
        withAuthorityLock(async () => {
          const store = documents(),
            payloads = createMemoryPayloadStore(store);
          for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
            const { record, head, state, loaded } = await load(store, options?.memories);
            const identity = JSON.stringify([state.seed, state.setupAt]);
            const changed = await update(state);
            assertVenueOwnership();
            if (changed === false) return;
            memoryRequire(state.version === 5, "invalid Village mutation format");
            memoryRequire(
              loaded || identity === JSON.stringify([state.seed, state.setupAt]),
              "world reset requires Memories",
            );
            memoryRequire(
              Object.values(state.exchangeReceipts).every((row) => row.domain !== "memories"),
              "memory receipt outside history",
            );
            const nextHead = loaded ? await payloads.prepare(state, head, record?.revision ?? 0) : head;
            const stamp = new Date().toISOString(),
              data = encodeRoot(state, nextHead);
            let committed = false;
            try {
              if (record)
                committed = !!(await store.update({
                  id: VILLAGE_DOC_ID,
                  packageId: VILLAGES_PACKAGE_ID,
                  expectedRevision: record.revision,
                  name: state.name || "Village record",
                  description: "Current Village authority and committed history reference",
                  data,
                  updatedAt: stamp,
                }));
              else {
                await store.create({
                  id: VILLAGE_DOC_ID,
                  packageId: VILLAGES_PACKAGE_ID,
                  kind: "village",
                  name: state.name || "Village record",
                  description: "Current Village authority and committed history reference",
                  data,
                  createdAt: stamp,
                  updatedAt: stamp,
                });
                committed = true;
              }
            } catch (error) {
              // Ambiguous publication retains its intent. Recovery replays saved
              // operation receipts, never provider requests.
              if (record || !(await store.getById(VILLAGES_PACKAGE_ID, VILLAGE_DOC_ID))) throw error;
            }
            try {
              await payloads.cleanup(async () => {
                const current = await store.getById(VILLAGES_PACKAGE_ID, VILLAGE_DOC_ID),
                  raw = rootData(current);
                return { revision: current?.revision ?? 0, head: raw ? readMemoryHead(raw.memoryHead) : null };
              });
            } catch {
              warn("Memory payload housekeeping remains pending; committed progress is retained.");
            }
            if (!committed) continue;
            return;
          }
          throw new Error("The village kept changing while it was being saved. Please try again.");
        }),
      );
    },
  };
}
