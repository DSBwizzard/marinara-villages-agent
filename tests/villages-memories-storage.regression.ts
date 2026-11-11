// Test cases: memories-storage/1000, memories-storage/10000, memories-storage/25000, memories-storage/conflict, memories-storage/interruptions, memories-storage/reader-retention, memories-storage/active-preparation, memories-storage/reset, memories-storage/malformed, memories-storage/late-payload, memories-storage/page-restart, memories-storage/simulation, memories-storage/missing-page, memories-storage/large-exact-entry, memories-storage/opaque-gallery-boundary, memories-storage/world-namespace
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageState } from "../packages/villages/src/server/domain/models/world.js";
import type { AcceptedEpisode } from "../packages/villages/src/server/domain/models/episode-model.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { createRepairGate } from "../packages/villages/src/server/adapters/storage/repair-gate.js";
import { MEMORY_PAGE_BYTES } from "../packages/villages/src/server/adapters/storage/memory-pages.js";
import { protectContinuity, continuityHolderKey } from "../packages/villages/src/server/domain/rules/continuity.js";
import { appendEpisode } from "../packages/villages/src/server/domain/rules/episodes.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { readAcceptedEpisode } from "../packages/villages/src/server/domain/decoding/episode-codec.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { nativeHistoryFixture } from "./helpers/continuity.fixture.js";

const at = "2026-11-09T12:00:00.000Z";
function fixture() {
  const records = new Map<string, any>(),
    warnings: string[] = [],
    reads: string[] = [];
  const io = { readBytes: 0, writeBytes: 0, reads: 0, writes: 0 };
  const bytes = (value: unknown) => Buffer.byteLength(JSON.stringify(value ?? null), "utf8");
  let hook: (event: string, id: string) => void | Promise<void> = () => {};
  const clone = (v: any) => (v === undefined ? null : structuredClone(v));
  const store: any = {
    async getById(_pkg: string, id: string) {
      reads.push(id);
      await hook("before-read", id);
      const result = clone(records.get(id));
      io.reads++;
      io.readBytes += bytes(result);
      return result;
    },
    async list(_pkg: string, kind: string) {
      const result = [...records.values()].filter((r) => r.kind === kind).map(clone);
      io.reads++;
      io.readBytes += bytes(result);
      return result;
    },
    async create(input: any) {
      io.writes++;
      io.writeBytes += bytes(input);
      await hook("before-create", input.id);
      assert.ok(!records.has(input.id));
      const r = { ...clone(input), revision: 1 };
      records.set(r.id, r);
      await hook("after-create", r.id);
      return clone(r);
    },
    async update(input: any) {
      io.writes++;
      io.writeBytes += bytes(input);
      await hook("before-update", input.id);
      const r = records.get(input.id);
      if (!r || r.revision !== input.expectedRevision) return null;
      const n = { ...r, ...clone(input), revision: r.revision + 1 };
      records.set(input.id, n);
      await hook("after-update", input.id);
      return clone(n);
    },
    async remove(_pkg: string, id: string, revision: number) {
      await hook("before-remove", id);
      if (records.get(id)?.revision !== revision) return false;
      records.delete(id);
      await hook("after-remove", id);
      return true;
    },
  };
  const repository = createVillageRepository(
    () => store,
    (m) => warnings.push(m),
  );
  return {
    records,
    reads,
    io,
    resetIo: () => Object.assign(io, { readBytes: 0, writeBytes: 0, reads: 0, writes: 0 }),
    warnings,
    repository,
    external: createVillageRepository(() => store),
    store,
    restart: () => createVillageRepository(() => store),
    hook: (h: typeof hook) => {
      hook = h;
    },
    root: () => records.get("villages-village"),
    payloads: () => [...records.values()].filter((r) => r.kind === "memory-payload"),
    intents: () => [...records.values()].filter((r) => r.kind === "memory-payload-intent"),
  };
}

async function seed(f: ReturnType<typeof fixture>, count = 1) {
  const state = nativeHistory(count);
  await f.repository.mutateAuthority((draft) => Object.assign(draft, state), { memories: true });
  return state;
}
function nativeHistory(count: number) {
  const state = { ...defaultVillageState(), seed: "storage-scale", setupAt: at };
  return { ...state, ...nativeHistoryFixture(state, count) };
}
function forgetFirst(state: VillageState) {
  const holder = continuityActor(state, "player")!,
    key = continuityHolderKey(holder),
    root = state.continuity.records[0];
  state.continuity = protectContinuity(
    state.continuity,
    {
      id: root.id,
      recordRevision: root.revision,
      heads: { [key]: root.heads[key].revision },
    },
    [holder],
    "forget-first",
    at,
    { forget: true },
  );
}
function forgotten(state: VillageState) {
  return state.continuity.records[0].protection[continuityHolderKey(continuityActor(state, "player")!)]?.forgotten;
}
function proseEpisode(state: VillageState, id: string, contents = ["A separate ordinary exchange."]): AcceptedEpisode {
  const player = continuityActor(state, "player")!;
  return structuredClone(
    readAcceptedEpisode(
      {
        format: 1,
        id,
        seed: state.seed,
        submissionId: id,
        operationId: id,
        capturedAt: at,
        acceptedAt: at,
        responseDigest: memoryHash(contents),
        admittedContinuityRevision: state.continuity.revision,
        privateInput: "",
        actors: [{ id: player.id, incarnation: player.incarnation, zoneId: "native" }],
        segments: contents.map((content, i) => ({
          id: id + "-" + i,
          role: "assistant",
          speakerId: "__venue_scene__",
          name: "Narration",
          kind: "narration",
          content,
          at,
          zoneId: "native",
          heardBy: ["player"],
        })),
        grounding: [],
        continuityVersionIds: [],
        offered: [],
        commandReceipts: [],
        dependencies: {},
      },
      state.seed,
    ),
  );
}
for (const count of [1000, 10000, 25000])
  await runCase("memories-storage/" + count, async () => {
    const f = fixture(),
      initial = await seed(f, count),
      head = f.root().data.memoryHead.id;
    assert(Buffer.byteLength(JSON.stringify(f.root().data)) < 10000);
    for (const field of ["continuity", "episodes", "worldPlaces", "mailbox"])
      assert.equal(Object.hasOwn(f.root().data, field), false);
    f.reads.length = 0;
    f.resetIo();
    const ordinary = await f.repository.readAuthority();
    for (const field of ["continuity", "episodes", "worldPlaces", "mailbox"] as const)
      assert.throws(() => ordinary[field], /not loaded/);
    await f.repository.mutateAuthority((state) => {
      state.name = "Current world";
    });
    assert.equal(f.root().data.memoryHead.id, head);
    assert(
      f.reads.every((id) => !id.startsWith("villages-memory-")),
      "metadata work never hydrates history",
    );
    const ordinaryIo = { ...f.io };
    assert(ordinaryIo.readBytes < 50000);
    assert(ordinaryIo.writeBytes < 15000);
    const restored = await f.repository.readAuthority({ memories: true });
    assert.deepEqual(restored.continuity, initial.continuity);
    assert.deepEqual(restored.episodes, initial.episodes);
    assert.equal(restored.name, "Current world");
    assert.equal(f.intents().length, 0);
    f.resetIo();
    let serializedBytes = 0;
    let serializedProseBytes = 0;
    const stringify = JSON.stringify;
    JSON.stringify = ((...args: any[]) => {
      const result = Reflect.apply(stringify, JSON, args);
      if (typeof result === "string") {
        const bytes = Buffer.byteLength(result);
        serializedBytes += bytes;
        if (result.includes("Retained native account ")) serializedProseBytes += bytes;
      }
      return result;
    }) as typeof JSON.stringify;
    try {
      await f.repository.mutateAuthority(forgetFirst, { memories: true });
    } finally {
      JSON.stringify = stringify;
    }
    const mutationIo = { ...f.io };
    assert(mutationIo.readBytes < 500000, "warm writes do not read complete history");
    assert(mutationIo.writeBytes < 500000, "warm writes replace bounded pages and directory paths");
    assert.equal(serializedProseBytes, 0, "warm Forget must not serialize any unchanged retained prose");
    assert(
      [...f.records.values()]
        .filter((r) => r.kind === "memory-page")
        .every((r) => Buffer.byteLength(JSON.stringify(r.data)) <= MEMORY_PAGE_BYTES),
    );
    const restarted = await f.restart().readAuthority({ memories: true });
    assert(forgotten(restarted));
    assert.equal(restarted.continuity.records.length, count);
    assert.equal(restarted.episodes.records.length, count);
    assert.deepEqual(restarted.episodes, initial.episodes, "Forget does not delete canonical history");
    console.log(
      JSON.stringify({
        count,
        rootBytes: Buffer.byteLength(JSON.stringify(f.root().data)),
        ordinaryIo,
        mutationIo,
        serializedBytes,
        serializedProseBytes,
      }),
    );
  });

await runCase("memories-storage/conflict", async () => {
  const f = fixture();
  await seed(f);
  let conflicts = 0;
  f.hook((event, id) => {
    if (event === "before-update" && id === "villages-village" && !conflicts++) {
      f.root().revision++;
      f.root().data.name = "Concurrent name";
    }
  });
  await f.repository.mutateAuthority(forgetFirst, { memories: true });
  const actual = await f.repository.readAuthority({ memories: true });
  assert.equal(actual.name, "Concurrent name");
  assert(forgotten(actual));
  assert.equal(f.intents().length, 0);
  const beforeReceipt = f.root().data.memoryHead.id;
  await f.repository.mutateAuthority(
    (state) => {
      state.continuity = {
        ...state.continuity,
        receipts: {
          ...state.continuity.receipts,
          "metadata-receipt": { fingerprint: memoryHash("metadata-receipt"), roots: [], versions: [] },
        },
      };
    },
    { memories: true },
  );
  assert.notEqual(f.root().data.memoryHead.id, beforeReceipt, "receipt-only changes publish");
  const beforeEpisode = f.root().data.memoryHead.id;
  await f.repository.mutateAuthority(
    (state) => {
      state.episodes = appendEpisode(state.episodes, proseEpisode(state, "extra"), state.seed);
    },
    { memories: true },
  );
  assert.notEqual(f.root().data.memoryHead.id, beforeEpisode, "Episode-only changes publish");
  assert.equal((await f.restart().readAuthority({ memories: true })).episodes.records.length, 2);
});

await runCase("memories-storage/interruptions", async () => {
  for (const failure of ["intent", "payload", "before-publication", "after-publication", "intent-cleanup"]) {
    const f = fixture();
    await seed(f);
    let failed = false;
    f.hook((event, id) => {
      if (failed) return;
      const match =
        failure === "intent"
          ? event === "after-create" && id.startsWith("villages-memory-intent-")
          : failure === "payload"
            ? event === "after-create" && id.startsWith("villages-memory-") && !id.startsWith("villages-memory-intent-")
            : failure === "before-publication"
              ? event === "before-update" && id === "villages-village"
              : failure === "after-publication"
                ? event === "after-update" && id === "villages-village"
                : event === "before-remove" && id.startsWith("villages-memory-intent-");
      if (match) {
        failed = true;
        throw Error("simulated interruption");
      }
    });
    const change = f.repository.mutateAuthority(
      (state) => {
        state.name = "Published";
        state.continuity = { ...state.continuity, revision: state.continuity.revision + 1 };
      },
      { memories: true },
    );
    const committed = ["after-publication", "intent-cleanup"].includes(failure);
    if (failure === "intent-cleanup") await change;
    else await assert.rejects(change, /simulated interruption/);
    assert(failed, "the named fault must actually fire");
    const actual = await f.repository.readAuthority({ memories: true });
    assert.equal(actual.name, committed ? "Published" : defaultVillageState().name);
    assert.equal(actual.continuity.revision, committed ? 2 : 1);
    assert(f.intents().length > 0);
    f.hook(() => {});
    await f.repository.mutateAuthority((state) => {
      state.setting = "Fenced later revision";
    });
    assert(f.records.has(f.root().data.memoryHead.id));
    assert.equal(f.intents().length, 0);
    assert.equal((await f.repository.readAuthority({ memories: true })).continuity.revision, committed ? 2 : 1);
  }
});

await runCase("memories-storage/reader-retention", async () => {
  const f = fixture();
  await seed(f);
  const old = f.root().data.memoryHead.id,
    gate = Promise.withResolvers<void>(),
    waiting = Promise.withResolvers<void>();
  let blocked = false;
  f.hook(async (event, id) => {
    if (event === "before-read" && id === old && !blocked) {
      blocked = true;
      waiting.resolve();
      await gate.promise;
    }
  });
  const reading = f.repository.readAuthority({ memories: true });
  await waiting.promise;
  await f.repository.mutateAuthority(
    (state) => {
      state.name = "New root";
      state.continuity = { ...state.continuity, revision: state.continuity.revision + 1 };
    },
    { memories: true },
  );
  assert(f.records.has(old));
  gate.resolve();
  const actual = await reading;
  assert.equal(actual.name, defaultVillageState().name);
  assert.equal(actual.continuity.revision, 1);
});

await runCase("memories-storage/active-preparation", async () => {
  const f = fixture();
  await seed(f);
  const waiting = Promise.withResolvers<void>(),
    gate = Promise.withResolvers<void>();
  let blocked = false;
  f.hook(async (event, id) => {
    if (
      event === "after-create" &&
      id.startsWith("villages-memory-") &&
      !id.startsWith("villages-memory-intent-") &&
      !blocked
    ) {
      blocked = true;
      waiting.resolve();
      await gate.promise;
    }
  });
  const writing = f.repository.mutateAuthority(
    (state) => {
      state.continuity = { ...state.continuity, revision: state.continuity.revision + 1 };
    },
    { memories: true },
  );
  await waiting.promise;
  await f.external.mutateAuthority((state) => {
    state.name = "Concurrent world update";
  });
  gate.resolve();
  await writing;
  const actual = await f.repository.readAuthority({ memories: true });
  assert.equal(actual.name, "Concurrent world update");
  assert.equal(actual.continuity.revision, 2);
  assert.equal(f.intents().length, 0);
  assert(f.records.has(f.root().data.memoryHead.id));
});

await runCase("memories-storage/reset", async () => {
  const f = fixture();
  await seed(f);
  await assert.rejects(
    f.repository.mutateAuthority((state) => {
      state.seed = "new-world";
    }),
    /reset requires Memories/,
  );
  await f.repository.mutateAuthority(
    (state) => {
      Object.assign(state, defaultVillageState(), { seed: "new-world" });
    },
    { memories: true },
  );
  assert.equal(f.root().data.memoryHead, null);
  assert(f.payloads().length > 0, "superseded immutable history awaits owner-aware collection");
  assert.equal((await f.repository.readAuthority({ memories: true })).continuity.records.length, 0);
});

await runCase("memories-storage/malformed", async () => {
  const f = fixture();
  await seed(f);
  await f.repository.readAuthority({ memories: true });
  f.root().data.memoryHead.revision++;
  await assert.rejects(f.repository.readAuthority({ memories: true }), /history revision changed/);
  await assert.rejects(f.restart().readAuthority({ memories: true }), /history revision changed/);
  f.root().data.memoryHead.revision--;
  const payload = f.payloads()[0];
  payload.data.payload += " ";
  await assert.rejects(f.repository.readAuthority({ memories: true }), /payload changed/);
  f.records.delete(payload.id);
  await assert.rejects(f.repository.readAuthority({ memories: true }), /payload is missing/);
  f.root().data.version = 4;
  await assert.rejects(f.repository.readAuthority(), /Unsupported Village format/);
});

await runCase("memories-storage/late-payload", async () => {
  for (const crash of [false, true]) {
    const f = fixture();
    await seed(f);
    const waiting = Promise.withResolvers<void>(),
      gate = Promise.withResolvers<void>();
    let paused = false,
      crashed = false;
    f.hook(async (event, id) => {
      if (event === "after-create" && id.startsWith("villages-memory-intent-") && !paused) {
        paused = true;
        waiting.resolve();
        await gate.promise;
      } else if (crash && paused && !crashed && event === "after-create" && !id.startsWith("villages-memory-intent-")) {
        crashed = true;
        throw Error("crash after late payload");
      }
    });
    const writing = f.repository.mutateAuthority(
      (state) => {
        state.continuity = { ...state.continuity, revision: state.continuity.revision + 1 };
      },
      { memories: true },
    );
    const settled = writing.then(
      () => null,
      (error) => error,
    );
    await waiting.promise;
    await f.external.mutateAuthority((state) => {
      state.name = "Fenced before payload creation";
    });
    assert.equal(f.intents().length, 1);
    gate.resolve();
    const error = await settled;
    if (crash) assert.match(error.message, /crash after late payload/);
    else assert.equal(error, null);
    f.hook(() => {});
    await f.repository.mutateAuthority((state) => {
      state.setting = "Settle retained preparation";
    });
    assert(f.records.has(f.root().data.memoryHead.id));
    assert.equal(f.intents().length, 0);
    assert.equal((await f.repository.readAuthority({ memories: true })).continuity.revision, crash ? 1 : 2);
  }
});

await runCase("memories-storage/page-restart", async () => {
  const f = fixture();
  await seed(f, 150);
  const before = await f.repository.readAuthority({ memories: true });
  assert.throws(() => {
    before.continuity.versions[0].text = "Aliased mutation";
  }, TypeError);
  assert.throws(() => before.continuity.records.pop(), TypeError);
  before.continuity = { ...before.continuity, records: before.continuity.records.slice(0, -1) };
  assert.equal((await f.repository.readAuthority({ memories: true })).continuity.records.length, 150);
  for (const phase of ["before-create", "after-create"]) {
    let failed = false;
    f.hook((event, id) => {
      if (!failed && event === phase && id.startsWith("villages-memory-page-")) {
        failed = true;
        throw Error("page interruption");
      }
    });
    await assert.rejects(f.repository.mutateAuthority(forgetFirst, { memories: true }), /page interruption/);
    assert(failed);
    f.hook(() => {});
    assert.equal(forgotten(await f.restart().readAuthority({ memories: true })), undefined);
  }
  await f.repository.mutateAuthority(forgetFirst, { memories: true });
  assert(forgotten(await f.restart().readAuthority({ memories: true })));
});

await runCase("memories-storage/simulation", async () => {
  const f = fixture();
  await seed(f, 150);
  const gate = createRepairGate(f.store),
    repository = createVillageRepository(() => gate.documents);
  const { transaction } = await gate.simulate(async () => repository.mutateAuthority(forgetFirst, { memories: true }));
  const pages = transaction.writes.filter((w) => w.after?.kind === "memory-page");
  assert(pages.length);
  assert(
    pages.every((w) => !f.records.has(w.after!.id)),
    "overlay pages are never durable cache entries",
  );
  assert.equal(forgotten(await repository.readAuthority({ memories: true })), undefined);
  await repository.mutateAuthority(forgetFirst, { memories: true });
  assert(forgotten(await f.restart().readAuthority({ memories: true })));
});

await runCase("memories-storage/missing-page", async () => {
  const f = fixture();
  await seed(f);
  const page = [...f.records.values()].find((r) => r.kind === "memory-page");
  f.records.delete(page.id);
  await assert.rejects(f.restart().readAuthority({ memories: true }), /history page is missing/);
  assert.equal(f.root().data.version, 18);
  f.root().data.version = 7;
  await assert.rejects(f.restart().readAuthority(), /Unsupported Village format/);
});

await runCase("memories-storage/large-exact-entry", async () => {
  const f = fixture();
  await seed(f);
  const contents = Array.from({ length: 24 }, (_, i) => ('Exact café 🌻 "\\\n' + "a".repeat(111)).repeat(12) + i);
  await f.repository.mutateAuthority(
    (state) => {
      state.episodes = appendEpisode(state.episodes, proseEpisode(state, "unicode", contents), state.seed);
    },
    { memories: true },
  );
  const restored = await f.restart().readAuthority({ memories: true });
  assert.deepEqual(
    restored.episodes.records.at(-1)!.segments.map((line) => line.content),
    contents,
  );
  assert(
    [...f.records.values()]
      .filter((r) => r.kind === "memory-page")
      .every((r) => Buffer.byteLength(JSON.stringify(r.data)) <= MEMORY_PAGE_BYTES),
  );
});

await runCase("memories-storage/opaque-gallery-boundary", async () => {
  const f = fixture();
  await seed(f);
  const marker = "global-gallery:quoted-image";
  let exact: AcceptedEpisode;
  await f.repository.mutateAuthority(
    (state) => {
      exact = proseEpisode(state, "opaque", [...Array.from({ length: 17 }, () => "x"), marker]);
      let remaining = 32768 - JSON.stringify([[exact.id, exact]]).indexOf(marker);
      assert(remaining > 0 && remaining <= 17 * 1999);
      for (const line of exact.segments.slice(0, -1)) {
        const added = Math.min(remaining, 1999);
        line.content += "x".repeat(added);
        remaining -= added;
      }
      assert.equal(remaining, 0);
      assert.equal(JSON.stringify([[exact.id, exact]]).indexOf(marker), 32768);
      state.episodes = appendEpisode(state.episodes, exact, state.seed);
    },
    { memories: true },
  );
  assert(
    [...f.records.values()].some((r) => r.data.node?.text?.startsWith("memory:global-gallery:")),
    "the common Episode encoder hits the prefix-sensitive chunk boundary",
  );
  for (const page of f.records.values())
    if (page.kind === "memory-page") {
      const pending: unknown[] = [page.data];
      let scanned = 0;
      while (pending.length) {
        const value = pending.pop();
        scanned++;
        if (typeof value === "string") assert.equal(value.startsWith("global-gallery:"), false);
        else if (value && typeof value === "object") pending.push(...Object.values(value));
      }
      assert(scanned < 256);
    }
  assert.deepEqual(
    (await f.restart().readAuthority({ memories: true })).episodes.records.at(-1)!.segments,
    exact!.segments,
  );
});

await runCase("memories-storage/world-namespace", async () => {
  const f = fixture(),
    initial = await seed(f, 150),
    oldHead = structuredClone(f.root().data.memoryHead);
  await assert.rejects(
    f.repository.mutateAuthority(
      (state) => {
        state.seed = "different-seed";
      },
      { memories: true },
    ),
    /another world|belongs|seed/,
  );
  assert.deepEqual(f.root().data.memoryHead, oldHead, "retained Episodes cannot be rehomed to another seed");
  await f.repository.mutateAuthority(
    (state) => {
      state.setupAt = "2026-11-10T12:00:00.000Z";
    },
    { memories: true },
  );
  assert.notEqual(f.root().data.memoryHead.id, oldHead.id);
  const warm = await f.repository.readAuthority({ memories: true }),
    cold = await f.restart().readAuthority({ memories: true });
  assert.deepEqual(cold, warm);
  assert.deepEqual(cold.continuity, initial.continuity);
  assert.deepEqual(cold.episodes, initial.episodes);
});
