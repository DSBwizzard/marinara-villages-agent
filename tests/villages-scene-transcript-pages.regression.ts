import { sceneHistoryFixture as fixture } from "./helpers/scene-history-store.fixture.js";
import assert from "node:assert/strict";
import { mock } from "node:test";
import { createRepairGate } from "../packages/villages/src/server/adapters/storage/repair-gate.js";
import { sessionSlot } from "../packages/villages/src/server/adapters/storage/scene-slots.js";
import {
  createSceneHistory,
  readSceneIndex,
  validateSceneHistory,
  SCENE_STORAGE_FORMAT,
} from "../packages/villages/src/server/adapters/storage/scene-history.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { heardLines } from "../packages/villages/src/server/domain/rules/scene-record.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
import { collectRetainedStorage } from "../packages/villages/src/server/features/repair/retained-storage-cleanup.js";
import {
  sceneTranscriptStore,
  encodeSceneTranscript,
} from "../packages/villages/src/server/adapters/storage/scene-transcript-pages.js";
import { freezeSceneTranscript } from "../packages/villages/src/server/domain/rules/scene-transcript.js";
import { createRepairService } from "../packages/villages/src/server/features/repair/repair-service.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";

const at = "2026-10-30T12:00:00.000Z";
const line = (id: string) => ({
  id,
  speakerId: "ada",
  name: "Ada",
  role: "assistant" as const,
  content: "Exact witnessed café 🌼 — " + id + ". ".repeat(40),
  at,
  gazeAt: "ada",
  heardBy: ["ada", "remote"],
});
const measurements: unknown[] = [];
for (const count of [1000, 10_000, 25_000]) {
  const f = fixture();
  try {
    const scene = coerceSession({
      version: 3,
      id: "long",
      villageSeed: "seed",
      startedAt: at,
      status: "active",
      participants: [{ characterId: "ada", name: "Ada", doing: "Talking" }],
      lines: Array.from({ length: count }, (_, index) => line("line-" + index)),
      submissions: [],
    });
    await f.mutateDocument("villages-venue-visit-long", sessionSlot, (saved) => Object.assign(saved, scene));
    const initial = structuredClone(f.rows.get("villages-venue-visit-long").data);
    assert.equal(initial.storageFormat, SCENE_STORAGE_FORMAT);
    assert.equal(Object.hasOwn(initial, "lines"), false);
    assert.equal(Object.hasOwn(initial, "heardHistory"), false);
    assert(Buffer.byteLength(JSON.stringify(initial)) < 4096);
    assert.throws(() => readSceneIndex(initial).lines, /not loaded/);
    await f.repository.changeSession("long", (saved) => {
      saved.operation = {
        id: "held",
        kind: "turn",
        input: {},
        token: "token",
        attemptId: "attempt",
        status: "interrupted",
        stage: "saved",
        startedAt: at,
        sceneRevision: saved.sceneRevision,
        snapshot: initial,
        checkpoints: {},
        attempts: {},
        error: "Held",
      };
    });
    const first = (await f.repository.readSession("long")).lines[0];
    const heads = [initial];
    f.reset();
    const stringify = JSON.stringify;
    let jsonBytes = 0;
    mock.method(JSON, "stringify", (...args: unknown[]) => {
      const text = Reflect.apply(stringify, JSON, args);
      if (typeof text === "string") jsonBytes += Buffer.byteLength(text);
      return text;
    });
    try {
      for (let index = 0; index < 20; index++) {
        await f.repository.changeSession("long", (saved) => {
          saved.lastActivityAt = at + index;
          if (index === 0) saved.participants.push({ characterId: "newcomer", name: "Newcomer", doing: "Joining" });
        });
        await f.repository.changeSession("long", (saved) => {
          saved.lines.push(line("new-" + index));
        });
        assert.equal(
          (await f.repository.readSession("long")).lines[0],
          first,
          "unchanged canonical leaves stay shared",
        );
        const current = f.rows.get("villages-venue-visit-long").data;
        heads.push(structuredClone(current));
        const admitted = await createSceneHistory(f.gate.documents).decode(current.operation.snapshot);
        assert.equal(admitted.lines[0], first, "alternating admitted/live reads retain the shared historical head");
      }
    } finally {
      mock.restoreAll();
    }
    const measured = { count, ...f.metrics(), jsonBytes };
    measurements.push(measured);
    assert(
      measured.readBytes < 3 * 1024 * 1024 && measured.writtenBytes < 2 * 1024 * 1024,
      "ordinary Scene persistence cannot read or rewrite complete transcript prose",
    );
    assert(jsonBytes < 10 * 1024 * 1024, "ordinary mutation/encoding cannot serialize all transcript prose");
    const saved = f.rows.get("villages-venue-visit-long").data;
    assert.deepEqual(saved.operation.snapshot.transcript, initial.transcript);
    const cold = createRepairGate(f.documents);
    try {
      const read = await createSceneHistory(cold.documents).decode(saved);
      assert.equal(read.lines.length, count + 20);
      assert.equal(read.lines[0].content, line("line-0").content);
      assert.equal(
        heardLines(read, "remote").length,
        count + 20,
        "historical hearers need not be current participants",
      );
      const admitted = await createSceneHistory(cold.documents).decode(saved.operation.snapshot);
      assert.equal(admitted.lines.length, count);
    } finally {
      cold.dispose();
    }
    const reads = new Map<string, number>();
    await validateSceneHistory(
      {
        getById: async (pkg, id) => {
          reads.set(id, (reads.get(id) ?? 0) + 1);
          return f.gate.documents.getById(pkg, id);
        },
      },
      heads,
    );
    assert(
      [...reads.values()].every((times) => times === 1),
      "shared transcript validation fetches each immutable page once per pass",
    );
    await collectRetainedStorage(f.gate);
    assert.equal((await createSceneHistory(f.gate.documents).decode(saved.operation.snapshot)).lines.length, count);
  } finally {
    f.release();
    f.gate.dispose();
  }
}
console.log("Scene transcript document-store growth:", JSON.stringify(measurements));

const f = fixture();
try {
  const scene = coerceSession({
    version: 3,
    id: "faults",
    villageSeed: "seed",
    startedAt: at,
    status: "closed",
    participants: [{ characterId: "ada", name: "Ada", doing: "Talking" }],
    lines: [
      line("first"),
      {
        ...line("private"),
        content: "Private original words",
        heardBy: ["ada"],
        contactHidden: true,
        soundOnly: { characterIds: ["near"], player: true, text: "A distant clatter." },
      },
    ],
  });
  await f.mutateDocument("villages-venue-visit-faults", sessionSlot, (saved) => Object.assign(saved, scene));
  const logical = await f.repository.readSession("faults");
  assert.equal(heardLines(logical, "near")[0].content, "A distant clatter.");
  assert(!JSON.stringify(heardLines(logical, "near")).includes("Private original words"));
  assert(!JSON.stringify(publicSceneResponse(logical)).includes("Private original words"));
  for (const failure of ["before", "after"] as const) {
    f.fail(failure);
    await assert.rejects(
      f.repository.changeSession("faults", (saved) => {
        saved.lines.push(line(failure));
      }),
      /Synthetic/,
    );
    await collectRetainedStorage(f.gate);
    const restarted = await createSceneHistory(createRepairGate(f.documents).documents).decode(
      f.rows.get("villages-venue-visit-faults").data,
    );
    assert.equal(
      restarted.lines.some((entry) => entry.id === failure),
      failure === "after",
    );
  }
  const native = f.rows.get("villages-venue-visit-faults");
  const head = structuredClone(native.data.transcript);
  // A malformed live reference must hold all deletion, including unrelated orphan pages.
  native.data.transcript.count++;
  const before = structuredClone(f.rows);
  await assert.rejects(collectRetainedStorage(f.gate), /count/);
  assert.deepEqual(f.rows, before);
  native.data.transcript = head;
  const page = f.rows.get(head.lines.id);
  f.rows.delete(page.id);
  const missing = structuredClone(f.rows);
  await assert.rejects(validateSceneHistory(f.gate.documents, [native.data]), /missing/);
  await assert.rejects(collectRetainedStorage(f.gate), /missing/);
  assert.deepEqual(f.rows, missing);
  f.rows.set(page.id, page);
  // A stale unowned cache cannot establish physical persistence when publishing a new owner.
  const detached = coerceSession({ ...logical, id: "detached" });
  detached.lines = freezeSceneTranscript(detached);
  const store = sceneTranscriptStore(f.gate.documents);
  await f.gate.work(() => store.prepare(detached));
  await collectRetainedStorage(f.gate);
  await f.mutateDocument("villages-venue-visit-detached", sessionSlot, (saved) => Object.assign(saved, detached));
  assert.equal((await f.repository.readSession("detached")).lines.length, 2);
  const invalid = encodeSceneTranscript([{ ...line("invalid"), content: "" }], logical);
  for (const [id, data] of invalid.pages)
    await f.documents.create({
      id,
      packageId: "villages",
      kind: "memory-page",
      name: "Invalid source fixture",
      description: "",
      data,
    });
  const broken = { ...native.data, transcript: invalid.head };
  await assert.rejects(validateSceneHistory(f.gate.documents, [broken]), /canonical/);
  const valid = native.data;
  native.data = broken;
  const corrupt = structuredClone(f.rows);
  await assert.rejects(collectRetainedStorage(f.gate), /canonical/);
  assert.deepEqual(f.rows, corrupt);
  native.data = valid;
  // A nested look target is a historical cast dependency even when it never speaks.
  await f.repository.changeSession("faults", (saved) => {
    saved.participants.push({ characterId: "silent", name: "Silent", doing: "Listening" });
    saved.lines.push({
      ...line("staged"),
      staging: [{ characterId: "ada", look: { target: "villager", characterId: "silent" } }],
    });
  });
  await validateSceneHistory(f.gate.documents, [f.rows.get(native.id).data]);
  await assert.rejects(
    f.repository.changeSession("faults", (saved) => {
      saved.participants = saved.participants.filter((person) => person.characterId !== "silent");
    }),
    /participant identity/,
  );
  const world = { ...defaultVillageState(), seed: "seed", setupAt: at };
  const { memories: _memories, memoryScenes: _scenes, memoryReceipts: _receipts, ...facts } = world;
  await f.documents.create({
    id: "villages-village",
    packageId: "villages",
    kind: "village",
    name: "World",
    description: "",
    data: { ...facts, memoryHead: null },
  });
  const repair = createRepairService({
    gate: f.gate,
    repository: createVillageRepository(() => f.gate.documents),
    resumeProject: async () => {},
    cancelProject: async () => {},
    replaySaved: async () => {},
    continueSaved: async () => {},
  });
  const checkpoint = await repair.createCheckpoint("Exact transcripts", "transcript-checkpoint");
  const retained = structuredClone(f.rows.get(native.id).data);
  await f.gate.work(() => f.gate.documents.remove("villages", native.id, f.rows.get(native.id).revision));
  await collectRetainedStorage(f.gate);
  assert.equal(
    (await createSceneHistory(f.gate.documents).decode(retained)).lines.at(-1)?.staging?.[0].look?.target,
    "villager",
  );
  const restoration = await repair.restore(checkpoint.id, "restore-transcript");
  await repair.apply(restoration.id, restoration.token);
  assert.deepEqual(
    (await f.repository.readSession("faults")).lines,
    (await createSceneHistory(f.gate.documents).decode(retained)).lines,
  );
} finally {
  f.release();
  f.gate.dispose();
}
