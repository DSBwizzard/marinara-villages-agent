import assert from "node:assert/strict";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
import { villageWorldScope } from "../packages/villages/src/server/domain/rules/village-identity.js";
import { sessionSlot } from "../packages/villages/src/server/adapters/storage/scene-slots.js";
import { createSceneQueryService } from "../packages/villages/src/server/features/scenes/scene-query-service.js";
import { collectRetainedStorage } from "../packages/villages/src/server/features/repair/retained-storage-cleanup.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";

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
  let resolve!: () => void;
  const promise = new Promise<void>((done) => (resolve = done));
  return { promise, resolve };
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
console.log(
  "Scene History API: exact bounded pages, public cursors, restart/restore scopes and cleanup/read fences passed.",
);
