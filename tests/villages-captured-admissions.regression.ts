// Test cases: captured-admissions/roles, captured-admissions/release, captured-admissions/job-lock, captured-admissions/reset, captured-admissions/scale, captured-admissions/cleanup
import assert from "node:assert/strict";
import { AsyncResource } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { runCase } from "../scripts/test-cases.mjs";
import { createBackgroundContext } from "../packages/villages/src/server/adapters/operations/background-context-service.js";
import {
  assertCapturedJob,
  readCapturedInput,
} from "../packages/villages/src/server/adapters/storage/captured-admissions.js";
import {
  nativeBackgroundJob,
  validateBackgroundJobRecord,
} from "../packages/villages/src/server/adapters/storage/background-responses.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { BackgroundInput, Job } from "../packages/villages/src/server/domain/models/background-model.js";
import type { VillageState } from "../packages/villages/src/server/domain/models/world.js";
import {
  backgroundRevision,
  backgroundSlotId,
} from "../packages/villages/src/server/domain/rules/background-revision.js";
import { captureContinuityContext } from "../packages/villages/src/server/domain/rules/continuity-context.js";
import { continuityMemoryLibrary } from "../packages/villages/src/server/domain/rules/continuity-library.js";
import { admitNarrative, ensureNarrative } from "../packages/villages/src/server/domain/rules/narrative-development.js";
import { assertResidentNarrationCurrent } from "../packages/villages/src/server/domain/rules/resident-narration.js";
import { captureReturnContext } from "../packages/villages/src/server/domain/rules/return-catchup-capture.js";
import { returnCaptureRevision } from "../packages/villages/src/server/domain/rules/return-capture-revision.js";
import { collectRetainedStorage } from "../packages/villages/src/server/features/repair/retained-storage-cleanup.js";
import { createVillageStateService } from "../packages/villages/src/server/features/world/village-state-service.js";
import { createBackgroundWork } from "../packages/villages/src/server/jobs/background-service.js";
import { residentPlanningInput } from "./fixtures/resident-planning.fixture.js";
import { nativeHistoryFixture, retainAuthoredNote } from "./helpers/continuity.fixture.js";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
import { venueFixture } from "./helpers/venues.fixture.js";

const at = "2026-11-10T12:00:00.000Z",
  setupAt = "2026-10-01T00:00:00.000Z";
const selected = "A quiet morning brought exact café 東京 evidence to Ada.";
const hidden = "Bea privately moved the silver compass.";
const bytes = (value: unknown) => Buffer.byteLength(JSON.stringify(value));
const json = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const deferred = () => Promise.withResolvers<void>();

function world(seed = "captured-admissions") {
  const state = coerceVillageState({
    ...defaultVillageState(),
    seed,
    name: "Capture Village",
    setupAt,
    foundedAt: setupAt,
    timeZone: "UTC",
    venues: [venueFixture({ id: "square", name: "Village square", classes: ["community"] })],
    villagers: ["ada", "bea"].map((id) => ({
      characterId: id,
      incarnation: id + "-one",
      letterFontId: "caveat",
      addedAt: setupAt,
      cardSnapshot: { id, name: id, capturedAt: setupAt, sourceStatus: "available", revision: 1 },
    })),
  });
  ensureNarrative(state, setupAt);
  return state;
}

function roles(state: VillageState) {
  const text = "Could you tell me about the quiet morning?";
  const capture = captureContinuityContext(state, ["player", "ada"], text, at);
  const [from, to] = capture.actors;
  const grant = admitNarrative(state, at, "world-opportunity");
  assert(grant);
  const target = grant.targets[0];
  const departure = captureReturnContext(state, new Date(at));
  const returnRole = {
    batchId: "return",
    captureRevision: returnCaptureRevision(departure),
    until: at,
    world: departure.world,
  };
  return json({
    "resident-planning": residentPlanningInput(state, "ada", at, "resident-opportunity", returnRole),
    "personal-mail": {
      seed: state.seed,
      setupAt: state.setupAt,
      residentId: to.id,
      incarnation: to.incarnation,
      residentName: "Ada",
      identity: "Ada's captured authored card",
      incoming: { id: "letter:exact", requestId: "exact", at, from, to, text },
      capture,
    },
    "world-development": {
      version: 2,
      grant,
      dateKey: at.slice(0, 10),
      catchupBatchId: returnRole.batchId,
      captureRevision: returnRole.captureRevision,
      returnUntil: at,
      context: { catchup: true },
      opportunity: {
        id: "world-opportunity",
        kind: "world",
        startsAt: at,
        endsAt: at,
        actorIds: [],
        venueId: target.venueId,
        zoneId: target.zoneId,
        facts: [],
      },
    },
  });
}

function work(kind: Job["kind"], seed: string, input: unknown, subjectId = "ada"): BackgroundInput {
  return { kind, seed, subjectId, input, revision: "first", finite: true, label: "Captured work" };
}
function job(work: BackgroundInput, status: Job["status"] = "failed"): Job {
  return {
    ...work,
    id: backgroundRevision([work.seed, work.kind, work.subjectId, work.revision]),
    instanceId: randomUUID(),
    status,
    owner: "first-activation",
    attempt: 1,
    steps: [],
    hasResult: false,
    requests: 0,
    tokens: null,
    error: "",
    failedStep: null,
    retryActions: [],
    retrying: false,
    connectionId: "",
    highWaterDate: "",
    connectionPaused: false,
    completedCount: 0,
    usageComplete: true,
  };
}

async function fixture(count = 0) {
  const f = sceneHistoryFixture();
  const repo = createVillageRepository(() => f.gate.documents);
  const state = world();
  if (count) Object.assign(state, nativeHistoryFixture(state, count));
  retainAuthoredNote(state, "selected", selected, ["ada"], at);
  retainAuthoredNote(state, "hidden", hidden, ["bea"], at);
  await repo.mutateAuthority((draft) => Object.assign(draft, state), { memories: true });
  const insert = (source: Job) =>
    f.gate.documents.create({
      id: backgroundSlotId(source),
      kind: "background-work",
      packageId: "villages",
      name: source.label,
      description: "",
      data: nativeBackgroundJob(source),
      createdAt: at,
      updatedAt: at,
    });
  const worker = (onWrite?: () => void) =>
    createBackgroundWork({
      withCurrentJobWrite: (run) => {
        onWrite?.();
        return repo.withAuthorityLock!(run);
      },
      villagesDocuments: () => f.gate.documents,
      villagesLogger: () => ({ debug() {}, debugOverride() {}, info() {}, warn() {}, error() {} }),
      readVillageState: (options) => repo.readAuthority(options),
      async mutateVillageState(update, options) {
        await repo.mutateAuthority(update, options);
        return repo.readAuthority();
      },
      withUsagePurpose: (_purpose, run) => run(),
      measurePipeline: (_name, _tags, run) => run(),
      runtimeDebug() {},
      backgroundCalls: createBackgroundContext().backgroundCalls,
      handlers: [
        [
          "agenda",
          {
            valid: () => true,
            generate: async () => {
              throw Error("Fixture hold without spending");
            },
            apply() {},
          },
        ],
      ],
    });
  return {
    ...f,
    repo,
    state,
    insert,
    worker,
    close: () => {
      f.release();
      f.gate.dispose();
    },
  };
}

await runCase("captured-admissions/roles", () => {
  const state = world();
  retainAuthoredNote(state, "selected", selected, ["ada"], at);
  retainAuthoredNote(state, "hidden", hidden, ["bea"], at);
  const captured = roles(state);
  for (const kind of Object.keys(captured) as (keyof typeof captured)[]) {
    const input = captured[kind];
    const decoded = readCapturedInput(kind, input, state.seed);
    assert.deepEqual(decoded, input, `${kind} preserves exact admitted data`);
    assert.notEqual(decoded, input);
    assert.throws(() => readCapturedInput(kind, input, "another-world"));
    assert.throws(() => readCapturedInput(kind, { ...input, admitted: { villagers: [] } }, state.seed));
  }
  const planning = captured["resident-planning"],
    mail = captured["personal-mail"],
    narrative = captured["world-development"];
  for (const input of [planning.context.narration.context, mail.capture]) {
    assert(JSON.stringify(input.prompt).includes(selected));
    assert(!JSON.stringify(input).includes(hidden));
  }
  assert(!JSON.stringify(narrative).includes(selected));
  for (const [kind, corrupt] of [
    [
      "resident-planning",
      {
        ...planning,
        context: { ...planning.context, residents: [{ ...planning.context.residents[0], characterId: "bea" }] },
      },
    ],
    [
      "resident-planning",
      { ...planning, catchup: { ...planning.catchup, world: { ...planning.catchup!.world, setupAt: at } } },
    ],
    [
      "resident-planning",
      { ...planning, context: { ...planning.context, moment: { ...planning.context.moment, instant: setupAt } } },
    ],
    ["personal-mail", { ...mail, incoming: { ...mail.incoming, to: { ...mail.incoming.to, id: "bea" } } }],
    ["personal-mail", { ...mail, incoming: { ...mail.incoming, at: "2026-11-11T12:00:00.000Z" } }],
    ["world-development", { ...narrative, opportunity: { ...narrative.opportunity, zoneId: "another-zone" } }],
    ["world-development", { ...narrative, captureRevision: undefined }],
  ] as const)
    assert.throws(() => readCapturedInput(kind, corrupt, state.seed), `${kind} rejects a changed role`);
});

await runCase("captured-admissions/release", () => {
  const state = world();
  for (const [kind, input] of Object.entries(roles(state)) as [Job["kind"], unknown][]) {
    const current = nativeBackgroundJob(job(work(kind, state.seed, input)));
    assertCapturedJob(current);
    assert.throws(() => assertCapturedJob({ ...current, responseStorage: 3 }));
    const released = { ...current, input: null, status: "completed" };
    assertCapturedJob(released);
    for (const patch of [
      { status: "queued" },
      { status: "interrupted" },
      { hasResult: true },
      { result: {} },
      { partialResult: true },
      { steps: [{ status: "running", fingerprint: "pending" }] },
    ])
      assert.throws(() => assertCapturedJob({ ...released, ...patch }), `${kind} retains its unfinished capture`);
    assert.throws(() => assertCapturedJob({ ...current, replacement: work(kind, "another-world", input) }));
  }
});

await runCase("captured-admissions/job-lock", async () => {
  const f = await fixture();
  const foreign = new AsyncResource("background-replacement-race");
  const atJobCAS = deferred(),
    atWorldCAS = deferred(),
    hold = deferred();
  let signalJob = false;
  const worker = f.worker(() => {
    if (signalJob) atJobCAS.resolve();
  });
  const stop = worker.startBackgroundWork();
  const update = f.documents.update;
  try {
    await worker.recoverBackgroundWork();
    const original = work("agenda", f.state.seed, {});
    const admitted = job(original, "queued");
    const row = await f.insert(admitted);
    const sourceJobs = [
      {
        slot: row.id,
        id: admitted.id,
        instanceId: admitted.instanceId,
        attempt: admitted.attempt,
        owner: admitted.owner,
      },
    ];
    const order: string[] = [];
    f.documents.update = async (input: any) => {
      if (input.id === "villages-village") {
        atWorldCAS.resolve();
        await hold.promise;
        order.push("World");
      } else if (input.id === row.id) order.push("job");
      return update(input);
    };
    const publication = f.repo.mutateAuthority(
      (state) => {
        state.setting = "Current source applied";
      },
      { sourceJobs },
    );
    await Promise.race([atWorldCAS.promise, publication.then(() => assert.fail("Missing World CAS"))]);
    signalJob = true;
    const replacement = foreign.runInAsyncScope(() => worker.queueBackgroundJob({ ...original, revision: "second" }));
    await Promise.race([atJobCAS.promise, replacement.then(() => assert.fail("Missing job CAS"))]);
    assert.equal(f.rows.get(row.id).data.instanceId, admitted.instanceId);
    hold.resolve();
    await Promise.all([publication, replacement]);
    await worker.settleBackgroundWork();
    assert.deepEqual(order.slice(0, 2), ["World", "job"]);
    assert.notEqual(f.rows.get(row.id).data.instanceId, admitted.instanceId);
    const revision = f.rows.get("villages-village").revision;
    await assert.rejects(
      f.repo.mutateAuthority(
        (state) => {
          state.setting = "Obsolete effect";
        },
        { sourceJobs },
      ),
      /source job changed/,
    );
    assert.equal(f.rows.get("villages-village").revision, revision);
    assert.equal((await f.repo.readAuthority()).setting, "Current source applied");
  } finally {
    hold.resolve();
    stop();
    await worker.settleBackgroundWork();
    f.documents.update = update;
    foreign.emitDestroy();
    f.close();
  }
});

await runCase("captured-admissions/reset", async () => {
  const f = await fixture();
  const service = createVillageStateService(f.repo);
  const foreign = new AsyncResource("foreign-capture-reset");
  const entered = deferred(),
    hold = deferred();
  const admitted = roles(f.state)["resident-planning"].context.narration;
  try {
    const pending = service.withVillageSceneAcceptance(
      async (state) => {
        assertResidentNarrationCurrent(state, admitted);
        entered.resolve();
        await hold.promise;
        throw Error("Selected source unavailable");
      },
      { memories: true },
    );
    const failed = assert.rejects(pending, /Selected source unavailable/);
    await Promise.race([entered.promise, pending]);
    let resetApplied = false;
    const resetting = foreign.runInAsyncScope(() =>
      f.repo.mutateAuthority(
        (state) => {
          resetApplied = true;
          Object.assign(state, world("replacement-world"));
        },
        { memories: true },
      ),
    );
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.equal(resetApplied, false, "A foreign reset waits for current acceptance to release its authority");
    hold.resolve();
    await Promise.all([failed, resetting]);
    const next = await f.repo.readAuthority({ memories: true });
    assert.equal(next.seed, "replacement-world");
    assert.equal(next.continuity.records.length, 0);
    assert.throws(() => assertResidentNarrationCurrent(next, admitted), /world or source changed/);
    const simulation = await f.gate.simulate(() =>
      f.repo.mutateAuthority(
        (state) => {
          retainAuthoredNote(state, "fresh", "The new Village installed a sign.", ["player"], at);
        },
        { memories: true },
      ),
    );
    assert.equal((await f.repo.readAuthority({ memories: true })).continuity.records.length, 0);
    await f.gate.commit("fresh-capture", simulation.transaction);
    assert.equal(
      continuityMemoryLibrary(await f.repo.readAuthority({ memories: true }), { query: "installed a sign" }, at).total,
      1,
    );
  } finally {
    hold.resolve();
    foreign.emitDestroy();
    f.close();
  }
});

await runCase("captured-admissions/scale", async () => {
  const f = await fixture(25_000);
  try {
    const data = roles(f.state);
    const row = await f.insert(job(work("resident-planning", f.state.seed, data["resident-planning"])));
    const old = f.rows.get("villages-village").data.memoryHead.id;
    const captured = structuredClone(row.data);
    const serialized = JSON.stringify(captured);
    assert(bytes(captured) < 192000, "A captured request stays bounded with 25,000 retained facts");
    assert(serialized.includes(selected));
    assert(!serialized.includes(hidden));
    assert(!serialized.includes("Retained native account 10000"), "Unselected interior history is absent");
    await f.repo.mutateAuthority(
      (state) => {
        retainAuthoredNote(state, "later", "The player returned the telescope.", ["player"], at);
      },
      { memories: true },
    );
    await collectRetainedStorage(f.gate);
    assert(!f.rows.has(old), "An exact captured slice does not pin an obsolete full history head");
    const reads: string[] = [];
    const get = f.documents.getById;
    f.documents.getById = async (pkg: string, id: string) => {
      reads.push(id);
      return get(pkg, id);
    };
    const worker = f.worker();
    f.reset();
    for (let i = 0; i < 20; i++) {
      assert.equal((await worker.backgroundWorkSummaries())[0]?.status, "failed");
      const reopened = await f.gate.documents.getById("villages", row.id);
      assert(reopened);
      validateBackgroundJobRecord(reopened);
      assert.deepEqual(reopened.data, captured);
    }
    assert(reads.length > 0 && reads.every((id) => !id.startsWith("villages-memory-")));
    assert.equal(f.metrics().writtenBytes, 0, "Metadata polling cannot publish another capture");
  } finally {
    f.close();
  }
});

await runCase("captured-admissions/cleanup", async () => {
  const f = await fixture();
  try {
    const data = roles(f.state);
    const captured = data["personal-mail"];
    const source = job(work("personal-mail", f.state.seed, captured));
    const row = await f.insert(source);
    const old = f.rows.get("villages-village").data.memoryHead.id;
    await f.repo.mutateAuthority(
      (state) => {
        retainAuthoredNote(state, "current", "The player posted a letter.", ["player"], at);
      },
      { memories: true },
    );
    f.rows.get(row.id).data.replacement = work("personal-mail", "another-world", captured);
    const before = structuredClone(f.rows);
    await assert.rejects(collectRetainedStorage(f.gate), /another World/);
    assert.deepEqual(f.rows, before, "An invalid physical capture owner cannot authorize any cleanup");
    delete f.rows.get(row.id).data.replacement;
    await collectRetainedStorage(f.gate);
    assert.equal(f.rows.has(old), false);
    assert.deepEqual(readCapturedInput("personal-mail", f.rows.get(row.id).data.input, f.state.seed), captured);
  } finally {
    f.close();
  }
});
