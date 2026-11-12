import { venueFixture } from "./helpers/venues.fixture.js";
import assert from "node:assert/strict";
import { flexibleAgendaBlock } from "../packages/villages/src/server/domain/rules/agenda-flexibility.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type {
  VillageAgenda,
  VillageState,
  VillageVenue,
  VillageVillager,
} from "../packages/villages/src/server/domain/models/world.js";
import { agendaAt, unwrittenVillageAgenda } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
import {
  agendaBlocksFor,
  agendaDateKey,
  completeAgendaWeek,
  workingAgendaWeek,
} from "../packages/villages/src/server/domain/rules/agenda-week.js";
import { captureSceneAttendance } from "../packages/villages/src/server/domain/rules/scene-attendance.js";
import { villagerPlaceView } from "../packages/villages/src/server/domain/rules/village-projections.js";

function place(id: string, residentCharacterId: string | null = null): VillageVenue {
  return venueFixture({
    residentIds: [residentCharacterId].filter((id) => typeof id === "string" && !!id),
    classes: false || residentCharacterId ? ["residence"] : ["other"],
    id,
    name: id,
    category: "",
    presentation: { image: null, x: null, y: null },
    occupancy: { playerHome: false, residentCharacterId, homeKind: residentCharacterId ? "cottage" : null },
    capabilities: [],
  }) as VillageVenue;
}

const venues = [place("home", "r1"), place("square"), place("garden")];
const week = workingAgendaWeek();
assert.equal(Object.keys(week).length, 7, "a resident has a plan for every weekday immediately");
for (const blocks of Object.values(week)) {
  assert.equal(blocks[0]?.startMinute, 0);
  assert.equal(blocks.at(-1)?.endMinute, 1440);
  for (let index = 1; index < blocks.length; index += 1) {
    assert.equal(blocks[index]?.startMinute, blocks[index - 1]?.endMinute, "every minute belongs to one block");
    assert.ok(!("reason" in blocks[index]!), "agenda blocks have no reason captions");
  }
  assert.ok(blocks.length > 0, "a complete local fallback exists without model output");
  assert.ok(
    !blocks.some((block) => /sleep|meal|work|job/i.test(block.activity)),
    "fallback does not impose human physiology or employment",
  );
}
const repairedWeek = completeAgendaWeek(
  {
    Monday: [
      {
        startMinute: 600,
        endMinute: 720,
        venueId: "square",
        activity: "meeting a neighbour",
        reason: "To catch up",
        status: "online",
      },
      { startMinute: 650, endMinute: 800, venueId: "garden", activity: "overlapping", reason: "bad", status: "online" },
    ],
  },
  week,
  venues,
);
assert.equal(repairedWeek.Monday?.find((part) => part.activity === "meeting a neighbour")?.venueId, "square");
assert.ok(!repairedWeek.Monday?.some((part) => part.activity === "overlapping"), "overlaps cannot enter the agenda");
assert.equal(repairedWeek.Monday?.[0]?.startMinute, 0);
assert.equal(repairedWeek.Monday?.at(-1)?.endMinute, 1440);
const activeAgenda = {
  day: [],
  week,
  activeDay: { dateKey: agendaDateKey(new Date()), weekday: "Monday", blocks: week.Monday!, scheduleInformed: false },
} as unknown as VillageAgenda;
assert.deepEqual(
  agendaBlocksFor(activeAgenda, new Date()),
  week.Monday,
  "turning schedule ingestion on cannot change today",
);
assert.deepEqual(agendaBlocksFor(activeAgenda, new Date()), week.Monday, "turning it off cannot change today either");
const recovered = coerceVillageState({
  ...defaultVillageState(),

  villagers: [
    {
      letterFontId: "caveat",
      characterId: "r1",
      incarnation: "one",
      cardSnapshot: {
        id: "r1",
        revision: 1,
        sourceStatus: "available",
        name: "Lina",
        capturedAt: "2026-09-01T00:00:00.000Z",
      },
      agenda: null,
    },
  ],
});
assert.equal(recovered.villagers[0]?.agenda, null, "Reading a missing agenda cannot create a routine");
const provisional = unwrittenVillageAgenda();
assert.equal(provisional.day[0]!.startMinute, 0);
assert.equal(provisional.day.at(-1)!.endMinute, 1440, "Fresh provisional life covers the complete day without a model");
const day = [
  { startMinute: 0, endMinute: 300, venueId: "", activity: "sleeping" },
  { startMinute: 300, endMinute: 720, venueId: "garden", activity: "watering flowers" },
  { startMinute: 720, endMinute: 1020, venueId: "square", activity: "reading in the square" },
  { startMinute: 1020, endMinute: 1440, venueId: "", activity: "making supper" },
];
assert.equal(agendaAt({ day } as VillageAgenda, 300)?.activity, "watering flowers");
assert.equal(agendaAt({ day } as VillageAgenda, 719)?.activity, "watering flowers");
assert.equal(agendaAt({ day } as VillageAgenda, 720)?.activity, "reading in the square");

const agenda = {
  routineSummary: "An ordinary day.",
  day,
  source: "village",
  generatedAt: "now",
} as VillageAgenda;
const villager = { characterId: "r1", incarnation: "one", agenda } as VillageVillager;
const village = {
  foundedAt: "2026-09-01T00:00:00.000Z",
  seed: "testseed",
  venues,
  villagers: [villager],
} as VillageState;
assert.equal(villagerPlaceView(village, villager, 540)?.id, "garden");
assert.equal(villagerPlaceView(village, villager, 780)?.id, "square");
assert.equal(villagerPlaceView(village, villager, 1080)?.id, "home");
assert.equal(agendaAt(agenda, 540)?.activity, "watering flowers");

// A Scene is a snapshot: the live clock crosses the boundary without changing it.
const beforeSeven = new Date(2026, 9, 14, 6, 59);
const seven = new Date(2026, 9, 14, 7, 0);
villager.cardSnapshot = { name: "Lina" } as VillageVillager["cardSnapshot"];
agenda.activeDay = {
  dateKey: agendaDateKey(seven),
  weekday: "Wednesday",
  scheduleInformed: false,
  blocks: [
    { startMinute: 0, endMinute: 420, venueId: "square", activity: "Reading in the square", flexible: true },
    { startMinute: 420, endMinute: 1440, venueId: "garden", activity: "Watering flowers", flexible: false },
  ],
};
const captured = captureSceneAttendance(village, "square", beforeSeven);
const scene = coerceSession({
  version: 5,
  id: "clock-scene",
  villageSeed: village.seed,
  placeId: "square",
  zoneId: "community",
  status: "active",
  startedAt: beforeSeven.toISOString(),
  sceneAttendance: { ...captured, occupants: captured.occupants.map((row) => ({ ...row, availability: "offline" })) },
});
assert.equal(scene.sceneAttendance?.occupants[0]?.doing, "Reading in the square");
assert.ok(!("availability" in scene.sceneAttendance!.occupants[0]!));
assert.equal(villagerPlaceView(village, villager, 420, seven)?.id, "garden");
assert.equal(agendaAt(agenda, 420, seven)?.activity, "Watering flowers");
assert.equal(captureSceneAttendance(village, "square", seven).occupants.length, 0);
assert.equal(captureSceneAttendance(village, "garden", seven).occupants[0]?.doing, "Watering flowers");
assert.deepEqual(scene.sceneAttendance, captured, "existing Scene retains the original attendance/activity");

// Obsolete statuses cannot veto optional village time or grant committed time.
for (const status of ["online", "idle", "dnd", "offline", "away", "unknown", undefined]) {
  const old = {
    startMinute: 0,
    endMinute: 1440,
    venueId: "",
    activity: "Reading",
    flexible: true,
    status,
    reason: "To rest",
  };
  const normalized = completeAgendaWeek({ Monday: [old] }, week).Monday!;
  assert.ok(flexibleAgendaBlock(normalized[0]));
  assert.ok(!("status" in normalized[0]!));
  assert.ok(!("reason" in normalized[0]!));
  for (const protectedFields of [{ essential: true }, { commitmentId: "promised-work" }, { flexible: false }])
    assert.equal(flexibleAgendaBlock({ ...old, ...protectedFields }), false);
}
console.log("villages-agenda-movement: ok");
