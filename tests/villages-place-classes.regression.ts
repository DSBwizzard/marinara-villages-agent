import assert from "node:assert/strict";
import { packagedSceneServer } from "./fixtures/packaged-scene-server.fixture.js";
import { fixtureVillageState } from "./helpers/village-storage.fixture.js";
import { establishPlace } from "./helpers/places.fixture.js";
import { readPlaceRegistry } from "../packages/villages/src/server/domain/rules/places.js";
import { initializeRoomContinuity } from "../packages/villages/src/server/domain/rules/native-continuity.js";

const host = await packagedSceneServer({
  configure(world, now) {
    world.maps = [
      {
        id: "map",
        name: "Village",
        revision: 0,
        width: 100,
        height: 100,
        artwork: { id: "map-art", ref: "global-gallery:map-art", url: "/api/global-gallery/file/map-art.png" },
      },
    ];
    for (const venue of world.venues) venue.presentation.mapId = "map";
    const place = establishPlace(
      world,
      {
        name: "Old workshop",
        description: "An existing workshop with a public meeting room.",
        controllers: ["jo"],
        people: [{ ref: "jo", name: "Jo", characterization: "A careful keeper.", role: "Keeper" }],
        zones: [
          { id: "workroom", name: "Workroom", kind: "staff", description: "Old workbenches.", controllers: ["jo"] },
        ],
      },
      "old",
      "map",
      "saved-preview",
      now,
      true,
    );
    delete place.classified;
    for (const zone of place.location.zones!)
      initializeRoomContinuity(world, place.id, zone.id, zone.description, "saved-preview", now);
    assert.deepEqual(
      readPlaceRegistry(world.worldPlaces),
      world.worldPlaces,
      "Reading older Place bytes preserves captured fingerprints",
    );
  },
});
const state = () => fixtureVillageState(host.records.get("villages-village").data, host.records);
const call = (path: string, payload?: unknown) =>
  host.app.inject({ method: payload ? "POST" : "GET", url: "/api/villages" + path, ...(payload ? { payload } : {}) });
let calls = 0;
let invalid = true;
let classification = ["community", "workplace"];
host.model.chatComplete = async (messages: any[]) => {
  calls++;
  const input = JSON.parse(messages[1].content);
  assert.match(messages[0].content, /JSON/i);
  if (input.task === "explore") {
    assert.equal(input.decideClasses, false);
    return {
      content: JSON.stringify({ place: { name: "Ridge", description: "A bare rocky ridge.", classes: ["residence"] } }),
      finishReason: "stop",
    } as any;
  }
  assert.equal(input.classifyOnly, true);
  assert.equal(input.decideClasses, true);
  const classes = invalid ? ["community"] : classification;
  invalid = false;
  return { content: JSON.stringify({ classes }), finishReason: "stop" } as any;
};
try {
  host.records.get("villages-active-venue").data = { sessionId: "", placeId: "" };
  const snapshot = (await call("/")).json();
  const listed = await call("/places/old");
  assert.equal(listed.json().classified, false);
  assert.equal(calls, 0);
  const before = state(),
    location = structuredClone(before.worldPlaces.places.old.location);
  const entered = await call("/rooms", { venueId: "old", zoneId: "exterior" });
  assert.equal(entered.statusCode, 200, entered.body);
  assert.equal(calls, 2, "Unsupported staff classification gets just one automatic retry");
  const old = state().worldPlaces.places.old;
  assert.equal(old.classified, true);
  assert.equal(old.visited, true);
  location.classes = ["community", "workplace"];
  for (const zone of location.zones!) zone.venueClass = zone.kind === "staff" ? "workplace" : "community";
  assert.deepEqual(old.location, location, "Classification changes only Classes and their Zone associations");
  assert.deepEqual(
    state().worldPlaces.npcs,
    before.worldPlaces.npcs,
    "Existing supporting identities remain unchanged",
  );
  const close = async (session: any) => {
    const next = await call("/rooms/continue", { sessionId: session.id });
    assert.equal(next.statusCode, 200, next.body);
    const ended = await call("/rooms/end", {
      sessionId: session.id,
      expectedSceneRevision: next.json().session.sceneRevision,
    });
    assert.equal(ended.statusCode, 200, ended.body);
  };
  await close(entered.json().session);
  const returned = await call("/rooms", { venueId: "old", zoneId: "exterior" });
  assert.equal(returned.statusCode, 200, returned.body);
  assert.equal(calls, 2, "A return reuses the completed Class decision");
  await close(returned.json().session);
  const body = {
    worldScope: snapshot.worldScope,
    requestId: "fixed-classes",
    expectedRevision: state().worldPlaces.places.old.revision,
    expectedMapRevision: 0,
    mapId: "map",
    x: 0.83,
    y: 0.83,
  };
  assert.equal(
    (await call("/places/old/admit", { ...body, classes: ["residence"] })).statusCode,
    400,
    "Admission cannot override or select a subset of Classes",
  );
  const admitted = await call("/places/old/admit", body);
  assert.equal(admitted.statusCode, 200, admitted.body);
  assert.deepEqual(state().venues.find((row) => row.id === "old")!.classes, ["community", "workplace"]);
  assert.deepEqual(state().worldPlaces.npcs, before.worldPlaces.npcs);

  const explored = await call("/places/explore", { worldScope: snapshot.worldScope, requestId: "ridge", mapId: "map" });
  assert.equal(explored.json().status, "ready", explored.body);
  const id = explored.json().placeId;
  assert.equal(state().worldPlaces.places[id].classified, false, "Explore cannot decide Classes before a Visit");
  classification = ["other"];
  const ridge = await call("/rooms", { venueId: id, zoneId: "exterior" });
  assert.equal(ridge.statusCode, 200, ridge.body);
  assert.equal(calls, 4);
  assert.equal(state().worldPlaces.places[id].classified, true, "Other is an intentional completed decision");
  assert.deepEqual(state().worldPlaces.places[id].location.classes, ["other"]);
  await close(ridge.json().session);
  assert.equal((await call("/rooms", { venueId: id, zoneId: "exterior" })).statusCode, 200);
  assert.equal(calls, 4, "An intentional Other classification never repeats on return");
} finally {
  await host.stop();
}
