// Test cases: packaged-scene/ordinary, packaged-scene/invitation, packaged-scene/revoked, packaged-scene/refused, packaged-scene/banned, packaged-scene/escort-ban, packaged-scene/strict-reply, packaged-scene/spoken-visit, packaged-scene/retry-held-agreement
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
import { agendaFixture } from "./helpers/agenda.fixture.js";
import { sceneResend } from "../packages/villages/src/client/features/scenes/villages-venue-send.js";

await runCase("packaged-scene/retry-held-agreement", async () => {
  const host = await packagedSceneServer();
  let calls = 0;
  const text = "You can stay on the couch tonight.";
  host.model.chatComplete = async () => ({
    finishReason: "stop",
    content: JSON.stringify({
      segments: [{ id: "reply", kind: "dialogue", speakerId: "mara", text: ++calls === 1 ? text : "Let's talk." }],
      ...(calls === 1 && {
        keep: [
          {
            id: "agreement",
            for: ["player", "mara"],
            class: "commitment",
            text,
            source: [{ segment: "reply", act: "offer" }],
            offer: { proposer: "mara", participants: ["mara", "player"], contributions: [] },
          },
        ],
      }),
    }),
  });
  try {
    const active = await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
    assert.equal(active.statusCode, 200, active.body);
    const payload = {
      sessionId: "browser",
      submissionId: "a4444444-4444-4444-8444-444444444444",
      message: "Can I stay tonight?",
      mode: "chat",
      targetId: "",
      expectedSceneRevision: host.scene().sceneRevision,
    };
    const post = (body: typeof payload) =>
      host.app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload: body });
    const failed = await post(payload);
    assert(failed.statusCode >= 400, failed.body);
    assert.equal(host.scene().submissions[0].acceptance.status, "held");
    assert.equal(calls, 1);
    const details = await host.app.inject({ method: "GET", url: "/api/villages/rooms/browser/operation" });
    assert.equal(details.statusCode, 200, details.body);
    const { operation } = details.json();
    assert.equal(operation.acceptance, "held");
    const resend = sceneResend(operation, payload, payload.submissionId);
    assert.notEqual(resend.submissionId, payload.submissionId);
    const sent = await post({ ...payload, ...resend });
    assert.equal(sent.statusCode, 200, sent.body);
    assert.equal(calls, 2, "the unchanged Send makes exactly one new attempt");
    assert.deepEqual(
      host.scene().submissions.map(({ acceptance }) => acceptance.status),
      ["abandoned", "applied"],
    );
    assert(
      !host.scene().lines.some((line) => line.content === text),
      "the invalid agreement never becomes Scene dialogue",
    );
  } finally {
    await host.stop();
  }
});

await runCase("packaged-scene/spoken-visit", async () => {
  const host = await packagedSceneServer({
    configure(world, now) {
      const venue = world.venues[0];
      const room = venue.zones!.find((zone) => zone.id === "common")!;
      room.kind = "shared-residence";
      room.name = "Living Room";
      initializeVenueAccess(venue);
      room.access = {
        mode: "permission-required",
        managerIds: ["mara"],
        memberIds: ["mara"],
        memberRoles: [],
        inviterIds: [],
        visitorHours: "always",
        accompanied: false,
      };
      world.villagers[0].agenda = agendaFixture({
        generatedAt: now,
        activeDay: {
          dateKey: now.slice(0, 10),
          weekday: new Intl.DateTimeFormat("en", { weekday: "long", timeZone: "UTC" }).format(new Date(now)),
          scheduleInformed: false,
          blocks: [{ startMinute: 0, endMinute: 1440, venueId: venue.id, zoneId: "exterior", activity: "Free time" }],
        },
      });
    },
    configureScene(scene) {
      scene.zoneId = "exterior";
      scene.area = "outside";
      scene.accompanying![0].zoneId = "exterior";
      scene.sceneAttendance!.occupants[0].zoneId = "exterior";
    },
  });
  let calls = 0;
  host.model.chatComplete = async () => {
    calls++;
    return {
      finishReason: "stop",
      content: JSON.stringify({
        segments: [
          {
            kind: "dialogue",
            id: "welcome",
            speakerId: "mara",
            text: "Come on. I'll hold the door for you.",
          },
          { kind: "dialogue", speakerId: "mara", text: "What did you want to talk about?" },
        ],
        commands: [{ type: "guest.invite", at: "welcome" }],
      }),
      usage: { inputTokens: 10, outputTokens: 10 },
    };
  };
  try {
    const active = await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
    assert.equal(active.statusCode, 200, active.body);
    const turn = await host.app.inject({
      method: "POST",
      url: "/api/villages/rooms/turn",
      payload: {
        sessionId: "browser",
        submissionId: "a3333333-3333-4333-8333-333333333333",
        message: '"Thanks. Can I actually come inside? Could we talk?"',
        mode: "chat",
        targetId: "",
        expectedSceneRevision: host.scene().sceneRevision,
      },
    });
    assert.equal(turn.statusCode, 200, turn.body);
    const view = await host.app.inject({ method: "GET", url: "/api/villages" });
    assert.equal(view.statusCode, 200, view.body);
    const access = view.json().sceneVenue.venue.zones.find((zone: { id: string }) => zone.id === "common").accessView;
    assert.equal(access.decision.allowed, true);
    const changes = await host.app.inject({ method: "GET", url: "/api/villages/rooms/browser/changes" });
    assert.equal(changes.statusCode, 200, changes.body);
    assert.deepEqual(
      changes
        .json()
        .notices.flatMap((notice: { accessChanges?: { entry: { room: string; kind: string } }[] }) =>
          (notice.accessChanges ?? []).map(({ entry }) => [entry.room, entry.kind]),
        ),
      [["Living Room", "visit"]],
    );
    const move = await host.app.inject({
      method: "POST",
      url: "/api/villages/rooms/zone",
      payload: {
        sessionId: "browser",
        zoneId: "common",
        expectedSceneRevision: host.scene().sceneRevision,
        operationId: "c3333333-3333-4333-8333-333333333333",
      },
    });
    assert.equal(move.statusCode, 200, move.body);
    assert.equal(host.scene().zoneId, "common");
    assert.equal(calls, 1, "moving after a spoken invite uses only the original GM reply");
  } finally {
    await host.app.close();
  }
});

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
      const prompt = messages.map((row) => row.content).join("\n");
      assert.equal(prompt.includes("Scoped native access authority"), invited);
      assert.equal(prompt.includes("Access commands use supplied venue and zone IDs"), invited);
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
      const access = turn.recordEvents?.filter((notice) => notice.kind === "access") ?? [];
      assert.equal(access.length, invited ? 1 : 0);
      if (invited) {
        assert.equal(access[0].accessChanges?.length, 1);
        assert.equal(access[0].accessChanges?.[0].entry.room, "Workshop");
        assert.equal(access[0].accessChanges?.[0].entry.thisVisit, true);
        const changes = await host.app.inject({ method: "GET", url: "/api/villages/rooms/browser/changes" });
        assert.equal(changes.statusCode, 200, changes.body);
        assert.deepEqual(
          changes.json().notices.find((notice: { id: string }) => notice.id === access[0].id).accessChanges,
          access[0].accessChanges,
          "reload retains the chip details",
        );
      }
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
        assert(
          view
            .json()
            .myAccess.some((row: { room?: string; thisVisit?: true }) => row.room === "Workshop" && row.thisVisit),
        );
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
