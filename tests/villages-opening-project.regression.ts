import assert from "node:assert/strict";
import { fixture } from "./fixtures/villages-projects.fixture.js";
import { initialOpening, openingView } from "../packages/villages/src/server/domain/rules/opening-project.js";
import { PROJECT_DURATION_MS } from "../packages/villages/src/server/domain/rules/project-lifecycle-rules.js";
const f = fixture();
await f.mutate((state) => {
  state.opening = {
    ...initialOpening(["a", "b", "c"], "cafe", "opening"),
    stage: "conversations",
    proposals: [
      {
        residentId: "a",
        name: "Art Hall",
        description: "A place for shared art.",
        venueClass: "community",
        established: false,
        provenance: "The founding setting.",
        work: "Build a pavilion.",
        firstUse: "Make art.",
      },
    ],
    reveals: [
      { residentId: "a", sceneId: "intro", submissionId: "greeting", lineId: "pitch", quote: "Build an art hall." },
    ],
  };
});
await f.service.decideOpeningProposal({ openingId: "opening", action: "accept", residentId: "a" });
const chosen = f.state().opening!.projectId;
assert.equal(f.get(chosen).status, "planning", "accepting a heard proposal never starts it");
assert.equal(f.state().opening!.reveals.length, 1, "other founders need not all be heard first");
await f.service.decideOpeningProposal({ openingId: "opening", action: "accept", residentId: "a" });
assert.equal(f.state().projects.filter((project) => project.id === chosen).length, 1);
const ordinary = await f.newProject("Ordinary", "b");
await f.service.startProjectConstruction(ordinary, f.body(ordinary), new Date("2026-10-24T00:00:00Z"));
assert.equal(
  Date.parse(f.get(ordinary).lifecycle!.workOrder!.completesAt) -
    Date.parse(f.get(ordinary).lifecycle!.workOrder!.startsAt),
  PROJECT_DURATION_MS,
);
await f.service.saveProjectPlan(
  chosen,
  f.body(chosen, {
    form: "A pavilion",
    exteriorDescription: "The pavilion entrance",
    layoutVersion: 1,
    layout: "exterior",
    spaces: [],
    privateSpaces: [],
  }),
);
await f.service.placeNewVenueProject(chosen, f.body(chosen, { x: 0.4, y: 0.7 }));
await f.agree(chosen, "a");
await f.service.startProjectConstruction(chosen, f.body(chosen), new Date("2026-10-24T00:00:00Z"));
assert.equal(
  Date.parse(f.get(chosen).lifecycle!.workOrder!.completesAt) -
    Date.parse(f.get(chosen).lifecycle!.workOrder!.startsAt),
  PROJECT_DURATION_MS,
  "guided Projects use the same 24-hour duration",
);
await f.service.cancelProject(chosen, f.body(chosen));
assert.equal(openingView(f.state())!.stage, "ended");
console.log("Optional opening guidance, heard-proposal acceptance, ordinary availability and unified duration passed.");
