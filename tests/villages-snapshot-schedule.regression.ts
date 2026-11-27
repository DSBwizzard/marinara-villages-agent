// Test cases: snapshot-schedule/local-time, snapshot-schedule/lifecycle
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import {
  dueSnapshotOccurrence,
  type SnapshotSchedule,
} from "../packages/villages/src/server/domain/rules/snapshot-schedule.js";
import { createSnapshotScheduler } from "../packages/villages/src/server/jobs/snapshot-scheduler.js";
const schedule: SnapshotSchedule = {
  seed: "world",
  setupAt: "2026-01-01T00:00:00.000Z",
  generation: "one",
  enabledAt: "2026-01-01T00:00:00.000Z",
  frequency: "daily",
  time: "01:30",
  timeZone: "America/Los_Angeles",
  weekday: "0",
  retain: "7",
};
await runCase("snapshot-schedule/local-time", () => {
  assert.equal(dueSnapshotOccurrence(schedule, new Date("2026-11-01T08:30:00Z")), "2026-11-01T01:30");
  const completed = { ...schedule, lastOccurrence: "2026-11-01T01:30" };
  assert.equal(
    dueSnapshotOccurrence(completed, new Date("2026-11-01T09:30:00Z")),
    undefined,
    "DST fold never duplicates a capture",
  );
  assert.equal(
    dueSnapshotOccurrence({ ...schedule, time: "02:30" }, new Date("2026-03-08T10:00:00Z")),
    "2026-03-08T02:30",
    "missing DST time catches up after the jump",
  );
  assert.equal(
    dueSnapshotOccurrence({ ...schedule, frequency: "weekly", weekday: "1" }, new Date("2026-11-19T12:00:00Z")),
    "2026-11-16T01:30",
  );
  assert.equal(
    dueSnapshotOccurrence({ ...schedule, enabledAt: "2026-11-01T09:45:00.000Z" }, new Date("2026-11-01T10:00:00Z")),
    undefined,
  );
  assert.equal(dueSnapshotOccurrence({ ...schedule, frequency: "off" }, new Date("2027-01-01")), undefined);
});
await runCase("snapshot-schedule/lifecycle", async () => {
  let calls = 0,
    release!: () => void;
  const done = new Promise<void>((resolve) => {
    release = resolve;
  });
  const scheduler = createSnapshotScheduler(
    async () => {
      calls++;
      await done;
    },
    (error) => {
      throw error;
    },
  );
  const stop = scheduler.start();
  const one = scheduler.tick(),
    two = scheduler.tick();
  assert.equal(one, two);
  await Promise.resolve();
  assert.equal(calls, 1);
  release();
  await one;
  await stop();
  await scheduler.tick();
  assert.equal(calls, 1, "deactivated packages cannot keep taking snapshots");
});
