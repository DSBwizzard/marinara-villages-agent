import assert from "node:assert/strict";
import { mock } from "node:test";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { sessionSlot } from "../packages/villages/src/server/adapters/storage/scene-slots.js";
import { collectRetainedStorage } from "../packages/villages/src/server/features/repair/retained-storage-cleanup.js";
import {
  encodeScenePresentations,
  createScenePresentations,
  readSceneMomentFrames,
  readSceneMomentRange,
} from "../packages/villages/src/server/adapters/storage/scene-presentation-pages.js";
import {
  createSceneHistory,
  validateSceneHistory,
} from "../packages/villages/src/server/adapters/storage/scene-history.js";
import { createRepairGate } from "../packages/villages/src/server/adapters/storage/repair-gate.js";
import { readScenePublicHistoryRange } from "../packages/villages/src/server/adapters/storage/scene-public-history.js";
import {
  advanceStaging,
  createStagingCursor,
  stagingPresentation,
} from "../packages/villages/src/shared/helpers/scene-staging.js";

const at = "2026-10-31T00:00:00.000Z";
const resident = (characterId: string) => ({ characterId, name: characterId.toUpperCase(), doing: "Listening" });
const line = (id: string, speakerId = "a") => ({
  id,
  speakerId,
  role: "assistant" as const,
  kind: "dialogue" as const,
  name: speakerId.toUpperCase(),
  content: "Exact café 東京 paragraph " + id + "\n\nSecond paragraph.",
  at,
  heardBy: ["a", "b"],
});

const f = sceneHistoryFixture();
try {
  const logical = coerceSession({
    version: 3,
    id: "playback",
    villageSeed: "seed",
    startedAt: at,
    status: "active",
    activeIds: ["a", "b"],
    participants: [resident("a"), resident("b")],
    lines: [],
    submissions: [],
  });
  await f.mutateDocument("villages-venue-visit-playback", sessionSlot, (saved) => Object.assign(saved, logical));
  const emptyPresentation = structuredClone(
    f.rows.get("villages-venue-visit-playback").data.publicHistory.presentation,
  );
  const historicalPages = new Map([...f.rows].filter(([, row]) => row.kind === "memory-page"));
  await f.repository.changeSession("playback", (saved) => {
    saved.lines.push(
      {
        ...line("main"),
        staging: [{ characterId: "a", expression: "start", look: { target: "villager", characterId: "b" } }],
      },
      { ...line("aside", "b"), kind: "side", asideFor: "main", staging: [{ characterId: "a", expression: "aside" }] },
      { ...line("move", "__venue_scene__"), kind: "narration", physicalIdsAfter: ["b"] },
    );
    saved.submissions.push({
      id: "turn:first",
      message: "Exact player input",
      mode: "chat",
      at,
      activeIdsAtTurn: ["a", "b"],
      activeIdsAfterTurn: ["a", "b"],
      replyLineIds: ["main", "aside"],
      verdict: null,
      wishId: "",
      wishMemory: "",
    });
    saved.activeIds = ["b"];
  });
  const native = structuredClone(f.rows.get("villages-venue-visit-playback").data);
  const head = native.publicHistory.presentation;
  for (const [id, row] of f.rows) if (row.kind === "memory-page") historicalPages.set(id, structuredClone(row));
  const moments = await readSceneMomentRange(f.documents, head, native.transcript.count, 0, head.count);
  assert.equal(moments.length, 2);
  assert.deepEqual(
    moments[0].lines.map((line) => line.id),
    ["main", "aside"],
    "Asides remain attached to the main moment",
  );
  const frames = await readSceneMomentFrames(f.documents, head, moments, native);
  assert.equal(frames[0].start.state.a.expression, "start", "First paragraph applies only main-line cues");
  assert.equal(frames[0].end.state.a.expression, "aside", "Last paragraph applies attached chatter");
  assert.deepEqual(frames[1].end.activeIds, ["b"]);
  assert.deepEqual(frames[1].end.state.b.look, { target: "player" });
  const first = JSON.stringify(frames[0]);
  const presentationPages = [...f.rows.values()].filter(
    (row) => row.kind === "memory-page" && row.data.world === head.world,
  );
  assert(
    !JSON.stringify(presentationPages).includes("Exact café"),
    "Presentation pages contain no duplicated transcript prose",
  );

  await f.repository.changeSession("playback", (saved) => {
    saved.participants.push(resident("c"));
    saved.lines.push({
      ...line("join", "c"),
      physicalIdsAfter: ["b", "c"],
      staging: [{ characterId: "b", expression: "joining" }],
    });
    saved.activeIds = ["b", "c"];
  });
  let current = f.rows.get("villages-venue-visit-playback").data;
  let entries = await readSceneMomentRange(
    f.documents,
    current.publicHistory.presentation,
    current.transcript.count,
    0,
    3,
  );
  assert.equal(entries[0].frame.id, moments[0].frame.id, "A later cast addition reuses the original historical frame");
  const cold = await readSceneMomentFrames(
    f.documents,
    current.publicHistory.presentation,
    [entries[0], entries[2]],
    current,
  );
  assert.equal(JSON.stringify(cold[0]), first);
  assert.deepEqual(cold[1].end.activeIds, ["b", "c"]);
  assert.equal(cold[1].end.state.a, undefined);
  assert.equal(
    cold[1].end.state.b.position,
    frames[0].start.state.b.position,
    "Departed slots stay reserved after restart",
  );

  for (const failure of ["before", "after"] as const) {
    f.fail(failure);
    await assert.rejects(
      f.repository.changeSession("playback", (saved) => {
        saved.lines.push({ ...line("fault:" + failure, "b"), staging: [{ characterId: "b", expression: failure }] });
      }),
      /Synthetic/,
    );
    await collectRetainedStorage(f.gate);
    current = f.rows.get("villages-venue-visit-playback").data;
    entries = await readSceneMomentRange(
      f.documents,
      current.publicHistory.presentation,
      current.transcript.count,
      0,
      current.publicHistory.presentation.count,
    );
    assert.equal(
      entries.some((entry) => entry.id === "fault:" + failure),
      failure === "after",
      "Native ownership, rather than the acknowledgement, controls publication",
    );
    await readSceneMomentFrames(f.documents, current.publicHistory.presentation, entries, current);
    assert.equal(JSON.stringify((await readSceneMomentFrames(f.documents, head, [moments[0]], native))[0]), first);
  }

  const missing = f.rows.get(entries.at(-1)!.frame.id);
  f.rows.delete(missing.id);
  const held = structuredClone(f.rows);
  await assert.rejects(collectRetainedStorage(f.gate), /missing/);
  assert.deepEqual(f.rows, held, "A missing owned frame holds every cleanup deletion");
  f.rows.set(missing.id, missing);
  await collectRetainedStorage(f.gate);

  const row = f.rows.get("villages-venue-visit-playback"),
    valid = structuredClone(row.data);
  const positions = await readScenePublicHistoryRange(
    f.documents,
    valid.publicHistory,
    valid.transcript.count,
    0,
    valid.publicHistory.count,
  );
  const full = await f.repository.readSession("playback");
  const omitted = encodeScenePresentations(
    full,
    positions.slice(1),
    valid.publicHistory.privateHearing,
    valid.publicHistory.source,
  );
  const repointed = encodeScenePresentations(
    full,
    positions.map((position, index) => (index === 0 ? { ...position, publicDigest: "f".repeat(64) } : position)),
    valid.publicHistory.privateHearing,
    valid.publicHistory.source,
  );
  for (const encoded of [omitted, repointed])
    for (const [id, data] of encoded.pages)
      f.rows.set(id, { id, packageId: "villages", kind: "memory-page", revision: 1, data });
  for (const [id, row] of historicalPages) if (!f.rows.has(id)) f.rows.set(id, structuredClone(row));
  for (const bad of [emptyPresentation, head, omitted.head, repointed.head]) {
    row.data.publicHistory.presentation = { ...structuredClone(bad), source: valid.publicHistory.source };
    const before = structuredClone(f.rows);
    await assert.rejects(collectRetainedStorage(f.gate), /coverage/);
    assert.deepEqual(f.rows, before, "Empty, stale, omitted and repointed presentation indexes hold all cleanup");
  }
  row.data = structuredClone(valid);
  row.data.publicHistory.presentation.source = "f".repeat(64);
  const wrongSource = structuredClone(f.rows);
  await assert.rejects(collectRetainedStorage(f.gate), /source/);
  assert.deepEqual(f.rows, wrongSource);
  row.data = structuredClone(valid);

  const warm = createScenePresentations(f.documents);
  await warm.prepare(
    full,
    positions,
    valid.publicHistory.privateHearing,
    valid.publicHistory.source,
    valid.publicHistory.presentation,
  );
  const malformedVersion = { ...valid.publicHistory.presentation, publicVersion: "f".repeat(64) };
  for (const store of [warm, createScenePresentations(f.documents)])
    await assert.rejects(
      store.prepare(full, positions, valid.publicHistory.privateHearing, valid.publicHistory.source, {
        ...valid.publicHistory.presentation,
        paragraphs: valid.publicHistory.presentation.paragraphs + 1,
      }),
      /paragraph count changed/,
    );
  for (const source of [valid.publicHistory.source, "e".repeat(64)]) {
    await assert.rejects(
      warm.prepare(full, positions, valid.publicHistory.privateHearing, source, malformedVersion),
      /version changed/,
    );
    await assert.rejects(
      createScenePresentations(f.documents).prepare(
        full,
        positions,
        valid.publicHistory.privateHearing,
        source,
        malformedVersion,
      ),
      /version changed/,
    );
  }
  const parses = new Map<string, number>(),
    parse = JSON.parse;
  const spy = mock.method(JSON, "parse", (...args: any[]) => {
    if (typeof args[0] === "string" && (args[0].includes('"publicDigest"') || args[0].startsWith('[["frame",')))
      parses.set(args[0], (parses.get(args[0]) ?? 0) + 1);
    return Reflect.apply(parse, JSON, args);
  });
  try {
    await validateSceneHistory(
      f.documents,
      Array.from({ length: 12 }, () => structuredClone(valid)),
    );
  } finally {
    spy.mock.restore();
  }
  assert(
    parses.size > 0 && [...parses.values()].every((count) => count === 1),
    "Overlapping retained owners parse each shared public/frame block once per proof pass",
  );
  await collectRetainedStorage(f.gate);

  const unusual = coerceSession({
    version: 3,
    id: "unusual",
    villageSeed: "seed",
    status: "active",
    startedAt: at,
    activeIds: ["__proto__", "constructor"],
    participants: [resident("__proto__"), resident("constructor")],
    lines: [{ ...line("unusual-line", "__proto__"), heardBy: ["__proto__", "constructor"] }],
    submissions: [],
  });
  await f.mutateDocument("villages-venue-visit-unusual", sessionSlot, (saved) => Object.assign(saved, unusual));
  const unusualNative = f.rows.get("villages-venue-visit-unusual").data;
  const unusualEntries = await readSceneMomentRange(f.documents, unusualNative.publicHistory.presentation, 1, 0, 1);
  const [unusualFrame] = await readSceneMomentFrames(
    f.documents,
    unusualNative.publicHistory.presentation,
    unusualEntries,
    unusualNative,
  );
  for (const key of ["__proto__", "constructor"])
    assert(
      Object.hasOwn(unusualFrame.start.state, key) &&
        Object.hasOwn(unusualFrame.start.desktop, key) &&
        Object.hasOwn(unusualFrame.start.mobile, key),
    );
  await collectRetainedStorage(f.gate);

  const pending = coerceSession({
    version: 3,
    id: "pending",
    villageSeed: "seed",
    status: "active",
    startedAt: at,
    activeIds: ["a", "b", "c", "d"],
    participants: ["a", "b", "c", "d", "e"].map(resident),
    lines: [],
    submissions: [],
  });
  await f.mutateDocument("villages-venue-visit-pending", sessionSlot, (saved) => Object.assign(saved, pending));
  await f.repository.changeSession("pending", (saved) =>
    saved.lines.push({ ...line("pending-explicit"), staging: [{ characterId: "e", position: "left" }] }),
  );
  const pendingNative = f.rows.get("villages-venue-visit-pending").data;
  const coldGate = createRepairGate(f.documents, f.admission);
  try {
    await coldGate.work(async () => {
      const history = createSceneHistory(coldGate.documents),
        saved = await history.decode(pendingNative);
      saved.lines.push({ ...line("later-fifth"), physicalIdsAfter: ["b", "c", "d", "e"] });
      saved.activeIds = ["b", "c", "d", "e"];
      const encoded = await history.encode(saved, pendingNative);
      const entries = await readSceneMomentRange(coldGate.documents, encoded.publicHistory.presentation, 2, 1, 2);
      const [frame] = await readSceneMomentFrames(
        coldGate.documents,
        encoded.publicHistory.presentation,
        entries,
        saved,
      );
      const cursor = createStagingCursor(["a", "b", "c", "d"], ["a", "b", "c", "d", "e"]);
      advanceStaging(cursor, { cues: [{ characterId: "e", position: "left" }] });
      advanceStaging(cursor, { afterIds: ["b", "c", "d", "e"] });
      assert.equal(
        JSON.stringify(frame.end),
        JSON.stringify(stagingPresentation(cursor)),
        "Unadmitted explicit-position flags survive publication and cold restart without reserving an early slot",
      );
    });
  } finally {
    coldGate.dispose();
  }
} finally {
  f.release();
  f.gate.dispose();
}
const growth: { count: number; retainedBytes: number }[] = [];
for (const count of [1000, 10_000, 25_000]) {
  const f = sceneHistoryFixture(),
    actors = Array.from({ length: count }, (_, index) => "actor:" + index);
  try {
    const scene = coerceSession({
      version: 3,
      id: "growing",
      villageSeed: "seed",
      status: "active",
      startedAt: at,
      activeIds: [actors[0]],
      participants: actors.map(resident),
      lines: [],
      submissions: [],
    });
    await f.mutateDocument("villages-venue-visit-growing", sessionSlot, (saved) => Object.assign(saved, scene));
    await f.repository.changeSession("growing", (saved) => {
      saved.lines = actors.map((id, index) => ({
        ...line("visit:" + index, "__venue_scene__"),
        kind: "narration",
        heardBy: [id],
        physicalIdsAfter: [id],
      }));
      saved.activeIds = [actors.at(-1)!];
    });
    await collectRetainedStorage(f.gate);
    const retainedBytes = [...f.rows.values()].reduce((sum, row) => sum + Buffer.byteLength(JSON.stringify(row)), 0);
    growth.push({ count, retainedBytes });
    assert(
      retainedBytes < count * 10 * 1024,
      "Retained presentation never copies the entire encountered cast per moment",
    );
    const originalPages = new Set(
      [...f.rows.values()].filter((row) => row.kind === "memory-page").map((row) => row.id),
    );
    f.reset();
    const stringify = JSON.stringify;
    let jsonBytes = 0;
    const spy = mock.method(JSON, "stringify", (...args: any[]) => {
      const text = Reflect.apply(stringify, JSON, args);
      jsonBytes += Buffer.byteLength(text ?? "");
      return text;
    });
    try {
      await f.repository.changeSession("growing", (saved) => {
        saved.lastActivityAt = "2026-10-31T00:01:00.000Z";
      });
    } finally {
      spy.mock.restore();
    }
    const newPages = [...f.rows.values()].filter((row) => row.kind === "memory-page" && !originalPages.has(row.id));
    const metadataMetrics = f.metrics();
    assert(metadataMetrics.writtenBytes > 0, "The measured metadata operation actually persists its change");
    assert.equal(
      newPages.length,
      0,
      "A metadata-only save does not rebuild a growing actor checkpoint or historical frame",
    );
    const native = f.rows.get("villages-venue-visit-growing").data;
    const latest = await readSceneMomentRange(f.documents, native.publicHistory.presentation, count, count - 1, count);
    const [frame] = await readSceneMomentFrames(f.documents, native.publicHistory.presentation, latest, native);
    assert.equal(frame.end.activeIds.length, 1);
    assert.equal(frame.end.activeIds[0], actors.at(-1));
    console.log(
      `Growing-cast playback ${count}: ${retainedBytes} retained bytes; metadata save ${JSON.stringify({ ...metadataMetrics, jsonBytes })}; ${newPages.length} new presentation pages`,
    );
  } finally {
    f.release();
    f.gate.dispose();
  }
}
const perMoment = growth.map(({ count, retainedBytes }) => retainedBytes / count);
assert(
  Math.max(...perMoment) < Math.min(...perMoment) * 2,
  "Growing-cast retained bytes per moment stay stable across 25x history growth",
);
console.log(
  "Scene playback pages: complete moments, exact historical presentation, restart, interrupted publication and cleanup holds passed.",
);
