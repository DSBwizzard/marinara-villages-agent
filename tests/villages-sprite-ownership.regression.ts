import assert from "node:assert/strict";
import { PNG } from "pngjs";
import {
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageSnapshot } from "../packages/villages/src/server/domain/models/world.js";
import { createSpriteWrites } from "../packages/villages/src/server/features/media/sprite-writes.js";
import { createSpriteImageDecoder } from "../packages/villages/src/server/features/media/sprite-image-codec.js";
import {
  createSpriteManager,
  type SpriteManagerPorts,
} from "../packages/villages/src/server/features/media/sprite-manager-service.js";
import {
  configureSpriteManager,
  importSpriteArtwork,
  adoptSpriteArtwork,
  readSpriteManager,
  decodeSpriteImage,
} from "../packages/villages/src/server/features/media/sprite-manager.js";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
const source = new PNG({ width: 16, height: 24 });
for (let y = 4; y < 20; y++) for (let x = 4; x < 12; x++) source.data.set([120, 50, 90, 255], (y * 16 + x) * 4);
const image = "data:image/png;base64," + PNG.sync.write(source).toString("base64");
const village = (name: string) =>
  coerceVillageState({
    name,
    foundedAt: new Date().toISOString(),
    wishSystemVersion: 3,
    visitMemoryBackfilled: true,
    villagers: [
      {
        characterId: "same",
        addedAt: "2026-10-07T00:00:00.000Z",
        cardSnapshot: {
          id: "same",
          name,
          revision: 1,
          capturedAt: "2026-10-07T00:00:00.000Z",
          sourceStatus: "available",
        },
      },
    ],
  });
function fixture(name: string) {
  let state = village(name);
  const events: string[] = [],
    gate = deferred(),
    entered = deferred();
  let pause = false;
  const ports: SpriteManagerPorts = {
    async readVillageState() {
      events.push("read:" + name);
      if (pause) {
        pause = false;
        entered.resolve();
        await gate.promise;
      }
      return structuredClone(state);
    },
    async mutateVillageState(update) {
      events.push("mutate:" + name);
      const next = structuredClone(state);
      update(next);
      state = next;
      return structuredClone(state);
    },
    async buildVillageSnapshot() {
      events.push("snapshot:" + name);
      return { village: { name } } as VillageSnapshot;
    },
    decodeSpriteImage: createSpriteImageDecoder(async () => {
      events.push("inspect:" + name);
      return { width: 16, height: 24 };
    }),
    async villageEngineJson<T>(_path, init) {
      events.push("save:" + name);
      return { filename: (init!.body as { expression: string }).expression + ".png" } as T;
    },
    async readSpriteFile() {
      throw new Error("No file read expected");
    },
    async deleteVillageSpriteFile() {
      events.push("delete:" + name);
    },
    villagesLogger: () => ({
      warn() {
        events.push("warn:" + name);
      },
    }),
    writes: createSpriteWrites(),
  };
  const service = createSpriteManager(ports);
  assert.deepEqual(events, [], "construction is inert");
  return {
    service,
    events,
    gate,
    entered,
    pause() {
      pause = true;
    },
    get state() {
      return state;
    },
  };
}

// Queue cleanup from A must not remove the newer B/C admission, including after failure.
const queue = createSpriteWrites(),
  other = createSpriteWrites();
const firstGate = deferred(),
  secondGate = deferred(),
  firstEntered = deferred(),
  secondEntered = deferred();
const order: string[] = [];
const first = queue.serialize("same", async () => {
  firstEntered.resolve();
  await firstGate.promise;
  throw new Error("A failed");
});
const firstFailure = assert.rejects(first, /A failed/);
await firstEntered.promise;
const second = queue.serialize("same", async () => {
  order.push("B");
  secondEntered.resolve();
  await secondGate.promise;
  return "B";
});
assert.equal(await other.serialize("same", async () => "independent"), "independent");
firstGate.resolve();
await firstFailure;
await secondEntered.promise;
const third = queue.serialize("same", async () => {
  order.push("C");
  return "C";
});
await Promise.resolve();
assert.deepEqual(order, ["B"]);
secondGate.resolve();
assert.deepEqual(await Promise.all([second, third]), ["B", "C"]);
assert.equal(await queue.serialize("same", async () => "next"), "next");

// Actual commands with identical resident IDs have separate queues and connections.
const a = fixture("A"),
  b = fixture("B");
a.pause();
const aImport = a.service.importSpriteArtwork("same", { images: [{ name: "A artwork", image }] });
await a.entered.promise;
const bImport = await b.service.importSpriteArtwork("same", { images: [{ name: "B artwork", image }] });
assert.equal(bImport.manager.artwork[0]!.name, "B artwork");
assert.equal(a.state.villagers[0]!.spriteManager?.artwork.length ?? 0, 0);
a.gate.resolve();
assert.equal((await aImport).manager.artwork[0]!.name, "A artwork");

// A façade captures its owner before the queued read, even when the default changes.
const ownerA = createActivationScope(),
  ownerB = createActivationScope();
const delayed = fixture("delayed A"),
  current = fixture("current B");
const releaseA = ownerA.run(() => configureSpriteManager(delayed.service));
const releaseB = ownerB.run(() => configureSpriteManager(current.service));
const clearA = installDefaultActivation(ownerA, () => {});
delayed.pause();
const pending = importSpriteArtwork("same", { images: [{ name: "owned artwork", image }] });
await delayed.entered.promise;
const clearB = installDefaultActivation(ownerB, () => {});
delayed.gate.resolve();
assert.equal((await pending).snapshot.village.name, "delayed A");
assert(delayed.events.every((event) => event.endsWith("delayed A")));
assert.deepEqual(current.events, []);
ownerA.run(releaseA);
clearA();
ownerA.dispose();
assert.equal((await readSpriteManager("same")).artwork.length, 0);
assert.equal((await decodeSpriteImage(image)).width, 16);
const missing = createActivationScope();
await assert.rejects(
  missing.run(() => readSpriteManager("same")),
  /not configured/,
);
ownerB.run(releaseB);
ownerB.dispose();
clearB();
await assert.rejects(
  ownerB.run(() => decodeSpriteImage(image)),
  /not configured/,
);

function documents(name: string) {
  const rows = new Map<string, any>([
    ["villages-village", { id: "villages-village", data: village(name), revision: 1 }],
  ]);
  const api = {
    async getById(_pkg: string, id: string) {
      return structuredClone(rows.get(id) ?? null);
    },
    async list() {
      return [];
    },
    async create(input: any) {
      const row = { ...structuredClone(input), revision: 1 };
      rows.set(input.id, row);
      return row;
    },
    async update(input: any) {
      const prior = rows.get(input.id);
      if (prior?.revision !== input.expectedRevision) return null;
      const next = { ...prior, ...structuredClone(input), revision: prior.revision + 1 };
      rows.set(input.id, next);
      return structuredClone(next);
    },
  };
  return { api, rows };
}

// Entry assembly shares admission for raw document identity and explicit identity
// across distinct facades. Transport/storage are provider-free test doubles.
const originalFetch = globalThis.fetch;
try {
  for (const explicit of [false, true]) {
    const store = documents("shared"),
      identity = {};
    const one = createActivationScope(),
      two = createActivationScope();
    const host = (api: object) =>
      ({
        persistence: { documents: api },
        resources: { listCharacters: async () => [] },
        logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
        isDebugAgentsEnabled: () => false,
      }) as any;
    const releaseOne = one.run(() => configureVillagesRuntime(host(store.api), explicit ? identity : undefined));
    const releaseTwo = two.run(() =>
      configureVillagesRuntime(host(explicit ? { ...store.api } : store.api), explicit ? identity : undefined),
    );
    const uploadGate = deferred(),
      uploadEntered = deferred();
    let saves = 0,
      twoLibraryReads = 0;
    const fileOwners: unknown[] = [];
    globalThis.fetch = async (input: any, init: any = {}) => {
      const path = new URL(String(input)).pathname;
      if (path === "/api/characters/same") return Response.json({ id: "same" });
      if (path === "/api/sprites/same") {
        if (scopedActivation() === two) twoLibraryReads++;
        return Response.json([{ filename: "neutral.png" }]);
      }
      if (path === "/api/sprites/same/file/neutral.png")
        return new Response(Buffer.from(image.split(",")[1]!, "base64"));
      if (path === "/api/image-metadata/inspect") return Response.json({ width: 16, height: 24 });
      if (path.startsWith("/api/sprites/villages-") && init.method === "POST") {
        saves++;
        fileOwners.push(scopedActivation());
        if (saves === 1) {
          uploadEntered.resolve();
          await uploadGate.promise;
        }
        return Response.json({ filename: JSON.parse(init.body).expression + ".png" });
      }
      throw new Error("Unexpected Engine test request: " + path);
    };
    try {
      const firstAdoption = one.run(() => adoptSpriteArtwork("same", { filenames: ["neutral.png"] }));
      await uploadEntered.promise;
      const secondAdoption = two.run(() => adoptSpriteArtwork("same", { filenames: ["neutral.png"] }));
      await new Promise((resolve) => setImmediate(resolve));
      assert.equal(twoLibraryReads, 0, "second activation waits before side effects");
      uploadGate.resolve();
      const [saved, reused] = await Promise.all([firstAdoption, secondAdoption]);
      assert.equal(saves, 2, "one original and one rendered image across both owners");
      assert.equal(twoLibraryReads, 1, "the queued second command uses its own activation");
      assert.deepEqual(reused.selectedArtworkIds, saved.selectedArtworkIds);
      assert.deepEqual(reused.addedArtworkIds, []);
      assert.deepEqual(fileOwners, [one, one], "shared queue never borrows a different connection owner");
      one.run(releaseOne);
      one.dispose();
      assert.equal((await two.run(() => readSpriteManager("same"))).artwork.length, 1);
    } finally {
      uploadGate.resolve();
      one.run(releaseOne);
      two.run(releaseTwo);
      one.dispose();
      two.dispose();
    }
  }
} finally {
  globalThis.fetch = originalFetch;
}
console.log(
  "Sprite ownership: independent worlds, queued failure recovery, delayed owner retention and shared-backend adoption admission passed (mocked ports, no models).",
);
