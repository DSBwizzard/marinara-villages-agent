import assert from "node:assert/strict";
import Fastify from "fastify";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import {
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { publicSceneRoutes } from "../packages/villages/src/server/adapters/http/public-scene-routes.js";
import { SESSION_PREFIX, SESSION_KIND } from "../packages/villages/src/server/adapters/storage/scene-slots.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { createExchangeProcessing } from "../packages/villages/src/server/domain/decoding/exchange-codec.js";
import type { VenueScene } from "../packages/villages/src/server/domain/models/scene-model.js";
import { notFound } from "../packages/villages/src/server/domain/rules/errors.js";
import { createSceneArchive } from "../packages/villages/src/server/features/scenes/archive-service.js";
import {
  configureSceneArchive,
  listVenueVisits,
  readVenueVisit,
  listVenueVisitSummaries,
  deleteVenueVisit,
  deleteAllVenueVisits,
  setVenueVisitRetention,
  pruneVenueVisits,
} from "../packages/villages/src/server/features/scenes/archive.js";
import { registerSceneOperationRoutes } from "../packages/villages/src/server/features/scenes/routes.js";

const stamp = "2026-10-06T12:00:00.000Z";
type ArchiveDocument = Awaited<ReturnType<CapabilityDocumentStore["list"]>>[number];
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => (resolve = done));
  return { promise, resolve };
}
function scene(id: string, startedAt = stamp, status: VenueScene["status"] = "closed") {
  return coerceSession({
    id,
    placeId: "venue",
    placeName: "Venue",
    startedAt,
    endedAt: startedAt,
    status,
    participants: [{ characterId: "same", name: "Visible", doing: "Talking" }],
    lines: [
      {
        id: "line",
        speakerId: "same",
        name: "Visible",
        role: "assistant",
        content: "Visible dialogue",
        at: stamp,
        heardBy: ["same", "hidden"],
      },
    ],
    sceneAttendance: {
      capturedAt: stamp,
      occupants: [
        { characterId: "hidden", name: "Hidden", zoneId: "private", doing: "Private sentinel", availability: "busy" },
      ],
    },
    checkpoints: { saved: { secret: "Private checkpoint sentinel" } },
    submissions: [],
  });
}
function fixture(name: string) {
  const records = new Map<string, ArchiveDocument>(),
    calls: string[] = [],
    owners: unknown[] = [];
  const state = defaultVillageState();
  state.seed = name;
  state.foundedAt = "2026-10-01T00:00:00.000Z";
  const entered = deferred(),
    gate = deferred(),
    progressEntered = deferred(),
    progressGate = deferred(),
    diagnosticsEntered = deferred(),
    diagnosticsGate = deferred();
  let pauseRead = false,
    pauseProgress = false,
    pauseDiagnostics = false,
    fault: Error | undefined,
    afterProgress: (() => void) | undefined;
  const failedRemovals = new Set<string>();
  const note = (label: string) => {
    calls.push(label);
    owners.push(scopedActivation());
    if (scopedActivation()?.active === false) throw Error("Original archive unavailable.");
  };
  const put = (s: VenueScene, revision = 1) =>
    records.set(SESSION_PREFIX + s.id, {
      id: SESSION_PREFIX + s.id,
      packageId: "villages",
      kind: SESSION_KIND,
      name: s.placeName,
      description: name,
      data: structuredClone(s),
      revision,
      createdAt: stamp,
      updatedAt: stamp,
    });
  const service = createSceneArchive({
    villagesDocuments() {
      note("documents");
      return {
        async list(packageId, kind) {
          note("list");
          assert.equal(packageId, "villages");
          assert.equal(kind, SESSION_KIND);
          return structuredClone([...records.values()]);
        },
        async getById(packageId, id) {
          note("get:" + id);
          assert.equal(packageId, "villages");
          return structuredClone(records.get(id) ?? null);
        },
        async remove(packageId, id, revision) {
          note("remove:" + id + ":" + revision);
          assert.equal(packageId, "villages");
          if (failedRemovals.has(id) || records.get(id)?.revision !== revision) return false;
          return records.delete(id);
        },
      };
    },
    async readActive() {
      return { sessionId: "", placeId: "" };
    },
    async readSession(id) {
      note("read:" + id);
      if (pauseRead) {
        pauseRead = false;
        entered.resolve();
        await gate.promise;
        note("read-resumed");
      }
      const record = records.get(SESSION_PREFIX + id);
      if (!record) throw notFound("That Scene is no longer available.");
      return coerceSession(structuredClone(record.data));
    },
    async readVillageState() {
      note("world:read");
      return structuredClone(state);
    },
    async mutateVillageState(update) {
      note("world:write");
      update(state);
      return structuredClone(state);
    },
    async processSavedProgressSubmission(id, turnId) {
      note("progress:" + turnId);
      if (pauseProgress) {
        pauseProgress = false;
        progressEntered.resolve();
        await progressGate.promise;
        note("progress-resumed");
      }
      if (fault) throw fault;
      const record = records.get(SESSION_PREFIX + id)!;
      const s = coerceSession(record.data);
      s.submissions.find((t) => t.id === turnId)!.progressProcessedAt = stamp;
      put(s, record.revision + 1);
      afterProgress?.();
    },
    async removeInterpretationDiagnostics(id) {
      note("diagnostics:" + id);
      if (pauseDiagnostics) {
        pauseDiagnostics = false;
        diagnosticsEntered.resolve();
        await diagnosticsGate.promise;
        note("diagnostics-resumed");
      }
    },
  });
  return {
    service,
    state,
    records,
    calls,
    owners,
    put,
    entered,
    gate,
    progressEntered,
    progressGate,
    diagnosticsEntered,
    diagnosticsGate,
    failedRemovals,
    pause() {
      pauseRead = true;
    },
    pauseProgress() {
      pauseProgress = true;
    },
    pauseDiagnostics() {
      pauseDiagnostics = true;
    },
    fail(error: Error) {
      fault = error;
    },
    afterProgress(fn: () => void) {
      afterProgress = fn;
    },
  };
}
function progressScene(id: string) {
  const s = scene(id);
  s.submissions = coerceSession({
    submissions: [
      { id: "first", at: stamp },
      { id: "second", at: stamp },
    ],
  }).submissions;
  return s;
}
function unfinishedScene(id: string) {
  const s = scene(id);
  s.submissions = coerceSession({
    submissions: [
      {
        id: "pending",
        at: stamp,
        progressProcessedAt: stamp,
        processing: createExchangeProcessing({
          seed: "world",
          sceneId: id,
          submissionId: "pending",
          order: 0,
          lineIds: ["line"],
          actionReceiptIds: [],
        }),
      },
    ],
  }).submissions;
  return s;
}

async function main() {
  const f = fixture("A");
  assert.deepEqual(f.calls, [], "construction must be inert");
  f.put(scene("old", "2026-10-04T12:00:00.000Z"));
  f.put(scene("new"));
  f.put(scene("active", stamp, "active"));
  const other = scene("other");
  other.placeId = "other";
  other.participants = [];
  f.put(other);
  assert.deepEqual(
    (await f.service.listVenueVisits({ placeId: "venue", characterId: "same" })).map((s) => s.id),
    ["new", "old"],
  );
  assert(!f.calls.includes("world:read"), "ordinary archive listing does not prune");
  assert(!f.calls.some((c) => c.startsWith("remove:")));
  assert((await f.service.readVenueVisit("new")).sceneAttendance, "full private record remains available server-side");
  await assert.rejects(f.service.readVenueVisit("active"), /not in the archive/);
  await assert.rejects(f.service.readVenueVisit("absent"), /no longer available/);
  const summary = await f.service.listVenueVisitSummaries({ placeId: "venue", offset: 0.9, limit: 1.9 });
  assert.equal(summary.total, 2);
  assert.deepEqual(
    summary.visits.map((s) => s.id),
    ["new"],
  );
  assert.equal(summary.visits[0].lineCount, 1);
  assert.equal(summary.visits[0].memoryUnits, 0);
  assert(!("sceneAttendance" in summary.visits[0]));
  assert.equal((await f.service.listVenueVisitSummaries({ offset: -1, limit: 0 })).visits.length, 1);
  assert.equal((await f.service.listVenueVisitSummaries({ offset: NaN, limit: Infinity })).visits.length, 3);
  const validation = fixture("validation");
  for (const value of [
    { mode: "invalid" },
    { mode: "count", value: 0 },
    { mode: "count", value: 1001 },
    { mode: "count", value: 1.5 },
    { mode: "days", value: 29 },
    { mode: "days", value: 3651 },
  ])
    await assert.rejects(validation.service.setVenueVisitRetention(value));
  assert.deepEqual(validation.calls, [], "invalid retention never selects connections");
  await validation.service.setVenueVisitRetention({ mode: "forever", value: 22 });
  assert.deepEqual(validation.state.visitRetention, { mode: "forever", value: 0 });
  assert.deepEqual(validation.calls, ["world:write", "world:read"]);
  const pending = fixture("pending");
  pending.put(unfinishedScene("unfinished"));
  await assert.rejects(pending.service.deleteVenueVisit("unfinished"), /unfinished saved changes/);
  assert.deepEqual(pending.calls, ["read:unfinished"]);
  const recovered = fixture("recovered");
  recovered.put(progressScene("recover"));
  await recovered.service.deleteVenueVisit("recover");
  assert.deepEqual(recovered.calls, [
    "read:recover",
    "world:read",
    "progress:first",
    "progress:second",
    "documents",
    "get:" + SESSION_PREFIX + "recover",
    "documents",
    "remove:" + SESSION_PREFIX + "recover:3",
  ]);
  assert(!recovered.records.size);
  assert(
    !recovered.calls.some((c) => c.startsWith("diagnostics:")),
    "manual deletion retains its existing diagnostics policy",
  );
  const failed = fixture("failed"),
    error = Error("Exact progress failure");
  failed.put(progressScene("failed"));
  failed.fail(error);
  await assert.rejects(failed.service.deleteVenueVisit("failed"), (cause) => cause === error);
  assert(failed.records.size);
  assert(!failed.calls.includes("documents"));
  const changed = fixture("changed");
  changed.put(progressScene("changed"));
  changed.afterProgress(() => {
    const record = changed.records.get(SESSION_PREFIX + "changed")!;
    const next = coerceSession(record.data);
    next.status = "active";
    changed.put(next, record.revision + 1);
  });
  await assert.rejects(changed.service.deleteVenueVisit("changed"), /not in the archive/);
  assert(!changed.calls.some((c) => c.startsWith("remove:")));
  const cas = fixture("CAS");
  cas.put(scene("same"), 4);
  cas.failedRemovals.add(SESSION_PREFIX + "same");
  await assert.rejects(cas.service.deleteVenueVisit("same"), /changed while it was being deleted/);
  assert(cas.records.size);
  const pruning = fixture("pruning");
  pruning.state.visitRetention = { mode: "count", value: 1 };
  pruning.put(scene("new"));
  pruning.put(scene("old", "2026-10-03T12:00:00.000Z"), 5);
  pruning.put(scene("conflict", "2026-10-02T12:00:00.000Z"), 6);
  pruning.failedRemovals.add(SESSION_PREFIX + "conflict");
  pruning.put(progressScene("progress"));
  pruning.put(unfinishedScene("unfinished"));
  pruning.put(scene("active", stamp, "active"));
  await pruning.service.pruneVenueVisits();
  assert(!pruning.records.has(SESSION_PREFIX + "old"));
  for (const id of ["new", "conflict", "progress", "unfinished", "active"])
    assert(pruning.records.has(SESSION_PREFIX + id));
  assert(pruning.calls.includes("diagnostics:old"));
  assert(!pruning.calls.includes("diagnostics:conflict"));
  assert(pruning.calls.indexOf("diagnostics:old") > pruning.calls.indexOf("remove:" + SESSION_PREFIX + "old:5"));
  const before = Date.now;
  try {
    Date.now = () => Date.parse(stamp);
    const days = fixture("days");
    days.put(scene("old", "2026-08-01T00:00:00.000Z"));
    days.put(scene("new"));
    await days.service.setVenueVisitRetention({ mode: "days", value: 30 });
    assert.deepEqual([...days.records.keys()], [SESSION_PREFIX + "new"]);
    assert.deepEqual(days.state.visitRetention, { mode: "days", value: 30 });
  } finally {
    Date.now = before;
  }
  const bulk = fixture("bulk");
  bulk.put(scene("first"));
  bulk.put(scene("active", stamp, "active"));
  bulk.put(scene("second"));
  bulk.failedRemovals.add(SESSION_PREFIX + "second");
  bulk.put(scene("third"));
  await assert.rejects(bulk.service.deleteAllVenueVisits(), /changed while it was being deleted/);
  assert(!bulk.records.has(SESSION_PREFIX + "first"));
  assert(bulk.records.has(SESSION_PREFIX + "active"));
  assert(bulk.records.has(SESSION_PREFIX + "third"));
  assert(!bulk.calls.includes("read:third"), "bulk deletion remains serial and stops on failure");

  for (const command of ["progress", "diagnostics"] as const) {
    const origin = createActivationScope(),
      replacement = createActivationScope();
    const first = fixture("origin"),
      second = fixture("replacement");
    first.put(command === "progress" ? progressScene("same") : scene("same", "2026-08-01T00:00:00.000Z"));
    second.put(scene("same"));
    first.state.visitRetention = { mode: "days", value: 30 };
    const releaseFirst = origin.run(() => configureSceneArchive(first.service));
    const clearFirst = installDefaultActivation(origin, () => {});
    if (command === "progress") first.pauseProgress();
    else first.pauseDiagnostics();
    const work = command === "progress" ? deleteVenueVisit("same") : pruneVenueVisits();
    await (command === "progress" ? first.progressEntered.promise : first.diagnosticsEntered.promise);
    const releaseSecond = replacement.run(() => configureSceneArchive(second.service));
    const clearSecond = installDefaultActivation(replacement, () => {});
    (command === "progress" ? first.progressGate : first.diagnosticsGate).resolve();
    await work;
    assert(
      first.owners.every((owner) => owner === origin),
      `${command} callback and later ports retain the originating activation`,
    );
    assert(!first.records.size);
    assert.equal(second.records.size, 1, "replacement records stay independent despite equal IDs");
    origin.run(releaseFirst);
    origin.dispose();
    clearFirst();
    assert.equal((await listVenueVisits()).length, 1);
    replacement.run(releaseSecond);
    replacement.dispose();
    clearSecond();
  }

  const scopeA = createActivationScope(),
    scopeB = createActivationScope(),
    a = fixture("A"),
    b = fixture("B");
  a.put(scene("same"));
  b.put({ ...scene("same"), placeName: "B Venue" });
  const releaseA = scopeA.run(() => configureSceneArchive(a.service));
  const clearA = installDefaultActivation(scopeA, () => {});
  a.pause();
  const delayed = readVenueVisit("same");
  await a.entered.promise;
  const releaseB = scopeB.run(() => configureSceneArchive(b.service));
  const clearB = installDefaultActivation(scopeB, () => {});
  a.gate.resolve();
  assert.equal((await delayed).placeName, "Venue");
  assert(a.owners.every((owner) => owner === scopeA));
  assert.equal((await readVenueVisit("same")).placeName, "B Venue");
  scopeA.run(releaseA);
  clearA();
  assert.equal((await listVenueVisits()).length, 1, "older cleanup cannot remove newer registration");
  await assert.rejects(
    scopeA.run(() => readVenueVisit("same")),
    /not configured/,
  );
  scopeA.dispose();
  await assert.rejects(
    scopeA.run(() => listVenueVisits()),
    /not configured/,
  );
  assert.equal((await listVenueVisitSummaries()).total, 1);
  await setVenueVisitRetention({ mode: "forever" });
  await pruneVenueVisits();
  await deleteVenueVisit("same");
  assert(!b.records.size);
  b.put(scene("second"));
  await deleteAllVenueVisits();
  assert(!b.records.size);
  scopeB.run(releaseB);
  scopeB.dispose();
  clearB();
  await assert.rejects(listVenueVisits(), /not configured/);
  const retired = createActivationScope(),
    r = fixture("retired");
  r.put(scene("same"));
  retired.run(() => configureSceneArchive(r.service));
  const clearRetired = installDefaultActivation(retired, () => {});
  r.pause();
  const late = readVenueVisit("same");
  await r.entered.promise;
  retired.dispose();
  r.gate.resolve();
  await assert.rejects(late, /Original archive unavailable/);
  clearRetired();

  const routes = fixture("routes"),
    routeScope = createActivationScope(),
    app = Fastify();
  routes.put(scene("same"));
  const releaseRoutes = routeScope.run(() => configureSceneArchive(routes.service));
  routeScope.run(() => registerSceneOperationRoutes(publicSceneRoutes(app)));
  try {
    const listing = await app.inject({ method: "GET", url: "/rooms/archive?venueId=venue&characterId=same&limit=1" });
    assert.equal(listing.statusCode, 200);
    assert.equal(listing.json().total, 1);
    const detail = await app.inject({ method: "GET", url: "/rooms/archive/same" });
    assert.equal(detail.statusCode, 200);
    assert.equal(detail.json().visit.lines[0].content, "Visible dialogue");
    assert(!detail.json().visit.sceneAttendance);
    assert.deepEqual(detail.json().visit.lines[0].heardBy, ["same"]);
    assert(
      routes.records.get(SESSION_PREFIX + "same")?.data &&
        (routes.records.get(SESSION_PREFIX + "same")!.data as VenueScene).sceneAttendance,
      "public route projection never edits private saves",
    );
    const deleted = await app.inject({ method: "DELETE", url: "/rooms/archive/same" });
    assert.equal(deleted.statusCode, 200);
    assert.deepEqual(deleted.json(), { deleted: true });
    const absent = await app.inject({ method: "GET", url: "/rooms/archive/same" });
    assert.equal(absent.statusCode, 404);
    routes.put(unfinishedScene("unfinished"));
    const unfinished = await app.inject({ method: "DELETE", url: "/rooms/archive/unfinished" });
    assert.equal(unfinished.statusCode, 409);
    routes.records.clear();
    routes.put(scene("bulk"));
    const all = await app.inject({ method: "DELETE", url: "/rooms/archive" });
    assert.equal(all.statusCode, 200);
    assert.deepEqual(all.json(), { deleted: true });
  } finally {
    await app.close();
    routeScope.run(releaseRoutes);
    routeScope.dispose();
  }
  console.log(
    "Scene archive ownership, retention/recovery/CAS ordering, activation lifetime and real Fastify public envelopes passed with provider-free ports.",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
