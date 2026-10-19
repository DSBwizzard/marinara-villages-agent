import { createSemanticService } from "../packages/villages/src/server/features/generation/semantic-service.js";
import {
  venueSavedCheckpoint,
  venueDebugContext,
  venueExplicitRetry,
} from "../packages/villages/src/server/adapters/operations/operation-context.js";
import { createModelCompletions } from "../packages/villages/src/server/features/generation/completion-service.js";
import { bindWishProposals } from "../packages/villages/src/server/domain/rules/wish-progress-rules.js";
import { createSceneCommands } from "../packages/villages/src/server/features/scenes/command-service.js";
import { createSceneWork } from "../packages/villages/src/server/features/scenes/scene-work-service.js";
import { readSession, changeSession } from "../packages/villages/src/server/adapters/storage/scene-store.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { quietContactReply } from "../packages/villages/src/server/domain/rules/scene-reply.js";
import {
  venueOperationSignal,
  venueRequestMetrics,
} from "../packages/villages/src/server/adapters/operations/operation-context.js";
import { mock } from "node:test";
import { withProviderDeadline } from "../packages/villages/src/server/adapters/models/provider-deadline.js";
import assert from "node:assert/strict";
import { safeFailureMessage } from "../packages/villages/src/server/domain/rules/errors.js";

import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import {
  coordinateVenue,
  coordinatedCompletion,
  venueCheckpoint,
  rejectVenueCompletion,
  cancelVenueOperation,
  recoverVenueOperations,
  readVenueOperation,
  stopVenueCoordinator,
} from "../packages/villages/src/server/jobs/venue-coordinator.js";
import { assertVenueOwnership } from "../packages/villages/src/server/adapters/operations/operation-context.js";

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
  persistence: { documents },
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
      id,
      status: "active",
      sceneRevision: 0,
      lastActivityAt: new Date().toISOString(),
      lines: [],
      submissions: [],
    },
  });
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
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
    // Real completion fingerprints and persisted raw responses survive a reasoning-policy upgrade.
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
    const policyInput = { semanticPipelineVersion: 3, message: "Hello" };
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
              ...(effort === "none" ? { replayReasoningEffort: "low" as const } : {}),
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
    const reusedRaw = await coordinateVenue(
      "policy-raw",
      "turn",
      "turn",
      policyInput,
      undefined,
      undefined,
      policyWork("none"),
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
      row(id).data = { ...structuredClone(expired.data), id };
      if (evidence === "submission") row(id).data.submissions = [{ id: "turn" }];
      else if (evidence === "navigation") row(id).data.navigationReceipts = [{ id: "turn" }];
      else row(id).data.operation.checkpoints[evidence] = { saved: true };
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
      coordinateVenue("policy-rejected", "turn", "turn", policyInput, undefined, undefined, policyWork("none"), {
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
        const failed = assert.rejects(first, /timed out after 30 seconds/);
        await ready.promise;
        mock.timers.tick(30_000);
        await failed;
        delayed.resolve({ content: finishReason === "stop" ? '{"valid":true}' : "", finishReason });
        await new Promise((resolve) => setImmediate(resolve));
        const replay = () =>
          coordinateVenue(id, "turn", "turn", policyInput, undefined, undefined, policyWork("none"), {
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
          assert.equal(receipt.data.status, "rejected", "Rejection targets the adopted low-effort late receipt");
          await assert.rejects(replay(), refused("OPERATION_INTERRUPTED"));
          assert.equal(lateCalls, 1, "Rejected late alias cannot loop or silently spend");
          const attempt = (await readVenueOperation(id))!.attemptId;
          await coordinateVenue(id, "turn", "turn", policyInput, undefined, attempt, policyWork("none"));
        }
        assert.equal(lateCalls, finishReason === "stop" ? 1 : 2);
      } finally {
        mock.timers.reset();
      }
    }

    seed("slow-greeting");
    row("slow-greeting").data = coerceSession({ ...row("slow-greeting").data, status: "opening" });
    const world = defaultVillageState();
    const greetingWork = createSceneWork();
    let stage = deferred<void>();
    let dispatches = 0;
    const commands = createSceneCommands({
      bindWishProposals,
      activationScope: () => undefined,
      sceneWork: () => greetingWork,
      readSession,
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
      markZoneSeen: async () => {},
      processSavedExchange: async () => {},
      generate: async (_scene, _message, _mode, _target, _settled, signal) => {
        for (const duration of [7942, 24163]) {
          await coordinatedCompletion("stage-" + duration, () =>
            withProviderDeadline(async () => {
              dispatches++;
              stage.resolve();
              await new Promise((resolve) => setTimeout(resolve, duration));
              return "saved stage";
            }, signal),
          );
        }
        return quietContactReply("Saved slow greeting.", []);
      },
    } as any);
    mock.timers.enable({ apis: ["setTimeout"] });
    try {
      const greeting = commands.greetVenue("slow-greeting");
      await stage.promise;
      stage = deferred<void>();
      mock.timers.tick(7942);
      await stage.promise;
      mock.timers.tick(24163);
      const completed = await greeting;
      assert.equal(completed.status, "active");
      assert.equal(completed.lines.length, 1);
      assert.equal(dispatches, 2);
      assert.equal((await commands.greetVenue("slow-greeting", undefined, true)).lines.length, 1);
      assert.equal(dispatches, 2, "Saved-only duplicate recovery does not dispatch or append twice");
    } finally {
      mock.timers.reset();
    }
    seed("v3-opening-retry");
    const frozenOpening = {
      writingContractVersion: 3,
      semanticBudget: { version: 1, requests: 2, inputTokens: 100000, outputTokens: 20000 },
      semanticPipelineVersion: 3,
      residentActionsVersion: 2,
      writingCapabilities: { wishes: true },
    };
    row("v3-opening-retry").data.operation = {
      id: "greeting",
      input: frozenOpening,
      status: "interrupted",
      attemptId: "saved-opening-attempt",
    };
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
        assert.equal(attempt, "saved-opening-attempt");
        return readSession("v3-opening-retry");
      },
    } as any);
    await retryCommands.greetVenue("v3-opening-retry", "saved-opening-attempt");
    seed("v3-replay");
    row("v3-replay").data = coerceSession({ ...row("v3-replay").data, semanticVersion: 2 });
    const replayCommands = createSceneCommands({
      runtimeDebug() {},
      readSession,
      requireLiveVenueSession: readSession,
      readVillageState: async () => world,
      coordinateVenue: (...args: any[]) =>
        coordinateVenue(args[0], args[1], args[2], args[3], args[4], args[5], () => readSession(args[0]), args[7]),
    } as any);
    const turn = {
      sessionId: "v3-replay",
      submissionId: "new-turn",
      message: "Hello",
      mode: "chat" as const,
      targetId: "",
    };
    await replayCommands.sendVenueTurn(turn);
    const originalInput = structuredClone(row("v3-replay").data.operation.input);
    row("v3-replay").data.submissions.push({
      id: "new-turn",
      message: "Hello",
      mode: "chat",
      targetId: "",
      semanticProvenance: { version: 2, pipelineVersion: 3 },
    });
    await replayCommands.sendVenueTurn(turn);
    assert.deepEqual(
      row("v3-replay").data.operation.input,
      originalInput,
      "Committed v3 duplicate keeps its original admission fingerprint",
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
      const failure = assert.rejects(request, /timed out after 30 seconds/);
      await dispatched.promise;
      mock.timers.tick(30_000);
      await failure;
      const saved = await readVenueOperation("provider-timeout");
      assert.equal(saved!.status, "interrupted");
      assert.equal(row("provider-timeout").data.operation.checkpoints["saved-intent"], "intent");
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
      const failed = assert.rejects(original, /timed out after 30 seconds/);
      await originalStarted.promise;
      mock.timers.tick(30_000);
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
      assert.deepEqual(row("late-after-edit").data.submissions, []);
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
      mock.timers.tick(30_000);
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

    for (const blockedCase of ["committed", "navigation", "semantic"]) {
      const blocked = await failChat("edit-" + blockedCase);
      const data = row("edit-" + blockedCase).data;
      if (blockedCase === "committed") data.submissions.push({ id: "original" });
      if (blockedCase === "navigation") data.navigationReceipts = [{ id: "original" }];
      if (blockedCase === "semantic")
        data.submissions.push({ id: "other", semanticProvenance: { version: 2 }, semanticReady: false });
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
      for (const mode of ["chat", "contact", "act", "fulfill", "leave"]) {
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
        assert.deepEqual(row(sceneId).data.submissions, [], "replacement does not commit abandoned content");
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
      row("checkpoint").data.lines.push(answer);
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
    assert.deepEqual(row("checkpoint").data.lines, ["saved result"]);

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
      row("cancel").data.lines.push(answer);
    });
    const rejectedOld = assert.rejects(old, refused("OPERATION_INTERRUPTED"));
    await entered.promise;
    await cancelVenueOperation("cancel");
    await rejectedOld;
    await coordinateVenue("cancel", "new", "turn", {}, 0, undefined, () => paid("successor"));
    late.resolve("late response");
    await new Promise((resolve) => setImmediate(resolve));
    assert.deepEqual(row("cancel").data.lines, [], "a provider ignoring cancellation cannot append a late response");
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
    await assert.rejects(
      () => coordinateVenue("validation", "expired", "turn", {}, 0, undefined, () => paid()),
      (error: any) => error.statusCode === 410,
    );
    seed("spinoff-owned");
    row("spinoff-owned").data.spinoff = { status: "running" };
    await assert.rejects(
      () =>
        coordinateVenue("spinoff-owned", "blocked", "turn", {}, 0, undefined, async () =>
          assert.fail("a Village turn must not run while Engine owns its spinoff"),
        ),
      /spinoff/,
    );
    seed("timed");
    await coordinateVenue("timed", "timed-turn", "turn", {}, 0, undefined, async () => {
      await venueCheckpoint("reply", async () => "saved");
      await venueCheckpoint("reply", async () => assert.fail("completed checkpoint must be reused"));
      row("timed").data.submissions.push({ id: "timed-turn" });
    });
    const timing = row("timed").data.submissions[0].timing;
    assert(timing.elapsedMs >= 0);
    assert(timing.startedAt && timing.completedAt && timing.attemptId);
    assert.deepEqual(
      timing.stages.map((stage: any) => stage.reused),
      [false, true],
    );
    assert(timing.stages.every((stage: any) => stage.elapsedMs >= 0));
    seed("semantic-budget");
    const budgetInput = { semanticBudget: { version: 1, requests: 1, inputTokens: 20, outputTokens: 10 } };
    let budgetDispatches = 0;
    const budgetWork = async () => {
      await coordinatedCompletion(
        "first-budgeted",
        async () => {
          budgetDispatches++;
          return "saved";
        },
        undefined,
        { inputTokens: 10, outputTokens: 5 },
      );
      return coordinatedCompletion(
        "second-budgeted",
        async () => {
          budgetDispatches++;
          return "second";
        },
        undefined,
        { inputTokens: 10, outputTokens: 5 },
      );
    };
    await assert.rejects(
      coordinateVenue("semantic-budget", "budgeted", "turn", budgetInput, 0, undefined, budgetWork),
      refused("SEMANTIC_BUDGET"),
    );
    assert.equal(budgetDispatches, 1, "The whole-attempt reservation stops additional dispatch before spending");
    const budgetOperation = await readVenueOperation("semantic-budget");
    await coordinateVenue(
      "semantic-budget",
      "budgeted",
      "turn",
      budgetInput,
      0,
      budgetOperation!.attemptId,
      budgetWork,
    );
    assert.equal(
      budgetDispatches,
      2,
      "An explicit attempt reuses the first saved result and reserves only its new request",
    );
    for (const [index, budget] of [
      null,
      { version: 2, requests: 1, inputTokens: 20, outputTokens: 10 },
      { version: 1, requests: 1, inputTokens: "unknown", outputTokens: 10 },
      { version: 1, requests: 1, outputTokens: 10 },
    ].entries()) {
      const id = "invalid-semantic-budget-" + index;
      seed(id);
      await assert.rejects(
        coordinateVenue(id, "invalid", "turn", { semanticBudget: budget }, 0, undefined, () =>
          coordinatedCompletion(
            "invalid-budget",
            async () => assert.fail("Invalid budget must not dispatch"),
            undefined,
            { inputTokens: 1, outputTokens: 1 },
          ),
        ),
        refused("SEMANTIC_BUDGET"),
      );
    }
    seed("missing-v2-budget");
    row("missing-v2-budget").data.semanticVersion = 2;
    await assert.rejects(
      coordinateVenue("missing-v2-budget", "invalid", "turn", {}, 0, undefined, () =>
        coordinatedCompletion(
          "missing-budget",
          async () => assert.fail("New semantic Scenes require an allowance"),
          undefined,
          { inputTokens: 1, outputTokens: 1 },
        ),
      ),
      refused("SEMANTIC_BUDGET"),
    );
    seed("abandon");
    await assert.rejects(
      coordinateVenue("abandon", "failed", "turn", {}, 0, undefined, async () => {
        await venueCheckpoint("turn-reply", async () => "saved narration");
        throw new Error("truncated");
      }),
      /truncated/,
    );
    const failed = structuredClone(row("abandon").data.operation);
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
    row("abandon").data.submissions.push({ id: "earlier", semanticProvenance: { version: 2 }, semanticReady: false });
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
    row("abandon").data.submissions = [];
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
    const interruptedClose = structuredClone(row("abandon").data.operation);
    assert.deepEqual(
      interruptedClose.checkpoints["abandoned-request"],
      failed,
      "Failed request and saved writing remain recoverable",
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
    assert.deepEqual(row("abandon").data.operation.checkpoints["abandoned-request"], failed);
    seed("typed-review");
    row("typed-review").data = coerceSession({
      ...row("typed-review").data,
      semanticVersion: 2,
      processingVersion: 1,
      villageSeed: world.seed,
    });
    const typedInput = {
      semanticPipelineVersion: 3,
      residentActionsVersion: 1,
      message: "Hello",
      semanticBudget: { version: 1, requests: 2, inputTokens: 100000, outputTokens: 20000 },
    };
    let narrationDispatches = 0,
      systemDispatches = 0,
      acceptReview = false;
    const typedModel = {
      ...policyModel,
      name: "System",
      fitContext: (messages: unknown, options: any) => ({
        messages,
        ...options,
        estimatedTokensBefore: 1000,
        trimmed: false,
      }),
      chatComplete: async (messages: any[]) => {
        systemDispatches++;
        const packet = JSON.parse(messages[1].content);
        return {
          finishReason: "stop",
          content: JSON.stringify({
            sourceHash: packet.sourceHash,
            consistent: true,
            intent: {
              status: "resolved",
              instructions: "",
              action: null,
              movement: null,
              timeline: [{ kind: "speech", text: "Hello" }],
            },
            authority: { physical: false, access: false, projects: false, standing: false },
            action: null,
            memoryChanges: [],
            relationshipChanges: { changes: [], permissions: [], disclosures: [] },
            wishChanges: [],
            projectSpeech: [],
            access: [],
            events: { moves: [], departures: [], contactEnd: [] },
            residentActionReview: {
              version: 1,
              additionalActions: [],
              decisions: [],
              coverage: [
                {
                  segment: 0,
                  status: acceptReview ? "none" : "unresolved",
                  actionIds: [],
                  reason: acceptReview ? "No access act" : "Scope unclear",
                },
              ],
            },
          }),
        };
      },
    };
    const typedWork = async () => {
      if (row("typed-review").data.submissions.some((s: any) => s.id === "typed")) return readSession("typed-review");
      const story = await venueCheckpoint("writing-completion:typed", () =>
        coordinatedCompletion(
          "typed-narration",
          async () => {
            narrationDispatches++;
            return {
              residentActions: [],
              lines: [{ kind: "narration", speakerId: "__venue_scene__", content: "The room is quiet.", heardBy: [] }],
            };
          },
          undefined,
          { inputTokens: 1000, outputTokens: 1000 },
        ),
      );
      const restoredService = createSemanticService({
        readVillageState: async () => world,
        villagesConnectionIdFor: async () => "system",
        villagesLanguageModels: () => ({ resolveForRequest: async () => typedModel }),
        completeWithRoom: modelCalls.completeWithRoom,
        venueCheckpoint,
        venueSavedCheckpoint,
        venueDebugContext,
        venueExplicitRetry,
        venueOperationSignal,
        rejectVenueCompletion,
      } as any);
      const scene = { ...coerceSession(row("typed-review").data), operation: { input: typedInput } } as any;
      const result = await restoredService.exchange(scene, "Hello", story.lines as any, null, story.residentActions);
      await changeSession("typed-review", (current) => {
        current.lines.push({
          id: "typed-line",
          role: "assistant",
          speakerId: "__venue_scene__",
          name: "Narration",
          content: "The room is quiet.",
          at: current.startedAt,
          heardBy: [],
        });
        current.submissions.push({
          id: "typed",
          message: "Hello",
          mode: "chat",
          targetId: "",
          residentActionReceipt: result.effects.residentActionReceipt,
        } as any);
      });
      return readSession("typed-review");
    };
    await assert.rejects(
      coordinateVenue("typed-review", "typed", "turn", typedInput, 0, undefined, typedWork),
      /clarification/,
    );
    assert.equal(row("typed-review").data.lines.length, 0, "An unresolved action cannot publish a partial turn");
    assert.equal(narrationDispatches, 1);
    assert.equal(systemDispatches, 1);
    assert(
      records
        .get("villages-rejected-responses")
        .data.entries.some((e: any) => e.sceneId === "typed-review" && e.content.includes("residentActionReview")),
      "Rejected System dispositions retained in existing private journal",
    );
    await assert.rejects(
      coordinateVenue("typed-review", "typed", "turn", typedInput, undefined, undefined, typedWork, { recovery: true }),
      refused("OPERATION_INTERRUPTED"),
    );
    assert.equal(systemDispatches, 1, "Local recovery cannot purchase a replacement");
    acceptReview = true;
    const typedAttempt = (await readVenueOperation("typed-review"))!.attemptId;
    const typedCommitted = await coordinateVenue(
      "typed-review",
      "typed",
      "turn",
      typedInput,
      undefined,
      typedAttempt,
      typedWork,
    );
    assert.equal(narrationDispatches, 1, "Explicit System retry reuses the paid Narration");
    assert.equal(systemDispatches, 2);
    assert(typedCommitted.submissions[0].residentActionReceipt?.systemResponse?.includes("residentActionReview"));
    await coordinateVenue("typed-review", "typed", "turn", typedInput, undefined, undefined, typedWork, {
      recovery: true,
    });
    assert.equal(row("typed-review").data.lines.length, 1);
    assert.equal(row("typed-review").data.submissions.length, 1);
    assert.equal(systemDispatches, 2);
    seed("typed-invalid-narration");
    const invalidNarration = () =>
      venueCheckpoint("turn-reply", async () => {
        await venueCheckpoint("writing-completion:invalid", () =>
          coordinatedCompletion("invalid-proposal", async () => ({
            content: '{"residentActions":"invalid"}',
            finishReason: "stop",
          })),
        );
        await rejectVenueCompletion(
          { model: "synthetic", connectionId: "narration", reason: "resident-actions" },
          { preserveWriting: true, stages: ["writing-completion:invalid"] },
        );
        throw Error("Invalid proposal");
      });
    await assert.rejects(
      coordinateVenue("typed-invalid-narration", "typed", "turn", {}, 0, undefined, invalidNarration),
      /Invalid proposal/,
    );
    assert(
      records
        .get("villages-rejected-responses")
        .data.entries.some(
          (e: any) => e.sceneId === "typed-invalid-narration" && e.content.includes("residentActions"),
        ),
      "Targeted Narration rejection retains raw proposal diagnostics",
    );
    console.log("villages-venue-coordinator: ok");
  } finally {
    release();
  }
}
void main();
