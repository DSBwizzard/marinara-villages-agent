// Test cases: narration-acceptance/atomic-episode, narration-acceptance/important-retention, narration-acceptance/independent-failure, narration-acceptance/anonymous-experience, narration-acceptance/private-relationship-replay, narration-acceptance/lost-ack, narration-acceptance/protection-race, narration-acceptance/conflicting-head, narration-acceptance/combined-source-order, narration-acceptance/frozen-source-scope, narration-acceptance/shared-room-provenance, narration-acceptance/player-movement, narration-acceptance/dropped-movement, narration-acceptance/inherited-private-context, narration-acceptance/inherited-room-context, narration-acceptance/anonymous-metadata
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { establishPlace } from "../packages/villages/src/server/domain/rules/place-discovery.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import {
  continuityHolderKey,
  protectContinuity,
  continuityViews,
  continuityProtectionUnits,
  continuityKnowledge,
  continuitySourceUnit,
  continuityProtectionFingerprint,
} from "../packages/villages/src/server/domain/rules/continuity.js";
import {
  episodeSourceGraph,
  readAcceptedEpisode,
  episodeUnit,
} from "../packages/villages/src/server/domain/decoding/episode-codec.js";
import {
  narrationContinuityContext,
  fittedNarrationReadset,
  narrationProtectionFingerprint,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import {
  acceptNarrationContinuity,
  acceptedNarrationEpisode,
  type NarrationPublication,
} from "../packages/villages/src/server/domain/rules/narration-acceptance.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { retainNativeFact } from "../packages/villages/src/server/domain/rules/native-continuity.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import {
  encodeContinuityPages,
  decodeContinuityPagesSync,
} from "../packages/villages/src/server/adapters/storage/continuity-pages.js";
import { gmEpisodeView, actorEpisodeView } from "../packages/villages/src/server/domain/rules/episodes.js";
import { assertContinuityRetention } from "../packages/villages/src/server/domain/rules/continuity-retention.js";
import { captureContinuityContext } from "../packages/villages/src/server/domain/rules/continuity-context.js";
import { acceptResidentLetter } from "../packages/villages/src/server/domain/rules/mail-delivery.js";

const at = "2026-11-09T12:00:00.000Z",
  later = "2026-11-09T12:01:00.000Z";
function fixture(input = "I think privately that I am nervous. I say, “My mother taught me weaving.”\n  🪑") {
  const state = { ...defaultVillageState(), seed: "world", setupAt: at, foundedAt: at };
  const place = establishPlace(
    state,
    {
      name: "Lantern",
      description: "A restaurant.",
      controllers: ["mara"],
      people: [{ ref: "mara", name: "Mara", characterization: "A reserved host.", role: "Proprietor" }],
      zones: [{ id: "parlor", name: "Parlor", kind: "public", description: "Wooden tables." }],
    },
    "lantern",
    "map",
    "request:place",
    at,
    true,
  );
  const id = Object.keys(state.worldPlaces.npcs)[0];
  const scene = zoneEventScene(
    coerceSession({
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
    }),
    place.location,
  );
  const source = { input: "My mother taught me weaving.", ground: { kind: "spoken", to: [id] } };
  const keep = {
    id: "remember",
    for: [id],
    text: "The player said their mother taught them weaving.",
    source: [source],
  };
  function publication(raw: Record<string, unknown>): NarrationPublication {
    const context = narrationContinuityContext(state, scene, place.location, "operation", input, at);
    const readset = fittedNarrationReadset(
      state,
      context,
      context.parts.flatMap((part) => (part.block.evidenceId ? [part.block.evidenceId] : [])),
    );
    return {
      readset,
      raw,
      responseDigest: memoryHash(raw),
      native: { effects: [], receipts: {}, sources: {}, moves: [], playerMoves: [], admissions: [] },
    };
  }
  return {
    state,
    scene,
    id,
    input,
    keep,
    publication,
    response: (requires: string[] = []) => [
      { kind: "dialogue", speakerId: id, id: "reply", text: "I will remember what you told me.", requires },
    ],
  };
}

await runCase("narration-acceptance/inherited-private-context", () => {
  const f = fixture("Hello."),
    offId = "npc:offstage";
  f.state.worldPlaces.npcs[offId] = { ...structuredClone(f.state.worldPlaces.npcs[f.id]), id: offId, name: "Lena" };
  const off = continuityActor(f.state, offId)!,
    key = continuityHolderKey(off);
  retainNativeFact(
    f.state,
    {
      id: "private-garden",
      kind: "initialization",
      targetId: offId,
      revision: 1,
      text: "Lena privately wants a SECRET GARDEN.",
      witnesses: [offId],
    },
    at,
  );
  const first = f.publication({
      segments: [
        { id: "hint", kind: "narration", text: "A SECRET GARDEN could matter to a future visitor." },
        { id: "words", kind: "dialogue", speakerId: f.id, text: "Welcome." },
      ],
    }),
    own = continuityViews(f.state.continuity, off, at, new Set())[0],
    anchor = continuityKnowledge(own, f.state.seed, first.readset.source.episodeId);
  first.readset.source.historical["h:private"] = anchor;
  first.readset.admission.provenance![key] = [continuitySourceUnit(anchor)];
  first.readset.admission.protectionFingerprint = narrationProtectionFingerprint(f.state, [
    ...first.readset.source.actors,
    first.readset.admission.room!,
    off,
  ]);
  const accepted = acceptNarrationContinuity(f.state, first, "first", later).episode!;
  const context = narrationContinuityContext(
      f.state,
      f.scene,
      first.readset.source.venue,
      "next-operation",
      "Why?",
      later,
    ),
    readset = fittedNarrationReadset(
      f.state,
      context,
      context.parts.flatMap((part) => (part.block.evidenceId ? [part.block.evidenceId] : [])),
    );
  assert.deepEqual(readset.admission.provenance![key], [episodeUnit(accepted, accepted.segments[0].id)]);
  assert(
    !fittedNarrationReadset(f.state, context, []).admission.provenance![key],
    "pruned context has no inherited scope",
  );
  assert(!readset.source.actors.some((actor) => actor.id === offId));
  const next: NarrationPublication = {
    ...first,
    readset,
    raw: {
      segments: [
        { id: "echo", kind: "narration", text: "The SECRET GARDEN remains a distant possibility." },
        { id: "local", kind: "dialogue", speakerId: f.id, text: "Would you like tea?" },
      ],
    },
  };
  const second = acceptNarrationContinuity(f.state, next, "next", later).episode!;
  assert.equal(actorEpisodeView(second, f.state.continuity, off, f.state.episodes), null);
  const root = f.state.continuity.records[0],
    target = { id: root.id, recordRevision: root.revision, heads: { [key]: root.heads[key].revision } },
    holders = readset.source.actors;
  for (const change of [{ forget: true as const }, { text: "Lena prefers a small pond." }]) {
    const changed = protectContinuity(
      f.state.continuity,
      target,
      [off],
      "protect-" + Boolean("forget" in change),
      later,
      change,
    );
    assertContinuityRetention(changed, f.state.episodes);
    const encoded = encodeContinuityPages(
        { continuity: changed, episodes: f.state.episodes, worldPlaces: f.state.worldPlaces, mailbox: f.state.mailbox },
        "a".repeat(32),
      ),
      cold = decodeContinuityPagesSync(
        encoded.manifest,
        "a".repeat(32),
        f.state.seed,
        (id) => encoded.pages.get(id) ?? null,
      ).value;
    for (const ep of cold.episodes.records.slice(1)) {
      const view = gmEpisodeView(ep, cold.continuity, holders, cold.episodes);
      assert(
        !JSON.stringify(view).includes("SECRET GARDEN"),
        "private protection follows two generated exchanges after cold reload",
      );
      assert(
        view!.segments.some((line) => "text" in line),
        "actual local words retain their audience",
      );
    }
    const race = {
      ...f.state,
      continuity: changed,
      episodes: { ...f.state.episodes, records: f.state.episodes.records.slice(0, -1) },
    };
    assert.throws(() => acceptNarrationContinuity(race, next, "next", later), /protection changed/);
  }
  retainNativeFact(
    f.state,
    {
      id: "private-other",
      kind: "initialization",
      targetId: offId,
      revision: 1,
      text: "A separate private concern.",
      witnesses: [offId],
    },
    later,
  );
  const other = f.state.continuity.records.at(-1)!;
  f.state.continuity = protectContinuity(
    f.state.continuity,
    { id: other.id, recordRevision: other.revision, heads: { [key]: other.heads[key].revision } },
    [off],
    "protect-other",
    later,
    { forget: true },
  );
  const constrained = narrationContinuityContext(
    f.state,
    f.scene,
    readset.source.venue,
    "third-operation",
    "Why?",
    later,
  );
  assert(
    constrained.protections.some((row) => row.id === other.id && row.for === offId && row.forgotten),
    "retained offstage scopes receive their other protection constraints before purchase",
  );
});

await runCase("narration-acceptance/anonymous-metadata", () => {
  for (const identify of [false, true]) {
    const f = fixture("What was that? Кафе 🪑");
    f.scene.sceneAttendance!.occupants[0].zoneId = "exterior";
    const publication = f.publication({
      segments: [{ kind: "dialogue", id: "remote", speakerId: f.id, text: "My secret words.", requires: ["listen"] }],
      keep: [
        {
          id: "listen",
          for: ["player"],
          text: "I heard indistinct voices outside.",
          ...(identify ? { about: [f.id] } : {}),
          source: ["remote"],
        },
      ],
    });
    const before = structuredClone(f.state);
    const result = acceptNarrationContinuity(f.state, publication, "submission", later);
    assert.equal(result.held, identify, "anonymous sound cannot identify its hidden speaker through about metadata");
    if (identify) {
      assert.deepEqual(f.state, before, "a required privacy failure holds the whole purchased response");
    } else {
      const source = f.state.continuity.versions[0].sources[0];
      assert.equal(source.perceptions.find((row) => row.actorId === "player")?.channel, "sound-only");
      assert.equal(result.episode!.privateInput, f.input);
    }
  }
});

await runCase("narration-acceptance/atomic-episode", () => {
  const f = fixture(),
    publication = f.publication({ segments: f.response(["remember"]), keep: [f.keep] });
  const result = acceptNarrationContinuity(f.state, publication, "submission", later);
  assert.equal(result.held, false);
  assert.equal(f.state.episodes.records.length, 1);
  assert.equal(f.state.continuity.versions.length, 1);
  assert.equal(result.episode!.privateInput, f.input);
  assert.equal(result.episode!.segments[0].content, "I will remember what you told me.");
  assert(result.episode!.segments.every((row) => row.role === "assistant"));
  assert.deepEqual(
    result.episode!.grounding.filter((row) => row.unitId === "input").map((row) => row.excerpt),
    ["My mother taught me weaving."],
  );
  const encoded = encodeContinuityPages(
    {
      continuity: f.state.continuity,
      episodes: f.state.episodes,
      worldPlaces: f.state.worldPlaces,
      mailbox: f.state.mailbox,
    },
    "a".repeat(32),
  );
  const cold = decodeContinuityPagesSync(
    encoded.manifest,
    "a".repeat(32),
    f.state.seed,
    (id) => encoded.pages.get(id) ?? null,
  ).value;
  assert.equal(cold.episodes.records[0].privateInput, f.input);
  assert.equal(cold.continuity.versions[0].text, f.keep.text);
});

await runCase("narration-acceptance/important-retention", () => {
  const f = fixture(),
    before = structuredClone(f.state);
  const publication = f.publication({
    segments: f.response(["remember"]),
    keep: [{ ...f.keep, text: "x".repeat(2401), independent: true }],
  });
  const result = acceptNarrationContinuity(f.state, publication, "submission", later);
  assert.equal(result.held, true, "an asserted promise cannot silently lose its required Memory");
  assert.deepEqual(f.state, before);
  assert.equal(result.rejected[0].id, "remember");
});

await runCase("narration-acceptance/independent-failure", () => {
  const f = fixture();
  const publication = f.publication({
    segments: f.response(["remember"]),
    keep: [f.keep, { ...f.keep, id: "unrelated", class: "not-a-class", independent: true }],
  });
  const result = acceptNarrationContinuity(f.state, publication, "submission", later);
  assert.equal(result.held, false);
  assert.deepEqual(result.acceptedIds, ["remember"]);
  assert.equal(result.rejected[0].id, "unrelated");
  assert.equal(f.state.continuity.versions.length, 1);
  assert.equal(f.state.episodes.records[0].segments.length, 1);
});

await runCase("narration-acceptance/anonymous-experience", () => {
  for (const variant of ["optional", "required", "named", "witnessed"]) {
    const f = fixture();
    const publication = f.publication({
      segments: [
        {
          ...f.response(variant === "required" ? ["keep-0"] : [])[0],
          text: "Weaving takes real patience.",
        },
      ],
      keep: [
        {
          ...(variant === "named" ? { id: "experience" } : {}),
          for: [f.id, "player"],
          text: "Mara and the player talked about weaving.",
          class: "experience",
          source:
            variant === "witnessed"
              ? f.keep.source
              : ["reply", { input: "I am nervous.", ground: { kind: "private" } }],
        },
      ],
    });
    const before = structuredClone(f.state);
    const result = acceptNarrationContinuity(f.state, publication, "submission", later);
    assert.equal(result.held, variant === "required" || variant === "named");
    if (result.held) {
      assert.deepEqual(f.state, before);
      continue;
    }
    assert.equal(result.episode!.segments[0].content, "Weaving takes real patience.");
    assert.equal(f.state.continuity.versions.length, variant === "witnessed" ? 2 : 0);
    assert.equal(result.rejected.length, variant === "optional" ? 1 : 0);
    if (variant === "optional") {
      assert.match(result.rejected[0].reason, /unwitnessed continuity support/);
      assert.equal(result.episode!.grounding.length, 0);
    }
  }
});

await runCase("narration-acceptance/private-relationship-replay", () => {
  for (const required of [false, true]) {
    const f = fixture();
    f.state.villagers = [
      { characterId: f.id, incarnation: "one", cardSnapshot: { name: "Mara" } },
    ] as typeof f.state.villagers;
    const publication = f.publication({
      segments: [{ ...f.response(required ? ["attitude"] : [])[0], text: "Weaving takes real patience." }],
      keep: [
        {
          id: "attitude",
          for: [f.id, "player"],
          owner: f.id,
          about: ["player"],
          class: "perspective",
          current: true,
          text: "I feel closer to the player after that story.",
          relationship: { impact: "small-positive", answer: "I feel closer to you now." },
          source: [...f.keep.source, "self"],
        },
      ],
    });
    const before = structuredClone(f.state);
    const result = acceptNarrationContinuity(f.state, publication, "submission", later);
    assert.equal(result.held, required, JSON.stringify(result.rejected));
    if (required) {
      assert.deepEqual(f.state, before);
      continue;
    }
    assert.equal(result.episode!.segments[0].content, "Weaving takes real patience.");
    const [version] = f.state.continuity.versions;
    assert.equal(f.state.continuity.versions.length, 1);
    assert.deepEqual(Object.keys(f.state.continuity.records[0].heads), [
      continuityHolderKey(continuityActor(f.state, f.id)!),
    ]);
    assert.equal(version.relationshipScore, 3);
    assert.equal(version.relationshipAnswer, undefined);
    assert.equal(acceptNarrationContinuity(f.state, publication, "submission", later).replayed, true);
    assert.equal(f.state.continuity.versions.length, 1);
  }
});

await runCase("narration-acceptance/lost-ack", () => {
  const f = fixture(),
    publication = f.publication({
      segments: f.response(["remember"]),
      keep: [f.keep, { ...f.keep, id: "unrelated", class: "not-a-class", independent: true }],
    });
  const committed = acceptNarrationContinuity(f.state, publication, "submission", later);
  const first = committed.episode!;
  assert.equal(committed.rejected[0]?.id, "unrelated");
  f.state.episodes.records[0] = readAcceptedEpisode(JSON.parse(JSON.stringify(first)), f.state.seed);
  const holder = continuityActor(f.state, f.id)!,
    root = f.state.continuity.records[0],
    key = continuityHolderKey(holder);
  f.state.continuity = protectContinuity(
    f.state.continuity,
    { id: root.id, recordRevision: root.revision, heads: { [key]: root.heads[key].revision } },
    [holder],
    "correct",
    later,
    { text: "An administrative correction." },
  );
  f.state.worldPlaces.npcs[f.id].disabled = true;
  assert.deepEqual(
    acceptedNarrationEpisode(
      f.state,
      { raw: publication.raw, readset: publication.readset, responseDigest: publication.responseDigest },
      "submission",
    ),
    first,
    "recovery can resolve the committed episode before any native preparation",
  );
  const replay = acceptNarrationContinuity(f.state, publication, "submission", later);
  assert.deepEqual(replay.episode, first);
  assert.deepEqual(replay.rejected, committed.rejected);
  assert.equal(f.state.episodes.records.length, 1);
  assert.equal(f.state.continuity.versions.length, 2, "replay never undoes the later correction");
  assert.throws(
    () =>
      acceptNarrationContinuity(
        f.state,
        { ...publication, raw: { ...publication.raw, keep: [] } },
        "submission",
        later,
      ),
    /identity reused/,
  );
});

await runCase("narration-acceptance/protection-race", () => {
  for (const forget of [true, false]) {
    const f = fixture();
    retainNativeFact(
      f.state,
      {
        id: "prior",
        kind: "initialization",
        targetId: f.id,
        revision: 1,
        text: "A remembered old detail.",
        witnesses: [f.id],
      },
      at,
    );
    const publication = f.publication({
      segments: [{ kind: "dialogue", speakerId: f.id, text: "An ordinary answer without keep." }],
    });
    const holder = continuityActor(f.state, f.id)!,
      key = continuityHolderKey(holder),
      root = f.state.continuity.records[0];
    f.state.continuity = protectContinuity(
      f.state.continuity,
      { id: root.id, recordRevision: root.revision, heads: { [key]: root.heads[key].revision } },
      [holder],
      "admin",
      later,
      forget ? { forget: true } : { text: "The corrected detail." },
    );
    const before = structuredClone(f.state);
    assert.throws(() => acceptNarrationContinuity(f.state, publication, "submission", later), /protection changed/);
    assert.deepEqual(f.state, before, "even no-keep prose is held at the fresh protection boundary");
  }
});

await runCase("narration-acceptance/conflicting-head", () => {
  const f = fixture();
  retainNativeFact(
    f.state,
    {
      id: "prior",
      kind: "initialization",
      targetId: f.id,
      revision: 1,
      text: "An earlier weaving story.",
      witnesses: [f.id],
    },
    at,
  );
  const root = f.state.continuity.records[0];
  const publication = f.publication({
    segments: f.response(["remember"]),
    keep: [
      { ...f.keep, replace: root.id },
      { ...f.keep, id: "second", replace: root.id, text: "An unrelated alternative version.", independent: true },
    ],
  });
  const result = acceptNarrationContinuity(f.state, publication, "submission", later);
  assert.equal(result.held, false);
  assert.deepEqual(result.acceptedIds, ["remember"]);
  assert.equal(result.rejected[0].id, "second");
  assert.equal(result.episode!.continuityVersionIds.length, 1);
  assert.equal(f.state.continuity.versions.at(-1)!.text, f.keep.text);
});

await runCase("narration-acceptance/combined-source-order", () => {
  for (const independent of [true, false]) {
    const f = fixture();
    const publication = f.publication({
      segments: [
        { kind: "dialogue", id: "first", speakerId: f.id, text: "I understand." },
        { kind: "dialogue", id: "last", speakerId: f.id, text: "Thank you for telling me." },
      ],
      keep: [
        {
          id: "earlier",
          for: ["player"],
          text: "I felt privately nervous.",
          class: "perspective",
          ...(independent ? { independent: true } : {}),
          source: [
            { input: "I think privately that I am nervous.", ground: { kind: "private", at: { after: "last" } } },
          ],
        },
        {
          ...f.keep,
          source: [
            { input: "My mother taught me weaving.", ground: { kind: "spoken", to: [f.id], at: { before: "first" } } },
          ],
        },
      ],
    });
    const before = structuredClone(f.state),
      result = acceptNarrationContinuity(f.state, publication, "submission", later);
    assert.equal(result.held, !independent);
    if (independent) {
      assert.deepEqual(result.acceptedIds, ["remember"]);
      assert.equal(
        result.rejected[0].id,
        "earlier",
        "an independent conflicting addition cannot displace the required valid effect",
      );
      assert.match(result.rejected[0].reason, /source order/);
    } else assert.deepEqual(f.state, before);
  }
});

await runCase("narration-acceptance/frozen-source-scope", () => {
  const f = fixture();
  retainNativeFact(
    f.state,
    {
      id: "prior",
      kind: "initialization",
      targetId: f.id,
      revision: 1,
      text: "An earlier weaving story.",
      witnesses: [f.id],
    },
    at,
  );
  const publication = f.publication({ segments: f.response(["remember"]), keep: [{ ...f.keep, source: ["h:extra"] }] });
  const actual = Object.values(publication.readset.source.historical)[0];
  assert(actual);
  const injected = {
    ...publication,
    source: {
      ...publication.readset.source,
      historical: { ...publication.readset.source.historical, "h:extra": actual },
    },
  };
  const result = acceptNarrationContinuity(f.state, injected, "submission", later);
  assert.equal(result.held, true, "a second source context cannot widen the fitted alias bag");
  assert.match(result.rejected[0].reason, /not supplied/);
});

await runCase("narration-acceptance/shared-room-provenance", () => {
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
      text: "Mara described a weaving preference.",
      witnesses: [f.id],
    },
    at,
  );
  const root = f.state.continuity.records[0];
  const publication = f.publication({
    segments: [{ kind: "narration", text: "The renovated room has woven blue panels.", requires: ["description"] }],
    commands: [{ id: "native-room" }],
    keep: [
      {
        id: "description",
        for: "room",
        text: "Woven blue panels line the walls.",
        knownBy: [f.id],
        source: ["native:native-room"],
      },
    ],
  });
  const room = publication.readset.admission.room!;
  publication.native.effects = [{ id: "native-room", requires: [] }];
  publication.native.receipts = {
    "native-room": {
      id: "native-structure-receipt",
      kind: "structure",
      targetId: JSON.stringify([room.placeId, room.zoneId]),
      revision: 1,
      text: "The validated Renovation installed woven blue panels.",
      witnesses: [f.id],
      observedBy: [f.id],
    },
  };
  const result = acceptNarrationContinuity(f.state, publication, "submission", later);
  assert.equal(result.held, false);
  const roomVersion = f.state.continuity.versions.at(-1)!;
  const widened = structuredClone(result.episode!);
  widened.commandReceipts[0].observedBy = [];
  for (const source of widened.grounding.filter((source) => source.kind === "native"))
    source.fingerprint = memoryHash(widened.commandReceipts[0]);
  assert.throws(
    () => readAcceptedEpisode(widened, f.state.seed),
    /widened its committed witnesses/,
    "a notification never becomes sight without code-recorded observation",
  );
  assert(
    result.episode!.holderDependencies![key]["version:" + roomVersion.id].length > 1,
    "each actual observer owns its fitted private provenance even when explicit support is an independent native receipt",
  );
  f.state.continuity = protectContinuity(
    f.state.continuity,
    { id: root.id, recordRevision: root.revision, heads: { [key]: root.heads[key].revision } },
    [holder],
    "forget",
    later,
    { forget: true },
  );
  const encoded = encodeContinuityPages(
    {
      continuity: f.state.continuity,
      episodes: f.state.episodes,
      worldPlaces: f.state.worldPlaces,
      mailbox: f.state.mailbox,
    },
    "a".repeat(32),
  );
  const cold = decodeContinuityPagesSync(
    encoded.manifest,
    "a".repeat(32),
    f.state.seed,
    (id) => encoded.pages.get(id) ?? null,
  ).value;
  const actorViews = continuityViews(
    cold.continuity,
    holder,
    later,
    continuityProtectionUnits(cold.continuity, holder, episodeSourceGraph(cold.episodes.records, holder)),
  );
  assert(!actorViews.some((view) => view.version.id === roomVersion.id));
  const roomViews = continuityViews(
    cold.continuity,
    room,
    later,
    continuityProtectionUnits(cold.continuity, room, episodeSourceGraph(cold.episodes.records, room)),
  );
  assert.equal(
    roomViews[0].version.text,
    "Woven blue panels line the walls.",
    "Mara's Forget never rewrites authoritative room truth",
  );
});

function walkingFixture() {
  const f = fixture("I leave the parlor for the exterior and say, “My mother taught me weaving.”");
  const leo = { ...f.state.worldPlaces.npcs[f.id], id: "npc:leo", name: "Leo", label: "Leo" };
  f.state.worldPlaces.npcs[leo.id] = leo;
  f.scene.sceneAttendance!.occupants.push({ characterId: leo.id, name: "Leo", doing: "Waiting", zoneId: "exterior" });
  return { ...f, leo };
}

await runCase("narration-acceptance/player-movement", () => {
  for (const afterMove of [true, false]) {
    const f = walkingFixture(),
      recipient = afterMove ? f.leo.id : f.id;
    const publication = f.publication({
      segments: [
        {
          kind: "narration",
          id: "walk",
          text: "You step outside and tell the waiting person about weaving.",
          requires: ["walk"],
        },
      ],
      commands: [{ id: "walk" }],
      keep: [
        {
          ...f.keep,
          for: [recipient],
          source: [
            {
              input: "My mother taught me weaving.",
              ground: { kind: "spoken", to: [recipient], at: { after: "walk" } },
            },
          ],
        },
      ],
    });
    publication.native.effects = [{ id: "walk", requires: [] }];
    publication.native.receipts = {
      walk: {
        id: "walk-receipt",
        kind: "movement",
        targetId: "exterior",
        revision: 1,
        text: "The player moves outside.",
        witnesses: ["player"],
        movement: {
          actorId: "player",
          from: publication.readset.source.scene.zoneId!,
          zoneId: "exterior",
          segment: 0,
          path: [publication.readset.source.scene.zoneId!, "exterior"],
          spaceClass: "other",
          area: "outside",
          privateOwnerId: "",
        },
      },
    };
    publication.native.playerMoves = [{ effectId: "walk", zoneId: "exterior", segment: 0 }];
    publication.native.sceneEffects = [{ effectId: "walk", contactEndedIds: [] }];
    const before = structuredClone(f.state),
      result = acceptNarrationContinuity(f.state, publication, "submission", later);
    assert.equal(result.held, !afterMove);
    if (afterMove) {
      const source = result.episode!.grounding.find((source) => source.unitId === "input")!;
      assert.equal(source.positions!.player, "exterior");
      assert.equal(source.perceptions[0].actorId, f.leo.id);
      assert(
        !result.episode!.segments[0].heardBy.includes(f.id),
        "the same final position timeline drives prose routing and retained input evidence",
      );
    } else assert.deepEqual(f.state, before, "a former room's listener cannot hear post-movement input");
  }
});

await runCase("narration-acceptance/inherited-room-context", () => {
  const f = fixture("Hello."),
    room = { kind: "room" as const, placeId: "former-place", zoneId: "parlor" },
    key = continuityHolderKey(room);
  for (const [id, text] of [
    ["cup", "A blue cup stands on the shelf."],
    ["other", "SECRET RED BENCH"],
  ])
    retainNativeFact(
      f.state,
      {
        id,
        kind: "structure",
        targetId: JSON.stringify([room.placeId, room.zoneId]),
        revision: 1,
        text,
        witnesses: [],
      },
      at,
      { room },
    );
  const other = f.state.continuity.records.at(-1)!;
  f.state.continuity = protectContinuity(
    f.state.continuity,
    { id: other.id, recordRevision: other.revision, heads: { [key]: other.heads[key].revision } },
    [room],
    "correct-unrelated",
    at,
    { text: "PRIVATE GREEN CABINET" },
  );
  const cup = f.state.continuity.records[0],
    capture = captureContinuityContext(f.state, ["player", f.id], "blue cup", at);
  acceptResidentLetter(
    f.state,
    capture,
    { id: "room-note", at, from: continuityActor(f.state, f.id)!, to: continuityActor(f.state, "player")! },
    "The blue cup is on the shelf.",
    "room-note",
    { keep: [], requires: [] },
    memoryHash("existing letter"),
    later,
    {
      holder: room,
      provenance: [JSON.stringify(["version", cup.heads[key].versionId])],
      fingerprint: continuityProtectionFingerprint(f.state.continuity, [room]),
      protectedRoots: [other.id],
    },
  );
  const pub = f.publication({
    segments: [{ id: "echo", kind: "narration", text: "A sketch of the blue cup on its shelf catches your eye." }],
    keep: [
      {
        for: ["player"],
        text: "The player saw a sketch of the blue cup.",
        source: [{ segment: "echo", perceive: { kind: "seen", by: ["player"] } }],
        protection: { roots: [other.id], disposition: "clear" },
      },
    ],
  });
  assert(pub.readset.admission.provenance![key]?.length, "the Scene really fits remote-room-derived history");
  assert.notEqual(pub.readset.admission.room!.placeId, room.placeId);
  const context = narrationContinuityContext(f.state, f.scene, pub.readset.source.venue, "next", "Hello.", at),
    markers = JSON.stringify(context.roomReferences);
  assert(markers.includes(other.id));
  assert(
    !markers.includes("SECRET RED BENCH") && !markers.includes("PRIVATE GREEN CABINET"),
    "opaque Room scopes never fetch remote descriptions or correction text",
  );
  const result = acceptNarrationContinuity(f.state, pub, "room-descendant", later);
  assert(!result.held, JSON.stringify(result));
  const second = result.episode!;
  const current = f.state.continuity.records.find((row) => row.id === cup.id)!;
  f.state.continuity = protectContinuity(
    f.state.continuity,
    { id: current.id, recordRevision: current.revision, heads: { [key]: current.heads[key].revision } },
    [room],
    "correct-cup",
    later,
    { text: "An empty shelf." },
  );
  const encoded = encodeContinuityPages(
      {
        continuity: f.state.continuity,
        episodes: f.state.episodes,
        worldPlaces: f.state.worldPlaces,
        mailbox: f.state.mailbox,
      },
      "a".repeat(32),
    ),
    cold = decodeContinuityPagesSync(
      encoded.manifest,
      "a".repeat(32),
      f.state.seed,
      (id) => encoded.pages.get(id) ?? null,
    ).value;
  assert(
    !JSON.stringify(gmEpisodeView(second, cold.continuity, pub.readset.source.actors, cold.episodes)).includes(
      "blue cup",
    ),
    "Room protection also filters player-perceived Scene text after reload",
  );
  assert(
    actorEpisodeView(
      second,
      cold.continuity,
      continuityActor(f.state, "player")!,
      cold.episodes,
    )?.segments[0].text.includes("blue cup"),
  );
});

await runCase("narration-acceptance/dropped-movement", () => {
  const f = walkingFixture();
  const publication = f.publication({
    segments: [{ kind: "narration", id: "walk", text: "You step outside." }],
    commands: [{ id: "walk", independent: true, requires: ["invalid"] }],
    keep: [{ ...f.keep, id: "invalid", text: "x".repeat(2401), independent: true }],
  });
  publication.native.effects = [{ id: "walk", independent: true, requires: ["invalid"] }];
  publication.native.playerMoves = [{ effectId: "walk", zoneId: "exterior", segment: 0 }];
  const before = structuredClone(f.state),
    result = acceptNarrationContinuity(f.state, publication, "submission", later);
  assert.equal(
    result.held,
    true,
    "a routed movement cannot be dropped while its resulting fiction or witnesses remain accepted",
  );
  assert.deepEqual(f.state, before);
});
