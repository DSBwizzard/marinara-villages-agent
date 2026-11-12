// Test cases: scene-history/current-pages, scene-history/current-only, scene-history/admitted-snapshot, scene-history/corruption
import assert from "node:assert/strict";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { runCase } from "../scripts/test-cases.mjs";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import {
  createSceneHistory,
  readSceneHistoryRoot,
  validateSceneHistory,
  SCENE_STORAGE_FORMAT,
} from "../packages/villages/src/server/adapters/storage/scene-history.js";

const at = "2026-11-09T12:00:00.000Z";
function fixture(count = 140) {
  const rows = new Map<string, any>();
  let writes = 0;
  const documents = {
    async getById(_pkg: string, id: string) {
      return structuredClone(rows.get(id) ?? null);
    },
    async create(input: any) {
      writes++;
      assert.ok(!rows.has(input.id));
      const row = { ...structuredClone(input), revision: 1 };
      rows.set(row.id, row);
      return structuredClone(row);
    },
  } as CapabilityDocumentStore;
  const world = { ...defaultVillageState(), seed: "world", setupAt: at, setting: "A quiet harbor." };
  const scene = coerceSession({
    version: 5,
    id: "scene",
    villageSeed: "world",
    placeId: "house",
    zoneId: "parlor",
    status: "active",
    startedAt: at,
    participants: [{ characterId: "mara", name: "Mara", doing: "Talking" }],
    activeIds: ["mara"],
    lines: Array.from({ length: count }, (_, index) => ({
      id: "line-" + index,
      speakerId: "mara",
      name: "Mara",
      role: "assistant",
      kind: "dialogue",
      content: "A remembered exchange " + index + " 👩🏽‍🚀",
      at,
      heardBy: ["player", "mara"],
      zoneId: "parlor",
    })),
    submissions: Array.from({ length: count }, (_, index) => ({
      id: "turn-" + index,
      mode: "chat",
      message: "  Why?\n*A private thought.* 👩🏽‍🚀  ",
      at,
      targetId: "mara",
      requestFingerprint: memoryHash(["chat", "mara", "  Why?\n*A private thought.* 👩🏽‍🚀  ", null]),
      acceptance: { status: "applied", rejected: [] },
      episodeId: "episode-" + index,
      progressProcessedAt: at,
      replyLineIds: ["line-" + index],
      activeIdsAtTurn: ["mara"],
    })),
  });
  scene.continuity = captureSceneContinuity(world, scene, Date.parse(at));
  return {
    rows,
    documents,
    world,
    scene,
    history: () => createSceneHistory({ ...documents }),
    get writes() {
      return writes;
    },
  };
}

await runCase("scene-history/current-pages", async () => {
  const f = fixture(),
    original = await f.history().encode(f.scene);
  assert.equal(original.storageFormat, SCENE_STORAGE_FORMAT);
  assert.equal(original.version, 5);
  assert.equal(Object.hasOwn(original, "lines"), false);
  assert.equal(Object.hasOwn(original, "submissions"), false);
  assert.equal(Object.hasOwn(original.continuity!, "relationshipHead"), false);
  f.world.setting = "Changed later.";
  const cold = await f.history().decode(JSON.parse(JSON.stringify(original)));
  assert.equal(cold.continuity?.facts.setting, "A quiet harbor.");
  assert.deepEqual(cold.lines, f.scene.lines);
  assert.deepEqual(cold.submissions, f.scene.submissions);
  assert.equal(cold.submissions[0].message, "  Why?\n*A private thought.* 👩🏽‍🚀  ");
  assert.ok(
    cold.lines.every((line) => line.speakerId !== "player"),
    "storage never materializes private input as player speech",
  );
  await validateSceneHistory(f.documents, [original]);
  const unchangedWrites = f.writes;
  await f.history().encode(cold, original);
  assert.equal(f.writes, unchangedWrites, "an unchanged cold snapshot reuses immutable prose and submission pages");
});

await runCase("scene-history/current-only", async () => {
  const f = fixture(2),
    current = await f.history().encode(f.scene),
    before = structuredClone([...f.rows]),
    writes = f.writes;
  for (const format of [1, 4, 12, 13]) {
    await assert.rejects(f.history().decode({ ...current, storageFormat: format }), /unsupported Scene storage/);
  }
  await assert.rejects(f.history().decode({ ...current, version: 4 }), /unsupported Scene storage/);
  assert.throws(
    () =>
      coerceSession({
        ...f.scene,
        lines: [{ ...f.scene.lines[0], speechSource: { version: 3, spans: [] } }],
      }),
    /unsupported.*speech/,
  );
  assert.equal(f.writes, writes);
  assert.deepEqual([...f.rows], before);
});

await runCase("scene-history/admitted-snapshot", async () => {
  const f = fixture(2),
    snapshot = await f.history().encode(f.scene);
  f.scene.operation = {
    id: "operation",
    kind: "chat",
    input: { submissionId: "new" },
    token: "owner",
    attemptId: "attempt",
    status: "running",
    stage: "accepted-request",
    startedAt: at,
    sceneRevision: 1,
    snapshot: snapshot as any,
    checkpoints: { "fitted-request": { exactInput: "  Why?  ", targets: [] } },
    attempts: {},
    error: "",
  };
  const saved = await f.history().encode(f.scene, snapshot);
  const cold = await f.history().decode(saved);
  assert.deepEqual(cold.operation?.checkpoints["fitted-request"], { exactInput: "  Why?  ", targets: [] });
  await validateSceneHistory(f.documents, [saved]);
  const foreign = JSON.parse(JSON.stringify(saved));
  foreign.operation.snapshot.continuity.setupAt = "2026-11-08T12:00:00.000Z";
  assert.throws(() => readSceneHistoryRoot(foreign), /another world scope/);
});

await runCase("scene-history/corruption", async () => {
  const f = fixture(3),
    saved = await f.history().encode(f.scene);
  const page = [...f.rows.values()].find((row) => row.kind === "memory-page" && row.data.node.type === "text");
  page.data.node.text += "corrupt";
  const before = structuredClone([...f.rows]),
    writes = f.writes;
  await assert.rejects(f.history().decode(saved), /digest|changed/);
  await assert.rejects(validateSceneHistory(f.documents, [saved]), /digest|changed/);
  assert.equal(f.writes, writes);
  assert.deepEqual([...f.rows], before);
});
