import assert from "node:assert/strict";
import { createSceneProgress } from "../packages/villages/src/server/features/scenes/progress-service.js";
import {
  configureSceneProgress,
  processSavedExchange,
  processSavedProgressSubmission,
  startProgressRecovery,
} from "../packages/villages/src/server/features/scenes/progress.js";
import {
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { createExchangeProcessing } from "../packages/villages/src/server/domain/decoding/exchange-codec.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { applySceneMutation } from "../packages/villages/src/server/domain/rules/scene-mutation.js";
import { createProgressTask } from "../packages/villages/src/server/domain/rules/progress-engine.js";
import { dispatchExchange } from "../packages/villages/src/server/features/scenes/exchange-processing.js";
import { createLiveEvidenceContext } from "../packages/villages/src/server/features/residents/live-memory.js";
import type { VenueLine, VenueScene } from "../packages/villages/src/server/domain/models/scene-model.js";
import type { DomainProcessing, ExchangeDomain } from "../packages/villages/src/server/domain/models/exchange-model.js";
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => (resolve = done));
  return { promise, resolve };
}
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
async function bounded(promise: Promise<void>) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(Error("Startup fixture timed out")), 2000);
      }),
    ]);
  } finally {
    clearTimeout(timeout);
  }
}
function fixture(name: string) {
  const stamp = new Date().toISOString(),
    world = defaultVillageState();
  world.seed = name;
  world.setupAt = stamp;
  world.foundedAt = stamp;
  const calls: string[] = [],
    owners: unknown[] = [],
    scenes = new Map<string, VenueScene>(),
    warnings: string[] = [],
    results = new Map<ExchangeDomain, Partial<DomainProcessing>>();
  let pauseAt = "",
    failureAt = "",
    failure: Error | undefined,
    beforeChange: (() => void) | undefined,
    receiptHook: (() => void) | undefined,
    speechHook: (() => void) | undefined,
    completedHook: (() => void) | undefined;
  const entered = deferred(),
    gate = deferred(),
    queue: { sessionId: string; submissionId: string }[] = [];
  const note = (call: string) => {
    calls.push(call);
    owners.push(scopedActivation());
    if (scopedActivation()?.active === false) throw Error("Original replay connection unavailable");
    if (call === failureAt) throw failure;
  };
  async function wait(call: string) {
    if (pauseAt !== call) return;
    pauseAt = "";
    entered.resolve();
    await gate.promise;
    note(call + ":resumed");
  }
  function add(id = "same") {
    const saved = coerceSession({
      id,
      placeId: "venue",
      placeName: name,
      villageSeed: name,
      processingVersion: 1,
      status: "active",
      startedAt: stamp,
      participants: [{ characterId: "mara", name: name + " Mara", doing: "listening" }],
      lines: [
        {
          id: "reply",
          role: "assistant",
          speakerId: "mara",
          name: name + " Mara",
          content: name + " reply",
          at: stamp,
          heardBy: ["mara"],
        },
      ],
      submissions: [
        {
          id: "turn",
          mode: "chat",
          message: name + " message",
          at: stamp,
          replyLineIds: ["reply"],
          activeIdsAtTurn: ["mara"],
          areaAtTurn: "public",
        },
      ],
    });
    saved.submissions[0]!.processing = createExchangeProcessing({
      seed: name,
      sceneId: id,
      submissionId: "turn",
      order: 0,
      lineIds: ["reply"],
      actionReceiptIds: [],
    });
    scenes.set(id, saved);
    return saved;
  }
  const saved = add(),
    turn = () => scenes.get("same")!.submissions[0]!;
  const service = createSceneProgress({
    async readVillageState() {
      note("world");
      await wait("world");
      return structuredClone(world);
    },
    async readSession(id) {
      note("read:" + id);
      const scene = scenes.get(id);
      if (!scene) throw Error("Missing replay Scene");
      return structuredClone(scene);
    },
    async mutateVillageState(change) {
      note("world-change");
      change(world);
      return structuredClone(world);
    },
    async changeSession(id, change) {
      note("change:" + id);
      beforeChange?.();
      beforeChange = undefined;
      const scene = structuredClone(scenes.get(id)!);
      if (applySceneMutation(scene, id, change) !== false) scenes.set(id, scene);
      completedHook?.();
      return scene;
    },
    async processProjectSpeechTurn(sceneId, turnId) {
      note("speech:" + sceneId + ":" + turnId);
      await wait("speech");
      speechHook?.();
    },
    async measurePipeline(label, identity, work) {
      note("measure:" + label);
      assert(identity.sceneId);
      return work();
    },
    async applySavedAccessEvents(scene) {
      note("access");
      assert.equal(scene.placeName, name);
    },
    async recordSpokenInvitation(scene) {
      note("invitation");
      assert.equal(scene.placeName, name);
    },
    createLiveEvidenceContext,
    async applyVenueTurnChange(scene) {
      note("physical");
      assert.equal(scene.placeName, name);
    },
    async applyProjectPickup() {
      note("pickup");
    },
    async processWishExchange(scene) {
      note("wishes");
      assert.equal(scene.placeName, name);
      return { reason: name + " wishes", ...results.get("wishes") };
    },
    async processLiveMemories(scene) {
      note("memories");
      assert.equal(scene.placeName, name);
      return { reason: name + " memories", ...results.get("memories") };
    },
    async processLiveRelationships(scene) {
      note("relationships");
      assert.equal(scene.placeName, name);
      return { reason: name + " relationships", ...results.get("relationships") };
    },
    runtimeDebug(event, detail) {
      note("debug:" + event);
      assert.equal(scenes.get((detail as { sceneId: string }).sceneId)?.placeName, name);
    },
    async receiptForTurn(scene, _turn, persist) {
      note("receipt");
      assert.equal(scene.placeName, name);
      assert.equal(persist, false);
      receiptHook?.();
      return [];
    },
    async dispatchExchange(processing, handlers, save) {
      note("dispatch");
      return dispatchExchange(processing, handlers, save);
    },
    async processProjectWishOutbox() {
      note("wish-outbox");
      await wait("wish-outbox");
    },
    sceneQueries() {
      note("queries");
      return {
        async progressBacklog() {
          note("backlog");
          return structuredClone(queue.map((turn) => ({ ...turn, at: stamp, error: "" })));
        },
      };
    },
    villagesLogger() {
      note("logger");
      return {
        debug() {},
        info() {},
        error() {},
        debugOverride() {},
        warn(message, ...args) {
          warnings.push([message, ...args].join(" "));
        },
      };
    },
  });
  return {
    name,
    saved,
    turn,
    world,
    scenes,
    calls,
    owners,
    warnings,
    service,
    queue,
    add,
    entered,
    gate,
    pause(call: string) {
      pauseAt = call;
    },
    fail(call: string, error: Error) {
      failureAt = call;
      failure = error;
    },
    onChange(work: () => void) {
      beforeChange = work;
    },
    onReceipt(work: () => void) {
      receiptHook = work;
    },
    onSpeech(work: () => void) {
      speechHook = work;
    },
    onCompleted(work: () => void) {
      completedHook = work;
    },
    result(domain: ExchangeDomain, value: Partial<DomainProcessing>) {
      results.set(domain, value);
    },
  };
}
function automaticTask(f: ReturnType<typeof fixture>) {
  f.world.progressTasks.push(
    createProgressTask(
      {
        id: "evidence",
        revision: 1,
        owner: { kind: "test", id: "evidence" },
        resolver: "progress.noop",
        phases: [
          {
            id: "heard",
            title: "Hear",
            requirements: [
              {
                id: "line",
                title: "Line",
                routes: [
                  {
                    id: "saved",
                    verifier: "core.saved-event",
                    params: { venueId: "venue", speakerId: "mara" },
                    automatic: true,
                    evidenceKinds: ["saved-resident-line"],
                  },
                ],
              },
            ],
          },
        ],
      },
      "",
      f.saved.startedAt,
    ),
  );
}
async function main() {
  const replay = fixture("replay");
  assert.deepEqual(replay.calls, [], "construction is inert");
  await replay.service.processSavedExchange("same", "turn");
  assert.deepEqual(
    replay.calls.filter((call) => ["physical", "wishes", "memories", "relationships"].includes(call)),
    ["physical", "wishes", "memories", "relationships"],
  );
  assert(replay.turn().progressProcessedAt);
  assert(Object.values(replay.turn().processing!.domains).every((row) => row.status === "applied"));
  replay.calls.length = 0;
  await replay.service.processSavedExchange("same", "turn");
  assert(
    !replay.calls.some((call) =>
      ["physical", "speech:same:turn", "wishes", "memories", "relationships"].includes(call),
    ),
    "terminal replay does not repeat domain work",
  );
  const movement = fixture("movement");
  movement.turn().movement = {
    operationId: "move",
    originZoneId: "exterior",
    destinationZoneId: "gathering",
    transitionLineId: "transition",
  };
  movement.turn().accessEvents = [
    {
      id: "access",
      facts: { actorId: "mara", venueId: "venue", zoneId: "gathering", accessRevision: 0 },
      outcome: "allowed",
      evidenceIds: ["reply"],
    },
  ];
  movement.turn().invitationSignal = {
    residentId: "mara",
    venueId: "venue",
    quote: "come",
    scope: "shared",
    ownerId: "mara",
    timing: "now",
  };
  await movement.service.processSavedExchange("same", "turn");
  assert.deepEqual(
    movement.calls,
    ["measure:saved exchange", "read:same", "access", "invitation"],
    "saved access/invitation precede movement return",
  );
  for (const field of ["seed", "scene", "submission"] as const) {
    const changed = fixture("changed");
    if (field === "seed") changed.world.seed = "replacement";
    else if (field === "scene") changed.turn().processing!.sceneId = "another";
    else changed.turn().processing!.submissionId = "another";
    await changed.service.processSavedExchange("same", "turn");
    assert(Object.values(changed.turn().processing!.domains).every((row) => row.status === "rejected"));
    assert(!changed.calls.some((call) => ["physical", "wishes", "memories", "relationships"].includes(call)));
  }
  const evidence = fixture("evidence");
  automaticTask(evidence);
  const base = evidence.saved.lines[0]!;
  const variants: VenueLine[] = [
    { ...base, id: "hidden", contactHidden: true },
    { ...base, id: "report", contactReport: true },
    { ...base, id: "unknown", speakerId: "unknown" },
    { ...base, id: "unselected" },
  ];
  evidence.saved.lines.push(...variants);
  evidence.turn().replyLineIds!.push("hidden", "report", "unknown");
  await evidence.service.processSavedProgressSubmission("same", "turn");
  const receipts = evidence.world.progressTasks[0]!.receipts;
  assert.equal(receipts.length, 1);
  assert.equal(receipts[0]!.evidence.lineId, "reply");
  assert.equal(receipts[0]!.evidence.excerpt, "evidence reply");
  await evidence.service.processSavedProgressSubmission("same", "turn");
  assert.equal(receipts.length, 1, "completed progress is not repeated");
  for (const reason of ["movement", "complete", "missing-time", "old-world"] as const) {
    const skipped = fixture("skipped");
    if (reason === "movement")
      skipped.turn().movement = {
        operationId: "move",
        originZoneId: "exterior",
        destinationZoneId: "gathering",
        transitionLineId: "transition",
      };
    else if (reason === "complete") skipped.turn().progressProcessedAt = skipped.saved.startedAt;
    else if (reason === "missing-time") skipped.turn().at = "";
    else skipped.turn().at = "2020-01-01T00:00:00.000Z";
    await skipped.service.processSavedProgressSubmission("same", "turn");
    assert.deepEqual(skipped.calls, ["world", "read:same"]);
  }
  const failed = fixture("failed"),
    exact = Error("Exact speech failure");
  failed.fail("speech:same:turn", exact);
  await assert.rejects(failed.service.processSavedProgressSubmission("same", "turn"), (error) => error === exact);
  assert.equal(failed.turn().progressError, "Error: Exact speech failure");
  assert(!failed.turn().progressProcessedAt);
  const isolated = fixture("isolated");
  isolated.fail("speech:same:turn", exact);
  await isolated.service.processSavedExchange("same", "turn");
  assert.equal(isolated.turn().processing!.domains.projects.status, "failed");
  assert.equal(
    isolated.turn().processing!.domains.relationships.status,
    "applied",
    "failed Project application does not block later domains",
  );
  const terminal = fixture("terminal");
  terminal.result("wishes", { status: "pending", reason: "waiting" });
  terminal.onReceipt(() => {
    terminal.turn().processing!.domains.wishes.status = "applied";
    terminal.turn().processing!.domains.wishes.reason = "Concurrent completed receipt";
  });
  await terminal.service.processSavedExchange("same", "turn");
  assert.equal(terminal.turn().processing!.domains.wishes.status, "applied");
  assert.equal(terminal.turn().processing!.domains.wishes.reason, "Concurrent completed receipt");
  const staleBookkeeping = fixture("stale-bookkeeping");
  staleBookkeeping.onReceipt(() => {
    staleBookkeeping.turn().processing!.seed = "replacement";
  });
  await staleBookkeeping.service.processSavedExchange("same", "turn");
  assert.equal(
    staleBookkeeping.turn().processing!.domains.wishes.status,
    "pending",
    "final save cannot apply bookkeeping to a replacement exchange",
  );
  const physical = fixture("physical");
  physical.turn().physicalOutcomeVersion = 1;
  await physical.service.processSavedExchange("same", "turn");
  assert.equal(physical.turn().processing!.domains.projects.status, "rejected");
  assert.equal(physical.turn().processing!.domains.wishes.status, "rejected");
  assert(!physical.calls.includes("speech:same:turn"));
  assert(!physical.calls.includes("pickup"));
  const pickup = fixture("pickup");
  pickup.turn().physicalOutcomeVersion = 1;
  pickup.turn().action = { happened: true, narration: "Picked up timber" };
  pickup.world.venueEvents.push({
    id: "venue-chat:same:turn",
    venueId: "venue",
    venueName: "Workshop",
    at: pickup.saved.startedAt,
    text: "Picked up timber",
    actionReceipt: { submissionId: "turn", happened: true, narration: "Picked up timber" },
  });
  await pickup.service.processSavedExchange("same", "turn");
  assert(pickup.calls.indexOf("physical") < pickup.calls.indexOf("pickup"));
  assert(pickup.calls.indexOf("pickup") < pickup.calls.indexOf("speech:same:turn"));
  assert.equal(pickup.turn().processing!.domains.projects.status, "applied");
  const missingTurn = fixture("missing-turn");
  await missingTurn.service.processSavedProgressSubmission("same", "missing");
  assert.deepEqual(missingTurn.calls, ["world", "read:same"]);
  for (const kind of ["progress", "exchange"] as const) {
    const a = createActivationScope(),
      b = createActivationScope(),
      first = fixture("A"),
      second = fixture("B");
    const releaseA = a.run(() => configureSceneProgress(first.service)),
      clearA = installDefaultActivation(a, () => {});
    first.pause(kind === "progress" ? "world" : "speech");
    const pending =
      kind === "progress" ? processSavedProgressSubmission("same", "turn") : processSavedExchange("same", "turn");
    await first.entered.promise;
    const releaseB = b.run(() => configureSceneProgress(second.service)),
      clearB = installDefaultActivation(b, () => {});
    first.gate.resolve();
    await pending;
    assert(first.turn().progressProcessedAt);
    assert.deepEqual(second.calls, []);
    assert(first.owners.every((owner) => owner === a));
    a.run(releaseA);
    a.dispose();
    clearA();
    await processSavedExchange("same", "turn");
    assert.equal(second.turn().processing!.domains.wishes.reason, "B wishes");
    assert(second.owners.every((owner) => owner === b));
    await assert.rejects(
      a.run(() => processSavedExchange("same", "turn")),
      /not configured/,
    );
    const missing = createActivationScope();
    await assert.rejects(
      missing.run(() => processSavedExchange("same", "turn")),
      /not configured/,
    );
    missing.dispose();
    b.run(releaseB);
    b.dispose();
    clearB();
    await assert.rejects(processSavedExchange("same", "turn"), /not configured/);
  }
  const stopped = fixture("stopped");
  stopped.queue.push({ sessionId: "same", submissionId: "turn" });
  stopped.pause("wish-outbox");
  const stop = stopped.service.startProgressRecovery();
  assert.equal(typeof stop, "function", "startup returns synchronous cleanup");
  await stopped.entered.promise;
  stop();
  stopped.gate.resolve();
  await delay(40);
  assert(stopped.calls.includes("backlog"), "stop retains the existing in-flight outbox/backlog policy");
  assert(!stopped.calls.includes("read:same"));
  const batch = fixture("batch");
  for (let i = 0; i < 17; i++) {
    const id = i === 0 ? "same" : "scene" + i;
    if (i) batch.add(id);
    batch.queue.push({ sessionId: id, submissionId: "turn" });
  }
  let count = 0;
  const eight = deferred();
  const stopBatch = batch.service.startProgressRecovery();
  batch.onSpeech(() => {
    if (++count === 8) {
      stopBatch();
      eight.resolve();
    }
  });
  await bounded(eight.promise);
  await delay(60);
  stopBatch();
  assert.equal(count, 8, "stop during first batch prevents ninth admission and next timer");
  const repeated = fixture("repeated");
  const stopOne = repeated.service.startProgressRecovery(),
    stopTwo = repeated.service.startProgressRecovery();
  stopOne();
  stopTwo();
  await delay(30);
  assert.equal(repeated.calls.filter((call) => call === "wish-outbox").length, 2, "each start retains its own closure");
  assert.equal(repeated.calls.filter((call) => call === "backlog").length, 2);
  const a = createActivationScope(),
    b = createActivationScope(),
    first = fixture("timer-A"),
    second = fixture("timer-B");
  first.queue.push({ sessionId: "same", submissionId: "turn" });
  first.pause("wish-outbox");
  for (let i = 0; i < 9; i++) {
    const id = i === 0 ? "same" : "scene" + i;
    if (i) second.add(id);
    second.queue.push({ sessionId: id, submissionId: "turn" });
  }
  second.pause("speech");
  const releaseA = a.run(() => configureSceneProgress(first.service)),
    clearA = installDefaultActivation(a, () => {});
  const completed = deferred();
  first.onCompleted(() => {
    if (first.turn().processing!.domains.relationships.status === "applied") completed.resolve();
  });
  const stopA = startProgressRecovery();
  await first.entered.promise;
  const releaseB = b.run(() => configureSceneProgress(second.service)),
    clearB = installDefaultActivation(b, () => {});
  const completedB = deferred();
  second.onCompleted(() => {
    if (second.scenes.get("scene8")!.submissions[0]!.processing!.domains.relationships.status === "applied")
      completedB.resolve();
  });
  const stopB = startProgressRecovery();
  await second.entered.promise;
  first.gate.resolve();
  await bounded(completed.promise);
  stopA();
  assert(
    first.owners.every((owner) => owner === a),
    "startup callbacks/timers retain their originating activation",
  );
  assert.equal(second.calls.filter((call) => call === "speech:same:turn").length, 1);
  second.gate.resolve();
  await bounded(completedB.promise);
  stopB();
  assert.equal(
    second.calls.filter((call) => /^speech:[^:]+:turn$/u.test(call)).length,
    9,
    "older A stop does not fence B's second batch",
  );
  assert(second.owners.every((owner) => owner === b));
  a.run(releaseA);
  a.dispose();
  clearA();
  b.run(releaseB);
  b.dispose();
  clearB();
  console.log("PASS Scene saved-exchange/recovery ownership, evidence privacy, ordered receipts and startup cleanup");
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
