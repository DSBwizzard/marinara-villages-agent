import assert from "node:assert/strict";
import { packagedSceneServer } from "./fixtures/packaged-scene-server.fixture.js";

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
          : { place: { name: "Nearby garden", description: "A public garden beside the road." } },
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
  const retried = await explore("retry-once");
  assert.equal(retried.json().status, "ready", retried.body);
  assert.equal(calls, beforeRetry + 2, "One failed completion gets one automatic retry");
  await explore("retry-once");
  assert.equal(calls, beforeRetry + 2, "Replaying an admitted request makes no additional call");
  invalid = true;
  const beforeInvalid = calls;
  const repaired = await explore("invalid-output");
  assert.equal(repaired.json().status, "ready", repaired.body);
  assert.equal(calls, beforeInvalid + 2, "An unusable answer also receives just one retry");
  failures = 1;
  const beforeShared = calls;
  const shared = await Promise.all([explore("shared-retry"), explore("shared-retry"), explore("shared-retry")]);
  for (const result of shared) assert.equal(result.json().status, "ready", result.body);
  assert.equal(calls, beforeShared + 2, "Duplicate requests join the same successful retry");
  failures = 100;
  const beforeFailure = calls;
  const failed = await Promise.all([explore("give-up"), explore("give-up"), explore("give-up")]);
  for (const result of failed) {
    assert.equal(result.statusCode, 200, result.body);
    assert.equal(result.json().status, "failed");
    assert.doesNotMatch(result.body, /private provider|error/iu);
  }
  assert.equal(calls, beforeFailure + 2, "Duplicate requests share the same two-dispatch budget");
  await explore("give-up");
  assert.equal(calls, beforeFailure + 2, "Failed requests cannot resume or purchase a third response");
} finally {
  await fixture.stop();
}
