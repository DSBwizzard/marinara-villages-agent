import assert from "node:assert/strict";
import { createBackgroundContext } from "../packages/villages/src/server/adapters/operations/background-context-service.js";
import { configureVillageClock } from "../packages/villages/src/server/adapters/time/clock-gate.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { activityDate, reserveEventAttempt } from "../packages/villages/src/server/domain/rules/event-attempts.js";
import { captureReturnContext } from "../packages/villages/src/server/domain/rules/return-catchup-capture.js";
import { createReturnCatchup } from "../packages/villages/src/server/features/background/return-catchup-service.js";
import { createBackgroundWork } from "../packages/villages/src/server/jobs/background-service.js";
import { villageSchedulerDelayMs } from "../packages/villages/src/server/jobs/village-refresh-scheduler.js";

const scheduled = defaultVillageState();
scheduled.seed = "activity";
scheduled.setupAt = "2026-10-29T00:00:00Z";
scheduled.timeZone = "UTC";
scheduled.eventAttempts = {
  highWaterDate: "2026-10-29",
  lastAttemptAt: "2026-10-29T10:00:00Z",
  attempts: [{ id: "first", date: "2026-10-29", at: "2026-10-29T10:00:00Z" }],
};
const wakeAt = new Date("2026-10-29T10:20:00Z");
assert.equal(
  villageSchedulerDelayMs(wakeAt, scheduled, Date.parse("2026-10-29T10:50:00Z")),
  10 * 60_000 + 250,
  "An unrelated routine wake cannot postpone a future activity deadline.",
);
assert.equal(
  villageSchedulerDelayMs(wakeAt, scheduled, Number.POSITIVE_INFINITY),
  villageSchedulerDelayMs(wakeAt),
  "Hidden activity contributes no deadline, even before its next admission.",
);
assert.equal(
  villageSchedulerDelayMs(new Date("2026-10-29T10:40:00Z"), scheduled, Date.parse("2026-10-29T11:10:00Z")),
  30 * 60_000 + 250,
  "A due but unrunnable opportunity is deferred without a tight timer loop.",
);

const bounded = structuredClone(scheduled);
bounded.backgroundPace = "lively";
bounded.eventAttempts = undefined;
bounded.returnCatchup = {
  batch: { id: "six", status: "running", budgetDate: "2026-10-29", opportunityLimit: 6 },
};
for (let index = 0; index < 6; index++)
  reserveEventAttempt(bounded, "six-" + index, "2026-10-29", wakeAt.getTime() + index, "six");
assert.throws(() => reserveEventAttempt(bounded, "seventh", "2026-10-29", wakeAt.getTime() + 7, "six"));
reserveEventAttempt(bounded, "six-0", "2026-10-29", Date.parse("2026-10-30T00:01:00Z"), "six");
assert.equal(bounded.eventAttempts!.attempts.length, 6, "Continuation does not consume another slot.");

for (const evidence of ["unstarted", "paid", "uncertain", "retry", "legacy"] as const) {
  const state = defaultVillageState();
  state.seed = "return";
  state.setupAt = "2026-10-29T00:00:00Z";
  state.timeZone = "Pacific/Auckland";
  const returned = new Date("2026-10-29T10:59:00Z");
  const afterMidnight = new Date("2026-10-29T11:01:00Z");
  const capture = captureReturnContext(state, new Date(returned.getTime() - 2 * 3_600_000));
  const opportunity = {
    id: "return-opportunity",
    kind: "routine" as const,
    startsAt: returned.toISOString(),
    endsAt: returned.toISOString(),
    actorIds: ["a"],
    venueId: "",
    facts: [],
  };
  state.returnCatchup = {
    capture,
    batch: {
      id: "return",
      status: "running",
      from: capture.at,
      until: returned.toISOString(),
      ...(evidence === "legacy" ? {} : { budgetDate: activityDate(state, returned), opportunityLimit: 1 }),
      opportunities: [opportunity],
      records: [
        {
          opportunityId: opportunity.id,
          status: evidence === "unstarted" || evidence === "legacy" ? "pending" : "queued",
        },
      ],
    },
  };
  let queued = 0,
    rearmed = 0;
  const job: any =
    evidence === "unstarted" || evidence === "legacy"
      ? null
      : {
          id: "paid-job",
          status: "failed",
          requests: evidence === "paid" ? 1 : 0,
          steps: evidence === "uncertain" ? [{ status: "running" }] : [],
          attemptHistory: evidence === "retry" ? [{ requests: 1 }] : [],
          error: "Saved work needs recovery.",
        };
  const service = createReturnCatchup({
    readSnapshot: async () => structuredClone(state),
    mutate: async (change: any) => {
      change(state);
      return state;
    },
    queue: async () => {
      queued++;
    },
    job: async () => job,
    retryJob: async () => {},
    cancel: async () => {
      state.returnCatchup!.batch!.status = "cancelled";
    },
    settle: async () => "settled",
    reinterpret: async () => {},
    hasPresence: () => true,
    now: () => afterMidnight,
    activityChanged: () => {
      rearmed++;
    },
  });
  await service.advance();
  if (evidence === "unstarted") {
    assert.equal(queued, 0);
    assert.equal(state.returnCatchup.batch!.records![0]!.status, "rejected");
    assert.equal(state.returnCatchup.batch!.status, "completed");
  } else if (evidence === "legacy") {
    assert.equal(queued, 1, "Already admitted legacy batches keep their original recovery contract.");
  } else {
    assert.equal(state.returnCatchup.batch!.status, "failed", "Purchased or uncertain work requires recovery.");
    assert.equal(state.returnCatchup.batch!.records![0]!.status, "queued");
  }
  rearmed = 0;
  await service.continueToVillage("return");
  assert.equal(rearmed, 1, "Continue re-arms the existing activity timer.");
}

// Exercise actual background dispatch across month retirement, not just the date helper.
let instant = new Date("2026-10-31T23:59:00Z");
let world = defaultVillageState();
world.seed = "month-rollover";
world.setupAt = instant.toISOString();
world.timeZone = "UTC";
const releaseClock = configureVillageClock({
  now: () => new Date(instant),
  observe: async () => ({}) as any,
  resolve: async () => ({}) as any,
});
const rows = new Map<string, any>();
const context = createBackgroundContext();
let calls = 0;
const model: any = {
  connectionId: "fixture",
  model: "fixture",
  chatComplete: async () => {
    calls++;
    return { content: "ok", finishReason: "stop" };
  },
};
const service = createBackgroundWork({
  villagesDocuments: () =>
    ({
      getById: async (_pkg: string, id: string) => structuredClone(rows.get(id) ?? null),
      list: async (_pkg: string, kind: string) =>
        structuredClone([...rows.values()].filter((row) => row.kind === kind)),
      create: async (input: any) => {
        const row = { ...structuredClone(input), revision: 1 };
        rows.set(row.id, row);
        return row;
      },
      update: async (input: any) => {
        const old = rows.get(input.id);
        if (old.revision !== input.expectedRevision) return null;
        const row = { ...old, ...structuredClone(input), revision: old.revision + 1 };
        rows.set(row.id, row);
        return row;
      },
      remove: async (_pkg: string, id: string) => rows.delete(id),
    }) as any,
  villagesLogger: () => ({ debug() {}, debugOverride() {}, info() {}, warn() {}, error() {} }),
  readVillageState: async () => structuredClone(world),
  mutateVillageState: async (change) => {
    const next = structuredClone(world);
    change(next);
    world = next;
    return world;
  },
  withUsagePurpose: (_purpose, work) => work(),
  measurePipeline: (_name, _tags, work) => work(),
  runtimeDebug() {},
  backgroundCalls: context.backgroundCalls,
  handlers: [
    [
      "resident-planning",
      {
        valid: () => true,
        async generate() {
          const complete = context.backgroundCalls.getStore()!;
          await complete(model, [{ role: "user", content: "first" }], 100, { checkpointId: "first", debugMode: false });
          instant = new Date("2026-11-01T00:31:00Z");
          reserveEventAttempt(world, "next-month", "2026-11-01", instant.getTime());
          assert.equal(world.eventAttempts!.attempts.length, 1, "The new month retires the old ledger row.");
          await complete(model, [{ role: "user", content: "second" }], 100, {
            checkpointId: "second",
            debugMode: false,
          });
          return {};
        },
        apply() {},
      },
    ],
  ],
});
const stop = service.startBackgroundWork({ now: () => 0 });
try {
  await service.villageBackgroundPresence("month-session", true);
  await service.queueBackgroundJob({
    kind: "resident-planning",
    subjectId: "village",
    seed: world.seed,
    revision: "october",
    finite: false,
    label: "Activity",
    automaticDate: "2026-10-31",
    input: {},
  });
  await service.settleBackgroundWork();
  const outcome = (await service.backgroundWorkSummaries())[0]!;
  assert.equal(outcome.status, "completed", outcome.error);
  assert.equal(calls, 2, "A purchased source can complete its check without buying a new review.");
  assert.deepEqual(
    world.eventAttempts!.attempts.map((row) => row.id),
    ["next-month"],
  );
} finally {
  stop();
  releaseClock();
}
