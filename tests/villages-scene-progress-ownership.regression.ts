// Test cases: scene-narration/outbox, scene-narration/held, scene-narration/lost-ack, scene-narration/write-failure, scene-narration/startup-hold, scene-narration/activation-owner, scene-narration/private-projection, scene-narration/validation-hold, scene-narration/cancellation, scene-narration/connected-turn, scene-narration/saved-changes, scene-narration/coordinator-startup-hold, scene-narration/abandon, scene-narration/abandon-lost-ack, scene-narration/abandon-committed, scene-narration/abandon-fence, scene-narration/startup-no-write, scene-narration/replace-committed, scene-narration/retirement, scene-narration/skip-ownership, scene-narration/input-playback, scene-narration/native-close, scene-narration/native-close-recovery, scene-narration/native-contact-end, scene-narration/native-close-authority, scene-narration/native-delta-fence, scene-narration/native-delta-integrity, scene-narration/native-movement, scene-narration/native-movement-recovery, scene-narration/native-departure, scene-narration/native-npc, scene-narration/native-circumstance
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import {
  createActivationScope,
  activationScope,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { establishPlace } from "../packages/villages/src/server/domain/rules/place-discovery.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import {
  narrationContinuityContext,
  fittedNarrationReadset,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import { applySceneMutation } from "../packages/villages/src/server/domain/rules/scene-mutation.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { acceptNarration } from "../packages/villages/src/server/domain/rules/narration-native.js";
import { narrationBlocker } from "../packages/villages/src/server/domain/rules/scene-submissions.js";
import { narrationIsAbandoned } from "../packages/villages/src/server/domain/rules/narration-acceptance.js";
import { sceneReadyForRetirement } from "../packages/villages/src/server/domain/rules/scene-retirement.js";
import { terminalForScene } from "../packages/villages/src/server/features/scenes/scene-terminal.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { createVillageStateService } from "../packages/villages/src/server/features/world/village-state-service.js";
import { createSceneRetirement } from "../packages/villages/src/server/features/scenes/scene-retirement-service.js";
import { createSceneTerminalStore } from "../packages/villages/src/server/features/scenes/scene-terminal.js";
import { createSceneWorkFence } from "../packages/villages/src/server/jobs/scene-work-fence.js";
import { collectRetainedStorage } from "../packages/villages/src/server/features/repair/retained-storage-cleanup.js";
import {
  publicSceneResponse,
  publicSceneAuthority,
} from "../packages/villages/src/server/domain/rules/scene-public.js";
import {
  createSceneProgress,
  type SceneProgressPorts,
} from "../packages/villages/src/server/features/scenes/progress-service.js";
import { createSceneWriting } from "../packages/villages/src/server/features/scenes/writing-service.js";
import { createSceneCommands } from "../packages/villages/src/server/features/scenes/command-service.js";
import { createSceneChanges } from "../packages/villages/src/server/features/scenes/changes-service.js";
import { createSceneQueryService } from "../packages/villages/src/server/features/scenes/scene-query-service.js";
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { heardLines } from "../packages/villages/src/server/domain/rules/scene-record.js";
import { actorEpisodeView } from "../packages/villages/src/server/domain/rules/episodes.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { readAcceptedEpisode } from "../packages/villages/src/server/domain/decoding/episode-codec.js";
import { scenePlaybackSteps } from "../packages/villages/src/client/features/scenes/scene-playback.js";
import { readNpc } from "../packages/villages/src/server/domain/rules/places.js";
import { ensureNarrative } from "../packages/villages/src/server/domain/rules/narrative-development.js";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
import {
  encodeContinuityPages,
  decodeContinuityPagesSync,
} from "../packages/villages/src/server/adapters/storage/continuity-pages.js";
import { sessionSlot } from "../packages/villages/src/server/adapters/storage/scene-slots.js";
import { createVenueOperationContext } from "../packages/villages/src/server/adapters/operations/operation-context-service.js";
import { createVenueCoordinator } from "../packages/villages/src/server/jobs/venue-coordinator-service.js";
import { mutableSceneSubmission } from "../packages/villages/src/server/domain/rules/scene-submissions.js";
import {
  configureSceneProgress,
  processSavedExchange,
} from "../packages/villages/src/server/features/scenes/progress.js";
import type { VenueScene } from "../packages/villages/src/server/domain/models/scene-model.js";
const at = "2026-11-09T12:00:00.000Z";
function fixture(seed = "world") {
  const world = { ...defaultVillageState(), seed, setupAt: at, foundedAt: at };
  const place = establishPlace(
    world,
    {
      name: "Cafe",
      description: "A cafe.",
      controllers: ["mara"],
      people: [{ ref: "mara", name: "Mara", characterization: "A reserved host." }],
      zones: [{ id: "parlor", name: "Parlor", kind: "public", description: "Tables." }],
    },
    "cafe",
    "map",
    "found",
    at,
    true,
  );
  const actorId = Object.keys(world.worldPlaces.npcs)[0],
    scenes = new Map<string, VenueScene>();
  const owners: unknown[] = [],
    calls: string[] = [];
  const entered = Promise.withResolvers<void>(),
    gate = Promise.withResolvers<void>(),
    recovered = Promise.withResolvers<void>();
  let pause = "",
    failScene = false,
    failWorld = false,
    ownershipError: Error | undefined;
  const exact = Error("Lost Scene acknowledgement");
  function add(id = "scene") {
    const scene = zoneEventScene(
      coerceSession({
        version: 5,
        id,
        sceneRevision: 1,
        villageSeed: seed,
        placeId: place.id,
        placeName: place.location.name,
        zoneId: "parlor",
        startedAt: at,
        lastActivityAt: at,
        status: "active",
        activeIds: [actorId],
        participants: [{ characterId: actorId, name: "Mara", doing: "Talking" }],
        sceneAttendance: {
          capturedAt: at,
          layout: captureSceneLayout(place.location),
          occupants: [{ characterId: actorId, name: "Mara", doing: "Talking", zoneId: "parlor" }],
        },
      }),
      place.location,
    );
    const message = "I am learning weaving.",
      prepared = narrationContinuityContext(world, scene, place.location, "operation-" + id, message, at);
    const readset = fittedNarrationReadset(
      world,
      prepared,
      prepared.parts.flatMap((part) => (part.block.evidenceId ? [part.block.evidenceId] : [])),
    );
    const raw: Record<string, unknown> = {
      segments: [
        {
          kind: "dialogue",
          id: "reply",
          speakerId: actorId,
          text: "I will remember that you are learning weaving.",
          requires: ["remember"],
        },
      ],
      keep: [
        {
          id: "remember",
          for: [actorId],
          text: "The player said they are learning weaving.",
          source: [{ input: message, ground: { kind: "spoken", to: [actorId] } }],
        },
      ],
    };
    scene.submissions.push({
      id: "turn",
      message,
      mode: "chat",
      targetId: "",
      requestFingerprint: memoryHash(["chat", "", null, message]),
      at,
      acceptance: { status: "pending", rejected: [] },
      narration: { raw, readset, responseDigest: memoryHash(raw) },
    });
    scene.operation = {
      id: readset.source.operationId,
      kind: "turn",
      input: { message },
      token: "owner",
      attemptId: "attempt",
      status: "interrupted",
      stage: "publication",
      startedAt: at,
      sceneRevision: scene.sceneRevision,
      snapshot: null,
      checkpoints: {},
      attempts: {},
      error: "Saved reply needs recovery",
    };
    scenes.set(id, scene);
    return scene;
  }
  add();
  const queue: { sessionId: string; submissionId: string }[] = [];
  async function note(call: string) {
    calls.push(call);
    owners.push(activationScope());
    if (pause === call) {
      pause = "";
      entered.resolve();
      await gate.promise;
      owners.push(activationScope());
    }
  }
  const ports: SceneProgressPorts = {
    assertVenueOwnership() {
      if (ownershipError) throw ownershipError;
    },
    onRecoveryFinished: () => recovered.resolve(),
    async readSession(id) {
      await note("read:" + id);
      return structuredClone(scenes.get(id)!);
    },
    readVillageAuthority: async () => structuredClone(world),
    async mutateVillageState(change) {
      await note("world");
      if (failWorld) {
        failWorld = false;
        throw exact;
      }
      const next = structuredClone(world);
      change(next);
      Object.assign(world, next);
      return structuredClone(world);
    },
    async changeSession(id, change) {
      await note("change:" + id);
      if (failScene) {
        failScene = false;
        throw exact;
      }
      const next = structuredClone(scenes.get(id)!);
      if (applySceneMutation(next, id, change) !== false) scenes.set(id, next);
      return next;
    },
    async measurePipeline(_name, _identity, work) {
      return work();
    },
    sceneQueries: () => ({
      progressBacklog: async () => {
        await note("backlog");
        return [...queue];
      },
    }),
    villagesLogger: () => ({ warn() {} }) as never,
  };
  const service = createSceneProgress(ports);
  return {
    world,
    scenes,
    actorId,
    owners,
    calls,
    service,
    ports,
    add,
    queue,
    entered,
    gate,
    recovered,
    exact,
    turn: () => scenes.get("scene")!.submissions[0],
    pause(call: string) {
      pause = call;
    },
    failScene() {
      failScene = true;
    },
    failWorld() {
      failWorld = true;
    },
    interrupt() {
      ownershipError = Error("Cancelled operation");
    },
  };
}
function nativeCloseFixture() {
  const f = fixture(),
    scene = f.scenes.get("scene")!,
    turn = scene.submissions[0];
  const message = "I leave now.",
    raw = {
      segments: [
        { id: "goodbye", kind: "dialogue", speakerId: f.actorId, text: "Farewell." },
        { id: "exit", kind: "narration", text: "You head out.", requires: ["close"] },
      ],
      commands: [
        {
          id: "close",
          type: "scene.end",
          at: "exit",
          source: [{ input: message, ground: { kind: "visible-action", to: [f.actorId] } }],
        },
      ],
    };
  turn.message = message;
  turn.requestFingerprint = memoryHash(["chat", "", null, message]);
  turn.narration!.readset.source.input = message;
  turn.narration!.raw = raw;
  turn.narration!.responseDigest = memoryHash(raw);
  return f;
}
function nativeMovementFixture() {
  const f = fixture(),
    scene = f.scenes.get("scene")!,
    turn = scene.submissions[0],
    message = "I step outside.";
  const raw = {
    segments: [
      { id: "before", kind: "dialogue", speakerId: f.actorId, text: "Our indoor conversation ends here." },
      { id: "cross", kind: "narration", text: "You step through the entrance.", requires: ["move"] },
    ],
    commands: [
      {
        id: "move",
        type: "move",
        who: "player",
        to: "exterior",
        at: "cross",
        source: [
          { input: message, ground: { kind: "visible-action", to: [f.actorId], at: "start" } },
          { segment: "cross", perceive: { kind: "seen", by: ["player"] } },
        ],
      },
    ],
  };
  turn.message = message;
  turn.requestFingerprint = memoryHash(["chat", "", null, message]);
  turn.narration!.readset.source.input = message;
  turn.narration!.raw = raw;
  turn.narration!.responseDigest = memoryHash(raw);
  return f;
}
await runCase("scene-narration/native-movement", async () => {
  const f = nativeMovementFixture();
  await f.service.processSavedExchange("scene", "turn");
  const scene = f.scenes.get("scene")!;
  assert.equal(f.turn().acceptance.status, "applied", f.turn().progressError);
  assert.equal(scene.zoneId, "exterior");
  assert.equal(scene.id, "scene");
  assert.equal(scene.status, "active");
  assert.equal(scene.navigationReceipts!.length, 1);
  assert.deepEqual(
    f.world.episodes.records[0].segments.at(-1)!.physicalIdsAfter,
    [],
    "playback cast follows the Player's actual crossing",
  );
  const before = memoryHash(scene);
  await f.service.processSavedExchange("scene", "turn");
  assert.equal(memoryHash(f.scenes.get("scene")), before);
  assert.equal(f.world.episodes.records.length, 1);
});
await runCase("scene-narration/native-npc", async () => {
  for (const lost of [false, true]) {
    const f = fixture(),
      turn = f.turn(),
      raw = {
        segments: [
          { id: "earlier", kind: "dialogue", speakerId: f.actorId, text: "Our earlier words." },
          { id: "arrival", kind: "narration", text: "A traveler joins the conversation.", requires: ["admit"] },
          { id: "reply", kind: "dialogue", speakerId: "new:traveler", text: "Hello." },
        ],
        commands: [
          {
            id: "admit",
            type: "npc.admit",
            localKey: "new:traveler",
            name: "Traveler",
            characterization: "PRIVATE_TRAVELER_PROFILE",
            at: "arrival",
            source: [{ segment: "arrival", perceive: { kind: "seen", by: ["player"] } }],
          },
        ],
      };
    turn.narration!.raw = raw;
    turn.narration!.responseDigest = memoryHash(raw);
    if (lost) {
      f.failScene();
      await assert.rejects(f.service.processSavedExchange("scene", "turn"), (error) => error === f.exact);
      assert.equal(f.scenes.get("scene")!.participants.length, 1);
      const storage = sceneHistoryFixture();
      try {
        const repository = createVillageRepository(() => storage.gate.documents);
        await repository.mutateAuthority((state) => Object.assign(state, f.world), { memories: true });
        Object.assign(
          f.world,
          await createVillageRepository(() => storage.gate.documents).readAuthority({ memories: true }),
        );
      } finally {
        storage.release();
      }
      const id = f.world.episodes.records[0].commandReceipts[0].targetId;
      f.world.worldPlaces.npcs[id].disabled = true;
      f.interrupt();
    }
    await f.service.processSavedExchange("scene", "turn");
    assert.equal(f.turn().acceptance.status, "applied", f.turn().progressError);
    const saved = f.scenes.get("scene")!,
      ep = f.world.episodes.records[0],
      id = ep.commandReceipts[0].targetId;
    assert(saved.activeIds.includes(id));
    assert(saved.participants.some((row) => row.characterId === id));
    assert(!saved.pendingNpcAdmissions?.length);
    assert(!ep.segments[0].heardBy.includes(id));
    assert(ep.segments[1].physicalIdsAfter?.includes(id));
    assert(!JSON.stringify(publicSceneAuthority(saved)).includes("PRIVATE_TRAVELER_PROFILE"));
    const before = memoryHash(saved);
    await f.service.processSavedExchange("scene", "turn");
    assert.equal(memoryHash(f.scenes.get("scene")), before);
    assert.equal(f.world.episodes.records.length, 1);
  }
});
await runCase("scene-narration/native-circumstance", async () => {
  for (const lost of [false, true]) {
    const f = fixture(),
      scene = f.scenes.get("scene")!,
      turn = f.turn(),
      venue = structuredClone(turn.narration!.readset.source.venue);
    for (const zone of venue.zones ?? []) if (zone.id !== scene.zoneId) zone.description = "";
    f.world.venues = [venue];
    ensureNarrative(f.world, at);
    scene.continuity = captureSceneContinuity(f.world, scene, Date.parse(at));
    const context = narrationContinuityContext(
        f.world,
        scene,
        venue,
        turn.narration!.readset.source.operationId,
        turn.message,
        at,
      ),
      readset = fittedNarrationReadset(
        f.world,
        context,
        context.parts.map((part) => part.block.evidenceId!),
      );
    assert(readset.circumstance);
    const raw = {
      segments: [{ id: "event", kind: "narration", text: "A gust rattles the sign.", requires: ["event"] }],
      commands: [
        {
          id: "event",
          type: "circumstance",
          at: "event",
          situation: { title: "Loose sign", summary: "The sign rattles." },
          conditions: [
            {
              observation: "The sign's bracket has loosened.",
              restriction: "none",
              remedy: "NATIVE_REMEDY_DETAIL",
              durationMinutes: 60,
            },
          ],
          source: [{ segment: "event", perceive: { kind: "seen", by: ["player"] } }],
        },
      ],
    };
    turn.narration = { raw, readset, responseDigest: memoryHash(raw) };
    if (lost) {
      f.failScene();
      await assert.rejects(f.service.processSavedExchange("scene", "turn"), (error) => error === f.exact);
      assert.equal(f.turn().acceptance.status, "pending");
      const storage = sceneHistoryFixture();
      try {
        const repository = createVillageRepository(() => storage.gate.documents);
        await repository.mutateAuthority((state) => Object.assign(state, f.world), { memories: true });
        Object.assign(
          f.world,
          await createVillageRepository(() => storage.gate.documents).readAuthority({ memories: true }),
        );
      } finally {
        storage.release();
      }
      f.world.setting = "Later unrelated setting.";
      f.interrupt();
    }
    await f.service.processSavedExchange("scene", "turn");
    assert.equal(f.turn().acceptance.status, "applied", f.turn().progressError);
    assert.equal(f.world.narrative!.conditions.length, 1);
    assert.equal(f.world.eventAttempts!.attempts.length, 1);
    assert.equal(f.world.continuity.records.length, 1);
    assert.equal(f.world.episodes.records.length, 1);
    const saved = f.scenes.get("scene")!;
    assert(saved.lines.some((line) => line.content === "A gust rattles the sign."));
    assert(!JSON.stringify(publicSceneAuthority(saved)).includes("NATIVE_REMEDY_DETAIL"));
    const before = memoryHash(saved);
    await f.service.processSavedExchange("scene", "turn");
    assert.equal(memoryHash(f.scenes.get("scene")), before);
    assert.equal(f.world.eventAttempts!.attempts.length, 1);
  }
});
await runCase("scene-narration/native-movement-recovery", async () => {
  const f = nativeMovementFixture();
  f.failScene();
  await assert.rejects(f.service.processSavedExchange("scene", "turn"), (error) => error === f.exact);
  assert.equal(f.scenes.get("scene")!.zoneId, "parlor");
  const storage = sceneHistoryFixture();
  try {
    const repository = createVillageRepository(() => storage.gate.documents);
    await repository.mutateAuthority((state) => Object.assign(state, f.world), { memories: true });
    Object.assign(
      f.world,
      await createVillageRepository(() => storage.gate.documents).readAuthority({ memories: true }),
    );
    f.world.worldPlaces.npcs[f.actorId].disabled = true;
    f.interrupt();
    await f.service.processSavedExchange("scene", "turn");
    assert.equal(f.turn().acceptance.status, "applied");
    assert.equal(f.scenes.get("scene")!.zoneId, "exterior");
    assert.equal(f.scenes.get("scene")!.navigationReceipts!.length, 1);
    assert.equal(f.world.episodes.records.length, 1);
  } finally {
    storage.release();
  }
});
await runCase("scene-narration/native-close", async () => {
  const f = nativeCloseFixture();
  await f.service.processSavedExchange("scene", "turn");
  const saved = f.scenes.get("scene")!,
    episode = f.world.episodes.records[0];
  assert.equal(saved.status, "closed");
  assert.equal(saved.endedAt, episode.acceptedAt);
  assert.equal(saved.endReason, "scene");
  assert.equal(f.turn().acceptance.status, "applied");
  assert(episode.sceneDelta?.closed);
  assert.equal(episode.commandReceipts[0].kind, "scene");
  const before = memoryHash(saved);
  await f.service.processSavedExchange("scene", "turn");
  assert.equal(memoryHash(f.scenes.get("scene")), before);
  assert.equal(f.world.episodes.records.length, 1);
});
await runCase("scene-narration/native-departure", async () => {
  for (const lost of [false, true]) {
    const f = fixture(),
      scene = f.scenes.get("scene")!,
      turn = f.turn();
    const raw = {
      segments: [{ id: "leave", kind: "narration", text: "Mara leaves the conversation.", requires: ["leave"] }],
      commands: [
        {
          id: "leave",
          type: "depart",
          who: f.actorId,
          at: "leave",
          source: [{ segment: "leave", perceive: { kind: "seen", by: ["player"] } }],
        },
      ],
    };
    turn.narration!.raw = raw;
    turn.narration!.responseDigest = memoryHash(raw);
    if (lost) {
      f.failScene();
      await assert.rejects(f.service.processSavedExchange("scene", "turn"), (error) => error === f.exact);
      assert(!scene.departedIds?.includes(f.actorId));
      const storage = sceneHistoryFixture();
      try {
        const repository = createVillageRepository(() => storage.gate.documents);
        await repository.mutateAuthority((state) => Object.assign(state, f.world), { memories: true });
        Object.assign(
          f.world,
          await createVillageRepository(() => storage.gate.documents).readAuthority({ memories: true }),
        );
      } finally {
        storage.release();
      }
      f.world.worldPlaces.npcs[f.actorId].disabled = true;
      f.interrupt();
    }
    await f.service.processSavedExchange("scene", "turn");
    assert.equal(f.turn().acceptance.status, "applied", f.turn().progressError);
    const saved = f.scenes.get("scene")!;
    assert(saved.departedIds!.includes(f.actorId));
    assert(!saved.activeIds.includes(f.actorId));
    assert.equal(saved.status, "active");
    assert.equal(f.world.episodes.records.length, 1);
    const before = memoryHash(saved);
    await f.service.processSavedExchange("scene", "turn");
    assert.equal(memoryHash(f.scenes.get("scene")), before);
  }
});
await runCase("scene-narration/native-close-recovery", async () => {
  const f = nativeCloseFixture();
  f.failScene();
  await assert.rejects(f.service.processSavedExchange("scene", "turn"), (error) => error === f.exact);
  assert.equal(f.scenes.get("scene")!.status, "active");
  assert(f.world.episodes.records[0].sceneDelta?.closed);
  const storage = sceneHistoryFixture();
  try {
    const repository = createVillageRepository(() => storage.gate.documents);
    await repository.mutateAuthority(
      (state) => {
        Object.assign(state, f.world);
      },
      { memories: true },
    );
    Object.assign(
      f.world,
      await createVillageRepository(() => storage.gate.documents).readAuthority({ memories: true }),
    );
    f.world.worldPlaces.npcs[f.actorId].disabled = true;
    f.interrupt();
    await f.service.processSavedExchange("scene", "turn");
    assert.equal(f.scenes.get("scene")!.status, "closed");
    assert.equal(f.world.episodes.records.length, 1);
    assert.equal(f.turn().acceptance.status, "applied");
  } finally {
    storage.release();
  }
});
function nativeContactFixture() {
  const f = fixture(),
    scene = f.scenes.get("scene")!,
    turn = scene.submissions[0];
  const contacts = [{ characterId: f.actorId, playerZoneId: "parlor", characterZoneId: "parlor" }];
  scene.doorwayContacts = contacts;
  turn.narration!.readset.source.scene.doorwayContacts = contacts;
  const raw = {
    segments: [
      { id: "end", kind: "dialogue", speakerId: f.actorId, text: "I will stop here. Goodbye.", requires: ["contact"] },
    ],
    commands: [{ id: "contact", type: "contact.end", who: f.actorId, at: "end", source: [{ segment: "end" }] }],
  };
  turn.narration!.raw = raw;
  turn.narration!.responseDigest = memoryHash(raw);
  return f;
}
await runCase("scene-narration/native-contact-end", async () => {
  const f = nativeContactFixture();
  await f.service.processSavedExchange("scene", "turn");
  assert.deepEqual(f.scenes.get("scene")!.doorwayContacts, []);
  assert.equal(f.scenes.get("scene")!.status, "active");
  assert.deepEqual(
    f.scenes.get("scene")!.activeIds,
    [f.actorId],
    "ending conversation cannot invent travel or erase local attendance",
  );
  assert.equal(f.world.episodes.records[0].commandReceipts[0].kind, "contact");
});
await runCase("scene-narration/native-delta-integrity", async () => {
  for (const altered of ["revision", "contact", "receipt", "missing"] as const) {
    const f = nativeContactFixture();
    await f.service.processSavedExchange("scene", "turn");
    const world = structuredClone(f.world),
      episode = world.episodes.records[0];
    if (altered === "revision") episode.sceneDelta!.expectedRevision++;
    if (altered === "contact") episode.sceneDelta!.contactEndedIds = ["player"];
    if (altered === "receipt") {
      episode.commandReceipts[0].endedContacts = ["player"];
      episode.sceneDelta!.contactEndedIds = ["player"];
    }
    if (altered === "missing") delete episode.sceneDelta;
    const namespace = memoryHash(world.seed).slice(0, 32);
    assert.throws(() => {
      const pages = encodeContinuityPages(
        { continuity: world.continuity, episodes: world.episodes, worldPlaces: world.worldPlaces },
        namespace,
      );
      decodeContinuityPagesSync(pages.manifest, namespace, world.seed, (id) => pages.pages.get(id) ?? null);
    }, /Scene transition|Scene control|contact result|native source/);
  }
});
await runCase("scene-narration/native-close-authority", async () => {
  for (const invalid of ["thought", "npc", "later-fiction"] as const) {
    const f = nativeCloseFixture(),
      raw = f.turn().narration!.raw as any;
    if (invalid === "thought") raw.commands[0].source = [{ input: f.turn().message, ground: { kind: "private" } }];
    if (invalid === "npc") raw.commands[0].source = [{ segment: "goodbye" }];
    if (invalid === "later-fiction")
      raw.segments.push({ id: "later", kind: "narration", text: "The discussion continues." });
    f.turn().narration!.responseDigest = memoryHash(raw);
    await f.service.processSavedExchange("scene", "turn");
    assert.equal(f.turn().acceptance.status, "held");
    assert.equal(f.scenes.get("scene")!.status, "active");
    assert.equal(f.world.episodes.records.length, 0);
  }
  const f = nativeCloseFixture(),
    raw = f.turn().narration!.raw as any;
  raw.segments = [{ id: "goodbye", kind: "dialogue", speakerId: f.actorId, text: "Goodnight." }];
  raw.commands[0] = { ...raw.commands[0], at: "goodbye", source: [{ segment: "goodbye" }], independent: true };
  f.turn().narration!.responseDigest = memoryHash(raw);
  await f.service.processSavedExchange("scene", "turn");
  assert.equal(f.turn().acceptance.status, "applied");
  assert.equal(f.scenes.get("scene")!.status, "active");
  assert.equal(f.world.episodes.records[0].sceneDelta, undefined);
});
await runCase("scene-narration/native-delta-fence", async () => {
  const f = nativeCloseFixture();
  f.failScene();
  await assert.rejects(f.service.processSavedExchange("scene", "turn"));
  const scene = f.scenes.get("scene")!,
    admitted = scene.sceneRevision;
  scene.sceneRevision++;
  await assert.rejects(f.service.processSavedExchange("scene", "turn"), /admitted revision/);
  assert.equal(scene.status, "active");
  assert(f.turn().narration);
  assert.equal(f.world.episodes.records.length, 1);
  f.scenes.get("scene")!.sceneRevision = admitted;
  await f.service.processSavedExchange("scene", "turn");
  assert.equal(f.scenes.get("scene")!.status, "closed");
});
await runCase("scene-narration/outbox", async () => {
  const f = fixture();
  f.scenes.set("scene", coerceSession(JSON.parse(JSON.stringify(f.scenes.get("scene")))));
  assert.deepEqual(f.calls, [], "service construction is inert");
  await f.service.processSavedExchange("scene", "turn");
  assert.equal(f.world.episodes.records.length, 1);
  assert.equal(f.world.continuity.versions.length, 1);
  assert.equal(f.turn().acceptance.status, "applied");
  assert.equal(f.turn().narration, undefined);
  assert.equal(f.scenes.get("scene")!.lines.length, 2);
  assert(f.world.episodes.records[0].segments.every((line) => line.role === "assistant"));
  assert.equal(f.scenes.get("scene")!.lines.find((line) => line.kind === "input")!.content, f.turn().message);
  const cold = coerceSession(JSON.parse(JSON.stringify(f.scenes.get("scene"))));
  assert.equal(cold.submissions[0].episodeId, f.world.episodes.records[0].id);
  await f.service.processSavedExchange("scene", "turn");
  assert.equal(f.calls.filter((call) => call === "world").length, 1);
  assert.throws(
    () => coerceSession({ ...cold, submissions: [{ id: "old", mode: "chat", message: "old", wishId: "old" }] }),
    "retired submissions have no compatibility reader",
  );
});
await runCase("scene-narration/held", async () => {
  const f = fixture(),
    pending = f.turn().narration!;
  pending.raw.keep = [{ id: "remember", for: [f.actorId], text: "Important retention.", source: ["h:missing"] }];
  pending.responseDigest = memoryHash(pending.raw);
  await f.service.processSavedExchange("scene", "turn");
  assert.equal(f.turn().acceptance.status, "held");
  assert(f.turn().narration);
  assert.equal(f.world.episodes.records.length, 0);
  assert.deepEqual(
    f.scenes.get("scene")!.lines.filter((line) => line.role === "assistant"),
    [],
  );
  assert(f.turn().acceptance.rejected.some((row) => row.id === "remember"));
});
await runCase("scene-narration/abandon", async () => {
  const f = fixture(),
    publication = structuredClone(f.turn().narration!);
  f.turn().acceptance.status = "held";
  assert.equal(
    await f.service.abandonSavedExchange(
      structuredClone(f.scenes.get("scene")!),
      publication.readset.source.operationId,
    ),
    "abandoned",
  );
  assert.equal(f.turn().acceptance.status, "abandoned");
  assert.deepEqual(f.turn().narration, publication);
  assert.equal(f.turn().progressProcessedAt, undefined);
  assert.equal(f.world.episodes.records.length, 0);
  assert.equal(f.world.continuity.versions.length, 0);
  assert.equal(narrationBlocker(f.scenes.get("scene")!), null);
  assert(narrationIsAbandoned(f.world, publication, "turn"));
  const fenced = memoryHash(f.world);
  assert.throws(() => acceptNarration(f.world, publication, "turn", at), /explicitly abandoned/);
  assert.equal(memoryHash(f.world), fenced, "a late acceptance cannot resurrect abandoned fiction");
  const altered = structuredClone(publication);
  altered.raw.segments = [];
  assert.throws(() => narrationIsAbandoned(f.world, altered, "turn"), /identity reused/);
  await f.service.processSavedExchange("scene", "turn");
  assert.equal(memoryHash(f.world), fenced);
  assert.deepEqual(
    f.scenes.get("scene")!.lines.filter((line) => line.role === "assistant"),
    [],
  );
  const scene = f.scenes.get("scene")!;
  scene.status = "closed";
  assert.equal(sceneReadyForRetirement(scene, f.world, ""), false);
  assert.throws(() => terminalForScene(scene, 1), /retained evidence/);
});
await runCase("scene-narration/abandon-lost-ack", async () => {
  for (const status of ["pending", "held"] as const) {
    const f = fixture();
    f.turn().acceptance.status = status;
    const publication = structuredClone(f.turn().narration!);
    f.failScene();
    await assert.rejects(
      f.service.abandonSavedExchange(structuredClone(f.scenes.get("scene")!), f.scenes.get("scene")!.operation!.id),
      (error) => error === f.exact,
    );
    assert(narrationIsAbandoned(f.world, publication, "turn"));
    assert.equal(f.turn().acceptance.status, status);
    f.interrupt();
    f.queue.push({ sessionId: "scene", submissionId: "turn" });
    const stop = f.service.startProgressRecovery();
    await f.recovered.promise;
    stop();
    assert.equal(
      f.turn().acceptance.status,
      "abandoned",
      "startup finishes a durable abandonment without native validation or ownership",
    );
    assert.deepEqual(f.turn().narration, publication);
    assert.equal(f.world.episodes.records.length, 0);
    assert.equal(
      await f.service.abandonSavedExchange(
        structuredClone(f.scenes.get("scene")!),
        f.scenes.get("scene")!.operation!.id,
      ),
      "abandoned",
    );
  }
});
await runCase("scene-narration/abandon-committed", async () => {
  const f = fixture();
  f.failScene();
  await assert.rejects(f.service.processSavedExchange("scene", "turn"), (error) => error === f.exact);
  f.world.worldPlaces.npcs[f.actorId].disabled = true;
  f.interrupt();
  assert.equal(
    await f.service.abandonSavedExchange(structuredClone(f.scenes.get("scene")!), f.scenes.get("scene")!.operation!.id),
    "applied",
  );
  assert.equal(f.turn().acceptance.status, "applied");
  assert.equal(f.world.episodes.records.length, 1);
  assert.equal(f.scenes.get("scene")!.lines.length, 2);
  const closed = structuredClone(f.scenes.get("scene")!);
  closed.status = "closed";
  closed.endedAt = at;
  assert.equal(sceneReadyForRetirement(closed, f.world, ""), true);
  const terminal = terminalForScene(closed, 1);
  assert.equal(terminal.version, 2);
  assert.equal(terminal.submissions[0].inputHash, f.turn().requestFingerprint);
});
await runCase("scene-narration/abandon-fence", async () => {
  for (const change of ["attempt", "revision", "purchase"]) {
    const f = fixture(),
      expected = structuredClone(f.scenes.get("scene")!);
    const entered = Promise.withResolvers<void>(),
      gate = Promise.withResolvers<void>();
    const service = createSceneProgress({
      ...f.ports,
      withSceneWork: async (_id, work) => {
        entered.resolve();
        await gate.promise;
        return work();
      },
    });
    const pending = service.abandonSavedExchange(expected, expected.operation!.id);
    await entered.promise;
    const current = f.scenes.get("scene")!;
    if (change === "attempt") {
      current.operation!.attemptId = "new-attempt";
      current.operation!.token = "new-owner";
    }
    if (change === "revision") current.sceneRevision++;
    if (change === "purchase") current.submissions[0].narration!.raw.changed = true;
    const before = memoryHash([f.world, [...f.scenes]]);
    gate.resolve();
    await assert.rejects(pending, /changed before abandonment/);
    assert.equal(memoryHash([f.world, [...f.scenes]]), before, "a stale abandonment has no root or Scene side effects");
  }
});
await runCase("scene-narration/startup-no-write", async () => {
  const f = fixture(),
    storage = sceneHistoryFixture();
  try {
    const repository = createVillageRepository(() => storage.gate.documents);
    await repository.mutateAuthority(
      (state) => {
        Object.assign(state, structuredClone(f.world));
      },
      { memories: true },
    );
    const stateService = createVillageStateService(repository);
    f.turn().acceptance.status = "held";
    const service = createSceneProgress({
      ...f.ports,
      readVillageAuthority: () => repository.readAuthority({ memories: true }),
      mutateVillageState: stateService.mutateVillageState,
    });
    const before = memoryHash([...storage.rows]);
    await service.processSavedExchange("scene", "turn", true);
    assert.equal(
      memoryHash([...storage.rows]),
      before,
      "actual state-service/repository startup leaves authority revision and payloads unchanged for an unmarked hold",
    );
    assert.equal(f.turn().acceptance.status, "held");
  } finally {
    storage.release();
  }
});
await runCase("scene-narration/replace-committed", async () => {
  const f = fixture();
  f.failScene();
  await assert.rejects(f.service.processSavedExchange("scene", "turn"));
  const scene = structuredClone(f.scenes.get("scene")!);
  const commands = createSceneCommands({
    readSession: f.ports.readSession,
    requireLiveVenueSession: f.ports.readSession,
    abandonSavedExchange: f.service.abandonSavedExchange,
    runtimeDebug() {},
    venueRefusal: (_code, message) => Error(message),
    generate: async () => {
      throw Error("Must not purchase");
    },
    coordinateVenue: async () => {
      throw Error("Must recover committed truth before replacement admission");
    },
  } as never);
  await assert.rejects(
    commands.sendVenueTurn({
      sessionId: "scene",
      submissionId: "edited",
      message: "Edited draft",
      mode: "chat",
      targetId: "",
      expectedSceneRevision: scene.sceneRevision,
      retryOfAttemptId: scene.operation!.attemptId,
      replaceOfOperationId: scene.operation!.id,
    }),
    /already committed/,
  );
  assert.equal(f.turn().acceptance.status, "applied");
  assert.equal(f.world.episodes.records.length, 1);
  assert.equal(f.scenes.get("scene")!.submissions.length, 1);
});
await runCase("scene-narration/retirement", async () => {
  for (const mode of ["applied", "abandoned", "missing"]) {
    const abandoned = mode === "abandoned",
      missing = mode === "missing";
    const f = fixture(),
      storage = sceneHistoryFixture();
    try {
      if (abandoned)
        await f.service.abandonSavedExchange(
          structuredClone(f.scenes.get("scene")!),
          f.scenes.get("scene")!.operation!.id,
        );
      else await f.service.processSavedExchange("scene", "turn");
      const scene = structuredClone(f.scenes.get("scene")!);
      scene.status = "closed";
      scene.endedAt = at;
      scene.operation!.status = "complete";
      scene.operation!.error = "";
      const repository = createVillageRepository(() => storage.gate.documents);
      await repository.mutateAuthority(
        (state) => {
          Object.assign(state, structuredClone(f.world));
          if (missing) {
            state.continuity = defaultVillageState().continuity;
            state.episodes = defaultVillageState().episodes;
          }
        },
        { memories: true },
      );
      await storage.mutateDocument("villages-venue-visit-scene", sessionSlot(storage.gate.documents), (saved) => {
        Object.assign(saved, scene);
      });
      const terminals = createSceneTerminalStore({
        villagesDocuments: () => storage.gate.documents,
        mutateDocument: storage.mutateDocument,
      });
      const sceneFence = createSceneWorkFence(),
        lateFence = createSceneWorkFence();
      const retirement = createSceneRetirement({
        villagesDocuments: () => storage.gate.documents,
        readVillageState: () => repository.readAuthority({ memories: true }),
        readActive: async () => ({ sessionId: "", placeId: "" }),
        hasVenueOperation: () => false,
        saveTerminal: terminals.save,
        withRepairWork: (work) => storage.gate.work(work),
        withSceneWork: (id, work) => sceneFence.run(id, work),
        withLateResponseWork: (id, work) => lateFence.run(id, work),
      });
      assert.equal(await retirement.retire("scene"), !abandoned && !missing);
      await collectRetainedStorage(storage.gate);
      const cold = await createVillageRepository(() => storage.gate.documents).readAuthority({ memories: true });
      assert.equal(
        cold.episodes.records.length,
        abandoned || missing ? 0 : 1,
        "retiring Scene prose never releases accepted common history",
      );
      assert.equal(cold.continuity.versions.length, abandoned || missing ? 0 : 1);
      if (abandoned || missing) {
        assert.equal(await terminals.read("scene"), null);
        assert.deepEqual(
          (await storage.repository.readSession("scene")).submissions[0].narration,
          scene.submissions[0].narration,
        );
      } else {
        assert.equal(
          (await terminals.read("scene"))!.submissions[0].inputHash,
          scene.submissions[0].requestFingerprint,
        );
        assert.equal(cold.episodes.records[0].privateInput, scene.submissions[0].message);
        await assert.rejects(storage.repository.readSession("scene"), /no longer available/);
      }
    } finally {
      storage.release();
    }
  }
});
await runCase("scene-narration/skip-ownership", async () => {
  const f = fixture(),
    scene = f.scenes.get("scene")!;
  const nextOperation = structuredClone(scene.operation!);
  nextOperation.token = "new-turn-owner";
  nextOperation.status = "running";
  delete scene.operation;
  scene.status = "opening";
  scene.submissions = [];
  const commands = createSceneCommands({
    activationScope: () => undefined,
    readSession: f.ports.readSession,
    changeSession: f.ports.changeSession,
    requireLiveVenueSession: async () => {
      scene.operation = nextOperation;
      return structuredClone(scene);
    },
    sceneWork: () => ({
      abortGreeting: () => {
        throw Error("Must not abort a newly started request");
      },
    }),
    cancelVenueOperation: async () => {
      throw Error("An absent observed greeting cannot authorize cancelling a later turn");
    },
  } as never);
  await assert.rejects(commands.continueVenueWithoutGreeting("scene"), /request changed/);
  assert.equal(scene.operation?.token, "new-turn-owner");
  assert.equal(scene.status, "opening");
});
await runCase("scene-narration/input-playback", async () => {
  const f = fixture(),
    storage = sceneHistoryFixture();
  try {
    const message = "  (I privately feel nervous 🌼.)\nI am learning weaving.  ";
    f.turn().message = message;
    f.turn().requestFingerprint = memoryHash(["chat", "", null, message]);
    f.turn().narration!.readset.source.input = message;
    await f.service.processSavedExchange("scene", "turn");
    const scene = structuredClone(f.scenes.get("scene")!);
    scene.continuity = captureSceneContinuity(f.world, scene, Date.parse(at));
    const repository = createVillageRepository(() => storage.gate.documents);
    await repository.mutateAuthority(
      (state) => {
        Object.assign(state, f.world);
      },
      { memories: true },
    );
    await storage.mutateDocument("villages-venue-visit-scene", sessionSlot(storage.gate.documents), (saved) => {
      Object.assign(saved, scene);
    });
    const query = createSceneQueryService({
      readSession: storage.repository.readSession,
      readVillageState: () => repository.readAuthority({ memories: true }),
      villagesDocuments: () => storage.gate.documents,
    });
    const reloaded = await storage.repository.readSession("scene");
    const projected = await query.projectSceneResponse(reloaded as unknown as Record<string, unknown>);
    const scope = projected.playback.scope;
    const playback = await query.readPlaybackPage("scene", { scope, first: "1" });
    for (const lines of [projected.lines, (await query.readHistoryPage("scene", { scope })).lines, playback.lines]) {
      const own = lines.filter((line) => line.kind === "input");
      assert.equal(own.length, 1);
      assert.equal(own[0].content, message);
      assert.equal(own[0].inputOf, "turn");
    }
    const input = reloaded.lines.find((line) => line.kind === "input")!;
    const ownSteps = scenePlaybackSteps(playback, "Iris", reloaded.activeIds).filter(
      (step) => step.lineId === input.id,
    );
    assert(
      ownSteps.length > 0 && ownSteps.every((step) => step.player && step.name === "Iris" && step.speakerId === ""),
      "canonical input uses the player's existing name, portrait and styling path",
    );
    assert.deepEqual(input.heardBy, []);
    assert(!heardLines(reloaded, f.actorId).some((line) => line.id === input.id));
    const episode = f.world.episodes.records[0];
    assert(!episode.segments.some((line) => line.id === input.id));
    assert.throws(
      () => readAcceptedEpisode({ ...episode, segments: [input, ...episode.segments] }, f.world.seed),
      /invalid accepted episode segment/,
    );
    const resident = actorEpisodeView(
      episode,
      f.world.continuity,
      continuityActor(f.world, f.actorId)!,
      f.world.episodes,
    );
    assert(!JSON.stringify(resident).includes("nervous"));
    assert.throws(
      () => coerceSession({ ...reloaded, lines: [{ ...input, heardBy: [f.actorId] }] }),
      /cannot grant speech or perception/,
    );
  } finally {
    storage.release();
  }
});
await runCase("scene-narration/lost-ack", async () => {
  const f = fixture();
  f.failScene();
  await assert.rejects(f.service.processSavedExchange("scene", "turn"), (error) => error === f.exact);
  assert.equal(f.world.episodes.records.length, 1);
  assert(f.turn().narration);
  assert.deepEqual(
    f.scenes.get("scene")!.lines.filter((line) => line.role === "assistant"),
    [],
  );
  f.world.worldPlaces.npcs[f.actorId].disabled = true;
  f.interrupt();
  await f.service.processSavedExchange("scene", "turn");
  assert.equal(f.turn().acceptance.status, "applied");
  assert.equal(f.world.episodes.records.length, 1);
  assert.equal(f.world.continuity.versions.length, 1);
  assert.equal(f.scenes.get("scene")!.lines.length, 2);
});
await runCase("scene-narration/write-failure", async () => {
  const f = fixture();
  f.failWorld();
  await assert.rejects(f.service.processSavedExchange("scene", "turn"), (error) => error === f.exact);
  assert.equal(f.world.episodes.records.length, 0);
  assert(f.turn().narration);
  assert.equal(f.turn().acceptance.status, "pending");
  await f.service.processSavedExchange("scene", "turn");
  assert.equal(f.turn().acceptance.status, "applied");
});
await runCase("scene-narration/startup-hold", async () => {
  const f = fixture();
  f.turn().acceptance.status = "held";
  f.add("pending");
  f.queue.push({ sessionId: "scene", submissionId: "turn" }, { sessionId: "pending", submissionId: "turn" });
  const stop = f.service.startProgressRecovery();
  await f.recovered.promise;
  stop();
  assert.equal(f.turn().acceptance.status, "held");
  assert.equal(f.scenes.get("pending")!.submissions[0].acceptance.status, "applied");
  await f.service.processSavedExchange("scene", "turn");
  assert.equal(f.turn().acceptance.status, "applied", "explicit saved-result replay may retry a held request");
});
await runCase("scene-narration/activation-owner", async () => {
  const a = createActivationScope(),
    b = createActivationScope(),
    first = fixture("first"),
    second = fixture("second");
  const releaseA = a.run(() => configureSceneProgress(first.service));
  first.pause("read:scene");
  const pending = a.run(() => processSavedExchange("scene", "turn"));
  await first.entered.promise;
  const releaseB = b.run(() => configureSceneProgress(second.service));
  await b.run(() => processSavedExchange("scene", "turn"));
  first.gate.resolve();
  await b.run(() => pending);
  assert(first.owners.every((owner) => owner === a));
  assert(second.owners.every((owner) => owner === b));
  assert.equal(first.world.episodes.records[0].seed, "first");
  assert.equal(second.world.episodes.records[0].seed, "second");
  releaseB();
  releaseA();
});

await runCase("scene-narration/private-projection", async () => {
  const f = fixture(),
    turn = f.turn();
  turn.acceptance.status = "held";
  turn.narration!.raw.keep = [{ for: [f.actorId], text: "PRIVATE RESIDENT KEEP", source: ["h:private"] }];
  turn.narration!.readset.source.historical["h:private"] = {
    id: "private",
    seed: f.world.seed,
    episodeId: "private-episode",
    unitId: "private-line",
    fingerprint: "f".repeat(64),
    kind: "knowledge",
    actorId: f.actorId,
    excerpt: "PRIVATE FITTED KNOWLEDGE",
    positions: { [f.actorId]: "PRIVATE POSITION" },
    perceptions: [],
  };
  for (const projection of [
    publicSceneResponse(f.scenes.get("scene")!),
    publicSceneAuthority(f.scenes.get("scene")!),
  ]) {
    const json = JSON.stringify(projection);
    assert(!json.includes("PRIVATE") && !json.includes("readset") && !json.includes("narration"));
    assert.equal(projection.processingSummary.failed, 1);
  }
  const publicScene = publicSceneResponse(f.scenes.get("scene")!);
  assert.equal(publicScene.submissions[0].message, turn.message, "the player retains their own original submission");
  assert.deepEqual(publicScene.lines, []);
});

await runCase("scene-narration/validation-hold", async () => {
  const f = fixture();
  f.world.worldPlaces.npcs[f.actorId].disabled = true;
  await assert.rejects(f.service.processSavedExchange("scene", "turn"), /incarnation changed/);
  assert.equal(f.turn().acceptance.status, "held");
  assert(f.turn().narration);
  assert.equal(f.world.episodes.records.length, 0);
  const saved = memoryHash([f.world, [...f.scenes]]);
  f.queue.push({ sessionId: "scene", submissionId: "turn" });
  const stop = f.service.startProgressRecovery();
  await f.recovered.promise;
  stop();
  assert.equal(
    memoryHash([f.world, [...f.scenes]]),
    saved,
    "startup checks durable disposition without rerunning or modifying a held purchase",
  );
});

await runCase("scene-narration/cancellation", async () => {
  const interrupted = fixture();
  interrupted.interrupt();
  await assert.rejects(interrupted.service.processSavedExchange("scene", "turn"), /Cancelled operation/);
  assert.equal(interrupted.world.episodes.records.length, 0);
  assert.equal(interrupted.turn().acceptance.status, "held");
  assert(interrupted.turn().narration);
  const f = fixture(),
    scene = f.scenes.get("scene")!;
  scene.operation = {
    id: f.turn().narration!.readset.source.operationId,
    kind: "turn",
    input: { message: f.turn().message },
    token: "cancelled-token",
    attemptId: "attempt",
    status: "complete",
    stage: "cancelled",
    startedAt: at,
    sceneRevision: scene.sceneRevision,
    snapshot: null,
    checkpoints: {},
    attempts: {},
    error: "",
  };
  f.queue.push({ sessionId: "scene", submissionId: "turn" });
  const stop = f.service.startProgressRecovery();
  await f.recovered.promise;
  stop();
  assert.equal(f.world.episodes.records.length, 0, "startup cannot publish an explicitly cancelled uncommitted reply");
  assert.equal(f.turn().acceptance.status, "held");
  await f.service.processSavedExchange("scene", "turn");
  assert.equal(f.turn().acceptance.status, "applied", "explicit saved-result recovery remains provider-free");
});

await runCase("scene-narration/connected-turn", async () => {
  const f = fixture(),
    scene = f.scenes.get("scene")!;
  scene.submissions = [];
  const message = "Privately I am nervous. I say, “I am learning weaving.”";
  let purchases = 0,
    resolutions = 0,
    promptInput = "",
    promptBody = "",
    operationId = "new-turn";
  const checkpoints = new Map<string, unknown>();
  const writer = createSceneWriting({
    venueOperationId: () => operationId,
    venueCheckpoint: async (key, work) => {
      if (!checkpoints.has(key)) checkpoints.set(key, structuredClone(await work()));
      return structuredClone(checkpoints.get(key));
    },
    venueSavedCheckpoint: (key) => structuredClone(checkpoints.get(key)),
    readVillageState: async () => f.world,
    villagesConnectionIdFor: async () => "narration",
    villagesLanguageModels: () => ({
      resolveForRequest: async () => {
        resolutions++;
        return {
          model: "fixture",
          connectionId: "narration",
          maxOutputTokens: 4096,
          fitContext: (messages, options) => ({ messages, maxTokens: options.maxTokens, trimmed: false }),
        };
      },
    }),
    readEffectiveVillagerCard: () => {
      throw Error("Only captured NPC identity expected");
    },
    readVillageLore: async () => [],
    completeWithRoom: async (_model, messages) => {
      purchases++;
      promptInput = messages.at(-1)!.content;
      promptBody = messages.map((message) => message.content).join("\n");
      if (operationId === "contact-turn")
        return {
          content: JSON.stringify({ segments: [{ kind: "narration", text: "The doorway stays quiet." }] }),
          finishReason: "stop",
        };
      return {
        content: JSON.stringify({
          segments: [
            {
              kind: "dialogue",
              speakerId: f.actorId,
              id: "answer",
              text: "I will remember that you are learning weaving.",
              requires: ["remember"],
            },
          ],
          keep: [
            {
              id: "remember",
              for: [f.actorId],
              text: "The player said they are learning weaving.",
              source: [{ input: "I am learning weaving.", ground: { kind: "spoken", to: [f.actorId] } }],
            },
          ],
        }),
        finishReason: "stop",
      };
    },
    rejectVenueCompletion: async () => {
      throw Error("Unexpected provider retry");
    },
    measurePipeline: f.ports.measurePipeline,
    runtimeDebug() {},
  } as never);
  const commands = createSceneCommands({
    generate: writer.generate,
    processSavedExchange: f.service.processSavedExchange,
    readSession: f.ports.readSession,
    changeSession: f.ports.changeSession,
    requireLiveVenueSession: f.ports.readSession,
    readVillageState: async () => f.world,
    sceneWork: () => ({ isMoving: () => false }),
    assertVenueOwnership: f.ports.assertVenueOwnership,
    venueOperationSignal: () => undefined,
    venueOperationSnapshot: () => undefined,
    venueRequestMetrics: () => null,
    runtimeDebug() {},
    coordinateVenue: async (_id, operation, _kind, _payload, _revision, _retry, work) => {
      operationId = operation;
      return work();
    },
    venueRefusal: (_code, text) => Error(text),
  } as never);
  const input = {
    sessionId: "scene",
    submissionId: "new-turn",
    message,
    mode: "chat" as const,
    targetId: "",
    expectedSceneRevision: 1,
  };
  const first = await commands.sendVenueTurn(input);
  assert.equal(first.session.submissions[0].acceptance.status, "applied");
  assert.equal(f.world.episodes.records.length, 1);
  assert.equal(f.world.episodes.records[0].privateInput, message);
  assert.equal(promptInput, message, "the single GM receives the exact original freeform submission");
  assert.equal(f.world.continuity.versions[0].text, "The player said they are learning weaving.");
  assert(
    !JSON.stringify(f.world.episodes.records[0].grounding).includes("nervous"),
    "private thought was never taught to the resident",
  );
  await commands.sendVenueTurn({
    ...input,
    replaceOfOperationId: "original-failed-request",
    retryOfAttemptId: "original-attempt",
  });
  assert.equal(purchases, 1);
  assert.equal(resolutions, 1);
  assert.equal(f.world.episodes.records.length, 1);
  const current = f.scenes.get("scene")!;
  for (let index = 0; index < 5; index++) {
    const id = "npc:remote-" + index;
    f.world.worldPlaces.npcs[id] = readNpc({
      id,
      name: "Remote " + index,
      label: "Remote " + index,
      characterization: "CONTACT_PROFILE_" + index,
      revision: 1,
      facts: [],
      associations: [],
      availability: "",
      disabled: false,
      source: "fixture:remote-" + index,
      updatedAt: at,
    });
    current.sceneAttendance!.occupants.push({
      characterId: id,
      name: "Remote " + index,
      doing: "Nearby",
      zoneId: "exterior",
    });
  }
  const targetId = "npc:remote-4",
    contact = {
      kind: "call" as const,
      targetId,
      boundaryZoneId: "exterior",
      quote: "Anyone there?",
      delivery: "voice" as const,
    };
  await commands.sendVenueTurn({
    sessionId: "scene",
    submissionId: "contact-turn",
    message: "Anyone there?",
    mode: "contact",
    targetId,
    contact,
  });
  assert(
    promptBody.includes("CONTACT_PROFILE_4"),
    "admitted remote target retains its authored identity among several candidates",
  );
  assert(
    promptBody.includes(
      JSON.stringify({
        kind: contact.kind,
        targetId,
        boundaryZoneId: contact.boundaryZoneId,
        delivery: contact.delivery,
      }),
    ),
    "the native Contact intent reaches the one GM without rewriting the original submission",
  );
  assert.equal(promptInput, "Anyone there?");
  assert.equal(purchases, 2, "each distinct interactive request purchases once");
});

await runCase("scene-narration/saved-changes", async () => {
  const f = fixture();
  const changes = createSceneChanges({
    readSession: f.ports.readSession,
    readVillageState: async () => f.world,
    mutateVillageState: f.ports.mutateVillageState,
    processSavedExchange: f.service.processSavedExchange,
  });
  const pending = await changes.readSceneChanges("scene");
  assert.equal(pending.processingSummary.pending, 1);
  assert.equal(f.world.episodes.records.length, 0, "reading saved changes never accepts or generates anything");
  assert(!JSON.stringify(pending).includes(f.turn().message));
  f.world.worldPlaces.npcs[f.actorId].disabled = true;
  await assert.rejects(f.service.processSavedExchange("scene", "turn"));
  const held = await changes.readSceneChanges("scene");
  assert.equal(held.processingSummary.failed, 1);
  assert.equal(held.unresolved[0].status, "held");
  assert(!JSON.stringify(held).includes("incarnation"), "ordinary feed omits private validation diagnostics");
  assert((await changes.readSceneErrorDetails("scene")).errors.some((row) => row.details.includes("incarnation")));
  f.world.worldPlaces.npcs[f.actorId].disabled = false;
  const replayed = await changes.replaySceneChanges("scene");
  assert.equal(replayed.processingSummary.failed, 0);
  assert.equal(replayed.unresolved.length, 0);
  assert.equal(f.world.episodes.records.length, 1);
  await assert.rejects(changes.readSceneChanges("scene", "0:0"), /cursor/, "old cursors have no compatibility parser");
});

await runCase("scene-narration/coordinator-startup-hold", async () => {
  const f = fixture(),
    storage = sceneHistoryFixture();
  try {
    const { continuity: _continuity, episodes: _episodes, worldPlaces: _places, ...fields } = f.world;
    await storage.documents.create({
      id: "villages-village",
      packageId: "villages",
      kind: "village",
      name: "World",
      description: "",
      data: { ...fields, memoryHead: null },
    });
    const scene = f.scenes.get("scene")!;
    f.turn().acceptance = { status: "held", rejected: [{ id: "remember", reason: "Preserved hold" }] };
    scene.operation = {
      id: f.turn().narration!.readset.source.operationId,
      kind: "turn",
      input: { message: f.turn().message, mode: "chat", targetId: "" },
      token: "held-owner",
      attemptId: "held-attempt",
      status: "interrupted",
      stage: "saved narration",
      startedAt: at,
      sceneRevision: scene.sceneRevision,
      snapshot: null,
      checkpoints: { "held-proof": { preserved: true } },
      attempts: {},
      error: "Preserved hold",
    };
    await storage.mutateDocument("villages-venue-visit-scene", sessionSlot(storage.gate.documents), (saved) =>
      Object.assign(saved, scene),
    );
    const logger = { debug() {}, info() {}, warn() {}, error() {} };
    const coordinator = createVenueCoordinator({
      operations: createVenueOperationContext(() => logger),
      villagesDocuments: () => storage.gate.documents,
      villagesLogger: () => logger,
      runtimeDebug() {},
      withRepairWork: (work) => storage.gate.work(work),
    });
    const commands = createSceneCommands({
      recoverVenueOperations: coordinator.recoverVenueOperations,
      coordinateVenue: async () => {
        throw Error("A held request must not be admitted by startup");
      },
      generate: async () => {
        throw Error("Startup must not purchase or regenerate");
      },
      processSavedExchange: async () => {
        throw Error("Startup must not replay held fiction");
      },
    } as never);
    const before = structuredClone([...storage.rows]);
    await commands.recoverVenueSceneWork();
    assert.deepEqual(
      [...storage.rows],
      before,
      "real coordinator startup preserves operation status/error, checkpoint and held outbox bytes",
    );
    const cold = await storage.repository.readSession("scene");
    assert.equal(cold.submissions[0].narration!.responseDigest, f.turn().narration!.responseDigest);
    await storage.repository.changeSession("scene", (saved) => {
      mutableSceneSubmission(saved, "turn")!.acceptance.status = "pending";
    });
    let protectedRows: unknown;
    const lateHold = createVenueCoordinator({
      operations: createVenueOperationContext(() => logger),
      villagesDocuments: () => storage.gate.documents,
      villagesLogger: () => logger,
      runtimeDebug() {},
      withRepairWork: (work) => storage.gate.work(work),
      withSceneWork: async (_id, work) => {
        await storage.repository.changeSession("scene", (saved) => {
          mutableSceneSubmission(saved, "turn")!.acceptance.status = "held";
        });
        protectedRows = structuredClone([...storage.rows]);
        return work();
      },
    });
    await lateHold.recoverVenueOperations(async () => {
      throw Error("A hold recorded after the scan must remain held");
    });
    assert.deepEqual([...storage.rows], protectedRows, "hold is checked again after acquiring Scene work admission");
  } finally {
    storage.release();
  }
});
