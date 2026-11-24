import assert from "node:assert/strict";
import { clearFoundingAssignments } from "../packages/villages/src/client/features/founding/quick-start-drafts.js";
import { manualHomesFixture } from "./helpers/founding-homes.fixture.js";
const home = manualHomesFixture(
  [],
  [
    { id: "player", name: "Player" },
    { id: "a", name: "Ada" },
  ],
  [],
  "square",
)[0];
const before = structuredClone(home);
const clean = clearFoundingAssignments(home);
assert.deepEqual(home, before);
assert.deepEqual(clean.residentIds, []);
assert.equal(clean.occupancy.playerHome, false);
assert.deepEqual(clean.workerIds, []);
assert.deepEqual(clean.destinations, {});
assert.equal(clean.access, undefined);
assert.ok(
  clean.privateSpaces.every((zone) => !zone.ownerId && !zone.access.memberIds.length && !zone.access.inviterIds.length),
);
assert.equal(clean.privateSpaces[0].description, home.privateSpaces[0].description);
assert.deepEqual(clean.presentation, home.presentation);
