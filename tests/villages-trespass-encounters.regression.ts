import assert from "node:assert/strict";
import { fixture } from "./fixtures/villages-projects.fixture.js";
import { packagedSceneServer } from "./fixtures/packaged-scene-server.fixture.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { initializeVenueAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import {
  narrationContinuityContext,
  fittedNarrationReadset,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import { acceptNarration } from "../packages/villages/src/server/domain/rules/narration-native.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { applyAcceptedSceneDelta } from "../packages/villages/src/server/domain/rules/scene-delta.js";
import { accessExits } from "../packages/villages/src/server/domain/rules/scene-attendance.js";
import {
  prepareMovementParty,
  queueTrespassReaction,
  settleTrespassReaction,
} from "../packages/villages/src/server/domain/rules/scene-trespass.js";
import { publicSceneAuthority } from "../packages/villages/src/server/domain/rules/scene-public.js";

const at = "2026-11-10T12:00:00.000Z";
function nativeFixture(npc = false) {
  const state = fixture().state(),
    venue = state.venues[0];
  venue.zones!.find((z) => z.id === "common")!.connectedTo!.push("garden");
  venue.zones!.push({
    ...defaultVenueSpace("other"),
    id: "garden",
    name: "Garden",
    kind: "restricted",
    connectedTo: ["common"],
    seen: true,
  });
  initializeVenueAccess(venue);
  venue.zones!.find((z) => z.id === "garden")!.access = {
    mode: "permission-required",
    managerIds: ["c"],
    memberIds: [],
    memberRoles: [],
    inviterIds: [],
    visitorHours: "always",
    accompanied: false,
  };
  if (npc)
    state.worldPlaces.npcs["npc:guard"] = {
      id: "npc:guard",
      revision: 1,
      name: "",
      label: "Guard",
      characterization: "An opportunistic guard.",
      facts: [],
      associations: [{ placeId: venue.id, role: "Guard" }],
      availability: "",
      disabled: false,
      source: "fixture",
      updatedAt: at,
    };
  const actors = [
    ...state.villagers.map((row) => ({
      characterId: row.characterId,
      name: row.characterId,
      doing: "Talking",
      zoneId: row.characterId === "c" ? "garden" : "common",
    })),
    ...(npc ? [{ characterId: "npc:guard", name: "Guard", doing: "Watching", zoneId: "common" }] : []),
  ];
  const scene = zoneEventScene(
    coerceSession({
      version: 5,
      id: "trespass-test",
      villageSeed: state.seed,
      sceneRevision: 1,
      placeId: venue.id,
      placeName: venue.name,
      zoneId: "common",
      status: "active",
      startedAt: at,
      lastActivityAt: at,
      activeIds: actors.filter((row) => row.zoneId === "common").map((row) => row.characterId),
      participants: actors,
      sceneAttendance: { capturedAt: at, layout: captureSceneLayout(venue), occupants: actors },
    }),
    venue,
  );
  scene.contactGeneration!.actorIds = actors.map((row) => row.characterId);
  const input = "Would you sneak into the Garden with me?";
  const context = narrationContinuityContext(state, scene, venue, "trespass-operation", input, at);
  const readset = fittedNarrationReadset(
    state,
    context,
    context.parts.map((part) => part.block.evidenceId!),
  );
  const accept = (raw: unknown) =>
    acceptNarration(state, { raw, readset, responseDigest: memoryHash(raw) }, "trespass-turn", at);
  return { state, venue, scene, input, accept, readset };
}

for (const trespass of [true, false]) {
  const f = nativeFixture();
  f.readset.sceneResidentMovement = true;
  const result = f.accept({
    segments: [
      { kind: "crossing", who: "a", to: "garden", trespass, text: "A crosses the open grass into the Garden." },
    ],
  });
  assert.equal(
    result.held,
    !trespass,
    "The ordinary crossing adapter preserves explicit unauthorized entry and native checks",
  );
  if (trespass) assert.equal(result.episode!.commandReceipts[0].movement!.trespass, "permission-required");
}

for (const actor of ["a", "npc:guard"]) {
  const f = nativeFixture(actor.startsWith("npc:"));
  const raw = {
    segments: [{ id: "cross", kind: "narration", text: `${actor} crosses into the Garden.`, requires: ["move"] }],
    commands: [
      {
        id: "move",
        type: "move",
        who: actor,
        to: "garden",
        trespass: true,
        at: "cross",
        source: [{ segment: "cross", perceive: { kind: "seen", by: ["player"] } }],
      },
    ],
  };
  const result = f.accept(raw);
  assert.equal(result.held, false, JSON.stringify(result.rejected));
  assert.equal(result.episode!.commandReceipts[0].movement!.trespass, "permission-required");
  applyAcceptedSceneDelta(f.scene, result.episode!);
  const cold = coerceSession(JSON.parse(JSON.stringify(f.scene)));
  assert.deepEqual(cold.actorTrespasses, [{ actorId: actor, zoneId: "garden", reason: "permission-required" }]);
  assert.ok(
    !accessExits(cold, f.state, f.venue).some((row) => row.actor === actor),
    "An explicit unauthorized actor is not immediately ejected",
  );
}
for (const mistake of ["no-mode", "player", "closure", "changed-denial"]) {
  const f = nativeFixture();
  if (mistake === "closure") f.venue.zones!.find((z) => z.id === "garden")!.closed = true;
  if (mistake === "changed-denial") f.venue.zones!.find((z) => z.id === "garden")!.access!.visitorHours = [];
  const raw = {
    segments: [{ id: "cross", kind: "narration", text: "Someone crosses into the Garden.", requires: ["move"] }],
    commands: [
      {
        id: "move",
        type: "move",
        who: mistake === "player" ? "player" : "a",
        to: "garden",
        ...(mistake === "no-mode" ? {} : { trespass: true }),
        at: "cross",
        source: [{ segment: "cross", perceive: { kind: "seen", by: ["player"] } }],
      },
    ],
  };
  const before = memoryHash(f.state);
  assert.equal(f.accept(raw).held, true);
  assert.equal(memoryHash(f.state), before);
}
for (const consent of ["yes", "request-only", "other-speaker", "private", "withdrawal"]) {
  const f = nativeFixture();
  const raw = {
    segments: [
      {
        id: "answer",
        kind: "dialogue",
        speakerId: consent === "other-speaker" ? "b" : "a",
        text: consent === "withdrawal" ? "No, I won't cross with you." : "I'll cross without permission with you.",
        ...(consent === "private" ? { delivery: "whisper", targetId: "b" } : {}),
        requires: ["agreement"],
      },
    ],
    commands: [
      {
        id: "agreement",
        type: "move.decide",
        who: "a",
        to: "garden",
        agrees: consent !== "withdrawal",
        trespass: true,
        at: "answer",
        source:
          consent === "request-only"
            ? [{ input: f.input, ground: { kind: "spoken", to: ["a"] } }]
            : [{ segment: "answer" }],
      },
    ],
  };
  const result = f.accept(raw),
    valid = consent === "yes" || consent === "withdrawal";
  assert.equal(result.held, !valid, consent + ": " + JSON.stringify(result.rejected));
  if (!valid) continue;
  applyAcceptedSceneDelta(f.scene, result.episode!);
  if (consent === "withdrawal") {
    assert.deepEqual(f.scene.movementAgreements, []);
    continue;
  }
  assert.equal(f.scene.movementAgreements!.length, 1);
  const cold = coerceSession(JSON.parse(JSON.stringify(f.scene)));
  const publicView = publicSceneAuthority(cold);
  assert.equal(publicView.movementCompanions[0].id, "a");
  const party = prepareMovementParty(f.state, f.venue, cold, "garden", ["a"]);
  assert.deepEqual(party.moves[0].trespass, { actorId: "a", zoneId: "garden", reason: "permission-required" });
  assert.throws(() => prepareMovementParty(f.state, f.venue, cold, "garden", ["b"]), /agreement/);
  cold.accompanying = [{ characterId: "a", zoneId: "exterior" }];
  assert.throws(() => prepareMovementParty(f.state, f.venue, cold, "garden", ["a"]), /agreement/);
}
{
  const f = nativeFixture();
  f.scene.trespass = { zoneId: "common", reason: "permission-required" };
  queueTrespassReaction(f.scene, true);
  const first = f.scene.trespassReaction!;
  assert.ok(first);
  assert.deepEqual(first.witnesses, ["a", "b"]);
  queueTrespassReaction(f.scene, true);
  assert.equal(f.scene.trespassReaction!.id, first.id);
  f.scene.accompanying = [{ characterId: "a", zoneId: "exterior" }];
  queueTrespassReaction(f.scene, true);
  assert.deepEqual(
    f.scene.trespassReaction!.witnesses,
    ["b"],
    "A pending encounter survives an unadmitted witness departure",
  );
  f.scene.accompanying = [];
  queueTrespassReaction(f.scene, true);
  f.scene.accompanying = [
    { characterId: "a", zoneId: "exterior" },
    { characterId: "b", zoneId: "exterior" },
  ];
  settleTrespassReaction(f.scene);
  f.scene.accompanying = [];
  queueTrespassReaction(f.scene, true);
  assert.equal(f.scene.trespassReaction, undefined);
  f.scene.accompanying = [{ characterId: "a", zoneId: "exterior" }];
  queueTrespassReaction(f.scene, true);
  assert.equal(f.scene.trespassReaction, undefined, "Departing witnesses do not create a new encounter");
  f.scene.accompanying = [{ characterId: "c", zoneId: "common" }];
  queueTrespassReaction(f.scene, true);
  assert.notEqual(f.scene.trespassReaction!.id, first.id, "A newly present witness creates a new encounter");
  f.scene.operation = {
    id: f.scene.trespassReaction!.id,
    status: "interrupted",
    kind: "turn",
    error: "Uncertain response",
  } as any;
  assert.equal(
    publicSceneAuthority(f.scene).trespassReactionId,
    undefined,
    "A failed purchase cannot automatically retry after refresh",
  );
  queueTrespassReaction(f.scene, false);
  assert.equal(f.scene.trespassReaction, undefined);
}

for (const scenario of ["success", "off", "failure", "recover-pending", "recover-applied", "setting-disabled", "ban"]) {
  const host = await packagedSceneServer({
    configure(world) {
      world.spontaneousEvents = scenario !== "off";
      const venue = world.venues[0],
        zone = venue.zones!.find((row) => row.id === "common")!;
      venue.access!.managerIds = ["mara"];
      zone.access = {
        mode: "permission-required",
        managerIds: ["mara"],
        memberIds: [],
        memberRoles: [],
        inviterIds: [],
        visitorHours: "always",
        accompanied: false,
      };
    },
    configureScene(scene) {
      scene.zoneId = "exterior";
      scene.area = "outside";
      scene.activeIds = [];
    },
  });
  let calls = 0;
  let faulted = false;
  const originalUpdate = host.documents.update;
  host.documents.update = async (input) => {
    const result = await originalUpdate(input);
    if (
      scenario.startsWith("recover-") &&
      !faulted &&
      input.id === "villages-venue-visit-browser" &&
      host.scene().submissions.some((turn) => turn.acceptance.status === scenario.slice(8))
    ) {
      faulted = true;
      throw Error("Synthetic acknowledgement loss after durable Scene write");
    }
    return result;
  };
  if (scenario === "setting-disabled") {
    const fit = host.model.fitContext;
    host.model.fitContext = (messages, options) => {
      const record = host.records.get("villages-village");
      record.data.spontaneousEvents = false;
      record.revision++;
      return fit(messages, options);
    };
  }
  host.model.chatComplete = async (messages) => {
    calls++;
    assert.match(JSON.stringify(messages), /Automatic trespass encounter/);
    if (scenario === "failure") throw Error("Synthetic uncertain provider response");
    return {
      content: JSON.stringify({
        segments: [
          {
            id: "response",
            kind: "dialogue",
            speakerId: "mara",
            text: scenario === "ban" ? "You are banned from this room. Leave." : "What are you doing here?",
            ...(scenario === "ban" ? { requires: ["ban"] } : {}),
          },
        ],
        ...(scenario === "ban"
          ? {
              commands: [
                {
                  id: "ban",
                  type: "access.decide",
                  by: "mara",
                  venue: "mill",
                  zone: "common",
                  decision: { outcome: "ban-zone", visitor: "player" },
                  at: "response",
                  source: [{ segment: "response" }],
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
    const request = async (path: string, payload?: unknown) =>
      host.app.inject({
        method: payload ? "POST" : "GET",
        url: "/api/villages" + path,
        ...(payload ? { payload } : {}),
      });
    let scene = (await request("/rooms/active")).json().session;
    let response = await request("/rooms/zone", {
      sessionId: scene.id,
      zoneId: "common",
      trespass: true,
      operationId: "intrusion",
      expectedSceneRevision: scene.sceneRevision,
    });
    assert.equal(response.statusCode, 200, response.body);
    scene = response.json().session;
    assert.equal(scene.trespassing, true);
    assert.equal(calls, 0, "Committing or reading navigation never purchases a reply");
    for (let i = 0; i < 2; i++) scene = (await request("/rooms/active")).json().session;
    assert.equal(calls, 0);
    if (scenario === "off") {
      assert.equal(scene.trespassReactionId, undefined);
      continue;
    }
    const reaction = scene.trespassReactionId;
    assert.ok(reaction);
    response = await request("/rooms/react", {
      sessionId: scene.id,
      reactionId: reaction,
      expectedSceneRevision: scene.sceneRevision,
    });
    assert.equal(
      calls,
      scenario === "setting-disabled" ? 0 : 1,
      "Live spending preference is checked before provider dispatch",
    );
    if (scenario.startsWith("recover-")) {
      assert.equal(faulted, true);
      scene = (await request("/rooms/active")).json().session;
      if (response.statusCode >= 400) {
        response = await request("/rooms/react", {
          sessionId: scene.id,
          reactionId: reaction,
          expectedSceneRevision: scene.sceneRevision,
          retryOfAttemptId: scene.operation.attemptId,
        });
      }
      assert.equal(response.statusCode, 200, response.body);
      assert.equal(calls, 1, "Recover the purchased reply without another call");
      assert.equal(host.scene().submissions.length, 1);
      assert.equal(host.scene().submissions[0].acceptance.status, "applied");
    } else if (scenario === "ban") {
      assert.equal(response.statusCode, 200, response.body);
      scene = (await request("/rooms/active")).json().session;
      response = await request("/rooms/end", { sessionId: scene.id, expectedSceneRevision: scene.sceneRevision });
      assert.equal(response.statusCode, 200, response.body);
      assert.equal(calls, 1);
      response = await request("/");
      const common = response
        .json()
        .settings.venues.find((v: any) => v.id === "mill")
        .zones.find((z: any) => z.id === "common");
      assert.equal(common.accessView.decision.reason, "banned", "A witnessed authorized ban survives Conclude");
    } else if (scenario === "success") {
      assert.equal(response.statusCode, 200, response.body);
      scene = response.json().session;
      assert.equal(scene.zoneId, "common");
      assert.equal(scene.trespassReactionId, undefined);
      assert.ok(scene.lines.some((line: any) => line.content === "What are you doing here?"));
      response = await request("/rooms/react", {
        sessionId: scene.id,
        reactionId: reaction,
        expectedSceneRevision: scene.sceneRevision,
      });
      assert.equal(response.statusCode, 200, response.body);
      assert.equal(calls, 1);
    } else {
      assert.ok(response.statusCode >= 400);
      scene = (await request("/rooms/active")).json().session;
      assert.equal(scene.zoneId, "common");
      assert.equal(scene.trespassReactionId, undefined);
      await request("/rooms/react", {
        sessionId: scene.id,
        reactionId: reaction,
        expectedSceneRevision: scene.sceneRevision,
      });
      assert.equal(
        calls,
        scenario === "setting-disabled" ? 0 : 1,
        "Uncertainty requires explicit recovery, never automatic re-dispatch",
      );
      response = await request("/rooms/end", {
        sessionId: scene.id,
        expectedSceneRevision: scene.sceneRevision,
        abandonOperationId: reaction,
        retryOfAttemptId: scene.operation.attemptId,
      });
      assert.equal(response.statusCode, 200, response.body);
      assert.equal(
        calls,
        scenario === "setting-disabled" ? 0 : 1,
        "Conclude after a failed reaction adds no model call",
      );
    }
  } finally {
    await host.stop();
  }
}
for (const select of [true, false]) {
  const host = await packagedSceneServer({
    configure(world) {
      world.spontaneousEvents = false;
      world.venues[0].access!.managerIds = ["player"];
      world.venues[0].zones!.find((row) => row.id === "common")!.access = {
        mode: "permission-required",
        managerIds: ["player"],
        memberIds: [],
        memberRoles: [],
        inviterIds: [],
        visitorHours: "always",
        accompanied: false,
      };
    },
    configureScene(scene) {
      scene.zoneId = "exterior";
      scene.area = "outside";
      scene.accompanying = [{ characterId: "mara", zoneId: "exterior" }];
    },
  });
  let calls = 0;
  host.model.chatComplete = async (messages) => {
    calls++;
    assert.match(JSON.stringify(messages), /move\.decide/);
    return {
      content: JSON.stringify({
        segments: [
          {
            id: "answer",
            kind: "dialogue",
            speakerId: "mara",
            text: "I'll cross into the Common without permission with you.",
            requires: ["agreement"],
          },
        ],
        commands: [
          {
            id: "agreement",
            type: "move.decide",
            who: "mara",
            to: "common",
            agrees: true,
            trespass: true,
            at: "answer",
            source: [{ segment: "answer" }],
          },
        ],
      }),
      finishReason: "stop",
      usage: { inputTokens: 10, outputTokens: 10 },
    };
  };
  try {
    const post = async (path: string, payload: unknown) =>
      host.app.inject({ method: "POST", url: "/api/villages" + path, payload });
    let scene = (await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" })).json().session;
    let response = await post("/rooms/turn", {
      sessionId: scene.id,
      message: "Want to sneak into the Common with me?",
      mode: "chat",
      submissionId: "ask",
      expectedSceneRevision: scene.sceneRevision,
    });
    assert.equal(response.statusCode, 200, response.body);
    scene = response.json().session;
    assert.deepEqual(scene.movementCompanions, [{ id: "mara", name: "Mara", zoneId: "common", trespass: true }]);
    const crossing = {
      sessionId: scene.id,
      zoneId: "common",
      companions: select ? ["mara"] : [],
      operationId: "group-crossing",
      expectedSceneRevision: scene.sceneRevision,
    };
    response = await post("/rooms/zone", crossing);
    assert.equal(response.statusCode, 200, response.body);
    scene = response.json().session;
    assert.equal(scene.zoneId, "common");
    assert.notEqual(scene.trespassing, true);
    const saved = host.scene();
    assert.equal(saved.accompanying?.find((row) => row.characterId === "mara")?.zoneId, select ? "common" : "exterior");
    assert.deepEqual(
      saved.actorTrespasses ?? [],
      select ? [{ actorId: "mara", zoneId: "common", reason: "permission-required" }] : [],
    );
    assert.equal(calls, 1, "Crossing uses the existing spoken agreement without another model call");
    response = await post("/rooms/zone", { ...crossing, expectedSceneRevision: scene.sceneRevision });
    assert.equal(response.statusCode, 200, response.body);
    response = await post("/rooms/zone", {
      ...crossing,
      companions: select ? [] : ["mara"],
      expectedSceneRevision: response.json().session.sceneRevision,
    });
    assert.ok(response.statusCode >= 400, "The same move ID cannot replay with a different party");
  } finally {
    await host.stop();
  }
}
console.log(
  "Trespass encounters: explicit actor crossings, scoped consent, cold persistence, witness deduplication, real packaged reactions, provider uncertainty and unchanged Conclude passed.",
);
