import assert from "node:assert/strict";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { createLiveScenes } from "../packages/villages/src/server/features/scenes/live-session-service.js";
import {
  configureLiveScenes,
  activeVenueSession,
  touchVenueSession,
} from "../packages/villages/src/server/features/scenes/live-session.js";
import {
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { applySceneMutation } from "../packages/villages/src/server/domain/rules/scene-mutation.js";
import { initializeVenueAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { resolveVenueZone } from "../packages/villages/src/server/domain/rules/venue-zones.js";
import { SESSION_PREFIX } from "../packages/villages/src/server/adapters/storage/scene-slots.js";
import type { ActiveVenue, VenueScene } from "../packages/villages/src/server/domain/models/scene-model.js";
type Document = NonNullable<Awaited<ReturnType<CapabilityDocumentStore["getById"]>>>;
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => (resolve = done));
  return { promise, resolve };
}
function fixture(name: string) {
  const stamp = new Date().toISOString(),
    calls: string[] = [],
    owners: unknown[] = [],
    active: ActiveVenue = { sessionId: "same", placeId: "venue" },
    sessions = new Map<string, VenueScene>(),
    world = coerceVillageState({
      ...defaultVillageState(),
      seed: name,
      foundedAt: stamp,
      venues: [{ id: "venue", name, classes: ["gathering"], description: name }],
    });
  initializeVenueAccess(world.venues[0]!);
  const saved = coerceSession({
    id: "same",
    placeId: "venue",
    placeName: name,
    status: "active",
    startedAt: stamp,
    lastActivityAt: stamp,
    zoneId: "gathering",
    area: "public",
    participants: [{ characterId: "mara", name: name + " Mara", doing: "listening" }],
    activeIds: ["mara"],
    sceneAttendance: {
      capturedAt: stamp,
      occupants: [
        { characterId: "mara", name: name + " Mara", doing: "listening", availability: "online", zoneId: "gathering" },
      ],
    },
    lines: [],
    submissions: [],
  });
  sessions.set(saved.id, saved);
  let busy = false,
    pauseAt = "",
    failureAt = "",
    failure: Error | undefined,
    beforeChange: (() => void) | undefined,
    retry = false;
  const entered = deferred(),
    gate = deferred();
  function note(call: string) {
    calls.push(call);
    owners.push(scopedActivation());
    if (scopedActivation()?.active === false) throw Error("Original live Scene connection unavailable.");
    if (call === failureAt) throw failure;
  }
  async function wait(call: string) {
    if (pauseAt !== call) return;
    pauseAt = "";
    entered.resolve();
    await gate.promise;
    note(call + ":resumed");
  }
  const service = createLiveScenes({
    async readActive() {
      note("active");
      await wait("active");
      return { ...active };
    },
    async readSession(id) {
      note("read:" + id);
      await wait("read:" + id);
      const session = sessions.get(id);
      if (!session) throw Error("Missing Scene");
      return structuredClone(session);
    },
    async clearActivePointer(id) {
      note("clear:" + id);
      if (active.sessionId === id) {
        active.sessionId = "";
        active.placeId = "";
      }
    },
    async changeSession(id, change) {
      note("change:" + id);
      beforeChange?.();
      beforeChange = undefined;
      if (retry) {
        retry = false;
        const abandoned = structuredClone(sessions.get(id)!);
        applySceneMutation(abandoned, id, change);
      }
      const candidate = structuredClone(sessions.get(id)!);
      const changed = applySceneMutation(candidate, id, change);
      if (changed !== false) {
        sessions.set(id, candidate);
        note("write:" + id);
      }
      return candidate;
    },
    hasVenueOperation(id) {
      note("operation:" + id);
      return busy;
    },
    villagesDocuments() {
      note("documents");
      return {
        async getById(packageId, id) {
          note("get:" + id);
          assert.equal(packageId, "villages");
          if (!sessions.has(id.slice(SESSION_PREFIX.length))) return null;
          return {
            id,
            packageId,
            kind: "venue-session",
            name,
            description: "",
            data: {},
            revision: 7,
            createdAt: stamp,
            updatedAt: stamp,
          } satisfies Document;
        },
        async remove(packageId, id, revision) {
          note("remove:" + id + ":" + revision);
          assert.equal(packageId, "villages");
          assert.equal(revision, 7);
          return sessions.delete(id.slice(SESSION_PREFIX.length));
        },
      };
    },
    async readVillageState() {
      note("world");
      await wait("world");
      return structuredClone(world);
    },
    async mutateVillageState(change) {
      note("world-change");
      change(world);
      return structuredClone(world);
    },
  });
  return {
    saved,
    sessions,
    active,
    world,
    calls,
    owners,
    service,
    entered,
    gate,
    pause(call: string) {
      pauseAt = call;
    },
    fail(call: string, error: Error) {
      failureAt = call;
      failure = error;
    },
    setBusy(value: boolean) {
      busy = value;
    },
    onChange(work: () => void) {
      beforeChange = work;
    },
    retry() {
      retry = true;
    },
  };
}
async function main() {
  const empty = fixture("empty");
  assert.deepEqual(empty.calls, [], "construction is inert");
  empty.active.sessionId = "";
  assert.equal(await empty.service.activeVenueSession(), null);
  assert.deepEqual(empty.calls, ["active"]);
  const closed = fixture("closed");
  closed.saved.status = "closed";
  assert.equal(await closed.service.activeVenueSession(), null);
  assert.deepEqual(closed.calls, ["active", "read:same", "clear:same"]);
  const running = fixture("running");
  running.setBusy(true);
  assert.equal((await running.service.activeVenueSession())?.placeName, "running");
  assert.deepEqual(running.calls, ["active", "read:same", "operation:same"]);
  const played = fixture("played");
  played.saved.lastActivityAt = "2020-01-01T00:00:00.000Z";
  played.saved.lines.push({
    id: "player",
    role: "user",
    speakerId: "player",
    name: "You",
    content: "Hello",
    at: played.saved.startedAt,
    heardBy: ["mara"],
  });
  assert.equal(await played.service.activeVenueSession(), null);
  assert.equal(played.sessions.get("same")?.endReason, "inactivity");
  assert.equal(played.active.sessionId, "");
  assert(!played.calls.includes("documents"), "completed player exchanges stay archived");
  const unplayed = fixture("unplayed");
  unplayed.saved.lastActivityAt = "2020-01-01T00:00:00.000Z";
  assert.equal(await unplayed.service.activeVenueSession(), null);
  assert.equal(unplayed.sessions.size, 0);
  assert(unplayed.calls.indexOf("clear:same") < unplayed.calls.indexOf("get:" + SESSION_PREFIX + "same"));
  assert.equal(
    unplayed.calls.filter((call) => call === "documents").length,
    2,
    "existing lazy cleanup getters remain separate",
  );
  assert(unplayed.calls.includes("remove:" + SESSION_PREFIX + "same:7"));
  const arrived = fixture("arrived");
  arrived.saved.lastActivityAt = "2020-01-01T00:00:00.000Z";
  arrived.onChange(() => arrived.setBusy(true));
  assert.equal((await arrived.service.activeVenueSession())?.status, "active");
  assert(!arrived.calls.includes("write:same"), "operation arriving before mutation prevents inactivity close");
  assert(!arrived.calls.includes("clear:same"));
  const ended = fixture("ended");
  ended.saved.status = "closed";
  await assert.rejects(ended.service.requireLiveVenueSession("same"), /already ended/);
  const inactive = fixture("inactive");
  inactive.saved.lastActivityAt = "2020-01-01T00:00:00.000Z";
  await assert.rejects(
    inactive.service.requireLiveVenueSession("same"),
    (error: unknown) => (error as { statusCode: number }).statusCode === 410,
  );
  const unselected = fixture("unselected");
  unselected.active.sessionId = "another";
  await assert.rejects(unselected.service.requireLiveVenueSession("same"), /not active/);
  assert(!unselected.calls.includes("world"));
  const recent = fixture("recent");
  await recent.service.touchVenueSession("same");
  assert(!recent.calls.includes("change:same"), "activity writes are throttled for fifteen seconds");
  const touched = fixture("touched");
  touched.saved.lastActivityAt = new Date(Date.now() - 20_000).toISOString();
  const oldStamp = touched.saved.lastActivityAt;
  const touchedResult = await touched.service.touchVenueSession("same");
  assert(Date.parse(touchedResult.lastActivityAt) > Date.parse(oldStamp));
  assert.equal(touched.calls.filter((call) => call === "write:same").length, 1);
  const closedAtCas = fixture("closed-at-cas");
  closedAtCas.saved.lastActivityAt = new Date(Date.now() - 20_000).toISOString();
  closedAtCas.onChange(() => {
    closedAtCas.saved.status = "closed";
  });
  await assert.rejects(closedAtCas.service.touchVenueSession("same"), /already ended/);
  assert(!closedAtCas.calls.includes("write:same"));
  const attendance = fixture("attendance");
  const captured = structuredClone(attendance.saved.sceneAttendance);
  attendance.world.villagers = [];
  const continued = await attendance.service.refreshZoneParticipants(attendance.saved);
  assert.deepEqual(
    continued.sceneAttendance,
    captured,
    "current world roster/schedules cannot replace captured attendance",
  );
  assert.deepEqual(continued.activeIds, ["mara"]);
  assert(!attendance.calls.includes("change:same"));
  const crowded = fixture("crowded");
  crowded.saved.sceneAttendance!.occupants = Array.from({ length: 5 }, (_, i) => ({
    characterId: "resident" + i,
    name: "Resident " + i,
    doing: "here",
    availability: "online",
    zoneId: "gathering",
  }));
  await assert.rejects(crowded.service.refreshZoneParticipants(crowded.saved), /Five residents/);
  assert(!crowded.calls.includes("change:same"));
  const claim = fixture("claim"),
    venue = claim.world.venues[0]!,
    zone = resolveVenueZone(venue, "gathering")!;
  zone.access!.mode = "permission-required";
  venue.access!.managerIds = ["mara"];
  venue.access!.permissions.push({
    id: "permission",
    zoneId: zone.id,
    visitorId: "player",
    issuerId: "mara",
    duration: "visit",
    sceneId: null,
    accompaniedBy: null,
    outsideHours: true,
    revoked: false,
    issuedAt: claim.saved.startedAt,
    sourceLineIds: [],
  });
  claim.saved.pendingAccessClaim = "permission";
  const settled = await claim.service.refreshZoneParticipants(claim.saved);
  assert.equal(venue.access!.permissions[0]!.sceneId, "same");
  assert.equal(settled.pendingAccessClaim, undefined);
  assert(
    claim.calls.indexOf("world-change") < claim.calls.indexOf("change:same"),
    "claim is committed before the Scene flag is cleared",
  );
  const privateExit = fixture("private-exit"),
    privateVenue = privateExit.world.venues[0]!,
    privateZone = resolveVenueZone(privateVenue, "gathering")!;
  privateZone.access!.mode = "permission-required";
  privateVenue.access!.managerIds = ["player"];
  privateExit.saved.zoneId = "exterior";
  privateExit.saved.activeIds = [];
  privateExit.retry();
  const displaced = await privateExit.service.refreshZoneParticipants(privateExit.saved);
  assert.deepEqual(displaced.accompanying, [{ characterId: "mara", zoneId: "exterior" }]);
  assert.equal(displaced.lines.length, 1, "abandoned retry narration is not persisted");
  assert.equal(displaced.lines[0]!.zoneId, "gathering");
  assert.equal(displaced.lines[0]!.contactHidden, false, "player at destination witnesses the exit");
  assert.deepEqual(displaced.lines[0]!.heardBy, ["mara"]);
  const unseen = fixture("unseen"),
    unseenVenue = unseen.world.venues[0]!,
    hiddenZone = structuredClone(resolveVenueZone(unseenVenue, "gathering")!);
  hiddenZone.id = "restricted";
  hiddenZone.name = "Private room";
  hiddenZone.kind = "restricted";
  hiddenZone.access!.mode = "permission-required";
  hiddenZone.access!.managerIds = ["player"];
  unseenVenue.zones!.push(hiddenZone);
  unseen.saved.sceneAttendance!.occupants[0]!.zoneId = hiddenZone.id;
  unseen.saved.sceneAttendance!.occupants.push({
    characterId: "unrelated",
    name: "Unrelated witness",
    doing: "reading",
    availability: "online",
    zoneId: "gathering",
  });
  unseen.saved.participants.push({ characterId: "unrelated", name: "Unrelated witness", doing: "reading" });
  unseen.saved.activeIds = ["unrelated"];
  const hiddenExit = await unseen.service.refreshZoneParticipants(unseen.saved);
  assert.equal(hiddenExit.zoneId, "gathering");
  assert.equal(hiddenExit.lines.length, 1);
  assert.equal(hiddenExit.lines[0]!.contactHidden, true, "unseen third-Zone movement stays server-only");
  assert.equal(hiddenExit.lines[0]!.zoneId, "restricted");
  assert.deepEqual(hiddenExit.lines[0]!.heardBy, ["mara"]);
  assert.deepEqual(hiddenExit.activeIds, ["unrelated"], "unseen departure adds no player-Zone attendance");
  const concurrent = fixture("concurrent"),
    concurrentVenue = concurrent.world.venues[0]!;
  resolveVenueZone(concurrentVenue, "gathering")!.access!.mode = "permission-required";
  concurrentVenue.access!.managerIds = ["player"];
  concurrent.saved.zoneId = "exterior";
  concurrent.saved.activeIds = [];
  concurrent.onChange(() => {
    concurrent.saved.accompanying = [{ characterId: "mara", zoneId: "exterior" }];
  });
  const alreadyMoved = await concurrent.service.refreshZoneParticipants(structuredClone(concurrent.saved));
  assert.equal(alreadyMoved.lines.length, 0, "exits recomputed from winning CAS positions add no duplicate narration");
  assert.deepEqual(alreadyMoved.activeIds, ["mara"]);
  const failure = fixture("failure"),
    exact = Error("Exact world read failure");
  failure.fail("world", exact);
  await assert.rejects(failure.service.activeVenueSession(), (error) => error === exact);
  assert(!failure.calls.includes("write:same"));
  for (const command of ["active", "touch"] as const) {
    const a = createActivationScope(),
      b = createActivationScope(),
      first = fixture("A"),
      second = fixture("B");
    if (command === "touch") first.saved.lastActivityAt = new Date(Date.now() - 20_000).toISOString();
    const releaseA = a.run(() => configureLiveScenes(first.service)),
      clearA = installDefaultActivation(a, () => {});
    first.pause(command === "active" ? "active" : "world");
    const pending = command === "active" ? activeVenueSession() : touchVenueSession("same");
    await first.entered.promise;
    const releaseB = b.run(() => configureLiveScenes(second.service)),
      clearB = installDefaultActivation(b, () => {});
    first.gate.resolve();
    const result = await pending;
    assert.equal(result?.placeName, "A");
    assert.deepEqual(second.calls, []);
    assert(first.owners.every((owner) => owner === a));
    a.run(releaseA);
    a.dispose();
    clearA();
    assert.equal((await activeVenueSession())?.placeName, "B", "older cleanup leaves B registration intact");
    assert(second.owners.every((owner) => owner === b));
    await assert.rejects(
      a.run(() => activeVenueSession()),
      /not configured/,
    );
    const missing = createActivationScope();
    await assert.rejects(
      missing.run(() => activeVenueSession()),
      /not configured/,
    );
    missing.dispose();
    b.run(releaseB);
    b.dispose();
    clearB();
    await assert.rejects(activeVenueSession(), /not configured/);
  }
  const retired = createActivationScope(),
    old = fixture("retired"),
    current = createActivationScope(),
    replacement = fixture("replacement");
  retired.run(() => configureLiveScenes(old.service));
  const clearRetired = installDefaultActivation(retired, () => {});
  old.pause("active");
  const pending = activeVenueSession();
  await old.entered.promise;
  retired.dispose();
  const releaseCurrent = current.run(() => configureLiveScenes(replacement.service)),
    clearCurrent = installDefaultActivation(current, () => {});
  old.gate.resolve();
  await assert.rejects(pending, /Original live Scene connection unavailable/);
  assert.deepEqual(replacement.calls, [], "retired in-flight work cannot borrow replacement connections");
  clearRetired();
  current.run(releaseCurrent);
  current.dispose();
  clearCurrent();
  console.log("PASS live Scene ownership, inactivity, deliberate activity, captured attendance and access ordering");
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
