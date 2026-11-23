import assert from "node:assert/strict";
import { newSetupVenue } from "../packages/villages/src/client/features/founding/FoundingPanels.js";
import { addFoundingZone } from "../packages/villages/src/client/features/founding/founding-template.js";
import {
  assignFoundingHome,
  foundingSleepZones,
  reconcileFoundingHome,
  reconcileFoundingRoster,
  selectFoundingHomes,
} from "../packages/villages/src/client/features/founding/founding-homes.js";
import { parsePlace, parsePlaces } from "../packages/villages/src/server/domain/rules/founding-record.js";

const actors = [
  { id: "player", name: "Your" },
  { id: "a", name: "Ada" },
  { id: "b", name: "Bryn" },
];
{
  let reused = reconcileFoundingRoster(
    [],
    actors,
    actors.map((actor) => actor.id),
    "community",
  );
  reused = assignFoundingHome(reused, "founding-home:player", "a", true);
  reused = assignFoundingHome(reused, "founding-home:a", "b", true);
  reused = reused.map((home) =>
    home.id === "founding-home:a" ? reconcileFoundingHome({ ...home, foundingCapacity: 1 }) : home,
  );
  reused = reconcileFoundingRoster(
    reused,
    actors.filter((actor) => actor.id !== "a"),
    [],
    "community",
  );
  const restoredRoster = reconcileFoundingRoster(reused, actors, ["a"], "community");
  assert.deepEqual(restoredRoster.find((home) => home.id === "founding-home:a")!.residentIds, ["b"]);
  assert.ok(
    restoredRoster.every((home) => !home.residentIds?.includes("a")),
    "Re-adding someone never displaces an occupied full home or crashes setup",
  );
}
let rows = reconcileFoundingRoster(
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
assert.equal(rows[0].residenceCapacity, 2);
assert.equal(rows[0].destinations!.a.sleep, rows[0].spaces![0].id);
rows = assignFoundingHome(rows, "founding-home:a", "a", true);
assert.equal(rows[0].residenceCapacity, 1, "Automatic capacity shrinks with the household");
rows[0] = reconcileFoundingHome({ ...rows[0], foundingCapacity: 3 });
rows = assignFoundingHome(rows, rows[0].id, "a", true);
rows = assignFoundingHome(rows, "founding-home:a", "a", true);
assert.equal(rows[0].residenceCapacity, 3, "A deliberately chosen capacity survives moves");
rows[0] = reconcileFoundingHome({ ...rows[0], foundingCapacity: 1 });
const before = JSON.stringify(rows);
assert.throws(() => assignFoundingHome(rows, rows[0].id, "a", true), /full/);
assert.equal(JSON.stringify(rows), before, "A full fixed home does not evict or partly move anyone");
rows[0] = reconcileFoundingHome({ ...rows[0], foundingCapacity: null });
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
assert.equal(restored[0].foundingCapacity, null);
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
assert.equal(saved[0].residenceCapacity, 2);
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
const retained = { ...newSetupVenue("existing", 0.1, 0.1, true), residenceCapacity: 3 };
const vacant = newSetupVenue("vacant", 0.4, 0.4);
const { draftZonePolicy } =
  await import("../packages/villages/src/client/features/founding/villages-founding-zones.js");
vacant.spaces![0].access = { ...draftZonePolicy(vacant, vacant.spaces![0]), mode: "permission-required" };
assert.equal(
  reconcileFoundingHome({ ...vacant, name: "Authored vacant house" }).spaces![0].access!.mode,
  "permission-required",
  "Unrelated edits preserve explicit access in an already-vacant home",
);
delete retained.foundingCapacity;
const { quickStartTemplates } = await import("../packages/villages/src/client/features/founding/quick-start-drafts.js");
assert.equal(
  quickStartTemplates([retained])[0].foundingCapacity,
  undefined,
  "Recovering an admitted template preserves an existing draft's fixed capacity semantics",
);
assert.equal(quickStartTemplates([{ ...retained, foundingCapacity: 3 }])[0].foundingCapacity, 3);
assert.equal(
  reconcileFoundingHome(retained).residenceCapacity,
  3,
  "An existing draft retains an unknown capacity choice until explicitly set to Automatic",
);
const starting = selectFoundingHomes([], [], actors, "community");
const sharedVenue = starting.venues.find((venue) => venue.id === "founding-garden")!;
sharedVenue.name = "The riverside garden";
sharedVenue.description = "A garden with benches beneath a willow.";
sharedVenue.presentation = { ...sharedVenue.presentation, x: 0.18, y: 0.72 };
const sharedBefore = structuredClone(sharedVenue);
const singleSharedDraft = starting.venues.filter((venue) => venue !== sharedVenue);
const completedShared = selectFoundingHomes(singleSharedDraft, [], actors, "community");
assert.equal(
  completedShared.venues.filter((venue) => !(venue.occupancy.playerHome || !!venue.residentIds?.length)).length,
  2,
);
assert.deepEqual(
  completedShared.venues.filter((venue) => singleSharedDraft.some((prior) => prior.id === venue.id)),
  singleSharedDraft,
  "Completing an older single-Community draft preserves every existing Venue and pin",
);
const authored = starting.venues.find((venue) => venue.id === "founding-home:a")!;
authored.name = "Ada's canal loft";
authored.privateSpaces![0].description = "Ada's blue quilt.";
authored.presentation = { ...authored.presentation, x: 0.37, y: 0.62 };
authored.description = "A carefully furnished home.";
authored.privateSpaces![0].purpose = "Rest and quilting";
const replacementActors = [actors[0]!, actors[2]!, { id: "c", name: "Cleo" }];
const replacement = selectFoundingHomes(starting.venues, starting.unusedHomes, replacementActors, "community");
assert.deepEqual(
  replacement.venues.find((venue) => venue.id === sharedVenue.id),
  sharedBefore,
);
assert.equal(
  replacement.venues.some((venue) => venue.id === authored.id),
  false,
);
assert.deepEqual(replacement.unusedHomes, [authored]);
const returned = selectFoundingHomes(replacement.venues, replacement.unusedHomes, actors, "community");
assert.deepEqual(
  returned.venues.find((venue) => venue.id === authored.id),
  authored,
);
assert.equal(returned.venues.find((venue) => venue.id === authored.id)!.destinations!.a.sleep, "private:base");
let cycled = returned;
for (let i = 0; i < 3; i++) {
  cycled = selectFoundingHomes(cycled.venues, cycled.unusedHomes, replacementActors, "community", ["a"]);
  const saved = JSON.parse(JSON.stringify(cycled));
  assert.equal(saved.unusedHomes.filter((venue: { id: string }) => venue.id === authored.id).length, 1);
  cycled = selectFoundingHomes(saved.venues, saved.unusedHomes, actors, "community", ["c"]);
  assert.deepEqual(
    cycled.venues.find((venue) => venue.id === authored.id),
    authored,
  );
  assert.equal(
    new Set([...cycled.venues, ...cycled.unusedHomes].map((venue) => venue.id)).size,
    cycled.venues.length + cycled.unusedHomes.length,
  );
}
const mixed = structuredClone(authored);
mixed.id = "canal-workshop";
mixed.workerIds = ["a"];
mixed.spaces![0].controllerIds = ["a", "b"];
mixed.spaces![0].access = {
  mode: "permission-required",
  managerIds: ["a", "b"],
  memberIds: ["a", "visitor"],
  memberRoles: [],
  inviterIds: ["a", "b"],
  visitorHours: "inherit",
  accompanied: false,
};
mixed.destinations = { ...mixed.destinations, a: { ...mixed.destinations!.a, work: mixed.spaces![0].id } };
const sharedHome = reconcileFoundingHome({ ...structuredClone(authored), id: "shared-loft", foundingCapacity: null }, [
  "a",
  "b",
]);
const legacy = selectFoundingHomes(
  [...starting.venues.filter((venue) => venue.id !== authored.id), mixed, sharedHome],
  [],
  replacementActors,
  "community",
  ["a"],
);
assert.equal(legacy.unusedHomes.length, 0, "Mixed-use and shared places never enter the single-owner home cache");
const workshop = legacy.venues.find((venue) => venue.id === mixed.id)!;
assert.equal(workshop.name, mixed.name);
assert.equal(workshop.description, mixed.description);
assert.deepEqual(workshop.presentation, mixed.presentation);
assert.deepEqual(workshop.residentIds, []);
assert.deepEqual(workshop.workerIds, []);
assert.equal(workshop.destinations!.a, undefined);
assert.deepEqual(workshop.spaces![0].controllerIds, ["b"]);
assert.deepEqual(workshop.spaces![0].access!.managerIds, ["b"]);
assert.deepEqual(workshop.spaces![0].access!.memberIds, ["visitor"]);
assert.deepEqual(workshop.spaces![0].access!.inviterIds, ["b"]);
assert.equal(workshop.privateSpaces![0].ownerId, "");
assert.equal(workshop.privateSpaces![0].access, undefined);
assert.deepEqual(legacy.venues.find((venue) => venue.id === sharedHome.id)!.residentIds, ["b"]);
assert.ok(
  legacy.venues.some((venue) => venue.residentIds?.includes("c")),
  "New founders still receive a home in legacy drafts",
);
const legacyArchive = { ...authored, id: "founding-home:c" };
const invitedHome = structuredClone(authored);
invitedHome.spaces![0].controllerIds = ["a", "b"];
invitedHome.spaces![0].access = {
  mode: "permission-required",
  managerIds: ["a", "b"],
  memberIds: ["b", "visitor"],
  memberRoles: [],
  inviterIds: ["b"],
  visitorHours: "inherit",
  accompanied: false,
};
const archivedInvitation = selectFoundingHomes(
  starting.venues.map((venue) => (venue.id === authored.id ? invitedHome : venue)),
  [],
  replacementActors,
  "community",
  ["a"],
);
assert.deepEqual(archivedInvitation.unusedHomes, [invitedHome]);
const restoredInvitation = selectFoundingHomes(
  archivedInvitation.venues,
  archivedInvitation.unusedHomes,
  [actors[0]!, actors[1]!, { id: "c", name: "Cleo" }],
  "community",
  ["b"],
);
const restoredZone = restoredInvitation.venues.find((venue) => venue.id === authored.id)!.spaces![0];
assert.deepEqual(restoredZone.controllerIds, ["a"]);
assert.deepEqual(restoredZone.access!.managerIds, ["a"]);
assert.deepEqual(restoredZone.access!.memberIds, ["visitor"]);
assert.deepEqual(restoredZone.access!.inviterIds, []);
const withoutAda = starting.venues.filter((venue) => venue !== authored);
const withCleo = selectFoundingHomes(withoutAda, [legacyArchive], replacementActors, "community");
assert.notEqual(withCleo.venues.find((venue) => venue.residentIds?.includes("c"))!.id, legacyArchive.id);
const restoredHome = selectFoundingHomes(withCleo.venues, withCleo.unusedHomes, actors, "community");
assert.deepEqual(
  restoredHome.venues.find((venue) => venue.id === legacyArchive.id),
  legacyArchive,
);
const { activeFoundingCircumstances } =
  await import("../packages/villages/src/client/features/founding/draft-model.js");
const fact = {
  scope: "zone" as const,
  venueId: legacyArchive.id,
  zoneId: "private:base",
  summary: "Ada stores quilts here.",
};
assert.deepEqual(activeFoundingCircumstances([fact], withCleo.venues), []);
assert.deepEqual(activeFoundingCircumstances([fact], restoredHome.venues), [fact]);
assert.ok(
  returned.venues
    .filter((venue) => venue.occupancy.playerHome || !!venue.residentIds?.length)
    .every((venue) => Number(venue.occupancy.playerHome) + venue.residentIds!.length === 1),
);
assert.doesNotThrow(() =>
  parsePlaces(
    returned.venues.map((venue, index) => ({
      ...venue,
      presentation: { ...venue.presentation, x: 0.1 + index * 0.15, y: 0.5 },
    })),
    new Set(["a", "b"]),
    true,
  ),
);
console.log("Founding homes: fixed starting households, legacy access, sleeping and draft persistence passed.");
