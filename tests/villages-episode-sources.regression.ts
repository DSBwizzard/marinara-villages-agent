// Test cases: episode-sources/routine-cold, episode-sources/sound-privacy, episode-sources/incarnations, episode-sources/room-incarnation
import { emptyMailbox } from "../packages/villages/src/server/domain/decoding/mailbox-codec.js";
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import type {
  AcceptedEpisode,
  EpisodeCollection,
} from "../packages/villages/src/server/domain/models/episode-model.js";
import type {
  ContinuityCollection,
  ContinuityEvidence,
  ContinuityHolder,
} from "../packages/villages/src/server/domain/models/continuity-model.js";
import {
  applyContinuityWrite,
  continuityHolderKey,
  continuityProtectionUnits,
  emptyContinuity,
  protectContinuity,
} from "../packages/villages/src/server/domain/rules/continuity.js";
import {
  appendEpisode,
  emptyEpisodes,
  actorEpisodeView,
  recallEpisodeSpeech,
} from "../packages/villages/src/server/domain/rules/episodes.js";
import { episodeSourceGraph } from "../packages/villages/src/server/domain/decoding/episode-codec.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import {
  encodeContinuityPages,
  decodeContinuityPagesSync,
} from "../packages/villages/src/server/adapters/storage/continuity-pages.js";
import { emptyPlaceRegistry } from "../packages/villages/src/server/domain/rules/places.js";

const at = "2026-11-09T12:00:00.000Z";
const actor = (id: string, incarnation = "one"): Extract<ContinuityHolder, { kind: "actor" }> => ({
  kind: "actor",
  id,
  incarnation,
});
const player = actor("player"),
  mara = actor("mara"),
  replacement = actor("mara", "replacement");
function episode(id: string, actors = [player, mara]): AcceptedEpisode {
  return {
    format: 1,
    id,
    seed: "world",
    sceneId: "scene-" + id,
    submissionId: "turn-" + id,
    operationId: "operation-" + id,
    capturedAt: at,
    acceptedAt: at,
    responseDigest: memoryHash(id),
    admittedContinuityRevision: 0,
    privateInput: "Why?",
    actors: actors.map((actor) => ({ id: actor.id, incarnation: actor.incarnation, zoneId: "parlor" })),
    segments: [
      {
        id: "reply-" + id,
        role: "assistant",
        speakerId: "mara",
        name: "Mara",
        kind: "dialogue",
        content: "My father Rowan taught me chair repair. The kettle is blue.",
        at,
        zoneId: "parlor",
        heardBy: actors.map((actor) => actor.id),
      },
    ],
    grounding: [],
    continuityVersionIds: [],
    offered: [],
    commandReceipts: [],
    dependencies: {},
  };
}
function cold(continuity: ContinuityCollection, episodes: EpisodeCollection) {
  const world = "a".repeat(32),
    packet = encodeContinuityPages(
      { continuity, episodes, worldPlaces: emptyPlaceRegistry(), mailbox: emptyMailbox() },
      world,
    );
  return decodeContinuityPagesSync(packet.manifest, world, "world", (id) => packet.pages.get(id) ?? null).value;
}
function remember(
  continuity: ContinuityCollection,
  history: EpisodeCollection,
  current: AcceptedEpisode,
  holder: typeof player,
  source: ContinuityEvidence,
  text: string,
) {
  const before = continuity.versions.length;
  const changed = applyContinuityWrite(
    continuity,
    { id: "learn", holders: [holder], class: "information", text, sourceIds: [source.id] },
    {
      seed: "world",
      operationId: current.operationId,
      episodeId: current.id,
      at,
      actors: current.actors,
      sources: [source],
      sourceActors: Object.fromEntries(history.records.map((episode) => [episode.id, episode.actors])),
      supplied: [],
      protectedRoots: [],
    },
  );
  current.admittedContinuityRevision = continuity.revision;
  current.continuityVersionIds = changed.versions.slice(before).map((version) => version.id);
  return { continuity: changed, episodes: appendEpisode(history, current, "world") };
}

await runCase("episode-sources/routine-cold", () => {
  const first = episode("ordinary"),
    history = appendEpisode(emptyEpisodes(), first, "world");
  const source = recallEpisodeSpeech(first, first.segments[0].id, emptyContinuity(), player, history)!;
  assert.equal(source.excerpt, first.segments[0].content);
  assert.equal(source.act, undefined);
  const kept = remember(
    emptyContinuity(),
    history,
    episode("followup"),
    player,
    source,
    "Mara said her father Rowan taught her chair repair.",
  );
  const restored = cold(kept.continuity, kept.episodes);
  assert.deepEqual(
    restored.episodes.records[0].grounding,
    [],
    "later recall never rewrites the ordinary prior exchange",
  );
  assert.equal(restored.continuity.versions[0].sources[0].excerpt, first.segments[0].content);
  const root = restored.continuity.records[0],
    key = continuityHolderKey(player);
  const forgotten = protectContinuity(
    restored.continuity,
    { id: root.id, recordRevision: root.revision, heads: { [key]: root.heads[key].revision } },
    [player],
    "forget",
    at,
    { forget: true },
  );
  const spanEpisode = structuredClone(first),
    words = "The kettle is blue.",
    start = spanEpisode.segments[0].content.indexOf(words);
  spanEpisode.grounding = [
    {
      id: "kettle",
      seed: "world",
      episodeId: first.id,
      unitId: first.segments[0].id,
      fingerprint: memoryHash(first.segments[0]),
      kind: "speech",
      actorId: "mara",
      excerpt: words,
      range: { start, end: start + words.length },
      perceptions: [{ actorId: "player", channel: "words", text: words }],
    },
  ];
  const withSpan = { ...restored.episodes, records: [spanEpisode, restored.episodes.records[1]] };
  assert.deepEqual(
    actorEpisodeView(spanEpisode, forgotten, player, withSpan)?.segments.map((line) => line.text),
    [words],
  );
  assert.equal(
    recallEpisodeSpeech(spanEpisode, first.segments[0].id, forgotten, player, withSpan),
    undefined,
    "an independent surviving span cannot reopen the protected whole utterance",
  );
});

await runCase("episode-sources/sound-privacy", () => {
  const first = episode("distant");
  first.segments[0].heardBy = ["mara"];
  first.segments[0].contactHidden = true;
  first.segments[0].soundOnly = { characterIds: [], player: true, text: "Indistinct voices carry from the parlor." };
  const history = appendEpisode(emptyEpisodes(), first, "world"),
    source = recallEpisodeSpeech(first, first.segments[0].id, emptyContinuity(), player, history)!;
  assert.equal(source.actorId, undefined);
  assert.equal(source.excerpt, first.segments[0].soundOnly.text);
  const kept = remember(
    emptyContinuity(),
    history,
    episode("sound-followup"),
    player,
    source,
    "I heard indistinct voices from the parlor.",
  );
  const restored = cold(kept.continuity, kept.episodes);
  assert.ok(!JSON.stringify(restored.continuity).includes("Rowan"));
  for (const forged of [
    {
      ...source,
      excerpt: first.segments[0].content,
      actorId: "mara",
      perceptions: [{ actorId: "player", channel: "words" as const, text: first.segments[0].content }],
    },
    { ...source, act: "accept" as const },
  ]) {
    const changed = structuredClone(kept.continuity);
    changed.versions[0].sources = [forged];
    assert.throws(() => cold(changed, kept.episodes), /projection|canonical|source author/);
  }
  for (const kind of ["narration", "report"] as const) {
    const synthetic = episode(kind);
    if (kind === "narration") {
      synthetic.segments[0].kind = "narration";
      synthetic.segments[0].speakerId = "__venue_scene__";
    } else synthetic.segments[0].contactReport = true;
    const ownHistory = appendEpisode(emptyEpisodes(), synthetic, "world");
    assert.equal(
      recallEpisodeSpeech(synthetic, synthetic.segments[0].id, emptyContinuity(), player, ownHistory),
      undefined,
    );
  }
});

await runCase("episode-sources/incarnations", () => {
  const first = episode("before-reentry"),
    history = appendEpisode(emptyEpisodes(), first, "world");
  assert.equal(recallEpisodeSpeech(first, first.segments[0].id, emptyContinuity(), replacement, history), undefined);
  const old = recallEpisodeSpeech(first, first.segments[0].id, emptyContinuity(), mara, history)!;
  assert.throws(
    () =>
      remember(
        emptyContinuity(),
        history,
        episode("wrong-holder", [player, replacement]),
        replacement,
        old,
        "A borrowed old memory.",
      ),
    /unwitnessed/,
  );
  const current = episode("fresh-disclosure", [player, replacement]);
  current.privateInput = "Rowan taught chair repair.";
  const fresh: ContinuityEvidence = {
    id: "fresh",
    seed: "world",
    episodeId: current.id,
    unitId: "input",
    fingerprint: memoryHash(current.privateInput),
    kind: "speech",
    actorId: "player",
    excerpt: current.privateInput,
    range: { start: 0, end: current.privateInput.length },
    perceptions: [{ actorId: "mara", channel: "words", text: current.privateInput }],
  };
  current.grounding = [fresh];
  const valid = remember(
    emptyContinuity(),
    history,
    current,
    replacement,
    fresh,
    "The player told Mara that Rowan taught chair repair.",
  );
  cold(valid.continuity, valid.episodes);
  const next = episode("later", [player, replacement]),
    root = valid.continuity.records[0],
    key = continuityHolderKey(replacement);
  const changed = applyContinuityWrite(
    valid.continuity,
    {
      id: "update",
      holders: [replacement],
      target: { id: root.id, recordRevision: root.revision, heads: { [key]: root.heads[key].revision } },
      sourceIds: [fresh.id],
    },
    {
      seed: "world",
      operationId: next.operationId,
      episodeId: next.id,
      at,
      actors: next.actors,
      sources: [fresh],
      sourceActors: { [current.id]: current.actors },
      supplied: [{ id: root.id, recordRevision: root.revision, heads: { [key]: root.heads[key].revision } }],
      protectedRoots: [],
    },
  );
  next.admittedContinuityRevision = valid.continuity.revision;
  next.continuityVersionIds = [changed.versions.at(-1)!.id];
  const later = appendEpisode(valid.episodes, next, "world"),
    poisoned = structuredClone(changed);
  poisoned.versions[0].sources = [old];
  assert.notEqual(poisoned.records[0].heads[key].versionId, poisoned.versions[0].id);
  assert.throws(
    () => cold(poisoned, later),
    /another incarnation/,
    "historical noncurrent versions cannot borrow an older incarnation's sources",
  );
});

await runCase("episode-sources/room-incarnation", () => {
  const current = episode("room-observation"),
    room = { kind: "room" as const, placeId: "house", zoneId: "parlor" };
  current.segments[0].kind = "narration";
  current.segments[0].speakerId = "__venue_scene__";
  current.segments[0].content = "A blue kettle stands on the shelf.";
  const source: ContinuityEvidence = {
    id: "room",
    seed: "world",
    episodeId: current.id,
    unitId: current.segments[0].id,
    fingerprint: memoryHash(current.segments[0]),
    kind: "observation",
    excerpt: current.segments[0].content,
    perceptions: [{ actorId: "mara", channel: "sight", text: current.segments[0].content }],
  };
  current.grounding = [source];
  const continuity = applyContinuityWrite(
    emptyContinuity(),
    { id: "room", holders: [room], text: source.excerpt, sourceIds: [source.id], room: { knownBy: ["mara"] } },
    {
      seed: "world",
      operationId: current.operationId,
      episodeId: current.id,
      at,
      actors: current.actors,
      room,
      sources: [source],
      supplied: [],
      protectedRoots: [],
    },
  );
  current.continuityVersionIds = continuity.versions.map((version) => version.id);
  const history = appendEpisode(emptyEpisodes(), current, "world");
  cold(continuity, history);
  const otherRoom = { kind: "room" as const, placeId: "other-house", zoneId: "private" };
  const crossed = structuredClone(continuity);
  crossed.records[0].heads[continuityHolderKey(otherRoom)] = {
    ...crossed.records[0].heads[continuityHolderKey(room)],
    holder: otherRoom,
  };
  assert.throws(
    () => cold(crossed, history),
    /more than one room/,
    "a room's condition cannot be shared into another location by a second head",
  );
  const forged = structuredClone(continuity),
    root = forged.records[0];
  root.heads[continuityHolderKey(replacement)] = { ...root.heads[continuityHolderKey(mara)], holder: replacement };
  assert.throws(
    () => cold(forged, history),
    /another incarnation/,
    "room sharing must preserve the exact original observer incarnation",
  );
  assert.equal(continuityProtectionUnits(continuity, replacement, episodeSourceGraph(history.records)).size, 0);
});
