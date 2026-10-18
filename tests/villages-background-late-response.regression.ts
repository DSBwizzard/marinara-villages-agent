import assert from "node:assert/strict";
import { mock } from "node:test";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import {
  queueBackgroundJob,
  registerBackgroundHandler,
  settleBackgroundWork,
  retryBackgroundJob,
  recoverBackgroundWork,
} from "../packages/villages/src/server/jobs/background-work.js";
import { completeWithRoom } from "../packages/villages/src/server/features/generation/model-requests.js";
import { withProviderDeadline } from "../packages/villages/src/server/adapters/models/provider-deadline.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
const records = new Map<string, any>();
const documents = {
  getById: async (_p: string, id: string) => structuredClone(records.get(id) ?? null),
  list: async (_p: string, kind: string) => structuredClone([...records.values()].filter((row) => row.kind === kind)),
  create: async (value: any) => {
    if (records.has(value.id)) throw Error("duplicate");
    const row = { ...structuredClone(value), revision: 1 };
    records.set(value.id, row);
    return row;
  },
  update: async (value: any) => {
    const old = records.get(value.id);
    if (!old || old.revision !== value.expectedRevision) return null;
    const row = { ...old, ...structuredClone(value), revision: old.revision + 1 };
    records.set(value.id, row);
    return row;
  },
};
const world = defaultVillageState();
world.seed = "late-background";
records.set("villages-village", { id: "villages-village", data: world, revision: 1 });
const host = {
  persistence: { documents },
  logger: { info() {}, debug() {}, warn() {}, error() {}, debugOverride() {} },
} as any;
let release = configureVillagesRuntime(host);
let calls = 0,
  applied = 0;
let finish!: (value: any) => void;
let began!: () => void;
const started = new Promise<void>((resolve) => {
  began = resolve;
});
const model = {
  model: "fake",
  connectionId: "fake",
  chatComplete: () =>
    withProviderDeadline(async () => {
      calls++;
      began();
      return new Promise((resolve) => {
        finish = resolve;
      });
    }),
} as any;
const register = () =>
  registerBackgroundHandler("agenda", {
    valid: () => true,
    generate: async () => {
      const result = await completeWithRoom(model, [{ role: "system", content: "Return JSON" }], 32, {
        temperature: null,
        checkpointId: "late-step",
      });
      return JSON.parse(result.content!);
    },
    apply: (state: any, resultInput: any, result: any) => {
      assert.equal(result.ok, true);
      state.worldFacts.push("applied");
      applied++;
    },
  });
register();
mock.timers.enable({ apis: ["setTimeout"] });
try {
  await queueBackgroundJob({
    kind: "agenda",
    subjectId: "resident",
    seed: world.seed,
    revision: "source",
    finite: true,
    label: "test",
    input: {},
  });
  await started;
  mock.timers.tick(30_000);
  await settleBackgroundWork();
  assert.equal(applied, 0);
  finish({ content: '{"ok":true}', finishReason: "stop" });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(applied, 0, "Late success stores evidence without applying it");
  release();
  release = configureVillagesRuntime(host);
  register();
  await recoverBackgroundWork();
  const saved = [...records.values()].find((row) => row.kind === "background-work");
  assert.equal(saved.data.steps[0].status, "completed", "Restart adopts immutable late evidence locally");
  await retryBackgroundJob(saved.id, saved.data.attempt, "explicit-local-recovery");
  await settleBackgroundWork();
  assert.equal(calls, 1, "Saved response survives service recreation without replacement spending");
  assert.equal(applied, 1);
  await recoverBackgroundWork();
  assert.equal(applied, 1, "Committed receipt prevents duplicate application");
  // A second job receives malformed late evidence. Local replay fails once, then explicit replacement can dispatch.
  let nextStarted!: () => void;
  const secondStarted = new Promise<void>((resolve) => {
    nextStarted = resolve;
  });
  began = nextStarted;
  await queueBackgroundJob({
    kind: "agenda",
    subjectId: "other",
    seed: world.seed,
    revision: "source",
    finite: true,
    label: "invalid",
    input: {},
  });
  await secondStarted;
  mock.timers.tick(30_000);
  await settleBackgroundWork();
  finish({ content: "invalid JSON", finishReason: "stop" });
  await new Promise((resolve) => setImmediate(resolve));
  await recoverBackgroundWork();
  const invalid = [...records.values()].find((row) => row.kind === "background-work" && row.data.subjectId === "other");
  await retryBackgroundJob(invalid.id, invalid.data.attempt, "parse-late");
  await settleBackgroundWork();
  assert.equal(calls, 2, "First deliberate recovery only parses purchased late work");
  assert.equal(records.get(invalid.id).data.failedStep, 0, "Invalid late replay becomes replaceable");
  // Another explicitly authorized provider attempt times out too. Its separate late receipt must survive.
  let thirdStarted!: () => void;
  const third = new Promise<void>((resolve) => {
    thirdStarted = resolve;
  });
  began = thirdStarted;
  await retryBackgroundJob(invalid.id, records.get(invalid.id).data.attempt, "replace-invalid");
  await third;
  mock.timers.tick(30_000);
  await settleBackgroundWork();
  finish({ content: '{"ok":true}', finishReason: "stop" });
  await new Promise((resolve) => setImmediate(resolve));
  await recoverBackgroundWork();
  assert.equal(records.get(invalid.id).data.steps[0].status, "completed", "Second attempt gets its own late receipt");
  await retryBackgroundJob(invalid.id, records.get(invalid.id).data.attempt, "use-second-late");
  await settleBackgroundWork();
  assert.equal(calls, 3);
  assert.equal(applied, 2);
  console.log(
    "Background late response: durable evidence, restart, saved response reuse and exactly-once effect passed.",
  );
} finally {
  mock.timers.reset();
  release();
}
