import { manualHomesFixture } from "./helpers/founding-homes.fixture.js";
import assert from "node:assert/strict";
import { newSetupVenue } from "../packages/villages/src/client/features/founding/FoundingPanels.js";
import { addFoundingZone } from "../packages/villages/src/client/features/founding/founding-template.js";
import {
  assignFoundingHome,
  foundingSleepZones,
  reconcileFoundingHome,
  selectFoundingHomes,
} from "../packages/villages/src/client/features/founding/founding-homes.js";
import { parsePlace, parsePlaces } from "../packages/villages/src/server/domain/rules/founding-record.js";

const actors = [
  { id: "player", name: "Your" },
  { id: "a", name: "Ada" },
  { id: "b", name: "Bryn" },
];
let rows = manualHomesFixture(
  [],
  actors,
  actors.map((row) => row.id),
  "community",
);
for (const home of rows.filter((row) => row.occupancy.playerHome || !!row.residentIds?.length)) {
  const owner = home.occupancy.playerHome ? "player" : home.residentIds![0]!;
  assert.equal(home.spaces?.length, 1);
  assert.equal(home.privateSpaces?.length, 1);
  assert.equal(home.privateSpaces![0].ownerId, owner);
  assert.equal(home.privateSpaces![0].access!.mode, "permission-required");
  assert.deepEqual(home.privateSpaces![0].access!.memberIds, [owner]);
  assert.equal(home.destinations![owner].sleep, "private:base");
  assert.deepEqual(
    foundingSleepZones(home, owner).map((zone) => zone.id),
    ["common:base", "private:base"],
  );
}
const communityTemplate = rows.find((row) => row.id === "community")!;
assert.equal(communityTemplate.spaces?.length, 2);
assert.equal(communityTemplate.privateSpaces?.length, 0);
assert.ok(communityTemplate.spaces!.every((zone) => zone.access?.mode === "public" && !zone.ownerId));
// The remaining cases exercise a deliberately customized common-only player home.
rows[0] = reconcileFoundingHome({
  ...rows[0],
  layout: "common",
  spaces: rows[0].spaces!.map((zone) => ({ ...zone, connectedTo: ["exterior"] })),
  privateSpaces: [],
  destinations: { player: { home: "common:base", sleep: "common:base" } },
});
assert.ok(
  rows
    .filter((row) => row.occupancy.playerHome || !!row.residentIds?.length)
    .every((row) => row.destinations && Object.keys(row.destinations).length === 1),
);
rows = assignFoundingHome(rows, "founding-home:player", "a", true);
assert.equal(rows[0].destinations!.a.sleep, rows[0].spaces![0].id);
rows = assignFoundingHome(rows, "founding-home:a", "a", true);
rows[0] = reconcileFoundingHome({ ...rows[0] });
rows = assignFoundingHome(rows, rows[0].id, "a", true);
rows = assignFoundingHome(rows, "founding-home:a", "a", true);
rows[0] = reconcileFoundingHome({ ...rows[0] });
const before = JSON.stringify(rows);
assert.doesNotThrow(() => assignFoundingHome(rows, rows[0].id, "a", true));
assert.equal(JSON.stringify(rows), before, "Preparing a new household leaves the prior draft untouched");
rows[0] = reconcileFoundingHome({ ...rows[0] });
rows = assignFoundingHome(rows, rows[0].id, "a", true);
rows[0] = addFoundingZone(rows[0], true, "ada-room");
rows[0].privateSpaces![0].ownerId = "a";
rows[0].privateSpaces![0].access!.managerIds = ["a"];
rows[0].privateSpaces![0].access!.memberIds = ["a"];
rows[0].destinations!.a.sleep = "ada-room";
assert.equal(rows[0].destinations!.a.sleep, "ada-room");
assert.ok(
  foundingSleepZones(rows[0], "player").some((row) => row.id === "ada-room"),
  "Founding permits people to share a bedroom",
);
assert.equal(rows[0].privateSpaces![0].access!.managerIds![0], "a");
rows[0].privateSpaces![0].description = "Ada's blue quilt";
rows = assignFoundingHome(rows, "founding-home:a", "a", true);
assert.equal(rows[0].privateSpaces![0].description, "Ada's blue quilt");
assert.equal(rows[0].privateSpaces![0].ownerId, "");
assert.ok(
  foundingSleepZones(rows[0], "player").some((row) => row.id === "ada-room"),
  "A vacated bedroom remains an explicit sleeping choice",
);
rows = assignFoundingHome(rows, rows[0].id, "a", true);
assert.equal(rows[0].destinations!.a.sleep, "common:base");
rows[0].privateSpaces![0].ownerId = "a";
rows[0].privateSpaces![0].access = {
  mode: "permission-required",
  managerIds: ["a"],
  memberIds: ["a"],
  memberRoles: [],
  inviterIds: [],
  visitorHours: "always",
  accompanied: false,
};
rows[0].destinations!.a.sleep = "ada-room";
assert.equal(rows[0].destinations!.a.sleep, "ada-room");
const restored = JSON.parse(JSON.stringify(rows));
const placed = restored.map((row: any, index: number) => ({
  ...row,
  presentation: { ...row.presentation, x: 0.1 + index * 0.2, y: 0.5 },
}));
const establishedHome = parsePlace(placed[0]);
assert.equal(establishedHome.destinations!.a.sleep, "ada-room");
assert.equal(establishedHome.destinations!.player.sleep, "common:base");
assert.doesNotThrow(
  () => parsePlaces(placed, new Set(["a", "b"]), true),
  "Shared homes are valid Founding arrangements",
);
const personal = restored[0];
const throughCabin = {
  ...personal,
  presentation: placed[0].presentation,
  spaces: personal.spaces!.map((zone) => ({ ...zone, connectedTo: ["ada-room"] })),
  privateSpaces: personal.privateSpaces!.map((zone) => ({ ...zone, connectedTo: ["exterior", "common:base"] })),
};
assert.deepEqual(
  foundingSleepZones(throughCabin, "player").map((row) => row.id),
  ["ada-room"],
  "An inaccessible intermediate passage still blocks the common room",
);
const saved = restored.map((row: any, index: number) =>
  parsePlace({
    ...row,
    presentation: { ...row.presentation, x: 0.1 + index * 0.2, y: 0.5 },
  }),
);
assert.equal(saved[0].destinations!.a.sleep, "ada-room");
assert.equal("residenceCapacity" in saved[0], false);
assert.equal("foundingCapacity" in saved[0], false, "Setup choices do not leak into the saved-world contract");
for (const venue of saved)
  for (const zone of venue.zones!) {
    assert.equal(zone.observed?.description, zone.description, "Founding preserves every authored Zone appearance");
    assert.deepEqual(zone.observed?.image, zone.image);
    if (zone.kind !== "exterior" && zone.ownerId !== "player") assert.equal(zone.seen, false);
  }
const foundingImage = { id: "founding", ref: "global-gallery:founding", url: "/api/global-gallery/file/founding.png" };
const illustrated = parsePlace({
  ...restored[0],
  spaces: restored[0].spaces.map((zone: any) => ({ ...zone, image: foundingImage })),
});
assert.equal(illustrated.zones!.find((zone) => zone.image)?.observed?.image?.id, "founding");
const vacant = newSetupVenue("vacant", 0.4, 0.4);
const { draftZonePolicy } =
  await import("../packages/villages/src/client/features/founding/villages-founding-zones.js");
vacant.spaces![0].access = { ...draftZonePolicy(vacant, vacant.spaces![0]), mode: "permission-required" };
assert.equal(
  reconcileFoundingHome({ ...vacant, name: "Authored vacant house" }).spaces![0].access!.mode,
  "permission-required",
  "Unrelated edits preserve explicit access in an already-vacant home",
);
// Selecting people never creates places or assignments.
assert.deepEqual(selectFoundingHomes([], [], actors, "community").venues, []);
const beforeCleanup = structuredClone(rows);
const cleaned = selectFoundingHomes(rows, [], [actors[0], actors[2]], "community", ["a"]);
assert.equal(cleaned.venues.length, rows.length);
assert.ok(cleaned.venues.every((row) => !row.residentIds?.includes("a") && !row.workerIds?.includes("a")));
assert.deepEqual(rows, beforeCleanup);
const returning = selectFoundingHomes(cleaned.venues, [], actors, "community");
assert.deepEqual(returning.venues, cleaned.venues, "Returning people require an explicit assignment");
