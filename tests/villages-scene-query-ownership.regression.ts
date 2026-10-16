import assert from "node:assert/strict";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { createSceneQueryService } from "../packages/villages/src/server/features/scenes/scene-query-service.js";
import {
  configureSceneQueries,
  readProjectTurnEvidence,
  progressBacklog,
  type SceneQueries,
} from "../packages/villages/src/server/features/scenes/services.js";
import {
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { createExchangeProcessing } from "../packages/villages/src/server/domain/decoding/exchange-codec.js";
import type {
  VenueLine,
  VenueScene,
  VenueSubmission,
} from "../packages/villages/src/server/domain/models/scene-model.js";
import { SESSION_KIND, SESSION_PREFIX } from "../packages/villages/src/server/adapters/storage/scene-slots.js";
type Document = Awaited<ReturnType<CapabilityDocumentStore["list"]>>[number];
const stamp = "2026-10-07T12:00:00.000Z";
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => (resolve = done));
  return { promise, resolve };
}
function line(id: string, extra: Partial<VenueLine> = {}): VenueLine {
  return {
    id,
    speakerId: "mara",
    name: "Mara",
    role: "assistant",
    content: id,
    at: stamp,
    heardBy: ["mara"],
    ...extra,
  };
}
function turn(id: string, extra: Partial<VenueSubmission> = {}): VenueSubmission {
  return {
    id,
    message: "Please help.",
    mode: "chat",
    targetId: "",
    verdict: null,
    wishId: "",
    wishMemory: "",
    at: stamp,
    ...extra,
  };
}
function scene(id = "same", name = "A Venue"): VenueScene {
  return coerceSession({
    id,
    placeId: "venue",
    placeName: name,
    status: "active",
    startedAt: stamp,
    lines: [],
    submissions: [],
    participants: [{ characterId: "mara", name: "Mara", doing: "listening" }],
  });
}
function ownedScene(owner: string): VenueScene {
  const saved = scene("same", owner + " Venue");
  saved.placeId = "venue-" + owner;
  saved.processingVersion = 1;
  saved.villageSeed = owner;
  saved.lines = [line("reply", { content: owner + " reply" })];
  saved.submissions = [
    turn("proof", {
      message: owner + " message",
      zoneIdAtTurn: "zone-" + owner,
      activeIdsAtTurn: ["mara"],
      replyLineIds: ["reply"],
      progressError: owner + " pending",
    }),
  ];
  return saved;
}
function fixture(name: string) {
  const world = coerceVillageState({
    ...defaultVillageState(),
    seed: name,
    foundedAt: stamp,
    venues: [
      { id: "venue", name, classes: ["residence"], occupancy: 1, residentIds: ["mara"], description: "A residence." },
    ],
  });
  const sessions = new Map<string, VenueScene>(),
    records: Document[] = [],
    calls: string[] = [],
    owners: unknown[] = [];
  let paused = false,
    failWorld: Error | undefined,
    failList: Error | undefined;
  const entered = deferred(),
    gate = deferred();
  const note = (call: string) => {
    calls.push(call);
    owners.push(scopedActivation());
    if (scopedActivation()?.active === false) throw Error("Original query connection unavailable.");
  };
  const service = createSceneQueryService({
    async readSession(id) {
      note("session:" + id);
      const found = sessions.get(id);
      if (!found) throw Error("Missing Scene");
      return structuredClone(found);
    },
    async readVillageState() {
      note("world");
      if (paused) {
        paused = false;
        entered.resolve();
        await gate.promise;
        note("world-resumed");
      }
      if (failWorld) throw failWorld;
      return structuredClone(world);
    },
    villagesDocuments() {
      note("documents");
      return {
        async list(packageId, kind) {
          note("list");
          assert.equal(packageId, "villages");
          assert.equal(kind, SESSION_KIND);
          if (failList) throw failList;
          return structuredClone(records);
        },
      };
    },
  });
  const queries: SceneQueries = {
    ...service,
    activeVenueSession: async () => null,
    listVenueVisits: async () => [],
    processSavedExchange: async () => {
      throw Error("Read must not replay an exchange");
    },
  };
  const add = (session: VenueScene) => {
    sessions.set(session.id, session);
    records.push({
      id: SESSION_PREFIX + session.id,
      packageId: "villages",
      kind: SESSION_KIND,
      name,
      description: name,
      data: structuredClone(session),
      revision: 1,
      createdAt: stamp,
      updatedAt: stamp,
    });
  };
  return {
    world,
    sessions,
    records,
    calls,
    owners,
    service,
    queries,
    add,
    entered,
    gate,
    pause() {
      paused = true;
    },
    failWorld(error: Error) {
      failWorld = error;
    },
    failList(error: Error) {
      failList = error;
    },
  };
}
async function main() {
  const f = fixture("A");
  assert.deepEqual(f.calls, [], "construction is inert");
  const saved = scene();
  saved.zoneId = "current-zone";
  saved.submissions = [
    turn("proof", {
      zoneIdAtTurn: "historic-zone",
      activeIdsAtTurn: ["mara", "mara"],
      speechIdsAtTurn: ["visitor", "mara"],
      replyLineIds: [
        "reply-mara",
        "reply-visitor",
        "reply-side",
        "reply-unknown",
        "reply-hidden",
        "reply-report",
        "reply-user",
      ],
      projectInterpretationVersion: 1,
    }),
  ];
  saved.lines = [
    line("before"),
    line("side", { kind: "side" }),
    line("whisper", { kind: "whisper" }),
    line("hidden", { contactHidden: true }),
    line("report", { contactReport: true }),
    line("reply-mara"),
    line("reply-visitor", { speakerId: "visitor" }),
    line("reply-side", { kind: "side" }),
    line("reply-unknown", { speakerId: "unknown" }),
    line("reply-hidden", { contactHidden: true }),
    line("reply-report", { contactReport: true }),
    line("reply-user", { role: "user" }),
  ];
  f.add(saved);
  await assert.rejects(f.service.readProjectTurnEvidence("same", "missing"), /not recorded/);
  assert.deepEqual(f.calls, ["session:same"], "missing submission rejects before world read");
  f.calls.length = 0;
  const evidence = await f.service.readProjectTurnEvidence("same", "proof");
  assert.deepEqual(f.calls, ["session:same", "world"]);
  assert.equal(evidence.zoneId, "historic-zone");
  assert.deepEqual(evidence.activeIdsAtTurn, ["mara", "visitor"]);
  assert.equal(evidence.contextualInterpretation, true);
  assert.deepEqual(
    evidence.contextLines.map((l) => l.id),
    ["before"],
  );
  assert.deepEqual(
    evidence.lines.map((l) => l.id),
    ["reply-mara", "reply-visitor", "reply-side"],
    "reply evidence keeps its distinct existing filters",
  );
  const fallback = scene("fallback");
  fallback.submissions = [turn("fallback")];
  fallback.lines = [
    line("fallback-visible"),
    line("fallback-hidden", { contactHidden: true }),
    line("fallback-report", { contactReport: true }),
    line("fallback-other", { speakerId: "unknown" }),
    line("fallback-wrong-time", { at: "2026-10-07T11:00:00.000Z" }),
  ];
  f.add(fallback);
  const oldShape = await f.service.readProjectTurnEvidence("fallback", "fallback");
  assert.deepEqual(oldShape.activeIdsAtTurn, ["mara"]);
  assert.equal(oldShape.zoneId, "residence");
  assert.deepEqual(
    oldShape.lines.map((l) => l.id),
    ["fallback-visible"],
  );
  const worldFault = Error("Exact world read failure"),
    fault = fixture("fault");
  fault.add(saved);
  fault.failWorld(worldFault);
  await assert.rejects(fault.service.readProjectTurnEvidence("same", "proof"), (cause) => cause === worldFault);
  await assert.rejects(fault.service.progressBacklog(), (cause) => cause === worldFault);
  assert(!fault.calls.includes("documents"), "failed world read does not open documents");

  const backlog = fixture("seed");
  const current = scene("current");
  current.processingVersion = 1;
  current.villageSeed = "seed";
  const pending = createExchangeProcessing({
    seed: "seed",
    sceneId: current.id,
    submissionId: "pending",
    order: 0,
    lineIds: [],
    actionReceiptIds: [],
  });
  const complete = structuredClone(pending);
  for (const domain of Object.values(complete.domains)) domain.status = "applied";
  const failed = structuredClone(complete);
  failed.domains.memories.status = "failed";
  current.submissions = [
    turn("pending", { processing: pending, progressError: "Still pending" }),
    turn("complete", { processing: complete }),
    turn("failed", { processing: failed }),
    turn("plain"),
    turn("processed", { progressProcessedAt: stamp }),
    turn("before-founding", { at: "2026-10-06T12:00:00.000Z" }),
    turn("movement", {
      movement: { operationId: "move", originZoneId: "a", destinationZoneId: "b", transitionLineId: "move-line" },
    }),
  ];
  backlog.add(current);
  const foreign = structuredClone(current);
  foreign.id = "foreign";
  foreign.villageSeed = "other";
  backlog.add(foreign);
  const originalRecords = structuredClone(backlog.records);
  assert.deepEqual(
    await backlog.service.progressBacklog(),
    ["pending", "failed", "plain"].map((submissionId) => ({
      sessionId: "current",
      submissionId,
      at: stamp,
      error: submissionId === "pending" ? "Still pending" : "",
    })),
  );
  assert.deepEqual(
    backlog.calls,
    ["world", "documents", "list"],
    "world precedes lazy listing, with no prune/replay calls",
  );
  assert.deepEqual(backlog.records, originalRecords, "backlog is not a storage mutation");
  const listFault = Error("Exact document list failure"),
    broken = fixture("list-fault");
  broken.failList(listFault);
  await assert.rejects(broken.service.progressBacklog(), (cause) => cause === listFault);
  assert.deepEqual(broken.calls, ["world", "documents", "list"]);

  const a = createActivationScope(),
    b = createActivationScope(),
    first = fixture("A"),
    second = fixture("B");
  first.add(ownedScene("A"));
  second.add(ownedScene("B"));
  const releaseA = a.run(() => configureSceneQueries(first.queries)),
    clearA = installDefaultActivation(a, () => {});
  first.pause();
  const inFlight = progressBacklog();
  await first.entered.promise;
  const releaseB = b.run(() => configureSceneQueries(second.queries)),
    clearB = installDefaultActivation(b, () => {});
  const bEvidence = await readProjectTurnEvidence("same", "proof");
  assert.equal(bEvidence.venueId, "venue-B");
  assert.equal(bEvidence.zoneId, "zone-B");
  assert.equal(bEvidence.message, "B message");
  assert.equal(bEvidence.lines[0]?.content, "B reply");
  assert.equal(second.calls[0], "session:same");
  first.gate.resolve();
  assert.deepEqual(await inFlight, [{ sessionId: "same", submissionId: "proof", at: stamp, error: "A pending" }]);
  assert.deepEqual(first.calls, ["world", "world-resumed", "documents", "list"]);
  assert(first.owners.every((owner) => owner === a));
  assert(second.owners.every((owner) => owner === b));
  a.run(releaseA);
  a.dispose();
  clearA();
  assert.deepEqual(await progressBacklog(), [
    { sessionId: "same", submissionId: "proof", at: stamp, error: "B pending" },
  ]);
  assert(second.calls.includes("list"), "older cleanup retains B dispatch");
  await assert.rejects(
    a.run(() => progressBacklog()),
    /not configured/,
  );
  const missing = createActivationScope();
  await assert.rejects(
    missing.run(() => readProjectTurnEvidence("same", "proof")),
    /not configured/,
  );
  missing.dispose();
  b.run(releaseB);
  b.dispose();
  clearB();
  await assert.rejects(progressBacklog(), /not configured/);
  const retired = createActivationScope(),
    old = fixture("retired");
  old.add(scene());
  retired.run(() => configureSceneQueries(old.queries));
  const clearRetired = installDefaultActivation(retired, () => {});
  old.pause();
  const abandoned = progressBacklog();
  await old.entered.promise;
  retired.dispose();
  old.gate.resolve();
  await assert.rejects(abandoned, /Original query connection unavailable/);
  assert(!old.calls.includes("documents"), "retired world connection does not borrow another document store");
  clearRetired();

  const c = createActivationScope(),
    d = createActivationScope(),
    older = fixture("C"),
    newer = fixture("D");
  older.add(ownedScene("C"));
  newer.add(ownedScene("D"));
  const releaseC = c.run(() => configureSceneQueries(older.queries)),
    clearC = installDefaultActivation(c, () => {});
  older.pause();
  const heldEvidence = readProjectTurnEvidence("same", "proof");
  await older.entered.promise;
  const releaseD = d.run(() => configureSceneQueries(newer.queries)),
    clearD = installDefaultActivation(d, () => {});
  assert.equal((await readProjectTurnEvidence("same", "proof")).message, "D message");
  older.gate.resolve();
  const cEvidence = await heldEvidence;
  assert.equal(cEvidence.venueId, "venue-C");
  assert.equal(cEvidence.zoneId, "zone-C");
  assert.equal(cEvidence.message, "C message");
  assert.equal(cEvidence.lines[0]?.content, "C reply");
  assert.deepEqual(older.calls, ["session:same", "world", "world-resumed"]);
  assert(older.owners.every((owner) => owner === c));
  assert(newer.owners.every((owner) => owner === d));
  c.run(releaseC);
  c.dispose();
  clearC();
  d.run(releaseD);
  d.dispose();
  clearD();
  console.log(
    "Scene evidence/backlog inertness, historical witness/privacy filters, authoritative progress gates and activation-bound lazy query connections passed without providers.",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
