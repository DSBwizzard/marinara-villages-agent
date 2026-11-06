import assert from "node:assert/strict";
import {
  createActivationScope,
  activationScope,
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
  venueOperationSnapshot,
  assertVenueOwnership,
  outsideVenueOperation,
} from "../packages/villages/src/server/adapters/operations/operation-context.js";

function deferred() {
  return Promise.withResolvers<void>();
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

  const storeA = a.run(() => operation("A")),
    storeB = a.run(() => operation("B")),
    gate = deferred(),
    entered = deferred();
  const pending = a.run(() =>
    context.run(storeA, async () => {
      assert.equal(venueOperationId(), "A-operation");
      entered.resolve();
      await gate.promise;
      assert.equal(
        venueOperationId(),
        "A-operation",
        "a direct callback retains its originating operation across default replacement",
      );
      assert.equal(activationScope(), a);
      assert.equal(context.getStore(), storeA);
      assert.equal(venueOperationSignal(), storeA.controller.signal);
      assert.equal(venueSavedCheckpoint("checkpoint"), "A");
      assert.deepEqual(venueOperationSnapshot(), { owner: "A" });
      assert.throws(() => assertVenueOwnership({ operation: { token: "B-token" } }), /no longer owns/);
      await b.run(() =>
        context.run(storeB, async () => {
          await Promise.resolve();
          assert.equal(venueOperationId(), "B-operation");
          assert.equal(activationScope(), b);
          await outsideVenueOperation(async () => {
            await Promise.resolve();
            assert.equal(venueOperationId(), "uncoordinated");
            assert.equal(activationScope(), b);
          });
          assert.equal(venueOperationId(), "B-operation");
        }),
      );
      assert.equal(venueOperationId(), "A-operation");
      await context.exit(async () => {
        await Promise.resolve();
        assert.equal(context.getStore(), undefined, "exit clears Scene authority");
        assert.equal(activationScope(), a, "exit keeps the same application");
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
    }),
  );
  await entered.promise;

  try {
    gate.resolve();
    assert.equal(await pending, "A result");
    b.run(() => assert.equal(context.getStore(), undefined));
    b.run(() => assert.equal(venueOperationId(), "uncoordinated"));
    b.run(() => releaseA());
    b.run(() => releaseA());
    b.run(() =>
      assert.equal(
        b.run(() => context.run(storeB, () => venueOperationId())),
        "B-operation",
      ),
    );
    a.dispose();
    b.run(() => assert.throws(() => a.run(() => context.run(storeA, () => {})), /not configured/));
  } finally {
    gate.resolve();
    await b.run(() => pending.catch(() => {}));
    b.run(() => releaseA());
    b.run(() => releaseB());

    a.dispose();
    b.dispose();
  }
}
async function exitCapturesOwner() {
  const a = createActivationScope(),
    b = createActivationScope();
  const releaseA = a.run(() => configureVenueOperationContext(createVenueOperationContext(() => logger)));
  const releaseB = b.run(() => configureVenueOperationContext(createVenueOperationContext(() => logger)));

  const gate = deferred(),
    entered = deferred();
  const pending = a.run(() =>
    context.exit(async () => {
      assert.equal(context.getStore(), undefined);
      entered.resolve();
      await gate.promise;
      assert.equal(activationScope(), a, "exiting Scene authority retains application selection");
      assert.equal(context.getStore(), undefined);
      assert.equal(
        context.run(operation("A"), () => venueOperationId()),
        "A-operation",
      );
      return "exit result";
    }),
  );
  await entered.promise;

  try {
    gate.resolve();
    assert.equal(await pending, "exit result");
    b.run(() => assert.equal(venueOperationId(), "uncoordinated"));
  } finally {
    gate.resolve();
    await b.run(() => pending.catch(() => {}));
    b.run(() => releaseA());
    b.run(() => releaseB());

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
await main();
