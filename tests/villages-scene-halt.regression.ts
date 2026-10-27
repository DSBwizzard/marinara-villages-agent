import { fixtureWish } from "./helpers/social-wishes-fixture.js";
// Test cases: scene-halt/captured-calendar, scene-halt/calendar, scene-halt/evidence, scene-halt/world, scene-halt/authority-order
import assert from "node:assert/strict";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { sceneHaltWorldConflict } from "../packages/villages/src/server/domain/rules/scene-halt-world.js";
import { capturedSceneCalendar, readSceneHalt } from "../packages/villages/src/server/domain/rules/scene-halt.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { runCase } from "../scripts/test-cases.mjs";

const choice = { chosenAt: "2026-10-15T20:00:00Z", timeZone: "America/Los_Angeles" };
const clear = { reason: "none", quote: "", appointments: [] };
await runCase("scene-halt/captured-calendar", () => {
  const scene = coerceSession({
    version: 2,
    startedAt: "2026-10-19T14:00:00.000Z",
    lines: [{ content: "Thursday. Early Thursday." }],
  });
  assert.deepEqual(capturedSceneCalendar(scene, "America/Los_Angeles"), {
    instant: "2026-10-19T14:00:00.000Z",
    date: "2026-10-19",
    weekday: "Monday",
    time: "07:00",
    timeZone: "America/Los_Angeles",
  });
  for (const at of ["2026-11-01T08:30:00.000Z", "2026-11-01T09:30:00.000Z"]) {
    const calendar = capturedSceneCalendar({ ...scene, startedAt: at }, "America/Los_Angeles");
    assert.equal(calendar.weekday, "Sunday");
    assert.equal(calendar.date, "2026-11-01");
    assert.equal(calendar.time, "01:30");
  }
  assert.equal(
    capturedSceneCalendar({ ...scene, startedAt: "2027-01-01T07:30:00.000Z" }, "America/Los_Angeles").date,
    "2026-12-31",
  );
  assert.throws(
    () => capturedSceneCalendar({ ...scene, startedAt: "invalid" }, "America/Los_Angeles"),
    /calendar is invalid/,
  );
});
await runCase("scene-halt/calendar", () => {
  const appointment = (date: string, minute: number | null) => ({
    ...clear,
    appointments: [{ date, minute, quote: "Lunch tomorrow" }],
  });
  assert.equal(readSceneHalt(appointment("2026-10-13", 780), choice, "Lunch tomorrow", []), "halt-appointment");
  assert.equal(readSceneHalt(appointment("2026-10-16", 780), choice, "Lunch tomorrow", []), null);
  assert.equal(readSceneHalt(appointment("2026-10-15", 780), choice, "Lunch tomorrow", []), "halt-appointment");
  assert.equal(readSceneHalt(appointment("2026-10-15", null), choice, "Lunch tomorrow", []), null);
  assert.equal(readSceneHalt(appointment("2026-10-15", 781), choice, "Lunch tomorrow", []), null);
  // Real local day, not the UTC date. Midnight Pacific is still in the future.
  assert.equal(
    readSceneHalt(
      appointment("2026-10-15", 0),
      {
        ...choice,
        chosenAt: "2026-10-15T06:59:00Z",
      },
      "Lunch tomorrow",
      [],
    ),
    null,
  );
  assert.throws(() => readSceneHalt(appointment("2026-02-30", null), choice, "Lunch tomorrow", []));
  assert.throws(() => readSceneHalt(appointment("2026-10-16", 1440), choice, "Lunch tomorrow", []));
});
await runCase("scene-halt/evidence", () => {
  for (const [reason, outcome] of [
    ["time", "halt-time"],
    ["activity", "halt-time"],
    ["condition", "halt-state"],
    ["world", "halt-world"],
  ]) {
    assert.equal(readSceneHalt({ reason, quote: "two months" }, choice, "I sleep for two months", []), outcome);
    assert.equal(
      readSceneHalt({ reason, quote: "two months" }, choice, "Hello", [{ content: "You sleep for two months." }]),
      outcome,
    );
  }
  assert.throws(() => readSceneHalt({ reason: "time", quote: "not actually present" }, choice, "Hello", []));
  assert.throws(() => readSceneHalt({}, choice, "Hello", []));
  assert.throws(() => readSceneHalt({ reason: "none" }, choice, "Hello", []));
  for (const message of [
    "I hope we can have a sleepover",
    '"I once slept for seven hours"',
    "I try to pick up the mug",
    "I think about time travel",
  ]) {
    assert.equal(readSceneHalt(clear, choice, message, [{ content: "Roxie listens." }]), null);
  }
});

await runCase("scene-halt/world", () => {
  const world = defaultVillageState();
  world.seed = "synthetic-halt";
  world.venues = [
    {
      id: "house",
      name: "House",
      classes: ["other"],
      zones: [
        {
          ...defaultVenueSpace("other"),
          id: "exterior",
          name: "Porch",
          kind: "exterior",
        },
      ],
    },
  ] as any;
  world.venues[0].zones![0].state.condition = "A folded cloth lies here.";
  const scene = coerceSession({
    version: 2,
    id: "scene",
    villageSeed: world.seed,
    placeId: "house",
    zoneId: "exterior",
    startedAt: "2026-10-12T14:00:00Z",
    status: "active",
    participants: [],
    lines: [],
    submissions: [],
  });
  scene.continuity = captureSceneContinuity(world, scene, Date.parse(scene.startedAt));
  const change = {
    sceneChange: {
      narration: "You unfold the cloth.",
      conditionBefore: "A folded cloth lies here.",
      conditionAfter: "The cloth is unfolded.",
    },
  };
  assert.equal(sceneHaltWorldConflict(scene, world, change), false);
  const current = structuredClone(world);
  current.name = "An unrelated change";
  assert.equal(sceneHaltWorldConflict(scene, current, change), false);
  current.venues[0].zones![0].state.condition = "The cloth has been removed.";
  assert.equal(
    sceneHaltWorldConflict(scene, current, {}),
    false,
    "the old room remains available for ordinary conversation",
  );
  assert.equal(
    sceneHaltWorldConflict(scene, current, change),
    true,
    "a new physical consequence cannot overwrite the affected fact",
  );
  const resident = {
    characterId: "roxie",
    wishes: [fixtureWish({ wish: "Discuss bikes", reason: "Grounded social fixture desire" }, "wish", scene.startedAt)],
    agenda: {},
  };
  world.villagers = [resident] as any;
  scene.continuity = captureSceneContinuity(world, scene, Date.parse(scene.startedAt));
  const wish = { wishChanges: [{ actorId: "roxie", wishId: "wish", intent: "fulfilled" }] };
  assert.equal(sceneHaltWorldConflict(scene, world, wish), false, "passing the expiry is not a new condition");
  const fulfilled = structuredClone(world);
  fulfilled.villagers[0].wishes = [];
  assert.equal(sceneHaltWorldConflict(scene, fulfilled, wish), true);
  assert.equal(
    sceneHaltWorldConflict(scene, fulfilled, { wishChanges: [{ ...wish.wishChanges[0], intent: "reveal" }] }),
    false,
    "mentioning an old Wish does not revive it",
  );
  world.villagers[0].wishes[0].revision++;
  assert.equal(sceneHaltWorldConflict(scene, world, wish), true, "new required conditions cannot be undone");
});

await runCase("scene-halt/authority-order", async () => {
  const rows = new Map<string, any>();
  const store: any = {
    getById: async (_pkg: string, id: string) => structuredClone(rows.get(id) ?? null),
    list: async (_pkg: string, kind: string) =>
      [...rows.values()].filter((r) => r.kind === kind).map((r) => structuredClone(r)),
    create: async (input: any) => {
      const row = { ...structuredClone(input), revision: 1 };
      rows.set(row.id, row);
      return structuredClone(row);
    },
    update: async (input: any) => {
      const old = rows.get(input.id);
      if (old?.revision !== input.expectedRevision) return null;
      const row = { ...old, ...structuredClone(input), revision: old.revision + 1 };
      rows.set(row.id, row);
      return structuredClone(row);
    },
    remove: async (_pkg: string, id: string) => rows.delete(id),
  };
  const repository = createVillageRepository(() => store);
  await repository.mutateAuthority((state) => {
    state.name = "Before";
  });
  const events: string[] = [];
  const entered = Promise.withResolvers<void>(),
    release = Promise.withResolvers<void>();
  const acceptance = repository.withAuthorityLock!(async () => {
    events.push((await repository.readAuthority()).name);
    entered.resolve();
    await release.promise;
    events.push("accepted");
  });
  await entered.promise;
  const later = repository.mutateAuthority((state) => {
    events.push("later");
    state.name = "Later";
  });
  await Promise.resolve();
  assert.deepEqual(events, ["Before"]);
  release.resolve();
  await Promise.all([acceptance, later]);
  assert.deepEqual(events, ["Before", "accepted", "later"]);
  // Nested local writes work, but detached descendants lose reentrant ownership after release.
  let detached!: Promise<void>;
  const startDetached = Promise.withResolvers<void>();
  await repository.withAuthorityLock!(async () => {
    await repository.mutateAuthority((state) => {
      state.name = "Nested";
    });
    detached = startDetached.promise.then(() =>
      repository.mutateAuthority(() => {
        events.push("detached");
      }),
    );
  });
  const inside = Promise.withResolvers<void>(),
    leave = Promise.withResolvers<void>();
  const active = repository.withAuthorityLock!(async () => {
    inside.resolve();
    await leave.promise;
    events.push("second accepted");
  });
  await inside.promise;
  startDetached.resolve();
  await Promise.resolve();
  await Promise.resolve();
  assert(!events.includes("detached"));
  leave.resolve();
  await Promise.all([active, detached]);
  assert.deepEqual(events.slice(-2), ["second accepted", "detached"]);
});
console.log("Scene HALT: calendar, evidence, affected authority, Wish protection and acceptance ordering passed.");
