import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { departureHistoryOwner } from "../../adapters/storage/departure-history.js";
import { worldWishOwners, validateWorldWishHistory } from "../../adapters/storage/world-wishes.js";
import { capturedWorldOwners, validateCapturedSources } from "../../adapters/storage/captured-admissions.js";
import { createHash } from "node:crypto";
import type {
  RepairCheckpoint,
  RepairHistoryEntry,
  RepairRecord,
  RepairRequest,
} from "../../../shared/contracts/repair.js";
import type { MemoryKnower } from "../../domain/models/memories.js";
import type { VillageState } from "../../domain/models/world.js";
import { memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
import { conflict } from "../../domain/rules/errors.js";
import type { RepairDocument, RepairWrite } from "../../adapters/storage/repair-gate.js";
import { createRepairSnapshots } from "../../adapters/storage/repair-snapshot-store.js";
import { readRelationshipRoot, relationshipDocumentId } from "../../adapters/storage/relationship-payload-store.js";
import {
  sceneHistoryOwners,
  sceneWishOwners,
  validateSceneHistory,
  readActiveSceneOwner,
} from "../../adapters/storage/scene-history.js";
import {
  validateBackgroundJobRecord,
  validateBackgroundResponseOwners,
} from "../../adapters/storage/background-responses.js";

export const REPAIR_HISTORY_KIND = "repair-history",
  REPAIR_CHECKPOINT_KIND = "repair-checkpoint",
  REPAIR_UNDO_KIND = "repair-undo";
export const REPAIR_GAME_KINDS = [
  "venue-visit",
  "venue-active",
  "relationships",
  "repair-annotation",
  "scene-terminal",
  "project-scene-evidence",
];
const RETENTION_ID = "villages-repair-retention";
type Doc = NonNullable<Awaited<ReturnType<CapabilityDocumentStore["getById"]>>>;
export const repairStorageId = (kind: string, id: string) =>
  `villages-${kind}-${createHash("sha256").update(id).digest("hex")}`;
export type HistoryData = RepairHistoryEntry & {
  seed: string;
  setupAt: string;
  request: RepairRequest;
  record?: RepairRecord;
  inverse?: RepairRequest;
  guard: string;
  memoryBefore?: { id: string; knowers: Record<string, MemoryKnower> };
  memoryGuard?: string;
  undoWrites?: RepairWrite[];
  undoOf?: string;
};
export type HistoryHeader = RepairHistoryEntry & {
  format: 1;
  seed: string;
  setupAt: string;
  order: number;
  undoId?: string;
  undoOf?: string;
  command: Pick<RepairRequest, "recordId" | "action" | "knowers" | "personId">;
};
export type CheckpointData = {
  version: 2;
  seed: string;
  setupAt: string;
  id: string;
  title: string;
  at: string;
  mode: "automatic" | "manual";
  token: string;
  records: number;
  snapshots: string;
};
type DeletedCheckpoint = Pick<CheckpointData, "version" | "seed" | "setupAt" | "id" | "mode" | "token"> & {
  deleted: true;
};
type UndoBody = {
  format: 1;
  id: string;
  seed: string;
  setupAt: string;
  payload: Omit<HistoryData, keyof RepairHistoryEntry | "seed" | "setupAt" | "undoWrites">;
  writes?: { references: string; presence: string };
};
type Retention = { format: 1; next: number; undoIds: string[]; automaticIds: string[] };
type StoredHistory = Omit<HistoryData, "undoWrites"> & { writeRefs?: { references: string; presence: string } };
const owns = (value: { seed: string; setupAt: string }, world: Pick<VillageState, "seed" | "setupAt">) =>
  value.seed === world.seed && value.setupAt === world.setupAt;
function validateScenePointers(rows: RepairDocument[], owner: { seed: string; setupAt: string }) {
  for (const pointer of rows.filter((row) => row.kind === "venue-active")) {
    memoryObject(pointer.data);
    memoryRequire(pointer.id === "villages-active-venue", "snapshot Scene pointer identity changed");
    const { sessionId, playbackSceneId } = pointer.data as { sessionId?: unknown; playbackSceneId?: unknown };
    memoryRequire(
      sessionId === undefined || sessionId === null || typeof sessionId === "string",
      "invalid snapshot active Scene reference",
    );
    memoryRequire(
      playbackSceneId === undefined ||
        (typeof playbackSceneId === "string" && !!playbackSceneId && playbackSceneId !== sessionId),
      "invalid snapshot playback Scene reference",
    );
    for (const id of [sessionId, playbackSceneId].filter(Boolean)) {
      const scene = rows.find((row) => row.id === "villages-venue-visit-" + id);
      memoryRequire(scene?.kind === "venue-visit", "snapshot Scene pointer ownership is missing or changed");
      memoryObject(scene.data);
      for (const context of [...sceneHistoryOwners(scene.data), ...sceneWishOwners(scene.data)])
        memoryRequire(owns(context.scope, owner), "snapshot Scene pointer belongs to another world");
      memoryRequire(
        scene?.kind === "venue-visit" && scene.data.id === id && scene.data.villageSeed === owner.seed,
        "snapshot Scene pointer ownership is missing or changed",
      );
      if (id === playbackSceneId)
        memoryRequire(
          scene.data.status === "closed" &&
            scene.data.continuity?.seed === owner.seed &&
            scene.data.continuity?.setupAt === owner.setupAt,
          "snapshot playback Scene belongs to another world or is not closed",
        );
    }
  }
}
function validateSources(rows: RepairDocument[], owner: { seed: string; setupAt: string }, checkpoint: boolean) {
  const allowed = ["village", ...REPAIR_GAME_KINDS, ...(checkpoint ? [] : ["background-work", "background-history"])];
  for (const row of rows) {
    memoryRequire(allowed.includes(row.kind), "unsupported saved repair source");
    memoryObject(row.data);
    if (["background-work", "background-history"].includes(row.kind)) validateBackgroundJobRecord(row);
    if (row.kind === "village") {
      memoryRequire(
        row.id === "villages-village" && owns(row.data as VillageState, owner),
        "snapshot Village ownership changed",
      );
      departureHistoryOwner(row.data);
      worldWishOwners(row.data);
      capturedWorldOwners(row.data);
    } else if (row.kind === "relationships") {
      const root = readRelationshipRoot(row.data, owner);
      memoryRequire(row.id === relationshipDocumentId(root.seed), "snapshot relationship ownership changed");
    } else if (row.kind === "venue-visit") {
      memoryRequire(
        row.id === "villages-venue-visit-" + row.data.id && row.data.villageSeed === owner.seed,
        "snapshot Scene ownership changed",
      );
      for (const context of [...sceneHistoryOwners(row.data), ...sceneWishOwners(row.data)])
        memoryRequire(
          context.scope.seed === owner.seed && context.scope.setupAt === owner.setupAt,
          "snapshot Scene belongs to another world",
        );
    } else
      for (const key of ["seed", "villageSeed"])
        if (Object.hasOwn(row.data, key))
          memoryRequire(row.data[key] === owner.seed, "snapshot source belongs to another Village");
  }
  validateScenePointers(rows, owner);
  if (checkpoint)
    memoryRequire(rows.filter((row) => row.kind === "village").length === 1, "checkpoint must own one Village root");
}
function worldSources<T extends RepairDocument>(
  rows: T[],
  owner: { seed: string; setupAt: string },
  checkpoint: boolean,
): T[] {
  const selected = rows.filter((row) => {
    memoryObject(row.data);
    const data = row.data;
    for (const key of ["seed", "villageSeed"])
      if (Object.hasOwn(row.data, key))
        memoryRequire(
          typeof row.data[key] === "string" && row.data[key].length > 0,
          "invalid snapshot source ownership",
        );
    return ["seed", "villageSeed"].every((key) => !Object.hasOwn(data, key) || data[key] === owner.seed);
  });
  validateSources(selected, owner, checkpoint);
  return selected;
}

export function createRepairStorage(documents: CapabilityDocumentStore, artifacts: CapabilityDocumentStore) {
  const snapshots = createRepairSnapshots(artifacts);
  function proposedSources(writes: readonly { id: string; after: RepairDocument | null }[]) {
    const afters = new Map(writes.map((write) => [write.id, write.after] as const));
    return {
      getById: async (pkg: string, id: string) => {
        const row = afters.get(id);
        return afters.has(id)
          ? row
            ? { ...row, packageId: pkg, revision: 1, createdAt: "", updatedAt: "" }
            : null
          : documents.getById(pkg, id);
      },
    };
  }
  async function validateSceneView(writes: readonly { id: string; after: RepairDocument | null }[]) {
    await readActiveSceneOwner(proposedSources(writes));
  }
  async function validateResponseWrites(writes: RepairWrite[], proposed: RepairWrite[] = []) {
    const view = proposedSources(
      proposed.map((write) => ({ id: (write.after ?? write.before)!.id, after: write.after })),
    );
    await readActiveSceneOwner(view);
    await validateCapturedSources(
      documents,
      writes.flatMap((write) => (write.before ? [write.before] : [])),
    );
    await validateCapturedSources(
      view,
      writes.flatMap((write) => (write.after ? [write.after] : [])),
    );
    await validateWorldWishHistory(
      documents,
      writes
        .map((write) => write.before)
        .filter((row) => row?.kind === "village")
        .map((row) => row!.data),
    );
    await validateWorldWishHistory(
      view,
      writes
        .map((write) => write.after)
        .filter((row) => row?.kind === "village")
        .map((row) => row!.data),
    );
    await validateSceneHistory(
      documents,
      writes.filter((write) => write.before?.kind === "venue-visit").map((write) => write.before!.data),
    );
    await validateSceneHistory(
      view,
      writes.filter((write) => write.after?.kind === "venue-visit").map((write) => write.after!.data),
    );
    for (const row of writes.flatMap((write) => [write.before, write.after]))
      if (row && ["background-work", "background-history"].includes(row.kind)) {
        validateBackgroundJobRecord(row);
        await validateBackgroundResponseOwners(row.data, (id) => documents.getById("villages", id));
      }
  }
  async function encodeHistory(history: HistoryData): Promise<StoredHistory> {
    const { undoWrites, ...kept } = history;
    return { ...kept, ...(undoWrites ? { writeRefs: await snapshots.captureWrites(undoWrites) } : {}) };
  }
  async function decodeHistory(raw: unknown, proposed?: RepairWrite[]): Promise<HistoryData> {
    memoryObject(raw);
    memoryRequire(
      typeof raw.id === "string" &&
        typeof raw.seed === "string" &&
        typeof raw.setupAt === "string" &&
        typeof raw.guard === "string" &&
        raw.request &&
        typeof raw.request === "object",
      "invalid prepared repair history",
    );
    const { writeRefs, ...kept } = raw as StoredHistory;
    const writes = Object.hasOwn(raw, "writeRefs") ? await snapshots.restoreWrites(writeRefs!) : undefined;
    if (writes) validateUndoSources(raw as { seed: string; setupAt: string }, writes);
    if (writes) await validateResponseWrites(writes, proposed);
    return {
      ...kept,
      ...(writes ? { undoWrites: writes } : {}),
    };
  }
  async function insert(id: string, kind: string, data: unknown) {
    const stamp = new Date().toISOString();
    await documents.create({
      id,
      packageId: "villages",
      kind,
      name: "REPAIR",
      description: "Private repair storage",
      data,
      createdAt: stamp,
      updatedAt: stamp,
    });
  }
  async function replace(row: Doc, data: unknown) {
    if (
      !(await documents.update({
        id: row.id,
        packageId: "villages",
        expectedRevision: row.revision,
        name: row.name,
        description: row.description,
        data,
        updatedAt: new Date().toISOString(),
      }))
    )
      throw conflict("Repair storage changed. Try again.");
  }
  function checkpointData(raw: unknown): CheckpointData | DeletedCheckpoint {
    memoryObject(raw);
    memoryRequire(
      raw.version === 2 &&
        typeof raw.id === "string" &&
        typeof raw.seed === "string" &&
        typeof raw.setupAt === "string" &&
        ["manual", "automatic"].includes(raw.mode) &&
        typeof raw.token === "string",
      "invalid checkpoint metadata",
    );
    if (Object.hasOwn(raw, "deleted")) {
      memoryObject(raw, ["version", "seed", "setupAt", "id", "mode", "token", "deleted"]);
      memoryRequire(raw.deleted === true, "invalid checkpoint deletion marker");
      return raw as DeletedCheckpoint;
    }
    memoryRequire(
      typeof raw.title === "string" &&
        typeof raw.at === "string" &&
        typeof raw.snapshots === "string" &&
        Number.isSafeInteger(raw.records) &&
        raw.records > 0,
      "invalid checkpoint body reference",
    );
    return raw as CheckpointData;
  }
  async function retention(): Promise<{ row: Doc | null; value: Retention }> {
    const row = await documents.getById("villages", RETENTION_ID);
    if (!row) return { row, value: { format: 1, next: 1, undoIds: [], automaticIds: [] } };
    const value = row.data;
    memoryObject(value, ["format", "next", "undoIds", "automaticIds"]);
    memoryRequire(
      value.format === 1 &&
        Number.isSafeInteger(value.next) &&
        value.next > 0 &&
        [value.undoIds, value.automaticIds].every(
          (ids) =>
            Array.isArray(ids) &&
            ids.length <= 10 &&
            ids.every((id) => typeof id === "string") &&
            new Set(ids).size === ids.length,
        ),
      "invalid repair retention metadata",
    );
    return { row, value: structuredClone(value) as Retention };
  }
  function summary(value: CheckpointData): RepairCheckpoint {
    return {
      id: value.id,
      title: value.title,
      at: value.at,
      records: value.records,
      token: value.token,
      mode: value.mode,
    };
  }
  async function checkpoint(
    world: VillageState,
    rows: RepairDocument[],
    id: string,
    title: string,
    token: string,
    mode: CheckpointData["mode"],
  ): Promise<RepairCheckpoint> {
    rows = worldSources(rows, world, true);
    const value: CheckpointData = {
      version: 2,
      seed: world.seed,
      setupAt: world.setupAt,
      id,
      title,
      token,
      mode,
      at: new Date().toISOString(),
      records: rows.length,
      snapshots: await snapshots.capture(rows),
    };
    await insert(repairStorageId(REPAIR_CHECKPOINT_KIND, id), REPAIR_CHECKPOINT_KIND, value);
    return summary(value);
  }
  function checkpointRow(row: Doc, id?: string) {
    const value = checkpointData(row.data);
    memoryRequire(
      row.id === repairStorageId(REPAIR_CHECKPOINT_KIND, value.id) &&
        row.packageId === "villages" &&
        row.kind === REPAIR_CHECKPOINT_KIND &&
        (id === undefined || value.id === id),
      "checkpoint identity changed",
    );
    return { row, value };
  }
  async function readCheckpoint(id: string) {
    const row = await documents.getById("villages", repairStorageId(REPAIR_CHECKPOINT_KIND, id));
    return row ? checkpointRow(row, id) : null;
  }
  async function deleteCheckpoint(id: string, token: string) {
    const saved = await readCheckpoint(id);
    if (!saved) return { deleted: true };
    if (saved.value.token !== token) throw conflict("This checkpoint changed. Reload its list.");
    if (!("deleted" in saved.value)) {
      const { version, seed, setupAt, mode } = saved.value;
      await replace(saved.row, { version, seed, setupAt, id, token, mode, deleted: true } satisfies DeletedCheckpoint);
    }
    return { deleted: true };
  }
  async function readHistory(row: Doc): Promise<HistoryData> {
    const header = row.data as HistoryHeader;
    memoryRequire(
      row.kind === REPAIR_HISTORY_KIND &&
        row.packageId === "villages" &&
        header?.format === 1 &&
        typeof header.id === "string" &&
        row.id === repairStorageId(REPAIR_HISTORY_KIND, header.id) &&
        header.undoId === repairStorageId(REPAIR_UNDO_KIND, header.id) &&
        header.canUndo &&
        !header.undone,
      "repair Undo is unavailable",
    );
    const saved = await documents.getById("villages", header.undoId);
    const body = saved?.data as UndoBody | undefined;
    memoryRequire(
      saved?.kind === REPAIR_UNDO_KIND &&
        saved.packageId === "villages" &&
        saved.id === header.undoId &&
        saved.revision === 1 &&
        body?.format === 1 &&
        body.id === header.id &&
        owns(body, header),
      "repair Undo body is missing or changed",
    );
    memoryObject(body.payload);
    const { format: _format, order: _order, undoId: _undoId, command: _command, ...entry } = header;
    const writes = Object.hasOwn(body, "writes") ? await snapshots.restoreWrites(body.writes!) : undefined;
    if (writes) await validateResponseWrites(writes);
    if (writes) validateUndoSources(header, writes);
    return { ...entry, ...structuredClone(body.payload), ...(writes ? { undoWrites: writes } : {}) };
  }
  async function saveHistory(history: HistoryData, automaticIds: string[]) {
    if (history.undoWrites) validateUndoSources(history, history.undoWrites);
    const meta = await retention(),
      order = meta.value.next++;
    memoryRequire(Number.isSafeInteger(meta.value.next), "repair sequence exhausted");
    const { id, title, at, changes, affected, undone, canUndo, seed, setupAt, undoWrites, ...payload } = history;
    const header: HistoryHeader = {
      format: 1,
      id,
      title,
      at,
      changes,
      affected,
      undone,
      canUndo,
      seed,
      setupAt,
      order,
      ...(history.undoOf ? { undoOf: history.undoOf } : {}),
      command: {
        recordId: history.request.recordId,
        action: history.request.action,
        knowers: [...history.request.knowers],
        ...(history.request.personId ? { personId: history.request.personId } : {}),
      },
    };
    if (canUndo && !undone) {
      header.undoId = repairStorageId(REPAIR_UNDO_KIND, id);
      const body: UndoBody = {
        format: 1,
        id,
        seed,
        setupAt,
        payload,
        ...(undoWrites ? { writes: await snapshots.captureWrites(undoWrites) } : {}),
      };
      await insert(header.undoId, REPAIR_UNDO_KIND, body);
      meta.value.undoIds.push(id);
      for (const retired of meta.value.undoIds.splice(0, Math.max(0, meta.value.undoIds.length - 10))) {
        const row = await documents.getById("villages", repairStorageId(REPAIR_HISTORY_KIND, retired));
        if (!row) throw conflict("Saved Undo ownership is missing.");
        const value = row.data as HistoryHeader;
        memoryRequire(value.format === 1 && value.id === retired, "invalid saved Undo owner");
        const { undoId: _undoId, ...kept } = value;
        await replace(row, { ...kept, canUndo: false });
      }
    }
    await insert(repairStorageId(REPAIR_HISTORY_KIND, id), REPAIR_HISTORY_KIND, header);
    for (const checkpointId of automaticIds) {
      const current = await readCheckpoint(checkpointId);
      memoryRequire(
        current &&
          current.value.mode === "automatic" &&
          !("deleted" in current.value) &&
          owns(current.value, history) &&
          !meta.value.automaticIds.includes(checkpointId),
        "invalid automatic checkpoint publication",
      );
      meta.value.automaticIds.push(checkpointId);
      for (const retired of meta.value.automaticIds.splice(0, Math.max(0, meta.value.automaticIds.length - 10))) {
        const saved = await readCheckpoint(retired);
        if (!saved) throw conflict("Saved checkpoint ownership is missing.");
        memoryRequire(saved.value.mode === "automatic", "manual checkpoint cannot expire automatically");
        await deleteCheckpoint(retired, saved.value.token);
      }
    }
    if (meta.row) await replace(meta.row, meta.value);
    else await insert(RETENTION_ID, "repair-retention", meta.value);
  }
  async function restoreCheckpoint(value: CheckpointData) {
    const rows = await snapshots.restore(value.snapshots);
    validateCheckpointSources(value, rows);
    return rows;
  }
  function validateCheckpointSources(value: CheckpointData, rows: RepairDocument[]) {
    memoryRequire(
      rows.length === value.records && new Set(rows.map((row) => row.id)).size === rows.length,
      "checkpoint source count changed",
    );
    validateSources(rows, value, true);
  }
  function validateUndoSources(owner: { seed: string; setupAt: string }, rows: RepairWrite[]) {
    for (const side of ["before", "after"] as const)
      validateSources(
        rows.flatMap((write) => (write[side] ? [write[side]!] : [])),
        owner,
        false,
      );
  }
  return {
    checkpoint,
    checkpointData,
    checkpointRow,
    readCheckpoint,
    summary,
    deleteCheckpoint,
    readHistory,
    saveHistory,
    encodeHistory,
    decodeHistory,
    restoreCheckpoint,
    validateCheckpointSources,
    validateUndoSources,
    validateScenePointers,
    validateSceneView,
    owns,
    worldSources,
  };
}
