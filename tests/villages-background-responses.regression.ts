import assert from "node:assert/strict";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { createBackgroundContext } from "../packages/villages/src/server/adapters/operations/background-context-service.js";
import {
  backgroundResponseClaim,
  backgroundResponseOwners,
  backgroundResponseStore,
  createBackgroundResponses,
  nativeBackgroundJob,
  validateBackgroundResponse,
} from "../packages/villages/src/server/adapters/storage/background-responses.js";
import { createRepairGate } from "../packages/villages/src/server/adapters/storage/repair-gate.js";
import { createRepairSnapshots } from "../packages/villages/src/server/adapters/storage/repair-snapshot-store.js";
import {
  createRepairStorage,
  repairStorageId,
} from "../packages/villages/src/server/features/repair/repair-storage.js";
import { collectRetainedStorage } from "../packages/villages/src/server/features/repair/retained-storage-cleanup.js";
import { backgroundRevision } from "../packages/villages/src/server/domain/rules/background-revision.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { Job } from "../packages/villages/src/server/domain/models/background-model.js";
import { createBackgroundWork } from "../packages/villages/src/server/jobs/background-service.js";

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
for (const failure of ["before", "after"] as const) {
  const db = storage(),
    context = createBackgroundContext();
  const world = defaultVillageState();
  world.seed = "background-evidence";
  world.villagers = [{ characterId: "resident", cardSnapshot: { name: "Resident" } }] as any;
  let calls = 0,
    applied = 0;
  const service = () =>
    createBackgroundWork({
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
  await background.retryBackgroundJob(saved.id, saved.attempt, "deliberate-recovery");
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

const db = storage(),
  store = createBackgroundResponses(db.documents);
const job = {
  id: "logical-job",
  seed: "world",
  attempt: 1,
  steps: [{ key: "answer", fingerprint: "exact-input", status: "running" }],
} as Job;
job.steps[0].responseClaim = backgroundResponseClaim(job, 0);
db.failBody("after");
const saved = await store.publish(job, 0, completion);
job.steps[0] = { ...job.steps[0], status: "completed", response: saved.response, responseRef: saved.ref };
const native = nativeBackgroundJob(job);
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
assert.equal(db.rows.size, 1);
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
    ...work,
    finite: false,
    id: backgroundRevision([work.seed, work.kind, work.subjectId, work.revision]),
    attempt: 1,
    status: "completed",
    owner: "retained",
    steps: [{ key: "same", fingerprint: "same", status: "running" }],
  } as Job;
  logical.steps[0].responseClaim = backgroundResponseClaim(logical, 0);
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
    await target.documents.create({
      id: slot,
      packageId: "villages",
      kind: "background-work",
      name: "Same",
      description: "",
      data,
      createdAt: "2026-10-30T00:00:00.000Z",
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
    id: "undo-job",
    seed: "undo-world",
    kind: "agenda",
    subjectId: "resident",
    attempt: 1,
    steps: [{ fingerprint: "input", status: "running" }],
  } as Job;
  job.steps[0].responseClaim = backgroundResponseClaim(job, 0);
  const reply = await responses.publish(job, 0, { content: "Undo exact reply", finishReason: "stop" });
  const before = {
    id: "villages-background-" + backgroundRevision([job.kind, job.subjectId]),
    kind: "background-work",
    name: "Job",
    description: "",
    data: nativeBackgroundJob({ ...job, steps: [{ ...job.steps[0], status: "completed", responseRef: reply.ref }] }),
  };
  const after = { ...before, data: nativeBackgroundJob({ ...job, steps: [] }) };
  await gate.documents.create({
    ...after,
    packageId: "villages",
    createdAt: "2026-10-30T00:00:00.000Z",
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
  let calls = 0;
  const background = createBackgroundWork({
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
  if (failure === "reset") world.seed = "replacement-after-reset";
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
console.log(
  "Background responses: exact bodies, bounded metadata writes, lost acknowledgements, restart/reuse, ownership and usage passed.",
);
