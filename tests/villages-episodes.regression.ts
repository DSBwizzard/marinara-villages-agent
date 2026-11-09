// Test cases: episodes/natural-private-chronology, episodes/perception-arrivals, episodes/protection, episodes/identity, episodes/cold-pages-scale, episodes/shared-followup, episodes/ancestry, episodes/private-narration, episodes/self-native-retention, episodes/independent-spans
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import type { AcceptedEpisode } from "../packages/villages/src/server/domain/models/episode-model.js";
import type {
  ContinuityEvidence,
  ContinuityHolder,
} from "../packages/villages/src/server/domain/models/continuity-model.js";
import { readAcceptedEpisode, readEpisodes } from "../packages/villages/src/server/domain/decoding/episode-codec.js";
import {
  actorEpisodeView as projectActorEpisode,
  appendEpisode,
  emptyEpisodes,
  gmEpisodeView as projectGmEpisode,
  selectEpisodeHistory,
} from "../packages/villages/src/server/domain/rules/episodes.js";
import {
  applyContinuityWrite,
  continuityHolderKey,
  continuityProtectionUnits,
  continuityViews,
  emptyContinuity,
  protectContinuity,
} from "../packages/villages/src/server/domain/rules/continuity.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { emptyPlaceRegistry } from "../packages/villages/src/server/domain/rules/places.js";
import {
  encodeContinuityPages,
  decodeContinuityPages,
} from "../packages/villages/src/server/adapters/storage/continuity-pages.js";
import { episodeSourceGraph, episodeUnit } from "../packages/villages/src/server/domain/decoding/episode-codec.js";
import { assertContinuityRetention } from "../packages/villages/src/server/domain/rules/continuity-retention.js";

const at = "2026-11-09T12:00:00.000Z";
const actor = (id: string): Extract<ContinuityHolder, { kind: "actor" }> => ({ kind: "actor", id, incarnation: "one" });
const mara = actor("mara"),
  leo = actor("leo"),
  player = actor("player");
function episode(id = "one", input = "Why?", reply = "Because I hoped you would come."): AcceptedEpisode {
  return {
    format: 1,
    id,
    seed: "world",
    sceneId: "scene-" + id,
    submissionId: "submit-" + id,
    operationId: "operation-" + id,
    capturedAt: at,
    acceptedAt: at,
    responseDigest: memoryHash([id, input, reply]),
    privateInput: input,
    actors: [player, mara].map((actor) => ({ id: actor.id, incarnation: actor.incarnation, zoneId: "parlor" })),
    segments: [
      {
        id: "reply-" + id,
        role: "assistant",
        speakerId: "mara",
        name: "Mara",
        kind: "dialogue",
        content: reply,
        at,
        heardBy: ["mara", "player"],
        zoneId: "parlor",
      },
    ],
    grounding: [],
    continuityVersionIds: [],
    commandReceipts: [],
    dependencies: {},
  };
}
function inputSource(episode: AcceptedEpisode, text: string): ContinuityEvidence {
  const start = episode.privateInput.indexOf(text);
  return {
    id: "grounded-input",
    seed: "world",
    episodeId: episode.id,
    fingerprint: memoryHash(episode.privateInput),
    unitId: "input",
    excerpt: text,
    kind: "speech",
    actorId: "player",
    range: { start, end: start + text.length },
    perceptions: [{ actorId: "mara", channel: "words", text }],
  };
}
const actorEpisodeView = (
  episode: AcceptedEpisode,
  continuity: ReturnType<typeof emptyContinuity>,
  holder: typeof mara,
  history = { format: 1 as const, revision: 1, records: [episode] },
) => projectActorEpisode(episode, continuity, holder, history);
const gmEpisodeView = (
  episode: AcceptedEpisode,
  continuity: ReturnType<typeof emptyContinuity>,
  holders: (typeof mara)[],
  history = { format: 1 as const, revision: 1, records: [episode] },
) => projectGmEpisode(episode, continuity, holders, history);

await runCase("episodes/natural-private-chronology", () => {
  const first = episode("first", "Would you like to visit the fair?", "Yes, I have been looking forward to it.");
  const second = episode("second", "Why?", "I want to show you the lantern boats.");
  let history = appendEpisode(emptyEpisodes(), first, "world");
  history = appendEpisode(history, second, "world");
  const context = selectEpisodeHistory(history, emptyContinuity(), [mara, player], "Why?", 16000);
  assert.deepEqual(
    context.episodes.map((row) => row.gmPrivateInput),
    [{ text: first.privateInput }, { text: "Why?" }],
  );
  assert.deepEqual(
    context.episodes.map((row) => row.sceneId),
    [first.sceneId, second.sceneId],
    "retired Scene owners are not required for chronological history",
  );
  assert.deepEqual(
    actorEpisodeView(first, emptyContinuity(), mara)?.input,
    [],
    "ordinary private GM input is not an invented resident transcript",
  );
  assert.equal(first.grounding.length, 0, "routine questions need no classification or grounding records");
});

await runCase("episodes/perception-arrivals", () => {
  const mixed = episode("mixed", "I worry she will leave.  ‘Good morning, Mara.’ 🌅 é", "Good morning!");
  mixed.grounding = [inputSource(mixed, "Good morning, Mara.")];
  const saved = readAcceptedEpisode(mixed, "world");
  assert.equal(
    gmEpisodeView(saved, emptyContinuity(), [mara])?.gmPrivateInput.text,
    mixed.privateInput,
    "exact Unicode and whitespace survive",
  );
  assert.deepEqual(
    actorEpisodeView(saved, emptyContinuity(), mara)?.input.map((row) => row.text),
    ["Good morning, Mara."],
  );
  assert.equal(JSON.stringify(actorEpisodeView(saved, emptyContinuity(), mara)).includes("worry"), false);
  assert.equal(
    actorEpisodeView(saved, emptyContinuity(), leo),
    null,
    "a later arrival cannot hear an earlier exchange",
  );
  assert.equal(actorEpisodeView(saved, emptyContinuity(), { ...mara, incarnation: "replacement" }), null);
  const sound = episode("sound");
  sound.actors.push({ id: "leo", incarnation: "one", zoneId: "hall" });
  sound.segments[0].soundOnly = { characterIds: ["leo"], player: false, text: "Indistinct voices from another room." };
  const heard = actorEpisodeView(readAcceptedEpisode(sound, "world"), emptyContinuity(), leo)!;
  assert.equal(heard.segments[0].text, sound.segments[0].soundOnly.text);
  assert.equal(heard.segments[0].speakerId, "__venue_scene__");
  assert.equal(JSON.stringify(heard).includes(sound.segments[0].content), false);
});

await runCase("episodes/protection", () => {
  const first = episode("secret", "My father Rowan taught me chair repair.");
  first.grounding = [inputSource(first, first.privateInput)];
  const saved = readAcceptedEpisode(first, "world"),
    evidence = saved.grounding[0];
  const learned = applyContinuityWrite(
    emptyContinuity(),
    { id: "remember", holders: [mara], text: evidence.excerpt, sourceIds: [evidence.id] },
    {
      seed: "world",
      operationId: "remember",
      episodeId: first.id,
      at,
      actors: first.actors,
      sources: [evidence],
      supplied: [],
      protectedRoots: [],
    },
  );
  const root = learned.records[0],
    key = continuityHolderKey(mara),
    target = { id: root.id, recordRevision: root.revision, heads: { [key]: root.heads[key].revision } };
  const fixed = protectContinuity(learned, target, [mara], "repair", at, { text: "Rowan taught finishing work." });
  const view = gmEpisodeView(saved, fixed, [mara])!;
  assert.deepEqual(view.gmPrivateInput, { withheld: true });
  assert.deepEqual(actorEpisodeView(saved, fixed, mara)?.input, []);
  const forgotten = protectContinuity(learned, target, [mara], "forget", at, { forget: true });
  assert.deepEqual(gmEpisodeView(saved, forgotten, [mara])?.gmPrivateInput, { withheld: true });
  assert.deepEqual(
    gmEpisodeView(saved, forgotten, [player])?.gmPrivateInput,
    { text: first.privateInput },
    "Mara's protection does not delete the player's knowledge",
  );
});

await runCase("episodes/identity", () => {
  const first = episode(),
    state = appendEpisode(emptyEpisodes(), first, "world");
  assert.strictEqual(appendEpisode(state, first, "world"), state);
  assert.throws(() => appendEpisode(state, { ...first, privateInput: "Changed input" }, "world"), /identity reused/);
  assert.throws(() => readAcceptedEpisode(first, "another-world"), /world or time/);
  assert.throws(() => readEpisodes({ format: 0, revision: 0, records: [] }, "world"));
  const oldBytes = JSON.stringify({ format: 0, records: [first] });
  assert.throws(() => readEpisodes(JSON.parse(oldBytes), "world"));
  assert.equal(JSON.stringify(JSON.parse(oldBytes)), oldBytes, "rejection never rewrites stored data");
  const invalid = episode("invalid");
  invalid.grounding = [{ ...inputSource(invalid, invalid.privateInput), fingerprint: memoryHash("other input") }];
  assert.throws(() => readAcceptedEpisode(invalid, "world"), /source identity/);
  const privateLeak = episode("private-leak", "I worry she will leave.");
  privateLeak.grounding = [{ ...inputSource(privateLeak, privateLeak.privateInput), kind: "private" }];
  assert.throws(() => readAcceptedEpisode(privateLeak, "world"), /foreign audience/);
  assert.deepEqual(
    actorEpisodeView(privateLeak, emptyContinuity(), mara)?.input,
    [],
    "ordinary projection also fails closed on private-source foreign audiences",
  );
  const forgedWitness = episode("forged-witness");
  forgedWitness.actors.push({ id: "leo", incarnation: "one", zoneId: "hall" });
  forgedWitness.grounding = [
    {
      id: "forged",
      seed: "world",
      episodeId: forgedWitness.id,
      unitId: forgedWitness.segments[0].id,
      fingerprint: memoryHash(forgedWitness.segments[0]),
      excerpt: forgedWitness.segments[0].content,
      kind: "speech",
      actorId: "mara",
      perceptions: [{ actorId: "leo", channel: "words", text: forgedWitness.segments[0].content }],
    },
  ];
  assert.throws(() => readAcceptedEpisode(forgedWitness, "world"), /widened the routed perception/);
  const unicode = episode("unicode", "🌅");
  unicode.grounding = [{ ...inputSource(unicode, "🌅"), excerpt: "\uD83C", range: { start: 0, end: 1 } }];
  assert.throws(() => readAcceptedEpisode(unicode, "world"), /excerpt changed/);
  unicode.grounding = [{ ...inputSource(unicode, "🌅"), range: { start: 0, end: 99 } }];
  assert.throws(() => readAcceptedEpisode(unicode, "world"), /excerpt changed/);
});

await runCase("episodes/shared-followup", async () => {
  const first = episode("fair", "Would you like to visit the fair?", "Yes, I have been looking forward to it.");
  let history = appendEpisode(emptyEpisodes(), first, "world");
  for (const id of ["leo-one", "leo-two"]) {
    const other = episode(id, "How is the garden?", "The beans are growing well.");
    other.actors = other.actors.map((actor) => (actor.id === "mara" ? { ...actor, id: "leo" } : actor));
    other.segments[0] = { ...other.segments[0], speakerId: "leo", name: "Leo", heardBy: ["leo", "player"] };
    history = appendEpisode(history, other, "world");
  }
  const packet = encodeContinuityPages(
    { continuity: emptyContinuity(), episodes: history, worldPlaces: emptyPlaceRegistry() },
    memoryHash("world").slice(0, 32),
  );
  const cold = await decodeContinuityPages(
    packet.manifest,
    memoryHash("world").slice(0, 32),
    "world",
    async (id) => packet.pages.get(id) ?? null,
  );
  const selected = selectEpisodeHistory(cold.value.episodes, cold.value.continuity, [player, mara], "Why?", 1800);
  assert.ok(
    selected.episodes.some((row) => row.id === first.id),
    "intervening player–Leo conversations cannot displace Mara's last shared question and answer",
  );
});

await runCase("episodes/ancestry", () => {
  const a = episode("ancestor", "Rowan taught me chair repair.");
  a.grounding = [inputSource(a, a.privateInput)];
  const b = episode("echo-one", "Remind me.", "You told me Rowan taught you chair repair.");
  b.dependencies[b.segments[0].id] = [episodeUnit(a, "input")];
  const c = episode("echo-two", "And then?", "I still remember the chair repair lesson from Rowan.");
  c.dependencies[c.segments[0].id] = [episodeUnit(b, b.segments[0].id)];
  let history = emptyEpisodes();
  for (const row of [a, b, c]) history = appendEpisode(history, row, "world");
  history = readEpisodes(JSON.parse(JSON.stringify(history)), "world");
  assert.equal(
    history.records[2].dependencies[c.segments[0].id].length,
    1,
    "source graph remains linear rather than duplicating every ancestor",
  );
  const evidence = a.grounding[0];
  const learned = applyContinuityWrite(
    emptyContinuity(),
    { id: "remember", holders: [mara], text: evidence.excerpt, sourceIds: [evidence.id] },
    {
      seed: "world",
      operationId: "remember",
      episodeId: a.id,
      at,
      actors: a.actors,
      sources: [evidence],
      supplied: [],
      protectedRoots: [],
    },
  );
  const root = learned.records[0],
    key = continuityHolderKey(mara),
    target = { id: root.id, recordRevision: root.revision, heads: { [key]: root.heads[key].revision } };
  for (const action of [{ forget: true as const }, { text: "Rowan taught finishing work." }]) {
    const protectedState = protectContinuity(learned, target, [mara], "protect", at, action);
    assert.deepEqual(actorEpisodeView(history.records[2], protectedState, mara, history)?.segments, []);
    assert.deepEqual(gmEpisodeView(history.records[2], protectedState, [mara], history)?.segments, []);
  }
  const missing = episode("missing");
  missing.dependencies[missing.segments[0].id] = ["missing-source"];
  assert.throws(() => appendEpisode(history, missing, "world"), /missing or future/);
  const cycle = episode("cycle");
  cycle.dependencies.input = [episodeUnit(cycle, cycle.segments[0].id)];
  cycle.dependencies[cycle.segments[0].id] = [episodeUnit(cycle, "input")];
  assert.throws(() => appendEpisode(history, cycle, "world"), /cyclic/);
  assert.throws(() => actorEpisodeView(c, learned, mara, emptyEpisodes()), /outside.*scope/);
  assert.throws(
    () => gmEpisodeView({ ...c, privateInput: "Different episode" }, learned, [mara], history),
    /outside.*scope/,
  );
});

await runCase("episodes/private-narration", () => {
  const thought = episode("thought", "Good morning.", "Mara may be worried; privately she hopes the player will stay.");
  thought.segments[0] = { ...thought.segments[0], speakerId: "__venue_scene__", name: "Narration", kind: "narration" };
  const saved = readAcceptedEpisode(thought, "world");
  assert.deepEqual(
    actorEpisodeView(saved, emptyContinuity(), player)?.segments,
    [],
    "local narration is not automatically witnessed truth",
  );
  const context = gmEpisodeView(saved, emptyContinuity(), [mara, player])!;
  assert.equal(context.segments[0].gmOnlyText, thought.segments[0].content);
  assert.deepEqual(context.segments[0].perceivedBy, {});
});

await runCase("episodes/self-native-retention", async () => {
  const own = episode("motive", "", "Good morning.");
  const key = continuityHolderKey(mara),
    versionId = "continuity-version-" + memoryHash(["world", own.operationId + ":motive", key]).slice(0, 32);
  const motive = "Sail a boat of my own, choosing the destination myself.";
  const self: ContinuityEvidence = {
    id: "private-motive",
    seed: "world",
    episodeId: own.id,
    unitId: versionId,
    fingerprint: memoryHash([versionId, "desire", motive, key]),
    excerpt: motive,
    kind: "self",
    actorId: "mara",
    perceptions: [],
  };
  const continuity = applyContinuityWrite(
    emptyContinuity(),
    { id: "motive", holders: [mara], class: "desire", text: motive, sourceIds: [self.id] },
    {
      seed: "world",
      operationId: own.operationId,
      episodeId: own.id,
      at,
      actors: own.actors,
      sources: [self],
      supplied: [],
      protectedRoots: [],
    },
  );
  own.continuityVersionIds = [versionId];
  own.grounding = [self];
  const history = appendEpisode(emptyEpisodes(), own, "world");
  assertContinuityRetention(continuity, history);
  const packet = encodeContinuityPages(
    { continuity, episodes: history, worldPlaces: emptyPlaceRegistry() },
    memoryHash("world").slice(0, 32),
  );
  const cold = await decodeContinuityPages(
    packet.manifest,
    memoryHash("world").slice(0, 32),
    "world",
    async (id) => packet.pages.get(id) ?? null,
  );
  assert.equal(cold.value.continuity.versions[0].text, motive);
  assert.equal(
    JSON.stringify(actorEpisodeView(cold.value.episodes.records[0], cold.value.continuity, player)).includes(motive),
    false,
    "an unspoken motive never becomes player knowledge",
  );
  assert.throws(() => assertContinuityRetention(continuity, emptyEpisodes()), /lost its accepted episode/);
  const native = episode("native");
  const receipt: AcceptedEpisode["commandReceipts"][number] = {
    id: "grant",
    kind: "access",
    targetId: "parlor",
    revision: 1,
    text: "Mara grants the player permission to enter the parlor.",
    witnesses: ["mara", "player"],
  };
  native.commandReceipts = [receipt];
  native.grounding = [
    {
      id: "native-source",
      seed: "world",
      episodeId: native.id,
      unitId: "native:" + receipt.id,
      fingerprint: memoryHash(receipt),
      excerpt: receipt.text,
      kind: "native",
      committedReceiptId: receipt.id,
      perceptions: [{ actorId: "mara", channel: "private", text: receipt.text }],
    },
  ];
  readAcceptedEpisode(native, "world");
  assert.throws(() => readAcceptedEpisode({ ...native, commandReceipts: [] }, "world"), /committed receipt/);
  assert.throws(
    () => readAcceptedEpisode({ ...native, commandReceipts: [{ ...receipt, witnesses: [] }] }, "world"),
    /committed receipt/,
  );
  const nonWitness = {
    ...native,
    actors: [...native.actors, { id: "leo", incarnation: "one", zoneId: "hall" }],
    grounding: [{ ...native.grounding[0], actorId: "leo", perceptions: [] }],
  };
  assert.throws(() => readAcceptedEpisode(nonWitness, "world"), /non-witness author/);
  assert.throws(
    () =>
      applyContinuityWrite(
        emptyContinuity(),
        { id: "teach", holders: [leo], text: receipt.text, sourceIds: [nonWitness.grounding[0].id] },
        {
          seed: "world",
          operationId: "teach",
          episodeId: native.id,
          at,
          actors: nonWitness.actors,
          sources: nonWitness.grounding,
          supplied: [],
          protectedRoots: [],
        },
      ),
    /unwitnessed continuity/,
  );
});

await runCase("episodes/independent-spans", async () => {
  const original = episode("two-facts", "Rowan taught chair repair. Delia taught weaving.");
  const sources = [
    inputSource(original, "Rowan taught chair repair."),
    { ...inputSource(original, "Delia taught weaving."), id: "second-fact" },
  ];
  original.grounding = sources;
  let continuity = emptyContinuity();
  for (const [i, source] of sources.entries())
    continuity = applyContinuityWrite(
      continuity,
      { id: "fact-" + i, holders: [mara], text: source.excerpt, sourceIds: [source.id] },
      {
        seed: "world",
        operationId: original.operationId,
        episodeId: original.id,
        at,
        actors: original.actors,
        sources,
        supplied: [],
        protectedRoots: [],
      },
    );
  original.continuityVersionIds = continuity.versions.map((row) => row.id);
  const history = appendEpisode(emptyEpisodes(), original, "world");
  for (const protectedIndex of [0, 1]) {
    const record = continuity.records[protectedIndex],
      key = continuityHolderKey(mara),
      target = { id: record.id, recordRevision: record.revision, heads: { [key]: record.heads[key].revision } };
    const protectedState = protectContinuity(continuity, target, [mara], "forget-" + protectedIndex, at, {
      forget: true,
    });
    const packet = encodeContinuityPages(
      { continuity: protectedState, episodes: history, worldPlaces: emptyPlaceRegistry() },
      memoryHash("world").slice(0, 32),
    );
    const cold = await decodeContinuityPages(
      packet.manifest,
      memoryHash("world").slice(0, 32),
      "world",
      async (id) => packet.pages.get(id) ?? null,
    );
    const blocks = continuityProtectionUnits(
      cold.value.continuity,
      mara,
      episodeSourceGraph(cold.value.episodes.records),
    );
    assert.deepEqual(
      continuityViews(cold.value.continuity, mara, at, blocks).map((row) => row.version.text),
      [sources[1 - protectedIndex].excerpt],
    );
    assert.deepEqual(
      actorEpisodeView(cold.value.episodes.records[0], cold.value.continuity, mara, cold.value.episodes)?.input.map(
        (row) => row.text,
      ),
      [sources[1 - protectedIndex].excerpt],
    );
    assert.deepEqual(
      gmEpisodeView(cold.value.episodes.records[0], cold.value.continuity, [mara], cold.value.episodes)?.gmPrivateInput,
      { withheld: true },
      "either protected span suppresses the whole raw submission",
    );
  }
});

await runCase("episodes/cold-pages-scale", async () => {
  const world = memoryHash("world").slice(0, 32);
  const history = readEpisodes(
    {
      format: 1,
      revision: 1200,
      records: Array.from({ length: 1200 }, (_, i) =>
        episode("episode-" + i, "A question about the fair " + i, "Mara answers with a detailed account. ".repeat(35)),
      ),
    },
    "world",
  );
  const payload = { continuity: emptyContinuity(), episodes: history, worldPlaces: emptyPlaceRegistry() };
  const first = encodeContinuityPages(payload, world),
    pages = new Map(first.pages);
  const cold = await decodeContinuityPages(first.manifest, world, "world", async (id) => pages.get(id) ?? null);
  assert.equal(cold.value.episodes.records.length, 1200);
  assert.equal(cold.value.episodes.records[1199].privateInput, history.records[1199].privateInput);
  const context = selectEpisodeHistory(cold.value.episodes, cold.value.continuity, [mara], "Why?", 8000);
  assert.equal(context.partial, true);
  assert.ok(context.bytes <= 8000 && context.episodes.length > 0 && context.episodes.length < 1200);
  const next = appendEpisode(cold.value.episodes, episode("last"), "world");
  const appended = encodeContinuityPages({ ...cold.value, episodes: next }, world, cold.layout);
  assert.ok(appended.pages.size < 12, "one new exchange appends a bounded page path without repaging the archive");
  for (const [id, page] of appended.pages) pages.set(id, page);
  assert.equal(
    (await decodeContinuityPages(appended.manifest, world, "world", async (id) => pages.get(id) ?? null)).value.episodes
      .records.length,
    1201,
  );
  await assert.rejects(
    decodeContinuityPages(
      first.manifest,
      memoryHash("other").slice(0, 32),
      "world",
      async (id) => pages.get(id) ?? null,
    ),
    /page reference/,
  );
  await assert.rejects(
    decodeContinuityPages(first.manifest, world, "world", async () => null),
    /missing/,
  );
});

console.log(
  "Accepted episodes: private natural chronology, individual perception, protection, cold retention and bounded local context passed without providers.",
);
