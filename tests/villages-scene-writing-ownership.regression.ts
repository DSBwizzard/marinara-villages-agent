import { createExchangeProcessing } from "../packages/villages/src/server/domain/decoding/exchange-codec.js";
import assert from "node:assert/strict";
import {
  createActivationScope,
  activationScope,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { readEffectiveVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { wishFingerprint } from "../packages/villages/src/server/domain/rules/social-wishes.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import {
  createSceneWriting,
  type SceneWritingPorts,
} from "../packages/villages/src/server/features/scenes/writing-service.js";
import {
  configureSceneWriting,
  generate,
  prepareVenueTurnMessages,
} from "../packages/villages/src/server/features/scenes/writing.js";
import { fixtureWish, wishWorld } from "./helpers/social-wishes-fixture.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import { addMemory, emptyMemories, memoryRepair, memoryTime } from "./helpers/memories-fixture.js";
import { applyMemoryRepair } from "../packages/villages/src/server/domain/rules/memory-application.js";
import { createHash } from "node:crypto";
const stamp = "2026-10-07T12:00:00.000Z";
function deferred() {
  return Promise.withResolvers<void>();
}
function fixture(label: string, checkpointed = false) {
  const world = defaultVillageState();
  world.seed = "same-seed";
  world.name = label;
  world.foundedAt = world.setupAt = stamp;
  const scene = coerceSession({
    version: 4,
    semanticVersion: 2,
    id: "same-scene",
    placeId: "same-place",
    placeName: "Common room",
    area: "public",
    status: "active",
    startedAt: stamp,
    zoneId: "exterior",
    villageSeed: world.seed,
    participants: [],
    activeIds: [],
    lines: [],
    submissions: [],
  });
  const calls: string[] = [],
    owners: unknown[] = [];
  const entered = deferred(),
    gate = deferred();
  const exact = new Error(label + " exact failure");
  let paused = "",
    failure = "",
    usedPause = false,
    guardDisposed = false,
    brokenReply: string | null = null;
  const owner = createActivationScope();
  const checkpoints = new Map<string, unknown>();
  const requests: unknown[] = [];
  const optionsSeen: any[] = [];
  let roomInterpretation:
    import("../packages/villages/src/server/domain/models/interpretation-model.js").InterpretationBatch | null = null;
  async function touch(stage: string) {
    calls.push(stage);
    owners.push(activationScope());
    if (guardDisposed && !owner.active) throw exact;
    if (stage === failure) throw exact;
    if (stage === paused && !usedPause) {
      usedPause = true;
      entered.resolve();
      await gate.promise;
      if (guardDisposed && !owner.active) throw exact;
    }
  }
  type Model = Awaited<ReturnType<ReturnType<SceneWritingPorts["villagesLanguageModels"]>["resolveForRequest"]>>;
  const model: Model = {
    name: label,
    model: label,
    connectionId: label,
    maxContext: 100000,
    maxOutputTokens: 2000,
    chatComplete: async () => assert.fail("Only the injected completion port may request a reply"),
    fitContext(messages, options) {
      calls.push("fit");
      owners.push(activationScope());
      return {
        messages,
        maxTokens: options?.maxTokens,
        estimatedTokensBefore: 10,
        estimatedTokensAfter: 10,
        trimmed: false,
      };
    },
  };
  const ports: SceneWritingPorts = {
    readVillageState: async () => {
      await touch("world");
      return world;
    },
    villagesConnectionIdFor: async (purpose) => {
      assert.equal(purpose, "narration");
      await touch("connection");
      return label;
    },
    readVillageLore: async () => {
      await touch("lore");
      return [label + " lore"];
    },
    villagesLanguageModels: () => ({
      resolveForRequest: async (request) => {
        assert.equal(request.connectionId, label);
        await touch("model");
        return model;
      },
    }),
    readEffectiveVillagerCard,
    wishFingerprint,
    villagesLogger: () => ({
      warn: () => {
        calls.push("warning");
      },
    }),
    measurePipeline: async (_name, _tags, run) => {
      calls.push("pipeline");
      return run();
    },
    runtimeDebug: () => {
      calls.push("debug");
    },
    venueOperationId: () => label + " operation",
    venueCheckpoint: async <T>(stage: string, work: () => Promise<T>): Promise<T> => {
      if (!checkpointed) return work();
      if (checkpoints.has(stage)) return structuredClone(checkpoints.get(stage)) as T;
      const value = await work();
      checkpoints.set(stage, structuredClone(value));
      return value;
    },
    venueSavedCheckpoint: <T>(stage: string) =>
      checkpointed && checkpoints.has(stage) ? (structuredClone(checkpoints.get(stage)) as T) : undefined,
    rejectVenueCompletion: async () => {
      calls.push("reject");
    },
    completeWithRoom: async (selected, _messages, _tokens, options) => {
      assert.equal(selected, model);
      assert.equal(options.usagePurpose, "conversation");
      assert.equal(options.temperature, 0.85);
      requests.push(structuredClone(_messages));
      optionsSeen.push(structuredClone(options));
      await touch("completion");
      return {
        content: brokenReply ?? "INPUT action\n[narration] " + label + " room remains quiet.",
        finishReason: "stop",
      };
    },
    refreshZoneParticipants: async (selected) => {
      assert.equal(selected, scene);
      await touch("refresh");
      return scene;
    },
    semantic: {
      exchange: async () => {
        await touch("interpretation");
        return {
          version: 2,
          checkpointKey: "exchange",
          sourceHash: "current-gm",
          producer: "gm",
          authority: { physical: false, access: true, projects: false, standing: false },
          effects: {
            memoryChanges: [],
            relationshipChanges: { changes: [], permissions: [], disclosures: [] },
            wishChanges: [],
            projectSpeech: [],
          },
          access: roomInterpretation,
        };
      },
    },
  };
  const service = createSceneWriting(ports);
  return {
    world,
    scene,
    calls,
    owners,
    owner,
    service,
    model,
    checkpoints,
    interpretation(value: typeof roomInterpretation) {
      roomInterpretation = value;
    },
    entered,
    gate,
    exact,
    requests,
    optionsSeen,
    pause(stage: string) {
      paused = stage;
    },
    fail(stage: string) {
      failure = stage;
    },
    guardDisposal() {
      guardDisposed = true;
    },
    invalidReply(content = "invalid") {
      brokenReply = content;
    },
    run() {
      return service.generate(scene, "I wait.", "chat", "", null);
    },
  };
}
{
  const legacy = fixture("legacy-v9", true);
  const prepared = await legacy.service.prepareVenueTurnMessages(legacy.scene, "I wait.", "chat", "", null);
  const messages = [
    { role: "system", content: "Exact retained v9 JSON writer prompt." },
    { role: "user", content: "I wait." },
  ];
  const fitted = { ...prepared.fitted, messages };
  const key =
    "writing-request:" +
    createHash("sha256")
      .update(JSON.stringify([legacy.scene.id, "chat", "I wait."]))
      .digest("hex");
  legacy.checkpoints.set(key, {
    fitted,
    ordinary: fitted,
    writingVersion: 9,
    earlierEvidence: prepared.earlierEvidence,
    wishContexts: prepared.wishContexts,
    gmContext: prepared.gmContext,
    gmPresentation: prepared.gmPresentation,
    historyContract: prepared.historyContract,
  });
  legacy.invalidReply(
    JSON.stringify({
      input: "action",
      segments: [{ kind: "narration", text: "Retained v9 response." }],
      heardPlayerBy: [],
    }),
  );
  const reply = await legacy.run();
  assert.equal(reply.lines[0]!.content, "Retained v9 response.");
  assert.deepEqual(legacy.requests[0], messages, "Captured provider bytes remain unchanged");
  assert.deepEqual(legacy.optionsSeen[0].responseFormat, { type: "json_object" });
  assert.equal(reply.sceneContractVersion, undefined);
}
{
  const legacy = fixture("legacy-v10", true);
  const prepared = await legacy.service.prepareVenueTurnMessages(legacy.scene, "I wait.", "chat", "", null);
  const messages = [
    { role: "system", content: "Exact retained v10 prose writer prompt." },
    { role: "user", content: "I wait." },
  ];
  const fitted = { ...prepared.fitted, messages };
  const key =
    "writing-request:" +
    createHash("sha256")
      .update(JSON.stringify([legacy.scene.id, "chat", "I wait."]))
      .digest("hex");
  legacy.checkpoints.set(key, {
    fitted,
    ordinary: fitted,
    writingVersion: 10,
    earlierEvidence: prepared.earlierEvidence,
    wishContexts: prepared.wishContexts,
    gmContext: prepared.gmContext,
    gmPresentation: prepared.gmPresentation,
    historyContract: prepared.historyContract,
  });
  legacy.invalidReply("INPUT action\n[narration] Retained v10 response.");
  const reply = await legacy.run();
  assert.equal(reply.lines[0]!.content, "Retained v10 response.");
  assert.deepEqual(legacy.requests[0], messages, "Captured v10 provider bytes remain unchanged");
  assert.equal(legacy.optionsSeen[0].responseFormat, undefined);
  assert.equal(reply.sceneContractVersion, 10);
}
{
  const receipt = fixture("server-only-receipt");
  receipt.scene.operation = { input: { submissionId: "private-physical-receipt" } } as any;
  const prepared = await receipt.service.prepareVenueTurnMessages(receipt.scene, "I wait.", "chat", "", null);
  assert.equal(prepared.gmContext.possibleMemoryEffects!.physical.id, "venue-chat:same-scene:private-physical-receipt");
  assert(
    !prepared.fitted.messages.some((row) => row.content.includes("private-physical-receipt")),
    "Pending receipts stay in server authority, outside the writing prompt",
  );
}
const direct = fixture("A");
assert.deepEqual(direct.calls, [], "constructing the service starts no work");
const prompt = await direct.service.prepareVenueTurnMessages(direct.scene, "I wait.", "chat", "", null);
assert.equal(prompt.model.model, "A");
assert.equal(prompt.village, direct.world);
assert.equal(prompt.maxTokens, 2000);
assert.ok(!prompt.fitted.messages[0].content.includes("A lore"));
assert.ok(
  prompt.fitted.messages.slice(1, -1).some((entry) => entry.role === "user" && entry.content.includes("A lore")),
);
assert.equal(direct.calls.includes("completion"), false, "prompt fitting requests no completion");
assert.equal(direct.calls.includes("interpretation"), false);
{
  const protectedWorld = fixture("protected-policy");
  const before = await protectedWorld.service.prepareVenueTurnMessages(
    protectedWorld.scene,
    "Greenhouse promises?",
    "chat",
    "",
    null,
  );
  let collection = emptyMemories();
  for (let i = 0; i < 40; i++)
    collection = addMemory(collection, {
      text: `Greenhouse promise ${i}: ` + "Specific remembered detail. ".repeat(6),
      audience: ["player"],
    });
  for (const record of [...collection.records])
    collection = applyMemoryRepair(
      collection,
      memoryRepair(collection, "forget", ["player"], undefined, record.id),
      memoryTime(200),
    ).collection;
  protectedWorld.world.memories = collection;
  const after = await protectedWorld.service.prepareVenueTurnMessages(
    protectedWorld.scene,
    "Greenhouse promises?",
    "chat",
    "",
    null,
  );
  assert.equal(after.gmContext._memoryWrite.protection.complete, false);
  assert.equal(
    before.fitted.messages[0]!.content,
    after.fitted.messages[0]!.content,
    "Incomplete protection envelopes cannot rewrite the standing policy",
  );
  assert.equal(protectedWorld.calls.includes("completion"), false);
}
{
  const remote = fixture("remote-card");
  remote.world.villagers = ["local", "remote"].map((characterId) => {
    const row = structuredClone(wishWorld().villagers[0]!);
    row.characterId = characterId;
    row.cardSnapshot.id = characterId;
    row.cardSnapshot.name = characterId;
    row.cardSnapshot.description = characterId + " DISTINCTIVE COMPLETE CARD";
    row.cardSnapshot.postHistoryInstructions = characterId + " AUTHORED POST HISTORY";
    return row;
  });
  remote.world.venues = [
    venueFixture({
      id: "same-place",
      zones: [
        { ...defaultVenueSpace("other"), id: "exterior", kind: "exterior", connectedTo: ["hall"] },
        { ...defaultVenueSpace("other"), id: "hall", kind: "public", connectedTo: ["exterior"] },
      ],
    }),
  ];
  remote.scene.activeIds = ["local"];
  remote.scene.participants = remote.world.villagers.map((row) => ({
    characterId: row.characterId,
    name: row.characterId,
    doing: "Waiting",
  }));
  remote.scene.operation = { input: { sceneHearingVersion: 2 } } as any;
  remote.scene.sceneAttendance = {
    capturedAt: stamp,
    occupants: remote.scene.participants.map((row) => ({
      ...row,
      zoneId: row.characterId === "local" ? "exterior" : "hall",
    })),
  };
  const selected = zoneEventScene(remote.scene, remote.world.venues[0]!, { targetId: "remote", contact: true });
  const prepared = await remote.service.prepareVenueTurnMessages(selected, "Remote, hello!", "chat", "remote", null);
  assert.ok(prepared.fitted.messages[0]!.content.includes("local DISTINCTIVE COMPLETE CARD"));
  assert.ok(!prepared.fitted.messages[0]!.content.includes("remote DISTINCTIVE COMPLETE CARD"));
  assert.ok(
    prepared.fitted.messages.slice(1).some((row) => row.content.includes("remote DISTINCTIVE COMPLETE CARD")),
    "Selected remote people retain full authored identity after cached history",
  );
  assert.ok(prepared.fitted.messages.slice(1).some((row) => row.content.includes("remote AUTHORED POST HISTORY")));
}
const complete = fixture("A");
{
  const arrival = fixture("fifth-arrival");
  arrival.world.villagers = ["a", "b", "c", "d"].map((characterId) => {
    const row = structuredClone(wishWorld().villagers[0]!);
    row.characterId = characterId;
    row.cardSnapshot.name = characterId;
    return row;
  });
  arrival.world.venues = [venueFixture({ id: "same-place" })];
  arrival.scene.activeIds = ["a", "b", "c", "d"];
  arrival.scene.participants = arrival.scene.activeIds.map((characterId) => ({
    characterId,
    name: characterId,
    doing: "Talking",
  }));
  arrival.scene.sceneAttendance = {
    capturedAt: stamp,
    occupants: arrival.scene.participants.map((row) => ({ ...row, zoneId: "exterior" })),
  };
  arrival.scene.operation = { input: { sceneHearingVersion: 2 } } as any;
  arrival.scene.lines = [
    {
      id: "prior",
      role: "assistant",
      speakerId: "a",
      name: "a",
      kind: "dialogue",
      content: "A public remark.",
      at: stamp,
      heardBy: ["a", "b", "c", "d"],
      zoneId: "exterior",
      delivery: "ordinary",
      presentation: "main",
    },
    {
      id: "private",
      role: "assistant",
      speakerId: "d",
      name: "d",
      kind: "whisper",
      content: "An exact private remark.",
      at: stamp,
      heardBy: ["d"],
      zoneId: "exterior",
      delivery: "whisper",
      targetId: "player",
      presentation: "aside",
    },
  ] as any;
  arrival.scene.submissions = [{ replyLineIds: ["prior", "private"] }] as any;
  const beforeScene = zoneEventScene(arrival.scene, arrival.world.venues[0]!);
  const before = await arrival.service.prepareVenueTurnMessages(beforeScene, "Continue.", "chat", "", null);
  arrival.world.worldPlaces.npcs["npc:fifth"] = {
    id: "npc:fifth",
    name: "Fifth",
    characterization: "A fifth known person.",
    facts: [],
    associations: [],
    availability: "",
  } as any;
  arrival.scene.activeIds.push("npc:fifth");
  arrival.scene.participants.push({ characterId: "npc:fifth", name: "Fifth", doing: "Arriving" });
  arrival.scene.sceneAttendance.occupants.push({
    characterId: "npc:fifth",
    name: "Fifth",
    doing: "Arriving",
    zoneId: "exterior",
  });
  const selected = zoneEventScene(arrival.scene, arrival.world.venues[0]!, {
    targetId: "npc:fifth",
    message: "Fifth, hello.",
  });
  const after = await arrival.service.prepareVenueTurnMessages(selected, "Fifth, hello.", "chat", "npc:fifth", null);
  assert.equal(selected.contactGeneration?.actorIds?.length, 4);
  assert.equal(
    after.fitted.messages[0]!.content,
    before.fitted.messages[0]!.content,
    "Fifth local NPC cannot replace a resident in the cached identity prefix",
  );
  const exchanges = (prepared: typeof before) =>
    prepared.fitted.messages.flatMap((row) =>
      row.content.split("\n").filter((line) => line.startsWith("Scene exchange: ")),
    );
  assert.deepEqual(
    exchanges(after),
    exchanges(before),
    "Passive local witnesses preserve historical cache bytes when writer slots change",
  );
  assert.deepEqual(
    after.fitted.evidence.find((row) => row.id === "private")!.heardBy,
    ["d"],
    "New arrivals never inherit earlier whispers",
  );
  const long = fixture("hundred-turn-context");
  Object.assign(long.world, structuredClone(arrival.world));
  Object.assign(long.scene, structuredClone(beforeScene));
  const originalLines = structuredClone(long.scene.lines);
  long.model.fitContext = (messages, options) => ({
    messages: messages.reduce((size, row) => size + row.content.length, 0) > 36000 ? [] : messages,
    maxTokens: options?.maxTokens,
    estimatedTokensBefore: 10,
    estimatedTokensAfter: 10,
    trimmed: false,
  });
  let previousFacts = "";
  let lastPrepared = before;
  for (let turn = 0; turn < 100; turn++) {
    long.scene.sceneAttendance!.capturedAt = new Date(Date.parse(stamp) + turn * 1000).toISOString();
    if (turn === 50) {
      long.scene.activeIds.push("npc:fifth");
      long.scene.participants.push({ characterId: "npc:fifth", name: "Fifth", doing: "Arriving" });
      long.scene.sceneAttendance!.occupants.push({
        characterId: "npc:fifth",
        name: "Fifth",
        doing: "Arriving",
        zoneId: "exterior",
      });
    }
    if (turn === 75) long.world.venues[0]!.zones[0]!.description = "A lasting blue cupboard stands here.";
    const selected = zoneEventScene(long.scene, long.world.venues[0]!, {
      message: turn >= 50 ? "Fifth, continue." : "Continue.",
      ...(turn >= 50 ? { targetId: "npc:fifth" } : {}),
    });
    const prepared = await long.service.prepareVenueTurnMessages(
      selected,
      turn % 2 ? "Tea?" : "Continue.",
      "chat",
      "",
      null,
    );
    const context = prepared.fitted.messages[1]!.content;
    const facts = context.split("## Witnessed conversation")[0]!;
    if (turn && turn !== 75)
      assert.equal(
        facts,
        previousFacts,
        "Clock, query, fitting and fifth arrival leave unchanged physical facts reusable",
      );
    if (turn === 75) {
      assert.notEqual(facts, previousFacts);
      assert(
        facts.includes("A lasting blue cupboard stands here."),
        "Current persistent changes survive optional history fitting",
      );
    }
    if (turn >= 50) assert(selected.contactGeneration!.actorIds!.length <= 4);
    assert.deepEqual(
      long.scene.lines.slice(0, originalLines.length),
      originalLines,
      "Later attendance never rewrites prior witnesses",
    );
    assert.equal(Object.keys(prepared.fitted.references).length, prepared.fitted.evidence.length);
    previousFacts = facts;
    lastPrepared = prepared;
    const replyLineIds = ["a", "b", "c", "d"].map((speakerId, index) => {
      const id = `long-${turn}-${index}`;
      long.scene.lines.push({
        id,
        speakerId,
        name: speakerId,
        role: "assistant",
        kind: "dialogue",
        delivery: "ordinary",
        presentation: "main",
        content: `Exchange ${turn}, speaker ${index}: ` + "A concrete accepted observation. ".repeat(6),
        at: long.scene.sceneAttendance!.capturedAt,
        heardBy: long.scene.sceneAttendance!.occupants.map((person) => person.characterId),
        zoneId: "exterior",
      });
      return id;
    });
    long.scene.submissions.push({ id: `long-${turn}`, replyLineIds, message: "Continue.", mode: "chat" } as any);
  }
  assert(
    lastPrepared.fitted.evidence.length < long.scene.lines.length - 4,
    "A long Scene actually exercises history trimming",
  );
  assert(
    lastPrepared.fitted.evidence.some((line) => line.id === "long-98-3"),
    "Latest speech stays available",
  );
  assert(!long.calls.includes("completion"), "The hundred-turn packaging check makes no provider requests");
}
const reply = await complete.run();
assert.equal(reply.lines[0]?.content, "A room remains quiet.");
assert.equal(reply.roomInterpretation, null);
assert.equal(complete.calls.filter((x) => x === "completion").length, 1);
assert.equal(complete.calls.filter((x) => x === "interpretation").length, 1);
{
  const replay = fixture("replay", true);
  replay.world.villagers = [wishWorld().villagers[0]];
  const initial = fixtureWish({ wish: "Original captured desire" }, "same-wish", stamp);
  replay.world.villagers[0].wishes = [initial];
  replay.scene.participants = [{ characterId: "a", name: "Ada", doing: "Waiting" }];
  replay.scene.activeIds = ["a"];
  replay.scene.continuity = captureSceneContinuity(replay.world, replay.scene, Date.parse(stamp));
  replay.fail("interpretation");
  await assert.rejects(replay.run(), (error) => error === replay.exact);
  assert.equal(replay.calls.filter((stage) => stage === "completion").length, 1);
  const updated = { ...initial, revision: 2, wish: "Later committed desire" };
  replay.world.villagers[0].wishes = [updated];
  replay.scene.submissions.push({
    mode: "chat",
    id: "earlier",
    at: stamp,
    processing: createExchangeProcessing({
      seed: replay.scene.villageSeed!,
      sceneId: replay.scene.id,
      submissionId: "earlier",
      order: 1,
      lineIds: [],
      actionReceiptIds: [],
    }),
  } as never);
  replay.world.exchangeReceipts.late = {
    id: "late",
    sceneId: replay.scene.id,
    submissionId: "earlier",
    status: "applied",
    sceneFacts: { wish: { actorId: "a", wishId: initial.id, value: updated } },
  } as never;
  replay.fail("");
  const recovered = await replay.service.prepareVenueTurnMessages(replay.scene, "I wait.", "chat", "", null);
  assert.deepEqual(recovered.fitted.messages, replay.requests[0], "Recovery keeps the exact purchased prompt");
  const reply = await replay.run();
  assert.equal(
    reply.wishContexts[0].wishes[0].wish,
    initial.wish,
    "Saved writing and its recovery baseline remain one purchased request despite delayed earlier Scene effects",
  );
  assert.equal(reply.wishContexts[0].wishes[0].revision, 1);
  assert.equal(replay.calls.filter((stage) => stage === "completion").length, 1, "Retry reuses the purchased response");
}
{
  const replay = fixture("legacy-unbounded-default", true);
  replay.model.maxOutputTokens = null;
  replay.world.villagers = [wishWorld().villagers[0]];
  replay.scene.participants = [{ characterId: "a", name: "Ada", doing: "Waiting" }];
  replay.scene.activeIds = ["a"];
  replay.fail("interpretation");
  await assert.rejects(replay.run(), (error) => error === replay.exact);
  for (const [key, value] of replay.checkpoints)
    if (key.startsWith("writing-request:")) delete (value as any).historyContract;
  replay.scene.lines = Array.from({ length: 20 }, (_, index) => ({
    id: `oversized-${index}`,
    speakerId: "a",
    name: "Ada",
    role: "assistant",
    kind: "dialogue",
    content: "A complete prior exchange. ".repeat(40),
    heardBy: ["a"],
    at: stamp,
  }));
  replay.scene.submissions = [0, 1].map((turn) => ({
    id: `old-${turn}`,
    message: "Private source",
    replyLineIds: replay.scene.lines.slice(turn * 10, turn * 10 + 10).map((line) => line.id),
  })) as any;
  const fits = replay.calls.filter((stage) => stage === "fit").length;
  const captured = await replay.service.prepareVenueTurnMessages(replay.scene, "I wait.", "chat", "", null);
  assert.deepEqual(
    captured.fitted.messages,
    replay.requests[0],
    "Legacy paid prompts replay even when complete newer history exceeds the unknown-cap allowance",
  );
  assert.equal(captured.historyContract, undefined);
  assert.equal(
    replay.calls.filter((stage) => stage === "fit").length,
    fits,
    "Recovery never refits a purchased request",
  );
  assert.equal(replay.calls.filter((stage) => stage === "completion").length, 1);
  replay.checkpoints.clear();
  await assert.rejects(
    () => replay.service.prepareVenueTurnMessages(replay.scene, "I wait.", "chat", "", null),
    /safe history allowance/,
    "A fresh request with the same unverified cap must fail before spending",
  );
}
for (const source of ["decisions", "system"] as const) {
  const invitation = fixture(source);
  invitation.world.venues = [
    venueFixture({
      id: "same-place",
      name: "Ada's home",
      classes: ["residence"],
      occupancy: { playerHome: false },
      residentIds: ["ada"],
      description: "A small home",
      presentation: { image: null, x: null, y: null },
      state: defaultVenueSpace("residence").state,
      zones: [
        { ...defaultVenueSpace("residence"), id: "exterior", name: "Exterior", kind: "exterior" },
        {
          ...defaultVenueSpace("residence"),
          id: "private:ada",
          name: "Ada's room",
          kind: "private-residence",
          ownerId: "ada",
        },
      ],
    }),
  ] as any;
  invitation.interpretation({
    checks: [
      {
        id: "invite",
        domain: "room",
        question: "Did Ada invite Pat?",
        outcomes: [],
        facts: { venueId: "same-place", zoneId: "private:ada", actorId: "ada" },
        evidence: [{ id: "spoken", speakerId: "ada", content: "Come into my room.", current: true }],
      },
    ],
    results: [{ outcome: "invite-now", source, evidenceIds: ["spoken"], reason: "" }],
    traces: [],
  });
  await assert.rejects(
    invitation.run(),
    /lacks current witnessed evidence/,
    "Neither a Decision nor System can grant an invitation from an absent source line",
  );
}
for (const stage of ["world", "connection", "lore", "model", "completion", "refresh", "interpretation"]) {
  const failed = fixture("failed");
  failed.fail(stage);
  await assert.rejects(failed.run(), (error) => error === failed.exact);
  assert.ok(
    failed.calls.filter((x) => x === "completion").length <= 1,
    "connection errors do not repeat model spending",
  );
}
const invalid = fixture("invalid");
invalid.invalidReply();
await assert.rejects(invalid.run(), (error: any) => {
  assert.equal(error.statusCode, 502);
  assert.match(error.message, /invalid input classification/);
  return true;
});
const invalidLine = fixture("invalid-line");
invalidLine.invalidReply("INPUT action\n[robot] A quiet room.");
await assert.rejects(invalidLine.run(), (error: any) => {
  assert.match(error.failure.detail, /speakerId/);
  return true;
});
assert.equal(
  invalid.calls.filter((x) => x === "completion").length,
  1,
  "parser rejection never automatically repairs with another request",
);
assert.equal(invalid.calls.includes("interpretation"), false);
const aborted = fixture("aborted");
const controller = new AbortController();
controller.abort(aborted.exact);
await assert.rejects(
  aborted.service.prepareVenueTurnMessages(aborted.scene, "I wait.", "chat", "", null, controller.signal),
  (error) => error === aborted.exact,
);
assert.equal(aborted.calls.includes("model"), false);
assert.equal(aborted.calls.includes("completion"), false);

for (const stage of ["world", "connection", "lore", "model", "completion", "refresh", "interpretation"]) {
  const a = fixture("A"),
    b = fixture("B");
  a.pause(stage);

  const releaseA = a.owner.run(() => a.owner.run(() => configureSceneWriting(a.service)));
  const pending = a.owner.run(() => generate(a.scene, "I wait.", "chat", "", null));
  await a.entered.promise;

  const releaseB = b.owner.run(() => b.owner.run(() => configureSceneWriting(b.service)));
  b.owner.run(() => releaseA());

  const current = await b.owner.run(() => generate(b.scene, "I wait.", "chat", "", null));
  assert.equal(current.lines[0]?.content, "B room remains quiet.");
  a.gate.resolve();
  const old = await pending;
  assert.equal(old.lines[0]?.content, "A room remains quiet.");
  assert.ok(
    a.owners.every((owner) => owner === a.owner),
    stage + " retains A scope",
  );
  assert.ok(
    b.owners.every((owner) => owner === b.owner),
    stage + " retains B scope",
  );
  assert.equal(a.calls.filter((x) => x === "completion").length, 1);
  assert.equal(b.calls.filter((x) => x === "completion").length, 1);
  await b.owner.run(async () =>
    assert.equal(
      (await prepareVenueTurnMessages(b.scene, "I wait.", "chat", "", null)).model.model,
      "B",
      "old cleanup cannot remove the new binding",
    ),
  );
  b.owner.run(() => releaseB());

  a.owner.dispose();
  b.owner.dispose();
}
const disposed = fixture("disposed"),
  replacement = fixture("replacement");
disposed.pause("world");
disposed.guardDisposal();
const releaseDisposed = disposed.owner.run(() => disposed.owner.run(() => configureSceneWriting(disposed.service)));
const pending = disposed.owner.run(() => generate(disposed.scene, "I wait.", "chat", "", null));
await disposed.entered.promise;
disposed.owner.dispose();
const releaseReplacement = replacement.owner.run(() =>
  replacement.owner.run(() => configureSceneWriting(replacement.service)),
);
disposed.gate.resolve();
await assert.rejects(pending, (error) => error === disposed.exact);
assert.equal(disposed.calls.includes("completion"), false);
assert.deepEqual(replacement.calls, [], "disposed originating guard never borrows the replacement");
replacement.owner.run(() => releaseDisposed());

replacement.owner.run(() => releaseReplacement());

replacement.owner.dispose();
await assert.rejects(generate(replacement.scene, "I wait.", "chat", "", null), /not configured/);
console.log(
  "Scene writing ownership passed: inert fitting, exact errors, bounded mocked spending, paused connections, actual scopes and guarded disposal; no Engine or paid providers.",
);
