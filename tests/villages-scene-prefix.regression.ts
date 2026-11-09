import assert from "node:assert/strict";
import { packagedSceneServer } from "./fixtures/packaged-scene-server.fixture.js";
import { configureSceneCostWorld } from "./fixtures/scene-cost.fixture.js";
import { ensureNarrative } from "../packages/villages/src/server/domain/rules/narrative-development.js";

const prefixes: unknown[] = [];
for (const summary of ["Mist hides the far bank.", "The mist has lifted."]) {
  const host = await packagedSceneServer({
    configure(world, now) {
      configureSceneCostWorld(world, now, "ordinary");
      world.setting = "AUTHORED RIVERSIDE SETTING";
      world.worldRules = "AUTHORED WORLD RULE";
      world.playerBackground = "AUTHORED PRIVATE BACKSTORY";
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
    assert(Array.isArray(packet.context.accessManagement));
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
console.log(
  "Authored setting, player identity and complete cards keep identical prefixes across changing circumstances; current access policy uses the event contract.",
);
