// Test cases: mail-continuity/written-private, mail-continuity/read-terms, mail-continuity/written-consent, mail-continuity/read-no-consent, mail-continuity/stage-identity, mail-continuity/replacement-disclosure, mail-continuity/protection, mail-continuity/source-integrity, mail-continuity/scene-context
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageState } from "../packages/villages/src/server/domain/models/world.js";
import type { AcceptedEpisode } from "../packages/villages/src/server/domain/models/episode-model.js";
import type {
  ContinuityTarget,
  ContinuityEvidence,
} from "../packages/villages/src/server/domain/models/continuity-model.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import {
  applyContinuityWrite,
  continuityHolderKey,
  continuityViews,
  continuityProtectionUnits,
  protectContinuity,
} from "../packages/villages/src/server/domain/rules/continuity.js";
import { prepareContinuityKeep } from "../packages/villages/src/server/domain/rules/narration-keep.js";
import {
  mailReceipt,
  mailEvidence,
  type MailIdentity,
} from "../packages/villages/src/server/domain/rules/mail-evidence.js";
import {
  appendEpisode,
  actorEpisodeView,
  gmEpisodeView,
} from "../packages/villages/src/server/domain/rules/episodes.js";
import {
  readAcceptedEpisode,
  episodeSourceGraph,
} from "../packages/villages/src/server/domain/decoding/episode-codec.js";
import { assertContinuityRetention } from "../packages/villages/src/server/domain/rules/continuity-retention.js";
import { assertNarrationDecision } from "../packages/villages/src/server/domain/rules/narration-access.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import {
  encodeContinuityPages,
  decodeContinuityPagesSync,
} from "../packages/villages/src/server/adapters/storage/continuity-pages.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  narrationContinuityContext,
  fittedNarrationReadset,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { venueFixture } from "./helpers/venues.fixture.js";

const at = "2026-11-09T12:00:00.000Z";
const terms =
  "Visit the fair together on Saturday only if Delia comes and the north path is open. Nobody must cancel work. 🌿";
function fixture() {
  const state = { ...defaultVillageState(), seed: "world", setupAt: at };
  state.villagers = [
    { characterId: "mara", incarnation: "one", cardSnapshot: { name: "Mara" } },
  ] as VillageState["villagers"];
  const player = continuityActor(state, "player")!,
    mara = continuityActor(state, "mara")!;
  const identity: MailIdentity = {
    id: "letter-one",
    at,
    from: { id: mara.id, incarnation: mara.incarnation },
    to: { id: player.id, incarnation: player.incarnation },
  };
  function target(id: string, holders = [mara, player]): ContinuityTarget {
    const record = state.continuity.records.find((record) => record.id === id)!;
    return {
      id,
      recordRevision: record.revision,
      heads: Object.fromEntries(
        holders
          .filter((holder) => record.heads[continuityHolderKey(holder)])
          .map((holder) => [continuityHolderKey(holder), record.heads[continuityHolderKey(holder)].revision]),
      ),
    };
  }
  function stage(
    mail: MailIdentity,
    text: string,
    phase: "written" | "read",
    raws: unknown[] = [],
    supplied: ContinuityTarget[] = [],
    act?: ContinuityEvidence["act"],
  ) {
    const receipt = mailReceipt(state.seed, mail, text, phase),
      before = state.continuity;
    const actors = (phase === "written" ? [mail.from] : [mail.from, mail.to]).map((actor) => ({
      kind: "actor" as const,
      ...actor,
    }));
    const episode: AcceptedEpisode = {
      format: 1,
      id: receipt.id,
      seed: state.seed,
      submissionId: receipt.id,
      operationId: receipt.id,
      capturedAt: at,
      acceptedAt: at,
      responseDigest: memoryHash([receipt, raws]),
      admittedContinuityRevision: before.revision,
      privateInput: "",
      actors: actors.map((actor) => ({ id: actor.id, incarnation: actor.incarnation, zoneId: "native" })),
      segments: [],
      grounding: [],
      continuityVersionIds: [],
      offered: [],
      commandReceipts: [receipt],
      dependencies: {},
    };
    const admission = {
      seed: state.seed,
      operationId: episode.operationId,
      episodeId: episode.id,
      at,
      actors,
      subjects: [player, mara],
      sources: [],
      supplied,
      protectedRoots: [],
    };
    for (const [ordinal, raw] of raws.entries()) {
      const prepared = prepareContinuityKeep(raw, ordinal, state.continuity, admission, {
        seed: state.seed,
        operationId: episode.operationId,
        episodeId: episode.id,
        actors,
        subjects: [player, mara],
        bindSource(ref) {
          assert.equal(ref, "letter");
          return mailEvidence(episode.id, state.seed, receipt, act);
        },
      });
      state.continuity = applyContinuityWrite(state.continuity, prepared.write, prepared.admission);
      for (const source of prepared.sources)
        if (!episode.grounding.some((row) => row.id === source.id)) episode.grounding.push(source);
    }
    episode.continuityVersionIds = state.continuity.versions.slice(before.versions.length).map((version) => version.id);
    state.episodes = appendEpisode(state.episodes, episode, state.seed);
    assertContinuityRetention(state.continuity, state.episodes);
    return { episode, receipt };
  }
  const rows = (holder = player) =>
    continuityViews(
      state.continuity,
      holder,
      at,
      continuityProtectionUnits(state.continuity, holder, episodeSourceGraph(state.episodes.records, holder)),
    );
  function cold() {
    const scope = "a".repeat(32),
      packet = encodeContinuityPages(
        { continuity: state.continuity, episodes: state.episodes, worldPlaces: state.worldPlaces },
        scope,
      );
    Object.assign(
      state,
      decodeContinuityPagesSync(packet.manifest, scope, state.seed, (id) => packet.pages.get(id) ?? null).value,
    );
  }
  return { state, identity, player, mara, stage, target, rows, cold };
}

await runCase("mail-continuity/written-private", () => {
  const f = fixture(),
    { episode } = f.stage(f.identity, terms, "written");
  assert.deepEqual(f.state.continuity.records, [], "routine letters need no fabricated Memory");
  assert.equal(gmEpisodeView(episode, f.state.continuity, [f.player], f.state.episodes), null);
  assert.equal(actorEpisodeView(episode, f.state.continuity, f.mara, f.state.episodes)?.letters[0].text, terms);
  assert.equal(actorEpisodeView(episode, f.state.continuity, f.player, f.state.episodes), null);
  f.cold();
  assert(!f.state.episodes.records[0].sceneId);
  assert.deepEqual(f.state.episodes.records[0].segments, []);
  const exact = " \n" + "🌿".repeat(1997) + "\n   ";
  assert.equal(exact.length, 4000);
  f.stage({ ...f.identity, id: "long-verbatim-letter" }, exact, "written");
  f.cold();
  assert.equal(
    actorEpisodeView(f.state.episodes.records[1], f.state.continuity, f.mara, f.state.episodes)?.letters[0].text,
    exact,
    "the maximum legal Unicode letter retains every original whitespace byte",
  );
});

await runCase("mail-continuity/read-terms", () => {
  const f = fixture();
  f.stage(
    f.identity,
    terms,
    "written",
    [
      {
        id: "offer",
        for: ["mara"],
        class: "commitment",
        text: terms,
        offer: { proposer: "mara", participants: ["mara", "player"] },
        source: ["letter"],
      },
    ],
    [],
    "offer",
  );
  const root = f.state.continuity.records[0];
  assert.deepEqual(f.rows(), []);
  f.stage(
    f.identity,
    terms,
    "read",
    [{ id: "learn", replace: root.id, for: ["player"], source: ["letter"] }],
    [f.target(root.id)],
  );
  f.cold();
  assert.equal(f.rows()[0].version.text, terms);
  assert.equal(f.rows()[0].offer?.state, "offered");
  const source = f.rows()[0].offer!.contributions[0].sources[0];
  assert.equal(source.kind, "written");
  assert.equal(source.act, undefined, "reading old words does not forge a new canonical decision act");
  assert.equal(source.episodeId, f.state.episodes.records[1].id);
});

await runCase("mail-continuity/written-consent", () => {
  const f = fixture();
  f.stage(
    f.identity,
    terms,
    "written",
    [
      {
        id: "offer",
        for: ["mara"],
        class: "commitment",
        text: terms,
        offer: { proposer: "mara", participants: ["mara", "player"] },
        source: ["letter"],
      },
    ],
    [],
    "offer",
  );
  const root = f.state.continuity.records[0];
  f.stage(
    f.identity,
    terms,
    "read",
    [{ id: "learn", replace: root.id, for: ["player"], source: ["letter"] }],
    [f.target(root.id)],
  );
  const reply = { ...f.identity, id: "letter-two", from: f.identity.to, to: f.identity.from },
    text = "I accept those exact Saturday terms, including Delia and the open path.";
  f.stage(
    reply,
    text,
    "written",
    [{ id: "accept", replace: root.id, for: ["player"], accept: "player", source: ["letter"] }],
    [f.target(root.id)],
    "accept",
  );
  assert.equal(f.rows()[0].offer?.state, "accepted");
  assert.equal(f.rows(f.mara)[0].offer?.state, "offered", "an unread reply teaches no acceptance");
  f.stage(
    reply,
    text,
    "read",
    [{ id: "learn", replace: root.id, for: ["mara"], source: ["letter"] }],
    [f.target(root.id)],
  );
  f.cold();
  assert.equal(f.rows(f.mara)[0].offer?.state, "accepted");
  assert.equal(f.rows(f.mara)[0].version.text, terms);
  assert.equal(
    f.state.continuity.records[0].offer!.events.length,
    2,
    "late reading adds knowledge, not duplicate consent",
  );
});

await runCase("mail-continuity/read-no-consent", () => {
  const f = fixture();
  f.stage(
    f.identity,
    terms,
    "written",
    [
      {
        id: "offer",
        for: ["mara"],
        class: "commitment",
        text: terms,
        offer: { proposer: "mara", participants: ["mara", "player"] },
        source: ["letter"],
      },
    ],
    [],
    "offer",
  );
  const root = f.state.continuity.records[0];
  f.stage(
    f.identity,
    terms,
    "read",
    [{ id: "learn", replace: root.id, for: ["player"], source: ["letter"] }],
    [f.target(root.id)],
  );
  const mail = { ...f.identity, id: "non-deciding-reply", from: f.identity.to, to: f.identity.from };
  const text = "I received your proposal and will consider it.";
  f.stage(mail, text, "written");
  const { receipt, episode } = f.stage(mail, text, "read");
  for (const act of ["accept", "refuse", "withdraw"] as const) {
    assert.throws(() => mailEvidence(episode.id, f.state.seed, receipt, act), /cannot create a decision/);
    const source = {
      ...mailEvidence(episode.id, f.state.seed, receipt),
      id: "mail-source-" + memoryHash([episode.id, receipt.id, act]).slice(0, 32),
      act,
    };
    assert.throws(
      () => readAcceptedEpisode({ ...episode, grounding: [source] }, f.state.seed),
      /cannot create a decision/,
    );
    const target = f.target(root.id);
    assert.throws(
      () =>
        applyContinuityWrite(
          f.state.continuity,
          {
            id: "forged-" + act,
            holders: [f.player],
            target,
            sourceIds: [source.id],
            ...(act === "accept"
              ? { accept: "player" }
              : { closeOffer: { by: "player", reason: act === "refuse" ? "refused" : "withdrawn" } }),
          },
          {
            seed: f.state.seed,
            operationId: episode.id,
            episodeId: episode.id,
            at,
            actors: [f.mara, f.player],
            supplied: [target],
            protectedRoots: [],
            sources: [source],
          },
        ),
      /actual deciding speech/,
    );
  }
  assert.equal(f.state.continuity.records[0].offer!.events.length, 1);
  f.cold();
});

await runCase("mail-continuity/stage-identity", () => {
  const f = fixture(),
    { episode } = f.stage(f.identity, terms, "written");
  const structural = mailReceipt(f.state.seed, { ...f.identity, from: f.mara, to: f.player }, terms, "written");
  assert.deepEqual(structural, episode.commandReceipts[0], "actor holders are normalized at the receipt boundary");
  for (const changed of [
    { mail: f.identity, text: "Different terms" },
    { mail: { ...f.identity, from: { ...f.identity.from, incarnation: "replacement" } }, text: terms },
    { mail: { ...f.identity, to: { ...f.identity.to, incarnation: "replacement-player" } }, text: terms },
  ]) {
    const receipt = mailReceipt(f.state.seed, changed.mail, changed.text, "written");
    const conflicting = {
      ...episode,
      id: receipt.id,
      operationId: receipt.id,
      submissionId: receipt.id,
      commandReceipts: [receipt],
      actors: [{ ...receipt.mail!.from, zoneId: "native" }],
    };
    assert.throws(() => appendEpisode(f.state.episodes, conflicting, f.state.seed), /message identity changed/);
  }
  const read = f.stage(f.identity, terms, "read").episode;
  assert.equal(appendEpisode(f.state.episodes, read, f.state.seed), f.state.episodes, "exact read replay is inert");
  assert.throws(
    () =>
      appendEpisode(
        f.state.episodes,
        {
          ...read,
          id: "another-read",
          operationId: "another-read",
          submissionId: "another-read",
        },
        f.state.seed,
      ),
    /canonical episode identity/,
  );
  f.cold();
});

await runCase("mail-continuity/replacement-disclosure", () => {
  const f = fixture();
  f.stage(
    f.identity,
    terms,
    "written",
    [
      {
        id: "offer",
        for: ["mara"],
        class: "commitment",
        text: terms,
        offer: { proposer: "mara", participants: ["mara", "player"] },
        source: ["letter"],
      },
    ],
    [],
    "offer",
  );
  const root = f.state.continuity.records[0];
  f.stage(
    f.identity,
    terms,
    "read",
    [{ id: "learn", replace: root.id, for: ["player"], source: ["letter"] }],
    [f.target(root.id)],
  );
  f.state.villagers[0].incarnation = "replacement";
  const replacement = continuityActor(f.state, "mara")!,
    mail = {
      ...f.identity,
      id: "report-to-replacement",
      from: f.identity.to,
      to: { id: replacement.id, incarnation: replacement.incarnation },
    };
  const report = "The former Mara once offered a Saturday fair visit with these conditions: " + terms;
  f.stage(mail, report, "written");
  const supplied = f.target(root.id),
    target = { ...supplied, heads: { ...supplied.heads, [continuityHolderKey(replacement)]: 0 } };
  f.stage(mail, report, "read", [{ id: "learn", replace: root.id, for: ["mara"], source: ["letter"] }], [target]);
  assert.equal(f.rows(replacement)[0].version.text, terms);
  assert.deepEqual(
    f.rows(replacement)[0].offer?.contributions,
    [],
    "a fresh disclosure does not inherit a predecessor's words",
  );
  assert.equal(f.rows(f.mara)[0].offer?.contributions[0].by, "mara", "the original author retains her own evidence");
  f.cold();
});

await runCase("mail-continuity/protection", () => {
  const f = fixture();
  f.stage(f.identity, terms, "written");
  const { episode } = f.stage(f.identity, terms, "read", [
    {
      id: "learn",
      for: ["player"],
      class: "information",
      text: "Mara wrote that the fair visit depends on Delia and the path.",
      source: ["letter"],
    },
  ]);
  const root = f.state.continuity.records[0];
  f.state.continuity = protectContinuity(f.state.continuity, f.target(root.id), [f.player], "forget-letter", at, {
    forget: true,
  });
  f.cold();
  assert.deepEqual(actorEpisodeView(episode, f.state.continuity, f.player, f.state.episodes)?.letters, []);
  assert.equal(gmEpisodeView(episode, f.state.continuity, [f.player], f.state.episodes), null);
  assert.deepEqual(f.rows(), []);
});

await runCase("mail-continuity/source-integrity", () => {
  const f = fixture(),
    { receipt, episode } = f.stage(f.identity, terms, "written");
  const leaked = structuredClone(episode),
    proof = mailEvidence(episode.id, f.state.seed, receipt);
  leaked.grounding = [
    { ...proof, perceptions: [...proof.perceptions, { actorId: "player", channel: "words", text: terms }] },
  ];
  assert.throws(() => readAcceptedEpisode(leaked, f.state.seed), /unknown episode source witness|letter or readers/);
  const claimed = structuredClone(episode);
  claimed.commandReceipts[0].text = "Mara says the roof was rebuilt.";
  assert.throws(() => readAcceptedEpisode(claimed, f.state.seed), /letter content/);
  const changed = structuredClone(episode);
  changed.actors[0].incarnation = "replacement";
  assert.throws(() => readAcceptedEpisode(changed, f.state.seed), /correspondent incarnation/);
  assert.throws(
    () =>
      assertNarrationDecision(f.state, "mara", { seed: f.state.seed, episodeId: episode.id, actors: [f.mara] } as any, [
        proof,
      ]),
    /complete current communication/,
  );
  assert.throws(
    () =>
      applyContinuityWrite(
        f.state.continuity,
        {
          id: "fake-roof",
          holders: [{ kind: "room", placeId: "house", zoneId: "parlor" }],
          text: "The roof was rebuilt.",
          sourceIds: [proof.id],
        },
        {
          seed: f.state.seed,
          episodeId: episode.id,
          operationId: "fake-roof",
          at,
          actors: [f.mara],
          room: { kind: "room", placeId: "house", zoneId: "parlor" },
          sources: [proof],
          supplied: [],
          protectedRoots: [],
        },
      ),
    /actual outcome/,
  );
  const read = mailReceipt(f.state.seed, f.identity, terms, "read");
  const readEpisode = {
    ...episode,
    id: read.id,
    operationId: read.id,
    submissionId: read.id,
    commandReceipts: [read],
    actors: [f.mara, f.player].map((actor) => ({ id: actor.id, incarnation: actor.incarnation, zoneId: "native" })),
  };
  assert.throws(
    () => appendEpisode({ format: 1, revision: 0, records: [] }, readEpisode, f.state.seed),
    /original writing/,
  );
  for (const end of ["from", "to"] as const) {
    const forged = mailReceipt(
      f.state.seed,
      { ...f.identity, [end]: { ...f.identity[end], incarnation: "replacement" } },
      terms,
      "read",
    );
    const actors = [forged.mail!.from, forged.mail!.to].map((actor) => ({ ...actor, zoneId: "native" }));
    assert.throws(
      () =>
        appendEpisode(
          f.state.episodes,
          {
            ...readEpisode,
            id: forged.id,
            operationId: forged.id,
            submissionId: forged.id,
            commandReceipts: [forged],
            actors,
          },
          f.state.seed,
        ),
      /original writing/,
      "digest-valid replacement endpoints cannot adopt old writing",
    );
  }
  const strengthened = structuredClone(episode);
  strengthened.grounding = [
    { ...proof, kind: "native", actorId: undefined, unitId: "native:" + receipt.id, fingerprint: memoryHash(receipt) },
  ];
  assert.throws(
    () => readAcceptedEpisode(strengthened, f.state.seed),
    /native source/,
    "a written claim cannot be upgraded to a native fact",
  );
});

await runCase("mail-continuity/scene-context", () => {
  const f = fixture();
  f.stage(f.identity, terms, "written");
  const read = f.stage(f.identity, terms, "read");
  const venue = venueFixture({ id: "cafe" }),
    zoneId = venue.zones!.find((zone) => zone.kind !== "exterior")!.id;
  f.state.venues = [venue];
  const scene = zoneEventScene(
    coerceSession({
      version: 5,
      id: "scene",
      sceneRevision: 1,
      placeId: venue.id,
      villageSeed: f.state.seed,
      zoneId,
      activeIds: ["mara"],
      participants: [{ characterId: "mara", name: "Mara", doing: "Talking" }],
      sceneAttendance: {
        capturedAt: at,
        layout: captureSceneLayout(venue),
        occupants: [{ characterId: "mara", name: "Mara", doing: "Talking", zoneId }],
      },
    }),
    venue,
  );
  const context = narrationContinuityContext(f.state, scene, venue, "follow-up", "About your Saturday letter—why?", at);
  const fit = fittedNarrationReadset(
    f.state,
    context,
    context.parts.flatMap((part) => (part.block.evidenceId ? [part.block.evidenceId] : [])),
  );
  assert(
    Object.values(fit.source.historical).some(
      (source) =>
        source.kind === "written" &&
        source.episodeId === read.episode.id &&
        source.perceptions.some((row) => row.actorId === "player"),
    ),
  );
  const prompt = context.parts.map((part) => part.block.text).join("\n");
  assert(prompt.includes(terms));
  assert(prompt.includes('"letters"'));
  f.state.villagers[0].incarnation = "replacement";
  const replaced = narrationContinuityContext(
    f.state,
    { ...scene, id: "new-scene" },
    venue,
    "replacement-follow-up",
    "About that Saturday letter.",
    at,
  );
  const oldLetter = replaced.parts
    .map((part) => JSON.parse(part.block.text))
    .find((part) => part.interaction?.letters?.length);
  assert.deepEqual(
    oldLetter.interaction.formerActors,
    ["mara"],
    "old written authors never become a same-ID replacement in the prompt",
  );
  const spoken: AcceptedEpisode = {
    ...read.episode,
    id: "old-conversation",
    operationId: "old-conversation",
    sceneId: "old-scene",
    commandReceipts: [],
    actors: [
      { id: "player", incarnation: f.player.incarnation, zoneId },
      { id: "mara", incarnation: "one", zoneId },
      { id: "leo", incarnation: "one", zoneId },
    ],
    segments: [
      {
        id: "old-words",
        speakerId: "mara",
        name: "Mara",
        role: "assistant",
        kind: "dialogue",
        content: "I will ask about the Saturday letter.",
        at,
        zoneId,
        heardBy: ["player", "mara"],
      },
    ],
  };
  f.state.episodes = appendEpisode(f.state.episodes, spoken, f.state.seed);
  f.state.villagers.push({
    characterId: "leo",
    incarnation: "replacement",
    cardSnapshot: { name: "Leo" },
  } as VillageState["villagers"][number]);
  const speechContext = narrationContinuityContext(
    f.state,
    { ...scene, id: "third-scene" },
    venue,
    "speech-follow-up",
    "About Saturday?",
    at,
  );
  const oldTalk = speechContext.parts
    .map((part) => JSON.parse(part.block.text))
    .find((part) => part.interaction?.id === spoken.id);
  assert.deepEqual(
    oldTalk.interaction.formerActors,
    ["mara"],
    "identity labels cannot reveal an unseen former attendee",
  );
  assert(
    f.state.episodes.records
      .filter((episode) => episode.commandReceipts.some((receipt) => receipt.mail))
      .every((episode) => !episode.sceneId),
    "letter recall creates no Scene or attendance",
  );
});
