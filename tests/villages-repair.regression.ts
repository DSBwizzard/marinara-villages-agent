// Test cases: repair/review, repair/add-memory, repair/memory-undo, repair/checkpoints, repair/recovery, repair/fences, repair/privacy, repair/domain-editors, repair/retained-scenes, repair/scale, repair/http
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { createRepairGate } from "../packages/villages/src/server/adapters/storage/repair-gate.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { createRepairService } from "../packages/villages/src/server/features/repair/repair-service.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { repairId } from "../packages/villages/src/server/domain/rules/repair-records.js";
import { captureMemoryScene, projectMemories } from "../packages/villages/src/server/domain/rules/memory-views.js";
import { sceneMemories } from "../packages/villages/src/server/domain/rules/village-memories.js";
import { addMemory, memoryTime, realisticMemoryHistory } from "./helpers/memories-fixture.js";
import { fixture as projectFixture, venue } from "./fixtures/villages-projects.fixture.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { villagesRoutes } from "../packages/villages/src/server/entry/routes.js";
import Fastify from "fastify";
import type { RepairRequest } from "../packages/villages/src/shared/contracts/repair.js";

async function fixture() {
  const rows = new Map<string, any>();
  let hook: ((event: string, id: string) => void | Promise<void>) | undefined;
  const clone = (v: any) => (v === undefined ? null : structuredClone(v));
  const store: any = {
    async getById(_p: string, id: string) {
      await hook?.("read", id);
      return clone(rows.get(id));
    },
    async list(_p: string, kind: string) {
      return [...rows.values()].filter((r) => r.kind === kind).map(clone);
    },
    async create(input: any) {
      await hook?.("before-create", input.id);
      assert.ok(!rows.has(input.id), input.id);
      const row = { ...clone(input), revision: 1 };
      rows.set(row.id, row);
      await hook?.("after-create", row.id);
      return clone(row);
    },
    async update(input: any) {
      await hook?.("before-update", input.id);
      const old = rows.get(input.id);
      if (!old || old.revision !== input.expectedRevision) return null;
      const row = { ...old, ...clone(input), revision: old.revision + 1 };
      rows.set(row.id, row);
      await hook?.("after-update", row.id);
      return clone(row);
    },
    async remove(_p: string, id: string, revision: number) {
      await hook?.("before-remove", id);
      if (rows.get(id)?.revision !== revision) return false;
      rows.delete(id);
      return true;
    },
  };
  let gate = createRepairGate(store);
  let repo = createVillageRepository(() => gate.documents);
  const makeService = () =>
    createRepairService({
      gate,
      repository: repo,
      correctWish: async () => {
        throw Error("No Wish command in this fixture");
      },
      resumeProject: async () => {
        throw Error("No Project command in this fixture");
      },
      cancelProject: async () => {
        throw Error("No Project command in this fixture");
      },
      replaySaved: async () => {},
      continueSaved: async () => {},
    });
  let api = makeService();
  const initial = defaultVillageState();
  initial.seed = "repair-world";
  initial.setupAt = memoryTime();
  initial.name = "Willowmere";
  initial.setting = "Original setting";
  initial.memories = addMemory(initial.memories, { audience: ["player", "aqua"] });
  initial.memories = addMemory(initial.memories, {
    sourceId: "secret",
    audience: ["aqua"],
    text: "The hidden brass compass.",
  });
  await repo.mutateAuthority(
    (state) => {
      Object.assign(state, initial);
    },
    { memories: true },
  );
  return {
    rows,
    store,
    get gate() {
      return gate;
    },
    get repo() {
      return repo;
    },
    get api() {
      return api;
    },
    initial,
    prepare: async (request: RepairRequest) =>
      api.prepare({ ...request, expectedRecord: (await api.inspect(request.recordId, request.inspection)).token! }),
    hook(h: typeof hook) {
      hook = h;
    },
    reopen() {
      gate = createRepairGate(store);
      repo = createVillageRepository(() => gate.documents);
      api = makeService();
    },
    read: () => repo.readAuthority({ memories: true }),
  };
}
const edit = (recordId: string, values: RepairRequest["values"], operationId = "first-repair"): RepairRequest => ({
  recordId,
  values,
  operationId,
  action: "correct",
  knowers: [],
  inspection: false,
  expectedRecord: "fixture",
});

await runCase("repair/review", async () => {
  const f = await fixture(),
    id = repairId("world");
  const nameReview = await f.prepare(edit(id, { name: "Clear comparison" }, "name-comparison"));
  assert.equal(
    nameReview.changes.filter((change) => change.after === "Clear comparison").length,
    1,
    "Derived summary/source must not repeat the same field change",
  );
  const before = await f.read();
  const review = await f.prepare(
    edit(id, { name: "Willowmere", setting: "Corrected setting", worldName: "", worldFacts: "" }),
  );
  assert.equal((await f.read()).setting, before.setting, "Review cannot mutate the world");
  assert.equal(review.changes[0].before, "Original setting");
  await f.api.apply(review.id);
  assert.equal((await f.read()).setting, "Corrected setting");
  await f.api.apply(review.id);
  assert.equal((await f.api.index()).history.length, 1, "Lost acknowledgments replay the same repair");
  const undo = await f.api.undo(review.id, "undo-first");
  await f.api.apply(undo.id);
  assert.equal((await f.read()).setting, before.setting);
  const stale = await f.prepare(
    edit(id, { name: "Willowmere", setting: "Stale", worldName: "", worldFacts: "" }, "stale"),
  );
  await f.repo.mutateAuthority((s) => {
    s.setting = "Changed elsewhere";
  });
  await assert.rejects(() => f.api.apply(stale.id), /changed/u);
  assert.equal((await f.read()).setting, "Changed elsewhere");
});
await runCase("repair/memory-undo", async () => {
  const f = await fixture();
  await f.repo.mutateAuthority(
    (s) => {
      s.memoryScenes.frozen = {
        snapshot: captureMemoryScene(s.memories, "frozen", ["player", "aqua"], memoryTime(9)),
        effects: {},
      };
    },
    { memories: true },
  );
  const before = await f.read(),
    id = before.memories.records[0].id;
  const request = { ...edit(repairId("memory", id), { text: "Aqua lent the telescope." }), knowers: ["player"] };
  const review = await f.prepare(request);
  await f.api.apply(review.id);
  let current = await f.read();
  assert.equal(projectMemories(current.memories, ["player"])[0].text, request.values.text);
  assert.deepEqual(sceneMemories(current, "frozen"), sceneMemories(before, "frozen"));
  assert.equal(
    projectMemories(current.memories, ["aqua"]).find((m) => m.id === id)?.text,
    before.memories.records[0].text,
  );
  const revision = current.memories.revision;
  const undo = await f.api.undo(review.id, "undo-memory");
  await f.api.apply(undo.id);
  current = await f.read();
  assert.ok(current.memories.revision > revision);
  assert.equal(projectMemories(current.memories, ["player"])[0].text, before.memories.records[0].text);
  assert.deepEqual(sceneMemories(current, "frozen"), sceneMemories(before, "frozen"));
});
await runCase("repair/add-memory", async () => {
  const f = await fixture(),
    text = "I had the most slamming ham and cheese sandwich";
  const request = { ...edit(repairId("new-memory"), { text }, "add-sandwich"), knowers: ["player"] };
  const review = await f.prepare(request);
  assert.deepEqual(review.memory, { creating: true, people: ["Your Persona"] });
  assert.equal(review.changes.length, 1, "A new memory has one content change, separate from its recipients");
  assert.equal(review.changes[0].before, "");
  assert.equal(review.changes[0].after, text);
  assert.ok(!review.affected.includes(text), "Memory text is not repeated as an affected-record label");
  await f.api.apply(review.id);
  const added = (await f.read()).memories.records.find((row) => row.id === "player-repair:add-sandwich")!;
  assert.equal(added.text, text);
  assert.deepEqual(Object.keys(added.knowers), ["player"]);
  const inverse = await f.api.undo(review.id, "undo-sandwich");
  assert.equal(inverse.changes.filter((change) => change.before === text).length, 1);
  await f.api.apply(inverse.id);
  assert.ok(!projectMemories((await f.read()).memories, ["player"]).some((row) => row.id === added.id));
});
await runCase("repair/checkpoints", async () => {
  const f = await fixture();
  const cp = await f.api.createCheckpoint("Before change", "manual-save");
  assert.deepEqual(
    await f.api.createCheckpoint("Before change", "manual-save"),
    cp,
    "A lost acknowledgment cannot duplicate a checkpoint",
  );
  await assert.rejects(() => f.api.createCheckpoint("Other title", "manual-save"), /another save/u);
  await f.repo.mutateAuthority(
    (s) => {
      s.setting = "Later setting";
      s.memories = addMemory(s.memories, { sourceId: "later" });
      s.eventAttempts = {
        highWaterDate: "2026-10-26",
        lastAttemptAt: memoryTime(10),
        attempts: [{ id: "spent", at: memoryTime(10), date: "2026-10-26" }],
      };
    },
    { memories: true },
  );
  const spent = (await f.read()).eventAttempts;
  f.reopen();
  const review = await f.api.restore(cp.id, "restore-first");
  assert.equal((await f.read()).setting, "Later setting");
  await f.api.apply(review.id);
  assert.equal((await f.read()).setting, "Original setting");
  assert.deepEqual((await f.read()).eventAttempts, spent);
  assert.equal((await f.read()).memories.records.length, 2, "Checkpoint owns independently restorable memory bytes");
  const now = new Date().toISOString();
  await f.gate.documents.create({
    id: "villages-active-venue",
    packageId: "villages",
    kind: "venue-active",
    name: "Active",
    description: "",
    data: { sessionId: "unfinished" },
    createdAt: now,
    updatedAt: now,
  });
  await assert.rejects(() => f.api.restore(cp.id, "restore-active"), /unfinished Scene/u);
  assert.equal(
    (await f.gate.documents.getById("villages", "villages-active-venue"))?.data &&
      ((await f.gate.documents.getById("villages", "villages-active-venue"))!.data as any).sessionId,
    "unfinished",
  );
});
await runCase("repair/recovery", async () => {
  const f = await fixture();
  const review = await f.prepare(
    edit(repairId("world"), { name: "Willowmere", setting: "Survives a crash", worldName: "", worldFacts: "" }),
  );
  let fired = false;
  f.hook((event, id) => {
    if (!fired && event === "after-update" && id === "villages-village") {
      fired = true;
      throw Error("lost storage acknowledgment");
    }
  });
  await assert.rejects(() => f.api.apply(review.id), /lost storage/u);
  f.hook(undefined);
  f.reopen();
  assert.equal((await f.read()).setting, "Survives a crash");
  await f.api.apply(review.id);
  assert.equal((await f.api.index()).history.length, 1);
  const second = await f.prepare(
    edit(
      repairId("world"),
      { name: "Willowmere", setting: "Control acknowledgment", worldName: "", worldFacts: "" },
      "control-ack",
    ),
  );
  fired = false;
  f.hook((event, id) => {
    if (!fired && event === "after-update" && id === "villages-repair-control") {
      fired = true;
      throw Error("lost control acknowledgment");
    }
  });
  await assert.rejects(() => f.api.apply(second.id), /lost control/u);
  f.hook(undefined);
  f.reopen();
  assert.equal((await f.read()).setting, "Control acknowledgment");
});
await runCase("repair/fences", async () => {
  const f = await fixture();
  const cp = await f.api.createCheckpoint("Original Village");
  await f.repo.mutateAuthority(
    (s) => {
      s.setupAt = memoryTime(2);
    },
    { memories: true },
  );
  await assert.rejects(() => f.api.restore(cp.id, "different-foundation"), /another Village/u);
  assert.equal((await f.api.index()).checkpoints.length, 0);
  await f.repo.mutateAuthority(
    (s) => {
      s.setupAt = f.initial.setupAt;
    },
    { memories: true },
  );
  let start!: () => void, release!: () => void;
  const began = new Promise<void>((resolve) => (start = resolve)),
    wait = new Promise<void>((resolve) => (release = resolve));
  const work = f.gate.work(async () => {
    start();
    await wait;
  });
  await began;
  await assert.rejects(() => f.api.createCheckpoint("Busy"), /active/u);
  release();
  await work;
  let finishNested!: () => void;
  let nested!: Promise<void>;
  const heldNested = new Promise<void>((resolve) => {
    finishNested = resolve;
  });
  await f.gate.work(async () => {
    nested = f.gate.work(async () => {
      await heldNested;
      await f.repo.mutateAuthority((s) => {
        s.setting = "Saved background response";
      });
    });
  });
  await assert.rejects(() => f.api.createCheckpoint("Nested provider busy"), /active/u);
  await assert.rejects(
    () => f.prepare(edit(repairId("world"), { setting: "Cannot interrupt" }, "busy-repair")),
    /active/u,
  );
  finishNested();
  await nested;
  assert.equal((await f.read()).setting, "Saved background response");
  const review = await f.prepare(
    edit(repairId("world"), { name: "Willowmere", setting: "Guarded", worldName: "", worldFacts: "" }),
  );
  await f.api.apply(review.id);
  await f.repo.mutateAuthority((s) => {
    s.setting = "Later progress";
  });
  await assert.rejects(
    () => f.api.undo(review.id, "too-late"),
    (error: unknown) => (error as { statusCode?: number }).statusCode === 409,
  );
  let finish!: () => void;
  let oldWrite!: Promise<void>;
  const late = new Promise<void>((resolve) => {
    finish = resolve;
  });
  await f.gate.work(async () => {
    oldWrite = (async () => {
      await late;
      await f.repo.mutateAuthority((s) => {
        s.name = "Old callback";
      });
    })();
  });
  const next = await f.prepare(
    edit(repairId("world"), { name: "Willowmere", setting: "New epoch", worldName: "", worldFacts: "" }, "new-epoch"),
  );
  await f.api.apply(next.id);
  finish();
  await assert.rejects(oldWrite, /older action|restored/u);
  f.gate.dispose();
  await assert.rejects(
    () =>
      f.repo.mutateAuthority((s) => {
        s.name = "Disposed activation";
      }),
    /no longer active/u,
  );
});
await runCase("repair/privacy", async () => {
  const f = await fixture();
  assert.ok(!JSON.stringify(await f.api.list("memories")).includes("hidden brass compass"));
  assert.ok(JSON.stringify(await f.api.list("memories", true)).includes("hidden brass compass"));
  const id = (await f.read()).memories.records[0].id;
  await assert.rejects(
    () => f.prepare({ ...edit(repairId("memory", id), { text: "Teach another person" }), knowers: ["aqua"] }),
    /knowers/u,
  );
  assert.equal((await f.read()).memories.revision, f.initial.memories.revision);
  const secret = {
    ...edit(repairId("new-memory"), { text: "Nora secretly plans a voyage." }, "private-addition"),
    knowers: ["aqua"],
    inspection: true,
  };
  const added = await f.prepare(secret);
  await f.api.apply(added.id);
  assert.ok(!JSON.stringify(await f.api.index(false)).includes("voyage"));
  assert.ok(JSON.stringify(await f.api.index(true)).includes("voyage"));
  const undo = await f.api.undo(added.id, "undo-private-addition");
  await f.api.apply(undo.id);
  assert.ok(!projectMemories((await f.read()).memories, ["aqua"]).some((row) => row.text.includes("voyage")));
});

await runCase("repair/domain-editors", async () => {
  const f = await fixture(),
    model = projectFixture().state();
  await f.repo.mutateAuthority(
    (s) => {
      Object.assign(s, model);
      s.memories = f.initial.memories;
      s.seed = "repair-world";
      s.scenarioImprint = {
        origin: "Original authoritative founding",
        worldFacts: [],
        openingConditions: [],
        visualCues: [],
      };
      s.foundingDetails = "Ignored fallback";
    },
    { memories: true },
  );
  const opening = await f.api.inspect(repairId("founding"));
  assert.equal(opening.fields[0].value, "Original authoritative founding");
  const founding = await f.prepare(
    edit(opening.id, { foundingDetails: "Corrected authoritative founding", foundingGuidance: "" }, "fix-founding"),
  );
  await f.api.apply(founding.id);
  assert.equal((await f.read()).scenarioImprint?.origin, "Corrected authoritative founding");
  const place = await f.api.inspect(repairId("venue", "cafe"));
  const values = Object.fromEntries(place.fields.map((field) => [field.key, field.value]));
  values.x = 0.3;
  const map = await f.prepare(edit(place.id, values, "fix-map"));
  await f.api.apply(map.id);
  const revision = (await f.read()).maps[0].revision;
  const undoMap = await f.api.undo(map.id, "undo-map");
  await f.api.apply(undoMap.id);
  assert.ok((await f.read()).maps[0].revision > revision);
  assert.equal((await f.read()).venues[0].presentation.x, 0.2);
  assert.ok(
    !(await f.api.list("places")).records.some((record) => record.id === repairId("zone", "cafe", "common")),
    "Unseen/private current interiors require inspection",
  );
  const physical = await f.api.inspect(repairId("zone", "cafe", "common"), true);
  const physicalValues = Object.fromEntries(physical.fields.map((field) => [field.key, field.value]));
  physicalValues.condition = "The roof is sound.";
  const roof = await f.prepare({ ...edit(physical.id, physicalValues, "fix-roof"), inspection: true });
  await f.api.apply(roof.id);
  assert.equal((await f.read()).venues[0].zones?.find((z) => z.id === "common")?.state.condition, "The roof is sound.");
  assert.equal(
    (await f.api.index(false)).checkpoints.length,
    1,
    "Private checkpoint names are hidden; public map checkpoint remains visible",
  );
  assert.ok((await f.api.index(true)).checkpoints.length >= 2);
  const oldHome = venue("old-home", "residence"),
    newHome = venue("new-home", "residence");
  newHome.residentIds = [];
  newHome.presentation.x = 0.7;
  for (const [home, ownerId] of [
    [oldHome, "a"],
    [newHome, undefined],
  ] as const)
    home.zones!.push({
      ...defaultVenueSpace("residence"),
      id: "bedroom",
      name: "Bedroom",
      kind: "private-residence",
      connectedTo: ["common"],
      ownerId,
    });
  oldHome.zones!.find((z) => z.id === "bedroom")!.state.items = ["A red scarf"];
  await f.repo.mutateAuthority((s) => {
    s.venues = [oldHome, newHome];
  });
  const home = await f.prepare({
    ...edit(repairId("home", "a"), { destination: repairId("new-home", "bedroom") }, "fix-home"),
    inspection: true,
  });
  await f.api.apply(home.id);
  const housed = await f.read();
  assert.ok(housed.venues.find((v) => v.id === "new-home")?.residentIds?.includes("a"));
  assert.deepEqual(
    housed.venues.find((v) => v.id === "old-home")?.zones?.find((z) => z.id === "bedroom")?.state.items,
    ["A red scarf"],
  );
});
await runCase("repair/retained-scenes", async () => {
  const f = await fixture(),
    stamp = memoryTime(10);
  const scene: any = {
    version: 2,
    id: "held-scene",
    sceneRevision: 4,
    status: "active",
    placeName: "Workshop",
    submissions: [],
    lines: [],
    startedAt: stamp,
  };
  await f.gate.documents.create({
    id: "villages-active-venue",
    packageId: "villages",
    kind: "venue-active",
    name: "Active Scene",
    description: "",
    data: { sessionId: scene.id },
    createdAt: stamp,
    updatedAt: stamp,
  });
  await f.gate.documents.create({
    id: "villages-venue-visit-held-scene",
    packageId: "villages",
    kind: "venue-visit",
    name: "Workshop",
    description: "",
    data: scene,
    createdAt: stamp,
    updatedAt: stamp,
  });
  await f.repo.mutateAuthority(
    (s) => {
      s.memoryScenes[scene.id] = { snapshot: captureMemoryScene(s.memories, scene.id, ["player"], stamp), effects: {} };
    },
    { memories: true },
  );
  const cp = await f.api.createCheckpoint("Idle Scene");
  const held = (await f.read()).memoryScenes[scene.id];
  const pointer = (await f.gate.documents.getById("villages", "villages-active-venue"))!;
  await f.gate.documents.update({
    ...pointer,
    packageId: "villages",
    expectedRevision: pointer.revision,
    data: { sessionId: null },
    updatedAt: stamp,
  });
  const row = (await f.gate.documents.getById("villages", "villages-venue-visit-held-scene"))!;
  await f.gate.documents.update({
    ...row,
    packageId: "villages",
    expectedRevision: row.revision,
    data: { ...scene, status: "closed", sceneRevision: 9 },
    updatedAt: stamp,
  });
  await f.repo.mutateAuthority(
    (s) => {
      delete s.memoryScenes[scene.id];
      s.exchangeReceipts.future = {
        id: "future",
        sceneId: "later",
        submissionId: "later",
        domain: "physical",
        at: stamp,
        status: "applied",
        reason: "Future physical proof",
        evidenceIds: ["later"],
        physicalOutcome: { id: "future-proof" } as any,
      };
    },
    { memories: true },
  );
  const review = await f.api.restore(cp.id, "restore-idle");
  await f.api.apply(review.id);
  f.reopen();
  const restored = await f.read();
  assert.equal(
    (await f.gate.documents.getById("villages", "villages-active-venue"))?.data &&
      ((await f.gate.documents.getById("villages", "villages-active-venue"))!.data as any).sessionId,
    scene.id,
  );
  assert.deepEqual(restored.memoryScenes[scene.id], held);
  assert.equal(restored.exchangeReceipts.future.status, "rejected");
  assert.ok(!restored.exchangeReceipts.future.physicalOutcome, "Withdrawn future proof cannot satisfy a restored Wish");
  assert.ok(
    ((await f.gate.documents.getById("villages", "villages-venue-visit-held-scene"))!.data as any).sceneRevision > 9,
  );
});
await runCase("repair/scale", async () => {
  const f = await fixture();
  await f.repo.mutateAuthority(
    (s) => {
      s.memories = realisticMemoryHistory(25000);
    },
    { memories: true },
  );
  const page = await f.api.list("memories", true);
  assert.equal(page.records.length, 50);
  assert.ok(page.total > 10000);
  const oldest = (await f.read()).memories.records[0];
  const found = await f.api.inspect(repairId("memory", oldest.id), true);
  assert.ok(found.people?.length);
  assert.ok(found.source.length);
});
await runCase("repair/http", async () => {
  const f = await fixture();
  const release = configureVillagesRuntime({
    persistence: { documents: f.store },
    resources: {},
    languageModels: {
      resolveForRequest() {
        throw Error("REPAIR cannot request a model");
      },
    },
    isDebugAgentsEnabled: () => false,
    getAgentConfig: async () => ({ connectionId: "" }),
    json: { parseJsonish: (value: string) => JSON.parse(value) },
  } as any);
  const app = Fastify();
  try {
    await villagesRoutes(app);
    const index = await app.inject({ url: "/repair" });
    assert.equal(index.statusCode, 200, index.body);
    const record = (await app.inject({ url: "/repair/record?id=" + encodeURIComponent(repairId("world")) })).json();
    const input = {
      ...edit(
        record.id,
        { name: "Willowmere", setting: "HTTP correction", worldName: "", worldFacts: "" },
        "http-repair",
      ),
      expectedRecord: record.token,
    };
    const prepared = await app.inject({ method: "POST", url: "/repair/review", payload: input });
    assert.equal(prepared.statusCode, 200, prepared.body);
    assert.equal((await f.read()).setting, "Original setting");
    const applied = await app.inject({ method: "POST", url: "/repair/apply", payload: { id: input.operationId } });
    assert.equal(applied.statusCode, 200, applied.body);
    assert.equal((await f.read()).setting, "HTTP correction");
    const undo = await app.inject({
      method: "POST",
      url: "/repair/undo",
      payload: { id: input.operationId, operationId: "http-undo" },
    });
    assert.equal(undo.statusCode, 200, undo.body);
  } finally {
    await app.close();
    release();
  }
});
