import { agendaFixture } from "./helpers/agenda.fixture.js";
import { configureVillageClock } from "../packages/villages/src/server/adapters/time/clock-gate.js";
import { captureSceneAttendance } from "../packages/villages/src/server/domain/rules/scene-attendance.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import assert from "node:assert/strict";
import {
  createActivationScope,
  activationScope,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { ActiveVenue, VenueScene } from "../packages/villages/src/server/domain/models/scene-model.js";
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { applySceneMutation } from "../packages/villages/src/server/domain/rules/scene-mutation.js";
import { initializeVenueAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { resolveVenueZone } from "../packages/villages/src/server/domain/rules/venue-zones.js";
import { createLiveScenes } from "../packages/villages/src/server/features/scenes/live-session-service.js";
import { readNarrationSubmission } from "../packages/villages/src/server/domain/decoding/narration-submission.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import {
  initializeRoomContinuity,
  retainNativeFact,
} from "../packages/villages/src/server/domain/rules/native-continuity.js";
import { captureZoneObservation } from "../packages/villages/src/server/domain/rules/zone-observation.js";
import { createSceneWorkFence } from "../packages/villages/src/server/jobs/scene-work-fence.js";
import {
  narrationContinuityContext,
  fittedNarrationReadset,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import {
  activeVenueSession,
  configureLiveScenes,
  touchVenueSession,
} from "../packages/villages/src/server/features/scenes/live-session.js";
const now = new Date();
let observations = 0;
const releaseClock = configureVillageClock({
  now: () => new Date(now),
  observe: async () => {
    observations++;
    return { revision: 1 } as any;
  },
});
function deferred() {
  return Promise.withResolvers<void>();
}
function fixture(name: string) {
  const stamp = now.toISOString(),
    calls: string[] = [],
    owners: unknown[] = [],
    active: ActiveVenue = { sessionId: "same", placeId: "venue" },
    sessions = new Map<string, VenueScene>(),
    world = coerceVillageState({
      ...defaultVillageState(),
      seed: name,
      foundedAt: stamp,
      villagers: [
        {
          letterFontId: "caveat",
          characterId: "mara",
          incarnation: "one",
          addedAt: stamp,
          cardSnapshot: { id: "mara", name: name + " Mara", capturedAt: stamp, revision: 1, sourceStatus: "available" },
          agenda: agendaFixture({
            day: [{ startMinute: 0, endMinute: 1440, venueId: "venue", zoneId: "community", activity: "listening" }],
          }),
        },
      ],
      venues: [
        venueFixture({
          residentIds: [null].filter((id) => typeof id === "string" && !!id),
          id: "venue",
          name,
          classes: ["community"],
          description: name,
        }),
      ],
    });
  initializeVenueAccess(world.venues[0]!);
  for (const zone of world.venues[0].zones!) {
    initializeRoomContinuity(world, "venue", zone.id, zone.description, "founding", stamp);
    zone.observed = captureZoneObservation(world.venues[0], zone, zone.description);
  }
  const saved = coerceSession({
    version: 5,
    id: "same",
    villageSeed: world.seed,
    placeId: "venue",
    placeName: name,
    status: "active",
    startedAt: stamp,
    lastActivityAt: stamp,
    zoneId: "community",
    area: "public",
    participants: [{ characterId: "mara", name: name + " Mara", doing: "listening" }],
    activeIds: ["mara"],
    sceneAttendance: captureSceneAttendance(world, "venue", now),
    lines: [],
    submissions: [],
  });
  saved.continuity = captureSceneContinuity(world, saved, now.getTime());
  const capturedWorld = structuredClone(world),
    capturedScene = structuredClone(saved);
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
    owners.push(activationScope());
    if (activationScope()?.active === false) throw Error("Original live Scene connection unavailable.");
    if (call === failureAt) throw failure;
  }
  async function wait(call: string) {
    if (pauseAt !== call) return;
    pauseAt = "";
    entered.resolve();
    await gate.promise;
    note(call + ":resumed");
  }
  const fence = createSceneWorkFence();
  const service = createLiveScenes({
    withSceneWork: fence.run,
    withIdleSceneWork: (id, observe) => (fence.isBusy(id) ? Promise.resolve() : fence.run(id, observe)),
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
    fence,
    entered,
    gate,
    submission(status: "held" | "applied", id = "accepted") {
      const base = {
        id,
        message: "",
        mode: "chat",
        targetId: "",
        at: stamp,
        requestFingerprint: memoryHash(["chat", "", null, ""]),
        acceptance: { status, rejected: [] },
      };
      if (status === "applied")
        return readNarrationSubmission({ ...base, episodeId: "episode-" + id, progressProcessedAt: stamp });
      const context = narrationContinuityContext(capturedWorld, capturedScene, capturedWorld.venues[0], id, "", stamp),
        readset = fittedNarrationReadset(
          capturedWorld,
          context,
          context.parts.flatMap((part) => (part.block.evidenceId ? [part.block.evidenceId] : [])),
        ),
        raw = { segments: [{ id: "reply", kind: "narration", text: "The hall is quiet." }] };
      return readNarrationSubmission({ ...base, narration: { raw, readset, responseDigest: memoryHash(raw) } });
    },
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
  {
    const f = fixture("observation-fence");
    const zone = f.world.venues[0].zones!.find((row) => row.id === "community")!;
    const previous = structuredClone(zone.observed);
    const queued = deferred(),
      release = deferred();
    const owner = f.fence.run(f.saved.id, async () => {
      retainNativeFact(
        f.world,
        {
          id: "room-edit",
          kind: "structure",
          targetId: JSON.stringify(["venue", "community"]),
          revision: 1,
          text: "A fresh lamp stands by the chair.",
          witnesses: [],
        },
        now.toISOString(),
        { room: { kind: "room", placeId: "venue", zoneId: "community" } },
      );
      queued.resolve();
      await release.promise;
    });
    try {
      await queued.promise;
      await f.service.activeVenueSession();
      assert.deepEqual(zone.observed, previous, "An admitted owner prevents a concurrent observation");
    } finally {
      release.resolve();
      await owner;
    }
    await f.service.activeVenueSession();
    assert.match(zone.observed!.description, /fresh lamp/);
  }
  {
    const f = fixture("authored-unvisited");
    const zone = f.world.venues[0].zones!.find((row) => row.id === "community")!;
    zone.seen = false;
    assert.ok(zone.observed);
    await f.service.requireLiveVenueSession(f.saved.id);
    assert.equal(zone.seen, true, "entering a Zone records the visit even when its authored appearance is unchanged");
  }
  for (const completing of [false, true]) {
    const invalid = fixture("missing-native-access");
    delete invalid.world.venues[0]!.access;
    if (completing) {
      invalid.saved.continuity = structuredClone(invalid.saved.continuity);
      delete invalid.saved.continuity!.facts.venues[0]!.access;
    }
    const before = structuredClone({ scene: invalid.saved, world: invalid.world });
    await assert.rejects(invalid.service.refreshZoneParticipants(invalid.saved, completing), /no native access record/);
    assert.deepEqual({ scene: invalid.saved, world: invalid.world }, before);
    assert(!invalid.calls.some((call) => call.startsWith("change:") || call === "world-change"));
  }
  for (const hold of ["busy", "failed", "held"] as const) {
    const held = fixture("native-access-" + hold);
    delete held.world.venues[0]!.access;
    if (hold === "busy") held.setBusy(true);
    if (hold === "failed")
      held.saved.operation = {
        id: "paid",
        kind: "turn",
        status: "interrupted",
        error: "Unknown provider outcome",
      } as any;
    if (hold === "held") held.saved.submissions.push(held.submission("held"));
    const before = structuredClone(held.saved);
    assert.equal(await held.service.refreshZoneParticipants(held.saved), held.saved);
    assert.deepEqual(held.saved, before);
    assert(!held.calls.includes("world"));
  }
  const capturedAccess = fixture("captured-native-access");
  delete capturedAccess.world.venues[0]!.access;
  const admitted = structuredClone(capturedAccess.saved);
  const completed = await capturedAccess.service.refreshZoneParticipants(capturedAccess.saved, true);
  assert.deepEqual(completed, admitted, "completion uses its valid captured ledger and attendance");
  for (const missing of ["zoneId", "sceneAttendance"] as const) {
    const invalid = fixture("missing-" + missing);
    delete invalid.saved[missing];
    const before = structuredClone(invalid.saved);
    await assert.rejects(invalid.service.refreshZoneParticipants(invalid.saved), /no current live admission/);
    await assert.rejects(invalid.service.refreshZoneParticipants(invalid.saved, true), /no current live admission/);
    assert.deepEqual(invalid.saved, before);
    assert(!invalid.calls.some((call) => call === "world" || call.startsWith("change:")));
    for (const hold of ["busy", "failed", "held"] as const) {
      const held = fixture(missing + "-" + hold);
      delete held.saved[missing];
      if (hold === "busy") held.setBusy(true);
      if (hold === "failed")
        held.saved.operation = { id: "paid", kind: "turn", status: "failed", error: "Unknown provider outcome" } as any;
      if (hold === "held") held.saved.submissions.push(held.submission("held"));
      const retained = structuredClone(held.saved);
      const observed = observations;
      assert.equal(await held.service.refreshZoneParticipants(held.saved), held.saved);
      assert.equal(observations, observed + 1, "Held work still observes authoritative Village time");
      assert.deepEqual(held.saved, retained);
      assert(!held.calls.some((call) => call === "world" || call.startsWith("change:")));
    }
  }
  const setup = fixture("interrupted-setup");
  setup.saved.continuity = undefined;
  setup.saved.sceneAttendance!.layout = undefined;
  const sourceAt = setup.saved.sceneAttendance!.capturedAt;
  const resumed = await setup.service.refreshZoneParticipants(setup.saved, true);
  assert(resumed.continuity);
  assert(resumed.sceneAttendance!.layout);
  assert.equal(resumed.sceneAttendance!.capturedAt, sourceAt);
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
  assert.equal((await played.service.activeVenueSession())?.status, "active");
  assert.equal(played.sessions.get("same")?.endReason, "");
  assert.equal(played.active.sessionId, "same");
  assert.equal(played.sessions.get("same")?.lines[0]?.content, "Hello");
  const unplayed = fixture("unplayed");
  unplayed.saved.lastActivityAt = "2020-01-01T00:00:00.000Z";
  assert.equal((await unplayed.service.activeVenueSession())?.status, "active");
  assert.equal(unplayed.sessions.size, 1, "absence preserves even an empty Scene");
  for (const evidence of ["raw", "checkpoint", "unknown", "committed"]) {
    const interrupted = fixture("saved-" + evidence);
    interrupted.saved.lastActivityAt = "2020-01-01T00:00:00.000Z";
    if (evidence === "committed") {
      interrupted.saved.lines.push({
        id: "greeting-line",
        role: "assistant",
        speakerId: "mara",
        name: "Mara",
        content: "Hello",
        at: interrupted.saved.startedAt,
        heardBy: ["player"],
      });
      interrupted.saved.submissions.push({
        ...interrupted.submission("applied", "greeting"),
        replyLineIds: ["greeting-line"],
      });
      interrupted.saved.operation = {
        id: "greeting",
        kind: "greet",
        status: "complete",
        attempts: {},
        checkpoints: {},
      } as any;
    } else if (evidence === "unknown")
      interrupted.saved.generationReceipts = [
        {
          operationId: "greeting",
          attemptId: "paid",
          stages: ["narration"],
          outcome: "unknown",
          acknowledgedAt: interrupted.saved.startedAt,
        },
      ];
    else
      interrupted.saved.operation = {
        id: "greeting",
        kind: "greet",
        status: "interrupted",
        attemptId: "paid",
        token: "owner",
        sceneRevision: 0,
        input: {},
        attempts:
          evidence === "raw" ? { paid: { status: "complete", result: { content: "Saved paid greeting" } } } : {},
        checkpoints: evidence === "checkpoint" ? { "greeting-reply": { lines: ["Saved paid greeting"] } } : {},
      } as any;
    const before = structuredClone({
      operation: interrupted.saved.operation,
      receipts: interrupted.saved.generationReceipts,
      lines: interrupted.saved.lines,
      submissions: interrupted.saved.submissions,
    });
    assert.equal((await interrupted.service.activeVenueSession())?.status, "active");
    const archived = interrupted.sessions.get("same")!;
    assert.equal(archived.status, "active");
    assert.equal(archived.endReason, "");
    assert.equal(interrupted.active.sessionId, "same");
    assert.deepEqual(
      {
        operation: archived.operation,
        receipts: archived.generationReceipts,
        lines: archived.lines,
        submissions: archived.submissions,
      },
      before,
    );
    assert.equal((await interrupted.service.requireLiveVenueSession("same")).id, "same");
  }
  const arrived = fixture("arrived");
  arrived.saved.continuity = undefined;
  arrived.saved.lastActivityAt = "2020-01-01T00:00:00.000Z";
  arrived.onChange(() => arrived.setBusy(true));
  assert.equal((await arrived.service.activeVenueSession())?.status, "active");
  assert(!arrived.calls.includes("write:same"), "operation arriving before capture retains its admitted context");
  assert(!arrived.calls.includes("clear:same"));
  const ended = fixture("ended");
  ended.saved.status = "closed";
  await assert.rejects(ended.service.requireLiveVenueSession("same"), /already ended/);
  const inactive = fixture("inactive");
  inactive.saved.lastActivityAt = "2020-01-01T00:00:00.000Z";
  assert.equal((await inactive.service.requireLiveVenueSession("same")).status, "active");
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
  const continued = await attendance.service.refreshZoneParticipants(attendance.saved, true);
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
    zoneId: "community",
  }));
  await assert.rejects(crowded.service.refreshZoneParticipants(crowded.saved, true), /Five residents/);
  assert(!crowded.calls.includes("change:same"));
  const claim = fixture("claim"),
    venue = claim.world.venues[0]!,
    zone = resolveVenueZone(venue, "community")!;
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
  claim.fail("change:same", Error("Scene acknowledgement unavailable"));
  await assert.rejects(claim.service.refreshZoneParticipants(claim.saved, true), /acknowledgement unavailable/);
  assert.equal(venue.access!.permissions[0]!.sceneId, "same");
  assert.equal(claim.sessions.get("same")!.pendingAccessClaim, "permission");
  claim.fail("", Error("unused"));
  const settled = await claim.service.refreshZoneParticipants(claim.saved, true);
  assert.equal(venue.access!.permissions[0]!.sceneId, "same");
  assert.equal(settled.pendingAccessClaim, undefined);
  assert(
    claim.calls.indexOf("world-change") < claim.calls.indexOf("change:same"),
    "claim is committed before the Scene flag is cleared",
  );
  const revoked = fixture("revoked-before-entry");
  const revokedPlace = revoked.world.venues[0]!;
  const revokedZone = resolveVenueZone(revokedPlace, "community")!;
  revokedZone.access!.mode = "permission-required";
  revokedPlace.access!.managerIds = ["mara"];
  const pendingGrant = { ...venue.access!.permissions[0]!, sceneId: null };
  revokedPlace.access!.permissions.push(pendingGrant);
  revoked.saved.continuity = captureSceneContinuity(revoked.world, revoked.saved, Date.parse(revoked.saved.startedAt));
  revoked.saved.pendingAccessClaim = pendingGrant.id;
  pendingGrant.revoked = true;
  revokedPlace.access!.permissions.push({ ...pendingGrant, id: "alternate-permission", revoked: false });
  const denied = await revoked.service.refreshZoneParticipants(revoked.saved, true);
  assert.equal(denied.zoneId, "exterior");
  assert.equal(denied.pendingAccessClaim, undefined);
  assert(revokedPlace.access!.permissions.every((grant) => grant.sceneId === null));
  assert(!denied.continuity!.facts.venues[0].access!.permissions.some((grant) => grant.sceneId));
  assert.equal(denied.lines.length, 0, "Unadmitted entry never publishes a departure from the private Zone");
  const removed = fixture("zone-removed-before-entry");
  removed.saved.pendingAccessClaim = "removed-permission";
  removed.world.venues[0].zones = removed.world.venues[0].zones!.filter((zone) => zone.id !== "community");
  for (const zone of removed.world.venues[0].zones)
    zone.connectedTo = zone.connectedTo?.filter((id) => id !== "community");
  const redirected = await removed.service.refreshZoneParticipants(removed.saved, true);
  assert.equal(redirected.zoneId, "exterior");
  assert.equal(redirected.pendingAccessClaim, undefined);
  const privateExit = fixture("private-exit"),
    privateVenue = privateExit.world.venues[0]!,
    privateZone = resolveVenueZone(privateVenue, "community")!;
  privateZone.access!.mode = "permission-required";
  privateVenue.access!.managerIds = ["player"];
  privateExit.saved.continuity = structuredClone(privateExit.saved.continuity);
  privateExit.saved.continuity!.facts.venues = structuredClone(privateExit.world.venues);
  privateExit.saved.zoneId = "exterior";
  privateExit.saved.activeIds = [];
  privateExit.retry();
  const displaced = await privateExit.service.refreshZoneParticipants(privateExit.saved, true);
  assert.deepEqual(displaced.accompanying, [{ characterId: "mara", zoneId: "exterior" }]);
  assert.equal(displaced.lines.length, 1, "abandoned retry narration is not persisted");
  assert.equal(displaced.lines[0]!.zoneId, "community");
  assert.equal(displaced.lines[0]!.contactHidden, false, "player at destination witnesses the exit");
  assert.deepEqual(displaced.lines[0]!.heardBy, ["mara"]);
  const unseen = fixture("unseen"),
    unseenVenue = unseen.world.venues[0]!,
    hiddenZone = structuredClone(resolveVenueZone(unseenVenue, "community")!);
  hiddenZone.id = "restricted";
  hiddenZone.name = "Private room";
  hiddenZone.kind = "restricted";
  hiddenZone.access!.mode = "permission-required";
  hiddenZone.access!.managerIds = ["player"];
  unseenVenue.zones!.push(hiddenZone);
  unseen.saved.continuity = structuredClone(unseen.saved.continuity);
  unseen.saved.continuity!.facts.venues = structuredClone(unseen.world.venues);
  unseen.saved.sceneAttendance!.layout = captureSceneLayout(unseenVenue);
  unseen.saved.sceneAttendance!.occupants[0]!.zoneId = hiddenZone.id;
  unseen.saved.sceneAttendance!.occupants.push({
    characterId: "unrelated",
    name: "Unrelated witness",
    doing: "reading",
    availability: "online",
    zoneId: "community",
  });
  unseen.saved.participants.push({ characterId: "unrelated", name: "Unrelated witness", doing: "reading" });
  unseen.saved.activeIds = ["unrelated"];
  const hiddenExit = await unseen.service.refreshZoneParticipants(unseen.saved, true);
  assert.equal(hiddenExit.zoneId, "community");
  assert.equal(hiddenExit.lines.length, 1);
  assert.equal(hiddenExit.lines[0]!.contactHidden, true, "unseen third-Zone movement stays server-only");
  assert.equal(hiddenExit.lines[0]!.zoneId, "restricted");
  assert.deepEqual(hiddenExit.lines[0]!.heardBy, ["mara"]);
  assert.deepEqual(hiddenExit.activeIds, ["unrelated"], "unseen departure adds no player-Zone attendance");
  const concurrent = fixture("concurrent"),
    concurrentVenue = concurrent.world.venues[0]!;
  resolveVenueZone(concurrentVenue, "community")!.access!.mode = "permission-required";
  concurrentVenue.access!.managerIds = ["player"];
  concurrent.saved.continuity = structuredClone(concurrent.saved.continuity);
  concurrent.saved.continuity!.facts.venues = structuredClone(concurrent.world.venues);
  concurrent.saved.zoneId = "exterior";
  concurrent.saved.activeIds = [];
  concurrent.onChange(() => {
    concurrent.saved.accompanying = [{ characterId: "mara", zoneId: "exterior" }];
  });
  const alreadyMoved = await concurrent.service.refreshZoneParticipants(structuredClone(concurrent.saved), true);
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
    const releaseA = a.run(() => configureLiveScenes(first.service));
    first.pause(command === "active" ? "active" : "world");
    const pending = a.run(() => (command === "active" ? activeVenueSession() : touchVenueSession("same")));
    await first.entered.promise;
    const releaseB = a.run(() => b.run(() => configureLiveScenes(second.service)));
    first.gate.resolve();
    const result = await pending;
    assert.equal(result?.placeName, "A");
    assert.deepEqual(second.calls, []);
    assert(first.owners.every((owner) => owner === a));
    b.run(() => a.run(releaseA));
    a.dispose();

    await b.run(async () =>
      assert.equal((await activeVenueSession())?.placeName, "B", "older cleanup leaves B registration intact"),
    );
    assert(second.owners.every((owner) => owner === b));
    await b.run(() =>
      assert.rejects(
        a.run(() => activeVenueSession()),
        /not configured/,
      ),
    );
    const missing = createActivationScope();
    await b.run(() =>
      assert.rejects(
        missing.run(() => activeVenueSession()),
        /not configured/,
      ),
    );
    missing.dispose();
    b.run(() => b.run(releaseB));
    b.dispose();

    await assert.rejects(activeVenueSession(), /not configured/);
  }
  const retired = createActivationScope(),
    old = fixture("retired"),
    current = createActivationScope(),
    replacement = fixture("replacement");
  retired.run(() => configureLiveScenes(old.service));

  old.pause("active");
  const pending = retired.run(() => activeVenueSession());
  await old.entered.promise;
  retired.dispose();
  const releaseCurrent = retired.run(() => current.run(() => configureLiveScenes(replacement.service)));
  old.gate.resolve();
  await assert.rejects(pending, /Original live Scene connection unavailable/);
  assert.deepEqual(replacement.calls, [], "retired in-flight work cannot borrow replacement connections");

  current.run(() => current.run(releaseCurrent));
  current.dispose();

  console.log("PASS native Scene ownership, persistent absence, captured attendance and access ordering");
}
await main()
  .finally(releaseClock)
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
