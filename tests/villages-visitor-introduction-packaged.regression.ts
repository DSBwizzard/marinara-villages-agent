import assert from "node:assert/strict";
import { packagedSceneServer } from "./fixtures/packaged-scene-server.fixture.js";
import { fixtureSceneState, fixtureVillageState } from "./helpers/village-storage.fixture.js";
import { scenePromptPacket } from "./fixtures/villages-scene-writing.fixture.js";

let server = await packagedSceneServer({
  configure(world, stamp) {
    world.name = "Juniper Crossing";
    const offset = new Date(stamp).getUTCHours() - 12;
    world.timeZone = `Etc/GMT${offset >= 0 ? "+" : ""}${offset}`;
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
  const library = server.resources.listCharacters;
  let crowded = false;
  server.resources.listCharacters = async (...args: any[]) => {
    if (!crowded) {
      crowded = true;
      const row = server.records.get("villages-village");
      row.data.villagers[0].agenda.activeDay.blocks[0].venueId = publicVenue.id;
      row.data.villagers[0].agenda.activeDay.blocks[0].zoneId = "exterior";
      row.revision++;
    }
    return library(...args);
  };
  const deferred = await server.app.inject({
    method: "POST",
    url: "/api/villages/rooms",
    payload: { venueId: publicVenue.id, zoneId: "exterior" },
  });
  assert.equal(deferred.statusCode, 409, deferred.body);
  assert.match(deferred.body, /no longer quiet/);
  assert.equal(server.calls(), 0, "A late arrival defers Mari without a provider request");
  server.resources.listCharacters = library;
  const row = server.records.get("villages-village");
  row.data.villagers[0].agenda.activeDay.blocks[0].venueId = "mill";
  row.data.villagers[0].agenda.activeDay.blocks[0].zoneId = "common";
  row.revision++;
  const entered = await request("/rooms", { venueId: publicVenue.id, zoneId: "exterior" });
  let scene = entered.session;
  assert.equal(scene.visitorIntroduction, true);
  assert.equal(scene.status, "opening");
  assert.equal(scene.lines.length, 0);
  assert.deepEqual(scene.activeIds, ["__professor_mari__"]);
  assert.equal(server.calls(), 0, "Arrival and artwork make no model request");
  const premature = await server.app.inject({
    method: "POST",
    url: "/api/villages/rooms/end",
    payload: { sessionId: scene.id, expectedSceneRevision: scene.sceneRevision },
  });
  assert.equal(premature.statusCode, 409, premature.body);
  assert.equal(server.records.get("villages-village").data.visitorIntroduction.completedAt, "");
  const complete = server.model.chatComplete;
  server.model.chatComplete = async (messages: any[]) => {
    await complete(messages);
    const prompt = JSON.stringify(messages);
    assert.match(prompt, /Juniper Crossing/);
    assert(prompt.includes(publicVenue.name));
    assert.match(prompt, /personalized opening greeting/);
    assert.match(prompt, /warmly sarcastic/);
    assert.match(prompt, /GM-only/);
    assert.match(prompt, /prepared dialogue spoken entirely by MARI TO THE PLAYER/);
    assert.match(prompt, /Do not introduce the Visitor topic/);
    assert.match(prompt, /Do not generate, repeat, paraphrase or set up this middle section/);
    assert(
      !prompt.includes("player's fixed Visitor explanation") &&
        !prompt.includes("Do not explain the Visitor mechanics yourself"),
    );
    assert.match(prompt, /ONE final(?: ordinary main)? dialogue segment/);
    assert.match(prompt, /24 hours after this introduction finishes/);
    const timing = scenePromptPacket(messages.map((message: any) => message.content).join("\n"), "calendar");
    assert.equal(timing.founding.instant, world.setupAt);
    assert.equal(timing.founding.elapsedDays, 1);
    assert.equal(timing.founding.timeZone, timing.calendar.timeZone);
    assert(!prompt.includes("found the Village a day ago"));
    assert(!prompt.includes("They rented a room just outside"));
    return {
      content: JSON.stringify({
        segments: [
          {
            kind: "dialogue",
            speakerId: "__professor_mari__",
            text: "Juniper Crossing! A village with an entrance this inviting? The interface almost undersold you.",
            expression: "playful",
            look: { target: "player" },
          },
          {
            kind: "dialogue",
            speakerId: "__professor_mari__",
            text: "I'll be exploring Juniper Crossing until tomorrow. Do try the unsupervised dialogue options.",
          },
        ],
      }),
      finishReason: "stop",
      usage: { inputTokens: 10, outputTokens: 10 },
    };
  };
  scene = (await request("/rooms/greet", { sessionId: scene.id })).session;
  assert.equal(scene.status, "active");
  assert.equal((await request("/rooms/greet", { sessionId: scene.id })).session.id, scene.id);
  assert(scene.lines[0].content.includes("Juniper Crossing"));
  assert(
    scene.lines[0].staging.some(
      (cue: any) => cue.characterId === "__professor_mari__" && cue.expression && cue.look?.target === "player",
    ),
  );
  assert.equal(scene.lines[1].id, `${scene.id}-visitors-0`);
  assert(scene.lines.at(-2).content.includes("unsupervised dialogue options"));
  assert(scene.lines.at(-1).content.includes("look around the village"));
  const playbackOrder = scene.playback.moments.flatMap((moment: any) => moment.lineIds);
  assert(
    playbackOrder.indexOf(scene.lines.at(-2).id) > playbackOrder.indexOf(`${scene.id}-visitors-6`),
    "The actual playback places the farewell after the fixed explanation",
  );
  assert.equal(server.calls(), 1, "One saved generated opening precedes the fixed tutorial");
  const snapshot = await request("");
  assert.equal(
    snapshot.visitorNotice.venueId,
    publicVenue.id,
    "Find uses Mari's admitted entrance, not an ordinary trip destination",
  );
  assert.equal(snapshot.visitors[0].visit.introductory, true);
  assert.equal(snapshot.visitors[0].visit.offerHome, false);
  assert.equal(
    snapshot.visitors[0].missing,
    false,
    "The bundled guide remains available when the native card is absent",
  );
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
  await request("/rooms/greet", { sessionId: scene.id });
  assert.equal(server.calls(), 0, "Reload reuses the saved opening without buying another greeting");
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
  assert(
    stored.visitors[0].firstMetAt >= scene.startedAt,
    "The first meeting is recorded when Mari's greeting is accepted",
  );
  const closed = fixtureSceneState(server.records.get("villages-venue-visit-" + scene.id).data, server.records);
  assert.equal(closed.endReason, "scene");
  assert.equal(stored.visitors[0].trip.arrivedAt, closed.endedAt);
  assert.equal(Date.parse(stored.visitors[0].trip.leavesAt) - Date.parse(closed.endedAt), 86_400_000);
  const stay = await request("");
  assert.equal(stay.visitorNotice?.venueId, publicVenue.id);
  const normalComplete = server.model.chatComplete;
  server.model.chatComplete = async (messages: any[]) => {
    await normalComplete(messages);
    assert(
      !JSON.stringify(messages).includes("prepared dialogue spoken entirely by MARI TO THE PLAYER"),
      "Later Scenes are ordinary conversations",
    );
    return {
      content: JSON.stringify({
        segments: [
          { kind: "dialogue", speakerId: "__professor_mari__", text: "A lovely spot for a proper conversation." },
        ],
      }),
      finishReason: "stop",
      usage: { inputTokens: 10, outputTokens: 10 },
    };
  };
  let normal = (await request("/rooms", { venueId: stay.visitorNotice.venueId, zoneId: stay.visitorNotice.zoneId }))
    .session;
  assert(!normal.visitorIntroduction && normal.activeIds.includes("__professor_mari__"));
  normal = (await request("/rooms/greet", { sessionId: normal.id })).session;
  const conversation = await request("/rooms/turn", {
    sessionId: normal.id,
    submissionId: "mari-day-stay-chat",
    mode: "chat",
    targetId: "__professor_mari__",
    message: "What do you think of the garden?",
    expectedSceneRevision: normal.sceneRevision,
  });
  assert(conversation.session.lines.some((line: any) => line.content === "A lovely spot for a proper conversation."));
  await request("/rooms/end", { sessionId: normal.id, expectedSceneRevision: conversation.session.sceneRevision });
  server.model.chatComplete = normalComplete;
  const callsBeforeReplay = server.calls();
  const replayRoot = server.records.get("villages-village");
  const priorEpisode = fixtureVillageState(replayRoot.data, server.records).episodes.records.find(
    (row) => row.sceneId === scene.id,
  )!;
  assert(priorEpisode);
  const replayId = "mari-first-visit-explicit-replay";
  replayRoot.data.visitorIntroduction = { sceneId: replayId, completedAt: "" };
  replayRoot.data.visitors[0].incarnation = "mari-replay";
  delete replayRoot.data.visitors[0].firstMetAt;
  delete replayRoot.data.visitors[0].trip;
  replayRoot.revision++;
  const replayOpening = (await request("/rooms", { venueId: publicVenue.id, zoneId: "exterior" })).session;
  assert.equal(replayOpening.id, replayId, "A reserved introduction gets a fresh Scene and request identity");
  assert.equal(replayOpening.status, "opening");
  const replayComplete = server.model.chatComplete;
  server.model.chatComplete = async (messages: any[]) => {
    await replayComplete(messages);
    return {
      content: JSON.stringify({
        segments: [
          { kind: "dialogue", speakerId: "__professor_mari__", text: "A fresh hello." },
          { kind: "dialogue", speakerId: "__professor_mari__", text: "A fresh farewell. I'll be here another day." },
        ],
      }),
      finishReason: "stop",
      usage: { inputTokens: 10, outputTokens: 10 },
    };
  };
  const replay = (await request("/rooms/greet", { sessionId: replayId })).session;
  assert.equal(replay.lines[0].content, "A fresh hello.");
  assert(new Set(replay.lines.flatMap((line: any) => line.staging?.map((cue: any) => cue.expression) ?? [])).size >= 6);
  assert.deepEqual(
    fixtureVillageState(server.records.get("villages-village").data, server.records).episodes.records.find(
      (row) => row.id === priorEpisode.id,
    ),
    priorEpisode,
    "The replay never rewrites the prior accepted greeting",
  );
  await request("/rooms/end", { sessionId: replayId, expectedSceneRevision: replay.sceneRevision });
  const ordinary = await request("/rooms", { venueId: publicVenue.id, zoneId: "exterior" });
  assert.equal(
    ordinary.session.visitorIntroduction,
    undefined,
    "Normal play resumes without repeating Mari's introduction",
  );
  assert.equal(server.calls(), callsBeforeReplay + 1, "Only the explicit replay bought a new mocked greeting");
  await request("/rooms/end", {
    sessionId: ordinary.session.id,
    expectedSceneRevision: ordinary.session.sceneRevision,
  });
  await request("/setup/reset", {});
  const reset = server.records.get("villages-village").data;
  assert.equal(
    reset.visitors,
    undefined,
    "An explicit reset retires the prior world's Visitor identities and meetings",
  );
  assert.equal(reset.visitorIntroduction, undefined);
} finally {
  await server.stop();
}
server = await packagedSceneServer({
  configure(world, stamp) {
    world.setupAt = new Date(Date.parse(stamp) - 86_400_000).toISOString();
    world.visitorIntroduction = { sceneId: "", completedAt: "" };
  },
});
try {
  const initial = (await request("/rooms/active")).session;
  await request("/rooms/end", { sessionId: initial.id, expectedSceneRevision: initial.sceneRevision });
  const venue = server.records.get("villages-village").data.venues.find((row: any) => row.id !== "mill");
  let scene = (await request("/rooms", { venueId: venue.id, zoneId: "exterior" })).session;
  const complete = server.model.chatComplete;
  server.model.chatComplete = async (messages: any[]) => {
    await complete(messages);
    throw new Error("Synthetic greeting failure");
  };
  const failed = await server.app.inject({
    method: "POST",
    url: "/api/villages/rooms/greet",
    payload: { sessionId: scene.id },
  });
  assert.equal(failed.statusCode, 500, failed.body);
  scene = (await request("/rooms/active")).session;
  assert.equal(scene.status, "opening");
  assert.equal(scene.lines.length, 0);
  const ended = await server.app.inject({
    method: "POST",
    url: "/api/villages/rooms/end",
    payload: { sessionId: scene.id, expectedSceneRevision: scene.sceneRevision },
  });
  assert.equal(ended.statusCode, 409, ended.body);
  assert.equal(server.records.get("villages-village").data.visitorIntroduction.completedAt, "");
  scene = (await request("/rooms/continue", { sessionId: scene.id })).session;
  assert.equal(scene.status, "active");
  assert.equal(scene.lines[0].id, `${scene.id}-visitors-0`);
  assert.equal(server.calls(), 1, "Explicit fallback does not buy a replacement greeting");
  await request("/rooms/end", { sessionId: scene.id, expectedSceneRevision: scene.sceneRevision });
  assert(server.records.get("villages-village").data.visitorIntroduction.completedAt);
} finally {
  await server.stop();
}
console.log(
  "Packaged Mari introduction saves one personalized greeting before its fixed tutorial and resumes without another request.",
);

for (const advanceDays of [0, 60]) {
  let foundingAt = "";
  server = await packagedSceneServer({
    configure(world, stamp) {
      foundingAt = new Date(Date.parse(stamp) - (90 - advanceDays) * 86_400_000).toISOString();
      world.setupAt = foundingAt;
      world.timeZone = "Pacific/Kiritimati";
      world.visitorIntroduction = { sceneId: "", completedAt: "" };
      if (advanceDays)
        world.clock = {
          revision: 1,
          trustedAt: new Date(Date.parse(stamp) + advanceDays * 86_400_000).toISOString(),
          replayUntilDate: "",
          advanceMs: advanceDays * 86_400_000,
        };
    },
    configureScene(scene) {
      scene.startedAt = scene.lastActivityAt = new Date(
        Date.parse(scene.startedAt) + advanceDays * 86_400_000,
      ).toISOString();
    },
  });
  try {
    const initial = (await request("/rooms/active")).session;
    await request("/rooms/end", { sessionId: initial.id, expectedSceneRevision: initial.sceneRevision });
    const venue = server.records.get("villages-village").data.venues.find((row: any) => row.id !== "mill");
    const entered = (await request("/rooms", { venueId: venue.id, zoneId: "exterior" })).session;
    assert.equal(entered.visitorIntroduction, true, "Mari remains eligible months after founding");
    const complete = server.model.chatComplete;
    server.model.chatComplete = async (messages: any[]) => {
      await complete(messages);
      const prompt = messages.map((message) => message.content).join("\n");
      const timing = scenePromptPacket(prompt, "calendar");
      assert.equal(timing.founding.instant, foundingAt);
      assert.equal(timing.founding.elapsedDays, 90, "Founding age follows the Village clock, including its advance");
      assert.equal(timing.founding.timeZone, "Pacific/Kiritimati");
      assert.equal(timing.calendar.timeZone, timing.founding.timeZone);
      assert.equal(
        Math.floor((Date.parse(timing.calendar.instant) - Date.parse(timing.founding.instant)) / 86_400_000),
        90,
      );
      assert(!prompt.includes("found the Village a day ago"));
      assert.match(prompt, /Elapsed time does not establish that the player was absent/);
      return {
        content: JSON.stringify({
          segments: [
            { kind: "dialogue", speakerId: "__professor_mari__", text: "Juniper Crossing! Good to see the garden." },
            { kind: "dialogue", speakerId: "__professor_mari__", text: "I'll be looking around for another day." },
          ],
        }),
        finishReason: "stop",
        usage: { inputTokens: 10, outputTokens: 10 },
      };
    };
    const greeted = (await request("/rooms/greet", { sessionId: entered.id })).session;
    assert.equal(greeted.status, "active");
    assert.equal(server.calls(), 1);
    await request("/rooms/greet", { sessionId: entered.id });
    assert.equal(server.calls(), 1, "Reloading keeps the saved chronology without another request");
  } finally {
    await server.stop();
  }
}
