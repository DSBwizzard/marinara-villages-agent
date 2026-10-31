import assert from "node:assert/strict";
import { mock } from "node:test";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
import { fixtureWish, wishWorld, wishTime } from "./helpers/social-wishes-fixture.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { createSceneWishContexts } from "../packages/villages/src/server/adapters/storage/scene-wish-contexts.js";
import { sessionSlot, activeSlot, ACTIVE_ID } from "../packages/villages/src/server/adapters/storage/scene-slots.js";
import {
  mutableSocialWish,
  immutableSocialWishes,
} from "../packages/villages/src/server/domain/rules/social-wishes.js";
import { reserveMemoryScene } from "../packages/villages/src/server/domain/rules/village-memories.js";
import { validateSceneHistory } from "../packages/villages/src/server/adapters/storage/scene-history.js";
import { withRepairWork } from "../packages/villages/src/server/adapters/storage/repair-gate.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  captureSceneContinuity,
  sceneContinuityView,
} from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import type { CapturedWishOwner } from "../packages/villages/src/server/domain/models/wish-check-model.js";

const f = sceneHistoryFixture(),
  repository = createVillageRepository(() => f.gate.documents);
try {
  const world = wishWorld();
  world.villagers[0].wishes = [fixtureWish({ wish: "Exact private café 東京 desire" })];
  await repository.mutateAuthority((state) => {
    Object.assign(state, world);
  });
  const state = await repository.readAuthority({ memories: true, wishes: true }),
    scene = coerceSession({
      version: 3,
      id: "captured-wishes",
      villageSeed: state.seed,
      startedAt: wishTime(),
      lines: [],
      submissions: [],
    });
  scene.continuity = captureSceneContinuity(state, scene, Date.parse(wishTime()));
  await f.mutateDocument("villages-venue-visit-" + scene.id, sessionSlot(f.gate.documents), (value) => {
    Object.assign(value, scene);
  });
  const capture = createSceneWishContexts(f.gate.documents),
    owners: CapturedWishOwner[] = [
      {
        actorId: "a",
        wishId: "",
        fingerprint: "",
        capturedAt: state.villagers[0].cardSnapshot.capturedAt,
        wishes: state.villagers[0].wishes,
      },
    ],
    pages = f.rows.size;
  const saved = await withRepairWork(() => capture.prepare(owners, scene));
  assert.ok(!Array.isArray(saved));
  assert.deepEqual(saved.owners[0].head, f.rows.get("villages-village").data.villagers[0].wishHead);
  assert.equal(f.rows.size, pages, "An unchanged capture shares the already owned canonical library");
  assert.ok(JSON.stringify(saved).length < 700);
  assert.doesNotMatch(JSON.stringify(saved), /Exact private/);
  assert.deepEqual(
    await capture.read(structuredClone(saved), scene),
    owners,
    "Plain descriptors survive cloning and exact hydration",
  );
  for (const field of ["sceneId", "seed", "setupAt"] as const) {
    const foreign = { ...saved, [field]: "different" };
    await assert.rejects(capture.read(foreign, scene), /another Scene or World/);
  }
  const get = f.documents.getById;
  let bodyReads = 0;
  f.documents.getById = async (pkg: string, id: string) => {
    const row = await get(pkg, id);
    if (row?.kind === "memory-page") bodyReads++;
    return row;
  };
  for (const fields of [{ capturedAt: "different" }, { actorId: "absent" }]) {
    const invalid = structuredClone(saved);
    Object.assign(invalid.owners[0], fields);
    await assert.rejects(capture.read(invalid, scene), /incarnation changed|another owner/);
    await assert.rejects(
      withRepairWork(() => capture.prepare(invalid, scene)),
      /incarnation changed|another owner/,
    );
  }
  assert.equal(bodyReads, 0, "Invalid resident captures fail before history hydration or model work");
  f.documents.getById = get;
  await assert.rejects(
    withRepairWork(() => capture.prepare([{ ...owners[0], capturedAt: "different" }], scene)),
    /incarnation changed/,
  );
  await assert.rejects(
    withRepairWork(() => capture.prepare([owners[0], owners[0]], scene)),
    /invalid captured Wish library/,
  );
  const root = f.rows.get(saved.owners[0].head!.root.id).data.node;
  assert.equal(root.type, "block");
  const missing = f.rows.get(root.content.id);
  f.rows.delete(root.content.id);
  const before = structuredClone(f.rows);
  await assert.rejects(
    withRepairWork(() => capture.prepare(structuredClone(saved), scene)),
    /missing/,
  );
  assert.deepEqual(
    f.rows,
    before,
    "An unowned cloned descriptor cannot publish a graph merely because its body is cached",
  );
  f.rows.set(root.content.id, missing);
  await capture.validate(saved, { sceneId: scene.id, seed: state.seed, setupAt: state.setupAt });
  const detached = await withRepairWork(() => capture.prepareValue({ wishContexts: structuredClone(saved) }, scene));
  assert(
    Object.isFrozen((detached as any).wishContexts),
    "Publication keeps the detached descriptor actually validated",
  );
  await f.repository.changeSession(scene.id, (value) =>
    value.submissions.push({ id: "captured", message: "Exact capture", wishContexts: saved } as any),
  );
  const native = f.rows.get("villages-venue-visit-" + scene.id).data,
    foreign = structuredClone(native);
  foreign.continuity.facts.villagers[0].cardSnapshot.capturedAt = "different";
  await assert.rejects(
    validateSceneHistory(f.gate.documents, [native, foreign]),
    /incarnation changed/,
    "Shared page validation still checks every native owner's resident directory",
  );
} finally {
  f.release();
}
{
  const f = sceneHistoryFixture(),
    repository = createVillageRepository(() => f.gate.documents);
  try {
    const world = wishWorld();
    world.villagers[0].wishes = [fixtureWish({ wish: "Original A" })];
    await repository.mutateAuthority((state) => Object.assign(state, world));
    const state = await repository.readAuthority({ wishes: true });
    const scene = coerceSession({
      version: 3,
      id: "overlapping-captures",
      villageSeed: state.seed,
      status: "closed",
      startedAt: wishTime(),
      participants: [{ characterId: "a", name: "Ada", doing: "Talking" }],
    });
    scene.continuity = captureSceneContinuity(state, scene, Date.parse(wishTime()));
    await f.mutateDocument("villages-venue-visit-" + scene.id, sessionSlot(f.gate.documents), (value) =>
      Object.assign(value, scene),
    );
    const owners = state.villagers.map((row) => ({
      actorId: row.characterId,
      capturedAt: row.cardSnapshot.capturedAt,
      wishId: "",
      fingerprint: "",
      wishes: row.wishes,
    }));
    await f.repository.changeSession(scene.id, (value) =>
      value.submissions.push({ id: "older-ab", message: "Both", wishContexts: owners } as any),
    );
    const next = { ...owners[0], wishes: [{ ...owners[0].wishes[0], wish: "Latest A" }] };
    await f.repository.changeSession(scene.id, (value) =>
      value.submissions.push({ id: "latest-a", message: "A", wishContexts: [next] } as any),
    );
    const current = await f.repository.readSession(scene.id),
      latest = current.submissions[1].wishContexts!;
    assert(!Array.isArray(latest));
    const reads: string[] = [],
      get = f.documents.getById;
    f.documents.getById = async (pkg: string, id: string) => {
      reads.push(id);
      return get(pkg, id);
    };
    await f.repository.changeSession(scene.id, (value) =>
      value.submissions.push({
        id: "next-a",
        message: "Next A",
        wishContexts: [{ ...next, wishes: [{ ...next.wishes[0], wish: "Next exact A" }] }],
      } as any),
    );
    assert(
      reads.includes(latest.owners[0].head!.root.id),
      "An older overlapping [A,B] capture cannot replace the latest [A] source",
    );
  } finally {
    f.release();
    f.gate.dispose();
  }
}
{
  const world = wishWorld();
  world.villagers[0].wishes = ["first", "middle", "last"].map((id) => fixtureWish({ wish: "Baseline " + id }, id));
  const scene = coerceSession({
    version: 3,
    id: "packet-order",
    villageSeed: world.seed,
    startedAt: wishTime(),
    lines: [],
    submissions: [],
  });
  scene.continuity = captureSceneContinuity(world, scene, Date.parse(wishTime()));
  const changes = [
    ["new-a", "New A"],
    ["new-b", "New B"],
    ["new-a", "Latest A"],
    ["first", "Latest first"],
    ["middle", "Latest middle"],
  ];
  for (const [index, [wishId, text]] of changes.entries()) {
    const id = "effect:" + index,
      submissionId = "turn:" + index;
    scene.submissions.push({ id: submissionId } as any);
    world.exchangeReceipts[id] = {
      id,
      sceneId: scene.id,
      submissionId,
      domain: "wishes",
      status: "applied",
      at: wishTime(),
      evidenceIds: [],
      reason: text,
      sceneFacts: { wish: { actorId: "a", wishId, value: fixtureWish({ wish: text }, wishId) } },
    };
  }
  const view = sceneContinuityView(world, scene, false);
  assert.deepEqual(
    view.villagers[0].wishes.map((wish) => wish.id),
    ["first", "middle", "last", "new-a", "new-b"],
  );
  assert.equal(view.villagers[0].wishes[0].wish, "Latest first");
  assert.equal(
    view.villagers[0].wishes[3].wish,
    "Latest A",
    "Latest bodies preserve first-introduction order for new Wishes",
  );
  assert.deepEqual(
    world.villagers[0].wishes.map((wish) => wish.wish),
    ["Baseline first", "Baseline middle", "Baseline last"],
  );
}
{
  const f = sceneHistoryFixture(),
    repository = createVillageRepository(() => f.gate.documents);
  try {
    const world = wishWorld(),
      id = "long-capture";
    world.villagers[0].wishes = [
      {
        ...fixtureWish({ wish: "Scene baseline A" }),
        history: Array.from({ length: 25_000 }, (_, index) => ({
          id: "event:" + index,
          at: wishTime(),
          kind: "progress" as const,
          text: "Exact preserved café 東京 history " + index + " evidence. ".repeat(8),
          sourceId: "source:" + index,
          lineIds: ["line:" + index],
        })),
      },
      fixtureWish({ wish: "An unchanged separate desire" }, "guard"),
    ];
    assert(Buffer.byteLength(JSON.stringify(world.villagers[0].wishes)) > 4 * 1024 * 1024);
    await repository.mutateAuthority((state) => {
      Object.assign(state, world);
      reserveMemoryScene(state, id, wishTime());
    });
    const baseline = await repository.readAuthority({ memories: true, wishes: true });
    const scene = coerceSession({
      version: 3,
      id,
      villageSeed: baseline.seed,
      startedAt: wishTime(),
      status: "active",
      participants: [{ characterId: "a", name: "Ada", doing: "Talking" }],
    });
    scene.continuity = captureSceneContinuity(baseline, scene, Date.parse(wishTime()));
    await f.mutateDocument("villages-venue-visit-" + id, sessionSlot(f.gate.documents), (value) =>
      Object.assign(value, scene),
    );
    await f.mutateDocument(ACTIVE_ID, activeSlot, (value) => {
      value.sessionId = id;
      value.placeId = "hall";
    });
    await repository.mutateAuthority(
      (state) => {
        state.villagers[0].wishes[0] = { ...state.villagers[0].wishes[0], wish: "Later World C" };
      },
      { wishes: ["a"] },
    );
    const capture = createSceneWishContexts(f.gate.documents);
    let owner: CapturedWishOwner = {
      actorId: "a",
      wishId: "",
      fingerprint: "",
      capturedAt: baseline.villagers[0].cardSnapshot.capturedAt,
      wishes: [{ ...baseline.villagers[0].wishes[0], wish: "Exact Scene B" }, baseline.villagers[0].wishes[1]],
    };
    await f.repository.changeSession(id, (value) =>
      value.submissions.push({ id: "turn:0", message: "First capture", wishContexts: [owner] } as any),
    );
    await repository.mutateAuthority((state) => {
      state.exchangeReceipts["capture-effect"] = {
        id: "capture-effect",
        sceneId: id,
        submissionId: "turn:0",
        domain: "wishes",
        status: "applied",
        at: wishTime(),
        evidenceIds: [],
        reason: "Captured exact progress",
        sceneFacts: { wish: { actorId: "a", wishId: owner.wishes[0].id, value: owner.wishes[0] } },
      };
    });
    await repository.readAuthority({ wishEffects: ["capture-effect"] });
    const archived = { ...scene, id: "archived-capture", status: "closed" as const, submissions: [] };
    await f.mutateDocument("villages-venue-visit-" + archived.id, sessionSlot(f.gate.documents), (value) =>
      Object.assign(value, archived),
    );
    await f.repository.changeSession(archived.id, (value) =>
      value.submissions.push({
        id: "archived-turn",
        message: "Earlier independent capture",
        wishContexts: [
          {
            ...owner,
            wishes: immutableSocialWishes([{ ...owner.wishes[0], wish: "Archived exact capture" }, owner.wishes[1]]),
          },
        ],
      } as any),
    );
    const stringify = JSON.stringify;
    let serialized = 0,
      interior = false,
      interiorStack = "",
      maxRead = 0,
      maxWritten = 0,
      maxSerialized = 0;
    const spy = mock.method(JSON, "stringify", (...args: unknown[]) => {
      const text = Reflect.apply(stringify, JSON, args);
      if (typeof text === "string") {
        serialized += Buffer.byteLength(text);
        if (text.includes("Exact preserved café 東京 history 10000")) {
          interior = true;
          interiorStack ||= new Error("Interior history serialization").stack ?? "";
        }
      }
      return text;
    });
    try {
      for (let index = 1; index <= 20; index++) {
        if (index === 8) {
          const old = await f.repository.readSession(archived.id);
          await capture.read(old.submissions[0].wishContexts!, old);
        }
        if (index === 10) {
          await f.gate.simulate(async () => {
            await f.mutateDocument("villages-venue-visit-simulation", sessionSlot(f.gate.documents), (value) =>
              Object.assign(value, coerceSession({ version: 3, id: "simulation", villageSeed: "another-world" })),
            );
            await f.mutateDocument(ACTIVE_ID, activeSlot, (value) => {
              value.sessionId = "simulation";
              value.placeId = "another-place";
            });
            await f.repository.readActive();
          });
          assert.equal(
            f.rows.get(ACTIVE_ID).data.sessionId,
            id,
            "A simulated other Scene never replaces the real active owner",
          );
        }
        f.reset();
        serialized = 0;
        interior = false;
        const current = await f.repository.readSession(id);
        await repository.readAuthority({ wishEffects: ["capture-effect"] });
        owner = (await capture.read(current.submissions.at(-1)!.wishContexts!, current))[0];
        assert.equal(owner.wishes[0].wish, "Exact Scene B", "Captured Scene context never falls back to later World C");
        const wish = mutableSocialWish(owner.wishes[0]);
        wish.history.push({
          id: "scene-event:" + index,
          at: wishTime(),
          kind: "progress",
          text: "Exact Scene progress " + index,
          sourceId: "turn:" + index,
          lineIds: ["line:" + index],
        });
        owner = { ...owner, wishes: immutableSocialWishes([wish, owner.wishes[1]]) };
        await f.repository.changeSession(id, (value) =>
          value.submissions.push({ id: "turn:" + index, message: "Next capture", wishContexts: [owner] } as any),
        );
        const io = f.metrics();
        maxRead = Math.max(maxRead, io.readBytes);
        maxWritten = Math.max(maxWritten, io.writtenBytes);
        maxSerialized = Math.max(maxSerialized, serialized);
        assert(
          io.readBytes < 512_000 && io.writtenBytes < 512_000,
          "A long captured history reuses its last published layout: " + JSON.stringify({ index, ...io }),
        );
        assert(
          serialized < 2_000_000 && !interior,
          "Context reads and capture publication do not serialize unchanged interior history: " +
            JSON.stringify({ index, serialized, interiorStack }),
        );
      }
    } finally {
      spy.mock.restore();
    }
    console.log(
      JSON.stringify({ workload: "long-scene-capture", events: 25_000, turns: 20, maxRead, maxWritten, maxSerialized }),
    );
  } finally {
    f.release();
    f.gate.dispose();
  }
}
console.log(
  "Captured Wish packets: canonical sharing, clone-safe exact reads, scoped identities and physical adoption checks passed.",
);
