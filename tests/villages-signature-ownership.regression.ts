import assert from "node:assert/strict";
import { PNG } from "pngjs";
import {
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  createResidentSignatures,
  type ResidentSignaturePorts,
} from "../packages/villages/src/server/features/residents/resident-signature-service.js";
import { createResidentSignatureTasks } from "../packages/villages/src/server/features/residents/resident-signature-tasks.js";
import {
  configureResidentSignatures,
  generateResidentSignature,
  readResidentSignature,
} from "../packages/villages/src/server/features/residents/resident-signature.js";
import type { ResidentSignatureView } from "../packages/villages/src/shared/helpers/resident-signature.js";

function deferred<T = void>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
const stamp = "2026-10-07T00:00:00.000Z";
function documents(name: string) {
  const state = coerceVillageState({
    seed: "identical-seed",
    name,
    foundedAt: stamp,
    wishSystemVersion: 3,
    villagers: [
      {
        characterId: "same",
        addedAt: stamp,
        cardSnapshot: {
          id: "same",
          name,
          personality: "Quiet",
          capturedAt: stamp,
          revision: 1,
          sourceStatus: "missing",
        },
      },
    ],
  });
  const rows = new Map<string, any>([
    ["villages-village", { id: "villages-village", data: state, revision: 1 }],
    ["villages-connections", { id: "villages-connections", data: { imageConnectionId: "mock-image" }, revision: 1 }],
  ]);
  const api = {
    async getById(_pkg: string, id: string) {
      return structuredClone(rows.get(id) ?? null);
    },
    async list() {
      return [];
    },
    async create(input: any) {
      if (rows.has(input.id)) throw new Error("Already exists");
      const row = { ...structuredClone(input), revision: 1 };
      rows.set(input.id, row);
      return structuredClone(row);
    },
    async update(input: any) {
      const prior = rows.get(input.id);
      if (prior?.revision !== input.expectedRevision) return null;
      const row = { ...prior, ...structuredClone(input), revision: prior.revision + 1 };
      rows.set(input.id, row);
      return structuredClone(row);
    },
  };
  return { rows, api };
}
const pixels = new PNG({ width: 24, height: 16 });
pixels.data.fill(255);
for (let y = 6; y < 10; y++) for (let x = 4; x < 20; x++) pixels.data.set([0, 0, 0, 255], (y * 24 + x) * 4);
const bytes = PNG.sync.write(pixels),
  image = "data:image/png;base64," + bytes.toString("base64");
const action = { actionId: "signature-owner-action", expectedAttempt: 0 };
function fixture(name: string) {
  const store = documents(name),
    events: string[] = [],
    gate = deferred(),
    entered = deferred();
  let pauseRead = false,
    pauseProvider = false,
    requests = 0,
    uploads = 0;
  const ports: ResidentSignaturePorts = {
    owner: "same-process-owner",
    tasks: createResidentSignatureTasks(),
    villagesDocuments: () => store.api,
    villagesRuntimeEpoch: () => (name === "A" ? 1 : 2),
    async readVillageAuthority() {
      events.push("authority:" + name);
      if (pauseRead) {
        pauseRead = false;
        entered.resolve();
        await gate.promise;
      }
      return structuredClone(store.rows.get("villages-village").data);
    },
    async mutateVillageState(update) {
      events.push("mutate:" + name);
      const prior = store.rows.get("villages-village"),
        next = structuredClone(prior.data);
      update(next);
      prior.data = next;
      prior.revision++;
      return structuredClone(next);
    },
    async resolveVillageImageConnectionId() {
      events.push("connection:" + name);
      return name;
    },
    async generateVillageImage(input) {
      events.push("generate:" + name);
      requests++;
      assert.equal(input.connectionId, name);
      const claim = [...store.rows.values()].find((row) => row.kind === "resident-signature");
      assert.equal(claim.data.status, "running", "claim is persisted before any paid request");
      assert.equal(claim.data.owner, ports.owner);
      if (pauseProvider) {
        pauseProvider = false;
        entered.resolve();
        await gate.promise;
      }
      return { dataUrl: image, mime: "image/png", bytes };
    },
    async prepareSignatureImage() {
      events.push("prepare:" + name);
      return { originalSize: { width: 24, height: 16 }, bytes, width: 24, height: 16 };
    },
    async uploadVillageGalleryImage() {
      events.push("upload:" + name);
      uploads++;
      return { id: `${name}-${uploads}`, ref: `global-gallery:${name}-${uploads}`, url: `/gallery/${name}-${uploads}` };
    },
  };
  const service = createResidentSignatures(ports);
  assert.deepEqual(events, [], "construction performs no storage or image effects");
  return {
    service,
    store,
    events,
    gate,
    entered,
    pauseRead() {
      pauseRead = true;
    },
    pauseProvider() {
      pauseProvider = true;
    },
    get requests() {
      return requests;
    },
  };
}

// A delayed request cannot admit, join or return a signature from a different world,
// even when seed, resident and addedAt (therefore document ID) are identical.
const a = fixture("A"),
  b = fixture("B");
a.pauseProvider();
const first = a.service.generateResidentSignature("same", action);
await a.entered.promise;
assert.equal((await a.service.readResidentSignature("same")).status, "running");
const bResult = await b.service.generateResidentSignature("same", action);
assert.equal(bResult.saved?.name, "B");
assert.match(bResult.saved!.image.url, /B-/);
const aClaimId = [...a.store.rows.values()].find((row) => row.kind === "resident-signature").id;
const bClaimId = [...b.store.rows.values()].find((row) => row.kind === "resident-signature").id;
assert.equal(aClaimId, bClaimId);
const duplicate = a.service.generateResidentSignature("same", action);
await assert.rejects(
  a.service.generateResidentSignature("same", { actionId: "different-request", expectedAttempt: 1 }),
  /already/,
);
a.gate.resolve();
assert.deepEqual((await duplicate).saved, (await first).saved);
assert.equal(a.requests, 1);
assert.equal(b.requests, 1);
assert.equal((await a.service.generateResidentSignature("same", action)).saved?.name, "A");
assert.equal(a.requests, 1, "saved action replay never dispatches");

// Origin is captured before the first authority read on a direct call.
const ownerA = createActivationScope(),
  ownerB = createActivationScope();
const paused = fixture("paused-A"),
  fresh = fixture("fresh-B");
const releaseA = ownerA.run(() => configureResidentSignatures(paused.service));
const releaseB = ownerB.run(() => configureResidentSignatures(fresh.service));
const clearA = installDefaultActivation(ownerA, () => {});
paused.pauseRead();
const delayed = generateResidentSignature("same", action);
await paused.entered.promise;
const clearB = installDefaultActivation(ownerB, () => {});
paused.gate.resolve();
assert.equal((await delayed).saved?.name, "paused-A");
assert(paused.events.every((event) => event.endsWith("paused-A")));
assert.deepEqual(fresh.events, []);
ownerA.run(releaseA);
clearA();
ownerA.dispose();
assert.equal((await readResidentSignature("same")).status, "local");
const missing = createActivationScope();
await assert.rejects(
  missing.run(() => generateResidentSignature("same", action)),
  /not configured/,
);
ownerB.run(releaseB);
clearB();
ownerB.dispose();
await assert.rejects(
  ownerB.run(() => readResidentSignature("same")),
  /not configured/,
);

// Retirement of one task cannot forget a later admission with the same identity.
const registry = createResidentSignatureTasks(),
  unrelated = createResidentSignatureTasks();
const oldTask = deferred<ResidentSignatureView>(),
  newTask = deferred<ResidentSignatureView>();
registry.set("same", oldTask.promise);
registry.set("same", newTask.promise);
registry.forget("same", oldTask.promise);
assert.equal(registry.get("same"), newTask.promise);
assert.equal(unrelated.has("same"), false);
registry.forget("same", newTask.promise);
assert.equal(registry.has("same"), false);

// Real entry assembly retains duplicate admission across live scopes sharing a
// document capability, or distinct facades supplied a common opaque identity.
// All Engine endpoints below are test doubles; no provider is contacted.
const originalFetch = globalThis.fetch;
try {
  for (const explicit of [false, true]) {
    const store = documents("shared"),
      identity = {},
      one = createActivationScope(),
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
    const providerGate = deferred(),
      providerEntered = deferred();
    const uploadOwners: unknown[] = [];
    let requests = 0;
    globalThis.fetch = async (input: any, init: any = {}) => {
      const path = new URL(String(input)).pathname;
      if (path === "/api/connections") return Response.json([{ id: "mock-image", provider: "image_generation" }]);
      if (path === "/api/characters/avatar-generation") {
        requests++;
        assert.equal(scopedActivation(), one);
        assert(
          [...store.rows.values()].some((row) => row.kind === "resident-signature" && row.data.status === "running"),
        );
        providerEntered.resolve();
        await providerGate.promise;
        return Response.json({ image });
      }
      if (path === "/api/image-metadata/inspect") return Response.json({ width: 24, height: 16 });
      if (path === "/api/global-gallery/folders") return Response.json([{ id: "villages", name: "Villages" }]);
      if (path === "/api/global-gallery/upload" && init?.method === "POST") {
        uploadOwners.push(scopedActivation());
        return Response.json({
          id: `art-${uploadOwners.length}`,
          url: `/api/global-gallery/art-${uploadOwners.length}/file`,
        });
      }
      throw new Error("Unexpected Engine request: " + path);
    };
    try {
      const original = one.run(() => generateResidentSignature("same", action));
      await providerEntered.promise;
      // Existing epoch-specific profile status is retained: B cannot mark A's
      // attempt running, but the shared registry still prevents a second spend.
      assert.equal((await two.run(() => readResidentSignature("same"))).status, "interrupted");
      const joined = two.run(() => generateResidentSignature("same", action));
      await assert.rejects(
        two.run(() => generateResidentSignature("same", { actionId: "another-action", expectedAttempt: 1 })),
        /already/,
      );
      assert.equal(requests, 1);
      providerGate.resolve();
      const [saved, reused] = await Promise.all([original, joined]);
      assert.deepEqual(reused.saved, saved.saved);
      assert.equal(saved.status, "saved");
      assert.equal(requests, 1);
      assert.deepEqual(uploadOwners, [one, one]);
      one.run(releaseOne);
      one.dispose();
      assert.equal((await two.run(() => readResidentSignature("same"))).status, "saved");
    } finally {
      providerGate.resolve();
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
  "Signature ownership: equal incarnation IDs across worlds, claim-before-dispatch, shared-backend duplicate admission, replay, delayed owner retention and cleanup passed (mocked providers).",
);
