import assert from "node:assert/strict";
import type { CapabilityDocumentStore, CapabilityRuntimeHost } from "@marinara-engine/shared";
import { createActivationScope } from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { requireHost } from "../packages/villages/src/server/adapters/engine/runtime-host.js";
import { createDocumentMutator } from "../packages/villages/src/server/adapters/storage/document-store.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import {
  configureTownMapGeneration,
  readTownMapGeneration,
  requestTownMapGeneration,
  startTownMapGeneration,
} from "../packages/villages/src/server/jobs/town-map-generation.js";
import {
  createTownMapGeneration,
  type TownMapGenerationPorts,
} from "../packages/villages/src/server/jobs/town-map-service.js";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
const tick = () => new Promise<void>((resolve) => setImmediate(resolve));
const attempt = (id = "shared-map-attempt") => ({ actionId: id, sourceKey: "fixture-inputs" });
function fixture(label: string) {
  const records = new Map<string, any>();
  const generated: string[] = [];
  const gate = deferred();
  let holdRead: (() => Promise<void>) | undefined;
  const errors: unknown[] = [];
  const documents = {
    async getById(_packageId: string, id: string) {
      const hold = holdRead;
      holdRead = undefined;
      await hold?.();
      return structuredClone(records.get(id) ?? null);
    },
    async create(value: any) {
      assert.equal(records.has(value.id), false);
      records.set(value.id, { ...structuredClone(value), revision: 1 });
      return structuredClone(records.get(value.id));
    },
    async update(value: any) {
      const prior = records.get(value.id);
      if (!prior || prior.revision !== value.expectedRevision) return null;
      const next = { ...prior, ...structuredClone(value), revision: prior.revision + 1 };
      records.set(value.id, next);
      return structuredClone(next);
    },
  } as unknown as CapabilityDocumentStore;
  const ports: TownMapGenerationPorts = {
    villagesDocuments: () => documents,
    mutateDocument: createDocumentMutator(() => documents),
    villagesLogger: () => ({
      debug() {},
      info() {},
      warn() {},
      error(error) {
        errors.push(error);
      },
    }),
    async generateVillageTownMap(input) {
      assert.equal(
        records.get("villages-town-map-generation").data.request.status,
        "running",
        "claim precedes dispatch",
      );
      generated.push(String(input.actionId));
      await gate.promise;
      return { image: label, width: 1536, height: 1024 };
    },
  };
  return {
    documents,
    ports,
    records,
    generated,
    gate,
    errors,
    pauseRead() {
      const entered = deferred(),
        resume = deferred();
      holdRead = async () => {
        entered.resolve();
        await resume.promise;
      };
      return { entered, resume };
    },
  };
}
async function untilComplete(read: () => ReturnType<typeof readTownMapGeneration>) {
  for (let i = 0; i < 50; i++) {
    const state = await read();
    if (state.status !== "running") return state;
    await tick();
  }
  throw new Error("Synthetic map attempt did not finish");
}

async function independentFactories() {
  const a = fixture("image-A"),
    b = fixture("image-B");
  const serviceA = createTownMapGeneration(a.ports),
    serviceB = createTownMapGeneration(b.ports);
  const stopA = serviceA.startTownMapGeneration(),
    stopB = serviceB.startTownMapGeneration();
  try {
    const paused = a.pauseRead();
    const pendingA = serviceA.requestTownMapGeneration(attempt());
    await paused.entered.promise;
    const requestB = await serviceB.requestTownMapGeneration(attempt());
    assert.equal(requestB.status, "running", "B admission is independent of A's paused queue");
    assert.equal(b.generated.length, 1);
    paused.resume.resolve();
    const requestA = await pendingA;
    assert.equal(requestA.status, "running");
    assert.equal(a.generated.length, 1, "same request ID belongs to separate stores");
    await serviceA.requestTownMapGeneration(attempt());
    await serviceB.requestTownMapGeneration(attempt("another-map-attempt"));
    assert.deepEqual(
      [a.generated.length, b.generated.length],
      [1, 1],
      "replays and joins make no extra provider calls",
    );
    stopA();
    b.gate.resolve();
    const completeB = await untilComplete(() => serviceB.readTownMapGeneration(requestB.id));
    assert.equal(completeB.status, "complete");
    assert.equal(completeB.result?.image, "image-B", "A cleanup cannot fence B's save");
    a.gate.resolve();
    await tick();
    const interruptedA = await serviceA.readTownMapGeneration(requestA.id);
    assert.equal(interruptedA.status, "interrupted");
    assert.equal(interruptedA.result, null, "late A output never overwrites its interrupted receipt");
    stopA();
    const laterB = await serviceB.requestTownMapGeneration(attempt("later-map-attempt"));
    assert.equal((await untilComplete(() => serviceB.readTownMapGeneration(laterB.id))).status, "complete");
    assert.deepEqual([a.generated.length, b.generated.length], [1, 2]);
    await assert.rejects(serviceB.requestTownMapGeneration(attempt()), /already used/);
    assert.deepEqual([a.errors, b.errors], [[], []]);
  } finally {
    a.gate.resolve();
    b.gate.resolve();
    stopA();
    stopB();
  }
}

async function restartedServiceCleanup() {
  const f = fixture("restarted-image");
  const service = createTownMapGeneration(f.ports);
  const oldStop = service.startTownMapGeneration();
  oldStop();
  const currentStop = service.startTownMapGeneration();
  try {
    const paused = f.pauseRead();
    const pending = service.requestTownMapGeneration(attempt());
    await paused.entered.promise;
    oldStop();
    paused.resume.resolve();
    const request = await pending;
    oldStop();
    assert.equal(
      (await service.readTownMapGeneration(request.id)).status,
      "running",
      "stale cleanup cannot interrupt current admission or provider work",
    );
    assert.equal(f.generated.length, 1);
    f.gate.resolve();
    const complete = await untilComplete(() => service.readTownMapGeneration(request.id));
    assert.equal(complete.status, "complete");
    assert.equal(complete.result?.image, "restarted-image");
    currentStop();
    currentStop();
    await assert.rejects(service.requestTownMapGeneration(attempt("after-current-stop")), /restarting/);
    assert.equal(f.generated.length, 1, "current stop still closes admission without another provider call");
    const laterStop = service.startTownMapGeneration();
    try {
      oldStop();
      currentStop();
      assert.equal(
        (await service.readTownMapGeneration(request.id)).status,
        "complete",
        "restart retains saved results",
      );
      const later = await service.requestTownMapGeneration(attempt("later-restart-attempt"));
      assert.equal((await untilComplete(() => service.readTownMapGeneration(later.id))).status, "complete");
      assert.equal(f.generated.length, 2, "only deliberate new admission dispatches");
    } finally {
      laterStop();
    }
  } finally {
    f.gate.resolve();
    oldStop();
    currentStop();
  }
}

async function scopedDispatch() {
  const a = fixture("scoped-image-A"),
    b = fixture("scoped-image-B");
  const ownerA = createActivationScope();
  const hostA = { persistence: { documents: a.documents }, logger: a.ports.villagesLogger() } as CapabilityRuntimeHost;
  const hostB = { persistence: { documents: b.documents }, logger: b.ports.villagesLogger() } as CapabilityRuntimeHost;
  const cleanupA = ownerA.run(() => configureVillagesRuntime(hostA));
  const releaseA = ownerA.run(() =>
    configureTownMapGeneration(
      createTownMapGeneration({
        ...a.ports,
        async generateVillageTownMap(input) {
          const result = await a.ports.generateVillageTownMap(input);
          assert.equal(requireHost(), hostA, "late provider continuation retains A's connection owner");
          return result;
        },
      }),
    ),
  );
  const stopA = ownerA.run(startTownMapGeneration);
  const requestA = await ownerA.run(() => requestTownMapGeneration(attempt()));
  const cleanupB = configureVillagesRuntime(hostB);
  const releaseB = configureTownMapGeneration(createTownMapGeneration(b.ports));
  const stopB = startTownMapGeneration();
  try {
    const requestB = await requestTownMapGeneration(attempt());
    a.gate.resolve();
    const completeA = await untilComplete(() => ownerA.run(() => readTownMapGeneration(requestA.id)));
    assert.equal(completeA.result?.image, "scoped-image-A");
    stopA();
    releaseA();
    cleanupA();
    ownerA.dispose();
    b.gate.resolve();
    const completeB = await untilComplete(() => readTownMapGeneration(requestB.id));
    assert.equal(completeB.result?.image, "scoped-image-B");
    assert.equal(requireHost(), hostB);
    assert.throws(() => ownerA.run(() => readTownMapGeneration(requestA.id)), /map generation is not configured/);
  } finally {
    a.gate.resolve();
    b.gate.resolve();
    stopA();
    releaseA();
    cleanupA();
    ownerA.dispose();
    stopB();
    releaseB();
    cleanupB();
  }
}
async function main() {
  await independentFactories();
  await restartedServiceCleanup();
  await scopedDispatch();
  console.log(
    "Town-map owners passed: independent queues/stores/receipts, scoped late continuations, replacement cleanup and no automatic provider retries (synthetic ports).",
  );
}
const watchdog = setTimeout(() => {
  throw new Error("Town-map ownership scenarios did not finish");
}, 20_000);
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => clearTimeout(watchdog));
