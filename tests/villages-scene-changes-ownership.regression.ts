import assert from "node:assert/strict";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { createSceneChanges } from "../packages/villages/src/server/features/scenes/changes-service.js";
import {
  configureSceneChanges,
  readSceneChanges,
  dismissSceneNotice,
  replaySceneChanges,
} from "../packages/villages/src/server/features/scenes/changes.js";
import {
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import {
  createVenueOperationContext,
  type Context,
} from "../packages/villages/src/server/adapters/operations/operation-context-service.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { createExchangeProcessing } from "../packages/villages/src/server/domain/decoding/exchange-codec.js";
import {
  defaultRelationshipState,
  applyRelationshipReview,
} from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { emptyRelationshipReview } from "../packages/villages/src/server/domain/rules/relationship-review.js";
import { relationshipChangeNotices } from "../packages/villages/src/server/domain/rules/relationship-presentation.js";
import type { RelationshipChange } from "../packages/villages/src/server/domain/models/relationship-types.js";
import type { VenueSubmission } from "../packages/villages/src/server/domain/models/scene-model.js";
import type { VillageState } from "../packages/villages/src/server/domain/models/world.js";

type Document = Awaited<ReturnType<CapabilityDocumentStore["list"]>>[number];
const stamp = "2026-10-07T12:00:00.000Z";
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => (resolve = done));
  return { promise, resolve };
}
function submission(id: string, sequence: number): VenueSubmission {
  return {
    id,
    changeSequence: sequence,
    at: stamp,
    mode: "chat",
    message: id,
    targetId: "",
    verdict: null,
    wishId: "",
    wishMemory: "",
    processing: createExchangeProcessing({
      seed: "seed",
      sceneId: "same",
      submissionId: id,
      order: sequence,
      lineIds: [id + ":line"],
      actionReceiptIds: [],
    }),
    recordEvents: [{ id: id + ":notice", kind: "memory", text: id + " notice" }],
  };
}
function fixture(name: string) {
  const world = coerceVillageState({
    ...defaultVillageState(),
    seed: name,
    foundedAt: stamp,
    villagers: [
      {
        characterId: "mara",
        cardSnapshot: { id: "mara", name: "Mara", revision: 1, sourceStatus: "available", capturedAt: stamp },
      },
      {
        characterId: "ivy",
        cardSnapshot: { id: "ivy", name: "Ivy", revision: 1, sourceStatus: "available", capturedAt: stamp },
      },
    ],
  });
  const scene = coerceSession({
    id: "same",
    processingVersion: 1,
    villageSeed: name,
    status: "active",
    placeId: "venue",
    placeName: name,
    startedAt: stamp,
    submissions: [submission("first", 1)],
    lines: [
      {
        id: "first:line",
        speakerId: "mara",
        name: "Mara",
        role: "assistant",
        content: name + " private diagnostic",
        at: stamp,
        contactHidden: true,
        heardBy: ["mara"],
      },
    ],
  });
  for (const turn of scene.submissions) if (turn.processing) turn.processing.seed = name;
  const calls: string[] = [],
    owners: unknown[] = [],
    records: Document[] = [];
  let pauseAt = "",
    failAt = "",
    exact: Error | undefined,
    mutationHook: ((update: (state: VillageState) => void) => void) | undefined,
    replayHook: ((id: string) => void) | undefined;
  const entered = deferred(),
    gate = deferred();
  const operations = createVenueOperationContext(() => {
    throw Error("Metrics must not log");
  });
  function note(call: string) {
    calls.push(call);
    owners.push(scopedActivation());
    if (scopedActivation()?.active === false) throw Error("Original changes connection unavailable");
    if (call === failAt) throw exact;
  }
  async function wait(call: string) {
    if (call !== pauseAt) return;
    pauseAt = "";
    entered.resolve();
    await gate.promise;
    note(call + ":resumed");
  }
  const service = createSceneChanges({
    async readSession(id) {
      note("scene:" + id);
      await wait("scene:" + id);
      return structuredClone(scene);
    },
    async readVillageSnapshot() {
      note("snapshot");
      await wait("snapshot");
      return structuredClone(world);
    },
    async readVillageState() {
      note("world");
      await wait("world");
      return structuredClone(world);
    },
    async mutateVillageState(update) {
      note("mutate");
      mutationHook?.(update);
      update(world);
      return world;
    },
    villagesDocuments() {
      note("documents");
      return {
        async list(packageId, kind) {
          note("list");
          assert.equal(packageId, "villages");
          assert.equal(kind, "background-work");
          await wait("list");
          return structuredClone(records);
        },
      };
    },
    async processSavedExchange(id, turn) {
      note("replay:" + id + ":" + turn);
      await wait("replay:" + id + ":" + turn);
      replayHook?.(turn);
    },
    venueRequestMetrics(operation) {
      note("metrics");
      return operations.venueRequestMetrics(operation);
    },
  });
  const job = (id: string, data: Record<string, unknown>) =>
    records.push({
      id,
      packageId: "villages",
      kind: "background-work",
      name: id,
      description: id,
      data: {
        id,
        seed: name,
        kind: "wish-check",
        input: { sceneId: "same" },
        subjectId: id,
        status: "complete",
        requests: 1,
        usageComplete: true,
        tokens: 7,
        error: "",
        ...data,
      },
      revision: 1,
      createdAt: stamp,
      updatedAt: stamp,
    });
  return {
    world,
    scene,
    calls,
    owners,
    records,
    operations,
    service,
    entered,
    gate,
    job,
    pause(call: string) {
      pauseAt = call;
    },
    fail(call: string, error: Error) {
      failAt = call;
      exact = error;
    },
    onMutation(hook: (update: (state: VillageState) => void) => void) {
      mutationHook = hook;
    },
    onReplay(hook: (id: string) => void) {
      replayHook = hook;
    },
  };
}
function context(name: string): Context {
  return {
    sessionId: "same",
    controller: new AbortController(),
    allowPaid: false,
    scope: name,
    counts: new Map(),
    usedAttemptKeys: new Map(),
    blocked: new Set(),
    operation: {
      id: name,
      kind: "change-interpretation",
      input: {},
      token: name,
      attemptId: name,
      status: "running",
      stage: "interpret",
      startedAt: stamp,
      sceneRevision: 0,
      snapshot: null,
      checkpoints: {},
      attempts: { [name]: { status: "complete", elapsedMs: 3, result: { usage: { requests: 1 } } } },
      error: "",
    },
  };
}
async function main() {
  const read = fixture("seed");
  assert.deepEqual(read.calls, [], "construction is inert");
  read.scene.submissions = [submission("third", 3), submission("first", 1), submission("second", 2)];
  read.scene.submissions[0]!.processing!.domains.memories.status = "failed";
  read.scene.submissions[0]!.processing!.domains.memories.failure = {
    cause: "missing_result",
    stage: "interpretation",
    message: "Synthetic missing saved result",
  };
  read.scene.submissions[1]!.recordEvents!.push({
    id: "hidden-wish",
    kind: "wish",
    text: "hidden",
    wishUpdate: { wishId: "unknown", state: "revealed" },
  });
  for (const [id, sceneId, sequence] of [
    ["here", "same", 1],
    ["global", "other-scene", 2],
    ["dismissed", "same", 3],
  ] as const)
    read.world.exchangeReceipts[id] = {
      id,
      sceneId,
      submissionId: "first",
      domain: "memories",
      at: stamp,
      evidenceIds: [],
      reason: "saved",
      noticeSequence: sequence,
      committedAt: stamp,
      notice: { id, kind: "memory", text: id },
    };
  read.world.noticeSequence = 3;
  read.world.dismissedNoticeIds = ["dismissed"];
  read.job("unknown-usage", { usageComplete: false });
  read.job("prefix", { input: {}, subjectId: "wish-change:same:turn" });
  read.job("other-scene", { input: { sceneId: "other" } });
  read.job("other-world", { seed: "other" });
  read.job("other-kind", { kind: "sprite" });
  const feed = await read.service.readSceneChanges("same", "", 1);
  assert.deepEqual(read.calls, ["scene:same", "snapshot", "documents", "list", "metrics"]);
  assert.equal(feed.backgroundChecks.length, 2);
  assert.equal(feed.backgroundChecks[0]!.tokens, null);
  assert.equal(feed.backgroundChecks[1]!.tokens, 7);
  assert.deepEqual(
    feed.changes.map((x) => x.submissionId),
    ["first"],
  );
  assert.deepEqual(
    feed.changes[0]!.receipts.domainEffects.map((x) => x.id),
    ["here", "dismissed"],
  );
  assert.deepEqual(
    feed.changes[0]!.notices.map((x) => x.id),
    ["first:notice"],
  );
  assert.equal(
    feed.changes[0]!.evidence[0]!.contactHidden,
    true,
    "privileged server diagnostics retain exact saved evidence",
  );
  assert.equal(feed.nextCursor, "1:1:0");
  assert.equal(feed.hasMore, true);
  const second = await read.service.readSceneChanges("same", feed.nextCursor, 1);
  assert.deepEqual(
    second.notices.map((x) => x.id),
    ["global"],
    "notices remain a global Village stream",
  );
  assert.deepEqual(second.changes[0]!.receipts.domainEffects, []);
  assert.equal(second.nextCursor, "2:3:0");
  const third = await read.service.readSceneChanges("same", second.nextCursor, 1);
  assert.equal(third.hasMore, false);
  assert.match(third.unresolved[0]!.reason, /explicitly retry interpretation/);
  assert.equal((await read.service.readSceneChanges("same", third.nextCursor)).changes.length, 0);
  assert(
    !read.calls.includes("world") && !read.calls.includes("mutate") && !read.calls.some((x) => x.startsWith("replay:")),
  );
  for (const cursor of ["-1", "1.2", "wat", "0:0:0:0", "9007199254740992"]) {
    const invalid = fixture("seed");
    await assert.rejects(invalid.service.readSceneChanges("same", cursor), /Invalid changes cursor/);
    assert.deepEqual(invalid.calls, ["scene:same", "snapshot"]);
  }
  const mismatch = fixture("seed");
  mismatch.scene.villageSeed = "different";
  await assert.rejects(mismatch.service.readSceneChanges("same", "wat"), /previous village/);
  assert.deepEqual(mismatch.calls, ["scene:same", "snapshot"]);
  const capped = fixture("seed");
  for (let i = 0; i < 55; i++) capped.job("job-" + i, {});
  assert.equal((await capped.service.readSceneChanges("same")).backgroundChecks.length, 50);

  const relationships = fixture("seed"),
    state = defaultRelationshipState("seed");
  relationships.world.relationshipContext = state;
  const change = (id: string, amount: number): RelationshipChange => ({
    id,
    amount,
    dimension: "warmth",
    ordinary: false,
    fromId: "mara",
    toId: "player",
    reason: "Shared experience",
    lineIds: [id + ":line"],
    disclosed: false,
    contact: true,
  });
  for (const [id, amount] of [
    ["unchanged", 0],
    ["changed", 2],
  ] as const) {
    applyRelationshipReview(
      state,
      { ...emptyRelationshipReview(), changes: [change(id, amount)] },
      relationships.world,
      id,
      stamp,
    );
    const receipt = state.receipts[id]!;
    assert(receipt);
    Object.assign(receipt, {
      sceneId: "other-scene",
      submissionId: id,
      committedAt: stamp,
      noticeSequence: ++state.noticeSequence,
    });
  }
  assert.deepEqual(relationshipChangeNotices([state.receipts.unchanged!], state, relationships.world), []);
  const invisible = await relationships.service.readSceneChanges("same", "50:50:0", 1);
  assert.deepEqual(invisible.notices, []);
  assert.equal(invisible.nextCursor, "50:0:1");
  assert.equal(invisible.hasMore, true);
  const visible = await relationships.service.readSceneChanges("same", invisible.nextCursor, 1);
  assert.equal(visible.notices.length, 1);
  assert.equal(visible.nextCursor, "50:0:2");
  assert.equal(visible.hasMore, false);

  const dismiss = fixture("seed");
  await assert.rejects(dismiss.service.dismissSceneNotice("same", "missing"), /unavailable/);
  assert.deepEqual(dismiss.calls, ["scene:same", "world"]);
  dismiss.calls.length = 0;
  dismiss.onMutation((update) => {
    const losing = structuredClone(dismiss.world);
    update(losing);
    dismiss.world.dismissedNoticeIds = ["concurrent", "first:notice"];
  });
  assert.deepEqual(await dismiss.service.dismissSceneNotice("same", "first:notice"), { dismissed: true });
  assert.deepEqual(dismiss.world.dismissedNoticeIds, ["concurrent", "first:notice"]);
  await dismiss.service.dismissSceneNotice("same", "first:notice");
  assert.equal(
    dismiss.calls.filter((x) => x === "mutate").length,
    2,
    "repeat dismissal retains the original save call",
  );
  const reset = fixture("seed");
  reset.onMutation(() => {
    reset.world.seed = "replacement";
  });
  await assert.rejects(reset.service.dismissSceneNotice("same", "first:notice"), /identity changed/);
  assert.deepEqual(reset.world.dismissedNoticeIds, []);

  const replay = fixture("seed");
  replay.scene.submissions = [
    submission("first", 1),
    submission("done", 2),
    submission("second", 3),
    submission("no-processing", 4),
  ];
  for (const domain of Object.values(replay.scene.submissions[1]!.processing!.domains)) domain.status = "applied";
  replay.scene.submissions[3]!.processing = undefined;
  replay.pause("replay:same:first");
  const pendingReplay = replay.service.replaySceneChanges("same");
  await replay.entered.promise;
  assert.deepEqual(replay.calls, ["scene:same", "replay:same:first"]);
  replay.onReplay((id) => {
    if (id === "first") replay.scene.submissions.push(submission("added-after-start", 5));
  });
  replay.gate.resolve();
  await pendingReplay;
  assert.deepEqual(
    replay.calls.filter((x) => x.startsWith("replay:")),
    ["replay:same:first", "replay:same:first:resumed", "replay:same:second"],
  );
  assert.deepEqual(replay.calls.slice(-5), ["scene:same", "snapshot", "documents", "list", "metrics"]);
  const failedReplay = fixture("seed"),
    exactReplay = Error("Exact saved replay failure");
  failedReplay.scene.submissions.push(submission("later", 2));
  failedReplay.fail("replay:same:first", exactReplay);
  await assert.rejects(failedReplay.service.replaySceneChanges("same"), (error) => error === exactReplay);
  assert.deepEqual(failedReplay.calls, ["scene:same", "replay:same:first"]);
  for (const call of ["scene:same", "snapshot", "list", "mutate"]) {
    const failed = fixture("seed"),
      exact = Error("Exact " + call);
    failed.fail(call, exact);
    await assert.rejects(
      call === "mutate"
        ? failed.service.dismissSceneNotice("same", "first:notice")
        : failed.service.readSceneChanges("same"),
      (error) => error === exact,
    );
  }

  const metrics = fixture("metrics"),
    ownContext = context("owned");
  assert.equal((await metrics.service.readSceneChanges("same")).activeRequest.requests, null);
  const contextual = await metrics.operations.context.run(ownContext, () => metrics.service.readSceneChanges("same"));
  assert.equal(
    contextual.activeRequest.requests![0]!.stage,
    "owned",
    "absent saved operation falls back to supplied live context",
  );
  metrics.scene.operation = context("saved").operation;
  const savedMetrics = await metrics.operations.context.run(ownContext, () => metrics.service.readSceneChanges("same"));
  assert.equal(savedMetrics.activeRequest.requests![0]!.stage, "saved");

  for (const pause of ["scene:same", "snapshot", "list", "world", "replay:same:first"]) {
    const a = createActivationScope(),
      b = createActivationScope(),
      fa = fixture("A"),
      fb = fixture("B");
    const releaseA = a.run(() => configureSceneChanges(fa.service)),
      releaseB = b.run(() => configureSceneChanges(fb.service));
    const clearA = installDefaultActivation(a, () => {});
    fa.pause(pause);
    const pending = fa.operations.context.run(context("A-live"), () =>
      pause === "world"
        ? dismissSceneNotice("same", "first:notice")
        : pause.startsWith("replay:")
          ? replaySceneChanges("same")
          : readSceneChanges("same"),
    );
    await fa.entered.promise;
    const clearB = installDefaultActivation(b, () => {});
    releaseA();
    clearA();
    const current = await fb.operations.context.run(context("B-live"), () => readSceneChanges("same"));
    assert.equal(current.changes[0]!.evidence[0]!.content, "B private diagnostic");
    assert.equal(current.activeRequest.requests![0]!.stage, "B-live");
    fa.gate.resolve();
    const result = await pending;
    if ("changes" in result) {
      assert.equal(result.changes[0]!.evidence[0]!.content, "A private diagnostic");
      assert.equal(result.activeRequest.requests![0]!.stage, "A-live");
    }
    assert(fa.owners.every((owner) => owner === a));
    assert(fb.owners.every((owner) => owner === b));
    assert.equal((await readSceneChanges("same")).sceneId, "same", "old cleanup cannot remove B");
    releaseB();
    clearB();
    a.dispose();
    b.dispose();
  }
  const disposed = createActivationScope(),
    old = fixture("old");
  const release = disposed.run(() => configureSceneChanges(old.service)),
    clear = installDefaultActivation(disposed, () => {});
  old.pause("scene:same");
  const pending = readSceneChanges("same");
  await old.entered.promise;
  disposed.dispose();
  old.gate.resolve();
  await assert.rejects(pending, /Original changes connection unavailable/);
  release();
  clear();
  await assert.rejects(readSceneChanges("same"), /not configured|disposed/);
  console.log(
    "PASS Scene changes ownership, readonly diagnostics, global privacy pagination, serial replay, CAS dismissal and operation-context metrics",
  );
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
