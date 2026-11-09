import assert from "node:assert/strict";
import { packagedSceneServer } from "./fixtures/packaged-scene-server.fixture.js";
import { configureSceneCostWorld } from "./fixtures/scene-cost.fixture.js";
import { ensureNarrative } from "../packages/villages/src/server/domain/rules/narrative-development.js";

const prefixes: { content: string }[][] = [];
const calendars: string[] = [];
for (const [summary, change] of [
  ["Mist hides the far bank.", ""],
  ["The mist has lifted.", ""],
  ["The mist has lifted.", "policy"],
  ["The mist has lifted.", "movement"],
]) {
  const host = await packagedSceneServer({
    configure(world, now) {
      configureSceneCostWorld(world, now, "ordinary");
      world.setting = "AUTHORED RIVERSIDE SETTING";
      world.worldRules = "AUTHORED WORLD RULE";
      world.playerBackground = "AUTHORED PRIVATE BACKSTORY";
      if (change === "policy") world.venues[0].access!.managerIds = ["player"];
      ensureNarrative(world, now).situations.push({
        id: "mist",
        revision: 1,
        scope: "village",
        title: "River mist",
        summary,
        status: "active",
        targets: [],
        updatedAt: now,
      });
    },
    configureScene(scene) {
      if (change !== "movement") return;
      scene.zoneId = "exterior";
      for (const row of scene.accompanying ?? []) row.zoneId = "exterior";
      for (const row of scene.sceneAttendance!.occupants) row.zoneId = "exterior";
    },
  });
  host.model.chatComplete = async (messages: any[]) => {
    const prefix = messages.filter((row) => row.cacheBreakpoint);
    prefixes.push(prefix);
    const stable = JSON.stringify(prefix);
    for (const authored of [
      "AUTHORED RIVERSIDE SETTING",
      "AUTHORED WORLD RULE",
      "AUTHORED PRIVATE BACKSTORY",
      "AUTHORED DESCRIPTION END mara",
    ])
      assert(stable.includes(authored));
    assert(!stable.includes(summary), "Live circumstances cannot invalidate authored identity caching");
    const changing = messages
      .filter((row) => !row.cacheBreakpoint)
      .map((row) => row.content)
      .join("\n");
    assert(changing.includes(summary));
    assert(!changing.includes("Starting backstories describe"));
    assert(!changing.includes("AUTHORED PRIVATE BACKSTORY"));
    const packet = JSON.parse(changing.split("\n").find((row) => row.startsWith('{"context":'))!);
    calendars.push(packet.context.calendar.instant);
    const frame = JSON.parse(
      messages.flatMap((row) => row.content.split("\n")).find((row) => row.startsWith('{"frame":'))!,
    );
    assert(Array.isArray(frame.frame.accessManagement));
    assert.equal(packet.context.calendar.date.length, 10);
    assert.equal(messages.filter((row) => row.cacheBreakpoint).length, 3);
    assert(!changing.includes("manage-access roomEvent"));
    return {
      content: JSON.stringify({
        input: [{ text: "Hello." }],
        segments: [{ kind: "dialogue", speakerId: "mara", text: "Hello." }],
      }),
      finishReason: "stop",
    };
  };
  try {
    await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
    const response = await host.app.inject({
      method: "POST",
      url: "/api/villages/rooms/turn",
      payload: {
        sessionId: "browser",
        submissionId: "stable-prefix",
        message: "Hello.",
        mode: "chat",
        targetId: "",
        expectedSceneRevision: host.scene().sceneRevision,
      },
    });
    assert.equal(response.statusCode, 200, response.body);
  } finally {
    await host.stop();
  }
}
assert.deepEqual(prefixes[0], prefixes[1]);
assert.notEqual(calendars[0], calendars[1], "A new admitted clock does not invalidate the reference frame");
for (const changed of prefixes.slice(2)) {
  assert.deepEqual(changed.slice(0, 2), prefixes[0].slice(0, 2));
  assert.notDeepEqual(changed[2], prefixes[0][2], "Movement and policy changes must invalidate the current frame");
}
console.log(
  "Authored setting, player identity and complete cards keep identical prefixes across changing circumstances; current access policy uses the event contract.",
);
