import assert from "node:assert/strict";
import { packagedSceneServer } from "./fixtures/packaged-scene-server.fixture.js";
import { fixtureVillageState } from "./helpers/village-storage.fixture.js";
import { establishPlace } from "../packages/villages/src/server/domain/rules/place-discovery.js";

const fixture = await packagedSceneServer({
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
    establishPlace(
      world,
      { name: "Boathouse", description: "An old riverside boathouse." },
      "boathouse",
      "map",
      "witnessed",
      now,
      false,
    );
  },
});
const world = () => fixtureVillageState(fixture.records.get("villages-village").data, fixture.records);
const call = (url: string, payload?: unknown) =>
  fixture.app.inject({ method: payload ? "POST" : "GET", url: "/api/villages" + url, ...(payload ? { payload } : {}) });
let calls = 0;
fixture.model.chatComplete = async () => {
  calls++;
  return {
    content: JSON.stringify({
      place: {
        name: "Boathouse",
        description: "An old riverside boathouse.",
        zones: [{ id: "landing", name: "Landing", kind: "public", description: "A weathered wooden landing." }],
      },
    }),
    finishReason: "stop",
  } as any;
};
try {
  fixture.records.get("villages-active-venue").data = { sessionId: "", placeId: "" };
  const snapshot = (await call("/")).json();
  const body = {
    worldScope: snapshot.worldScope,
    requestId: "admit",
    expectedRevision: 1,
    expectedMapRevision: 0,
    mapId: "map",
    classes: ["community"],
    x: 0.83,
    y: 0.83,
  };
  assert.equal((await call("/places/boathouse/admit", body)).statusCode, 409, "Knowing a destination is not a visit");
  const list = await call("/places");
  assert.equal(list.json().items.filter((row: any) => row.venue).length, 3);
  assert.equal(list.json().items.find((row: any) => row.id === "boathouse").visited, false);
  assert.equal(calls, 0, "Browsing and rejected admission make no provider requests");

  const update = fixture.documents.update;
  let failedProof = false;
  fixture.documents.update = async (input: any) => {
    if (
      input.id === "villages-village" &&
      !failedProof &&
      fixture.records.get("villages-active-venue").data.placeId === "boathouse" &&
      fixtureVillageState(input.data, fixture.records).worldPlaces.places.boathouse.visited
    ) {
      failedProof = true;
      throw new Error("synthetic interrupted visit observation");
    }
    return update(input);
  };
  const entered = await call("/rooms", { venueId: "boathouse", zoneId: "exterior" });
  assert.equal(entered.statusCode, 500, entered.body);
  assert(failedProof);
  assert.equal(world().worldPlaces.places.boathouse.prepared, true);
  assert.equal(world().worldPlaces.places.boathouse.visited, false);
  const recovered = await call("/rooms/active");
  assert.equal(recovered.statusCode, 200, recovered.body);
  const first = recovered.json().session;
  assert.equal(first.placeId, "boathouse");
  assert.equal(world().worldPlaces.places.boathouse.visited, true, "An admitted visit resumes its observation write");
  assert.equal(calls, 1, "Recovery reuses completed first-arrival generation");
  assert.equal(
    (
      await call("/places/boathouse/admit", {
        ...body,
        expectedRevision: world().worldPlaces.places.boathouse.revision,
      })
    ).statusCode,
    409,
    "Admission waits for the active Scene",
  );
  const continued = await call("/rooms/continue", { sessionId: first.id });
  assert.equal(continued.statusCode, 200, continued.body);
  const discarded = await call("/rooms/end", {
    sessionId: first.id,
    expectedSceneRevision: continued.json().session.sceneRevision,
  });
  assert.equal(discarded.statusCode, 200, discarded.body);
  const returned = await call("/rooms", { venueId: "boathouse", zoneId: "exterior" });
  assert.equal(returned.statusCode, 200, returned.body);
  assert.notEqual(returned.json().session.id, first.id);
  assert.equal(calls, 1, "Returning reuses the location and layout");
  const current = returned.json().session;
  const next = await call("/rooms/continue", { sessionId: current.id });
  assert.equal(next.statusCode, 200);
  assert.equal(
    (await call("/rooms/end", { sessionId: current.id, expectedSceneRevision: next.json().session.sceneRevision }))
      .statusCode,
    200,
  );

  const revision = world().worldPlaces.places.boathouse.revision;
  assert.equal((await call("/places/boathouse/admit", body)).statusCode, 409, "Stale location revisions are rejected");
  const admission = { ...body, expectedRevision: revision };
  const admitted = await call("/places/boathouse/admit", admission);
  assert.equal(admitted.statusCode, 200, admitted.body);
  assert(admitted.json().settings.venues.some((row: any) => row.id === "boathouse"));
  assert.equal(world().projects.length, 0);
  assert.equal(world().worldPlaces.places.boathouse, undefined);
  assert.equal(
    world()
      .venues.find((row) => row.id === "boathouse")!
      .zones!.find((zone) => zone.id === "landing")!.seen,
    false,
  );
  const replay = await call("/places/boathouse/admit", admission);
  assert.equal(replay.statusCode, 200, replay.body);
  assert.equal(world().venues.filter((row) => row.id === "boathouse").length, 1);
  assert.equal((await call("/places/boathouse/admit", { ...admission, x: 0.6 })).statusCode, 409);
  assert.equal((await call("/places/boathouse/admit", { ...admission, worldScope: "other" })).statusCode, 409);
  assert.equal(calls, 1, "Admission and replay never generate content");
} finally {
  await fixture.stop();
}

const full = await packagedSceneServer({
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
    while (world.venues.length < 15)
      world.venues.push({
        ...structuredClone(world.venues[0]),
        id: "venue:" + world.venues.length,
        presentation: { ...world.venues[0].presentation, mapId: "map", x: 0.05, y: 0.05 },
      });
    for (const id of ["one", "two"]) {
      const place = establishPlace(
        world,
        { name: id, description: "An existing garden." },
        id,
        "map",
        "witnessed",
        now,
        true,
      );
      place.visited = true;
    }
  },
});
try {
  full.records.get("villages-active-venue").data = { sessionId: "", placeId: "" };
  const worldScope = (await full.app.inject({ method: "GET", url: "/api/villages/" })).json().worldScope;
  const responses = await Promise.all(
    ["one", "two"].map((id) =>
      full.app.inject({
        method: "POST",
        url: "/api/villages/places/" + id + "/admit",
        payload: {
          worldScope,
          requestId: id,
          classes: ["community"],
          expectedRevision: 1,
          expectedMapRevision: 0,
          mapId: "map",
          x: id === "one" ? 0.8 : 0.6,
          y: 0.8,
        },
      }),
    ),
  );
  assert.deepEqual(responses.map((row) => row.statusCode).sort(), [200, 409]);
  const state = fixtureVillageState(full.records.get("villages-village").data, full.records);
  assert.equal(state.venues.length, 16);
  assert.equal(Object.keys(state.worldPlaces.places).length, 1, "Rejected concurrent admission retains its Place");
  const waiting = Object.values(state.worldPlaces.places)[0];
  const capped = await full.app.inject({
    method: "POST",
    url: "/api/villages/places/" + waiting.id + "/admit",
    payload: {
      worldScope,
      requestId: "over-cap",
      classes: ["community"],
      expectedRevision: waiting.revision,
      expectedMapRevision: state.maps[0].revision,
      mapId: "map",
      x: 0.4,
      y: 0.8,
    },
  });
  assert.equal(capped.statusCode, 409, capped.body);
  assert.match(capped.body, /no room/);
} finally {
  await full.stop();
}
