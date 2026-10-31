import assert from "node:assert/strict";
import { mock } from "node:test";
import type { BackgroundCompletion } from "../packages/villages/src/server/domain/models/background-completion-model.js";
import { createBackgroundContext } from "../packages/villages/src/server/adapters/operations/background-context-service.js";
import { createBackgroundWork } from "../packages/villages/src/server/jobs/background-service.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function fixture(
  mode: "success" | "error" | "shutdown" | "storage",
  generate?: (complete: BackgroundCompletion) => Promise<unknown>,
  storedOwner?: string,
) {
  const rows = new Map<string, any>(),
    context = createBackgroundContext(),
    entered = deferred(),
    gate = deferred();
  let world = defaultVillageState();
  world.seed = "same";
  world.villagers = [{ characterId: "ada", cardSnapshot: { name: "Ada" } }] as any;
  let decisionCalls = 0,
    systemCalls = 0,
    applied = 0,
    failStore = mode === "storage";
  let optionalSignal: AbortSignal | undefined;
  const documents: any = {
    getById: async (_pkg: string, id: string) => structuredClone(rows.get(id) ?? null),
    list: async (_pkg: string, kind: string) => structuredClone([...rows.values()].filter((row) => row.kind === kind)),
    create: async (input: any) => {
      const row = { ...structuredClone(input), revision: 1 };
      if (storedOwner && row.kind === "background-work") row.data.owner = storedOwner;
      rows.set(row.id, row);
      return row;
    },
    update: async (input: any) => {
      if (
        failStore &&
        Object.values(input.data.optionalAttempts ?? {}).some((attempt: any) => attempt.status === "complete")
      ) {
        failStore = false;
        throw new Error("optional result storage failed");
      }
      const prior = rows.get(input.id);
      if (prior?.revision !== input.expectedRevision) return null;
      const row = { ...prior, ...structuredClone(input), revision: prior.revision + 1 };
      rows.set(row.id, row);
      return row;
    },
    remove: async (_pkg: string, id: string) => rows.delete(id),
  };
  const model: any = {
    connectionId: "system",
    model: "synthetic",
    chatComplete: async () => {
      systemCalls++;
      return { content: "system", finishReason: "stop", usage: { totalTokens: 1 } };
    },
  };
  const service = createBackgroundWork({
    withCurrentJobWrite: (work) => work(),
    villagesDocuments: () => documents,
    villagesLogger: () => ({ debug() {}, debugOverride() {}, info() {}, warn() {}, error() {} }),
    readVillageState: async () => structuredClone(world),
    mutateVillageState: async (mutate) => {
      const next = structuredClone(world);
      await mutate(next);
      world = next;
      return world;
    },
    withUsagePurpose: (_purpose, work) => work(),
    measurePipeline: (_name, _tags, work) => work(),
    runtimeDebug() {},
    backgroundCalls: context.backgroundCalls,
    handlers: new Map([
      [
        "agenda",
        {
          valid: () => true,
          async generate() {
            const complete = context.backgroundCalls.getStore()!;
            if (generate) return generate(complete);
            const evaluate = async (signal: AbortSignal) => {
              decisionCalls++;
              optionalSignal = signal;
              entered.resolve();
              if (mode === "shutdown") await gate.promise;
              if (mode === "error") throw new Error("synthetic optional provider error");
              return "decisions";
            };
            const result = await complete.optionalCompletion!("same-evidence", evaluate);
            if (result) {
              assert.equal(
                await complete.optionalCompletion!("same-evidence", evaluate),
                result,
                "completed answer replays in the same logical job",
              );
              return result;
            }
            assert.equal(
              await complete.optionalCompletion!("same-evidence", evaluate),
              undefined,
              "unknown attempt cannot redispatch",
            );
            return (
              await complete(model, [{ role: "user", content: "System fallback" }], 100, {
                checkpointId: "system",
                debugMode: false,
              })
            ).content;
          },
          apply(state: typeof world, _input: unknown, result: unknown) {
            applied++;
            state.setting = String(result);
          },
        },
      ],
    ]),
  });
  return {
    service,
    entered,
    gate,
    rows,
    signal: () => optionalSignal,
    counts: () => ({ decisionCalls, systemCalls, applied }),
    world: () => world,
    queue: (finite = true, revision = "1") =>
      service.queueBackgroundJob({
        kind: "agenda",
        subjectId: "ada",
        seed: "same",
        revision,
        finite,
        label: "optional",
        input: {},
      }),
  };
}
for (const mode of ["success", "error", "storage"] as const) {
  const f = fixture(mode),
    stop = f.service.startBackgroundWork({ now: () => 0 });
  try {
    await f.queue();
    await f.service.settleBackgroundWork();
    const status = (await f.service.backgroundWorkSummaries())[0];
    assert.equal(f.counts().decisionCalls, 1);
    assert.equal(status.connectionPaused, false, "optional failure never pauses a System connection");
    if (mode === "success") {
      assert.equal(f.world().setting, "decisions");
      assert.equal(f.counts().systemCalls, 0);
      assert.equal(status.requests, 1);
      assert.equal(status.tokens, null, "capability usage is unknown");
    } else if (mode === "error") {
      assert.equal(f.world().setting, "system");
      assert.equal(f.counts().systemCalls, 1);
      assert.equal(status.requests, 2);
    } else {
      assert.equal(status.status, "failed");
      assert.equal(f.counts().systemCalls, 0, "persistence failure forbids automatic fallback");
      await f.service.retryBackgroundJob(status.id, status.attempt, "retry-storage", status.instanceId);
      await f.service.settleBackgroundWork();
      assert.deepEqual(
        f.counts(),
        { decisionCalls: 1, systemCalls: 1, applied: 1 },
        "explicit retry skips uncertain optional receipt and uses System",
      );
    }
  } finally {
    stop();
  }
}
const f = fixture("shutdown");
let stop = f.service.startBackgroundWork({ now: () => 0 });
try {
  await f.queue();
  await f.entered.promise;
  stop();
  assert.equal(f.signal()?.aborted, true);
  f.gate.resolve();
  await f.service.settleBackgroundWork();
  assert.deepEqual(f.counts(), { decisionCalls: 1, systemCalls: 0, applied: 0 });
  stop = f.service.startBackgroundWork({ now: () => 0 });
  await f.service.recoverBackgroundWork();
  await f.service.settleBackgroundWork();
  const interrupted = (await f.service.backgroundWorkSummaries())[0];
  assert.equal(interrupted.status, "interrupted");
  assert.equal(f.counts().decisionCalls, 1, "restart cannot repeat a possibly billed capability request");
  await f.service.retryBackgroundJob(interrupted.id, interrupted.attempt, "retry-interrupted", interrupted.instanceId);
  await f.service.settleBackgroundWork();
  assert.deepEqual(f.counts(), { decisionCalls: 1, systemCalls: 1, applied: 1 });
} finally {
  stop();
  f.gate.resolve();
}
console.log("Background optional Decision receipts, fallback, storage failure, cancellation and explicit recovery: ok");

const hidden = fixture("success");
const stopHidden = hidden.service.startBackgroundWork({ now: () => 0 });
try {
  await hidden.queue(false);
  await hidden.service.settleBackgroundWork();
  assert.deepEqual(hidden.counts(), { decisionCalls: 0, systemCalls: 0, applied: 0 });
  assert.equal((await hidden.service.backgroundWorkSummaries())[0].status, "paused");
  await hidden.service.villageBackgroundPresence("visible-tab", true);
  await hidden.service.settleBackgroundWork();
  assert.deepEqual(hidden.counts(), { decisionCalls: 1, systemCalls: 0, applied: 1 });
} finally {
  stopHidden();
}

const replaced = fixture("shutdown");
const stopReplaced = replaced.service.startBackgroundWork({ now: () => 0 });
try {
  await replaced.queue();
  await replaced.entered.promise;
  await replaced.queue(true, "2");
  replaced.gate.resolve();
  await replaced.service.settleBackgroundWork();
  assert.deepEqual(replaced.counts(), { decisionCalls: 2, systemCalls: 0, applied: 1 });
  assert.equal((await replaced.service.backgroundWorkSummaries())[0].status, "completed");
} finally {
  stopReplaced();
  replaced.gate.resolve();
}

const settingEntered = deferred(),
  settingGate = deferred();
const setting = fixture("success", async (complete) =>
  complete.setting!("policy", async () => {
    settingEntered.resolve();
    await settingGate.promise;
    return { decisionsEnabled: true };
  }),
);
const stopSetting = setting.service.startBackgroundWork({ now: () => 0 });
try {
  await setting.queue();
  await settingEntered.promise;
  stopSetting();
  settingGate.resolve();
  await setting.service.settleBackgroundWork();
  assert.equal(
    [...setting.rows.values()].some((row) => row.data.settings?.policy),
    false,
    "an old activation cannot persist settings after an asynchronous read",
  );
  assert.equal(setting.counts().applied, 0);
} finally {
  stopSetting();
  settingGate.resolve();
}

let elapsed = 0,
  budgetCalls = 0;
const clock = mock.method(performance, "now", () => elapsed);
const budget = fixture("success", async (complete) => {
  for (const [key, result] of [
    ["first", "answer"],
    ["second", "answer"],
    ["third", undefined],
  ] as const) {
    assert.equal(
      await complete.optionalCompletion!(key, async () => {
        budgetCalls++;
        elapsed += 6000;
        return "answer";
      }),
      result,
    );
  }
  return "done";
});
const stopBudget = budget.service.startBackgroundWork({ now: () => 0 });
try {
  await budget.queue();
  await budget.service.settleBackgroundWork();
  assert.equal(budgetCalls, 2, "all optional questions share one ten-second job allowance");
  assert.equal(budget.counts().applied, 1);
} finally {
  stopBudget();
  clock.mock.restore();
}
console.log("Background Decisions visibility, replacement, settings ownership and shared allowance: ok");

for (const changed of ["owner", "id", "attempt"] as const) {
  const entered = deferred(),
    gate = deferred();
  const current = fixture("success", async (complete) =>
    complete.setting!("policy", async () => {
      entered.resolve();
      await gate.promise;
      return { decisionsEnabled: true };
    }),
  );
  const stop = current.service.startBackgroundWork({ now: () => 0 });
  try {
    await current.queue();
    await entered.promise;
    const row = [...current.rows.values()].find((row) => row.data.settings)!;
    row.data[changed] = changed === "attempt" ? row.data.attempt + 1 : "successor";
    row.revision++;
    const successor = structuredClone(row);
    gate.resolve();
    await current.service.settleBackgroundWork();
    assert.deepEqual(
      current.rows.get(row.id),
      successor,
      "late settings and failure cleanup cannot overwrite a successor's " + changed,
    );
    assert.equal(current.counts().applied, 0);
  } finally {
    stop();
    gate.resolve();
  }
}

for (const stage of ["setting", "optional"] as const) {
  const entered = deferred(),
    gate = deferred();
  const pause = async () => {
    entered.resolve();
    await gate.promise;
    return true;
  };
  const current = fixture(
    "success",
    async (complete) => {
      if (stage === "setting") return complete.setting!("policy", pause);
      await pause();
      return complete.optionalCompletion!("question", async () => assert.fail("Foreign running work cannot dispatch"));
    },
    "previous-owner",
  );
  const stop = current.service.startBackgroundWork({ now: () => 0 });
  try {
    await current.queue();
    await entered.promise;
    const row = [...current.rows.values()].find((row) => row.data.settings)!;
    row.data.status = "running";
    row.revision++;
    const successor = structuredClone(row);
    gate.resolve();
    await current.service.settleBackgroundWork();
    assert.deepEqual(
      current.rows.get(row.id),
      successor,
      stage + " cannot adopt or clean up a foreign owner that started since admission",
    );
    assert.equal(current.counts().applied, 0);
  } finally {
    stop();
    gate.resolve();
  }
}
