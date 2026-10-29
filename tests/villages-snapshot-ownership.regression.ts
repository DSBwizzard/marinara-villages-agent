import assert from "node:assert/strict";
import {
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import {
  captureMissingVillagerCardColors,
  villagerCardFromSnapshot,
} from "../packages/villages/src/server/adapters/engine/catalog.js";
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
  let resolve!: () => void;
  const promise = new Promise<void>((done) => (resolve = done));
  return { promise, resolve };
}
function fixture(label: string, missingColors = false) {
  const world = coerceVillageState({
    version: 7,
    ...defaultVillageState(),
    seed: "same-seed",
    name: label,
    foundedAt: stamp,
    setupAt: stamp,
    visitMemoryBackfilled: true,
    villagers: [
      {
        characterId: "resident",
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
  world.visitMemoryBackfilled = true;
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
    owners: ReturnType<typeof scopedActivation>[] = [];
  const entered = deferred(),
    gate = deferred();
  let paused = "",
    failure = "",
    rolling = false;
  const exact = new Error(label + " exact failure");
  async function touch(stage: string) {
    calls.push(stage);
    const owner = scopedActivation();
    owners.push(owner);
    if (stage === paused) {
      entered.resolve();
      await gate.promise;
    }
    if (owner && !owner.active) throw new Error("Original snapshot connection unavailable");
    assert.equal(scopedActivation(), owner);
    if (stage === failure) throw exact;
  }
  let activeScene: VenueScene | null = null;
  const ports: VillageSnapshotPorts = {
    readVillageState: async () => {
      await touch("world");
      return world;
    },
    mutateVillageState: async (update) => {
      await touch("mutation");
      update(world);
      update(world);
      return world;
    },
    listVillagerCards: async (ids) => {
      await touch("catalog");
      assert.deepEqual(ids, ["resident"]);
      return [card];
    },
    captureMissingVillagerCardColors,
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
  const marker = fixture("marker");
  const scene = coerceSession({
    version: 3,
    id: "active",
    villageSeed: marker.world.seed,
    status: "active",
    startedAt: stamp,
    placeId: "square",
    participants: [],
    activeIds: [],
    lines: [],
    submissions: [],
  });
  scene.submissions.push({ id: "late", changeSequence: 1, semanticReady: false } as any);
  marker.setScene(scene);
  const revision = (await marker.service.buildVillageSnapshot(now)).placeUpdates!.revision;
  assert.equal(
    (await marker.service.buildVillageSnapshot(now)).placeUpdates!.revision,
    revision,
    "idle snapshots do not restart the feed",
  );
  scene.submissions[0]!.semanticReady = true;
  const ready = (await marker.service.buildVillageSnapshot(now)).placeUpdates!;
  assert.equal(ready.sceneId, scene.id);
  assert.notEqual(ready.revision, revision, "late readiness reopens delivery without a processing sequence change");
  marker.world.exchangeReceipts.foreign = { id: "foreign", sceneId: "elsewhere", noticeSequence: 1 } as any;
  assert.equal((await marker.service.buildVillageSnapshot(now)).placeUpdates!.revision, ready.revision);
  marker.world.exchangeReceipts.own = { id: "own", sceneId: scene.id, noticeSequence: 2 } as any;
  assert.notEqual(
    (await marker.service.buildVillageSnapshot(now)).placeUpdates!.revision,
    ready.revision,
    "late own-Scene notice is delivered through shared refresh",
  );
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
  oldRead.world.visitMemoryBackfilled = false;
  await oldRead.service.buildVillageSnapshot(now);
  assert.deepEqual(
    oldRead.calls.slice(0, 2),
    ["world", "roll"],
    "Snapshot reads do not backfill retired memory stores",
  );
  const colors = fixture("colors", true);
  const painted = await colors.service.buildVillageSnapshot(now);
  assert.deepEqual(colors.calls, [
    "world",
    "roll",
    "catalog",
    "mutation",
    "world",
    "query-connection",
    "scene",
    "background",
  ]);
  assert.equal(painted.villagers[0]!.nameColor, "colors color");
  assert.equal(
    colors.world.villagers[0]!.cardSnapshot.name,
    "colors adopted",
    "missing paint capture must not apply other library edits",
  );
  const writes = colors.calls.filter((stage) => stage === "mutation").length;
  await colors.service.buildVillageSnapshot(now);
  assert.equal(colors.calls.filter((stage) => stage === "mutation").length, writes);
  for (const stage of ["world", "roll", "catalog", "scene", "background", "mutation"]) {
    const failed = fixture(stage, stage === "mutation");
    failed.fail(stage);
    await assert.rejects(failed.service.buildVillageSnapshot(now), (error) => error === failed.exact);
    assert.equal(
      failed.calls.filter((call) => call === stage).length,
      1,
      "connection failures must not implicitly retry",
    );
  }

  for (const stage of ["world", "roll", "catalog", "scene", "background", "mutation"]) {
    const a = createActivationScope(),
      b = createActivationScope();
    const fa = fixture("A", stage === "mutation"),
      fb = fixture("B");
    const releaseA = a.run(() => configureVillageSnapshot(fa.service)),
      releaseB = b.run(() => configureVillageSnapshot(fb.service));
    const clearA = installDefaultActivation(a, () => {});
    fa.pause(stage);
    const pending = buildVillageSnapshot(now);
    await fa.entered.promise;
    const clearB = installDefaultActivation(b, () => {});
    releaseA();
    clearA();
    const current = await buildVillageSnapshot(now);
    assert.equal(current.villagers[0]!.name, "B live");
    fa.gate.resolve();
    const prior = await pending;
    assert.equal(prior.villagers[0]!.name, "A live");
    assert.equal(prior.villagers[0]!.nameColor, stage === "mutation" ? "A color" : "adopted-name");
    assert(fa.owners.every((owner) => owner === a));
    assert(fb.owners.every((owner) => owner === b));
    assert.equal(
      (await buildVillageSnapshot(now)).villagers[0]!.name,
      "B live",
      "old cleanup must not remove B's snapshot service",
    );
    releaseB();
    clearB();
    a.dispose();
    b.dispose();
  }
  const retired = createActivationScope(),
    f = fixture("retired");
  const release = retired.run(() => configureVillageSnapshot(f.service)),
    clear = installDefaultActivation(retired, () => {});
  f.pause("catalog");
  const pending = buildVillageSnapshot(now);
  await f.entered.promise;
  retired.dispose();
  f.gate.resolve();
  await assert.rejects(pending, /Original snapshot connection unavailable/);
  release();
  clear();
  await assert.rejects(buildVillageSnapshot(now), /not configured/);
  console.log(
    "PASS owned Village snapshot connections, read ordering, adopted paint, exact failures and paused activation replacement",
  );
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
