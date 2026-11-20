import assert from "node:assert/strict";
import { packagedSceneServer } from "./fixtures/packaged-scene-server.fixture.js";
import { fixtureSceneState } from "./helpers/village-storage.fixture.js";

let server = await packagedSceneServer({
  configure(world, stamp) {
    world.name = "Juniper Crossing";
    world.setupAt = new Date(Date.parse(stamp) - 86_400_000).toISOString();
    world.visitorIntroduction = { sceneId: "", completedAt: "" };
    world.spontaneousEvents = true;
  },
});
const request = async (path: string, payload?: object) => {
  const response = await server.app.inject({ method: payload ? "POST" : "GET", url: "/api/villages" + path, payload });
  assert.equal(response.statusCode, 200, response.body);
  return response.json();
};
try {
  const resumed = await request("/rooms", { venueId: "mill", zoneId: "common" });
  assert.equal(resumed.session.id, "browser", "An existing Scene is never interrupted");
  await request("/rooms/end", { sessionId: "browser", expectedSceneRevision: resumed.session.sceneRevision });
  const world = server.records.get("villages-village").data;
  const publicVenue = world.venues.find((venue: any) => venue.id !== "mill");
  const entered = await request("/rooms", { venueId: publicVenue.id, zoneId: "exterior" });
  const scene = entered.session;
  assert.equal(scene.visitorIntroduction, true);
  assert.equal(scene.status, "active");
  assert.deepEqual(scene.activeIds, ["__professor_mari__"]);
  assert.equal((await request("/rooms/greet", { sessionId: scene.id })).session.id, scene.id);
  assert(scene.lines.some((line: any) => line.content.includes("Juniper Crossing")));
  assert.equal(server.calls(), 0, "Script, artwork and arrival dispatch no model request");
  const snapshot = await request("");
  assert.equal(
    snapshot.visitorNotice.venueId,
    publicVenue.id,
    "Find uses Mari's admitted entrance, not an ordinary trip destination",
  );
  assert.equal(snapshot.visitors[0].visit.introductory, true);
  assert.equal(snapshot.visitors[0].visit.offerHome, false);
  const ids = scene.lines.map((line: any) => line.id);
  // Simulate loss of the entry reply and pointer after the immutable Scene has saved.
  const pointer = server.records.get("villages-active-venue");
  pointer.data = { sessionId: "", placeId: "" };
  pointer.revision++;
  const records = server.records;
  await server.stop();
  server = await packagedSceneServer({ records });
  const recovered = await request("/rooms", { venueId: publicVenue.id, zoneId: "exterior" });
  assert.equal(recovered.session.id, scene.id);
  assert.deepEqual(
    recovered.session.lines.map((line: any) => line.id),
    ids,
    "Recovery keeps the exact script and source",
  );
  const active = await request("/rooms/active");
  assert.equal(active.session.id, scene.id, "Reload restores the introduction until the player concludes it");
  assert.deepEqual(active.session.activeIds, ["__professor_mari__"], "Attendance cannot replace the scripted cast");
  const message = await server.app.inject({
    method: "POST",
    url: "/api/villages/rooms/turn",
    payload: {
      sessionId: scene.id,
      submissionId: "intro-message",
      mode: "chat",
      targetId: "",
      message: "Hello",
      expectedSceneRevision: active.session.sceneRevision,
    },
  });
  assert.equal(message.statusCode, 409, message.body);
  assert.match(message.body, /introduction/);
  assert.equal(server.calls(), 0);
  await request("/rooms/end", { sessionId: scene.id, expectedSceneRevision: active.session.sceneRevision });
  const stored = server.records.get("villages-village").data;
  assert(stored.visitorIntroduction.completedAt);
  assert.equal(stored.visitors[0].firstMetAt, scene.startedAt);
  const closed = fixtureSceneState(server.records.get("villages-venue-visit-" + scene.id).data, server.records);
  assert.equal(closed.endReason, "scene");
  const ordinary = await request("/rooms", { venueId: publicVenue.id, zoneId: "exterior" });
  assert.equal(
    ordinary.session.visitorIntroduction,
    undefined,
    "Normal play resumes without repeating Mari's introduction",
  );
  assert.equal(server.calls(), 0);
} finally {
  await server.stop();
}
console.log(
  "Packaged Mari introduction survives restart, preserves its script, concludes once, and makes no provider requests.",
);
