import assert from "node:assert/strict";
import { readNarrationSubmission } from "../packages/villages/src/server/domain/decoding/narration-submission.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import {
  narrationContinuityContext,
  fittedNarrationReadset,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import { mock } from "node:test";
import { withProviderDeadline } from "../packages/villages/src/server/adapters/models/provider-deadline.js";
import { readPrivateDiagnostics } from "../packages/villages/src/server/adapters/observability/private-diagnostics.js";
import {
  venueOperationSignal,
  venueRequestMetrics,
} from "../packages/villages/src/server/adapters/operations/operation-context.js";
import { validateSceneHistory } from "../packages/villages/src/server/adapters/storage/scene-history.js";
import { createOperationEvidence } from "../packages/villages/src/server/adapters/storage/operation-evidence.js";
import { readScenePublicHistoryHead } from "../packages/villages/src/server/adapters/storage/scene-public-history.js";
import { changeSession, readSession } from "../packages/villages/src/server/adapters/storage/scene-store.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { safeFailureMessage } from "../packages/villages/src/server/domain/rules/errors.js";
import { createModelCompletions } from "../packages/villages/src/server/features/generation/completion-service.js";
import type { LocationImageService } from "../packages/villages/src/server/features/media/location-image-service.js";
import { configureLocationImages } from "../packages/villages/src/server/features/media/location-image.js";
import { createSceneCommands } from "../packages/villages/src/server/features/scenes/command-service.js";
import { createSceneProgress } from "../packages/villages/src/server/features/scenes/progress-service.js";
import { createSceneWork } from "../packages/villages/src/server/features/scenes/scene-work-service.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import {
  authorSceneFixture,
  editFixtureScene,
  fixtureSceneState,
  villageFixtureDocuments,
} from "./helpers/village-storage.fixture.js";

import { assertVenueOwnership } from "../packages/villages/src/server/adapters/operations/operation-context.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import {
  cancelVenueOperation,
  coordinateVenue,
  coordinatedCompletion,
  readVenueOperation,
  recoverVenueOperations,
  rejectVenueCompletion,
  stopVenueCoordinator,
  venueCheckpoint,
} from "../packages/villages/src/server/jobs/venue-coordinator.js";

const records = new Map<string, any>();
const documents = {
  async create(input: any) {
    if (records.has(input.id)) throw new Error("duplicate document");
    const row = { ...structuredClone(input), revision: 1 };
    records.set(input.id, row);
    return structuredClone(row);
  },
  async getById(_packageId: string, id: string) {
    return structuredClone(records.get(id) ?? null);
  },
  async list() {
    return structuredClone([...records.values()]);
  },
  async update(input: any) {
    const old = records.get(input.id);
    if (!old || old.revision !== input.expectedRevision) return null;
    const row = { ...old, ...structuredClone(input), revision: old.revision + 1 };
    records.set(input.id, row);
    return structuredClone(row);
  },
};
const release = configureVillagesRuntime({
  persistence: { documents: villageFixtureDocuments(documents) },
  logger: { info() {}, warn() {}, debug() {}, error() {}, debugOverride() {} },
} as any);
const row = (id: string) => records.get(`villages-venue-visit-${id}`);
function seed(id: string) {
  records.set(`villages-venue-visit-${id}`, {
    id: `villages-venue-visit-${id}`,
    packageId: "villages",
    kind: "venue-visit",
    name: "Visit",
    description: "",
    revision: 1,
    data: {
      version: 5,
      villageSeed: "coordinator-world",
      id,
      status: "active",
      sceneRevision: 0,
      lastActivityAt: new Date().toISOString(),
      lines: [],
      submissions: [],
    },
  });
}
function appliedTurn(id: string, message = "") {
  const at = new Date().toISOString();
  return readNarrationSubmission({
    id,
    message,
    mode: "chat",
    targetId: "",
    requestFingerprint: memoryHash(["chat", "", null, message]),
    at,
    acceptance: { status: "applied", rejected: [] },
    episodeId: "fixture-episode-" + id,
    progressProcessedAt: at,
  });
}
function heldTurn(id: string, scene: ReturnType<typeof coerceSession>) {
  const at = scene.startedAt || new Date().toISOString(),
    message = "Captured input",
    world = Object.assign(defaultVillageState(), { seed: scene.villageSeed, setupAt: at, foundedAt: at }),
    venue = venueFixture({ id: scene.placeId || "fixture-place", name: "Hall", description: "A quiet hall." });
  world.venues = [venue];
  const framed = zoneEventScene(
      {
        ...scene,
        placeId: venue.id,
        zoneId: "exterior",
        sceneAttendance: { capturedAt: at, layout: captureSceneLayout(venue), occupants: [] },
      },
      venue,
    ),
    context = narrationContinuityContext(world, framed, venue, id, message, at),
    readset = fittedNarrationReadset(
      world,
      context,
      context.parts.map((part) => part.block.evidenceId!),
    ),
    raw = { segments: [{ id: "reply", kind: "narration", text: "The hall is quiet." }] };
  return readNarrationSubmission({
    id,
    message,
    mode: "chat",
    targetId: "",
    requestFingerprint: memoryHash(["chat", "", null, message]),
    at,
    acceptance: { status: "held", rejected: [{ id: "review", reason: "Preserved hold" }] },
    narration: { raw, readset, responseDigest: memoryHash(raw) },
  });
}
function deferred<T>() {
  return Promise.withResolvers<T>();
}
const refused = (code: string) => (error: any) => error.code === code;
let calls = 0;
const paid = (answer = "answer") =>
  coordinatedCompletion("fixture", async () => {
    calls++;
    return answer;
  });

async function main() {
  try {
    seed("mismatched-owner");
    row("mismatched-owner").data.id = "another-scene";
    await assert.rejects(readVenueOperation("mismatched-owner"), /identity/);
    const mismatched = structuredClone(records);
    await assert.rejects(
      coordinateVenue("mismatched-owner", "turn", "turn", {}, 0, undefined, () => paid()),
      /identity/,
    );
    assert.deepEqual(records, mismatched, "An internal Scene-ID mismatch cannot persist operation admission");
    assert.equal(calls, 0, "An invalid owner cannot purchase model work");
    records.delete("villages-venue-visit-mismatched-owner");
    seed("history-policy");
    const policyRow = row("history-policy");
    Object.assign(policyRow.data, {
      villageSeed: "policy-world",
      participants: [{ characterId: "audience", name: "Audience", doing: "Listening" }],
      lines: [
        {
          id: "heard",
          role: "assistant",
          speakerId: "audience",
          name: "Audience",
          content: "Exact heard words",
          at: new Date().toISOString(),
          heardBy: ["audience"],
        },
      ],
    });
    policyRow.data = authorSceneFixture(records, policyRow.data);
    const publicBefore = structuredClone(policyRow.data.publicHistory);
    let beforeTiming: any;
    await coordinateVenue(
      "history-policy",
      "private-policy",
      "turn",
      { message: "Exact input", mode: "chat", targetId: "" },
      0,
      undefined,
      async () => {
        const native = row("history-policy").data;
        const head = readScenePublicHistoryHead(
          native.publicHistory,
          native,
          native.transcript,
          native.submissionHistory,
        );
        assert.equal(head.publicVersion, publicBefore.publicVersion);
        assert.deepEqual(
          native.operation.snapshot.publicHistory,
          publicBefore,
          "Admitted history keeps its independent policy",
        );
        const get = documents.getById;
        const reads: string[] = [];
        const spy = mock.method(documents, "getById", async (pkg, id) => {
          reads.push(id);
          return get(pkg, id);
        });
        try {
          await venueCheckpoint("history-status", async () => 42);
        } finally {
          spy.mock.restore();
        }
        assert(
          !reads.some((id) => id.startsWith("villages-memory-page-" + native.transcript.world + "-")),
          "Ordinary status/checkpoint writes never load transcript bodies",
        );
        await changeSession("history-policy", (scene) => {
          scene.submissions.push(appliedTurn("private-policy", "Exact input"));
        });
        beforeTiming = structuredClone(row("history-policy").data);
      },
    );
    const afterTiming = row("history-policy").data;
    assert.notDeepEqual(afterTiming.submissionHistory, beforeTiming.submissionHistory);
    assert.notEqual(afterTiming.publicHistory.source, beforeTiming.publicHistory.source);
    assert.deepEqual(afterTiming.publicHistory.positions, beforeTiming.publicHistory.positions);
    assert.equal(afterTiming.publicHistory.publicVersion, beforeTiming.publicHistory.publicVersion);
    await validateSceneHistory(villageFixtureDocuments(documents), [afterTiming]);
    await coordinateVenue(
      "history-policy",
      "public-policy",
      "turn",
      {},
      afterTiming.sceneRevision,
      undefined,
      async () => {
        assert.deepEqual(row("history-policy").data.publicHistory.positions, publicBefore.positions);
        assert.equal(row("history-policy").data.publicHistory.publicVersion, publicBefore.publicVersion);
      },
    );
    await changeSession("history-policy", (scene) => {
      scene.submissions.push(appliedTurn("published-zone", "Zone evidence"));
    });
    await coordinateVenue(
      "history-policy",
      "still-private",
      "turn",
      {},
      row("history-policy").data.sceneRevision,
      undefined,
      async () => {
        assert.equal(
          row("history-policy").data.publicHistory.publicVersion,
          publicBefore.publicVersion,
          "Later operations preserve the public content version",
        );
      },
    );
    // Exact completion fingerprints replay persisted raw responses without purchasing again.
    let policyCalls = 0;
    const efforts: unknown[] = [];
    let truncated = false;
    const policyModel = {
      connectionId: "system",
      model: "synthetic",
      chatComplete: async (_messages: unknown, options: any) => {
        policyCalls++;
        efforts.push(options.reasoningEffort);
        return { content: truncated ? "" : '{"valid":true}', finishReason: truncated ? "length" : "stop" };
      },
    } as any;
    const modelCalls = createModelCompletions({
      readRuntimeDebug: async () => {},
      runtimeDebug() {},
      backgroundCalls: { getStore: () => undefined },
      coordinatedCompletion,
      withUsagePurpose: async (_purpose: unknown, work: any) => work(),
      inferredPurpose: () => "checks",
      villagesLogger: () => ({ debug() {}, warn() {} }),
      bindCallback: (callback: any) => callback,
    } as any);
    const policyInput = { message: "Hello", mode: "chat", targetId: "" };
    const policyWork =
      (effort: "low" | "none", crash = false) =>
      () =>
        venueCheckpoint("system", async () => {
          const raw = await modelCalls.completeWithRoom(
            policyModel,
            [{ role: "user", content: "Frozen evidence" }],
            4096,
            {
              temperature: 0.1,
              responseFormat: { type: "json_object" },
              reasoningEffort: effort,
            },
          );
          if (raw.finishReason === "length") {
            await rejectVenueCompletion();
            throw Error("Truncated");
          }
          if (crash) throw Error("Validation interrupted");
          return raw;
        });
    seed("policy-raw");
    await assert.rejects(
      coordinateVenue("policy-raw", "turn", "turn", policyInput, 0, undefined, policyWork("low", true)),
      /Validation interrupted/,
    );
    assert.equal(row("policy-raw").data.operation.checkpoints.system, undefined);
    await assert.rejects(
      coordinateVenue("policy-raw", "turn", "turn", policyInput, undefined, undefined, policyWork("none"), {
        recovery: true,
      }),
      refused("OPERATION_INTERRUPTED"),
    );
    assert.equal(
      policyCalls,
      1,
      "A changed fingerprint neither adopts a purchased response nor dispatches in recovery",
    );
    const reusedRaw = await coordinateVenue(
      "policy-raw",
      "turn",
      "turn",
      policyInput,
      undefined,
      undefined,
      policyWork("low"),
      { recovery: true },
    );
    assert.equal(reusedRaw.content, '{"valid":true}');
    assert.equal(policyCalls, 1, "Completed low-effort raw response replays without a parsed checkpoint or paid call");
    seed("expired-evidence");
    await assert.rejects(
      coordinateVenue("expired-evidence", "turn", "turn", policyInput, 0, undefined, () =>
        venueCheckpoint("system", async () => {
          await coordinatedCompletion("archived-raw", async () => ({ content: "Saved response" }));
          throw Error("Validation interrupted");
        }),
      ),
      /Validation interrupted/,
    );
    row("expired-evidence").data.status = "closed";
    row("expired-evidence").data.endReason = "inactivity";
    const expired = structuredClone(row("expired-evidence"));
    for (const evidence of ["submission", "navigation", "turn-reply", "greeting-reply"]) {
      const id = "expired-" + evidence;
      seed(id);
      await assert.rejects(
        coordinateVenue(id, "turn", "turn", policyInput, 0, undefined, () =>
          venueCheckpoint("system", async () => {
            await coordinatedCompletion("archived-raw", async () => ({ content: "Saved response" }));
            throw Error("Validation interrupted");
          }),
        ),
        /Validation interrupted/,
      );
      row(id).data.status = "closed";
      row(id).data.endReason = "inactivity";
      if (evidence === "submission")
        editFixtureScene(row(id), records, (scene) => {
          scene.submissions = [appliedTurn("turn")];
        });
      else if (evidence === "navigation") row(id).data.navigationReceipts = [{ id: "turn" }];
      else
        editFixtureScene(row(id), records, (scene) => {
          scene.operation!.checkpoints[evidence] = { saved: true };
        });
    }
    const expiredRecoveries: string[] = [];
    await recoverVenueOperations(async (id) => {
      if (id.startsWith("expired-")) expiredRecoveries.push(id);
    });
    assert(!expiredRecoveries.includes("expired-evidence"), "Expired uncommitted generation is not resumed at startup");
    assert.deepEqual(
      row("expired-evidence"),
      expired,
      "Startup preserves archived request identity, error and raw evidence",
    );
    assert.deepEqual(
      expiredRecoveries.sort(),
      ["expired-greeting-reply", "expired-navigation", "expired-submission", "expired-turn-reply"],
      "Committed or final work retains its recovery barriers",
    );
    seed("policy-rejected");
    truncated = true;
    await assert.rejects(
      coordinateVenue("policy-rejected", "turn", "turn", policyInput, 0, undefined, policyWork("low")),
      /Truncated/,
    );
    await assert.rejects(
      coordinateVenue("policy-rejected", "turn", "turn", policyInput, undefined, undefined, policyWork("low"), {
        recovery: true,
      }),
      refused("OPERATION_INTERRUPTED"),
    );
    assert.equal(policyCalls, 2, "Saved-only recovery cannot replace rejected low-effort output");
    truncated = false;
    const rejectedAttempt = (await readVenueOperation("policy-rejected"))!.attemptId;
    await coordinateVenue(
      "policy-rejected",
      "turn",
      "turn",
      policyInput,
      undefined,
      rejectedAttempt,
      policyWork("none"),
    );
    assert.deepEqual(
      efforts,
      ["low", "low", "none"],
      "Explicit replacement alone dispatches the new non-thinking policy",
    );
    assert.equal(policyCalls, 3);
    for (const finishReason of ["stop", "length"]) {
      const id = "policy-late-" + finishReason;
      seed(id);
      const ready = deferred<void>(),
        delayed = deferred<any>();
      let lateCalls = 0;
      policyModel.chatComplete = async (_messages: unknown, options: any) => {
        lateCalls++;
        if (lateCalls > 1) {
          assert.equal(options.reasoningEffort, "none");
          return { content: '{"valid":true}', finishReason: "stop" };
        }
        assert.equal(options.reasoningEffort, "low");
        return withProviderDeadline(async () => {
          ready.resolve();
          return delayed.promise;
        });
      };
      mock.timers.enable({ apis: ["setTimeout"] });
      try {
        const first = coordinateVenue(id, "turn", "turn", policyInput, 0, undefined, policyWork("low"));
        const failed = assert.rejects(first, /timed out after 120 seconds/);
        await ready.promise;
        mock.timers.tick(120_000);
        await failed;
        delayed.resolve({ content: finishReason === "stop" ? '{"valid":true}' : "", finishReason });
        await new Promise((resolve) => setImmediate(resolve));
        const replay = () =>
          coordinateVenue(id, "turn", "turn", policyInput, undefined, undefined, policyWork("low"), {
            recovery: true,
          });
        if (finishReason === "stop") {
          assert.equal((await replay()).content, '{"valid":true}');
          assert.equal((await replay()).content, '{"valid":true}');
        } else {
          await assert.rejects(replay(), /Truncated/);
          const receipt = [...records.values()].find(
            (r) => typeof r.data?.signature === "string" && JSON.parse(r.data.signature)[0] === id,
          );
          assert.equal(receipt.data.status, "rejected", "Rejection targets the exact late receipt");
          await assert.rejects(replay(), refused("OPERATION_INTERRUPTED"));
          assert.equal(lateCalls, 1, "Rejected late response cannot loop or silently spend");
          const attempt = (await readVenueOperation(id))!.attemptId;
          await coordinateVenue(id, "turn", "turn", policyInput, undefined, attempt, policyWork("none"));
        }
        assert.equal(lateCalls, finishReason === "stop" ? 1 : 2);
      } finally {
        mock.timers.reset();
      }
    }

    seed("slow-greeting");
    row("slow-greeting").data = coerceSession({
      version: 5,
      ...row("slow-greeting").data,
      status: "opening",
    });
    const world = defaultVillageState();
    world.seed = "coordinator-world";
    const greetingVenue = venueFixture({ id: "greeting-place", name: "Hall", description: "A hall" });
    world.venues = [greetingVenue];
    Object.assign(row("slow-greeting").data, {
      placeId: greetingVenue.id,
      zoneId: "exterior",
      startedAt: new Date().toISOString(),
      sceneAttendance: {
        capturedAt: new Date().toISOString(),
        layout: captureSceneLayout(greetingVenue),
        occupants: [],
      },
    });
    const progress = createSceneProgress({
      readSession,
      changeSession,
      withCommittedVillageAuthority: (work) => work(world),
      mutateVillageState: async (change) => {
        const next = structuredClone(world);
        change(next);
        Object.assign(world, next);
        return world;
      },
      assertVenueOwnership,
      measurePipeline: async (_label, _identity, work) => work(),
      sceneQueries: () => ({ progressBacklog: async () => [] }),
      villagesLogger: () => ({ warn() {} }),
    } as any);
    let earlyPictures = 0;
    const delayedPresence = deferred<void>();
    const greetingWork = createSceneWork();
    const stage = deferred<void>();
    let dispatches = 0;
    const commands = createSceneCommands({
      activationScope: () => undefined,
      sceneWork: () => greetingWork,
      readSession,
      readActive: async () => ({ sessionId: "slow-greeting", placeId: greetingVenue.id }),
      changeSession,
      readVillageState: async () => world,
      mutateVillageState: async (change: any) => {
        change(world);
        return world;
      },
      requireLiveVenueSession: readSession,
      coordinateVenue,
      venueCheckpoint,
      venueOperationSignal,
      venueRequestMetrics,
      cancelVenueOperation,
      hasVenueOperation: () => true,
      isInactive: () => false,
      villagesLogger: () => ({ info() {}, warn() {} }),
      refreshZoneParticipants: async (scene) => scene,
      outsideVenueOperation: (run: () => unknown) => run(),
      loadPrivateSpaceImages: async () => ({
        requestZonePicture: async () => {
          earlyPictures++;
          await delayedPresence.promise;
        },
      }),
      processSavedExchange: progress.processSavedExchange,
      assertVenueOwnership,
      generate: async (scene, message, _mode, signal) => {
        const at = new Date().toISOString(),
          framed = zoneEventScene(scene, greetingVenue),
          context = narrationContinuityContext(world, framed, greetingVenue, "greeting", message, at),
          readset = fittedNarrationReadset(
            world,
            context,
            context.parts.flatMap((part) => (part.block.evidenceId ? [part.block.evidenceId] : [])),
          ),
          raw = await coordinatedCompletion("greeting-narration", () =>
            withProviderDeadline(async () => {
              dispatches++;
              stage.resolve();
              await new Promise((resolve) => setTimeout(resolve, 32105));
              return { segments: [{ id: "greeting", kind: "narration", text: "Saved slow greeting." }] };
            }, signal),
          );
        return { raw, readset, responseDigest: memoryHash(raw) };
      },
    } as any);
    mock.timers.enable({ apis: ["setTimeout"] });
    try {
      const greeting = commands.greetVenue("slow-greeting");
      await stage.promise;
      mock.timers.tick(32105);
      const completed = await greeting;
      assert.equal(completed.status, "active");
      assert.equal(completed.lines.filter((line) => line.kind !== "input").length, 1);
      assert.equal(world.episodes.records.length, 1);
      assert.equal(dispatches, 1);
      assert.equal(
        (await commands.greetVenue("slow-greeting", undefined, true)).lines.filter((line) => line.kind !== "input")
          .length,
        1,
      );
      assert.equal(world.episodes.records.length, 1);
      assert.equal(dispatches, 1, "Saved-only duplicate recovery does not dispatch or append twice");
      assert.equal(
        earlyPictures,
        0,
        "coordinated work cannot launch a slow early presence check that absorbs its settled image request",
      );
    } finally {
      delayedPresence.resolve();
      mock.timers.reset();
    }
    seed("opening-retry");
    const frozenOpening = {};
    await assert.rejects(
      coordinateVenue("opening-retry", "greeting", "greet", frozenOpening, 0, undefined, async () => {
        throw Error("Opening interrupted");
      }),
      /Opening interrupted/,
    );
    const savedOpening = (await readVenueOperation("opening-retry"))!;
    const retryCommands = createSceneCommands({
      activationScope: () => undefined,
      sceneWork: () => createSceneWork(),
      readSession,
      villagesLogger: () => ({ info() {}, warn() {} }),
      coordinateVenue: async (
        _scene: string,
        _id: string,
        _kind: string,
        input: unknown,
        _revision: unknown,
        attempt: string,
      ) => {
        assert.equal(
          JSON.stringify(input),
          JSON.stringify(frozenOpening),
          "Opening retry preserves frozen admission bytes",
        );
        assert.equal(attempt, savedOpening.attemptId);
        return readSession("opening-retry");
      },
    } as any);
    await retryCommands.greetVenue("opening-retry", savedOpening.attemptId);
    seed("native-replay");
    row("native-replay").data = coerceSession({ version: 5, ...row("native-replay").data });
    const replayCommands = createSceneCommands({
      runtimeDebug() {},
      readSession,
      requireLiveVenueSession: readSession,
      readVillageState: async () => world,
      coordinateVenue: (...args: any[]) =>
        coordinateVenue(args[0], args[1], args[2], args[3], args[4], args[5], () => readSession(args[0]), args[7]),
    } as any);
    const turn = {
      sessionId: "native-replay",
      submissionId: "new-turn",
      message: "Hello",
      mode: "chat" as const,
      targetId: "",
    };
    await replayCommands.sendVenueTurn(turn);
    const originalInput = structuredClone(row("native-replay").data.operation.input);
    editFixtureScene(row("native-replay"), records, (scene) =>
      scene.submissions.push(appliedTurn("new-turn", "Hello")),
    );
    await replayCommands.sendVenueTurn(turn);
    assert.deepEqual(
      row("native-replay").data.operation.input,
      originalInput,
      "Committed native duplicate keeps its original admission fingerprint",
    );
    seed("provider-timeout");
    let providerCalls = 0;
    let timeoutLate!: (value: string) => void;
    const dispatched = deferred<void>();
    const timeoutWork = () =>
      venueCheckpoint("saved-intent", async () => "intent").then(() =>
        venueCheckpoint("reply", () =>
          coordinatedCompletion("timeout-provider", () =>
            withProviderDeadline(async () => {
              providerCalls++;
              dispatched.resolve();
              return new Promise<string>((resolve) => {
                timeoutLate = resolve;
              });
            }),
          ),
        ),
      );
    mock.timers.enable({ apis: ["setTimeout"] });
    try {
      const request = coordinateVenue("provider-timeout", "turn", "turn", {}, 0, undefined, timeoutWork);
      const failure = assert.rejects(request, /timed out after 120 seconds/);
      await dispatched.promise;
      mock.timers.tick(120_000);
      await failure;
      const saved = await readVenueOperation("provider-timeout");
      assert.equal(saved!.status, "interrupted");
      assert.equal(
        fixtureSceneState(row("provider-timeout").data, records).operation!.checkpoints["saved-intent"],
        "intent",
      );
      timeoutLate("late reply");
      await Promise.resolve();
      await Promise.resolve();
      assert.equal(
        row("provider-timeout").data.operation.checkpoints.reply,
        undefined,
        "Late completion cannot commit a reply",
      );
      await recoverVenueOperations(async (id) => {
        if (id === "provider-timeout")
          await coordinateVenue(id, "turn", "turn", {}, undefined, undefined, timeoutWork, { recovery: true });
      });
      assert.equal(providerCalls, 1, "Startup recovery cannot dispatch again");
      await new Promise((resolve) => setImmediate(resolve));
      const recovered = () =>
        coordinateVenue("provider-timeout", "turn", "turn", {}, undefined, undefined, timeoutWork, { recovery: true });
      assert.deepEqual(await Promise.all([recovered(), recovered()]), ["late reply", "late reply"]);
      assert.equal(providerCalls, 1, "Late paid result is reused without a replacement request");
    } finally {
      mock.timers.reset();
    }
    seed("late-after-edit");
    let lateOriginal!: (value: string) => void;
    const originalStarted = deferred<void>();
    mock.timers.enable({ apis: ["setTimeout"] });
    try {
      const original = coordinateVenue(
        "late-after-edit",
        "original",
        "turn",
        { message: "Original", mode: "chat" },
        0,
        undefined,
        () =>
          venueCheckpoint("reply", () =>
            coordinatedCompletion("same-provider", () =>
              withProviderDeadline(async () => {
                originalStarted.resolve();
                return new Promise<string>((resolve) => {
                  lateOriginal = resolve;
                });
              }),
            ),
          ),
      );
      const failed = assert.rejects(original, /timed out after 120 seconds/);
      await originalStarted.promise;
      mock.timers.tick(120_000);
      await failed;
      const saved = (await readVenueOperation("late-after-edit"))!;
      const editedStarted = deferred<void>(),
        editedFinish = deferred<string>();
      const replacement = coordinateVenue(
        "late-after-edit",
        "edited",
        "turn",
        { message: "Edited", mode: "chat" },
        0,
        saved.attemptId,
        () =>
          venueCheckpoint("reply", () =>
            coordinatedCompletion("same-provider", async () => {
              editedStarted.resolve();
              return editedFinish.promise;
            }),
          ),
        { replaceOfOperationId: saved.id },
      );
      await editedStarted.promise;
      lateOriginal("old late reply");
      await new Promise((resolve) => setImmediate(resolve));
      assert.equal(row("late-after-edit").data.operation.id, "edited");
      assert.equal(row("late-after-edit").data.operation.checkpoints.reply, undefined);
      assert.deepEqual(fixtureSceneState(row("late-after-edit").data, records).submissions, []);
      editedFinish.resolve("edited reply");
      assert.equal(await replacement, "edited reply", "late original output cannot supply the edited reply");
    } finally {
      mock.timers.reset();
    }
    seed("late-invalid");
    let finishInvalid!: (value: string) => void;
    const invalidStarted = deferred<void>();
    let invalidCalls = 0;
    const invalidWork = () =>
      venueCheckpoint("invalid-stage", async () => {
        const value = await coordinatedCompletion("invalid-late", () =>
          withProviderDeadline(async () => {
            invalidCalls++;
            if (invalidCalls > 1) return "valid replacement";
            invalidStarted.resolve();
            return new Promise<string>((resolve) => {
              finishInvalid = resolve;
            });
          }),
        );
        if (value === "invalid result") {
          await rejectVenueCompletion();
          throw Error("invalid response");
        }
        return value;
      });
    mock.timers.enable({ apis: ["setTimeout"] });
    try {
      const pending = coordinateVenue("late-invalid", "same", "turn", {}, 0, undefined, invalidWork);
      const failed = assert.rejects(pending, /timed out/);
      await invalidStarted.promise;
      mock.timers.tick(120_000);
      await failed;
      finishInvalid("invalid result");
      await new Promise((resolve) => setImmediate(resolve));
      await assert.rejects(
        coordinateVenue("late-invalid", "same", "turn", {}, undefined, undefined, invalidWork, { recovery: true }),
        /invalid response/,
      );
      const op = await readVenueOperation("late-invalid");
      assert.equal(
        await coordinateVenue("late-invalid", "same", "turn", {}, undefined, op!.attemptId, invalidWork),
        "valid replacement",
      );
      assert.equal(
        invalidCalls,
        2,
        "Explicit retry replaces rejected late evidence rather than replaying it indefinitely",
      );
    } finally {
      mock.timers.reset();
    }
    seed("late-retry-timeout");
    const starts = [deferred<void>(), deferred<void>()];
    const results = [deferred<string>(), deferred<string>()];
    let retryCalls = 0;
    const twiceLate = () =>
      venueCheckpoint("reply", async () => {
        const value = await coordinatedCompletion("same-provider", () =>
          withProviderDeadline(async () => {
            const n = retryCalls++;
            starts[n].resolve();
            return results[n].promise;
          }),
        );
        if (value === "invalid") {
          await rejectVenueCompletion();
          throw Error("invalid response");
        }
        return value;
      });
    mock.timers.enable({ apis: ["setTimeout"] });
    try {
      const first = coordinateVenue("late-retry-timeout", "same", "turn", {}, 0, undefined, twiceLate);
      const firstFailure = assert.rejects(first, /timed out/);
      await starts[0].promise;
      mock.timers.tick(120_000);
      await firstFailure;
      results[0].resolve("invalid");
      await new Promise((resolve) => setImmediate(resolve));
      await assert.rejects(
        coordinateVenue("late-retry-timeout", "same", "turn", {}, undefined, undefined, twiceLate, { recovery: true }),
        /invalid response/,
      );
      const prior = (await readVenueOperation("late-retry-timeout"))!;
      const second = coordinateVenue("late-retry-timeout", "same", "turn", {}, undefined, prior.attemptId, twiceLate);
      const secondFailure = assert.rejects(second, /timed out/);
      await starts[1].promise;
      mock.timers.tick(120_000);
      await secondFailure;
      results[1].resolve("recovered retry");
      await new Promise((resolve) => setImmediate(resolve));
      assert.equal(
        await coordinateVenue("late-retry-timeout", "same", "turn", {}, undefined, undefined, twiceLate, {
          recovery: true,
        }),
        "recovered retry",
      );
      assert.equal(retryCalls, 2);
    } finally {
      mock.timers.reset();
    }
    for (const legacyComplete of [false, true]) {
      const sceneId = "rejected-replay-" + legacyComplete;
      seed(sceneId);
      let rejectedCalls = 0;
      const rejectedWork = async () => {
        const result = await coordinatedCompletion("turn-reply:writing", async () => {
          rejectedCalls++;
          return "malformed paid response";
        });
        await rejectVenueCompletion();
        throw Error(result);
      };
      await assert.rejects(coordinateVenue(sceneId, "same", "turn", {}, 0, undefined, rejectedWork), /malformed paid/);
      if (legacyComplete) row(sceneId).data.operation.status = "complete";
      const attemptId = row(sceneId).data.operation.attemptId;
      await assert.rejects(
        coordinateVenue(sceneId, "same", "turn", {}, 0, undefined, rejectedWork),
        refused("OPERATION_INTERRUPTED"),
      );
      assert.equal(rejectedCalls, 1, "Rejected same-ID replay requires explicit paid authorization");
      await assert.rejects(coordinateVenue(sceneId, "same", "turn", {}, 0, attemptId, rejectedWork), /malformed paid/);
      assert.equal(rejectedCalls, 2, "Matching explicit retry authorizes one replacement");
      if (legacyComplete) {
        const saved = structuredClone(row(sceneId).data.operation);
        row(sceneId).data.sceneRevision = 1;
        for (const recovery of [true, false]) {
          await assert.rejects(
            coordinateVenue(sceneId, "same", "turn", {}, 1, saved.attemptId, rejectedWork, { recovery }),
            refused("SCENE_STALE"),
          );
          assert.deepEqual(row(sceneId).data.operation, saved, "Stale rejected evidence remains untouched");
        }
        assert.equal(rejectedCalls, 2, "Stale rejected evidence cannot cause another dispatch");
      }
    }
    seed("race");
    const started = deferred<void>(),
      finish = deferred<string>();
    const work = () =>
      venueCheckpoint("reply", () =>
        coordinatedCompletion("held", async () => {
          calls++;
          started.resolve();
          return finish.promise;
        }),
      );
    const first = coordinateVenue("race", "one", "turn", { message: "Hello" }, 0, undefined, work);
    await started.promise;
    const duplicate = coordinateVenue("race", "one", "turn", { message: "Hello" }, 999, undefined, work);
    for (const kind of ["turn", "greet", "move", "close", "change-interpretation"])
      await assert.rejects(
        () => coordinateVenue("race", kind, kind, {}, 0, undefined, () => paid()),
        refused("SCENE_BUSY"),
      );
    await assert.rejects(
      () => coordinateVenue("race", "one", "turn", { message: "Changed" }, 0, undefined, work),
      refused("SUBMISSION_MISMATCH"),
    );
    assert.equal(calls, 1, "all competing scene operations are refused before provider work");
    finish.resolve("shared answer");
    assert.deepEqual(await Promise.all([first, duplicate]), ["shared answer", "shared answer"]);
    assert.equal(row("race").data.operation.status, "complete");
    assert.deepEqual(row("race").data.operation.attempts, {}, "completed provider content is compacted");
    row("race").data.sceneRevision = 1;
    await assert.rejects(
      () => coordinateVenue("race", "stale", "turn", {}, 0, undefined, () => paid()),
      refused("SCENE_STALE"),
    );
    assert.equal(calls, 1);

    seed("unknown");
    let fail = true;
    const uncertain = () =>
      venueCheckpoint("reply", () =>
        coordinatedCompletion("uncertain", async () => {
          calls++;
          if (fail) throw new Error("connection disappeared");
          return "recovered";
        }),
      );
    await assert.rejects(
      () => coordinateVenue("unknown", "one", "turn", {}, 0, undefined, uncertain),
      /connection disappeared/,
    );
    const interrupted = await readVenueOperation("unknown", "one");
    assert.equal(interrupted?.status, "interrupted");
    const beforeRecovery = calls;
    await recoverVenueOperations((id, op) =>
      id === "unknown"
        ? coordinateVenue(id, op.id, op.kind, op.input, undefined, undefined, uncertain, { recovery: true })
        : Promise.resolve(),
    );
    assert.equal(calls, beforeRecovery, "activation never resubmits an uncertain paid request");
    await assert.rejects(
      () => coordinateVenue("unknown", "one", "turn", {}, 0, undefined, uncertain),
      refused("OPERATION_INTERRUPTED"),
    );
    fail = false;
    const retry = coordinateVenue("unknown", "one", "turn", {}, 0, interrupted!.attemptId, uncertain);
    const joinedRetry = coordinateVenue("unknown", "one", "turn", {}, 0, interrupted!.attemptId, uncertain);
    assert.deepEqual(await Promise.all([retry, joinedRetry]), ["recovered", "recovered"]);
    assert.equal(calls, beforeRecovery + 1, "explicit retry duplicates authorize one request");

    assert.equal(
      row("unknown").data.generationReceipts.length,
      1,
      "explicit retry retains the unknown original billing outcome",
    );
    // A failed ordinary chat may be revised only with the current attempt token.
    const oldInput = { message: "Original draft", mode: "chat", targetId: "" };
    const editedInput = { ...oldInput, message: "Edited draft" };
    const failChat = async (id: string) => {
      seed(id);
      await assert.rejects(
        () =>
          coordinateVenue(id, "original", "turn", oldInput, 0, undefined, () =>
            coordinatedCompletion("failed-chat", async () => {
              calls++;
              throw new Error("Upstream rejected the request");
            }),
          ),
        /Upstream rejected/,
      );
      return (await readVenueOperation(id))!;
    };
    const failedChat = await failChat("editable");
    assert.equal(
      failedChat.error,
      "Upstream rejected the request",
      "the actual failure survives without verbose logging",
    );
    const beforeEdit = calls;
    await assert.rejects(
      () =>
        coordinateVenue("editable", "edited", "turn", editedInput, 0, undefined, () => paid(), {
          replaceOfOperationId: "original",
        }),
      refused("OPERATION_INTERRUPTED"),
    );
    await assert.rejects(
      () =>
        coordinateVenue("editable", "edited", "turn", editedInput, 0, "obsolete-attempt", () => paid(), {
          replaceOfOperationId: "original",
        }),
      refused("OPERATION_INTERRUPTED"),
    );
    row("editable").data.sceneRevision = 1;
    await assert.rejects(
      () =>
        coordinateVenue("editable", "edited", "turn", editedInput, 1, failedChat.attemptId, () => paid(), {
          replaceOfOperationId: "original",
        }),
      refused("OPERATION_INTERRUPTED"),
    );
    row("editable").data.sceneRevision = 0;
    assert.equal(calls, beforeEdit, "refused replacements never dispatch");
    const editStarted = deferred<void>(),
      editDone = deferred<string>();
    const editedWork = () =>
      coordinatedCompletion("edited", async () => {
        calls++;
        editStarted.resolve();
        return editDone.promise;
      });
    const replacement = coordinateVenue(
      "editable",
      "edited",
      "turn",
      editedInput,
      0,
      failedChat.attemptId,
      editedWork,
      {
        replaceOfOperationId: "original",
      },
    );
    await editStarted.promise;
    const duplicateReplacement = coordinateVenue(
      "editable",
      "edited",
      "turn",
      editedInput,
      0,
      failedChat.attemptId,
      editedWork,
      {
        replaceOfOperationId: "original",
      },
    );
    editDone.resolve("Edited reply");
    assert.deepEqual(await Promise.all([replacement, duplicateReplacement]), ["Edited reply", "Edited reply"]);
    assert.equal(calls, beforeEdit + 1, "duplicate edited resends share one request");
    assert.equal(
      row("editable").data.generationReceipts.length,
      1,
      "replacement retains the uncertain original billing receipt",
    );
    assert.equal(row("editable").data.operation.input.message, "Edited draft");

    for (const blockedCase of ["committed", "navigation", "held"]) {
      const blocked = await failChat("edit-" + blockedCase);
      const data = row("edit-" + blockedCase).data;
      if (blockedCase === "committed")
        editFixtureScene(row("edit-" + blockedCase), records, (scene) =>
          scene.submissions.push(appliedTurn("original")),
        );
      if (blockedCase === "navigation") data.navigationReceipts = [{ id: "original" }];
      if (blockedCase === "held")
        editFixtureScene(row("edit-" + blockedCase), records, (scene) =>
          scene.submissions.push(heldTurn("other", scene)),
        );
      const beforeBlockedEdit = calls;
      await assert.rejects(
        () =>
          coordinateVenue("edit-" + blockedCase, "edited", "turn", editedInput, 0, blocked.attemptId, () => paid(), {
            replaceOfOperationId: "original",
          }),
        refused("OPERATION_INTERRUPTED"),
      );
      assert.equal(
        calls,
        beforeBlockedEdit,
        "committed turns and unsettled effects cannot be discarded by edited replacement",
      );
      assert.equal(data.operation.id, "original");
    }
    // Error text and completed model work must not lock an uncommitted draft.
    for (const failure of [
      "Use Move to change Zones.",
      "Invalid JSON",
      "Connection not found",
      "Provider timeout",
      "Storage failed",
    ])
      for (const mode of ["chat", "contact", "leave"]) {
        const sceneId = "editable-results-" + failure + mode;
        seed(sceneId);
        await assert.rejects(
          () =>
            coordinateVenue(sceneId, "original", "turn", { ...oldInput, mode }, 0, undefined, async () => {
              await venueCheckpoint("writing-completion", () => paid("old generated content"));
              await venueCheckpoint("turn-reply", async () => ({ lines: ["uncommitted reply"] }));
              throw new Error(failure);
            }),
          (error: Error) => error.message === failure,
        );
        const failed = (await readVenueOperation(sceneId))!;
        assert.equal(failed.status, "interrupted");
        const result = await coordinateVenue(
          sceneId,
          "edited",
          "turn",
          editedInput,
          0,
          failed.attemptId,
          () => venueCheckpoint("writing-completion", () => paid("new generated content")),
          { replaceOfOperationId: "original" },
        );
        assert.equal(result, "new generated content", "edited sends never reuse the original message's output");
        assert.equal(row(sceneId).data.operation.input.message, "Edited draft");
        assert.deepEqual(
          fixtureSceneState(row(sceneId).data, records).submissions,
          [],
          "replacement does not commit abandoned content",
        );
      }

    assert.equal(
      safeFailureMessage(new Error("Bearer secret-value api_key=hidden https://example.test/?token=private")),
      "Bearer [redacted] api_key=[redacted] https://example.test/?token=[redacted]",
    );
    assert.equal(safeFailureMessage(new Error("x".repeat(900))).length, 800);

    seed("swallowed");
    const swallowed = () =>
      venueCheckpoint("wish-verdict", async () => {
        try {
          return await coordinatedCompletion("swallowed-provider", async () => {
            calls++;
            throw new Error("lost outcome");
          });
        } catch {
          return "fallback verdict";
        }
      });
    await assert.rejects(
      () => coordinateVenue("swallowed", "one", "turn", {}, 0, undefined, swallowed),
      refused("OPERATION_INTERRUPTED"),
    );
    const beforeSwallowedRecovery = calls;
    await recoverVenueOperations((id, op) =>
      id === "swallowed"
        ? coordinateVenue(id, op.id, op.kind, op.input, undefined, undefined, swallowed, { recovery: true })
        : Promise.resolve(),
    );
    assert.equal(calls, beforeSwallowedRecovery);
    assert.equal(
      (await readVenueOperation("swallowed"))?.status,
      "interrupted",
      "a swallowed recovery refusal stays interrupted",
    );

    seed("checkpoint");
    let failCommit = true;
    const commit = async () => {
      const answer = await venueCheckpoint("turn-reply", () => paid("saved result"));
      if (failCommit) throw new Error("transcript write failed");
      assertVenueOwnership(row("checkpoint").data);
      await changeSession("checkpoint", (saved) => {
        saved.lines.push({
          id: "saved",
          speakerId: "",
          name: "",
          role: "assistant",
          content: answer,
          at: new Date().toISOString(),
          heardBy: [],
        });
      });
      return answer;
    };
    await assert.rejects(
      () => coordinateVenue("checkpoint", "one", "turn", {}, 0, undefined, commit),
      /transcript write failed/,
    );
    const beforeCommitRecovery = calls;
    failCommit = false;
    await recoverVenueOperations((id, op) =>
      id === "checkpoint"
        ? coordinateVenue(id, op.id, op.kind, op.input, undefined, undefined, commit, { recovery: true })
        : Promise.resolve(),
    );
    assert.equal(calls, beforeCommitRecovery, "saved narration commits without regeneration");
    assert.deepEqual(
      fixtureSceneState(row("checkpoint").data, records).lines.map((line) => line.content),
      ["saved result"],
    );

    seed("stages");
    let failNarration = true;
    const stages = async () => {
      const judgement = await venueCheckpoint("wish-verdict", () => paid("judgement"));
      const narration = await venueCheckpoint("turn-reply", () =>
        coordinatedCompletion("narration", async () => {
          calls++;
          if (failNarration) throw new Error("narration disconnected");
          return "narration";
        }),
      );
      return [judgement, narration];
    };
    await assert.rejects(
      () => coordinateVenue("stages", "one", "turn", {}, 0, undefined, stages),
      /narration disconnected/,
    );
    const stageAttempt = (await readVenueOperation("stages"))!.attemptId;
    const beforeStageRetry = calls;
    failNarration = false;
    assert.deepEqual(await coordinateVenue("stages", "one", "turn", {}, 0, stageAttempt, stages), [
      "judgement",
      "narration",
    ]);
    assert.equal(calls, beforeStageRetry + 1, "Fulfill and Act resume completed expensive stages");

    seed("cancel");
    const entered = deferred<void>(),
      late = deferred<string>();
    const old = coordinateVenue("cancel", "old", "turn", {}, 0, undefined, async () => {
      const answer = await coordinatedCompletion("ignores-abort", async () => {
        calls++;
        entered.resolve();
        return late.promise;
      });
      assertVenueOwnership(row("cancel").data);
      await changeSession("cancel", (saved) => {
        saved.lines.push({
          id: "late",
          speakerId: "",
          name: "",
          role: "assistant",
          content: answer,
          at: new Date().toISOString(),
          heardBy: [],
        });
      });
    });
    const rejectedOld = assert.rejects(old, refused("OPERATION_INTERRUPTED"));
    await entered.promise;
    await cancelVenueOperation("cancel");
    await rejectedOld;
    await coordinateVenue("cancel", "new", "turn", {}, 0, undefined, () => paid("successor"));
    late.resolve("late response");
    await new Promise((resolve) => setImmediate(resolve));
    assert.deepEqual(
      fixtureSceneState(row("cancel").data, records).lines,
      [],
      "a provider ignoring cancellation cannot append a late response",
    );
    assert.equal(row("cancel").data.operation.id, "new");

    seed("teardown");
    const alive = deferred<void>(),
      stopped = deferred<string>();
    const pending = coordinateVenue("teardown", "old", "greet", {}, 0, undefined, () =>
      coordinatedCompletion("stopped", async () => {
        alive.resolve();
        return stopped.promise;
      }),
    );
    const denied = assert.rejects(pending, refused("OPERATION_INTERRUPTED"));
    await alive.promise;
    await stopVenueCoordinator();
    assert.equal(
      row("teardown").data.operation.status,
      "interrupted",
      "teardown persists revocation before releasing the host",
    );
    await denied;
    stopped.resolve("late opening");
    await recoverVenueOperations(() => Promise.resolve());
    assert.equal((await readVenueOperation("teardown"))?.status, "interrupted");

    seed("validation");
    await assert.rejects(
      () =>
        coordinateVenue("validation", "bad", "turn", {}, 0, undefined, async () => {
          throw new Error("invalid input");
        }),
      /invalid input/,
    );
    await coordinateVenue("validation", "good", "turn", {}, 0, undefined, () => paid());
    row("validation").data.lastActivityAt = new Date(Date.now() - 31 * 60_000).toISOString();
    await coordinateVenue("validation", "after-absence", "turn", {}, 0, undefined, () => paid());
    assert.equal(row("validation").data.operation.id, "after-absence", "age does not refuse a valid new turn");
    seed("timed");
    await coordinateVenue("timed", "timed-turn", "turn", {}, 0, undefined, async () => {
      await venueCheckpoint("reply", async () => "saved");
      await venueCheckpoint("reply", async () => assert.fail("completed checkpoint must be reused"));
      editFixtureScene(row("timed"), records, (scene) => scene.submissions.push(appliedTurn("timed-turn")));
    });
    const timing = fixtureSceneState(row("timed").data, records).submissions[0].timing;
    assert(timing.elapsedMs >= 0);
    assert(timing.startedAt && timing.completedAt && timing.attemptId);
    assert.deepEqual(
      timing.stages.map((stage: any) => stage.reused),
      [false, true],
    );
    assert(timing.stages.every((stage: any) => stage.elapsedMs >= 0));
    seed("abandon");
    await assert.rejects(
      coordinateVenue("abandon", "failed", "turn", {}, 0, undefined, async () => {
        await venueCheckpoint("turn-reply", async () => "saved narration");
        throw new Error("truncated");
      }),
      /truncated/,
    );
    const failed = structuredClone(fixtureSceneState(row("abandon").data, records).operation!);
    const closeInput = { abandonOperationId: "failed" };
    const closeOptions = { abandonOfOperationId: "failed" };
    for (const [revision, attempt] of [
      [1, failed.attemptId],
      [0, "stale"],
    ] as const) {
      await assert.rejects(
        coordinateVenue(
          "abandon",
          "close",
          "close",
          closeInput,
          revision,
          attempt,
          async () => assert.fail("stale close"),
          closeOptions,
        ),
      );
    }
    editFixtureScene(row("abandon"), records, (scene) => scene.submissions.push(heldTurn("earlier", scene)));
    await assert.rejects(
      coordinateVenue(
        "abandon",
        "close",
        "close",
        closeInput,
        0,
        failed.attemptId,
        async () => assert.fail("committed barrier"),
        closeOptions,
      ),
      refused("OPERATION_INTERRUPTED"),
    );
    editFixtureScene(row("abandon"), records, (scene) => {
      scene.submissions = [];
    });
    await assert.rejects(
      coordinateVenue(
        "abandon",
        "close",
        "close",
        closeInput,
        0,
        failed.attemptId,
        async () => {
          await assert.rejects(paid(), refused("OPERATION_INTERRUPTED"));
          throw new Error("close storage failure");
        },
        closeOptions,
      ),
      /close storage failure/,
    );
    const interruptedClose = structuredClone(fixtureSceneState(row("abandon").data, records).operation!);
    const abandonedHead = structuredClone((await readSession("abandon")).abandonedOperations![0]);
    assert.deepEqual(
      await createOperationEvidence(villageFixtureDocuments(documents)).decode(abandonedHead, {
        id: "abandon",
        villageSeed: "coordinator-world",
      }),
      { ...failed, snapshot: null, status: "complete" },
      "Abandoned request retains exact input/response/accounting evidence without an inactive Scene snapshot",
    );
    let closeWrites = 0;
    await coordinateVenue(
      "abandon",
      "close",
      "close",
      interruptedClose.input,
      0,
      interruptedClose.attemptId,
      async () => {
        closeWrites++;
        row("abandon").data.status = "closed";
        return "closed";
      },
    );
    assert.equal(closeWrites, 1, "Admitted close can recover after a storage failure without paid work");
    assert.equal(row("abandon").data.status, "closed");
    assert.deepEqual((await readSession("abandon")).abandonedOperations, [abandonedHead]);
    seed("typed-invalid-narration");
    const invalidNarration = () =>
      venueCheckpoint("turn-reply", async () => {
        await venueCheckpoint("writing-completion:invalid", () =>
          coordinatedCompletion("invalid-proposal", async () => ({
            content: '{"segments":"invalid"}',
            finishReason: "stop",
          })),
        );
        await rejectVenueCompletion(
          { model: "synthetic", connectionId: "narration", reason: "invalid-segments" },
          { preserveWriting: true, stages: ["writing-completion:invalid"] },
        );
        throw Error("Invalid proposal");
      });
    await assert.rejects(
      coordinateVenue("typed-invalid-narration", "typed", "turn", {}, 0, undefined, invalidNarration),
      /Invalid proposal/,
    );
    assert(
      readPrivateDiagnostics(records.get("villages-private-diagnostics").data).entries.some(
        (e: any) => e.sceneId === "typed-invalid-narration" && e.content.includes("segments"),
      ),
      "Targeted GM rejection retains raw response diagnostics",
    );
    {
      seed("artwork-settled");
      Object.assign(row("artwork-settled").data, { placeId: "artwork-place", zoneId: "studio" });
      let pictures = 0;
      const releasePictures = configureLocationImages({
        requestZonePicture: async () => {
          pictures++;
        },
      } as unknown as LocationImageService);
      try {
        await coordinateVenue("artwork-settled", "visit", "turn", {}, 0, undefined, async () => "settled");
        await new Promise<void>((resolve) => setImmediate(resolve));
        assert.equal(pictures, 0, "An ordinary Scene turn leaves artwork generation idle");
        seed("artwork-held");
        await assert.rejects(
          coordinateVenue("artwork-held", "visit", "turn", {}, 0, undefined, async () => {
            throw Error("held");
          }),
          /held/,
        );
        await new Promise<void>((resolve) => setImmediate(resolve));
        assert.equal(pictures, 0, "failed Scene work cannot initiate artwork");
        seed("artwork-closed");
        await coordinateVenue("artwork-closed", "visit", "turn", {}, 0, undefined, async () => {
          await changeSession("artwork-closed", (scene) => {
            scene.status = "closed";
          });
        });
        await new Promise<void>((resolve) => setImmediate(resolve));
        assert.equal(pictures, 0, "closed Scenes cannot initiate artwork");
      } finally {
        releasePictures();
      }
    }
    console.log("villages-venue-coordinator: ok");
  } finally {
    await stopVenueCoordinator();
    await new Promise<void>((resolve) => setImmediate(resolve));
    release();
  }
}
await main();
