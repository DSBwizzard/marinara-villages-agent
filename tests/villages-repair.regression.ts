import { createActivationScope } from "../packages/villages/src/server/adapters/engine/activation-scope.js";
// Test cases: repair/review, repair/review-retirement, repair/review-cancel-race, repair/review-retirement-recovery, repair/people, repair/checkpoints, repair/checkpoint-retention, repair/checkpoint-deletion, repair/snapshot-integrity, repair/recovery, repair/fences, repair/privacy, repair/domain-editors, repair/letter-fonts, repair/retained-scenes, repair/correction-retained, repair/restored-evidence, repair/scale, repair/http, repair/checkpoint-pages, repair/journal-integrity, repair/places
import assert from "node:assert/strict";
import { authorSceneFixture } from "./helpers/village-storage.fixture.js";
import { LETTER_FONTS } from "../packages/villages/src/shared/helpers/letter-fonts.js";
import { runCase } from "../scripts/test-cases.mjs";
import {
  createRepairGate,
  repairDocumentDigest,
} from "../packages/villages/src/server/adapters/storage/repair-gate.js";
import { createRepairTransactionCodec } from "../packages/villages/src/server/adapters/storage/repair-transaction-codec.js";
import { createRepairSnapshots } from "../packages/villages/src/server/adapters/storage/repair-snapshot-store.js";
import { readSceneWorkIndex } from "../packages/villages/src/server/adapters/storage/scene-history.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { terminalForScene } from "../packages/villages/src/server/features/scenes/scene-terminal.js";
import {
  memoryPayloadDocuments,
  readMemoryHead,
} from "../packages/villages/src/server/adapters/storage/memory-payload-store.js";
import { createVillageClock } from "../packages/villages/src/server/adapters/time/clock-service.js";
import { captureReturnContext } from "../packages/villages/src/server/domain/rules/return-catchup-capture.js";
import { createRepairService } from "../packages/villages/src/server/features/repair/repair-service.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { repairId } from "../packages/villages/src/server/domain/rules/repair-records.js";
import { initializeRoomContinuity } from "../packages/villages/src/server/domain/rules/native-continuity.js";
import { nativeHistoryFixture, retainAuthoredNote } from "./helpers/continuity.fixture.js";
import { fixture as projectFixture, venue } from "./fixtures/villages-projects.fixture.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { villagesRoutes } from "../packages/villages/src/server/entry/routes.js";
import Fastify from "fastify";
import type { RepairRequest } from "../packages/villages/src/shared/contracts/repair.js";

const memoryTime = (hours = 0) => new Date(Date.UTC(2025, 0, 1) + hours * 3_600_000).toISOString();

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
      if (input.kind === "venue-visit")
        input = { ...input, data: authorSceneFixture(rows, input.data, rows.get("villages-village")?.data) };
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
      if (old?.kind === "venue-visit")
        input = { ...input, data: authorSceneFixture(rows, input.data, rows.get("villages-village")?.data) };
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
      resumeProject: async () => {
        throw Error("No Project command in this fixture");
      },
      cancelProject: async () => {
        throw Error("No Project command in this fixture");
      },
      replaySaved: async () => {},
    });
  let api = makeService();
  const initial = defaultVillageState();
  initial.seed = "repair-world";
  initial.setupAt = memoryTime();
  initial.name = "Willowmere";
  initial.setting = "Original setting";
  initial.villagers = [
    {
      characterId: "aqua",
      incarnation: "one",
      letterFontId: "caveat",
      addedAt: initial.setupAt,
      cardSnapshot: { id: "aqua", name: "Aqua", sourceStatus: "available", revision: 1, capturedAt: initial.setupAt },
    },
  ] as typeof initial.villagers;
  retainAuthoredNote(initial, "shared", "Aqua lent the telescope.", ["player", "aqua"], initial.setupAt);
  retainAuthoredNote(initial, "secret", "The hidden brass compass.", ["aqua"], initial.setupAt);
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
      api.prepare({
        ...request,
        expectedRecord: (await api.inspect(request.recordId, request.personId)).token!,
      }),
    hook(h: typeof hook) {
      hook = h;
    },
    reopen() {
      gate = createRepairGate(store);
      repo = createVillageRepository(() => gate.documents);
      api = makeService();
    },
    read: () => repo.readAuthority({ memories: true, wishes: true }),
  };
}
const edit = (recordId: string, values: RepairRequest["values"], operationId = "first-repair"): RepairRequest => ({
  recordId,
  values,
  operationId,
  action: "correct",
  knowers: [],
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
    edit(id, { name: "Willowmere", setting: "Corrected setting", worldName: "", worldRules: "" }),
  );
  assert.equal((await f.read()).setting, before.setting, "Review cannot mutate the world");
  assert.equal(review.changes[0].before, "Original setting");
  await f.api.apply(review.id, review.token);
  assert.equal((await f.read()).setting, "Corrected setting");
  await f.api.apply(review.id, review.token);
  assert.equal((await f.api.index()).history.length, 1, "Lost acknowledgments replay the same repair");
  const undo = await f.api.undo(review.id, "undo-first");
  await f.api.apply(undo.id, undo.token);
  assert.equal((await f.read()).setting, before.setting);
  const stale = await f.prepare(
    edit(id, { name: "Willowmere", setting: "Stale", worldName: "", worldRules: "" }, "stale"),
  );
  await f.repo.mutateAuthority((s) => {
    s.setting = "Changed elsewhere";
  });
  await assert.rejects(() => f.api.apply(stale.id, stale.token), /changed/u);
  assert.equal((await f.read()).setting, "Changed elsewhere");
});
await runCase("repair/review-retirement", async () => {
  const f = await fixture(),
    id = repairId("world"),
    reviews = [];
  const plans = () => [...f.rows.values()].filter((row) => row.kind === "repair-plan");
  for (let i = 0; i < 15; i++) reviews.push(await f.prepare(edit(id, { setting: "Preview " + i }, "preview-" + i)));
  assert.equal(plans().length, 10, "Unapplied previews cannot accumulate whole-world transactions indefinitely.");
  assert.equal((await f.read()).setting, "Original setting");
  assert.equal((await f.api.index()).historyTotal, 0);
  await assert.rejects(() => f.api.apply(reviews[0].id, reviews[0].token), /Review this repair again/);
  const latest = reviews.at(-1)!;
  f.reopen();
  await f.api.apply(latest.id, latest.token);
  assert.equal(plans().length, 9, "The committed plan is retired with its durable acknowledgment.");
  f.reopen();
  await f.api.apply(latest.id, latest.token);
  assert.equal((await f.api.index()).historyTotal, 1, "Idempotent apply does not depend on the retired preview.");
  assert.deepEqual(await f.api.cancelReview(latest.id, latest.token), { cancelled: false, applied: true });
  await assert.rejects(() => f.prepare(edit(id, { setting: "Duplicate mutation" }, latest.id)), /already applied/);
  assert.equal((await f.read()).setting, "Preview 14");
  const cancel = await f.prepare(edit(id, { setting: "Never committed" }, "cancel-preview"));
  assert.deepEqual(await f.api.cancelReview(cancel.id, cancel.token), { cancelled: true });
  assert.deepEqual(await f.api.cancelReview(cancel.id, cancel.token), { cancelled: true });
  await assert.rejects(() => f.api.apply(cancel.id, cancel.token), /Review this repair again/);
  assert.equal((await f.read()).setting, "Preview 14");
  const valid = plans()[0];
  f.rows.set("foreign-review", {
    ...structuredClone(valid),
    id: "foreign-review",
    data: { ...structuredClone(valid.data), seed: "another-world" },
  });
  f.rows.set("unknown-review", {
    ...structuredClone(valid),
    id: "unknown-review",
    data: { ...structuredClone(valid.data), transaction: null },
  });
  for (let i = 0; i < 12; i++) await f.prepare(edit(id, { setting: "Later " + i }, "later-preview-" + i));
  assert.ok(
    f.rows.has("foreign-review") && f.rows.has("unknown-review"),
    "Foreign and malformed ownership is retained.",
  );
  assert.equal(plans().filter((row) => !["foreign-review", "unknown-review"].includes(row.id)).length, 10);
});
await runCase("repair/review-cancel-race", async () => {
  const repeat = await fixture(),
    request = edit(repairId("world"), { setting: "Fresh review" }, "same-request");
  const old = await repeat.prepare(request);
  await repeat.api.cancelReview(old.id, old.token);
  const replacement = await repeat.prepare(request);
  assert.equal(old.id, replacement.id);
  assert.notEqual(old.token, replacement.token, "A recreated review cannot restore an old Apply's authority.");
  await assert.rejects(() => repeat.api.apply(old.id, old.token), /review changed/);
  assert.deepEqual(await repeat.api.cancelReview(old.id, old.token), { cancelled: false });
  await repeat.api.apply(replacement.id, replacement.token);
  assert.equal((await repeat.read()).setting, "Fresh review");
  const f = await fixture(),
    review = await f.prepare(edit(repairId("world"), { setting: "Must not commit" }, "cancel-race"));
  const commit = f.gate.commit;
  f.gate.commit = async (...args) => {
    await f.api.cancelReview(review.id, review.token);
    return commit(...args);
  };
  await assert.rejects(() => f.api.apply(review.id, review.token), /changed/);
  assert.equal(
    (await f.read()).setting,
    "Original setting",
    "Eviction/cancellation is checked before any effects publish.",
  );
  assert.equal((await f.api.index()).historyTotal, 0);
});
await runCase("repair/review-retirement-recovery", async () => {
  const f = await fixture(),
    review = await f.prepare(edit(repairId("world"), { setting: "Committed once" }, "retirement-crash"));
  let fired = false;
  f.hook((event, id) => {
    if (!fired && event === "before-remove" && id.startsWith("villages-repair-plan-")) {
      fired = true;
      throw Error("crash retiring review");
    }
  });
  await assert.rejects(() => f.api.apply(review.id, review.token), /crash retiring/);
  assert.ok([...f.rows.values()].some((row) => row.kind === "repair-plan"));
  f.hook(undefined);
  f.reopen();
  await f.api.apply(review.id, review.token);
  assert.equal((await f.read()).setting, "Committed once");
  assert.equal((await f.api.index()).historyTotal, 1);
  assert.equal([...f.rows.values()].filter((row) => row.kind === "repair-plan").length, 0);
});
await runCase("repair/people", async () => {
  const f = await fixture(),
    model = projectFixture().state();
  model.villagers[0].cardSnapshot.name = "Nora";
  model.villagers[1].cardSnapshot.name = "Ellis";
  model.villagers[2].cardSnapshot.name = "Mira";
  await f.repo.mutateAuthority(
    (state) => {
      Object.assign(state, model, { seed: f.initial.seed, setupAt: f.initial.setupAt });
      retainAuthoredNote(state, "nora-secret", "Nora privately hid a compass from Ellis.", ["a"], memoryTime(), {
        about: ["b"],
      });
      retainAuthoredNote(state, "about-ellis", "Ellis paints the harbor boats.", ["player"], memoryTime(), {
        about: ["b"],
      });
    },
    { memories: true },
  );
  assert.deepEqual(
    (await f.api.index()).people.map((person) => person.name),
    ["Your Persona", "Nora", "Ellis", "Mira"],
  );
  assert.equal((await f.api.list("people")).records.length, 0);
  const before = await f.read();
  assert.equal((await f.api.list("people", "compass", 0, "b")).total, 1);
  assert.ok((await f.api.list("people", "", 0, "b")).records.some((record) => record.title.includes("harbor")));
  assert.ok(!JSON.stringify(await f.api.list("people", "", 0, "player")).includes("compass"));
  assert.deepEqual(await f.read(), before);
});
await runCase("repair/checkpoints", async () => {
  const f = await fixture();
  await f.repo.mutateAuthority((state) => {
    state.foundedAt = state.setupAt;
  });
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
      s.zonePictureBudget = { startedAt: "2026-10-29T12:00:00.000Z", used: 6 };
      s.zonePictureEpoch = 11;
      retainAuthoredNote(s, "later", "The player returned with a notebook.", ["player"], memoryTime(10));
      s.eventAttempts = {
        highWaterDate: "2026-10-26",
        lastAttemptAt: memoryTime(10),
        attempts: [{ id: "spent", at: memoryTime(10), date: "2026-10-26" }],
      };
      s.returnCatchup = {
        batch: {
          budgetDate: "2026-10-26",
          opportunityLimit: 6,
          id: "pending-return",
          status: "running",
        },
        history: [{ id: "previous-return", status: "completed", budgetDate: "2026-10-25", opportunityLimit: 6 }],
        capture: captureReturnContext(s, new Date(memoryTime(10))),
      };
      s.clock = {
        revision: 3,
        trustedAt: memoryTime(10),
        recovery: null,
        replayUntilDate: "",
        advanceMs: 120_000,
        lastAdvance: { actionId: "later-advance", milliseconds: 60_000 },
        advanceReceipts: [
          { actionId: "earlier-advance", milliseconds: 60_000 },
          { actionId: "later-advance", milliseconds: 60_000 },
        ],
      };
    },
    { memories: true },
  );
  const spent = (await f.read()).eventAttempts;
  await assert.rejects(() => f.api.restore(cp.id, "restore-during-catchup"), /catch-up/u);
  await f.repo.mutateAuthority((state) => {
    state.returnCatchup!.batch!.status = "completed";
  });
  f.reopen();
  const review = await f.api.restore(cp.id, "restore-first");
  assert.equal((await f.read()).setting, "Later setting");
  await f.api.apply(review.id, review.token);
  assert.equal((await f.read()).setting, "Original setting");
  assert.equal((await f.read()).zonePictureBudget?.used, 6, "Restore cannot rewind automatic image spending");
  assert.ok((await f.read()).zonePictureEpoch! > 11, "Restore fences in-flight artwork");
  assert.deepEqual((await f.read()).eventAttempts, spent);
  assert.equal((await f.read()).returnCatchup?.batch?.status, "completed");
  assert.equal((await f.read()).returnCatchup?.history?.[0]?.id, "previous-return");
  assert.equal(
    (await f.read()).returnCatchup?.capture,
    undefined,
    "Restoring invalidates the previous world's capture.",
  );
  const clock = createVillageClock(f.repo);
  const view = await clock.observe();
  await clock.advance!({ worldId: view.worldId!, revision: 1, actionId: "earlier-advance", milliseconds: 60_000 });
  assert.equal((await f.read()).clock!.advanceMs, 120_000, "Restoration cannot replay an earlier time advance.");
  const withBatch = await f.api.createCheckpoint("After catch-up", "checkpoint-after-catchup");
  await f.repo.mutateAuthority((state) => {
    delete state.returnCatchup;
  });
  const withoutBatch = await f.api.restore(withBatch.id, "restore-without-catchup");
  await f.api.apply(withoutBatch.id, withoutBatch.token);
  assert.equal((await f.read()).returnCatchup, undefined, "Restoring cannot revive an older catch-up batch.");
  assert.equal((await f.read()).continuity.records.length, 2, "Checkpoint owns independently restorable memory bytes");
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
await runCase("repair/checkpoint-retention", async () => {
  const f = await fixture();
  await f.repo.mutateAuthority(
    (state) => {
      state.foundedAt = state.setupAt;
      state.venues = [venue()];
      const common = state.venues[0].zones!.find((zone) => zone.id === "common")!;
      initializeRoomContinuity(state, "cafe", common.id, common.description, "room-seed", state.setupAt);
    },
    { memories: true },
  );
  const room = (await f.api.list("places")).records.find((row) => row.summary === "Room description")!;
  const manual = await f.api.createCheckpoint("Keep this", "manual-keep");
  const countBodies = () => [...f.rows.values()].filter((row) => row.kind === "repair-snapshot").length;
  const bodies = countBodies();
  await f.api.createCheckpoint("Same world", "manual-same");
  // The first checkpoint publication adds only its small header after-image to the journal.
  assert.equal(countBodies() - bodies, 1, "An unchanged world shares its snapshot body.");
  for (let i = 0; i < 11; i++) {
    const record = await f.api.inspect(room.id);
    const values = Object.fromEntries(record.fields.map((field) => [field.key, field.value]));
    values.text = `Physical account ${i}`;
    const review = await f.prepare(edit(record.id, values, `retained-${i}`));
    await f.api.apply(review.id, review.token);
  }
  f.reopen();
  const index = await f.api.index();
  assert.equal(index.history.length, 11, "Meaningful repair history has no lifetime cap.");
  assert.equal(index.history.filter((entry) => entry.canUndo).length, 10);
  assert.equal(index.history.at(-1)!.canUndo, false);
  assert.equal(index.checkpoints.filter((entry) => entry.mode === "automatic").length, 10);
  assert.ok(index.checkpoints.some((entry) => entry.id === manual.id));
  await assert.rejects(f.api.undo("retained-0", "expired-undo"), /cannot be undone/);
  const undo = await f.api.undo("retained-10", "consume-undo");
  await f.api.apply(undo.id, undo.token);
  const after = await f.api.index();
  assert.equal(after.history.filter((entry) => entry.canUndo && !entry.undone).length, 9);
  assert.equal(after.history.find((entry) => entry.id === "retained-0")!.canUndo, false);
  assert.equal(after.history.length, 12);
  assert.equal(
    [...f.rows.values()].find((row) => row.kind === "repair-history" && row.data.id === undo.id)!.data.undoOf,
    "retained-10",
  );
});
await runCase("repair/checkpoint-deletion", async () => {
  const f = await fixture();
  const checkpoint = await f.api.createCheckpoint("Delete me", "manual-delete");
  const prepared = await f.api.restore(checkpoint.id, "stale-restoration");
  const before = await f.read();
  await assert.rejects(f.api.deleteCheckpoint(checkpoint.id, "wrong-token"), /changed/);
  let interrupted = false;
  f.hook((event, id) => {
    if (!interrupted && event === "after-update" && f.rows.get(id)?.kind === "repair-checkpoint") {
      interrupted = true;
      throw Error("lost checkpoint deletion acknowledgment");
    }
  });
  await assert.rejects(f.api.deleteCheckpoint(checkpoint.id, checkpoint.token), /lost checkpoint/);
  f.hook(undefined);
  f.reopen();
  assert.deepEqual(await f.api.deleteCheckpoint(checkpoint.id, checkpoint.token), { deleted: true });
  assert.equal((await f.api.index()).checkpointTotal, 0);
  await assert.rejects(f.api.createCheckpoint("Delete me", checkpoint.id), /deleted/);
  await assert.rejects(f.api.apply(prepared.id, prepared.token), /changed/);
  assert.deepEqual(await f.read(), before, "Deleting a checkpoint fences already prepared restoration.");
  const marker = [...f.rows.values()].find((row) => row.kind === "repair-checkpoint")!.data;
  assert.equal(marker.snapshots, undefined);
  assert.equal(marker.title, undefined);
  for (let i = 0; i < 51; i++) await f.api.createCheckpoint(`Manual ${i}`, `page-${i}`);
  const first = await f.api.index(0, 0),
    second = await f.api.index(0, 50);
  assert.equal(first.checkpoints.length, 50);
  assert.equal(first.checkpointTotal, 51);
  assert.equal(second.checkpoints.length, 1);
  assert.equal(new Set([...first.checkpoints, ...second.checkpoints].map((entry) => entry.id)).size, 51);
});
await runCase("repair/snapshot-integrity", async () => {
  const f = await fixture();
  const cp = await f.api.createCheckpoint("Exact source", "exact-source");
  const header = [...f.rows.values()].find((row) => row.kind === "repair-checkpoint")!;
  const original = header.data.snapshots,
    refs = JSON.parse(original);
  const before = await f.read();
  for (const deleted of [false, null, "true", 1]) {
    header.data.deleted = deleted;
    await assert.rejects(f.api.restore(cp.id, "invalid-marker"), /checkpoint|unknown field/);
    assert.deepEqual(await f.read(), before);
  }
  delete header.data.deleted;
  for (const malformed of [[], [...refs, refs[0]], [{ ...refs[0], id: "foreign-root" }]]) {
    header.data.snapshots = JSON.stringify(malformed);
    await assert.rejects(f.api.restore(cp.id, "invalid-source"));
    assert.deepEqual(await f.read(), before);
  }
  header.data.snapshots = original;
  const body = f.rows.get(refs[0].body),
    originalData = structuredClone(body.data);
  body.data.clock = { trustedAt: "changed" };
  await assert.rejects(f.api.restore(cp.id, "corrupt-source"), /digest changed/);
  assert.deepEqual(await f.read(), before, "Clock belongs to the exact immutable snapshot digest.");
  body.data = originalData;
  const saved = await createRepairSnapshots(f.store).restore(original);
  assert.equal(saved[0].id, "villages-village");
  assert.deepEqual(body.data, originalData);
  const snapshots = createRepairSnapshots(f.store);
  header.data.snapshots = await snapshots.capture([{ ...saved[0], data: { ...originalData, seed: "foreign" } }]);
  await assert.rejects(f.api.restore(cp.id, "foreign-source"), /ownership changed/);
  header.data.snapshots = original;
  const source = { ...saved[0], data: { ...originalData, image: "global-gallery:owned" } };
  const mediaRefs = JSON.parse(await snapshots.capture([source]));
  assert.equal(f.rows.get(mediaRefs[0].body).data.image, "global-gallery:owned", "Engine can see native media owners.");
  await assert.rejects(
    snapshots.restoreWrites(
      await snapshots.captureWrites([
        { before: saved[0], after: source },
        { before: saved[0], after: source },
      ]),
    ),
    /invalid Undo snapshot sequence/,
  );
  let interrupted = false;
  f.hook((event, id) => {
    if (!interrupted && event === "before-create" && id.startsWith("villages-repair-checkpoint-")) {
      interrupted = true;
      throw Error("checkpoint publication interrupted");
    }
  });
  await assert.rejects(f.api.createCheckpoint("Interrupted", "interrupted-header"), /publication interrupted/);
  f.hook(undefined);
  assert.ok(f.rows.get("villages-repair-control").data.pending);
  f.reopen();
  const recovered = await f.api.createCheckpoint("Interrupted", "interrupted-header");
  assert.equal(recovered.id, "interrupted-header");
  assert.deepEqual(await f.read(), before);
  const malformedScene = {
    id: "villages-venue-visit-invalid-owner",
    packageId: "villages",
    kind: "venue-visit",
    name: "Private Scene",
    description: "",
    createdAt: memoryTime(),
    updatedAt: memoryTime(),
    revision: 1,
    data: { version: 5, id: "invalid-owner", villageSeed: null, status: "closed", submissions: [], lines: [] },
  };
  f.rows.set(malformedScene.id, malformedScene);
  const control = structuredClone(f.rows.get("villages-repair-control"));
  await assert.rejects(f.api.createCheckpoint("Invalid source", "invalid-owner-save"), /source ownership/);
  await assert.rejects(f.api.restore(cp.id, "invalid-owner-restore"), /source ownership/);
  assert.deepEqual(f.rows.get(malformedScene.id), malformedScene);
  assert.deepEqual(f.rows.get("villages-repair-control"), control, "Malformed ownership cannot publish a journal.");
});
await runCase("repair/recovery", async () => {
  const f = await fixture();
  const review = await f.prepare(
    edit(repairId("world"), { name: "Willowmere", setting: "Survives a crash", worldName: "", worldRules: "" }),
  );
  let fired = false;
  f.hook((event, id) => {
    if (!fired && event === "after-update" && id === "villages-village") {
      fired = true;
      throw Error("lost storage acknowledgment");
    }
  });
  await assert.rejects(() => f.api.apply(review.id, review.token), /lost storage/u);
  f.hook(undefined);
  f.reopen();
  assert.equal((await f.read()).setting, "Survives a crash");
  await f.api.apply(review.id, review.token);
  assert.equal((await f.api.index()).history.length, 1);
  const second = await f.prepare(
    edit(
      repairId("world"),
      { name: "Willowmere", setting: "Control acknowledgment", worldName: "", worldRules: "" },
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
  await assert.rejects(() => f.api.apply(second.id, second.token), /lost control/u);
  f.hook(undefined);
  f.reopen();
  assert.equal((await f.read()).setting, "Control acknowledgment");
});
await runCase("repair/journal-integrity", async () => {
  const f = await fixture(),
    root = f.rows.get("villages-village");
  const before = {
    id: root.id,
    kind: root.kind,
    name: root.name,
    description: root.description,
    data: structuredClone(root.data),
  };
  const after = { ...before, data: { ...before.data, setting: "Must never partially replay" } };
  const codec = createRepairTransactionCodec(f.store);
  const frames = JSON.parse(await codec.encodeWrites([{ before, after }]));
  await f.store.create({
    id: "villages-repair-control",
    packageId: "villages",
    kind: "repair-control",
    name: "Recovery",
    description: "",
    data: { version: 3, epoch: 1, pending: { id: "malformed", writes: JSON.stringify([...frames, {}]) } },
    createdAt: memoryTime(),
    updatedAt: memoryTime(),
  });
  f.reopen();
  await assert.rejects(f.read());
  assert.equal(
    f.rows.get(root.id).data.setting,
    before.data.setting,
    "Validate the entire journal before its first effect.",
  );
  assert.ok(f.rows.get("villages-repair-control").data.pending, "Malformed recovery is held rather than discarded.");
  for (const id of [frames[0].after.body, "villages-repair-control"]) {
    const control = f.rows.get("villages-repair-control");
    control.data.pending.writes = JSON.stringify([
      ...frames,
      {
        id,
        beforeDigest: repairDocumentDigest(null),
        after: null,
      },
    ]);
    const saved = structuredClone(control);
    f.reopen();
    await assert.rejects(f.read(), /invalid repair frame/);
    assert.deepEqual(f.rows.get(control.id), saved);
    assert.ok(f.rows.has(frames[0].after.body));
    assert.equal(f.rows.get(root.id).data.setting, before.data.setting);
  }
  for (const pending of [false, 0, null, { writes: [] }, { id: "", writes: [] }, { id: "missing-writes" }]) {
    const control = f.rows.get("villages-repair-control");
    control.data = { version: 3, epoch: 1, pending };
    const saved = structuredClone(control);
    f.reopen();
    await assert.rejects(f.read(), /repair recovery record is invalid/);
    assert.deepEqual(f.rows.get(control.id), saved, "Malformed outer journals remain held byte-for-byte.");
  }

  const reviewFixture = await fixture();
  const review = await reviewFixture.prepare(
    edit(repairId("world"), { name: "Willowmere", setting: "Invalid read set", worldName: "", worldRules: "" }),
  );
  const plan = [...reviewFixture.rows.values()].find((r) => r.kind === "repair-plan");
  const transaction = structuredClone(plan.data.transaction);
  for (const key of ["reads", "lists"])
    for (const invalid of ['""', "[{}]"]) {
      plan.data.transaction = { ...transaction, [key]: invalid };
      await assert.rejects(reviewFixture.api.apply(review.id, review.token));
      assert.equal((await reviewFixture.read()).setting, "Original setting");
    }
  const page = {
    id: `villages-memory-page-${"a".repeat(32)}-${"b".repeat(64)}`,
    kind: "memory-page",
    name: "Unrecognized page",
    description: "",
    data: {
      format: 1,
      world: "a".repeat(32),
      node: {
        type: "text",
        text: "memory:[]",
        media: "global-gallery:owned-image",
      },
    },
  };
  const write = { before: null, after: page };
  const packed = JSON.parse(await codec.encodeWrites([write]));
  assert.deepEqual(
    f.rows.get(packed[0].after.body).data,
    page.data,
    "Unknown page bodies keep native media ownership.",
  );
  await assert.rejects(
    codec.decodeWrites(JSON.stringify([{ memoryPages: JSON.stringify([write]) }])),
    /invalid repair pages/,
  );
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
    edit(repairId("world"), { name: "Willowmere", setting: "Guarded", worldName: "", worldRules: "" }),
  );
  await f.api.apply(review.id, review.token);
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
    edit(repairId("world"), { name: "Willowmere", setting: "New epoch", worldName: "", worldRules: "" }, "new-epoch"),
  );
  await f.api.apply(next.id, next.token);
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
  assert.ok(JSON.stringify(await f.api.list("memories")).includes("hidden brass compass"));
  const before = await f.read();
  const privateId = before.continuity.records.find((record) =>
    before.continuity.versions.some((row) => row.rootId === record.id && row.text.includes("hidden brass compass")),
  )!.id;
  const record = await f.api.inspect(repairId("memory", privateId), "aqua");
  assert.ok(record.people?.some((person) => person.id === "aqua"));
  assert.ok(!record.people?.some((person) => person.id === "player"));
  assert.deepEqual(await f.read(), before, "Administrative reads cannot change gameplay knowledge");
});

await runCase("repair/domain-editors", async () => {
  const f = await fixture(),
    model = projectFixture().state();
  await f.repo.mutateAuthority(
    (s) => {
      Object.assign(s, model);
      s.seed = "repair-world";
      s.name = "Village";
      s.worldRules = "Original standing rules";
      const common = s.venues[0].zones!.find((zone) => zone.id === "common")!;
      common.seen = false;
      initializeRoomContinuity(s, "cafe", common.id, common.description, "room-seed", s.setupAt);
    },
    { memories: true },
  );
  const opening = await f.api.inspect(repairId("world"));
  assert.equal(opening.fields.find((field) => field.key === "worldRules")!.value, "Original standing rules");
  const founding = await f.prepare(
    edit(
      opening.id,
      Object.fromEntries(
        opening.fields.map((field) => [
          field.key,
          field.key === "worldRules" ? "Corrected standing rules" : field.value,
        ]),
      ),
      "fix-rules",
    ),
  );
  await f.api.apply(founding.id, founding.token);
  assert.equal((await f.read()).worldRules, "Corrected standing rules");
  const place = await f.api.inspect(repairId("venue", "cafe"));
  const values = Object.fromEntries(place.fields.map((field) => [field.key, field.value]));
  values.x = 0.3;
  const map = await f.prepare(edit(place.id, values, "fix-map"));
  await f.api.apply(map.id, map.token);
  const revision = (await f.read()).maps[0].revision;
  const undoMap = await f.api.undo(map.id, "undo-map");
  await f.api.apply(undoMap.id, undoMap.token);
  assert.ok((await f.read()).maps[0].revision > revision);
  assert.equal((await f.read()).venues[0].presentation.x, 0.2);
  const room = (await f.api.list("places")).records.find((row) => row.summary === "Room description");
  assert.ok(room, "Administrative records include unseen interiors");
  const roof = await f.prepare(edit(room.id, { text: "A shared room. The roof is sound." }, "fix-roof"));
  await f.api.apply(roof.id, roof.token);
  assert.equal((await f.api.inspect(room.id)).fields[0].value, "A shared room. The roof is sound.");
  assert.ok((await f.api.index()).checkpoints.length >= 2);
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
      access: {
        mode: "permission-required",
        managerIds: ownerId ? [ownerId] : ["player"],
        memberIds: ownerId ? [ownerId] : [],
        memberRoles: [],
        inviterIds: [],
        visitorHours: "always",
        accompanied: false,
      },
    });
  oldHome.zones!.find((z) => z.id === "bedroom")!.description = "A red scarf rests here.";
  await f.repo.mutateAuthority((s) => {
    s.venues = [oldHome, newHome];
  });
  const home = await f.prepare({
    ...edit(repairId("home", "a"), { destination: repairId("new-home", "bedroom") }, "fix-home"),
  });
  await f.api.apply(home.id, home.token);
  const housed = await f.read();
  assert.ok(housed.venues.find((v) => v.id === "new-home")?.residentIds?.includes("a"));
  assert.deepEqual(
    housed.venues.find((v) => v.id === "old-home")?.zones?.find((z) => z.id === "bedroom")?.description,
    "A red scarf rests here.",
  );
});
await runCase("repair/retained-scenes", async () => {
  const f = await fixture(),
    stamp = memoryTime(10);
  const scene: any = {
    version: 5,
    id: "held-scene",
    villageSeed: f.initial.seed,
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
  const cp = await f.api.createCheckpoint("Idle Scene");
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
  const review = await f.api.restore(cp.id, "restore-idle");
  await f.api.apply(review.id, review.token);
  f.reopen();
  assert.equal(
    (await f.gate.documents.getById("villages", "villages-active-venue"))?.data &&
      ((await f.gate.documents.getById("villages", "villages-active-venue"))!.data as any).sessionId,
    scene.id,
  );
  const saved = await f.gate.documents.getById("villages", row.id);
  const restored = await readSceneWorkIndex(f.gate.documents, saved!.data);
  assert.equal(restored.status, "active");
  assert.ok(restored.sceneRevision > 9);
});
await runCase("repair/correction-retained", async () => {
  const f = await fixture(),
    stamp = memoryTime(10);
  const row = await f.gate.documents.create({
    id: "villages-venue-visit-corrected",
    packageId: "villages",
    kind: "venue-visit",
    name: "Library",
    description: "",
    data: {
      version: 5,
      id: "corrected",
      villageSeed: "repair-world",
      status: "closed",
      placeName: "Library",
      startedAt: stamp,
      lines: [],
      submissions: [],
    },
    createdAt: stamp,
    updatedAt: stamp,
  });
  const correction = await f.prepare(
    edit(repairId("scene", "corrected"), { text: "The door was blue." }, "correct-scene"),
  );
  await f.api.apply(correction.id, correction.token);
  assert.equal(await f.gate.documents.remove("villages", row.id, row.revision), true);
  const retained = await f.api.inspect(repairId("scene", "corrected"));
  assert.match(retained.title, /Library/);
  assert.equal(retained.fields[0].value, "The door was blue.");
});
await runCase("repair/restored-evidence", async () => {
  const f = await fixture(),
    stamp = memoryTime(10);
  const scene = {
    version: 5,
    id: "restored",
    villageSeed: "repair-world",
    status: "closed",
    placeName: "Library",
    startedAt: stamp,
    endedAt: stamp,
    sceneRevision: 2,
    submissions: [],
    lines: [],
  };
  const savedScene = await f.gate.documents.create({
    id: "villages-venue-visit-restored",
    packageId: "villages",
    kind: "venue-visit",
    name: "Scene",
    description: "",
    data: scene,
    createdAt: stamp,
    updatedAt: stamp,
  });
  const cp = await f.api.createCheckpoint("Publication interrupted", "publication-checkpoint");
  await f.gate.documents.remove("villages", savedScene.id, savedScene.revision);
  await f.gate.documents.create({
    id: "villages-scene-terminal-restored",
    packageId: "villages",
    kind: "scene-terminal",
    name: "Receipt",
    description: "",
    data: terminalForScene(
      coerceSession({
        ...scene,
        generationReceipts: [
          { operationId: "old", attemptId: "spent", stages: ["reply"], outcome: "unknown", acknowledgedAt: stamp },
        ],
      }),
      savedScene.revision,
    ),
    createdAt: stamp,
    updatedAt: stamp,
  });
  const review = await f.api.restore(cp.id, "restore-publication");
  await f.api.apply(review.id, review.token);
  const restored = (await f.gate.documents.getById("villages", savedScene.id))!.data as any;
  assert.equal(restored.generationReceipts[0].attemptId, "spent");
  assert.equal(await f.gate.documents.getById("villages", "villages-scene-terminal-restored"), null);
});
await runCase("repair/scale", async () => {
  const f = await fixture();
  await f.repo.mutateAuthority(
    (s) => {
      Object.assign(s, nativeHistoryFixture(s, 25_000));
    },
    { memories: true },
  );
  const page = await f.api.list("memories");
  assert.equal(page.records.length, 50);
  assert.ok(page.total > 10000);
  const oldest = (await f.read()).continuity.records[0];
  const found = await f.api.inspect(repairId("memory", oldest.id));
  assert.ok(found.people?.length);
  assert.ok(found.source.length);
});
await runCase("repair/checkpoint-pages", async () => {
  const f = await fixture();
  await f.repo.mutateAuthority(
    (state) => {
      state.foundedAt = state.setupAt;
      Object.assign(state, nativeHistoryFixture(state, 5_000));
    },
    { memories: true },
  );
  const envelopes = new Set<string>();
  let interrupted = false;
  f.hook((event, id) => {
    const row = f.rows.get(id);
    if (
      !["after-create", "after-update"].includes(event) ||
      !["repair-checkpoint", "repair-plan", "repair-control"].includes(row?.kind)
    )
      return;
    const pending: unknown[] = [row.data];
    let visited = 0;
    while (pending.length) {
      assert.ok(
        ++visited < 4096,
        "Large-history checkpoint/review/journal envelopes must fit Engine reference traversal.",
      );
      const value = pending.pop();
      if (value && typeof value === "object") pending.push(...Object.values(value));
    }
    envelopes.add(row.kind);
    if (
      !interrupted &&
      row.kind === "repair-control" &&
      row.data.pending &&
      JSON.parse(row.data.pending.writes).some((w: any) => typeof w.memoryPages === "string")
    ) {
      interrupted = true;
      throw Error("packed journal acknowledgement interrupted");
    }
  });
  const checkpoint = await f.api.createCheckpoint("Paged history", "paged-checkpoint");
  const original = await f.read();
  const saved = [...f.rows.values()].find((r) => r.kind === "repair-checkpoint").data;
  const savedDocuments = await createRepairSnapshots(f.store).restore(saved.snapshots);
  assert.equal(
    savedDocuments.filter((r: any) => ["memory-page", "memory-payload"].includes(r.kind)).length,
    0,
    "Checkpoints share immutable Memory bodies through the saved head.",
  );
  const head = readMemoryHead((savedDocuments.find((r: any) => r.id === "villages-village")!.data as any).memoryHead)!;
  await f.repo.mutateAuthority(
    (state) => {
      Object.assign(state, nativeHistoryFixture(state, 7_500));
    },
    { memories: true },
  );
  const owned = await memoryPayloadDocuments(f.gate.documents, head, original);
  assert.ok(owned.length > 100);
  assert.ok(
    owned.every((row) => f.rows.has(row.id)),
    "Checkpoint-owned roots and pages remain available.",
  );
  f.reopen();
  const review = await f.api.restore(checkpoint.id, "restore-paged-checkpoint");
  await assert.rejects(f.api.apply(review.id, review.token), /packed journal acknowledgement interrupted/);
  assert.ok(interrupted);
  f.reopen();
  await f.api.apply(review.id, review.token);
  f.reopen();
  const restored = await f.read();
  assert.equal(restored.continuity.records.length, 5_000);
  assert.deepEqual(
    restored.continuity.versions.map((r) => r.text),
    original.continuity.versions.map((r) => r.text),
  );
  assert.ok(restored.continuity.revision > original.continuity.revision);
  assert.deepEqual([...envelopes].sort(), ["repair-checkpoint", "repair-control", "repair-plan"]);
});
await runCase("repair/http", async () => {
  const f = await fixture();
  const owner = createActivationScope();
  try {
    await owner.run(async () => {
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
        const memories = await app.inject({ url: "/repair/records?topic=memories&inspection=false" });
        assert.equal(memories.statusCode, 200, memories.body);
        assert.ok(memories.json().records.some((entry: any) => entry.title.includes("hidden brass compass")));
        assert.ok(index.json().people.some((person: any) => person.id === "aqua"));
        const checkpoint = await app.inject({
          method: "POST",
          url: "/repair/checkpoints",
          payload: { title: "HTTP checkpoint", operationId: "http-checkpoint" },
        });
        assert.equal(checkpoint.statusCode, 200, checkpoint.body);
        const restoration = await app.inject({
          method: "POST",
          url: "/repair/restore",
          payload: { id: checkpoint.json().id, operationId: "http-restoration" },
        });
        assert.equal(restoration.statusCode, 200, restoration.body);
        assert.equal(restoration.json().kind, "restore");
        const record = (await app.inject({ url: "/repair/record?id=" + encodeURIComponent(repairId("world")) })).json();
        const input = {
          ...edit(
            record.id,
            { name: "Willowmere", setting: "HTTP correction", worldName: "", worldRules: "" },
            "http-repair",
          ),
          expectedRecord: record.token,
        };
        const prepared = await app.inject({ method: "POST", url: "/repair/review", payload: input });
        assert.equal(prepared.statusCode, 200, prepared.body);
        assert.equal((await f.read()).setting, "Original setting");
        const applied = await app.inject({
          method: "POST",
          url: "/repair/apply",
          payload: { id: input.operationId, token: prepared.json().token },
        });
        assert.equal(applied.statusCode, 200, applied.body);
        assert.equal((await f.read()).setting, "HTTP correction");
        const undo = await app.inject({
          method: "POST",
          url: "/repair/undo",
          payload: { id: input.operationId, operationId: "http-undo" },
        });
        assert.equal(undo.statusCode, 200, undo.body);
        const cancelled = await app.inject({
          method: "POST",
          url: "/repair/cancel",
          payload: { id: undo.json().id, token: undo.json().token },
        });
        assert.equal(cancelled.statusCode, 200, cancelled.body);
        assert.equal(cancelled.json().cancelled, true);
      } finally {
        await app.close();
        release();
      }
    });
  } finally {
    owner.dispose();
  }
});

await runCase("repair/letter-fonts", async () => {
  const f = await fixture(),
    model = projectFixture().state();
  await f.repo.mutateAuthority((state) => {
    state.villagers = model.villagers;
  });
  const resident = (await f.read()).villagers[0]!;
  const id = repairId("letter-font", resident.characterId);
  const record = await f.api.inspect(id, resident.characterId);
  const original = resident.letterFontId;
  assert.equal(record.fields[0]!.value, original);
  assert.equal(record.fields[0]!.options!.length, LETTER_FONTS.length);
  const next = LETTER_FONTS.find((font) => font.id !== original)!.id;
  const request = { ...edit(id, { letterFontId: next }, "font-change"), personId: resident.characterId };
  const review = await f.prepare(request);
  assert.equal((await f.read()).villagers[0]!.letterFontId, original, "Review is read-only");
  await f.api.apply(review.id, review.token);
  assert.equal((await f.read()).villagers[0]!.letterFontId, next);
  f.reopen();
  assert.equal((await f.read()).villagers[0]!.letterFontId, next, "The decoder preserves the saved style");
  const undo = await f.api.undo(review.id, "undo-font-change");
  await f.api.apply(undo.id, undo.token);
  assert.equal((await f.read()).villagers[0]!.letterFontId, original);

  await f.repo.mutateAuthority((state) => {
    state.villagers[0]!.letterFontId = "future-font-id";
  });
  assert.equal((await f.read()).villagers[0]!.letterFontId, "future-font-id", "Unknown IDs survive loading");
  const missing = await f.api.inspect(id, resident.characterId);
  assert.equal(missing.fields[0]!.value, "future-font-id");
  assert.ok(missing.fields[0]!.options!.some((option) => option.value === "future-font-id"));
  const stale = await f.prepare({ ...request, operationId: "stale-font" });
  await f.repo.mutateAuthority((state) => {
    state.villagers[0]!.letterFontId = original;
  });
  await assert.rejects(() => f.api.apply(stale.id, stale.token), /changed/u);
  assert.equal((await f.read()).villagers[0]!.letterFontId, original);
});

await runCase("repair/places", async () => {
  const { establishPlace } = await import("../packages/villages/src/server/domain/rules/place-discovery.js");
  const f = await fixture();
  await f.repo.mutateAuthority(
    (state) => {
      state.maps = [
        {
          id: "map",
          name: "Village",
          revision: 1,
          width: 1440,
          height: 900,
          view: { fit: "cover", focusX: 50, focusY: 50, zoom: 1 },
          artwork: { id: "art", ref: "global-gallery:art", url: "/map.png" },
        },
      ];
      establishPlace(
        state,
        {
          name: "Cafe",
          description: "A cafe",
          controllers: ["jo"],
          people: [{ ref: "jo", name: "Jo", characterization: "An attentive proprietor" }],
          zones: [{ id: "room", name: "Room", kind: "restricted", description: "Private", controllers: ["jo"] }],
        },
        "place:cafe",
        "map",
        "test",
        state.setupAt,
        true,
      );
    },
    { memories: true },
  );
  for (const [kind, id, patch] of [
    ["npc", "npc:place:cafe:jo", { disabled: true }],
    ["place", "place:cafe", { name: "Corrected Cafe" }],
  ] as const) {
    const record = await f.api.inspect(repairId(kind, id));
    const review = await f.prepare({
      recordId: record.id,
      action: "correct",
      values: { ...Object.fromEntries(record.fields.map((field) => [field.key, field.value])), ...patch },
      knowers: [],
      operationId: "repair-" + kind,
    } as any);
    assert.equal(review.undoAvailable, true);
    await f.api.apply(review.id, review.token);
    const changed = await f.read();
    if (kind === "npc") assert.equal(changed.worldPlaces.npcs[id].disabled, true);
    else assert.equal(changed.worldPlaces.places[id].location.name, "Corrected Cafe");
    const undo = await f.api.undo(review.id, "undo-" + kind);
    await f.api.apply(undo.id, undo.token);
    const restored = await f.read();
    assert.equal(restored.worldPlaces.npcs["npc:place:cafe:jo"].disabled, false);
    assert.equal(restored.worldPlaces.places["place:cafe"].location.name, "Cafe");
    assert.deepEqual(restored.worldPlaces.places["place:cafe"].location.access?.managerIds, ["npc:place:cafe:jo"]);
  }
});
