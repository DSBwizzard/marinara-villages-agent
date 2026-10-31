import assert from "node:assert/strict";
import type { Job } from "../packages/villages/src/server/domain/models/background-model.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  backgroundRecoveryState,
  workRecoveryState,
} from "../packages/villages/src/server/domain/rules/work-recovery.js";
import { createBackgroundWork } from "../packages/villages/src/server/jobs/background-service.js";
import { createBackgroundContext } from "../packages/villages/src/server/adapters/operations/background-context-service.js";
import { authorBackgroundFixture } from "./helpers/village-storage.fixture.js";
import { backgroundRevision } from "../packages/villages/src/server/domain/rules/background-revision.js";

function job(patch: Partial<Job> = {}): Job {
  return {
    id: "saved-job",
    kind: "agenda",
    subjectId: "removed-resident",
    seed: "retention",
    revision: "source",
    finite: true,
    label: "Agenda",
    input: null,
    status: "completed",
    owner: "previous-activation",
    attempt: 1,
    steps: [],
    settings: {},
    hasResult: false,
    requests: 1,
    tokens: 10,
    error: "",
    failedStep: null,
    retryActions: [],
    retrying: false,
    connectionId: "fixture",
    highWaterDate: "",
    connectionPaused: false,
    completedCount: 1,
    usageComplete: true,
    ...patch,
  };
}
const savedReply = { fingerprint: "paid-input", status: "completed" as const, response: { content: "saved reply" } };
const replacement = {
  kind: "agenda" as const,
  subjectId: "replacement",
  seed: "retention",
  revision: "next",
  finite: true,
  label: "Replacement",
  input: { source: "accepted replacement" },
};
assert.equal(backgroundRecoveryState(job({ replacement })), "pending");
assert.equal(
  backgroundRecoveryState(
    job({ replacement, status: "obsolete", steps: [{ fingerprint: "unknown", status: "running" }] }),
  ),
  "uncertain",
  "A queued replacement does not settle its original request.",
);
for (const status of ["queued", "running", "paused"] as const)
  assert.equal(backgroundRecoveryState(job({ status })), "pending");
assert.equal(backgroundRecoveryState(job()), "completed");
assert.equal(
  backgroundRecoveryState(job({ usageComplete: false })),
  "completed",
  "Unknown token counts are not an unfinished request.",
);
assert.equal(backgroundRecoveryState(job({ status: "failed" })), "failed");
for (const patch of [
  { hasResult: true, result: { result: "purchased" } },
  { partialResult: true },
  { steps: [savedReply] },
  { optionalAttempts: { review: { status: "complete" as const, elapsedMs: 2, result: "saved" } } },
])
  for (const status of ["failed", "interrupted", "obsolete", "completed"] as const)
    assert.equal(backgroundRecoveryState(job({ ...patch, status })), "recoverable");
for (const patch of [
  { steps: [{ fingerprint: "unknown", status: "running" as const }] },
  { optionalAttempts: { review: { status: "unknown" as const, elapsedMs: 2 } } },
  { optionalAttempts: { review: { status: "dispatching" as const, elapsedMs: 2 } } },
  { failure: { cause: "unknown_request" as const, stage: "provider", message: "unknown" } },
])
  assert.equal(backgroundRecoveryState(job({ status: "obsolete", ...patch })), "uncertain");
for (const malformed of [
  null,
  {},
  job({ status: "invalid" as any }),
  job({ kind: "unknown-kind" as any }),
  job({ status: ["completed"] as any }),
  job({ steps: [{ ...savedReply, status: ["completed"] as any }] }),
  job({ steps: [{ ...savedReply, response: undefined, timing: { outcome: ["unknown"] } as any }] }),
  job({ optionalAttempts: { review: { status: ["unknown"], elapsedMs: 1 } as any } }),
  job({ steps: [null] as any }),
  job({ steps: {} as any }),
  job({ optionalAttempts: { review: null } as any }),
  job({ partialResult: "invalid" as any }),
  job({ replacement: null as any }),
  job({ replacement: {} as any }),
])
  assert.equal(backgroundRecoveryState(malformed), "uncertain");
assert.equal(
  backgroundRecoveryState(job({ status: "failed", steps: [savedReply, { fingerprint: "next", status: "running" }] })),
  "uncertain",
  "An earlier purchased reply does not settle a later uncertain request.",
);
const terminal = { pending: false, uncertain: false, savedWork: false, completed: false, abandonmentFenced: true };
assert.equal(workRecoveryState(terminal), "abandoned");
assert.equal(workRecoveryState({ ...terminal, savedWork: true }), "recoverable");
assert.equal(workRecoveryState({ ...terminal, uncertain: true }), "uncertain");

// Poll the real cleanup path with retired subjects and old-world records. No worker/provider is started.
const state = defaultVillageState();
state.seed = "retention";
const rows = new Map<string, any>();
const aliases = new Map<string, string>();
const remainingJobs = () =>
  [...rows.entries()].filter(([, row]) => row.kind === "background-work").map(([id]) => aliases.get(id) ?? id);
function save(alias: string, patch: Partial<Job> = {}) {
  const data = authorBackgroundFixture(rows, job({ id: alias, subjectId: alias, ...patch })) as Job;
  const id = "villages-background-" + backgroundRevision([data.kind, data.subjectId]);
  aliases.set(id, alias);
  rows.set(id, {
    id,
    packageId: "villages",
    kind: "background-work",
    revision: 1,
    updatedAt: "2000-01-01T00:00:00.000Z",
    data,
  });
}
save("reply", { status: "obsolete", steps: [savedReply] });
save("partial", { status: "failed", partialResult: true });
save("uncertain", { status: "obsolete", steps: [{ fingerprint: "unknown", status: "running" }] });
save("paused", { status: "paused" });
save("pending-replacement", { replacement });
save("old-parent-current-replacement", { seed: "prior-world", replacement });
save("old-world", { seed: "prior-world", status: "failed", hasResult: true, result: "paid" });
rows.set("malformed", { id: "malformed", kind: "background-work", revision: 1, data: null });
for (const [id, data] of Object.entries({
  "empty-object": {},
  "malformed-step": job({ kind: "world-development", steps: [null] as any }),
  "malformed-steps": job({ steps: {} as any }),
  "malformed-optional": job({ optionalAttempts: { review: null } as any }),
  "array-discriminant": job({ optionalAttempts: { review: { status: ["unknown"], elapsedMs: 1 } as any } }),
}))
  rows.set(id, { id, kind: "background-work", revision: 1, data });
save("completed-without-usage", { usageComplete: false });
for (let i = 0; i < 8; i++) save("settled-" + i);
let reads = 0;
const background = createBackgroundWork({
  villagesDocuments: () =>
    ({
      list: async (_pkg: string, kind: string) =>
        structuredClone([...rows.values()].filter((row) => row.kind === kind)),
      remove: async (_pkg: string, id: string, revision: number) => {
        assert.equal(rows.get(id)?.revision, revision);
        return rows.delete(id);
      },
    }) as any,
  villagesLogger: () => ({ debug() {}, debugOverride() {}, info() {}, warn() {}, error() {} }),
  readVillageAuthority: async () => {
    reads++;
    return structuredClone(state);
  },
  mutateVillageAuthority: async (update) => update(state),
  readVillageState: async () => {
    throw new Error("Cleanup must not hydrate social history.");
  },
  mutateVillageState: async () => {
    throw new Error("Cleanup must not hydrate social history.");
  },
  withUsagePurpose: (_purpose, work) => work(),
  measurePipeline: (_name, _tags, work) => work(),
  runtimeDebug() {},
  backgroundCalls: createBackgroundContext().backgroundCalls,
  handlers: [],
});
await background.backgroundWorkSummaries();
await background.backgroundWorkSummaries();
assert.equal(reads, 2);
assert.deepEqual(remainingJobs(), [
  "reply",
  "partial",
  "uncertain",
  "paused",
  "pending-replacement",
  "old-parent-current-replacement",
  "malformed",
  "empty-object",
  "malformed-step",
  "malformed-steps",
  "malformed-optional",
  "array-discriminant",
]);
state.seed = "explicit-reset";
await background.backgroundWorkSummaries();
assert.deepEqual(
  remainingJobs(),
  ["malformed", "empty-object", "malformed-step", "malformed-steps", "malformed-optional", "array-discriminant"],
  "Explicit Reset releases known prior-world records; corrupt ownership remains protected.",
);
console.log("Recovery classification protects saved replies, partial effects and uncertainty during ordinary cleanup.");
