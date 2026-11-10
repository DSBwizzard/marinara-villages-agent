// Test cases: native-plans/admission, native-plans/attendance, native-plans/epochs, native-plans/stale, native-plans/availability, native-plans/project-priority, native-plans/round-trip, native-plans/continuity, native-plans/planner-publication
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { readResidentPlans } from "../packages/villages/src/server/domain/decoding/resident-plans-codec.js";
import type {
  VillageState,
  VillageAgenda,
  VillageProject,
} from "../packages/villages/src/server/domain/models/world.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import { agendaFixture } from "./helpers/agenda.fixture.js";
import { VILLAGE_WEEKDAYS } from "../packages/villages/src/server/domain/rules/village-clock.js";
import { agendaAt } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
import { agendaBlocksFor } from "../packages/villages/src/server/domain/rules/agenda-week.js";
import { villagePresence } from "../packages/villages/src/server/domain/rules/village-projections.js";
import {
  acceptSocialPlan,
  completeSocialPlan,
  reconcileSocialPlans,
  socialContinuationValid,
  socialPlanCandidates,
  socialPlanValid,
} from "../packages/villages/src/server/domain/rules/social-rules.js";
import {
  allocateProjectFocus,
  projectAgendaReservations,
} from "../packages/villages/src/server/domain/rules/project-focus.js";
import { arrangementActivityAt } from "../packages/villages/src/server/domain/rules/activity-arbitration.js";
import { normalizeVillageMutation } from "../packages/villages/src/server/domain/rules/world-mutation.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { continuityHolderKey, protectContinuity } from "../packages/villages/src/server/domain/rules/continuity.js";
import { retainNativeFact } from "../packages/villages/src/server/domain/rules/native-continuity.js";
import { createResidentPlanning } from "../packages/villages/src/server/features/residents/resident-planning-service.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { configureVillageClock } from "../packages/villages/src/server/adapters/time/clock-gate.js";

const at = "2026-11-10T08:00:00.000Z",
  now = new Date(at),
  date = "2026-11-10";
function fixture() {
  let state = defaultVillageState();
  Object.assign(state, {
    seed: "native-plans",
    setupAt: at,
    foundedAt: at,
    simulatedThrough: at,
    timeZone: "UTC",
    backgroundPace: "lively",
  });
  state.venues = [venueFixture({ id: "square", name: "Square", category: "public" })];
  const zone = state.venues[0].zones!.find((row) => row.kind !== "exterior")!.id;
  const block = {
    startMinute: 0,
    endMinute: 1440,
    venueId: "square",
    zoneId: "exterior",
    activity: "Free time",
    flexible: true,
  };
  state.villagers = ["a", "b"].map((id) => ({
    characterId: id,
    incarnation: "one",
    letterFontId: "caveat",
    addedAt: at,
    cardSnapshot: { id, name: id, revision: 1, capturedAt: at, sourceStatus: "available", tags: [] },
    wishes: [],
    agenda: agendaFixture({
      day: [],
      generatedAt: at,
      routineSummary: "An ordinary day",
      week: Object.fromEntries(VILLAGE_WEEKDAYS.map((day) => [day, [{ ...block }]])),
      activeDay: { dateKey: date, weekday: "Tuesday", blocks: [{ ...block }], scheduleInformed: false },
    }),
  })) as VillageState["villagers"];
  const candidates = socialPlanCandidates(state, now),
    plan = candidates.find((row) => row.kind === "meeting" && row.zoneId === zone)!;
  assert(plan, "one native feasible meeting must be offered without a relationship store");
  const accept = () => acceptSocialPlan(state, candidates, plan.id, now),
    during = new Date(
      date +
        "T" +
        String(Math.floor(plan.startMinute / 60)).padStart(2, "0") +
        ":" +
        String(plan.startMinute % 60).padStart(2, "0") +
        ":00.000Z",
    ),
    cold = () => {
      state = coerceVillageState(JSON.parse(JSON.stringify(state)));
      return state;
    };
  return {
    get state() {
      return state;
    },
    candidates,
    plan,
    zone,
    accept,
    during,
    cold,
  };
}

await runCase("native-plans/admission", () => {
  const f = fixture();
  acceptSocialPlan(f.state, f.candidates, undefined, now);
  assert.equal(f.state.residentPlans.selectedDate, "");
  assert.throws(() => acceptSocialPlan(f.state, f.candidates, "unoffered", now), /not offered/);
  assert.equal(f.state.residentPlans.selectedDate, "");
  f.accept();
  assert.equal(f.state.residentPlans.selectedDate, date);
  assert.equal(f.state.residentPlans.plans.length, 1);
  assert.equal(socialPlanCandidates(f.state, now).length, 0);
  f.state.residentPlans.plans[0].status = "cancelled";
  const before = structuredClone(f.state);
  f.accept();
  assert.deepEqual(f.state, before, "exact acceptance replay does not revive cancelled native authority");
  f.state.residentPlans.selectedDate = "2026-11-11";
  assert.equal(socialPlanCandidates(f.state, now).length, 0, "an older date cannot regain a consumed plan allowance");
});

await runCase("native-plans/attendance", () => {
  const f = fixture();
  f.accept();
  f.cold();
  const a = f.state.villagers[0];
  assert.equal(agendaAt(a.agenda, f.plan.startMinute, f.during)?.commitmentId, f.plan.id);
  assert.equal(villagePresence(f.state, f.plan.startMinute, f.during).get("a")?.zoneId, f.zone);
  assert(socialContinuationValid(f.state, f.plan.id, f.plan, f.during));
  completeSocialPlan(f.state, f.plan, ["a", "b"], "square", f.zone, f.during);
  f.cold();
  assert.equal(f.state.residentPlans.plans[0].status, "completed");
  f.state.villagers[0].agenda!.week!.Tuesday![0].activity = "A different free routine";
  projectAgendaReservations(f.state);
  assert.equal(
    agendaAt(f.state.villagers[0].agenda, f.plan.endMinute - 1, f.during)?.commitmentId,
    f.plan.id,
    "accepted encounter retains its remaining shared time",
  );
  assert.equal(agendaAt(f.state.villagers[0].agenda, f.plan.endMinute, f.during)?.commitmentId, undefined);
  assert.equal(socialContinuationValid(f.state, f.plan.id, f.plan, f.during), false);
});

await runCase("native-plans/epochs", () => {
  const f = fixture();
  f.accept();
  f.state.villagers[0].incarnation = "replacement";
  projectAgendaReservations(f.state);
  assert(
    f.state.villagers.every((resident) => !resident.agenda?.reservations?.some((row) => row.id === f.plan.id)),
    "neither participant keeps a meeting with a replaced actor",
  );
  assert.equal(arrangementActivityAt(f.state, f.during), null);
  assert.equal(socialContinuationValid(f.state, f.plan.id, f.plan, f.during), false);
  assert.throws(
    () => completeSocialPlan(f.state, f.plan, ["a", "b"], "square", f.zone, f.during),
    /required free-time plan/,
  );
  assert(reconcileSocialPlans(f.state, now));
  f.cold();
  assert.equal(f.state.residentPlans.plans[0].actors[0].incarnation, "one");
  assert.equal(f.state.residentPlans.plans[0].status, "cancelled");
});

await runCase("native-plans/stale", () => {
  for (const change of ["missing", "cancelled", "timing", "routine", "place", "cast"]) {
    const f = fixture();
    f.accept();
    if (change === "missing") f.state.residentPlans.plans = [];
    if (change === "cancelled") f.state.residentPlans.plans[0].status = "cancelled";
    if (change === "timing") f.state.residentPlans.plans[0].endMinute++;
    if (change === "routine") f.state.villagers[0].agenda!.week!.Tuesday![0].activity = "Different owned routine";
    const before = structuredClone(f.state);
    assert.throws(
      () =>
        completeSocialPlan(
          f.state,
          f.plan,
          change === "cast" ? ["a"] : ["a", "b"],
          change === "place" ? "elsewhere" : "square",
          f.zone,
          f.during,
        ),
      /required free-time plan/,
    );
    assert.deepEqual(f.state, before);
  }
  const f = fixture(),
    before = structuredClone(f.state);
  assert.throws(
    () => acceptSocialPlan(f.state, f.candidates, f.plan.id, new Date(f.during.getTime() + 60_000)),
    /authority changed/,
  );
  assert.deepEqual(f.state, before, "late acceptance cannot move the offered date or interval");
});

await runCase("native-plans/availability", () => {
  const f = fixture(),
    agenda = f.state.villagers[0].agenda!;
  agenda.activeDay!.blocks = [
    { ...agenda.activeDay!.blocks[0], endMinute: f.plan.startMinute + 10 },
    { ...agenda.activeDay!.blocks[0], startMinute: f.plan.startMinute + 11 },
  ];
  assert.equal(socialPlanValid(f.state, f.plan, now), false, "a one-minute uncovered gap invalidates the full group");
  const g = fixture(),
    zone = g.state.venues[0].zones!.find((row) => row.id === g.zone)!;
  const closes = g.plan.startMinute + 30;
  zone.access!.visitorHours = [
    {
      days: ["Tuesday"],
      start: "00:00",
      end: String(Math.floor(closes / 60)).padStart(2, "0") + ":" + String(closes % 60).padStart(2, "0"),
    },
  ];
  assert.equal(socialPlanValid(g.state, g.plan, now), false, "access must cover the entire proposed interval");
  const h = fixture();
  h.state.villagers.push(
    ...Array.from({ length: 3 }, (_, index) => ({
      ...structuredClone(h.state.villagers[0]),
      characterId: "other-" + index,
      cardSnapshot: { ...h.state.villagers[0].cardSnapshot, id: "other-" + index },
      agenda: {
        ...structuredClone(h.state.villagers[0].agenda!),
        activeDay: {
          ...h.state.villagers[0].agenda!.activeDay!,
          blocks: [
            {
              startMinute: 0,
              endMinute: 1440,
              venueId: "square",
              zoneId: h.zone,
              activity: "Ordinary activity",
              flexible: true,
            },
          ],
        },
      },
    })),
  );
  assert.equal(
    socialPlanValid(h.state, h.plan, now),
    false,
    "group capacity is atomic, not two separately successful entries",
  );
});

await runCase("native-plans/project-priority", () => {
  const f = fixture();
  f.accept();
  assert.equal(arrangementActivityAt(f.state, f.during), f.during.getTime());
  completeSocialPlan(f.state, f.plan, ["a", "b"], "square", f.zone, f.during);
  f.state.villagers[0].agenda!.week!.Tuesday![0].activity = "Another free routine";
  const project = {
    id: "project",
    title: "A porch",
    venueId: "square",
    lifecycle: { builderId: "a", workOrder: { completesAt: "2026-11-10T18:00:00.000Z" } },
  } as VillageProject;
  const focus = allocateProjectFocus(f.state, project, now);
  assert(focus.periods.length);
  for (const period of focus.periods)
    assert(
      Date.parse(period.endsAt) <= f.during.getTime() ||
        Date.parse(period.startsAt) >= f.during.getTime() + (f.plan.endMinute - f.plan.startMinute) * 60_000,
      "new Project focus cannot consume accepted shared time",
    );
  assert.equal(
    arrangementActivityAt(f.state, f.during),
    null,
    "completed encounters do not buy a second planning request",
  );
  const g = fixture();
  g.state.projects = [
    {
      ...project,
      lifecycle: {
        ...project.lifecycle!,
        workOrder: {
          ...project.lifecycle!.workOrder!,
          focus: {
            remainingMs: 60 * 60_000,
            periods: [
              {
                residentId: "a",
                startsAt: g.during.toISOString(),
                endsAt: new Date(g.during.getTime() + 60 * 60_000).toISOString(),
              },
            ],
          },
        },
      },
    },
  ];
  assert.equal(
    socialPlanValid(g.state, g.plan, now),
    false,
    "an existing hard Project reservation also blocks new social admission",
  );
});

await runCase("native-plans/round-trip", () => {
  const f = fixture();
  f.accept();
  f.cold();
  assert.deepEqual(f.state.residentPlans.plans[0], f.plan);
  const raw = JSON.parse(JSON.stringify(f.state));
  delete raw.residentPlans;
  assert.throws(() => coerceVillageState(raw), /continuity data is missing/);
  for (const malformed of [
    { ...f.state.residentPlans, plans: [{ ...f.plan, reason: "duplicate fictional meaning" }] },
    { ...f.state.residentPlans, plans: [{ ...f.plan, actors: [{ id: "player", incarnation: "invented" }] }] },
    { ...f.state.residentPlans, selectedDate: "2026-02-30" },
  ])
    assert.throws(() => readResidentPlans(malformed));
  f.state.backgroundPace = "off";
  assert(reconcileSocialPlans(f.state, now));
  projectAgendaReservations(f.state);
  assert.equal(f.state.residentPlans.plans[0].status, "cancelled");
  assert(!f.state.villagers[0].agenda!.reservations!.length);
  f.state.backgroundPace = "lively";
  assert.equal(socialPlanCandidates(f.state, now).length, 0, "Pace Off does not refund the day's selected plan");
});

await runCase("native-plans/continuity", () => {
  const f = fixture();
  f.accept();
  const actor = continuityActor(f.state, "a")!;
  retainNativeFact(
    f.state,
    {
      id: "founding-wish",
      kind: "initialization",
      targetId: "a",
      revision: 1,
      text: "I want to see the fair.",
      witnesses: ["a"],
    },
    at,
    { class: "desire", owner: actor },
  );
  const record = f.state.continuity.records[0],
    key = continuityHolderKey(actor),
    before = structuredClone(f.state.residentPlans);
  normalizeVillageMutation(
    f.state,
    (state) => {
      state.continuity = protectContinuity(
        state.continuity,
        { id: record.id, recordRevision: record.revision, heads: { [key]: record.heads[key].revision } },
        [actor],
        "forget-wish",
        at,
        { forget: true },
      );
    },
    { now: () => now, seed: () => "event" },
  );
  assert.deepEqual(
    f.state.residentPlans,
    before,
    "Forget changes eligible fiction, not an already accepted native schedule",
  );
  assert.equal(
    agendaBlocksFor(f.state.villagers[0].agenda as VillageAgenda, f.during).find(
      (block) => block.commitmentId === f.plan.id,
    )?.zoneId,
    f.zone,
  );
});

await runCase("native-plans/planner-publication", async () => {
  const f = fixture(),
    rows = new Map<string, any>();
  let loseAcknowledgement = false;
  const documents: any = {
    async getById(_pkg: string, id: string) {
      return structuredClone(rows.get(id) ?? null);
    },
    async list(_pkg: string, kind: string) {
      return [...rows.values()].filter((row) => row.kind === kind).map((row) => structuredClone(row));
    },
    async create(input: any) {
      assert(!rows.has(input.id));
      const row = { ...structuredClone(input), revision: 1 };
      rows.set(row.id, row);
      return structuredClone(row);
    },
    async update(input: any) {
      const before = rows.get(input.id);
      if (!before || before.revision !== input.expectedRevision) return null;
      const row = { ...before, ...structuredClone(input), revision: before.revision + 1 };
      rows.set(row.id, row);
      if (input.id === "villages-village" && loseAcknowledgement) {
        loseAcknowledgement = false;
        throw Error("injected lost root acknowledgement");
      }
      return structuredClone(row);
    },
    async remove(_pkg: string, id: string, revision: number) {
      return rows.get(id)?.revision === revision && rows.delete(id);
    },
  };
  const repository = () => createVillageRepository(() => documents),
    releaseClock = configureVillageClock({
      now: () => now,
      observe: async () => {
        throw Error("no runtime clock operation");
      },
    });
  try {
    await repository().mutateAuthority((state) => Object.assign(state, f.state), { memories: true });
    const service = createResidentPlanning({} as any),
      input = {
        dateKey: date,
        now: at,
        opportunity: { id: "native-opportunity", actorIds: ["a", "b"] },
        context: { social: { candidates: f.candidates }, residents: [] },
      },
      proposal = { social: { planId: f.plan.id }, housingRequests: [] };
    loseAcknowledgement = true;
    await assert.rejects(
      repository().mutateAuthority((state) => service.handler.apply!(state, input, proposal), { memories: true }),
      /lost root acknowledgement/,
    );
    const cold = await repository().readAuthority({ memories: true });
    assert.equal(cold.residentPlans.plans[0].id, f.plan.id);
    assert(cold.processedActionIds.includes(input.opportunity.id));
    assert(!cold.socialOutbox?.length, "native plan selection creates no fictional settlement outbox");
    await repository().mutateAuthority((state) => service.handler.apply!(state, input, proposal), { memories: true });
    const replayed = await repository().readAuthority({ memories: true });
    assert.deepEqual(replayed.residentPlans, cold.residentPlans);
    assert.equal(replayed.planningUsage.count, 1, "saved result replay never consumes another plan opportunity");
  } finally {
    releaseClock();
  }
});
