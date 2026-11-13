// Test cases: npc-admission/identity, npc-admission/references, npc-admission/existing, npc-admission/fences, npc-admission/native, npc-admission/returning, npc-admission/late-arrival, npc-admission/authority, npc-admission/moving-arrival, npc-admission/unused-context
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { establishPlace } from "../packages/villages/src/server/domain/rules/place-discovery.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import {
  prepareNpcAdmission,
  bindNpcReferences,
  fenceIntroductionWitnesses,
} from "../packages/villages/src/server/domain/rules/npc-participation.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import {
  narrationContinuityContext,
  fittedNarrationReadset,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import { acceptNarration } from "../packages/villages/src/server/domain/rules/narration-native.js";
import { applyAcceptedSceneDelta } from "../packages/villages/src/server/domain/rules/scene-delta.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import {
  continuityViews,
  continuityHolderKey,
  protectContinuity,
} from "../packages/villages/src/server/domain/rules/continuity.js";
import { retainNativeFact } from "../packages/villages/src/server/domain/rules/native-continuity.js";
import { actorEpisodeView, gmEpisodeView } from "../packages/villages/src/server/domain/rules/episodes.js";
import {
  encodeContinuityPages,
  decodeContinuityPagesSync,
} from "../packages/villages/src/server/adapters/storage/continuity-pages.js";
import { readAcceptedEpisode } from "../packages/villages/src/server/domain/decoding/episode-codec.js";
import { initializeVenueAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
const at = "2026-11-10T08:00:00.000Z";
function fixture() {
  const state = { ...defaultVillageState(), seed: "npc-world", setupAt: at, foundedAt: at };
  const place = establishPlace(
    state,
    {
      name: "Cafe",
      description: "A cafe.",
      people: [{ ref: "mara", name: "Mara", characterization: "A private and careful host." }],
      zones: [{ id: "parlor", name: "Parlor", kind: "public", description: "Tables." }],
    },
    "cafe",
    "map",
    "found",
    at,
    true,
  );
  const existing = Object.values(state.worldPlaces.npcs)[0],
    scene = coerceSession({
      version: 5,
      id: "npc-scene",
      villageSeed: state.seed,
      placeId: place.id,
      placeName: place.location.name,
      zoneId: "parlor",
      status: "active",
      sceneRevision: 1,
      startedAt: at,
      lastActivityAt: at,
      activeIds: [],
      participants: [],
      sceneAttendance: { capturedAt: at, layout: captureSceneLayout(place.location), occupants: [] },
    });
  scene.contactGeneration = zoneEventScene(scene, place.location).contactGeneration;
  const request = {
    localKey: "new:visitor",
    name: "Visitor",
    label: "Traveler",
    characterization: "A cautious traveler with a private concern.",
  };
  const prepare = (key = "npc-operation") =>
    prepareNpcAdmission(state, scene, request, key, 1, "parlor", "  A traveler steps inside. 🌼  ");
  const venue = place.location;
  const publication = (raw: Record<string, unknown>, input = "I privately worry. Hello.", operation = "native-npc") => {
    const context = narrationContinuityContext(state, zoneEventScene(scene, venue), venue, operation, input, at);
    return {
      raw,
      readset: fittedNarrationReadset(
        state,
        context,
        context.parts.map((part) => part.block.evidenceId!),
      ),
      responseDigest: memoryHash(raw),
    };
  };
  return { state, scene, venue, existing, request, prepare, publication };
}
const rawArrival = (existingId?: string): any => ({
  segments: [
    { id: "arrive", kind: "narration", text: "  A traveler steps inside. 🌼  ", requires: ["admit"] },
    { id: "hello", kind: "dialogue", speakerId: "new:visitor", text: "Hello. I hope to see the garden." },
  ],
  commands: [
    {
      id: "admit",
      type: "npc.admit",
      at: "arrive",
      localKey: "new:visitor",
      ...(existingId
        ? { existingId }
        : { name: "Visitor", label: "Traveler", characterization: "A cautious traveler with a private concern." }),
      source: [{ segment: "arrive", perceive: { kind: "seen", by: ["player"] } }],
    },
  ],
});
await runCase("npc-admission/native", () => {
  const f = fixture(),
    raw = rawArrival(),
    publication = f.publication(raw),
    before = memoryHash(raw);
  raw.keep = [
    {
      id: "own",
      for: ["new:visitor"],
      owner: "new:visitor",
      class: "desire",
      text: "I hope to visit the garden.",
      source: ["self"],
    },
  ];
  publication.responseDigest = memoryHash(raw);
  const result = acceptNarration(f.state, publication, "turn", at);
  assert.equal(result.held, false, JSON.stringify(result.rejected));
  const ep = result.episode!,
    receipt = ep.commandReceipts[0],
    id = receipt.targetId;
  assert.equal(receipt.kind, "npc");
  assert.equal(receipt.admission!.npc.name, "Visitor");
  assert.equal(ep.segments[1].speakerId, id);
  assert.equal(ep.segments[0].content, "  A traveler steps inside. 🌼  ");
  assert(ep.segments[0].physicalIdsAfter?.includes(id));
  assert.equal(raw.segments[1].speakerId, "new:visitor");
  assert.equal(raw.segments[0].text, "  A traveler steps inside. 🌼  ");
  assert.notEqual(memoryHash(raw), before, "only the test's explicit keep addition changed raw");
  assert.equal(
    continuityViews(f.state.continuity, continuityActor(f.state, id)!, at, new Set())[0].version.text,
    "I hope to visit the garden.",
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
      (key) => encoded.pages.get(key) ?? null,
    ).value;
  applyAcceptedSceneDelta(f.scene, cold.episodes.records.at(-1)!);
  assert(f.scene.activeIds.includes(id));
  assert(!f.scene.pendingNpcAdmissions?.length);
  const next = {
    segments: [{ kind: "dialogue", speakerId: id, text: "I heard your welcome." }],
    keep: [
      {
        for: [id],
        text: "The Player welcomed me.",
        source: [{ input: "Welcome", ground: { kind: "spoken", to: [id] } }],
      },
    ],
  };
  const nextResult = acceptNarration(f.state, f.publication(next, "Welcome", "second-npc"), "next", at);
  assert.equal(nextResult.held, false, JSON.stringify(nextResult.rejected));
  const fresh = coerceSession({
      ...structuredClone(f.scene),
      id: "another-scene",
      activeIds: [],
      participants: [],
      sceneAttendance: { capturedAt: at, layout: captureSceneLayout(f.venue), occupants: [] },
    }),
    returnContext = narrationContinuityContext(
      f.state,
      zoneEventScene(fresh, f.venue),
      f.venue,
      "return-context",
      "Why?",
      at,
    );
  assert(returnContext.npcCandidates.some((row) => row.npc.id === id));
  assert(!returnContext.actors.some((actor) => actor.id === id));
  assert(
    returnContext.parts.some((part) => part.block.text.includes("I heard your welcome.")),
    "returning candidates retain their last ordinary conversation without old Scene storage",
  );
  f.state.worldPlaces.npcs[id].disabled = true;
  assert(
    acceptNarration(f.state, publication, "turn", at).replayed,
    "committed replay precedes changed identity checks",
  );
  const forged = structuredClone(ep);
  forged.commandReceipts[0].admission!.zoneId = "elsewhere";
  assert.throws(() => readAcceptedEpisode(forged, f.state.seed), /NPC admission/);
});
await runCase("npc-admission/moving-arrival", () => {
  for (const dropped of [false, true]) {
    const f = fixture(),
      parlor = f.venue.zones!.find((zone) => zone.id === "parlor")!;
    parlor.connectedTo = [...(parlor.connectedTo ?? []), "garden"];
    f.venue.zones!.push({
      ...structuredClone(parlor),
      id: "garden",
      name: "Garden",
      description: "Flowers.",
      connectedTo: ["parlor"],
    });
    initializeVenueAccess(f.venue);
    f.scene.sceneAttendance!.layout = captureSceneLayout(f.venue);
    const raw = rawArrival(),
      input = "I walk to the garden.";
    raw.segments[0].text = dropped ? "A traveler joins you." : "You walk into the garden as a traveler arrives.";
    if (!dropped) raw.segments[0].requires.push("move");
    raw.commands.push({
      id: "move",
      type: "move",
      who: "player",
      to: "garden",
      at: "arrive",
      ...(dropped ? { independent: true } : {}),
      source: [
        { input, ground: dropped ? { kind: "private", at: "start" } : { kind: "visible-action", to: [], at: "start" } },
        { segment: "arrive", perceive: { kind: "seen", by: ["player"] } },
      ],
    });
    const result = acceptNarration(f.state, f.publication(raw, input), "moving-arrival", at);
    assert.equal(result.held, false, JSON.stringify(result.rejected));
    const ep = result.episode!,
      arrival = ep.commandReceipts.find((receipt) => receipt.kind === "npc")!;
    const destination = dropped ? "parlor" : "garden";
    assert.equal(arrival.admission!.zoneId, destination);
    assert.equal(
      ep.commandReceipts.some((receipt) => receipt.kind === "movement"),
      !dropped,
    );
    assert.deepEqual(ep.segments[0].physicalIdsAfter, [arrival.targetId]);
    applyAcceptedSceneDelta(f.scene, ep);
    assert.equal(f.scene.zoneId, destination);
    assert(f.scene.activeIds.includes(arrival.targetId));
    assert.equal(
      f.scene.sceneAttendance!.occupants.find((row) => row.characterId === arrival.targetId)!.zoneId,
      destination,
    );
  }
});
await runCase("npc-admission/returning", () => {
  const f = fixture(),
    holder = continuityActor(f.state, f.existing.id)!,
    key = continuityHolderKey(holder);
  retainNativeFact(
    f.state,
    {
      id: "private-plan",
      kind: "initialization",
      targetId: holder.id,
      revision: 1,
      text: "Mara privately wants to tend a garden.",
      witnesses: [holder.id],
    },
    at,
    { class: "desire", owner: holder, current: true },
  );
  const root = f.state.continuity.records[0];
  f.state.continuity = protectContinuity(
    f.state.continuity,
    { id: root.id, recordRevision: root.revision, heads: { [key]: root.heads[key].revision } },
    [holder],
    "correct",
    at,
    { text: "Mara wants to restore a pond." },
  );
  const raw = rawArrival(f.existing.id),
    publication = f.publication(raw);
  assert.equal(publication.readset.npcCandidates[0].npc.id, f.existing.id);
  assert(!publication.readset.source.actors.some((row) => row.id === f.existing.id));
  assert.equal(publication.readset.offered.length, 0);
  const context = narrationContinuityContext(
      f.state,
      zoneEventScene(f.scene, f.venue),
      f.venue,
      "context",
      "Tell me about restoring the pond.",
      at,
    ),
    text = context.parts.map((part) => part.block.text).join("\n");
  assert(text.includes("Mara wants to restore a pond."));
  assert(!text.includes("Mara privately wants to tend a garden."));
  assert(context.protections.some((row) => row.for === holder.id && row.corrected === "Mara wants to restore a pond."));
  const result = acceptNarration(f.state, publication, "return", at);
  assert.equal(result.held, false, JSON.stringify(result.rejected));
  assert.equal(result.episode!.commandReceipts[0].targetId, f.existing.id);
  assert.equal(Object.keys(f.state.worldPlaces.npcs).length, 1);
  const race = fixture(),
    pending = race.publication(rawArrival(race.existing.id));
  race.existing.revision++;
  const hash = memoryHash(race.state);
  assert.throws(() => acceptNarration(race.state, pending, "stale", at), /fitted identity/);
  assert.equal(memoryHash(race.state), hash);
});
await runCase("npc-admission/unused-context", () => {
  const f = fixture(),
    holder = continuityActor(f.state, f.existing.id)!,
    key = continuityHolderKey(holder);
  retainNativeFact(
    f.state,
    {
      id: "private-plan",
      kind: "initialization",
      targetId: holder.id,
      revision: 1,
      text: "Mara wants a SECRET GARDEN.",
      witnesses: [holder.id],
    },
    at,
    { class: "desire", owner: holder, current: true },
  );
  const input = "I privately wonder whether the visitor plans a garden.",
    raw = { segments: [{ kind: "narration", text: "A SECRET GARDEN may matter to a future visitor." }] },
    publication = f.publication(raw, input);
  assert(publication.readset.npcCandidates[0].offered.length > 0);
  assert.deepEqual(publication.readset.offered, []);
  const result = acceptNarration(f.state, publication, "unused", at);
  assert.equal(result.held, false, JSON.stringify(result.rejected));
  const ep = result.episode!;
  assert(!ep.actors.some((actor) => actor.id === holder.id));
  assert.deepEqual(ep.offered, []);
  assert.equal(actorEpisodeView(ep, f.state.continuity, holder, f.state.episodes), null);
  const pending = f.publication(raw, input, "unused-race"),
    root = f.state.continuity.records[0];
  f.state.continuity = protectContinuity(
    f.state.continuity,
    { id: root.id, recordRevision: root.revision, heads: { [key]: root.heads[key].revision } },
    [holder],
    "forget",
    at,
    { forget: true },
  );
  const before = memoryHash(f.state);
  assert.throws(() => acceptNarration(f.state, pending, "race", at), /protection changed/);
  assert.equal(memoryHash(f.state), before);
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
    !JSON.stringify(
      gmEpisodeView(
        cold.episodes.records.at(-1)!,
        cold.continuity,
        [continuityActor(f.state, "player")!],
        cold.episodes,
      ),
    ).includes("SECRET GARDEN"),
  );
});
await runCase("npc-admission/late-arrival", () => {
  const f = fixture(),
    raw = rawArrival();
  raw.segments.unshift({ id: "earlier", kind: "narration", text: "An earlier private moment." });
  const result = acceptNarration(f.state, f.publication(raw), "late", at);
  assert.equal(result.held, false, JSON.stringify(result.rejected));
  const ep = result.episode!,
    id = ep.commandReceipts[0].targetId,
    holder = continuityActor(f.state, id)!;
  assert(!ep.segments[0].heardBy.includes(id));
  for (const mutate of [
    (copy: typeof ep) => copy.segments[0].heardBy.push(id),
    (copy: typeof ep) => (copy.segments[0].physicalIdsAfter = [id]),
    (copy: typeof ep) => {
      copy.segments[0].speakerId = id;
      copy.segments[0].kind = "dialogue";
    },
    (copy: typeof ep) =>
      copy.grounding.push({
        id: "forged-input",
        seed: ep.seed,
        episodeId: ep.id,
        unitId: "input",
        fingerprint: memoryHash(ep.privateInput),
        kind: "speech",
        actorId: "player",
        excerpt: "Hello.",
        range: { start: ep.privateInput.indexOf("Hello."), end: ep.privateInput.indexOf("Hello.") + 6 },
        moment: { index: 0, side: "before" },
        perceptions: [{ actorId: id, channel: "words", text: "Hello." }],
      }),
  ]) {
    const copy = structuredClone(ep);
    mutate(copy);
    assert.throws(
      () => readAcceptedEpisode(copy, f.state.seed),
      /before its admitted introduction|precedes its admitted introduction/,
    );
  }
  assert(
    !actorEpisodeView(ep, f.state.continuity, holder, f.state.episodes)!.segments.some(
      (line) => line.id === ep.segments[0].id,
    ),
  );
  for (const source of [
    { input: "Hello.", ground: { kind: "spoken", to: ["new:visitor"] } },
    { segment: "earlier", perceive: { kind: "seen", by: ["new:visitor"] } },
  ]) {
    const other = fixture(),
      copy = structuredClone(raw);
    copy.keep = [{ for: ["new:visitor"], text: "I learned an earlier secret.", source: [source] }];
    const before = memoryHash(other.state),
      held = acceptNarration(other.state, other.publication(copy), "invalid", at);
    assert(held.held);
    assert.equal(memoryHash(other.state), before);
  }
  const after = fixture(),
    copy = rawArrival();
  copy.keep = [
    {
      for: ["new:visitor"],
      text: "The Player said hello after I entered.",
      source: [{ input: "Hello.", ground: { kind: "spoken", to: ["new:visitor"], at: { after: "arrive" } } }],
    },
  ];
  assert.equal(acceptNarration(after.state, after.publication(copy), "after", at).held, false);
});
await runCase("npc-admission/authority", () => {
  for (const variant of ["unseen", "premature", "role", "duplicate"]) {
    const f = fixture(),
      raw = rawArrival();
    if (variant === "unseen")
      raw.commands[0].source = [{ segment: "arrive", perceive: { kind: "private", by: ["new:visitor"] } }];
    if (variant === "premature")
      raw.segments.unshift({ kind: "dialogue", speakerId: "new:visitor", text: "I am not here yet." });
    if (variant === "role") raw.commands[0].role = "builder";
    if (variant === "duplicate") raw.commands.push({ ...raw.commands[0], id: "another" });
    const before = memoryHash(f.state);
    let rejected = false;
    try {
      rejected = acceptNarration(f.state, f.publication(raw), variant, at).held;
    } catch (error) {
      assert(error instanceof Error);
      rejected = true;
    }
    assert(rejected, "invalid NPC authority must hold or reject");
    assert.equal(memoryHash(f.state), before);
  }
});
await runCase("npc-admission/identity", () => {
  const f = fixture(),
    before = memoryHash(f.state),
    first = f.prepare();
  assert.deepEqual(first, f.prepare());
  assert.notEqual(first.npc.id, f.prepare("another-operation").npc.id);
  assert(first.npc.id.startsWith("npc:"));
  assert.equal(first.source, "  A traveler steps inside. 🌼  ");
  assert.equal(first.npc.label, "Traveler");
  assert.equal(memoryHash(f.state), before, "provisional metadata never changes authority");
  assert.throws(
    () => prepareNpcAdmission(f.state, f.scene, { ...f.request, name: " " }, "operation", 0, "parlor", "Observed"),
    /identity/,
  );
  assert.throws(
    () => prepareNpcAdmission(f.state, f.scene, f.request, "operation", 0, "missing", "Observed"),
    /captured Zone/,
  );
  assert.throws(
    () => prepareNpcAdmission(f.state, f.scene, f.request, "operation", 0, "parlor", " \n "),
    /introduction/,
  );
});
await runCase("npc-admission/references", () => {
  const f = fixture(),
    admission = f.prepare(),
    exact = "  I say new:visitor. 我说 🌼\n ";
  const raw = {
    segments: [
      {
        id: "said",
        kind: "dialogue",
        speakerId: "new:visitor",
        targetId: "player",
        text: exact,
        staging: [{ characterId: "new:visitor", look: { target: "villager", characterId: "new:visitor" } }],
      },
    ],
    keep: [
      {
        for: ["new:visitor"],
        owner: "new:visitor",
        about: ["new:visitor"],
        text: exact,
        source: [
          { input: exact, ground: { kind: "spoken", to: ["new:visitor"] } },
          { segment: "said", perceive: { kind: "seen", by: ["new:visitor"] } },
        ],
      },
    ],
    commands: [
      { type: "npc.admit", localKey: "new:visitor", name: exact },
      {
        type: "permission.grant",
        by: "new:visitor",
        visitor: "new:visitor",
        management: { managerIds: ["new:visitor"] },
      },
    ],
  };
  const before = memoryHash(raw),
    bound = bindNpcReferences(raw, [admission]) as any,
    id = admission.npc.id;
  assert.equal(memoryHash(raw), before);
  assert.equal(bound.segments[0].speakerId, id);
  assert.equal(bound.segments[0].text, exact);
  assert.deepEqual(bound.keep[0].for, [id]);
  assert.equal(bound.keep[0].owner, id);
  assert.equal(bound.keep[0].text, exact);
  assert.equal(bound.keep[0].source[0].input, exact);
  assert.deepEqual(bound.keep[0].source[0].ground.to, [id]);
  assert.deepEqual(bound.keep[0].source[1].perceive.by, [id]);
  assert.equal(bound.commands[0].localKey, "new:visitor");
  assert.equal(bound.commands[0].name, exact);
  assert.equal(bound.commands[1].by, id);
  assert.deepEqual(bound.commands[1].management.managerIds, [id]);
});
await runCase("npc-admission/existing", () => {
  const f = fixture(),
    captured = structuredClone(f.existing),
    request = { localKey: "new:host", existingId: f.existing.id };
  const arrival = prepareNpcAdmission(
    f.state,
    f.scene,
    request,
    "operation",
    1,
    "parlor",
    "Mara steps inside.",
    captured,
  );
  assert.equal(arrival.npc.id, f.existing.id);
  assert.equal(arrival.npc.characterization, captured.characterization);
  assert.throws(
    () => prepareNpcAdmission(f.state, f.scene, request, "operation", 1, "parlor", "Mara steps inside."),
    /fitted identity/,
  );
  assert.throws(
    () =>
      prepareNpcAdmission(
        f.state,
        f.scene,
        { ...request, characterization: "A replacement person" },
        "operation",
        1,
        "parlor",
        "Mara steps inside.",
        captured,
      ),
    /fitted identity/,
  );
  f.existing.revision++;
  assert.throws(
    () => prepareNpcAdmission(f.state, f.scene, request, "operation", 1, "parlor", "Mara steps inside.", captured),
    /fitted identity/,
  );
  f.existing.revision--;
  f.scene.participants.push({ characterId: f.existing.id, name: "Mara", doing: "Here" });
  assert.throws(
    () => prepareNpcAdmission(f.state, f.scene, request, "operation", 1, "parlor", "Mara steps inside.", captured),
    /movement/,
  );
});
await runCase("npc-admission/fences", () => {
  const f = fixture(),
    admission = f.prepare(),
    id = admission.npc.id;
  const lines: any[] = [
    {
      kind: "dialogue",
      speakerId: f.existing.id,
      content: "Earlier private conversation.",
      heardBy: [f.existing.id, id],
      soundOnly: { characterIds: [id], player: false, text: "Voices." },
    },
    {
      kind: "narration",
      speakerId: "__venue_scene__",
      content: admission.source,
      heardBy: ["player", id],
      physicalIdsAfter: [id],
    },
    { kind: "dialogue", speakerId: id, content: "Hello.", heardBy: ["player", id] },
  ];
  fenceIntroductionWitnesses(lines, [admission]);
  assert(!lines[0].heardBy.includes(id));
  assert(!lines[0].soundOnly.characterIds.includes(id));
  assert.deepEqual(lines[1].physicalIdsAfter, [id]);
  lines[0].speakerId = id;
  assert.throws(() => fenceIntroductionWitnesses(lines, [admission]), /before their introduction/);
});
