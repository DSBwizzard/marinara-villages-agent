// Test cases: scene-prefix/current-native-context
import assert from "node:assert/strict";
import { mock } from "node:test";
import { runCase } from "../scripts/test-cases.mjs";
import { packagedSceneServer } from "./fixtures/packaged-scene-server.fixture.js";
import { configureSceneCostWorld } from "./fixtures/scene-cost.fixture.js";
import { seedFoundingCircumstances } from "../packages/villages/src/server/domain/rules/founding-circumstances.js";
import { retainNativeFact } from "../packages/villages/src/server/domain/rules/native-continuity.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { continuityHolderKey, protectContinuity } from "../packages/villages/src/server/domain/rules/continuity.js";

await runCase("scene-prefix/current-native-context", async () => {
  const prefixes: { content: string }[][] = [],
    calendars: string[] = [];
  mock.timers.enable({ apis: ["Date"], now: new Date("2026-11-09T10:00:00.000Z") });
  try {
    for (const [summary, change] of [
      ["Mist hides the far bank.", ""],
      ["The mist has lifted.", ""],
      ["The mist has lifted.", "policy"],
      ["The mist has lifted.", "movement"],
      ["The mist has lifted.", "protected"],
      ["The mist has lifted.", "project"],
    ]) {
      const host = await packagedSceneServer({
        configure(world, now) {
          configureSceneCostWorld(world, now, change === "project" ? "project-discussion" : "ordinary");
          world.setting = "AUTHORED RIVERSIDE SETTING";
          world.worldRules = "AUTHORED WORLD RULE";
          world.playerBackground = "AUTHORED PRIVATE BACKSTORY";
          if (change === "policy") world.venues[0].access!.managerIds = ["player"];
          if (change === "protected") {
            const holder = continuityActor(world, "mara")!;
            retainNativeFact(
              world,
              {
                id: "private-greeting",
                kind: "initialization",
                targetId: "mara",
                revision: 1,
                text: "PRIVATE FORGOTTEN OBSERVATORY GREETING.",
                witnesses: ["mara"],
              },
              now,
              { class: "perspective", owner: holder },
            );
            const record = world.continuity.records.at(-1)!,
              key = continuityHolderKey(holder);
            world.continuity = protectContinuity(
              world.continuity,
              { id: record.id, recordRevision: record.revision, heads: { [key]: record.heads[key].revision } },
              [holder],
              "forget-private-greeting",
              now,
              { forget: true },
            );
          }
          seedFoundingCircumstances(
            world,
            [
              {
                id: "mist",
                revision: 1,
                scope: "village",
                title: "River mist",
                summary,
                status: "active",
                targets: [],
                updatedAt: now,
              },
            ],
            ["mara", "player"],
            now,
          );
        },
        configureScene(scene) {
          if (change !== "movement") return;
          scene.zoneId = "exterior";
          for (const row of scene.accompanying ?? []) row.zoneId = "exterior";
          for (const row of scene.sceneAttendance!.occupants) row.zoneId = "exterior";
        },
      });
      let calls = 0;
      host.model.chatComplete = async (messages: any[]) => {
        calls++;
        const prefix = messages.filter((row) => row.cacheBreakpoint),
          stable = JSON.stringify(prefix),
          changing = messages
            .filter((row) => !row.cacheBreakpoint)
            .map((row) => row.content)
            .join("\n");
        prefixes.push(prefix);
        for (const authored of [
          "AUTHORED RIVERSIDE SETTING",
          "AUTHORED WORLD RULE",
          "AUTHORED PRIVATE BACKSTORY",
          "AUTHORED DESCRIPTION END mara",
        ])
          assert(stable.includes(authored), authored + " belongs in the authored prefix");
        assert(!stable.includes(summary), "live circumstances cannot invalidate authored identity caching");
        assert(changing.includes(summary));
        assert(!stable.includes("Relevant Projects:"));
        assert.equal(changing.includes("Relevant Projects:"), change === "project");
        assert.equal(changing.includes("Larger Common room"), change === "project");
        assert(!changing.includes("AUTHORED PRIVATE BACKSTORY"));
        const activeContinuity = messages
          .flatMap((row) => row.content.split("\n"))
          .filter((line: string) => line.startsWith('{"privateContinuity":'))
          .map((line: string) => JSON.parse(line));
        assert(!JSON.stringify(activeContinuity).includes("PRIVATE FORGOTTEN OBSERVATORY GREETING"));
        const packet = messages
          .flatMap((row) => row.content.split("\n"))
          .filter((line: string) => line.startsWith('{"calendar":'))
          .map((line: string) => JSON.parse(line))[0];
        assert(packet?.calendar.instant, "the exact captured native clock remains available");
        calendars.push(packet.calendar.instant);
        assert.equal(packet.calendar.date.length, 10);
        assert(Array.isArray(packet.protections));
        assert.equal(packet.protections.length > 0, change === "protected");
        if (change === "protected")
          assert(
            packet.protections.some(
              (row: any) =>
                row.forgotten &&
                row.for === "mara" &&
                row.forbidden.includes("PRIVATE FORGOTTEN OBSERVATORY GREETING."),
            ),
          );
        assert(changing.includes("Scoped native access authority") || change === "policy");
        return {
          content: JSON.stringify({ segments: [{ kind: "dialogue", speakerId: "mara", text: "Morning." }] }),
          finishReason: "stop",
        };
      };
      try {
        const active = await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
        assert.equal(active.statusCode, 200, active.body);
        const answer = await host.app.inject({
          method: "POST",
          url: "/api/villages/rooms/turn",
          payload: {
            sessionId: "browser",
            submissionId: "f1111111-1111-4111-8111-111111111111",
            message: "Hello.",
            mode: "chat",
            targetId: "",
            expectedSceneRevision: host.scene().sceneRevision,
          },
        });
        assert.equal(answer.statusCode, 200, answer.body);
        assert.equal(calls, 1);
        assert.equal(host.scene().submissions.at(-1)!.acceptance.status, "applied");
      } finally {
        await host.stop();
      }
      mock.timers.tick(60000);
    }
    assert.deepEqual(prefixes[0], prefixes[1]);
    assert.notEqual(calendars[0], calendars[1], "the admitted clock can change independently of the authored prefix");
    for (const prefix of prefixes.slice(2)) assert.deepEqual(prefix.slice(0, 2), prefixes[0].slice(0, 2));
    assert.notDeepEqual(prefixes[3], prefixes[0], "actual Zone movement changes the Scene reference frame");
    assert.deepEqual(prefixes[4], prefixes[1], "native Forget protection stays outside the cached Scene frame");
    assert.deepEqual(prefixes[5], prefixes[1], "native Project authority stays outside the cached Scene frame");

    const group = await packagedSceneServer({
      configure(world, now) {
        configureSceneCostWorld(world, now, "multi-resident");
      },
    });
    const groupPrefixes: { content: string }[][] = [];
    group.model.chatComplete = async (messages: any[]) => {
      groupPrefixes.push(messages.filter((row) => row.cacheBreakpoint));
      return {
        content: JSON.stringify({ segments: [{ kind: "dialogue", speakerId: "bryn", text: "Morning." }] }),
        finishReason: "stop",
      };
    };
    try {
      for (const submissionId of ["f2222222-2222-4222-8222-222222222222", "f3333333-3333-4333-8333-333333333333"]) {
        const active = await group.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
        assert.equal(active.statusCode, 200, active.body);
        const answer = await group.app.inject({
          method: "POST",
          url: "/api/villages/rooms/turn",
          payload: {
            sessionId: "browser",
            submissionId,
            message: "Hello.",
            mode: "chat",
            targetId: "",
            expectedSceneRevision: group.scene().sceneRevision,
          },
        });
        assert.equal(answer.statusCode, 200, answer.body);
      }
      assert.equal(groupPrefixes.length, 2);
      assert.deepEqual(
        groupPrefixes[1].slice(0, groupPrefixes[0].length),
        groupPrefixes[0],
        "a new speaker cannot reorder the same cached cast",
      );
    } finally {
      await group.stop();
    }
  } finally {
    mock.timers.reset();
  }
});
