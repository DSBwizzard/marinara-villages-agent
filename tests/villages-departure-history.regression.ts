// Test cases: departure-history/growth, departure-history/ownership, departure-history/publication, departure-history/comparison
import assert from "node:assert/strict";
import { mock } from "node:test";
import { runCase } from "../scripts/test-cases.mjs";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { continuityMemoryLibrary } from "../packages/villages/src/server/domain/rules/continuity-library.js";
import {
  captureReturnContext,
  departureContinuityAvailable,
} from "../packages/villages/src/server/domain/rules/return-catchup-capture.js";
import { returnCaptureRevision } from "../packages/villages/src/server/domain/rules/return-capture-revision.js";
import { sameReturnResident } from "../packages/villages/src/server/domain/rules/return-catchup-authority.js";
import { cloneVillageContext } from "../packages/villages/src/server/domain/rules/world-context-copy.js";
import { collectRetainedStorage } from "../packages/villages/src/server/features/repair/retained-storage-cleanup.js";
import { createRepairService } from "../packages/villages/src/server/features/repair/repair-service.js";
import { nativeHistoryFixture, retainAuthoredNote } from "./helpers/continuity.fixture.js";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";

const at = "2026-10-30T12:00:00.000Z",
  setupAt = "2026-10-01T00:00:00.000Z";
const privateText = "Ada privately heard exact café 🌼 evidence about a violin.";
async function fixture(count = 10) {
  const f = sceneHistoryFixture();
  const repository = createVillageRepository(() => f.gate.documents);
  const state = coerceVillageState({
    ...defaultVillageState(),
    seed: "departure-" + count,
    setupAt,
    foundedAt: setupAt,
    setting: "Departure setting",
    villagers: [
      {
        characterId: "ada",
        incarnation: "ada-one",
        letterFontId: "caveat",
        addedAt: setupAt,
        cardSnapshot: { id: "ada", name: "Ada", revision: 1, sourceStatus: "available", capturedAt: setupAt },
      },
    ],
  });
  Object.assign(state, nativeHistoryFixture(state, count));
  retainAuthoredNote(state, "private-departure", privateText, ["ada"], at);
  state.returnCatchup = { capture: captureReturnContext(state, new Date(at)) };
  await repository.mutateAuthority((draft) => Object.assign(draft, state), { memories: true });
  const repair = createRepairService({
    gate: f.gate,
    repository,
    resumeProject: async () => {},
    cancelProject: async () => {},
    replaySaved: async () => {},
  });
  return {
    ...f,
    repository,
    repair,
    root: () => f.rows.get("villages-village"),
    close: () => {
      f.release();
      f.gate.dispose();
    },
  };
}

await runCase("departure-history/growth", async () => {
  const metrics: unknown[] = [];
  for (const count of [1000, 10_000, 25_000]) {
    const f = await fixture(count);
    try {
      const initial = await f.repository.readAuthority({ memories: true });
      const capture = initial.returnCatchup!.capture!,
        identity = returnCaptureRevision(capture);
      assert(departureContinuityAvailable(capture, initial));
      await f.repository.mutateAuthority(
        (state) => {
          retainAuthoredNote(state, "later", "The player found a new star chart.", ["player"], at);
        },
        { memories: true },
      );
      f.reset();
      const stringify = JSON.stringify;
      let jsonBytes = 0;
      const instrumented = mock.method(JSON, "stringify", (...args: unknown[]) => {
        const output = Reflect.apply(stringify, JSON, args);
        if (typeof output === "string") {
          jsonBytes += Buffer.byteLength(output);
          assert(!output.includes(privateText), "Metadata writes never serialize exact private history");
        }
        return output;
      });
      try {
        for (let i = 0; i < 20; i++) {
          await f.repository.mutateAuthority((state) => {
            state.setting = "Ordinary update " + i;
          });
          const current = await f.repository.readAuthority();
          assert.equal(current.returnCatchup!.capture!.world.setting, "Departure setting");
          assert.equal(returnCaptureRevision(current.returnCatchup!.capture), identity);
          assert.throws(() => current.continuity, /not loaded/);
        }
      } finally {
        instrumented.mock.restore();
      }
      const stats = f.metrics();
      metrics.push({ count, ...stats, jsonBytes });
      assert(stats.readBytes < 1024 * 1024 && stats.writtenBytes < 1024 * 1024);
      assert(jsonBytes < 4 * 1024 * 1024, "Ordinary World work stays independent of history size");
      assert(!Object.hasOwn(f.root().data.returnCatchup.capture.world, "continuity"));
      assert(!Object.hasOwn(f.root().data.returnCatchup.capture.world, "episodes"));
      const cold = await createVillageRepository(() => f.gate.documents).readAuthority({ memories: true });
      assert.equal(returnCaptureRevision(cold.returnCatchup!.capture), identity);
      assert.equal(
        departureContinuityAvailable(cold.returnCatchup!.capture!, cold),
        false,
        "Changed history cannot be reconstructed from a captured revision",
      );
      assert.equal(cold.episodes.records.length, count + 2);
      assert.equal(
        continuityMemoryLibrary(cold, { inspection: true, characterId: "ada", query: "violin" }, at).entries[0]?.text,
        privateText,
      );
      assert.equal(continuityMemoryLibrary(cold, { query: "violin" }, at).total, 0);
    } finally {
      f.close();
    }
  }
  console.log("Departure document-store operation growth:", JSON.stringify(metrics));
});

await runCase("departure-history/ownership", async () => {
  const f = await fixture();
  try {
    const owner = f.root().data.memoryHead.id;
    const checkpoint = await f.repair.createCheckpoint("Departure history", "departure-checkpoint");
    await f.repository.mutateAuthority(
      (state) => {
        retainAuthoredNote(state, "later", "New evidence after departure.", ["player"], at);
        delete state.returnCatchup!.capture;
      },
      { memories: true },
    );
    await collectRetainedStorage(f.gate);
    assert(f.rows.has(owner), "A checkpoint protects its canonical history after capture removal");
    const retained = f.rows.get(owner);
    f.rows.delete(owner);
    const unchanged = structuredClone(f.rows);
    await assert.rejects(collectRetainedStorage(f.gate), /missing/);
    await assert.rejects(f.repair.restore(checkpoint.id, "missing-departure"), /continuity payload is unavailable/);
    assert.deepEqual(f.rows, unchanged, "Missing checkpoint dependencies cannot publish restore or cleanup");
    f.rows.set(owner, retained);
    const review = await f.repair.restore(checkpoint.id, "restore-departure");
    await f.repair.apply(review.id, review.token);
    const restored = await f.repository.readAuthority({ memories: true });
    assert.equal(restored.returnCatchup?.capture, undefined, "Restore discards the active absence capture");
    assert.equal(continuityMemoryLibrary(restored, { query: "new evidence" }, at).total, 0);
    assert.equal(
      continuityMemoryLibrary(restored, { inspection: true, characterId: "ada", query: "violin" }, at).entries[0]?.text,
      privateText,
    );
    await collectRetainedStorage(f.gate);
    assert(f.rows.has(owner), "The checkpoint still owns its history after restore");
  } finally {
    f.close();
  }
});

await runCase("departure-history/publication", async () => {
  const f = await fixture();
  const update = f.documents.update;
  let fault: "before" | "after" | undefined;
  f.documents.update = async (input: any) => {
    if (input.id !== "villages-village" || !fault) return update(input);
    const point = fault;
    fault = undefined;
    if (point === "before") throw Error("Interrupted before owner CAS");
    await update(input);
    throw Error("Uncertain owner CAS acknowledgement");
  };
  try {
    const initial = structuredClone(f.root().data),
      original = returnCaptureRevision(initial.returnCatchup.capture);
    const change = (setting: string) =>
      f.repository.mutateAuthority(
        (state) => {
          state.setting = setting;
          state.returnCatchup = { capture: captureReturnContext(state, new Date(at)) };
        },
        { memories: true },
      );
    fault = "before";
    await assert.rejects(change("Uncommitted capture"), /Interrupted/);
    assert.deepEqual(f.root().data, initial);
    await collectRetainedStorage(f.gate);
    fault = "after";
    await assert.rejects(change("Committed capture"), /Uncertain/);
    const cold = await createVillageRepository(() => f.gate.documents).readAuthority({ memories: true });
    assert.equal(cold.returnCatchup!.capture!.world.setting, "Committed capture");
    assert.notEqual(returnCaptureRevision(cold.returnCatchup!.capture), original);
    assert(departureContinuityAvailable(cold.returnCatchup!.capture!, cold));
    assert.deepEqual(f.root().data.memoryHead, initial.memoryHead);
    const invalid = structuredClone(cold);
    (invalid.returnCatchup!.capture!.world as any).relationshipContext = {};
    assert.throws(() => coerceVillageState(invalid), /departure capture/);
    f.rows.delete(initial.memoryHead.id);
    const unchanged = structuredClone(f.rows);
    await assert.rejects(f.repository.readAuthority({ memories: true }), /missing/);
    await assert.rejects(f.repair.createCheckpoint("Missing", "missing-current"), /missing/);
    await assert.rejects(collectRetainedStorage(f.gate), /missing/);
    assert.deepEqual(f.rows, unchanged);
  } finally {
    f.documents.update = update;
    f.close();
  }
});

await runCase("departure-history/comparison", async () => {
  const f = await fixture();
  try {
    const live = await f.repository.readAuthority({ memories: true });
    const capture = live.returnCatchup!.capture!,
      identity = returnCaptureRevision(capture);
    const before = structuredClone(f.rows);
    const projection = cloneVillageContext(live);
    assert(departureContinuityAvailable(capture, projection));
    assert.equal(returnCaptureRevision(projection.returnCatchup!.capture), identity);
    assert(sameReturnResident(capture.world.villagers[0], live.villagers[0], new Date(at), live));
    projection.villagers[0].incarnation = "ada-replacement";
    assert(!sameReturnResident(capture.world.villagers[0], projection.villagers[0], new Date(at), projection));
    assert.equal(returnCaptureRevision(capture), identity);
    assert(!departureContinuityAvailable(capture, { ...live, seed: "another-world" }));
    assert(!departureContinuityAvailable(capture, { ...live, setupAt: at }));
    for (const field of ["continuity", "episodes"] as const) {
      assert(
        !departureContinuityAvailable(capture, {
          ...live,
          [field]: { ...live[field], revision: live[field].revision + 1 },
        }),
      );
    }
    assert.deepEqual(f.rows, before, "Comparison does not publish native records or history intents");
  } finally {
    f.close();
  }
});
