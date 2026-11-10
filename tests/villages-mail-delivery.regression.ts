// Test cases: mail-delivery/shared-offer, mail-delivery/frozen-reading, mail-delivery/rollback, mail-delivery/private-context, mail-delivery/prior-routine, mail-delivery/unfitted-head, mail-delivery/history-provenance, mail-delivery/autonomous, mail-delivery/recovery-time
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageState } from "../packages/villages/src/server/domain/models/world.js";
import type { AcceptedEpisode } from "../packages/villages/src/server/domain/models/episode-model.js";
import type { ContinuityEvidence } from "../packages/villages/src/server/domain/models/continuity-model.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import {
  applyContinuityWrite,
  continuityKnowledge,
  continuitySourceUnit,
  continuityHolderKey,
  continuityViews,
  continuityProtectionUnits,
  protectContinuity,
} from "../packages/villages/src/server/domain/rules/continuity.js";
import { episodeSourceGraph } from "../packages/villages/src/server/domain/decoding/episode-codec.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { queueMailboxLetter } from "../packages/villages/src/server/domain/rules/social-mail.js";
import { captureMailContext, mailStagePublication } from "../packages/villages/src/server/domain/rules/mail-context.js";
import { acceptMailContinuity } from "../packages/villages/src/server/domain/rules/mail-continuity.js";
import {
  acceptMailExchange,
  acceptResidentLetter,
  readDeliveredLetter,
  type MailExchange,
} from "../packages/villages/src/server/domain/rules/mail-delivery.js";
import {
  appendEpisode,
  actorEpisodeView,
  gmEpisodeView,
} from "../packages/villages/src/server/domain/rules/episodes.js";
import { memoryPayload } from "../packages/villages/src/server/adapters/storage/memory-payload-store.js";
import {
  encodeContinuityPages,
  decodeContinuityPagesSync,
} from "../packages/villages/src/server/adapters/storage/continuity-pages.js";

const at = "2026-11-09T12:00:00.000Z",
  later = "2026-11-09T13:00:00.000Z",
  terms =
    "Visit the fair together on Saturday, only if Delia comes and the north path is open. Nobody must cancel work. 🌿";
function fixture() {
  const state = { ...defaultVillageState(), seed: "world", setupAt: at };
  state.villagers = [
    { characterId: "mara", incarnation: "one", cardSnapshot: { name: "Mara" } },
  ] as VillageState["villagers"];
  const player = continuityActor(state, "player")!,
    mara = continuityActor(state, "mara")!;
  const incoming = {
    id: "personal:mara:request",
    at,
    from: { id: player.id, incarnation: player.incarnation },
    to: { id: mara.id, incarnation: mara.incarnation },
    text: "Would you visit the fair with me on Saturday, only if Delia comes and the north path is open? Neither of us should cancel work.",
    requestId: "request",
  };
  state.mailbox = queueMailboxLetter(state.mailbox, state.seed, incoming, incoming.requestId, incoming.text);
  const exchange: MailExchange = {
    capture: captureMailContext(state, "mara", incoming.text, at),
    incoming,
    incomingMeaning: {
      keep: [
        {
          id: "offer",
          for: ["player", "mara"],
          class: "commitment",
          text: terms,
          source: ["letter"],
          offer: { proposer: "player", participants: ["player", "mara"] },
        },
      ],
      requires: ["offer"],
    },
    replyText:
      "I accept those exact conditions, including Delia, the open north path, and neither of us cancelling work.",
    replyMeaning: {
      keep: [{ id: "assent", replace: "incoming:offer", for: ["mara", "player"], accept: "mara", source: ["letter"] }],
      requires: ["assent"],
    },
    responseDigest: memoryHash("one saved GM reply"),
  };
  const rows = (holder = player) =>
    continuityViews(
      state.continuity,
      holder,
      later,
      continuityProtectionUnits(state.continuity, holder, episodeSourceGraph(state.episodes.records, holder)),
    );
  const cold = () => {
    const world = "a".repeat(32),
      packet = encodeContinuityPages(memoryPayload(state), world);
    Object.assign(
      state,
      decodeContinuityPagesSync(packet.manifest, world, state.seed, (id) => packet.pages.get(id) ?? null).value,
    );
  };
  return { state, exchange, player, mara, rows, cold };
}

await runCase("mail-delivery/shared-offer", () => {
  const f = fixture();
  acceptMailExchange(f.state, f.exchange, at);
  assert.equal(f.state.continuity.records.length, 1, "one complete meaning crosses both letters and knowledge scopes");
  assert.equal(f.rows()[0].offer?.state, "offered", "unread acceptance cannot teach the player");
  assert.equal(f.rows(f.mara)[0].offer?.state, "accepted");
  assert.equal(f.state.episodes.records.length, 3);
  assert(f.state.episodes.records.every((episode) => !episode.sceneId && episode.segments.length === 0));
  assert.equal(f.state.mailbox.messages[f.exchange.incoming.id].text, f.exchange.incoming.text);
  f.cold();
  readDeliveredLetter(f.state, f.exchange.incoming.id + ":reply", later);
  f.cold();
  assert.equal(f.rows()[0].offer?.state, "accepted");
  assert.equal(f.rows()[0].version.text, terms);
  assert.equal(f.state.continuity.records[0].offer!.events.length, 2);
  const before = structuredClone(f.state);
  readDeliveredLetter(f.state, f.exchange.incoming.id + ":reply", later);
  acceptMailExchange(f.state, f.exchange, later);
  assert.deepEqual(f.state, before, "lost acknowledgements replay without extra learning, acts or changed timestamps");
});

await runCase("mail-delivery/recovery-time", () => {
  const first = fixture(),
    recovered = fixture();
  acceptMailExchange(first.state, first.exchange, at);
  acceptMailExchange(recovered.state, recovered.exchange, later);
  const replyId = recovered.exchange.incoming.id + ":reply";
  assert.equal(recovered.state.mailbox.messages[replyId].at, at, "writing stays at its captured request time");
  assert.deepEqual(
    recovered.state.mailbox,
    first.state.mailbox,
    "storage recovery cannot mint a different written source",
  );
  assert.deepEqual(
    recovered.state.episodes.records.map((row) => row.id),
    first.state.episodes.records.map((row) => row.id),
  );
  assert(recovered.state.episodes.records.every((row) => row.capturedAt === at && row.acceptedAt === later));
  assert.deepEqual(recovered.state.continuity, first.state.continuity);
  const savedPlan = structuredClone(recovered.state.mailbox.messages[replyId].reading);
  recovered.cold();
  readDeliveredLetter(recovered.state, replyId, later);
  assert.equal(recovered.state.mailbox.messages[replyId].readAt, later, "actual later reading cannot be backdated");
  assert.equal(recovered.state.episodes.records.at(-1)!.capturedAt, later);
  assert.deepEqual(
    recovered.state.mailbox.messages[replyId].reading,
    savedPlan,
    "the frozen reading proof is unchanged",
  );
  recovered.cold();
  assert.equal(recovered.rows()[0].offer?.state, "accepted");
});

await runCase("mail-delivery/frozen-reading", () => {
  const f = fixture();
  acceptMailExchange(f.state, f.exchange, at);
  const reply = f.state.mailbox.messages[f.exchange.incoming.id + ":reply"];
  assert(reply.reading);
  const tampered = structuredClone(f.state);
  (tampered.mailbox.messages[reply.id].reading!.keep[0] as Record<string, unknown>).text =
    "Attend unconditionally, alone.";
  const world = "a".repeat(32),
    packet = encodeContinuityPages(memoryPayload(tampered), world);
  assert.throws(
    () => decodeContinuityPagesSync(packet.manifest, world, f.state.seed, (id) => packet.pages.get(id) ?? null),
    /accepted delivery/,
  );
  const record = f.state.continuity.records[0],
    key = continuityHolderKey(f.player);
  f.state.continuity = protectContinuity(
    f.state.continuity,
    { id: record.id, recordRevision: record.revision, heads: { [key]: record.heads[key].revision } },
    [f.player],
    "forget-before-read",
    at,
    { forget: true },
  );
  const before = structuredClone(f.state);
  assert.throws(() => readDeliveredLetter(f.state, reply.id, later), /protection changed/);
  assert.deepEqual(f.state, before);
  const g = fixture();
  acceptMailExchange(g.state, g.exchange, at);
  g.state.villagers[0].incarnation = "replacement";
  readDeliveredLetter(g.state, g.exchange.incoming.id + ":reply", later);
  assert.equal(
    g.rows()[0].offer?.state,
    "accepted",
    "an old author's original writing remains readable after replacement",
  );
  assert.equal(g.rows(continuityActor(g.state, "mara")!).length, 0);
});

await runCase("mail-delivery/rollback", () => {
  for (const invalid of [
    { id: "bad", for: ["unknown"], text: "A new statement", source: ["letter"] },
    { id: "bad", for: "room", text: "The roof is rebuilt.", source: ["letter"] },
    { id: "bad", for: ["player"], text: terms.repeat(30), source: ["letter"] },
  ]) {
    const f = fixture(),
      before = structuredClone(f.state);
    assert.throws(() =>
      acceptMailExchange(f.state, { ...f.exchange, replyMeaning: { keep: [invalid], requires: ["bad"] } }, at),
    );
    assert.deepEqual(f.state, before, "failed reply cannot leave partial source delivery or accepted offers");
  }
  const f = fixture();
  acceptMailExchange(
    f.state,
    {
      ...f.exchange,
      replyMeaning: {
        keep: [
          ...f.exchange.replyMeaning.keep,
          { id: "optional", for: ["player"], text: terms.repeat(30), source: ["letter"], independent: true },
        ],
        requires: ["assent"],
      },
    },
    at,
  );
  readDeliveredLetter(f.state, f.exchange.incoming.id + ":reply", later);
  assert.equal(
    f.rows()[0].offer?.state,
    "accepted",
    "independent malformed learning does not destroy supported fiction",
  );
});

await runCase("mail-delivery/private-context", () => {
  const f = fixture();
  const capture = captureMailContext(f.state, "mara", "private", at),
    mail = { id: "private-note", at, from: f.exchange.incoming.from, to: f.exchange.incoming.to };
  const publication = mailStagePublication(
    capture,
    mail,
    "A private draft I wrote.",
    "written",
    [
      {
        id: "own",
        for: ["player"],
        class: "information",
        text: "The player wrote a private draft.",
        source: ["letter"],
      },
    ],
    [],
    memoryHash("private"),
    "private-note",
  );
  assert.equal(acceptMailContinuity(f.state, publication, at).held, false);
  const next = captureMailContext(f.state, "mara", "private draft", at),
    outgoing = { id: "generated", at, from: f.exchange.incoming.to, to: f.exchange.incoming.from },
    generated = mailStagePublication(
      next,
      outgoing,
      "I will consider your fair invitation.",
      "written",
      [],
      [],
      memoryHash("generated"),
      "generated",
    );
  assert(
    Object.values(generated.historical).some((source) => source.kind === "knowledge" && source.actorId === "player"),
  );
  const result = acceptMailContinuity(f.state, generated, at);
  assert.equal(result.held, false);
  assert(result.episode);
  assert.equal(
    actorEpisodeView(result.episode, f.state.continuity, f.player, f.state.episodes),
    null,
    "GM private references are not letter delivery or attendance",
  );
  assert.equal(gmEpisodeView(result.episode, f.state.continuity, [f.player], f.state.episodes), null);
  f.cold();
  const record = f.state.continuity.records[0],
    key = continuityHolderKey(f.player);
  f.state.continuity = protectContinuity(
    f.state.continuity,
    { id: record.id, recordRevision: record.revision, heads: { [key]: record.heads[key].revision } },
    [f.player],
    "forget-private-context",
    at,
    { forget: true },
  );
  assert.equal(
    gmEpisodeView(result.episode, f.state.continuity, [f.mara], f.state.episodes),
    null,
    "ordinary GM recall cannot restore protected private reference context through generated mail",
  );
  assert.equal(
    actorEpisodeView(result.episode, f.state.continuity, f.mara, f.state.episodes)?.letters[0].text,
    "I will consider your fair invitation.",
    "the author still wrote her actual words",
  );
});

await runCase("mail-delivery/prior-routine", () => {
  const f = fixture(),
    mail = { id: "routine", at, from: f.exchange.incoming.from, to: f.exchange.incoming.to };
  assert.equal(
    acceptMailContinuity(
      f.state,
      mailStagePublication(
        f.exchange.capture,
        mail,
        "How are you?",
        "written",
        [],
        [],
        memoryHash("routine"),
        "routine",
      ),
      at,
    ).held,
    false,
  );
  assert.equal(f.state.episodes.records[0].grounding.length, 0);
  const capture = captureMailContext(f.state, "mara", "How are you?", at),
    outgoing = { id: "routine-follow-up", at, from: mail.to, to: mail.from };
  assert.equal(
    acceptMailContinuity(
      f.state,
      mailStagePublication(
        capture,
        outgoing,
        "Quite well, thank you.",
        "written",
        [],
        [],
        memoryHash("follow-up"),
        "follow-up",
      ),
      at,
    ).held,
    false,
  );
  f.cold();
  assert.equal(f.state.continuity.records.length, 0);
  assert.equal(f.state.episodes.records.length, 2);
});

await runCase("mail-delivery/autonomous", () => {
  const f = fixture(),
    mail = { id: "automatic-letter", at, from: f.exchange.incoming.to, to: f.exchange.incoming.from },
    text =
      "Would you like to visit the fair with me on Saturday, only if Delia comes and the path is open? Nobody must cancel work.",
    meaning = {
      keep: [
        {
          id: "offer",
          for: ["mara", "player"],
          class: "commitment",
          text: terms,
          offer: { proposer: "mara", participants: ["mara", "player"] },
          source: ["letter"],
        },
      ],
      requires: ["offer"],
    };
  acceptResidentLetter(
    f.state,
    f.exchange.capture,
    mail,
    text,
    "auto-request",
    meaning,
    memoryHash("existing planning response"),
    at,
  );
  assert.equal(f.state.episodes.records.length, 1);
  assert.equal(f.rows().length, 0);
  f.cold();
  readDeliveredLetter(f.state, mail.id, later);
  assert.equal(f.rows()[0].offer?.state, "offered");
  const before = structuredClone(f.state);
  acceptResidentLetter(
    f.state,
    f.exchange.capture,
    mail,
    text,
    "auto-request",
    meaning,
    memoryHash("existing planning response"),
    later,
  );
  assert.deepEqual(
    f.state,
    before,
    "replaying the existing planning outcome does not create another letter or learning",
  );
  f.cold();
});

await runCase("mail-delivery/unfitted-head", () => {
  for (const viaReply of [false, true]) {
    const f = fixture();
    acceptMailExchange(
      f.state,
      {
        ...f.exchange,
        incomingMeaning: {
          keep: [
            { id: "fact", for: ["player", "mara"], text: "The blue kettle belongs on the shelf.", source: ["letter"] },
          ],
          requires: [],
        },
        replyText: "",
        replyMeaning: { keep: [], requires: [] },
      },
      at,
    );
    const root = f.state.continuity.records[0].id,
      capture = captureMailContext(f.state, "mara", "blue kettle shelf", at),
      privateMail = { id: "private-change", at, from: f.exchange.incoming.to, to: f.exchange.incoming.from };
    assert.equal(
      acceptMailContinuity(
        f.state,
        mailStagePublication(
          capture,
          privateMail,
          "I now prefer a different place.",
          "written",
          [
            {
              id: "different",
              replace: root,
              for: ["mara"],
              text: "I privately prefer the red kettle by the door.",
              source: ["letter"],
            },
          ],
          [],
          memoryHash("different"),
          "different",
        ),
        at,
      ).held,
      false,
    );
    const current = f.state.continuity.records[0],
      key = continuityHolderKey(f.player),
      next = captureMailContext(f.state, "mara", "blue kettle shelf", at);
    next.supplied = [{ id: root, recordRevision: current.revision, heads: { [key]: current.heads[key].revision } }];
    const exchange = {
        ...f.exchange,
        capture: next,
        incoming: { ...f.exchange.incoming, id: "new-source", requestId: "new-source" },
        incomingMeaning: {
          keep: [{ id: "share", replace: root, for: viaReply ? ["player"] : ["player", "mara"], source: ["letter"] }],
          requires: ["share"],
        },
        replyText: viaReply ? "I recall what you wrote." : "",
        replyMeaning: {
          keep: viaReply ? [{ id: "reply", replace: "incoming:share", for: ["mara"], source: ["letter"] }] : [],
          requires: [],
        },
      },
      before = structuredClone(f.state);
    assert.throws(() => acceptMailExchange(f.state, exchange, at), /existing continuity head was not fitted/);
    assert.deepEqual(f.state, before, "an existing private head never enters the read set through a shared-root alias");
  }
});

function scene(f: ReturnType<typeof fixture>, id: string, input = ""): AcceptedEpisode {
  return {
    format: 1,
    id,
    seed: f.state.seed,
    sceneId: id,
    submissionId: id,
    operationId: id,
    capturedAt: at,
    acceptedAt: at,
    responseDigest: memoryHash(id),
    admittedContinuityRevision: f.state.continuity.revision,
    privateInput: input,
    actors: [f.player, f.mara].map(({ id, incarnation }) => ({ id, incarnation, zoneId: "parlor" })),
    segments: [],
    grounding: [],
    continuityVersionIds: [],
    offered: [],
    commandReceipts: [],
    dependencies: {},
  };
}
function forget(f: ReturnType<typeof fixture>, root: string, holder = f.mara) {
  const row = f.state.continuity.records.find((row) => row.id === root)!,
    key = continuityHolderKey(holder);
  f.state.continuity = protectContinuity(
    f.state.continuity,
    { id: root, recordRevision: row.revision, heads: { [key]: row.heads[key].revision } },
    [holder],
    "forget-" + root,
    at,
    { forget: true },
  );
}
function generated(f: ReturnType<typeof fixture>, id: string) {
  const capture = captureMailContext(f.state, "mara", "weather", at),
    mail = { id, at, from: f.exchange.incoming.to, to: f.exchange.incoming.from },
    result = acceptMailContinuity(
      f.state,
      mailStagePublication(
        capture,
        mail,
        "I will consider the weather before deciding.",
        "written",
        [],
        [],
        memoryHash(id),
        id,
      ),
      at,
    );
  assert.equal(result.held, false);
  assert(result.episode);
  return { capture, episode: result.episode };
}

await runCase("mail-delivery/history-provenance", () => {
  const f = fixture(),
    thought = scene(f, "private-narration"),
    text = "I hope to learn weaving privately.";
  thought.segments = [
    {
      id: "thought",
      role: "assistant",
      speakerId: "__venue_scene__",
      name: "Narration",
      kind: "narration",
      content: text,
      at,
      heardBy: ["mara"],
      zoneId: "parlor",
    },
  ];
  const source: ContinuityEvidence = {
    id: "private-thought",
    seed: f.state.seed,
    episodeId: thought.id,
    unitId: "thought",
    fingerprint: memoryHash(thought.segments[0]),
    excerpt: text,
    kind: "private",
    actorId: "mara",
    perceptions: [{ actorId: "mara", channel: "private", text }],
  };
  thought.grounding = [source];
  f.state.continuity = applyContinuityWrite(
    f.state.continuity,
    { id: "private", holders: [f.mara], owner: f.mara, class: "perspective", text, sourceIds: [source.id] },
    {
      seed: f.state.seed,
      episodeId: thought.id,
      operationId: thought.operationId,
      at,
      actors: thought.actors,
      sources: [source],
      supplied: [],
      protectedRoots: [],
    },
  );
  thought.continuityVersionIds = f.state.continuity.versions.map((version) => version.id);
  f.state.episodes = appendEpisode(f.state.episodes, thought, f.state.seed);
  const note = generated(f, "from-private-narration");
  assert.equal(
    note.capture.prompt.entries.length,
    0,
    "this case relies on history, not an independently selected current note",
  );
  assert(Object.values(note.capture.historical).some((row) => row.kind === "private" && row.unitId === "thought"));
  forget(f, f.state.continuity.records[0].id);
  f.cold();
  assert.equal(gmEpisodeView(note.episode, f.state.continuity, [f.mara], f.state.episodes), null);

  const g = fixture(),
    original = scene(g, "input-spans", "Rowan taught chair repair. Delia taught weaving.");
  original.grounding = ["Rowan taught chair repair.", "Delia taught weaving."].map((excerpt, index) => ({
    id: "span-" + index,
    seed: g.state.seed,
    episodeId: original.id,
    unitId: "input",
    fingerprint: memoryHash(original.privateInput),
    excerpt,
    kind: "speech",
    actorId: "player",
    range: {
      start: original.privateInput.indexOf(excerpt),
      end: original.privateInput.indexOf(excerpt) + excerpt.length,
    },
    perceptions: [{ actorId: "mara", channel: "words", text: excerpt }],
  }));
  for (const [index, source] of original.grounding.entries())
    g.state.continuity = applyContinuityWrite(
      g.state.continuity,
      { id: "span-" + index, holders: [g.mara], text: source.excerpt, sourceIds: [source.id] },
      {
        seed: g.state.seed,
        episodeId: original.id,
        operationId: original.operationId,
        at,
        actors: original.actors,
        sources: [source],
        supplied: [],
        protectedRoots: [],
      },
    );
  original.continuityVersionIds = g.state.continuity.versions.map((version) => version.id);
  g.state.episodes = appendEpisode(g.state.episodes, original, g.state.seed);
  forget(g, g.state.continuity.records[0].id);
  const surviving = generated(g, "from-surviving-input");
  assert(
    Object.values(surviving.capture.historical).some(
      (source) =>
        source.excerpt === "Delia taught weaving." && source.perceptions.some((row) => row.actorId === "mara"),
    ),
  );
  forget(g, g.state.continuity.records[1].id);
  g.cold();
  assert.equal(gmEpisodeView(surviving.episode, g.state.continuity, [g.mara], g.state.episodes), null);

  const h = fixture();
  h.state.villagers.push({
    characterId: "leo",
    incarnation: "one",
    cardSnapshot: { name: "Leo" },
  } as VillageState["villagers"][number]);
  const leo = continuityActor(h.state, "leo")!,
    privateLetter = {
      id: "leo-private",
      at,
      from: { id: leo.id, incarnation: leo.incarnation },
      to: h.exchange.incoming.from,
    };
  assert.equal(
    acceptMailContinuity(
      h.state,
      mailStagePublication(
        captureMailContext(h.state, "leo", "quiet", at),
        privateLetter,
        "A quiet note.",
        "written",
        [
          {
            id: "goal",
            for: ["leo"],
            owner: "leo",
            class: "desire",
            text: "I want to keep my own quiet studio.",
            source: ["self"],
          },
        ],
        [],
        memoryHash("leo"),
        "leo-private",
      ),
      at,
    ).held,
    false,
  );
  const privateView = continuityViews(h.state.continuity, leo, at, new Set())[0],
    hidden = scene(h, "third-holder");
  hidden.segments = [
    {
      id: "gm-only",
      role: "assistant",
      speakerId: "__venue_scene__",
      name: "Narration",
      kind: "narration",
      content: "An old wish still shapes the afternoon.",
      at,
      heardBy: [],
      zoneId: "parlor",
    },
  ];
  const anchor = continuityKnowledge(privateView, h.state.seed, hidden.id);
  hidden.grounding = [anchor];
  hidden.holderDependencies = { [continuityHolderKey(leo)]: { "gm-only": [continuitySourceUnit(anchor)] } };
  h.state.episodes = appendEpisode(h.state.episodes, hidden, h.state.seed);
  const inherited = generated(h, "from-third-holder");
  assert(inherited.capture.references.some((holder) => holder.id === "leo"));
  assert(
    !JSON.stringify(inherited.capture.prompt.history).includes('"knownBy":["leo"]'),
    "private provenance does not invent attendance",
  );
  forget(h, privateView.id, leo);
  h.cold();
  assert.equal(
    gmEpisodeView(inherited.episode, h.state.continuity, [h.mara], h.state.episodes),
    null,
    "private third-holder protection survives a Scene-to-mail hop",
  );
});
