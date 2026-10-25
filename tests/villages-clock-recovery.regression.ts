import { runCase } from "../scripts/test-cases.mjs";
import {
  applyRelationshipReview,
  defaultRelationshipState,
  relationshipFor,
} from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { emptyRelationshipReview } from "../packages/villages/src/server/domain/rules/relationship-review.js";
import assert from "node:assert/strict";
import { createVillageClock } from "../packages/villages/src/server/adapters/time/clock-service.js";
import {
  configureVillageClock,
  guardedClockGeneration,
  withVillageClockCommit,
  withVillageClockWork,
} from "../packages/villages/src/server/adapters/time/clock-gate.js";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { deriveVillageMoment } from "../packages/villages/src/server/domain/rules/village-clock.js";
import { calendarReplay } from "../packages/villages/src/server/domain/rules/clock-recovery.js";
import { ZonedDate, calendarDate } from "../packages/villages/src/shared/helpers/zoned-date.js";
import type { VillageRepository } from "../packages/villages/src/server/domain/models/world-repository.js";
import type { VillageState } from "../packages/villages/src/server/domain/models/world.js";
// Test cases: village-clock-recovery, village-time-advance, founding-timezone
const DAY = 86_400_000;
function fixture() {
  let wall = Date.parse("2026-10-15T02:30:00Z"),
    mono = 0;
  let state = defaultVillageState();
  state.timeZone = "America/Los_Angeles";
  state.setupAt = new Date(wall).toISOString();
  state.projects = [
    {
      id: "pending",
      status: "building",
      updatedAt: state.setupAt,
      lifecycle: { workOrder: { startsAt: state.setupAt, completesAt: new Date(wall + 7200000).toISOString() } },
    } as VillageState["projects"][number],
  ];
  const repository: VillageRepository = {
    readAuthority: async () => structuredClone(state),
    mutateAuthority: async (update) => {
      const copy = structuredClone(state);
      await update(copy);
      state = copy;
    },
  };
  // A suspended VM may stop its elapsed clock while wall time advances.
  const sources = { wall: () => wall, monotonic: () => mono, zone: () => "America/Los_Angeles" };
  const clock = createVillageClock(repository, sources);
  return {
    clock,
    repository,
    sources,
    get state() {
      return state;
    },
    get wall() {
      return wall;
    },
    jump(ms: number) {
      wall += ms;
    },
    tick(ms: number) {
      mono += ms;
    },
  };
}
async function main() {
  const f = fixture();
  await f.clock.observe();
  assert.equal(deriveVillageMoment({ foundedAt: f.state.setupAt, seed: "x", now: f.clock.now() }).localTime, "19:30");
  const deadline = f.state.projects[0]!.lifecycle!.workOrder!.completesAt;
  const binding = configureVillageClock(f.clock);
  try {
    let finish!: () => void;
    const waiting = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const work = withVillageClockWork(() =>
      guardedClockGeneration(async () => {
        await waiting;
        return "saved reply";
      }),
    );
    await new Promise((resolve) => setImmediate(resolve));
    f.jump(3 * 3600000); // Sleep: no monotonic tick.
    assert.equal((await f.clock.observe()).paused, false);
    assert.equal(f.clock.now().getTime(), f.wall);
    finish();
    assert.equal(await work, "saved reply", "sleep cannot discard an in-flight provider result");
    assert.equal(await withVillageClockCommit(async () => "saved"), "saved");
    assert.equal(
      f.state.projects[0]!.lifecycle!.workOrder!.completesAt,
      deadline,
      "normal sleep does not move deadlines",
    );
    assert.ok(Date.parse(deadline) <= f.wall, "unfinished work becomes due during absence");
    f.jump(3650 * DAY); // A decade off is still ordinary downtime.
    const restarted = createVillageClock(f.repository, f.sources);
    assert.equal((await restarted.observe()).paused, false);
    assert.equal(restarted.now().getTime(), f.wall);
    assert.equal(f.state.clock!.shiftTotalMs, 0);
    f.jump(-3651 * DAY);
    assert.equal((await f.clock.observe()).paused, false, "backward clocks never block gameplay");
    assert.ok(calendarReplay(f.state, f.clock.now()), "already-visited days do not refill opportunities");
    const backwardRestart = createVillageClock(f.repository, f.sources);
    assert.equal((await backwardRestart.observe()).paused, false);
    assert.equal(backwardRestart.now().getTime(), f.wall);
    assert.equal(f.state.projects[0]!.lifecycle!.workOrder!.completesAt, deadline);
  } finally {
    binding();
  }
  const legacy = fixture();
  await legacy.clock.observe();
  await legacy.repository.mutateAuthority((state) => {
    state.clock!.recovery = {
      frozenAt: state.setupAt,
      expectedAt: state.setupAt,
      observedAt: new Date(legacy.wall + 3 * DAY).toISOString(),
      differenceMs: 3 * DAY,
    };
    state.clock!.shiftTotalMs = 12345;
  });
  legacy.jump(3 * DAY);
  const fresh = createVillageClock(legacy.repository, legacy.sources);
  const before = JSON.stringify(legacy.state.projects);
  assert.equal((await fresh.observe()).paused, false, "old saved pauses clear without any button");
  assert.equal(legacy.state.clock!.recovery, null);
  assert.equal(legacy.state.clock!.shiftTotalMs, 12345, "old accepted offsets remain compatible");
  assert.equal(JSON.stringify(legacy.state.projects), before, "migration never shifts timers or history");
  await fresh.resolve(0, "accept");
  await fresh.resolve(0, "accept");
  assert.equal(JSON.stringify(legacy.state.projects), before, "old client requests are harmless and idempotent");
  const migrated = fixture();
  await migrated.repository.mutateAuthority((state) => {
    state.timeZone = "";
  });
  await migrated.clock.observe();
  assert.equal(migrated.state.timeZone, "America/Los_Angeles");
  const movedHost = createVillageClock(migrated.repository, { wall: () => migrated.wall, zone: () => "Asia/Tokyo" });
  assert.equal(
    (await movedHost.observe()).timeZone,
    "America/Los_Angeles",
    "host travel cannot change founded timezone",
  );
  const race = fixture();
  await race.clock.observe();
  race.jump(3650 * DAY);
  await race.clock.observe();
  race.jump(-3650 * DAY);
  let intervene = true;
  const racing: VillageRepository = {
    readAuthority: race.repository.readAuthority,
    mutateAuthority: async (update) => {
      if (intervene) {
        intervene = false;
        await race.repository.mutateAuthority((current) => {
          Object.assign(current, defaultVillageState(), { seed: "new-world", timeZone: "Asia/Tokyo" });
        });
      }
      await race.repository.mutateAuthority(update);
    },
  };
  const raceClock = createVillageClock(racing, race.sources);
  await raceClock.observe();
  assert.equal(race.state.timeZone, "Asia/Tokyo", "an intervening reset retains its own timezone");
  assert.equal(race.state.clock!.replayUntilDate, "", "a new world cannot inherit the previous world's future history");
  assert.equal(race.state.clock!.trustedAt, new Date(race.wall).toISOString());
  const reset = fixture();
  await reset.clock.observe();
  reset.jump(3650 * DAY);
  await reset.clock.observe();
  reset.jump(-3650 * DAY);
  await reset.repository.mutateAuthority((current) => {
    Object.assign(current, defaultVillageState(), {
      seed: "another-world",
      setupAt: new Date(reset.wall).toISOString(),
      timeZone: "America/Los_Angeles",
    });
  });
  await createVillageClock(reset.repository, reset.sources).observe();
  await reset.clock.observe();
  assert.equal(
    reset.state.clock!.trustedAt,
    new Date(reset.wall).toISOString(),
    "existing observers discard the previous world's cache",
  );
  assert.equal(reset.state.clock!.replayUntilDate, "");
  const contactVillage = fixture();
  await contactVillage.clock.observe();
  contactVillage.jump(30 * DAY);
  await contactVillage.clock.observe();
  contactVillage.jump(-30 * DAY);
  contactVillage.state.villagers = [{ characterId: "mara" } as VillageState["villagers"][number]];
  const feelings = defaultRelationshipState("fixture");
  applyRelationshipReview(
    feelings,
    {
      ...emptyRelationshipReview(),
      changes: [
        {
          id: "fresh-contact",
          fromId: "mara",
          toId: "player",
          dimension: "warmth",
          amount: 5,
          ordinary: false,
          reason: "Fresh conversation",
          lineIds: ["new-line"],
          disclosed: false,
          contact: true,
        },
      ],
    },
    contactVillage.state,
    "scene",
    new Date(contactVillage.wall).toISOString(),
    contactVillage.wall,
  );
  assert.equal(
    relationshipFor(feelings, "mara", "player").warmth,
    5,
    "future calendar history cannot erase a fresh contact",
  );

  console.log(
    "Nonblocking sleep, long downtime, backward clocks, old-pause migration, calendar replay and DST passed.",
  );
}
async function verify() {
  await runCase("village-clock-recovery", main);
  await runCase("village-time-advance", async () => {
    const f = fixture();
    await f.repository.mutateAuthority((state) => {
      state.seed = "time-test";
      state.foundedAt = state.setupAt;
    });
    const original = await f.clock.observe();
    const deadline = f.state.projects[0]!.lifecycle!.workOrder!.completesAt;
    const request = {
      worldId: original.worldId!,
      revision: original.revision,
      actionId: "advance-one",
      milliseconds: 90 * 60_000,
    };
    let notifications = 0;
    const unsubscribe = f.clock.onAdvance!(() => notifications++);
    await f.clock.advance!(request);
    assert.equal(f.clock.now().getTime(), f.wall + request.milliseconds);
    assert.equal(f.state.clock!.advanceMs, request.milliseconds);
    assert.equal(f.state.clock!.shiftTotalMs, 0, "Development time never rebases legacy recovery timers.");
    assert.equal(f.state.projects[0]!.lifecycle!.workOrder!.completesAt, deadline);
    await f.clock.advance!(request);
    assert.equal(f.state.clock!.advanceMs, request.milliseconds, "A lost response cannot double the advance.");
    assert.equal(notifications, 1);
    await assert.rejects(f.clock.advance!({ ...request, milliseconds: DAY }), /another duration/);
    await assert.rejects(f.clock.advance!({ ...request, actionId: "stale" }), /already changed/);
    const current = await f.clock.observe();
    const results = await Promise.allSettled(
      ["race-a", "race-b"].map((actionId) =>
        f.clock.advance!({ ...request, revision: current.revision, actionId, milliseconds: DAY }),
      ),
    );
    assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
    assert.equal(f.state.clock!.advanceMs, request.milliseconds + DAY);
    assert.deepEqual(
      coerceVillageState({ ...defaultVillageState(), ...JSON.parse(JSON.stringify(f.state)), projects: [] }).clock,
      f.state.clock,
    );
    f.jump(3 * 3_600_000);
    const restarted = createVillageClock(f.repository, f.sources);
    await restarted.observe();
    assert.equal(
      restarted.now().getTime(),
      f.wall + request.milliseconds + DAY,
      "Restart retains the advance and ordinary downtime.",
    );
    for (const milliseconds of [
      0,
      -1,
      0.5,
      NaN,
      Infinity,
      Number.MAX_SAFE_INTEGER,
      Date.parse("9999-12-31T12:00:00Z") - f.wall,
    ]) {
      const view = await restarted.observe();
      await assert.rejects(
        restarted.advance!({ ...request, revision: view.revision, actionId: "invalid", milliseconds }),
      );
    }
    assert.equal(f.state.clock!.advanceMs, request.milliseconds + DAY);
    await f.repository.mutateAuthority((state) => {
      state.seed = "replacement";
      state.clock = null;
    });
    await assert.rejects(restarted.advance!(request), /Village changed/);
    assert.equal(
      restarted.now().getTime(),
      f.wall,
      "A replacement world cannot inherit another world's cached offset.",
    );
    assert.throws(
      () =>
        coerceVillageState({
          ...defaultVillageState(),
          ...f.state,
          clock: { ...original, trustedAt: f.state.setupAt, replayUntilDate: "", advanceMs: -1 },
        }),
      /saved Village time/,
    );
    unsubscribe();
    const g = fixture();
    await g.repository.mutateAuthority((state) => {
      state.seed = "in-flight";
      state.foundedAt = state.setupAt;
    });
    let view = await g.clock.observe();
    await g.clock.advance!({ worldId: view.worldId!, revision: view.revision, actionId: "first", milliseconds: DAY });
    let pause = false;
    let resume!: () => void;
    let entered!: () => void;
    const gate = new Promise<void>((done) => {
      resume = done;
    });
    const blocked = new Promise<void>((done) => {
      entered = done;
    });
    const slowClock = createVillageClock(
      {
        async readAuthority() {
          if (pause) {
            pause = false;
            entered();
            await gate;
          }
          return g.repository.readAuthority();
        },
        async mutateAuthority(update) {
          await g.repository.mutateAuthority(async (state) => {
            const revision = state.clock?.revision;
            const result = await update(state);
            if (state.clock?.revision !== revision) pause = true;
            return result;
          });
        },
      },
      g.sources,
    );
    view = await slowClock.observe();
    const pending = slowClock.advance!({
      worldId: view.worldId!,
      revision: view.revision,
      actionId: "second",
      milliseconds: 7 * DAY,
    });
    await blocked;
    assert.equal(
      slowClock.now().getTime(),
      g.wall + 8 * DAY,
      "In-flight callbacks retain committed Village time while post-save reads are pending.",
    );
    resume();
    await pending;
  });
  await runCase("founding-timezone", async () => {
    const summer = new ZonedDate("2026-07-01T12:00:00Z", "America/Los_Angeles");
    const winter = new ZonedDate("2026-12-01T12:00:00Z", "America/Los_Angeles");
    assert.equal(summer.getTimezoneOffset(), 420);
    const island = calendarDate(new ZonedDate("2026-10-14T12:00:00Z", "Pacific/Kiritimati"), 2026, 9, 14, 0);
    assert.equal(island.getDate(), 14);
    assert.equal(island.getHours(), 0);
    const gap = calendarDate(summer, 2026, 2, 8, 2, 30);
    assert.equal(gap.getHours(), 3);
    assert.equal(gap.getMinutes(), 30);
    const repeat = calendarDate(summer, 2026, 10, 1, 1, 30);
    assert.equal(repeat.toISOString(), "2026-11-01T08:30:00.000Z");
    assert.throws(
      () => coerceVillageState({ version: 4, ...defaultVillageState(), clock: { revision: 1, recovery: {} } }),
      /saved village clock/,
    );
    assert.equal(winter.getTimezoneOffset(), 480);
    assert.equal(calendarDate(summer, 2026, 11, 1, 12).getHours(), 12);
    assert.equal(new ZonedDate("2026-11-01T08:30:00Z", "America/Los_Angeles").getHours(), 1);
    assert.equal(new ZonedDate("2026-11-01T09:30:00Z", "America/Los_Angeles").getHours(), 1);
    assert.equal(
      coerceVillageState({ version: 4, ...defaultVillageState(), clock: fixture().state.clock }).clock,
      null,
    );

    for (const [before, after, firstHour, secondHour] of [
      ["2026-03-08T09:30:00Z", "2026-03-08T10:30:00Z", 1, 3],
      ["2026-11-01T08:30:00Z", "2026-11-01T09:30:00Z", 1, 1],
    ] as const) {
      const a = new ZonedDate(before, "America/Los_Angeles"),
        b = new ZonedDate(after, "America/Los_Angeles");
      assert.equal(a.getHours(), firstHour);
      assert.equal(b.getHours(), secondHour);
      assert.equal(b.getTime() - a.getTime(), 3600000, "DST changes civil time, never elapsed waits");
    }
    assert.equal(new ZonedDate("2026-07-01T12:00:00Z", "America/Phoenix").getTimezoneOffset(), 420);
    assert.equal(new ZonedDate("2026-12-01T12:00:00Z", "America/Phoenix").getTimezoneOffset(), 420);
  });
}
verify().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
