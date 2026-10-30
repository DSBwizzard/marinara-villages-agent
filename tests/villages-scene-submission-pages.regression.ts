import assert from "node:assert/strict";
import { mock } from "node:test";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
import { fixtureWish } from "./helpers/social-wishes-fixture.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { createExchangeProcessing } from "../packages/villages/src/server/domain/decoding/exchange-codec.js";
import { mutableSceneSubmission } from "../packages/villages/src/server/domain/rules/scene-submissions.js";
import { sessionSlot } from "../packages/villages/src/server/adapters/storage/scene-slots.js";
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
const measurements: unknown[] = [];
for (const count of [1000, 10_000, 25_000]) {
  const fixture = f();
  try {
    await populate(fixture, count);
    const original = structuredClone(fixture.rows.get("villages-venue-visit-" + sceneId));
    assert.equal(Object.hasOwn(original.data, "submissions"), false);
    assert.equal(original.data.submissionHistory.count, count);
    assert.throws(() => readSceneIndex(original.data).submissions, /not loaded/);
    fixture.rows.get(original.id).data.operation = {
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
      checkpoints: {},
      attempts: { saved: { status: "complete", result: { content: "Retained purchased response" } } },
      error: "",
    };
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
    const returned = await fixture.repository.changeSession(sceneId, (scene) => { scene.activity = "Array isolation"; });
    returned.submissions.pop();
    returned.lines.push({ id: "unsaved", role: "user", speakerId: "player", content: "Not committed", name: "Player", heardBy: [], at });
    const persisted = await fixture.repository.readSession(sceneId);
    assert.equal(persisted.submissions.length, count + 20, "A returned outer array cannot mutate the persisted-head cache");
    assert.equal(persisted.lines.length, 0);
    assert.throws(() => current.submissions[0].wishContexts![0].wishes[0].history.push({} as never), TypeError);
    assert(!JSON.stringify(publicSceneResponse(current)).includes("Private retained context"));
    const cold = createSceneHistory(createRepairGate(fixture.documents).documents);
    assert.equal(
      (await cold.decode(stored.operation.snapshot)).submissions[count - 1].interpretationHistory!.length,
      1,
    );
    assert.equal((await cold.decode(stored)).submissions[count - 1].interpretationHistory!.length, 21);
    await collectRetainedStorage(fixture.gate);
    await validateSceneHistory(fixture.gate.documents, [fixture.rows.get(original.id).data]);
  } finally {
    fixture.release();
  }
}
console.log("Scene submission growth:", JSON.stringify(measurements));

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
    await repair.restoreCheckpoint(checkpoint.checkpoint.id, "restore-original");
    assert.equal((await fixture.repository.readSession(sceneId)).submissions[7].interpretationHistory!.length, 1);
    const root = fixture.rows.get(old.submissionHistory.submissions.id);
    fixture.rows.delete(root.id);
    const held = structuredClone(fixture.rows);
    await assert.rejects(collectRetainedStorage(fixture.gate), /missing/);
    assert.deepEqual(fixture.rows, held, "Missing owned submission pages hold every cleanup deletion");
    fixture.rows.set(root.id, root);
  } finally {
    fixture.release();
  }
}
