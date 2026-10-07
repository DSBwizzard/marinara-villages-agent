import assert from "node:assert/strict";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { ActiveVenue } from "../packages/villages/src/server/domain/models/scene-model.js";
import { createSceneArchive } from "../packages/villages/src/server/features/scenes/archive-service.js";
import { configureSceneArchive, resetVenueSessions } from "../packages/villages/src/server/features/scenes/archive.js";
import {
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import {
  ACTIVE_ID,
  SESSION_PREFIX,
  SESSION_KIND,
} from "../packages/villages/src/server/adapters/storage/scene-slots.js";
type Document = Awaited<ReturnType<CapabilityDocumentStore["list"]>>[number];
const stamp = "2026-10-07T12:00:00.000Z";
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => (resolve = done));
  return { promise, resolve };
}
function fixture(name: string) {
  const records = new Map<string, Document>(),
    calls: string[] = [],
    owners: unknown[] = [],
    active: ActiveVenue = { sessionId: "", placeId: "" },
    rejected = new Set<string>();
  let paused = false,
    readFailure: Error | undefined,
    listFailure: Error | undefined;
  const entered = deferred(),
    gate = deferred();
  const note = (call: string) => {
    calls.push(call);
    owners.push(scopedActivation());
    if (scopedActivation()?.active === false) throw Error("Original archive connection unavailable.");
  };
  const put = (id: string, revision = 1) =>
    records.set(id, {
      id,
      packageId: "villages",
      kind: id === ACTIVE_ID ? "venue-active" : SESSION_KIND,
      name,
      description: name,
      data: { owner: name },
      revision,
      createdAt: stamp,
      updatedAt: stamp,
    });
  const unavailable = async (): Promise<never> => {
    throw Error("Archive reset must not perform other feature work");
  };
  const service = createSceneArchive({
    async readActive() {
      note("active");
      if (paused) {
        paused = false;
        entered.resolve();
        await gate.promise;
        note("active-resumed");
      }
      if (readFailure) throw readFailure;
      return { ...active };
    },
    villagesDocuments() {
      note("documents");
      return {
        async list(packageId, kind) {
          note("list");
          assert.equal(packageId, "villages");
          assert.equal(kind, SESSION_KIND);
          if (listFailure) throw listFailure;
          return structuredClone([...records.values()].filter((record) => record.kind === kind));
        },
        async getById(packageId, id) {
          note("get:" + id);
          assert.equal(packageId, "villages");
          return structuredClone(records.get(id) ?? null);
        },
        async remove(packageId, id, revision) {
          note("remove:" + id + ":" + revision);
          assert.equal(packageId, "villages");
          if (rejected.has(id) || records.get(id)?.revision !== revision) return false;
          return records.delete(id);
        },
      };
    },
    readSession: unavailable,
    readVillageState: unavailable,
    mutateVillageState: unavailable,
    processSavedProgressSubmission: unavailable,
    removeInterpretationDiagnostics: unavailable,
  });
  return {
    records,
    calls,
    owners,
    active,
    rejected,
    service,
    put,
    entered,
    gate,
    pause() {
      paused = true;
    },
    failRead(error: Error) {
      readFailure = error;
    },
    failList(error: Error) {
      listFailure = error;
    },
  };
}
async function main() {
  const blocked = fixture("blocked");
  assert.deepEqual(blocked.calls, [], "construction is inert");
  blocked.active.sessionId = "live";
  blocked.put(SESSION_PREFIX + "live");
  await assert.rejects(blocked.service.resetVenueSessions(), /Finish the active Scene/);
  assert.deepEqual(blocked.calls, ["active"]);
  assert.equal(blocked.records.size, 1, "active refusal precedes document access");
  const complete = fixture("complete");
  complete.put(SESSION_PREFIX + "first", 3);
  complete.put(SESSION_PREFIX + "second", 7);
  complete.put(ACTIVE_ID, 5);
  await complete.service.resetVenueSessions();
  assert.equal(complete.records.size, 0);
  assert.deepEqual(complete.calls, [
    "active",
    "documents",
    "list",
    "remove:" + SESSION_PREFIX + "first:3",
    "remove:" + SESSION_PREFIX + "second:7",
    "get:" + ACTIVE_ID,
    "remove:" + ACTIVE_ID + ":5",
  ]);
  const empty = fixture("empty");
  await empty.service.resetVenueSessions();
  assert.deepEqual(empty.calls, ["active", "documents", "list", "get:" + ACTIVE_ID]);
  const collision = fixture("collision");
  collision.put(SESSION_PREFIX + "first", 3);
  collision.put(SESSION_PREFIX + "second", 7);
  collision.put(SESSION_PREFIX + "third", 9);
  collision.put(ACTIVE_ID, 5);
  collision.rejected.add(SESSION_PREFIX + "second");
  await assert.rejects(collision.service.resetVenueSessions(), /A venue archive changed/);
  assert(
    !collision.records.has(SESSION_PREFIX + "first"),
    "already completed deletions retain their existing partial-reset policy",
  );
  assert(collision.records.has(SESSION_PREFIX + "second"));
  assert(collision.records.has(SESSION_PREFIX + "third"));
  assert(collision.records.has(ACTIVE_ID));
  assert(!collision.calls.includes("get:" + ACTIVE_ID), "failed archive CAS stops before pointer removal");
  const pointerCollision = fixture("pointer");
  pointerCollision.put(SESSION_PREFIX + "first");
  pointerCollision.put(ACTIVE_ID, 5);
  pointerCollision.rejected.add(ACTIVE_ID);
  await assert.rejects(pointerCollision.service.resetVenueSessions(), /The active venue changed/);
  assert.equal(pointerCollision.records.size, 1);
  assert(pointerCollision.records.has(ACTIVE_ID));
  const readError = Error("Exact active-read failure"),
    failedRead = fixture("read-error");
  failedRead.failRead(readError);
  await assert.rejects(failedRead.service.resetVenueSessions(), (error) => error === readError);
  assert.deepEqual(failedRead.calls, ["active"]);
  const listError = Error("Exact archive-list failure"),
    failedList = fixture("list-error");
  failedList.failList(listError);
  await assert.rejects(failedList.service.resetVenueSessions(), (error) => error === listError);
  assert.deepEqual(failedList.calls, ["active", "documents", "list"]);
  const a = createActivationScope(),
    b = createActivationScope(),
    first = fixture("A"),
    second = fixture("B");
  for (const f of [first, second]) {
    f.put(SESSION_PREFIX + "same", 2);
    f.put(ACTIVE_ID, 4);
  }
  const releaseA = a.run(() => configureSceneArchive(first.service)),
    clearA = installDefaultActivation(a, () => {});
  first.pause();
  const pending = resetVenueSessions();
  await first.entered.promise;
  const releaseB = b.run(() => configureSceneArchive(second.service)),
    clearB = installDefaultActivation(b, () => {});
  first.gate.resolve();
  await pending;
  assert.equal(first.records.size, 0);
  assert.equal(second.records.size, 2, "A reset does not delete same-ID B documents");
  assert(first.owners.every((owner) => owner === a));
  assert.deepEqual(second.calls, []);
  a.run(releaseA);
  a.dispose();
  clearA();
  await resetVenueSessions();
  assert.equal(second.records.size, 0);
  assert(second.owners.every((owner) => owner === b));
  await assert.rejects(
    a.run(() => resetVenueSessions()),
    /not configured/,
  );
  const missing = createActivationScope();
  await assert.rejects(
    missing.run(() => resetVenueSessions()),
    /not configured/,
  );
  missing.dispose();
  b.run(releaseB);
  b.dispose();
  clearB();
  await assert.rejects(resetVenueSessions(), /not configured/);
  const retired = createActivationScope(),
    old = fixture("retired");
  old.put(SESSION_PREFIX + "same");
  retired.run(() => configureSceneArchive(old.service));
  const clearRetired = installDefaultActivation(retired, () => {});
  old.pause();
  const abandoned = resetVenueSessions();
  await old.entered.promise;
  retired.dispose();
  old.gate.resolve();
  await assert.rejects(abandoned, /Original archive connection unavailable/);
  assert.equal(old.records.size, 1);
  assert(!old.calls.includes("documents"));
  clearRetired();
  console.log(
    "Scene archive reset active refusal, serial revision removals/partial failure, exact errors and originating activation cleanup passed with provider-free documents.",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
