import assert from "node:assert/strict";
import {
  createActivationScope,
  installDefaultActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
import { newWishLifecycle, wishRevision } from "../packages/villages/src/server/domain/rules/wish-policy.js";
import {
  processWishAttempt,
  wishBackgroundHandler,
} from "../packages/villages/src/server/features/residents/wishes/wish-lifecycle.js";
import {
  wishAttemptClocks,
  readWishAttemptClock,
} from "../packages/villages/src/server/features/residents/wishes/wish-attempt-clocks.js";
import { configureVillageStateService } from "../packages/villages/src/server/features/world/village-store.js";
import { configureBackgroundWork } from "../packages/villages/src/server/jobs/background-work.js";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function fixture(name: string, stamp: string) {
  const state = coerceVillageState({
    villagers: [
      {
        characterId: "same-resident",
        addedAt: stamp,
        cardSnapshot: { id: "same-resident", name, capturedAt: stamp, revision: 1, sourceStatus: "available" },
      },
    ],
  });
  const resident = state.villagers[0];
  resident.agenda = unwrittenVillageAgenda([], name);
  resident.wishLifecycle = newWishLifecycle();
  const attempt = {
    id: "same-attempt",
    stage: "reserved",
    revision: wishRevision(resident, state),
    calls: 0,
    dateKey: "2026-10-06",
    at: stamp,
    accepted: false,
  };
  resident.wishLifecycle.attempt = attempt as any;
  const scope = createActivationScope();
  const release = scope.run(() =>
    configureVillagesRuntime({
      persistence: { documents: {} },
      logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
      isDebugAgentsEnabled: () => false,
    } as any),
  );
  const clocks = scope.run(wishAttemptClocks);
  clocks.remember("same-attempt", () => new Date(stamp));
  return { scope, state, attempt, clocks, release };
}
const first = fixture("A", "2026-10-06T23:59:00.000Z"),
  second = fixture("B", "2026-10-07T01:00:00.000Z");
try {
  const input = { id: "same-attempt", characterId: "same-resident" };
  const apply = (item: typeof first) =>
    item.scope.run(() => wishBackgroundHandler.apply(item.state, input, item.attempt, { retrying: true } as any));
  apply(first);
  apply(second);
  assert.equal(first.state.villagers[0].wishLifecycle!.attempt!.at, "2026-10-06T23:59:00.000Z");
  assert.equal(second.state.villagers[0].wishLifecycle!.attempt!.at, "2026-10-07T01:00:00.000Z");
  let later = new Date("2026-10-08T01:00:00.000Z");
  first.clocks.remember("same-attempt", () => later);
  apply(first);
  assert.equal(first.state.villagers[0].wishLifecycle!.attempt!.at, later.toISOString());
  later = new Date("2026-10-09T01:00:00.000Z");
  apply(first);
  assert.equal(
    first.state.villagers[0].wishLifecycle!.attempt!.at,
    later.toISOString(),
    "each apply/CAS attempt invokes the clock instead of caching its Date",
  );
  first.clocks.forget("same-attempt");
  assert.equal(
    first.scope.run(() => readWishAttemptClock("same-attempt")),
    undefined,
  );
  assert.equal(
    second.scope.run(() => readWishAttemptClock("same-attempt"))!().toISOString(),
    "2026-10-07T01:00:00.000Z",
  );

  const gate = deferred(),
    entered = deferred();
  const calls: string[] = [];
  // Restore pending attempts; failed durable jobs must return before queuing or requesting a provider.
  first.state.villagers[0].wishLifecycle!.attempt = { ...first.attempt, stage: "reserved" } as any;
  second.state.villagers[0].wishLifecycle!.attempt = { ...second.attempt, stage: "reserved" } as any;
  const releaseStateA = first.scope.run(() =>
    configureVillageStateService({
      readVillageState: async () => {
        entered.resolve();
        await gate.promise;
        return first.state;
      },
    } as any),
  );
  const releaseStateB = second.scope.run(() =>
    configureVillageStateService({
      readVillageState: async () => {
        calls.push("B state");
        return second.state;
      },
    } as any),
  );
  const releaseJobsA = first.scope.run(() =>
    configureBackgroundWork({
      backgroundStatus: async () => {
        calls.push("A status");
        return "failed";
      },
    } as any),
  );
  const releaseJobsB = second.scope.run(() =>
    configureBackgroundWork({
      backgroundStatus: async () => {
        calls.push("B status");
        return "failed";
      },
    } as any),
  );
  const clearA = installDefaultActivation(first.scope, () => {});
  const pending = processWishAttempt(
    "same-resident",
    "same-attempt",
    new Date(first.attempt.at),
    () => new Date(first.attempt.at),
  );
  await entered.promise;
  const clearB = installDefaultActivation(second.scope, () => {});
  await processWishAttempt("same-resident", "same-attempt", new Date(second.attempt.at));
  gate.resolve();
  await pending;
  assert.deepEqual(
    calls,
    ["B state", "B status", "A status"],
    "a paused direct attempt keeps A's background admission after B becomes default",
  );
  releaseStateA();
  releaseStateB();
  releaseJobsA();
  releaseJobsB();
  clearA();
  clearB();
  first.release();
  assert.throws(() => first.scope.run(wishAttemptClocks), /not configured/);
  assert.equal(
    first.scope.run(() => readWishAttemptClock("same-attempt")),
    undefined,
  );
  assert.equal(
    second.scope.run(() => readWishAttemptClock("same-attempt"))!().toISOString(),
    "2026-10-07T01:00:00.000Z",
  );
  const missing = createActivationScope();
  assert.throws(() => missing.run(wishAttemptClocks), /not configured/);
  assert.equal(
    missing.run(() => readWishAttemptClock("same-attempt")),
    undefined,
  );
  missing.dispose();
  second.scope.dispose();
  assert.throws(() => second.scope.run(wishAttemptClocks), /not configured/);
  assert.equal(
    second.scope.run(() => readWishAttemptClock("same-attempt")),
    undefined,
  );
} finally {
  first.release();
  second.release();
  first.scope.dispose();
  second.scope.dispose();
}
assert.equal(readWishAttemptClock("same-attempt"), undefined, "standalone pure apply retains its wall-clock fallback");
console.log(
  "Wish attempt clocks and direct processing retain their activation across same-ID jobs, CAS application and default replacement.",
);
