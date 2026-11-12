import assert from "node:assert/strict";
import { mock } from "node:test";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { mutableSceneSubmission } from "../packages/villages/src/server/domain/rules/scene-submissions.js";
import { sessionSlot } from "../packages/villages/src/server/adapters/storage/scene-slots.js";
import { operationEvidenceStore } from "../packages/villages/src/server/adapters/storage/operation-evidence.js";
import {
  createSceneHistory,
  readSceneIndex,
  readSceneWorkIndex,
  validateSceneHistory,
} from "../packages/villages/src/server/adapters/storage/scene-history.js";
import { createRepairGate } from "../packages/villages/src/server/adapters/storage/repair-gate.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { createRepairService } from "../packages/villages/src/server/features/repair/repair-service.js";
import { collectRetainedStorage } from "../packages/villages/src/server/features/repair/retained-storage-cleanup.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
import { createSceneQueryService } from "../packages/villages/src/server/features/scenes/scene-query-service.js";
import { sceneEpisodeId } from "../packages/villages/src/server/domain/rules/episode-sources.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import {
  fittedNarrationReadset,
  narrationContinuityContext,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import type { VenueSubmission } from "../packages/villages/src/server/domain/models/scene-model.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import { createVenueCoordinator } from "../packages/villages/src/server/jobs/venue-coordinator-service.js";
import { createVenueOperationContext } from "../packages/villages/src/server/adapters/operations/operation-context-service.js";
import { ensureNarrative } from "../packages/villages/src/server/domain/rules/narrative-development.js";
import { repairId } from "../packages/villages/src/server/domain/rules/repair-records.js";

const at = "2026-10-30T12:00:00.000Z",
  sceneId = "submissions",
  seed = "submission-growth";
const f = () => sceneHistoryFixture();
function turn(index: number): VenueSubmission {
  const id = "turn:" + index,
    message = "Exact private player input café 🌼 " + index + " exact original text. ".repeat(6);
  return {
    id,
    message,
    at,
    mode: "chat",
    targetId: "",
    requestFingerprint: memoryHash(["chat", "", null, message]),
    episodeId: sceneEpisodeId(seed, sceneId, id),
    acceptance: { status: "applied", rejected: [] },
    progressProcessedAt: at,
  };
}
async function populate(fixture: ReturnType<typeof f>, count: number) {
  const world = { ...defaultVillageState(), seed, setupAt: at, foundedAt: at };
  const venue = venueFixture({ id: "hall", name: "Hall" });
  world.venues = [venue];
  await createVillageRepository(() => fixture.gate.documents).mutateAuthority(
    (state) => {
      Object.assign(state, world);
    },
    { memories: true },
  );
  const scene = coerceSession({
    version: 5,
    id: sceneId,
    villageSeed: seed,
    placeId: venue.id,
    placeName: venue.name,
    zoneId: "exterior",
    status: "closed",
    startedAt: at,
    lastActivityAt: at,
    participants: [],
    lines: [],
    submissions: [],
    sceneAttendance: { capturedAt: at, layout: captureSceneLayout(venue), occupants: [] },
  });
  scene.continuity = captureSceneContinuity(world, scene, Date.parse(at));
  scene.submissions = Array.from({ length: count }, (_, index) => turn(index));
  const latest = scene.submissions.at(-1)!;
  const scoped = zoneEventScene({ ...scene, submissions: [] }, venue, { message: latest.message });
  const context = narrationContinuityContext(world, scoped, venue, latest.id, latest.message, at);
  const raw = {
    segments: [{ kind: "narration", text: "The hall is quiet." }],
    keep: [{ text: "Private retained context" }],
  };
  latest.narration = { raw, readset: fittedNarrationReadset(world, context, []), responseDigest: memoryHash(raw) };
  await fixture.mutateDocument("villages-venue-visit-" + sceneId, sessionSlot(fixture.gate.documents), (saved) =>
    Object.assign(saved, scene),
  );
}
function saveRetry(turn: VenueSubmission, revision: number) {
  const narration = turn.narration!;
  narration.raw = { ...narration.raw, retry: "Exact retained revision " + revision };
  narration.responseDigest = memoryHash(narration.raw);
}
for (const fault of ["before", "after"] as const) {
  const fixture = f();
  try {
    await populate(fixture, 8);
    const repair = createRepairService({
      gate: fixture.gate,
      repository: createVillageRepository(() => fixture.gate.documents),
      resumeProject: async () => {},
      cancelProject: async () => {},
      replaySaved: async () => {},
    });
    const checkpoint = await repair.createCheckpoint("Original exact submission context", "original");
    const old = structuredClone(fixture.rows.get("villages-venue-visit-" + sceneId).data);
    fixture.fail(fault);
    await assert.rejects(
      fixture.repository.changeSession(sceneId, (scene) => {
        saveRetry(mutableSceneSubmission(scene, "turn:7")!, 1);
      }),
      /Synthetic/,
    );
    await collectRetainedStorage(fixture.gate);
    const current = await readSceneWorkIndex(
      fixture.gate.documents,
      fixture.rows.get("villages-venue-visit-" + sceneId).data,
    );
    assert.equal(
      current.submissions[7].narration!.raw.retry,
      fault === "after" ? "Exact retained revision 1" : undefined,
    );
    const restoration = await repair.restore(checkpoint.id, "restore-original");
    await repair.apply(restoration.id, restoration.token);
    assert.equal((await fixture.repository.readSession(sceneId)).submissions[7].narration!.raw.retry, undefined);
    const root = fixture.rows.get(old.submissionHistory.submissions.id);
    fixture.rows.delete(root.id);
    const held = structuredClone(fixture.rows);
    await assert.rejects(collectRetainedStorage(fixture.gate), /missing/);
    assert.deepEqual(fixture.rows, held, "Missing owned submission pages hold every cleanup deletion");
    fixture.rows.set(root.id, root);
  } finally {
    fixture.release();
    fixture.gate.dispose();
  }
}

for (const consumer of ["backlog", "operation", "restart"] as const) {
  const fixture = f();
  const collector = createRepairGate(fixture.documents, fixture.admission);
  try {
    await populate(fixture, 8);
    await fixture.repository.changeSession(sceneId, (scene) => {
      mutableSceneSubmission(scene, "turn:7")!.acceptance.status = "held";
    });
    if (consumer === "restart")
      fixture.rows.get("villages-venue-visit-" + sceneId).data.operation = {
        evidenceFormat: 1,
        id: "turn:7",
        kind: "turn",
        input: {},
        token: "interrupted",
        attemptId: "interrupted",
        status: "interrupted",
        stage: "saved",
        startedAt: at,
        sceneRevision: 0,
        checkpoints: {},
        attempts: {},
        error: "Saved work",
      };
    let changed = false,
      deferred = false;
    const replaceHead = async () => {
      if (changed) return;
      changed = true;
      await fixture.repository.changeSession(sceneId, (scene) => {
        mutableSceneSubmission(scene, "turn:7")!.acceptance.status = "applied";
      });
      try {
        await collectRetainedStorage(collector);
      } catch (error) {
        assert.match(String(error), /Other Village work is active/);
        deferred = true;
      }
    };
    const documents = {
      ...fixture.gate.documents,
      async getById(pkg: string, id: string) {
        const row = await fixture.gate.documents.getById(pkg, id);
        if (consumer === "operation" && id === "villages-venue-visit-" + sceneId) await replaceHead();
        return row;
      },
      async list(pkg: string, kind: string) {
        const rows = await fixture.gate.documents.list(pkg, kind);
        if (consumer !== "operation" && kind === "venue-visit") await replaceHead();
        return rows;
      },
    };
    if (consumer === "backlog") {
      const queries = createSceneQueryService({
        readSession: fixture.repository.readSession,
        readVillageState: async () => ({ ...defaultVillageState(), seed, foundedAt: at }),
        villagesDocuments: () => documents,
      });
      const backlog = await queries.progressBacklog();
      assert.deepEqual(
        backlog.map((row) => row.submissionId),
        ["turn:7"],
        "The complete H1 read remains protected after H2 publishes",
      );
    } else {
      const logger = { debug() {}, info() {}, warn() {}, error() {} };
      const coordinator = createVenueCoordinator({
        operations: createVenueOperationContext(() => logger as any),
        villagesDocuments: () => documents,
        villagesLogger: () => logger as any,
        runtimeDebug() {},
        withRepairWork: (work) => fixture.gate.work(work),
      });
      if (consumer === "operation")
        assert.equal((await coordinator.readVenueOperation(sceneId, "turn:7"))!.status, "complete");
      else {
        const recovered: string[] = [];
        await coordinator.recoverVenueOperations(async (id) => {
          recovered.push(id);
        });
        assert.deepEqual(recovered, [], "The startup reader honors the held purchase in its retained snapshot");
      }
    }
    assert(changed && deferred, "A separate activation cannot collect pages during the complete read");
    await collectRetainedStorage(collector);
    await validateSceneHistory(fixture.gate.documents, [fixture.rows.get("villages-venue-visit-" + sceneId).data]);
  } finally {
    fixture.release();
    fixture.gate.dispose();
    collector.dispose();
  }
}

for (const committed of [false, true]) {
  const fixture = f();
  try {
    await populate(fixture, 8);
    const repository = createVillageRepository(() => fixture.gate.documents);
    await repository.mutateAuthority((world) => {
      ensureNarrative(world, at).claims = [
        {
          id: "held",
          attemptId: "purchased",
          venueId: "hall",
          zoneId: "room",
          fingerprint: "original",
          sceneId,
          submissionId: committed ? "turn:7" : "uncommitted",
        },
      ];
    });
    const repair = createRepairService({
      gate: fixture.gate,
      repository,
      resumeProject: async () => {},
      cancelProject: async () => {},
      replaySaved: async () => {},
    });
    const record = await repair.inspect(repairId("narrative-claim", "held"));
    const before = structuredClone(fixture.rows);
    const preparing = () =>
      repair.prepare({
        operationId: "reject-claim",
        recordId: record.id,
        action: "reject",
        values: {},
        knowers: [],
        expectedRecord: record.token!,
      });
    if (committed) {
      await assert.rejects(preparing(), /Recover the saved Scene outcome/);
      await collectRetainedStorage(fixture.gate);
      assert.deepEqual(
        fixture.rows,
        before,
        "A committed turn blocks claim rejection; abandoned preview bodies are reclaimed",
      );
    } else {
      const review = await preparing();
      assert.equal((await repository.readAuthority()).narrative!.claims!.length, 1);
      await repair.apply(review.id, review.token);
      const narrative = (await repository.readAuthority()).narrative!;
      assert.equal(narrative.claims!.length, 0);
      assert(narrative.receipts.some((receipt) => receipt.id === "held" && receipt.rejected));
    }
  } finally {
    fixture.release();
    fixture.gate.dispose();
  }
}
const measurements: {
  count: number;
  initialBytes: number;
  readBytes: number;
  writtenBytes: number;
  jsonBytes: number;
}[] = [];
for (const count of [1000, 10_000, 25_000]) {
  const fixture = f();
  try {
    await populate(fixture, count);
    await fixture.repository.changeSession(sceneId, (scene) => {
      scene.lines.push(
        {
          id: "saved-setting",
          role: "assistant",
          kind: "narration",
          speakerId: "__venue_scene__",
          name: "Narration",
          content: "The hall is quiet.",
          heardBy: ["player"],
          at,
        },
        {
          id: "saved-reply",
          role: "assistant",
          kind: "narration",
          speakerId: "__venue_scene__",
          name: "Narration",
          content: "The room grows colder.",
          heardBy: ["player"],
          at,
        },
      );
      mutableSceneSubmission(scene, "turn:" + (count - 1))!.replyLineIds = ["saved-reply"];
    });
    const original = structuredClone(fixture.rows.get("villages-venue-visit-" + sceneId));
    assert.equal(Object.hasOwn(original.data, "submissions"), false);
    assert.equal(original.data.submissionHistory.count, count);
    assert.throws(() => readSceneIndex(original.data).submissions, /not loaded/);
    fixture.rows.get(original.id).data.operation = await fixture.gate.work(() =>
      operationEvidenceStore(fixture.gate.documents).encode(
        {
          id: "saved",
          kind: "turn",
          input: {},
          token: "saved",
          attemptId: "saved-attempt",
          status: "complete",
          stage: "complete",
          startedAt: at,
          sceneRevision: original.data.sceneRevision,
          snapshot: structuredClone(original.data),
          checkpoints: { saved: { content: "Retained parsed checkpoint" } },
          attempts: {},
          error: "",
        },
        { id: sceneId, villageSeed: seed },
      ),
    );
    const logger = { debug() {}, info() {}, warn() {}, error() {} };
    const coordinator = createVenueCoordinator({
      operations: createVenueOperationContext(() => logger as any),
      villagesDocuments: () => fixture.gate.documents,
      villagesLogger: () => logger as any,
      runtimeDebug() {},
      withRepairWork: (work) => fixture.gate.work(work),
    });
    const requested = "turn:" + (count - 1);
    fixture.reset();
    const proofBefore = structuredClone(fixture.rows);
    assert.deepEqual(
      await coordinator.readVenueOperation(sceneId, requested),
      {
        id: requested,
        status: "complete",
        input: null,
        committed: true,
        replyReady: true,
        acceptance: "applied",
      },
      "A later close operation cannot hide a saved turn outside the visible playback window",
    );
    const proofIo = fixture.metrics();
    assert(
      proofIo.readBytes < 128 * 1024 && proofIo.writtenBytes === 0,
      "Latest-turn recovery reads one saved submission, not the complete history: " + JSON.stringify(proofIo),
    );
    assert.deepEqual(fixture.rows, proofBefore, "Recovery status cannot start work or alter evidence");
    console.log(`Latest operation proof ${count}: ${proofIo.readBytes} read bytes, no writes or model requests`);
    if (count === 1000) {
      await fixture.repository.changeSession(sceneId, (scene) => {
        mutableSceneSubmission(scene, requested)!.acceptance.status = "held";
      });
      assert.deepEqual(
        await coordinator.readVenueOperation(sceneId, requested),
        {
          id: requested,
          status: "complete",
          input: null,
          committed: false,
          replyReady: false,
          acceptance: "held",
        },
        "Committed but unpublished work keeps its recovery hold",
      );
      await fixture.repository.changeSession(sceneId, (scene) => {
        mutableSceneSubmission(scene, requested)!.acceptance.status = "applied";
      });
      assert.deepEqual(await coordinator.readVenueOperation(sceneId, requested), {
        id: requested,
        status: "complete",
        input: null,
        committed: true,
        replyReady: true,
        acceptance: "applied",
      });
      assert.deepEqual(
        await coordinator.readVenueOperation(sceneId, "turn:0"),
        {
          id: "turn:0",
          status: "complete",
          input: null,
          committed: true,
          replyReady: true,
          acceptance: "applied",
        },
        "Explicit recovery of an older turn retains the complete evidence lookup",
      );
      assert.equal(await coordinator.readVenueOperation(sceneId, "never-purchased"), null);
    }
    const initialBytes = [...fixture.rows.values()].reduce(
      (sum, row) => sum + Buffer.byteLength(JSON.stringify(row)),
      0,
    );
    fixture.reset();
    const stringify = JSON.stringify;
    let jsonBytes = 0;
    mock.method(JSON, "stringify", (...args: unknown[]) => {
      const text = Reflect.apply(stringify, JSON, args);
      if (typeof text === "string") jsonBytes += Buffer.byteLength(text);
      return text;
    });
    try {
      for (let index = 0; index < 20; index++) {
        await fixture.repository.changeSession(sceneId, (scene) => {
          scene.activity = "Metadata update " + index;
        });
        await fixture.repository.changeSession(sceneId, (scene) => {
          saveRetry(mutableSceneSubmission(scene, requested)!, index);
        });
      }
      for (let index = 0; index < 20; index++)
        await fixture.repository.changeSession(sceneId, (scene) => {
          scene.submissions.push(turn(count + index));
        });
    } finally {
      mock.restoreAll();
    }
    const io = fixture.metrics();
    measurements.push({ count, initialBytes, ...io, jsonBytes });
    assert(
      io.readBytes < 8 * 1024 * 1024 && io.writtenBytes < 4 * 1024 * 1024 && jsonBytes < 32 * 1024 * 1024,
      "Metadata, one-row retries and append publication must not read/write/serialize all prior submission bodies: " +
        JSON.stringify({ count, ...io, jsonBytes }),
    );
    const stored = fixture.rows.get(original.id).data;
    assert.equal(stored.submissionHistory.count, count + 20);
    assert.deepEqual(stored.operation.snapshot.submissionHistory, original.data.submissionHistory);
    const current = await fixture.repository.readSession(sceneId);
    assert.equal(current.submissions.at(-1)!.id, "turn:" + (count + 19));
    assert.equal(current.submissions[count - 1].narration!.raw.retry, "Exact retained revision 19");
    const returned = await fixture.repository.changeSession(sceneId, (scene) => {
      scene.activity = "Array isolation";
    });
    returned.submissions.pop();
    returned.lines.push({
      id: "unsaved",
      role: "assistant",
      kind: "narration",
      speakerId: "__venue_scene__",
      content: "Not committed",
      name: "Narration",
      heardBy: [],
      at,
    });
    const persisted = await fixture.repository.readSession(sceneId);
    assert.equal(
      persisted.submissions.length,
      count + 20,
      "A returned outer array cannot mutate the persisted-head cache",
    );
    assert.equal(persisted.lines.length, 2);
    const latest = current.submissions[count - 1];
    assert.throws(() => {
      latest.narration!.raw.keep = [];
    }, TypeError);
    assert(!JSON.stringify(publicSceneResponse(current)).includes("Private retained context"));
    const cold = createSceneHistory(createRepairGate(fixture.documents).documents);
    const snapshot = (await cold.decode(stored.operation.snapshot)).submissions[count - 1];
    assert.equal(snapshot.message, latest.message, "Private original input survives both owners verbatim");
    assert.equal(snapshot.narration!.raw.retry, undefined);
    assert.equal((await cold.decode(stored)).submissions[count - 1].narration!.raw.retry, "Exact retained revision 19");
    await collectRetainedStorage(fixture.gate);
    await validateSceneHistory(fixture.gate.documents, [fixture.rows.get(original.id).data]);
  } finally {
    fixture.release();
    fixture.gate.dispose();
  }
}
for (const metric of ["readBytes", "writtenBytes", "jsonBytes"] as const)
  assert(
    measurements.at(-1)![metric] < measurements[0][metric] + 2 * 1024 * 1024,
    metric + " must stay bounded as retained submissions grow from 1,000 to 25,000",
  );
console.log("Scene submission growth:", JSON.stringify(measurements));
