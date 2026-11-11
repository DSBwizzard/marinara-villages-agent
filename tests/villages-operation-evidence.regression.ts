import assert from "node:assert/strict";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import type { VenueOperation } from "../packages/villages/src/server/domain/models/operation-model.js";
import { applySceneMutation } from "../packages/villages/src/server/domain/rules/scene-mutation.js";
import { createVenueCoordinator } from "../packages/villages/src/server/jobs/venue-coordinator-service.js";
import { createVenueOperationContext } from "../packages/villages/src/server/adapters/operations/operation-context-service.js";
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
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
import { createSceneWorkFence } from "../packages/villages/src/server/jobs/scene-work-fence.js";

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
  await createVillageRepository(() => f.gate.documents).mutateAuthority(
    (state) => {
      Object.assign(state, {
        seed: scope.villageSeed,
        setupAt: at,
        foundedAt: at,
      });
    },
    { memories: true },
  );
}
function coordinatorFor(f: ReturnType<typeof sceneHistoryFixture>) {
  const logger = { debug() {}, info() {}, warn() {}, error() {} };
  const fence = createSceneWorkFence();
  return createVenueCoordinator({
    operations: createVenueOperationContext(() => logger),
    villagesDocuments: () => f.gate.documents,
    villagesLogger: () => logger,
    runtimeDebug() {},
    withSceneWork: (id, work) => fence.run(id, work),
    withRepairWork: (work) => f.gate.work(work),
  });
}
for (const fault of ["before", "after"] as const) {
  const f = sceneHistoryFixture();
  try {
    await world(f);
    const repository = createVillageRepository(() => f.gate.documents);
    const baseline = await repository.readAuthority({ memories: true });
    const capturedScene = coerceSession({ version: 5, ...scope, status: "active", startedAt: at });
    capturedScene.continuity = captureSceneContinuity(baseline, capturedScene, Date.parse(at));
    const capturedSources = [{ id: "fitted-source", text: "Exact unacknowledged capture café 東京", revision: 1 }];
    await f.mutateDocument("villages-venue-visit-" + scope.id, sessionSlot(f.gate.documents), (scene) =>
      Object.assign(scene, capturedScene),
    );
    const coordinator = () => coordinatorFor(f);
    const first = coordinator(),
      update = f.documents.update;
    const originalPages = new Set(f.rows.keys());
    let publicationStarted = false,
      unsafePublicationGaps = 0;
    const stop = f.gate.whenIdle(() => {
      if (
        !publicationStarted ||
        !f.gate.isIdle() ||
        ![...f.rows.values()].some((row) => row.kind === OPERATION_EVIDENCE_KIND && !originalPages.has(row.id))
      )
        return;
      const operation = f.rows.get("villages-venue-visit-" + scope.id)?.data.operation;
      const reference = operation?.checkpoints?.["local-evidence"],
        pending = operation?.checkpointClaims?.["local-evidence"];
      if (!(reference && f.rows.has(reference.id)) && !(pending && f.rows.has(pending.bodyId))) unsafePublicationGaps++;
    });
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
          publicationStarted = true;
          return { exact: "First accepted café 🌼 evidence", fittedSources: capturedSources };
        }),
      ),
      /acknowledgement/,
    );
    stop();
    assert.equal(
      unsafePublicationGaps,
      0,
      "Cleanup never sees idle storage between creating evidence and its published checkpoint owner",
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
    assert.equal(value.exact, "First accepted café 🌼 evidence");
    assert.deepEqual(
      (value as any).fittedSources,
      capturedSources,
      "Cold recovery retains the exact final fitted readset",
    );
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
      Object.assign(scene, coerceSession({ version: 5, ...scope, status: "active", startedAt: at, operation: op })),
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
    });
    const parsedId = native.operation.checkpoints.parsed.id;
    const abandonedHead = structuredClone(native.operation);
    await f.repository.changeSession(scope.id, (scene) => {
      scene.status = "closed";
      scene.abandonedOperations = [
        { ...abandonedHead, status: "complete", snapshot: null } as unknown as VenueOperation,
      ];
      scene.operation = {
        ...operation(),
        id: "close",
        kind: "close",
        status: "complete",
      };
    });
    const checkpoint = await repair.createCheckpoint("Exact operation evidence", "evidence-checkpoint");
    await f.repository.changeSession(scope.id, (scene) => {
      scene.operation = undefined;
      scene.abandonedOperations = [];
    });
    await collectRetainedStorage(f.gate);
    assert(f.rows.has(parsedId), "A checkpoint owns its exact parsed value after the current operation releases it");
    const restoration = await repair.restore(checkpoint.id, "restore-operation-evidence");
    await repair.apply(restoration.id, restoration.token);
    assert.deepEqual(
      (await store.decode((await f.repository.readSession(scope.id)).abandonedOperations![0], scope))!.checkpoints
        .parsed,
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
      fittedSources: Array.from({ length: 64 }, (_, index) => ({
        id: "source-" + index,
        text: "Complete fitted meaning " + index,
      })),
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
    assert(nodes < 32, "Fitted continuity stays opaque to Host native-reference traversal");
    const cold = createOperationEvidence(f.documents);
    const restored = (await cold.read(saved.ref, scope, true)) as typeof rich;
    assert.deepEqual(restored, rich, "Cold recovery retains all and only the actual fitted evidence");
    for (const value of [undefined, null]) {
      const body = prepareOperationValue(value, scope);
      await f.gate.work(() => cold.publish(new Map([[body.ref.id, body.data]])));
      assert.equal(await createOperationEvidence(f.documents).read(body.ref, scope, true), value);
    }
  } finally {
    f.release();
  }
}
{
  const f = sceneHistoryFixture();
  try {
    await world(f);
    await f.mutateDocument("villages-venue-visit-" + scope.id, sessionSlot(f.gate.documents), (scene) =>
      Object.assign(scene, coerceSession({ version: 5, ...scope, status: "active", startedAt: at })),
    );
    const coordinator = coordinatorFor(f);
    const retained = new Map<string, unknown>();
    let prior: VenueOperation | undefined;
    for (let index = 0; index < 4; index++) {
      const id = "edited-" + index,
        exact = { original: "Exact private draft " + index + " 🌼", fit: "x".repeat(20_000) };
      await assert.rejects(
        coordinator.coordinateVenue(
          scope.id,
          id,
          "turn",
          { message: exact.original },
          0,
          prior?.attemptId,
          async () => {
            const captured = await coordinator.venueCheckpoint("writing-request", async () => exact);
            assert.deepEqual(captured, exact);
            throw Error("Purchased response cannot publish");
          },
          prior ? { replaceOfOperationId: prior.id } : {},
        ),
        /cannot publish/,
      );
      const raw = f.rows.get("villages-venue-visit-" + scope.id).data;
      assert.equal(raw.operation.status, "interrupted");
      retained.set(raw.operation.checkpoints["writing-request"].id, exact);
      prior = (await f.repository.readSession(scope.id)).operation;
      assert.equal(raw.abandonedOperations?.length ?? 0, index);
      assert(!raw.operation.snapshot.abandonedOperations, "admitted snapshots do not copy archival heads");
    }
    await coordinator.cancelVenueOperation(scope.id);
    const cancelled = await f.repository.readSession(scope.id);
    assert.equal(
      cancelled.abandonedOperations?.length,
      4,
      "repeated replacements and final cancellation retain every exact purchase",
    );
    await collectRetainedStorage(f.gate);
    const store = createOperationEvidence(f.documents);
    for (const head of cancelled.abandonedOperations!) {
      const ref = head.checkpoints["writing-request"] as { id: string };
      assert(f.rows.has(ref.id));
      assert.deepEqual((await store.decode(head, scope))!.checkpoints["writing-request"], retained.get(ref.id));
    }
    await f.repository.changeSession(scope.id, (scene) => {
      scene.status = "closed";
    });
    await collectRetainedStorage(f.gate);
    assert(
      [...retained.keys()].every((id) => f.rows.has(id)),
      "closing preserves archived purchase ownership",
    );
  } finally {
    f.release();
  }
}
{
  const f = sceneHistoryFixture();
  try {
    await world(f);
    await f.mutateDocument("villages-venue-visit-" + scope.id, sessionSlot(f.gate.documents), (scene) =>
      Object.assign(scene, coerceSession({ version: 5, ...scope, status: "active", startedAt: at })),
    );
    const coordinator = coordinatorFor(f);
    let localRuns = 0;
    await coordinator.coordinateVenue(scope.id, "refused", "turn", {}, 0, undefined, async () => {
      await assert.rejects(
        coordinator.venueCheckpoint("local-refusal", async () => {
          localRuns++;
          throw Error("Known admission refusal");
        }),
        /Known admission refusal/,
      );
      return { finished: true };
    });
    const interrupted = (await f.repository.readSession(scope.id)).operation!;
    assert.equal(
      interrupted.status,
      "interrupted",
      "returning from the caller cannot erase unfinished checkpoint work",
    );
    assert.equal(Object.keys(interrupted.checkpointClaims ?? {}).length, 1);
    await collectRetainedStorage(f.gate);
    const retained = (await f.repository.readSession(scope.id)).operation!;
    assert.deepEqual(retained.checkpointClaims, interrupted.checkpointClaims, "cleanup preserves the unresolved claim");

    const recovered = await coordinator.coordinateVenue(
      scope.id,
      "refused",
      "turn",
      {},
      0,
      interrupted.attemptId,
      async () => {
        const result = await coordinator.venueCheckpoint("local-refusal", async () => {
          localRuns++;
          return { applied: "Exact recovered local result" };
        });
        const saved = (await f.repository.readSession(scope.id)).operation!;
        assert.deepEqual(
          saved.checkpoints["local-refusal"],
          result,
          "the local result is durable before the caller resumes",
        );
        assert.equal(Object.keys(saved.checkpointClaims ?? {}).length, 0);
        return result;
      },
    );
    assert.deepEqual(recovered, { applied: "Exact recovered local result" });
    assert.equal(localRuns, 2, "only explicit saved-request retry reruns the unfinished local work");
    const completed = (await f.repository.readSession(scope.id)).operation!;
    assert.equal(completed.status, "complete");
    assert.equal(Object.keys(completed.checkpointClaims ?? {}).length, 0);
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

console.log(
  "Native operation evidence publication, recovery, ownership fencing, checkpoint claims and cleanup passed.",
);
