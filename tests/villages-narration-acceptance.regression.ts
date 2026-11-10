// Test cases: narration-acceptance/atomic-episode, narration-acceptance/important-retention, narration-acceptance/independent-failure, narration-acceptance/lost-ack, narration-acceptance/protection-race, narration-acceptance/conflicting-head, narration-acceptance/combined-source-order, narration-acceptance/frozen-source-scope, narration-acceptance/shared-room-provenance, narration-acceptance/player-movement, narration-acceptance/dropped-movement
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
} from "../packages/villages/src/server/domain/rules/continuity.js";
import {
  episodeSourceGraph,
  readAcceptedEpisode,
} from "../packages/villages/src/server/domain/decoding/episode-codec.js";
import {
  narrationContinuityContext,
  fittedNarrationReadset,
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
    { continuity: f.state.continuity, episodes: f.state.episodes, worldPlaces: f.state.worldPlaces },
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

await runCase("narration-acceptance/lost-ack", () => {
  const f = fixture(),
    publication = f.publication({ segments: f.response(["remember"]), keep: [f.keep] });
  const first = acceptNarrationContinuity(f.state, publication, "submission", later).episode!;
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
      { id: "prior", kind: "npc", targetId: f.id, revision: 1, text: "A remembered old detail.", witnesses: [f.id] },
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
    { id: "prior", kind: "npc", targetId: f.id, revision: 1, text: "An earlier weaving story.", witnesses: [f.id] },
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
    { id: "prior", kind: "npc", targetId: f.id, revision: 1, text: "An earlier weaving story.", witnesses: [f.id] },
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
      kind: "npc",
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
    { continuity: f.state.continuity, episodes: f.state.episodes, worldPlaces: f.state.worldPlaces },
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
