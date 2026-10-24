import assert from "node:assert/strict";
import { fixture, renovation } from "./fixtures/villages-projects.fixture.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { zoneClosed } from "../packages/villages/src/server/domain/rules/venue-zones.js";
import {
  reconcileProjectLifecycles,
  PROJECT_DURATION_MS,
  refreshProjectAgreements,
} from "../packages/villages/src/server/domain/rules/project-lifecycle-rules.js";
import {
  captureSceneContinuity,
  sceneContinuityView,
} from "../packages/villages/src/server/domain/rules/scene-continuity.js";
const f = fixture(),
  now = new Date("2026-10-24T00:00:00Z");
await f.mutate((state) => {
  state.venues[0].zones!.push({
    ...defaultVenueSpace("community", "A quiet side room."),
    id: "spare",
    name: "Side room",
    kind: "public",
    seen: true,
    connectedTo: ["exterior"],
  });
});
const scene: any = {
  id: "scene",
  villageSeed: f.state().seed,
  placeId: "cafe",
  zoneId: "spare",
  activeIds: ["a"],
  participants: [],
  lines: [],
  submissions: [],
};
scene.continuity = captureSceneContinuity(f.state(), scene, now.getTime());
const zones = f
  .state()
  .venues[0].zones!.filter((zone) => zone.kind !== "exterior")
  .map((zone) => (zone.id === "common" ? { ...zone, description: "A bright art room." } : zone));
const id = await renovation(f, { zones });
await f.agree(id);
assert.equal(
  zoneClosed(f.state(), f.state().venues[0], f.state().venues[0].zones![1]),
  false,
  "a draft closes nothing",
);
await f.service.startProjectConstruction(id, f.body(id), now);
let target = f.state().venues[0];
assert.equal(
  zoneClosed(
    f.state(),
    target,
    target.zones!.find((zone) => zone.id === "common")!,
  ),
  true,
);
assert.equal(
  zoneClosed(
    f.state(),
    target,
    target.zones!.find((zone) => zone.id === "spare")!,
  ),
  false,
);
await f.mutate((state) => {
  state.venues[0].zones!.find((zone) => zone.id === "spare")!.description = "A new unrelated description.";
});
await f.mutate((state) => reconcileProjectLifecycles(state, new Date(now.getTime() + PROJECT_DURATION_MS)));
target = f.state().venues[0];
assert.equal(f.get(id).status, "complete");
assert.equal(target.zones!.find((zone) => zone.id === "common")!.description, "A bright art room.");
assert.equal(
  target.zones!.find((zone) => zone.id === "spare")!.description,
  "A new unrelated description.",
  "completion preserves untouched live rooms",
);
assert.equal(
  sceneContinuityView(f.state(), scene).venues[0].zones!.find((zone) => zone.id === "spare")!.description,
  "A quiet side room.",
  "active Scene retains its captured context",
);
assert.equal(
  zoneClosed(
    f.state(),
    target,
    target.zones!.find((zone) => zone.id === "common")!,
  ),
  false,
);
console.log("Direct Zone Renovations, targeted closures, untouched rooms and frozen Scene continuity passed.");

// A later addition changes the baseline membership even if the original changed room is untouched.
const g = fixture(),
  older = await renovation(g, {
    capacity: 2,
    zones: g
      .state()
      .venues[0].zones!.filter((z) => z.kind !== "exterior")
      .map((z) => ({ ...z, name: "Renamed room" })),
  });
await g.agree(older);
const added = await renovation(g, {
  capacity: 2,
  zones: [
    ...g.state().venues[0].zones!.filter((z) => z.kind !== "exterior"),
    {
      ...defaultVenueSpace("community", "A newly added room."),
      id: "new",
      name: "New room",
      kind: "public",
      connectedTo: ["exterior"],
    },
  ],
});
await g.agree(added);
await g.service.startProjectConstruction(added, g.body(added), now);
await g.mutate((state) => reconcileProjectLifecycles(state, new Date(now.getTime() + PROJECT_DURATION_MS)));
await assert.rejects(g.service.startProjectConstruction(older, g.body(older), now), /Venue design changed/);
assert(g.state().venues[0].zones!.some((z) => z.id === "new"));
const h = fixture(),
  pending = await renovation(h);
await h.agree(pending);
await h.mutate((state) => {
  state.venues[0].access!.managerIds = ["b"];
  refreshProjectAgreements(state);
});
assert.deepEqual(h.get(pending).lifecycle!.affectedIds, ["b"]);
assert.deepEqual(h.get(pending).lifecycle!.approvals, []);
await assert.rejects(h.service.startProjectConstruction(pending, h.body(pending), now), /necessary agreements/);
