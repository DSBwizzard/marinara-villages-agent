import assert from "node:assert/strict";
import {
  createActivationScope,
  installDefaultActivation,
  activationScope,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { configureRuntimeHost } from "../packages/villages/src/server/adapters/engine/runtime-host.js";
import { villagesLanguageModels } from "../packages/villages/src/server/adapters/models/language-models.js";
import type { CapabilityResolvedLanguageModel, CapabilityRuntimeHost } from "@marinara-engine/shared";
import { createUsageLedger } from "../packages/villages/src/server/adapters/models/usage-ledger-service.js";
import {
  configureUsageLedger,
  trackUsage,
  withUsagePurpose,
  inferredPurpose,
  readUsageLedger,
  usageProcessOwner,
} from "../packages/villages/src/server/adapters/models/usage-ledger.js";
import { createBackgroundContext } from "../packages/villages/src/server/adapters/operations/background-context-service.js";
import {
  configureMetricsContext,
  active,
  pipelineStorage,
  pipelineSignal,
} from "../packages/villages/src/server/adapters/observability/metrics-context.js";
import {
  createMetricsContext,
  type Metrics,
} from "../packages/villages/src/server/adapters/observability/metrics-context-service.js";
import { measureModel } from "../packages/villages/src/server/adapters/observability/pipeline-metrics.js";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function fixture(provider: string, inputRate: number) {
  let row: any;
  let hold = false,
    failWrites = false,
    conflicts = 0,
    connectionReads = 0;
  const gate = deferred(),
    entered = deferred();
  const documents: any = {
    async getById() {
      return structuredClone(row ?? null);
    },
    async create(input: any) {
      if (hold) {
        entered.resolve();
        await gate.promise;
      }
      if (failWrites) throw new Error("accounting disk unavailable");
      if (row) throw new Error("duplicate");
      row = { ...structuredClone(input), revision: 1 };
      return structuredClone(row);
    },
    async update(input: any) {
      if (failWrites) throw new Error("accounting disk unavailable");
      if (conflicts-- > 0 || input.expectedRevision !== row?.revision) return null;
      row = { ...row, ...structuredClone(input), revision: row.revision + 1 };
      return structuredClone(row);
    },
  };
  const background = createBackgroundContext();
  const ports = {
    owner: usageProcessOwner,
    villagesDocuments: () => documents,
    villagesLogger: () => ({ debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} }),
    villageEngineJson: async <T>() => {
      connectionReads++;
      return [{ id: "same-connection", provider, model: "same-model", baseUrl: "" }] as T;
    },
    backgroundCalls: background.backgroundCalls,
    venueDebugContext: () => ({}),
    linkApiQuote: async () => ({ rate: null, groups: [], note: "fixture" }),
    readExchangeRate: async () => null,
  };
  const service = createUsageLedger(ports);
  function seed() {
    row = {
      id: "villages-ai-usage",
      revision: 1,
      data: {
        requests: [],
        overrides: {
          "same-connection:same-model": {
            input: inputRate,
            output: inputRate * 2,
            source: "fixture",
            checkedAt: "now",
          },
        },
      },
    };
  }
  return {
    service,
    ports,
    seed,
    gate,
    entered,
    row: () => row,
    holdCreate: () => {
      hold = true;
    },
    setFailure: (value: boolean) => {
      failWrites = value;
    },
    conflict: () => {
      conflicts = 2;
    },
    connectionReads: () => connectionReads,
  };
}
const meta = { connectionId: "same-connection", model: "same-model" };
const completion = () =>
  Promise.resolve({
    content: "private text never stored",
    finishReason: "stop",
    usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
  });
async function queuesAndRates() {
  const a = fixture("google", 1),
    b = fixture("anthropic", 10);
  a.holdCreate();
  b.seed();
  let callsA = 0,
    callsB = 0;
  const pending = a.service.withUsagePurpose("checks", () =>
    a.service.trackUsage(meta, async () => {
      callsA++;
      return completion();
    }),
  );
  await a.entered.promise;
  try {
    await b.service.withUsagePurpose("conversation", () =>
      b.service.trackUsage(meta, async () => {
        callsB++;
        return completion();
      }),
    );
    assert.equal(callsA, 0, "the claim is recorded before provider dispatch");
    assert.equal(callsB, 1, "another owner's queue progresses while this claim is paused");
    let ledgerB = await b.service.readUsageLedger();
    assert.equal(ledgerB.totals.requests, 1);
    assert.equal(ledgerB.requests[0].provider, "anthropic");
    assert.equal(ledgerB.requests[0].purpose, "conversation");
    assert.equal(ledgerB.requests[0].dollars, 200 / 1e6);
    a.gate.resolve();
    await pending;
    const ledgerA = await a.service.readUsageLedger();
    assert.equal(ledgerA.totals.requests, 1);
    assert.equal(ledgerA.requests[0].provider, "google");
    assert.equal(ledgerA.requests[0].purpose, "checks");
    assert.equal(
      a.row().data.requests[0].owner,
      b.row().data.requests[0].owner,
      "live activations share the process recovery epoch",
    );
    assert.ok(!JSON.stringify(a.row()).includes("private text"));
    b.conflict();
    await b.service.trackUsage(meta, completion);
    ledgerB = await b.service.readUsageLedger();
    assert.equal(ledgerB.totals.requests, 2, "CAS retries do not duplicate counts");
    assert.equal(ledgerB.totals.tokens, 30);
    assert.equal(b.connectionReads(), 1, "each owner reuses only its own connection snapshot");
    a.setFailure(true);
    await a.service.trackUsage(meta, completion);
    assert.match((await a.service.readUsageLedger(false)).error, /incomplete/);
    assert.equal((await b.service.readUsageLedger(false)).error, "");
    await assert.rejects(
      b.service.trackUsage(meta, async () => {
        throw new Error("provider uncertain");
      }),
      /provider uncertain/,
    );
    const failed = await b.service.readUsageLedger();
    assert.equal(failed.totals.requests, 3);
    assert.equal(failed.requests[0].status, "unknown");
    assert.equal(failed.requests[0].dollars, null);
  } finally {
    a.gate.resolve();
    await pending;
  }
}
async function periodAndRestart() {
  const a = fixture("google", 1),
    b = fixture("anthropic", 10);
  a.seed();
  b.seed();
  const gate = deferred(),
    entered = deferred();
  const pending = a.service.trackUsage(meta, async () => {
    entered.resolve();
    await gate.promise;
    return completion();
  });
  await entered.promise;
  try {
    assert.equal((await a.service.readUsageLedger()).running, 1);
    assert.equal((await b.service.readUsageLedger()).running, 0);
    assert.equal(a.row().data.requests[0].status, "running", "another world's read cannot abandon an active request");
    await a.service.resetUsagePeriod();
    gate.resolve();
    await pending;
    const current = await a.service.readUsageLedger();
    assert.equal(current.totals.requests, 0);
    assert.equal(current.totals.tokens, 0);
    assert.equal(a.row().data.all.tokens, 15, "late results count in lifetime totals, not a new display period");
    const stamp = new Date().toISOString();
    a.row().data.requests.push({
      id: "abandoned",
      owner: "previous-activation",
      periodId: a.row().data.periodId,
      connectionId: "same-connection",
      model: "same-model",
      provider: "google",
      purpose: "other",
      startedAt: stamp,
      status: "running",
      dollars: null,
    });
    const restarted = createUsageLedger({ ...a.ports, owner: "new-process-epoch" });
    const recovery = await restarted.readUsageLedger();
    assert.equal(recovery.running, 0);
    assert.equal(recovery.requests.find((r) => r.id === "abandoned")?.status, "unknown");
    assert.equal(a.row().data.requests.find((r: any) => r.id === "abandoned").interrupted, true);
  } finally {
    gate.resolve();
    await pending;
  }
}
const counters = (): Metrics => ({
  reads: 0,
  writes: 0,
  requests: 0,
  reportedInputTokens: 0,
  reportedOutputTokens: 0,
  unknownUsageRequests: 0,
  failedRequests: 0,
  modelLatencyMs: 0,
  signals: {},
});
async function overlappingSameStore() {
  const world = fixture("google", 1);
  world.seed();
  const secondActivation = createUsageLedger(world.ports);
  const gate = deferred(),
    entered = deferred();
  const pending = world.service.trackUsage(meta, async () => {
    entered.resolve();
    await gate.promise;
    return completion();
  });
  await entered.promise;
  try {
    assert.equal(
      (await secondActivation.readUsageLedger()).running,
      1,
      "a live same-store request is not abandoned by another activation",
    );
    await secondActivation.trackUsage(meta, completion);
    assert.equal((await world.service.readUsageLedger()).running, 1);
    gate.resolve();
    await pending;
    const result = await secondActivation.readUsageLedger();
    assert.equal(result.totals.requests, 2);
    assert.equal(result.totals.tokens, 30);
    assert.equal(result.requests.filter((r) => r.status === "complete").length, 2);
    assert.equal(result.totals.dollars, 40 / 1e6, "both independently queued completions retain their recorded costs");
  } finally {
    gate.resolve();
    await pending;
  }
}
async function scopedContexts() {
  const a = fixture("google", 1),
    b = fixture("anthropic", 10);
  a.seed();
  b.seed();
  const ownerA = createActivationScope(),
    ownerB = createActivationScope();
  const releaseA = ownerA.run(() => configureUsageLedger(a.service));
  const releaseB = ownerB.run(() => configureUsageLedger(b.service));
  const releaseMetricsA = ownerA.run(() => configureMetricsContext(createMetricsContext()));
  const releaseMetricsB = ownerB.run(() => configureMetricsContext(createMetricsContext()));
  const clearA = installDefaultActivation(ownerA, () => {});
  const gate = deferred(),
    entered = deferred();
  const countA = counters(),
    countB = counters();
  const pending = withUsagePurpose("checks", () =>
    active.run(countA, async () => {
      entered.resolve();
      await gate.promise;
      assert.equal(inferredPurpose(), "checks", "a direct callback captures its owner before default replacement");
      pipelineStorage("reads");
      pipelineSignal("owner-A");
      await ownerB.run(async () => {
        assert.equal(inferredPurpose(), "other", "nested activation cannot inherit another owner's purpose");
        assert.equal(active.getStore(), undefined, "nested activation cannot inherit another owner's counters");
        await active.run(countB, () =>
          withUsagePurpose("conversation", async () => {
            pipelineStorage("writes");
            await measureModel(completion);
            await trackUsage(meta, completion);
          }),
        );
      });
      await measureModel(completion);
      await trackUsage(meta, completion);
    }),
  );
  await entered.promise;
  const clearB = installDefaultActivation(ownerB, () => {});
  try {
    gate.resolve();
    await pending;
    assert.equal(countA.reads, 1);
    assert.equal(countA.writes, 0);
    assert.equal(countA.requests, 1);
    assert.equal(countB.reads, 0);
    assert.equal(countB.writes, 1);
    assert.equal(countB.requests, 1);
    assert.equal((await readUsageLedger()).requests[0].purpose, "conversation");
    assert.equal((await ownerA.run(() => readUsageLedger())).requests[0].purpose, "checks");
    releaseA();
    releaseMetricsA();
    releaseA();
    releaseMetricsA();
    assert.equal((await readUsageLedger()).totals.requests, 1);
    assert.throws(() => ownerA.run(() => inferredPurpose()), /not configured/);
    const missing = createActivationScope();
    assert.throws(() => missing.run(() => trackUsage(meta, completion)), /not configured/);
    assert.throws(() => missing.run(() => active.run(counters(), () => {})), /not configured/);
    missing.dispose();
    ownerA.dispose();
    ownerA.run(() => {
      pipelineStorage("writes");
      pipelineSignal("disposed");
    });
    assert.equal(countB.writes, 1, "disposed passive metrics do not enter the default owner's counters");
  } finally {
    gate.resolve();
    await pending;
    releaseA();
    releaseB();
    releaseMetricsA();
    releaseMetricsB();
    clearA();
    clearB();
    ownerA.dispose();
    ownerB.dispose();
  }
}
function accountingRuntime(
  languageModels: CapabilityRuntimeHost["languageModels"],
  logger: CapabilityRuntimeHost["logger"],
): CapabilityRuntimeHost {
  return {
    achievements: null,
    embeddings: null,
    resolveEmbeddings: async () => null,
    getAgentConfig: async () => null,
    isDebugAgentsEnabled: () => false,
    json: null,
    languageModels,
    logger,
    persistence: null,
    resources: null,
  };
}
async function escapedModelAccounting() {
  for (const method of ["resolve", "resolveForRequest"] as const) {
    for (const pause of ["resolver", "provider", "none"]) {
      const ownerA = createActivationScope(),
        ownerB = createActivationScope();
      const a = fixture("google", 1),
        b = fixture("anthropic", 10);
      a.seed();
      b.seed();
      const enteredResolve = deferred(),
        releaseResolve = deferred(),
        enteredProvider = deferred(),
        releaseProvider = deferred();
      const events: { stage: string; owner: unknown }[] = [],
        spansA: Metrics[] = [];
      let providerCalls = 0;
      const messages = [{ role: "user" as const, content: "private text never stored" }],
        options = { maxTokens: 17 };
      const provider: CapabilityResolvedLanguageModel = {
        name: "A",
        connectionId: meta.connectionId,
        model: meta.model,
        maxContext: 4096,
        maxOutputTokens: 64,
        async chatComplete(receivedMessages, receivedOptions) {
          providerCalls++;
          events.push({ stage: "provider", owner: activationScope() });
          assert.equal(receivedMessages, messages);
          assert.equal(receivedOptions, options);
          enteredProvider.resolve();
          if (pause === "provider") await releaseProvider.promise;
          return completion();
        },
        fitContext(receivedMessages) {
          events.push({ stage: "fit", owner: activationScope() });
          return { messages: receivedMessages, estimatedTokensBefore: 2, estimatedTokensAfter: 2, trimmed: false };
        },
      };
      async function resolveModel() {
        events.push({ stage: "resolve-enter", owner: activationScope() });
        enteredResolve.resolve();
        if (pause === "resolver") await releaseResolve.promise;
        events.push({ stage: "resolve-return", owner: activationScope() });
        return provider;
      }
      const runtime = accountingRuntime(
        { resolve: resolveModel, resolveForRequest: resolveModel },
        a.ports.villagesLogger(),
      );
      const metricsA = createMetricsContext();
      const runMetricsA = metricsA.run.bind(metricsA);
      metricsA.run = (store, work, ...args) => {
        spansA.push(store);
        return runMetricsA(store, work, ...args);
      };
      const releaseHostA = ownerA.run(() => configureRuntimeHost(runtime));
      const releaseLedgerA = ownerA.run(() => configureUsageLedger(a.service));
      const releaseLedgerB = ownerB.run(() => configureUsageLedger(b.service));
      const releaseMetricsA = ownerA.run(() => configureMetricsContext(metricsA));
      const releaseMetricsB = ownerB.run(() => configureMetricsContext(createMetricsContext()));
      const clearA = installDefaultActivation(ownerA, () => {});
      let clearB: (() => void) | undefined;
      try {
        const adapter = villagesLanguageModels();
        const escapedResolve = () =>
          method === "resolve"
            ? adapter.resolve(meta.connectionId)
            : adapter.resolveForRequest({ connectionId: meta.connectionId });
        let resolving = pause === "resolver" ? escapedResolve() : undefined;
        if (resolving) await enteredResolve.promise;
        clearB = installDefaultActivation(ownerB, () => {});
        resolving ??= escapedResolve();
        releaseResolve.resolve();
        const model = await resolving,
          escapedComplete = model.chatComplete;
        assert.equal(model.fitContext(messages).messages, messages);
        const countB = counters();
        const pending = active.run(countB, () => escapedComplete(messages, options));
        await enteredProvider.promise;
        releaseProvider.resolve();
        await pending;
        assert.equal(providerCalls, 1);
        assert.equal((await a.service.readUsageLedger()).totals.requests, 1);
        assert.equal(
          (await b.service.readUsageLedger()).totals.requests,
          0,
          "B never accounts for A's escaped provider",
        );
        assert(
          events.every((event) => event.owner === ownerA),
          "resolver, fitter and escaped provider retain A",
        );
        assert.equal(countB.requests, 0, "B's active pipeline does not count A's request");
        assert.equal(spansA.length, 1);
        assert.equal(spansA[0]!.requests, 1);
        assert.equal(spansA[0]!.reportedInputTokens, 10);
        assert.equal(spansA[0]!.reportedOutputTokens, 5);
        assert.equal(a.row().data.requests[0].status, "complete");
        assert(!JSON.stringify(a.row()).includes("private text"));
        releaseHostA();
        await assert.rejects(async () => escapedComplete(messages, options), /runtime is not configured/);
        const beforeResolver = events.length;
        await assert.rejects(escapedResolve, /runtime is not configured/);
        assert.equal(events.length, beforeResolver, "invalidated resolver refuses before reading the captured Engine");
        assert.equal(providerCalls, 1, "an invalidated host refuses before accounting or provider dispatch");
        assert.equal((await a.service.readUsageLedger()).totals.requests, 1);
        releaseLedgerA();
        ownerA.dispose();
        await assert.rejects(async () => escapedComplete(messages, options), /not configured/);
        assert.equal(providerCalls, 1, "retired ownership refuses before provider dispatch");
        assert.equal((await b.service.readUsageLedger()).totals.requests, 0);
      } finally {
        releaseResolve.resolve();
        releaseProvider.resolve();
        releaseHostA();
        releaseLedgerA();
        releaseLedgerB();
        releaseMetricsA();
        releaseMetricsB();
        clearB?.();
        clearA();
        ownerA.dispose();
        ownerB.dispose();
      }
    }
  }
  const owner = createActivationScope(),
    replacement = createActivationScope();
  const a = fixture("google", 1),
    b = fixture("anthropic", 10);
  a.holdCreate();
  b.seed();
  let providerCalls = 0;
  const provider: CapabilityResolvedLanguageModel = {
    name: "A",
    connectionId: meta.connectionId,
    model: meta.model,
    maxContext: 4096,
    maxOutputTokens: 64,
    async chatComplete() {
      providerCalls++;
      return completion();
    },
    fitContext(messages) {
      return { messages, estimatedTokensBefore: 0, estimatedTokensAfter: 0, trimmed: false };
    },
  };
  const releaseHost = owner.run(() =>
    configureRuntimeHost(
      accountingRuntime(
        { resolve: async () => provider, resolveForRequest: async () => provider },
        a.ports.villagesLogger(),
      ),
    ),
  );
  const releaseA = owner.run(() => configureUsageLedger(a.service));
  const releaseB = replacement.run(() => configureUsageLedger(b.service));
  const clearA = installDefaultActivation(owner, () => {});
  let clearB: (() => void) | undefined;
  try {
    const model = await villagesLanguageModels().resolve(meta.connectionId);
    const pending = model.chatComplete([]);
    // Observe rejection immediately, then invalidate the host while claim storage waits.
    const refused = assert.rejects(pending, /runtime is not configured/);
    await a.entered.promise;
    assert.equal(providerCalls, 0);
    clearB = installDefaultActivation(replacement, () => {});
    releaseHost();
    a.gate.resolve();
    await refused;
    assert.equal(providerCalls, 0, "retirement during claim storage refuses before provider dispatch");
    assert.equal((await b.service.readUsageLedger()).totals.requests, 0);
    const ledgerA = await a.service.readUsageLedger();
    assert.equal(ledgerA.totals.requests, 1);
    assert.equal(
      ledgerA.requests[0]!.status,
      "unknown",
      "the existing conservative failed-claim accounting is retained",
    );
  } finally {
    a.gate.resolve();
    releaseHost();
    releaseA();
    releaseB();
    clearB?.();
    clearA();
    owner.dispose();
    replacement.dispose();
  }
  console.log(
    "Escaped model resolvers/completions keep their provider, usage receipts and pipeline metrics on the selected activation.",
  );
}
async function main() {
  await queuesAndRates();
  await periodAndRestart();
  await overlappingSameStore();
  await scopedContexts();
  await escapedModelAccounting();
  console.log(
    "Usage queues, connection prices, CAS counts, recovery, purpose and pipeline contexts remain independently owned.",
  );
}
void main();
