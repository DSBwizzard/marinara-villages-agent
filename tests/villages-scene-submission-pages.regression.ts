import assert from "node:assert/strict";
import { mock } from "node:test";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
import { fixtureWish } from "./helpers/social-wishes-fixture.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { createExchangeProcessing } from "../packages/villages/src/server/domain/decoding/exchange-codec.js";
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
import { createSceneCommands } from "../packages/villages/src/server/features/scenes/command-service.js";
import { createVenueCoordinator } from "../packages/villages/src/server/jobs/venue-coordinator-service.js";
import { createVenueOperationContext } from "../packages/villages/src/server/adapters/operations/operation-context-service.js";
import { createInterpretationEvidence } from "../packages/villages/src/server/features/generation/interpretation-evidence-service.js";
import type { InterpretationBatch } from "../packages/villages/src/server/domain/models/interpretation-model.js";
import { ensureNarrative } from "../packages/villages/src/server/domain/rules/narrative-development.js";
import { repairId } from "../packages/villages/src/server/domain/rules/repair-records.js";

const at = "2026-10-30T12:00:00.000Z",
  sceneId = "submissions",
  seed = "submission-growth";
const f = () => sceneHistoryFixture();
function turn(index: number) {
  const wish = fixtureWish({ wish: "A conversation about the river" }, "wish:" + index, at);
  wish.history = Array.from({ length: 4 }, (_, ordinal) => ({
    id: "history:" + ordinal,
    at,
    kind: "progress" as const,
    text: "Private retained context café 🌼 " + index + " " + ordinal + " exact evidence. ".repeat(12),
    sourceId: "original:" + index,
    lineIds: ["original-line:" + ordinal],
  }));
  const processing = createExchangeProcessing({
    seed,
    sceneId,
    submissionId: "turn:" + index,
    order: index,
    lineIds: [],
    actionReceiptIds: [],
  });
  for (const domain of Object.values(processing.domains)) domain.status = "applied";
  return {
    id: "turn:" + index,
    message: "A public exchange " + index,
    at,
    mode: "chat",
    progressProcessedAt: at,
    targetId: "",
    activeIdsAfterTurn: ["ada"],
    processing,
    wishContexts: [{ actorId: "ada", wishId: wish.id, fingerprint: "captured", capturedAt: at, wishes: [wish] }],
    interpretationHistory: [
      {
        at,
        domain: "wishes",
        source: "Exact original judgment",
        proposals: { evidence: "Private original verdict " + index },
      },
    ],
  };
}
async function populate(fixture: ReturnType<typeof f>, count: number) {
  const world = defaultVillageState();
  const { memories: _memories, memoryScenes: _scenes, memoryReceipts: _receipts, ...mechanics } = world;
  await fixture.documents.create({
    id: "villages-village",
    packageId: "villages",
    kind: "village",
    name: "World",
    description: "",
    data: { ...mechanics, seed, setupAt: at, memoryHead: null },
  });
  const scene = coerceSession({
    version: 3,
    id: sceneId,
    villageSeed: seed,
    status: "closed",
    startedAt: at,
    participants: [{ characterId: "ada", name: "Ada", doing: "Talking" }],
    submissions: Array.from({ length: count }, (_, index) => turn(index)),
    lines: [],
  });
  await fixture.mutateDocument("villages-venue-visit-" + sceneId, sessionSlot(fixture.gate.documents), (saved) =>
    Object.assign(saved, scene),
  );
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
      continueSaved: async () => {},
    });
    const checkpoint = await repair.createCheckpoint("Original exact submission context", "original");
    const old = structuredClone(fixture.rows.get("villages-venue-visit-" + sceneId).data);
    fixture.fail(fault);
    await assert.rejects(
      fixture.repository.changeSession(sceneId, (scene) => {
        mutableSceneSubmission(scene, "turn:7")!.interpretationHistory!.push({
          at,
          domain: "wishes",
          source: "Purchased recovery",
          proposals: { exact: "Retain this verdict" },
        });
      }),
      /Synthetic/,
    );
    await collectRetainedStorage(fixture.gate);
    const current = await readSceneWorkIndex(
      fixture.gate.documents,
      fixture.rows.get("villages-venue-visit-" + sceneId).data,
    );
    assert.equal(current.submissions[7].interpretationHistory!.length, fault === "after" ? 2 : 1);
    const restoration = await repair.restore(checkpoint.id, "restore-original");
    await repair.apply(restoration.id, restoration.token);
    assert.equal((await fixture.repository.readSession(sceneId)).submissions[7].interpretationHistory!.length, 1);
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
      scene.processingVersion = 1;
      mutableSceneSubmission(scene, "turn:7")!.processing!.domains.memories.status = "pending";
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
        mutableSceneSubmission(scene, "turn:7")!.processing!.domains.memories.status = "applied";
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
        readInterpretationSettings: async () => ({}) as any,
        withRepairWork: (work) => fixture.gate.work(work),
      });
      if (consumer === "operation")
        assert.equal((await coordinator.readVenueOperation(sceneId, "turn:7"))!.status, "complete");
      else {
        const recovered: string[] = [];
        await coordinator.recoverVenueOperations(async (id) => {
          recovered.push(id);
        });
        assert.deepEqual(recovered, [sceneId]);
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

{
  const fixture = f();
  try {
    await populate(fixture, 8);
    await fixture.repository.changeSession(sceneId, (scene) => {
      scene.status = "active";
    });
    const notice = { id: "committed-notice", kind: "wish" as const, text: "Wish fulfilled" };
    const world = {
      ...defaultVillageState(),
      seed,
      exchangeReceipts: {
        committed: {
          id: "committed",
          sceneId,
          submissionId: "turn:7",
          domain: "wishes",
          status: "applied",
          at,
          notice,
        },
      },
    };
    const commands = createSceneCommands({
      readSession: fixture.repository.readSession,
      changeSession: fixture.repository.changeSession,
      readVillageSnapshot: async () => world,
      bindReplayEffects: (effects: unknown) => effects,
    } as any);
    const effects = commands.sceneReplayEffects();
    const scene = await fixture.repository.readSession(sceneId);
    assert.deepEqual(await effects.receiptForTurn(scene, scene.submissions[7]), [notice]);
    assert.deepEqual((await fixture.repository.readSession(sceneId)).submissions[7].recordEvents, [notice]);
    assert.deepEqual(
      await effects.receiptForTurn(scene, scene.submissions[7]),
      [notice],
      "Reconstructing committed notices is idempotent and provider-free",
    );
  } finally {
    fixture.release();
    fixture.gate.dispose();
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
      continueSaved: async () => {},
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

const evidenceBatch: InterpretationBatch = {
  checks: (["room", "project"] as const).map((domain) => ({
    id: domain,
    domain,
    question: "What does this exact exchange establish?",
    outcomes: [],
    facts: { actorId: "ada", zoneId: "room", projectId: "garden" },
    evidence: [
      { id: "player-input", speakerId: "player", name: "Player", content: "The exact question" },
      { id: "draft:0", speakerId: "ada", name: "Ada", content: "The exact answer" },
    ],
  })),
  results: ["room", "project"].map(() => ({
    outcome: "unresolved",
    source: "system",
    evidenceIds: [],
    reason: "Keep exact evidence",
  })),
  traces: [],
  settings: { decisionsEnabled: false, compareSystem: false },
};
const measurements: unknown[] = [];
for (const count of [1000, 10_000, 25_000]) {
  const fixture = f();
  try {
    await populate(fixture, count);
    await fixture.repository.changeSession(sceneId, (scene) => {
      scene.lines.push(
        {
          id: "saved-player",
          role: "user",
          speakerId: "player",
          name: "Player",
          content: "The exact question",
          heardBy: ["ada", "player"],
          at,
        },
        {
          id: "saved-reply",
          role: "assistant",
          speakerId: "ada",
          name: "Ada",
          content: "The exact answer",
          heardBy: ["ada", "player"],
          at,
        },
      );
      mutableSceneSubmission(scene, "turn:" + (count - 1))!.replyLineIds = ["saved-reply"];
    });
    const evidence = createInterpretationEvidence({
      VILLAGES_PACKAGE_ID: "villages",
      villagesDocuments: () => fixture.gate.documents,
      mutateDocument: fixture.mutateDocument,
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
        await evidence.saveInterpretationContext(sceneId, evidenceBatch, "turn:" + (count - 1));
        await fixture.repository.changeSession(sceneId, (scene) => {
          mutableSceneSubmission(scene, "turn:" + (count - 1))!.interpretationHistory!.push({
            at,
            domain: "wishes",
            source: "Retry " + index,
            proposals: { exact: "Saved retry evidence " + index },
          });
        });
      }
      for (let index = 0; index < 20; index++)
        await fixture.repository.changeSession(sceneId, (scene) => {
          scene.submissions.push(
            coerceSession({ version: 3, participants: scene.participants, submissions: [turn(count + index)] })
              .submissions[0],
          );
        });
    } finally {
      mock.restoreAll();
    }
    const io = fixture.metrics();
    measurements.push({ count, initialBytes, ...io, jsonBytes });
    assert(
      io.readBytes < 4 * 1024 * 1024 && io.writtenBytes < 4 * 1024 * 1024 && jsonBytes < 16 * 1024 * 1024,
      "Metadata, one-row retries and append publication must not read/write/serialize all prior submission bodies",
    );
    const stored = fixture.rows.get(original.id).data;
    assert.equal(stored.submissionHistory.count, count + 20);
    assert.deepEqual(stored.operation.snapshot.submissionHistory, original.data.submissionHistory);
    const current = await fixture.repository.readSession(sceneId);
    assert.equal(current.submissions.at(-1)!.id, "turn:" + (count + 19));
    assert.equal(current.submissions[count - 1].interpretationHistory!.length, 21);
    const returned = await fixture.repository.changeSession(sceneId, (scene) => {
      scene.activity = "Array isolation";
    });
    returned.submissions.pop();
    returned.lines.push({
      id: "unsaved",
      role: "user",
      speakerId: "player",
      content: "Not committed",
      name: "Player",
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
    assert.throws(() => current.submissions[0].wishContexts![0].wishes[0].history.push({} as never), TypeError);
    assert(!JSON.stringify(publicSceneResponse(current)).includes("Private retained context"));
    const cold = createSceneHistory(createRepairGate(fixture.documents).documents);
    assert.equal(
      (await cold.decode(stored.operation.snapshot)).submissions[count - 1].interpretationHistory!.length,
      1,
    );
    assert.equal((await cold.decode(stored)).submissions[count - 1].interpretationHistory!.length, 21);
    const restarted = createInterpretationEvidence({
      VILLAGES_PACKAGE_ID: "villages",
      villagesDocuments: () => fixture.gate.documents,
      mutateDocument: fixture.mutateDocument,
    });
    for (const check of await restarted.contextualChecks(sceneId, evidenceBatch.checks))
      assert.deepEqual(
        check.essentialEvidenceIds,
        ["saved-player", "saved-reply"],
        "Native saved evidence survives service restart with exact player/draft ID mapping",
      );
    await collectRetainedStorage(fixture.gate);
    await validateSceneHistory(fixture.gate.documents, [fixture.rows.get(original.id).data]);
  } finally {
    fixture.release();
    fixture.gate.dispose();
  }
}
console.log("Scene submission growth:", JSON.stringify(measurements));
