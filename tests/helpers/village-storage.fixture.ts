import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { Job } from "../../packages/villages/src/server/domain/models/background-model.js";
import {
  backgroundResponseClaim,
  nativeBackgroundJob,
  prepareBackgroundResponse,
} from "../../packages/villages/src/server/adapters/storage/background-responses.js";
import { createHash } from "node:crypto";
import { emptyMemoryPayload } from "../../packages/villages/src/server/adapters/storage/memory-payload-store.js";
import { coerceVillageState } from "../../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  encodeWishHistory,
  decodeWishHistorySync,
} from "../../packages/villages/src/server/adapters/storage/wish-history.js";
import {
  encodeRelationshipPages,
  decodeRelationshipPagesSync,
} from "../../packages/villages/src/server/adapters/storage/relationship-pages.js";
import {
  createRelationshipPayloadStore,
  relationshipWorldKey,
} from "../../packages/villages/src/server/adapters/storage/relationship-payload-store.js";
import type { RelationshipIdentity } from "../../packages/villages/src/server/domain/rules/return-capture-revision.js";
import { coerceSession } from "../../packages/villages/src/server/domain/decoding/scene-codec.js";
import { SCENE_STORAGE_FORMAT } from "../../packages/villages/src/server/adapters/storage/scene-history.js";
import {
  encodeOperationEvidence,
  decodeOperationEvidenceSync,
  validateOperationEvidence,
  OPERATION_EVIDENCE_KIND,
  operationEvidenceReferences,
  operationResponseBodyId,
  prepareOperationValue,
  operationEvidenceValue,
  operationCheckpointPrefix,
  operationResponsePrefix,
} from "../../packages/villages/src/server/adapters/storage/operation-evidence.js";
import {
  encodeSceneSubmissions,
  decodeSceneSubmissionsSync,
  readSceneSubmissionHead,
} from "../../packages/villages/src/server/adapters/storage/scene-submission-pages.js";
import {
  encodeSceneTranscript,
  decodeSceneTranscriptSync,
  readSceneTranscriptHead,
} from "../../packages/villages/src/server/adapters/storage/scene-transcript-pages.js";
import {
  encodeMemoryPages,
  decodeMemoryPagesSync,
  MEMORY_PAGE_KIND,
} from "../../packages/villages/src/server/adapters/storage/memory-pages.js";
const wrappers = new WeakMap<CapabilityDocumentStore, CapabilityDocumentStore>();
const wrapped = new WeakSet<CapabilityDocumentStore>();
const identities = createRelationshipPayloadStore({} as CapabilityDocumentStore);
export function authorBackgroundFixture(rows: Map<string, any>, raw: unknown) {
  const job = structuredClone(raw) as Job & { responseStorage?: number };
  if (
    !job ||
    job.responseStorage !== undefined ||
    !Array.isArray(job.steps) ||
    typeof job.id !== "string" ||
    typeof job.seed !== "string"
  )
    return raw;
  job.attempt ??= 1;
  for (const [index, step] of job.steps.entries()) {
    if (!step || typeof step.fingerprint !== "string" || (step.status === "completed" && !step.response)) return raw;
    step.responseClaim = backgroundResponseClaim(job, index);
    if (step.response) {
      const saved = prepareBackgroundResponse(job, index, step.response);
      rows.set(saved.ref.id, {
        id: saved.ref.id,
        kind: "generation-response",
        packageId: "villages",
        revision: 1,
        data: saved.data,
      });
      step.responseRef = saved.ref;
    }
  }
  return nativeBackgroundJob(job);
}
export const fixtureRelationshipIdentity: RelationshipIdentity = (world) =>
  identities.fingerprint(world.relationshipContext, world);
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
    const heads = [
      (data as any)?.memoryHead,
      ...((data as any)?.villagers?.map((row: any) => row.wishHead?.root) ?? []),
      ...((data as any)?.returnCatchup?.capture?.world?.villagers?.map((row: any) => row.wishHead?.root) ?? []),
      (data as any)?.wishArchiveHead?.root,
      (data as any)?.head,
      (data as any)?.returnCatchup?.capture?.world?.relationshipHead,
      (data as any)?.transcript?.lines,
      (data as any)?.operation?.snapshot?.transcript?.lines,
      (data as any)?.submissionHistory?.submissions,
      (data as any)?.operation?.snapshot?.submissionHistory?.submissions,
      (data as any)?.continuity?.relationshipHead,
      (data as any)?.operation?.snapshot?.continuity?.relationshipHead,
      ...((data as any)?.continuity?.facts?.villagers?.map((row: any) => row.wishHead?.root) ?? []),
      ...((data as any)?.operation?.snapshot?.continuity?.facts?.villagers?.map((row: any) => row.wishHead?.root) ??
        []),
      ...operationEvidenceReferences((data as any)?.operation, data as any),
      ...((data as any)?.responseStorage === 2 ? (data as any).steps.map((step: any) => step.responseRef) : []),
    ];
    if (!heads.some((head) => head && virtual.has(head.id))) return;
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
      if (row && ["background-work", "background-history"].includes(row.kind))
        return { ...row, packageId: row.packageId ?? pkg, data: authorBackgroundFixture(virtual, row.data) };
      if (row?.kind === "venue-visit" && (row.data as any)?.version === 3) {
        const world = (await store.getById(pkg, "villages-village"))?.data as any;
        return { ...row, id, packageId: pkg, data: authorSceneFixture(virtual, row.data, world) };
      }
      if (row?.kind === "relationships" && (row.data as any)?.version === 3) {
        const world = (await store.getById(pkg, "villages-village"))!.data as any;
        const data = authorRelationshipFixture(virtual, row.data, world);
        return { ...row, id, packageId: pkg, data };
      }
      if (!row || id !== "villages-village") return row;
      const metadata = { ...row, id: row.id ?? id, packageId: row.packageId ?? pkg, kind: row.kind ?? "village" };
      const raw = row.data as Record<string, any>;
      if (raw?.version !== 12) return metadata;
      if (Object.hasOwn(raw, "memoryHead"))
        return { ...metadata, data: authorDepartureFixture(virtual, { ...strip(raw), memoryHead: raw.memoryHead }) };
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
      return { ...metadata, data: authorDepartureFixture(virtual, { ...strip(state), memoryHead: head }) };
    },
    async create(input) {
      if (input.id === "villages-village" || input.kind === "relationships" || input.kind === "venue-visit")
        await ensure(input.data);
      return store.create(input);
    },
    async list(pkg, kind) {
      const records = await store.list(pkg, kind);
      if (["background-work", "background-history"].includes(kind))
        return records.map((row) => ({
          ...row,
          packageId: row.packageId ?? pkg,
          data: authorBackgroundFixture(virtual, row.data),
        }));
      if (kind !== "venue-visit" && kind !== "relationships") return records;
      const world = (await store.getById(pkg, "villages-village"))?.data as any;
      return records.map((row) => ({
        ...row,
        packageId: row.packageId ?? pkg,
        data:
          kind === "venue-visit"
            ? authorSceneFixture(virtual, row.data, world)
            : (row.data as any)?.version === 3
              ? authorRelationshipFixture(virtual, row.data, world)
              : row.data,
      }));
    },
    async update(input) {
      if (
        input.id === "villages-village" ||
        (input.data as any)?.format === 4 ||
        (input.data as any)?.responseStorage === 2 ||
        (input.data as any)?.storageFormat === SCENE_STORAGE_FORMAT
      )
        await ensure(input.data);
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
export function authorSceneFixture(rows: Map<string, any>, raw: any, world?: { seed?: string; setupAt?: string }): any {
  if (!raw || Object.hasOwn(raw, "storageFormat") || raw.version !== 3) return raw;
  const scene = {
    ...raw,
    villageSeed: Object.hasOwn(raw, "villageSeed") ? raw.villageSeed : world?.seed || undefined,
    storageFormat: SCENE_STORAGE_FORMAT,
  };
  const normalized = coerceSession({ ...raw, continuity: undefined, operation: undefined });
  const encoded = encodeSceneTranscript(normalized.lines, scene);
  const submissions = encodeSceneSubmissions(normalized.submissions, scene);
  for (const [id, data] of [...encoded.pages, ...submissions.pages])
    rows.set(id, {
      id,
      packageId: "villages",
      kind: MEMORY_PAGE_KIND,
      data,
      revision: 1,
      name: "Fixture Scene history",
      description: "",
      createdAt: raw.startedAt ?? "",
      updatedAt: raw.startedAt ?? "",
    });
  scene.transcript = encoded.head;
  scene.submissionHistory = submissions.head;
  delete scene.submissions;
  delete scene.lines;
  delete scene.heardHistory;
  if (scene.continuity) {
    const context = scene.continuity,
      scope = { seed: context.seed, setupAt: context.setupAt ?? world?.setupAt ?? "" },
      { relationshipContext, ...facts } = context.facts,
      head = relationshipContext ? authorRelationshipFixture(rows, relationshipContext, scope).head : null;
    const villagers = authorWorldWishFixture(rows, { version: 12, ...facts, ...scope }).villagers;
    scene.continuity = { ...context, ...scope, facts: { ...facts, villagers }, relationshipHead: head };
  }
  if (scene.operation?.snapshot)
    scene.operation = { ...scene.operation, snapshot: authorSceneFixture(rows, scene.operation.snapshot, world) };
  if (scene.operation) {
    for (const [stage, attempt] of Object.entries(scene.operation.attempts ?? {}) as [string, any][]) {
      if (
        attempt.response &&
        !attempt.response.claim.startsWith(operationResponsePrefix(scene.operation, scene, stage))
      )
        delete attempt.response;
      if (Object.hasOwn(attempt, "result") && !attempt.response) {
        const prefix = operationResponsePrefix(scene.operation, scene, stage),
          token =
            prefix +
            createHash("sha256")
              .update(JSON.stringify([scene.id, stage, attempt.result]))
              .digest("hex")
              .slice(0, 32),
          saved = prepareOperationValue(attempt.result, scene, token);
        attempt.response = { ...saved.ref, claim: token };
        rows.set(saved.ref.id, {
          id: saved.ref.id,
          packageId: "villages",
          kind: OPERATION_EVIDENCE_KIND,
          data: saved.data,
          revision: 1,
          name: "Fixture purchased response",
          description: "",
          createdAt: "",
          updatedAt: "",
        });
      }
    }
    for (const [stage, claim] of Object.entries(scene.operation.checkpointClaims ?? {}) as [
      string,
      { token: string; bodyId: string },
    ][]) {
      claim.token = operationCheckpointPrefix(scene.operation, scene, stage) + claim.token.slice(-36);
      const id = operationResponseBodyId(scene, claim.token);
      if (id !== claim.bodyId) {
        const old = rows.get(claim.bodyId);
        if (old) {
          const copied = prepareOperationValue(operationEvidenceValue(old.data), scene, claim.token);
          rows.set(id, { ...old, id, data: copied.data });
        }
        claim.bodyId = id;
      }
    }
    const evidence = encodeOperationEvidence(scene.operation, scene);
    scene.operation = evidence.operation;
    for (const [id, data] of evidence.values)
      rows.set(id, {
        id,
        packageId: "villages",
        kind: OPERATION_EVIDENCE_KIND,
        data,
        revision: 1,
        name: "Fixture operation evidence",
        description: "",
        createdAt: "",
        updatedAt: "",
      });
  }
  return scene;
}
export function authorDepartureFixture(rows: Map<string, any>, raw: any): any {
  raw = authorWorldWishFixture(rows, raw);
  const capture = raw?.returnCatchup?.capture;
  if (raw?.version !== 12 || !capture || Object.hasOwn(capture.world, "relationshipHead")) return raw;
  const { relationshipContext, ...world } = capture.world;
  const relationshipHead = relationshipContext
    ? authorRelationshipFixture(rows, relationshipContext, world).head
    : null;
  return {
    ...raw,
    returnCatchup: { ...raw.returnCatchup, capture: { ...capture, world: { ...world, relationshipHead } } },
  };
}
export function authorWorldWishFixture(rows: Map<string, any>, raw: any): any {
  if (raw?.version !== 12) return raw;
  const residents = (world: any) =>
    (world.villagers ?? []).map((row: any) => {
      if (Object.hasOwn(row, "wishHead")) return row;
      const { wishes = [], ...facts } = row;
      const saved = encodeWishHistory(wishes, { seed: raw.seed, setupAt: raw.setupAt, actorId: row.characterId });
      for (const [id, data] of saved.pages)
        rows.set(id, {
          id,
          packageId: "villages",
          kind: MEMORY_PAGE_KIND,
          revision: 1,
          data,
          name: "Fixture Wish history",
          description: "",
          createdAt: raw.setupAt,
          updatedAt: raw.setupAt,
        });
      return Object.fromEntries(
        Object.entries(Object.hasOwn(row, "wishes") ? row : { ...facts, wishes }).map(([key, value]) =>
          key === "wishes" ? ["wishHead", saved.head] : [key, value],
        ),
      );
    });
  const result = {
    ...raw,
    villagers: residents(raw),
    wishArchiveHead: raw.wishArchiveHead ?? { count: 0, root: null },
    exchangeReceipts: Object.fromEntries(
      Object.entries(raw.exchangeReceipts ?? {}).map(([id, value]) => {
        const receipt = value as any,
          wish = receipt.sceneFacts?.wish;
        if (!wish || Object.hasOwn(wish, "head")) return [id, receipt];
        const saved = encodeWishHistory(wish.value ? [wish.value] : [], {
          seed: raw.seed,
          setupAt: raw.setupAt,
          actorId: wish.actorId,
        });
        for (const [id, data] of saved.pages)
          rows.set(id, {
            id,
            packageId: "villages",
            kind: MEMORY_PAGE_KIND,
            revision: 1,
            data,
            name: "Fixture Wish after-image",
            description: "",
            createdAt: raw.setupAt,
            updatedAt: raw.setupAt,
          });
        return [
          id,
          {
            ...receipt,
            sceneFacts: {
              ...receipt.sceneFacts,
              wish: { actorId: wish.actorId, wishId: wish.wishId, head: saved.head },
            },
          },
        ];
      }),
    ),
  };
  if (raw.returnCatchup?.capture)
    result.returnCatchup = {
      ...raw.returnCatchup,
      capture: {
        ...raw.returnCatchup.capture,
        world: { ...raw.returnCatchup.capture.world, villagers: residents(raw.returnCatchup.capture.world) },
      },
    };
  return result;
}
export function fixtureSceneState(raw: any, rows: Map<string, any>) {
  if (!raw?.storageFormat) return coerceSession(raw);
  const { storageFormat: _format, transcript, submissionHistory, ...scene } = raw;
  scene.submissions = decodeSceneSubmissionsSync(
    readSceneSubmissionHead(submissionHistory, raw),
    (id) => rows.get(id)?.data ?? null,
  ).submissions;
  scene.lines = decodeSceneTranscriptSync(
    readSceneTranscriptHead(transcript, raw),
    (id) => rows.get(id)?.data ?? null,
  ).lines;
  scene.operation = decodeOperationEvidenceSync(raw.operation, raw, (ref) => {
    const row = rows.get(ref.id);
    if (!row) throw new Error("Missing fixture operation evidence");
    return operationEvidenceValue(validateOperationEvidence(row, raw, ref).data);
  });
  if (raw.continuity) {
    const { relationshipHead, ...context } = raw.continuity;
    const root = relationshipHead ? rows.get(relationshipHead.id)!.data : null;
    const relationships = root
      ? decodeRelationshipPagesSync(JSON.parse(root.payload), root.world, (id) => rows.get(id)?.data ?? null).value
      : undefined;
    const villagers = context.facts.villagers.map((row: any) => {
      const wishes = decodeWishHistorySync(
        row.wishHead,
        { ...context, actorId: row.characterId },
        (id) => rows.get(id)?.data ?? null,
      ).rows;
      return Object.fromEntries(
        Object.entries(row).map(([key, value]) => (key === "wishHead" ? ["wishes", wishes] : [key, value])),
      );
    });
    scene.continuity = { ...context, facts: { ...context.facts, villagers, relationshipContext: relationships } };
  }
  return coerceSession(scene);
}
export function editFixtureScene(
  record: { data: any },
  rows: Map<string, any>,
  mutate: (scene: ReturnType<typeof coerceSession>) => void,
) {
  const scene = fixtureSceneState(record.data, rows);
  mutate(scene);
  record.data = authorSceneFixture(rows, scene);
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
  if (raw?.version === 12) {
    const residents = (world: any) =>
      (world.villagers ?? []).map((row: any) => {
        if (!Object.hasOwn(row, "wishHead")) return row;
        const { wishHead } = row;
        const wishes = decodeWishHistorySync(
          wishHead,
          { seed: raw.seed, setupAt: raw.setupAt, actorId: row.characterId },
          (id) => rows?.get(id)?.data ?? null,
        ).rows;
        return Object.fromEntries(
          Object.entries(row).map(([key, value]) => (key === "wishHead" ? ["wishes", wishes] : [key, value])),
        );
      });
    raw = { ...raw, villagers: residents(raw) };
    raw.exchangeReceipts = Object.fromEntries(
      Object.entries(raw.exchangeReceipts ?? {}).map(([id, value]) => {
        const receipt = value as any,
          wish = receipt.sceneFacts?.wish;
        if (!wish || !Object.hasOwn(wish, "head")) return [id, receipt];
        const values = decodeWishHistorySync(
          wish.head,
          { seed: raw.seed, setupAt: raw.setupAt, actorId: wish.actorId },
          (id) => rows?.get(id)?.data ?? null,
        ).rows;
        return [
          id,
          {
            ...receipt,
            sceneFacts: {
              ...receipt.sceneFacts,
              wish: { actorId: wish.actorId, wishId: wish.wishId, value: values[0] ?? null },
            },
          },
        ];
      }),
    );
    if (raw.returnCatchup?.capture)
      raw.returnCatchup = {
        ...raw.returnCatchup,
        capture: {
          ...raw.returnCatchup.capture,
          world: { ...raw.returnCatchup.capture.world, villagers: residents(raw.returnCatchup.capture.world) },
        },
      };
  }
  const capture = raw?.returnCatchup?.capture;
  if (capture && Object.hasOwn(capture.world, "relationshipHead")) {
    const { relationshipHead, ...world } = capture.world;
    const body = relationshipHead ? rows!.get(relationshipHead.id)!.data : null;
    const relationshipContext = body
      ? decodeRelationshipPagesSync(JSON.parse(body.payload), body.world, (id) => rows!.get(id)?.data ?? null).value
      : undefined;
    raw = {
      ...raw,
      returnCatchup: { ...raw.returnCatchup, capture: { ...capture, world: { ...world, relationshipContext } } },
    };
  }
  if (!raw || !Object.hasOwn(raw, "memoryHead")) return coerceVillageState(raw);
  const root = raw.memoryHead ? rows!.get(raw.memoryHead.id).data : null;
  const payload = root
    ? decodeMemoryPagesSync(JSON.parse(root.payload), root.world, (id) => rows!.get(id)?.data ?? null).value
    : emptyMemoryPayload();
  return coerceVillageState({ ...raw, ...payload });
}
