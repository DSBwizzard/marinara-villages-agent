import assert from "node:assert/strict";
import {
  createActivationScope,
  installDefaultActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
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
async function main() {
  await queuesAndRates();
  await periodAndRestart();
  await overlappingSameStore();
  await scopedContexts();
  console.log(
    "Usage queues, connection prices, CAS counts, recovery, purpose and pipeline contexts remain independently owned.",
  );
}
void main();
