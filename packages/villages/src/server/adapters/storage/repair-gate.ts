import { AsyncLocalStorage } from "node:async_hooks";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
type CapabilityDocumentRecord = NonNullable<Awaited<ReturnType<CapabilityDocumentStore["getById"]>>>;
import { createActivationBinding } from "../engine/activation-scope.js";
import { conflict } from "../../domain/rules/errors.js";
import { createRepairTransactionCodec, type ReplayWrite } from "./repair-transaction-codec.js";
import {
  repairDigest,
  repairDocumentDigest,
  type RepairDocument,
  type RepairWrite,
  type RepairRead,
  type RepairTransaction,
} from "./repair-document.js";
export { repairDigest, repairDocumentDigest } from "./repair-document.js";
export type { RepairDocument, RepairWrite, RepairRead, RepairTransaction } from "./repair-document.js";

const PACKAGE = "villages";
const CONTROL = "villages-repair-control";
const simulations = new WeakMap<CapabilityDocumentStore, () => boolean>();
export const isRepairSimulation = (documents: CapabilityDocumentStore) => simulations.get(documents)?.() ?? false;
type Context = {
  epoch: number;
  owners?: { active: boolean }[];
  administrative?: boolean;
  transaction?: Map<string, RepairWrite>;
  revisions?: Map<string, number>;
};
type Control = { version: 3; epoch: number; pending?: { id: string; writes: string } };
/** Shared only by activations using the same canonical Engine backend. */
export type RepairAdmission = {
  epoch: number;
  active: number;
  exclusive: object | null;
  idle: Set<() => void>;
  maintenance: { done: Promise<void>; finish(): void } | null;
};
export const createRepairAdmission = (): RepairAdmission => ({
  epoch: 0,
  active: 0,
  exclusive: null,
  idle: new Set(),
  maintenance: null,
});
const clean = (row: CapabilityDocumentRecord | null): RepairDocument | null =>
  row ? { id: row.id, kind: row.kind, name: row.name, description: row.description, data: row.data } : null;

/** One activation owns admission, read isolation and durable multi-document replay.
 * Provider work never runs inside a transaction. Old admitted work cannot write after restore.
 */
export function createRepairGate(backing: CapabilityDocumentStore, admission = createRepairAdmission()) {
  let allocatedBytes = 0;
  const allocationKinds = new Set(["memory-payload", "memory-page", "repair-snapshot", "repair-undo"]);
  const raw = new Proxy(backing, {
    get(target, key) {
      const value = Reflect.get(target, key);
      if (key !== "create") return typeof value === "function" ? value.bind(target) : value;
      return (input: Parameters<CapabilityDocumentStore["create"]>[0]) => {
        // An estimate may overcount a failed create, but never understates attempted allocation.
        if (allocationKinds.has(input.kind)) allocatedBytes += Buffer.byteLength(JSON.stringify(input.data));
        return target.create(input);
      };
    },
  });
  const codec = createRepairTransactionCodec(raw);
  const context = new AsyncLocalStorage<Context>();
  const activation = {};
  let ready: Promise<void> | undefined;
  let readyEpoch: number | undefined;
  let controlRevision = 0;
  let alive = true;
  const listeners = new Set<() => void>();
  const isIdle = () => admission.active === 0 && admission.exclusive === null;
  function notifyIdle() {
    if (!isIdle()) return;
    for (const listener of admission.idle) {
      try {
        listener();
      } catch {
        /* Housekeeping cannot change the saved operation's outcome. */
      }
    }
  }
  const requireAlive = () => {
    if (!alive) throw conflict("This Village runtime is no longer active.");
  };
  function beginMaintenance() {
    let finish!: () => void;
    const done = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const hold = { done, finish };
    admission.maintenance = hold;
    return hold;
  }

  async function saveControl(input: {
    version: 3;
    epoch: number;
    pending?: { id: string; writes: RepairWrite[] };
  }): Promise<Control> {
    requireAlive();
    const now = new Date().toISOString();
    const old = await raw.getById(PACKAGE, CONTROL);
    if (old && old.revision !== controlRevision) throw conflict("Repair ownership changed. Reopen REPAIR.");
    const data: Control = {
      version: 3,
      epoch: input.epoch,
      ...(input.pending
        ? { pending: { id: input.pending.id, writes: await codec.encodeWrites(input.pending.writes) } }
        : {}),
    };
    const fields = {
      id: CONTROL,
      packageId: PACKAGE,
      name: "Repair recovery",
      description: "Durable local recovery",
      data,
      updatedAt: now,
    };
    requireAlive();
    if (old) {
      const saved = await raw.update({ ...fields, expectedRevision: old.revision });
      if (!saved) throw conflict("Repair recovery changed. Try again.");
      controlRevision = saved.revision;
    } else {
      const saved = await raw.create({ ...fields, kind: "repair-control", createdAt: now });
      controlRevision = saved.revision;
    }
    return data;
  }
  async function replay(pending: { id: string; writes: ReplayWrite[] }) {
    const prepared: { write: ReplayWrite; current: CapabilityDocumentRecord | null }[] = [];
    for (const write of pending.writes) {
      requireAlive();
      const id = write.id;
      const current = await raw.getById(PACKAGE, id);
      requireAlive();
      const digest = repairDocumentDigest(clean(current));
      if (digest !== repairDocumentDigest(write.after) && digest !== write.beforeDigest)
        throw conflict("Repair recovery found a changed record. Saved recovery has been retained.");
      prepared.push({ write, current });
    }
    for (const { write, current } of prepared) {
      requireAlive();
      const id = write.id;
      if (repairDocumentDigest(clean(current)) === repairDocumentDigest(write.after)) continue;
      if (!write.after) {
        if (current && !(await raw.remove(PACKAGE, id, current.revision))) throw conflict("Repair deletion changed.");
      } else {
        let data = write.after.data;
        if (id === "villages-village" && current)
          data = { ...(data as object), clock: (current.data as Record<string, unknown>).clock };
        const fields = { ...write.after, data, packageId: PACKAGE, updatedAt: new Date().toISOString() };
        if (current) {
          if (!(await raw.update({ ...fields, expectedRevision: current.revision })))
            throw conflict("Repair record changed.");
        } else await raw.create({ ...fields, createdAt: fields.updatedAt });
      }
    }
    await saveControl({ version: 3, epoch: admission.epoch });
  }
  async function ensureReady() {
    while (admission.maintenance && !(context.getStore()?.administrative && admission.exclusive === activation))
      await admission.maintenance.done;
    if (readyEpoch !== undefined && readyEpoch !== admission.epoch) {
      ready = undefined;
      readyEpoch = undefined;
    }
    if (!ready) {
      requireAlive();
      ready = (async () => {
        for (;;) {
          while (admission.maintenance && !(context.getStore()?.administrative && admission.exclusive === activation))
            await admission.maintenance.done;
          requireAlive();
          if (admission.exclusive && !(context.getStore()?.administrative && admission.exclusive === activation))
            throw conflict("REPAIR is saving. Try again after it finishes.");
          const observedEpoch = admission.epoch,
            row = await raw.getById(PACKAGE, CONTROL);
          requireAlive();
          if (observedEpoch !== admission.epoch || admission.maintenance) continue;
          if (admission.exclusive && !(context.getStore()?.administrative && admission.exclusive === activation))
            throw conflict("REPAIR is saving. Try again after it finishes.");
          const saved = row?.data as Control | undefined;
          if (row && (saved?.version !== 3 || !Number.isSafeInteger(saved.epoch) || saved.epoch < 0))
            throw conflict("The repair recovery record is invalid.");
          if (!row || !Object.hasOwn(saved!, "pending")) {
            // Reading settled recovery metadata needs no exclusion from ordinary gameplay.
            controlRevision = row?.revision ?? 0;
            admission.epoch = Math.max(admission.epoch, saved?.epoch ?? 0);
            readyEpoch = admission.epoch;
            return;
          }
          const pending = saved!.pending;
          if (
            !pending ||
            typeof pending !== "object" ||
            Array.isArray(pending) ||
            Object.getPrototypeOf(pending) !== Object.prototype ||
            typeof pending.id !== "string" ||
            !pending.id.trim() ||
            !Object.hasOwn(pending, "writes")
          )
            throw conflict("The repair recovery record is invalid.");
          const owned = context.getStore()?.owners?.filter((owner) => owner.active).length ?? 0;
          if (admission.exclusive || admission.active > owned)
            throw conflict("Earlier Village work is still settling. Try again after it finishes.");
          admission.exclusive = activation;
          const recovering = beginMaintenance();
          try {
            const fresh = await raw.getById(PACKAGE, CONTROL);
            if (fresh?.revision !== row.revision) continue;
            controlRevision = row.revision;
            admission.epoch = Math.max(admission.epoch, saved!.epoch);
            await replay({ id: pending.id, writes: await codec.decodeWrites(pending.writes) });
            readyEpoch = admission.epoch;
            return;
          } finally {
            if (admission.exclusive === activation) admission.exclusive = null;
            if (admission.maintenance === recovering) admission.maintenance = null;
            recovering.finish();
            notifyIdle();
          }
        }
      })().catch((error) => {
        ready = undefined;
        throw error;
      });
    }
    await ready;
  }
  async function work<T>(fn: () => Promise<T>): Promise<T> {
    requireAlive();
    await ensureReady();
    while (
      readyEpoch !== admission.epoch ||
      (admission.maintenance && !(context.getStore()?.administrative && admission.exclusive === activation))
    ) {
      if (admission.maintenance) await admission.maintenance.done;
      await ensureReady();
    }
    requireAlive();
    const inherited = context.getStore();
    if (inherited) {
      if (inherited.epoch !== admission.epoch)
        throw conflict("The world was restored. This older action cannot change it.");
      if (inherited.administrative && admission.exclusive === activation) return fn();
    }
    if (admission.exclusive) throw conflict("REPAIR is saving. Try again after it finishes.");
    const owner = { active: true };
    admission.active++;
    try {
      return await context.run({ epoch: admission.epoch, owners: [...(inherited?.owners ?? []), owner] }, fn);
    } finally {
      owner.active = false;
      admission.active--;
      notifyIdle();
    }
  }
  function assertWrite() {
    const owner = context.getStore();
    if (owner?.epoch !== undefined && owner.epoch !== admission.epoch)
      throw conflict("An older action cannot change the restored world.");
    if (admission.exclusive && !(owner?.administrative && admission.exclusive === activation))
      throw conflict("REPAIR is saving. Try again.");
  }
  let readSet: Map<string, RepairRead> | undefined;
  let listSet: Map<string, string> | undefined;
  async function get(packageId: string, id: string): Promise<CapabilityDocumentRecord | null> {
    await ensureReady();
    if (admission.exclusive && !(context.getStore()?.administrative && admission.exclusive === activation))
      throw conflict("REPAIR is saving. Try again.");
    const staged = context.getStore()?.transaction?.get(id);
    if (staged)
      return staged.after
        ? {
            ...structuredClone(staged.after),
            packageId,
            revision: context.getStore()?.revisions?.get(id) ?? 1,
            createdAt: "",
            updatedAt: "",
          }
        : null;
    const row = await raw.getById(packageId, id);
    if (context.getStore()?.transaction) {
      const digest = repairDocumentDigest(clean(row)),
        prior = readSet?.get(id);
      if (prior && prior.digest !== digest) throw conflict("A reviewed record changed during preparation.");
      readSet?.set(id, { id, digest });
    }
    return row;
  }
  const documents: CapabilityDocumentStore = {
    getById: get,
    async list(packageId, kind) {
      await ensureReady();
      if (admission.exclusive && !(context.getStore()?.administrative && admission.exclusive === activation))
        throw conflict("REPAIR is saving. Try again.");
      const rows = await raw.list(packageId, kind);
      const staged = context.getStore()?.transaction;
      if (!staged) return rows;
      const digest = repairDigest(rows.map(clean).sort((a, b) => a!.id.localeCompare(b!.id))),
        prior = listSet?.get(kind);
      if (prior && prior !== digest) throw conflict("Related records changed during preparation.");
      listSet?.set(kind, digest);
      const result = new Map(rows.map((row) => [row.id, row]));
      for (const [id, write] of staged) {
        if (write.after?.kind === kind)
          result.set(id, {
            ...structuredClone(write.after),
            packageId,
            revision: context.getStore()?.revisions?.get(id) ?? 1,
            createdAt: "",
            updatedAt: "",
          });
        else if (write.before?.kind === kind) result.delete(id);
      }
      return [...result.values()];
    },
    async create(input) {
      await ensureReady();
      assertWrite();
      const staged = context.getStore()?.transaction;
      if (!staged) return raw.create(input);
      const old = await get(input.packageId, input.id);
      if (old) throw conflict("That record already exists.");
      staged.set(input.id, {
        before: staged.get(input.id)?.before ?? null,
        after: structuredClone(clean({ ...input, revision: 1 })),
      });
      context.getStore()?.revisions?.set(input.id, 1);
      return { ...input, revision: 1 };
    },
    async update(input) {
      await ensureReady();
      assertWrite();
      const staged = context.getStore()?.transaction;
      if (!staged) return raw.update(input);
      const old = await get(input.packageId, input.id);
      if (!old || old.revision !== input.expectedRevision) return null;
      const after = { ...old, ...input, revision: old.revision + 1 };
      staged.set(input.id, {
        before: staged.has(input.id) ? staged.get(input.id)!.before : clean(old),
        after: structuredClone(clean(after)),
      });
      context.getStore()?.revisions?.set(input.id, after.revision);
      return after;
    },
    async remove(packageId, id, revision) {
      await ensureReady();
      assertWrite();
      const staged = context.getStore()?.transaction;
      if (!staged) return raw.remove(packageId, id, revision);
      const old = await get(packageId, id);
      if (!old || old.revision !== revision) return false;
      staged.set(id, { before: staged.has(id) ? staged.get(id)!.before : clean(old), after: null });
      context.getStore()?.revisions?.delete(id);
      return true;
    },
  };
  async function alone<T>(fn: () => Promise<T>, mode: "repair" | "cleanup" = "repair") {
    await ensureReady();
    while (
      readyEpoch !== admission.epoch ||
      (admission.maintenance && !(context.getStore()?.administrative && admission.exclusive === activation))
    ) {
      if (admission.maintenance) await admission.maintenance.done;
      await ensureReady();
    }
    const inherited = context.getStore();
    if (inherited && inherited.epoch !== admission.epoch)
      throw conflict("The world was restored. This older action cannot change it.");
    const owned = context.getStore()?.owners?.filter((owner) => owner.active).length ?? 0;
    requireAlive();
    if (admission.exclusive || admission.active > owned)
      throw conflict("Other Village work is active. Let it finish, then try REPAIR again.");
    admission.exclusive = activation;
    let cleanup: RepairAdmission["maintenance"] = null;
    if (mode === "cleanup") {
      cleanup = beginMaintenance();
    }
    try {
      return await context.run({ epoch: admission.epoch, administrative: true }, fn);
    } finally {
      if (admission.exclusive === activation) admission.exclusive = null;
      if (cleanup) {
        if (admission.maintenance === cleanup) admission.maintenance = null;
        cleanup.finish();
      }
      notifyIdle();
    }
  }
  async function guards(transaction: RepairTransaction) {
    for (const expected of transaction.reads)
      if (repairDocumentDigest(clean(await raw.getById(PACKAGE, expected.id))) !== expected.digest)
        throw conflict("A reviewed record changed. Review the repair again; your draft is kept.");
    for (const expected of transaction.lists) {
      const current = await raw.list(PACKAGE, expected.kind);
      if (repairDigest(current.map(clean).sort((a, b) => a!.id.localeCompare(b!.id))) !== expected.digest)
        throw conflict("Related records changed. Review the repair again.");
    }
  }
  async function simulate<T>(
    fn: () => Promise<T>,
    reviewed?: RepairTransaction,
  ): Promise<{ value: T; transaction: RepairTransaction }> {
    return alone(async () => {
      if (reviewed) await guards(reviewed);
      const staged = new Map<string, RepairWrite>();
      readSet = new Map(reviewed?.reads.map((row) => [row.id, row]));
      listSet = new Map(reviewed?.lists.map((row) => [row.kind, row.digest]));
      try {
        const revisions = new Map<string, number>();
        const value = await context.run(
          { epoch: admission.epoch, administrative: true, transaction: staged, revisions },
          async () => {
            for (const write of reviewed?.writes ?? []) {
              const id = (write.after ?? write.before)!.id,
                current = await get(PACKAGE, id);
              if (repairDocumentDigest(clean(current)) !== repairDocumentDigest(write.before))
                throw conflict("A reviewed record changed. Review the repair again.");
              const after = write.after ? structuredClone(write.after) : null;
              if (after?.id === "villages-village" && current)
                after.data = { ...(after.data as object), clock: (current.data as Record<string, unknown>).clock };
              staged.set(id, { before: clean(current), after });
              if (after) revisions.set(id, (current?.revision ?? 0) + 1);
            }
            return fn();
          },
        );
        return {
          value,
          transaction: {
            reads: [...readSet.values()],
            lists: [...listSet].map(([kind, digest]) => ({ kind, digest })),
            writes: [...staged.values()].filter(
              (w) => repairDocumentDigest(w.before) !== repairDocumentDigest(w.after),
            ),
          },
        };
      } finally {
        readSet = undefined;
        listSet = undefined;
      }
    });
  }
  async function commit(id: string, transaction: RepairTransaction) {
    return alone(async () => {
      await guards(transaction);
      const writes = transaction.writes;
      admission.epoch++;
      try {
        const saved = await saveControl({ version: 3, epoch: admission.epoch, pending: { id, writes } });
        await replay({ id, writes: await codec.decodeWrites(saved.pending!.writes) });
      } catch (error) {
        ready = undefined;
        throw error;
      }
    });
  }
  const guardedDocuments = new Proxy(documents, {
    get(target, key) {
      const value = Reflect.get(target, key);
      return typeof value === "function"
        ? (...args: unknown[]) => work(() => Promise.resolve(Reflect.apply(value, target, args)))
        : value;
    },
  });
  const assertGeneration = () => {
    if (context.getStore()?.administrative) throw conflict("Repair operations cannot request model work.");
  };
  simulations.set(guardedDocuments, () => !!context.getStore()?.transaction);
  return {
    documents: guardedDocuments,
    work,
    simulate,
    commit,
    alone,
    raw,
    assertGeneration,
    allocatedBytes: () => allocatedBytes,
    isIdle,
    whenIdle(listener: () => void) {
      requireAlive();
      const detached = () => context.exit(listener);
      listeners.add(detached);
      admission.idle.add(detached);
      return () => {
        listeners.delete(detached);
        admission.idle.delete(detached);
      };
    },
    dispose: () => {
      alive = false;
      for (const listener of listeners) admission.idle.delete(listener);
      listeners.clear();
    },
  };
}
export type RepairGate = ReturnType<typeof createRepairGate>;
const binding = createActivationBinding<RepairGate>("Repair storage is unavailable.");
export const configureRepairGate = binding.configure;
export const repairGate = () => binding.get();
export const withRepairWork = <T>(fn: () => Promise<T>): Promise<T> => binding.maybe()?.work(fn) ?? fn();
export const assertRepairGeneration = () => binding.maybe()?.assertGeneration();
