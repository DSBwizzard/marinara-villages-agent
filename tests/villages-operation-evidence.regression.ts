import assert from "node:assert/strict";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import type { VenueOperation } from "../packages/villages/src/server/domain/models/operation-model.js";
import { applySceneMutation } from "../packages/villages/src/server/domain/rules/scene-mutation.js";
import { createVenueCoordinator } from "../packages/villages/src/server/jobs/venue-coordinator-service.js";
import { createVenueOperationContext } from "../packages/villages/src/server/adapters/operations/operation-context-service.js";
import { coerceInterpretationSettings } from "../packages/villages/src/server/domain/rules/interpretation-policy.js";
import { fixtureWish } from "./helpers/social-wishes-fixture.js";
import {
  createOperationEvidence,
  encodeOperationEvidence,
  operationEvidenceStore,
  OPERATION_EVIDENCE_KIND,
  prepareOperationValue,
  operationEvidenceValue,
  operationCheckpointClaims,
} from "../packages/villages/src/server/adapters/storage/operation-evidence.js";
import {
  createSceneResponseReceipts,
  sceneResponseReceiptId,
  readSceneResponseReceipt,
} from "../packages/villages/src/server/adapters/storage/scene-response-receipts.js";
import { sessionSlot } from "../packages/villages/src/server/adapters/storage/scene-slots.js";
import { createRepairService } from "../packages/villages/src/server/features/repair/repair-service.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { collectRetainedStorage } from "../packages/villages/src/server/features/repair/retained-storage-cleanup.js";

const scope = { id: "evidence", villageSeed: "evidence-world" },
  at = "2026-10-30T00:00:00.000Z";
const signature = JSON.stringify([scope.id, "turn", 0, { message: "Hello" }, "reply:0:fingerprint"]);
function operation(checkpoints: Record<string, unknown> = {}): VenueOperation {
  return {
    id: "turn",
    kind: "turn",
    input: { message: "Hello" },
    token: "owner",
    attemptId: "attempt",
    status: "interrupted",
    stage: "reply",
    startedAt: at,
    sceneRevision: 0,
    snapshot: null,
    checkpoints,
    attempts: {},
    error: "",
  };
}
async function world(f: ReturnType<typeof sceneHistoryFixture>) {
  const { memories: _memories, memoryScenes: _scenes, memoryReceipts: _receipts, ...fields } = defaultVillageState();
  await f.documents.create({
    id: "villages-village",
    packageId: "villages",
    kind: "village",
    name: "World",
    description: "",
    data: {
      ...fields,
      seed: scope.villageSeed,
      setupAt: at,
      foundedAt: at,
      memoryHead: null,
      wishArchiveHead: { count: 0, root: null },
    },
  });
}
function coordinatorFor(f: ReturnType<typeof sceneHistoryFixture>) {
  const logger = { debug() {}, info() {}, warn() {}, error() {} };
  return createVenueCoordinator({
    operations: createVenueOperationContext(() => logger),
    villagesDocuments: () => f.gate.documents,
    villagesLogger: () => logger,
    runtimeDebug() {},
    readInterpretationSettings: async () => coerceInterpretationSettings({}),
    withSceneWork: (_id, work) => f.gate.work(work),
    withRepairWork: (work) => f.gate.work(work),
  });
}
for (const fault of ["before", "after"] as const) {
  const f = sceneHistoryFixture();
  try {
    await world(f);
    await f.mutateDocument("villages-venue-visit-" + scope.id, sessionSlot(f.gate.documents), (scene) =>
      Object.assign(scene, coerceSession({ version: 3, ...scope, status: "active", startedAt: at })),
    );
    const coordinator = () => coordinatorFor(f);
    const first = coordinator(),
      update = f.documents.update;
    f.documents.update = async (input: any) => {
      if (input.id === "villages-venue-visit-" + scope.id && input.data.operation.checkpoints["local-evidence"]) {
        if (fault === "after") await update(input);
        throw Error("Synthetic checkpoint publication acknowledgement failure");
      }
      return update(input);
    };
    let computations = 0;
    await assert.rejects(
      first.coordinateVenue(scope.id, "turn", "turn", {}, 0, undefined, () =>
        first.venueCheckpoint("local-evidence", async () => {
          computations++;
          return { exact: "First accepted café 🌼 evidence" };
        }),
      ),
      /acknowledgement/,
    );
    const retainedScene = f.rows.get("villages-venue-visit-" + scope.id).data;
    const publishedRef = retainedScene.operation.checkpoints["local-evidence"];
    const pendingClaim = retainedScene.operation.checkpointClaims?.["local-evidence"];
    assert(
      publishedRef || pendingClaim,
      "An interrupted checkpoint keeps its result reference or prospective publication claim",
    );
    const expectedBody = publishedRef?.id ?? pendingClaim.bodyId;
    assert(f.rows.has(expectedBody), "The completed parsed checkpoint is physically present before collection");
    if (pendingClaim) {
      const body = f.rows.get(expectedBody),
        payload = body.data.payload;
      body.data.payload = payload.replace("First accepted", "Altered accepted");
      const retainedIds = [...f.rows.keys()];
      await assert.rejects(createOperationEvidence(f.documents).pending(pendingClaim, scope));
      await assert.rejects(collectRetainedStorage(f.gate));
      assert.deepEqual(
        [...f.rows.keys()],
        retainedIds,
        "a corrupted prospective body holds cleanup before any deletion",
      );
      body.data.payload = payload;
    }
    await collectRetainedStorage(f.gate);
    assert(f.rows.has(expectedBody), "Collection preserves a prospective or published checkpoint value");
    if (pendingClaim) {
      const wrongStage = structuredClone(retainedScene.operation);
      wrongStage.checkpointClaims.other = wrongStage.checkpointClaims["local-evidence"];
      delete wrongStage.checkpointClaims["local-evidence"];
      assert.throws(() => operationCheckpointClaims(wrongStage, scope), /invalid checkpoint publication claim/);
    }
    f.documents.update = update;
    const recovered = coordinator();
    await recovered.recoverVenueOperations(async () => {});
    const value = await recovered.coordinateVenue(
      scope.id,
      "turn",
      "turn",
      {},
      undefined,
      undefined,
      () =>
        recovered.venueCheckpoint("local-evidence", async () => {
          computations++;
          return { exact: "Recomputed evidence would be different" };
        }),
      { recovery: true },
    );
    assert.equal(computations, 1, "A durable but unacknowledged parsed checkpoint must not be recomputed");
    assert.deepEqual(value, { exact: "First accepted café 🌼 evidence" });
  } finally {
    f.release();
  }
}

for (const fault of ["before", "after"] as const) {
  const f = sceneHistoryFixture();
  try {
    const receipts = createSceneResponseReceipts(f.gate.documents),
      id = sceneResponseReceiptId(signature);
    const request = await receipts.begin(scope, signature, "first", false);
    const update = f.documents.update;
    f.documents.update = async (input: any) => {
      if (input.id === id && input.data.status === "complete") {
        if (fault === "after") await update(input);
        throw Error("Synthetic response publication acknowledgement failure");
      }
      return update(input);
    };
    const purchased = { content: "Exact purchased café 🌼 reply", finishReason: "stop", usage: { totalTokens: 13 } };
    await assert.rejects(
      f.gate.work(() => receipts.retain(scope, signature, request.claim!, purchased)),
      /acknowledgement/,
    );
    const body = [...f.rows.values()].find((row) => row.kind === OPERATION_EVIDENCE_KIND)!;
    assert(body, "A purchased response is independently retained before Scene adoption");
    await collectRetainedStorage(f.gate);
    assert(f.rows.has(body.id), "Unacknowledged publication remains owned by its saved dispatch claim");
    f.documents.update = update;
    const recovered = await f.gate.work(() => createSceneResponseReceipts(f.gate.documents).read(scope, signature));
    assert.deepEqual(
      recovered!.value,
      purchased,
      "A cold receipt read recovers the purchased response without provider work",
    );
    const receipt = f.rows.get(id).data;
    assert.equal(receipt.dispatched, 1);
    assert.equal(receipt.settled, 1);
    assert.deepEqual(receipt.pending, []);
    await f.gate.work(() => receipts.retain(scope, signature, request.claim!, purchased));
    assert.equal(f.rows.get(id).data.settled, 1, "Duplicate delivery cannot account for a physical response twice");
  } finally {
    f.release();
  }
}

{
  const f = sceneHistoryFixture();
  try {
    await world(f);
    const receipts = createSceneResponseReceipts(f.gate.documents),
      store = operationEvidenceStore(f.gate.documents);
    const claim = (await receipts.begin(scope, signature, "first", false)).claim!;
    const purchased = {
      content: "Private exact response café 🌼 ".repeat(20_000),
      finishReason: "stop",
      usage: { totalTokens: 12 },
    };
    const saved = (await f.gate.work(() => receipts.retain(scope, signature, claim, purchased)))!;
    const op = operation({
      "writing-completion:turn": saved.value,
      parsed: { facts: ["Exact accepted evidence"], version: 1 },
    });
    op.attempts["reply:0:fingerprint"] = {
      status: "complete",
      result: saved.value,
      elapsedMs: 12,
      response: { ...saved.ref, claim: saved.claim },
    };
    await f.mutateDocument("villages-venue-visit-" + scope.id, sessionSlot(f.gate.documents), (scene) =>
      Object.assign(scene, coerceSession({ version: 3, ...scope, status: "active", startedAt: at, operation: op })),
    );
    const native = f.rows.get("villages-venue-visit-" + scope.id).data;
    assert.equal(
      native.operation.attempts["reply:0:fingerprint"].result.id,
      native.operation.checkpoints["writing-completion:turn"].id,
    );
    assert.notEqual(
      native.operation.attempts["reply:0:fingerprint"].result.binding,
      native.operation.checkpoints["writing-completion:turn"].binding,
    );
    assert.equal(native.operation.checkpoints["writing-completion:turn"].id, saved.ref.id);
    assert(
      Buffer.byteLength(JSON.stringify(native.operation)) < 4_000,
      "Native operation writes contain references rather than paid response bodies",
    );
    assert.equal(
      [...f.rows.values()].filter(
        (row) =>
          row.kind === OPERATION_EVIDENCE_KIND &&
          (operationEvidenceValue(row.data) as any)?.content === purchased.content,
      ).length,
      1,
    );
    const logical = await f.repository.readSession(scope.id);
    const stringify = JSON.stringify;
    let serialized = 0;
    JSON.stringify = ((...args: Parameters<typeof JSON.stringify>) => {
      const text = stringify(...args);
      serialized += Buffer.byteLength(text ?? "");
      return text;
    }) as typeof JSON.stringify;
    try {
      applySceneMutation(logical, scope.id, (scene) => {
        scene.operation!.stage = "metadata-only";
      });
    } finally {
      JSON.stringify = stringify;
    }
    assert(
      serialized < 25_000,
      "Ordinary Scene change detection does not serialize retained response/checkpoint bodies",
    );
    f.reset();
    for (let index = 0; index < 40; index++) {
      logical.operation!.stage = "metadata:" + index;
      const encoded = encodeOperationEvidence(logical.operation, scope, native.operation);
      assert.equal(encoded.values.size, 0, "Metadata publication does not serialize or rewrite frozen object bodies");
      await store.encode(logical.operation, scope, native.operation);
    }
    assert.deepEqual(f.metrics(), { readBytes: 0, writtenBytes: 0 });
    const fresh = createOperationEvidence({
      getById: f.gate.documents.getById.bind(f.gate.documents),
      create: f.gate.documents.create.bind(f.gate.documents),
    });
    const cold = await fresh.decode(structuredClone(native.operation), scope);
    assert.deepEqual(cold!.attempts["reply:0:fingerprint"].result, purchased);
    assert(Object.isFrozen(cold!.checkpoints.parsed));
    const wrongStage = structuredClone(native.operation);
    wrongStage.checkpoints.parsed = wrongStage.checkpoints["writing-completion:turn"];
    await assert.rejects(fresh.decode(wrongStage, scope), /another operation or stage/);
    const wrongOperation = { ...native.operation, id: "another-operation" };
    await assert.rejects(fresh.decode(wrongOperation, scope), /another operation or stage/);
    for (const invalid of [null, false, 0, undefined]) {
      const malformed = structuredClone(native.operation);
      malformed.attempts["reply:0:fingerprint"].response = invalid;
      await assert.rejects(fresh.decode(malformed, scope), /invalid object/);
    }
    await assert.rejects(
      fresh.decode(native.operation, { ...scope, villageSeed: "foreign" }),
      /another operation|another Scene/,
    );
    const repair = createRepairService({
      gate: f.gate,
      repository: createVillageRepository(() => f.gate.documents),
      resumeProject: async () => {},
      cancelProject: async () => {},
      replaySaved: async () => {},
      continueSaved: async () => {},
    });
    const parsedId = native.operation.checkpoints.parsed.id;
    await f.repository.changeSession(scope.id, (scene) => {
      scene.status = "closed";
      scene.operation = {
        ...operation({ "abandoned-request": { ...scene.operation!, snapshot: null } }),
        id: "close",
        kind: "close",
        status: "complete",
      };
    });
    const checkpoint = await repair.createCheckpoint("Exact operation evidence", "evidence-checkpoint");
    await f.repository.changeSession(scope.id, (scene) => {
      scene.operation = undefined;
    });
    await collectRetainedStorage(f.gate);
    assert(f.rows.has(parsedId), "A checkpoint owns its exact parsed value after the current operation releases it");
    const restoration = await repair.restore(checkpoint.id, "restore-operation-evidence");
    await repair.apply(restoration.id, restoration.token);
    assert.deepEqual(
      ((await f.repository.readSession(scope.id)).operation!.checkpoints["abandoned-request"] as VenueOperation)
        .checkpoints.parsed,
      {
        facts: ["Exact accepted evidence"],
        version: 1,
      },
    );
    const orphan = prepareOperationValue({ discard: "unpublished" }, scope);
    await f.gate.work(() => store.publish(new Map([[orphan.ref.id, orphan.data]])));
    f.rows.get(parsedId).data.payload += " changed";
    const before = structuredClone(f.rows);
    await assert.rejects(collectRetainedStorage(f.gate), /evidence changed/);
    assert.deepEqual(
      f.rows,
      before,
      "Malformed evidence holds every deletion, including unrelated abandoned allocations",
    );
  } finally {
    f.release();
  }
}

{
  const f = sceneHistoryFixture();
  try {
    const receipts = createSceneResponseReceipts(f.gate.documents);
    const first = (await receipts.begin(scope, signature, "first", false)).claim!;
    const sibling = (await receipts.begin(scope, signature, "second", true)).claim!;
    const old = (await f.gate.work(() =>
      receipts.retain(scope, signature, first, { content: "rejected", finishReason: "length" }),
    ))!;
    await receipts.reject(scope, signature, "first", old.ref);
    await assert.rejects(receipts.begin(scope, signature, "unauthorized", false), /Explicitly retry/);
    assert.equal(
      await f.gate.work(() =>
        receipts.retain(scope, signature, sibling, { content: "old late sibling", finishReason: "stop" }),
      ),
      undefined,
      "Rejection fences older physical claims under the same signature",
    );
    const replacement = (await receipts.begin(scope, signature, "replacement", true)).claim!;
    const next = (await f.gate.work(() =>
      receipts.retain(scope, signature, replacement, { content: "replacement", finishReason: "stop" }),
    ))!;
    const replacementEpoch = f.rows.get(sceneResponseReceiptId(signature)).data.epoch;
    await receipts.reject(scope, signature, "first", old.ref);
    assert.equal(
      f.rows.get(sceneResponseReceiptId(signature)).data.epoch,
      replacementEpoch,
      "A stale duplicate rejection cannot revoke a newer selection",
    );
    assert.notEqual(old.ref.id, next.ref.id);
    assert.deepEqual(
      await operationEvidenceStore(f.gate.documents).read(old.ref, scope, true),
      { content: "rejected", finishReason: "length" },
      "Old immutable response remains independently addressable for checkpoint restoration",
    );
    assert.deepEqual((await receipts.read(scope, signature))!.value, { content: "replacement", finishReason: "stop" });
    const reused = await receipts.begin(scope, signature, "logical-retry-adopts-existing", true);
    assert.equal(reused.cached!.ref.id, next.ref.id);
    await receipts.reject(scope, signature, "logical-retry-adopts-existing", reused.cached!.ref);
    assert.equal(
      await receipts.read(scope, signature),
      undefined,
      "A retry adopting an older physical response can reject that exact selection",
    );
    const finalClaim = (await receipts.begin(scope, signature, "final", true)).claim!;
    await f.gate.work(() => receipts.retain(scope, signature, finalClaim, { content: "final", finishReason: "stop" }));
    const index = f.rows.get(sceneResponseReceiptId(signature));
    for (const invalid of [null, false, 0, undefined]) {
      const malformed = { ...structuredClone(index.data), status: "pending", selected: invalid };
      assert.throws(() => readSceneResponseReceipt(malformed), /invalid object/);
    }
    assert.throws(
      () => readSceneResponseReceipt({ ...structuredClone(index.data), settledDigest: [index.data.settledDigest] }),
      /invalid Scene response receipt/,
    );
    assert.throws(
      () =>
        readSceneResponseReceipt({
          ...structuredClone(index.data),
          dispatched: 0,
          settled: 0,
          settledDigest: "",
          pending: [],
        }),
      /has not settled/,
    );
    const unsettled = structuredClone(index.data);
    unsettled.pending.push({ ...finalClaim });
    unsettled.dispatched++;
    assert.throws(() => readSceneResponseReceipt(unsettled), /has not settled/);
    index.data.selected.token = "another-request";
    await assert.rejects(receipts.read(scope, signature), /another request/);
  } finally {
    f.release();
  }
}
{
  const f = sceneHistoryFixture();
  try {
    const rich = {
      wishContexts: [
        {
          actorId: "ada",
          capturedAt: at,
          fingerprint: "captured",
          wishes: Array.from({ length: 25_000 }, (_, index) =>
            fixtureWish({ wish: "Exact retained wish " + index }, "wish:" + index, at),
          ),
        },
      ],
    };
    const saved = prepareOperationValue(rich, scope);
    await f.gate.work(() => operationEvidenceStore(f.gate.documents).publish(new Map([[saved.ref.id, saved.data]])));
    let nodes = 0;
    const pending: unknown[] = [f.rows.get(saved.ref.id).data];
    while (pending.length) {
      const value = pending.pop();
      nodes++;
      if (value && typeof value === "object") pending.push(...Object.values(value));
      else if (typeof value === "string") assert.equal(value.startsWith("global-gallery:"), false);
    }
    assert(nodes < 32, "A 25k-Wish checkpoint stays opaque to Host native-reference traversal");
    const cold = createOperationEvidence(f.documents);
    assert.deepEqual(
      await cold.read(saved.ref, scope, true),
      rich,
      "Large structured exact evidence round-trips through a cold persisted body",
    );
    for (const value of [undefined, null]) {
      const body = prepareOperationValue(value, scope);
      await f.gate.work(() => cold.publish(new Map([[body.ref.id, body.data]])));
      assert.equal(await createOperationEvidence(f.documents).read(body.ref, scope, true), value);
    }
  } finally {
    f.release();
  }
}
console.log("Operation evidence publication, deduplication, restoration, rejection fencing and cleanup passed.");
for (const durable of [false, true]) {
  const f = sceneHistoryFixture();
  try {
    await world(f);
    await f.mutateDocument("villages-venue-visit-" + scope.id, sessionSlot(f.gate.documents), (scene) =>
      Object.assign(scene, coerceSession({ version: 3, ...scope, status: "active", startedAt: at })),
    );
    const coordinator = coordinatorFor(f);
    await coordinator.coordinateVenue(scope.id, "refused", "turn", {}, 0, undefined, async () => {
      await assert.rejects(
        coordinator.venueCheckpoint("local-refusal", async () => {
          throw Error("Known admission refusal");
        }),
        /Known admission refusal/,
      );
      if (durable)
        await f.repository.changeSession(scope.id, (scene) => {
          scene.rejectedSubmissions = [
            {
              id: "refused",
              inputHash: "exact-input",
              sceneRevision: scene.sceneRevision,
              turnOutcome: "occupancy-unavailable",
            },
          ];
        });
      return { turnOutcome: "occupancy-unavailable" as const };
    });
    const saved = f.rows.get("villages-venue-visit-" + scope.id).data.operation;
    assert.equal(
      saved.status,
      durable ? "complete" : "interrupted",
      "Only an exact durable terminal receipt resolves unfinished local checkpoint work",
    );
    assert.equal(Object.keys(saved.checkpointClaims ?? {}).length, durable ? 0 : 1);
  } finally {
    f.release();
  }
}
{
  const f = sceneHistoryFixture();
  try {
    const store = createOperationEvidence(f.documents),
      bodies = Array.from({ length: 6 }, (_, index) =>
        prepareOperationValue({ text: String(index) + "x".repeat(1024 * 1024) }, scope),
      );
    for (const body of bodies) await store.publish(new Map([[body.ref.id, body.data]]));
    f.reset();
    await store.read(bodies.at(-1)!.ref, scope);
    assert.equal(f.metrics().readBytes, 0, "The most recent small replay stays warm");
    await store.read(bodies[0].ref, scope);
    assert(f.metrics().readBytes > 1024 * 1024, "The hot replay cache evicts by bytes as well as entry count");
  } finally {
    f.release();
  }
}
