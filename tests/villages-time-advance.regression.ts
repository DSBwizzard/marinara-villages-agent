import assert from "node:assert/strict";
import { developmentFixture } from "./fixtures/villages-development.fixture.js";
import { fixture as projectFixture } from "./fixtures/villages-projects.fixture.js";
import { createVillageClock } from "../packages/villages/src/server/adapters/time/clock-service.js";
import { configureVillageClock, villageNow } from "../packages/villages/src/server/adapters/time/clock-gate.js";
import { createWorldCoordination } from "../packages/villages/src/server/features/world/village-service.js";
import { createResidentAgendas } from "../packages/villages/src/server/features/residents/resident-agenda-service.js";
import { createVillageSnapshot } from "../packages/villages/src/server/features/world/snapshot-service.js";
import { createVillageStateService } from "../packages/villages/src/server/features/world/village-state-service.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { createDevelopment } from "../packages/villages/src/server/features/world/development-service.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
import { reconcileProjectLifecycles } from "../packages/villages/src/server/domain/rules/project-lifecycle-rules.js";
import { completeResidenceMove } from "../packages/villages/src/server/domain/rules/residence-move.js";
import { initializeDevelopment } from "../packages/villages/src/server/domain/rules/resident-development.js";
import { expireResidentWishes } from "../packages/villages/src/server/domain/rules/wish-lifecycle-rules.js";
import {
  captureSceneContinuity,
  sceneContinuityView,
} from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import {
  defaultRelationshipState,
  neutralRelationship,
  reconcileRelationships,
  relationshipKey,
} from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { agendaDateKey } from "../packages/villages/src/server/domain/rules/agenda-week.js";
import { readEncounter } from "../packages/villages/src/server/domain/rules/social-encounter.js";
import { villagePresence } from "../packages/villages/src/server/domain/rules/village-projections.js";
import { ZonedDate } from "../packages/villages/src/shared/helpers/zoned-date.js";
import type { VillageState, VillageSnapshot } from "../packages/villages/src/server/domain/models/world.js";
import type { VenueScene } from "../packages/villages/src/server/domain/models/scene-model.js";

const day = 86_400_000;
const start = Date.parse("2026-10-24T12:00:00Z");

async function fixture() {
  const state = developmentFixture();
  state.simulatedThrough = new Date(start).toISOString();
  state.backgroundPace = "off";
  initializeDevelopment(state, false, state.simulatedThrough);
  initializeDevelopment(state, true, state.simulatedThrough);
  const projects = projectFixture();
  const id = await projects.newProject();
  await projects.service.startProjectConstruction(id, projects.body(id), new Date(start));
  state.projects = structuredClone(projects.state().projects);
  state.venues.push(...structuredClone(projects.state().venues));
  for (const resident of state.villagers) {
    resident.agenda = unwrittenVillageAgenda(state.venues, resident.cardSnapshot.name, new Date(start));
    resident.agenda.personalizationPending = false;
  }
  state.villagers[0]!.agenda!.wishes = [
    {
      id: "wish",
      wish: "Take a walk",
      tell: "Boots ready",
      intensity: 1,
      addedAt: state.simulatedThrough,
      expiresAt: new Date(start + 3_600_000 * 3).toISOString(),
    },
  ];
  state.residences = [
    {
      characterId: "a",
      venueId: "home-a",
      proposedVenueId: "home-b",
      proposedPrivateZoneId: "",
      requestedAt: state.simulatedThrough,
      approvedAt: state.simulatedThrough,
      completesAt: new Date(start + day).toISOString(),
      status: "moving",
      requestedBy: "player",
      villagerDecision: "approved",
    },
  ];
  state.recollections = [
    {
      id: "passing",
      text: "Yesterday's weather",
      subjectCharacterIds: ["a"],
      knownByCharacterIds: ["a"],
      expiresAt: new Date(start + day).toISOString(),
      firstAt: state.simulatedThrough,
      lastReinforcedAt: state.simulatedThrough,
      reinforcementCount: 0,
      evidence: [],
    } as any,
  ];
  state.relationshipContext = defaultRelationshipState(state.seed);
  for (const to of ["b", "player"])
    state.relationshipContext.edges[relationshipKey("a", to)] = {
      ...neutralRelationship("a", to),
      warmth: 30,
      lastContactAt: state.simulatedThrough,
      decayAnchorAt: state.simulatedThrough,
    };
  const scene = {
    id: "existing",
    villageSeed: state.seed,
    startedAt: state.simulatedThrough,
    sceneAttendance: { capturedAt: state.simulatedThrough, occupants: [] },
    lines: [],
    submissions: [],
  } as unknown as VenueScene;
  scene.continuity = captureSceneContinuity(state, scene, start);
  const originalScene = structuredClone(scene);
  let wall = start;
  const repository = {
    readAuthority: async () => structuredClone(state),
    mutateAuthority: async (update: (state: VillageState) => unknown) => {
      const next = structuredClone(state);
      await update(next);
      Object.assign(state, next);
    },
  };
  const clock = createVillageClock(repository, { wall: () => wall, zone: () => "UTC" });
  const release = configureVillageClock(clock);
  await clock.observe();
  const readVillageState = async () => {
    reconcileRelationships(state.relationshipContext!, state, villageNow().getTime());
    return structuredClone(state);
  };
  const mutateVillageState = async (update: (state: VillageState) => void) => {
    const next = structuredClone(state);
    update(next);
    Object.assign(state, next);
    return structuredClone(state);
  };
  const agendas = createResidentAgendas({ readVillageState, mutateVillageState } as any);
  const reviews: any[] = [];
  const development = createDevelopment({
    readVillageState,
    mutateVillageState,
    backgroundJobSnapshot: async () => null,
    queueBackgroundJob: async (job: unknown) => {
      reviews.push(job);
    },
  } as any);
  const world = createWorldCoordination({
    readVillageState,
    mutateVillageState,
    buildVillageSnapshot: async (now = villageNow()) =>
      ({ village: { instant: now.toISOString() }, clock: await clock.observe() }) as VillageSnapshot,
    villagesLogger: () => ({ warn() {} }),
    completeVillageResidence: async (characterId: string, _force: boolean, now: Date) => {
      completeResidenceMove(state, characterId, false, now);
      return {} as VillageSnapshot;
    },
    reconcileProjectLifecycles,
    expireResidentWishes,
    rollActiveAgendas: agendas.rollActiveAgendas,
    reconcileDevelopment: development.reconcileDevelopment,
    respondDueVenueMail: async () => {},
    outsideVenueOperation: (work: () => void) => work(),
    preparePrivateSpaces: async () => {},
    retryResidencePrivateSpaceAdaptation: async () => {},
    backfillAgendas: async (value: VillageState) => value,
    refreshVillagerRemaps: async () => {},
    reconcileWishLifecycle: async () => {},
    listVillagerCards: async () => [],
  } as any);
  return {
    state,
    clock,
    repository,
    release,
    scene,
    originalScene,
    agendas,
    world,
    reviews,
    readVillageState,
    mutateVillageState,
    wall: (at: number) => {
      wall = at;
    },
  };
}

for (const duration of [90 * 60_000, day, 7 * day, 30 * day]) {
  const results: unknown[] = [];
  for (const advanced of [false, true]) {
    const f = await fixture();
    try {
      if (advanced) {
        const clock = await f.clock.observe();
        const notifications: string[] = [];
        const unsubscribe = f.clock.onAdvance!(() => notifications.push(f.state.simulatedThrough));
        await f.world.reconcileVillage({
          advanceTime: {
            worldId: clock.worldId!,
            revision: clock.revision,
            actionId: "time-test",
            milliseconds: duration,
          },
        });
        assert.equal(
          notifications.at(-1),
          new Date(start + duration).toISOString(),
          "Scheduler notification also runs after local catch-up commits.",
        );
        unsubscribe();
      } else {
        f.wall(start + duration);
        await f.world.reconcileVillage();
      }
      const state = f.state;
      const memories = await f.world.buildVillageMemories();
      assert.deepEqual(f.scene, f.originalScene, "Catch-up cannot rewrite an active Scene's capture.");
      assert.equal(sceneContinuityView(state, f.scene).residences[0]!.status, "moving");
      assert.equal(
        state.relationshipContext!.edges[relationshipKey("a", "player")]!.warmth,
        30,
        "Player absence cannot decay player feelings.",
      );
      assert.equal(state.villagers[0]!.agenda!.activeDay!.dateKey, agendaDateKey(new Date(start + duration)));
      assert.equal(state.residences[0]!.status, duration >= day ? "current" : "moving");
      assert.equal(state.villagers[0]!.agenda!.wishes.length, duration >= 3 * 3_600_000 ? 0 : 1);
      assert.equal(memories.recollections.length, duration >= day ? 0 : 1);
      assert.equal(
        f.reviews.length,
        duration >= day ? 1 : 0,
        "Normal due Pursuits admission runs during general catch-up.",
      );
      results.push({
        move: state.residences[0],
        wishes: state.villagers[0]!.agenda!.wishes,
        recollections: memories.recollections,
        project: state.projects.map((p) => [p.status, p.lifecycle?.phase, p.lifecycle?.completedAt]),
        npcWarmth: state.relationshipContext!.edges[relationshipKey("a", "b")]!.warmth,
        date: state.villagers[0]!.agenda!.activeDay!.dateKey,
        reviewThrough: f.reviews[0]?.input.review.through,
      });
    } finally {
      f.release();
    }
  }
  assert.deepEqual(
    results[1],
    results[0],
    "An offset and ordinary elapsed time have identical observable catch-up outcomes.",
  );
}

// Attendance and offscreen meetings use the Village timezone and advanced date.
{
  const f = await fixture();
  try {
    const state = f.state;
    state.timeZone = "America/Los_Angeles";
    const now = new ZonedDate("2026-11-02T18:00:00Z", state.timeZone);
    const cafe = state.venues.find((venue) => venue.id === "cafe")!;
    cafe.access!.visitorHours = [{ days: ["Monday"], start: "09:00", end: "17:00" }];
    for (const resident of state.villagers) {
      resident.ingestSchedule = false;
      resident.agenda!.activeDay = {
        dateKey: agendaDateKey(now),
        weekday: "Monday",
        scheduleInformed: false,
        blocks: [{ startMinute: 0, endMinute: 1440, venueId: cafe.id, zoneId: "common", activity: "Meeting friends" }],
      };
    }
    const positions = villagePresence(state, 600, now);
    assert.equal(positions.get("b")?.zoneId, "common", "An advanced opening-hour check uses Village civil time.");
    const opportunity = { id: "meeting", kind: "encounter", actorIds: ["a", "b"], venueId: cafe.id, zoneId: "common" };
    const entry = { id: "meeting-entry", at: now.toISOString(), opportunity } as any;
    const reply = {
      opportunityId: opportunity.id,
      lines: [
        { speakerId: "a", text: "The garden is coming along." },
        { speakerId: "b", text: "I will help with the planting." },
      ],
      relationshipReview: { changes: [], disclosures: [], permissions: [] },
    };
    assert.ok(
      readEncounter(reply, entry, state, now),
      "A future-dated meeting remains valid against advanced Village time.",
    );
    const closed = new ZonedDate("2026-11-03T03:00:00Z", state.timeZone);
    assert.notEqual(
      villagePresence(state, 1140, closed).get("b")?.zoneId,
      "common",
      "After-hours placement respects the same Village clock.",
    );
  } finally {
    f.release();
  }
}

// A stale snapshot cannot activate a day again after a concurrent advance.
{
  const f = await fixture();
  try {
    const old = await f.readVillageState();
    const before = await f.clock.observe();
    await f.clock.advance!({
      worldId: before.worldId!,
      revision: before.revision,
      actionId: "race",
      milliseconds: 7 * day,
    });
    const current = await f.clock.observe();
    const snapshot = createVillageSnapshot({
      readVillageState: async () => old,
      mutateVillageState: f.mutateVillageState,
      rollActiveAgendas: f.agendas.rollActiveAgendas,
      listVillagerCards: async () => [],
      sceneQueries: () => ({ activeVenueSession: async () => null }),
      backgroundWorkSummaries: async () => [],
      privatePreparationRooms: () => [],
    } as any);
    await snapshot.buildVillageSnapshot();
    assert.equal(
      f.state.villagers[0]!.agenda!.activeDay!.dateKey,
      "2026-10-31",
      "The new offset is never added twice to a stale world read.",
    );
    assert.equal(await f.agendas.rollActiveAgendas(new Date(start), old, before.revision), false);
    assert.equal(f.state.clock!.revision, current.revision);
  } finally {
    f.release();
  }
}
{
  const f = await fixture();
  try {
    const clock = await f.clock.observe();
    await f.clock.advance!({
      worldId: clock.worldId!,
      revision: clock.revision,
      actionId: "before-reset",
      milliseconds: 30 * day,
    });
    const stateService = createVillageStateService(
      f.repository as any,
      () =>
        ({
          readRelationshipState: async (seed: string) => defaultRelationshipState(seed),
          reconcileRelationships,
          persistRelationshipAuthority: async () => {},
        }) as any,
    );
    await stateService.mutateVillageState((state) => Object.assign(state, defaultVillageState()));
    assert.equal(
      f.state.foundedAt,
      new Date(start).toISOString(),
      "Reset stamps the new world's time, never the old world's advance.",
    );
    await f.clock.observe();
    assert.equal(f.clock.now().getTime(), start);
    assert.equal(f.state.clock?.advanceMs ?? 0, 0);
  } finally {
    f.release();
  }
}
console.log(
  "Village time matches ordinary absence across moves, construction, Wishes, memories, relationships, agendas, Pursuits and Scene continuity; concurrent snapshots and resets retain coherent time.",
);
