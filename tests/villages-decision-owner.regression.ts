import assert from "node:assert/strict";
import type { CapabilityRuntimeHost, CapabilityDecisionResult } from "@marinara-engine/shared";
import {
  createActivationScope,
  installDefaultActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import {
  configureDecisionsAdapter,
  createDecisionsAdapter,
  decisionAdapterStatus,
  evaluateVillagesDecisions,
} from "../packages/villages/src/server/adapters/engine/decisions-adapter.js";

function deferred<T>() {
  return Promise.withResolvers<T>();
}
const answer: CapabilityDecisionResult = { model: null, threshold: 0.5, answers: { yes: 1 }, choices: {} };
const request = { messages: [], questions: [{ id: "yes", question: "Witnessed?" }] };
function fixture() {
  let calls = 0;
  const gate = deferred<CapabilityDecisionResult | null>();
  const capability = {
    async evaluate(input: typeof request) {
      assert.equal(this, capability, "public receiver retained");
      assert.equal(input, request);
      calls++;
      return gate.promise;
    },
  };
  return { runtime: { decisions: capability } as CapabilityRuntimeHost, gate, calls: () => calls };
}
const missing = createDecisionsAdapter({} as CapabilityRuntimeHost);
assert.equal((await missing.status()).available, false);
assert.equal(await missing.evaluate(request), null);
const f = fixture(),
  a = createDecisionsAdapter(f.runtime),
  b = createDecisionsAdapter(f.runtime);
assert.equal((await a.status()).available, true);
assert.equal((await a.status()).available, true);
assert.equal(f.calls(), 0, "status never resolves or probes a model");
const pending = a.evaluate(request);
const rejected = assert.rejects(pending, /inactive/);
a.dispose();
f.gate.resolve(answer);
await rejected;
assert.equal((await a.status()).available, false);
assert.equal((await b.status()).available, true);
assert.deepEqual(await b.evaluate(request), answer, "null model metadata remains usable");
const cancelled = fixture(),
  c = createDecisionsAdapter(cancelled.runtime);
const controller = new AbortController();
controller.abort(new Error("cancelled"));
await assert.rejects(c.evaluate({ ...request, signal: controller.signal }), /cancelled/);
assert.equal(cancelled.calls(), 0);
const late = fixture();
const abort = new AbortController();
const host = {
  decisions: {
    async evaluate() {
      return late.gate.promise;
    },
  },
} as CapabilityRuntimeHost;
const lateResult = createDecisionsAdapter(host).evaluate({ ...request, signal: abort.signal });
abort.abort(new Error("late cancellation"));
late.gate.resolve(answer);
await assert.rejects(lateResult, /late cancellation/);

const ownerA = createActivationScope(),
  ownerB = createActivationScope();
const first = fixture(),
  second = fixture();
const releaseA = ownerA.run(() => configureDecisionsAdapter(first.runtime));
const releaseB = ownerB.run(() => configureDecisionsAdapter(second.runtime));
const clearA = installDefaultActivation(ownerA, () => {});
const owned = evaluateVillagesDecisions(request);
const clearB = installDefaultActivation(ownerB, () => {});
first.gate.resolve(answer);
assert.deepEqual(await owned, answer);
assert.equal(second.calls(), 0);
releaseA();
assert.equal((await decisionAdapterStatus()).available, true);
await assert.rejects(
  ownerA.run(() => evaluateVillagesDecisions(request)),
  /inactive/,
);
second.gate.resolve(null);
assert.equal(await evaluateVillagesDecisions(request), null);
clearA();
clearB();
releaseB();
ownerA.dispose();
ownerB.dispose();
console.log("Public Decisions capability ownership, feature detection, receiver and cancellation: ok");
