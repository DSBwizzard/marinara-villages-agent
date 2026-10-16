import assert from "node:assert/strict";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { createSceneRepository } from "../packages/villages/src/server/adapters/storage/scene-repository.js";
import {
  configureSceneRepository,
  readActive,
  readSession,
  changeSession,
  clearActivePointer,
} from "../packages/villages/src/server/adapters/storage/scene-store.js";
import {
  ACTIVE_ID,
  SESSION_PREFIX,
  SESSION_KIND,
} from "../packages/villages/src/server/adapters/storage/scene-slots.js";
import { createDocumentMutator } from "../packages/villages/src/server/adapters/storage/document-store.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import type { VenueScene } from "../packages/villages/src/server/domain/models/scene-model.js";
import {
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { configureVenueOperationContext } from "../packages/villages/src/server/adapters/operations/operation-context.js";
import { createVenueOperationContext } from "../packages/villages/src/server/adapters/operations/operation-context-service.js";

type Document = Awaited<ReturnType<CapabilityDocumentStore["list"]>>[number];
const stamp = "2026-10-07T12:00:00.000Z";
const logger = { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} };
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => (resolve = done));
  return { promise, resolve };
}
function scene(id: string, name: string) {
  return coerceSession({
    id,
    placeId: "venue",
    placeName: name,
    status: "active",
    startedAt: stamp,
    lines: [],
    submissions: [],
  });
}
function fixture(name: string, rejectRetired = true) {
  const records = new Map<string, Document>(),
    calls: string[] = [],
    owners: unknown[] = [];
  let pause = false,
    collide: (() => void) | undefined,
    fault: Error | undefined;
  const entered = deferred(),
    gate = deferred();
  const note = (call: string) => {
    calls.push(call);
    owners.push(scopedActivation());
    if (rejectRetired && scopedActivation()?.active === false) throw Error("Original Scene storage unavailable.");
  };
  const put = (id: string, data: unknown, revision = 1) =>
    records.set(id, {
      id,
      packageId: "villages",
      kind: id === ACTIVE_ID ? "venue-active" : SESSION_KIND,
      name,
      description: name,
      data: structuredClone(data),
      revision,
      createdAt: stamp,
      updatedAt: stamp,
    });
  const documents: CapabilityDocumentStore = {
    async list() {
      throw Error("Scene repository never lists");
    },
    async getById(packageId, id) {
      note("get:" + id);
      assert.equal(packageId, "villages");
      if (pause) {
        pause = false;
        entered.resolve();
        await gate.promise;
        note("get-resumed");
      }
      if (fault) throw fault;
      return structuredClone(records.get(id) ?? null);
    },
    async create(input) {
      note("create:" + input.id);
      assert.equal(input.packageId, "villages");
      const next = { ...input, revision: 1 };
      records.set(input.id, structuredClone(next));
      return structuredClone(next);
    },
    async update(input) {
      note("update:" + input.id + ":" + input.expectedRevision);
      assert.equal(input.packageId, "villages");
      if (collide) {
        const apply = collide;
        collide = undefined;
        apply();
        return null;
      }
      const previous = records.get(input.id);
      if (!previous || previous.revision !== input.expectedRevision) return null;
      const next = {
        ...previous,
        data: structuredClone(input.data),
        name: input.name,
        description: input.description,
        updatedAt: input.updatedAt,
        revision: previous.revision + 1,
      };
      records.set(input.id, next);
      return structuredClone(next);
    },
    async remove() {
      throw Error("Scene repository never removes");
    },
  };
  const villagesDocuments = () => {
    note("documents");
    return documents;
  };
  const repository = createSceneRepository({
    villagesDocuments,
    mutateDocument: createDocumentMutator(villagesDocuments),
  });
  return {
    repository,
    records,
    calls,
    owners,
    put,
    entered,
    gate,
    pause() {
      pause = true;
    },
    collide(fn: () => void) {
      collide = fn;
    },
    fail(error: Error) {
      fault = error;
    },
  };
}
async function main() {
  const f = fixture("A");
  assert.deepEqual(f.calls, [], "construction performs no connector access");
  assert.deepEqual(await f.repository.readActive(), { sessionId: "", placeId: "" });
  await assert.rejects(f.repository.readSession("missing"), /no longer available/);
  f.put(SESSION_PREFIX + "same", scene("same", "A Venue"), 2);
  f.put(ACTIVE_ID, { sessionId: "same", placeId: "venue" });
  const read = await f.repository.readSession("same");
  read.placeName = "Local change";
  assert.equal((await f.repository.readSession("same")).placeName, "A Venue", "reads are decoded snapshots");
  const before = f.calls.length;
  const unchanged = await f.repository.changeSession("same", () => {});
  assert.equal(unchanged.placeName, "A Venue");
  assert(!f.calls.slice(before).some((c) => c.startsWith("update:")), "unchanged Scene rule declines writes");
  let changes = 0;
  f.collide(() => {
    const concurrent = scene("same", "A Venue");
    concurrent.sceneRevision = 5;
    concurrent.pendingRoomQuestions = ["Concurrent metadata"];
    concurrent.lines = [
      { id: "concurrent", speakerId: "", name: "", role: "user", content: "Concurrent line", at: stamp, heardBy: [] },
    ];
    f.put(SESSION_PREFIX + "same", concurrent, 3);
  });
  const start = f.calls.length;
  const saved = await f.repository.changeSession("same", (s) => {
    changes++;
    s.lines.push({ id: "mine", speakerId: "", name: "", role: "user", content: "My line", at: stamp, heardBy: [] });
  });
  assert.equal(changes, 2);
  assert.equal(saved.sceneRevision, 6);
  assert.deepEqual(
    saved.lines.map((l) => l.id),
    ["concurrent", "mine"],
  );
  assert.deepEqual(saved.pendingRoomQuestions, ["Concurrent metadata"]);
  assert.equal(
    f.calls.slice(start).filter((c) => c === "documents").length,
    1,
    "the supplied mutator captures its store once across retries",
  );
  assert.deepEqual(f.records.get(SESSION_PREFIX + "same")!.data, saved, "returned state belongs to winning attempt");
  await assert.rejects(
    f.repository.changeSession("missing", () => assert.fail("missing Scene must not call mutation")),
    /no longer available/,
  );
  await f.repository.clearActivePointer("other");
  assert.equal((await f.repository.readActive()).sessionId, "same", "unrelated pointer remains selected");
  f.collide(() => {
    const prior = f.records.get(ACTIVE_ID)!;
    f.put(ACTIVE_ID, { sessionId: "replacement", placeId: "new-venue" }, prior.revision + 1);
  });
  await f.repository.clearActivePointer("same");
  assert.deepEqual(
    await f.repository.readActive(),
    { sessionId: "replacement", placeId: "new-venue" },
    "a changed pointer in the winning CAS attempt remains selected",
  );
  await f.repository.clearActivePointer("replacement");
  assert.deepEqual(await f.repository.readActive(), { sessionId: "", placeId: "" });
  const empty = fixture("empty");
  await empty.repository.clearActivePointer("missing");
  assert(empty.records.has(ACTIVE_ID), "missing-pointer normalization retains the generic mutator creation policy");
  assert.deepEqual(await empty.repository.readActive(), { sessionId: "", placeId: "" });
  const failure = fixture("failed"),
    error = Error("Exact read failure");
  failure.fail(error);
  await assert.rejects(failure.repository.readSession("same"), (cause) => cause === error);

  const a = createActivationScope(),
    b = createActivationScope(),
    first = fixture("A"),
    second = fixture("B");
  first.put(SESSION_PREFIX + "same", scene("same", "A Venue"));
  second.put(SESSION_PREFIX + "same", scene("same", "B Venue"));
  const releaseOpsA = a.run(() => configureVenueOperationContext(createVenueOperationContext(() => logger))),
    releaseOpsB = b.run(() => configureVenueOperationContext(createVenueOperationContext(() => logger)));
  const releaseA = a.run(() => configureSceneRepository(first.repository)),
    clearA = installDefaultActivation(a, () => {});
  first.pause();
  const work = changeSession("same", (s) => (s.placeName = "A saved"));
  await first.entered.promise;
  const releaseB = b.run(() => configureSceneRepository(second.repository)),
    clearB = installDefaultActivation(b, () => {});
  assert.equal((await readSession("same")).placeName, "B Venue");
  first.gate.resolve();
  assert.equal((await work).placeName, "A saved");
  assert(first.owners.every((owner) => owner === a));
  assert.equal(coerceSession(second.records.get(SESSION_PREFIX + "same")!.data).placeName, "B Venue");
  a.run(releaseA);
  a.run(releaseOpsA);
  a.dispose();
  clearA();
  assert.equal((await readSession("same")).placeName, "B Venue", "older cleanup retains current dispatch");
  await assert.rejects(
    a.run(() => readSession("same")),
    /not configured/,
  );
  const missing = createActivationScope();
  await assert.rejects(
    missing.run(() => readActive()),
    /not configured/,
  );
  missing.dispose();
  second.put(ACTIVE_ID, { sessionId: "same", placeId: "venue" });
  await clearActivePointer("same");
  assert.deepEqual(await readActive(), { sessionId: "", placeId: "" });
  b.run(releaseB);
  b.run(releaseOpsB);
  b.dispose();
  clearB();
  await assert.rejects(readSession("same"), /not configured/);
  const retired = createActivationScope(),
    old = fixture("retired");
  old.put(SESSION_PREFIX + "same", scene("same", "Old Venue"));
  retired.run(() => configureVenueOperationContext(createVenueOperationContext(() => logger)));
  retired.run(() => configureSceneRepository(old.repository));
  const clearRetired = installDefaultActivation(retired, () => {});
  old.pause();
  const pending = changeSession("same", (s) => (s.placeName = "Should not save"));
  await old.entered.promise;
  retired.dispose();
  old.gate.resolve();
  await assert.rejects(pending, /Original Scene storage unavailable/);
  assert.equal(coerceSession(old.records.get(SESSION_PREFIX + "same")!.data).placeName, "Old Venue");
  assert(!old.calls.some((c) => c.startsWith("update:")));
  clearRetired();
  const disposed = createActivationScope(),
    returning = fixture("returning", false);
  returning.put(SESSION_PREFIX + "same", scene("same", "Returning Venue"));
  disposed.run(() => configureVenueOperationContext(createVenueOperationContext(() => logger)));
  disposed.run(() => configureSceneRepository(returning.repository));
  const clearDisposed = installDefaultActivation(disposed, () => {});
  returning.pause();
  let callbacks = 0;
  const resumed = changeSession("same", () => {
    callbacks += 1;
  });
  await returning.entered.promise;
  disposed.dispose();
  returning.gate.resolve();
  await assert.rejects(resumed, /Scene operation context is not configured/);
  assert.equal(callbacks, 0, "the real operation fence rejects a returned read before the mutation callback");
  assert(!returning.calls.some((call) => call.startsWith("update:") || call.startsWith("create:")));
  clearDisposed();
  console.log(
    "Scene repository inertness, authoritative mutation/CAS ordering, snapshot decoding and activation-bound independent storage passed with real document mutator and provider-free documents.",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
