import assert from "node:assert/strict";
import { fixture } from "./fixtures/villages-projects.fixture.js";
import { packagedSceneServer } from "./fixtures/packaged-scene-server.fixture.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import {
  initializeVenueAccess,
  evaluateZoneAccess,
} from "../packages/villages/src/server/domain/rules/venue-access.js";
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
import { followingMovementParty } from "../packages/villages/src/server/domain/rules/resident-movement.js";
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { contactPath } from "../packages/villages/src/server/domain/rules/venue-contact.js";

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
  readset.sceneFollowing = true;
  const accept = (raw: unknown) =>
    acceptNarration(state, { raw, readset, responseDigest: memoryHash(raw) }, "trespass-turn", at);
  return { state, venue, scene, input, accept, readset };
}

for (const mode of ["aside", "private", "legacy", "malformed", "narration", "stop", "specific", "conflict"]) {
  const f = nativeFixture();
  f.readset.sceneFollowing = mode === "legacy" ? true : 2;
  const raw = {
    segments: [
      {
        id: "promise",
        kind: mode === "narration" ? "narration" : "dialogue",
        speakerId: "a",
        text: mode === "stop" ? "I'll wait here." : "I'll sneak around this place with you for this outing.",
        presentation: "aside",
        follow:
          mode === "malformed"
            ? { agrees: "yes" }
            : { agrees: mode !== "stop", trespass: true, ...(mode === "specific" ? { to: "garden" } : {}) },
        ...(mode === "private" ? { delivery: "whisper", targetId: "b" } : {}),
      },
    ],
    ...(mode === "conflict"
      ? {
          commands: [
            {
              id: "native-stop",
              type: "move.decide",
              who: "a",
              agrees: false,
              at: "promise",
              source: [{ segment: "promise" }],
            },
          ],
        }
      : {}),
  };
  if (["legacy", "malformed", "narration", "conflict"].includes(mode)) {
    assert.throws(() => f.accept(raw), /following|follow|spoken|Unrecognized/i);
    continue;
  }
  const result = f.accept(raw);
  assert.equal(
    result.held,
    ["private", "legacy", "malformed", "narration", "conflict"].includes(mode),
    mode + JSON.stringify(result.rejected),
  );
  if (result.held) continue;
  applyAcceptedSceneDelta(f.scene, result.episode!);
  const agreement = f.scene.movementAgreements?.[0];
  if (mode === "stop") {
    assert.equal(agreement, undefined);
    continue;
  }
  assert.equal(agreement?.trespass, true);
  assert.equal(!!agreement?.following, mode !== "specific");
  const cold = coerceSession(JSON.parse(JSON.stringify(f.scene)));
  const party = followingMovementParty(f.state, f.venue, cold, "garden");
  assert.equal(party.moves[0]?.actorId, "a", "An audible aside records actual following and explicit sneaking");
}

for (const mode of ["spoken", "seen", "seen-trespass", "private", "request", "stop", "legacy"]) {
  const f = nativeFixture(),
    seen = mode.startsWith("seen");
  if (mode === "legacy") delete f.readset.sceneFollowing;
  const result = f.accept({
    segments: [
      {
        id: "follow",
        kind: seen ? "narration" : "dialogue",
        ...(seen ? {} : { speakerId: "a" }),
        text:
          mode === "stop"
            ? "I'll stay here."
            : seen
              ? "A falls into step beside the Player."
              : "I'll come with you and sneak around this place together.",
        ...(mode === "private" ? { delivery: "whisper", targetId: "b" } : {}),
        requires: ["follow-choice"],
      },
    ],
    commands: [
      {
        id: "follow-choice",
        type: "move.decide",
        who: "a",
        agrees: mode !== "stop",
        ...(mode === "seen-trespass" ? { trespass: true } : {}),
        at: "follow",
        source:
          mode === "request"
            ? [{ input: f.input, ground: { kind: "spoken", to: ["a"] } }]
            : [{ segment: "follow", ...(seen ? { perceive: { kind: "seen", by: ["player"] } } : {}) }],
      },
    ],
  });
  assert.equal(
    result.held,
    ["seen-trespass", "private", "request", "legacy"].includes(mode),
    mode + JSON.stringify(result.rejected),
  );
  if (result.held) continue;
  applyAcceptedSceneDelta(f.scene, result.episode!);
  assert.equal(
    f.scene.movementAgreements?.some((row) => row.following),
    mode !== "stop",
  );
  if (mode === "stop") continue;
  const cold = coerceSession(JSON.parse(JSON.stringify(f.scene)));
  assert.equal(cold.movementAgreements![0].following, true);
  let party = followingMovementParty(f.state, f.venue, cold, "garden");
  assert.deepEqual(party.staying, ["a"], "Ordinary following never grants trespass willingness");
  cold.movementAgreements![0].trespass = true;
  party = followingMovementParty(f.state, f.venue, cold, "garden");
  assert.equal(party.moves[0]?.trespass?.reason, "permission-required");
  f.venue.zones!.find((row) => row.id === "garden")!.closed = true;
  assert.deepEqual(followingMovementParty(f.state, f.venue, cold, "garden").staying, ["a"]);
}

{
  const f = nativeFixture();
  const actor = f.readset.source.actors.find((row) => row.id === "a")!;
  f.scene.movementAgreements = [
    { actorId: "a", incarnation: actor.incarnation, from: "common", zoneId: "common", following: true },
    { actorId: "a", incarnation: actor.incarnation, from: "common", zoneId: "garden", trespass: true },
  ];
  const result = f.accept({
    segments: [
      { id: "no", kind: "dialogue", speakerId: "a", text: "No, I will not enter the Garden.", requires: ["decline"] },
    ],
    commands: [
      {
        id: "decline",
        type: "move.decide",
        who: "a",
        to: "garden",
        agrees: false,
        at: "no",
        source: [{ segment: "no" }],
      },
    ],
  });
  assert.equal(result.held, false);
  applyAcceptedSceneDelta(f.scene, result.episode!);
  assert.deepEqual(
    f.scene.movementAgreements,
    [],
    "A refusal overrides broader following and earlier crossing willingness",
  );
  f.scene.navigationReceipts = [
    {
      id: "mixed",
      originZoneId: "common",
      destinationZoneId: "garden",
      follow: true,
      companions: ["a", "b", "c", "npc:guard", "npc:other"],
      at,
    },
  ];
  assert.equal(
    coerceSession(JSON.parse(JSON.stringify(f.scene))).navigationReceipts![0].companions!.length,
    5,
    "Automatic rosters preserve NPCs beyond the four-resident limit",
  );
}
{
  const f = nativeFixture(),
    actor = f.readset.source.actors.find((row) => row.id === "a")!,
    garden = f.venue.zones!.find((row) => row.id === "garden")!;
  garden.access!.memberIds = ["player"];
  f.venue.access!.permissions.push({
    id: "player-escort",
    zoneId: "garden",
    visitorId: "a",
    issuerId: "c",
    duration: "standing",
    sceneId: null,
    accompaniedBy: "player",
    outsideHours: false,
    revoked: false,
    issuedAt: at,
    sourceLineIds: [],
  });
  f.scene.movementAgreements = [
    { actorId: "a", incarnation: actor.incarnation, from: "common", zoneId: "common", following: true },
  ];
  assert.equal(
    followingMovementParty(f.state, f.venue, f.scene, "garden").moves[0]?.permissionId,
    "player-escort",
    "The Player arrives with a follower whose invitation requires them",
  );
  garden.access!.mode = "public";
  f.venue.access!.permissions = [];
  const middle = {
    ...defaultVenueSpace("other"),
    id: "middle",
    name: "Middle",
    kind: "public" as const,
    description: "A connecting room.",
    seen: true,
    connectedTo: ["common", "garden"],
    access: { ...garden.access!, mode: "public" as const },
  };
  f.venue.zones!.push(middle);
  f.venue.zones!.find((row) => row.id === "common")!.connectedTo = ["middle"];
  garden.connectedTo = ["middle"];
  f.scene.sceneAttendance!.layout = captureSceneLayout(f.venue);
  f.scene.movementAgreements = [{ actorId: "a", incarnation: actor.incarnation, from: "common", zoneId: "garden" }];
  assert.deepEqual(
    followingMovementParty(f.state, f.venue, f.scene, "garden").staying,
    ["a"],
    "A one-edge agreement cannot become a longer trip",
  );
  f.scene.movementAgreements[0].following = true;
  assert.equal(followingMovementParty(f.state, f.venue, f.scene, "garden").moves[0]?.actorId, "a");
  f.scene.sceneAttendance!.occupants.push(
    ...["d", "e", "f", "g"].map((characterId) => ({
      characterId,
      name: characterId,
      doing: "Waiting",
      zoneId: "middle",
    })),
  );
  assert.deepEqual(
    followingMovementParty(f.state, f.venue, f.scene, "garden", [{ characterId: "a", zoneId: "garden" }]).staying,
    ["a"],
    "A required escort cannot cross an overfull intermediate Zone",
  );
  f.scene.sceneAttendance!.occupants = f.scene.sceneAttendance!.occupants.filter(
    (row) => !["d", "e", "f", "g"].includes(row.characterId),
  );
  f.venue.zones!.push({ ...middle, id: "side", name: "Side", connectedTo: ["common", "garden"] });
  f.venue.zones!.find((row) => row.id === "common")!.connectedTo!.push("side");
  garden.connectedTo!.push("side");
  f.scene.sceneAttendance!.layout = captureSceneLayout(f.venue);
  f.scene.continuity = captureSceneContinuity(f.state, f.scene, Date.parse(at));
  middle.access = { ...middle.access!, mode: "permission-required", memberIds: ["a"], managerIds: ["c"] };
  assert.equal(
    followingMovementParty(f.state, f.venue, f.scene, "garden").moves[0]?.actorId,
    "a",
    "A shared live/captured route avoids the Player's revoked shortcut",
  );
  middle.access.memberIds = ["player"];
  assert.equal(
    followingMovementParty(f.state, f.venue, f.scene, "garden").moves[0]?.actorId,
    "a",
    "The group uses an alternate route when the player's shortest route bars a follower",
  );
  middle.access.mode = "public";
  f.scene.sceneAttendance!.occupants.push(
    ...["d", "e", "f", "g"].map((characterId) => ({
      characterId,
      name: characterId,
      doing: "Waiting",
      zoneId: "middle",
    })),
  );
  assert.equal(
    followingMovementParty(f.state, f.venue, f.scene, "garden").moves[0]?.actorId,
    "a",
    "A free alternate route avoids a full intermediate room",
  );
}
{
  const f = nativeFixture(),
    actor = f.readset.source.actors.find((row) => row.id === "a")!,
    garden = f.venue.zones!.find((row) => row.id === "garden")!;
  garden.access!.memberIds = ["a"];
  const grant = {
    id: "changing-escort",
    zoneId: "garden",
    visitorId: "player",
    issuerId: "c",
    duration: "standing" as const,
    sceneId: null,
    accompaniedBy: "a",
    outsideHours: false,
    revoked: false,
    issuedAt: at,
    sourceLineIds: [],
  };
  f.venue.access!.permissions.push(grant);
  f.scene.movementAgreements = [
    { actorId: "a", incarnation: actor.incarnation, from: "common", zoneId: "common", following: true },
  ];
  f.scene.continuity = captureSceneContinuity(f.state, f.scene, Date.parse(at));
  const positions = { player: "garden", a: "garden", b: "common" };
  assert.equal(
    evaluateZoneAccess(f.venue, garden, "player", { positions, at: new Date(at), sceneId: f.scene.id }).allowed,
    true,
  );
  grant.accompaniedBy = "b";
  assert.equal(
    evaluateZoneAccess(f.venue, garden, "player", { positions, at: new Date(at), sceneId: f.scene.id }).allowed,
    false,
  );
  const party = followingMovementParty(f.state, f.venue, f.scene, "garden");
  assert.ok(
    !party.path || party.playerTrespass,
    "A matching pre-crossing denial cannot authorize an ordinary arrival with mismatched escorts",
  );
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
for (const scenario of ["ordinary", "sneaking", "staying", "escorted"]) {
  const host = await packagedSceneServer({
    configure(world) {
      world.spontaneousEvents = false;
      const venue = world.venues[0];
      venue.access!.managerIds = ["player"];
      venue.zones!.find((row) => row.id === "common")!.connectedTo!.push("garden");
      venue.zones!.push({
        ...defaultVenueSpace("other"),
        id: "garden",
        name: "Garden",
        description: "A public garden with an open path.",
        kind: scenario === "ordinary" || scenario === "escorted" ? "public" : "restricted",
        connectedTo: ["common"],
        seen: true,
        access: {
          mode: scenario === "ordinary" || scenario === "escorted" ? "public" : "permission-required",
          managerIds: ["player"],
          memberIds: [],
          memberRoles: [],
          inviterIds: [],
          visitorHours: "always",
          accompanied: false,
        },
      });
      if (scenario === "escorted") {
        const common = venue.zones!.find((row) => row.id === "common")!,
          garden = venue.zones!.find((row) => row.id === "garden")!;
        common.connectedTo = common.connectedTo!.map((id) => (id === "garden" ? "middle" : id));
        garden.connectedTo = ["middle"];
        venue.zones!.push({
          ...defaultVenueSpace("other"),
          id: "middle",
          name: "Middle",
          description: "A room reached with Mara as escort.",
          kind: "restricted",
          seen: true,
          connectedTo: ["common", "garden"],
          access: { ...garden.access!, mode: "permission-required", managerIds: ["mara"], memberIds: ["mara"] },
        });
        venue.access!.permissions.push({
          id: "escorted-middle",
          zoneId: "middle",
          visitorId: "player",
          issuerId: "mara",
          duration: "visit",
          sceneId: null,
          accompaniedBy: "mara",
          outsideHours: false,
          revoked: false,
          issuedAt: new Date().toISOString(),
          sourceLineIds: [],
        });
      }
    },
    configureScene(scene) {
      scene.zoneId = "exterior";
      scene.area = "outside";
      scene.accompanying = [{ characterId: "mara", zoneId: "exterior" }];
    },
  });
  let calls = 0;
  host.model.chatComplete = async () => {
    calls++;
    return {
      content: JSON.stringify({
        segments: [
          {
            id: "f",
            kind: "dialogue",
            speakerId: "mara",
            text:
              scenario === "sneaking"
                ? "I'll sneak around this place with you for this outing."
                : "I'll come with you.",
            presentation: "aside",
            follow: { agrees: true, ...(scenario === "sneaking" ? { trespass: true } : {}) },
          },
        ],
      }),
      finishReason: "stop",
      usage: { inputTokens: 10, outputTokens: 10 },
    };
  };
  try {
    const get = async (path: string) => host.app.inject({ method: "GET", url: "/api/villages" + path });
    const post = async (path: string, payload: unknown) =>
      host.app.inject({ method: "POST", url: "/api/villages" + path, payload });
    let scene = (await get("/rooms/active")).json().session;
    let result = await post("/rooms/turn", {
      sessionId: scene.id,
      mode: "chat",
      message: "Come along with me?",
      submissionId: "follow-me",
      expectedSceneRevision: scene.sceneRevision,
    });
    assert.equal(result.statusCode, 200, result.body);
    scene = result.json().session;
    assert.equal(host.scene().movementAgreements?.[0].following, true);
    for (const zoneId of ["common", "garden"]) {
      const snapshot = (await get("/")).json();
      scene = (await get("/rooms/active")).json().session;
      const zone = snapshot.sceneVenue.venue.zones.find((row: any) => row.id === zoneId);
      assert.equal(zone.accessView.reachable, true, "The confirmation uses the same checked shared route");
      assert.equal(
        zone.accessView.companions.find((row: any) => row.id === "mara").staying === true,
        scenario === "staying" && zoneId === "garden",
      );
      const request = {
        sessionId: scene.id,
        zoneId,
        follow: true,
        operationId: "follow-" + zoneId,
        expectedSceneRevision: scene.sceneRevision,
      };
      let faulted = false;
      if (scenario === "escorted" && zoneId === "garden") {
        const update = host.documents.update;
        host.documents.update = async (input) => {
          const saved = await update(input);
          if (
            !faulted &&
            input.id === "villages-village" &&
            saved?.data.venues?.[0].access?.permissions.some(
              (grant: any) => grant.id === "escorted-middle" && grant.sceneId === scene.id,
            )
          ) {
            faulted = true;
            throw Error("Synthetic lost acknowledgement after native invitation claim");
          }
          return saved;
        };
      }
      result = await post("/rooms/zone", request);
      if (scenario === "escorted" && zoneId === "garden") {
        assert.equal(faulted, true);
        if (result.statusCode >= 400) {
          scene = (await get("/rooms/active")).json().session;
          result = await post("/rooms/zone", {
            ...request,
            expectedSceneRevision: scene.sceneRevision,
            retryOfAttemptId: scene.operation.attemptId,
          });
        }
      }
      assert.equal(result.statusCode, 200, result.body);
      scene = result.json().session;
      const stays = scenario === "staying" && zoneId === "garden";
      const arrival = scene.lines.at(-1);
      assert.match(arrival.id, /^arrival-/);
      assert.equal(scene.zoneArrivalId, arrival.id);
      assert.equal(arrival.content.includes("Mara"), !stays, "Arrival names only the actual moving party");
      assert.equal(scene.activeIds.includes("mara"), !stays, "A follower is immediately in the destination cast");
      if (scenario === "escorted" && zoneId === "garden") {
        assert.deepEqual(host.scene().navigationReceipts!.find((row) => row.id === "follow-garden")!.path, [
          "common",
          "middle",
          "garden",
        ]);
        assert.equal(
          host.scene().continuity!.facts.venues[0].access!.permissions.find((row) => row.id === "escorted-middle")!
            .sceneId,
          scene.id,
          "Intermediate invitation is claimed in the captured view",
        );
        assert.equal(
          host.records
            .get("villages-village")
            .data.venues[0].access.permissions.find((row: any) => row.id === "escorted-middle").sceneId,
          scene.id,
          "Intermediate invitation is claimed in live authority",
        );
      }
      assert.equal(
        host.scene().accompanying?.find((row) => row.characterId === "mara")?.zoneId,
        stays ? "common" : zoneId,
      );
      assert.equal(
        host.scene().movementAgreements?.some((row) => row.following),
        !stays,
        "Following persists across ordinary Moves and ends on separation",
      );
      result = await post("/rooms/zone", { ...request, expectedSceneRevision: scene.sceneRevision });
      assert.equal(result.statusCode, 200, result.body);
      assert.equal(result.json().session.lines.filter((line: any) => line.id === arrival.id).length, 1);
    }
    scene = (await get("/rooms/active")).json().session;
    result = await post("/rooms", {
      venueId: "mill",
      zoneId: "exterior",
      follow: true,
      expectedSceneRevision: scene.sceneRevision,
    });
    assert.equal(result.statusCode, 200, result.body);
    scene = result.json().session;
    assert.equal(
      host.scene().accompanying?.find((row) => row.characterId === "mara")?.zoneId,
      scenario === "staying" ? "common" : "exterior",
      "Same-Venue Visits reuse ordinary following, including multi-hop egress",
    );
    assert.equal(calls, 1, "Repeated movement never needs repeated agreement/model calls");
    result = await post("/rooms/zone", {
      sessionId: scene.id,
      zoneId: "exterior",
      follow: true,
      operationId: "same-zone",
      expectedSceneRevision: scene.sceneRevision,
    });
    assert.equal(result.statusCode, 200, result.body);
    result = await post("/rooms/zone", {
      sessionId: scene.id,
      zoneId: "exterior",
      follow: true,
      operationId: "same-zone",
      expectedSceneRevision: result.json().session.sceneRevision,
    });
    assert.equal(result.statusCode, 200, result.body, "An automatic no-op receipt replays with its original mode");
  } finally {
    await host.stop();
  }
}

for (const follow of [false, true]) {
  const host = await packagedSceneServer({
    configure(world) {
      world.spontaneousEvents = true;
      const venue = world.venues[0],
        strip = venue.zones!.find((z) => z.id === "common")!;
      venue.access!.managerIds = ["mara"];
      strip.name = "Airstrip";
      strip.connectedTo = ["exterior", "hangar"];
      strip.access = {
        mode: "permission-required",
        managerIds: ["mara"],
        memberIds: [],
        memberRoles: [],
        inviterIds: [],
        visitorHours: "always",
        accompanied: false,
      };
      venue.zones!.find((z) => z.id === "exterior")!.connectedTo = ["common"];
      venue.zones!.push({ ...structuredClone(strip), id: "hangar", name: "Hangar", connectedTo: ["common"] });
    },
    configureScene(scene, world) {
      scene.zoneId = "hangar";
      scene.trespass = { zoneId: "hangar", reason: "permission-required" };
      scene.sceneAttendance!.occupants[0]!.zoneId = follow ? "hangar" : "common";
      scene.activeIds = follow ? ["mara"] : [];
      if (follow)
        scene.movementAgreements = [
          {
            actorId: "mara",
            incarnation: world.villagers[0]!.incarnation!,
            from: "hangar",
            zoneId: "hangar",
            following: true,
          },
        ];
    },
  });
  try {
    const read = async (path: string) => (await host.app.inject({ method: "GET", url: "/api/villages" + path })).json();
    const move = async (zoneId: string, trespass = false) => {
      const { session } = await read("/rooms/active");
      return host.app.inject({
        method: "POST",
        url: "/api/villages/rooms/zone",
        payload: {
          sessionId: session.id,
          zoneId,
          follow,
          ...(trespass ? { trespass: true } : {}),
          operationId: "return-" + zoneId + "-" + trespass,
          expectedSceneRevision: session.sceneRevision,
        },
      });
    };
    const snap = await read("");
    const entrance = snap.sceneVenue.venue.zones.find((z: any) => z.id === "exterior");
    assert.equal(
      entrance.accessView.reachable,
      false,
      "Entrance is not reachable through a restricted intermediate Zone",
    );
    const before = structuredClone(host.scene());
    const rejected = await move("exterior");
    assert.equal(rejected.statusCode, 409, rejected.body);
    assert.equal(host.scene().zoneId, "hangar");
    assert.equal(host.scene().navigationReceipts?.length ?? 0, before.navigationReceipts?.length ?? 0);
    const crossing = await move("common", true);
    assert.equal(crossing.statusCode, 200, crossing.body);
    assert.equal(crossing.json().session.trespassing, true);
    assert.ok(
      crossing.json().session.trespassReactionId,
      "Crossing the restricted intermediate Zone exposes its local witness",
    );
    const exited = await move("exterior");
    assert.equal(exited.statusCode, 200, exited.body);
    assert.equal(exited.json().session.zoneId, "exterior");
    assert.equal(host.calls(), 0, "Navigation and queued encounters do not purchase a GM response");
  } finally {
    await host.stop();
  }
}
{
  const f = nativeFixture();
  const common = f.venue.zones!.find((z) => z.id === "common")!;
  common.access!.mode = "permission-required";
  common.access!.managerIds = ["c"];
  common.access!.memberIds = [];
  common.access!.memberRoles = [];
  f.scene.zoneId = "garden";
  f.scene.movementAgreements = [
    {
      actorId: "a",
      incarnation: f.state.villagers.find((v) => v.characterId === "a")!.incarnation!,
      from: "garden",
      zoneId: "garden",
      following: true,
    },
  ];
  f.scene.sceneAttendance!.occupants.find((row) => row.characterId === "a")!.zoneId = "garden";
  f.scene.sceneAttendance!.layout = captureSceneLayout(f.venue);
  f.scene.continuity = captureSceneContinuity(f.state, f.scene, Date.parse(at));
  assert.equal(contactPath(f.state, f.venue, "garden", "exterior", "player", f.scene), null);
  assert.equal(followingMovementParty(f.state, f.venue, f.scene, "exterior").path, undefined);
  const forcedExits = accessExits(f.scene, f.state, f.venue);
  for (const actor of ["player", "a"])
    assert.equal(
      forcedExits.find((row) => row.actor === actor)?.to,
      "exterior",
      "Forced permission-loss exits preserve physical egress without granting voluntary passage",
    );
  f.state.narrative = {
    version: 1,
    adoptedAt: at,
    revision: 1,
    weatherRevision: 0,
    weather: null,
    situations: [],
    conditions: [],
    receipts: [],
  };
  f.state.narrative.conditions.push({
    id: "ordinary-use",
    revision: 1,
    situationId: "hazard",
    venueId: f.venue.id,
    zoneId: common.id,
    observation: "The grass is muddy.",
    restriction: "ordinary-use",
    remedy: "Let it dry.",
    startsAt: at,
    endsAt: null,
    clearedAt: null,
  });
  f.scene.continuity = captureSceneContinuity(f.state, f.scene, Date.parse(at));
  assert.equal(
    accessExits(f.scene, f.state, f.venue).find((row) => row.actor === "player")?.to,
    "exterior",
    "Ordinary-use conditions preserve forced physical egress",
  );
  common.closed = true;
  f.scene.continuity = captureSceneContinuity(f.state, f.scene, Date.parse(at));
  assert.ok(
    !accessExits(f.scene, f.state, f.venue).some((row) => row.actor === "player"),
    "A physical closure still blocks the forced route",
  );
  common.closed = false;
  f.state.narrative.conditions = [];
  common.access!.mode = "public";
  f.scene.sceneAttendance!.layout = captureSceneLayout(f.venue);
  f.scene.continuity = captureSceneContinuity(f.state, f.scene, Date.parse(at));
  assert.deepEqual(contactPath(f.state, f.venue, "garden", "exterior", "player", f.scene), [
    "garden",
    "common",
    "exterior",
  ]);
  assert.deepEqual(
    followingMovementParty(f.state, f.venue, f.scene, "exterior").path,
    ["garden", "common", "exterior"],
    "Safe multi-hop returns remain available, even from an unauthorized origin",
  );
}
console.log(
  "Trespass encounters: explicit actor crossings, scoped consent, cold persistence, witness deduplication, real packaged reactions, provider uncertainty and unchanged Conclude passed.",
);
