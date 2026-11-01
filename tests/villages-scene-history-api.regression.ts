import assert from "node:assert/strict";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
import { authorSceneFixture } from "./helpers/village-storage.fixture.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
import { villageWorldScope } from "../packages/villages/src/server/domain/rules/village-identity.js";
import { sessionSlot } from "../packages/villages/src/server/adapters/storage/scene-slots.js";
import { createSceneQueryService } from "../packages/villages/src/server/features/scenes/scene-query-service.js";
import { createSceneCommands } from "../packages/villages/src/server/features/scenes/command-service.js";
import { collectRetainedStorage } from "../packages/villages/src/server/features/repair/retained-storage-cleanup.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { createSceneRepository } from "../packages/villages/src/server/adapters/storage/scene-repository.js";
import { createSceneRetirement } from "../packages/villages/src/server/features/scenes/scene-retirement-service.js";
import { createSceneWorkFence } from "../packages/villages/src/server/jobs/scene-work-fence.js";
import { createRepairService } from "../packages/villages/src/server/features/repair/repair-service.js";
import {
  createRepairStorage,
  repairStorageId,
} from "../packages/villages/src/server/features/repair/repair-storage.js";
import { createRepairSnapshots } from "../packages/villages/src/server/adapters/storage/repair-snapshot-store.js";

const at = "2026-10-31T00:00:00.000Z",
  id = "history-api";
const line = (index: number) => ({
  id: "line:" + index,
  role: "assistant",
  kind: "narration",
  speakerId: "__venue_scene__",
  name: "Narration",
  content: "Exact café 東京 paragraph " + index,
  at,
  heardBy: [],
  ...(index % 5 === 0 ? { contactHidden: true } : {}),
});
function deferred() {
  return Promise.withResolvers<void>();
}
for (const count of [1000, 10_000, 25_000]) {
  const f = sceneHistoryFixture();
  try {
    const world = defaultVillageState();
    world.seed = "history-api-world";
    world.setupAt = count === 10_000 ? "" : at;
    world.foundedAt = at;
    const worlds = createVillageRepository(() => f.gate.documents);
    await worlds.mutateAuthority((saved) => Object.assign(saved, world));
    const scene = coerceSession({
      version: 3,
      id,
      villageSeed: world.seed,
      status: "active",
      startedAt: at,
      participants: [],
      submissions: [],
      lines: Array.from({ length: count }, (_, index) => line(index)),
    });
    scene.continuity = captureSceneContinuity(world, scene, Date.parse(at));
    await f.mutateDocument("villages-venue-visit-" + id, sessionSlot, (saved) => Object.assign(saved, scene));
    let holdId = "";
    const readIds: string[] = [];
    const enter = deferred(),
      release = deferred();
    const service = createSceneQueryService({
      readSession: async () => assert.fail("History must not hydrate a full Scene"),
      readVillageState: async () => assert.fail("History cannot hydrate or settle World state"),
      villagesDocuments: () => ({
        list: () => assert.fail("A History page never lists all documents"),
        getById: async (packageId, key) => {
          readIds.push(key);
          if (key === holdId) {
            enter.resolve();
            await release.promise;
          }
          return f.gate.documents.getById(packageId, key);
        },
      }),
    });
    const scope = villageWorldScope(world),
      expected = publicSceneResponse(scene).lines;
    f.reset();
    const beforeRead = structuredClone(f.rows);
    const latest = await service.readHistoryPage(id, { scope });
    assert.deepEqual(f.rows, beforeRead, "History reads never settle outboxes or publish World state");
    assert.deepEqual(latest.lines, expected.slice(-40));
    assert(latest.olderCursor && !latest.newerCursor);
    assert(
      f.metrics().readBytes < 160 * 1024 && Buffer.byteLength(JSON.stringify(latest)) < 32 * 1024,
      "Cold ordinary History page I/O and response remain bounded",
    );
    console.log(
      `History API ${count}: ${f.metrics().readBytes} read bytes, ${Buffer.byteLength(JSON.stringify(latest))} response bytes`,
    );
    const older = await service.readHistoryPage(id, { scope, cursor: latest.olderCursor });
    assert.deepEqual(older.lines, expected.slice(-80, -40));
    assert.deepEqual((await service.readHistoryPage(id, { scope, cursor: older.newerCursor })).lines, latest.lines);
    const cursor = JSON.parse(Buffer.from(latest.olderCursor, "base64url").toString("utf8"));
    assert.deepEqual(Object.keys(cursor).sort(), ["anchor", "direction", "sceneId", "scope", "v", "version"]);
    assert.equal(cursor.anchor, expected.length - 40, "Only public offsets enter cursors");
    f.reset();
    const playback = await service.readPlaybackPage(id, { scope });
    assert.deepEqual(playback.lines, expected.slice(-40));
    assert.equal(playback.moments.length, 40);
    assert.deepEqual(
      playback.moments.map((moment) => moment.lineIds),
      playback.lines.map((line) => [line.id]),
    );
    assert(
      f.metrics().readBytes < 256 * 1024 && Buffer.byteLength(JSON.stringify(playback)) < 128 * 1024,
      "Cold playback reads and responses stay bounded as the exact history grows",
    );
    console.log(
      `Playback API ${count}: ${f.metrics().readBytes} read bytes, ${Buffer.byteLength(JSON.stringify(playback))} response bytes`,
    );
    const previousPlayback = await service.readPlaybackPage(id, { scope, cursor: playback.olderCursor });
    assert.deepEqual(previousPlayback.lines, expected.slice(-80, -40));
    assert.deepEqual(
      (await service.readPlaybackPage(id, { scope, cursor: previousPlayback.newerCursor })).lines,
      playback.lines,
    );
    assert.deepEqual(
      (await service.readPlaybackPage(id, { scope, cursor: playback.moments[0].anchorCursor })).lines,
      playback.lines,
    );
    const playbackAnchor = JSON.parse(Buffer.from(playback.moments[0].anchorCursor, "base64url").toString("utf8"));
    assert.deepEqual(Object.keys(playbackAnchor).sort(), [
      "digest",
      "direction",
      "id",
      "index",
      "sceneId",
      "scope",
      "v",
    ]);
    assert.equal(playbackAnchor.index, expected.length - 40, "Playback anchors use public moment positions");
    const response = await service.projectSceneResponse({
      ...scene,
      unknownPrivateAuthority: "private authority sentinel",
    });
    assert.deepEqual(response.lines, playback.lines);
    assert.equal(response.playback.totalParagraphs, expected.length);
    assert.equal(Object.hasOwn(response, "submissions"), false);
    assert.equal(Object.hasOwn(response.playback, "lines"), false, "Playback metadata never duplicates response prose");
    assert(!JSON.stringify(response).includes("private authority sentinel"));
    assert(Buffer.byteLength(JSON.stringify(response)) < 128 * 1024, "Every ordinary Scene response is bounded");
    const acknowledged = coerceSession({
      ...scene,
      status: "closed",
      submissions: Array.from({ length: count }, (_, index) => ({
        id: "ack:" + index,
        at,
        mode: "chat",
        targetId: "",
        message: "Exact input",
        recordEvents: [
          { id: "notice:" + index, kind: "memory", text: "Exact retained notice " + index },
          { id: "dismissed", kind: "memory", text: "Dismissed notice" },
        ],
      })),
    });
    const commands = createSceneCommands({
      readSession: async () => acknowledged,
      readVillageSnapshot: async () => ({ dismissedNoticeIds: ["dismissed"] }),
    } as any);
    const closed = await commands.closeVenueSessionWithReceipts(id);
    assert.deepEqual(closed.recordEvents, [
      { id: "notice:" + (count - 1), kind: "memory", text: "Exact retained notice " + (count - 1) },
    ]);
    assert.equal(
      closed.session.submissions.length,
      count,
      "A bounded close acknowledgement never prunes historical changes",
    );
    await assert.rejects(service.readPlaybackPage(id, { scope, cursor: "invalid" }), /cursor/);
    await assert.rejects(service.readHistoryPage(id, { scope, cursor: "invalid" }), /cursor/);
    for (const query of [{}, { scope: "bad" }, { scope, extra: "ignored?" }])
      await assert.rejects(service.readHistoryPage(id, query), (error: any) => error.statusCode === 400);
    await assert.rejects(service.readHistoryPage(id, { scope: "f".repeat(64) }), /Village changed/);
    if (count !== 1000) continue;
    const physical = f.rows.get("villages-venue-visit-" + id);
    const originalData = physical.data;
    const other = coerceSession({ ...scene, id: "other-scene" });
    await f.mutateDocument("villages-venue-visit-other-scene", sessionSlot, (saved) => Object.assign(saved, other));
    physical.data = f.rows.get("villages-venue-visit-other-scene").data;
    readIds.length = 0;
    await assert.rejects(service.readHistoryPage(id, { scope }), /Scene is no longer/);
    assert.deepEqual(readIds, ["villages-village", physical.id], "Mismatched Scene identity reads no private bodies");
    physical.data = originalData;
    await f.repository.changeSession(id, (saved) =>
      saved.lines.push({ ...line(-1), id: "hidden-tail", contactHidden: true } as any),
    );
    const afterHidden = await service.readPlaybackPage(id, { scope, cursor: playback.moments[0].anchorCursor });
    assert.deepEqual(
      afterHidden,
      playback,
      "A hidden-only append cannot disclose itself through playback versions, cursors or frames",
    );
    assert.deepEqual(
      (await service.readHistoryPage(id, { scope, cursor: latest.olderCursor })).lines,
      older.lines,
      "Hidden-only writes preserve public cursors",
    );
    const restored = structuredClone(f.rows.get("villages-venue-visit-" + id));
    await f.repository.changeSession(id, (saved) =>
      saved.lines.push({ ...line(-2), id: "new-public", contactHidden: false } as any),
    );
    const changed = await service.readHistoryPage(id, { scope });
    await assert.rejects(service.readHistoryPage(id, { scope, cursor: latest.olderCursor }), /history changed/);
    await f.gate.alone(async () => {
      f.rows.set(restored.id, restored);
    });
    await assert.rejects(service.readHistoryPage(id, { scope, cursor: changed.olderCursor }), /history changed/);
    assert.deepEqual((await service.readHistoryPage(id, { scope, cursor: latest.olderCursor })).lines, older.lines);

    holdId = f.rows.get(restored.id).data.publicHistory.positions.id;
    const held = service.readHistoryPage(id, { scope });
    await enter.promise;
    await f.repository.changeSession(id, (saved) =>
      saved.lines.push({ ...line(-3), id: "concurrent-public", contactHidden: false } as any),
    );
    const whileReading = structuredClone(f.rows);
    await assert.rejects(collectRetainedStorage(f.gate), /Other Village work is active/);
    assert.deepEqual(f.rows, whileReading, "Cleanup cannot enter the full native-owner/index/prose read");
    release.resolve();
    assert.deepEqual((await held).lines, latest.lines, "Concurrent publication cannot change an admitted History page");
    await collectRetainedStorage(f.gate);
    assert(!f.rows.has(holdId), "The superseded root can retire after its reader drains");
    holdId = "";
    world.setupAt = "2026-10-31T01:00:00.000Z";
    await worlds.mutateAuthority((saved) => {
      saved.setupAt = world.setupAt;
    });
    await assert.rejects(service.readHistoryPage(id, { scope: villageWorldScope(world) }), /Scene is no longer/);
    world.setupAt = at;
    await worlds.mutateAuthority((saved) => {
      saved.setupAt = world.setupAt;
    });
    const rootId = f.rows.get(restored.id).data.publicHistory.positions.id;
    const root = f.rows.get(rootId);
    f.rows.delete(rootId);
    const before = structuredClone(f.rows);
    await assert.rejects(service.readHistoryPage(id, { scope }), /missing/);
    await assert.rejects(collectRetainedStorage(f.gate), /missing/);
    assert.deepEqual(f.rows, before, "A missing index owner holds every cleanup deletion");
    f.rows.set(rootId, root);
    await f.repository.changeSession(id, (saved) => {
      saved.lines = Array.from({ length: 75 }, (_, index) => ({
        ...line(index),
        contactHidden: false,
        content: "é".repeat(3000) + " exact " + index,
      })) as any;
    });
    const expectedLarge = publicSceneResponse(await f.repository.readSession(id)).lines;
    let page = await service.readHistoryPage(id, { scope });
    const allOlder = [...page.lines];
    for (let index = 0; page.olderCursor; index++) {
      assert(index < 75);
      assert(Buffer.byteLength(JSON.stringify(page)) <= 128 * 1024);
      page = await service.readHistoryPage(id, { scope, cursor: page.olderCursor });
      allOlder.unshift(...page.lines);
    }
    assert.deepEqual(allOlder, expectedLarge, "Byte-budgeted older pages omit no exact entries");
    const allNewer = [...page.lines];
    for (let index = 0; page.newerCursor; index++) {
      assert(index < 75);
      assert(Buffer.byteLength(JSON.stringify(page)) <= 128 * 1024);
      page = await service.readHistoryPage(id, { scope, cursor: page.newerCursor });
      allNewer.push(...page.lines);
    }
    assert.deepEqual(allNewer, expectedLarge, "Byte-budgeted newer pages skip no entries between anchors");
    const oversized = "🌼".repeat(40_000);
    await f.repository.changeSession(id, (saved) => {
      saved.lines = [{ ...line(1), content: oversized }] as any;
    });
    const exact = await service.readHistoryPage(id, { scope });
    assert.equal(exact.lines[0].content, oversized, "An oversized single entry stays exact and accessible");
    assert(!exact.olderCursor && !exact.newerCursor);
  } finally {
    f.release();
  }
}
{
  const f = sceneHistoryFixture();
  try {
    const world = { ...defaultVillageState(), seed: "closed-playback", setupAt: at, foundedAt: at };
    const worlds = createVillageRepository(() => f.gate.documents);
    await worlds.mutateAuthority((saved) => Object.assign(saved, world));
    const source = coerceSession({
      version: 3,
      id,
      villageSeed: world.seed,
      status: "closed",
      startedAt: at,
      endedAt: at,
      lines: Array.from({ length: 100 }, (_, index) => ({ ...line(index), contactHidden: false })),
    });
    source.continuity = captureSceneContinuity(world, source, Date.parse(at));
    await f.mutateDocument("villages-venue-visit-" + id, sessionSlot, (saved) => Object.assign(saved, source));
    await f.repository.selectActiveScene(id, "venue");
    await f.repository.clearActivePointer(id, true);
    const released: string[] = [];
    const repository = createSceneRepository({
      villagesDocuments: () => f.gate.documents,
      mutateDocument: f.mutateDocument,
      onPlaybackReleased: (id) => released.push(id),
    });
    assert.equal(
      (await repository.readActive()).playbackSceneId,
      id,
      "The closed owner survives a new repository instance",
    );
    const fence = createSceneWorkFence();
    const retirement = createSceneRetirement({
      villagesDocuments: () => f.gate.documents,
      readActive: repository.readActive,
      readVillageState: async () => world,
      readVillageMemoryState: async () => world,
      mutateVillageMemoryState: async (change) => {
        change(world);
        return world;
      },
      hasVenueOperation: () => false,
      saveProjectEvidence: async () => {},
      saveTerminal: async () => {},
      readTerminal: async () => null,
      removeInterpretationDiagnostics: async () => {},
      withRepairWork: (work) => f.gate.work(work),
      withSceneWork: fence.run,
      withLateResponseWork: fence.run,
    });
    const enter = deferred(),
      release = deferred();
    let hold = true;
    const query = () =>
      createSceneQueryService({
        readSession: repository.readSession,
        readVillageState: async () => world,
        villagesDocuments: () => ({
          list: f.gate.documents.list.bind(f.gate.documents),
          getById: async (pkg, key) => {
            if (hold && key === "villages-venue-visit-" + id) {
              hold = false;
              enter.resolve();
              await release.promise;
            }
            return f.gate.documents.getById(pkg, key);
          },
        }),
      });
    const projecting = query().projectSceneResponse((await repository.readSession(id)) as any);
    await enter.promise;
    assert.equal(await retirement.retire(id), false, "Queued normal retirement cannot remove a closing response owner");
    release.resolve();
    const final = await projecting;
    assert.equal(final.lines[0].id, "line:60");
    const scope = villageWorldScope(world);
    const earlier = await query().readPlaybackPage(id, { scope, cursor: final.playback.olderCursor });
    assert.equal(earlier.lines.at(-1)!.id, "line:59", "Closed playback remains pageable after response and restart");
    const repair = createRepairService({
      gate: f.gate,
      repository: worlds,
      resumeProject: async () => {},
      cancelProject: async () => {},
      replaySaved: async () => {},
      continueSaved: async () => {},
    });
    const checkpoint = await repair.createCheckpoint("Closed Scene", "closed-scene");
    const list = f.documents.list;
    f.documents.list = async (pkg: string, kind: string) =>
      (await list(pkg, kind)).filter((row: any) => kind !== "venue-visit" || row.id !== "villages-venue-visit-" + id);
    try {
      await collectRetainedStorage(f.gate);
      assert.equal(
        (await query().readPlaybackPage(id, { scope, cursor: final.playback.olderCursor })).lines.at(-1)!.id,
        "line:59",
        "Direct closed-owner lookup protects pages even when its kind listing omits it",
      );
      const before = structuredClone(f.rows);
      await assert.rejects(repair.createCheckpoint("Incomplete listing", "incomplete-list"), /ownership is missing/);
      assert.deepEqual(f.rows, before);
    } finally {
      f.documents.list = list;
    }
    const storage = createRepairStorage(f.gate.documents, f.gate.documents),
      snapshots = createRepairSnapshots(f.gate.documents);
    const checkpointId = repairStorageId("repair-checkpoint", checkpoint.id),
      savedCheckpoint = structuredClone(f.rows.get(checkpointId));
    const sources = await storage.restoreCheckpoint(savedCheckpoint.data);
    const pointer = sources.find((row) => row.kind === "venue-active")!,
      closedScene = sources.find((row) => row.id === "villages-venue-visit-" + id)!;
    assert.throws(
      () =>
        storage.validateScenePointers(
          [
            pointer,
            {
              ...closedScene,
              data: {
                id,
                villageSeed: world.seed,
                status: "closed",
                continuity: { seed: world.seed, setupAt: world.setupAt },
              },
            },
          ],
          world,
        ),
      /unsupported|format|Scene/,
      "Matching pointer metadata cannot grant ownership to a non-native Scene header",
    );
    assert.throws(
      () =>
        storage.validateUndoSources(world, [
          { before: pointer, after: pointer },
          { before: closedScene, after: null },
        ]),
      /pointer ownership/,
      "A Scene before-image cannot validate an after-pointer whose target is absent",
    );
    for (const malformed of [
      sources.filter((row) => row.id !== closedScene.id),
      sources.map((row) =>
        row.id === closedScene.id ? { ...row, data: { ...(row.data as object), status: "active" } } : row,
      ),
    ]) {
      const reference = await snapshots.capture(malformed);
      f.rows.set(checkpointId, {
        ...savedCheckpoint,
        data: { ...savedCheckpoint.data, records: malformed.length, snapshots: reference },
      });
      const before = structuredClone(f.rows);
      await assert.rejects(repair.restore(checkpoint.id, "malformed-closed"), /pointer ownership|not closed/);
      assert.deepEqual(f.rows, before, "Malformed historical pointers cannot prepare or publish effects");
      await assert.rejects(collectRetainedStorage(f.gate), /pointer ownership|not closed/);
      assert.deepEqual(f.rows, before, "Malformed historical pointers hold every deletion");
    }
    f.rows.set(checkpointId, savedCheckpoint);
    const native = f.rows.get("villages-venue-visit-" + id);
    for (const corruption of ["missing", "wrong-scope"]) {
      if (corruption === "missing") f.rows.delete(native.id);
      else {
        const foreign = coerceSession({ ...source, villageSeed: "different-world" });
        foreign.continuity = captureSceneContinuity({ ...world, seed: "different-world" }, foreign, Date.parse(at));
        f.rows.set(native.id, { ...native, data: authorSceneFixture(f.rows, foreign) });
      }
      const before = structuredClone(f.rows);
      await assert.rejects(collectRetainedStorage(f.gate), /missing|changed|another Village/);
      assert.deepEqual(f.rows, before, "Invalid closed ownership holds every cleanup deletion");
      f.rows.set(native.id, native);
    }
    const create = f.documents.create;
    f.documents.create = async (input: any) => {
      if (input.id === "villages-venue-visit-replacement") throw Error("Failed new Scene publication");
      return create(input);
    };
    try {
      await assert.rejects(
        f.mutateDocument("villages-venue-visit-replacement", sessionSlot, (saved) =>
          Object.assign(saved, { ...source, id: "replacement" }),
        ),
        /Failed new Scene/,
      );
    } finally {
      f.documents.create = create;
    }
    assert.equal((await repository.readActive()).playbackSceneId, id);
    assert.deepEqual(released, [], "A failed publication never releases the previous playback owner");
    await f.mutateDocument("villages-venue-visit-replacement", sessionSlot, (saved) =>
      Object.assign(saved, { ...source, id: "replacement" }),
    );
    await repository.selectActiveScene("replacement", "venue");
    assert.deepEqual(released, [id]);
    assert.equal((await repository.readActive()).playbackSceneId, undefined);
    assert.equal(await retirement.retire(id), true, "Successful replacement releases normal retirement");
    await repository.clearActivePointer("replacement", true);
    const restoration = await repair.restore(checkpoint.id, "restore-closed");
    const plan = [...f.rows.values()].find(
      (row) => row.kind === "repair-plan" && row.data.review.id === restoration.id,
    )!;
    const completePlan = structuredClone(plan);
    for (const omitted of [native.id, "villages-active-venue"]) {
      const broken = structuredClone(completePlan);
      broken.data.transaction.writes = JSON.stringify(
        JSON.parse(broken.data.transaction.writes).filter((frame: any) => frame.id !== omitted),
      );
      f.rows.set(plan.id, broken);
      const held = structuredClone(f.rows);
      await assert.rejects(repair.apply(restoration.id, restoration.token), /pointer ownership|Scene ownership/);
      assert.deepEqual(f.rows, held, "An incomplete proposed restore cannot publish any effect");
      await assert.rejects(collectRetainedStorage(f.gate), /pointer ownership|Scene ownership/);
      assert.deepEqual(f.rows, held, "An incomplete proposed restore holds all cleanup");
    }
    f.rows.set(plan.id, completePlan);
    await repair.apply(restoration.id, restoration.token);
    assert.equal(
      (await repository.readActive()).playbackSceneId,
      id,
      "Checkpoint restoration publishes the pointer and its Scene together",
    );
    assert.equal(
      (await query().readPlaybackPage(id, { scope, cursor: final.playback.olderCursor })).lines.at(-1)!.id,
      "line:59",
    );
  } finally {
    f.release();
    f.gate.dispose();
  }
}
console.log(
  "Scene History API: exact bounded pages, public cursors, restart/restore scopes and cleanup/read fences passed.",
);
