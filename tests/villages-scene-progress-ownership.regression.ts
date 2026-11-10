// Test cases: scene-narration/outbox, scene-narration/held, scene-narration/lost-ack, scene-narration/write-failure, scene-narration/startup-hold, scene-narration/activation-owner, scene-narration/private-projection, scene-narration/validation-hold, scene-narration/cancellation, scene-narration/connected-turn, scene-narration/saved-changes, scene-narration/coordinator-startup-hold
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
import { readNpc } from "../packages/villages/src/server/domain/rules/places.js";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
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
await runCase("scene-narration/outbox", async () => {
  const f = fixture();
  f.scenes.set("scene", coerceSession(JSON.parse(JSON.stringify(f.scenes.get("scene")))));
  assert.deepEqual(f.calls, [], "service construction is inert");
  await f.service.processSavedExchange("scene", "turn");
  assert.equal(f.world.episodes.records.length, 1);
  assert.equal(f.world.continuity.versions.length, 1);
  assert.equal(f.turn().acceptance.status, "applied");
  assert.equal(f.turn().narration, undefined);
  assert.equal(f.scenes.get("scene")!.lines.length, 1);
  assert(f.scenes.get("scene")!.lines.every((line) => line.role === "assistant"));
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
  assert.deepEqual(f.scenes.get("scene")!.lines, []);
  assert(f.turn().acceptance.rejected.some((row) => row.id === "remember"));
});
await runCase("scene-narration/lost-ack", async () => {
  const f = fixture();
  f.failScene();
  await assert.rejects(f.service.processSavedExchange("scene", "turn"), (error) => error === f.exact);
  assert.equal(f.world.episodes.records.length, 1);
  assert(f.turn().narration);
  assert.deepEqual(f.scenes.get("scene")!.lines, []);
  f.world.worldPlaces.npcs[f.actorId].disabled = true;
  f.interrupt();
  await f.service.processSavedExchange("scene", "turn");
  assert.equal(f.turn().acceptance.status, "applied");
  assert.equal(f.world.episodes.records.length, 1);
  assert.equal(f.world.continuity.versions.length, 1);
  assert.equal(f.scenes.get("scene")!.lines.length, 1);
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
  const writes = f.calls.filter((call) => call === "world").length;
  f.queue.push({ sessionId: "scene", submissionId: "turn" });
  const stop = f.service.startProgressRecovery();
  await f.recovered.promise;
  stop();
  assert.equal(
    f.calls.filter((call) => call === "world").length,
    writes,
    "startup preserves an actual deterministic validation hold without rerunning the unusable purchase",
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
  await commands.sendVenueTurn(input);
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
