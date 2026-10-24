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
  readOpening,
} from "../packages/villages/src/server/domain/rules/opening-project.js";
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
console.log("Current opening preparation, direct Renovation targets and proposal privacy passed.");
