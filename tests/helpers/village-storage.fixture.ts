import assert from "node:assert/strict";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { Job } from "../../packages/villages/src/server/domain/models/background-model.js";
import { coerceVillageState } from "../../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  memoryDigest,
  readMemoryHead,
  assertMemoryWorld,
  emptyMemoryPayload,
} from "../../packages/villages/src/server/adapters/storage/memory-payload-store.js";
import {
  encodeContinuityPages,
  decodeContinuityPagesSync,
} from "../../packages/villages/src/server/adapters/storage/continuity-pages.js";
import { MEMORY_PAGE_KIND } from "../../packages/villages/src/server/adapters/storage/memory-pages.js";
import {
  SCENE_STORAGE_FORMAT,
  readSceneHistoryRoot,
} from "../../packages/villages/src/server/adapters/storage/scene-history.js";
import { encodeScenePublicHistory } from "../../packages/villages/src/server/adapters/storage/scene-public-history.js";
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
  encodeOperationEvidence,
  decodeOperationEvidenceSync,
  validateOperationEvidence,
  OPERATION_EVIDENCE_KIND,
  prepareOperationValue,
  operationEvidenceValue,
  operationResponsePrefix,
} from "../../packages/villages/src/server/adapters/storage/operation-evidence.js";
import {
  backgroundResponseClaim,
  nativeBackgroundJob,
  prepareBackgroundResponse,
} from "../../packages/villages/src/server/adapters/storage/background-responses.js";

type Rows = Map<string, any>;
const histories = ["continuity", "episodes", "worldPlaces", "mailbox"] as const;
const worldKey = (state: { seed: string; setupAt: string }) =>
  memoryDigest(JSON.stringify([state.seed, state.setupAt])).slice(0, 32);
function save(rows: Rows, id: string, kind: string, data: unknown, at = "") {
  const row = {
    id,
    packageId: "villages",
    kind,
    revision: 1,
    data: structuredClone(data),
    name: "Fixture evidence",
    description: "",
    createdAt: at,
    updatedAt: at,
  };
  if (rows.has(id)) assert.deepEqual(rows.get(id).data, data, "fixture evidence identity was reused");
  else rows.set(id, row);
}
function page(rows: Rows | undefined, id: string) {
  const row = rows?.get(id);
  assert(
    row && row.id === id && row.packageId === "villages" && row.kind === MEMORY_PAGE_KIND && row.revision === 1,
    "missing or changed fixture history page",
  );
  return row.data;
}

/** Fresh logical authority is authored with the production encoders, never converted from an old format. */
export function authorVillageFixture(rows: Rows, raw: any) {
  assert.equal(raw?.version, 18, "fixture must author a fresh Village");
  if (Object.hasOwn(raw, "memoryHead")) return raw;
  const state = coerceVillageState(raw),
    value = Object.fromEntries(histories.map((key) => [key, state[key]])) as ReturnType<typeof emptyMemoryPayload>;
  const revision =
    value.continuity.revision + value.episodes.revision + value.worldPlaces.revision + value.mailbox.revision;
  let memoryHead = null;
  if (revision) {
    const world = worldKey(state),
      encoded = encodeContinuityPages(value, world),
      payload = JSON.stringify(encoded.manifest),
      digest = memoryDigest(payload);
    for (const [id, data] of encoded.pages) save(rows, id, MEMORY_PAGE_KIND, data, state.setupAt);
    const h = digest.slice(0, 32),
      uuid = [h.slice(0, 8), h.slice(8, 12), h.slice(12, 16), h.slice(16, 20), h.slice(20)].join("-");
    memoryHead = { id: "villages-memory-" + world + "-" + uuid, digest, revision };
    save(rows, memoryHead.id, "memory-payload", { format: 3, world, payload }, state.setupAt);
  } else assert.deepEqual(value, emptyMemoryPayload(), "zero-revision fixture cannot conceal retained history");
  return {
    ...Object.fromEntries(Object.entries(state).filter(([key]) => !histories.includes(key as never))),
    memoryHead,
  };
}

export function authorBackgroundFixture(rows: Rows, raw: unknown) {
  const job = structuredClone(raw) as Job & { responseStorage?: number };
  if (job && Object.hasOwn(job, "responseStorage")) return raw;
  assert(job && Array.isArray(job.steps), "fixture must author a logical background job");
  for (const [index, step] of job.steps.entries()) {
    if (!Object.hasOwn(step, "responseClaim")) step.responseClaim = backgroundResponseClaim(job, index);
    if (!step.response) continue;
    const saved = prepareBackgroundResponse(job, index, step.response);
    if (Object.hasOwn(step, "responseRef"))
      assert.deepEqual(step.responseRef, saved.ref, "fixture response ownership changed");
    step.responseRef = saved.ref;
    save(rows, saved.ref.id, "generation-response", saved.data);
  }
  return nativeBackgroundJob(job);
}

export function authorSceneFixture(rows: Rows, raw: any, world?: { seed?: string; setupAt?: string }): any {
  assert.equal(raw?.version, 5, "fixture must author a fresh Scene");
  if (Object.hasOwn(raw, "storageFormat")) return raw;
  if (world) assert.equal(raw.villageSeed, world.seed, "fixture Scene belongs to another Village");
  assert(
    !raw.operation || !Object.hasOwn(raw.operation, "evidenceFormat"),
    "fixture cannot re-author stored operation evidence",
  );
  const scene = coerceSession(structuredClone(raw));
  const transcript = encodeSceneTranscript(scene.lines, scene),
    submissions = encodeSceneSubmissions(scene.submissions, scene);
  const publicHistory = encodeScenePublicHistory(scene, transcript.head, submissions.head);
  for (const [id, data] of [...transcript.pages, ...submissions.pages, ...publicHistory.pages])
    save(rows, id, MEMORY_PAGE_KIND, data, scene.startedAt);
  const { lines: _lines, submissions: _submissions, heardHistory: _heard, ...facts } = scene;
  if (facts.operation?.snapshot) facts.operation.snapshot = authorSceneFixture(rows, facts.operation.snapshot, world);
  for (const operation of [facts.operation]) {
    if (!operation) continue;
    for (const [stage, attempt] of Object.entries(operation.attempts)) {
      if (!Object.hasOwn(attempt, "result") || Object.hasOwn(attempt, "response")) continue;
      const claim =
        operationResponsePrefix(operation, scene, stage) + memoryDigest(JSON.stringify(attempt.result)).slice(0, 32);
      const saved = prepareOperationValue(attempt.result, scene, claim);
      attempt.response = { ...saved.ref, claim };
      save(rows, saved.ref.id, OPERATION_EVIDENCE_KIND, saved.data);
    }
  }
  const evidence = encodeOperationEvidence(facts.operation, scene);
  for (const [id, data] of evidence.values) save(rows, id, OPERATION_EVIDENCE_KIND, data);
  const result = {
    ...facts,
    operation: evidence.operation,
    storageFormat: SCENE_STORAGE_FORMAT,
    transcript: transcript.head,
    submissionHistory: submissions.head,
    publicHistory: publicHistory.head,
  };
  readSceneHistoryRoot(result);
  return result;
}

const wrappers = new WeakMap<CapabilityDocumentStore, CapabilityDocumentStore>(),
  wrapped = new WeakSet<CapabilityDocumentStore>();
function createFixtureDocuments(store: CapabilityDocumentStore, virtual: Rows) {
  function author(row: any) {
    if (!row) return row;
    const raw = row.data;
    let data = raw;
    if (row.kind === "village" && raw?.version === 18 && !Object.hasOwn(raw, "memoryHead"))
      data = authorVillageFixture(virtual, raw);
    if (row.kind === "venue-visit" && raw?.version === 5 && !Object.hasOwn(raw, "storageFormat"))
      data = authorSceneFixture(virtual, raw);
    if (["background-work", "background-history"].includes(row.kind) && raw?.responseStorage === undefined)
      data = authorBackgroundFixture(virtual, raw);
    return { ...row, data };
  }
  async function flush() {
    for (const [id, row] of virtual) {
      const existing = await store.getById("villages", id);
      if (existing) {
        assert.equal(existing.packageId, row.packageId);
        assert.equal(existing.kind, row.kind);
        assert.equal(existing.revision, 1);
        assert.deepEqual(existing.data, row.data, "fixture cannot repair changed persisted evidence");
      } else await store.create(row);
      virtual.delete(id);
    }
  }
  const documents: CapabilityDocumentStore = {
    ...store,
    async getById(pkg, id) {
      const physical = await store.getById(pkg, id);
      return physical ? author(physical) : structuredClone(virtual.get(id) ?? null);
    },
    async list(pkg, kind) {
      return (await store.list(pkg, kind)).map(author);
    },
    async create(input) {
      await flush();
      return store.create(input);
    },
    async update(input) {
      await flush();
      return store.update(input);
    },
    async remove(pkg, id, revision) {
      virtual.delete(id);
      return store.remove(pkg, id, revision);
    },
  };
  return { documents, flush, author };
}
/** Only fresh logical fixtures are authored; invalid stored bytes reach the production validators unchanged. */
export function villageFixtureDocuments(store: CapabilityDocumentStore): CapabilityDocumentStore {
  if (wrapped.has(store)) return store;
  const existing = wrappers.get(store);
  if (existing) return existing;
  const { documents } = createFixtureDocuments(store, new Map());
  wrappers.set(store, documents);
  wrapped.add(documents);
  return documents;
}
export async function seedVillageFixtureDocuments(store: CapabilityDocumentStore): Promise<void> {
  const fixture = createFixtureDocuments(store, new Map());
  const root = await store.getById("villages", "villages-village");
  const rows = [...(root ? [root] : [])];
  for (const kind of ["venue-visit", "background-work", "background-history"])
    rows.push(...(await store.list("villages", kind)));
  const authored = rows.flatMap((row) => {
    const next = fixture.author(row);
    return next.data === row.data ? [] : [next];
  });
  await fixture.flush();
  for (const row of authored)
    assert(
      await store.update({ id: row.id, packageId: "villages", expectedRevision: row.revision, data: row.data }),
      "fixture seed revision conflict",
    );
}

export function fixtureVillageState(raw: any, rows?: Rows) {
  if (!raw || !Object.hasOwn(raw, "memoryHead")) return coerceVillageState(raw);
  const head = readMemoryHead(raw.memoryHead);
  let value = emptyMemoryPayload();
  if (head) {
    assertMemoryWorld(head, raw);
    const row = rows?.get(head.id);
    assert(
      row && row.id === head.id && row.kind === "memory-payload" && row.packageId === "villages" && row.revision === 1,
      "missing fixture continuity owner",
    );
    assert.equal(row.data.format, 3);
    assert.equal(row.data.world, worldKey(raw));
    assert.equal(memoryDigest(row.data.payload), head.digest);
    value = decodeContinuityPagesSync(JSON.parse(row.data.payload), row.data.world, raw.seed, (id) =>
      page(rows, id),
    ).value;
    assert.equal(
      value.continuity.revision + value.episodes.revision + value.worldPlaces.revision + value.mailbox.revision,
      head.revision,
    );
  }
  const { memoryHead: _head, ...facts } = raw;
  return coerceVillageState({ ...facts, ...value });
}
export function storedVillage(rows: Rows) {
  return fixtureVillageState(rows.get("villages-village")?.data, rows);
}
export function fixtureSceneState(raw: any, rows: Rows) {
  if (!raw || !Object.hasOwn(raw, "storageFormat")) return coerceSession(raw);
  readSceneHistoryRoot(raw);
  const { storageFormat: _format, transcript, submissionHistory, publicHistory: _publicHistory, ...scene } = raw;
  scene.lines = decodeSceneTranscriptSync(readSceneTranscriptHead(transcript, raw), (id) => page(rows, id)).lines;
  scene.submissions = decodeSceneSubmissionsSync(readSceneSubmissionHead(submissionHistory, raw), (id) =>
    page(rows, id),
  ).submissions;
  scene.operation = decodeOperationEvidenceSync(raw.operation, raw, (ref) => {
    const row = rows.get(ref.id);
    assert(row, "missing fixture operation evidence");
    return operationEvidenceValue(validateOperationEvidence(row, raw, ref).data);
  });
  return coerceSession(scene);
}
export function editFixtureScene(
  record: { data: any },
  rows: Rows,
  mutate: (scene: ReturnType<typeof coerceSession>) => void,
) {
  const scene = fixtureSceneState(record.data, rows);
  mutate(scene);
  record.data = authorSceneFixture(rows, scene);
}
