import assert from "node:assert/strict";
import { mock } from "node:test";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { createExchangeProcessing } from "../packages/villages/src/server/domain/decoding/exchange-codec.js";
import { freezeSceneTranscript } from "../packages/villages/src/server/domain/rules/scene-transcript.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
import {
  encodeSceneTranscript,
  createSceneTranscriptStore,
} from "../packages/villages/src/server/adapters/storage/scene-transcript-pages.js";
import { encodeSceneSubmissions } from "../packages/villages/src/server/adapters/storage/scene-submission-pages.js";
import {
  createScenePublicHistory,
  readScenePublicHistoryHead,
  projectSceneHistoryPage,
} from "../packages/villages/src/server/adapters/storage/scene-public-history.js";
import type { VenueScene } from "../packages/villages/src/server/domain/models/scene-model.js";
import type { HistoryPageTree, MemoryPageData } from "../packages/villages/src/server/adapters/storage/memory-pages.js";

const at = "2026-10-31T00:00:00.000Z";
const line = (id: string) => ({
  id,
  role: "assistant",
  kind: "narration",
  speakerId: "__venue_scene__",
  name: "Narration",
  content: "Exact café 東京 paragraph " + id,
  at,
  heardBy: [],
});
function fixture() {
  const rows = new Map<string, any>();
  let readBytes = 0,
    writeBytes = 0;
  const documents: any = {
    getById: async (_packageId: string, id: string) => {
      const value = rows.get(id) ?? null;
      readBytes += Buffer.byteLength(JSON.stringify(value));
      return structuredClone(value);
    },
    create: async (value: any) => {
      assert(!rows.has(value.id));
      const row = { ...structuredClone(value), revision: 1 };
      rows.set(row.id, row);
      writeBytes += Buffer.byteLength(JSON.stringify(row));
      return structuredClone(row);
    },
  };
  return {
    documents,
    reset: () => {
      readBytes = writeBytes = 0;
    },
    metrics: () => ({ readBytes, writeBytes }),
  };
}
const sourcePages = new Map<string, MemoryPageData>();
function source(scene: VenueScene, previous?: HistoryPageTree) {
  scene.lines = freezeSceneTranscript(scene);
  const transcript = encodeSceneTranscript(scene.lines, scene, previous);
  for (const [id, data] of transcript.pages) sourcePages.set(id, data);
  return {
    transcript,
    submissions: encodeSceneSubmissions(scene.submissions, scene),
  };
}

{
  const f = fixture(),
    store = createScenePublicHistory(f.documents);
  const processing = createExchangeProcessing({
    seed: "public-world",
    sceneId: "privacy",
    submissionId: "pending",
    order: 1,
    lineIds: ["pending-line"],
    actionReceiptIds: [],
  });
  const scene = coerceSession({
    version: 3,
    id: "privacy",
    villageSeed: "public-world",
    participants: [],
    lines: [
      line("first"),
      ...Array.from({ length: 1000 }, (_, index) => ({ ...line("hidden:" + index), contactHidden: true })),
      {
        ...line("sound"),
        content: "Private cause sentinel",
        contactHidden: true,
        soundOnly: { text: "A quiet knock.", player: true, characterIds: [] },
      },
      line("pending-line"),
    ],
    submissions: [
      {
        id: "pending",
        message: "Exact pending input",
        mode: "chat",
        at,
        targetId: "",
        processing,
        semanticProvenance: { version: 2 },
      },
    ],
  });
  let native = source(scene),
    head = await store.prepare(scene, native.transcript.head, native.submissions.head);
  assert.equal(head.count, 2);
  readScenePublicHistoryHead(head, scene, native.transcript.head, native.submissions.head);
  const publicVersion = head.publicVersion,
    privateRoot = head.positions?.id;
  scene.lines = [
    ...scene.lines.slice(0, 1),
    { ...line("new-hidden"), contactHidden: true } as any,
    ...scene.lines.slice(1),
  ];
  native = source(scene, native.transcript.layout);
  const shifted = await store.prepare(scene, native.transcript.head, native.submissions.head, head);
  assert.notEqual(shifted.positions?.id, privateRoot, "Private positions really changed");
  assert.equal(
    shifted.publicVersion,
    publicVersion,
    "Hidden-only insertion cannot invalidate or disclose changes through a public cursor",
  );
  head = shifted;
  scene.lines = scene.lines.map((row, index) => (index === 1 ? { ...row, content: "Changed hidden words" } : row));
  native = source(scene, native.transcript.layout);
  assert.throws(
    () => readScenePublicHistoryHead(head, scene, native.transcript.head, native.submissions.head),
    /source changed/,
  );
  head = await store.prepare(scene, native.transcript.head, native.submissions.head, head);
  assert.equal(head.publicVersion, publicVersion, "Changing private prose leaves the public content version unchanged");
  const restarted = createScenePublicHistory(f.documents);
  const entries = await restarted.readRange(head, native.transcript.head.count, 0, head.count);
  const pages = sourcePages;
  const transcripts = createSceneTranscriptStore({
    getById: async (_pkg, id) =>
      pages.has(id)
        ? ({ id, packageId: "villages", kind: "memory-page", revision: 1, data: pages.get(id) } as any)
        : null,
    create: () => assert.fail("Read only"),
  });
  const selected = await transcripts.readPositions(
    native.transcript.head,
    scene,
    entries.map((entry) => entry.position),
  );
  const projected = projectSceneHistoryPage(selected, entries, scene.participants, head.privateHearing);
  assert.deepEqual(projected, publicSceneResponse(scene).lines);
  assert(!JSON.stringify(projected).includes("Private cause sentinel"));
  assert(!JSON.stringify(projected).includes("pending-line"));
  assert.throws(
    () =>
      projectSceneHistoryPage(
        [{ ...selected[0], content: "Changed public evidence" }, selected[1]],
        entries,
        [],
        head.privateHearing,
      ),
    /content changed/,
  );
  assert.throws(
    () =>
      readScenePublicHistoryHead(head, { ...scene, id: "foreign" }, native.transcript.head, native.submissions.head),
    /owner/,
  );
  scene.lines = [...scene.lines, { ...line("tail-hidden"), contactHidden: true } as any];
  native = source(scene, native.transcript.layout);
  const appended = await restarted.prepare(scene, native.transcript.head, native.submissions.head, head);
  assert.equal(appended.publicVersion, publicVersion);
  assert.equal(appended.positions?.id, head.positions?.id);
  assert.notEqual(appended.source, head.source);
  assert.throws(
    () => readScenePublicHistoryHead(head, scene, native.transcript.head, native.submissions.head),
    /public Scene history/,
  );
  head = appended;
  scene.submissions[0] = { ...scene.submissions[0], semanticReady: true };
  native = source(scene, native.transcript.layout);
  const published = await restarted.prepare(scene, native.transcript.head, native.submissions.head, head);
  assert.equal(published.count, 3);
  assert.notEqual(published.publicVersion, publicVersion);
}

{
  const f = fixture(),
    store = createScenePublicHistory(f.documents);
  const scene = coerceSession({
    version: 3,
    id: "hearing",
    villageSeed: "public-world",
    participants: [{ characterId: "visible", name: "Visible", doing: "Listening" }],
    lines: [{ ...line("heard"), heardBy: ["visible", "later-known"] }],
    submissions: [],
  });
  let native = source(scene);
  const before = await store.prepare(scene, native.transcript.head, native.submissions.head);
  scene.participants.push({ characterId: "later-known", name: "Known", doing: "Listening" });
  native = source(scene, native.transcript.layout);
  const after = await store.prepare(scene, native.transcript.head, native.submissions.head, before);
  assert.notEqual(
    after.publicVersion,
    before.publicVersion,
    "A cast change that actually changes published hearing invalidates the digest",
  );
  const entries = await store.readRange(after, native.transcript.head.count, 0, 1);
  assert.deepEqual(projectSceneHistoryPage(scene.lines, entries, scene.participants, after.privateHearing)[0].heardBy, [
    "visible",
    "later-known",
  ]);
}

for (const count of [1000, 10_000, 25_000]) {
  const f = fixture(),
    store = createScenePublicHistory(f.documents);
  const scene = coerceSession({
    version: 3,
    id: "growth:" + count,
    villageSeed: "public-growth",
    participants: [],
    lines: Array.from({ length: count }, (_, index) => line("line:" + index)),
    submissions: [],
  });
  let native = source(scene),
    head = await store.prepare(scene, native.transcript.head, native.submissions.head);
  const maximum = { readBytes: 0, writeBytes: 0, jsonBytes: 0 };
  let oldLineRenders = 0;
  for (let index = 0; index < 20; index++) {
    if (index === 0) scene.participants.push({ characterId: "unrelated-newcomer", name: "Newcomer", doing: "Joining" });
    scene.lines = [...scene.lines, line("appended:" + index) as any];
    native = source(scene, native.transcript.layout);
    f.reset();
    const stringify = JSON.stringify;
    let jsonBytes = 0;
    const spy = mock.method(JSON, "stringify", (...args: any[]) => {
      const text = Reflect.apply(stringify, JSON, args);
      jsonBytes += Buffer.byteLength(text ?? "");
      if (args[0]?.id === "line:500" && typeof args[0]?.content === "string") oldLineRenders++;
      return text;
    });
    try {
      head = await store.prepare(scene, native.transcript.head, native.submissions.head, head);
    } finally {
      spy.mock.restore();
    }
    maximum.jsonBytes = Math.max(maximum.jsonBytes, jsonBytes);
    for (const [key, value] of Object.entries(f.metrics())) maximum[key] = Math.max(maximum[key], value);
  }
  assert(
    maximum.readBytes < 24 * 1024 && maximum.writeBytes < 40 * 1024 && maximum.jsonBytes < 128 * 1024,
    "Warm index publication must not read/write/serialize whole history",
  );
  assert.equal(oldLineRenders, 0, "Ordinary publication and an unrelated cast addition never reserialize old prose");
  f.reset();
  const page = await createScenePublicHistory(f.documents).readRange(
    head,
    native.transcript.head.count,
    head.count - 40,
    head.count,
  );
  assert.equal(page.length, 40);
  assert(f.metrics().readBytes < 40 * 1024, "A cold public-position range stays bounded");
  console.log(`Public index ${count}: ${JSON.stringify(maximum)}; cold page ${f.metrics().readBytes}B`);
}
console.log("Public Scene history index: exact privacy/cold restart/source guards and bounded publication passed.");
