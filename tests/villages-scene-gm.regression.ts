import assert from "node:assert/strict";
import { mock } from "node:test";
import { materializeGmReply } from "../packages/villages/src/server/domain/rules/scene-gm.js";
import { expandSceneEvents } from "../packages/villages/src/server/domain/rules/scene-event-proposals.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { semanticContext } from "../packages/villages/src/server/domain/rules/semantic-contract.js";
import { packagedSceneServer } from "./fixtures/packaged-scene-server.fixture.js";
import { fixtureVillageState } from "./helpers/village-storage.fixture.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { initializeVenueAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { createSemanticService } from "../packages/villages/src/server/features/generation/semantic-service.js";

const segments = [{ kind: "dialogue", speakerId: "mara", text: "Tea sounds good." }];
const raw = materializeGmReply(
  {
    input: [{ text: "Tea?" }],
    segments,
    access: [{ evidence: [0], actorId: "mara" }],
  },
  'I privately think about the key, then say "Tea?"',
);
assert.equal((raw.segments as any[])[0].text, "Tea?");
assert.deepEqual((raw.access as any[])[0].evidence, [1], "Sources follow inserted player speech");
assert.equal((raw.intent as any).timeline[0].kind, "context");
assert.throws(() => materializeGmReply({ input: [{ kind: "speech", text: "Invented" }], segments }, "Tea?"));
const context = semanticContext(
  coerceSession({
    version: 4,
    id: "empty",
    startedAt: "2026-11-01T12:00:00.000Z",
    activeIds: [],
    participants: [],
    lines: [],
    submissions: [],
  }),
  defaultVillageState(),
  "",
  true,
);
const empty = expandSceneEvents({ input: [], segments }, context);
assert.deepEqual(empty.memoryChanges, []);
assert.deepEqual(empty.wishChanges, []);
assert.equal(empty.consistent, undefined, "No fabricated independent review");
for (const at of [[0], ["input:0"]]) {
  const proposal = expandSceneEvents(
    {
      input: [{ text: "My kettle is called Tawny." }],
      segments,
      events: [
        {
          type: "memory",
          at,
          value: {
            kind: "information",
            text: "Player calls the kettle Tawny.",
            knowers: ["mara"],
            basis: "report",
            quotes: ["My kettle is called Tawny."],
          },
        },
      ],
    },
    context,
  );
  assert.equal(
    Boolean((proposal.memoryChanges as any[])[0].rejectedEvent),
    at[0] === 0,
    "A player quote cannot acquire a generated reply's source identity",
  );
}
await assert.rejects(
  createSemanticService({
    readVillageState: () => assert.fail("Missing GM context must stop before any I/O"),
  } as any).exchange(coerceSession({ version: 4, id: "missing-context" }), "", [], null),
  /current GM response context is required/,
);

mock.timers.enable({ apis: ["Date"], now: new Date("2026-11-05T20:00:00Z") });
for (const invited of [false, true]) {
  const host = await packagedSceneServer({
    configure(world) {
      if (!invited) return;
      const venue = world.venues[0];
      venue.zones.find((z) => z.id === "common")!.connectedTo.push("workshop");
      venue.zones.push({
        ...defaultVenueSpace("other"),
        id: "workshop",
        name: "Workshop",
        kind: "restricted",
        connectedTo: ["common"],
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
  const message = invited ? "May I visit with you?" : 'I privately think of the silver key but say "Tea?"';
  host.model.chatComplete = async (messages) => {
    calls++;
    assert.match(messages[0].content, /GM of Villages/);
    assert(!messages[0].content.startsWith("You interpret Villages gameplay."));
    return {
      content: JSON.stringify({
        input: invited ? [{ kind: "speech", text: message }] : [{ text: "Tea?" }],
        segments: invited
          ? [{ kind: "dialogue", speakerId: "mara", text: "You are welcome to visit my Workshop with me." }]
          : segments,
        ...(invited
          ? {
              events: [
                {
                  type: "access",
                  targetId: "workshop",
                  at: [0],
                  value: { venueId: "mill", outcome: "invite-now", accompanies: true },
                },
              ],
            }
          : {}),
      }),
      finishReason: "stop",
      usage: { inputTokens: 10, outputTokens: 10 },
    };
  };
  try {
    const active = await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
    assert.equal(active.statusCode, 200);
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
    assert.equal(calls, 1, "Ordinary GM turn purchases one response");
    const turn = host.scene().submissions.at(-1)!;
    assert.equal(turn.semanticProvenance?.producer, "gm");
    assert.equal(turn.semanticReady, true);
    assert(
      !host.scene().lines.some((line) => line.role === "assistant" && line.content.includes("silver key")),
      "Private input is not spoken by a resident",
    );
    assert(
      !host
        .scene()
        .lines.filter((line) => line.heardBy.includes("mara"))
        .some((line) =>
          (line.speechSource ? line.speechSource.spans.map((span) => span.text).join(" ") : line.content).includes(
            "silver key",
          ),
        ),
      "Resident witnesses contain only captured speech",
    );
    if (invited) {
      const world = fixtureVillageState(host.records.get("villages-village").data, host.records);
      const permission = world.venues[0].access?.permissions.find((row) => row.zoneId === "workshop");
      assert(permission && permission.duration === "visit" && permission.accompaniedBy === "mara");
    }
    const replay = await host.app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload });
    assert.equal(replay.statusCode, 200, replay.body);
    assert.equal(calls, 1, "Replay cannot repurchase the GM response");
    if (invited) {
      const view = await host.app.inject({ method: "GET", url: "/api/villages" });
      assert.equal(view.statusCode, 200, view.body);
      const destination = view.json().sceneVenue.venue.zones.find((zone: any) => zone.id === "workshop");
      assert.equal(
        destination.accessView.decision.allowed,
        true,
        "The Move picker must offer an accompanied invitation before the escort crosses",
      );
      assert.equal(
        host.scene().accompanying?.find((row) => row.characterId === "mara")?.zoneId,
        "common",
        "Previewing entry never moves the escort",
      );
      const moved = await host.app.inject({
        method: "POST",
        url: "/api/villages/rooms/zone",
        payload: {
          sessionId: "browser",
          zoneId: "workshop",
          expectedSceneRevision: host.scene().sceneRevision,
          operationId: "c2222222-2222-4222-8222-222222222222",
        },
      });
      assert.equal(moved.statusCode, 200, moved.body);
      assert.equal(host.scene().zoneId, "workshop");
      assert.equal(host.scene().accompanying?.find((row) => row.characterId === "mara")?.zoneId, "workshop");
      assert.equal(calls, 1, "Accepting the saved invitation needs no new model response");
    }
  } finally {
    await host.stop();
  }
}
mock.timers.reset();
console.log("GM turns bind speech and permission, settle empty domains and replay without a second model call.");
