import assert from "node:assert/strict";
import { packagedSceneServer } from "./fixtures/packaged-scene-server.fixture.js";
import { authorVillageFixture, storedVillage } from "./helpers/village-storage.fixture.js";

const fixture = await packagedSceneServer();
try {
  const row = fixture.records.get("villages-village");
  row.data.maps = [
    {
      id: "map",
      name: "Map",
      artwork: { id: "map-art", ref: "global-gallery:map-art", url: "/api/global-gallery/file/map-art.png" },
      width: 100,
      height: 100,
      revision: 0,
    },
  ];
  row.revision++;
  const snapshot = await fixture.app.inject({ method: "GET", url: "/api/villages/" });
  assert.equal(snapshot.statusCode, 200, snapshot.body);
  const worldScope = snapshot.json().worldScope;
  let calls = 0;
  let failures = 0;
  let invalid = false;
  fixture.model.chatComplete = async (messages: any[]) => {
    calls++;
    assert.match(messages[0].content, /json/iu, "JSON-mode providers require an explicit JSON instruction");
    if (failures-- > 0) throw new Error("private provider failure");
    if (invalid) {
      invalid = false;
      return { content: "not JSON", finishReason: "stop" } as any;
    }
    const input = JSON.parse(messages[1].content);
    return {
      content: JSON.stringify(
        input.intent === "A duck"
          ? { place: null }
          : { place: { name: input.intent || "Nearby garden", description: "A public garden beside the road." } },
      ),
      finishReason: "stop",
    } as any;
  };
  const explore = (requestId: string, intent = "") =>
    fixture.app.inject({
      method: "POST",
      url: "/api/villages/places/explore",
      payload: { worldScope, requestId, mapId: "map", intent },
    });
  const nearby = await explore("nearby");
  assert.equal(nearby.statusCode, 200, nearby.body);
  assert.equal(nearby.json().status, "ready");
  assert.ok(nearby.json().placeId);
  assert.equal(calls, 1, "Blank input can discover a nearby Place");
  const duck = await explore("duck", "A duck");
  assert.equal(duck.json().status, "ready");
  assert.equal(duck.json().placeId, "", "No location is a valid result");
  failures = 1;
  const beforeRetry = calls;
  const rejected = await explore("provider-failure");
  assert.equal(rejected.json().status, "failed", rejected.body);
  assert.equal(calls, beforeRetry + 1, "A provider failure does not dispatch Explore again");
  await explore("provider-failure");
  assert.equal(calls, beforeRetry + 1, "Replaying an admitted request makes no additional call");
  const another = await explore("new-action", "A duck");
  assert.equal(another.json().status, "ready", another.body);
  assert.equal(calls, beforeRetry + 2, "A new Explore action can dispatch again");
  invalid = true;
  const beforeInvalid = calls;
  const malformed = await explore("invalid-output");
  assert.equal(malformed.json().status, "failed", malformed.body);
  assert.equal(calls, beforeInvalid + 1, "An unusable answer receives no automatic retry");
  const beforeShared = calls;
  const shared = await Promise.all([
    explore("shared", "A greenhouse"),
    explore("shared", "A greenhouse"),
    explore("shared", "A greenhouse"),
  ]);
  for (const result of shared) assert.equal(result.json().status, "ready", result.body);
  const sharedIds = shared.map((result) => result.json().placeId);
  assert.ok(sharedIds[0]);
  assert.equal(new Set(sharedIds).size, 1, "Concurrent copies recover the same discovery");
  assert.equal(calls, beforeShared + 1, "Duplicate requests share one dispatch");
  failures = 100;
  const beforeFailure = calls;
  const failed = await Promise.all([explore("give-up"), explore("give-up"), explore("give-up")]);
  for (const result of failed) {
    assert.equal(result.statusCode, 200, result.body);
    assert.equal(result.json().status, "failed");
    assert.doesNotMatch(result.body, /private provider|error/iu);
  }
  assert.equal(calls, beforeFailure + 1, "Duplicate failed requests still share one dispatch");
  await explore("give-up");
  assert.equal(calls, beforeFailure + 1, "Failed requests cannot purchase another response");

  const editOperation = (id: string, status: "started" | "failed", attempt: number) => {
    const row = fixture.records.get("villages-village");
    const world = storedVillage(fixture.records);
    Object.assign(world.worldPlaces.operations[id], { status, attempt });
    world.worldPlaces.revision++;
    row.data = authorVillageFixture(fixture.records, world);
    row.revision++;
  };
  editOperation("give-up", "started", 1);
  assert.equal((await explore("give-up")).json().status, "failed", "An uncertain receipt cannot dispatch again");
  editOperation("give-up", "started", 2);
  assert.equal((await explore("give-up")).json().status, "failed", "An older second attempt can only recover a result");
  assert.equal(calls, beforeFailure + 1);

  editOperation("duck", "failed", 1);
  fixture.model.fitContext = () => {
    throw new Error("The saved result should bypass provider preparation");
  };
  assert.equal((await explore("duck", "A duck")).json().status, "ready", "A failed operation can adopt a saved result");

  const rewound = storedVillage(fixture.records);
  delete rewound.worldPlaces.operations.duck;
  rewound.worldPlaces.revision++;
  const rowAfterReplay = fixture.records.get("villages-village");
  rowAfterReplay.data = authorVillageFixture(fixture.records, rewound);
  rowAfterReplay.revision++;
  assert.equal((await explore("duck", "A new grove")).json().status, "failed", "A rewind cannot rebind a paid result");
  assert.equal(calls, beforeFailure + 1);
} finally {
  await fixture.stop();
}
