// Test cases: npc-admission/identity, npc-admission/references, npc-admission/existing, npc-admission/fences, npc-admission/native, npc-admission/returning, npc-admission/late-arrival, npc-admission/authority, npc-admission/moving-arrival, npc-admission/unused-context, npc-admission/name, npc-admission/improvised, npc-admission/compact, npc-admission/passerby, npc-admission/improvised-limit, npc-admission/improvised-collision, npc-admission/premature-action, npc-admission/directory, npc-admission/overview-eligibility, npc-admission/ordinary-references, npc-admission/tagged-turn
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { establishPlace } from "./helpers/places.fixture.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import {
  prepareNpcAdmission,
  bindNpcReferences,
  fenceIntroductionWitnesses,
  revealsNpcName,
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
import {
  npcEncounterIndex,
  readNpcPeople,
  savedNpcNameReveal,
} from "../packages/villages/src/server/domain/rules/npc-encounters.js";
import { villageWorldScope } from "../packages/villages/src/server/domain/rules/village-identity.js";
import {
  pruneTaggedSceneReply,
  decodeTaggedSceneReply,
} from "../packages/villages/src/server/domain/rules/tagged-scene-reply.js";
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
    existingId: existing.id,
  };
  const prepare = (key = "npc-operation") =>
    prepareNpcAdmission(
      state,
      scene,
      request,
      key,
      1,
      "parlor",
      "  A traveler steps inside. 🌼  ",
      structuredClone(existing),
    );
  const venue = place.location;
  const publication = (
    raw: Record<string, unknown>,
    input = "I privately worry. Hello.",
    operation = "native-npc",
    capturedAt = at,
  ) => {
    const context = narrationContinuityContext(
      state,
      zoneEventScene(scene, venue),
      venue,
      operation,
      input,
      capturedAt,
    );
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
      existingId: existingId ?? "npc:cafe:mara",
      source: [{ segment: "arrive", perceive: { kind: "seen", by: ["player"] } }],
    },
  ],
});
await runCase("npc-admission/tagged-turn", () => {
  for (const admitted of [true, false]) {
    const f = fixture();
    const original = f.publication({});
    const readset = {
      ...original.readset,
      taggedSceneReply: true as const,
      npcSpeakerNames: {},
      ordinaryDialogue: true as const,
    };
    const content = [
      "Narration: Rain taps the glass.",
      "Narration!: A baker comes inside.",
      admitted
        ? '[command]: {"type":"npc.admit","localKey":"new:baker","name":"Emil Rye","label":"Baker","characterization":"A patient baker."}'
        : '[command]: {"type":"npc.admit","localKey":"new:baker","existingId":"npc:unfitted"}',
      admitted ? '[Emil Rye]: "Emil Rye." I hope to see the garden.' : "[new:baker]: I hope to see the garden.",
      '[keep]: {"owner":"new:baker","for":["new:baker","player"],"class":"desire","current":true,"text":"Emil hopes to see the garden."}',
      '[KeEp]: {"text":"Private broken note"',
      "Narration: This could be a continuation of the private note.",
    ].join("\n");
    const raw = decodeTaggedSceneReply(content, readset).value;
    assert(raw);
    const publication = { raw, readset, responseDigest: memoryHash(content) };
    const result = acceptNarration(f.state, publication, "tagged", at);
    assert(!result.held, JSON.stringify(result.rejected));
    const episode = readAcceptedEpisode(result.episode!, f.state.seed);
    assert.equal(
      episode.segments.some(({ name }) => name === "Emil Rye"),
      admitted,
    );
    assert.deepEqual(episode.segments.map((line) => line.content).slice(0, 1), ["Rain taps the glass."]);
    assert.equal(episode.segments.length, admitted ? 3 : 1);
    assert.equal(
      f.state.continuity.versions.some((row) => row.text === "Emil hopes to see the garden."),
      admitted,
    );
    assert.equal(
      Object.values(f.state.worldPlaces.npcs).some((row) => row.name === "Emil Rye"),
      admitted,
    );
    const introduction = episode.commandReceipts.find((receipt) => receipt.kind === "npc-introduction");
    if (admitted) {
      assert(introduction);
      assert.equal(introduction.text, "Emil Rye");
      assert.equal(f.state.worldPlaces.npcs[introduction.targetId].label, "Emil Rye");
      applyAcceptedSceneDelta(f.scene, episode);
      assert.equal(
        f.scene.participants.find((person) => person.characterId === introduction.targetId)?.name,
        "Emil Rye",
      );
    } else assert.equal(introduction, undefined);
    assert(result.rejected.length > 0);
    const save = memoryHash(f.state);
    assert(acceptNarration(f.state, publication, "tagged", at).replayed);
    assert.equal(memoryHash(f.state), save);
  }
  {
    const f = fixture();
    const readset = { ...f.publication({}, '"Mara, hello."').readset, taggedSceneReply: true as const };
    const id = f.existing.id;
    assert(readset.npcCandidates.some(({ npc }) => npc.id === id));
    assert.equal(decodeTaggedSceneReply(`[${id}]: Unadmitted dialogue.`, readset).value, null);
    const content = [
      "Narration!: Mara comes through the door.",
      "[command]: " + JSON.stringify({ type: "npc.admit", existingId: id }),
      `[${id}]: Good to see you again.`,
    ].join("\n");
    const raw = decodeTaggedSceneReply(content, readset).value!;
    const publication = { raw, readset, responseDigest: memoryHash(content) };
    const count = Object.keys(f.state.worldPlaces.npcs).length;
    const result = acceptNarration(f.state, publication, "tagged-return", at);
    assert(!result.held, JSON.stringify(result.rejected));
    assert.equal(result.episode?.segments[1]?.speakerId, id);
    assert.equal(result.episode?.commandReceipts[0]?.admission?.npc.id, id);
    assert.equal(Object.keys(f.state.worldPlaces.npcs).length, count);
    assert(acceptNarration(f.state, publication, "tagged-return", at).replayed);
  }
  const f = fixture(),
    readset = f.publication({}).readset;
  const raw = decodeTaggedSceneReply(
    [
      "Narration: Before crossing.",
      "Narration!: Someone crosses.",
      '[command]: {"id":"crossing","type":"move","who":"one","to":"next"}',
      '[command]: {"id":"bad","type":"appointment","by":"one"}',
      "Narration: From the new position.",
    ].join("\n"),
    readset,
  ).value!;
  const privateTail = decodeTaggedSceneReply(
    "Narration: You hear rain.\n[keep] [aside]: {\nNarration: This could be an unfinished private note.",
    readset,
  ).value!;
  assert.deepEqual(
    (privateTail.segments as { text: string }[]).map((line) => line.text),
    ["You hear rain."],
  );
  assert.equal(decodeTaggedSceneReply("[command]: {\nNarration: Private control continuation.", readset).value, null);
  assert.equal(decodeTaggedSceneReply("[ !keep: {\nNarration: Private control continuation.", readset).value, null);
  const plain = decodeTaggedSceneReply("Light moves across the glass.\n\nA faint creak comes from the sign.", readset);
  assert.equal(plain.repaired, true);
  assert.deepEqual(
    (plain.value?.segments as { kind: string; text: string }[]).map(({ kind, text }) => [kind, text]),
    [
      ["narration", "Light moves across the glass."],
      ["narration", "A faint creak comes from the sign."],
    ],
  );
  const narrationWithUnheardSpeech = decodeTaggedSceneReply(
    [
      "Light moves across the glass.",
      "The awning gives a faint creak.",
      'Someone behind the glass: "This should stay private."',
      "This could continue the same private speech.",
    ].join("\n\n"),
    readset,
  );
  assert.equal(narrationWithUnheardSpeech.repaired, true);
  assert.deepEqual(
    (narrationWithUnheardSpeech.value?.segments as { text: string }[]).map(({ text }) => text),
    ["Light moves across the glass.", "The awning gives a faint creak."],
  );
  assert.deepEqual(Object.keys(narrationWithUnheardSpeech.value!), ["segments"]);
  const arrival = decodeTaggedSceneReply(
    'Light moves across the glass.\n\nThe awning gives a faint creak.\n\n"Secret words," someone says. "More secret words."',
    readset,
  );
  assert.deepEqual(
    (arrival.value?.segments as { text: string }[]).map(({ text }) => text),
    ["Light moves across the glass.", "The awning gives a faint creak."],
  );
  const source = readset.source.scene;
  const people = [
    { name: "Visible Seller", characterId: "seller-id", doing: "" },
    { name: "Another Seller", characterId: "other-id", doing: "" },
  ];
  const withPeople = (participants: typeof people) => ({
    ...readset,
    source: {
      ...readset.source,
      scene: { ...source, participants, contactGeneration: undefined, activeIds: ["seller-id", "other-id"] },
    },
  });
  const aliases = decodeTaggedSceneReply(
    '[Visible Seller]: Hello.\nVisible Seller: "Come closer."',
    withPeople(people),
  );
  assert.deepEqual(
    (aliases.value?.segments as { speakerId: string }[]).map(({ speakerId }) => speakerId),
    ["seller-id", "seller-id"],
  );
  const shadowed = withPeople([people[0], { ...people[1], name: "Visible Seller" }]);
  assert.equal(decodeTaggedSceneReply("[Visible Seller]: Ambiguous words.", shadowed).value, null);
  assert.equal(decodeTaggedSceneReply("[Offstage Seller]: Unheard words.", withPeople(people)).value, null);
  for (const [content, issue] of [
    ["[unknown]: Private dialogue.\nA continuation.", "unknown_speaker"],
    ['[keep]: {"text":"secret"\nA continuation.', "invalid_private_record"],
    ['A safe-looking paragraph.\n{"commands":[]}', "structured_reply"],
    ["Mara: Private dialogue.\nA continuation.", "structured_reply"],
    ['Mara: "Private dialogue."\n\nA continuation.', "structured_reply"],
    ['"Private dialogue."\n\nA continuation.', "structured_reply"],
    ['Plain prose.\n\nMara: "Private dialogue."\n\n[keep]: {"text":"private"}', "structured_reply"],
    ["**Mara**: Private dialogue.", "structured_reply"],
    ["- Mara: Private dialogue.", "structured_reply"],
    ["Mara：Private dialogue.", "structured_reply"],
    ["**Mara (whispering):** Private dialogue.", "structured_reply"],
    ["<think>Private notes.</think>", "structured_reply"],
  ])
    assert.deepEqual(decodeTaggedSceneReply(content, readset), { value: null, issue });
  const pruned = pruneTaggedSceneReply(raw, new Set(["bad"]))!;
  assert.deepEqual(
    (pruned.segments as { text: string }[]).map((line) => line.text),
    ["Before crossing."],
  );
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
  assert.equal(receipt.admission!.npc.name, "Mara");
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
  for (const positions of [false, true]) {
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
          {
            input,
            ground: dropped ? { kind: "private", at: "start" } : { kind: "visible-action", to: [], at: "start" },
          },
          { segment: "arrive", perceive: { kind: "seen", by: ["player"] } },
        ],
      });
      if (positions) {
        raw.commands.forEach((command: any) => {
          command.at = 1;
          command.source.forEach((source: any) => {
            if (source.segment) source.segment = 1;
          });
        });
        raw.keep = [
          {
            for: ["player"],
            text: "I saw a traveler arrive.",
            source: [{ segment: 1, perceive: { kind: "seen", by: ["player"] } }],
          },
        ];
      }
      const publication = f.publication(raw, input);
      if (positions) publication.readset.positionedSceneSources = true;
      const result = acceptNarration(f.state, publication, "moving-arrival", at);
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
  }
});
await runCase("npc-admission/ordinary-references", () => {
  for (const position of [0, -1, 1.5, 3, "missing", "1"]) {
    const f = fixture(),
      raw = rawArrival();
    raw.commands[0].at = position;
    raw.commands[0].source[0].segment = position;
    const publication = f.publication(raw);
    publication.readset.positionedSceneSources = true;
    const before = memoryHash(f.state);
    assert.throws(() => acceptNarration(f.state, publication, "invalid-position", at));
    assert.equal(memoryHash(f.state), before);
  }
  for (const source of [
    { input: "Hello.", ground: { kind: "spoken", to: ["new:visitor"], at: { before: 2 } } },
    { segment: 1, perceive: { kind: "seen", by: ["new:visitor"] } },
  ]) {
    const f = fixture(),
      raw = rawArrival();
    raw.segments.unshift({ kind: "narration", text: "An earlier private moment." });
    raw.commands[0].at = raw.commands[0].source[0].segment = 2;
    raw.keep = [{ for: ["new:visitor"], text: "I learned an earlier secret.", source: [source] }];
    const publication = f.publication(raw);
    publication.readset.positionedSceneSources = true;
    const before = memoryHash(f.state);
    assert(acceptNarration(f.state, publication, "before-arrival", at).held);
    assert.equal(memoryHash(f.state), before);
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
  const registryBefore = memoryHash(f.state.worldPlaces);
  const result = acceptNarration(f.state, publication, "return", at);
  assert.equal(result.held, false, JSON.stringify(result.rejected));
  assert.equal(result.episode!.commandReceipts[0].targetId, f.existing.id);
  assert.equal(Object.keys(f.state.worldPlaces.npcs).length, 1);
  assert.equal(memoryHash(f.state.worldPlaces), registryBefore, "a return visit changes only encounter history");
  assert.equal(readNpcPeople(f.state, { scope: villageWorldScope(f.state) }).items[0]?.characterId, f.existing.id);
  assert(acceptNarration(f.state, publication, "return", at).replayed);
  assert.equal(memoryHash(f.state.worldPlaces), registryBefore);
  const race = fixture(),
    pending = race.publication(rawArrival(race.existing.id));
  race.existing.revision++;
  const hash = memoryHash(race.state);
  assert.throws(() => acceptNarration(race.state, pending, "stale", at), /fitted (NPC )?identity/);
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
  assert.equal(first.npc.id, f.prepare("another-operation").npc.id);
  assert(first.npc.id.startsWith("npc:"));
  assert.equal(first.source, "  A traveler steps inside. 🌼  ");
  assert.equal(first.npc.label, "Mara");
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
    /fitted (NPC )?identity/,
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
    /fitted (NPC )?identity/,
  );
  f.existing.revision++;
  assert.throws(
    () => prepareNpcAdmission(f.state, f.scene, request, "operation", 1, "parlor", "Mara steps inside.", captured),
    /fitted (NPC )?identity/,
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
      speakerId: "npc:another",
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

await runCase("npc-admission/name", () => {
  const heard = { kind: "dialogue" as const, heardBy: ["player"] };
  for (const text of ["I'm Rasha Dunmore's neighbor.", "I am not Rasha Dunmore.", "The person to ask? Rasha Dunmore."])
    assert.equal(revealsNpcName({ ...heard, content: text }, "Rasha Dunmore", true), false, text);
  assert(revealsNpcName({ ...heard, content: "I'm Rasha Dunmore, the baker." }, "Rasha Dunmore", false));
  assert(!revealsNpcName({ ...heard, content: "Rasha Dunmore. Please come in." }, "Rasha Dunmore", false));
  assert(
    !revealsNpcName(
      { ...heard, heardBy: ["npc:listener"], content: "My name is Rasha Dunmore." },
      "Rasha Dunmore",
      true,
    ),
  );
  assert(
    !revealsNpcName({ ...heard, contactHidden: true, content: "My name is Rasha Dunmore." }, "Rasha Dunmore", true),
  );
  const saved = fixture(),
    savedReply = rawArrival();
  saved.existing.name = "Rasha Dunmore";
  savedReply.segments[1].text = "Rasha Dunmore. A pleasure.";
  const earlier = acceptNarration(saved.state, saved.publication(savedReply), "earlier-name", at).episode!;
  const savedNpc = saved.state.worldPlaces.npcs[earlier.commandReceipts[0].targetId];
  assert.equal(savedNpc.label, "Mara");
  assert.deepEqual(savedNpcNameReveal(saved.state, savedNpc), {
    sceneId: earlier.sceneId,
    lineId: earlier.segments[1].id,
  });
  assert.equal(earlier.segments[1].name, "Mara", "recovering the public name leaves the saved line intact");

  const meeting = fixture();
  const npc = meeting.existing;
  npc.name = "Rasha Dunmore";
  const arrival = acceptNarration(meeting.state, meeting.publication(rawArrival(npc.id)), "meeting", at).episode!;
  applyAcceptedSceneDelta(meeting.scene, arrival);
  const reply = (content: string, id: string, tagged = true, explicit = false) => {
    const publication = meeting.publication({}, '"What should I call you?"', id);
    const readset = tagged
      ? {
          ...publication.readset,
          taggedSceneReply: true as const,
          npcSpeakerNames: { [npc.id]: npc.name },
          ...(explicit ? { explicitNpcIntroduction: true as const, relaxedNarrationProse: true as const } : {}),
        }
      : publication.readset;
    const raw = tagged
      ? decodeTaggedSceneReply(content, readset).value
      : { segments: [{ kind: "dialogue", speakerId: npc.id, text: content }] };
    assert(raw);
    const result = acceptNarration(meeting.state, { raw, readset, responseDigest: memoryHash(raw) }, id, at);
    assert(!result.held, JSON.stringify(result.rejected));
    return readAcceptedEpisode(result.episode!, meeting.state.seed);
  };
  const unspoken = reply("[Rasha Dunmore]: Take a seat.", "unspoken-label");
  assert.equal(unspoken.segments[0].name, "Mara");
  assert(!unspoken.commandReceipts.some(({ kind }) => kind === "npc-introduction"));
  const denied = reply("[Rasha Dunmore]: I am not Rasha Dunmore.", "denied-label", true, true);
  assert.equal(denied.segments[0].name, "Mara");
  assert(!denied.commandReceipts.some(({ kind }) => kind === "npc-introduction"));
  const sideText = reply("Outside: a bell rings [softly].", "plain-brackets", true, true);
  assert.equal(sideText.segments[0].content, "Outside: a bell rings [softly].");
  const strictProse = {
    ...meeting.publication({}).readset,
    taggedSceneReply: true as const,
    relaxedNarrationProse: true as const,
  };
  assert.equal(decodeTaggedSceneReply('Coordinator output: {"keep":[{"text":"private"}]}', strictProse).value, null);

  const savedQuote = reply('"Rasha Dunmore." She taps the glass.', "saved-quote", false);
  assert.equal(savedQuote.segments[0].name, "Mara");
  assert.deepEqual(savedNpcNameReveal(meeting.state, meeting.state.worldPlaces.npcs[npc.id]), {
    sceneId: savedQuote.sceneId,
    lineId: savedQuote.segments[0].id,
  });

  const spoken = reply(`[${npc.id}] [introduce]:\n[${npc.id}]: Take a seat.`, "named", true, true);
  assert.equal(spoken.segments[0].content, "My name is Rasha Dunmore.");
  assert.deepEqual(
    spoken.segments.map(({ speakerId, name }) => [speakerId, name]),
    [
      [npc.id, npc.name],
      [npc.id, npc.name],
    ],
  );
  assert.equal(meeting.state.worldPlaces.npcs[npc.id].label, npc.name);
  assert.equal(meeting.state.worldPlaces.npcs[npc.id].id, npc.id);
  applyAcceptedSceneDelta(meeting.scene, spoken);
  assert.equal(meeting.scene.participants[0].name, npc.name);

  for (const label of ["Rasha Dunmore", "Another Name", 17]) {
    const f = fixture(),
      raw = rawArrival();
    f.existing.name = "Rasha Dunmore";
    Object.assign(raw.segments[1], { text: "Glad to meet you.", speakerLabel: label });
    raw.segments.push({ kind: "dialogue", speakerId: "new:visitor", text: "Have a seat." });
    const publication = f.publication(raw);
    const result = acceptNarration(f.state, publication, "speaker-label", at);
    assert.equal(result.held, false, JSON.stringify(result.rejected));
    const episode = readAcceptedEpisode(result.episode!, f.state.seed);
    const id = episode.commandReceipts[0].targetId;
    const visibleName = label === "Rasha Dunmore" ? label : "Mara";
    assert.deepEqual(
      episode.segments.slice(1).map((line) => line.name),
      [visibleName, visibleName],
    );
    assert.equal(f.state.worldPlaces.npcs[id].label, visibleName);
    applyAcceptedSceneDelta(f.scene, episode);
    assert.equal(f.scene.participants[0].name, visibleName);
    assert(acceptNarration(f.state, publication, "speaker-label", at).replayed);
  }
  const prepareName = (f: ReturnType<typeof fixture>) => {
    f.existing.name = "Rasha Dunmore";
    return f;
  };
  const f = prepareName(fixture()),
    raw = rawArrival();
  raw.segments[1].text = "My name is Rasha Dunmore.";
  raw.keep = [{ for: ["player"], text: "The traveler introduced herself as Rasha Dunmore.", source: ["hello"] }];
  const reveal = {
    type: "npc.introduce",
    who: "new:visitor",
    at: "hello",
    source: ["hello"],
    name: "Rasha Dunmore",
    independent: true,
  };
  raw.commands.push(reveal);
  const result = acceptNarration(f.state, f.publication(raw), "introduced", at);
  assert.equal(result.held, false, JSON.stringify(result.rejected));
  const episode = readAcceptedEpisode(result.episode!, f.state.seed),
    id = episode.commandReceipts[0].targetId;
  assert.equal(episode.segments[1].name, "Mara");
  assert.equal(f.state.worldPlaces.npcs[id].label, "Rasha Dunmore");
  assert.equal(
    npcEncounterIndex(f.state).get(id)?.name,
    "Rasha Dunmore",
    "same-response introduction teaches the heard name",
  );
  applyAcceptedSceneDelta(f.scene, episode);
  assert.equal(f.scene.participants[0].name, "Rasha Dunmore");
  assert.equal(f.scene.sceneAttendance!.occupants[0].name, "Rasha Dunmore");
  assert.equal(f.existing.label, "Mara");
  const forged = structuredClone(episode);
  forged.commandReceipts[1].text = "Someone else";
  assert.throws(() => readAcceptedEpisode(forged, f.state.seed), /Player-heard name/);
  const player = continuityActor(f.state, "player")!,
    playerKey = continuityHolderKey(player);
  const root = f.state.continuity.records.find((record) => record.heads[playerKey])!;
  f.state.continuity = protectContinuity(
    f.state.continuity,
    { id: root.id, recordRevision: root.revision, heads: { [playerKey]: root.heads[playerKey].revision } },
    [player],
    "forget-name",
    at,
    { forget: true },
  );
  assert(
    readNpcPeople(f.state, { scope: villageWorldScope(f.state) }).items[0]?.name === "Rasha Dunmore",
    "the authored overview remains available while its seen encounter survives",
  );

  const returning = prepareName(fixture()),
    returned = rawArrival(returning.existing.id);
  returned.segments[1] = raw.segments[1];
  returned.commands.push(reveal);
  const returningPublication = returning.publication(returned);
  const recognized = acceptNarration(returning.state, returningPublication, "returned", at);
  assert.equal(recognized.held, false, JSON.stringify(recognized.rejected));
  assert.equal(returning.state.worldPlaces.npcs[returning.existing.id].label, "Rasha Dunmore");
  assert(acceptNarration(returning.state, returningPublication, "returned", at).replayed);

  const other = prepareName(fixture()),
    whispered = rawArrival(other.existing.id);
  whispered.segments.push({ ...raw.segments[0], id: "second", requires: ["second-admission"] });
  whispered.segments[1] = raw.segments[1];
  [whispered.segments[1], whispered.segments[2]] = [whispered.segments[2], whispered.segments[1]];
  whispered.segments[2] = {
    ...whispered.segments[2],
    delivery: "whisper",
    targetId: "new:second",
    speakerLabel: "Rasha Dunmore",
  };
  other.state.worldPlaces.npcs["npc:second"] = {
    ...structuredClone(other.existing),
    id: "npc:second",
    name: "Other",
    label: "Other",
  };
  whispered.commands.push(
    {
      ...rawArrival().commands[0],
      id: "second-admission",
      at: "second",
      localKey: "new:second",
      existingId: "npc:second",
      source: [{ segment: "second", perceive: { kind: "seen", by: ["player"] } }],
    },
    reveal,
  );
  const privateResult = acceptNarration(other.state, other.publication(whispered), "unheard", at);
  assert.equal(privateResult.held, false, JSON.stringify(privateResult.rejected));
  assert(privateResult.rejected.some((row) => row.reason.includes("heard by the Player")));
  assert.equal(other.state.worldPlaces.npcs[other.existing.id].label, "Mara");
  const privateEpisode = readAcceptedEpisode(privateResult.episode!, other.state.seed);
  assert(!privateEpisode.commandReceipts.some((receipt) => receipt.kind === "npc-introduction"));
  assert(!privateEpisode.segments.some((line) => line.name === "Rasha Dunmore"));
  assert(
    !JSON.stringify(readNpcPeople(other.state, { scope: villageWorldScope(other.state) })).includes(
      "My name is Rasha Dunmore.",
    ),
    "authored overviews never include unheard dialogue",
  );
});

function improvisedArrival(): any {
  const raw = rawArrival();
  delete raw.commands[0].existingId;
  Object.assign(raw.commands[0], {
    name: "Tomas Reed",
    label: "Man in a red suit",
    appearance: "Lean, greying hair, round glasses and a red suit.",
    characterization: "Reserved and mechanically knowledgeable.",
  });
  raw.segments[0].actors = ["new:visitor"];
  raw.segments[0].text = "A man in a red suit steps over to talk.";
  raw.segments[1].text = "I can take a look at your bicycle.";
  raw.keep = [
    {
      for: ["new:visitor"],
      class: "information",
      text: "The player said their bicycle was broken.",
      source: [
        { input: "My bicycle is broken.", ground: { kind: "spoken", to: ["new:visitor"], at: { after: "arrive" } } },
      ],
    },
  ];
  return raw;
}
await runCase("npc-admission/improvised", () => {
  const f = fixture(),
    raw = improvisedArrival(),
    publication = f.publication(raw, "My bicycle is broken.");
  const result = acceptNarration(f.state, publication, "new-person", at);
  assert.equal(result.held, false, JSON.stringify(result.rejected));
  const id = result.episode!.commandReceipts.find((row) => row.kind === "npc")!.targetId;
  assert.equal(f.state.worldPlaces.npcs[id].listed, false);
  assert.equal(f.state.worldPlaces.npcs[id].appearance, raw.commands[0].appearance);
  const directory = readNpcPeople(f.state, { scope: villageWorldScope(f.state) });
  assert.equal(directory.items.length, 1);
  assert.deepEqual(directory.items[0], {
    characterId: id,
    name: "Tomas Reed",
    role: "Man in a red suit",
    appearance: raw.commands[0].appearance,
    personality: raw.commands[0].characterization,
    at,
    placeName: "Cafe",
  });
  assert(!JSON.stringify(directory).includes("My bicycle is broken."), "Player speech is not an overview field");
  assert(
    !JSON.stringify(directory).includes("I can take a look at your bicycle."),
    "NPC dialogue is not an overview field",
  );
  assert.throws(() => readNpcPeople(f.state, { scope: "a".repeat(64) }), /Village changed/);
  assert(!directory.items.some((row) => row.characterId === f.existing.id), "unmet authored people stay absent");
  f.state.worldPlaces.npcs[id].disabled = true;
  f.state.worldPlaces.npcs[id].facts = ["PRIVATE_NPC_FACT"];
  f.state.worldPlaces.npcs[id].availability = "PRIVATE_NPC_AVAILABILITY";
  assert.deepEqual(
    readNpcPeople(f.state, { scope: villageWorldScope(f.state) }),
    directory,
    "retirement and hidden NPC facts do not change the approved overview or cursor",
  );
  f.state.worldPlaces.npcs[id].disabled = false;
  assert(
    continuityViews(f.state.continuity, continuityActor(f.state, id)!, at, new Set()).some((view) =>
      view.version.text.includes("bicycle"),
    ),
  );
  const cold = decodeContinuityPagesSync(
    ...(() => {
      const encoded = encodeContinuityPages(
        {
          continuity: f.state.continuity,
          episodes: f.state.episodes,
          worldPlaces: f.state.worldPlaces,
          mailbox: f.state.mailbox,
        },
        "a".repeat(32),
      );
      return [encoded.manifest, "a".repeat(32), f.state.seed, (key: string) => encoded.pages.get(key) ?? null] as const;
    })(),
  ).value;
  assert.deepEqual(cold.worldPlaces.npcs[id], f.state.worldPlaces.npcs[id]);
  assert.equal(
    npcEncounterIndex({ ...f.state, ...cold }).get(id)?.name,
    "Tomas Reed",
    "the authored overview survives native storage reload",
  );
  assert(acceptNarration(f.state, publication, "new-person", at).replayed);
  const returnContext = narrationContinuityContext(
    f.state,
    zoneEventScene(f.scene, f.venue),
    f.venue,
    "return",
    "The man in the red suit and my bicycle",
    at,
  );
  assert(returnContext.npcCandidates.some((row) => row.npc.id === id));
  assert(returnContext.parts.some((part) => part.block.text.includes("bicycle")));
  for (const label of ["Man in a red suit", "PRIVATE_SILENT_IDENTITY"]) {
    const silent = fixture(),
      raw = improvisedArrival();
    raw.commands[0].label = label;
    raw.segments.pop();
    assert.equal(
      acceptNarration(silent.state, silent.publication(raw, "My bicycle is broken."), "silent", at).held,
      false,
    );
    const directory = readNpcPeople(silent.state, { scope: villageWorldScope(silent.state) });
    assert.equal(directory.items[0]?.name, "Tomas Reed");
    assert.equal(directory.items[0]?.role, label, "a seen silent arrival unlocks the authored overview");
  }
});
await runCase("npc-admission/compact", () => {
  for (const label of [undefined, "Baker"]) {
    const f = fixture(),
      raw = rawArrival();
    delete raw.commands[0].existingId;
    Object.assign(raw.commands[0], {
      name: "Mira",
      characterization: "A friendly baker.",
      ...(label ? { label } : {}),
    });
    raw.segments[0].text = "A baker sets her tray down beside you.";
    const publication = f.publication(raw),
      result = acceptNarration(f.state, publication, "compact-npc", at);
    assert.equal(result.held, false, JSON.stringify(result.rejected));
    const npc = result.episode!.commandReceipts[0].admission!.npc;
    assert.deepEqual(readAcceptedEpisode(result.episode, f.state.seed).commandReceipts[0].admission!.npc, npc);
    assert.equal(npc.label, label ?? "Stranger");
    assert.equal(npc.appearance, undefined);
    const person = readNpcPeople(f.state, { scope: villageWorldScope(f.state) }).items[0];
    assert.equal(person?.personality, "A friendly baker.");
    assert.equal(person?.role, label ?? "");
    assert(acceptNarration(f.state, publication, "compact-npc", at).replayed);
  }
});
await runCase("npc-admission/passerby", () => {
  const f = fixture(),
    registryBefore = memoryHash(f.state.worldPlaces),
    text = 'A passing baker calls, "We close at six," and heads back inside.',
    publication = f.publication({ segments: [{ kind: "narration", text }] }),
    result = acceptNarration(f.state, publication, "passerby", at);
  assert.equal(result.held, false, JSON.stringify(result.rejected));
  assert.equal(result.episode?.segments[0].content, text);
  assert.equal(result.episode?.commandReceipts.length, 0);
  assert.equal(memoryHash(f.state.worldPlaces), registryBefore);
  assert.equal(npcEncounterIndex(f.state).size, 0);
  const replay = acceptNarration(f.state, publication, "passerby", at);
  assert(replay.replayed);
  assert.equal(replay.episode?.segments[0].id, result.episode?.segments[0].id);
});
await runCase("npc-admission/improvised-limit", () => {
  const f = fixture(),
    raw = improvisedArrival();
  raw.commands.push({
    ...raw.commands[0],
    id: "second-admit",
    localKey: "new:second",
    name: "Nell Birch",
    label: "Courier",
  });
  const before = memoryHash(f.state);
  assert.throws(() => acceptNarration(f.state, f.publication(raw), "two-new-people", at), /at most one new NPC/);
  assert.equal(memoryHash(f.state), before);
});
await runCase("npc-admission/improvised-collision", () => {
  for (const field of ["name", "label"]) {
    const f = fixture(),
      raw = improvisedArrival();
    raw.commands[0][field] = "Mara";
    const before = memoryHash(f.state);
    if (field === "name") {
      assert.throws(() => acceptNarration(f.state, f.publication(raw), field, at), /already identifies/);
      assert.equal(memoryHash(f.state), before);
    } else {
      const result = acceptNarration(f.state, f.publication(raw), field, at);
      assert.equal(result.held, false);
      assert.equal(result.episode!.commandReceipts.find(({ kind }) => kind === "npc")?.admission?.npc.label, "Mara");
    }
  }
});
await runCase("npc-admission/premature-action", () => {
  const f = fixture(),
    raw = improvisedArrival();
  raw.segments.unshift({ kind: "narration", text: "The man waves before arriving.", actors: ["new:visitor"] });
  const before = memoryHash(f.state);
  assert.throws(
    () => acceptNarration(f.state, f.publication(raw), "premature-action", at),
    /before their admitted arrival/,
  );
  assert.equal(memoryHash(f.state), before);
});

await runCase("npc-admission/directory", () => {
  const f = fixture(),
    scope = villageWorldScope(f.state);
  const ids: string[] = [];
  for (const [i, label] of ["Redcoat", "Bluecoat", "Greencoat", "Goldcoat", "Greycoat", "Blackcoat"].entries()) {
    const raw = improvisedArrival(),
      time = `2026-11-10T${String(9 + i).padStart(2, "0")}:00:00.000Z`;
    raw.commands[0].name = label + " Smith";
    raw.commands[0].label = label;
    const result = acceptNarration(
      f.state,
      f.publication(raw, "My bicycle is broken.", "person-" + i, time),
      "person-" + i,
      time,
    );
    assert.equal(result.held, false, JSON.stringify(result.rejected));
    ids.push(result.episode!.commandReceipts.find((row) => row.kind === "npc")!.targetId);
  }
  const page = readNpcPeople(f.state, { scope });
  assert.equal(page.items.length, 4);
  assert.equal((page.items[0] as { name: string }).name, "Blackcoat Smith");
  assert(page.nextCursor);
  const older = readNpcPeople(f.state, { scope, cursor: page.nextCursor! });
  assert.deepEqual(
    older.items.map((row) => (row as { name: string }).name),
    ["Bluecoat Smith", "Redcoat Smith"],
  );
  assert.equal(readNpcPeople(f.state, { scope, query: "Redcoat" }).items.length, 1);
  assert.equal(
    readNpcPeople(f.state, { scope, query: "Smith" }).items.length,
    4,
    "search includes approved authored names",
  );
  assert.throws(() => readNpcPeople(f.state, { scope, query: "Redcoat", cursor: page.nextCursor! }), /People changed/);
  const time = "2026-11-11T08:00:00.000Z",
    raw = rawArrival(ids[0]);
  const repeat = acceptNarration(f.state, f.publication(raw, "Hello again.", "repeat", time), "repeat", time);
  assert.equal(repeat.held, false, JSON.stringify(repeat.rejected));
  const index = npcEncounterIndex(f.state);
  assert.equal(index.size, 6, "repeat meeting updates one person");
  assert.equal(index.get(ids[0])?.at, time);
  assert.equal((readNpcPeople(f.state, { scope }).items[0] as { characterId: string }).characterId, ids[0]);
  assert.throws(() => readNpcPeople(f.state, { scope, cursor: page.nextCursor! }), /People changed/);
  f.venue.name = "PRIVATE_RENAMED_LOCATION";
  f.state.worldPlaces.npcs[ids[0]].appearance = "Updated authored appearance";
  const updated = readNpcPeople(f.state, { scope });
  assert.equal(updated.items[0].appearance, "Updated authored appearance");
  assert.equal(updated.items[0].placeName, "Cafe", "last met uses the captured Place label");
  assert.throws(() => readNpcPeople(f.state, { scope, cursor: page.nextCursor! }), /People changed/);
  const npc = f.state.worldPlaces.npcs[ids[0]],
    lastPlace = f.state.episodes.records.at(-1)!.room!.placeId;
  npc.label = npc.name;
  npc.associations = [
    { placeId: "unrelated-place", role: "PRIVATE_UNRELATED_AFFILIATION" },
    { placeId: lastPlace, role: "Parts trader" },
  ];
  assert.equal(
    readNpcPeople(f.state, { scope }).items[0].role,
    "Parts trader",
    "role survives a self-introduction label",
  );
  assert(!JSON.stringify(readNpcPeople(f.state, { scope })).includes("PRIVATE_UNRELATED_AFFILIATION"));
  npc.associations[1].role = "Encountered here";
  assert.equal(readNpcPeople(f.state, { scope }).items[0].role, "", "do not invent a role from encounter bookkeeping");
});

await runCase("npc-admission/overview-eligibility", () => {
  const f = fixture(),
    raw = improvisedArrival();
  raw.segments.pop();
  raw.keep.push({
    for: ["player"],
    class: "experience",
    text: "I saw the traveler arrive.",
    source: [{ segment: "arrive", perceive: { kind: "seen", by: ["player"] } }],
  });
  const result = acceptNarration(f.state, f.publication(raw, "My bicycle is broken."), "seen", at);
  assert.equal(result.held, false, JSON.stringify(result.rejected));
  assert.equal(npcEncounterIndex(f.state).size, 1);
  const player = continuityActor(f.state, "player")!,
    key = continuityHolderKey(player);
  const root = f.state.continuity.records.find((record) => record.heads[key])!;
  f.state.continuity = protectContinuity(
    f.state.continuity,
    { id: root.id, recordRevision: root.revision, heads: { [key]: root.heads[key].revision } },
    [player],
    "forget-encounter",
    at,
    { forget: true },
  );
  assert.equal(npcEncounterIndex(f.state).size, 0, "protected encounters cannot unlock authored profiles");
  assert.equal(readNpcPeople(f.state, { scope: villageWorldScope(f.state), query: "Tomas" }).items.length, 0);
});
