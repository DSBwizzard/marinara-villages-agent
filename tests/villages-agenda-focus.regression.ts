import assert from "node:assert/strict";
import { ZonedDate } from "../packages/villages/src/shared/helpers/zoned-date.js";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageAgendaBlock } from "../packages/villages/src/server/domain/models/world.js";
import { agendaAt } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
import { composeAgenda } from "../packages/villages/src/server/domain/rules/agenda-composition.js";
import { agendaBlocksFor, agendaDateKey } from "../packages/villages/src/server/domain/rules/agenda-week.js";
import {
  PROJECT_FOCUS_MS,
  projectAgendaReservations,
} from "../packages/villages/src/server/domain/rules/project-focus.js";
import {
  pauseProject,
  reconcileProjectLifecycles,
} from "../packages/villages/src/server/domain/rules/project-lifecycle-rules.js";
import { captureSceneAttendance } from "../packages/villages/src/server/domain/rules/scene-attendance.js";
import { socialPlanCandidates } from "../packages/villages/src/server/domain/rules/social-rules.js";
import { VILLAGE_WEEKDAYS } from "../packages/villages/src/server/domain/rules/village-clock.js";
import { villagerPlaceView } from "../packages/villages/src/server/domain/rules/village-projections.js";
import { fixture, renovation, venue } from "./fixtures/villages-projects.fixture.js";

const at = (value: string) => new ZonedDate(value, "UTC");
const now = at("2026-10-29T14:00:00Z");
const routine: VillageAgendaBlock[] = [
  { startMinute: 0, endMinute: 540, activity: "Rest", venueId: "", essential: true },
  { startMinute: 540, endMinute: 720, activity: "Ordinary work", venueId: "cafe", flexible: false },
  { startMinute: 720, endMinute: 840, activity: "Necessary care", venueId: "", essential: true },
  { startMinute: 840, endMinute: 1020, activity: "Ordinary work", venueId: "cafe", flexible: false },
  { startMinute: 1020, endMinute: 1140, activity: "Essential duties", venueId: "", essential: true },
  { startMinute: 1140, endMinute: 1260, activity: "Dinner", venueId: "cafe", commitmentId: "accepted-dinner" },
  { startMinute: 1260, endMinute: 1440, activity: "Rest", venueId: "", essential: true },
];
async function prepared() {
  const f = fixture();
  await f.mutate((state) => {
    state.timeZone = "UTC";
    for (const resident of state.villagers) {
      resident.agenda!.week = Object.fromEntries(VILLAGE_WEEKDAYS.map((day) => [day, structuredClone(routine)]));
      resident.agenda!.routineProfile = undefined;
      resident.agenda!.activeDay = undefined;
      resident.agenda!.plannedDays = {};
    }
  });
  return f;
}
const duration = (periods: { startsAt: string; endsAt: string }[]) =>
  periods.reduce((sum, period) => sum + Date.parse(period.endsAt) - Date.parse(period.startsAt), 0);
const f = await prepared();
const id = await f.newProject();
const captured = captureSceneAttendance(f.state(), "cafe", now);
const capturedBefore = structuredClone(captured);
const base = structuredClone(f.state().villagers[0].agenda!.week);
const body = f.body(id);
await f.service.startProjectConstruction(id, body, now);
const order = f.get(id).lifecycle!.workOrder!;
assert.equal(Date.parse(order.completesAt) - now.getTime(), 24 * 3_600_000);
assert.equal(duration(order.focus!.periods), PROJECT_FOCUS_MS);
assert.equal(order.focus!.periods[0].startsAt, now.toISOString());
assert.ok(order.focus!.periods.some((period) => period.startsAt.startsWith("2026-10-30")));
assert.deepEqual(f.state().villagers[0].agenda!.week, base, "focus leaves the recurring Routine intact");
assert.deepEqual(captured, capturedBefore, "existing Scene attendance is unchanged");
const agenda = f.state().villagers[0].agenda!;
assert.equal(agendaAt(agenda, 900, now)?.commitmentId, id, "ordinary fixed work can be replaced");
assert.equal(agendaAt(agenda, 1200, now)?.commitmentId, "accepted-dinner");
assert.equal(agendaAt(agenda, 60, now)?.activity, "Rest");
assert.equal(
  villagerPlaceView(f.state(), f.state().villagers[0], null, 900, at("2026-10-29T15:00:00Z"))?.id,
  f.get(id).venueId,
  "presence follows the same focus plan",
);
const future = coerceVillageState(f.state());
assert.equal(duration(future.projects[0].lifecycle!.workOrder!.focus!.periods), PROJECT_FOCUS_MS);
assert.equal(agendaAt(future.villagers[0].agenda!, 600, at("2026-10-30T10:00:00Z"))?.commitmentId, id);
await f.service.startProjectConstruction(id, body, now);
assert.equal(
  duration(f.get(id).lifecycle!.workOrder!.focus!.periods),
  PROJECT_FOCUS_MS,
  "lost acknowledgement retry is idempotent",
);

// Later social opportunities cannot consume Project focus, even when their ordinary base is flexible.
const social = coerceVillageState(f.state());
social.backgroundPace = "average";
social.relationshipContext = { applied: {}, socialPlans: [] } as any;
for (const person of social.villagers) {
  for (const blocks of [
    ...Object.values(person.agenda!.week!),
    ...Object.values(person.agenda!.routineProfile!.seedWeek!),
  ])
    for (const block of blocks) if (!block.essential && !block.commitmentId) block.flexible = true;
  person.agenda!.activeDay = undefined;
  person.agenda!.plannedDays = {};
}
projectAgendaReservations(social);
for (const plan of socialPlanCandidates(social, now))
  if (plan.actorIds.includes("a"))
    assert.ok(plan.endMinute <= 840 || plan.startMinute >= 1020, "social opportunities respect booked focus");

// Failed admission commits neither a site nor a timer.
const blocked = await prepared();
const blockedId = await blocked.newProject();
await blocked.mutate((state) => {
  for (const blocks of [
    ...Object.values(state.villagers[0].agenda!.week!),
    ...Object.values(state.villagers[0].agenda!.routineProfile!.seedWeek!),
  ])
    blocks[3].commitmentId = "fixed-appointment";
});
const before = structuredClone(blocked.state());
await assert.rejects(
  blocked.service.startProjectConstruction(blockedId, blocked.body(blockedId), now),
  /cannot fit six hours/,
);
assert.deepEqual(blocked.state(), before, "refused scheduling has no partial physical or saved effects");

// Timed conditions can change occupancy between ordinary Agenda boundaries.
const crowded = fixture();
await crowded.mutate((state) => {
  state.timeZone = "UTC";
  state.venues.push(venue("overflow"));
  const template = structuredClone(state.villagers[0]);
  state.villagers = ["a", "b", "c", "d", "z"].map((characterId) => ({
    ...structuredClone(template),
    characterId,
    cardSnapshot: { ...template.cardSnapshot, id: characterId, name: characterId },
  }));
  for (const person of state.villagers) {
    person.agenda!.routineProfile = undefined;
    person.agenda!.activeDay = undefined;
    person.agenda!.week = Object.fromEntries(
      VILLAGE_WEEKDAYS.map((day) => [
        day,
        [
          {
            startMinute: 0,
            endMinute: 1440,
            activity: "Reading",
            venueId: "cafe",
            zoneId: "common",
            flexible: true,
          },
        ],
      ]),
    );
  }
  state.narrative = {
    version: 1,
    adoptedAt: "2026-10-29T00:00:00.000Z",
    revision: 1,
    weatherRevision: 0,
    weather: null,
    situations: [],
    receipts: [],
    conditions: [
      {
        id: "restriction",
        revision: 1,
        situationId: "s",
        venueId: "cafe",
        zoneId: "common",
        observation: "Closed temporarily",
        restriction: "ordinary-use",
        remedy: "Wait",
        startsAt: "2026-10-29T13:00:00.000Z",
        endsAt: "2026-10-29T19:00:00.000Z",
        clearedAt: null,
      },
    ],
  };
});
const crowdedId = await renovation(crowded);
await crowded.agree(crowdedId, "z");
await crowded.service.startProjectConstruction(crowdedId, crowded.body(crowdedId), at("2026-10-29T12:00:00Z"));
const crowdedPeriods = crowded.get(crowdedId).lifecycle!.workOrder!.focus!.periods;
assert.equal(duration(crowdedPeriods), PROJECT_FOCUS_MS);
assert.ok(
  crowdedPeriods.every(
    (period) => period.endsAt <= "2026-10-29T13:00:00.000Z" || period.startsAt >= "2026-10-29T19:00:00.000Z",
  ),
  "allocation respects timed occupancy changes",
);
assert.notEqual(agendaAt(crowded.state().villagers.at(-1)!.agenda!, 840, now)?.commitmentId, crowdedId);

// Pause releases its allocation. A different willing lead finishes the remaining focus after Resume.
const pausedAt = at("2026-10-29T15:00:00Z");
await f.mutate((state) => pauseProject(state.projects[0], pausedAt.toISOString(), "Lead withdrew"));
assert.deepEqual(f.get(id).lifecycle!.workOrder!.focus!.periods, []);
assert.equal(f.get(id).lifecycle!.workOrder!.focus!.remainingMs, 5 * 3_600_000);
assert.equal(agendaAt(f.state().villagers[0].agenda!, 960, pausedAt)?.activity, "Ordinary work");
await f.agree(id, "b");
await f.service.resumeProject(id, f.body(id, { residentId: "b" }), at("2026-10-29T16:00:00Z"));
assert.equal(duration(f.get(id).lifecycle!.workOrder!.focus!.periods), 5 * 3_600_000);
assert.ok(f.get(id).lifecycle!.workOrder!.focus!.periods.every((period) => period.residentId === "b"));
assert.equal(agendaAt(f.state().villagers[1].agenda!, 960, pausedAt)?.commitmentId, id);
await f.service.cancelProject(id, f.body(id), at("2026-10-29T16:30:00Z"));
assert.deepEqual(f.get(id).lifecycle!.workOrder!.focus!.periods, []);
assert.equal(agendaAt(f.state().villagers[1].agenda!, 600, at("2026-10-30T10:00:00Z"))?.activity, "Ordinary work");

// A changed future essential duty replans or pauses.
const changed = await prepared();
const changedId = await changed.newProject();
await changed.service.startProjectConstruction(changedId, changed.body(changedId), now);
await changed.mutate((state) => {
  for (const blocks of [
    ...Object.values(state.villagers[0].agenda!.week!),
    ...Object.values(state.villagers[0].agenda!.routineProfile!.seedWeek!),
  ])
    blocks[1].essential = true;
  state.villagers[0].agenda!.plannedDays = {};
  reconcileProjectLifecycles(state, pausedAt);
});
assert.equal(changed.get(changedId).status, "paused");
assert.deepEqual(changed.get(changedId).lifecycle!.workOrder!.focus!.periods, []);
assert.equal(changed.get(changedId).lifecycle!.workOrder!.focus!.remainingMs, 5 * 3_600_000);

// Non-minute commands reserve only prospective whole minutes, consistently with Agenda resolution.
const fractional = fixture();
await fractional.mutate((state) => {
  state.timeZone = "UTC";
});
const fractionalId = await fractional.newProject();
const fractionalStart = at("2026-10-29T14:00:12Z");
await fractional.service.startProjectConstruction(fractionalId, fractional.body(fractionalId), fractionalStart);
const fractionalOrder = fractional.get(fractionalId).lifecycle!.workOrder!;
assert.equal(fractionalOrder.focus!.periods[0].startsAt, "2026-10-29T14:01:00.000Z");
assert.equal(fractionalOrder.focus!.periods[0].endsAt, "2026-10-29T20:01:00.000Z");
assert.notEqual(agendaAt(fractional.state().villagers[0].agenda!, 840, fractionalStart)?.commitmentId, fractionalId);
assert.equal(
  agendaAt(fractional.state().villagers[0].agenda!, 1200, at("2026-10-29T20:00:00Z"))?.commitmentId,
  fractionalId,
);
assert.notEqual(
  agendaAt(fractional.state().villagers[0].agenda!, 1201, at("2026-10-29T20:01:00Z"))?.commitmentId,
  fractionalId,
);

// Six hours means elapsed time, with a 24-hour deadline across either DST transition.
for (const start of ["2026-03-08T08:00:00Z", "2026-11-01T07:00:00Z", "2026-11-01T08:30:00Z"]) {
  const dst = fixture();
  await dst.mutate((state) => {
    state.timeZone = "America/Los_Angeles";
  });
  const dstId = await dst.newProject();
  await dst.service.startProjectConstruction(dstId, dst.body(dstId), new ZonedDate(start, "America/Los_Angeles"));
  const work = dst.get(dstId).lifecycle!.workOrder!;
  assert.equal(duration(work.focus!.periods), PROJECT_FOCUS_MS);
  assert.equal(Date.parse(work.completesAt) - Date.parse(start), 24 * 3_600_000);
  const effectiveAt = new ZonedDate(
    start.startsWith("2026-03") ? "2026-03-08T11:15:00Z" : "2026-11-01T10:15:00Z",
    "America/Los_Angeles",
  );
  const minute = effectiveAt.getHours() * 60 + effectiveAt.getMinutes();
  assert.equal(
    agendaAt(dst.state().villagers[0].agenda!, minute, effectiveAt)?.commitmentId,
    dstId,
    "effective Agenda retains work after the clock transition",
  );
  assert.equal(
    villagerPlaceView(dst.state(), dst.state().villagers[0], null, minute, effectiveAt)?.id,
    dst.get(dstId).venueId,
    "presence follows work after the clock transition",
  );
  if (start === "2026-11-01T08:30:00Z") {
    const earlier = new ZonedDate("2026-11-01T08:15:00Z", "America/Los_Angeles");
    assert.notEqual(
      agendaAt(dst.state().villagers[0].agenda!, 75, earlier)?.commitmentId,
      dstId,
      "fallback planning cannot rewrite the first occurrence's elapsed time",
    );
  }
}

// The shared composer admits social reservations only to free time, while focus can replace ordinary work.
const reservations = [
  {
    id: "meeting",
    source: "social" as const,
    dateKey: agendaDateKey(now),
    startMinute: 840,
    endMinute: 900,
    activity: "Meeting",
    venueId: "cafe",
    replaces: "flexible" as const,
  },
];
assert.equal(
  composeAgenda(routine, reservations).find((block) => block.startMinute === 840)?.activity,
  "Ordinary work",
);
assert.equal(
  composeAgenda(routine, [{ ...reservations[0], replaces: "routine" }]).find((block) => block.startMinute === 840)
    ?.activity,
  "Meeting",
);
assert.deepEqual(
  agendaBlocksFor(agenda, false, now),
  agendaBlocksFor(coerceVillageState({ ...future }).villagers[0].agenda!, false, now),
);
console.log("Agenda composition, protected time, Project focus, lifecycle, persistence, privacy and DST passed.");
