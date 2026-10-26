// Test cases: memories-storage/1000, memories-storage/10000, memories-storage/25000, memories-storage/conflict, memories-storage/malformed, memories-storage/interruptions, memories-storage/reader-retirement, memories-storage/reset, memories-storage/active-preparation, memories-storage/late-payload
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
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
  let hook: (event: string, id: string) => void | Promise<void> = () => {};
  const clone = (v: any) => (v === undefined ? null : structuredClone(v));
  const store: any = {
    async getById(_pkg: string, id: string) {
      reads.push(id);
      await hook("before-read", id);
      return clone(records.get(id));
    },
    async list(_pkg: string, kind: string) {
      return [...records.values()].filter((r) => r.kind === kind).map(clone);
    },
    async create(input: any) {
      await hook("before-create", input.id);
      assert.ok(!records.has(input.id));
      const r = { ...clone(input), revision: 1 };
      records.set(r.id, r);
      await hook("after-create", r.id);
      return clone(r);
    },
    async update(input: any) {
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
    warnings,
    repository,
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
    const restored = await f.repository.readAuthority({ memories: true });
    assert.deepEqual(restored.memories, initial.memories);
    assert.deepEqual(restored.memoryScenes, initial.memoryScenes);
    assert.deepEqual(restored.memoryReceipts, initial.memoryReceipts);
    assert.equal(restored.name, "Current world");
    assert.equal(f.payloads().length, 1);
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
      }),
    );
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
  assert.equal(f.payloads().length, 1);
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
  for (const failure of ["intent", "payload", "before-publication", "after-publication", "retire", "intent-cleanup"]) {
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
                : failure === "retire"
                  ? event === "before-remove" && !id.startsWith("villages-memory-intent-")
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
    const committed = ["after-publication", "retire", "intent-cleanup"].includes(failure);
    if (["retire", "intent-cleanup"].includes(failure)) await change;
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
    assert.equal(f.payloads().length, 1);
    assert.equal(f.intents().length, 0);
    assert.equal((await f.repository.readAuthority({ memories: true })).memories.revision, committed ? 2 : 1);
  }
});
await runCase("memories-storage/reader-retirement", async () => {
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
  assert.equal(f.records.has(old), false);
  release();
  const actual = await reading;
  assert.equal(actual.name, "New root");
  assert.equal(actual.memories.revision, 2);
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
  await f.repository.mutateAuthority((s) => {
    s.name = "Concurrent world update";
  });
  release();
  await writing;
  const actual = await f.repository.readAuthority({ memories: true });
  assert.equal(actual.name, "Concurrent world update");
  assert.equal(actual.memories.revision, 2);
  assert.equal(f.intents().length, 0);
  assert.equal(f.payloads().length, 1);
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
  assert.equal(f.payloads().length, 0);
  assert.equal((await f.repository.readAuthority({ memories: true })).memories.records.length, 0);
});
await runCase("memories-storage/malformed", async () => {
  const f = fixture();
  await seed(f);
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
    await f.repository.mutateAuthority((state) => {
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
    assert.equal(f.payloads().length, 1);
    assert.equal(f.intents().length, 0);
    assert.equal((await f.repository.readAuthority({ memories: true })).memories.revision, crash ? 1 : 2);
  }
});
