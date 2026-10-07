import assert from "node:assert/strict";
import Fastify from "fastify";
import {
  activationScope,
  createActivationBinding,
  createActivationScope,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import {
  requireHost,
  villagesDocuments,
  villagesRuntimeEpoch,
} from "../packages/villages/src/server/adapters/engine/runtime-host.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { startVillagesApplication, type ActivationContext } from "../packages/villages/src/server/entry/application.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import {
  configureSceneQueries,
  sceneQueries,
  type SceneQueries,
} from "../packages/villages/src/server/features/scenes/services.js";
import { readVillageAuthority } from "../packages/villages/src/server/features/world/village-store.js";

// Actual dispatch/assembly and Fastify handlers; synthetic document stores, no Engine or providers.
function deferred<T = void>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function fixture(name: string, compareSystem: boolean) {
  const reads: string[] = [];
  let onInterpretation: (() => Promise<void>) | undefined;
  const state = defaultVillageState();
  state.name = name;
  const runtime = {
    persistence: {
      documents: {
        async getById(_package: string, id: string) {
          reads.push(id);
          if (id === "villages-interpretation-settings") {
            await onInterpretation?.();
            return { id, revision: 1, data: { decisionsEnabled: false, compareSystem } };
          }
          return id === "villages-village" ? { id, revision: 1, data: structuredClone(state) } : null;
        },
        async list() {
          return [];
        },
        async create() {
          throw new Error("This fixture must not write");
        },
        async update() {
          throw new Error("This fixture must not write");
        },
      },
    },
    logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
    isDebugAgentsEnabled: () => false,
    getAgentConfig: async () => null,
  } as unknown as ActivationContext["api"]["runtime"];
  return {
    runtime,
    reads,
    holdInterpretation(work: typeof onInterpretation) {
      onInterpretation = work;
    },
  };
}
async function scopeDispatch() {
  const a = createActivationScope(),
    b = fixture("B", true),
    f = fixture("A", false);
  const releaseA = a.run(() => configureVillagesRuntime(f.runtime));
  a.run(() => configureSceneQueries({ activeVenueSession: async () => ({ owner: "A" }) } as unknown as SceneQueries));
  const epochA = a.run(villagesRuntimeEpoch);
  const entered = deferred(),
    resume = deferred();
  const paused = a.run(async () => {
    assert.equal(requireHost(), f.runtime);
    entered.resolve();
    await resume.promise;
    assert.equal(requireHost(), f.runtime);
    assert.equal(villagesRuntimeEpoch(), epochA);
    assert.equal((await readVillageAuthority()).name, "A");
    assert.deepEqual(await sceneQueries().activeVenueSession(), { owner: "A" });
  });
  await entered.promise;
  const releaseB = configureVillagesRuntime(b.runtime);
  const epochB = villagesRuntimeEpoch();
  assert.notEqual(epochA, epochB);
  resume.resolve();
  await paused;
  const bound = a.bind(function (this: { value: number }, delta: number) {
    assert.equal(requireHost(), f.runtime);
    return this.value + delta;
  });
  assert.equal(bound.call({ value: 4 }, 3), 7, "binding preserves this and synchronous return");
  assert.equal(activationScope()?.active, true, "nested run restores the default B owner");
  assert.equal(requireHost(), b.runtime);

  const binding = createActivationBinding<{ value: number }>("fixture service missing");
  binding.configure({ value: 9 });
  assert.throws(() => a.run(binding.get), /fixture service missing/, "missing A slot cannot borrow B's slot");
  const same = { value: 1 };
  a.run(() => {
    const first = binding.configure(same),
      second = binding.configure(same);
    first();
    assert.equal(binding.get(), same, "each repeated registration owns a distinct token");
    second();
    assert.throws(binding.get, /fixture service missing/);
  });
  releaseA();
  a.dispose();
  assert.equal(a.run(villagesRuntimeEpoch), null);
  assert.throws(() => a.run(villagesDocuments), /runtime is not configured/, "closed A cannot borrow B's host");
  assert.throws(bound, /runtime is not configured/);
  assert.equal(requireHost(), b.runtime, "old cleanup preserves the live default");
  releaseB();
  assert.equal(villagesRuntimeEpoch(), null);
  assert.throws(requireHost, /runtime is not configured/);
  assert.equal(activationScope(), undefined);

  const thrown = new Error("synchronous fixture error");
  const scope = createActivationScope();
  assert.throws(
    scope.bind(() => {
      throw thrown;
    }),
    (error) => error === thrown,
  );
  assert.equal(activationScope(), undefined, "throwing run restores prior context");
  scope.dispose();
}
async function productionHandlers() {
  async function activate(name: string, compare: boolean) {
    const f = fixture(name, compare),
      engine = Fastify();
    let capturedOwner = activationScope();
    const application = await startVillagesApplication({
      api: {
        runtime: f.runtime,
        async registerPrivilegedRoutes(plugin, options) {
          capturedOwner = activationScope();
          await engine.register(plugin, options);
          await engine.ready();
          return () => engine.close();
        },
      },
    });
    return { ...f, engine, application, owner: capturedOwner! };
  }
  const a = await activate("application-A", false);
  let b: Awaited<ReturnType<typeof activate>> | undefined;
  try {
    const entered = deferred(),
      resume = deferred();
    a.holdInterpretation(async () => {
      entered.resolve();
      await resume.promise;
    });
    const paused = a.engine.inject({ url: "/api/villages/interpretation-settings" });
    await entered.promise;
    b = await activate("application-B", true);
    const responseB = await b.engine.inject({ url: "/api/villages/interpretation-settings" });
    assert.equal(responseB.statusCode, 200);
    assert.equal(responseB.json().settings.compareSystem, true);
    resume.resolve();
    const responseA = await paused;
    assert.equal(responseA.statusCode, 200);
    assert.equal(
      responseA.json().settings.compareSystem,
      false,
      "actual late handler retains its original document store",
    );
    const beforeA = a.reads.length,
      beforeB = b.reads.length;
    await a.application.selfCheck();
    assert.equal(a.reads.at(-1), "villages-village");
    assert.ok(a.reads.length > beforeA);
    assert.equal(b.reads.length, beforeB, "old self-check cannot read replacement storage");
    const stopped = a.application.stop();
    assert.equal(a.application.stop(), stopped);
    await stopped;
    assert.equal(a.application.stop(), stopped, "disposed owner preserves repeated stop identity");
    assert.equal(a.owner.active, false);
    assert.equal(b.owner.active, true);
    await assert.rejects(a.application.selfCheck(), /state service is not configured/);
    await b.application.selfCheck();
    const stillB = await b.engine.inject({ url: "/api/villages/interpretation-settings" });
    assert.equal(stillB.statusCode, 200);
    assert.equal(stillB.json().settings.compareSystem, true);
  } finally {
    await a.application.stop();
    await b?.application.stop();
  }
}
async function main() {
  await scopeDispatch();
  await productionHandlers();
  console.log(
    "Activation scopes passed: interleaved services/storage/epochs, no fallback, sync/this/error semantics, actual handlers/self-checks and repeated cleanup (synthetic hosts).",
  );
}
const watchdog = setTimeout(() => {
  throw new Error("Activation scope scenarios did not finish");
}, 20_000);
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => clearTimeout(watchdog));
