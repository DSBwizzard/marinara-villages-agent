import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { createBackgroundContext } from "../packages/villages/src/server/adapters/operations/background-context-service.js";
import {
  backgroundResponseClaim,
  backgroundResponseOwners,
  backgroundResponseStore,
  createBackgroundResponses,
  nativeBackgroundJob,
  retainBackgroundJob,
  validateBackgroundResponse,
} from "../packages/villages/src/server/adapters/storage/background-responses.js";
import { createRepairGate, configureRepairGate } from "../packages/villages/src/server/adapters/storage/repair-gate.js";
import { createRepairSnapshots } from "../packages/villages/src/server/adapters/storage/repair-snapshot-store.js";
import {
  createRepairStorage,
  repairStorageId,
} from "../packages/villages/src/server/features/repair/repair-storage.js";
import {
  collectRetainedStorage,
  createRetainedStorageCleanup,
} from "../packages/villages/src/server/features/repair/retained-storage-cleanup.js";
import {
  backgroundRevision,
  backgroundSlotId,
} from "../packages/villages/src/server/domain/rules/background-revision.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { Job } from "../packages/villages/src/server/domain/models/background-model.js";
import { createBackgroundWork } from "../packages/villages/src/server/jobs/background-service.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import {
  BACKGROUND_COMPLETION_KIND,
  backgroundCompletionId,
} from "../packages/villages/src/server/adapters/storage/background-completions.js";

function storage() {
  const rows = new Map<string, any>();
  let failJob: "before" | "after" | undefined, failBody: "before" | "after" | undefined;
  let writes = 0,
    bodyReads = 0;
  const documents: CapabilityDocumentStore = {
    async getById(_pkg, id) {
      if (rows.get(id)?.kind === "generation-response") bodyReads++;
      return structuredClone(rows.get(id) ?? null);
    },
    async list(_pkg, kind) {
      return structuredClone([...rows.values()].filter((row) => row.kind === kind));
    },
    async create(input) {
      const failure = input.kind === "generation-response" ? failBody : undefined;
      if (failure) failBody = undefined;
      if (failure === "before") throw new Error("body unavailable before acknowledgement");
      if (rows.has(input.id)) throw new Error("duplicate immutable body");
      const row = { ...structuredClone(input), revision: 1 };
      rows.set(input.id, row);
      if (failure === "after") throw new Error("body acknowledgement lost");
      return structuredClone(row);
    },
    async update(input) {
      const failure = input.data?.steps?.some((step: any) => step.responseRef) ? failJob : undefined;
      if (failure) failJob = undefined;
      if (failure === "before") throw new Error("job acknowledgement lost before write");
      const old = rows.get(input.id);
      if (!old || old.revision !== input.expectedRevision) return null;
      writes += Buffer.byteLength(JSON.stringify(input));
      const row = { ...old, ...structuredClone(input), revision: old.revision + 1 };
      rows.set(input.id, row);
      if (failure === "after") throw new Error("job acknowledgement lost after write");
      return structuredClone(row);
    },
    async remove(_pkg, id, revision) {
      return rows.get(id)?.revision === revision && rows.delete(id);
    },
  };
  return {
    rows,
    documents,
    failJob: (value: typeof failJob) => {
      failJob = value;
    },
    failBody: (value: typeof failBody) => {
      failBody = value;
    },
    metrics: () => ({ writes, bodyReads }),
  };
}
const completion = {
  content: "Exact café 東京 “evidence” gallery:quoted-prose ".repeat(12_000),
  finishReason: "stop",
  usage: { totalTokens: 17 },
};
async function saveWorld(db: ReturnType<typeof storage>, world: ReturnType<typeof defaultVillageState>) {
  await createVillageRepository(() => db.documents).mutateAuthority((state) => {
    Object.assign(state, world);
  });
}
function saveClaim(documents: CapabilityDocumentStore, job: Job) {
  return documents.create({
    id: backgroundSlotId(job),
    packageId: "villages",
    kind: "background-work",
    name: "Claim",
    description: "",
    data: nativeBackgroundJob(job),
    createdAt: "2026-10-30T00:00:00.000Z",
    updatedAt: "2026-10-30T00:00:00.000Z",
  });
}
for (const failure of ["before", "after"] as const) {
  const db = storage(),
    context = createBackgroundContext();
  const world = defaultVillageState();
  world.seed = "background-evidence";
  world.villagers = [
    { characterId: "resident", cardSnapshot: { name: "Resident", capturedAt: "2026-10-30T00:00:00.000Z" }, wishes: [] },
  ] as any;
  await saveWorld(db, world);
  let calls = 0,
    applied = 0;
  const service = () =>
    createBackgroundWork({
      withCurrentJobWrite: (work) => work(),
      villagesDocuments: () => db.documents,
      villagesLogger: () => ({ debug() {}, debugOverride() {}, info() {}, warn() {}, error() {} }),
      readVillageState: async () => structuredClone(world),
      mutateVillageState: async (update) => {
        update(world);
        if (failure === "after") {
          const row = [...db.rows.values()].find((row) => row.kind === "background-work");
          row.data.optionalAttempts = { review: { status: "unknown", elapsedMs: 10 } };
          row.revision++;
        }
        await saveWorld(db, world);
        return world;
      },
      withUsagePurpose: (_purpose, work) => work(),
      measurePipeline: (_name, _tags, work) => work(),
      runtimeDebug() {},
      backgroundCalls: context.backgroundCalls,
      handlers: [
        [
          "agenda",
          {
            valid: () => true,
            async generate() {
              const complete = context.backgroundCalls.getStore()!;
              const reply = await complete(
                {
                  connectionId: "test",
                  model: "test",
                  async chatComplete() {
                    calls++;
                    const job = [...db.rows.values()].find((row) => row.kind === "background-work").data;
                    assert.ok(job.steps[0].responseClaim, "the physical request has an owner before purchase");
                    return completion;
                  },
                } as any,
                [{ role: "user", content: "exact request" }],
                100,
                { checkpointId: "reply" },
              );
              assert.equal(reply.content, completion.content);
              for (let index = 0; index < 30; index++) await complete.setting!("setting:" + index, () => index);
              return { done: true };
            },
            apply(_state, _input, result) {
              assert.deepEqual(result, { done: true });
              applied++;
            },
          },
        ],
      ],
    });
  let background = service(),
    stop = background.startBackgroundWork();
  db.failJob(failure);
  await background.queueBackgroundJob({
    kind: "agenda",
    subjectId: "resident",
    seed: world.seed,
    revision: "input",
    finite: true,
    label: "Request",
    input: {},
  });
  await background.settleBackgroundWork();
  assert.equal(applied, 0);
  assert.equal(calls, 1);
  stop();
  background = service();
  stop = background.startBackgroundWork();
  await background.recoverBackgroundWork();
  const saved = (await background.backgroundWorkSummaries())[0];
  assert.equal(calls, 1, "restart never dispatches a replacement request");
  await background.retryBackgroundJob(saved.id, saved.attempt, "deliberate-recovery", saved.instanceId);
  await background.settleBackgroundWork();
  assert.equal(applied, 1);
  assert.equal(calls, 1, "both lost job acknowledgements reuse the purchased reply");
  const retained = [...db.rows.values()].filter((row) => row.kind === "background-history");
  assert.equal(retained.length, failure === "after" ? 1 : 0, "settled successful work needs no extra attempt copy");
  if (failure === "after") {
    assert.equal(retained[0].data.optionalAttempts.review.status, "unknown");
    assert.deepEqual(retained[0].data.result, { done: true }, "optional uncertainty survives a valid World receipt");
  }
  assert.equal((await background.backgroundWorkSummaries())[0].tokens, 17, "receipt adoption counts known usage once");
  const bodies = [...db.rows.values()].filter((row) => row.kind === "generation-response");
  assert.equal(bodies.length, 1, "normal and recovered replies share one immutable body");
  assert.equal(validateBackgroundResponse(bodies[0]).response.content, completion.content);
  assert.ok(db.metrics().writes < 150_000, "thirty metadata checkpoints do not rewrite the large provider reply");
  await background.recoverBackgroundWork();
  assert.equal(applied, 1, "effect receipt prevents duplicate application");
  stop();
}

// Recreated slots and borrowed purchased replies retain separate physical identities.
{
  const db = storage(),
    store = createBackgroundResponses(db.documents);
  const original = {
    instanceId: randomUUID(),
    id: "same-logical-job",
    seed: "same-world",
    kind: "agenda",
    subjectId: "same-resident",
    attempt: 9,
    steps: [{ key: "answer", fingerprint: "same-input", status: "running" }],
  } as Job;
  original.steps[0].responseClaim = backgroundResponseClaim(original, 0);
  const current = { ...structuredClone(original), instanceId: randomUUID() };
  current.steps[0].responseClaim = backgroundResponseClaim(current, 0);
  assert.notEqual(current.steps[0].responseClaim.id, original.steps[0].responseClaim.id);
  await saveClaim(db.documents, original);
  await retainBackgroundJob(db.documents, nativeBackgroundJob(original));
  const slot = backgroundSlotId(current);
  await db.documents.update({
    id: slot,
    packageId: "villages",
    expectedRevision: 1,
    data: nativeBackgroundJob(current),
    updatedAt: "",
  });
  const oldReply = await store.publish(original, 0, { content: "Original paid reply", finishReason: "stop" });
  const newReply = await store.publish(current, 0, { content: "Replacement paid reply", finishReason: "stop" });
  assert.notEqual(oldReply.ref.id, newReply.ref.id);
  const borrowed = nativeBackgroundJob({
    ...current,
    attempt: 1,
    steps: [{ ...original.steps[0], status: "completed", responseRef: oldReply.ref }],
  });
  assert.equal(
    (await createBackgroundResponses(db.documents).decode(borrowed)).steps[0].response!.content,
    "Original paid reply",
  );
  const foreignPending = structuredClone(borrowed);
  foreignPending.steps[0].status = "running";
  delete foreignPending.steps[0].responseRef;
  assert.throws(() => backgroundResponseOwners(foreignPending), /claim changed/);
  const malformedBody = structuredClone(db.rows.get(oldReply.ref.id));
  malformedBody.data.instanceId = current.instanceId;
  assert.throws(() => validateBackgroundResponse(malformedBody));
}

const db = storage(),
  store = createBackgroundResponses(db.documents);
const job = {
  instanceId: randomUUID(),
  id: "logical-job",
  seed: "world",
  kind: "agenda",
  subjectId: "resident",
  attempt: 1,
  steps: [{ key: "answer", fingerprint: "exact-input", status: "running" }],
} as Job;
job.steps[0].responseClaim = backgroundResponseClaim(job, 0);
await saveClaim(db.documents, job);
db.failBody("after");
const saved = await store.publish(job, 0, completion);
job.steps[0] = { ...job.steps[0], status: "completed", response: saved.response, responseRef: saved.ref };
const native = nativeBackgroundJob(job);
assert.throws(
  () => nativeBackgroundJob({ ...job, automaticRetryUsed: false } as unknown as Job),
  /invalid automatic retry allowance/,
);
assert.equal(Object.hasOwn(native.steps[0], "response"), false);
assert.ok(JSON.stringify(native).length < 800);
const priorReads = db.metrics().bodyReads;
for (let index = 0; index < 40; index++)
  assert.equal((await store.decode(native)).steps[0].response!.content, completion.content);
assert.equal(db.metrics().bodyReads, priorReads, "warm metadata reads need no body I/O");
await assert.rejects(
  store.publish(job, 0, { ...completion, content: "different answer" }),
  /physical background response changed/,
);
assert.equal([...db.rows.values()].filter((row) => row.kind === "generation-response").length, 1);
const cold = createBackgroundResponses(db.documents);
assert.equal((await cold.decode(native)).steps[0].response!.content, completion.content);
for (const change of [
  (value: any) => {
    value.seed = "foreign";
  },
  (value: any) => {
    value.id = "foreign";
  },
  (value: any) => {
    value.steps[0].key = "foreign";
  },
  (value: any) => {
    value.steps[0].fingerprint = "foreign";
  },
  (value: any) => {
    value.steps[0].responseRef.digest = "f".repeat(64);
  },
  (value: any) => {
    value.steps[0].response = completion;
  },
  (value: any) => {
    value.responseStorage = 0;
  },
]) {
  const malformed = structuredClone(native);
  change(malformed);
  await assert.rejects(cold.decode(malformed));
}
for (const value of [null, false, 0, undefined]) {
  const malformed = structuredClone(native);
  malformed.steps[0].responseRef = value as any;
  assert.throws(() => backgroundResponseOwners(malformed));
}
const receipt = db.rows.get(saved.ref.id);
receipt.data.payload = receipt.data.payload.replace("Exact", "Altered");
await assert.rejects(createBackgroundResponses(db.documents).decode(native));
const prospective = structuredClone(job);
prospective.steps[0].status = "running";
delete prospective.steps[0].response;
delete prospective.steps[0].responseRef;
await assert.rejects(createBackgroundResponses(db.documents).pending(prospective, 0));
const corruptGate = createRepairGate(db.documents),
  corruptIds = [...db.rows.keys()];
await assert.rejects(collectRetainedStorage(corruptGate));
assert.deepEqual([...db.rows.keys()], corruptIds, "a corrupted background claim body holds cleanup before deletion");
corruptGate.dispose();

// Same physical IDs in independent backends must never share response caches or CAS writes.
{
  const a = storage(),
    b = storage();
  const work = {
    kind: "agenda" as const,
    subjectId: "resident",
    seed: "same",
    revision: "same",
    finite: true,
    label: "Same",
    input: {},
  };
  const logical = {
    instanceId: randomUUID(),
    ...work,
    finite: false,
    id: backgroundRevision([work.seed, work.kind, work.subjectId, work.revision]),
    attempt: 1,
    status: "completed",
    owner: "retained",
    steps: [{ key: "same", fingerprint: "same", status: "running" }],
  } as Job;
  logical.steps[0].responseClaim = backgroundResponseClaim(logical, 0);
  await saveClaim(a.documents, logical);
  await saveClaim(b.documents, logical);
  const first = await backgroundResponseStore(a.documents).publish(logical, 0, {
    content: "A private reply",
    finishReason: "stop",
  });
  const second = await backgroundResponseStore(b.documents).publish(logical, 0, {
    content: "B private reply",
    finishReason: "stop",
  });
  const slot = "villages-background-" + backgroundRevision([work.kind, work.subjectId]);
  const nativeA = nativeBackgroundJob({
    ...logical,
    steps: [{ ...logical.steps[0], status: "completed", responseRef: first.ref }],
  });
  const nativeB = nativeBackgroundJob({
    ...logical,
    steps: [{ ...logical.steps[0], status: "completed", responseRef: second.ref }],
  });
  for (const [target, data] of [
    [a, nativeA],
    [b, nativeB],
  ] as const)
    await target.documents.update({
      id: slot,
      packageId: "villages",
      expectedRevision: 1,
      data,
      updatedAt: "2026-10-30T00:00:00.000Z",
    });
  let selected = a.documents,
    flip = false;
  const getA = a.documents.getById;
  a.documents.getById = async (pkg, id) => {
    const row = await getA(pkg, id);
    if (flip && id === slot) selected = b.documents;
    return row;
  };
  const context = createBackgroundContext(),
    world = defaultVillageState();
  const background = createBackgroundWork({
    withCurrentJobWrite: (work) => work(),
    villagesDocuments: () => selected,
    villagesLogger: () => ({ debug() {}, debugOverride() {}, info() {}, warn() {}, error() {} }),
    readVillageState: async () => world,
    mutateVillageState: async () => world,
    withUsagePurpose: (_purpose, callback) => callback(),
    measurePipeline: (_name, _tags, callback) => callback(),
    runtimeDebug() {},
    backgroundCalls: context.backgroundCalls,
    handlers: [
      [
        "agenda",
        {
          valid: () => true,
          generate: async () => {
            throw new Error("No new provider work");
          },
          apply() {},
        },
      ],
    ],
  });
  const stop = background.startBackgroundWork();
  await background.recoverBackgroundWork();
  flip = true;
  assert.equal(
    (await background.backgroundJobSnapshot("agenda", "resident"))!.steps[0].response!.content,
    "A private reply",
  );
  selected = a.documents;
  await background.queueBackgroundJob(work);
  await background.settleBackgroundWork();
  assert.equal(a.rows.get(slot).data.finite, true);
  assert.equal(b.rows.get(slot).data.finite, false, "CAS remains on the backend captured before the getter switched");
  await assert.rejects(backgroundResponseStore(b.documents).decode(nativeA), /cached background response changed/);
  const metadataBackend = {
    ...a.documents,
    getById: async (_pkg: string, id: string) => {
      if (id.startsWith("villages-generation-response-")) throw new Error("Metadata preview must not read reply prose");
      return structuredClone(a.rows.get(id) ?? null);
    },
  };
  selected = metadataBackend;
  await background.previewBackgroundJobs();
  a.rows.get(slot).data.status = "failed";
  a.rows.get(slot).data.failedStep = 0;
  await background.previewBackgroundJobs();
  let parsed = 0;
  background.registerBackgroundHandler("agenda", {
    valid: () => true,
    generate: async () => {
      throw new Error("No paid work");
    },
    apply() {},
    recoverSavedResult(_input, steps) {
      parsed++;
      assert.equal(steps[0].response!.content, "A private reply");
      return { recovered: true };
    },
  });
  a.rows.get(slot).data.hasResult = true;
  await background.previewBackgroundJobs();
  assert.equal(parsed, 0, "an existing parsed result needs no response hydration");
  a.rows.get(slot).data.hasResult = false;
  let previewReads = 0;
  selected = {
    ...a.documents,
    getById: async (pkg, id) => {
      if (id.startsWith("villages-generation-response-")) previewReads++;
      return getA(pkg, id);
    },
  };
  assert.equal((await background.previewBackgroundJobs())[0].remainingRequests, 0);
  assert.equal(parsed, 1);
  assert.equal(previewReads, 1, "only an eligible parser loads the exact saved reply");
  selected = a.documents;
  flip = false;
  const actual = structuredClone(a.rows.get(slot)),
    priorWrites = a.metrics().writes;
  for (const corrupt of [
    (row: any) => {
      row.kind = "venue-visit";
    },
    (row: any) => {
      row.id = "foreign-slot";
    },
    (row: any) => {
      row.packageId = "foreign-package";
    },
    (row: any) => {
      row.data.subjectId = "another-resident";
    },
  ]) {
    const malformed = structuredClone(actual);
    corrupt(malformed);
    a.rows.set(slot, malformed);
    await assert.rejects(background.backgroundJobSnapshot("agenda", "resident"), /identity changed/);
    await assert.rejects(background.queueBackgroundJob(work), /identity changed/);
    assert.equal(a.metrics().writes, priorWrites, "foreign job identity is rejected before any write");
  }
  a.rows.set(slot, actual);
  stop();
}

// An available Undo owns the old job's reply even when the current job released it.
{
  const db = storage(),
    gate = createRepairGate(db.documents);
  const responses = createBackgroundResponses(gate.documents);
  const job = {
    instanceId: randomUUID(),
    id: "undo-job",
    seed: "undo-world",
    kind: "agenda",
    subjectId: "resident",
    attempt: 1,
    steps: [{ fingerprint: "input", status: "running" }],
  } as Job;
  job.steps[0].responseClaim = backgroundResponseClaim(job, 0);
  await saveClaim(gate.documents, job);
  const reply = await responses.publish(job, 0, { content: "Undo exact reply", finishReason: "stop" });
  const before = {
    id: "villages-background-" + backgroundRevision([job.kind, job.subjectId]),
    kind: "background-work",
    name: "Job",
    description: "",
    data: nativeBackgroundJob({ ...job, steps: [{ ...job.steps[0], status: "completed", responseRef: reply.ref }] }),
  };
  const after = { ...before, data: nativeBackgroundJob({ ...job, steps: [] }) };
  await gate.documents.update({
    ...after,
    packageId: "villages",
    expectedRevision: 1,
    updatedAt: "2026-10-30T00:00:00.000Z",
  });
  const repair = createRepairStorage(gate.documents, gate.documents);
  await repair.saveHistory(
    {
      id: "undo",
      seed: job.seed,
      setupAt: "2026-10-30T00:00:00.000Z",
      title: "Repair",
      at: "2026-10-30T00:00:00.000Z",
      changes: [],
      affected: [],
      undone: false,
      canUndo: true,
      guard: "guard",
      request: { recordId: "job", action: "retry", knowers: [] },
      undoWrites: [{ before, after }],
    } as any,
    [],
  );
  const header = (await gate.documents.getById("villages", repairStorageId("repair-history", "undo")))!;
  assert.equal((await repair.readHistory(header)).undoWrites![0].before!.data.steps[0].responseRef.id, reply.ref.id);
  await collectRetainedStorage(gate);
  assert.ok(db.rows.has(reply.ref.id));
  const orphan = await createRepairSnapshots(gate.documents).captureOne({
    id: "villages-background-" + backgroundRevision([job.kind, job.subjectId]),
    kind: "background-work",
    name: "Unused",
    description: "",
    data: nativeBackgroundJob({ ...job, steps: [] }),
  });
  db.rows.delete(reply.ref.id);
  await assert.rejects(repair.readHistory(header), /saved background response is missing/);
  await assert.rejects(collectRetainedStorage(gate), /saved background response is missing/);
  assert.ok(db.rows.has(orphan.body), "a missing owned reply holds cleanup before any deletion");
  gate.dispose();
}
// Replacing a slot cannot erase an uncertain attempt before its late reply arrives.
for (const failure of [
  "none",
  "history-before",
  "history-after",
  "job-before",
  "job-after",
  "cas-conflict",
  "reset",
] as const) {
  const db = storage(),
    gate = createRepairGate(db.documents),
    context = createBackgroundContext(),
    world = defaultVillageState();
  world.seed = "replacement-evidence";
  await saveWorld(db, world);
  let calls = 0;
  const background = createBackgroundWork({
    withCurrentJobWrite: (work) => work(),
    villagesDocuments: () => gate.documents,
    withRepairWork: (callback) => gate.work(callback),
    villagesLogger: () => ({ debug() {}, debugOverride() {}, info() {}, warn() {}, error() {} }),
    readVillageState: async () => world,
    mutateVillageState: async (update) => {
      update(world);
      return world;
    },
    withUsagePurpose: (_purpose, callback) => callback(),
    measurePipeline: (_name, _tags, callback) => callback(),
    runtimeDebug() {},
    backgroundCalls: context.backgroundCalls,
    handlers: [
      [
        "agenda",
        {
          valid: () => true,
          async generate(input) {
            return context.backgroundCalls.getStore()!(
              {
                model: "synthetic",
                connectionId: "synthetic",
                async chatComplete() {
                  calls++;
                  throw new Error("The provider outcome is unknown");
                },
              } as any,
              [{ role: "user", content: input.exact }],
              100,
              { checkpointId: "reply" },
            );
          },
          apply() {},
        },
      ],
    ],
  });
  const work = {
    kind: "agenda" as const,
    subjectId: "resident",
    seed: world.seed,
    revision: "first",
    finite: true,
    label: "Request",
    input: { exact: "Original private café 東京 evidence" },
  };
  const stop = background.startBackgroundWork();
  await background.queueBackgroundJob(work);
  await background.settleBackgroundWork();
  const old = (await background.backgroundJobSnapshot(work.kind, work.subjectId))!;
  assert.equal(calls, 1);
  assert.equal(old.steps[0].status, "running");
  const create = db.documents.create,
    update = db.documents.update;
  let historyStarted!: () => void, releaseHistory!: () => void;
  const started = new Promise<void>((resolve) => {
      historyStarted = resolve;
    }),
    released = new Promise<void>((resolve) => {
      releaseHistory = resolve;
    });
  let inject = true;
  db.documents.create = async (input) => {
    if (inject && input.kind === "background-history" && failure === "none") {
      inject = false;
      const row = await create(input);
      historyStarted();
      await released;
      return row;
    }
    if (inject && input.kind === "background-history" && failure.startsWith("history-")) {
      inject = false;
      if (failure === "history-after") await create(input);
      throw new Error("Retained attempt acknowledgement lost");
    }
    return create(input);
  };
  db.documents.update = async (input) => {
    if (inject && input.data?.revision === "second" && ["job-before", "job-after", "cas-conflict"].includes(failure)) {
      inject = false;
      if (failure === "cas-conflict") {
        const current = db.rows.get(input.id);
        current.data.optionalAttempts = {
          review: { status: "complete", elapsedMs: 10, result: "Exact optional result" },
        };
        current.revision++;
        return null;
      }
      if (failure === "job-after") await update(input);
      throw new Error("Current job acknowledgement lost");
    }
    return update(input);
  };
  if (failure === "reset") {
    world.seed = "replacement-after-reset";
    await saveWorld(db, world);
  }
  const replace = () =>
    background.queueBackgroundJob({
      ...work,
      seed: world.seed,
      revision: "second",
      finite: false,
      input: { exact: "New input" },
    });
  if (["history-before", "job-before", "job-after"].includes(failure)) {
    await assert.rejects(replace(), /acknowledgement lost/);
    const current = [...db.rows.values()].find((row) => row.kind === "background-work");
    assert.equal(current.data.id === old.id, failure !== "job-after", "the current slot changes only after protection");
  }
  if (failure === "none") {
    const admission = replace();
    await started;
    await assert.rejects(collectRetainedStorage(gate), /Other Village work is active/);
    releaseHistory();
    await admission;
  } else await replace();
  await background.settleBackgroundWork();
  assert.equal(calls, 1, "replacement automatic work remains paused without presence");
  const histories = [...db.rows.values()].filter((row) => row.kind === "background-history");
  if (failure === "reset") {
    assert.equal(histories.length, 0, "explicit Reset does not establish a new owner for prior-world private work");
    stop();
    gate.dispose();
    continue;
  }
  assert.equal(
    histories.length,
    failure === "cas-conflict" ? 2 : 1,
    "each exact before-image keeps an immutable owner",
  );
  if (failure === "cas-conflict")
    assert.ok(histories.some((row) => row.data.optionalAttempts?.review.result === "Exact optional result"));
  assert.deepEqual(histories[0].data.input, work.input);
  assert.equal(histories[0].data.steps[0].responseClaim.id, old.steps[0].responseClaim!.id);
  const late = await createBackgroundResponses(gate.documents).publish(old, 0, {
    content: "Purchased late café 東京 reply",
    finishReason: "stop",
  });
  await collectRetainedStorage(gate);
  const cold = createBackgroundResponses(gate.documents);
  assert.equal((await cold.pending(histories[0].data, 0))!.response.content, "Purchased late café 東京 reply");
  assert.ok(db.rows.has(late.ref.id));
  if (failure === "none") {
    const original = histories[0],
      ids = [...db.rows.keys()];
    db.rows.set(original.id, { ...original, data: { ...original.data, input: { exact: "Changed evidence" } } });
    await assert.rejects(collectRetainedStorage(gate), /background job record identity changed/);
    assert.deepEqual([...db.rows.keys()], ids, "invalid retained ownership holds cleanup before deletion");
    db.rows.set(original.id, original);
  }
  stop();
  gate.dispose();
}
// The durable claim check and body publication share one admission; retired callbacks cannot recreate bodies.
{
  const db = storage();
  const job = {
    instanceId: randomUUID(),
    id: "fenced-job",
    seed: "fenced-world",
    kind: "agenda",
    subjectId: "resident",
    attempt: 1,
    steps: [{ fingerprint: "fenced-input", status: "running" }],
  } as Job;
  job.steps[0].responseClaim = backgroundResponseClaim(job, 0);
  const slot = backgroundSlotId(job),
    get = db.documents.getById,
    list = db.documents.list;
  let hold = false,
    lists = 0,
    entered!: () => void,
    release!: () => void;
  const reading = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const resume = new Promise<void>((resolve) => {
    release = resolve;
  });
  db.documents.getById = async (pkg, id) => {
    const row = await get(pkg, id);
    if (hold && id === slot) {
      entered();
      await resume;
    }
    return row;
  };
  db.documents.list = async (pkg, kind) => {
    lists++;
    return list(pkg, kind);
  };
  const gate = createRepairGate(db.documents),
    unbind = configureRepairGate(gate);
  try {
    await saveClaim(gate.documents, job);
    const responses = createBackgroundResponses(gate.documents);
    hold = true;
    const publishing = responses.publish(job, 0, { content: "Exact late café 東京 reply", finishReason: "stop" });
    await reading;
    await assert.rejects(collectRetainedStorage(gate), /Other Village work is active/);
    hold = false;
    release();
    const saved = await publishing;
    assert.equal(lists, 0, "ordinary publication reads its current slot without scanning retained history");
    assert.equal(
      (await createBackgroundResponses(gate.documents).pending(job, 0))!.response.content,
      "Exact late café 東京 reply",
    );
    const completed = db.rows.get(slot);
    completed.data = nativeBackgroundJob({
      ...job,
      steps: [{ ...job.steps[0], status: "completed", responseRef: saved.ref }],
    });
    completed.revision++;
    db.rows.delete(saved.ref.id);
    await assert.rejects(
      responses.publish(job, 0, { content: "A different physical reply", finishReason: "stop" }),
      /physical background response changed/,
    );
    assert.equal(db.rows.has(saved.ref.id), false, "a completed owner's digest is enforced before recreating any body");
    await responses.publish(job, 0, { content: "Exact late café 東京 reply", finishReason: "stop" });
    await collectRetainedStorage(gate);
    assert.ok(db.rows.has(saved.ref.id), "a completed current reference protects its exact body");
    const current = db.rows.get(slot);
    await gate.documents.remove("villages", slot, current.revision);
    await collectRetainedStorage(gate);
    assert.equal(db.rows.has(saved.ref.id), false, "an unowned body can retire");
    const before = [...db.rows.keys()];
    await assert.rejects(
      responses.publish(job, 0, { content: "Exact late café 東京 reply", finishReason: "stop" }),
      /claim is no longer retained/,
    );
    assert.deepEqual([...db.rows.keys()], before, "a warm callback cannot recreate a retired body");
    await saveClaim(gate.documents, { ...job, attempt: 2, steps: [] });
    await assert.rejects(
      createBackgroundResponses(gate.documents).publish(job, 0, completion),
      /claim is no longer retained/,
    );
    assert.equal(db.rows.has(saved.ref.id), false, "a newer attempt does not own the old physical request");
  } finally {
    release();
    unbind();
    gate.dispose();
  }
}
// Response allocation alone schedules cleanup during a running session, without another history writer or restart.
{
  const db = storage(),
    list = db.documents.list;
  let passes = 0;
  db.documents.list = async (pkg, kind) => {
    if (kind === "repair-snapshot") passes++;
    return list(pkg, kind);
  };
  const gate = createRepairGate(db.documents),
    unbind = configureRepairGate(gate),
    failures: unknown[] = [];
  const cleanup = createRetainedStorageCleanup(gate, (error) => failures.push(error));
  const unsubscribe = gate.whenIdle(() => {
    void cleanup.request();
  });
  try {
    await cleanup.request();
    assert.equal(passes, 1);
    for (let attempt = 1; attempt <= 4; attempt++) {
      await gate.work(async () => {
        const job = {
          instanceId: randomUUID(),
          id: "allocation-job-" + attempt,
          seed: "allocation-world",
          kind: "agenda",
          subjectId: "resident",
          attempt,
          steps: [{ fingerprint: "allocation-input-" + attempt, status: "running" }],
        } as Job;
        job.steps[0].responseClaim = backgroundResponseClaim(job, 0);
        const owner = await saveClaim(gate.documents, job);
        await createBackgroundResponses(gate.documents).publish(job, 0, {
          content: "x".repeat(2 * 1024 * 1024),
          finishReason: "stop",
        });
        await gate.documents.remove("villages", owner.id, owner.revision);
      });
      await cleanup.request();
      assert.equal(passes, attempt + 1, "released provider bytes trigger the existing allocation-driven sweep");
      assert.equal([...db.rows.values()].filter((row) => row.kind === "generation-response").length, 0);
    }
    assert.deepEqual(failures, []);
  } finally {
    unsubscribe();
    cleanup.dispose();
    unbind();
    gate.dispose();
  }
}
// A durable application proof closes only fully known history, independently of Undo and uncertain siblings.
for (const mode of ["closed-before", "closed-after", "uncertain", "undo"]) {
  const undo = mode === "undo",
    uncertain = mode === "uncertain";
  const db = storage(),
    gate = createRepairGate(db.documents),
    unbind = configureRepairGate(gate);
  const repo = createVillageRepository(() => gate.documents),
    at = "2026-10-31T00:00:00.000Z";
  const job = {
    instanceId: randomUUID(),
    id: "closed-logical-job",
    seed: "closure-retirement-" + mode,
    kind: "agenda",
    subjectId: "resident",
    revision: "closed-input",
    finite: true,
    label: "Closed",
    input: {},
    status: "failed",
    owner: "prior-owner",
    attempt: 1,
    steps: [{ fingerprint: "purchased-input", status: "running" }],
    settings: {},
    hasResult: false,
    requests: 1,
    tokens: 17,
    error: "",
    failedStep: null,
    retryActions: [],
    retrying: false,
    connectionId: "test",
    highWaterDate: "",
    connectionPaused: false,
    completedCount: 0,
    usageComplete: true,
  } as Job;
  const slot = backgroundSlotId(job),
    proofId = backgroundCompletionId({ format: 1, seed: job.seed, slotId: slot, jobId: job.id });
  try {
    await repo.mutateAuthority((state) => {
      state.seed = job.seed;
      state.setupAt = at;
      state.backgroundReceipts = { [slot]: job.id };
    });
    job.steps[0].responseClaim = backgroundResponseClaim(job, 0);
    await saveClaim(gate.documents, job);
    const saved = await createBackgroundResponses(gate.documents).publish(job, 0, completion);
    const known = { ...job, steps: [{ ...job.steps[0], status: "completed" as const, responseRef: saved.ref }] };
    await retainBackgroundJob(gate.documents, nativeBackgroundJob(known));
    const history = [...db.rows.values()].find((row) => row.kind === "background-history")!;
    const repair = createRepairStorage(gate.documents, gate.documents);
    const saveUndo = (id: string, writes: any[] = []) =>
      repair.saveHistory(
        {
          id,
          seed: job.seed,
          setupAt: at,
          title: "Repair",
          at,
          changes: [],
          affected: [],
          undone: false,
          canUndo: true,
          guard: "guard",
          request: { recordId: "job", action: "retry", knowers: [] },
          undoWrites: writes,
        } as any,
        [],
      );
    if (undo)
      await saveUndo("held-closure", [
        {
          before: {
            id: history.id,
            kind: history.kind,
            name: history.name,
            description: history.description,
            data: history.data,
          },
          after: null,
        },
      ]);
    else if (uncertain) {
      await retainBackgroundJob(
        gate.documents,
        nativeBackgroundJob({
          ...job,
          attempt: 2,
          status: "interrupted",
          steps: [],
          optionalAttempts: { review: { status: "unknown", elapsedMs: 10 } },
          usageComplete: false,
        }),
      );
      const pending: Job = {
        ...job,
        attempt: 3,
        status: "interrupted",
        steps: [{ fingerprint: "late-unknown", status: "running" }],
      };
      pending.steps[0].responseClaim = backgroundResponseClaim(pending, 0);
      await retainBackgroundJob(gate.documents, nativeBackgroundJob(pending));
      await createBackgroundResponses(gate.documents).publish(pending, 0, {
        content: "Known late bytes, still unreconciled usage",
        finishReason: "stop",
      });
    }
    const current = db.rows.get(slot);
    await gate.documents.update({
      id: slot,
      packageId: "villages",
      expectedRevision: current.revision,
      data: nativeBackgroundJob({ ...job, id: "newer-job", status: "completed", steps: [], input: null }),
      updatedAt: at,
    });
    await repo.mutateAuthority((state) => {
      state.backgroundReceipts[slot] = "newer-job";
    });
    assert.ok(db.rows.has(proofId), "receipt replacement preserves the old durable acknowledgement");
    if (mode === "closed-before") {
      const newer = db.rows.get(slot);
      await gate.documents.update({
        id: slot,
        packageId: "villages",
        expectedRevision: newer.revision,
        data: nativeBackgroundJob({ ...job, steps: [] }),
        updatedAt: at,
      });
      let generated = 0,
        applied = 0;
      const bg = createBackgroundWork({
        withCurrentJobWrite: (work) => work(),
        villagesDocuments: () => gate.documents,
        villagesLogger: () => ({ debug() {}, debugOverride() {}, info() {}, warn() {}, error() {} }),
        readVillageState: () => repo.readAuthority(),
        readVillageAuthority: () => repo.readAuthority(),
        mutateVillageState: (update) => repo.mutateAuthority(update),
        withUsagePurpose: (_purpose, work) => work(),
        measurePipeline: (_name, _tags, work) => work(),
        runtimeDebug() {},
        backgroundCalls: createBackgroundContext().backgroundCalls,
        withRepairWork: (work) => gate.work(work),
        handlers: [
          [
            "agenda",
            {
              authority: "raw",
              valid: () => true,
              async generate() {
                generated++;
                throw Error("An applied job must not purchase work");
              },
              apply() {
                applied++;
              },
            },
          ],
        ],
      });
      const stop = bg.startBackgroundWork();
      try {
        await bg.retryBackgroundJob(slot, job.attempt, "closure-replay-test", job.instanceId);
        await bg.settleBackgroundWork();
        assert.equal(generated, 0, "archived acknowledgement prevents another provider purchase");
        assert.equal(applied, 0, "archived acknowledgement rejects duplicate effects after the World slot advances");
        assert.equal(db.rows.get(slot).data.status, "completed");
      } finally {
        stop();
      }
      const restored = db.rows.get(slot);
      await gate.documents.update({
        id: slot,
        packageId: "villages",
        expectedRevision: restored.revision,
        data: newer.data,
        updatedAt: at,
      });
    }
    if (mode.startsWith("closed-")) {
      const remove = db.documents.remove;
      let interrupt = true;
      db.documents.remove = async (pkg, id, revision) => {
        if (id === history.id && interrupt) {
          interrupt = false;
          if (mode === "closed-after") await remove(pkg, id, revision);
          throw Error("Interrupted historical retirement");
        }
        return remove(pkg, id, revision);
      };
      await assert.rejects(collectRetainedStorage(gate), /Interrupted historical retirement/);
      assert.ok(db.rows.has(saved.ref.id), "interrupted owner retirement cannot delete its body first");
      assert.ok(db.rows.has(proofId), "completion proof retires after historical roots and bodies");
    }
    await collectRetainedStorage(gate);
    assert.equal(db.rows.has(history.id), undo, "only an available Undo keeps the closed physical history root");
    assert.equal(db.rows.has(saved.ref.id), undo, "copied Undo dependencies remain independently owned");
    assert.equal(
      db.rows.has(proofId),
      undo || uncertain,
      "only ongoing Undo or unreconciled siblings retain the closure proof",
    );
    if (undo) {
      for (let index = 0; index < 10; index++) await saveUndo("newer-undo-" + index);
      await collectRetainedStorage(gate);
      assert.equal(db.rows.has(history.id), false);
      assert.equal(db.rows.has(saved.ref.id), false);
      assert.equal([...db.rows.values()].filter((row) => row.kind === "repair-undo").length, 10);
    } else if (uncertain) {
      const held = [...db.rows.values()].filter((row) => row.kind === "background-history");
      assert.equal(held.length, 2, "unknown optional work and a late principal response are not compacted as settled");
      assert.ok(held.some((row) => row.data.optionalAttempts?.review.status === "unknown"));
      assert.ok(
        [...db.rows.values()].some((row) => row.kind === "generation-response"),
        "unreconciled late response remains available",
      );
      for (const row of held) await gate.documents.remove("villages", row.id, row.revision);
      await collectRetainedStorage(gate);
    }
    assert.equal(db.rows.has(proofId), false, "proof retires only after its last recovery or Undo owner ends");
    assert.equal([...db.rows.values()].filter((row) => row.kind === BACKGROUND_COMPLETION_KIND).length, 0);
  } finally {
    unbind();
    gate.dispose();
  }
}
console.log(
  "Background responses: exact bodies, bounded metadata writes, lost acknowledgements, restart/reuse, ownership and usage passed.",
);
