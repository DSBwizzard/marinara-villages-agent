// Test cases: continuity-storage/cold-history, continuity-storage/current-only, continuity-storage/publication-failure, continuity-storage/page-integrity, continuity-storage/offer-evidence, continuity-storage/native-replay, continuity-storage/mail-envelope, continuity-storage/mail-publication, continuity-storage/mail-pages, continuity-storage/mail-reply-order, continuity-storage/validated-reuse
import { emptyMailbox } from "../packages/villages/src/server/domain/decoding/mailbox-codec.js";
import { readMailboxState } from "../packages/villages/src/server/domain/decoding/mailbox-codec.js";
import { queueMailboxLetter } from "../packages/villages/src/server/domain/rules/social-mail.js";
import { mailReceipt, type MailIdentity } from "../packages/villages/src/server/domain/rules/mail-evidence.js";
import type { MailboxMessage } from "../packages/villages/src/server/domain/models/social-mail.js";
import assert from "node:assert/strict";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { runCase } from "../scripts/test-cases.mjs";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { createMemoryPayloadStore } from "../packages/villages/src/server/adapters/storage/memory-payload-store.js";
import {
  decodeContinuityPagesSync,
  encodeContinuityPages,
  readContinuityPageManifest,
  traceContinuityPages,
} from "../packages/villages/src/server/adapters/storage/continuity-pages.js";
import { createMemoryPageTracer } from "../packages/villages/src/server/adapters/storage/memory-pages.js";
import { appendEpisode } from "../packages/villages/src/server/domain/rules/episodes.js";
import { memoryHash, immutableMemoryValue } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import type { AcceptedEpisode } from "../packages/villages/src/server/domain/models/episode-model.js";
import {
  emptyContinuity,
  applyContinuityWrite,
  continuityHolderKey,
  continuityViews,
  protectContinuity,
} from "../packages/villages/src/server/domain/rules/continuity.js";
import { readAcceptedEpisode, readEpisodes } from "../packages/villages/src/server/domain/decoding/episode-codec.js";
import { readContinuity } from "../packages/villages/src/server/domain/decoding/continuity-codec.js";
import { retainNativeFact } from "../packages/villages/src/server/domain/rules/native-continuity.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { emptyPlaceRegistry } from "../packages/villages/src/server/domain/rules/places.js";

const at = "2026-11-09T12:00:00.000Z";
function episode(id = "one"): AcceptedEpisode {
  return {
    format: 1,
    id,
    seed: "world",
    sceneId: "retired-scene",
    submissionId: "submit-" + id,
    operationId: "operation-" + id,
    capturedAt: at,
    acceptedAt: at,
    responseDigest: memoryHash(id),
    admittedContinuityRevision: 0,
    privateInput: "  Why?\n*I privately wonder whether to trust her.* 👩🏽‍🚀  ",
    actors: [{ id: "player", incarnation: "one", zoneId: "parlor" }],
    segments: [],
    grounding: [],
    continuityVersionIds: [],
    offered: [],
    commandReceipts: [],
    dependencies: {},
  };
}
function fixture() {
  const rows = new Map<string, any>();
  let failCreateKind = "",
    conflicts = 0,
    writes = 0;
  const documents = {
    async getById(_pkg: string, id: string) {
      return structuredClone(rows.get(id) ?? null);
    },
    async list(_pkg: string, kind: string) {
      return [...rows.values()].filter((row) => row.kind === kind).map((row) => structuredClone(row));
    },
    async create(input: any) {
      writes++;
      if (input.kind === failCreateKind) throw new Error("injected create failure");
      assert.ok(!rows.has(input.id));
      const row = { ...structuredClone(input), revision: 1 };
      rows.set(row.id, row);
      return structuredClone(row);
    },
    async update(input: any) {
      writes++;
      const before = rows.get(input.id);
      if (!before || before.revision !== input.expectedRevision) return null;
      if (input.id === "villages-village" && conflicts) {
        conflicts--;
        before.revision++;
        before.data.name = "Concurrent title";
        return null;
      }
      const row = { ...before, ...structuredClone(input), revision: before.revision + 1 };
      rows.set(row.id, row);
      return structuredClone(row);
    },
    async remove(_pkg: string, id: string, revision: number) {
      writes++;
      return rows.get(id)?.revision === revision && rows.delete(id);
    },
  } as CapabilityDocumentStore;
  const repository = () => createVillageRepository(() => documents);
  const seed = () =>
    repository().mutateAuthority(
      (state) => {
        state.seed = "world";
        state.setupAt = at;
        state.foundedAt = at;
        state.episodes = appendEpisode(state.episodes, episode(), state.seed);
      },
      { memories: true },
    );
  return {
    rows,
    documents,
    repository,
    seed,
    fail(kind: string) {
      failCreateKind = kind;
    },
    conflict() {
      conflicts++;
    },
    get writes() {
      return writes;
    },
  };
}

function letterEpisode(mail: MailIdentity, text: string, phase: "written" | "read", acceptedAt = at): AcceptedEpisode {
  const receipt = mailReceipt("world", mail, text, phase);
  return {
    ...episode(receipt.id),
    id: receipt.id,
    operationId: receipt.id,
    submissionId: receipt.id,
    sceneId: undefined,
    privateInput: "",
    responseDigest: memoryHash(receipt),
    capturedAt: acceptedAt,
    acceptedAt,
    actors: (phase === "written" ? [mail.from] : [mail.from, mail.to]).map((actor) => ({
      id: actor.id,
      incarnation: actor.incarnation,
      zoneId: "native",
    })),
    commandReceipts: [receipt],
  };
}

await runCase("continuity-storage/validated-reuse", async () => {
  const f = fixture();
  await f.seed();
  await f.repository().mutateAuthority(
    (state) =>
      retainNativeFact(
        state,
        {
          id: "known",
          kind: "initialization",
          targetId: "known",
          revision: 1,
          text: "An exact native account.",
          witnesses: ["player"],
        },
        at,
      ),
    { memories: true },
  );
  const saved = await f.repository().readAuthority({ memories: true });
  readContinuity(saved.continuity, saved.seed);
  assert.throws(() => readContinuity({ ...saved.continuity }, "foreign"), /another world/);
  const invalidVersion = immutableMemoryValue({ ...saved.continuity.versions[0], text: "x".repeat(33000) });
  assert.throws(
    () => readContinuity({ ...saved.continuity, versions: [invalidVersion] }, saved.seed),
    /invalid|large|maximum|<=/i,
    "owned immutability alone cannot validate a foreign version",
  );
  const invalidHead = structuredClone(saved.continuity);
  Object.values(invalidHead.records[0].heads)[0].versionId = "missing-version";
  assert.throws(() => readContinuity(invalidHead, saved.seed), /holder head/);
  readEpisodes(saved.episodes, saved.seed);
  assert.throws(() => readEpisodes(saved.episodes, "foreign"), /world/);
  assert.throws(
    () => readEpisodes(immutableMemoryValue({ ...saved.episodes, revision: saved.episodes.revision + 1 }), saved.seed),
    /append revision/,
  );
  const mutable = structuredClone(saved.episodes);
  readEpisodes(mutable, saved.seed);
  mutable.records.push(structuredClone(mutable.records[0]));
  mutable.revision++;
  assert.throws(
    () => readEpisodes(mutable, saved.seed),
    /duplicate/,
    "a previously read mutable wrapper never becomes validation authority",
  );
});

await runCase("continuity-storage/cold-history", async () => {
  const f = fixture();
  await f.seed();
  const root = f.rows.get("villages-village"),
    head = structuredClone(root.data.memoryHead);
  assert.equal(root.data.version, 18);
  for (const key of ["continuity", "episodes", "worldPlaces", "mailbox", "memories", "memoryScenes", "memoryReceipts"])
    assert.equal(Object.hasOwn(root.data, key), false, "history stays outside the authority root");
  const cold = await f.repository().readAuthority({ memories: true });
  assert.equal(cold.episodes.records[0].privateInput, episode().privateInput);
  assert.equal(cold.episodes.records[0].sceneId, "retired-scene");
  const unloaded = await f.repository().readAuthority();
  assert.throws(() => unloaded.episodes, /not loaded/);
  assert.throws(() => unloaded.mailbox, /not loaded/);
  await f.repository().mutateAuthority((state) => {
    state.name = "New title";
  });
  assert.deepEqual(f.rows.get("villages-village").data.memoryHead, head);
  const payload = f.rows.get(head.id).data;
  assert.equal(payload.format, 3);
  const manifest = readContinuityPageManifest(JSON.parse(payload.payload));
  const decoded = decodeContinuityPagesSync(manifest, payload.world, "world", (id) => f.rows.get(id)?.data ?? null);
  assert.equal(decoded.value.episodes.records[0].privateInput, episode().privateInput);
  const pages = await traceContinuityPages(
    manifest,
    payload.world,
    createMemoryPageTracer(async (id) => f.rows.get(id)?.data ?? null),
  );
  assert.deepEqual([...pages].sort(), decoded.pageIds.sort(), "cleanup retains the complete current-format closure");
});

await runCase("continuity-storage/current-only", async () => {
  assert.throws(
    () => readAcceptedEpisode({} as any, undefined as any),
    /world identity/,
    "an absent cache entry and omitted seed cannot bypass episode validation",
  );
  const f = fixture();
  await f.seed();
  const root = f.rows.get("villages-village");
  root.data.version = 17;
  const before = structuredClone([...f.rows]),
    writes = f.writes;
  await assert.rejects(f.repository().readAuthority({ memories: true }), /Unsupported Village format/);
  await assert.rejects(
    f.repository().mutateAuthority(() => {
      throw new Error("must not run");
    }),
    /Unsupported Village format/,
  );
  assert.equal(f.writes, writes);
  assert.deepEqual([...f.rows], before, "rejecting an older world leaves every saved byte untouched");
  root.data.version = 18;
  const payload = f.rows.get(root.data.memoryHead.id);
  payload.data.format = 2;
  await assert.rejects(f.repository().readAuthority({ memories: true }), /payload changed/);
  assert.equal(f.writes, writes);
  assert.throws(
    () => readContinuityPageManifest({ format: 1, revision: 0, scenes: [] }),
    /unsupported|invalid|unknown/,
  );
});

await runCase("continuity-storage/native-replay", async () => {
  const f = fixture();
  await f.seed();
  const receipt = {
    id: "project-complete:roof",
    kind: "project" as const,
    targetId: "roof",
    revision: 1,
    text: "The roof repairs were completed.",
    witnesses: ["player"],
  };
  await f.repository().mutateAuthority(
    (state) => {
      retainNativeFact(state, receipt, at);
    },
    { memories: true },
  );
  let cold = await f.repository().readAuthority({ memories: true });
  const player = continuityActor(cold, "player")!;
  assert.equal(continuityViews(cold.continuity, player, at, new Set())[0].version.text, receipt.text);
  await f.repository().mutateAuthority(
    (state) => {
      const record = state.continuity.records[0],
        key = continuityHolderKey(player);
      state.continuity = protectContinuity(
        state.continuity,
        {
          id: record.id,
          recordRevision: record.revision,
          heads: { [key]: record.heads[key].revision },
        },
        [player],
        "forget-roof",
        at,
        { forget: true },
      );
      retainNativeFact(state, receipt, at);
    },
    { memories: true },
  );
  cold = await f.repository().readAuthority({ memories: true });
  assert.deepEqual(
    continuityViews(cold.continuity, player, at, new Set()),
    [],
    "replaying the native operation does not re-teach forgotten knowledge",
  );
  assert.equal(cold.episodes.records.length, 2);
  await assert.rejects(
    f.repository().mutateAuthority(
      (state) => {
        retainNativeFact(state, { ...receipt, text: "The roof was demolished." }, at);
      },
      { memories: true },
    ),
    /identity reused/,
  );
});

await runCase("continuity-storage/publication-failure", async () => {
  const f = fixture();
  await f.seed();
  const before = structuredClone(f.rows.get("villages-village")),
    previous = before.data.memoryHead;
  f.fail("memory-page");
  const append = () =>
    f.repository().mutateAuthority(
      (state) => {
        state.episodes = appendEpisode(state.episodes, episode("two"), state.seed);
      },
      { memories: true },
    );
  await assert.rejects(append(), /injected create failure/);
  assert.deepEqual(f.rows.get("villages-village"), before, "failed preparation cannot publish a partial episode");
  assert.ok(f.rows.has(previous.id), "the committed immutable root remains retained");
  f.fail("");
  f.conflict();
  await append();
  const cold = await f.repository().readAuthority({ memories: true });
  assert.equal(cold.name, "Concurrent title");
  assert.deepEqual(
    cold.episodes.records.map((row) => row.id),
    ["one", "two"],
  );
  await append();
  assert.equal(
    (await f.repository().readAuthority({ memories: true })).episodes.records.length,
    2,
    "accepted operation replay is idempotent",
  );
});

await runCase("continuity-storage/page-integrity", async () => {
  const f = fixture();
  await f.seed();
  const root = f.rows.get("villages-village"),
    head = root.data.memoryHead;
  const page = [...f.rows.values()].find((row) => row.kind === "memory-page" && row.data.node.type === "text");
  page.data.node.text += "corrupt";
  const before = structuredClone([...f.rows]),
    writes = f.writes;
  await assert.rejects(createMemoryPayloadStore(f.documents).read(head, root.data), /changed|digest/);
  assert.equal(f.writes, writes);
  assert.deepEqual([...f.rows], before, "corruption fails closed without repair or reset");
});

await runCase("continuity-storage/mail-envelope", async () => {
  const f = fixture();
  await f.seed();
  const mail = { id: "letter", at, from: { id: "player", incarnation: "one" }, to: { id: "mara", incarnation: "one" } },
    text = " \nPlease consider this, Mara. 🌿  ";
  await f.repository().mutateAuthority(
    (state) => {
      state.mailbox = queueMailboxLetter(state.mailbox, state.seed, mail, "request-one", text);
    },
    { memories: true },
  );
  const cold = await f.repository().readAuthority({ memories: true }),
    before = structuredClone(f.rows.get("villages-village"));
  assert.equal(cold.mailbox.messages.letter.text, text);
  assert.equal(cold.mailbox.messages.letter.status, "pending");
  assert.equal(cold.episodes.records.length, 1, "queuing words does not fabricate accepted interpretation");
  assert.equal(
    queueMailboxLetter(cold.mailbox, cold.seed, { ...mail, at: "2026-11-09T13:00:00.000Z" }, "request-one", text),
    cold.mailbox,
  );
  assert.throws(
    () =>
      queueMailboxLetter(
        cold.mailbox,
        cold.seed,
        { ...mail, to: { ...mail.to, incarnation: "replacement" } },
        "request-one",
        text,
      ),
    /different letter or correspondent/,
  );
  assert.throws(
    () => queueMailboxLetter(cold.mailbox, cold.seed, mail, "request-one", text + "changed"),
    /different letter/,
  );
  assert.throws(
    () => queueMailboxLetter(cold.mailbox, cold.seed, { ...mail, id: "second" }, "request-two", text),
    /pending letter/,
  );
  await assert.rejects(
    f.repository().mutateAuthority(
      (state) => {
        const old = state.mailbox.messages.letter;
        state.mailbox = {
          ...state.mailbox,
          revision: state.mailbox.revision + 1,
          messages: { letter: { ...old, status: "delivered", deliveredAt: at } },
        };
      },
      { memories: true },
    ),
    /accepted delivery/,
  );
  assert.deepEqual(f.rows.get("villages-village"), before, "delivery cannot publish separately from its evidence");
});

await runCase("continuity-storage/mail-publication", async () => {
  const f = fixture();
  await f.seed();
  const mail = { id: "reply", at, from: { id: "mara", incarnation: "one" }, to: { id: "player", incarnation: "one" } },
    text = "I will consider those conditions. 🌿";
  await f.repository().mutateAuthority(
    (state) => {
      state.mailbox = queueMailboxLetter(state.mailbox, state.seed, mail, "request-reply", text);
    },
    { memories: true },
  );
  const before = structuredClone(f.rows.get("villages-village"));
  const deliver = () =>
    f.repository().mutateAuthority(
      (state) => {
        state.episodes = appendEpisode(state.episodes, letterEpisode(mail, text, "written"), state.seed);
        state.mailbox = {
          ...state.mailbox,
          revision: state.mailbox.revision + 1,
          messages: {
            ...state.mailbox.messages,
            reply: { ...state.mailbox.messages.reply, status: "delivered", deliveredAt: at },
          },
        };
      },
      { memories: true },
    );
  f.fail("memory-page");
  await assert.rejects(deliver(), /injected create failure/);
  assert.deepEqual(f.rows.get("villages-village"), before, "a failed page cannot expose a delivered letter");
  f.fail("");
  f.conflict();
  await deliver();
  const unread = await f.repository().readAuthority({ memories: true });
  assert.equal(unread.name, "Concurrent title");
  assert.equal(unread.mailbox.messages.reply.status, "delivered");
  assert.equal(unread.mailbox.messages.reply.readAt, undefined);
  const later = "2026-11-09T13:00:00.000Z";
  await f.repository().mutateAuthority(
    (state) => {
      state.episodes = appendEpisode(state.episodes, letterEpisode(mail, text, "read", later), state.seed);
      state.mailbox = {
        ...state.mailbox,
        revision: state.mailbox.revision + 1,
        messages: {
          ...state.mailbox.messages,
          reply: { ...state.mailbox.messages.reply, readAt: later },
        },
      };
    },
    { memories: true },
  );
  const read = await f.repository().readAuthority({ memories: true });
  assert.equal(read.mailbox.messages.reply.readAt, later);
  assert.equal(read.episodes.records.length, 3);
  await assert.rejects(
    f.repository().mutateAuthority(
      (state) => {
        state.mailbox = { ...state.mailbox, revision: state.mailbox.revision + 1, messages: {} };
      },
      { memories: true },
    ),
    /lost its native envelope/,
  );
});

await runCase("continuity-storage/mail-pages", () => {
  const letters: Record<string, MailboxMessage> = {},
    records: AcceptedEpisode[] = [];
  for (let i = 0; i < 300; i++) {
    const letter: MailboxMessage = {
      id: "letter-" + i,
      requestId: "request-" + i,
      at,
      from: { id: "mara", incarnation: "one" },
      to: { id: "player", incarnation: "one" },
      text: "🌿".repeat(1998) + " " + String(i).padStart(3, "0"),
      status: "delivered",
      deliveredAt: at,
    };
    letters[letter.id] = letter;
    records.push(letterEpisode(letter, letter.text, "written"));
  }
  const payload = {
      continuity: emptyContinuity(),
      episodes: { format: 1 as const, revision: records.length, records },
      worldPlaces: emptyPlaceRegistry(),
      mailbox: readMailboxState({ format: 1, revision: 300, messages: letters }, "world"),
    },
    world = "a".repeat(32),
    first = encodeContinuityPages(payload, world),
    cold = decodeContinuityPagesSync(first.manifest, world, "world", (id) => first.pages.get(id) ?? null);
  const changed = {
    ...cold.value.mailbox,
    revision: 301,
    messages: {
      ...cold.value.mailbox.messages,
      "letter-299": { ...cold.value.mailbox.messages["letter-299"], error: "Retained local recovery detail" },
    },
  };
  const next = encodeContinuityPages(
    { ...cold.value, mailbox: readMailboxState(changed, "world") },
    world,
    cold.layout,
  );
  assert(first.serializedBytes > 1024 * 1024);
  assert(next.serializedBytes < 64 * 1024, "changing one envelope reuses all other immutable mail pages");
  const pages = new Map([...first.pages, ...next.pages]),
    reopened = decodeContinuityPagesSync(next.manifest, world, "world", (id) => pages.get(id) ?? null);
  assert.equal(Object.keys(reopened.value.mailbox.messages).length, 300);
  assert.equal(reopened.value.mailbox.messages["letter-0"].text, letters["letter-0"].text);
  assert.equal(reopened.value.mailbox.messages["letter-299"].error, "Retained local recovery detail");
  const missing = structuredClone(next.manifest) as Record<string, unknown>;
  delete missing.mailRevision;
  assert.throws(() => readContinuityPageManifest(missing), /unsupported/);
});

await runCase("continuity-storage/mail-reply-order", () => {
  const first: MailboxMessage = {
      id: "incoming",
      requestId: "request-incoming",
      at,
      from: { id: "player", incarnation: "one" },
      to: { id: "mara", incarnation: "one" },
      text: "Will you consider visiting the fair?",
      status: "delivered",
      deliveredAt: at,
      readAt: at,
    },
    reply: MailboxMessage = {
      id: "reply",
      requestId: "request-reply",
      at,
      from: first.to,
      to: first.from,
      text: "I will consider it.",
      status: "delivered",
      deliveredAt: at,
      readAt: at,
      replyTo: first.id,
    },
    records = [
      letterEpisode(first, first.text, "written"),
      letterEpisode(first, first.text, "read"),
      letterEpisode(reply, reply.text, "written"),
      letterEpisode(reply, reply.text, "read"),
    ],
    mailbox = { format: 1 as const, revision: 4, messages: { incoming: first, reply } },
    payload = {
      continuity: emptyContinuity(),
      episodes: { format: 1 as const, revision: 4, records },
      worldPlaces: emptyPlaceRegistry(),
      mailbox,
    },
    world = "a".repeat(32);
  const cold = (value: typeof payload) => {
    const packet = encodeContinuityPages(value, world);
    return decodeContinuityPagesSync(packet.manifest, world, "world", (id) => packet.pages.get(id) ?? null);
  };
  cold(payload);
  const cyclic = structuredClone(payload);
  cyclic.mailbox.messages.incoming.replyTo = reply.id;
  assert.throws(() => cold(cyclic), /cyclic letter reply/);
  const beforeRead = structuredClone(payload);
  beforeRead.episodes.records = [records[0], records[2], records[1], records[3]];
  assert.throws(() => cold(beforeRead), /predates the original accepted reading/);
  const beforeDelivery = structuredClone(payload);
  beforeDelivery.mailbox.messages.incoming.deliveredAt = "2026-11-09T13:00:00.000Z";
  beforeDelivery.mailbox.messages.incoming.readAt = "2026-11-09T13:00:00.000Z";
  assert.throws(() => cold(beforeDelivery), /original writing/);
});

await runCase("continuity-storage/offer-evidence", () => {
  const accepted = episode("offer");
  accepted.privateInput = "I will visit on Saturday if Mara brings the lantern.";
  accepted.actors.push({ id: "mara", incarnation: "one", zoneId: "parlor" });
  const actors = accepted.actors.map(({ id, incarnation }) => ({ kind: "actor" as const, id, incarnation }));
  const source = {
    id: "offered-terms",
    seed: "world",
    episodeId: accepted.id,
    unitId: "input",
    fingerprint: memoryHash(accepted.privateInput),
    range: { start: 0, end: accepted.privateInput.length },
    excerpt: accepted.privateInput,
    kind: "speech" as const,
    actorId: "player",
    act: "offer" as const,
    perceptions: [{ actorId: "mara", channel: "words" as const, text: accepted.privateInput }],
  };
  accepted.grounding = [source];
  const continuity = applyContinuityWrite(
    emptyContinuity(),
    {
      id: "offer",
      holders: actors,
      class: "commitment",
      text: accepted.privateInput,
      sourceIds: [source.id],
      offer: { proposer: "player", participants: ["player", "mara"] },
    },
    {
      seed: "world",
      operationId: accepted.operationId,
      episodeId: accepted.id,
      at,
      actors,
      sources: [source],
      supplied: [],
      protectedRoots: [],
    },
  );
  accepted.continuityVersionIds = continuity.versions.map((row) => row.id);
  const payload = {
    continuity,
    episodes: { format: 1 as const, revision: 1, records: [accepted] },
    worldPlaces: emptyPlaceRegistry(),
    mailbox: emptyMailbox(),
  };
  const world = "a".repeat(32);
  function cold(value: typeof payload) {
    const encoded = encodeContinuityPages(value, world);
    return decodeContinuityPagesSync(encoded.manifest, world, "world", (id) => encoded.pages.get(id) ?? null);
  }
  cold(payload);
  const wrongParty = structuredClone(payload);
  wrongParty.continuity.records[0].offer!.participants[0].incarnation = "replacement";
  wrongParty.continuity.records[0].offer!.proposer.incarnation = "replacement";
  assert.throws(
    () => cold(wrongParty),
    /canonical decision/,
    "retained consent belongs to the original speaker incarnation",
  );
  for (const change of [
    (value: typeof source) => {
      value.excerpt = "An invented unconditional promise.";
    },
    (value: typeof source) => {
      value.perceptions[0].text = "An invented unconditional promise.";
    },
    (value: typeof source) => {
      value.id = "fabricated-source";
    },
  ]) {
    const forged = structuredClone(payload);
    change(forged.continuity.records[0].offer!.events[0].sources[0] as typeof source);
    assert.throws(
      () => cold(forged),
      /canonical|projection|excerpt|communicated terms/,
      "digest-valid current pages cannot forge only the retained offer contribution",
    );
  }
});
