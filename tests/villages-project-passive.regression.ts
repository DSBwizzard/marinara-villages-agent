import assert from "node:assert/strict";
import { fixture, renovation } from "./fixtures/villages-projects.fixture.js";
import {
  reconcileProjectLifecycles,
  PROJECT_DURATION_MS,
  pauseProject,
} from "../packages/villages/src/server/domain/rules/project-lifecycle-rules.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { projectDesignKey } from "../packages/villages/src/server/domain/rules/project-terms.js";
const f = fixture(),
  now = new Date("2026-10-24T00:00:00Z"),
  id = await f.newProject();
await f.service.startProjectConstruction(id, f.body(id), now);
await f.mutate((state) => {
  state.villagers = state.villagers.filter((resident) => resident.characterId !== "a");
  reconcileProjectLifecycles(state, new Date(now.getTime() + 6 * 60 * 60_000));
});
assert.equal(f.get(id).status, "paused");
assert.equal(f.get(id).lifecycle!.workOrder!.remainingMs, 18 * 60 * 60_000);
await f.mutate((state) => reconcileProjectLifecycles(state, new Date(now.getTime() + PROJECT_DURATION_MS * 2)));
assert.equal(f.get(id).status, "paused", "time passing never implicitly resumes paused work");
await f.agree(id, "b");
await f.service.lockProjectBuilder(id, f.body(id, { residentId: "b" }));
assert.equal(f.get(id).status, "paused", "selecting a lead never resumes");
const resumeAt = new Date(now.getTime() + PROJECT_DURATION_MS * 2);
await f.service.resumeProject(id, f.body(id), resumeAt);
assert.equal(Date.parse(f.get(id).lifecycle!.workOrder!.completesAt) - resumeAt.getTime(), 18 * 60 * 60_000);
await f.mutate((state) => reconcileProjectLifecycles(state, new Date(resumeAt.getTime() + 18 * 60 * 60_000)));
assert.equal(f.get(id).status, "complete");
const g = fixture(),
  r = await renovation(g, {
    zones: g
      .state()
      .venues[0].zones!.filter((zone) => zone.kind !== "exterior")
      .map((zone) => ({ ...zone, description: "A new shared studio." })),
  });
await g.agree(r);
await g.service.startProjectConstruction(r, g.body(r), now);
const original = structuredClone(g.state().venues);
await g.mutate((state) => {
  state.venues[0].zones![1].description = "A newly authored room.";
});
await g.mutate((state) => reconcileProjectLifecycles(state, new Date(now.getTime() + PROJECT_DURATION_MS)));
assert.equal(g.get(r).status, "paused");
assert.equal(g.get(r).lifecycle!.workOrder!.remainingMs, 0);
assert.equal(
  g.state().venues[0].residenceCapacity,
  original[0].residenceCapacity,
  "failed completion applies no partial capacity change",
);
assert.equal(g.state().venues[0].zones![1].description, "A newly authored room.");
await assert.rejects(g.service.resumeProject(r, g.body(r), now), /design changed/);
const h = fixture(),
  cancel = await h.newProject();
await h.service.startProjectConstruction(cancel, h.body(cancel), now);
const cancelRequest = h.body(cancel);
await h.service.cancelProject(cancel, cancelRequest);
await h.service.cancelProject(cancel, cancelRequest);
await h.mutate((state) => reconcileProjectLifecycles(state, new Date(now.getTime() + PROJECT_DURATION_MS)));
assert.equal(
  h.state().venues.some((venue) => venue.buildProjectId === cancel),
  false,
);
assert.equal(h.get(cancel).status, "cancelled");
assert.equal(h.get(cancel).lifecycle!.candidates[0].scope, projectDesignKey(h.get(cancel)));
console.log(
  "Elapsed time, genuine interruptions, explicit resume, completion holds and late-effect cancellation passed.",
);

const m = fixture();
await m.mutate((state) => {
  const venue = state.venues[0];
  venue.classes = ["residence"];
  venue.residentIds = ["a"];
  venue.zones![1].kind = "shared-residence";
  venue.zones![1].venueClass = "residence";
  venue.zones!.push({
    ...defaultVenueSpace("residence"),
    id: "private",
    kind: "private-residence",
    name: "Private room",
    purpose: "Sleeping",
    connectedTo: ["exterior"],
  });
});
const capacity = await renovation(m, { capacity: 3 });
await m.agree(capacity);
await m.service.startProjectConstruction(capacity, m.body(capacity), now);
await m.mutate((state) => {
  state.venues[0].residentIds = ["a", "b"];
  state.venues[0].zones!.find((z) => z.id === "private")!.ownerId = "b";
  reconcileProjectLifecycles(state, new Date(now.getTime() + 3600000));
});
assert.equal(m.get(capacity).status, "paused");
await m.agree(capacity);
await m.service.resumeProject(capacity, m.body(capacity), new Date(now.getTime() + 7200000));
await m.mutate((state) => reconcileProjectLifecycles(state, new Date(now.getTime() + PROJECT_DURATION_MS + 7200000)));
assert.equal(m.get(capacity).status, "complete");
assert.equal(
  m.state().venues[0].zones!.find((z) => z.id === "private")!.ownerId,
  "b",
  "untouched current ownership survives renewed consent and completion",
);

// An old saved pause event cannot restore time already spent before Resume.
const bounded = fixture(),
  boundedId = await bounded.newProject();
await bounded.service.startProjectConstruction(boundedId, bounded.body(boundedId), now);
await bounded.mutate((state) =>
  pauseProject(state.projects[0], new Date(now.getTime() + 6 * 3600000).toISOString(), "Lead withdrew."),
);
await bounded.service.resumeProject(boundedId, bounded.body(boundedId), new Date(now.getTime() + 8 * 3600000));
await bounded.mutate((state) => pauseProject(state.projects[0], now.toISOString(), "Delayed withdrawal."));
assert.equal(bounded.get(boundedId).lifecycle!.workOrder!.remainingMs, 18 * 3600000);
