import assert from "node:assert/strict";
import { selectFoundingHomes } from "../packages/villages/src/client/features/founding/founding-homes.js";
import {
  applyFoundingAssignmentReview,
  foundingAssignmentChanges,
  foundingAssignmentReviewProblem,
} from "../packages/villages/src/client/features/founding/founding-assignment-review.js";
import { applyFoundingPeople } from "../packages/villages/src/shared/helpers/founding-people.js";
import { draftZonePolicy } from "../packages/villages/src/shared/helpers/founding-zone-policy.js";
import { parsePlaces } from "../packages/villages/src/server/domain/rules/founding-record.js";

const actors = [
  { id: "player", name: "Your" },
  { id: "a", name: "Ada" },
  { id: "b", name: "Bryn" },
];
const initial = selectFoundingHomes([], [], actors, "community");
assert.equal(initial.venues.length, 3);
assert.equal(initial.venues[0].privateSpaces!.length, actors.length);
assert.equal(new Set(Object.values(initial.venues[0].destinations!).map((row) => row.sleep)).size, actors.length);
assert.ok(initial.venues[0].privateSpaces!.every((zone) => zone.access?.mode === "permission-required"));
const before = initial.venues.map((row, index) => ({
  ...row,
  presentation: { ...row.presentation, x: index / 4 + 0.1, y: 0.5 },
}));
assert.doesNotThrow(() => parsePlaces(before, new Set(["a", "b"]), true));
const old = structuredClone(before);
const target = before[1];
const room = {
  ...before[0].privateSpaces![0],
  id: "new-bed",
  name: "Upstairs bedroom",
  ownerId: "player",
  connectedTo: ["exterior"],
};
const terms = {
  characterId: "a",
  activity: "Serving coffee",
  zoneId: target.spaces![0].id,
  accessZoneIds: [target.spaces![0].id],
  days: ["Monday" as const],
  startMinute: 540,
  endMinute: 1020,
};
const proposed = before.map((row) =>
  row === target
    ? applyFoundingPeople(
        { ...row, name: "Café", privateSpaces: [room], layout: "both" },
        {
          residentIds: [],
          playerHome: true,
          managerIds: ["a"],
          work: [terms],
          destinations: { player: { home: room.id, sleep: room.id }, a: { work: terms.zoneId } },
        },
      )
    : row.id === before[0].id
      ? {
          ...row,
          occupancy: { ...row.occupancy, playerHome: false },
          destinations: Object.fromEntries(Object.entries(row.destinations!).filter(([id]) => id !== "player")),
          privateSpaces: row.privateSpaces!.map((zone) =>
            zone.ownerId === "player" ? { ...zone, ownerId: "" } : zone,
          ),
        }
      : row,
);
const changes = foundingAssignmentChanges(before, proposed);
assert.deepEqual(changes.map((row) => row.id).sort(), ["home:player", `work:${target.id}:a`].sort());
const rejected = applyFoundingAssignmentReview(before, proposed, []);
assert.equal(rejected[1].name, "Café", "Rejecting assignments keeps the physical draft");
assert.equal(rejected[1].privateSpaces![0].name, "Upstairs bedroom");
assert.equal(rejected[1].privateSpaces![0].ownerId, "");
assert.deepEqual(rejected[0].destinations, before[0].destinations);
assert.equal(rejected[0].privateSpaces![0].ownerId, "player");
assert.deepEqual(rejected[1].access?.work ?? [], []);
assert.deepEqual(rejected[1].access?.managerIds, [], "Drafts cannot silently assign operators");
assert.equal(foundingAssignmentReviewProblem(rejected), "");
const homeOnly = applyFoundingAssignmentReview(before, proposed, ["home:player"]);
assert.equal(homeOnly[0].occupancy.playerHome, false);
assert.equal(homeOnly[1].occupancy.playerHome, true);
assert.deepEqual(homeOnly[1].access?.work, []);
const closedCafe = structuredClone(proposed);
closedCafe[1].spaces![0].access!.visitorHours = [{ days: ["Monday"], start: "09:00", end: "17:00" }];
closedCafe[1].privateSpaces![0].connectedTo = [terms.zoneId];
const permanentHome = applyFoundingAssignmentReview(before, closedCafe, ["home:player"]);
assert.ok(permanentHome[1].spaces![0].access!.memberRoles.includes("residents"));
assert.doesNotThrow(
  () => parsePlaces(permanentHome, new Set(["a", "b"]), true, new Date("2026-11-23T23:00:00Z")),
  "Home-only acceptance grants its route after café closing, without Work",
);
const workOnly = applyFoundingAssignmentReview(before, proposed, [`work:${target.id}:a`]);
assert.equal(workOnly[0].occupancy.playerHome, true);
assert.equal(workOnly[1].occupancy.playerHome, false);
assert.deepEqual(workOnly[1].access?.work, [terms]);
assert.deepEqual(before, old, "Review never mutates saved inputs");
const incompatible = structuredClone(proposed);
incompatible[0].spaces![0].connectedTo = [];
incompatible[0].privateSpaces!.forEach((zone) => (zone.connectedTo = []));
const keptRoute = applyFoundingAssignmentReview(before, incompatible, []);
assert.equal(foundingAssignmentReviewProblem(keptRoute), "", "Rejected moves retain the old sleeping route");
assert.equal(
  draftZonePolicy(before[0], {}, false).mode,
  "public",
  "Residency no longer controls a new shared Zone's Entry",
);
assert.equal(draftZonePolicy(before[0], {}, true).mode, "permission-required");
const overlap = structuredClone(workOnly);
overlap[2].access = { ...overlap[1].access!, work: [terms] };
assert.match(foundingAssignmentReviewProblem(overlap), /overlap/);
const granted = structuredClone(proposed);
granted[1].spaces![0].access = {
  ...granted[1].spaces![0].access!,
  managerIds: ["a"],
  memberIds: ["a"],
  inviterIds: ["a"],
};
const noGrant = applyFoundingAssignmentReview(before, granted, []);
assert.deepEqual(noGrant[1].spaces![0].access?.memberIds, before[1].spaces![0].access?.memberIds);
assert.deepEqual(noGrant[1].spaces![0].access?.managerIds, before[1].spaces![0].access?.managerIds);
const workBefore = structuredClone(workOnly);
const workDraft = structuredClone(workBefore);
workDraft[1].spaces![0].connectedTo = ["new-bed"];
workDraft[1].privateSpaces![0].connectedTo = ["exterior", terms.zoneId];
const keptWork = applyFoundingAssignmentReview(workBefore, workDraft, []);
assert.equal(foundingAssignmentReviewProblem(keptWork), "", "Retained work keeps its usable room and route");
assert.ok(keptWork[1].spaces!.some((zone) => zone.id === terms.zoneId));
assert.deepEqual(keptWork[1].spaces![0].connectedTo, workBefore[1].spaces![0].connectedTo);
const replaced = applyFoundingAssignmentReview(
  workBefore,
  workBefore.filter((row) => row.id !== target.id),
  [`work:${target.id}:a`],
);
assert.ok(
  !replaced.some((row) => row.id === target.id),
  "Accepting Work removal may remove its old Venue when no retained Home needs it",
);
const homeWithWork = structuredClone(workBefore);
homeWithWork[1].occupancy.playerHome = true;
homeWithWork[0].occupancy.playerHome = false;
homeWithWork[1].destinations = { ...homeWithWork[1].destinations, player: { home: terms.zoneId, sleep: terms.zoneId } };
const keepOldHome = applyFoundingAssignmentReview(
  homeWithWork,
  homeWithWork.filter((row) => row.id !== target.id),
  [`work:${target.id}:a`],
);
assert.equal(
  keepOldHome.find((row) => row.id === target.id)!.access!.work!.length,
  0,
  "A retained old Home does not revive accepted Work removal",
);
const tooMany = applyFoundingAssignmentReview(
  homeWithWork,
  Array.from({ length: 6 }, (_, index) => ({ ...before[2], id: `new-${index}` })),
  [],
);
assert.match(foundingAssignmentReviewProblem(tooMany), /six Venues/);
assert.throws(() => parsePlaces([...before, ...before, before[0]], new Set(["a", "b"]), true), /six/);
console.log(
  "Founding assignment review: separate Home/Work decisions, shared building with separate bedrooms, retained routes and six-Venue limit passed.",
);
