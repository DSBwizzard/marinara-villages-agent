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
          {
            id: "workroom",
            name: "Workroom",
            kind: "restricted",
            description: "Old workbenches.",
            controllers: ["jo"],
          },
        ],
      },
      "old",
      "map",
      "saved-preview",
      now,
      true,
    );
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
host.model.chatComplete = async () => {
  calls++;
  return {
    content: JSON.stringify({ place: { name: "Ridge", description: "A bare rocky ridge." } }),
    finishReason: "stop",
  } as any;
};

try {
  host.records.get("villages-active-venue").data = { sessionId: "", placeId: "" };
  const snapshot = (await call("/")).json();
  const listed = await call("/places/old");
  assert.equal(listed.json().prepared, true);
  assert.equal(calls, 0);
  const before = state(),
    location = structuredClone(before.worldPlaces.places.old.location);
  const entered = await call("/rooms", { venueId: "old", zoneId: "exterior" });
  assert.equal(entered.statusCode, 200, entered.body);
  assert.equal(calls, 0, "Prepared places need no separate Class request");
  const old = state().worldPlaces.places.old;
  assert.equal(old.prepared, true);
  assert.equal(old.visited, true);
  assert.deepEqual(old.location, location, "A Visit preserves the authored layout");
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
  assert.equal(calls, 0, "Returning to a prepared place makes no classification request");
  await close(returned.json().session);
  const body = {
    worldScope: snapshot.worldScope,
    requestId: "admit-existing",
    expectedRevision: state().worldPlaces.places.old.revision,
    expectedMapRevision: 0,
    mapId: "map",
    x: 0.83,
    y: 0.83,
  };
  assert.equal(
    (await call("/places/old/admit", { ...body, classes: ["community"] })).statusCode,
    400,
    "Admission rejects removed Class fields",
  );
  const admitted = await call("/places/old/admit", body);
  assert.equal(admitted.statusCode, 200, admitted.body);
  assert.equal(
    Object.hasOwn(
      state().venues.find((row) => row.id === "old")!,
      "classes",
    ),
    false,
  );
  assert.deepEqual(state().worldPlaces.npcs, before.worldPlaces.npcs);

  const explored = await call("/places/explore", { worldScope: snapshot.worldScope, requestId: "ridge", mapId: "map" });
  assert.equal(explored.json().status, "ready", explored.body);
  const id = explored.json().placeId;
  assert.equal(
    state().worldPlaces.places[id].prepared,
    true,
    "Explore retains a complete physical place without Class preparation",
  );
  const ridge = await call("/rooms", { venueId: id, zoneId: "exterior" });
  assert.equal(ridge.statusCode, 200, ridge.body);
  assert.equal(calls, 1);
  assert.equal(state().worldPlaces.places[id].prepared, true, "The first Visit prepares the physical place");
  assert.equal(Object.hasOwn(state().worldPlaces.places[id].location, "classes"), false);
  await close(ridge.json().session);
  assert.equal((await call("/rooms", { venueId: id, zoneId: "exterior" })).statusCode, 200);
  assert.equal(calls, 1, "A return reuses preparation without a Class call");
} finally {
  await host.stop();
}
