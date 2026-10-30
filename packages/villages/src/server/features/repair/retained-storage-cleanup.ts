import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import {
  activationScope,
  bindActivationService,
  createActivationBinding,
} from "../../adapters/engine/activation-scope.js";
import type { RepairGate, RepairDocument } from "../../adapters/storage/repair-gate.js";
import { createRepairTransactionCodec } from "../../adapters/storage/repair-transaction-codec.js";
import {
  createRepairSnapshots,
  readSnapshotReferences,
  type SnapshotReference,
} from "../../adapters/storage/repair-snapshot-store.js";
import {
  assertMemoryWorld,
  memoryDigest,
  readMemoryHead,
  type MemoryHead,
} from "../../adapters/storage/memory-payload-store.js";
import {
  createMemoryPageTracer,
  validateMemoryPageData,
  type MemoryPageData,
} from "../../adapters/storage/memory-pages.js";
import { memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
import {
  sceneHistoryOwners,
  sceneTranscriptOwners,
  sceneSubmissionOwners,
  readActiveSceneOwner,
} from "../../adapters/storage/scene-history.js";
import { createSceneTranscriptTracer } from "../../adapters/storage/scene-transcript-pages.js";
import { createSceneSubmissionTracer } from "../../adapters/storage/scene-submission-pages.js";
import { departureHistoryOwner } from "../../adapters/storage/departure-history.js";
import { createRelationshipPageTracer } from "../../adapters/storage/relationship-pages.js";
import {
  OPERATION_EVIDENCE_KIND,
  validateOperationEvidence,
  traceOperationEvidence,
  operationCheckpointClaims,
  operationEvidenceValue,
} from "../../adapters/storage/operation-evidence.js";
import {
  RELATIONSHIP_PAYLOAD_KIND,
  RELATIONSHIP_INTENT_KIND,
  relationshipPayloadData,
  readRelationshipRoot,
  relationshipDocumentId,
  readRelationshipHead,
  assertRelationshipWorld,
  type RelationshipHead,
  type RelationshipScope,
} from "../../adapters/storage/relationship-payload-store.js";
import { createRepairStorage, repairStorageId } from "./repair-storage.js";
import { readSceneResponseReceipt, sceneResponseReceiptId } from "../../adapters/storage/scene-response-receipts.js";
import {
  validateBackgroundResponse,
  validateBackgroundResponseOwners,
  validateBackgroundJobRecord,
} from "../../adapters/storage/background-responses.js";

type Row = NonNullable<Awaited<ReturnType<CapabilityDocumentStore["getById"]>>>;
const PACKAGE = "villages",
  FLOOR = 1024 * 1024;
const CANDIDATES = [
  "memory-payload",
  "memory-page",
  "repair-snapshot",
  "repair-undo",
  RELATIONSHIP_PAYLOAD_KIND,
  OPERATION_EVIDENCE_KIND,
];
const HISTORY_ID = /^villages-memory-([a-f0-9]{32})-[a-f0-9-]{36}$/;
const ordinaryKinds = new Set([
  "relationships",
  "venue-visit",
  "venue-active",
  "repair-annotation",
  "scene-terminal",
  "project-scene-evidence",
  "background-work",
  "background-history",
  "repair-retention",
  "memory-payload-intent",
  RELATIONSHIP_INTENT_KIND,
]);
function historyBody(row: RepairDocument) {
  const identity = HISTORY_ID.exec(row.id),
    value = row.data;
  memoryObject(value, ["format", "world", "payload"]);
  memoryRequire(
    identity &&
      value.format === 2 &&
      typeof value.world === "string" &&
      value.world === identity[1] &&
      typeof value.payload === "string",
    "invalid retained history identity",
  );
  return value;
}

/** Only immutable bodies with an explicit owner contract are candidates. No prose discovery. */
export async function collectRetainedStorage(gate: RepairGate) {
  return gate.alone(async () => {
    const raw = gate.raw,
      cache = new Map<string, Row | null>(),
      candidates: Row[] = [],
      marked = new Set<string>();
    const checkedEvidence = new WeakMap<object, ReturnType<typeof validateOperationEvidence>>();
    function evidenceBody(
      row: RepairDocument,
      owner?: { id: string; villageSeed?: string },
      ref?: { id: string; digest: string },
    ) {
      let saved = checkedEvidence.get(row);
      if (!saved) {
        saved = validateOperationEvidence(row);
        checkedEvidence.set(row, saved);
      }
      memoryRequire(
        !owner || (saved.data.sceneId === owner.id && saved.data.villageSeed === (owner.villageSeed ?? "")),
        "operation evidence belongs to another Scene",
      );
      memoryRequire(!ref || (ref.id === saved.ref.id && ref.digest === saved.ref.digest), "operation evidence changed");
      return saved;
    }
    const documents: CapabilityDocumentStore = {
      ...raw,
      async getById(pkg, id) {
        if (!cache.has(id)) cache.set(id, await raw.getById(pkg, id));
        return cache.get(id)!;
      },
    };
    const validatedSnapshots = new Map<string, { identity: string; source: RepairDocument }>();
    const snapshots = createRepairSnapshots(documents),
      storage = createRepairStorage(documents, documents);
    async function listed(kind: string) {
      const rows = await raw.list(PACKAGE, kind);
      for (const row of rows) {
        memoryRequire(
          row.kind === kind && row.packageId === PACKAGE && !cache.has(row.id),
          "ambiguous retained document identity",
        );
        cache.set(row.id, row);
      }
      return rows;
    }
    function undoBody(row: RepairDocument) {
      const value = row.data;
      memoryObject(value, ["format", "id", "seed", "setupAt", "payload", "writes"]);
      memoryRequire(
        value.format === 1 &&
          typeof value.id === "string" &&
          row.id === repairStorageId("repair-undo", value.id) &&
          typeof value.seed === "string" &&
          typeof value.setupAt === "string",
        "invalid retained Undo identity",
      );
      memoryObject(value.payload, ["request", "record", "inverse", "guard", "memoryBefore", "memoryGuard", "undoOf"]);
      memoryRequire(typeof value.payload.guard === "string", "invalid retained Undo payload");
      if (Object.hasOwn(value, "writes")) memoryObject(value.writes, ["references", "presence"]);
      return value;
    }
    for (const kind of CANDIDATES) {
      for (const row of await listed(kind)) {
        memoryRequire(row.revision === 1, "immutable retained document changed");
        if (kind === "repair-snapshot")
          memoryRequire(/^villages-repair-snapshot-[a-f0-9]{64}$/.test(row.id), "unknown snapshot identity");
        else if (kind === "memory-page") validateMemoryPageData(row.data, row.id);
        else if (kind === "repair-undo") undoBody(row);
        else if (kind === RELATIONSHIP_PAYLOAD_KIND) relationshipPayloadData(row);
        else if (kind === OPERATION_EVIDENCE_KIND) evidenceBody(row);
        else historyBody(row);
        candidates.push(row);
      }
    }
    type Scope = ReturnType<typeof scope>;
    function scope(overlay = new Map<string, RepairDocument>()) {
      const heads = new Map<string, string>(),
        bodies = new Map<string, string>();
      const lookup = async (id: string): Promise<RepairDocument | null> =>
        overlay.get(id) ?? (await documents.getById(PACKAGE, id));
      const tracer = createMemoryPageTracer(async (id) => {
        const row = await lookup(id);
        memoryRequire(row && row.kind === "memory-page", "owned history page is missing");
        marked.add(id);
        return row.data as MemoryPageData;
      });
      const relationships = createRelationshipPageTracer(async (id) => {
        const row = await lookup(id);
        memoryRequire(row && row.kind === "memory-page", "owned relationship page is missing");
        marked.add(id);
        return row.data as MemoryPageData;
      });
      const transcripts = createSceneTranscriptTracer(async (id) => {
        const row = await lookup(id);
        memoryRequire(row && row.kind === "memory-page", "owned Scene transcript page is missing");
        marked.add(id);
        return row.data as MemoryPageData;
      });
      const submissions = createSceneSubmissionTracer(async (id) => {
        const row = await lookup(id);
        memoryRequire(row && row.kind === "memory-page", "owned Scene submission page is missing");
        marked.add(id);
        return row.data as MemoryPageData;
      });
      return { overlay, lookup, tracer, relationships, transcripts, submissions, heads, bodies };
    }
    async function relationshipHistory(head: RelationshipHead, owner: RelationshipScope, view: Scope) {
      assertRelationshipWorld(head, owner);
      const identity = JSON.stringify(head),
        prior = view.heads.get(head.id);
      if (prior !== undefined) {
        memoryRequire(prior === identity, "relationship reference changed");
        return;
      }
      const row = await view.lookup(head.id);
      memoryRequire(row, "owned relationship history is missing");
      const value = relationshipPayloadData(row),
        manifest = JSON.parse(value.payload);
      memoryRequire(manifest.header?.seed === owner.seed, "owned relationships belong to another Village");
      await view.relationships.trace(manifest, value.world);
      marked.add(head.id);
      view.heads.set(head.id, identity);
    }
    async function history(head: MemoryHead, owner: { seed: string; setupAt: string }, view: Scope) {
      assertMemoryWorld(head, owner);
      const identity = JSON.stringify(head),
        prior = view.heads.get(head.id);
      if (prior !== undefined) {
        memoryRequire(prior === identity, "owned history reference changed");
        return;
      }
      const row = await view.lookup(head.id);
      memoryRequire(row && row.kind === "memory-payload", "owned history is missing");
      memoryObject(row.data, ["format", "world", "payload"]);
      memoryRequire(
        row.data.format === 2 &&
          row.data.world === HISTORY_ID.exec(head.id)?.[1] &&
          typeof row.data.payload === "string" &&
          memoryDigest(row.data.payload) === head.digest,
        "owned history changed",
      );
      const manifest = JSON.parse(row.data.payload);
      memoryRequire(manifest.revision === head.revision, "owned history revision changed");
      await view.tracer.trace(manifest, row.data.world);
      marked.add(head.id);
      view.heads.set(head.id, identity);
    }
    async function references(value: unknown, view: Scope) {
      const rows: RepairDocument[] = [];
      for (const ref of readSnapshotReferences(value)) rows.push(await snapshot(ref, view));
      return rows;
    }
    async function snapshot(ref: SnapshotReference, view: Scope) {
      const identity = JSON.stringify(ref),
        prior = view.bodies.get(ref.body);
      if (prior !== undefined) {
        memoryRequire(prior === identity, "snapshot owner reference changed");
        return validatedSnapshots.get(ref.body)!.source;
      }
      const cached = validatedSnapshots.get(ref.body);
      memoryRequire(!cached || cached.identity === identity, "snapshot owner reference changed");
      const source = cached?.source ?? (await snapshots.readOne(ref));
      if (!cached) validatedSnapshots.set(ref.body, { identity, source });
      marked.add(ref.body);
      view.bodies.set(ref.body, identity);
      await sourceOwners(source, view);
      return source;
    }
    async function writes(value: unknown, view: Scope, owner: { seed: string; setupAt: string }) {
      memoryObject(value, ["references", "presence"]);
      // Validate the complete before/after sequence before treating any of it as an owner.
      const restored = await snapshots.restoreWrites(value as { references: string; presence: string });
      storage.validateUndoSources(owner, restored);
      await references(value.references, view);
    }
    async function plan(row: RepairDocument, inherited: Scope) {
      memoryObject(row.data);
      const value = row.data;
      memoryRequire(
        typeof value.seed === "string" &&
          typeof value.setupAt === "string" &&
          typeof value.review?.id === "string" &&
          typeof value.review?.token === "string" &&
          row.id === repairStorageId("repair-plan", value.review.id) &&
          value.request?.operationId === value.review.id &&
          value.history?.id === value.review.id &&
          value.history.seed === value.seed &&
          value.history.setupAt === value.setupAt,
        "invalid retained review ownership",
      );
      const codec = createRepairTransactionCodec(documents),
        inspected = await codec.inspect(value.transaction);
      const overlay = new Map(inherited.overlay);
      for (const write of inspected.writes)
        if (write.after) {
          overlay.set(write.after.id, write.after);
          if (CANDIDATES.includes(write.after.kind)) marked.add(write.after.id);
        }
      const view = scope(overlay);
      for (const frame of JSON.parse(value.transaction.writes))
        if (!Object.hasOwn(frame, "memoryPages") && frame.after !== null) await snapshot(frame.after, view);
      if (Object.hasOwn(value.history, "writeRefs")) await writes(value.history.writeRefs, view, value.history);
    }
    async function sourceOwners(row: RepairDocument, view: Scope) {
      if (["background-work", "background-history"].includes(row.kind)) {
        validateBackgroundJobRecord(row);
        for (const id of await validateBackgroundResponseOwners(row.data, view.lookup)) marked.add(id);
      } else if (row.kind === "village") {
        memoryObject(row.data);
        memoryRequire(
          row.id === "villages-village" &&
            row.data.version === 10 &&
            typeof row.data.seed === "string" &&
            typeof row.data.setupAt === "string",
          "unsupported Village ownership",
        );
        const head = readMemoryHead(row.data.memoryHead);
        if (head) await history(head, row.data as { seed: string; setupAt: string }, view);
        const departure = departureHistoryOwner(row.data);
        if (departure?.head) await relationshipHistory(departure.head, departure.scope, view);
      } else if (row.kind === "relationships") {
        const root = readRelationshipRoot(row.data);
        memoryRequire(row.id === relationshipDocumentId(root.seed), "unknown relationship root identity");
        await relationshipHistory(root.head, root, view);
      } else if (row.kind === "venue-visit") {
        memoryRequire(
          row.id === "villages-venue-visit-" + (row.data as { id?: string }).id,
          "invalid Scene owner identity",
        );
        for (const owner of sceneHistoryOwners(row.data)) await relationshipHistory(owner.head, owner.scope, view);
        for (const owner of sceneTranscriptOwners(row.data))
          await view.transcripts.trace(owner.head, owner.participants);
        for (const owner of sceneSubmissionOwners(row.data))
          await view.submissions.trace(owner.head, owner.participants);
        const scene = row.data as { id: string; villageSeed?: string; operation?: unknown };
        await traceOperationEvidence(
          scene.operation,
          scene,
          async (ref, resolveValue) => {
            const body = await view.lookup(ref.id);
            memoryRequire(body, "owned operation evidence is missing");
            const { data } = evidenceBody(body, scene, ref);
            marked.add(ref.id);
            return resolveValue ? operationEvidenceValue(data) : undefined;
          },
          async (operation) => {
            for (const claim of operationCheckpointClaims(operation, scene)) {
              const body = await view.lookup(claim.bodyId);
              if (!body) continue;
              const { data } = evidenceBody(body, scene);
              memoryRequire(data.claim === claim.token, "pending checkpoint publication identity changed");
              marked.add(body.id);
            }
          },
        );
      } else if (row.kind === RELATIONSHIP_PAYLOAD_KIND) {
        const value = relationshipPayloadData(row);
        await view.relationships.trace(JSON.parse(value.payload), value.world);
      } else if (row.kind === "repair-checkpoint") {
        const value = storage.checkpointData(row.data);
        memoryRequire(row.id === repairStorageId("repair-checkpoint", value.id), "checkpoint owner identity changed");
        if (!("deleted" in value)) storage.validateCheckpointSources(value, await references(value.snapshots, view));
      } else if (row.kind === "repair-undo") {
        const value = undoBody(row);
        if (Object.hasOwn(value, "writes"))
          await writes(value.writes, view, value as { seed: string; setupAt: string });
      } else if (row.kind === "repair-plan") await plan(row, view);
      else if (row.kind === "repair-history") await header(row, view);
      else if (row.kind === "memory-payload") {
        const value = historyBody(row);
        await view.tracer.trace(JSON.parse(value.payload), value.world);
      } else if (row.kind === OPERATION_EVIDENCE_KIND) {
        evidenceBody(row);
      } else memoryRequire(ordinaryKinds.has(row.kind), "unknown retained snapshot source kind");
    }
    async function header(row: RepairDocument, view: Scope) {
      const value = row.data;
      memoryObject(value);
      memoryRequire(
        value.format === 1 &&
          typeof value.id === "string" &&
          row.id === repairStorageId("repair-history", value.id) &&
          typeof value.seed === "string" &&
          typeof value.setupAt === "string" &&
          Number.isSafeInteger(value.order) &&
          value.order > 0 &&
          typeof value.canUndo === "boolean" &&
          typeof value.undone === "boolean" &&
          !(value.canUndo && value.undone),
        "invalid repair history ownership",
      );
      if (Object.hasOwn(value, "undoId"))
        memoryRequire(
          value.canUndo && !value.undone && value.undoId === repairStorageId("repair-undo", value.id),
          "invalid Undo owner reference",
        );
      if (value.canUndo && !value.undone) {
        memoryRequire(typeof value.undoId === "string", "missing Undo owner reference");
        const body = await view.lookup(value.undoId);
        memoryRequire(body?.kind === "repair-undo", "available Undo is missing");
        const data = undoBody(body);
        memoryRequire(data.seed === value.seed && data.setupAt === value.setupAt, "Undo belongs to another Village");
        marked.add(body.id);
        await sourceOwners(body, view);
      }
    }
    const physical = scope();
    for (const row of await listed("generation-response")) {
      memoryObject(row.data);
      if (row.data.purpose === "background") {
        validateBackgroundResponse(row);
        continue;
      }
      if (row.data.purpose !== "scene") {
        memoryRequire(
          row.data.purpose === "standalone-generation" ||
            (typeof row.data.jobId === "string" && typeof row.data.fingerprint === "string"),
          "unknown generation response ownership",
        );
        continue;
      }
      const receipt = readSceneResponseReceipt(row.data);
      memoryRequire(row.id === sceneResponseReceiptId(receipt.signature), "Scene response owner identity changed");
      const owner = { id: receipt.sceneId, villageSeed: receipt.villageSeed };
      if (receipt.selected) {
        const body = await physical.lookup(receipt.selected.ref.id);
        memoryRequire(body, "selected Scene response is missing");
        evidenceBody(body, owner, receipt.selected.ref);
        marked.add(body.id);
      }
      for (const claim of receipt.pending) {
        const body = await physical.lookup(claim.bodyId);
        if (!body) continue;
        const { data } = evidenceBody(body, owner);
        memoryRequire(data.claim === claim.token, "pending Scene response identity changed");
        marked.add(body.id);
      }
    }
    const root = await documents.getById(PACKAGE, "villages-village");
    if (root) {
      memoryRequire(root.packageId === PACKAGE && root.kind === "village", "invalid current Village identity");
      await sourceOwners(root, physical);
    }
    for (const row of await listed("repair-checkpoint")) {
      storage.checkpointRow(row);
      await sourceOwners(row, physical);
    }
    for (const row of await listed("repair-history")) await header(row, physical);
    for (const row of await listed("repair-plan")) await plan(row, physical);
    for (const row of await listed("relationships")) {
      memoryRequire(
        row.id === relationshipDocumentId(readRelationshipRoot(row.data).seed),
        "unknown relationship root identity",
      );
      await sourceOwners(row, physical);
    }
    for (const row of await listed("venue-visit")) await sourceOwners(row, physical);
    for (const kind of ["background-work", "background-history"])
      for (const row of await listed(kind)) await sourceOwners(row, physical);
    const active = await readActiveSceneOwner(documents);
    if (active.scene) await sourceOwners(active.scene, physical);
    if (root) {
      const id = relationshipDocumentId((root.data as { seed: string }).seed),
        owner = await documents.getById(PACKAGE, id);
      if (owner) {
        memoryRequire(
          owner.id === id && owner.packageId === PACKAGE && owner.kind === "relationships",
          "invalid current relationship owner identity",
        );
        await sourceOwners(owner, physical);
      }
    }
    const intents = await listed("memory-payload-intent");
    for (const row of intents) {
      memoryRequire(
        /^villages-memory-intent-[a-f0-9-]{36}$/.test(row.id) && [1, 2].includes(row.revision),
        "invalid publication intent identity",
      );
      memoryObject(row.data, ["candidate", "previous", "expectedRevision", "phase"]);
      readMemoryHead(row.data.candidate);
      readMemoryHead(row.data.previous);
      memoryRequire(
        Number.isSafeInteger(row.data.expectedRevision) &&
          row.data.expectedRevision >= 0 &&
          ["preparing", "ready", "cancelled"].includes(row.data.phase),
        "invalid publication intent ownership",
      );
    }
    const relationshipIntents = await listed(RELATIONSHIP_INTENT_KIND);
    for (const row of relationshipIntents) {
      memoryRequire(
        /^villages-relationship-intent-[a-f0-9-]{36}$/.test(row.id) && [1, 2].includes(row.revision),
        "invalid relationship intent identity",
      );
      memoryObject(row.data, ["format", "scope", "candidate", "previous", "expectedRevision", "phase"]);
      memoryObject(row.data.scope, ["seed", "setupAt"]);
      memoryRequire(
        row.data.format === 1 &&
          typeof row.data.scope.seed === "string" &&
          typeof row.data.scope.setupAt === "string" &&
          Number.isSafeInteger(row.data.expectedRevision) &&
          row.data.expectedRevision >= 0 &&
          ["preparing", "ready"].includes(row.data.phase),
        "invalid relationship intent ownership",
      );
      const owner = row.data.scope as RelationshipScope;
      assertRelationshipWorld(readRelationshipHead(row.data.candidate), owner);
      if (row.data.previous !== null) assertRelationshipWorld(readRelationshipHead(row.data.previous), owner);
    }
    // No writer can publish now, and startup replay finished before exclusion was acquired.
    // Partial preparations have no surviving producer; actual owners above protect committed data.
    const retired = [...intents, ...relationshipIntents, ...candidates.filter((row) => !marked.has(row.id))];
    let removedBytes = 0;
    for (const row of retired) {
      memoryRequire(await raw.remove(PACKAGE, row.id, row.revision), "retained cleanup changed");
      removedBytes += Buffer.byteLength(JSON.stringify(row));
    }
    const retainedBytes = candidates
      .filter((row) => marked.has(row.id))
      .reduce((sum, row) => sum + Buffer.byteLength(JSON.stringify(row)), 0);
    const ownerBytes = [...cache.values()]
      .filter(
        (row): row is Row =>
          !!row &&
          !CANDIDATES.includes(row.kind) &&
          !["memory-payload-intent", RELATIONSHIP_INTENT_KIND].includes(row.kind),
      )
      .reduce((sum, row) => sum + Buffer.byteLength(JSON.stringify(row)), 0);
    return { removed: retired.length, removedBytes, retainedBytes: retainedBytes + ownerBytes };
  }, "cleanup");
}

/** Allocation-driven housekeeping, using the existing idle gate; no timer or saved counter. */
export function createRetainedStorageCleanup(gate: RepairGate, onFailure: (error: unknown) => void) {
  let unsubscribe: (() => void) | undefined;
  let active = true,
    running: Promise<void> | undefined,
    initial = true,
    threshold = 0,
    retainedBytes = 0;
  const request = () => {
    if (!active || running || (!initial && gate.allocatedBytes() < threshold)) return running;
    running = Promise.resolve().then(async () => {
      try {
        if (!active || !gate.isIdle()) return;
        const result = await collectRetainedStorage(gate);
        retainedBytes = result.retainedBytes;
        initial = false;
        threshold = gate.allocatedBytes() + Math.max(FLOOR, retainedBytes);
      } catch (error) {
        if (!gate.isIdle()) return;
        initial = false;
        threshold = gate.allocatedBytes() + Math.max(FLOOR, retainedBytes);
        try {
          onFailure(error);
        } catch {
          /* Diagnostics never replace progress. */
        }
      } finally {
        running = undefined;
      }
    });
    return running;
  };
  return {
    request,
    start() {
      if (!unsubscribe) {
        active = true;
        const scope = activationScope(),
          callback = () => {
            void request();
          };
        unsubscribe = gate.whenIdle(scope?.bind(callback) ?? callback);
        request();
      }
      return () => {
        active = false;
        unsubscribe?.();
        unsubscribe = undefined;
      };
    },
    dispose: () => {
      active = false;
      unsubscribe?.();
      unsubscribe = undefined;
    },
  };
}
const cleanupBinding = createActivationBinding<ReturnType<typeof createRetainedStorageCleanup>>(
  "Storage cleanup is unavailable.",
);
export const configureRetainedStorageCleanup = (service: ReturnType<typeof createRetainedStorageCleanup>) =>
  cleanupBinding.configure(bindActivationService(service));
export const startRetainedStorageCleanup = () => cleanupBinding.get().start();
