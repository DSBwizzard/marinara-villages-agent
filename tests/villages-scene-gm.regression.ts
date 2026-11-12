// Test cases: packaged-scene/ordinary, packaged-scene/invitation, packaged-scene/revoked, packaged-scene/refused, packaged-scene/banned, packaged-scene/escort-ban, packaged-scene/strict-reply
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { packagedSceneServer } from "./fixtures/packaged-scene-server.fixture.js";
import { fixtureVillageState } from "./helpers/village-storage.fixture.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import {
  applyAccessCommand,
  initializeVenueAccess,
} from "../packages/villages/src/server/domain/rules/venue-access.js";
import { actorEpisodeView } from "../packages/villages/src/server/domain/rules/episodes.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";

for (const scenario of ["ordinary", "invitation", "revoked", "refused", "banned", "escort-ban"])
  await runCase("packaged-scene/" + scenario, async () => {
    const invited = scenario !== "ordinary";
    const host = await packagedSceneServer({
      configure(world) {
        if (!invited) return;
        const venue = world.venues[0];
        venue.zones!.find((zone) => zone.id === "common")!.connectedTo!.push("hall");
        venue.zones!.push({
          ...defaultVenueSpace("other"),
          id: "hall",
          name: "Hall",
          kind: "public",
          description: "A corridor connects the common room and workshop.",
          connectedTo: ["common", "workshop"],
          access: {
            mode: "public",
            managerIds: ["player"],
            memberIds: ["player"],
            memberRoles: [],
            inviterIds: ["player"],
            visitorHours: "always",
            accompanied: false,
          },
        });
        venue.zones!.push({
          ...defaultVenueSpace("other"),
          id: "workshop",
          name: "Workshop",
          kind: "restricted",
          description: "A workbench stands beside a window.",
          connectedTo: ["hall"],
          seen: true,
          access: {
            mode: "permission-required",
            managerIds: ["mara"],
            memberIds: ["mara"],
            memberRoles: [],
            inviterIds: ["mara"],
            visitorHours: "always",
            accompanied: false,
          },
        });
        initializeVenueAccess(venue);
      },
    });
    let calls = 0;
    const message = invited
      ? "May I use your workshop?"
      : "  *I privately think about the silver key.* I ask, “Tea?”\n  🪑  ";
    host.model.chatComplete = async (messages: any[]) => {
      calls++;
      assert.equal(messages.at(-1).content, calls === 1 ? message : "Why?");
      if (calls === 2)
        assert(
          messages.some(
            (row) => row.role === "user" && row.content.includes('"gmPrivateInput":' + JSON.stringify(message)),
          ),
          "ordinary GM history preserves the complete earlier contribution",
        );
      return {
        finishReason: "stop",
        content: JSON.stringify({
          segments: [
            {
              id: "said",
              kind: "dialogue",
              speakerId: "mara",
              text: invited
                ? "Yes, come with me to the workshop now."
                : calls === 1
                  ? "Tea sounds good."
                  : "It is a quiet way to spend the afternoon.",
              ...(invited ? { requires: ["invite"] } : {}),
            },
          ],
          ...(invited
            ? {
                commands: [
                  {
                    id: "invite",
                    type: "access.decide",
                    by: "mara",
                    venue: "mill",
                    zone: "workshop",
                    decision: { outcome: "invite-now", visitor: "player", accompanies: true },
                    at: "said",
                    source: ["said"],
                  },
                ],
              }
            : {}),
        }),
        usage: { inputTokens: 10, outputTokens: 10 },
      };
    };
    try {
      const active = await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
      assert.equal(active.statusCode, 200, active.body);
      const payload = {
        sessionId: "browser",
        submissionId: invited ? "a2222222-2222-4222-8222-222222222222" : "a1111111-1111-4111-8111-111111111111",
        message,
        mode: "chat",
        targetId: "",
        expectedSceneRevision: host.scene().sceneRevision,
      };
      const response = await host.app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload });
      assert.equal(response.statusCode, 200, response.body);
      assert.equal(calls, 1, "one package-level GM call publishes the complete turn");
      const saved = host.scene(),
        turn = saved.submissions.at(-1)!;
      assert.equal(turn.message, message);
      assert.equal(turn.acceptance.status, "applied");
      const input = saved.lines.find((line) => line.inputOf === turn.id)!;
      assert.equal(input.content, message);
      assert.equal(input.kind, "input");
      assert.deepEqual(input.heardBy, []);
      const world = fixtureVillageState(host.records.get("villages-village").data, host.records);
      const episode = world.episodes.records.find((episode) => episode.id === turn.episodeId)!;
      assert.equal(episode.privateInput, message);
      assert(
        !JSON.stringify(
          actorEpisodeView(episode, world.continuity, continuityActor(world, "mara")!, world.episodes),
        ).includes("silver key"),
        "the original private thought is not automatic character evidence",
      );
      const replay = await host.app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload });
      assert.equal(replay.statusCode, 200, replay.body);
      assert.equal(calls, 1, "replay cannot repurchase or reinterpret an accepted response");
      assert.equal(host.scene().submissions.length, 1);
      if (invited) {
        const permission = world.venues[0].access!.permissions.find((row) => row.zoneId === "workshop")!;
        assert.equal(permission.duration, "visit");
        assert.equal(permission.sceneId, "browser");
        assert.equal(permission.accompaniedBy, "mara");
        const view = await host.app.inject({ method: "GET", url: "/api/villages" });
        assert.equal(view.statusCode, 200, view.body);
        const entry = view.json().sceneVenue.venue.zones.find((zone: any) => zone.id === "workshop").accessView;
        assert(entry.decision.allowed, JSON.stringify(entry));
        assert.equal(
          host.scene().accompanying?.find((row) => row.characterId === "mara")?.zoneId,
          "common",
          "previewing entry does not move the escort",
        );
        const deny = async () => {
          const root = await host.documents.getById("villages", "villages-village");
          const venue = root.data.venues[0];
          applyAccessCommand(
            venue,
            {
              action:
                scenario === "revoked" || scenario === "invitation"
                  ? "revoke"
                  : scenario === "refused"
                    ? "refuse-entry"
                    : "ban",
              operationId: "concurrent-access-change",
              expectedRevision: venue.access.revision,
              zoneId: scenario === "escort-ban" ? "hall" : "workshop",
              ...(scenario === "revoked" || scenario === "invitation"
                ? { permissionId: permission.id }
                : { visitorId: scenario === "escort-ban" ? "mara" : "player" }),
              ...(scenario === "refused" ? { sceneId: "browser" } : {}),
            } as any,
            scenario === "escort-ban" ? "player" : "mara",
            new Date().toISOString(),
            ["player", "mara"],
            ["concurrent-native-change"],
          );
          assert(await host.documents.update({ ...root, expectedRevision: root.revision }));
        };
        if (scenario !== "invitation") await deny();
        const movePayload = {
          sessionId: "browser",
          zoneId: "workshop",
          expectedSceneRevision: host.scene().sceneRevision,
          operationId: "c2222222-2222-4222-8222-222222222222",
        };
        const moved = await host.app.inject({
          method: "POST",
          url: "/api/villages/rooms/zone",
          payload: movePayload,
        });
        if (scenario !== "invitation") {
          assert.equal(moved.statusCode, 409, moved.body);
          assert.equal(host.scene().zoneId, "common");
          assert.equal(host.scene().accompanying?.find((row) => row.characterId === "mara")?.zoneId, "common");
          assert(!host.scene().navigationReceipts?.some((row) => row.id === movePayload.operationId));
          assert.equal(calls, 1, "a failed free Move never purchases a replacement narration");
          return;
        }
        assert.equal(moved.statusCode, 200, moved.body);
        assert.equal(host.scene().zoneId, "workshop");
        assert.equal(host.scene().accompanying?.find((row) => row.characterId === "mara")?.zoneId, "workshop");
        assert.equal(calls, 1, "using an accepted native invitation makes no model call");
        await deny();
        const movedAgain = await host.app.inject({
          method: "POST",
          url: "/api/villages/rooms/zone",
          payload: movePayload,
        });
        assert.equal(movedAgain.statusCode, 200, movedAgain.body);
        assert.equal(
          host.scene().navigationReceipts!.filter((row) => row.id === movePayload.operationId).length,
          1,
          "a later revocation cannot erase or repeat an already completed Move",
        );
        assert.equal(host.scene().zoneId, "workshop");
        assert.equal(calls, 1);
        const returned = await host.app.inject({
          method: "POST",
          url: "/api/villages/rooms/zone",
          payload: {
            ...movePayload,
            zoneId: "common",
            expectedSceneRevision: host.scene().sceneRevision,
            operationId: "e2222222-2222-4222-8222-222222222222",
          },
        });
        assert.equal(returned.statusCode, 200, returned.body);
        const delayed = await host.app.inject({
          method: "POST",
          url: "/api/villages/rooms/zone",
          payload: movePayload,
        });
        assert.equal(delayed.statusCode, 200, delayed.body);
        assert.equal(host.scene().zoneId, "common", "a delayed completed Move cannot reverse newer navigation");
        assert.equal(host.scene().navigationReceipts!.length, 2);
        assert.equal(calls, 1);
      } else {
        const next = await host.app.inject({
          method: "POST",
          url: "/api/villages/rooms/turn",
          payload: {
            ...payload,
            submissionId: "b1111111-1111-4111-8111-111111111111",
            expectedSceneRevision: host.scene().sceneRevision,
            message: "Why?",
          },
        });
        assert.equal(next.statusCode, 200, next.body);
        assert.equal(calls, 2);
        assert.equal(host.scene().submissions.at(-1)!.message, "Why?");
      }
    } finally {
      await host.stop();
    }
  });

await runCase("packaged-scene/strict-reply", async () => {
  const host = await packagedSceneServer();
  let calls = 0;
  host.model.chatComplete = async () => {
    calls++;
    return {
      finishReason: "stop",
      content: JSON.stringify({
        input: [{ kind: "speech", text: "A retired inventory." }],
        segments: [{ kind: "dialogue", speakerId: "mara", text: "Unsupported reply." }],
      }),
    };
  };
  try {
    const active = await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
    assert.equal(active.statusCode, 200, active.body);
    const response = await host.app.inject({
      method: "POST",
      url: "/api/villages/rooms/turn",
      payload: {
        sessionId: "browser",
        submissionId: "d1111111-1111-4111-8111-111111111111",
        message: "Hello.",
        mode: "chat",
        targetId: "",
        expectedSceneRevision: host.scene().sceneRevision,
      },
    });
    assert(response.statusCode >= 400, response.body);
    assert.equal(calls, 1, response.body);
    assert.equal(host.scene().submissions.length, 1, "the admitted original input remains available for recovery");
    assert.notEqual(host.scene().submissions[0].acceptance.status, "applied");
    assert.equal(host.scene().submissions[0].episodeId, undefined);
    assert(!host.scene().lines.some((line) => line.content === "Unsupported reply."));
    assert(host.scene().operation, "invalid paid output stays recoverable without a classification adapter");
  } finally {
    await host.stop();
  }
});
