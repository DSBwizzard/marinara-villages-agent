import assert from "node:assert/strict";
import { clearFoundingAssignments } from "../packages/villages/src/client/features/founding/quick-start-drafts.js";
import { foundingAccess } from "../packages/villages/src/client/features/founding/founding-access.js";
import {
  assignFoundingHome,
  foundingSleepZones,
} from "../packages/villages/src/client/features/founding/founding-homes.js";
import { parsePlace } from "../packages/villages/src/server/domain/rules/founding-record.js";
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

const assigned = assignFoundingHome([clean], clean.id, "a", true)[0];
assert.deepEqual(assigned.residentIds, ["a"]);
assert.deepEqual(foundingAccess(assigned).managerIds, [], "Assigning a Home appoints no Venue operator");
assert.deepEqual(parsePlace(assigned).access!.managerIds, [], "Founding admission appoints no Venue operator");
const playerHome = assignFoundingHome([assigned], assigned.id, "player", true)[0];
assert.deepEqual(foundingAccess(playerHome).managerIds, [], "The player's Home grants no Venue appointment");
const operated = { ...playerHome, access: { ...foundingAccess(playerHome), managerIds: ["a"] } };
const removed = assignFoundingHome([operated], operated.id, "a", false)[0];
assert.deepEqual(foundingAccess(removed).managerIds, ["a"], "Leaving Home preserves an explicit operator");
assert.deepEqual(parsePlace(removed).access!.managerIds, ["a"]);
assert.deepEqual(operated.destinations, playerHome.destinations, "Assigning an operator preserves sleeping Zones");

const privateHome = {
  ...home,
  spaces: home.spaces!.map((zone) => ({ ...zone, access: { ...zone.access!, memberRoles: [] } })),
};
assert.equal(
  foundingSleepZones(privateHome, "player").some((zone) => zone.id === home.privateSpaces![0].id),
  false,
  "Founding does not infer passage authority from residency",
);
assert.equal(
  foundingSleepZones(
    { ...privateHome, access: { ...foundingAccess(privateHome), managerIds: ["player"] } },
    "player",
  ).some((zone) => zone.id === home.privateSpaces![0].id),
  true,
  "An explicit operator can use the general passage",
);
