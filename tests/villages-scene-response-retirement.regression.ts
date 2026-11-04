import assert from "node:assert/strict";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { createRepairService } from "../packages/villages/src/server/features/repair/repair-service.js";
import { sessionSlot, ACTIVE_ID, activeSlot } from "../packages/villages/src/server/adapters/storage/scene-slots.js";
import {
  createSceneResponseReceipts,
  sceneResponseReceiptId,
} from "../packages/villages/src/server/adapters/storage/scene-response-receipts.js";
import { collectRetainedStorage } from "../packages/villages/src/server/features/repair/retained-storage-cleanup.js";
import { createSceneTerminalStore } from "../packages/villages/src/server/features/scenes/scene-terminal.js";
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { initialOpening } from "../packages/villages/src/server/domain/rules/opening-project.js";
import { releaseSceneMemories } from "../packages/villages/src/server/domain/rules/scene-memory-lifecycle.js";
import {
  createRepairStorage,
  repairStorageId,
} from "../packages/villages/src/server/features/repair/repair-storage.js";
import { createRepairTransactionCodec } from "../packages/villages/src/server/adapters/storage/repair-transaction-codec.js";
import type { RepairDocument } from "../packages/villages/src/server/adapters/storage/repair-gate.js";

const owner = { id: "retired-response", villageSeed: "retired-response-world" },
  at = "2026-10-31T00:00:00.000Z",
  signature = JSON.stringify([owner.id, "turn", 0, { message: "Exact input" }, "reply:0:fingerprint"]),
  receiptId = sceneResponseReceiptId(signature),
  sceneId = "villages-venue-visit-" + owner.id,
  terminalId = "villages-scene-terminal-" + owner.id;

async function fixture() {
  const f = sceneHistoryFixture(),
    world = createVillageRepository(() => f.gate.documents);
  await world.mutateAuthority((state) => {
    Object.assign(state, defaultVillageState());
    state.seed = owner.villageSeed;
    state.setupAt = state.foundedAt = at;
  });
  const repair = createRepairService({
    gate: f.gate,
    repository: world,
    resumeProject: async () => {},
    cancelProject: async () => {},
    replaySaved: async () => {},
    continueSaved: async () => {},
  });
  const receipts = createSceneResponseReceipts(f.gate.documents),
    claim = (await receipts.begin(owner, signature, "attempt", false)).claim!,
    purchased = { content: "Exact purchased café 東京 🌼 ".repeat(1000), finishReason: "stop" },
    saved = (await receipts.retain(owner, signature, claim, purchased))!;
  async function createScene() {
    const scene = coerceSession({ version: 3, ...owner, status: "active", startedAt: at });
    await world.mutateAuthority(
      (state) => {
        scene.continuity = captureSceneContinuity(state, scene, Date.parse(at));
      },
      { memories: true },
    );
    await f.mutateDocument(sceneId, sessionSlot(f.gate.documents), (current) => Object.assign(current, scene));
    await f.mutateDocument(ACTIVE_ID, activeSlot, (pointer) => {
      pointer.sessionId = owner.id;
      pointer.placeId = "place";
    });
  }
  async function retireScene() {
    await f.repository.changeSession(owner.id, (scene) => {
      scene.status = "closed";
      scene.endedAt = at;
      scene.endReason = "player";
    });
    const source = f.rows.get(sceneId),
      closed = await f.repository.readSession(owner.id);
    await createSceneTerminalStore({
      villagesDocuments: () => f.gate.documents,
      mutateDocument: f.mutateDocument,
    }).save(closed, source.revision);
    await f.repository.clearActivePointer(owner.id);
    assert(await f.gate.work(() => f.gate.documents.remove("villages", sceneId, source.revision)));
    await world.mutateAuthority((state) => releaseSceneMemories(state, closed), { memories: true });
  }
  return { ...f, world, repair, receipts, claim, purchased, saved, createScene, retireScene };
}

{
  const f = await fixture();
  try {
    await collectRetainedStorage(f.gate);
    assert(f.rows.has(receiptId) && f.rows.has(f.saved.ref.id), "Absence alone never proves retirement");
    await f.createScene();
    await collectRetainedStorage(f.gate);
    assert(f.rows.has(f.saved.ref.id), "The live Scene owns purchased work");
    await f.retireScene();
    await collectRetainedStorage(f.gate);
    assert(!f.rows.has(receiptId) && !f.rows.has(f.saved.ref.id));
    assert(f.rows.has(terminalId), "The normal terminal remains the replay fence");
    const before = structuredClone(f.rows);
    assert.equal(await f.receipts.retain(owner, signature, f.claim, f.purchased), undefined);
    assert.deepEqual(f.rows, before, "A duplicate late callback cannot recreate retired storage");
  } finally {
    f.release();
  }
}

{
  const f = await fixture();
  try {
    await f.createScene();
    const checkpoint = await f.repair.createCheckpoint("Before the saved turn", "response-checkpoint");
    await f.retireScene();
    await collectRetainedStorage(f.gate);
    assert(f.rows.has(receiptId) && f.rows.has(f.saved.ref.id), "An earlier active checkpoint owns reusable responses");
    const restored = await f.repair.restore(checkpoint.id, "restore-response-scene");
    await f.repair.apply(restored.id, restored.token);
    const cold = createSceneResponseReceipts({ ...f.gate.documents });
    assert.deepEqual((await cold.read(owner, signature))!.value, f.purchased);
    assert.equal((await f.repository.readSession(owner.id)).status, "active");
  } finally {
    f.release();
  }
}

for (const prospectiveId of [owner.id, " " + owner.id + " "]) {
  const f = await fixture();
  try {
    await f.world.mutateAuthority((state) => {
      state.opening = { ...initialOpening([], "place", "opening", 3), gatheringSceneId: owner.id };
    });
    f.rows.get("villages-village").data.opening.gatheringSceneId = prospectiveId;
    const checkpoint = await f.repair.createCheckpoint("Interrupted gathering creation", "prospective-gathering");
    await f.createScene();
    await f.world.mutateAuthority((state) => {
      state.opening!.stage = "complete";
    });
    await f.retireScene();
    await collectRetainedStorage(f.gate);
    assert(
      f.rows.has(receiptId) && f.rows.has(f.saved.ref.id),
      "A prospective World owner protects the fixed Scene ID",
    );
    await f.repair.deleteCheckpoint(checkpoint.id, checkpoint.token);
    await collectRetainedStorage(f.gate);
    assert(!f.rows.has(receiptId) && !f.rows.has(f.saved.ref.id));
  } finally {
    f.release();
  }
}

for (const retainedBy of ["undo-scene", "undo-world", "plan-scene", "plan-world"] as const) {
  const f = await fixture();
  try {
    const native = (id: string): RepairDocument => {
      const { id: key, kind, name, description, data } = f.rows.get(id);
      return structuredClone({ id: key, kind, name, description, data });
    };
    let source: RepairDocument;
    if (retainedBy.endsWith("world")) {
      await f.world.mutateAuthority((state) => {
        state.opening = { ...initialOpening([], "place", "opening", 3), gatheringSceneId: owner.id };
      });
      source = native("villages-village");
      await f.world.mutateAuthority((state) => {
        state.opening!.stage = "complete";
      });
      await f.createScene();
    } else {
      await f.createScene();
      source = native(sceneId);
    }
    assert(
      !JSON.stringify(source).includes(f.saved.ref.id),
      "This source protects the selector without a body reference",
    );
    await f.retireScene();
    const request = {
      operationId: retainedBy,
      recordId: "source",
      expectedRecord: "guard",
      action: "correct",
      values: {},
      knowers: [],
    };
    const history = {
      id: retainedBy,
      title: retainedBy,
      at,
      changes: [],
      affected: [],
      undone: false,
      canUndo: true,
      seed: owner.villageSeed,
      setupAt: at,
      request,
      guard: "guard",
    };
    const undo = retainedBy.startsWith("undo");
    let ownerId: string;
    if (undo) {
      await f.gate.work(() =>
        createRepairStorage(f.gate.documents, f.gate.documents).saveHistory(
          { ...history, undoWrites: [{ before: source, after: null }] },
          [],
        ),
      );
      ownerId = repairStorageId("repair-history", retainedBy);
    } else {
      ownerId = repairStorageId("repair-plan", retainedBy);
      const transaction = await f.gate.work(() =>
        createRepairTransactionCodec(f.gate.documents).encode({
          reads: [],
          lists: [],
          writes: [{ before: null, after: source }],
        }),
      );
      await f.gate.work(() =>
        f.gate.documents.create({
          id: ownerId,
          packageId: "villages",
          kind: "repair-plan",
          name: retainedBy,
          description: "",
          data: {
            seed: owner.villageSeed,
            setupAt: at,
            request,
            review: {
              id: retainedBy,
              token: "review",
              kind: "repair",
              title: retainedBy,
              changes: [],
              affected: [],
              related: [],
              checkpoint: false,
              undoAvailable: true,
            },
            history,
            transaction,
          },
        }),
      );
    }
    await collectRetainedStorage(f.gate);
    assert(f.rows.has(receiptId) && f.rows.has(f.saved.ref.id), retainedBy + " keeps reusable purchased work");
    const ownerRow = f.rows.get(ownerId);
    if (undo) {
      const { undoId: _undoId, ...data } = ownerRow.data;
      await f.gate.work(() =>
        f.gate.documents.update({
          id: ownerId,
          packageId: "villages",
          expectedRevision: ownerRow.revision,
          data: { ...data, canUndo: false },
        }),
      );
    } else await f.gate.work(() => f.gate.documents.remove("villages", ownerId, ownerRow.revision));
    await collectRetainedStorage(f.gate);
    assert(!f.rows.has(receiptId) && !f.rows.has(f.saved.ref.id), "Releasing the last owner permits retirement");
  } finally {
    f.release();
  }
}

{
  const f = await fixture();
  try {
    const pending = (await f.receipts.begin(owner, signature, "other", true)).cached;
    assert(pending, "A settled purchase is reused before another dispatch");
    await f.receipts.reject(owner, signature, "attempt", f.saved.ref);
    const unknown = (await f.receipts.begin(owner, signature, "unknown", true)).claim!;
    await f.createScene();
    await f.retireScene();
    await collectRetainedStorage(f.gate);
    assert(f.rows.has(receiptId), "An uncertain dispatch survives normal Scene retirement");
    const late = await f.receipts.retain(owner, signature, unknown, f.purchased);
    assert(late);
    await collectRetainedStorage(f.gate);
    assert(!f.rows.has(receiptId) && !f.rows.has(late.ref.id), "Settlement permits normal retirement");
  } finally {
    f.release();
  }
}

for (const fault of ["before", "after"] as const) {
  const f = await fixture();
  try {
    await f.createScene();
    await f.retireScene();
    const remove = f.documents.remove;
    f.documents.remove = async (pkg: string, id: string, revision: number) => {
      if (id === receiptId) {
        if (fault === "after") await remove(pkg, id, revision);
        throw Error("Synthetic receipt removal acknowledgement failure");
      }
      return remove(pkg, id, revision);
    };
    await assert.rejects(collectRetainedStorage(f.gate), /acknowledgement/);
    assert(f.rows.has(f.saved.ref.id), "The body survives interrupted selector removal");
    assert.equal(f.rows.has(receiptId), fault === "before");
    f.documents.remove = remove;
    await collectRetainedStorage(f.gate);
    assert(!f.rows.has(receiptId) && !f.rows.has(f.saved.ref.id), "Restart housekeeping finishes the same safe sweep");
  } finally {
    f.release();
  }
}

{
  const f = await fixture();
  try {
    await f.receipts.reject(owner, signature, "attempt", f.saved.ref);
    await collectRetainedStorage(f.gate);
    assert(!f.rows.has(f.saved.ref.id));
    const before = structuredClone(f.rows);
    assert.equal(await f.receipts.retain(owner, signature, f.claim, f.purchased), undefined);
    assert.deepEqual(f.rows, before, "An unselected settled callback cannot resurrect an orphan body");
    const claim = (await f.receipts.begin(owner, signature, "replacement", true)).claim!;
    await assert.rejects(
      f.receipts.retain(owner, signature, { ...claim, attemptId: "wrong-attempt" }, f.purchased),
      /publication identity changed/,
    );
    assert(!f.rows.has(claim.bodyId), "A mismatched claim is rejected before allocating its body");
    let release!: () => void, started!: () => void;
    const hold = new Promise<void>((resolve) => {
      release = resolve;
    });
    const ready = new Promise<void>((resolve) => {
      started = resolve;
    });
    const create = f.documents.create;
    f.documents.create = async (input: any) => {
      if (input.id === claim.bodyId) {
        started();
        await hold;
      }
      return create(input);
    };
    const writing = f.receipts.retain(owner, signature, claim, f.purchased);
    await ready;
    try {
      await assert.rejects(collectRetainedStorage(f.gate), /Other Village work is active/);
    } finally {
      release();
    }
    assert.deepEqual((await writing)!.value, f.purchased);
  } finally {
    f.release();
  }
}

for (const fault of [
  "wrong-scene-kind",
  "wrong-terminal-kind",
  "wrong-terminal-revision",
  "wrong-terminal-seed",
] as const) {
  const f = await fixture();
  try {
    await f.createScene();
    const scene = structuredClone(f.rows.get(sceneId));
    await f.retireScene();
    if (fault === "wrong-scene-kind") f.rows.set(sceneId, { ...scene, kind: "unexpected" });
    else if (fault === "wrong-terminal-kind") f.rows.get(terminalId).kind = "unexpected";
    else if (fault === "wrong-terminal-revision") f.rows.get(terminalId).revision = 0;
    else f.rows.get(terminalId).data.villageSeed = "another-world";
    const before = structuredClone(f.rows);
    await assert.rejects(collectRetainedStorage(f.gate), /Scene|Village/);
    assert.deepEqual(f.rows, before, "Invalid retirement proof prevents every deletion");
  } finally {
    f.release();
  }
}

for (const count of [1000, 10_000, 25_000]) {
  const f = await fixture();
  try {
    for (let index = 1; index < count; index++) {
      const key = JSON.stringify([owner.id, "turn:" + index, index, { message: "Input " + index }, "reply:0:hash"]);
      const claim = (await f.receipts.begin(owner, key, "attempt:" + index, false)).claim!;
      await f.receipts.retain(owner, key, claim, { content: "Exact saved reply " + index, finishReason: "stop" });
    }
    await f.createScene();
    await f.retireScene();
    // A long Scene also has a growing terminal ledger; validate it once per Scene, not once per receipt.
    f.rows.get(terminalId).data.submissions = Array.from({ length: count }, (_, index) => ({
      id: "turn:" + index,
      inputHash: "a".repeat(64),
    }));
    const bytes = () => [...f.rows.values()].reduce((sum, row) => sum + Buffer.byteLength(JSON.stringify(row)), 0);
    const before = bytes(),
      clone = structuredClone;
    let terminalWork = 0;
    globalThis.structuredClone = ((value: any, options?: StructuredSerializeOptions) => {
      if (value?.version === 1 && value.sceneId === owner.id && Array.isArray(value.submissions))
        terminalWork += value.submissions.length;
      return clone(value, options);
    }) as typeof structuredClone;
    let result;
    try {
      result = await collectRetainedStorage(f.gate);
    } finally {
      globalThis.structuredClone = clone;
    }
    const after = bytes();
    assert.equal(terminalWork, count, "Terminal validation work is linear across all retired receipts");
    assert(after < before / 2, "Settled response bodies and selectors are released without removing the replay ledger");
    assert.equal(result.removedBytes, before - after);
    assert.equal([...f.rows.values()].filter((row) => row.kind === "generation-response").length, 0);
    assert.equal(f.rows.get(terminalId).data.submissions.length, count);
    console.log(
      `Scene receipt retirement ${count}: retained ${before} -> ${after} bytes; terminal work ${terminalWork}.`,
    );
  } finally {
    f.release();
  }
}
