import assert from "node:assert/strict";
import {
  coerceRemap,
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { scheduleInformedWeek, workingAgendaWeek } from "../packages/villages/src/server/domain/rules/agenda-week.js";
import {
  lookupRemap,
  MAX_REMAP_ATTEMPTS,
  MAX_REMAP_FAILURE_LENGTH,
  proposeRemap,
  remapBlockKey,
  remapBlocks,
  VILLAGE_UNTRANSLATED_ACTIVITY,
} from "../packages/villages/src/server/domain/rules/native-remap.js";
import {
  MAX_REMAP_HERE_LENGTH,
  MAX_REMAP_MOVES,
  MAX_REMAP_SLOT_LENGTH,
} from "../packages/villages/src/server/domain/rules/prompt-preset.js";
import type { NativeWeekSchedule } from "../packages/villages/src/server/domain/rules/schedule-rules.js";

const schedule: NativeWeekSchedule = {
  characterId: "resident",
  weekStart: "2026-09-07",
  routineSummary: "Native source routine",
  talkativeness: null,
  days: {
    Monday: [
      { time: "08:00-09:00", activity: "aboard a spaceship", status: "dnd" },
      { time: "10:00-11:00", activity: "aboard a spaceship", status: "idle" },
    ],
    Tuesday: [{ time: "22:00-06:00", activity: "sleeping", status: "offline" }],
  },
};
assert.deepEqual(remapBlocks(schedule), [
  { day: "Monday", time: "08:00-09:00", activity: "aboard a spaceship" },
  { day: "Monday", time: "10:00-11:00", activity: "aboard a spaceship" },
  { day: "Tuesday", time: "22:00-06:00", activity: "sleeping" },
]);
assert.deepEqual(remapBlocks({ ...schedule, days: {} }), []);
assert.equal(remapBlockKey(" Monday ", " 08:00 - 09:00 "), "monday|08:00-09:00");
assert.notEqual(remapBlockKey("Mon day", "08:00-09:00"), remapBlockKey("Monday", "08:00-09:00"));
const saved = {
  weekStart: schedule.weekStart,
  signature: "retained-signature",
  foundingLens: "retained-lens",
  attempts: 1,
  generatedAt: "2026-09-07T00:00:00.000Z",
  routine: "Village routine",
  moves: [
    {
      day: "Monday",
      time: "08:00-09:00",
      activity: "aboard a spaceship",
      here: "working at the mill",
      venueId: "mill",
      zoneId: "common",
      wishId: "private-legacy-tag",
      flexible: true,
    },
    { day: " Monday ", time: "08:00 - 09:00", here: "duplicate slot" },
    { day: "Monday", time: "10:00-11:00", here: "visiting the square", venueId: "square" },
    { activity: "old phrase-only entry", here: "cannot identify a slot" },
    null,
  ],
};
const remap = coerceRemap(saved)!;
assert.equal(remap.moves.length, 2, "Saved slots are deduplicated; malformed and phrase-only moves are dropped");
assert.equal(remap.foundingLens, saved.foundingLens);
assert.equal(remap.signature, saved.signature);
assert.equal(remap.generatedAt, saved.generatedAt);
assert.equal(remap.moves[0].wishId, "private-legacy-tag", "Persisted compatibility fields remain readable");
assert.equal(lookupRemap(remap, remapBlockKey("Monday", "08:00-09:00")), "working at the mill");
assert.equal(lookupRemap(remap, remapBlockKey("Monday", "10:00-11:00")), "visiting the square");
for (const key of ["", "monday|09:00-10:00", "tuesday|08:00-09:00"]) assert.equal(lookupRemap(remap, key), "");
assert.equal(lookupRemap(null, "monday|08:00-09:00"), "");
assert.equal(lookupRemap({ ...remap, moves: [] }, "monday|08:00-09:00"), "");
assert.equal(VILLAGE_UNTRANSLATED_ACTIVITY, "at home");
const week = scheduleInformedWeek(workingAgendaWeek([], "Resident"), schedule, remap);
assert.equal(week.Monday.find((row) => row.startMinute === 480)?.activity, "working at the mill");
assert.equal(week.Monday.find((row) => row.startMinute === 600)?.activity, "visiting the square");
assert.equal(week.Tuesday.at(-1)?.startMinute, 1320);
assert.equal(week.Wednesday[0].endMinute, 360, "Overnight intervals retain their next-day portion");
assert(!JSON.stringify(week).includes("private-legacy-tag"), "Public plans never expose saved Wish tags");
assert(!JSON.stringify(week).includes("spaceship"), "Untranslated native activities do not become Village prose");
for (const [attempts, expected] of [
  [99, MAX_REMAP_ATTEMPTS],
  [-4, 0],
  [NaN, 0],
  [1.9, 1],
])
  assert.equal(coerceRemap({ ...saved, attempts })!.attempts, expected);
for (const invalid of [null, undefined, {}, { weekStart: " " }]) assert.equal(coerceRemap(invalid), null);
const legacy = coerceRemap({ weekStart: schedule.weekStart, moves: [] })!;
assert.equal(legacy.attempts, 0);
assert.equal(legacy.signature, "");
assert.equal(legacy.generatedAt, "");
const bounded = coerceRemap({
  ...saved,
  moves: [
    { day: "d".repeat(MAX_REMAP_SLOT_LENGTH + 10), time: "08:00-09:00", here: "h".repeat(MAX_REMAP_HERE_LENGTH + 10) },
  ],
})!;
assert.equal(bounded.moves[0].day.length, MAX_REMAP_SLOT_LENGTH);
assert.equal(bounded.moves[0].here.length, MAX_REMAP_HERE_LENGTH);
const capped = coerceRemap({
  ...saved,
  moves: Array.from({ length: MAX_REMAP_MOVES + 1 }, (_, index) => ({
    day: "Monday",
    time: String(index),
    here: "retained activity",
  })),
})!;
assert.equal(capped.moves.length, MAX_REMAP_MOVES);
const state = coerceVillageState({
  ...defaultVillageState(),
  villagers: [
    {
      characterId: "resident",
      addedAt: saved.generatedAt,
      cardSnapshot: {
        id: "resident",
        revision: 1,
        sourceStatus: "available",
        name: "Resident",
        capturedAt: saved.generatedAt,
      },
      remap: saved,
      remapFailure: { at: saved.generatedAt, message: "failure".repeat(MAX_REMAP_FAILURE_LENGTH) },
    },
  ],
});
assert.deepEqual(state.villagers[0].remap, remap);
assert.equal(state.villagers[0].remapFailure!.message.length, MAX_REMAP_FAILURE_LENGTH);
await assert.rejects(proposeRemap({} as any), /translation is retired/i);
console.log(
  "Retained schedule readers: exact slots, persisted limits, public projection and retired generation passed.",
);
