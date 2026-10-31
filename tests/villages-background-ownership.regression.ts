import type { CapabilityDocumentStore, CapabilityResolvedLanguageModel } from "@marinara-engine/shared";
import assert from "node:assert/strict";
import {
  createActivationScope,
  installDefaultActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { createBackgroundContext } from "../packages/villages/src/server/adapters/operations/background-context-service.js";
import {
  backgroundCalls,
  backgroundSetting,
  configureBackgroundContext,
} from "../packages/villages/src/server/adapters/operations/background-context.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { BackgroundCompletion } from "../packages/villages/src/server/domain/models/background-completion-model.js";
import type { BackgroundInput, Handler } from "../packages/villages/src/server/domain/models/background-model.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { completeWithRoom } from "../packages/villages/src/server/features/generation/model-requests.js";
import { createBackgroundWork } from "../packages/villages/src/server/jobs/background-service.js";
import {
  backgroundWorkSummaries,
  queueBackgroundJob,
  registerBackgroundHandler,
  settleBackgroundWork,
  startBackgroundWork,
} from "../packages/villages/src/server/jobs/background-work.js";
import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
const tick = () => new Promise<void>((resolve) => setImmediate(resolve));
async function until(predicate: () => boolean) {
  for (let i = 0; i < 200 && !predicate(); i++) await tick();
  assert.ok(predicate(), "controlled work reached its checkpoint");
}
const input = (subjectId = "same", finite = true): BackgroundInput => ({
  kind: "agenda",
  subjectId,
  seed: "same-seed",
  revision: subjectId,
  finite,
  label: subjectId,
  input: { subjectId, text: subjectId },
});
function fixture(label: string) {
  const records = new Map<string, any>();
  const context = createBackgroundContext();
  let world = defaultVillageState();
  world.seed = "same-seed";
  world.name = label;
  world.villagers = ["same", "next", "automatic", "offline", "other"].map(
    (characterId) =>
      ({
        characterId,
        cardSnapshot: {
          id: characterId,
          name: characterId,
          revision: 1,
          sourceStatus: "available",
          capturedAt: "2026-09-01T00:00:00.000Z",
          personality: "",
          summary: "",
          backstory: "",
          tags: [],
        },
        wishes: [],
        agenda: null,
      }) as any,
  );
  const logger = { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} };
  const gate = deferred(),
    timingGate = deferred();
  let holdTiming = false,
    timingEntered = false;
  let optionalHold: "before" | "after" | undefined;
  const calls: string[] = [],
    signals: AbortSignal[] = [];
  const settings: string[] = [];
  let fail = false,
    conflicts = 0;
  const documents = {
    async getById(_packageId: string, id: string) {
      return structuredClone(records.get(id) ?? null);
    },
    async list(packageId: string, kind: string) {
      return structuredClone([...records.values()].filter((row) => row.packageId === packageId && row.kind === kind));
    },
    async create(value: any) {
      assert.equal(records.has(value.id), false);
      const row = { ...structuredClone(value), revision: 1 };
      records.set(value.id, row);
      return structuredClone(row);
    },
    async update(value: any) {
      const hold =
        optionalHold &&
        Object.values(value.data?.optionalAttempts ?? {}).some((row: any) => row.status === "dispatching")
          ? optionalHold
          : undefined;
      if (hold) {
        optionalHold = undefined;
        timingEntered = true;
      }
      if (hold === "before") await timingGate.promise;
      if (holdTiming && value.data?.steps?.some((step: any) => step.timing?.outcome === "pending")) {
        timingEntered = true;
        holdTiming = false;
        await timingGate.promise;
      }
      const old = records.get(value.id);
      if (value.id.startsWith("villages-background-") && conflicts-- > 0) return null;
      if (!old || old.revision !== value.expectedRevision) return null;
      const row = { ...old, ...structuredClone(value), revision: old.revision + 1 };
      records.set(value.id, row);
      if (hold === "after") await timingGate.promise;
      return structuredClone(row);
    },
    async remove(_packageId: string, id: string, revision: number) {
      if (records.get(id)?.revision !== revision) return false;
      return records.delete(id);
    },
  } as unknown as CapabilityDocumentStore;
  const model = {
    connectionId: "same-connection",
    model: "synthetic",
    name: "synthetic",
    maxContext: 16000,
    maxOutputTokens: 4096,
    fitContext(messages: any[], options: any) {
      return { messages, maxTokens: options.maxTokens };
    },
    async chatComplete(messages: any[], options: any) {
      const text = messages[0].content;
      const row = [...records.values()].find((row) => row.kind === "background-work" && row.data.subjectId === text);
      assert.equal(row?.data.steps.at(-1)?.status, "running", "provider admission is saved first");
      assert.equal(row.data.requests, 1, "CAS retry cannot double-count admission");
      calls.push(text);
      signals.push(options.signal);
      await gate.promise;
      if (fail) throw new Error("401 Invalid API key");
      return { content: label + ":" + text, finishReason: "stop", usage: { totalTokens: 11 } };
    },
  } as CapabilityResolvedLanguageModel;
  function handler(
    getCompletion: () => BackgroundCompletion | undefined = () => context.backgroundCalls.getStore(),
    setting: typeof backgroundSetting = context.backgroundSetting,
  ): Handler {
    return {
      async generate(value) {
        const complete = getCompletion();
        assert.equal(complete?.metadata?.kind, "agenda");
        settings.push(await setting("owner-setting", () => label));
        return (
          await complete!(model, [{ role: "user", content: value.text }], 100, { temperature: 0, debugMode: false })
        ).content;
      },
      valid: () => true,
      apply(state, _value, result) {
        state.setting = String(result);
      },
    };
  }
  const suppliedHandlers = new Map<"agenda", Handler>([["agenda", handler()]]);
  const service = createBackgroundWork({
    villagesDocuments: () => documents,
    villagesLogger: () => logger,
    async readVillageState() {
      return structuredClone(world);
    },
    async mutateVillageState(mutate) {
      const next = structuredClone(world);
      await mutate(next);
      world = next;
      return structuredClone(world);
    },
    withUsagePurpose: (_purpose, work) => work(),
    measurePipeline: (_name, _tags, work) => work(),
    runtimeDebug() {},
    backgroundCalls: context.backgroundCalls,
    handlers: suppliedHandlers,
  });
  return {
    holdTiming: () => {
      holdTiming = true;
    },
    holdOptional: (stage: "before" | "after") => {
      optionalHold = stage;
    },
    timingEntered: () => timingEntered,
    timingGate,
    context,
    service,
    documents,
    model,
    logger,
    records,
    gate,
    calls,
    signals,
    settings,
    handler,
    suppliedHandlers,
    world: () => structuredClone(world),
    fail(value: boolean) {
      fail = value;
    },
    conflictOnce() {
      conflicts = 1;
    },
    seedRuntimeWorld() {
      records.set("villages-village", {
        id: "villages-village",
        packageId: "villages",
        kind: "village",
        name: label,
        description: "",
        revision: 1,
        data: structuredClone(world),
      });
    },
  };
}

async function independentQueues() {
  const a = fixture("A"),
    b = fixture("B");
  const stopA = a.service.startBackgroundWork({ now: () => 0 });
  const stopB = b.service.startBackgroundWork({ now: () => 0 });
  try {
    a.suppliedHandlers.set("agenda", {
      generate: async () => {
        throw new Error("caller Map changed");
      },
      valid: () => false,
      apply() {},
    });
    b.conflictOnce();
    await Promise.all([
      a.service.queueBackgroundJob(input()),
      a.service.queueBackgroundJob(input()),
      b.service.queueBackgroundJob(input()),
    ]);
    await until(() => a.calls.length === 1 && b.calls.length === 1);
    assert.deepEqual(
      [a.calls, b.calls],
      [["same"], ["same"]],
      "one owner's paused provider cannot block another owner's same-ID admission",
    );
    await b.service.queueBackgroundJob(input("next"));
    await tick();
    assert.equal(b.calls.length, 1, "each owner's provider queue remains serial");
    await a.service.villageBackgroundPresence("same-browser", true);
    assert.equal(b.service.hasVillagePresence(), false);
    await b.service.villageBackgroundPresence("same-browser", true);
    await a.service.villageBackgroundPresence("same-browser", false);
    assert.equal(a.service.hasVillagePresence(), false);
    assert.equal(b.service.hasVillagePresence(), true);
    stopA();
    stopA();
    assert.equal(a.signals[0].aborted, true);
    assert.equal(b.signals[0].aborted, false, "old cleanup cannot abort B's same connection");
    b.gate.resolve();
    await b.service.settleBackgroundWork();
    assert.deepEqual(b.calls, ["same", "next"]);
    assert.equal(b.world().setting, "B:next");
    assert.equal(
      (await b.service.backgroundWorkSummaries()).find((row) => row.subjectId === "same")?.status,
      "completed",
    );
    await b.service.queueBackgroundJob(input());
    await b.service.settleBackgroundWork();
    assert.deepEqual(b.calls, ["same", "next"], "saved receipt replay makes no provider call");
    a.gate.resolve();
    await a.service.settleBackgroundWork();
    assert.equal(a.world().setting, "", "revoked late A cannot apply its result");
    const restartA = a.service.startBackgroundWork({ now: () => 0 });
    try {
      await a.service.recoverBackgroundWork();
      assert.equal((await a.service.backgroundWorkSummaries())[0].status, "interrupted");
      assert.deepEqual(a.calls, ["same"], "uncertain restarted work never dispatches automatically");
      stopA();
      assert.equal(b.service.hasVillagePresence(), true);
    } finally {
      restartA();
    }
    assert.deepEqual([a.settings, b.settings], [["A"], ["B", "B"]]);
  } finally {
    stopA();
    stopB();
    a.gate.resolve();
    b.gate.resolve();
    await Promise.all([a.service.settleBackgroundWork(), b.service.settleBackgroundWork()]);
  }
}

async function connectionAndPresenceIsolation() {
  const a = fixture("failed-A"),
    b = fixture("healthy-B");
  const stopA = a.service.startBackgroundWork({ now: () => 0 }),
    stopB = b.service.startBackgroundWork({ now: () => 0 });
  a.gate.resolve();
  b.gate.resolve();
  try {
    a.fail(true);
    await a.service.queueBackgroundJob(input("offline"));
    await a.service.settleBackgroundWork();
    assert.equal((await a.service.backgroundWorkSummaries())[0].connectionPaused, true);
    a.fail(false);
    await a.service.queueBackgroundJob(input("other"));
    await a.service.settleBackgroundWork();
    assert.deepEqual(a.calls, ["offline"], "paused connection prevents speculative provider repair");
    await b.service.villageBackgroundPresence("browser-B", true);
    await b.service.queueBackgroundJob(input("automatic", false));
    await b.service.settleBackgroundWork();
    assert.deepEqual(b.calls, ["automatic"], "A's failure and hidden state do not pause B");
    await a.service.queueBackgroundJob(input("automatic", false));
    await a.service.settleBackgroundWork();
    assert.deepEqual(a.calls, ["offline"]);
  } finally {
    stopA();
    stopB();
    await Promise.all([a.service.settleBackgroundWork(), b.service.settleBackgroundWork()]);
  }
}

async function nestedContexts() {
  const a = createBackgroundContext(),
    b = createBackgroundContext();
  const completion = (label: string): BackgroundCompletion =>
    Object.assign(async () => ({ content: label }), {
      metadata: { id: label, kind: "agenda", cause: "fixture" },
      setting: async <T>(_key: string, create: () => T | Promise<T>) => create(),
    });
  const ca = completion("A"),
    cb = completion("B");
  await a.backgroundCalls.run(ca, async () => {
    assert.equal(b.backgroundCalls.getStore(), undefined);
    b.requireBackgroundSuccess(new Error("outside B"));
    await b.backgroundCalls.run(cb, async () => {
      await tick();
      assert.equal(a.backgroundCalls.getStore(), ca);
      assert.equal(b.backgroundCalls.getStore(), cb);
      assert.equal(await b.backgroundSetting("owner", () => "B"), "B");
      const failure = new Error("inside B");
      assert.throws(
        () => b.requireBackgroundSuccess(failure),
        (error) => error === failure,
      );
    });
    assert.equal(a.backgroundCalls.getStore(), ca);
    assert.equal(b.backgroundCalls.getStore(), undefined);
  });
}

async function defaultContextDispatch() {
  const a = createActivationScope(),
    b = createActivationScope();
  const releaseA = a.run(() => configureBackgroundContext(createBackgroundContext()));
  const releaseB = b.run(() => configureBackgroundContext(createBackgroundContext()));
  const clearA = installDefaultActivation(a, () => {});
  let clearB: (() => void) | undefined;
  const completion = Object.assign(async () => ({ content: "fixture" }), {
    metadata: { id: "A", kind: "agenda", cause: "fixture" },
  });
  const entered = deferred(),
    resume = deferred();
  try {
    const pending = backgroundCalls.run(completion, async () => {
      entered.resolve();
      await resume.promise;
      assert.equal(
        backgroundCalls.getStore(),
        completion,
        "direct run retains its selected owner after default replacement",
      );
    });
    await entered.promise;
    clearB = installDefaultActivation(b, () => {});
    assert.equal(backgroundCalls.getStore(), undefined);
    resume.resolve();
    await pending;
  } finally {
    resume.resolve();
    releaseA();
    releaseB();
    a.dispose();
    b.dispose();
    clearA();
    clearB?.();
  }
}

async function scopedDispatch() {
  const a = fixture("scoped-A"),
    b = fixture("scoped-B");
  a.seedRuntimeWorld();
  b.seedRuntimeWorld();
  const ownerA = createActivationScope(),
    ownerB = createActivationScope();
  const releaseA = ownerA.run(() =>
    configureVillagesRuntime({
      persistence: { documents: villageFixtureDocuments(a.documents) },
      logger: a.logger,
    } as any),
  );
  const releaseB = ownerB.run(() =>
    configureVillagesRuntime({
      persistence: { documents: villageFixtureDocuments(b.documents) },
      logger: b.logger,
    } as any),
  );
  const ownedHandler = (f: ReturnType<typeof fixture>): Handler => ({
    generate: async (value) => {
      assert.equal(backgroundCalls.getStore()?.metadata?.kind, "agenda");
      const frozen = await backgroundSetting("owner", () => f.world().name);
      assert.equal(frozen, f.world().name);
      const answer = await completeWithRoom(f.model, [{ role: "user", content: value.text }], 100, {
        temperature: 0,
        debugMode: false,
      });
      assert.equal(backgroundCalls.getStore()?.metadata?.kind, "agenda", "late helper stays in original context");
      return answer.content;
    },
    valid: () => true,
    apply(state, _value, result) {
      state.setting = String(result);
    },
  });
  ownerA.run(() => registerBackgroundHandler("agenda", ownedHandler(a)));
  ownerB.run(() => registerBackgroundHandler("agenda", ownedHandler(b)));
  const stopA = ownerA.run(startBackgroundWork),
    stopB = ownerB.run(startBackgroundWork);
  try {
    await ownerA.run(() => queueBackgroundJob(input()));
    await ownerB.run(() => queueBackgroundJob(input()));
    await until(() => a.calls.length === 1 && b.calls.length === 1);
    stopA();
    b.gate.resolve();
    await ownerB.run(settleBackgroundWork);
    assert.equal((await ownerB.run(backgroundWorkSummaries))[0].status, "completed");
    a.gate.resolve();
    await ownerA.run(settleBackgroundWork);
    releaseA();
    ownerA.dispose();
    assert.throws(() => ownerA.run(() => backgroundCalls.getStore()), /background context is not configured/);
    await ownerB.run(() => queueBackgroundJob(input("next")));
    await ownerB.run(settleBackgroundWork);
    assert.deepEqual(b.calls, ["same", "next"]);
    assert.equal(b.records.get("villages-village").data.setting, "scoped-B:next");
  } finally {
    stopA();
    stopB();
    a.gate.resolve();
    b.gate.resolve();
    if (ownerA.active) {
      await ownerA.run(settleBackgroundWork);
      releaseA();
      ownerA.dispose();
    }
    await ownerB.run(settleBackgroundWork);
    releaseB();
    ownerB.dispose();
  }
}
async function main() {
  await independentQueues();
  await connectionAndPresenceIsolation();
  const admission = fixture("superseded-admission");
  admission.gate.resolve();
  admission.holdTiming();
  const stopAdmission = admission.service.startBackgroundWork({ now: () => 0 });
  try {
    await admission.service.queueBackgroundJob(input());
    await until(admission.timingEntered);
    await admission.service.queueBackgroundJob({ ...input(), revision: "replacement" });
    admission.timingGate.resolve();
    await admission.service.settleBackgroundWork();
    assert.deepEqual(
      admission.calls,
      ["same"],
      "supersession during timing persistence dispatches only the replacement",
    );
    assert.equal((await admission.service.backgroundWorkSummaries())[0].status, "completed");
  } finally {
    stopAdmission();
    admission.timingGate.resolve();
    await admission.service.settleBackgroundWork();
  }
  for (const stage of ["before", "after"] as const) {
    const pending = fixture("unsubmitted-optional-" + stage);
    pending.holdOptional(stage);
    let calls = 0;
    pending.service.registerBackgroundHandler("agenda", {
      generate: async () =>
        pending.context.backgroundCalls.getStore()!.optionalCompletion!("decision", async () => {
          calls++;
          return "done";
        }),
      valid: () => true,
      apply(state, _input, result) {
        state.setting = result;
      },
    });
    const stop = pending.service.startBackgroundWork();
    try {
      await pending.service.queueBackgroundJob(input());
      await until(pending.timingEntered);
      await pending.service.queueBackgroundJob({ ...input(), revision: "replacement" });
      pending.timingGate.resolve();
      await pending.service.settleBackgroundWork();
      assert.equal(calls, 1, "A superseded unsubmitted optional reservation never invokes its provider.");
      assert.equal((await pending.service.backgroundWorkSummaries())[0].status, "completed");
      assert.equal(
        [...pending.records.values()].filter((row) => row.kind === "background-history").length,
        0,
        "Unsubmitted optional work cannot become uncertain history.",
      );
    } finally {
      stop();
      pending.timingGate.resolve();
      await pending.service.settleBackgroundWork();
    }
  }
  const replaced = fixture("late-config");
  const stopReplaced = replaced.service.startBackgroundWork({ now: () => 0 });
  try {
    replaced.fail(true);
    await replaced.service.queueBackgroundJob(input());
    await until(() => replaced.calls.length === 1);
    await replaced.service.queueBackgroundJob({ ...input(), revision: "new-input" });
    replaced.gate.resolve();
    await replaced.service.settleBackgroundWork();
    assert.equal(
      replaced.calls.length,
      1,
      "An uncertain superseded request holds replacement work for explicit Retry.",
    );
    assert.equal(
      [...replaced.records.values()].filter((row) => row.kind === "background-connection").length,
      0,
      "The old failed callback cannot impose a connection pause.",
    );
    const held = (await replaced.service.backgroundWorkSummaries())[0];
    assert.equal(held.status, "interrupted");
    await replaced.service.retryBackgroundJob(held.id, held.attempt, "retry-held-replacement");
    await replaced.service.settleBackgroundWork();
    assert.equal(replaced.calls.length, 2, "Explicit Retry authorizes the separately admitted replacement.");
    assert.equal(
      [...replaced.records.values()].filter((row) => row.kind === "background-connection").length,
      1,
      "Only the replacement's own failure can pause its connection.",
    );
  } finally {
    stopReplaced();
    replaced.gate.resolve();
    await replaced.service.settleBackgroundWork();
  }
  await nestedContexts();
  await defaultContextDispatch();
  await scopedDispatch();
  console.log(
    "Background ownership passed: independent same-ID queues/stores/handlers/presence/connections, saved claims/replay, nested contexts, scoped helpers and late-result fences (synthetic providers).",
  );
}
const watchdog = setTimeout(() => {
  throw new Error("Background ownership scenarios did not finish");
}, 20000);
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => clearTimeout(watchdog));
