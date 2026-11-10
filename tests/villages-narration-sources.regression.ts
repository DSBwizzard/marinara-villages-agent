// Test cases: narration-sources/exact-private-input, narration-sources/spatial-audience, narration-sources/movement-order, narration-sources/routed-segments, narration-sources/own-perspective, narration-sources/fitted-aliases, narration-sources/room-without-knowers, narration-sources/sound-alias-retention, narration-sources/cold-input-widening, narration-sources/keep-binding, narration-sources/first-disclosure, narration-sources/native-combination, narration-sources/absent-owner-disclosure
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { venueFixture } from "./helpers/venues.fixture.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import {
  bindNarrationSource,
  assertNarrationSourceOrder,
  type NarrationSourceContext,
} from "../packages/villages/src/server/domain/rules/narration-sources.js";
import {
  applyContinuityWrite,
  continuityProtectionUnits,
  continuityHolderKey,
  continuitySourceUnit,
  continuityViews,
  emptyContinuity,
} from "../packages/villages/src/server/domain/rules/continuity.js";
import type {
  ContinuityEvidence,
  ContinuityHolder,
} from "../packages/villages/src/server/domain/models/continuity-model.js";
import type { VenueLine } from "../packages/villages/src/server/domain/models/scene-model.js";
import { readAcceptedEpisode } from "../packages/villages/src/server/domain/decoding/episode-codec.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import type { AcceptedEpisode } from "../packages/villages/src/server/domain/models/episode-model.js";
import { appendEpisode, emptyEpisodes } from "../packages/villages/src/server/domain/rules/episodes.js";
import { emptyPlaceRegistry } from "../packages/villages/src/server/domain/rules/places.js";
import {
  encodeContinuityPages,
  decodeContinuityPages,
} from "../packages/villages/src/server/adapters/storage/continuity-pages.js";
import { prepareNarrationKeep } from "../packages/villages/src/server/domain/rules/narration-keep.js";
import { retainNativeFact } from "../packages/villages/src/server/domain/rules/native-continuity.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";

const at = "2026-11-09T12:00:00.000Z";
const actor = (id: string): Extract<ContinuityHolder, { kind: "actor" }> => ({ kind: "actor", id, incarnation: "one" });
const mara = actor("mara"),
  leo = actor("leo"),
  player = actor("player");
const venue = venueFixture({
  id: "house",
  name: "House",
  zones: [
    { ...defaultVenueSpace("other"), id: "exterior", kind: "exterior", name: "Entrance", connectedTo: ["parlor"] },
    { ...defaultVenueSpace("other"), id: "parlor", kind: "public", name: "Parlor", connectedTo: ["exterior", "hall"] },
    { ...defaultVenueSpace("other"), id: "hall", kind: "public", name: "Hall", connectedTo: ["parlor", "far"] },
    { ...defaultVenueSpace("other"), id: "far", kind: "public", name: "Far room", connectedTo: ["hall"] },
  ],
});
const scene = coerceSession({
  version: 5,
  id: "scene",
  placeId: "house",
  villageSeed: "world",
  zoneId: "parlor",
  participants: [
    { characterId: "mara", name: "Mara", doing: "Talking" },
    { characterId: "leo", name: "Leo", doing: "Reading" },
    { characterId: "delia", name: "Delia", doing: "Reading" },
  ],
  activeIds: ["mara"],
  lines: [],
  submissions: [],
  sceneAttendance: {
    capturedAt: at,
    layout: captureSceneLayout(venue),
    occupants: [
      { characterId: "mara", name: "Mara", doing: "Talking", zoneId: "parlor" },
      { characterId: "leo", name: "Leo", doing: "Reading", zoneId: "hall" },
      { characterId: "delia", name: "Delia", doing: "Reading", zoneId: "far" },
    ],
  },
});
const line = (id: string, text: string, kind: VenueLine["kind"] = "dialogue"): VenueLine => ({
  id,
  speakerId: kind === "narration" ? "__venue_scene__" : "mara",
  name: kind === "narration" ? "Narration" : "Mara",
  role: "assistant",
  kind,
  content: text,
  at,
  heardBy: ["mara", "player"],
  zoneId: "parlor",
});
const context = (input = "Good morning."): NarrationSourceContext => ({
  seed: "world",
  episodeId: "episode",
  operationId: "operation",
  input,
  actors: [player, mara, leo, actor("delia")],
  scene,
  venue,
  lines: [line("reply", "Yes, I accept that invitation."), line("crossing", "Mara leaves for the hall.", "narration")],
  labels: { reply: "reply", cross: "crossing" },
  historical: {},
  native: {},
  moves: [],
});

await runCase("narration-sources/native-combination", () => {
  const state = { ...defaultVillageState(), seed: "world", setupAt: at };
  for (const id of ["roof", "garden"])
    retainNativeFact(
      state,
      {
        id: "complete:" + id,
        kind: "project",
        targetId: id,
        revision: 1,
        text: "The " + id + " project was completed.",
        witnesses: ["player"],
      },
      at,
    );
  const captured = context();
  captured.actors = [continuityActor(state, "player")!];
  captured.historical = Object.fromEntries(
    state.episodes.records.map((episode, index) => ["h:" + index, episode.grounding[0]]),
  );
  const prepared = prepareNarrationKeep(
    {
      for: ["player"],
      class: "experience",
      text: "The roof and garden projects were completed.",
      source: ["h:0", "h:1"],
    },
    0,
    state.continuity,
    {
      seed: "world",
      operationId: captured.operationId,
      episodeId: captured.episodeId,
      at,
      actors: captured.actors,
      sourceActors: Object.fromEntries(state.episodes.records.map((episode) => [episode.id, episode.actors])),
      sources: [],
      supplied: [],
      protectedRoots: [],
    },
    captured,
  );
  assert.equal(
    prepared.sources.length,
    2,
    "two native operations remain independently identifiable when recalled together",
  );
  assert.equal(applyContinuityWrite(state.continuity, prepared.write, prepared.admission).records.length, 3);
});
function keep(
  source: ContinuityEvidence,
  holder = mara,
  className: "information" | "perspective" | "desire" = "information",
) {
  return applyContinuityWrite(
    emptyContinuity(),
    {
      id: "note",
      holders: [holder],
      ...(className !== "information" ? { owner: holder } : {}),
      text: source.excerpt,
      class: className,
      sourceIds: [source.id],
    },
    {
      seed: "world",
      episodeId: "episode",
      operationId: "operation",
      at,
      actors: [player, mara, leo, actor("delia")],
      sources: [source],
      supplied: [],
      protectedRoots: [],
    },
  );
}

await runCase("narration-sources/exact-private-input", () => {
  const captured = context("I think ‘yes’. I say ‘yes’.  café 👩‍🚀 é");
  assert.throws(
    () => bindNarrationSource({ input: "yes", ground: { kind: "spoken", to: ["mara"] } }, captured),
    /ambiguous/,
  );
  const said = bindNarrationSource(
    { input: "yes", occurrence: 2, ground: { kind: "spoken", to: ["mara"] }, act: "accept" },
    captured,
  );
  assert.equal(captured.input.slice(said.range!.start, said.range!.end), "yes");
  assert.equal(said.range!.start, captured.input.lastIndexOf("yes"));
  assert.equal(said.act, "accept");
  const thought = bindNarrationSource({ input: "I think ‘yes’.", ground: { kind: "private" } }, captured);
  assert.throws(() => keep(thought), /unwitnessed/);
  assert.equal(keep(thought, player, "perspective").records.length, 1);
  const existence = bindNarrationSource({ input: "I think ‘yes’." }, captured);
  assert.throws(() => keep(existence, player, "perspective"), /unwitnessed/);
  assert.throws(
    () => bindNarrationSource({ input: "I think ‘yes’.", ground: { kind: "private" }, act: "accept" }, captured),
    /actual communication/,
  );
  const unicode = bindNarrationSource({ input: "café 👩‍🚀 é", ground: { kind: "spoken", to: ["mara"] } }, captured);
  assert.equal(unicode.excerpt, "café 👩‍🚀 é");
  assert.deepEqual(
    bindNarrationSource({ input: "café 👩‍🚀 é", ground: { kind: "spoken", to: ["mara"] } }, structuredClone(captured)),
    unicode,
    "recovery binds the same exact source and frozen positions",
  );
});

await runCase("narration-sources/spatial-audience", () => {
  const captured = context();
  assert.throws(
    () => bindNarrationSource({ input: captured.input, ground: { kind: "spoken", to: ["leo"] } }, captured),
    /cannot perceive/,
  );
  const shouted = bindNarrationSource(
    { input: captured.input, ground: { kind: "spoken", to: ["leo"], delivery: "shout" } },
    captured,
  );
  assert.equal(shouted.perceptions[0].actorId, "leo");
  assert.throws(
    () =>
      bindNarrationSource(
        { input: captured.input, ground: { kind: "spoken", to: ["delia"], delivery: "shout" } },
        captured,
      ),
    /cannot perceive/,
  );
  assert.throws(
    () => bindNarrationSource({ input: captured.input, ground: { kind: "visible-action", to: ["leo"] } }, captured),
    /cannot perceive/,
  );
  const whispered = bindNarrationSource(
    { input: captured.input, ground: { kind: "spoken", to: ["mara"], delivery: "whisper", targetId: "mara" } },
    captured,
  );
  assert.deepEqual(
    whispered.perceptions.map((row) => row.actorId),
    ["mara"],
  );
  assert.throws(
    () =>
      bindNarrationSource(
        {
          input: captured.input,
          ground: { kind: "spoken", to: ["mara", "leo"], delivery: "whisper", targetId: "mara" },
        },
        captured,
      ),
    /cannot perceive/,
  );
  assert.throws(
    () =>
      bindNarrationSource(
        { input: captured.input, ground: { kind: "spoken", to: ["mara"], delivery: "whisper" } },
        captured,
      ),
    /target is not local/,
  );
  assert.throws(
    () => bindNarrationSource({ input: captured.input, ground: { kind: "spoken", to: ["unknown"] } }, captured),
    /cannot perceive/,
  );
});

await runCase("narration-sources/movement-order", () => {
  const captured = context("Listen before leaving. Then come back.");
  captured.moves = [
    { characterId: "mara", zoneId: "hall", quote: "Mara leaves for the hall.", path: ["parlor", "hall"], segment: 1 },
  ];
  const unclassified = bindNarrationSource({ input: "Listen before leaving." }, captured);
  assert.equal(unclassified.kind, "context");
  assert.equal(unclassified.moment, undefined);
  assert.deepEqual(unclassified.perceptions, []);
  assert.throws(
    () => bindNarrationSource({ input: "Listen before leaving.", ground: { kind: "spoken", to: ["mara"] } }, captured),
    /movement moment/,
  );
  const before = bindNarrationSource(
    { input: "Listen before leaving.", ground: { kind: "spoken", to: ["mara"], at: { before: "cross" } } },
    captured,
  );
  assert.equal(before.positions?.mara, "parlor");
  assert.throws(
    () =>
      bindNarrationSource(
        { input: "Then come back.", ground: { kind: "spoken", to: ["mara"], at: { after: "cross" } } },
        captured,
      ),
    /cannot perceive/,
  );
  const after = bindNarrationSource(
    { input: "Then come back.", ground: { kind: "spoken", to: ["mara"], delivery: "shout", at: { after: "cross" } } },
    captured,
  );
  assert.equal(after.positions?.mara, "hall");
  assertNarrationSourceOrder([after, before]);
  assert.throws(
    () =>
      assertNarrationSourceOrder([
        { ...before, moment: after.moment },
        { ...after, moment: before.moment },
      ]),
    /contradicts/,
  );
  const arrival = {
    ...captured,
    moves: [{ characterId: "leo", zoneId: "parlor", quote: "Leo arrives.", path: ["hall", "parlor"], segment: 1 }],
  };
  assert.throws(
    () =>
      bindNarrationSource(
        { input: "Listen before leaving.", ground: { kind: "spoken", to: ["leo"], at: "start" } },
        arrival,
      ),
    /cannot perceive/,
  );
  assert.equal(
    bindNarrationSource(
      { input: "Then come back.", ground: { kind: "spoken", to: ["leo"], at: { after: "cross" } } },
      arrival,
    ).perceptions[0].actorId,
    "leo",
  );
});

await runCase("narration-sources/routed-segments", () => {
  const captured = context();
  captured.lines[0].soundOnly = {
    characterIds: ["leo"],
    player: false,
    text: "Muffled voices; the words are unclear.",
  };
  const spoken = bindNarrationSource({ segment: "reply", act: "accept" }, captured);
  assert.equal(spoken.perceptions.find((row) => row.actorId === "leo")?.text, captured.lines[0].soundOnly.text);
  const state = keep(spoken, leo),
    view = continuityViews(state, leo, at, continuityProtectionUnits(state, leo, new Map()))[0];
  assert.equal(view.version.sources[0].actorId, undefined);
  assert.equal(view.version.sources[0].act, undefined);
  assert.equal(view.version.sources[0].positions, undefined);
  assert.equal(view.version.sources[0].excerpt, captured.lines[0].soundOnly.text);
  assert.throws(
    () => bindNarrationSource({ segment: "reply", perceive: { kind: "heard", by: ["delia"] } }, captured),
    /not routed/,
  );
  assert.throws(() => keep(bindNarrationSource("cross", captured)), /unwitnessed/);
  const seen = bindNarrationSource({ segment: "cross", perceive: { kind: "seen", by: ["mara"] } }, captured);
  assert.equal(seen.kind, "observation");
  assert.throws(
    () => bindNarrationSource({ segment: "cross", perceive: { kind: "seen", by: ["leo"] } }, captured),
    /not eligible/,
  );
});

await runCase("narration-sources/own-perspective", () => {
  const captured = context(),
    owner = { holder: mara, writeId: "note", text: "Sail a boat of my own.", class: "desire" as const };
  const self = bindNarrationSource("self", captured, owner),
    state = applyContinuityWrite(
      emptyContinuity(),
      { id: "note", holders: [mara], owner: mara, class: "desire", text: owner.text, sourceIds: [self.id] },
      {
        seed: "world",
        episodeId: captured.episodeId,
        operationId: captured.operationId,
        at,
        actors: captured.actors,
        sources: [self],
        supplied: [],
        protectedRoots: [],
      },
    );
  assert.equal(state.versions[0].id, self.unitId);
  assert.throws(() => bindNarrationSource("self", captured, { ...owner, holder: player }), /non-player/);
  assert.throws(() => bindNarrationSource("self", captured, { ...owner, class: "information" }), /private perspective/);
  const privateThought = bindNarrationSource(
    { segment: "cross", perceive: { kind: "private", by: ["mara"] } },
    captured,
  );
  assert.throws(() => keep(privateThought, mara, "information"), /perspective/);
  assert.equal(keep(privateThought, mara, "perspective").records.length, 1);
});

await runCase("narration-sources/fitted-aliases", () => {
  const captured = context();
  const original = bindNarrationSource("reply", captured);
  captured.historical["h:known"] = { ...original, episodeId: "earlier" };
  assert.deepEqual(bindNarrationSource("h:known", captured), captured.historical["h:known"]);
  assert.throws(() => bindNarrationSource("h:omitted", captured));
  const receipt = {
    id: "grant",
    kind: "access" as const,
    targetId: "parlor",
    revision: 1,
    text: "Mara grants entry.",
    witnesses: ["mara", "player"],
  };
  captured.native["native:grant"] = receipt;
  const native = bindNarrationSource("native:grant", captured);
  assert.equal(native.fingerprint, memoryHash(receipt));
  assert.equal(native.committedReceiptId, receipt.id);
  assert.throws(
    () =>
      bindNarrationSource("native:grant", captured, {
        holder: { kind: "room", placeId: "house", zoneId: "parlor" },
        writeId: "paint",
        text: "A new mural exists.",
        class: "information",
      }),
    /does not establish this room/,
  );
  assert.throws(() => bindNarrationSource("native:uncommitted", captured));
  const privateInput = bindNarrationSource({ input: captured.input, ground: { kind: "private" } }, captured);
  readAcceptedEpisode(
    {
      format: 1,
      id: captured.episodeId,
      seed: captured.seed,
      sceneId: scene.id,
      submissionId: "turn",
      operationId: captured.operationId,
      capturedAt: at,
      acceptedAt: at,
      responseDigest: memoryHash("response"),
      admittedContinuityRevision: 0,
      privateInput: captured.input,
      actors: captured.actors.map((actor) => ({
        id: actor.id,
        incarnation: actor.incarnation,
        zoneId:
          actor.id === "player"
            ? "parlor"
            : captured.scene.sceneAttendance!.occupants.find((row) => row.characterId === actor.id)!.zoneId,
      })),
      segments: captured.lines,
      grounding: [privateInput, bindNarrationSource({ input: captured.input }, captured), native],
      continuityVersionIds: [],
      offered: [],
      commandReceipts: [receipt],
      dependencies: {},
    },
    captured.seed,
  );
});

const episodeFrom = (
  captured: NarrationSourceContext,
  grounding: ContinuityEvidence[],
  versionIds: string[],
): AcceptedEpisode => ({
  format: 1,
  id: captured.episodeId,
  seed: captured.seed,
  sceneId: captured.scene.id,
  submissionId: captured.episodeId,
  operationId: captured.operationId,
  capturedAt: at,
  acceptedAt: at,
  responseDigest: memoryHash(captured.lines),
  admittedContinuityRevision: 0,
  privateInput: captured.input,
  actors: captured.actors.map((actor) => ({
    id: actor.id,
    incarnation: actor.incarnation,
    zoneId:
      actor.id === "player"
        ? "parlor"
        : captured.scene.sceneAttendance!.occupants.find((row) => row.characterId === actor.id)!.zoneId,
  })),
  segments: captured.lines,
  grounding,
  continuityVersionIds: versionIds,
  offered: [],
  commandReceipts: Object.values(captured.native),
  dependencies: {},
});

await runCase("narration-sources/room-without-knowers", async () => {
  const captured = context();
  captured.lines[1].content = "A blue mural now covers the north wall.";
  const room: Extract<ContinuityHolder, { kind: "room" }> = { kind: "room", placeId: "house", zoneId: "parlor" };
  const source = bindNarrationSource("cross", captured, {
    holder: room,
    writeId: "paint",
    text: captured.lines[1].content,
    class: "information",
  });
  assert.equal(source.kind, "observation");
  assert.deepEqual(source.perceptions, []);
  const state = applyContinuityWrite(
    emptyContinuity(),
    { id: "paint", holders: [room], text: captured.lines[1].content, sourceIds: [source.id] },
    {
      seed: captured.seed,
      episodeId: captured.episodeId,
      operationId: captured.operationId,
      at,
      actors: captured.actors,
      room,
      sources: [source],
      supplied: [],
      protectedRoots: [],
    },
  );
  assert.throws(() => keep(source), /unwitnessed/, "room truth does not automatically teach a character");
  assert.throws(
    () =>
      bindNarrationSource("cross", captured, {
        holder: { ...room, zoneId: "hall" },
        writeId: "remote",
        text: source.excerpt,
        class: "information",
      }),
    /captured scope/,
  );
  const episodes = appendEpisode(
    emptyEpisodes(),
    episodeFrom(
      captured,
      [source],
      state.versions.map((row) => row.id),
    ),
    captured.seed,
  );
  const world = memoryHash(captured.seed).slice(0, 32),
    packet = encodeContinuityPages({ continuity: state, episodes, worldPlaces: emptyPlaceRegistry() }, world);
  const cold = await decodeContinuityPages(
    packet.manifest,
    world,
    captured.seed,
    async (id) => packet.pages.get(id) ?? null,
  );
  assert.equal(continuityViews(cold.value.continuity, room, at, new Set())[0].version.text, captured.lines[1].content);
  assert.deepEqual(continuityViews(cold.value.continuity, mara, at, new Set()), []);
});

await runCase("narration-sources/sound-alias-retention", async () => {
  const captured = context();
  captured.lines[0].soundOnly = {
    characterIds: ["leo"],
    player: false,
    text: "Indistinct voices; words cannot be heard.",
  };
  const canonical = bindNarrationSource({ segment: "reply", act: "accept" }, captured);
  let state = keep(canonical, leo);
  const firstVersion = state.versions[0].id;
  const projected = continuityViews(state, leo, at, new Set())[0].version.sources[0];
  assert.equal(projected.act, undefined);
  assert.equal(projected.actorId, undefined);
  const later = {
    ...context("What was that?"),
    episodeId: "later",
    operationId: "later-operation",
    historical: { "h:voice": projected },
    lines: [line("later-reply", "Some voices carried through the doorway.")],
  };
  later.labels = { reply: "later-reply" };
  const reused = bindNarrationSource("h:voice", later),
    root = state.records[0],
    key = continuityHolderKey(leo),
    target = { id: root.id, recordRevision: root.revision, heads: { [key]: root.heads[key].revision } };
  state = applyContinuityWrite(
    state,
    {
      id: "remember",
      holders: [leo],
      text: "Indistinct voices carried from the parlor.",
      target,
      sourceIds: [reused.id],
    },
    {
      seed: later.seed,
      operationId: later.operationId,
      episodeId: later.episodeId,
      at,
      actors: later.actors,
      sourceActors: { [captured.episodeId]: captured.actors },
      sources: [reused],
      supplied: [target],
      protectedRoots: [],
    },
  );
  let episodes = appendEpisode(emptyEpisodes(), episodeFrom(captured, [canonical], [firstVersion]), captured.seed);
  const next = episodeFrom(later, [], [state.versions.at(-1)!.id]);
  next.dependencies["later-reply"] = [continuitySourceUnit(reused)];
  episodes = appendEpisode(episodes, next, captured.seed);
  const world = memoryHash(captured.seed).slice(0, 32),
    packet = encodeContinuityPages({ continuity: state, episodes, worldPlaces: emptyPlaceRegistry() }, world);
  const cold = await decodeContinuityPages(
    packet.manifest,
    world,
    captured.seed,
    async (id) => packet.pages.get(id) ?? null,
  );
  const source = continuityViews(cold.value.continuity, leo, at, new Set())[0].version.sources[0];
  assert.equal(source.excerpt, captured.lines[0].soundOnly.text);
  assert.equal(source.act, undefined);
  assert.equal(source.actorId, undefined);
});

await runCase("narration-sources/cold-input-widening", async () => {
  const captured = context("A private thought stays secret. Hello.");
  const source = bindNarrationSource({ input: "Hello.", ground: { kind: "spoken", to: ["mara"] } }, captured);
  for (const perception of [
    { actorId: "mara", channel: "words" as const, text: "A private thought stays secret." },
    { actorId: "mara", channel: "private" as const, text: "Hello." },
  ]) {
    const episode = episodeFrom(captured, [{ ...source, perceptions: [perception] }], []),
      world = memoryHash(captured.seed).slice(0, 32);
    const packet = encodeContinuityPages(
      {
        continuity: emptyContinuity(),
        episodes: { format: 1, revision: 1, records: [episode] },
        worldPlaces: emptyPlaceRegistry(),
      },
      world,
    );
    await assert.rejects(
      decodeContinuityPages(packet.manifest, world, captured.seed, async (id) => packet.pages.get(id) ?? null),
      /input source projection changed/,
    );
  }
});

await runCase("narration-sources/keep-binding", async () => {
  const captured = context("I worry she will leave. My father Rowan taught me chair repair.");
  const admission = {
    seed: captured.seed,
    operationId: captured.operationId,
    episodeId: captured.episodeId,
    at,
    actors: captured.actors,
    room: { kind: "room" as const, placeId: "house", zoneId: "parlor" },
    sources: [],
    supplied: [],
    protectedRoots: [],
  };
  const raw = {
    for: ["mara"],
    class: "information",
    text: "The player reports learning chair repair from their father Rowan.",
    source: [{ input: "My father Rowan taught me chair repair.", ground: { kind: "spoken", to: ["mara"] } }],
  };
  const prepared = prepareNarrationKeep(raw, 0, emptyContinuity(), admission, captured);
  const state = applyContinuityWrite(emptyContinuity(), prepared.write, prepared.admission);
  assert.equal(state.versions[0].text, raw.text);
  assert.equal(state.versions[0].sources[0].excerpt, "My father Rowan taught me chair repair.");
  assert.throws(
    () => prepareNarrationKeep({ ...raw, expectedRevision: 99 }, 0, state, admission, captured),
    /expectedRevision/,
  );
  assert.throws(
    () => prepareNarrationKeep({ ...raw, replace: "invented-root" }, 0, state, admission, captured),
    /not fitted/,
  );
  assert.throws(
    () => prepareNarrationKeep({ ...raw, for: ["unknown"] }, 0, state, admission, captured),
    /not admitted/,
  );
  const world = memoryHash(captured.seed).slice(0, 32),
    episodes = appendEpisode(
      emptyEpisodes(),
      episodeFrom(
        captured,
        prepared.sources,
        state.versions.map((version) => version.id),
      ),
      captured.seed,
    );
  const packet = encodeContinuityPages({ continuity: state, episodes, worldPlaces: emptyPlaceRegistry() }, world);
  const cold = await decodeContinuityPages(
    packet.manifest,
    world,
    captured.seed,
    async (id) => packet.pages.get(id) ?? null,
  );
  assert.equal(cold.value.continuity.versions[0].text, raw.text);
});

await runCase("narration-sources/absent-owner-disclosure", async () => {
  const original = {
    ...context(),
    lines: [line("wish-words", "I want to sail a boat of my own.")],
    labels: { wish: "wish-words" },
  };
  const initialAdmission = {
    seed: original.seed,
    operationId: original.operationId,
    episodeId: original.episodeId,
    at,
    actors: original.actors,
    sources: [],
    supplied: [],
    protectedRoots: [],
  };
  const prepared = prepareNarrationKeep(
    {
      for: ["player", "mara"],
      owner: "mara",
      class: "desire",
      about: ["mara"],
      current: false,
      text: "Mara wants to sail a boat of her own.",
      source: [{ segment: "wish" }],
    },
    0,
    emptyContinuity(),
    initialAdmission,
    original,
  );
  const first = applyContinuityWrite(emptyContinuity(), prepared.write, prepared.admission),
    root = first.records[0],
    playerKey = continuityHolderKey(player);
  const fitted = { id: root.id, recordRevision: root.revision, heads: { [playerKey]: root.heads[playerKey].revision } };
  const later = {
    ...context("Mara wants to sail a boat of her own."),
    episodeId: "disclosure",
    operationId: "tell-leo",
    actors: [player, leo],
    lines: [],
    labels: {},
    scene: structuredClone(scene),
  };
  later.scene.activeIds = ["leo"];
  later.scene.sceneAttendance!.occupants = later.scene
    .sceneAttendance!.occupants.filter((row) => row.characterId === "leo")
    .map((row) => ({ ...row, zoneId: "parlor" }));
  const admission = {
    ...initialAdmission,
    operationId: later.operationId,
    episodeId: later.episodeId,
    actors: later.actors,
    supplied: [fitted],
  };
  const raw = {
    for: ["leo"],
    replace: root.id,
    owner: "mara",
    class: "desire",
    text: later.input,
    source: [{ input: later.input, ground: { kind: "spoken", to: ["leo"] } }],
  };
  const { class: _class, ...omitted } = raw;
  const next = prepareNarrationKeep(omitted, 0, first, admission, later);
  assert.deepEqual(next.write.owner, mara);
  assert.equal(next.write.class, "desire");
  assert.deepEqual(next.write.about, ["mara"]);
  assert.equal(next.write.current, false);
  const disclosed = applyContinuityWrite(first, next.write, next.admission);
  assert.deepEqual(disclosed.records[0].heads[continuityHolderKey(mara)], root.heads[continuityHolderKey(mara)]);
  assert.throws(
    () => prepareNarrationKeep({ ...raw, owner: "leo" }, 0, first, admission, later),
    /ownership cannot change/,
  );
  let episodes = appendEpisode(
    emptyEpisodes(),
    episodeFrom(
      original,
      prepared.sources,
      first.versions.map((row) => row.id),
    ),
    original.seed,
  );
  episodes = appendEpisode(episodes, episodeFrom(later, next.sources, [disclosed.versions.at(-1)!.id]), original.seed);
  const world = memoryHash(original.seed).slice(0, 32),
    packet = encodeContinuityPages({ continuity: disclosed, episodes, worldPlaces: emptyPlaceRegistry() }, world);
  const cold = await decodeContinuityPages(
    packet.manifest,
    world,
    original.seed,
    async (id) => packet.pages.get(id) ?? null,
  );
  assert.deepEqual(continuityViews(cold.value.continuity, leo, at, new Set())[0].owner, mara);
  const closureContext = { ...original, episodeId: "fulfilled-privately", operationId: "private-fulfillment" };
  const closureAdmission = {
    ...initialAdmission,
    episodeId: closureContext.episodeId,
    operationId: closureContext.operationId,
    supplied: [
      {
        id: root.id,
        recordRevision: root.revision,
        heads: { [continuityHolderKey(mara)]: root.heads[continuityHolderKey(mara)].revision },
      },
    ],
  };
  const closure = prepareNarrationKeep(
    {
      for: ["mara"],
      replace: root.id,
      text: "Mara is satisfied that she has sailed her own boat.",
      retire: "fulfilled",
      source: ["self"],
    },
    0,
    first,
    closureAdmission,
    closureContext,
  );
  const mixed = applyContinuityWrite(first, closure.write, closure.admission),
    mixedRoot = mixed.records[0];
  const mixedAdmission = {
    ...admission,
    supplied: [
      {
        id: root.id,
        recordRevision: mixedRoot.revision,
        heads: {
          [playerKey]: mixedRoot.heads[playerKey].revision,
          [continuityHolderKey(mara)]: mixedRoot.heads[continuityHolderKey(mara)].revision,
        },
      },
    ],
  };
  assert.throws(() => prepareNarrationKeep(omitted, 0, mixed, mixedAdmission, later), /explicit closure/);
  const openAccount = prepareNarrationKeep(
    { ...omitted, current: false, retire: null },
    0,
    mixed,
    mixedAdmission,
    later,
  );
  const learned = applyContinuityWrite(mixed, openAccount.write, openAccount.admission);
  assert.equal(
    continuityViews(learned, leo, at, new Set())[0].version.closed,
    undefined,
    "Leo learns only the still-open account actually disclosed",
  );
  assert.equal(
    continuityViews(learned, mara, at, new Set())[0].version.closed?.reason,
    "fulfilled",
    "private owner fulfillment remains intact",
  );
  assert.throws(
    () =>
      prepareNarrationKeep(
        { ...omitted, for: ["mara"], retire: null },
        0,
        mixed,
        { ...mixedAdmission, actors: original.actors },
        { ...later, actors: original.actors },
      ),
    /open disclosure cannot reopen/,
  );
});
await runCase("narration-sources/first-disclosure", async () => {
  const original = context("The fair is on Saturday.");
  const privateSource = bindNarrationSource({ input: original.input, ground: { kind: "private" } }, original);
  const first = keep(privateSource, player);
  const root = first.records[0],
    playerKey = continuityHolderKey(player),
    maraKey = continuityHolderKey(mara);
  const fitted = { id: root.id, recordRevision: root.revision, heads: { [playerKey]: root.heads[playerKey].revision } };
  const later = {
    ...context(original.input),
    episodeId: "disclosure",
    operationId: "disclosure-operation",
    lines: [line("disclosure-reply", "I would like to go.")],
  };
  later.labels = { reply: "disclosure-reply" };
  const admission = {
    seed: later.seed,
    operationId: later.operationId,
    episodeId: later.episodeId,
    at,
    actors: later.actors,
    sources: [],
    supplied: [fitted],
    protectedRoots: [],
  };
  const raw = {
    for: ["mara"],
    replace: root.id,
    class: "information",
    text: original.input,
    source: [{ input: original.input, ground: { kind: "spoken", to: ["mara"] } }],
  };
  const prepared = prepareNarrationKeep(raw, 0, first, admission, later);
  assert.equal(prepared.write.target!.heads[maraKey], 0);
  assert.equal(Object.hasOwn(fitted.heads, maraKey), false, "the original fitted capture stays immutable");
  const disclosed = applyContinuityWrite(first, prepared.write, prepared.admission);
  assert.strictEqual(applyContinuityWrite(disclosed, prepared.write, prepared.admission), disclosed);
  const alreadyKnown = { ...admission, supplied: [{ ...fitted, recordRevision: disclosed.records[0].revision }] };
  assert.throws(
    () => prepareNarrationKeep(raw, 0, disclosed, alreadyKnown, later),
    /existing continuity head was not fitted/,
  );
  let episodes = appendEpisode(
    emptyEpisodes(),
    episodeFrom(
      original,
      [privateSource],
      first.versions.map((row) => row.id),
    ),
    original.seed,
  );
  episodes = appendEpisode(
    episodes,
    episodeFrom(later, prepared.sources, [disclosed.versions.at(-1)!.id]),
    original.seed,
  );
  const world = memoryHash(original.seed).slice(0, 32),
    packet = encodeContinuityPages({ continuity: disclosed, episodes, worldPlaces: emptyPlaceRegistry() }, world);
  const cold = await decodeContinuityPages(
    packet.manifest,
    world,
    original.seed,
    async (id) => packet.pages.get(id) ?? null,
  );
  assert.equal(continuityViews(cold.value.continuity, mara, at, new Set())[0].version.text, original.input);
});

console.log(
  "Narration sources: exact consequential excerpts, private thoughts, eligible witnesses, movement moments, scoped sound, self ownership and fitted aliases passed without providers.",
);
