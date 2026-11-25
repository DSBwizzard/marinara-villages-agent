// Test cases: native-exchange/before-world, native-exchange/after-world, native-exchange/before-scene, native-exchange/after-scene
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { packagedSceneServer } from "./fixtures/packaged-scene-server.fixture.js";
import { fixtureVillageState, fixtureSceneState } from "./helpers/village-storage.fixture.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { continuityViews } from "../packages/villages/src/server/domain/rules/continuity.js";
for (const fault of ["before-world", "after-world", "before-scene", "after-scene"])
  await runCase("native-exchange/" + fault, async () => {
    const host = await packagedSceneServer({
      configure(world) {
        world.venues[0].access!.managerIds = ["mara"];
      },
    });
    let calls = 0,
      armed = false,
      failed = false,
      afterCommitFault = false;
    host.model.chatComplete = async () => {
      calls++;
      armed = true;
      return {
        finishReason: "stop",
        content: JSON.stringify({
          segments: [
            {
              id: "said",
              kind: "dialogue",
              speakerId: "mara",
              text: "You have standing permission to visit the Common room. I prefer ginger tea.",
              requires: ["grant", "note"],
            },
          ],
          commands: [
            {
              id: "grant",
              type: "permission.grant",
              by: "mara",
              visitor: "player",
              venue: "mill",
              zone: "common",
              at: "said",
              source: ["said"],
            },
          ],
          keep: [
            {
              id: "note",
              for: ["mara", "player"],
              class: "information",
              text: "Mara prefers ginger tea.",
              source: ["said"],
            },
          ],
        }),
      };
    };
    const update = host.documents.update;
    host.documents.update = async (input: any) => {
      let selected = false;
      if (armed && !failed && input.id === "villages-village" && fault.endsWith("world"))
        selected = JSON.stringify(input.data.memoryHead) !== JSON.stringify(host.records.get(input.id).data.memoryHead);
      if (armed && !failed && input.id === "villages-venue-visit-browser" && fault.endsWith("scene"))
        selected = fixtureSceneState(input.data, host.records).submissions.some(
          (turn) => turn.acceptance.status === "applied",
        );
      if (selected) {
        failed = true;
        if (fault.startsWith("before")) throw Error("Synthetic publication interruption");
      }
      const saved = await update(input);
      if (selected && fault.startsWith("after")) {
        assert(saved, "an after-commit interruption requires a successful CAS");
        afterCommitFault = true;
        throw Error("Synthetic lost publication acknowledgement");
      }
      return saved;
    };
    try {
      const active = await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
      assert.equal(active.statusCode, 200, active.body);
      const payload = {
        sessionId: "browser",
        submissionId: "a1111111-1111-4111-8111-111111111111",
        message: "I ask about tea and permission.",
        mode: "chat",
        targetId: "",
        expectedSceneRevision: host.scene().sceneRevision,
      };
      const first = await host.app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload });
      assert(failed, "the requested native publication boundary was exercised");
      if (fault.startsWith("after")) assert(afterCommitFault, "the lost acknowledgement followed a committed row");
      assert.equal(calls, 1);
      const pendingWorld = fixtureVillageState(host.records.get("villages-village").data, host.records);
      const noteCount = pendingWorld.continuity.records.filter((record) =>
        Object.values(record.heads).some((head) =>
          pendingWorld.continuity.versions.some(
            (version) => version.id === head.versionId && version.text === "Mara prefers ginger tea.",
          ),
        ),
      ).length;
      assert.equal(
        pendingWorld.venues[0].access!.permissions.length,
        noteCount,
        "native permission and common meaning publish together despite lost acknowledgement",
      );
      if (first.statusCode !== 200)
        assert.equal(
          host.scene().submissions[0].message,
          payload.message,
          "the admitted original survives interrupted publication",
        );
      const lostBeforeCommit = fault === "before-world";
      assert.equal(noteCount, lostBeforeCommit ? 0 : 1, "Only a world commit makes the reply recoverable");
      const duplicate = await host.app.inject({
        method: "POST",
        url: "/api/villages/rooms/turn",
        payload: { ...payload, retryOfAttemptId: host.scene().operation?.attemptId },
      });
      assert.equal(duplicate.statusCode, lostBeforeCommit ? 502 : 200, duplicate.body);
      assert.equal(calls, 1, "A duplicate does not purchase a reply");
      const committedInput = lostBeforeCommit
        ? { ...payload, submissionId: "b2222222-2222-4222-8222-222222222222" }
        : payload;
      if (lostBeforeCommit) {
        const saved = host.scene();
        assert.equal(saved.submissions[0].acceptance.status, "abandoned");
        assert.equal(saved.submissions[0].narration, undefined);
        const retry = await host.app.inject({
          method: "POST",
          url: "/api/villages/rooms/turn",
          payload: {
            ...committedInput,
            replaceOfOperationId: payload.submissionId,
            retryOfAttemptId: saved.operation?.attemptId,
            expectedSceneRevision: saved.sceneRevision,
          },
        });
        assert.equal(retry.statusCode, 200, retry.body);
      }
      const scene = host.scene(),
        world = fixtureVillageState(host.records.get("villages-village").data, host.records);
      assert.deepEqual(
        scene.submissions.filter((entry) => entry.acceptance.status === "applied").map((entry) => entry.id),
        [committedInput.submissionId],
      );
      assert.equal(world.episodes.records.filter((episode) => episode.sceneId === "browser").length, 1);
      assert.equal(
        world.venues[0].access!.permissions.filter((permission) => permission.visitorId === "player").length,
        1,
      );
      for (const id of ["mara", "player"])
        assert.equal(
          continuityViews(world.continuity, continuityActor(world, id)!, scene.startedAt, new Set()).filter(
            (view) => view.version.text === "Mara prefers ginger tea.",
          ).length,
          1,
        );
      const replay = await host.app.inject({
        method: "POST",
        url: "/api/villages/rooms/turn",
        payload: committedInput,
      });
      assert.equal(replay.statusCode, 200, replay.body);
      assert.equal(calls, lostBeforeCommit ? 2 : 1, "Only Retry after a lost reply purchases again");
    } finally {
      await host.stop();
    }
  });
