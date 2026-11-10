// Test cases: continuity-storage/cold-history, continuity-storage/current-only, continuity-storage/publication-failure, continuity-storage/page-integrity, continuity-storage/offer-evidence, continuity-storage/native-replay
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
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import type { AcceptedEpisode } from "../packages/villages/src/server/domain/models/episode-model.js";
import {
  emptyContinuity,
  applyContinuityWrite,
  continuityHolderKey,
  continuityViews,
  protectContinuity,
} from "../packages/villages/src/server/domain/rules/continuity.js";
import { readAcceptedEpisode } from "../packages/villages/src/server/domain/decoding/episode-codec.js";
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

await runCase("continuity-storage/cold-history", async () => {
  const f = fixture();
  await f.seed();
  const root = f.rows.get("villages-village"),
    head = structuredClone(root.data.memoryHead);
  assert.equal(root.data.version, 18);
  for (const key of ["continuity", "episodes", "worldPlaces", "memories", "memoryScenes", "memoryReceipts"])
    assert.equal(Object.hasOwn(root.data, key), false, "history stays outside the authority root");
  const cold = await f.repository().readAuthority({ memories: true });
  assert.equal(cold.episodes.records[0].privateInput, episode().privateInput);
  assert.equal(cold.episodes.records[0].sceneId, "retired-scene");
  const unloaded = await f.repository().readAuthority();
  assert.throws(() => unloaded.episodes, /not loaded/);
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
