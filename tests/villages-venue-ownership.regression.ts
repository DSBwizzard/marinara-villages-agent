import assert from "node:assert/strict";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { createVenueCoordinator } from "../packages/villages/src/server/jobs/venue-coordinator-service.js";
import { createVenueOperationContext } from "../packages/villages/src/server/adapters/operations/operation-context-service.js";
import { createActivationScope } from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import {
  coordinateVenue,
  coordinatedCompletion,
  stopVenueCoordinator,
} from "../packages/villages/src/server/jobs/venue-coordinator.js";
import {
  venueOperationId,
  venueOperationSignal,
} from "../packages/villages/src/server/adapters/operations/operation-context.js";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
const tick = () => new Promise<void>((resolve) => setImmediate(resolve));
function fixture(label: string, decisionsEnabled: boolean) {
  const id = "villages-venue-visit-same-scene";
  const records = new Map<string, any>([
    [
      id,
      {
        id,
        packageId: "villages",
        kind: "venue-visit",
        name: label,
        description: "",
        revision: 1,
        data: {
          id: "same-scene",
          status: "active",
          sceneRevision: 0,
          lastActivityAt: new Date().toISOString(),
          lines: [],
          submissions: [],
        },
      },
    ],
  ]);
  const documents = {
    async getById(_packageId: string, id: string) {
      return structuredClone(records.get(id) ?? null);
    },
    async list() {
      return structuredClone([...records.values()]);
    },
    async update(input: any) {
      const prior = records.get(input.id);
      if (!prior || prior.revision !== input.expectedRevision) return null;
      const saved = { ...prior, ...structuredClone(input), revision: prior.revision + 1 };
      records.set(input.id, saved);
      return structuredClone(saved);
    },
  } as unknown as CapabilityDocumentStore;
  const logger = { debug() {}, info() {}, warn() {}, error() {} };
  const operations = createVenueOperationContext(() => logger);
  const service = createVenueCoordinator({
    operations,
    villagesDocuments: () => documents,
    villagesLogger: () => logger,
    runtimeDebug() {},
    async readInterpretationSettings() {
      return { decisionsEnabled, compareSystem: false };
    },
  });
  return { service, operations, documents, logger, records, row: () => records.get(id) };
}
async function independentRequests() {
  const a = fixture("A", true),
    b = fixture("B", false);
  const enteredA = deferred<void>(),
    replyA = deferred<string>();
  const enteredB = deferred<void>(),
    replyB = deferred<string>();
  let paidA = 0,
    paidB = 0;
  const workA = () =>
    a.service.venueCheckpoint("reply", () =>
      a.service.coordinatedCompletion("same-fingerprint", async () => {
        paidA++;
        enteredA.resolve();
        return replyA.promise;
      }),
    );
  const workB = () =>
    b.service.venueCheckpoint("reply", () =>
      b.service.coordinatedCompletion("same-fingerprint", async () => {
        paidB++;
        enteredB.resolve();
        return replyB.promise;
      }),
    );
  const pendingA = a.service.coordinateVenue(
    "same-scene",
    "same-submission",
    "turn",
    { message: "hello" },
    0,
    undefined,
    workA,
  );
  const rejectedA = assert.rejects(pendingA, (error: any) => error.code === "OPERATION_INTERRUPTED");
  await enteredA.promise;
  const pendingB = b.service.coordinateVenue(
    "same-scene",
    "same-submission",
    "turn",
    { message: "hello" },
    0,
    undefined,
    workB,
  );
  await enteredB.promise;
  const duplicateB = b.service.coordinateVenue(
    "same-scene",
    "same-submission",
    "turn",
    { message: "hello" },
    0,
    undefined,
    workB,
  );
  assert.deepEqual([paidA, paidB], [1, 1]);
  assert.equal(a.row().data.operation.interpretationSettings.decisionsEnabled, true);
  assert.equal(b.row().data.operation.interpretationSettings.decisionsEnabled, false);
  await a.service.stopVenueCoordinator();
  await rejectedA;
  const stoppedA = structuredClone(a.row().data);
  assert.equal(stoppedA.operation.status, "interrupted");
  assert.equal(b.service.hasVenueOperation("same-scene"), true, "A stop cannot cancel B's same-ID operation");
  assert.equal((await b.service.readVenueOperation("same-scene"))?.status, "running");
  replyB.resolve("B reply");
  assert.deepEqual(await Promise.all([pendingB, duplicateB]), ["B reply", "B reply"]);
  assert.equal(b.row().data.operation.status, "complete");
  replyA.resolve("late A reply");
  await tick();
  await tick();
  assert.deepEqual(a.row().data, stoppedA, "revoked late A cannot overwrite its saved interruption");
  assert.equal(b.row().data.operation.status, "complete");
  await a.service.stopVenueCoordinator();
  assert.equal(
    await b.service.coordinateVenue("same-scene", "new-submission", "turn", {}, 0, undefined, async () => "next B"),
    "next B",
  );
  await assert.rejects(
    a.service.coordinateVenue("same-scene", "later-A", "turn", {}, 0, undefined, async () => "never"),
    (error: any) => error.code === "OPERATION_INTERRUPTED",
  );
  assert.deepEqual([paidA, paidB], [1, 1], "cleanup and recovery never authorize another provider call");
  await b.service.stopVenueCoordinator();
}

async function nestedOwners() {
  const a = fixture("nested-A", true),
    b = fixture("nested-B", false);
  try {
    const result = await a.service.coordinateVenue("same-scene", "outer-A", "turn", {}, 0, undefined, async () => {
      assert.equal(a.operations.venueOperationId(), "outer-A");
      assert.equal(b.operations.venueOperationId(), "uncoordinated");
      const signalA = a.operations.venueOperationSignal();
      const inner = await b.service.coordinateVenue("same-scene", "inner-B", "turn", {}, 0, undefined, async () => {
        assert.equal(a.operations.venueOperationId(), "outer-A");
        assert.equal(b.operations.venueOperationId(), "inner-B");
        assert.notEqual(b.operations.venueOperationSignal(), signalA);
        assert.equal(b.service.hasVenueOperation("same-scene"), true, "B must take its own admission path");
        assert.equal(b.service.venueInterpretationSettings().decisionsEnabled, false);
        return "inner reply";
      });
      assert.equal(inner, "inner reply");
      assert.equal(a.service.hasVenueOperation("same-scene"), true);
      assert.equal(b.row().data.operation.id, "inner-B");
      assert.equal(b.operations.venueOperationId(), "uncoordinated", "inner B restores only its own context");
      return "outer reply";
    });
    assert.equal(result, "outer reply");
    assert.equal(a.row().data.operation.status, "complete");
    assert.equal(b.row().data.operation.status, "complete");
  } finally {
    await a.service.stopVenueCoordinator();
    await b.service.stopVenueCoordinator();
  }
}

async function actualDispatch() {
  const a = fixture("dispatch-A", false),
    b = fixture("dispatch-B", false);
  const ownerA = createActivationScope(),
    ownerB = createActivationScope();
  const releaseA = ownerA.run(() =>
    configureVillagesRuntime({ persistence: { documents: a.documents }, logger: a.logger } as any),
  );
  const releaseB = ownerB.run(() =>
    configureVillagesRuntime({ persistence: { documents: b.documents }, logger: b.logger } as any),
  );
  try {
    const reply = await ownerA.run(() =>
      coordinateVenue("same-scene", "scope-A", "turn", {}, 0, undefined, async () => {
        assert.equal(venueOperationId(), "scope-A");
        const signalA = venueOperationSignal();
        const inner = await ownerB.run(() =>
          coordinateVenue("same-scene", "scope-B", "turn", {}, 0, undefined, async () => {
            assert.equal(venueOperationId(), "scope-B", "supported helpers select the nested activation's authority");
            assert.notEqual(venueOperationSignal(), signalA);
            return coordinatedCompletion("mocked-B", async () => "B result");
          }),
        );
        assert.equal(venueOperationId(), "scope-A", "nested dispatch restores A");
        assert.equal(inner, "B result");
        return coordinatedCompletion("mocked-A", async () => "A result");
      }),
    );
    assert.equal(reply, "A result");
    assert.equal(a.row().data.operation.id, "scope-A");
    assert.equal(b.row().data.operation.id, "scope-B");
    await ownerA.run(stopVenueCoordinator);
    releaseA();
    ownerA.dispose();
    assert.throws(() => ownerA.run(venueOperationId), /operation context is not configured/);
    assert.equal(
      await ownerB.run(() => coordinateVenue("same-scene", "later-B", "turn", {}, 0, undefined, async () => "still B")),
      "still B",
    );
  } finally {
    if (ownerA.active) {
      await ownerA.run(stopVenueCoordinator);
      releaseA();
      ownerA.dispose();
    }
    await ownerB.run(stopVenueCoordinator);
    releaseB();
    ownerB.dispose();
  }
}

async function main() {
  await independentRequests();
  await nestedOwners();
  await actualDispatch();
  console.log(
    "Scene coordinator owners passed: independent same-ID requests/receipts/settings, nested contexts and actual scoped helpers, duplicate joins, shutdown and revoked late completion (synthetic ports).",
  );
}
const watchdog = setTimeout(() => {
  throw new Error("Scene coordinator ownership scenarios did not finish");
}, 20000);
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => clearTimeout(watchdog));
