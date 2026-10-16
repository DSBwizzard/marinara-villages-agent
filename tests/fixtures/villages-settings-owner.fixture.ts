import assert from "node:assert/strict";
import type { CapabilityDocumentStore, CapabilityRuntimeHost } from "@marinara-engine/shared";
import {
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../../packages/villages/src/server/adapters/engine/activation-scope.js";
import { defaultVillageState } from "../../packages/villages/src/server/domain/decoding/village-codec.js";
import { configureVillagesRuntime } from "../../packages/villages/src/server/entry/runtime.js";

type Row = NonNullable<Awaited<ReturnType<CapabilityDocumentStore["getById"]>>>;
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => (resolve = done));
  return { promise, resolve };
}
function unused<T extends object>(seed: Partial<T> = {}): T {
  return new Proxy(seed, {
    get(target, key, receiver) {
      if (key in target) return Reflect.get(target, key, receiver);
      assert.fail(`Settings fixture must not use the Engine's ${String(key)} interface.`);
    },
  }) as T;
}

/** Two actual, independently assembled runtime graphs with identical persisted identifiers. */
export async function withSettingsOwners(
  work: (a: ReturnType<typeof graph>, b: ReturnType<typeof graph>, selectB: () => void) => Promise<void>,
) {
  const originalFetch = globalThis.fetch;
  let networkMocks = 0;
  globalThis.fetch = async () => {
    networkMocks++;
    return new Response("[]", { status: 200, headers: { "content-type": "application/json" } });
  };
  const a = graph("A"),
    b = graph("B");
  const defaultA = installDefaultActivation(a.owner, () => {});
  let defaultB: (() => void) | undefined;
  try {
    await work(a, b, () => {
      defaultB = installDefaultActivation(b.owner, () => {});
    });
    assert.equal(a.providers + b.providers, 0, "settings tests dispatch no provider completion");
  } finally {
    a.unblock();
    b.unblock();
    defaultB?.();
    defaultA();
    a.owner.run(a.release);
    b.owner.run(b.release);
    a.owner.dispose();
    b.owner.dispose();
    globalThis.fetch = originalFetch;
  }
  return networkMocks;
}

function graph(label: "A" | "B") {
  const owner = createActivationScope(),
    rows = new Map<string, Row>();
  const calls: Array<{ op: string; id: string; owner: boolean }> = [];
  const pauses: Array<{
    op: string;
    id: string;
    at: number;
    entered: ReturnType<typeof deferred>;
    resumed: ReturnType<typeof deferred>;
  }> = [];
  const counts = new Map<string, number>();
  const failures = new Map<string, Error>();
  let providers = 0,
    writes = 0,
    rejectUpdate: string | undefined;
  const stamp = "2026-10-07T12:00:00.000Z";
  function seed(id: string, kind: string, data: unknown) {
    rows.set(id, {
      packageId: "villages",
      id,
      kind,
      name: id,
      description: "",
      data,
      revision: 1,
      createdAt: stamp,
      updatedAt: stamp,
    });
  }
  const village = defaultVillageState();
  village.seed = "same-seed";
  village.name = label;
  village.narrationStyle.writingGuidance = `${label} writing`;
  seed("villages-village", "village", village);
  seed("villages-ai-usage", "settings", { since: `${label}-ledger`, requests: [] });
  seed("villages-interpretation-settings", "settings", { decisionsEnabled: false, compareSystem: label === "A" });
  seed("villages-connections", "settings", {
    systemConnectionId: "same-connection",
    narrationConnectionId: "same-connection",
    imageConnectionId: "same-connection",
  });
  seed("same-job", "background-work", {
    id: "same-job",
    seed: "same-seed",
    kind: "agenda",
    subjectId: "same-resident",
    status: "paused",
    label: `${label} job`,
    steps: [],
    input: { privateScene: `${label} secret` },
    finite: true,
  });
  async function touch(op: string, id: string) {
    calls.push({ op, id, owner: scopedActivation() === owner });
    const key = `${op}:${id}`,
      count = (counts.get(key) ?? 0) + 1;
    counts.set(key, count);
    const pause = pauses.find((p) => p.op === op && p.id === id && p.at === count);
    if (pause) {
      pause.entered.resolve();
      await pause.resumed.promise;
    }
    const failure = failures.get(key);
    if (failure) {
      failures.delete(key);
      throw failure;
    }
  }
  const documents: CapabilityDocumentStore = {
    async getById(_packageId, id) {
      await touch("get", id);
      return structuredClone(rows.get(id) ?? null);
    },
    async list(_packageId, kind) {
      await touch("list", kind);
      return [...rows.values()].filter((r) => r.kind === kind).map((r) => structuredClone(r));
    },
    async create(input) {
      await touch("create", input.id);
      writes++;
      assert(!rows.has(input.id));
      const saved = { ...structuredClone(input), revision: 1 };
      rows.set(input.id, saved);
      return structuredClone(saved);
    },
    async update(input) {
      await touch("update", input.id);
      writes++;
      const row = rows.get(input.id);
      if (!row || row.revision !== input.expectedRevision) return null;
      if (rejectUpdate === input.id) {
        rejectUpdate = undefined;
        row.revision++;
        row.data = { ...(row.data as object), compareSystem: false };
        return null;
      }
      const saved = { ...row, ...structuredClone(input), revision: row.revision + 1 };
      rows.set(input.id, saved);
      return structuredClone(saved);
    },
    async remove() {
      assert.fail("Settings must not delete documents.");
    },
  };
  const resolve: CapabilityRuntimeHost["languageModels"]["resolve"] = async (connectionId) => {
    await touch("resolver", connectionId ?? "");
    return {
      name: label,
      model: "same-model",
      connectionId: connectionId ?? "same-connection",
      maxContext: 10_000,
      maxOutputTokens: 4096,
      fitContext(messages, options) {
        return { messages, ...options, trimmed: false, estimatedTokensBefore: 1, estimatedTokensAfter: 1 };
      },
      async chatComplete() {
        providers++;
        assert.fail("Provider completion is forbidden in settings ownership tests.");
      },
    };
  };
  const host: CapabilityRuntimeHost = {
    persistence: unused<CapabilityRuntimeHost["persistence"]>({ documents }),
    resources: unused(),
    achievements: unused(),
    embeddings: unused(),
    async resolveEmbeddings() {
      assert.fail("No embedding operation is permitted.");
    },
    logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
    async getAgentConfig() {
      await touch("agent", "config");
      return { connectionId: "same-connection", settings: {} };
    },
    isDebugAgentsEnabled: () => false,
    languageModels: { resolve, resolveForRequest: (options) => resolve(options.connectionId) },
    json: { parseJsonish: JSON.parse },
  };
  const release = owner.run(() => configureVillagesRuntime(host));
  assert.equal(calls.length, 0, "constructing the complete runtime performs no settings work");
  return {
    owner,
    release,
    rows,
    calls,
    get providers() {
      return providers;
    },
    get writes() {
      return writes;
    },
    rejectNextUpdate(id: string) {
      rejectUpdate = id;
    },
    failNext(op: string, id: string, error: Error) {
      failures.set(`${op}:${id}`, error);
    },
    pause(op: string, id: string, at = 1) {
      const entered = deferred(),
        resumed = deferred();
      pauses.push({ op, id, at, entered, resumed });
      return {
        async wait(task: Promise<unknown>) {
          await Promise.race([entered.promise, task.then(() => assert.fail(`Expected paused ${op}:${id}.`))]);
        },
        resume: resumed.resolve,
      };
    },
    unblock() {
      for (const pause of pauses) pause.resumed.resolve();
    },
  };
}
