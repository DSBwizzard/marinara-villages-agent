import assert from "node:assert/strict";
import { createActivationScope } from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import {
  createPrivateSpacePreparation,
  type PrivateSpacePreparationPorts,
} from "../packages/villages/src/server/jobs/private-space-service.js";
import { preparePrivateSpaces } from "../packages/villages/src/server/jobs/private-space-preparation.js";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
const tick = () => new Promise<void>((resolve) => setImmediate(resolve));
async function until(ready: () => boolean) {
  for (let i = 0; i < 300; i++) {
    if (ready()) return;
    await tick();
  }
  throw new Error("Preparation did not reach the expected checkpoint");
}
function world(name: string) {
  const stamp = new Date().toISOString();
  return coerceVillageState({
    seed: "same-seed",
    name,
    setting: name,
    wishSystemVersion: 3,
    setupAt: stamp,
    foundedAt: stamp,
    storyPace: "off",
    villagers: [],
    venues: [
      {
        id: "same-venue",
        name: "Office",
        form: "Station",
        description: "Station door",
        layoutVersion: 1,
        classes: ["gathering"],
        occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
        residentIds: [],
        presentation: { image: null, x: 0.5, y: 0.5 },
        zones: [
          { ...defaultVenueSpace("other", "Station door"), id: "exterior", name: "Exterior", kind: "exterior" },
          {
            ...defaultVenueSpace("gathering"),
            id: "same-zone",
            name: "Office",
            kind: "restricted",
            controllerIds: ["player"],
            preparation: { status: "pending" },
          },
        ],
      },
    ],
  });
}
function fixture(name: string) {
  const rows = new Map<string, any>([
    [
      "villages-village",
      {
        id: "villages-village",
        packageId: "villages",
        data: world(name),
        revision: 1,
      },
    ],
  ]);
  const gate = deferred();
  const calls: { signal?: AbortSignal; claim: string }[] = [];
  const stages: string[] = [];
  const state = () => rows.get("villages-village").data;
  const privateZone = () => state().venues[0].zones[1];
  let conflicts = 2;
  const documents = {
    getById: async (_package: string, id: string) => structuredClone(rows.get(id) ?? null),
    list: async (_package: string, kind: string) =>
      structuredClone([...rows.values()].filter((row) => row.kind === kind)),
    create: async (input: any) => {
      const row = { ...structuredClone(input), revision: 1 };
      rows.set(row.id, row);
      return row;
    },
    update: async (input: any) => {
      const old = rows.get(input.id);
      if (!old || old.revision !== input.expectedRevision || conflicts-- > 0) return null;
      const next = { ...old, ...structuredClone(input), revision: old.revision + 1 };
      rows.set(next.id, next);
      return next;
    },
    remove: async (_package: string, id: string) => rows.delete(id),
  };
  const model = {
    name: `Model ${name}`,
    model: "synthetic",
    connectionId: "same-connection",
    maxContext: 32000,
    maxOutputTokens: 3000,
    fitContext: (messages: any[], options: any) => ({ messages, maxTokens: options.maxTokens }),
    chatComplete: async (messages: any[], options: any) => {
      const { rooms } = JSON.parse(messages[1].content);
      assert.equal(rooms.length, 1);
      const zone = privateZone();
      assert.ok(zone.preparation.claimId, "claim must be stored before provider dispatch");
      calls.push({ signal: options.signal, claim: zone.preparation.claimId });
      await gate.promise; // Deliberately ignores abort to exercise the late-result fence.
      return {
        content: JSON.stringify({
          rooms: [
            {
              venueId: rooms[0].venueId,
              id: rooms[0].id,
              description: `private-${name}`,
              condition: name,
              items: [],
              facts: [],
            },
          ],
        }),
        finishReason: "stop",
      };
    },
  };
  const logger = { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} };
  const ports: PrivateSpacePreparationPorts = {
    readVillageState: async () => structuredClone(state()),
    mutateVillageState: async (mutator) => {
      // A failed CAS re-evaluates the callback on a fresh copy, without sending a second request.
      if (conflicts-- > 0) await mutator(structuredClone(state()));
      const next = structuredClone(state());
      await mutator(next);
      rows.get("villages-village").data = next;
      return structuredClone(next);
    },
    readVillageLore: async () => [],
    villagesLogger: () => logger,
    villagesLanguageModels: () => ({ resolveForRequest: async () => model }) as any,
    villagesConnectionIdFor: async () => "same-connection",
    completeWithRoom: async (selected, messages, maxTokens, options) =>
      selected.chatComplete(messages, { ...options, maxTokens }),
    reportFoundingProgress: async (_seed, progress) => {
      stages.push(progress.stage!);
    },
  };
  const service = createPrivateSpacePreparation(ports);
  const host = {
    projectId: name,
    isDebugAgentsEnabled: () => false,
    logger,
    getAgentConfig: async () => ({ connectionId: "same-connection" }),
    resources: { listCharacters: async () => [], listLorebooks: async () => [] },
    persistence: { documents },
    languageModels: { resolveForRequest: async () => model },
  } as any;
  return { service, state, privateZone, gate, calls, stages, host };
}
async function factoryIsolation() {
  const a = fixture("A"),
    b = fixture("B");
  const controllerA = new AbortController(),
    controllerB = new AbortController();
  const pendingA = a.service.preparePrivateSpaces(controllerA.signal);
  const duplicateA = a.service.preparePrivateSpaces(new AbortController().signal);
  assert.equal(pendingA, duplicateA, "one owner joins its exact in-flight Promise");
  const pendingB = b.service.preparePrivateSpaces(controllerB.signal);
  assert.notEqual(pendingA, pendingB);
  const outcomeA = pendingA.catch((error) => error);
  try {
    await until(() => a.calls.length === 1 && b.calls.length === 1);
    assert.notEqual(a.calls[0].claim, b.calls[0].claim);
    controllerA.abort();
    assert.equal(a.calls[0].signal?.aborted, true);
    assert.equal(b.calls[0].signal?.aborted, false);
    b.gate.resolve();
    await pendingB;
    assert.equal(b.privateZone().preparation.status, "ready");
    assert.equal(b.privateZone().description, "private-B");
    assert.equal(a.privateZone().preparation.status, "pending");
    a.gate.resolve();
    assert.match((await outcomeA).message, /interrupted/);
    assert.equal(a.privateZone().preparation.status, "failed");
    assert.equal(a.privateZone().description, "");
    await a.service.preparePrivateSpaces();
    assert.equal(a.calls.length, 1, "discovery never retries unknown paid outcomes");
    await a.service.retryPrivateSpaces();
    assert.equal(a.calls.length, 2);
    assert.equal(a.privateZone().preparation.attempt, 2);
    assert.equal(a.privateZone().preparation.status, "ready");
    assert.deepEqual(b.stages, ["lore", "resolving", "model", "validating", "saving"]);
    assert.equal(b.calls.length, 1, "another owner's retry cannot repeat a completed space");
  } finally {
    a.gate.resolve();
    b.gate.resolve();
    await Promise.allSettled([pendingA, pendingB]);
  }
}
async function scopedIsolation() {
  const a = fixture("scoped-A"),
    b = fixture("scoped-B");
  const ownerA = createActivationScope(),
    ownerB = createActivationScope();
  const releaseA = ownerA.run(() => configureVillagesRuntime(a.host));
  const releaseB = ownerB.run(() => configureVillagesRuntime(b.host));
  const controllerA = new AbortController(),
    controllerB = new AbortController();
  const pendingA = ownerA.run(() => preparePrivateSpaces(controllerA.signal));
  const duplicateA = ownerA.run(() => preparePrivateSpaces(controllerA.signal));
  const pendingB = ownerB.run(() => preparePrivateSpaces(controllerB.signal));
  const outcomeA = pendingA.catch((error) => error);
  assert.equal(pendingA, duplicateA, "supported helpers preserve duplicate joins");
  try {
    await until(() => a.calls.length === 1 && b.calls.length === 1);
    controllerA.abort();
    a.gate.resolve();
    assert.match((await outcomeA).message, /interrupted/);
    releaseA();
    ownerA.dispose();
    assert.throws(() => ownerA.run(preparePrivateSpaces), /preparation is not configured/);
    assert.equal(b.calls[0].signal?.aborted, false);
    b.gate.resolve();
    await pendingB;
    assert.equal(b.privateZone().description, "private-scoped-B");
    assert.equal(a.privateZone().description, "");
    await ownerB.run(preparePrivateSpaces);
    assert.equal(b.calls.length, 1, "old cleanup leaves the newer owner usable");
  } finally {
    a.gate.resolve();
    b.gate.resolve();
    await Promise.allSettled([pendingA, pendingB]);
    if (ownerA.active) {
      releaseA();
      ownerA.dispose();
    }
    releaseB();
    ownerB.dispose();
  }
}
async function main() {
  await factoryIsolation();
  await scopedIsolation();
  console.log(
    "Private preparation ownership passed: independent same-ID promises, claims, signals, retries, scoped helpers and late-result fences (synthetic providers).",
  );
}
const watchdog = setTimeout(() => {
  throw new Error("Private preparation scenarios did not finish");
}, 20000);
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => clearTimeout(watchdog));
