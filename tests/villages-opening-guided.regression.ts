import assert from "node:assert/strict";
import { fixture } from "./fixtures/villages-projects.fixture.js";
import {
  readOpeningRenovation,
  bindOpeningRenovation,
  openingRenovationDraft,
} from "../packages/villages/src/server/domain/rules/opening-renovation.js";
import {
  initialOpening,
  openingView,
  openingSceneDirection,
  readOpening,
} from "../packages/villages/src/server/domain/rules/opening-project.js";
import { openingSemanticContext } from "../packages/villages/src/server/domain/rules/opening-context.js";
import { openingPresence } from "../packages/villages/src/server/domain/rules/opening-presence.js";
import { draftRenovationProject } from "../packages/villages/src/server/features/projects/project-drafts.js";
const f = fixture();
const proposal: any = {
  kind: "renovation",
  residentId: "a",
  name: "Art room",
  description: "Repurpose the cafe common room for art.",
  venueClass: "community",
  established: true,
  provenance: "An existing shared room.",
  work: "Rebuild the room.",
  firstUse: "Make art.",
  renovation: readOpeningRenovation({
    venueId: "cafe",
    spaceId: "common",
    title: "Art room",
    description: "A room for shared art.",
  }),
};
const bound = bindOpeningRenovation(proposal, f.state().venues);
const draft = openingRenovationDraft(bound, f.state().venues);
assert.ok(draft.zones.some((zone) => zone.id === "common" && zone.description === "A room for shared art."));
assert.equal("slot" in draft, false);
const project = draftRenovationProject(f.state(), "cafe", draft);
assert.equal(project.status, "planning");
assert.equal(project.lifecycle!.candidates.length, 0, "a pitch does not volunteer its speaker");
const opening = initialOpening(["a"], "cafe", "opening");
assert.equal(readOpening(opening)!.version, 2);
f.state().opening = opening;
assert.equal(openingView(f.state())!.proposals.length, 0, "unheard proposals remain private");
assert.throws(() => readOpening({ ...opening, version: 1 }), /unsupported/);
for (const count of [1, 2, 3]) {
  const ids = ["a", "b", "c"].slice(0, count);
  const interactive = initialOpening(ids, "cafe", `interactive-${count}`, 3);
  interactive.gatheringSceneId = "scene";
  f.state().opening = readOpening(interactive);
  const scene = { id: "scene", status: "opening", activeIds: ids } as any;
  assert.match(openingSceneDirection(f.state(), scene), /small everyday task/);
  assert.equal(openingSemanticContext(f.state(), scene), null);
  assert.equal(openingView(f.state())!.stage, "gathering");
  assert.equal(openingView(f.state())!.action, "");
  for (const id of ids) assert.equal(openingPresence(f.state(), id), undefined);
  assert.equal(openingSceneDirection(f.state(), { ...scene, status: "active" }), "");
}
console.log("Current opening preparation, direct Renovation targets and proposal privacy passed.");
