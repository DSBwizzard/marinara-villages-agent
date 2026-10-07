import assert from "node:assert/strict";
import {
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import {
  createVenueOperationContext,
  type Context,
} from "../packages/villages/src/server/adapters/operations/operation-context-service.js";
import {
  configureVenueOperationContext,
  context,
  venueOperationId,
  venueOperationSignal,
  venueSavedCheckpoint,
  venueOperationInput,
  venueOperationSnapshot,
  assertVenueOwnership,
  outsideVenueOperation,
} from "../packages/villages/src/server/adapters/operations/operation-context.js";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function operation(name: string): Context {
  return {
    sessionId: "same-scene",
    controller: new AbortController(),
    allowPaid: true,
    scope: name,
    counts: new Map(),
    usedAttemptKeys: new Map(),
    blocked: new Set(),
    operation: {
      id: `${name}-operation`,
      token: `${name}-token`,
      attemptId: `${name}-attempt`,
      status: "running",
      checkpoints: { checkpoint: name },
      input: { owner: name },
      snapshot: { owner: name },
      attempts: {},
    } as any,
  };
}
const logger = { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} };
async function runCapturesOwner() {
  const a = createActivationScope(),
    b = createActivationScope();
  const releaseA = a.run(() => configureVenueOperationContext(createVenueOperationContext(() => logger)));
  const releaseB = b.run(() => configureVenueOperationContext(createVenueOperationContext(() => logger)));
  const clearA = installDefaultActivation(a, () => {});
  const storeA = operation("A"),
    storeB = operation("B"),
    gate = deferred(),
    entered = deferred();
  const pending = context.run(storeA, async () => {
    assert.equal(venueOperationId(), "A-operation");
    entered.resolve();
    await gate.promise;
    assert.equal(
      venueOperationId(),
      "A-operation",
      "a direct callback retains its originating operation across default replacement",
    );
    assert.equal(scopedActivation(), a);
    assert.equal(context.getStore(), storeA);
    assert.equal(venueOperationSignal(), storeA.controller.signal);
    assert.equal(venueSavedCheckpoint("checkpoint"), "A");
    assert.deepEqual(venueOperationInput(), { owner: "A" });
    assert.deepEqual(venueOperationSnapshot(), { owner: "A" });
    assert.throws(() => assertVenueOwnership({ operation: { token: "B-token" } }), /no longer owns/);
    await b.run(() =>
      context.run(storeB, async () => {
        await Promise.resolve();
        assert.equal(venueOperationId(), "B-operation");
        assert.equal(scopedActivation(), b);
        await outsideVenueOperation(async () => {
          await Promise.resolve();
          assert.equal(venueOperationId(), "uncoordinated");
          assert.equal(scopedActivation(), b);
        });
        assert.equal(venueOperationId(), "B-operation");
      }),
    );
    assert.equal(venueOperationId(), "A-operation");
    await context.exit(async () => {
      await Promise.resolve();
      assert.equal(context.getStore(), undefined, "exit clears Scene authority");
      assert.equal(scopedActivation(), a, "exit keeps the same application");
    });
    assert.equal(venueOperationId(), "A-operation", "exit restores the surrounding Scene authority");
    storeA.controller.abort(new Error("A was cancelled"));
    assert.throws(() => assertVenueOwnership(), /A was cancelled/, "originating cancellation remains enforced");
    const error = new Error("original callback failure");
    assert.throws(
      () =>
        context.run(storeA, () => {
          throw error;
        }),
      (value) => value === error,
    );
    const result = Promise.resolve("exact promise");
    assert.equal(
      context.run(storeA, () => result),
      result,
      "the facade preserves Promise identity",
    );
    assert.equal(
      context.exit(() => result),
      result,
    );
    assert.throws(
      () =>
        context.exit(() => {
          throw error;
        }),
      (value) => value === error,
    );
    return "A result";
  });
  await entered.promise;
  const clearB = installDefaultActivation(b, () => {});
  try {
    gate.resolve();
    assert.equal(await pending, "A result");
    assert.equal(context.getStore(), undefined);
    assert.equal(venueOperationId(), "uncoordinated");
    releaseA();
    releaseA();
    assert.equal(
      b.run(() => context.run(storeB, () => venueOperationId())),
      "B-operation",
    );
    a.dispose();
    assert.throws(() => a.run(() => context.run(storeA, () => {})), /not configured/);
  } finally {
    gate.resolve();
    await pending.catch(() => {});
    releaseA();
    releaseB();
    clearA();
    clearB();
    a.dispose();
    b.dispose();
  }
}
async function exitCapturesOwner() {
  const a = createActivationScope(),
    b = createActivationScope();
  const releaseA = a.run(() => configureVenueOperationContext(createVenueOperationContext(() => logger)));
  const releaseB = b.run(() => configureVenueOperationContext(createVenueOperationContext(() => logger)));
  const clearA = installDefaultActivation(a, () => {});
  const gate = deferred(),
    entered = deferred();
  const pending = context.exit(async () => {
    assert.equal(context.getStore(), undefined);
    entered.resolve();
    await gate.promise;
    assert.equal(scopedActivation(), a, "exiting Scene authority retains application selection");
    assert.equal(context.getStore(), undefined);
    assert.equal(
      context.run(operation("A"), () => venueOperationId()),
      "A-operation",
    );
    return "exit result";
  });
  await entered.promise;
  const clearB = installDefaultActivation(b, () => {});
  try {
    gate.resolve();
    assert.equal(await pending, "exit result");
    assert.equal(venueOperationId(), "uncoordinated");
  } finally {
    gate.resolve();
    await pending.catch(() => {});
    releaseA();
    releaseB();
    clearA();
    clearB();
    a.dispose();
    b.dispose();
  }
}
async function main() {
  await runCapturesOwner();
  await exitCapturesOwner();
  console.log(
    "Direct Scene context callbacks retain application authority across default replacement and nested dispatch.",
  );
}
void main();
