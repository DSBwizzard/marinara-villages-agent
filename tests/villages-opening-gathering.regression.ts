import assert from "node:assert/strict";
import { fixture } from "./fixtures/villages-projects.fixture.js";
import { agendaFixture } from "./helpers/agenda.fixture.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { projectLiveAttendance } from "../packages/villages/src/server/domain/rules/scene-attendance.js";
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import {
  initialOpening,
  openingView,
  openingSceneDirection,
  readOpening,
} from "../packages/villages/src/server/domain/rules/opening-project.js";
for (const count of [1, 2, 3]) {
  const f = fixture(),
    ids = ["a", "b", "c"].slice(0, count);
  const opening = initialOpening(ids, "cafe", `opening-${count}`);
  opening.gatheringSceneId = "scene";
  f.state().opening = readOpening(opening);
  assert.equal(openingView(f.state())!.version, 3);
  assert.equal(openingView(f.state())!.stage, "gathering");
  assert.deepEqual(openingView(f.state())!.residentIds, ids);
  assert.equal(f.state().projects.length, 0, "ordinary gathering creates no Project");
  assert.match(openingSceneDirection(f.state(), { id: "scene", status: "opening" } as any), /small everyday task/);
  assert.equal(openingSceneDirection(f.state(), { id: "scene", status: "active" } as any), "");
  assert.equal(openingSceneDirection(f.state(), { id: "unrelated", status: "opening" } as any), "");
  const view = openingView(f.state())!;
  view.residentIds.push("outsider");
  assert.deepEqual(f.state().opening!.residentIds, ids, "public views do not mutate saved attendance");
  assert.throws(() => readOpening({ ...opening, version: 2 }), /Unsupported/);
}
{
  const world = fixture().state();
  const at = world.setupAt;
  world.timeZone = "UTC";
  world.opening = initialOpening(["a", "b"], "cafe", "opening");
  world.opening.gatheringSceneId = "gathering";
  const venue = world.venues[0]!;
  const resident = world.villagers[0]!;
  const blocks = [
    { startMinute: 0, endMinute: 721, activity: "Rest", venueId: venue.id, zoneId: "exterior" },
    { startMinute: 721, endMinute: 1440, activity: "Work", venueId: world.venues[1]!.id, zoneId: "exterior" },
  ];
  resident.agenda = agendaFixture({
    day: blocks,
    generatedAt: at,
    activeDay: { dateKey: at.slice(0, 10), weekday: "Friday", blocks, scheduleInformed: false },
  });
  const participants = ["a", "b"].map((characterId) => ({ characterId, name: characterId, doing: "Gathering" }));
  const scene = coerceSession({
    version: 5,
    id: "gathering",
    openingGatheringId: "opening",
    status: "active",
    placeId: venue.id,
    placeName: venue.name,
    zoneId: "common",
    area: "public",
    villageSeed: world.seed,
    startedAt: at,
    lastActivityAt: at,
    participants,
    activeIds: ["a", "b"],
    accompanying: [{ characterId: "a", zoneId: "exterior" }],
    sceneAttendance: { capturedAt: at, occupants: participants.map((person) => ({ ...person, zoneId: "common" })) },
  });
  scene.continuity = captureSceneContinuity(world, scene, Date.parse(at));
  const sameMoment = projectLiveAttendance(world, scene, venue, new Date(at));
  assert.deepEqual(
    sameMoment.attendance.occupants.map(({ characterId }) => characterId),
    ["a", "b"],
  );
  assert.deepEqual(sameMoment.accompanying, [{ characterId: "a", zoneId: "exterior" }]);
  const later = projectLiveAttendance(world, scene, venue, new Date(Date.parse(at) + 60_000));
  assert.deepEqual(
    later.attendance.occupants.map(({ characterId }) => characterId),
    ["b"],
    "A new Agenda block can move a founder away",
  );
  assert.deepEqual(later.accompanying, []);
  resident.incarnation = "replacement";
  const replaced = projectLiveAttendance(world, scene, venue, new Date(at));
  assert.deepEqual(
    replaced.attendance.occupants.map(({ characterId }) => characterId),
    ["b"],
  );
  assert.deepEqual(replaced.accompanying, [], "A replacement cannot inherit an admitted founder's position");
}
console.log("Ordinary Founding gatherings preserve their saved identity without scripted Projects.");
