import assert from "node:assert/strict";
import { mock } from "node:test";
import { createModelCompletions } from "../packages/villages/src/server/features/generation/completion-service.js";
import { withProviderDeadline } from "../packages/villages/src/server/adapters/models/provider-deadline.js";

const records = new Map<string, unknown>();
let writes = 0;
const mutateDocument = async (id: string, slot: any, mutate: any) => {
  const copy = slot.coerce(records.get(id));
  if ((await mutate(copy)) === false) return;
  writes++;
  records.set(id, structuredClone(copy));
};
const completions = () =>
  createModelCompletions({
    mutateDocument,
    readRuntimeDebug: async () => {},
    runtimeDebug() {},
    backgroundCalls: { getStore: () => undefined },
    coordinatedCompletion: async (_key: string, work: any) => work(),
    withUsagePurpose: async (_purpose: string, work: any) => work(),
    inferredPurpose: () => "background",
    villagesLogger: () => ({ debug() {}, warn() {} }),
    bindCallback: (callback: any) => callback,
  } as any);
const messages = [{ role: "system" as const, content: "Return JSON." }];
const options = (key: string, retry = false) => ({ temperature: null, savedRequest: { key, retry } });
let calls = 0;
const model = {
  model: "synthetic",
  connectionId: "synthetic",
  chatComplete: async () => {
    calls++;
    return { content: '{"value":1}', finishReason: "stop" };
  },
} as any;

const first = await completions().completeWithRoom(model, messages, 1024, options("saved"));
assert.equal(records.size, 1, "Raw response is durable before caller validation or application");
// Simulate a process restart and a failed application: the new service has only persisted receipts.
const second = await completions().completeWithRoom(model, messages, 1024, options("saved", true));
assert.deepEqual(second, first);
assert.equal(calls, 1, "Restart/application failure cannot regenerate valid paid work");
const before = writes;
await completions().completeWithRoom(model, messages, 1024, options("saved"));
assert.equal(writes, before, "Saved-result reads do not rewrite receipts");
await assert.rejects(
  completions().completeWithRoom(model, [{ role: "user", content: "changed" }], 1024, options("saved", true)),
  /inputs changed/,
);
assert.equal(calls, 1);
let emptyCalls = 0;
await completions().completeWithRoom(
  {
    ...model,
    chatComplete: async () => {
      emptyCalls++;
      return { content: "", finishReason: "length" };
    },
  },
  messages,
  1024,
  { temperature: null, retryEmpty: true },
);
assert.equal(emptyCalls, 1, "Legacy retryEmpty cannot authorize a second paid request");
let malformedCalls = 0;
const malformed = {
  ...model,
  chatComplete: async () => {
    malformedCalls++;
    return { content: malformedCalls === 1 ? "{}" : '{"value":1}', finishReason: "stop" };
  },
};
const checked = (retry: boolean) => ({
  ...options("invalid", retry),
  savedRequest: { key: "invalid", retry, valid: (r: any) => r.content.includes("value") },
});
await completions().completeWithRoom(malformed, messages, 1024, checked(false));
await assert.rejects(completions().completeWithRoom(malformed, messages, 1024, checked(false)), /Retry explicitly/);
await completions().completeWithRoom(malformed, messages, 1024, checked(true));
assert.equal(malformedCalls, 2, "Only explicit retry replaces an invalid saved result");

const shared = completions();
let concurrentCalls = 0;
let finishConcurrent!: (value: any) => void;
let concurrentBegan!: () => void;
const concurrentStarted = new Promise<void>((resolve) => {
  concurrentBegan = resolve;
});
const concurrentModel = {
  ...model,
  chatComplete: async () => {
    concurrentCalls++;
    concurrentBegan();
    return new Promise((resolve) => {
      finishConcurrent = resolve;
    });
  },
};
const duplicateA = shared.completeWithRoom(concurrentModel, messages, 1024, options("duplicate", true));
const duplicateB = shared.completeWithRoom(concurrentModel, messages, 1024, options("duplicate", true));
await concurrentStarted;
finishConcurrent({ content: "shared", finishReason: "stop" });
assert.deepEqual(await Promise.all([duplicateA, duplicateB]), [
  { content: "shared", finishReason: "stop" },
  { content: "shared", finishReason: "stop" },
]);
assert.equal(concurrentCalls, 1, "Concurrent explicit retries share one dispatch");
mock.timers.enable({ apis: ["setTimeout"] });
try {
  let finish!: (value: any) => void;
  let began!: () => void;
  const started = new Promise<void>((resolve) => {
    began = resolve;
  });
  const late = {
    ...model,
    chatComplete: () =>
      withProviderDeadline(async () => {
        calls++;
        began();
        return new Promise((resolve) => {
          finish = resolve;
        });
      }),
  };
  const request = completions().completeWithRoom(late, messages, 1024, options("late"));
  const rejected = assert.rejects(request, /timed out/);
  await started;
  mock.timers.tick(30_000);
  await rejected;
  await assert.rejects(completions().completeWithRoom(model, messages, 1024, options("late")), /Retry explicitly/);
  finish({ content: "retained late response", finishReason: "stop" });
  await new Promise((resolve) => setImmediate(resolve));
  const recovered = await completions().completeWithRoom(model, messages, 1024, options("late"));
  assert.equal(recovered.content, "retained late response");
  assert.equal(calls, 2, "Late success becomes locally recoverable without another provider call");
} finally {
  mock.timers.reset();
}
console.log(
  "Generation reliability: durable raw receipts, restart, invalid-result replacement, unknown billing, late success and zero automatic retries passed.",
);
