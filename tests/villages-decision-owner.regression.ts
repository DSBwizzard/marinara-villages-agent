import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  configureDecisionsAdapter,
  createDecisionsAdapter,
  decisionAdapterStatus,
  type EngineDecisionBackend,
} from "../packages/villages/src/server/adapters/engine/decisions-adapter.js";

// Synthetic connectors and modules only: no Engine installation, credentials or provider calls.
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
const unavailable = {
  available: false,
  reason: "Engine Decisions integration is unavailable or incompatible",
  engineBuild: null,
};
function connectors(build: string, observed: unknown[], onResolve?: () => Promise<EngineDecisionBackend | null>) {
  const backend: EngineDecisionBackend = {
    model: build,
    maxStateTokens: 100,
    calibration: { defaultThreshold: 0.1 },
    deferPreGeneration: false,
    async ask() {
      throw new Error("This fixture must not make a model request");
    },
  };
  return {
    engineBuild: build,
    DECISION_SETTINGS_KEYS: { localDefault: "local", thinkingPreGeneration: "thinking" },
    createAppSettingsStorage(database: unknown) {
      observed.push(database);
      return { get: async () => null };
    },
    createConnectionsStorage(database: unknown) {
      observed.push(database);
      return { getDefaultForDecision: async () => database, getWithKey: async () => database };
    },
    async resolveDecisionBackend(dependencies: Record<string, unknown>, signal?: AbortSignal) {
      observed.push(signal);
      observed.push(await (dependencies.getDefaultConnection as () => Promise<unknown>)());
      return onResolve ? onResolve() : backend;
    },
  };
}
async function instanceOwnership() {
  const databaseA = { owner: "A" },
    databaseB = { owner: "B" };
  const readsA: unknown[] = [],
    readsB: unknown[] = [];
  const modulesA = connectors("build-A", readsA),
    modulesB = connectors("build-B", readsB);
  const gateA = deferred<typeof modulesA>();
  let loadsA = 0;
  const a = createDecisionsAdapter({ app: { db: databaseA } }, "entry-A", async (entry) => {
    assert.equal(entry, "entry-A");
    loadsA++;
    return gateA.promise;
  });
  const b = createDecisionsAdapter({ app: { db: databaseB } }, "entry-B", async (entry) => {
    assert.equal(entry, "entry-B");
    return modulesB;
  });
  const signal = new AbortController().signal;
  const pendingA = a.resolve(signal);
  const statusA = a.status();
  assert.equal((await b.status()).engineBuild, "build-B");
  gateA.resolve(modulesA);
  const backendA = await pendingA;
  assert.equal(backendA?.model, "build-A");
  assert.equal((await statusA).engineBuild, "build-A");
  assert.equal(loadsA, 1, "concurrent calls share the same instance load");
  assert.deepEqual(readsA, [databaseA, databaseA, signal, databaseA, databaseA, databaseA]);
  assert.deepEqual(readsB, [databaseB, databaseB]);
  a.dispose();
  a.dispose();
  assert.deepEqual(await a.status(), unavailable);
  await assert.rejects(a.resolve(signal), /Villages is inactive/);
  assert.equal((await b.status()).available, true, "disposing A preserves B");
  b.dispose();
}
async function disposalFences() {
  const reads: unknown[] = [];
  const loaded = connectors("late-build", reads);
  const gate = deferred<typeof loaded>();
  const a = createDecisionsAdapter({ app: { db: { owner: "pending" } } }, "pending-entry", () => gate.promise);
  const pending = a.resolve(new AbortController().signal);
  const rejected = assert.rejects(pending, /Villages is inactive/);
  const status = a.status();
  a.dispose();
  gate.resolve(loaded);
  await rejected;
  assert.deepEqual(await status, unavailable);
  assert.deepEqual(reads, [], "disposed loading instance never constructs storage or resolves a backend");

  const admitted = deferred<void>();
  const resolving = deferred<EngineDecisionBackend | null>();
  const database = { owner: "resolving" };
  const duringResolve: unknown[] = [];
  const b = createDecisionsAdapter({ app: { db: database } }, "resolving-entry", async () =>
    connectors("resolving-build", duringResolve, () => {
      admitted.resolve();
      return resolving.promise;
    }),
  );
  const signal = new AbortController().signal;
  const backend = b.resolve(signal);
  const rejectedBackend = assert.rejects(backend, /Villages is inactive/);
  await admitted.promise;
  b.dispose();
  resolving.resolve(null);
  await rejectedBackend;
  assert.deepEqual(duringResolve, [database, database, signal, database]);
  assert.equal(signal.aborted, false, "adapter disposal does not replace operation-owned cancellation");

  let loads = 0;
  const failure = new Error("synthetic unsupported Engine");
  const c = createDecisionsAdapter({ app: { db: {} } }, "invalid", async () => {
    loads++;
    throw failure;
  });
  assert.deepEqual(await c.status(), unavailable);
  await assert.rejects(c.resolve(signal), (error) => error === failure);
  assert.equal(loads, 1, "a failed load is retained without automatic retry");
  c.dispose();
}
async function compatibilityBinding() {
  const root = await mkdtemp(join(tmpdir(), "villages-decision-owner-"));
  let first: (() => void) | undefined, second: (() => void) | undefined;
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
      "export const createConnectionsStorage = db => ({ getDefaultForDecision: async () => db, getWithKey: async () => db });",
    );
    await writeFile(
      join(dist, "services/storage/app-settings.storage.js"),
      "export const createAppSettingsStorage = () => ({ get: async () => null });",
    );
    await writeFile(
      join(dist, "services/decision/decision-default.js"),
      'export const DECISION_SETTINGS_KEYS = { localDefault: "local", thinkingPreGeneration: "thinking" }; export const resolveDecisionBackend = async () => null;',
    );
    first = configureDecisionsAdapter({ app: { db: { owner: "first" } } }, join(dist, "index.js"));
    const firstStatus = decisionAdapterStatus();
    second = configureDecisionsAdapter({ app: { db: { owner: "second" } } }, join(dist, "index.js"));
    assert.equal((await firstStatus).available, true);
    assert.equal((await decisionAdapterStatus()).available, true);
    first();
    first();
    assert.equal((await decisionAdapterStatus()).available, true, "old/repeated cleanup cannot clear replacement");
    second();
    assert.deepEqual(await decisionAdapterStatus(), unavailable);
  } finally {
    first?.();
    second?.();
    await rm(root, { recursive: true, force: true });
  }
}
async function main() {
  await instanceOwnership();
  await disposalFences();
  await compatibilityBinding();
  console.log(
    "Decisions ownership passed: originating database, shared load, disposal fences, no retry and old cleanup (synthetic modules; no providers).",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
