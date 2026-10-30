import { AsyncLocalStorage } from "node:async_hooks";
import { createHash } from "node:crypto";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
type CapabilityDocumentRecord = NonNullable<Awaited<ReturnType<CapabilityDocumentStore["getById"]>>>;
import { createActivationBinding } from "../engine/activation-scope.js";
import { conflict } from "../../domain/rules/errors.js";
import { encodeRepairWrites, decodeRepairWrites } from "./repair-transaction-codec.js";

const PACKAGE = "villages";
const CONTROL = "villages-repair-control";
const simulations = new WeakMap<CapabilityDocumentStore, () => boolean>();
export const isRepairSimulation = (documents: CapabilityDocumentStore) => simulations.get(documents)?.() ?? false;
export const repairDigest = (value: unknown): string =>
  createHash("sha256")
    .update(JSON.stringify(value) ?? "undefined")
    .digest("hex");
export type RepairDocument = Pick<CapabilityDocumentRecord, "id" | "kind" | "name" | "description" | "data">;
export type RepairWrite = { before: RepairDocument | null; after: RepairDocument | null };
export type RepairRead = { id: string; digest: string };
export type RepairTransaction = {
  reads: RepairRead[];
  lists: { kind: string; digest: string }[];
  writes: RepairWrite[];
};
type Context = {
  epoch: number;
  owners?: { active: boolean }[];
  administrative?: boolean;
  transaction?: Map<string, RepairWrite>;
  revisions?: Map<string, number>;
};
type Control = { version: 2; epoch: number; pending?: { id: string; writes: RepairWrite[] } };
const clean = (row: CapabilityDocumentRecord | null): RepairDocument | null =>
  row ? { id: row.id, kind: row.kind, name: row.name, description: row.description, data: row.data } : null;
// Clock observation may advance while a player reads the review. Preserve that clock on commit.
function comparable(row: RepairDocument | null): unknown {
  if (row?.id !== "villages-village") return row;
  const data = { ...(row.data as Record<string, unknown>) };
  delete data.clock;
  return { ...row, data };
}
export const repairDocumentDigest = (row: RepairDocument | null) => repairDigest(comparable(row));

/** One activation owns admission, read isolation and durable multi-document replay.
 * Provider work never runs inside a transaction. Old admitted work cannot write after restore.
 */
export function createRepairGate(raw: CapabilityDocumentStore) {
  const context = new AsyncLocalStorage<Context>();
  let epoch = 0;
  let active = 0;
  let exclusive = false;
  let ready: Promise<void> | undefined;
  let controlRevision = 0;
  let alive = true;
  const requireAlive = () => {
    if (!alive) throw conflict("This Village runtime is no longer active.");
  };

  async function saveControl(data: Control) {
    requireAlive();
    const now = new Date().toISOString();
    const old = await raw.getById(PACKAGE, CONTROL);
    if (old && old.revision !== controlRevision) throw conflict("Repair ownership changed. Reopen REPAIR.");
    const fields = {
      id: CONTROL,
      packageId: PACKAGE,
      name: "Repair recovery",
      description: "Durable local recovery",
      data: {
        ...data,
        ...(data.pending ? { pending: { ...data.pending, writes: encodeRepairWrites(data.pending.writes) } } : {}),
      },
      updatedAt: now,
    };
    if (old) {
      const saved = await raw.update({ ...fields, expectedRevision: old.revision });
      if (!saved) throw conflict("Repair recovery changed. Try again.");
      controlRevision = saved.revision;
    } else {
      const saved = await raw.create({ ...fields, kind: "repair-control", createdAt: now });
      controlRevision = saved.revision;
    }
  }
  async function replay(pending: NonNullable<Control["pending"]>) {
    for (const write of pending.writes) {
      requireAlive();
      const id = (write.after ?? write.before)!.id;
      const current = await raw.getById(PACKAGE, id);
      requireAlive();
      if (repairDocumentDigest(clean(current)) === repairDocumentDigest(write.after)) continue;
      if (repairDocumentDigest(clean(current)) !== repairDocumentDigest(write.before))
        throw conflict("Repair recovery found a changed record. Saved recovery has been retained.");
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
    await saveControl({ version: 2, epoch });
  }
  async function ensureReady() {
    if (!ready) {
      ready = (async () => {
        const row = await raw.getById(PACKAGE, CONTROL);
        if (!row) return;
        const saved = row.data as Control;
        if (saved?.version !== 2 || !Number.isSafeInteger(saved.epoch) || saved.epoch < 0)
          throw conflict("The repair recovery record is invalid.");
        controlRevision = row.revision;
        epoch = saved.epoch;
        if (Object.hasOwn(saved, "pending")) {
          const pending = saved.pending;
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
          await replay({ id: pending.id, writes: decodeRepairWrites(pending.writes) });
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
    requireAlive();
    const inherited = context.getStore();
    if (inherited) {
      if (inherited.epoch !== epoch) throw conflict("The world was restored. This older action cannot change it.");
      if (inherited.administrative) return fn();
    }
    if (exclusive) throw conflict("REPAIR is saving. Try again after it finishes.");
    const owner = { active: true };
    active++;
    try {
      return await context.run({ epoch, owners: [...(inherited?.owners ?? []), owner] }, fn);
    } finally {
      owner.active = false;
      active--;
    }
  }
  function assertWrite() {
    const owner = context.getStore();
    if (owner?.epoch !== undefined && owner.epoch !== epoch)
      throw conflict("An older action cannot change the restored world.");
    if (exclusive && !owner?.administrative) throw conflict("REPAIR is saving. Try again.");
  }
  let readSet: Map<string, RepairRead> | undefined;
  let listSet: Map<string, string> | undefined;
  async function get(packageId: string, id: string): Promise<CapabilityDocumentRecord | null> {
    await ensureReady();
    if (exclusive && !context.getStore()?.administrative) throw conflict("REPAIR is saving. Try again.");
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
    if (context.getStore()?.transaction) readSet?.set(id, { id, digest: repairDocumentDigest(clean(row)) });
    return row;
  }
  const documents: CapabilityDocumentStore = {
    getById: get,
    async list(packageId, kind) {
      await ensureReady();
      if (exclusive && !context.getStore()?.administrative) throw conflict("REPAIR is saving. Try again.");
      const rows = await raw.list(packageId, kind);
      const staged = context.getStore()?.transaction;
      if (!staged) return rows;
      listSet?.set(kind, repairDigest(rows.map(clean).sort((a, b) => a!.id.localeCompare(b!.id))));
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
  async function alone<T>(fn: () => Promise<T>) {
    await ensureReady();
    const owned = context.getStore()?.owners?.filter((owner) => owner.active).length ?? 0;
    if (exclusive || active > owned)
      throw conflict("Other Village work is active. Let it finish, then try REPAIR again.");
    exclusive = true;
    try {
      return await context.run({ epoch, administrative: true }, fn);
    } finally {
      exclusive = false;
    }
  }
  async function simulate<T>(fn: () => Promise<T>): Promise<{ value: T; transaction: RepairTransaction }> {
    return alone(async () => {
      const staged = new Map<string, RepairWrite>();
      readSet = new Map();
      listSet = new Map();
      try {
        const value = await context.run({ epoch, administrative: true, transaction: staged, revisions: new Map() }, fn);
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
  async function commit(id: string, transaction: RepairTransaction, extra: RepairWrite[] = []) {
    return alone(async () => {
      for (const expected of transaction.reads)
        if (repairDocumentDigest(clean(await raw.getById(PACKAGE, expected.id))) !== expected.digest)
          throw conflict("A reviewed record changed. Review the repair again; your draft is kept.");
      for (const expected of transaction.lists) {
        const current = await raw.list(PACKAGE, expected.kind);
        if (repairDigest(current.map(clean).sort((a, b) => a!.id.localeCompare(b!.id))) !== expected.digest)
          throw conflict("Related records changed. Review the repair again.");
      }
      const writes = [...transaction.writes, ...extra];
      epoch++;
      try {
        await saveControl({ version: 2, epoch, pending: { id, writes } });
        await replay({ id, writes });
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
    dispose: () => {
      alive = false;
    },
  };
}
export type RepairGate = ReturnType<typeof createRepairGate>;
const binding = createActivationBinding<RepairGate>("Repair storage is unavailable.");
export const configureRepairGate = binding.configure;
export const repairGate = () => binding.get();
export const withRepairWork = <T>(fn: () => Promise<T>): Promise<T> => binding.maybe()?.work(fn) ?? fn();
export const assertRepairGeneration = () => binding.maybe()?.assertGeneration();
