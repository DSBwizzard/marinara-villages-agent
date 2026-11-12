import { retainNativeFact } from "../packages/villages/src/server/domain/rules/native-continuity.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { continuityWishes } from "../packages/villages/src/server/domain/rules/continuity-library.js";
import {
  captureResidentNarration,
  acceptResidentNarration,
} from "../packages/villages/src/server/domain/rules/resident-narration.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { influenceSettings } from "../packages/villages/src/server/domain/rules/owned-routine.js";
import { residenceProposal } from "../packages/villages/src/server/domain/rules/residence-agreement.js";
import assert from "node:assert/strict";
import { configureVillageClock, villageNow } from "../packages/villages/src/server/adapters/time/clock-gate.js";
import { createVillageClock } from "../packages/villages/src/server/adapters/time/clock-service.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageSnapshot, VillageState } from "../packages/villages/src/server/domain/models/world.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
import { agendaDateKey } from "../packages/villages/src/server/domain/rules/agenda-week.js";
import { reconcileProjectLifecycles } from "../packages/villages/src/server/domain/rules/project-lifecycle-rules.js";
import { completeResidenceMove } from "../packages/villages/src/server/domain/rules/residence-move.js";
import {
  captureSceneContinuity,
  sceneContinuityView,
} from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { villagePresence } from "../packages/villages/src/server/domain/rules/village-projections.js";
import { createResidentAgendas } from "../packages/villages/src/server/features/residents/resident-agenda-service.js";
import { createVillageSnapshot } from "../packages/villages/src/server/features/world/snapshot-service.js";
import { createWorldCoordination } from "../packages/villages/src/server/features/world/village-service.js";
import { createVillageStateService } from "../packages/villages/src/server/features/world/village-state-service.js";
import { ZonedDate } from "../packages/villages/src/shared/helpers/zoned-date.js";
import { socialWorldFixture } from "./fixtures/social-world.fixture.js";
import { fixture as projectFixture } from "./fixtures/villages-projects.fixture.js";

const day = 86_400_000;
const start = Date.parse("2026-10-24T12:00:00Z");

async function fixture() {
  const state = socialWorldFixture();
  state.simulatedThrough = new Date(start).toISOString();
  state.backgroundPace = "off";
  const projects = projectFixture();
  const id = await projects.newProject();
  await projects.service.startProjectConstruction(id, projects.body(id), new Date(start));
  state.projects = structuredClone(projects.state().projects);
  state.venues.push(...structuredClone(projects.state().venues));
  for (const resident of state.villagers) {
    resident.agenda = unwrittenVillageAgenda(new Date(start));
    resident.agenda.personalizationPending = false;
  }
  retainNativeFact(
    state,
    { id: "wish", kind: "initialization", targetId: "a", revision: 1, text: "Take a walk together", witnesses: ["a"] },
    state.simulatedThrough,
    { class: "desire", owner: continuityActor(state, "a")!, about: ["a"] },
  );
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
  const move = residenceProposal(
    state,
    "a",
    state.venues.find((v) => v.id === "home-b")!,
    "player",
    state.simulatedThrough,
    "",
    "catchup-move",
  );
  move.agreement!.approvals = Object.fromEntries(move.agreement!.requiredIds.map((id) => [id, true]));
  state.residences = [
    { ...move, status: "moving", approvedAt: state.simulatedThrough, completesAt: new Date(start + day).toISOString() },
  ];
  retainNativeFact(
    state,
    {
      id: "memory",
      kind: "initialization",
      targetId: "a",
      revision: 1,
      text: "Yesterday's weather",
      witnesses: ["player", "a"],
    },
    state.simulatedThrough,
    { about: ["a"] },
  );
  const scene = coerceSession({
    version: 5,
    id: "existing",
    villageSeed: state.seed,
    placeId: "home-a",
    zoneId: "residence",
    status: "active",
    startedAt: state.simulatedThrough,
    sceneAttendance: {
      capturedAt: state.simulatedThrough,
      layout: captureSceneLayout(state.venues.find((row) => row.id === "home-a")!),
      occupants: [],
    },
    lines: [],
    submissions: [],
  });
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
    return structuredClone(state);
  };
  const mutateVillageState = async (update: (state: VillageState) => void) => {
    const next = structuredClone(state);
    update(next);
    Object.assign(state, next);
    return structuredClone(state);
  };
  const agendas = createResidentAgendas({ readVillageState, mutateVillageState } as any);
  const world = createWorldCoordination({
    readVillageAuthority: async () => structuredClone(state),
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
    rollActiveAgendas: agendas.rollActiveAgendas,
    respondDueVenueMail: async () => {},
    outsideVenueOperation: (work: () => void) => work(),
    preparePrivateSpaces: async () => {},
    retryResidencePrivateSpaceAdaptation: async () => {},
    queuePendingAgendas: async (value: VillageState) => value,
    refreshScheduleInfluence: async () => {},
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

      assert.equal(state.villagers[0]!.agenda!.activeDay!.dateKey, agendaDateKey(new Date(start + duration)));
      assert.equal(state.residences[0]!.status, duration >= day ? "current" : "moving");
      assert.equal(
        continuityWishes(state, "a", true, state.simulatedThrough).length,
        1,
        "Retained Wishes have no time expiry",
      );
      assert.equal(memories.total, 1, "Meaningful memory never expires during catch-up");
      results.push({
        move: state.residences[0],
        wishes: continuityWishes(state, "a", true, state.simulatedThrough),
        memories: memories.entries,
        project: state.projects.map((p) => [p.status, p.lifecycle?.phase, p.lifecycle?.completedAt]),
        continuity: state.continuity.records.flatMap((record) =>
          Object.values(record.heads).map((head) => ({
            holder: head.holder,
            current: head.current,
            text: state.continuity.versions.find((version) => version.id === head.versionId)!.text,
          })),
        ),
        date: state.villagers[0]!.agenda!.activeDay!.dateKey,
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
      resident.scheduleInfluence = influenceSettings({ ...resident.scheduleInfluence, enabled: false });
      resident.agenda!.activeDay = {
        dateKey: agendaDateKey(now),
        weekday: "Monday",
        scheduleInformed: false,
        blocks: [{ startMinute: 0, endMinute: 1440, venueId: cafe.id, zoneId: "common", activity: "Meeting friends" }],
      };
    }
    const positions = villagePresence(state, 600, now);
    assert.equal(positions.get("b")?.zoneId, "common", "An advanced opening-hour check uses Village civil time.");
    const opportunity = {
      id: "meeting",
      kind: "encounter" as const,
      actorIds: ["a", "b"],
      venueId: cafe.id,
      zoneId: "common",
      startsAt: now.toISOString(),
      endsAt: now.toISOString(),
      facts: [],
    };
    const capture = captureResidentNarration(state, opportunity);
    const result = acceptResidentNarration(
      state,
      capture,
      {
        encounter: {
          opportunityId: opportunity.id,
          lines: [
            { id: "hello", speakerId: "a", text: "Glad we could meet this morning." },
            { id: "answer", speakerId: "b", text: "There is time to talk before tending the garden." },
          ],
        },
        keep: [],
        requires: [],
      },
      memoryHash("advanced-meeting"),
      now.toISOString(),
    );
    assert.equal(result.held, false, "A native future-dated meeting uses captured Village civil time.");
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
    const stateService = createVillageStateService(f.repository as any);
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
  "Village time matches ordinary absence across moves, construction, common Wishes, memories, agendas and Scene continuity; concurrent snapshots and resets retain coherent time.",
);

for (const changed of ["continuity", "native"]) {
  const f = await fixture();
  try {
    const before = await f.clock.observe();
    const read = f.repository.readAuthority;
    let injected = false;
    f.repository.readAuthority = async () => {
      const state = await read();
      if (!injected) {
        injected = true;
        if (changed === "continuity")
          retainNativeFact(
            f.state,
            {
              id: "concurrent-note",
              kind: "initialization",
              targetId: "player",
              revision: 1,
              text: "A newly retained fact.",
              witnesses: ["player"],
            },
            new Date(start).toISOString(),
          );
        else f.state.venues[0].form = "A changed native building.";
      }
      return state;
    };
    await assert.rejects(
      f.world.reconcileVillage({
        advanceTime: {
          worldId: before.worldId!,
          revision: before.revision,
          actionId: "concurrent-" + changed,
          milliseconds: day,
        },
      }),
      /Village changed/,
    );
    assert.equal(f.state.clock?.advanceMs ?? 0, 0, "stale departure authority cannot commit a time advance");
    if (changed === "continuity")
      assert(f.state.continuity.versions.some((row) => row.text === "A newly retained fact."));
    else assert.equal(f.state.venues[0].form, "A changed native building.");
  } finally {
    f.release();
  }
}
