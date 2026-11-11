import {
  narrationContinuityContext,
  fittedNarrationReadset,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import { acceptNarration } from "../packages/villages/src/server/domain/rules/narration-native.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { retainNativeFact } from "../packages/villages/src/server/domain/rules/native-continuity.js";
import { mutableSceneSubmission } from "../packages/villages/src/server/domain/rules/scene-submissions.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import { captureZoneObservation } from "../packages/villages/src/server/domain/rules/zone-observation.js";
import assert from "node:assert/strict";
import {
  createActivationScope,
  activationScope,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { villagerCardFromSnapshot } from "../packages/villages/src/server/adapters/engine/catalog.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VenueScene } from "../packages/villages/src/server/domain/models/scene-model.js";
import {
  createVillageSnapshot,
  type VillageSnapshotPorts,
} from "../packages/villages/src/server/features/world/snapshot-service.js";
import {
  buildVillageSnapshot,
  configureVillageSnapshot,
} from "../packages/villages/src/server/features/world/snapshot.js";
import { privatePreparationRooms } from "../packages/villages/src/server/jobs/private-space-preparation.js";

const stamp = "2026-10-07T12:00:00.000Z";
const now = new Date(stamp);
function deferred() {
  return Promise.withResolvers<void>();
}
function fixture(label: string, missingColors = false) {
  const world = coerceVillageState({
    ...defaultVillageState(),
    seed: "same-seed",
    name: label,
    foundedAt: stamp,
    setupAt: stamp,
    villagers: [
      {
        letterFontId: "caveat",
        characterId: "resident",
        incarnation: "founding-resident",
        cardSnapshot: {
          id: "resident",
          name: label + " adopted",
          capturedAt: stamp,
          sourceStatus: "available",
          revision: 1,
          nameColor: "adopted-name",
          dialogueColor: "adopted-dialogue",
        },
      },
    ],
  });
  const adopted = world.villagers[0]!.cardSnapshot;
  const card = {
    ...villagerCardFromSnapshot(adopted),
    name: label + " live",
    summary: label + " summary",
    nameColor: label + " color",
    dialogueColor: label + " dialogue",
  };
  if (missingColors) {
    delete adopted.nameColor;
    delete adopted.dialogueColor;
  }
  const calls: string[] = [],
    owners: ReturnType<typeof activationScope>[] = [];
  const entered = deferred(),
    gate = deferred();
  let paused = "",
    failure = "",
    rolling = false;
  const exact = new Error(label + " exact failure");
  async function touch(stage: string) {
    calls.push(stage);
    const owner = activationScope();
    owners.push(owner);
    if (stage === paused) {
      entered.resolve();
      await gate.promise;
    }
    if (owner && !owner.active) throw new Error("Original snapshot connection unavailable");
    assert.equal(activationScope(), owner);
    if (stage === failure) throw exact;
  }
  let activeScene: VenueScene | null = null;
  const ports: VillageSnapshotPorts = {
    readVillageState: async () => {
      await touch("world");
      return world;
    },
    listVillagerCards: async (ids) => {
      await touch("catalog");
      assert.deepEqual(ids, ["resident"]);
      return [card];
    },
    rollActiveAgendas: async (date, supplied) => {
      await touch("roll");
      assert.equal(date, now);
      assert.equal(supplied, world);
      return rolling;
    },
    sceneQueries: () => {
      calls.push("query-connection");
      return {
        activeVenueSession: async () => {
          await touch("scene");
          return activeScene;
        },
      };
    },
    backgroundWorkSummaries: async () => {
      await touch("background");
      return [];
    },
    privatePreparationRooms,
  };
  const service = createVillageSnapshot(ports);
  return {
    world,
    ports,
    setScene: (scene: VenueScene) => {
      activeScene = scene;
    },
    card,
    calls,
    owners,
    service,
    exact,
    entered,
    gate,
    pause(stage: string) {
      paused = stage;
    },
    fail(stage: string) {
      failure = stage;
    },
    roll() {
      rolling = true;
    },
  };
}

async function main() {
  await assert.rejects(buildVillageSnapshot(now), /not configured/);
  const history = fixture("history");
  history.world.foundingPreparation = { status: "ready", completedIds: ["resident"], currentId: "", error: "" };
  let admission = await history.service.buildVillageSnapshot(now);
  assert.equal(admission.foundingPreparation?.startingHistoryReady, false);
  assert.equal(
    admission.foundingPreparation?.canPlay,
    false,
    "Optional founding completion cannot hide an unprepared starting history",
  );
  assert(
    !JSON.stringify(admission).includes("initializationConflicts"),
    "Ordinary snapshots do not disclose Inspect history",
  );
  history.world.startingHistory.reviewed.resident = "founding-resident";
  admission = await history.service.buildVillageSnapshot(now);
  assert.equal(admission.foundingPreparation?.startingHistoryReady, true);
  assert.equal(admission.foundingPreparation?.canPlay, true);
  const marker = fixture("marker");
  const venue = venueFixture({ id: "square", name: "Square" });
  marker.world.venues.push(venue);
  const scene = zoneEventScene(
    coerceSession({
      version: 5,
      id: "active",
      villageSeed: marker.world.seed,
      status: "active",
      startedAt: stamp,
      placeId: venue.id,
      zoneId: "exterior",
      participants: [],
      activeIds: [],
      lines: [],
      submissions: [],
      sceneAttendance: { capturedAt: stamp, layout: captureSceneLayout(venue), occupants: [] },
    }),
    venue,
  );
  const context = narrationContinuityContext(marker.world, scene, venue, "wait", "I wait.", stamp);
  const readset = fittedNarrationReadset(
    marker.world,
    context,
    context.parts.flatMap((part) => (part.block.evidenceId ? [part.block.evidenceId] : [])),
  );
  const raw = { segments: [{ id: "wait", kind: "narration", text: "The player waits." }] };
  scene.submissions.push({
    mode: "chat",
    id: "late",
    targetId: "",
    message: readset.source.input,
    requestFingerprint: memoryHash("wait"),
    at: stamp,
    changeSequence: 1,
    acceptance: { status: "pending", rejected: [] },
    narration: { raw, readset, responseDigest: memoryHash(raw) },
  });
  marker.setScene(scene);
  marker.world.foundingPreparation = { status: "ready", completedIds: [], currentId: "", error: "" };
  assert.equal(
    (await marker.service.buildVillageSnapshot(now)).foundingPreparation?.canPlay,
    true,
    "An existing Scene retains its captured contract while starting history is pending",
  );
  const revision = (await marker.service.buildVillageSnapshot(now)).sceneChanges!.revision;
  assert.equal(
    (await marker.service.buildVillageSnapshot(now)).sceneChanges!.revision,
    revision,
    "idle snapshots do not restart the feed",
  );
  const turn = mutableSceneSubmission(scene, "late")!;
  const accepted = acceptNarration(marker.world, turn.narration!, turn.id, stamp);
  assert.equal(accepted.held, false);
  turn.acceptance = { status: "applied", rejected: [] };
  turn.episodeId = accepted.episode!.id;
  turn.progressProcessedAt = stamp;
  turn.replyLineIds = accepted.episode!.segments.map((row) => row.id);
  delete turn.narration;
  scene.lines = accepted.episode!.segments;
  const ready = (await marker.service.buildVillageSnapshot(now)).sceneChanges!;
  assert.notEqual(ready.revision, revision, "native acceptance reopens delivery without a processing sequence change");
  retainNativeFact(
    marker.world,
    {
      id: "unrelated",
      kind: "initialization",
      targetId: "player",
      revision: 1,
      text: "An unrelated native fact.",
      witnesses: ["player"],
    },
    stamp,
  );
  assert.equal((await marker.service.buildVillageSnapshot(now)).sceneChanges!.revision, ready.revision);
  turn.recordEvents = [{ id: "own", kind: "project", text: "Work is ready." }];
  assert.notEqual(
    (await marker.service.buildVillageSnapshot(now)).sceneChanges!.revision,
    ready.revision,
    "late own-Scene notice is delivered through shared refresh",
  );
  {
    const f = fixture("observed");
    const venue = venueFixture({ id: "square", name: "Square", description: "Old approach" });
    f.world.venues.push(venue);
    const zone = venue.zones![0];
    zone.observed = captureZoneObservation(venue, zone, zone.description);
    zone.description = "Newly observed approach";
    const current = coerceSession({
      version: 5,
      id: "observed",
      villageSeed: f.world.seed,
      placeId: venue.id,
      zoneId: zone.id,
      status: "active",
      startedAt: stamp,
    });
    const service = createVillageSnapshot({
      ...f.ports,
      readVillageState: async () => structuredClone(f.world),
      rollActiveAgendas: async () => false,
      sceneQueries: () => ({
        activeVenueSession: async () => {
          zone.observed = captureZoneObservation(venue, zone, zone.description);
          return structuredClone(current);
        },
      }),
    });
    const first = await service.buildVillageSnapshot(now);
    assert.equal(
      first.settings.venues[0].zones![0].description,
      "Newly observed approach",
      "the first snapshot projects the reconciled observation",
    );
    assert.equal(first.settings.venues[0].zones![0].pictureGenerateAvailable, true);
  }
  const plain = fixture("plain");
  assert.deepEqual(plain.calls, [], "construction must not read, mutate, load a catalog or start background work");
  const snapshot = await plain.service.buildVillageSnapshot(now);
  assert.deepEqual(plain.calls, ["world", "roll", "catalog", "query-connection", "scene", "background"]);
  assert.equal(snapshot.villagers[0]!.name, "plain live");
  assert.equal(snapshot.villagers[0]!.summary, "", "Card summaries are not a fallback for People descriptions.");
  plain.world.villagers[0]!.identityDescription = {
    text: "A reserved explorer.",
    revision: "player-description",
    initialGenerationComplete: true,
  };
  const described = await plain.service.buildVillageSnapshot(now);
  assert.equal(described.villagers[0]!.summary, "A reserved explorer.");
  assert.deepEqual(described.villagers[0]!.identityDescription, {
    text: "A reserved explorer.",
    revision: "player-description",
  });
  assert.equal((described.villagers[0]!.identityDescription as any)?.initialGenerationComplete, undefined);
  assert.equal(snapshot.villagers[0]!.nameColor, "adopted-name");
  assert.equal(plain.world.villagers[0]!.cardSnapshot.name, "plain adopted");
  const rolled = fixture("rolled");
  rolled.roll();
  await rolled.service.buildVillageSnapshot(now);
  assert.deepEqual(rolled.calls, ["world", "roll", "world", "catalog", "query-connection", "scene", "background"]);
  const oldRead = fixture("double-read");
  await oldRead.service.buildVillageSnapshot(now);
  assert.deepEqual(oldRead.calls.slice(0, 2), ["world", "roll"], "Snapshot reads remain inert");
  const colors = fixture("colors", true);
  const capturedColors = JSON.stringify(colors.world);
  const painted = await colors.service.buildVillageSnapshot(now);
  assert.deepEqual(colors.calls, ["world", "roll", "catalog", "query-connection", "scene", "background"]);
  assert.equal(painted.villagers[0]!.nameColor, "");
  assert.equal(painted.villagers[0]!.dialogueColor, "");
  assert.equal(
    JSON.stringify(colors.world),
    capturedColors,
    "A snapshot never backfills paint from a changed library card",
  );
  await colors.service.buildVillageSnapshot(now);
  assert.equal(JSON.stringify(colors.world), capturedColors);
  for (const stage of ["world", "roll", "catalog", "scene", "background"]) {
    const failed = fixture(stage);
    failed.fail(stage);
    await assert.rejects(failed.service.buildVillageSnapshot(now), (error) => error === failed.exact);
    assert.equal(
      failed.calls.filter((call) => call === stage).length,
      1,
      "connection failures must not implicitly retry",
    );
  }

  for (const stage of ["world", "roll", "catalog", "scene", "background"]) {
    const a = createActivationScope(),
      b = createActivationScope();
    const fa = fixture("A"),
      fb = fixture("B");
    const releaseA = a.run(() => configureVillageSnapshot(fa.service)),
      releaseB = b.run(() => configureVillageSnapshot(fb.service));

    fa.pause(stage);
    const pending = a.run(() => buildVillageSnapshot(now));
    await fa.entered.promise;

    b.run(() => releaseA());

    const current = await b.run(() => buildVillageSnapshot(now));
    assert.equal(current.villagers[0]!.name, "B live");
    fa.gate.resolve();
    const prior = await pending;
    assert.equal(prior.villagers[0]!.name, "A live");
    assert.equal(prior.villagers[0]!.nameColor, "adopted-name");
    assert(fa.owners.every((owner) => owner === a));
    assert(fb.owners.every((owner) => owner === b));
    await b.run(async () =>
      assert.equal(
        (await buildVillageSnapshot(now)).villagers[0]!.name,
        "B live",
        "old cleanup must not remove B's snapshot service",
      ),
    );
    b.run(() => releaseB());

    a.dispose();
    b.dispose();
  }
  const retired = createActivationScope(),
    f = fixture("retired");
  const release = retired.run(() => configureVillageSnapshot(f.service));
  f.pause("catalog");
  const pending = retired.run(() => buildVillageSnapshot(now));
  await f.entered.promise;
  retired.dispose();
  f.gate.resolve();
  await assert.rejects(pending, /Original snapshot connection unavailable/);
  retired.run(() => release());

  await assert.rejects(buildVillageSnapshot(now), /not configured/);
  console.log(
    "PASS owned Village snapshot connections, read ordering, adopted paint, exact failures and paused activation replacement",
  );
}
await main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
