// Test cases: memories-storage/1000, memories-storage/10000, memories-storage/25000, memories-storage/hydrated-relationships, memories-storage/conflict, memories-storage/malformed, memories-storage/interruptions, memories-storage/reader-retention, memories-storage/reset, memories-storage/active-preparation, memories-storage/late-payload, memories-storage/page-restart, memories-storage/simulation, memories-storage/missing-page, memories-storage/large-exact-entry, memories-storage/opaque-gallery-boundary, memories-storage/world-namespace
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { defaultRelationshipState } from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { captureReturnContext } from "../packages/villages/src/server/domain/rules/return-catchup-capture.js";
import { createRepairGate } from "../packages/villages/src/server/adapters/storage/repair-gate.js";
import { MEMORY_PAGE_BYTES } from "../packages/villages/src/server/adapters/storage/memory-pages.js";
import {
  reserveMemoryScene,
  forgetVillageMemory,
  sceneMemories,
} from "../packages/villages/src/server/domain/rules/village-memories.js";
import {
  realisticMemoryHistory,
  realisticMemoryReceipts,
  memoryRepair,
  memoryTime,
} from "./helpers/memories-fixture.js";
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
  const s = defaultVillageState();
  s.seed = "storage-scale";
  s.setupAt = memoryTime();
  s.memories = realisticMemoryHistory(count);
  s.memoryReceipts = realisticMemoryReceipts(s.memories);
  s.exchangeReceipts.physical = {
    id: "physical",
    domain: "physical",
    sceneId: "scene",
    submissionId: "turn",
    at: memoryTime(),
    evidenceIds: [],
    reason: "global-gallery:physical-owner",
    committedAt: memoryTime(),
    status: "applied",
  };
  reserveMemoryScene(s, "frozen", memoryTime());
  await f.repository.mutateAuthority(
    (n) => {
      Object.assign(n, s);
    },
    { memories: true },
  );
  return s;
}
for (const count of [1000, 10000, 25000])
  await runCase("memories-storage/" + count, async () => {
    const f = fixture(),
      initial = await seed(f, count),
      root = f.root();
    assert.ok(Buffer.byteLength(JSON.stringify(root.data)) < 10000, "World storage stays small as history grows.");
    for (const field of ["memories", "memoryScenes", "memoryReceipts"])
      assert.equal(Object.hasOwn(root.data, field), false);
    assert.equal(root.data.exchangeReceipts.physical.reason, "global-gallery:physical-owner");
    const head = root.data.memoryHead.id;
    f.reads.length = 0;
    f.resetIo();
    const ordinary = await f.repository.readAuthority();
    for (const field of ["memories", "memoryScenes", "memoryReceipts"] as const)
      assert.throws(() => ordinary[field], /not loaded/);
    await f.repository.mutateAuthority((s) => {
      s.name = "Current world";
    });
    assert.equal(f.root().data.memoryHead.id, head);
    assert.ok(
      f.reads.every((id) => !id.startsWith("villages-memory-")),
      "Routine reads and writes do not load history.",
    );
    const ordinaryIo = { ...f.io };
    assert.ok(ordinaryIo.readBytes < 50_000, "Ordinary boundary reads stay independent of retained Memory bytes.");
    assert.ok(ordinaryIo.writeBytes < 15_000, "Ordinary boundary writes do not contain Memory history.");
    const restored = await f.repository.readAuthority({ memories: true });
    assert.deepEqual(restored.memories, initial.memories);
    assert.deepEqual(restored.memoryScenes, initial.memoryScenes);
    assert.deepEqual(restored.memoryReceipts, initial.memoryReceipts);
    assert.equal(restored.name, "Current world");
    assert.ok(f.records.has(f.root().data.memoryHead.id));
    assert.equal(f.intents().length, 0);
    const values: unknown[] = [f.payloads()[0].data];
    let scanned = 0;
    while (values.length) {
      const v = values.pop();
      scanned++;
      if (v && typeof v === "object") values.push(...Object.values(v));
    }
    assert.ok(scanned < 20, "Opaque prose fits the host reference scanner.");
    console.log(
      JSON.stringify({
        count,
        rootBytes: Buffer.byteLength(JSON.stringify(root.data)),
        payloadBytes: Buffer.byteLength(f.payloads()[0].data.payload),
        ordinaryIo,
      }),
    );
    // Measure a real history-aware mutation after the activation has decoded this head.
    // Count serialized bytes as well as physical I/O; no machine-dependent duration gate.
    f.resetIo();
    let serializedBytes = 0;
    const stringify = JSON.stringify;
    JSON.stringify = ((...args: any[]) => {
      const result = Reflect.apply(stringify, JSON, args);
      if (typeof result === "string") serializedBytes += Buffer.byteLength(result);
      return result;
    }) as typeof JSON.stringify;
    try {
      await f.repository.mutateAuthority(
        (state) => {
          forgetVillageMemory(state, memoryRepair(state.memories, "forget", ["player"]), memoryTime(20));
        },
        { memories: true },
      );
    } finally {
      JSON.stringify = stringify;
    }
    const mutationIo = { ...f.io };
    assert.ok(mutationIo.readBytes < 500_000, "Warm Memory writes do not read the complete history.");
    assert.ok(mutationIo.writeBytes < 500_000, "Warm Memory writes replace bounded blocks and directory paths.");
    assert.ok(serializedBytes < 2_000_000, "Validation and publication do not serialize unchanged history bodies.");
    assert.ok(
      [...f.records.values()]
        .filter((r) => r.kind === "memory-page")
        .every((r) => Buffer.byteLength(JSON.stringify(r.data)) <= MEMORY_PAGE_BYTES),
    );
    const restarted = await f.restart().readAuthority({ memories: true });
    assert.ok(restarted.memories.records[0].knowers.player.forgotten);
    assert.equal(sceneMemories(restarted, "frozen").records[0].knowers.player.forgotten, undefined);
    console.log(
      JSON.stringify({
        count,
        mutationIo,
        serializedBytes,
        retainedBytes: [...f.records.values()].reduce((sum, r) => sum + Buffer.byteLength(JSON.stringify(r)), 0),
      }),
    );
  });
await runCase("memories-storage/hydrated-relationships", async () => {
  const f = fixture();
  await seed(f);
  const social = defaultRelationshipState("storage-scale");
  for (let i = 0; i < 10000; i++) social.disclosureReceipts["historical-disclosure-" + i] = true;
  const before = JSON.stringify(social);
  await f.repository.mutateAuthority((state) => {
    state.relationshipContext = social;
    state.name = "Direct authority write";
  });
  assert.equal(Object.hasOwn(f.root().data, "relationshipContext"), false);
  assert.equal(JSON.stringify(social), before, "Serialization cannot mutate the relationship authority.");
  assert.ok(Buffer.byteLength(JSON.stringify(f.root().data)) < 10000);
  // Captured relationships are meaningful frozen facts, not redundant top-level hydration.
  await f.repository.mutateAuthority(
    (state) => {
      state.relationshipContext = defaultRelationshipState(state.seed);
      state.returnCatchup = { capture: captureReturnContext(state, new Date(memoryTime())) };
    },
    { memories: true },
  );
  const restored = await f.repository.readAuthority({ memories: true });
  assert.deepEqual(restored.returnCatchup!.capture!.world.relationshipContext, defaultRelationshipState(restored.seed));
});
await runCase("memories-storage/conflict", async () => {
  const f = fixture(),
    initial = await seed(f);
  let conflicts = 0;
  f.hook((event, id) => {
    if (event === "before-update" && id === "villages-village" && !conflicts++) {
      f.root().revision++;
      f.root().data.name = "Concurrent name";
    }
  });
  await f.repository.mutateAuthority(
    (s) => {
      forgetVillageMemory(s, memoryRepair(s.memories, "forget", ["player"]), memoryTime(20));
    },
    { memories: true },
  );
  const actual = await f.repository.readAuthority({ memories: true });
  assert.equal(actual.name, "Concurrent name");
  assert.ok(actual.memories.records[0].knowers.player.forgotten);
  assert.equal(sceneMemories(actual, "frozen").records[0].knowers.player.forgotten, undefined);
  assert.equal(sceneMemories(actual, "frozen").records[0].text, initial.memories.records[0].text);
  assert.ok(f.records.has(f.root().data.memoryHead.id));
  assert.equal(f.intents().length, 0);
  const head = f.root().data.memoryHead.id,
    revision = actual.memories.revision;
  await f.repository.mutateAuthority(
    (s) => {
      reserveMemoryScene(s, "second", memoryTime(30));
    },
    { memories: true },
  );
  assert.notEqual(f.root().data.memoryHead.id, head, "Snapshot-only changes publish.");
  assert.equal(f.root().data.memoryHead.revision, revision);
  const second = f.root().data.memoryHead.id;
  await f.repository.mutateAuthority(
    (s) => {
      delete s.memoryReceipts[Object.keys(s.memoryReceipts)[0]];
    },
    { memories: true },
  );
  assert.notEqual(f.root().data.memoryHead.id, second, "Receipt-only changes publish.");
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
      (s) => {
        s.name = "Published";
        s.memories.revision++;
      },
      { memories: true },
    );
    const committed = ["after-publication", "intent-cleanup"].includes(failure);
    if (["intent-cleanup"].includes(failure)) await change;
    else await assert.rejects(change, /simulated interruption/);
    assert.ok(failed);
    const actual = await f.repository.readAuthority({ memories: true });
    assert.equal(actual.name, committed ? "Published" : defaultVillageState().name);
    assert.equal(actual.memories.revision, committed ? 2 : 1);
    assert.ok(f.intents().length > 0);
    f.hook(() => {});
    await f.repository.mutateAuthority((s) => {
      s.setting = "Fenced later revision";
    });
    assert.ok(f.records.has(f.root().data.memoryHead.id));
    assert.equal(f.intents().length, 0);
    assert.equal((await f.repository.readAuthority({ memories: true })).memories.revision, committed ? 2 : 1);
  }
});
await runCase("memories-storage/reader-retention", async () => {
  const f = fixture();
  await seed(f);
  const old = f.root().data.memoryHead.id;
  let release!: () => void, entered!: () => void;
  const gate = new Promise<void>((r) => {
      release = r;
    }),
    waiting = new Promise<void>((r) => {
      entered = r;
    });
  let blocked = false;
  f.hook(async (event, id) => {
    if (event === "before-read" && id === old && !blocked) {
      blocked = true;
      entered();
      await gate;
    }
  });
  const reading = f.repository.readAuthority({ memories: true });
  await waiting;
  await f.repository.mutateAuthority(
    (s) => {
      s.name = "New root";
      s.memories.revision++;
    },
    { memories: true },
  );
  assert.equal(f.records.has(old), true);
  release();
  const actual = await reading;
  assert.equal(actual.name, defaultVillageState().name);
  assert.equal(actual.memories.revision, 1);
});
await runCase("memories-storage/active-preparation", async () => {
  const f = fixture();
  await seed(f);
  let entered!: () => void, release!: () => void;
  const waiting = new Promise<void>((r) => {
      entered = r;
    }),
    gate = new Promise<void>((r) => {
      release = r;
    });
  let blocked = false;
  f.hook(async (event, id) => {
    if (
      event === "after-create" &&
      id.startsWith("villages-memory-") &&
      !id.startsWith("villages-memory-intent-") &&
      !blocked
    ) {
      blocked = true;
      entered();
      await gate;
    }
  });
  const writing = f.repository.mutateAuthority(
    (s) => {
      s.memories.revision++;
    },
    { memories: true },
  );
  await waiting;
  await f.external.mutateAuthority((s) => {
    s.name = "Concurrent world update";
  });
  release();
  await writing;
  const actual = await f.repository.readAuthority({ memories: true });
  assert.equal(actual.name, "Concurrent world update");
  assert.equal(actual.memories.revision, 2);
  assert.equal(f.intents().length, 0);
  assert.ok(f.records.has(f.root().data.memoryHead.id));
});
await runCase("memories-storage/reset", async () => {
  const f = fixture();
  await seed(f);
  await assert.rejects(
    f.repository.mutateAuthority((s) => {
      s.seed = "new-world";
    }),
    /reset requires Memories/,
  );
  await f.repository.mutateAuthority(
    (s) => {
      Object.assign(s, defaultVillageState(), { seed: "new-world" });
    },
    { memories: true },
  );
  assert.equal(f.root().data.memoryHead, null);
  assert.ok(f.payloads().length > 0, "Published history awaits owner-aware collection.");
  assert.equal((await f.repository.readAuthority({ memories: true })).memories.records.length, 0);
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
    let entered!: () => void, release!: () => void;
    const waiting = new Promise<void>((r) => {
        entered = r;
      }),
      gate = new Promise<void>((r) => {
        release = r;
      });
    let paused = false,
      crashed = false;
    f.hook(async (event, id) => {
      if (event === "after-create" && id.startsWith("villages-memory-intent-") && !paused) {
        paused = true;
        entered();
        await gate;
      } else if (crash && paused && !crashed && event === "after-create" && !id.startsWith("villages-memory-intent-")) {
        crashed = true;
        throw Error("crash after late payload");
      }
    });
    const writing = f.repository.mutateAuthority(
      (state) => {
        state.memories.revision++;
      },
      { memories: true },
    );
    const settled = writing.then(
      () => null,
      (error) => error,
    );
    await waiting;
    await f.external.mutateAuthority((state) => {
      state.name = "Fenced before payload creation";
    });
    assert.equal(f.intents().length, 1, "A preparing intent survives until its absent payload is created.");
    release();
    const error = await settled;
    if (crash) assert.match(error.message, /crash after late payload/);
    else assert.equal(error, null);
    f.hook(() => {});
    await f.repository.mutateAuthority((state) => {
      state.setting = "Settle retained preparation";
    });
    assert.ok(f.records.has(f.root().data.memoryHead.id));
    assert.equal(f.intents().length, 0);
    assert.equal((await f.repository.readAuthority({ memories: true })).memories.revision, crash ? 1 : 2);
  }
});

await runCase("memories-storage/page-restart", async () => {
  const f = fixture();
  await seed(f, 150);
  const before = await f.repository.readAuthority({ memories: true });
  assert.throws(() => {
    before.memories.records[0].text = "Aliased mutation";
  }, TypeError);
  before.memories.records.pop();
  assert.equal(
    (await f.repository.readAuthority({ memories: true })).memories.records.length,
    150,
    "Caller containers cannot mutate the activation’s immutable decoded cache.",
  );
  for (const phase of ["before-create", "after-create"]) {
    let failed = false;
    f.hook((event, id) => {
      if (!failed && event === phase && id.startsWith("villages-memory-page-")) {
        failed = true;
        throw Error("page interruption");
      }
    });
    await assert.rejects(
      f.repository.mutateAuthority(
        (state) => {
          forgetVillageMemory(state, memoryRepair(state.memories, "forget", ["player"]), memoryTime(20));
        },
        { memories: true },
      ),
      /page interruption/,
    );
    f.hook(() => {});
    assert.equal(
      (await f.restart().readAuthority({ memories: true })).memories.records[0].knowers.player.forgotten,
      undefined,
    );
  }
  await f.repository.mutateAuthority(
    (state) => {
      forgetVillageMemory(state, memoryRepair(state.memories, "forget", ["player"]), memoryTime(20));
    },
    { memories: true },
  );
  assert.ok((await f.restart().readAuthority({ memories: true })).memories.records[0].knowers.player.forgotten);
});
await runCase("memories-storage/simulation", async () => {
  const f = fixture();
  await seed(f, 150);
  const gate = createRepairGate(f.store),
    repository = createVillageRepository(() => gate.documents);
  const { transaction } = await gate.simulate(async () =>
    repository.mutateAuthority(
      (state) => {
        forgetVillageMemory(state, memoryRepair(state.memories, "forget", ["player"]), memoryTime(20));
      },
      { memories: true },
    ),
  );
  const pages = transaction.writes.filter((w) => w.after?.kind === "memory-page");
  assert.ok(pages.length);
  assert.ok(
    pages.every((w) => !f.records.has(w.after!.id)),
    "Simulation pages are never durable cache entries.",
  );
  assert.equal(
    (await repository.readAuthority({ memories: true })).memories.records[0].knowers.player.forgotten,
    undefined,
  );
  await repository.mutateAuthority(
    (state) => {
      forgetVillageMemory(state, memoryRepair(state.memories, "forget", ["player"]), memoryTime(20));
    },
    { memories: true },
  );
  assert.ok((await f.restart().readAuthority({ memories: true })).memories.records[0].knowers.player.forgotten);
});
await runCase("memories-storage/missing-page", async () => {
  const f = fixture();
  await seed(f);
  const page = [...f.records.values()].find((r) => r.kind === "memory-page");
  f.records.delete(page.id);
  await assert.rejects(f.restart().readAuthority({ memories: true }), /history page is missing/);
  assert.equal(f.root().data.version, 8, "Unreadable committed data is retained without reset or conversion.");
  f.root().data.version = 7;
  await assert.rejects(f.restart().readAuthority(), /Unsupported Village format/);
});
await runCase("memories-storage/large-exact-entry", async () => {
  const f = fixture();
  await seed(f);
  const exact = ('Exact evidence: 🌻 "\\\n' + "a".repeat(127)).repeat(10000);
  await f.repository.mutateAuthority(
    (state) => {
      state.memoryReceipts.large = { id: "large", domain: "memories", reason: exact } as any;
    },
    { memories: true },
  );
  const restored = await f.restart().readAuthority({ memories: true });
  assert.equal(
    restored.memoryReceipts.large.reason,
    exact,
    "Large exact evidence survives chunk and surrogate boundaries.",
  );
  assert.ok(
    [...f.records.values()]
      .filter((r) => r.kind === "memory-page")
      .every((r) => Buffer.byteLength(JSON.stringify(r.data)) <= MEMORY_PAGE_BYTES),
  );
});
await runCase("memories-storage/opaque-gallery-boundary", async () => {
  const f = fixture();
  await seed(f);
  const prefix = '[["quoted",{"id":"quoted","domain":"memories","reason":"';
  const reason = "x".repeat(32768 - prefix.length) + "global-gallery:quoted-image";
  await f.repository.mutateAuthority(
    (state) => {
      state.memoryReceipts = { quoted: { id: "quoted", domain: "memories", reason } as any };
    },
    { memories: true },
  );
  assert.ok(
    [...f.records.values()].some((r) => r.data.node?.text?.startsWith("memory:global-gallery:")),
    "The deliberate chunk boundary must exercise the Engine's prefix-sensitive reference scanner.",
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
      assert.ok(scanned < 256, "Every individual page fits the Engine's reference scanner.");
    }
  assert.equal((await f.restart().readAuthority({ memories: true })).memoryReceipts.quoted.reason, reason);
});
await runCase("memories-storage/world-namespace", async () => {
  for (const key of ["seed", "setupAt"] as const) {
    const f = fixture(),
      initial = await seed(f, 150);
    const oldHead = f.root().data.memoryHead;
    await f.repository.mutateAuthority(
      (state) => {
        state[key] = key === "seed" ? "different-seed" : memoryTime(50);
      },
      { memories: true },
    );
    assert.notEqual(f.root().data.memoryHead.id, oldHead.id);
    const warm = await f.repository.readAuthority({ memories: true });
    const cold = await f.restart().readAuthority({ memories: true });
    assert.deepEqual(cold, warm, "Setup restamping cannot publish references in a previous world namespace.");
    assert.deepEqual(cold.memories, initial.memories);
    assert.deepEqual(cold.memoryScenes, initial.memoryScenes);
    assert.deepEqual(cold.memoryReceipts, initial.memoryReceipts);
  }
});
