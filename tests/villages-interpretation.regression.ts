import assert from "node:assert/strict";
import {
  activationScope,
  createActivationScope,
  installDefaultActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { createUsageLedger } from "../packages/villages/src/server/adapters/models/usage-ledger-service.js";
import type {
  CapabilityDocumentStore,
  CapabilityLanguageModelMessage,
  CapabilityResolvedLanguageModel,
} from "@marinara-engine/shared";
import type { EngineDecisionBackend } from "../packages/villages/src/server/adapters/engine/decisions-adapter.js";
import { createInterpretation } from "../packages/villages/src/server/features/generation/interpretation-service.js";
import { createSystemInterpretation } from "../packages/villages/src/server/features/generation/system-interpretation-service.js";
import {
  configureInterpretation,
  recordInterpretationRouting,
} from "../packages/villages/src/server/features/generation/interpretation.js";
import {
  configureSystemInterpretation,
  systemInterpretations,
} from "../packages/villages/src/server/features/generation/system-interpretation.js";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";

import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import {
  configureDecisionsAdapter,
  loadDecisionEngineModules,
  decisionAdapterStatus,
} from "../packages/villages/src/server/adapters/engine/decisions-adapter.js";
import {
  coordinateVenue,
  venueCheckpoint,
  coordinatedOptionalCompletion,
  venueInterpretationSettings,
} from "../packages/villages/src/server/jobs/venue-coordinator.js";
import {
  saveInterpretationSettings,
  readInterpretationSettings,
} from "../packages/villages/src/server/features/settings/interpretation-settings.js";
import { interpretChecks } from "../packages/villages/src/server/features/generation/interpretation.js";
import { readDecisionInterpretation } from "../packages/villages/src/server/domain/rules/interpretation-rules.js";
import { readSystemInterpretations } from "../packages/villages/src/server/domain/rules/interpretation-rules.js";
import { type InterpretationCheck } from "../packages/villages/src/server/domain/models/interpretation-check-model.js";
import {
  readInterpretationDiagnostics,
  writeInterpretationDiagnostics,
  scheduleSystemComparisons,
  stopInterpretationComparisons,
} from "../packages/villages/src/server/features/generation/interpretation-diagnostics.js";

import { applyInterpretedRoomEvents } from "../packages/villages/src/server/domain/rules/scene-room-application.js";
import { roomInterpretationChecks } from "../packages/villages/src/server/features/scenes/room-interpretation.js";
import { dismissalDestination } from "../packages/villages/src/server/domain/rules/scene-room-events.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";

const records = new Map<string, any>();

function ownershipGate() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

async function ownedInterpretationConnections() {
  let otherScope: ReturnType<typeof createActivationScope> | undefined;
  const ownedCheck: InterpretationCheck = {
    id: "same",
    domain: "room",
    question: "Permission?",
    facts: { actorId: "resident", zoneId: "private" },
    outcomes: [{ id: "invite-now", statement: "Permission granted" }],
    evidence: [
      { id: "current", speakerId: "resident", name: "Resident", content: "Synthetic private answer", current: true },
    ],
  };
  function fixture(label: string, heldStage?: string) {
    const scope = createActivationScope(),
      entered = ownershipGate(),
      gate = ownershipGate();
    const rows = new Map<string, any>(),
      events: string[] = [];
    const controller = new AbortController();
    let held = false,
      diagnosticFailure: Error | undefined,
      backendFailure: Error | undefined,
      completionFailure: Error | undefined;
    let decisions = heldStage !== "system",
      providerCalls = 0;
    const logger = { debug() {}, debugOverride() {}, info() {}, warn() {}, error() {} };
    function owned(event: string) {
      assert.equal(activationScope(), scope, label + " " + event + " retains its activation");
      if (!scope.active) throw new Error(label + " connections unavailable");
      events.push(event);
    }
    async function pause(stage: string) {
      if (!held && heldStage === stage) {
        held = true;
        entered.resolve();
        await gate.promise;
      }
    }
    const documents = {
      async getById(_package: string, id: string) {
        owned("read");
        return structuredClone(rows.get(id) ?? null);
      },
      async list() {
        return [];
      },
      async create(input: any) {
        owned("create");
        const row = { ...structuredClone(input), revision: 1 };
        rows.set(input.id, row);
        return structuredClone(row);
      },
      async update(input: any) {
        owned("update");
        const previous = rows.get(input.id);
        if (!previous || previous.revision !== input.expectedRevision) return null;
        const row = { ...previous, ...structuredClone(input), revision: previous.revision + 1 };
        rows.set(input.id, row);
        return structuredClone(row);
      },
      async remove() {
        return false;
      },
    } as CapabilityDocumentStore;
    const ledger = createUsageLedger({
      owner: "same-process",
      villagesDocuments: () => documents,
      villagesLogger: () => logger,
      villageEngineJson: async <T>() => [] as unknown as T,
      backgroundCalls: { getStore: () => undefined, run: (_store, work) => work() },
      venueDebugContext: () => ({}),
      linkApiQuote: async () => null,
      readExchangeRate: async () => null,
    });
    const backend: EngineDecisionBackend = {
      model: "same-model",
      maxStateTokens: 10000,
      calibration: { defaultThreshold: 0.5 },
      deferPreGeneration: false,
      async ask(state, questions) {
        owned("ask");
        assert.equal(this, backend);
        assert.doesNotMatch(JSON.stringify(state), /"outcomes"/);
        assert.deepEqual(
          questions.map((q) => q.id),
          ["0:0"],
        );
        providerCalls++;
        await pause("ask");
        if (backendFailure) throw backendFailure;
        return new Map([["0:0", 1]]);
      },
    };
    let originalMessages: CapabilityLanguageModelMessage[] | undefined;
    const model: CapabilityResolvedLanguageModel = {
      name: "same",
      model: "same-model",
      connectionId: "same-connection",
      maxContext: 8192,
      maxOutputTokens: 4096,
      fitContext(messages, options) {
        owned("fit");
        originalMessages = messages;
        return {
          messages,
          maxTokens: options?.maxTokens,
          estimatedTokensBefore: 0,
          estimatedTokensAfter: 0,
          trimmed: false,
        };
      },
      async chatComplete() {
        assert.fail("This factory probe supplies its completion connection explicitly");
      },
    };
    const system = createSystemInterpretation({
      villagesLanguageModels() {
        owned("model-getter");
        return {
          async resolve() {
            return model;
          },
          async resolveForRequest(options) {
            owned("resolve");
            assert.equal(options.connectionId, label);
            await pause("resolve");
            return model;
          },
        };
      },
      async villagesConnectionIdFor(purpose) {
        owned("connection");
        assert.equal(purpose, "system");
        await pause("connection");
        return label;
      },
      async completeWithRoom(resolved, messages, maxTokens, options) {
        owned("system-completion");
        assert.equal(resolved, model);
        assert.equal(messages, originalMessages);
        assert.equal(maxTokens, 1024);
        assert.equal(options.retryEmpty, false);
        assert.equal(options.responseFormat?.type, "json_object");
        assert.equal(options.usagePurpose, "checks");
        if (options.signal) assert.equal(options.signal, controller.signal);
        providerCalls++;
        await pause("completion");
        if (completionFailure) throw completionFailure;
        return {
          content: JSON.stringify({
            results: [{ id: "same", outcome: "invite-now", evidenceIds: ["current"], reason: label }],
          }),
          finishReason: "stop",
        };
      },
    });
    const interpretation = createInterpretation({
      async resolveVillagesDecisionBackend(signal) {
        owned("backend");
        assert.equal(signal, controller.signal);
        await pause("backend");
        return decisions ? backend : null;
      },
      async trackUsage(meta, work) {
        owned("claim");
        assert.equal(meta.purpose, "checks");
        assert.equal(meta.stage, "decisions");
        await pause("claim");
        return ledger.trackUsage(meta, () => (otherScope ? otherScope.run(work) : work()));
      },
      venueOperationSignal() {
        owned("signal");
        return controller.signal;
      },
      async coordinatedOptionalCompletion(_fingerprint, work) {
        owned("optional");
        await pause("optional");
        return otherScope ? otherScope.run(() => work(controller.signal)) : work(controller.signal);
      },
      async venueCheckpoint(stage, work) {
        owned("checkpoint:" + stage);
        await pause(stage.endsWith("-system") ? "system" : "outer");
        return otherScope ? otherScope.run(work) : work();
      },
      venueInterpretationSettings() {
        owned("settings");
        return { decisionsEnabled: true, compareSystem: false };
      },
      async writeInterpretationDiagnostics() {
        owned("diagnostics");
        await pause("diagnostics");
        if (diagnosticFailure) throw diagnosticFailure;
      },
      systemInterpretations: (checks, signal) => system.systemInterpretations(checks, signal),
      bindCallback: (callback) => scope.bind(callback),
    });
    assert.deepEqual(events, [], "constructing both interpretation factories is inert");
    const releaseRuntime = scope.run(() =>
      configureVillagesRuntime({ persistence: { documents }, logger, getAgentConfig: async () => null } as any),
    );
    const releaseInterfaces = scope.run(() => [
      configureSystemInterpretation(system),
      configureInterpretation(interpretation),
    ]);
    return {
      scope,
      entered,
      gate,
      events,
      rows,
      ledger,
      system,
      controller,
      calls: () => providerCalls,
      useSystem() {
        decisions = false;
      },
      failDiagnostics(error?: Error) {
        diagnosticFailure = error;
      },
      failBackend(error?: Error) {
        backendFailure = error;
      },
      failCompletion(error?: Error) {
        completionFailure = error;
      },
      release() {
        releaseInterfaces.forEach((release) => release());
        releaseRuntime();
      },
    };
  }
  for (const stage of [
    "outer",
    "optional",
    "backend",
    "claim",
    "ask",
    "system",
    "diagnostics",
    "connection",
    "resolve",
    "completion",
  ]) {
    const a = fixture("A", stage),
      b = fixture("B");
    otherScope = b.scope;
    const clearA = installDefaultActivation(a.scope, () => {});
    let clearB = () => {};
    try {
      const directSystem = ["connection", "resolve", "completion"].includes(stage);
      const pending = directSystem
        ? systemInterpretations([ownedCheck], a.controller.signal)
        : interpretChecks([ownedCheck], "owned", "same-scene");
      await Promise.race([
        a.entered.promise,
        pending.then(() => assert.fail("The request completed before its controlled " + stage + " pause")),
      ]);
      assert.equal(a.events[0], directSystem ? "model-getter" : "settings", "initial selection order is retained");
      clearB = installDefaultActivation(b.scope, () => {});
      const independent = await interpretChecks([ownedCheck], "independent", "same-scene");
      assert.equal(independent.results[0].source, "decisions");
      clearA();
      a.gate.resolve();
      const result = await pending;
      const resultRows = Array.isArray(result) ? result : result.results;
      assert.equal(resultRows[0].outcome, "invite-now");
      assert.equal(resultRows[0].source, directSystem || stage === "system" ? "system" : "decisions");
      assert.equal(a.calls(), 1);
      assert.equal(b.calls(), 1);
      const aReceipts = a.rows.get("villages-ai-usage")?.data.requests ?? [];
      const bReceipts = b.rows.get("villages-ai-usage")?.data.requests ?? [];
      assert.equal(aReceipts.length, directSystem || stage === "system" ? 0 : 1);
      assert.equal(bReceipts.length, 1);
      assert(bReceipts.every((row: any) => row.status === "complete" && row.purpose === "checks"));
      assert(aReceipts.every((row: any) => row.status === "complete" && row.purpose === "checks"));
      assert.doesNotMatch(JSON.stringify(aReceipts), /Synthetic private answer|Permission granted/);
      if (directSystem || stage === "system") assert(a.events.indexOf("model-getter") < a.events.indexOf("connection"));
      assert.equal(activationScope(), b.scope);
      console.log("Owned interpretation stage passed:", stage);
    } finally {
      a.gate.resolve();
      clearA();
      clearB();
      a.release();
      b.release();
      a.scope.dispose();
      b.scope.dispose();
    }
  }
  const a = fixture("A"),
    b = fixture("B");
  otherScope = b.scope;
  const clearA = installDefaultActivation(a.scope, () => {});
  let clearB = () => {};
  try {
    const diagnosticError = new Error("exact diagnostic failure");
    a.failDiagnostics(diagnosticError);
    assert.equal((await interpretChecks([ownedCheck], "diagnostic", "same-scene")).results[0].source, "decisions");
    await assert.rejects(
      recordInterpretationRouting("same-scene", { checks: [ownedCheck], skipped: [], reasons: new Map() }),
      (error) => error === diagnosticError,
    );
    a.failDiagnostics();
    const backendError = new Error("exact Decision failure");
    a.failBackend(backendError);
    await assert.rejects(interpretChecks([ownedCheck], "backend-error"), (error) => error === backendError);
    assert.equal(a.calls(), 2, "the supplied optional connection propagates its exact failure without another request");
    assert.equal(
      a.rows.get("villages-ai-usage").data.requests.filter((row: any) => row.status === "unknown").length,
      1,
    );
    const completionError = new Error("exact System failure");
    a.failCompletion(completionError);
    await assert.rejects(systemInterpretations([ownedCheck]), (error) => error === completionError);
    clearB = installDefaultActivation(b.scope, () => {});
    a.release();
    a.scope.dispose();
    await assert.rejects(
      a.scope.run(() => interpretChecks([ownedCheck], "retired")),
      /not configured/,
    );
    await assert.rejects(
      a.scope.run(() => systemInterpretations([ownedCheck])),
      /not configured/,
    );
    assert.equal(b.calls(), 0);
  } finally {
    clearA();
    clearB();
    a.release();
    b.release();
    a.scope.dispose();
    b.scope.dispose();
  }
  const cancelled = fixture("A", "completion"),
    current = fixture("B");
  otherScope = current.scope;
  const clearCancelled = installDefaultActivation(cancelled.scope, () => {});
  let clearCurrent = () => {};
  try {
    const abortError = new Error("exact cancellation after a System response");
    const pending = systemInterpretations([ownedCheck], cancelled.controller.signal);
    const refused = assert.rejects(pending, (error) => error === abortError);
    await Promise.race([
      cancelled.entered.promise,
      pending.then(() => assert.fail("System completion must reach its pause")),
    ]);
    clearCurrent = installDefaultActivation(current.scope, () => {});
    cancelled.controller.abort(abortError);
    cancelled.gate.resolve();
    await refused;
    assert.equal(cancelled.calls(), 1, "cancellation after dispatch does not admit another request");
    assert.equal(current.calls(), 0);
  } finally {
    cancelled.gate.resolve();
    clearCancelled();
    clearCurrent();
    cancelled.release();
    current.release();
    cancelled.scope.dispose();
    current.scope.dispose();
  }
}
const documents = {
  async getById(_package: string, id: string) {
    return structuredClone(records.get(id) ?? null);
  },
  async create(input: any) {
    if (records.has(input.id)) throw new Error("Duplicate");
    const row = { ...structuredClone(input), revision: 1 };
    records.set(input.id, row);
    return row;
  },
  async update(input: any) {
    const old = records.get(input.id);
    if (!old || old.revision !== input.expectedRevision) return null;
    const row = { ...old, ...structuredClone(input), revision: old.revision + 1 };
    records.set(input.id, row);
    return structuredClone(row);
  },
};
let systemCalls = 0,
  nativeOutcome = "invite-now",
  holdComparison = false;
let releaseComparison: (() => void) | undefined;
const frozenInputs: unknown[] = [];
const release = configureVillagesRuntime({
  persistence: { documents },
  logger: { debug() {}, debugOverride() {}, warn() {}, error() {}, info() {} },
  async getAgentConfig() {
    return null;
  },
  languageModels: {
    async resolveForRequest() {
      return {
        model: "fixture",
        maxOutputTokens: 4096,
        fitContext(messages: any[], options: any) {
          return { messages, ...options };
        },
        async chatComplete(messages: any[], options: any) {
          assert.deepEqual(options.responseFormat, { type: "json_object" });
          systemCalls++;
          const { checks } = JSON.parse(messages[1].content);
          frozenInputs.push(checks);
          if (holdComparison)
            await new Promise<void>((resolve, reject) => {
              releaseComparison = resolve;
              options.signal?.addEventListener("abort", () => reject(new Error("cancelled")), { once: true });
            });
          return {
            content: JSON.stringify({
              results: checks.map((check: any) => ({
                id: check.id,
                outcome: nativeOutcome,
                evidenceIds: ["answer"],
                reason: "Contextual fixture",
              })),
            }),
            finishReason: "stop",
          };
        },
      };
    },
  },
} as any);
const check: InterpretationCheck = {
  id: "room",
  domain: "room",
  question: "Did Aqua invite you into her room?",
  facts: { actorId: "aqua", zoneId: "bedroom" },
  outcomes: [
    { id: "invite-now", statement: "Aqua permits entry now." },
    { id: "refuse", statement: "Aqua refuses entry now." },
  ],
  evidence: [
    { id: "question", speakerId: "player", name: "Player", content: "Can I look at your room?" },
    { id: "answer", speakerId: "aqua", name: "Aqua", content: "Oh yeah.", current: true },
  ],
};
let number = 0;
async function operation(work: () => Promise<any>) {
  const id = `test-${++number}`;
  records.set(`villages-venue-visit-${id}`, {
    id: `villages-venue-visit-${id}`,
    revision: 1,
    name: "Scene",
    data: {
      id,
      status: "active",
      sceneRevision: 0,
      lastActivityAt: new Date().toISOString(),
      lines: [],
      submissions: [],
    },
  });
  return coordinateVenue(id, id, "turn", {}, 0, undefined, work);
}
async function main() {
  const root = await mkdtemp(join(tmpdir(), "villages-decision-contract-"));
  let teardown: (() => void) | undefined;
  try {
    const dist = join(root, "dist");
    await mkdir(join(dist, "services/decision"), { recursive: true });
    await mkdir(join(dist, "services/storage"), { recursive: true });
    await mkdir(join(dist, "config"), { recursive: true });
    await writeFile(join(root, "package.json"), JSON.stringify({ name: "@marinara-engine/server", type: "module" }));
    await writeFile(join(dist, "index.js"), "");
    await writeFile(join(dist, "config/build-meta.json"), JSON.stringify({ commit: "ead04150a132" }));
    await writeFile(
      join(dist, "services/storage/connections.storage.js"),
      'export const createConnectionsStorage = () => ({ getDefaultForDecision: async () => ({id:"fixture"}), getWithKey: async () => ({}) });',
    );
    await writeFile(
      join(dist, "services/storage/app-settings.storage.js"),
      "export const createAppSettingsStorage = () => ({get:async()=>null});",
    );
    await writeFile(
      join(dist, "services/decision/decision-default.js"),
      'export const DECISION_SETTINGS_KEYS = {localDefault:"local",thinkingPreGeneration:"thinking"}; export let calls=0; export let mode="yes"; export const setMode=value=>{mode=value}; export async function resolveDecisionBackend(){if(mode==="absent")return null;return {model:"fixture",maxStateTokens:30000,calibration:{defaultThreshold:0.1,questionShape:"statement"},deferPreGeneration:mode==="deferred",ask:async(state,questions)=>{calls++;if(mode==="error")throw new Error("SECRET provider body");if(mode==="missing")return null;return new Map(questions.map((question,index)=>[question.id,mode==="conflict"?1:mode==="no"?0:mode==="malformed"?NaN:index===0?0.2:0]))}}};',
    );
    const entry = join(dist, "index.js");
    const fixture = await import(pathToFileURL(join(dist, "services/decision/decision-default.js")).href);
    const modules = await loadDecisionEngineModules(entry);
    assert.equal(modules.resolveDecisionBackend, fixture.resolveDecisionBackend, "canonical live ESM module reused");
    teardown = configureDecisionsAdapter({ app: { db: {} } }, entry);
    assert.equal((await decisionAdapterStatus()).available, true);
    assert.deepEqual(await readInterpretationSettings(), { decisionsEnabled: false, compareSystem: true });
    const off = await operation(() => interpretChecks([check], "off", "visible"));
    assert.equal(off.results[0].source, "system");
    assert.equal(fixture.calls, 0);
    await saveInterpretationSettings({ decisionsEnabled: true });
    const enabled = await operation(() => interpretChecks([check], "on", "visible"));
    assert.equal(enabled.results[0].source, "decisions");
    assert.equal(systemCalls, 1, "no authoritative native vote for usable Decisions");
    assert.equal(enabled.traces[0].decisions.threshold, 0.1);
    for (const mode of ["no", "conflict", "missing", "malformed", "error", "absent", "deferred"]) {
      fixture.setMode(mode);
      const batch = await operation(() => interpretChecks([check], mode));
      assert.equal(batch.results[0].source, "system", mode);
      assert.equal(batch.results[0].outcome, "invite-now", "request failures are never refusals");
      assert.ok(!JSON.stringify(batch.traces).includes("SECRET"));
    }
    fixture.setMode("yes");
    const exhausted = await operation(async () => {
      let calls = 0;
      await coordinatedOptionalCompletion("once", async () => {
        calls++;
        throw new Error("lost answer");
      });
      await coordinatedOptionalCompletion("once", async () => {
        calls++;
        return 1;
      });
      assert.equal(calls, 1);
      return true;
    });
    assert.equal(exhausted, true);
    const deadlineStarted = performance.now();
    await operation(async () => {
      assert.equal(await coordinatedOptionalCompletion("slow", () => new Promise(() => {})), undefined);
      let afterDeadline = 0;
      assert.equal(await coordinatedOptionalCompletion("remaining", async () => ++afterDeadline), undefined);
      assert.equal(afterDeadline, 0, "whole operation allowance is exhausted, not reset per check");
    });
    assert.ok(performance.now() - deadlineStarted >= 9500 && performance.now() - deadlineStarted < 13000);
    await operation(async () => {
      assert.equal(venueInterpretationSettings().decisionsEnabled, true);
      await saveInterpretationSettings({ decisionsEnabled: false });
      assert.equal(venueInterpretationSettings().decisionsEnabled, true, "mid-operation setting is frozen");
      const replay = await venueCheckpoint("saved", () => interpretChecks([check], "saved-inner"));
      const second = await venueCheckpoint("saved", async () => {
        throw new Error("must replay");
      });
      assert.deepEqual(replay, second);
    });
    assert.equal(await operation(async () => venueInterpretationSettings().decisionsEnabled), false);
    await saveInterpretationSettings({ decisionsEnabled: true });
    enabled.traces[0].applied = "Entry offer created";
    await writeInterpretationDiagnostics("visible", enabled.traces);
    const before = structuredClone(records.get("villages-interpretation-visible").data);
    const count = systemCalls;
    holdComparison = true;
    nativeOutcome = "refuse";
    scheduleSystemComparisons("visible", enabled);
    for (let index = 0; index < 100 && !releaseComparison; index++)
      await new Promise((resolve) => setTimeout(resolve, 5));
    assert.ok(releaseComparison, "comparison dispatched independently");
    assert.equal(systemCalls, count + 1);
    assert.deepEqual(
      (frozenInputs.at(-1) as any[]).map(({ evidenceIds: _evidenceIds, ...row }) => ({
        ...row,
        evidence: enabled.checks.find((check) => check.id === row.id)?.evidence,
      })),
      enabled.checks,
      "same witnessed input without Decisions verdict",
    );
    releaseComparison!();
    for (
      let index = 0;
      index < 100 && (await readInterpretationDiagnostics("visible")).checks.at(-1)?.system.status !== "complete";
      index++
    )
      await new Promise((resolve) => setTimeout(resolve, 5));
    const compared = (await readInterpretationDiagnostics("visible")).checks.at(-1)!;
    assert.equal(compared.system.outcome, "refuse");
    assert.equal(compared.result.outcome, "invite-now");
    assert.equal(compared.applied, "Entry offer created");
    assert.deepEqual(compared.evidence, before.checks.at(-1).evidence);
    scheduleSystemComparisons("visible", enabled);
    await new Promise((resolve) => setTimeout(resolve, 20));
    assert.equal(systemCalls, count + 1, "comparison not repeated");
    holdComparison = false;
    const scores = new Map([
      ["0:0", 0],
      ["0:1", 0],
    ]);
    assert.equal(readDecisionInterpretation(check, scores, 0.1, 0), null);
    for (const text of ["Oh yeah.", "Sure, I guess. Try not to touch anything.", "Nods and steps aside."]) {
      const short = structuredClone(check);
      short.evidence[1].content = text;
      assert.equal(
        readSystemInterpretations({ results: [{ id: "room", outcome: "invite-now", evidenceIds: ["answer"] }] }, [
          short,
        ])[0].outcome,
        "invite-now",
      );
    }
    assert.equal(
      readSystemInterpretations({ results: [{ id: "room", outcome: "invite-now", evidenceIds: ["question"] }] }, [
        check,
      ])[0].outcome,
      "unresolved",
      "old question is not new permission",
    );
    const village = defaultVillageState();
    const venue: any = {
      id: "home",
      residentIds: ["aqua"],
      occupancy: { playerHome: false },
      zones: [
        { id: "exterior", name: "Exterior", kind: "exterior", venueClass: "residence" },
        { id: "hall", name: "Hall", kind: "shared-residence", venueClass: "residence" },
        {
          id: "bedroom",
          name: "Secret description",
          kind: "private-residence",
          ownerId: "aqua",
          venueClass: "residence",
        },
      ],
    };
    village.venues = [venue];
    const scene: any = {
      id: "same-scene",
      placeId: "home",
      zoneId: "bedroom",
      area: "private",
      activeIds: ["aqua"],
      participants: [{ characterId: "aqua", name: "Aqua" }],
      lines: [{ id: "unseen", role: "user", content: "secret", heardBy: [], zoneId: "hall" }],
      grantedZoneIds: ["hall", "bedroom"],
      enteredFromZoneId: "hall",
    };
    const checks = roomInterpretationChecks(
      scene,
      village,
      "I ask",
      [{ speakerId: "aqua", content: "Leave.", kind: "dialogue", heardBy: ["aqua"] }],
      "key",
      [],
    );
    assert.ok(checks.length);
    assert.ok(!JSON.stringify(checks).includes("secret"));
    assert.ok(!JSON.stringify(checks).includes("Secret description"));
    assert.equal(dismissalDestination(village, venue, scene), "hall");
    const dismiss = {
      ...enabled,
      checks: [check],
      results: [{ outcome: "dismiss", source: "system" as const, evidenceIds: ["answer"], reason: "" }],
      traces: [structuredClone(enabled.traces[0])],
    };
    applyInterpretedRoomEvents(scene, dismiss, village);
    assert.equal(scene.id, "same-scene");
    assert.equal(scene.zoneId, "hall");
    assert.deepEqual(scene.dismissedZoneIds, ["bedroom"]);
    assert.ok(!scene.grantedZoneIds.includes("bedroom"));
    const rejected = structuredClone(scene);
    rejected.zoneId = "bedroom";
    venue.zones[2].ownerId = "someone-else";
    applyInterpretedRoomEvents(rejected, dismiss, village);
    assert.equal(rejected.zoneId, "bedroom");
    await assert.rejects(() => loadDecisionEngineModules(join(root, "unsupported.ts")));
    console.log("villages-interpretation: ok");
  } finally {
    stopInterpretationComparisons();
    teardown?.();
    release();
    await rm(root, { recursive: true, force: true });
  }
  await ownedInterpretationConnections();
}
await main();
