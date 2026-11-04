import assert from "node:assert/strict";
import { mapsFixture, image } from "./fixtures/maps.js";
import { normalizeVillageMutation } from "../packages/villages/src/server/domain/rules/world-mutation.js";
import { lifecycle } from "../packages/villages/src/server/domain/rules/project-lifecycle-rules.js";
import { plannedVenue } from "../packages/villages/src/server/domain/rules/project-design.js";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";

const f = mapsFixture(),
  before = structuredClone(f.state.maps[1]);
await f.service.updateVillageMap("map-house", {
  expectedRevision: 1,
  name: "House interior",
  image: image("replacement"),
  placements: [{ venueId: "home", x: 0.6, y: 0.7 }],
});
assert.deepEqual(f.state.maps[1], before, "Editing one map leaves the other untouched");
assert.equal(f.state.venues[1].presentation.x, 0.3);
assert.equal(f.state.venues[0].presentation.x, 0.6);
assert.equal(f.state.maps[0].artwork.ref, "global-gallery:uploaded-1");
assert.equal(f.state.maps[0].revision, 2);
assert.equal(
  JSON.stringify(f.state.maps).includes("base64"),
  false,
  "Saved maps contain gallery references, not image bytes",
);
assert.equal(coerceVillageState(f.state).venues[0].presentation.mapId, "map-house");
await assert.rejects(f.service.updateVillageMap("map-house", { expectedRevision: 1, name: "Stale" }), /map changed/i);
await assert.rejects(
  f.service.updateVillageMap("map-house", { expectedRevision: 2, placements: [{ venueId: "cafe", x: 0.9, y: 0.9 }] }),
  /placements changed/,
);
await assert.rejects(f.service.updateVillageMap("missing-map", { expectedRevision: 1 }), /saved map/);
await assert.rejects(f.service.createVillageMap({ id: "map-newone", name: "New", image: "" }), /empty/);
await f.service.createVillageMap({ id: "map-newone", name: "New", image: image("new") });
await f.service.createVillageMap({ id: "map-newone", name: "New", image: image("new") });
assert.equal(f.state.maps.length, 3, "Replaying map creation does not duplicate the map");
assert.equal(f.uploads.length, 2, "Replaying creation does not reupload artwork");
assert.equal(f.state.venues.length, 2, "Adding a map does not create Venues");

const stale = mapsFixture();
stale.beforeWrite(() => stale.state.maps[0].revision++);
await assert.rejects(
  stale.service.updateVillageMap("map-house", {
    expectedRevision: 1,
    image: image("stale"),
    placements: [{ venueId: "home", x: 0.8, y: 0.8 }],
  }),
  /map changed/i,
);
assert.equal(stale.state.maps[0].artwork.id, "map-house");
const independent = mapsFixture();
independent.beforeWrite(() => independent.state.maps[1].revision++);
await independent.service.updateVillageMap("map-house", { expectedRevision: 1, name: "Updated" });
assert.equal(independent.state.maps[0].name, "Updated");
assert.equal(independent.state.maps[1].revision, 2);

const projects = mapsFixture();
projects.state.projects.push({
  id: "planned",
  title: "Garden",
  kind: "new-venue",
  venueId: "",
  status: "planning",
  progress: 0,
  participantIds: [],
  updatedAt: projects.state.setupAt,
  lifecycle: lifecycle(),
  venueDraft: {
    name: "Garden",
    classes: ["community"],
    description: "A garden",
    position: { mapId: "map-house", x: 0.7, y: 0.8 },
  },
});
await assert.rejects(
  projects.service.updateVillageMap("map-house", {
    expectedRevision: 1,
    image: image("changed"),
    placements: [{ venueId: "home", x: 0.3, y: 0.3 }],
  }),
  /placements changed/,
);
await projects.service.updateVillageMap("map-house", {
  expectedRevision: 1,
  image: image("changed"),
  placements: [
    { venueId: "home", x: 0.3, y: 0.3 },
    { venueId: "project:planned", x: 0.8, y: 0.7 },
  ],
});
assert.equal(projects.state.projects[0].venueDraft!.position.x, 0.8);
assert.equal(projects.state.projects[0].lifecycle!.revision, 2);
assert.equal(plannedVenue(projects.state.projects[0]).presentation.mapId, "map-house");
const mutation = mapsFixture();
normalizeVillageMutation(mutation.state, mutation.state.seed, (state) => {
  state.venues[0].presentation.x = 0.4;
});
assert.equal(mutation.state.maps[0].revision, 2);
assert.equal(mutation.state.maps[1].revision, 1);
assert.throws(
  () =>
    normalizeVillageMutation(mutation.state, mutation.state.seed, (state) => {
      state.venues[0].presentation.mapId = "map-street";
    }),
  /between maps/,
);
console.log("Map creation, editing, Project sites and revisions are isolated to their maps");
