import { mock } from "node:test";
import { withProviderDeadline } from "../packages/villages/src/server/adapters/models/provider-deadline.js";
import assert from "node:assert/strict";
import { safeFailureMessage } from "../packages/villages/src/server/domain/rules/errors.js";

import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import {
  coordinateVenue,
  coordinatedCompletion,
  venueCheckpoint,
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
      await assert.rejects(
        coordinateVenue("provider-timeout", "turn", "turn", {}, 0, undefined, timeoutWork),
        refused("OPERATION_INTERRUPTED"),
      );
      const current = await readVenueOperation("provider-timeout");
      const retry = () =>
        coordinateVenue("provider-timeout", "turn", "turn", {}, 0, current!.attemptId, () =>
          venueCheckpoint("saved-intent", async () => assert.fail("Saved work must be reused")).then(() =>
            venueCheckpoint("reply", () =>
              coordinatedCompletion("timeout-provider", async () => {
                providerCalls++;
                return "recovered";
              }),
            ),
          ),
        );
      assert.deepEqual(await Promise.all([retry(), retry()]), ["recovered", "recovered"]);
      assert.equal(providerCalls, 2, "Explicit duplicate retries authorize only one replacement call");
      assert.equal(row("provider-timeout").data.generationReceipts[0].outcome, "unknown");
    } finally {
      mock.timers.reset();
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

    for (const blockedCase of ["committed", "checkpoint", "contact"]) {
      const blocked = await failChat("edit-" + blockedCase);
      const data = row("edit-" + blockedCase).data;
      if (blockedCase === "committed") data.submissions.push({ id: "original" });
      if (blockedCase === "checkpoint") data.operation.checkpoints["turn-reply"] = { saved: true };
      if (blockedCase === "contact") data.operation.input.mode = "contact";
      const beforeBlockedEdit = calls;
      await assert.rejects(
        () =>
          coordinateVenue("edit-" + blockedCase, "edited", "turn", editedInput, 0, blocked.attemptId, () => paid(), {
            replaceOfOperationId: "original",
          }),
        refused("OPERATION_INTERRUPTED"),
      );
      assert.equal(calls, beforeBlockedEdit, "saved replies and effects must recover before edited replacement");
      assert.equal(data.operation.id, "original");
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
    console.log("villages-venue-coordinator: ok");
  } finally {
    release();
  }
}
void main();
