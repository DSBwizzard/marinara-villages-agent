import assert from "node:assert/strict";
import { fixture } from "./fixtures/villages-projects.fixture.js";
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
console.log("Ordinary Founding gatherings preserve their saved identity without scripted Projects.");
