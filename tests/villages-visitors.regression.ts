import assert from "node:assert/strict";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { captureSceneAttendance } from "../packages/villages/src/server/domain/rules/scene-attendance.js";
import { applyVisitPreference, visitingCharacter } from "../packages/villages/src/server/domain/rules/visitors.js";
import { elapsed, socialWorldFixture, START } from "./fixtures/social-world.fixture.js";

const world = socialWorldFixture();
world.communityVenueId = world.venues[0].id;
world.visitors = world.villagers
  .splice(1)
  .map((person) => ({ ...person, visitsEnabled: true, visitsRevision: "initial" }));
const windows = Array.from({ length: 120 }, (_, i) => new Date(elapsed(i / 3)));
const existingWorld = { ...world };
delete existingWorld.visitors;
assert.equal(coerceVillageState(existingWorld).visitors, undefined);
const expected = windows.map((at) => visitingCharacter(world, at)?.characterId);
assert.deepEqual(
  windows.map((at) => visitingCharacter(coerceVillageState(world), at)?.characterId),
  expected,
);
assert(expected.some((id) => id === "b") && expected.some((id) => id === "c") && expected.includes(undefined));
const found = expected.findIndex(Boolean);
const attendance = captureSceneAttendance(world, world.communityVenueId, windows[found]);
assert.equal(attendance.occupants.find((person) => person.characterId === expected[found])?.zoneId, "exterior");
assert.equal(world.villagers.length, 1);

const visitor = world.visitors[0];
visitor.firstMetAt = START;
const first = { id: "message-1", at: elapsed(1) };
applyVisitPreference(visitor, "invite", first, elapsed(1));
const saved = structuredClone(visitor.visitPreference);
applyVisitPreference(visitor, "invite", { id: "message-2", at: elapsed(2) }, elapsed(2));
assert.equal(visitor.visitPreference?.until, saved?.until, "a repeat invitation cannot extend the window");
assert.equal(visitor.visitPreference?.sourceId, saved?.sourceId, "a repeat invitation cannot reroll");
applyVisitPreference(visitor, "space", { id: "message-older", at: elapsed(1.5) }, elapsed(2.5));
assert.equal(visitor.visitPreference?.kind, "invite", "an older reply cannot override the latest agreement");
applyVisitPreference(visitor, "space", { id: "message-3", at: elapsed(3) }, elapsed(3));
applyVisitPreference(visitor, "invite", first, elapsed(4));
assert.equal(visitor.visitPreference?.kind, "space");
assert(
  windows
    .filter((at) => at > new Date(elapsed(3)) && at < new Date(elapsed(10)))
    .every((at) => visitingCharacter(world, at)?.characterId !== visitor.characterId),
);
visitor.visitsEnabled = false;
assert(windows.every((at) => visitingCharacter(world, at)?.characterId !== visitor.characterId));
