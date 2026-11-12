// Test cases: storage-fixture/world, storage-fixture/scene, storage-fixture/background, storage-fixture/publication, storage-fixture/seeding, storage-fixture/current-only
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { runCase } from "../scripts/test-cases.mjs";
import {
  authorVillageFixture,
  authorSceneFixture,
  authorBackgroundFixture,
  fixtureVillageState,
  fixtureSceneState,
  villageFixtureDocuments,
  seedVillageFixtureDocuments,
} from "./helpers/village-storage.fixture.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { createSceneHistory } from "../packages/villages/src/server/adapters/storage/scene-history.js";
import {
  backgroundResponseOwners,
  backgroundHistoryId,
  validateBackgroundResponse,
  validateBackgroundJobRecord,
} from "../packages/villages/src/server/adapters/storage/background-responses.js";
import { backgroundSlotId } from "../packages/villages/src/server/domain/rules/background-revision.js";
import { retainNativeFact } from "../packages/villages/src/server/domain/rules/native-continuity.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { appendEpisode } from "../packages/villages/src/server/domain/rules/episodes.js";
import { appendSceneInput } from "../packages/villages/src/server/domain/rules/scene-input.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import type { VenueSubmission } from "../packages/villages/src/server/domain/models/scene-model.js";
import { terminalForScene, readSceneTerminal } from "../packages/villages/src/server/features/scenes/scene-terminal.js";

const at = "2026-11-10T12:00:00.000Z";
const input = "  *I privately doubt her.*\nI say, ‘Hello, 🪑.’  \n";
function fixture() {
  const rows = new Map<string, any>();
  let writes = 0,
    failKind = "";
  const row = (id: string, kind: string, data: unknown) => ({
    id,
    kind,
    data: structuredClone(data),
    packageId: "villages",
    revision: 1,
    name: "Fixture",
    description: "",
    createdAt: at,
    updatedAt: at,
  });
  const documents = {
    async getById(_pkg: string, id: string) {
      return structuredClone(rows.get(id) ?? null);
    },
    async list(_pkg: string, kind: string) {
      return structuredClone([...rows.values()].filter((item) => item.kind === kind));
    },
    async create(value: any) {
      writes++;
      if (value.kind === failKind) throw Error("injected fixture page failure");
      assert(!rows.has(value.id));
      const saved = { ...structuredClone(value), revision: 1 };
      rows.set(saved.id, saved);
      return structuredClone(saved);
    },
    async update(value: any) {
      writes++;
      const before = rows.get(value.id);
      if (!before || before.revision !== value.expectedRevision) return null;
      const saved = { ...before, ...structuredClone(value), revision: before.revision + 1 };
      rows.set(saved.id, saved);
      return structuredClone(saved);
    },
    async remove(_pkg: string, id: string, revision: number) {
      return rows.get(id)?.revision === revision && rows.delete(id);
    },
  } as CapabilityDocumentStore;
  return {
    rows,
    row,
    documents,
    get writes() {
      return writes;
    },
    fail(kind: string) {
      failKind = kind;
    },
  };
}
function world() {
  const state = { ...defaultVillageState(), seed: "fixture-world", setupAt: at, foundedAt: at };
  retainNativeFact(
    state,
    { id: "private-note", kind: "initialization", targetId: "player", revision: 1, text: input, witnesses: ["player"] },
    at,
  );
  state.episodes = appendEpisode(
    state.episodes,
    {
      format: 1,
      id: "episode",
      seed: state.seed,
      sceneId: "scene",
      submissionId: "submission",
      operationId: "operation",
      capturedAt: at,
      acceptedAt: at,
      responseDigest: memoryHash(input),
      admittedContinuityRevision: state.continuity.revision,
      privateInput: input,
      actors: [{ id: "player", incarnation: continuityActor(state, "player")!.incarnation, zoneId: "parlor" }],
      segments: [],
      grounding: [],
      continuityVersionIds: [],
      offered: [],
      commandReceipts: [],
      dependencies: {},
    },
    state.seed,
  );
  return state;
}
function scene() {
  const turn: VenueSubmission = {
    id: "submission",
    message: input,
    mode: "chat",
    targetId: "",
    at,
    requestFingerprint: memoryHash(input),
    acceptance: { status: "applied", rejected: [] },
    episodeId: "episode",
    progressProcessedAt: at,
  };
  const value = coerceSession({
    version: 5,
    id: "scene",
    villageSeed: "fixture-world",
    startedAt: at,
    lastActivityAt: at,
    status: "active",
    sceneRevision: 1,
    submissions: [turn],
  });
  appendSceneInput(value, turn);
  value.operation = {
    id: "operation",
    kind: "reply",
    input: { submissionId: turn.id, message: input },
    token: "token",
    attemptId: "attempt",
    status: "interrupted",
    stage: "gm",
    startedAt: at,
    sceneRevision: 1,
    snapshot: structuredClone(value),
    checkpoints: { admission: { original: input } },
    attempts: { gm: { status: "complete", result: { content: "A saved response. 👩🏽‍🚀", finishReason: "stop" } } },
    error: "Save interrupted",
  };
  return value;
}
function job() {
  return {
    id: "job",
    kind: "agenda",
    subjectId: "resident",
    seed: "fixture-world",
    instanceId: randomUUID(),
    attempt: 1,
    input: { day: "2026-11-10" },
    steps: [
      {
        key: "agenda",
        fingerprint: "fingerprint",
        status: "completed",
        response: { content: input, finishReason: "stop" },
      },
    ],
  };
}

await runCase("storage-fixture/world", async () => {
  const f = fixture(),
    state = world(),
    root = authorVillageFixture(f.rows, state);
  f.rows.set("villages-village", f.row("villages-village", "village", root));
  for (const key of ["continuity", "episodes", "worldPlaces", "mailbox"]) assert(!Object.hasOwn(root, key));
  assert.equal(f.rows.get(root.memoryHead.id).data.format, 3);
  const cold = await createVillageRepository(() => f.documents).readAuthority({ memories: true });
  assert.deepEqual(cold.continuity, state.continuity);
  assert.deepEqual(cold.episodes, state.episodes);
  assert.equal(cold.episodes.records.find((episode) => episode.id === "episode")?.privateInput, input);
  assert.deepEqual(fixtureVillageState(root, f.rows), cold);
  assert.equal(f.writes, 0);
  const body = f.rows.get(root.memoryHead.id);
  body.data.payload += " ";
  await assert.rejects(createVillageRepository(() => f.documents).readAuthority({ memories: true }));
  assert.throws(() => fixtureVillageState(root, f.rows));
});

await runCase("storage-fixture/scene", async () => {
  const f = fixture(),
    logical = scene(),
    root = authorSceneFixture(f.rows, logical);
  const cold = await createSceneHistory(f.documents).decode(root),
    inspected = fixtureSceneState(root, f.rows);
  for (const value of [cold, inspected]) {
    assert.equal(value.lines[0].content, input);
    assert.equal(value.lines[0].kind, "input");
    assert.deepEqual(value.lines[0].heardBy, []);
    assert.equal(value.submissions[0].message, input);
    assert.deepEqual(value.operation?.checkpoints.admission, { original: input });
    assert.deepEqual(value.operation?.attempts.gm.result, logical.operation?.attempts.gm.result);
    const admitted = await createSceneHistory(f.documents).decode(value.operation!.snapshot);
    assert.equal(admitted.submissions[0].message, input);
    assert.deepEqual(admitted.lines[0].heardBy, []);
  }
  const wrong = scene();
  wrong.operation!.attempts.gm.response = { ...root.operation.attempts.gm.response, claim: "another-owner" };
  assert.throws(() => authorSceneFixture(new Map(), wrong), /another operation|another.*attempt/);
  for (const evidenceFormat of [0, 1, null]) {
    const mixed = scene();
    mixed.operation = { ...root.operation, attempts: {}, snapshot: null, evidenceFormat } as any;
    assert.throws(() => authorSceneFixture(new Map(), mixed), /cannot re-author stored operation evidence/);
  }
  const abandoned = structuredClone(root.operation);
  abandoned.snapshot = null;
  abandoned.status = "complete";
  const next = coerceSession({ ...logical, operation: undefined, abandonedOperations: [abandoned] });
  assert.deepEqual(
    authorSceneFixture(f.rows, next).abandonedOperations,
    [abandoned],
    "opaque abandoned purchases are not rewritten",
  );
  const body = f.rows.get(root.operation.attempts.gm.response.id);
  body.data.payload += " ";
  await assert.rejects(createSceneHistory({ ...f.documents }).decode(root));
});

await runCase("storage-fixture/background", () => {
  const f = fixture(),
    logical = job(),
    native = authorBackgroundFixture(f.rows, logical);
  validateBackgroundJobRecord(f.row(backgroundSlotId(native), "background-work", native));
  const owner = backgroundResponseOwners(native)[0],
    body = f.rows.get(owner.claim.id);
  assert(!Object.hasOwn(native.steps[0], "response"));
  assert.equal(validateBackgroundResponse(body, owner).response.content, input);
  const wrong = { ...logical, steps: [{ ...logical.steps[0], responseClaim: { ...owner.claim, id: "wrong-owner" } }] };
  assert.throws(() => authorBackgroundFixture(new Map(), wrong), /claim changed/);
  for (const invalid of [{ responseClaim: null }, { responseRef: null }])
    assert.throws(() =>
      authorBackgroundFixture(new Map(), { ...logical, steps: [{ ...logical.steps[0], ...invalid }] }),
    );
  const tagged = { ...logical, responseStorage: undefined };
  assert.equal(authorBackgroundFixture(new Map(), tagged), tagged);
  assert.throws(() => backgroundResponseOwners(tagged), /unsupported background format/);
  const malformed = {
    ...native,
    steps: [{ ...native.steps[0], responseRef: { id: "wrong-owner", digest: owner.ref!.digest } }],
  };
  assert.equal(authorBackgroundFixture(new Map(), malformed), malformed);
  assert.throws(() => backgroundResponseOwners(malformed), /reference changed/);
  assert.throws(() => authorBackgroundFixture(new Map(), { ...logical, instanceId: undefined }), /instance identity/);
});

await runCase("storage-fixture/publication", async () => {
  const f = fixture(),
    logical = world();
  f.rows.set("villages-village", f.row("villages-village", "village", logical));
  const documents = villageFixtureDocuments(f.documents);
  assert.equal(villageFixtureDocuments(documents), documents);
  const root = await documents.getById("villages", "villages-village");
  assert(root);
  await createVillageRepository(() => documents).readAuthority({ memories: true });
  assert.equal(f.writes, 0, "reading a fresh fixture does not write storage");
  f.fail("memory-page");
  const update = { id: root.id, packageId: "villages", expectedRevision: root.revision, data: root.data };
  await assert.rejects(documents.update(update), /injected fixture page failure/);
  assert.equal(f.rows.get(root.id).revision, 1, "a page failure cannot publish an incomplete parent");
  f.fail("");
  assert(await documents.update(update));
  const cold = await createVillageRepository(() => f.documents).readAuthority({ memories: true });
  assert.deepEqual(cold.episodes, logical.episodes);
  const body = f.rows.get((root.data as any).memoryHead.id);
  body.data.payload += " ";
  await assert.rejects(
    createVillageRepository(() => documents).readAuthority({ memories: true }),
    undefined,
    "physical corruption is not replaced by virtual fixture data",
  );
});

await runCase("storage-fixture/seeding", async () => {
  const f = fixture(),
    logical = scene();
  f.rows.set("villages-village", f.row("villages-village", "village", world()));
  f.rows.set(logical.id, f.row(logical.id, "venue-visit", logical));
  const nativeJob = authorBackgroundFixture(f.rows, job()),
    historyId = backgroundHistoryId(nativeJob);
  f.rows.set(historyId, f.row(historyId, "background-history", nativeJob));
  const terminalId = "villages-scene-terminal-" + logical.id;
  f.rows.set(
    terminalId,
    f.row(terminalId, "scene-terminal", terminalForScene({ ...logical, status: "closed", endedAt: at }, 2)),
  );
  await seedVillageFixtureDocuments(f.documents);
  assert.equal(
    (await createSceneHistory(f.documents).decode(f.rows.get(logical.id).data)).submissions[0].message,
    input,
  );
  await createVillageRepository(() => f.documents).readAuthority({ memories: true });
  assert.equal(f.rows.get(historyId).revision, 1, "immutable response owners retain their original revision");
  assert.equal(
    readSceneTerminal(f.rows.get(terminalId).data, logical.id).sourceRevision,
    f.rows.get(logical.id).revision,
  );
  const malformed = { ...scene(), id: "malformed", storageFormat: 0 };
  f.rows.set(malformed.id, f.row(malformed.id, "venue-visit", malformed));
  const before = structuredClone([...f.rows]),
    writes = f.writes;
  await seedVillageFixtureDocuments(f.documents);
  assert.equal(f.writes, writes);
  assert.deepEqual([...f.rows], before, "reseeding neither repairs malformed storage nor rewrites existing ownership");
});

await runCase("storage-fixture/current-only", async () => {
  const f = fixture();
  const village = { ...world(), version: 17 },
    oldScene = { ...scene(), version: 4 };
  assert.throws(() => authorVillageFixture(f.rows, village), /fresh Village/);
  assert.throws(() => authorSceneFixture(f.rows, oldScene), /fresh Scene/);
  for (const storageFormat of [0, null, false]) {
    const malformed = { ...scene(), storageFormat };
    assert.equal(authorSceneFixture(f.rows, malformed), malformed);
    assert.throws(() => fixtureSceneState(malformed, f.rows), /unsupported Scene storage/);
    await assert.rejects(createSceneHistory(f.documents).decode(malformed), /unsupported Scene storage/);
  }
  f.rows.set("villages-village", f.row("villages-village", "village", village));
  f.rows.set(oldScene.id, f.row(oldScene.id, "venue-visit", oldScene));
  const before = structuredClone([...f.rows]),
    documents = villageFixtureDocuments(f.documents);
  await assert.rejects(
    createVillageRepository(() => documents).readAuthority({ memories: true }),
    /Unsupported Village format/,
  );
  await assert.rejects(
    createSceneHistory(documents).decode((await documents.getById("villages", oldScene.id))!.data),
    /unsupported Scene storage/,
  );
  assert.deepEqual([...f.rows], before);
  assert.equal(f.writes, 0);
});
