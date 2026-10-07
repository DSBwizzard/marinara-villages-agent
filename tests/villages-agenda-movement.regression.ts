import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { agendaAt, agendaDayPlan, villageAgendaDay } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
import {
  agendaBlocksFor,
  agendaDateKey,
  completeAgendaWeek,
  legacyAgendaWeek,
  replaceRemainingAgendaDay,
  scheduleInformedWeek,
  workingAgendaWeek,
} from "../packages/villages/src/server/domain/rules/agenda-week.js";
import { villagerPlaceView } from "../packages/villages/src/server/domain/rules/village-projections.js";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type {
  VillageAgenda,
  VillageState,
  VillageVenue,
  VillageVillager,
} from "../packages/villages/src/server/domain/models/world.js";

function place(id: string, residentCharacterId: string | null = null): VillageVenue {
  return {
    id,
    name: id,
    category: "",
    presentation: { image: null, x: null, y: null },
    occupancy: { playerHome: false, residentCharacterId, homeKind: residentCharacterId ? "cottage" : null },
    capabilities: [],
    state: { condition: "", upgrades: [], furniture: [], publicFacts: [], updatedAt: "" },
  } as VillageVenue;
}

const venues = [place("home", "r1"), place("square"), place("garden")];
const week = workingAgendaWeek(venues, "Lina");
assert.equal(Object.keys(week).length, 7, "a resident has a plan for every weekday immediately");
for (const blocks of Object.values(week)) {
  assert.equal(blocks[0]?.startMinute, 0);
  assert.equal(blocks.at(-1)?.endMinute, 1440);
  for (let index = 1; index < blocks.length; index += 1) {
    assert.equal(blocks[index]?.startMinute, blocks[index - 1]?.endMinute, "every minute belongs to one block");
    assert.ok(blocks[index]?.reason, "every block has a reason");
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
  scheduleWeek: { ...week, Monday: repairedWeek.Monday! },
  activeDay: { dateKey: agendaDateKey(new Date()), weekday: "Monday", blocks: week.Monday!, scheduleInformed: false },
} as unknown as VillageAgenda;
assert.deepEqual(
  agendaBlocksFor(activeAgenda, true, new Date()),
  week.Monday,
  "turning schedule ingestion on cannot change today",
);
assert.deepEqual(
  agendaBlocksFor(activeAgenda, false, new Date()),
  week.Monday,
  "turning it off cannot change today either",
);
const migrated = legacyAgendaWeek(
  { day: [{ startMinute: 0, endMinute: 1440, venueId: "square", activity: "visiting the square" }] } as VillageAgenda,
  week,
);
assert.equal(migrated.Sunday?.[0]?.activity, "visiting the square", "legacy activity survives migration");
const informed = scheduleInformedWeek(
  week,
  {
    characterId: "r1",
    weekStart: "2026-09-21",
    routineSummary: "",
    talkativeness: null,
    days: { Monday: [{ time: "10:00-12:00", activity: "outer-world wording", status: "dnd" }] },
  },
  {
    weekStart: "2026-09-21",
    moves: [
      {
        day: "Monday",
        time: "10:00-12:00",
        activity: "outer-world wording",
        here: "meeting a neighbour",
        venueId: "square",
      },
    ],
    routine: "",
    signature: "",
    attempts: 1,
    generatedAt: "",
  },
);
assert.equal(informed.Monday?.find((part) => part.sourceTime === "10:00-12:00")?.activity, "meeting a neighbour");
assert.ok(!JSON.stringify(informed).includes("outer-world wording"), "native prose stays out of the Villages agenda");
const untranslatable = scheduleInformedWeek(
  week,
  {
    characterId: "r1",
    weekStart: "2026-09-21",
    routineSummary: "",
    talkativeness: null,
    days: { Monday: [{ time: "10:00-11:00", activity: "outer-world wording", status: "dnd" }] },
  },
  null,
);
assert.equal(untranslatable.Monday?.find((part) => part.sourceTime === "10:00-11:00")?.status, "dnd");
assert.ok(!JSON.stringify(untranslatable).includes("outer-world wording"));
const crowdedNative = scheduleInformedWeek(
  week,
  {
    characterId: "r1",
    weekStart: "2026-09-21",
    routineSummary: "",
    talkativeness: null,
    days: {
      Monday: Array.from({ length: 96 }, (_unused, index) => {
        const clock = (minute: number) =>
          `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
        return { time: `${clock(index * 15)}-${clock((index + 1) * 15)}`, activity: `source ${index}`, status: "dnd" };
      }),
    },
  },
  null,
);
assert.equal(
  crowdedNative.Monday?.filter((part) => part.sourceTime).length,
  96,
  "every native slot survives even when one day has more than 64 blocks",
);
const replacement = replaceRemainingAgendaDay(week.Monday!, repairedWeek.Monday!, 690);
assert.deepEqual(
  replacement.filter((part) => part.endMinute <= 690),
  week
    .Monday!.filter((part) => part.startMinute < 690)
    .map((part) => ({
      ...part,
      endMinute: Math.min(part.endMinute, 690),
    })),
  "elapsed agenda intervals stay intact during an immediate refresh",
);
assert.equal(
  replacement.find((part) => part.startMinute <= 690 && part.endMinute > 690)?.activity,
  "meeting a neighbour",
);
const overnight = scheduleInformedWeek(
  week,
  {
    characterId: "r1",
    weekStart: "2026-09-21",
    routineSummary: "",
    talkativeness: null,
    days: { Monday: [{ time: "22:00-06:00", activity: "outer-world night shift", status: "dnd" }] },
  },
  {
    weekStart: "2026-09-21",
    moves: [
      {
        day: "Monday",
        time: "22:00-06:00",
        activity: "outer-world night shift",
        here: "Keeping watch",
        venueId: "square",
      },
    ],
    routine: "",
    signature: "",
    attempts: 1,
    generatedAt: "",
  },
);
assert.equal(overnight.Monday?.at(-1)?.activity, "Keeping watch");
assert.equal(overnight.Tuesday?.[0]?.endMinute, 360, "an overnight source continues into the next day");
const recovered = coerceVillageState({
  wishSystemVersion: 3,
  villagers: [
    {
      characterId: "r1",
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
assert.equal(
  recovered.villagers[0]?.agenda?.day.length,
  4,
  "an older resident reads with a complete provisional agenda",
);
const day = villageAgendaDay(
  [
    { clock: "night", venue: 0, activity: "sleeping" },
    { clock: "morning", venue: 2, activity: "watering flowers" },
    { clock: "afternoon", venue: 1, activity: "reading in the square" },
    { clock: "evening", venue: 0, activity: "making supper" },
  ],
  venues.slice(1),
  "Lina",
);
assert.deepEqual(
  day.map((part) => part.venueId),
  ["", "garden", "square", ""],
);
assert.equal(agendaAt({ day } as VillageAgenda, 300)?.activity, "watering flowers");
assert.equal(agendaAt({ day } as VillageAgenda, 719)?.activity, "watering flowers");
assert.equal(agendaAt({ day } as VillageAgenda, 720)?.activity, "reading in the square");
assert.equal(agendaDayPlan({ day } as VillageAgenda, 540).find((part) => part.current)?.venueId, "garden");
assert.equal(villageAgendaDay(null, venues.slice(1), "Lina").length, 4, "an unparseable plan still covers the day");
assert.equal(
  villageAgendaDay([{ clock: "morning", venue: 99, activity: "walking" }], venues.slice(1), "Lina")[1]?.venueId,
  "",
  "a model cannot send somebody to a made-up venue",
);

const agenda = {
  wishes: [],
  routineSummary: "An ordinary day.",
  day,
  source: "village",
  generatedAt: "now",
} as VillageAgenda;
const villager = { characterId: "r1", agenda, remap: null } as VillageVillager;
const village = {
  foundedAt: "2026-09-01T00:00:00.000Z",
  seed: "testseed",
  venues,
  villagers: [villager],
} as VillageState;
assert.equal(villagerPlaceView(village, villager, null, 540)?.id, "garden");
assert.equal(villagerPlaceView(village, villager, null, 780)?.id, "square");
assert.equal(villagerPlaceView(village, villager, null, 1080)?.id, "home");
assert.equal(agendaAt(agenda, 540)?.activity, "watering flowers");
assert.equal(agendaDayPlan(agenda, 540).length, 4);

const venueSource = readFileSync(resolve("packages/villages/src/server/features/scenes/command-service.ts"), "utf8");
assert.match(venueSource, /const sceneAttendance = captureSceneAttendance\(village, placeId, new Date\(\)\)/u);
assert.match(venueSource, /activeIds: participants\.map\(\(person\) => person\.characterId\)/u);
assert.doesNotMatch(venueSource, /roomPresenceLines|repairRoomMirrors/u);
console.log("villages-agenda-movement: ok");
