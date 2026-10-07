import assert from "node:assert/strict";
import {
  createActivationScope,
  installDefaultActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import {
  readRuntimeDebug,
  saveRuntimeDebug,
  resetRuntimeDebug,
  runtimeDebug,
  configureRuntimeDebug,
} from "../packages/villages/src/server/adapters/observability/runtime-debug.js";
import { createRuntimeDebug } from "../packages/villages/src/server/adapters/observability/runtime-debug-service.js";
import { createDocumentMutator } from "../packages/villages/src/server/adapters/storage/document-store.js";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function fixture(name: string, verbose: boolean, meter: boolean, enabled: boolean) {
  let record: any = { id: "villages-debug", revision: 1, data: { verbose, showUsageMeter: meter } };
  let engineEnabled = enabled,
    failLogger = false,
    pause = false;
  const gate = deferred(),
    entered = deferred();
  const logs: string[] = [];
  const documents: any = {
    async getById(_package: string, id: string) {
      if (id !== "villages-debug") return null;
      const snapshot = structuredClone(record);
      if (pause) {
        entered.resolve();
        await gate.promise;
      }
      return snapshot;
    },
    async create(input: any) {
      record = { ...input, revision: 1 };
      return record;
    },
    async update(input: any) {
      if (input.expectedRevision !== record.revision) return null;
      record = { ...record, ...structuredClone(input), revision: record.revision + 1 };
      return structuredClone(record);
    },
  };
  const logger = {
    debug() {},
    info() {},
    warn() {},
    error() {},
    debugOverride(_enabled: boolean, _format: string, text: string) {
      if (failLogger) throw new Error("broken log sink");
      logs.push(text);
    },
  };
  const host: any = { isDebugAgentsEnabled: () => engineEnabled, logger, persistence: { documents } };
  const service = createRuntimeDebug({
    villagesDebugAgentsEnabled: () => engineEnabled,
    villagesDocuments: () => documents,
    villagesLogger: () => logger,
    venueDebugContext: () => ({ owner: name }),
    mutateDocument: createDocumentMutator(() => documents),
  });
  return {
    host,
    service,
    logs,
    gate,
    entered,
    record: () => record,
    pauseReads: () => {
      pause = true;
    },
    setEngine: (value: boolean) => {
      engineEnabled = value;
    },
    failLogger: () => {
      failLogger = true;
    },
  };
}
async function factoryIsolation() {
  const a = fixture("A", true, false, false),
    b = fixture("B", false, true, true);
  a.pauseReads();
  const pendingA = a.service.readRuntimeDebug();
  await a.entered.promise;
  try {
    assert.deepEqual(await b.service.readRuntimeDebug(), {
      verbose: false,
      effective: true,
      engineEnabled: true,
      showUsageMeter: true,
    });
    await b.service.saveRuntimeDebug(false, false);
    assert.equal(b.record().data.showUsageMeter, false);
    a.gate.resolve();
    assert.equal((await pendingA).verbose, true);
    b.setEngine(false);
    assert.deepEqual(
      await b.service.readRuntimeDebug(),
      {
        verbose: false,
        effective: false,
        engineEnabled: false,
        showUsageMeter: false,
      },
      "a late read cannot overwrite the other owner's settings",
    );
    a.service.runtimeDebug("private diagnostics", {
      apiKey: "A-secret",
      url: "https://example.test/?token=A-token",
      reply: "Bearer A-bearer",
    });
    assert.match(a.logs.at(-1)!, /"owner":"A"/);
    assert.doesNotMatch(a.logs.at(-1)!, /A-secret|A-token|A-bearer/);
    const count = b.logs.length;
    b.service.runtimeDebug("quiet", {});
    assert.equal(b.logs.length, count);
    a.service.resetRuntimeDebug();
    assert.equal((await b.service.readRuntimeDebug()).showUsageMeter, false);
    a.failLogger();
    await a.service.readRuntimeDebug();
    assert.doesNotThrow(() => a.service.runtimeDebug("broken logger", {}));
    const cyclic: any = {};
    cyclic.self = cyclic;
    assert.doesNotThrow(() => a.service.runtimeDebug("unserializable", cyclic));
  } finally {
    a.gate.resolve();
    await pendingA;
  }
}
async function assembledIsolation() {
  const a = fixture("assembled-A", true, false, false),
    b = fixture("assembled-B", false, true, false);
  const ownerA = createActivationScope(),
    ownerB = createActivationScope();
  const releaseA = ownerA.run(() => configureVillagesRuntime(a.host));
  const releaseB = ownerB.run(() => configureVillagesRuntime(b.host));
  const clearDefault = installDefaultActivation(ownerB, () => {});
  a.pauseReads();
  const pendingA = ownerA.run(() => readRuntimeDebug());
  await a.entered.promise;
  try {
    await saveRuntimeDebug(true, true);
    a.gate.resolve();
    assert.equal((await pendingA).showUsageMeter, false);
    assert.equal((await readRuntimeDebug()).showUsageMeter, true);
    ownerA.run(() => runtimeDebug("A-route", { secret: "A-secret" }));
    runtimeDebug("B-route", { secret: "B-secret" });
    assert.match(a.logs.at(-1)!, /A-route/);
    assert.match(b.logs.at(-1)!, /B-route/);
    assert.doesNotMatch(a.logs.at(-1)!, /B-route|A-secret/);
    ownerA.run(() => resetRuntimeDebug());
    assert.equal((await readRuntimeDebug()).verbose, true);
    releaseA();
    releaseA();
    assert.equal((await readRuntimeDebug()).verbose, true, "old cleanup retains current settings");
    assert.throws(() => ownerA.run(() => readRuntimeDebug()), /not configured/);
    assert.doesNotThrow(() => ownerA.run(() => runtimeDebug("released owner", {})));
    const missing = createActivationScope();
    assert.throws(() => missing.run(() => saveRuntimeDebug(true)), /not configured/);
    assert.doesNotThrow(() => missing.run(() => runtimeDebug("missing owner", {})));
    missing.dispose();
    const before = b.logs.length;
    ownerA.dispose();
    assert.doesNotThrow(() => ownerA.run(() => runtimeDebug("disposed owner", {})));
    assert.equal(b.logs.length, before, "missing diagnostics cannot log into the default activation");
  } finally {
    a.gate.resolve();
    await pendingA;
    releaseA();
    releaseB();
    clearDefault();
    ownerA.dispose();
    ownerB.dispose();
  }
}
function replacementRegistration() {
  const owner = createActivationScope(),
    a = fixture("old", true, true, true),
    b = fixture("new", true, true, true);
  const old = owner.run(() => configureRuntimeDebug(a.service));
  const current = owner.run(() => configureRuntimeDebug(b.service));
  old();
  owner.run(() => runtimeDebug("current registration", {}));
  assert.equal(a.logs.length, 0);
  assert.match(b.logs.at(-1)!, /current registration/);
  current();
  owner.dispose();
}
async function main() {
  await factoryIsolation();
  await assembledIsolation();
  replacementRegistration();
  console.log(
    "Runtime diagnostics retain independent settings, document loads, logging and cleanup across activations.",
  );
}
void main();
