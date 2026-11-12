// Test cases: narration-writing/single-request, narration-writing/saved-replay, narration-writing/required-overflow, narration-writing/fitted-evidence, narration-writing/scoped-cold-provenance, narration-writing/advanced-clock-expiry, narration-writing/pending-request-model, narration-writing/arrival-routing, narration-writing/explicit-player-delivery, narration-writing/optional-facets, narration-writing/long-followup, narration-writing/history-prefix, narration-writing/required-evidence-bound, narration-writing/circumstance-provenance, narration-writing/learned-wish-initiative, narration-writing/subject-scope, narration-writing/activation-owner
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import {
  activationScope,
  createActivationScope,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  episodeSourceGraph,
  readAcceptedEpisode,
} from "../packages/villages/src/server/domain/decoding/episode-codec.js";
import type { AcceptedEpisode } from "../packages/villages/src/server/domain/models/episode-model.js";
import { establishPlace } from "../packages/villages/src/server/domain/rules/place-discovery.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import {
  applyContinuityWrite,
  continuityHolderKey,
  continuityVersionUnit,
  protectContinuity,
} from "../packages/villages/src/server/domain/rules/continuity.js";
import { bindNarrationSource } from "../packages/villages/src/server/domain/rules/narration-sources.js";
import { routeZoneEvents, zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import { fitVenueWritingMessages } from "../packages/villages/src/server/domain/rules/venue-writing.js";
import type { VenueReplyLine } from "../packages/villages/src/server/domain/models/scene-model.js";
import {
  fittedNarrationReadset,
  narrationContinuityContext,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import { actorEpisodeView, appendEpisode } from "../packages/villages/src/server/domain/rules/episodes.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { retainNativeFact } from "../packages/villages/src/server/domain/rules/native-continuity.js";
import {
  seedFoundingCircumstances,
  readFoundingCircumstances,
} from "../packages/villages/src/server/domain/rules/founding-circumstances.js";
import { acceptNarration } from "../packages/villages/src/server/domain/rules/narration-native.js";
import {
  createSceneWriting,
  type SceneWritingPorts,
} from "../packages/villages/src/server/features/scenes/writing-service.js";
import { configureSceneWriting, generate } from "../packages/villages/src/server/features/scenes/writing.js";
import {
  encodeContinuityPages,
  decodeContinuityPagesSync,
} from "../packages/villages/src/server/adapters/storage/continuity-pages.js";

const at = "2026-11-09T12:00:00.000Z";
function fixture(beforeRead?: () => void | Promise<void>) {
  const state = { ...defaultVillageState(), seed: "world", setupAt: at, foundedAt: at };
  const place = establishPlace(
    state,
    {
      name: "Lantern",
      description: "A restaurant.",
      controllers: ["mara"],
      people: [
        {
          ref: "mara",
          name: "Mara",
          characterization: "AUTHORED IDENTITY: a reserved host who speaks plainly.",
          role: "Proprietor",
        },
      ],
      zones: [{ id: "parlor", name: "Parlor", kind: "public", description: "Wooden tables." }],
    },
    "lantern",
    "map",
    "request:place",
    at,
    true,
  );
  const id = Object.keys(state.worldPlaces.npcs)[0];
  const scene = coerceSession({
    version: 5,
    id: "scene",
    placeId: place.id,
    placeName: "Lantern",
    zoneId: "parlor",
    villageSeed: state.seed,
    sceneRevision: 1,
    startedAt: at,
    lastActivityAt: at,
    status: "active",
    activeIds: [id],
    participants: [{ characterId: id, name: "Mara", doing: "Talking" }],
    sceneAttendance: {
      capturedAt: at,
      layout: captureSceneLayout(place.location),
      occupants: [{ characterId: id, name: "Mara", doing: "Talking", zoneId: "parlor" }],
    },
  });
  const checkpoints = new Map<string, unknown>(),
    calls = { purchases: 0, resolutions: 0, reads: 0 };
  let operationId = "operation";
  let messages: any[] = [],
    unavailable = false,
    overflow = false,
    hiddenRequest = false,
    configuredConnection = "narration",
    usedModel = "";
  const model = {
    model: "fixture",
    connectionId: "narration",
    maxOutputTokens: 4096,
    fitContext(input: any[], options: any) {
      return { messages: overflow ? input.slice(1) : input, maxTokens: options.maxTokens, trimmed: overflow };
    },
  };
  const writing = createSceneWriting({
    venueOperationId: () => operationId,
    venueCheckpoint: async (stage: string, work: () => Promise<unknown>) => {
      if (!checkpoints.has(stage)) checkpoints.set(stage, structuredClone(await work()));
      return structuredClone(checkpoints.get(stage));
    },
    venueSavedCheckpoint: (stage: string) =>
      hiddenRequest && stage.startsWith("writing-request:") ? undefined : structuredClone(checkpoints.get(stage)),
    readVillageState: async () => {
      calls.reads++;
      assert(!unavailable);
      await beforeRead?.();
      return state;
    },
    villagesConnectionIdFor: async () => configuredConnection,
    villagesLanguageModels: () => ({
      resolveForRequest: async ({ connectionId }: { connectionId: string }) => {
        calls.resolutions++;
        assert(!unavailable);
        return { ...model, connectionId, model: connectionId === "changed" ? "different-model" : model.model };
      },
    }),
    readEffectiveVillagerCard: () => {
      throw new Error("Only NPC identity expected");
    },
    readVillageLore: async () => {
      assert(!unavailable);
      return [];
    },
    completeWithRoom: async (selected: { model: string }, input: any[]) => {
      calls.purchases++;
      usedModel = selected.model;
      messages = structuredClone(input);
      return {
        content: JSON.stringify({
          segments: [{ kind: "dialogue", speakerId: scene.activeIds[0] ?? id, text: "Because it matters to me." }],
        }),
        finishReason: "stop",
      };
    },
    rejectVenueCompletion: async () => {
      throw new Error("Unexpected rejection");
    },
    measurePipeline: async (_name: unknown, _context: unknown, work: () => Promise<unknown>) => work(),
    runtimeDebug: () => {},
  } as unknown as SceneWritingPorts);
  return {
    state,
    scene,
    venue: place.location,
    id,
    checkpoints,
    calls,
    writing,
    messages: () => messages,
    disable: () => {
      unavailable = true;
    },
    overflow: () => {
      overflow = true;
    },
    hideRequestAndChangeConnection: () => {
      hiddenRequest = true;
      configuredConnection = "changed";
    },
    usedModel: () => usedModel,
    nextOperation: (id: string) => {
      operationId = id;
      checkpoints.clear();
    },
  };
}

await runCase("narration-writing/activation-owner", async () => {
  const a = createActivationScope(),
    b = createActivationScope(),
    entered = Promise.withResolvers<void>(),
    proceed = Promise.withResolvers<void>();
  const first = fixture(async () => {
      assert.equal(activationScope(), a);
      entered.resolve();
      await proceed.promise;
      assert.equal(activationScope(), a);
    }),
    second = fixture(() => assert.equal(activationScope(), b));
  second.hideRequestAndChangeConnection();
  const releaseA = a.run(() => configureSceneWriting(first.writing));
  const pending = a.run(() => generate(first.scene, "First room", "chat"));
  await entered.promise;
  const releaseB = b.run(() => configureSceneWriting(second.writing));
  b.run(releaseA);
  const reason = new Error("Cancelled before narration");
  await assert.rejects(
    b.run(() => generate(second.scene, "Cancelled", "chat", AbortSignal.abort(reason))),
    (error) => error === reason,
  );
  assert.deepEqual(second.calls, { purchases: 0, resolutions: 0, reads: 0 });
  const current = await b.run(() => generate(second.scene, "Second room", "chat"));
  proceed.resolve();
  const original = await pending;
  assert.equal(original.readset.source.input, "First room");
  assert.equal(current.readset.source.input, "Second room");
  assert.equal(first.usedModel(), "fixture");
  assert.equal(second.usedModel(), "different-model");
  assert.equal(first.calls.purchases, 1);
  assert.equal(second.calls.purchases, 1);
  a.dispose();
  await assert.rejects(
    a.run(() => generate(first.scene, "Disposed", "chat")),
    /not configured/,
  );
  releaseB();
  b.dispose();
});

await runCase("narration-writing/subject-scope", async () => {
  const f = fixture();
  f.state.villagers = [
    {
      characterId: "offstage",
      incarnation: "original",
      cardSnapshot: { name: "Offstage", description: "PRIVATE_SUBJECT_PROFILE" },
    },
  ] as never;
  const generated = await f.writing.generate(f.scene, "Tell me about Offstage.", "chat");
  assert(generated.readset.source.subjects!.some((row) => row.id === "offstage" && row.incarnation === "original"));
  assert(!generated.readset.source.actors.some((row) => row.id === "offstage"));
  assert(!JSON.stringify(f.messages()).includes("PRIVATE_SUBJECT_PROFILE"));
  assert(
    f.messages().every(({ content }) => !/Optional staging:|"presentation":\{"state":/u.test(content)),
    "A Scene with no sprites omits the catalog and staging instructions",
  );
  f.state.villagers[0].incarnation = "replacement";
  f.disable();
  const replay = await f.writing.generate(f.scene, "Tell me about Offstage.", "chat");
  assert.deepEqual(replay.readset.source.subjects, generated.readset.source.subjects);
  assert.equal(f.calls.purchases, 1);
  const overflow = fixture();
  overflow.state.villagers = Array.from({ length: 257 }, (_, index) => ({
    characterId: "subject-" + index,
    incarnation: "one",
    cardSnapshot: { name: "Subject " + index },
  })) as never;
  await assert.rejects(overflow.writing.generate(overflow.scene, "Hello.", "chat"), /subject identity scope exceeds/);
  assert.equal(overflow.calls.purchases, 0, "required identity scope must fail before purchase");
});

await runCase("narration-writing/learned-wish-initiative", () => {
  const f = fixture(),
    text = "The Player hopes to go sailing when ready.";
  retainNativeFact(
    f.state,
    { id: "player-wish", kind: "initialization", targetId: "player", revision: 1, text, witnesses: ["player", f.id] },
    at,
    { class: "desire", owner: continuityActor(f.state, "player")!, current: true, about: ["player"] },
  );
  const root = f.state.continuity.records.at(-1)!.id;
  const context = narrationContinuityContext(f.state, f.scene, f.venue, "new-turn", "Ask about sailing", at),
    fitted = fittedNarrationReadset(
      f.state,
      context,
      context.parts.map((part) => part.block.evidenceId!),
    );
  assert(
    Object.values(fitted.source.historical).some((source) => source.actorId === f.id && source.excerpt === text),
    "Mara may recall the Player's disclosed wish",
  );
  assert(
    !fitted.offered.some((offer) => offer.holder.id === f.id && offer.ids.includes(root)),
    "the final fitted request cannot count learned wishes as the hearer's own initiative",
  );
});
await runCase("narration-writing/single-request", async () => {
  const f = fixture(),
    input = "I privately fear she will leave. I ask, “Why?”\n  Keep my spacing. 🪑";
  const reply = await f.writing.generate(f.scene, input, "chat");
  assert.equal(f.calls.purchases, 1);
  assert.equal(f.messages().at(-1).content, input);
  assert.equal(reply.readset.source.input, input);
  assert.deepEqual(reply.readset.source.historical, {});
  assert(
    f
      .messages()
      .filter((row) => row.cacheBreakpoint)
      .some((row) => row.content.includes("AUTHORED IDENTITY")),
  );
  assert(!f.messages().some((row) => row.content.includes("input:[")));
  assert(!Object.hasOwn(reply.raw, "input"), "ordinary dialogue has no classification inventory");
  assert.equal(reply.readset.source.scene.lines.length, 0);
  assert.equal(reply.readset.source.scene.submissions.length, 0);
});

await runCase("narration-writing/circumstance-provenance", async () => {
  const f = fixture(),
    text = "The annual lantern procession has been delayed by a washed-out bridge.";
  seedFoundingCircumstances(
    f.state,
    readFoundingCircumstances([{ scope: "village", summary: text }], [], at),
    ["player", f.id],
    at,
  );
  const first = await f.writing.generate(f.scene, "Why?", "chat");
  assert.equal(
    f
      .messages()
      .map((row) => row.content)
      .join("\n")
      .split(text).length - 1,
    1,
    "the required native meaning is fitted once for its known audience",
  );
  const result = acceptNarration(
    f.state,
    { raw: first.raw, readset: first.readset, responseDigest: first.responseDigest },
    "turn",
    first.readset.capturedAt,
  );
  assert.equal(result.held, false);
  const accepted = f.state.episodes.records.find((episode) => episode.id === first.readset.source.episodeId)!;
  assert.equal(accepted.continuityVersionIds.length, 0, "this reply has no keeps");
  const native = f.state.continuity.records[0];
  const owner = continuityActor(f.state, f.id)!,
    player = continuityActor(f.state, "player")!;
  const key = continuityHolderKey(owner),
    playerKey = continuityHolderKey(player);
  const target = () => ({
    id: native.id,
    recordRevision: f.state.continuity.records[0].revision,
    heads: { [key]: f.state.continuity.records[0].heads[key].revision },
  });
  f.state.continuity = protectContinuity(f.state.continuity, target(), [owner], "forget-native", at, { forget: true });
  assert.equal(
    actorEpisodeView(accepted, f.state.continuity, owner, f.state.episodes)!.segments.length,
    0,
    "Forget blocks no-keep prose derived from the actual fitted native meaning",
  );
  assert.equal(
    actorEpisodeView(accepted, f.state.continuity, player, f.state.episodes)!.segments.length,
    1,
    "another holder keeps their own derived history",
  );
  f.nextOperation("after-forget");
  await f.writing.generate(f.scene, "And now?", "chat");
  const active = f
    .messages()
    .flatMap((row) => String(row.content).split("\n\n"))
    .filter((text) => text.startsWith('{"currentCircumstance":'))
    .map((text) => JSON.parse(text).currentCircumstance);
  assert(
    active.length > 0 && active.every((row) => row.knownFor.every((entry) => entry.actorId !== f.id)),
    "protected native meaning is not supplied as that actor's current context",
  );
  const current = f.state.continuity.records[0];
  f.state.continuity = protectContinuity(
    f.state.continuity,
    { id: current.id, recordRevision: current.revision, heads: { [playerKey]: current.heads[playerKey].revision } },
    [player],
    "forget-player-native",
    at,
    { forget: true },
  );
  f.nextOperation("after-all-forget");
  await f.writing.generate(f.scene, "What next?", "chat");
  const prompt = f
    .messages()
    .map((row) => row.content)
    .join("\n");
  assert(
    !prompt.includes('"currentCircumstance"') && !prompt.includes('"privateWorldCircumstance"'),
    "a duplicate raw native summary cannot bypass every holder's protection",
  );
  const corrected = fixture();
  seedFoundingCircumstances(
    corrected.state,
    readFoundingCircumstances([{ scope: "village", summary: text }], [], at),
    [corrected.id],
    at,
  );
  const holder = continuityActor(corrected.state, corrected.id)!,
    holderKey = continuityHolderKey(holder),
    record = corrected.state.continuity.records[0];
  const replacement = "Mara remembers a damaged footpath, with the main bridge still open.";
  corrected.state.continuity = protectContinuity(
    corrected.state.continuity,
    { id: record.id, recordRevision: record.revision, heads: { [holderKey]: record.heads[holderKey].revision } },
    [holder],
    "correct-native",
    at,
    { text: replacement },
  );
  await corrected.writing.generate(corrected.scene, "Why?", "chat");
  const correctedBlocks = corrected
    .messages()
    .flatMap((row) => String(row.content).split("\n\n"))
    .filter((text) => text.startsWith('{"currentCircumstance":'))
    .map((text) => JSON.parse(text).currentCircumstance);
  assert.equal(correctedBlocks.length, 1);
  assert.equal(
    correctedBlocks[0].text,
    replacement,
    "the current native context uses that holder's protected corrected meaning",
  );
  const passive = fixture(),
    leo = "npc:lantern:leo";
  passive.state.worldPlaces.npcs[leo] = {
    ...structuredClone(passive.state.worldPlaces.npcs[passive.id]),
    id: leo,
    name: "Leo",
    label: "Leo",
    source: "fixture:leo",
  };
  passive.scene.participants.push({ characterId: leo, name: "Leo", doing: "Talking" });
  passive.scene.sceneAttendance!.occupants.push({ characterId: leo, name: "Leo", doing: "Talking", zoneId: "parlor" });
  passive.scene.activeIds = [leo];
  seedFoundingCircumstances(
    passive.state,
    readFoundingCircumstances([{ scope: "village", summary: text }], [], at),
    [passive.id],
    at,
  );
  const beforeForget = await passive.writing.generate(passive.scene, "Why?", "chat");
  const quietHolder = continuityActor(passive.state, passive.id)!,
    quietKey = continuityHolderKey(quietHolder);
  assert(beforeForget.readset.source.actors.some((row) => row.id === passive.id));
  assert(
    beforeForget.readset.admission.provenance?.[quietKey]?.length,
    "private native context retains passive admitted witness provenance",
  );
  const quietRecord = passive.state.continuity.records[0];
  passive.state.continuity = protectContinuity(
    passive.state.continuity,
    {
      id: quietRecord.id,
      recordRevision: quietRecord.revision,
      heads: { [quietKey]: quietRecord.heads[quietKey].revision },
    },
    [quietHolder],
    "forget-passive-native",
    at,
    { forget: true },
  );
  passive.nextOperation("passive-forget");
  await passive.writing.generate(passive.scene, "And now?", "chat");
  assert(
    !passive.messages().some((row) => String(row.content).includes('"privateWorldCircumstance"')),
    "a passive admitted holder's Forget prevents raw native fallback",
  );
});
await runCase("narration-writing/saved-replay", async () => {
  const f = fixture(),
    first = await f.writing.generate(f.scene, "Why?", "chat");
  const before = { ...f.calls };
  f.disable();
  const replay = await f.writing.generate(f.scene, "Why?", "chat");
  assert.deepEqual(replay, first);
  assert.deepEqual(f.calls, before, "retained response replay requires no model resolution, world read or purchase");
});

await runCase("narration-writing/required-overflow", async () => {
  const f = fixture();
  f.overflow();
  await assert.rejects(() => f.writing.generate(f.scene, "Why?", "chat"), /required context do not fit/);
  assert.equal(f.calls.purchases, 0);
  assert.equal(f.checkpoints.size, 0);
});

await runCase("narration-writing/fitted-evidence", () => {
  const f = fixture();
  for (let i = 0; i < 3; i++)
    retainNativeFact(
      f.state,
      {
        id: "receipt-" + i,
        kind: "initialization",
        targetId: f.id,
        revision: i + 1,
        text: "Mara explained detail " + i,
        witnesses: [f.id, "player"],
      },
      at,
    );
  const context = narrationContinuityContext(f.state, f.scene, f.venue, "next", "detail", at);
  const required = context.parts.filter((part) => !part.block.optional);
  const fitted = fittedNarrationReadset(
    f.state,
    context,
    required.map((part) => part.block.evidenceId!),
  );
  const all = fittedNarrationReadset(
    f.state,
    context,
    context.parts.map((part) => part.block.evidenceId!),
  );
  assert(Object.keys(all.source.historical).length > Object.keys(fitted.source.historical).length);
  assert(all.admission.supplied.length > fitted.admission.supplied.length);
  assert.equal(Object.keys(fitted.admission.sourceActors ?? {}).length, 0);
  assert.deepEqual(fitted.offered, [], "unsupplied history is never counted as an initiative offer");
  for (const source of Object.values(fitted.source.historical)) assert.equal(source.kind, "knowledge");
});

await runCase("narration-writing/scoped-cold-provenance", () => {
  const f = fixture(),
    mara = continuityActor(f.state, f.id)!,
    player = continuityActor(f.state, "player")!;
  retainNativeFact(
    f.state,
    {
      id: "original",
      kind: "initialization",
      targetId: f.id,
      revision: 1,
      text: "Mara described a private family story.",
      witnesses: [f.id, "player"],
    },
    at,
  );
  const roots = f.state.continuity.records,
    versions = f.state.continuity.versions;
  const version = (key: string) => roots.flatMap((root) => (root.heads[key] ? [root.heads[key].versionId] : []))[0];
  const answer: AcceptedEpisode = {
    format: 1,
    id: "answer",
    seed: f.state.seed,
    sceneId: f.scene.id,
    submissionId: "question",
    operationId: "answer-operation",
    capturedAt: at,
    acceptedAt: at,
    responseDigest: memoryHash("answer"),
    admittedContinuityRevision: f.state.continuity.revision,
    privateInput: "Why?",
    actors: [mara, player].map((actor) => ({ id: actor.id, incarnation: actor.incarnation, zoneId: "parlor" })),
    segments: [
      {
        id: "reply",
        role: "assistant",
        speakerId: f.id,
        name: "Mara",
        kind: "dialogue",
        content: "That story still matters.",
        heardBy: [f.id, "player"],
        at,
        zoneId: "parlor",
      },
    ],
    grounding: [],
    continuityVersionIds: [],
    offered: [],
    commandReceipts: [],
    dependencies: {},
    holderDependencies: {
      [continuityHolderKey(mara)]: { reply: [continuityVersionUnit(version(continuityHolderKey(mara)))] },
      [continuityHolderKey(player)]: { reply: [continuityVersionUnit(version(continuityHolderKey(player)))] },
    },
  };
  f.state.episodes = appendEpisode(f.state.episodes, answer, f.state.seed);
  const root = roots.find((row) => row.heads[continuityHolderKey(mara)])!,
    key = continuityHolderKey(mara);
  f.state.continuity = protectContinuity(
    f.state.continuity,
    { id: root.id, recordRevision: root.revision, heads: { [key]: root.heads[key].revision } },
    [mara],
    "forget",
    at,
    { forget: true },
  );
  const packet = encodeContinuityPages(
    {
      continuity: f.state.continuity,
      episodes: f.state.episodes,
      worldPlaces: f.state.worldPlaces,
      mailbox: f.state.mailbox,
    },
    "a".repeat(32),
  );
  const cold = decodeContinuityPagesSync(
    packet.manifest,
    "a".repeat(32),
    f.state.seed,
    (id) => packet.pages.get(id) ?? null,
  ).value;
  const saved = cold.episodes.records.at(-1)!;
  assert.deepEqual(actorEpisodeView(saved, cold.continuity, mara, cold.episodes)?.segments, []);
  assert.equal(
    actorEpisodeView(saved, cold.continuity, player, cold.episodes)?.segments[0].text,
    "That story still matters.",
  );
  assert.equal(saved.privateInput, "Why?");
  assert.equal(versions.length, 2);
  const unknown = structuredClone(answer);
  unknown.holderDependencies![JSON.stringify(["actor", f.id, "other-incarnation"])] = { reply: [] };
  assert.throws(() => readAcceptedEpisode(unknown, f.state.seed), /invalid private episode context holder/);
  const invalidUnit = structuredClone(answer);
  invalidUnit.holderDependencies![key].invented = [];
  assert.throws(() => readAcceptedEpisode(invalidUnit, f.state.seed), /unknown episode dependency unit/);
  const cyclic = structuredClone(answer);
  cyclic.holderDependencies![key].reply = [JSON.stringify([cyclic.id, "reply", memoryHash(cyclic.segments[0])])];
  assert.throws(() => episodeSourceGraph([f.state.episodes.records[0], cyclic], mara), /cyclic/);
});

await runCase("narration-writing/advanced-clock-expiry", async () => {
  const f = fixture(),
    now = new Date().toISOString(),
    text = "A shallow puddle is drying near the window.";
  const context = narrationContinuityContext(f.state, f.scene, f.venue, "puddle", text, now);
  const line = {
    id: "puddle-outcome",
    speakerId: "__venue_scene__",
    name: "Narration",
    kind: "narration" as const,
    role: "assistant" as const,
    content: text,
    heardBy: ["player"],
    at: now,
    zoneId: "parlor",
  };
  const source = bindNarrationSource(
    { segment: "puddle", perceive: { kind: "seen", by: ["player"] } },
    {
      ...context.source,
      lines: [line],
      labels: { puddle: line.id },
      native: {},
      moves: [],
    },
  );
  f.state.continuity = applyContinuityWrite(
    f.state.continuity,
    {
      id: "puddle",
      holders: [context.room],
      text,
      sourceIds: [source.id],
      room: { expiresInMinutes: 60 },
    },
    {
      seed: f.state.seed,
      episodeId: context.episodeId,
      operationId: "puddle",
      at: now,
      actors: context.actors,
      room: context.room,
      sources: [source],
      supplied: [],
      protectedRoots: [],
    },
  );
  f.state.episodes = appendEpisode(
    f.state.episodes,
    {
      format: 1,
      id: context.episodeId,
      seed: f.state.seed,
      submissionId: "puddle",
      operationId: "puddle",
      sceneId: f.scene.id,
      capturedAt: now,
      acceptedAt: now,
      responseDigest: memoryHash(text),
      admittedContinuityRevision: 0,
      privateInput: text,
      actors: context.actors.map(({ id, incarnation }) => ({ id, incarnation, zoneId: "parlor" })),
      segments: [line],
      grounding: [source],
      continuityVersionIds: f.state.continuity.versions.map((row) => row.id),
      offered: [],
      commandReceipts: [],
      dependencies: {},
      room: context.room,
    },
    f.state.seed,
  );
  assert(
    narrationContinuityContext(f.state, f.scene, f.venue, "before", "window", now).parts.some((part) =>
      part.block.text.includes('"roomEntry"'),
    ),
  );
  f.state.clock = { revision: 1, trustedAt: now, replayUntilDate: "", advanceMs: 2 * 86400000 };
  const reply = await f.writing.generate(f.scene, "Look near the window.", "chat");
  assert(Date.parse(reply.readset.capturedAt) >= Date.now() + 2 * 86400000 - 1000);
  assert(
    !f.messages().some((row) => row.content.includes('"roomEntry"')),
    "expired appearance is omitted using Village time before purchase",
  );
  assert.equal(f.state.continuity.versions[0].text, text, "expiry never discards the retained entry");
});

await runCase("narration-writing/pending-request-model", async () => {
  const f = fixture();
  const captured = await f.writing.prepareVenueTurnMessages(f.scene, "Why?", "chat");
  f.hideRequestAndChangeConnection();
  const reply = await f.writing.generate(f.scene, "Why?", "chat");
  assert.equal(f.calls.purchases, 1);
  assert.equal(f.usedModel(), "fixture", "adoption of a durable pending request re-resolves its original model");
  assert.deepEqual(reply.readset, captured.readset);
  assert.equal(reply.responseDiagnostics.model, "fixture");
});

function routed(f: ReturnType<typeof fixture>, scene: typeof f.scene, rows: any[], moves: any[] = []) {
  const lines: VenueReplyLine[] = rows.map((row) => ({
    kind: row.delivery === "whisper" ? "whisper" : row.kind,
    speakerId: row.speakerId ?? "__venue_scene__",
    content: row.text,
    heardBy: [],
    ...(row.delivery ? { delivery: row.delivery } : {}),
    ...(row.targetId ? { targetId: row.targetId } : {}),
    ...(row.staging ? { staging: row.staging } : {}),
  }));
  routeZoneEvents(rows, scene, lines, moves);
  return lines.map(({ anchorIndex: _anchor, ...line }, index) => ({
    ...line,
    id: "line-" + index,
    name:
      line.kind === "narration"
        ? "Narration"
        : scene.participants.find((row) => row.characterId === line.speakerId)!.name,
    role: "assistant" as const,
    at,
  }));
}

await runCase("narration-writing/arrival-routing", () => {
  const f = fixture(),
    npc = { ...f.state.worldPlaces.npcs[f.id], id: "npc:arrival", name: "Leo", label: "Leo" };
  f.state.worldPlaces.npcs[npc.id] = npc;
  const scene = structuredClone(f.scene);
  scene.pendingNpcAdmissions = [{ npc, segment: 1, zoneId: "parlor", source: "Leo arrives." }];
  scene.activeIds.push(npc.id);
  scene.participants.push({ characterId: npc.id, name: "Leo", doing: "Arriving" });
  scene.sceneAttendance!.occupants.push({ characterId: npc.id, name: "Leo", doing: "Arriving", zoneId: "parlor" });
  const projected = zoneEventScene(scene, f.venue);
  const rows = [
    {
      kind: "dialogue",
      speakerId: f.id,
      text: "The earlier private subject.",
      staging: [
        { characterId: npc.id, expression: "smile" },
        { characterId: f.id, look: { target: "villager", characterId: npc.id } },
      ],
    },
    { kind: "narration", text: "Leo arrives." },
    { kind: "dialogue", speakerId: f.id, text: "This whisper is for you.", delivery: "whisper", targetId: "player" },
    { kind: "dialogue", speakerId: f.id, text: "Good evening, Leo." },
  ];
  const lines = routed(f, projected, rows);
  assert(!lines[0].heardBy.includes(npc.id));
  assert(!lines[0].staging?.some((cue) => cue.characterId === npc.id || cue.look?.characterId === npc.id));
  assert(!lines[2].heardBy.includes(npc.id));
  assert(lines[2].heardBy.includes("player"));
  assert(lines[3].heardBy.includes(npc.id));
  assert.throws(
    () => routed(f, projected, [{ kind: "dialogue", speakerId: npc.id, text: "Too early." }]),
    /unknown sound source/,
  );
  const acoustic: VenueReplyLine[] = [
    { kind: "narration", speakerId: "__venue_scene__", content: "An early voice.", heardBy: [] },
  ];
  assert.throws(
    () =>
      routeZoneEvents(
        [{ kind: "narration", text: "An early voice.", sound: { sourceId: npc.id, text: "An early voice." } }],
        projected,
        acoustic,
        [],
      ),
    /invalid narrated sound/,
  );
  const context = narrationContinuityContext(f.state, projected, f.venue, "arrival", "Hello", at);
  const sourceContext = {
    ...context.source,
    scene: projected,
    lines,
    labels: { before: "line-0", after: "line-3" },
    native: {},
    moves: [],
  };
  assert.throws(
    () => bindNarrationSource({ segment: "before", perceive: { kind: "heard", by: [npc.id] } }, sourceContext),
    /unknown segment recipient|not routed/,
  );
  assert.throws(
    () => bindNarrationSource({ input: "Hello", ground: { kind: "spoken", to: [npc.id], at: "start" } }, sourceContext),
    /cannot perceive/,
  );
  assert.equal(
    bindNarrationSource({ segment: "after", perceive: { kind: "heard", by: [npc.id] } }, sourceContext).perceptions[0]
      .text,
    "Good evening, Leo.",
  );
});

await runCase("narration-writing/explicit-player-delivery", () => {
  const f = fixture(),
    scene = zoneEventScene(f.scene, f.venue);
  const lines = routed(
    f,
    scene,
    [
      { kind: "dialogue", speakerId: f.id, text: "A whisper.", delivery: "whisper", targetId: "player" },
      { kind: "dialogue", speakerId: f.id, text: "Ordinary words outside." },
      { kind: "dialogue", speakerId: f.id, text: "Ordinary words back inside." },
      { kind: "dialogue", speakerId: f.id, text: "A raised call outside.", delivery: "shout" },
    ],
    [
      { characterId: f.id, zoneId: "exterior", segment: 1 },
      { characterId: f.id, zoneId: "parlor", segment: 2 },
      { characterId: f.id, zoneId: "exterior", segment: 3 },
    ],
  );
  assert.deepEqual(
    lines.map((line) => line.heardBy.includes("player")),
    [true, false, true, true],
  );
  assert.equal(lines[1].soundOnly, undefined);
  const context = narrationContinuityContext(f.state, scene, f.venue, "route", "", at);
  const sourceContext = {
    ...context.source,
    lines,
    labels: { whisper: "line-0", remote: "line-1", local: "line-2", shout: "line-3" },
    native: {},
    moves: [],
  };
  assert.equal(
    bindNarrationSource({ segment: "local", perceive: { kind: "heard", by: ["player"] } }, sourceContext).perceptions[0]
      .text,
    lines[2].content,
  );
  const hidden = { ...lines[2], heardBy: [] };
  assert.throws(
    () =>
      bindNarrationSource(
        { segment: "local", perceive: { kind: "heard", by: ["player"] } },
        { ...sourceContext, lines: [lines[0], lines[1], hidden, lines[3]] },
      ),
    /not routed/,
    "visibility flags never substitute for explicit routed player hearing",
  );
});

await runCase("narration-writing/optional-facets", () => {
  const f = fixture(),
    holder = continuityActor(f.state, f.id)!,
    key = continuityHolderKey(holder);
  retainNativeFact(
    f.state,
    {
      id: "learning",
      kind: "initialization",
      targetId: f.id,
      revision: 1,
      text: "Mara discussed craft learning.",
      witnesses: [f.id],
    },
    at,
  );
  const original = f.state.episodes.records[0],
    before = f.state.continuity.versions.length;
  const admission = {
    seed: f.state.seed,
    episodeId: "desire-episode",
    operationId: "desire-operation",
    at,
    actors: original.actors,
    sourceActors: { [original.id]: original.actors },
    sources: original.grounding,
    supplied: [] as { id: string; recordRevision: number; heads: Record<string, number> }[],
    protectedRoots: [],
  };
  f.state.continuity = applyContinuityWrite(
    f.state.continuity,
    {
      id: "desire",
      holders: [holder],
      owner: holder,
      current: true,
      class: "desire",
      text: "I want to learn marquetry.",
      sourceIds: [original.grounding[0].id],
    },
    admission,
  );
  const root = f.state.continuity.records.at(-1)!;
  admission.supplied = [{ id: root.id, recordRevision: root.revision, heads: { [key]: root.heads[key].revision } }];
  for (let i = 0; i < 20; i++)
    f.state.continuity = applyContinuityWrite(
      f.state.continuity,
      {
        id: "reason-" + i,
        holders: [holder],
        class: "perspective",
        parentId: root.id,
        facet: "reason",
        text: "Detail " + i + ": " + "This intricate craft rewards patient attention. ".repeat(35),
        sourceIds: [original.grounding[0].id],
      },
      admission,
    );
  f.state.episodes = appendEpisode(
    f.state.episodes,
    {
      ...original,
      id: admission.episodeId,
      operationId: admission.operationId,
      submissionId: "craft",
      admittedContinuityRevision: before,
      commandReceipts: [],
      grounding: [],
      continuityVersionIds: f.state.continuity.versions.slice(before).map((row) => row.id),
    },
    f.state.seed,
  );
  const context = narrationContinuityContext(f.state, f.scene, f.venue, "next", "Detail marquetry", at);
  assert(context.parts.some((part) => part.block.optional === "memory"));
  const required = context.parts.filter((part) => !part.block.optional);
  assert(
    required.reduce((sum, part) => sum + part.block.text.length, 0) < 1000,
    "optional sibling facets never become part of the required initiative block",
  );
  const fitted = fitVenueWritingMessages(
    {
      fitContext(messages, options) {
        const fits = JSON.stringify(messages).length < 1300;
        return { messages: fits ? messages : [], maxTokens: options?.maxTokens ?? 512, trimmed: !fits } as any;
      },
    },
    context.parts.map((part) => part.block),
    "Detail marquetry",
    512,
  );
  const captured = fittedNarrationReadset(f.state, context, fitted.evidenceIds);
  assert(captured.admission.supplied.some((row) => row.id === root.id));
  assert.equal(captured.offered[0].ids[0], root.id);
});

await runCase("narration-writing/long-followup", async () => {
  const f = fixture(),
    actor = continuityActor(f.state, f.id)!,
    player = continuityActor(f.state, "player")!;
  for (let index = 0; index < 4; index++)
    retainNativeFact(
      f.state,
      {
        id: "weaving-memory-" + index,
        kind: "initialization",
        targetId: f.id,
        revision: 1,
        text:
          "A meaningful weaving memory " +
          index +
          ": " +
          "Patient handwoven craft rewards careful attention. ".repeat(25).slice(0, 1000),
        witnesses: [f.id, "player"],
      },
      at,
    );
  const segments: AcceptedEpisode["segments"] = Array.from({ length: 8 }, (_, index) => ({
    id: "earlier-line-" + index,
    role: "assistant",
    kind: "dialogue",
    speakerId: f.id,
    name: "Mara",
    at,
    zoneId: "parlor",
    heardBy: [f.id, "player"],
    content: "A careful explanation of the old chair and its history. ".repeat(40).slice(0, 1900) + " END_" + index,
  }));
  const question = "Why do you treasure this particular old chair?";
  f.state.episodes = appendEpisode(
    f.state.episodes,
    {
      format: 1,
      id: "prior-exchange",
      seed: f.state.seed,
      sceneId: f.scene.id,
      submissionId: "prior-question",
      operationId: "prior-operation",
      capturedAt: at,
      acceptedAt: at,
      admittedContinuityRevision: 0,
      privateInput: question,
      responseDigest: memoryHash(segments),
      actors: [actor, player].map(({ id, incarnation }) => ({ id, incarnation, zoneId: "parlor" })),
      segments,
      grounding: [],
      continuityVersionIds: [],
      offered: [],
      commandReceipts: [],
      dependencies: {},
    },
    f.state.seed,
  );
  const reply = await f.writing.generate(f.scene, "Why weaving?", "chat");
  const prompt = f
    .messages()
    .map((row) => row.content)
    .join("\n");
  assert(
    prompt.includes(question) && prompt.includes("END_7"),
    "a complete recent exchange borrows unused standing capacity before older optional context",
  );
  assert.match(prompt, /A meaningful weaving memory [0-3]/, "relevant standing context still fits");
  const memory = f
    .messages()
    .flatMap((row) => row.content.split("\n\n"))
    .filter((row) => row.startsWith('{"privateContinuity":'))
    .flatMap((row) => JSON.parse(row).privateContinuity);
  assert(memory.length < 4, "routine standing context has a separate budget");
  const shared = memory.find((row) => row.holders?.length === 2);
  assert(shared, "identical meanings retain each holder's own citation");
  for (const knower of shared.holders) assert.equal(reply.readset.source.historical[knower.source].actorId, knower.for);
  assert.equal(f.calls.purchases, 1);

  const saved = f.state.episodes.records.find((row) => row.id === "prior-exchange")!;
  for (const id of ["astrolabe-note", "oversized-astrolabe-note"]) {
    const lines = id.startsWith("oversized")
      ? segments.map((line) => ({ ...line, content: "The astrolabe. " + line.content }))
      : [{ ...segments[0], content: "The brass astrolabe belongs to the ferryman." }];
    f.state.episodes = appendEpisode(
      f.state.episodes,
      {
        ...saved,
        id,
        sceneId: "older-scene",
        operationId: id,
        submissionId: id,
        privateInput: "What is the astrolabe?",
        segments: lines,
        responseDigest: memoryHash(lines),
      },
      f.state.seed,
    );
  }
  f.nextOperation("astrolabe-callback");
  const callback = await f.writing.prepareVenueTurnMessages(f.scene, "Remember the astrolabe?", "chat");
  const recalled = callback.fitted.messages
    .flatMap((row) => row.content.split("\n\n"))
    .filter((row) => row.startsWith('{"interaction":'))
    .map((row) => JSON.parse(row))
    .filter((row) => row.earlierRecall);
  assert.equal(recalled.length, 1);
  assert.match(JSON.stringify(recalled), /brass astrolabe belongs to the ferryman/);
  const { heard } = recalled[0].interaction.segments[0];
  assert.match(heard.ref, /^h:\d+\.\d+$/u);
  const evidence = callback.readset.source.historical[heard.ref];
  assert.equal(evidence.episodeId, "astrolabe-note");
  assert.equal(evidence.excerpt, "The brass astrolabe belongs to the ferryman.");
  assert.deepEqual(
    evidence.perceptions.map((row) => row.actorId),
    heard.by,
  );
  const ordinary = await f.writing.prepareVenueTurnMessages(f.scene, "Look around the room.", "chat");
  assert(ordinary.fitted.messages.every((row) => !row.content.includes("brass astrolabe")));
});

await runCase("narration-writing/history-prefix", async () => {
  const f = fixture();
  const actors = [f.id, "player"].map((id) => ({
    id,
    incarnation: continuityActor(f.state, id)!.incarnation,
    zoneId: "parlor",
  }));
  let previous: string[] = [],
    resets = 0;
  for (let count = 1; count <= 108; count++) {
    const id = "exchange-" + count;
    const keyword = count % 2 ? "cedar" : "maple";
    const longExchange = count === 13;
    const segments: AcceptedEpisode["segments"] = Array.from({ length: longExchange ? 14 : 1 }, (_, index) => ({
      id: id + "-answer-" + index,
      role: "assistant",
      kind: "dialogue",
      speakerId: f.id,
      name: "Mara",
      at,
      zoneId: "parlor",
      heardBy: [f.id, "player"],
      content: (keyword + " weathered wood catches the afternoon light. ").repeat(
        longExchange ? 38 : count > 12 ? 28 : 7,
      ),
    }));
    f.state.episodes = appendEpisode(
      f.state.episodes,
      {
        format: 1,
        id,
        seed: f.state.seed,
        sceneId: f.scene.id,
        submissionId: id,
        operationId: id,
        capturedAt: at,
        acceptedAt: at,
        admittedContinuityRevision: 0,
        privateInput: "What do you like about " + keyword + "?",
        responseDigest: memoryHash(segments),
        actors,
        segments,
        grounding: [],
        continuityVersionIds: [],
        offered: [],
        commandReceipts: [],
        dependencies: {},
      },
      f.state.seed,
    );
    f.nextOperation("after-" + id);
    const request = await f.writing.prepareVenueTurnMessages(f.scene, keyword, "chat");
    const blocks = request.fitted.messages
      .flatMap((row) => row.content.split("\n\n"))
      .filter((row) => row.startsWith('{"interaction":'));
    const active = blocks.filter((row) => !JSON.parse(row).earlierRecall);
    assert.equal(JSON.parse(active.at(-1)!).interaction.id, "e" + count);
    assert.deepEqual(blocks.slice(0, active.length), active);
    const cacheBoundary = request.fitted.messages.findLast((row) => row.cacheBreakpoint);
    assert(cacheBoundary?.content.endsWith(active.at(-1)!));
    assert.equal(cacheBoundary.role, "user");
    assert(
      request.fitted.messages
        .filter((row) => row.role === "system")
        .every((row) => !row.content.includes('{"interaction":')),
    );
    const tail = request.fitted.messages.slice(request.fitted.messages.indexOf(cacheBoundary!) + 1);
    assert(tail.some((row) => row.role === "user" && row.content.includes("## Current Scene circumstances")));
    assert.equal(tail.at(-2)?.content, "## Current player submission");
    assert.equal(tail.at(-1)?.content, keyword);
    if (count <= 50) assert.equal(active.length, count, "a substantial transcript fits without a rebase");
    if (previous.length && active[0] === previous[0])
      assert.deepEqual(active.slice(0, -1), previous, "new turns append to the byte-identical history prefix");
    else if (previous.length) resets++;
    previous = active;
  }
  assert(resets > 0, "long Scenes eventually rebuild the bounded transcript");
  assert.equal(f.calls.purchases, 0);
});

await runCase("narration-writing/required-evidence-bound", async () => {
  const f = fixture(),
    holder = continuityActor(f.state, f.id)!,
    key = continuityHolderKey(holder);
  retainNativeFact(
    f.state,
    {
      id: "prior",
      kind: "initialization",
      targetId: f.id,
      revision: 1,
      text: "Mara described her craft boundaries.",
      witnesses: [f.id],
    },
    at,
  );
  const original = f.state.episodes.records[0],
    before = f.state.continuity.versions.length;
  const admission = {
    seed: f.state.seed,
    operationId: "boundaries",
    episodeId: "boundaries-episode",
    at,
    actors: original.actors,
    sourceActors: { [original.id]: original.actors },
    sources: original.grounding,
    protectedRoots: [],
    supplied: [] as { id: string; recordRevision: number; heads: Record<string, number> }[],
  };
  f.state.continuity = applyContinuityWrite(
    f.state.continuity,
    {
      id: "purpose",
      holders: [holder],
      owner: holder,
      text: "I want to preserve my craft boundaries.",
      class: "desire",
      current: true,
      sourceIds: [original.grounding[0].id],
    },
    admission,
  );
  const parent = f.state.continuity.records.at(-1)!;
  admission.supplied = [
    { id: parent.id, recordRevision: parent.revision, heads: { [key]: parent.heads[key].revision } },
  ];
  for (let index = 0; index < 625; index++)
    f.state.continuity = applyContinuityWrite(
      f.state.continuity,
      {
        id: "boundary-" + index,
        holders: [holder],
        text: "A lasting personal craft boundary " + index,
        class: "perspective",
        current: true,
        parentId: parent.id,
        facet: "boundary",
        sourceIds: [original.grounding[0].id],
      },
      admission,
    );
  f.state.episodes = appendEpisode(
    f.state.episodes,
    {
      ...original,
      id: admission.episodeId,
      operationId: admission.operationId,
      submissionId: "boundaries",
      admittedContinuityRevision: before,
      grounding: [],
      commandReceipts: [],
      continuityVersionIds: f.state.continuity.versions.slice(before).map((row) => row.id),
    },
    f.state.seed,
  );
  await assert.rejects(
    () => f.writing.generate(f.scene, "Hello.", "chat"),
    /evidence exceeds the retained request bound before generation/,
  );
  assert.equal(f.calls.purchases, 0, "a fit that cannot retain all required provenance never reaches the provider");
  assert.equal(f.checkpoints.size, 0);
});
