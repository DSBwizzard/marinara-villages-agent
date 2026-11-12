import assert from "node:assert/strict";
import { PNG } from "pngjs";
import {
  createActivationScope,
  activationScope,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
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
import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";

function deferred<T = void>() {
  return Promise.withResolvers<T>();
}
const stamp = "2026-10-07T00:00:00.000Z";
function documents(name: string) {
  const state = coerceVillageState({
    ...defaultVillageState(),

    seed: "identical-seed",
    name,
    foundedAt: stamp,
    villagers: [
      {
        letterFontId: "caveat",
        characterId: "same",
        incarnation: "same:original",
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
    ["villages-village", { id: "villages-village", packageId: "villages", kind: "village", data: state, revision: 1 }],
    [
      "villages-connections",
      {
        id: "villages-connections",
        data: { imageConnectionId: "mock-image", systemConnectionId: "mock-system" },
        revision: 1,
      },
    ],
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
const habit = {
  habit: "Writes the name plainly.",
  evidence: ["Quiet."],
  visibleText: ["same"],
  drawingBrief: "A small, plain name written in black pen on white.",
};
function fixture(name: string) {
  const store = documents(name),
    events: string[] = [],
    gate = deferred(),
    entered = deferred();
  const controls = {
    pauseDispatch: false,
    imagesAvailable: true,
    failImage: false,
    epoch: name === "A" ? 1 : 2,
  };
  let pauseRead = false,
    pauseProvider = false,
    requests = 0,
    uploads = 0;
  const ports: ResidentSignaturePorts = {
    owner: "same-process-owner",
    tasks: createResidentSignatureTasks(),
    villagesDocuments: () => store.api,
    villagesRuntimeEpoch: () => controls.epoch,
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
      if (!controls.imagesAvailable) throw new Error("Images disabled");
      return name;
    },
    async generateVillageImage(input) {
      if (controls.pauseDispatch) {
        entered.resolve();
        await gate.promise;
      }
      await input.beforeDispatch?.();
      events.push("generate:" + name);
      requests++;
      if (controls.failImage) throw new Error("Image provider unavailable");
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
    controls,
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

// The only paid dispatch is fenced by the original admission and character evidence.
const admitted = fixture("admitted");
admitted.controls.pauseDispatch = true;
const admittedTask = admitted.service.generateResidentSignature("same", action);
await admitted.entered.promise;
const admittedDuplicate = admitted.service.generateResidentSignature("same", action);
await assert.rejects(
  admitted.service.generateResidentSignature("same", { actionId: "another-request", expectedAttempt: 1 }),
  /already/,
);
admitted.store.rows.get("villages-village").data.villagers[0].cardSnapshot.personality = "Changed before dispatch";
admitted.gate.resolve();
assert.equal((await admittedTask).status, "failed");
await admittedDuplicate;
assert.equal(admitted.requests, 0, "A card changed before dispatch prevents image spending");

for (const kind of ["world", "removed", "runtime"] as const) {
  const changed = fixture(kind);
  changed.controls.pauseDispatch = true;
  const pending = changed.service.generateResidentSignature("same", action);
  await changed.entered.promise;
  if (kind === "world") changed.store.rows.get("villages-village").data.seed = "different-world";
  if (kind === "removed") changed.store.rows.get("villages-village").data.villagers = [];
  if (kind === "runtime") changed.controls.epoch++;
  changed.gate.resolve();
  if (kind === "removed") await assert.rejects(pending, /no longer/);
  else assert.equal((await pending).status, kind === "runtime" ? "interrupted" : "local");
  assert.equal(changed.requests, 0, `${kind} change before dispatch fences image spending`);
}

for (const kind of ["response", "uploaded"] as const) {
  const legacy = fixture("legacy-" + kind);
  await legacy.service.generateResidentSignature("same", action);
  const claim = [...legacy.store.rows.values()].find((row) => row.kind === "resident-signature");
  // A previous two-call version retained its selector alongside the purchased image.
  const selection = { key: "legacy-selector", response: { content: JSON.stringify(habit), finishReason: "stop" } };
  claim.data.selection = structuredClone(selection);
  claim.data.prompt = "Legacy two-call drawing prompt";
  claim.data.status = "failed";
  if (kind === "response") {
    claim.data.response = image;
    delete claim.data.original;
    delete claim.data.image;
  }
  legacy.controls.imagesAvailable = false;
  assert.equal((await legacy.service.readResidentSignature("same")).recoverable, true);
  assert.equal(
    (await legacy.service.generateResidentSignature("same", { actionId: "legacy-free-recovery", expectedAttempt: 1 }))
      .status,
    "saved",
  );
  assert.equal(legacy.requests, 1, "Legacy paid image recovery makes no provider request");
  const recovered = [...legacy.store.rows.values()].find((row) => row.kind === "resident-signature");
  assert.deepEqual(recovered.data.selection, selection, "Recovery preserves old paid selection evidence");
  assert.equal(recovered.data.prompt, "Legacy two-call drawing prompt");
}

const habitOnly = fixture("habit-only");
await habitOnly.service.generateResidentSignature("same", action);
const habitClaim = [...habitOnly.store.rows.values()].find((row) => row.kind === "resident-signature");
habitClaim.data.selection = {
  key: "legacy-selector",
  response: { content: JSON.stringify(habit), finishReason: "stop" },
};
habitClaim.data.status = "failed";
delete habitClaim.data.original;
delete habitClaim.data.image;
assert.equal((await habitOnly.service.readResidentSignature("same")).recoverable, false, "A habit is not a free image");
assert.equal(
  (await habitOnly.service.generateResidentSignature("same", { actionId: "single-image-retry", expectedAttempt: 1 }))
    .status,
  "saved",
);
assert.equal(habitOnly.requests, 2, "An explicit retry of an old habit-only attempt makes one image request");

const disabled = fixture("disabled");
disabled.controls.imagesAvailable = false;
assert.equal((await disabled.service.readResidentSignature("same")).available, false);
await assert.rejects(disabled.service.generateResidentSignature("same", action), /Images disabled/);
assert.equal(disabled.requests, 0);
assert.ok(![...disabled.store.rows.values()].some((row) => row.kind === "resident-signature"));

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

ownerA.run(() => paused.pauseRead());
const delayed = ownerA.run(() => generateResidentSignature("same", action));
await paused.entered.promise;

paused.gate.resolve();
assert.equal((await delayed).saved?.name, "paused-A");
ownerB.run(() => assert(paused.events.every((event) => event.endsWith("paused-A"))));
assert.deepEqual(fresh.events, []);
ownerB.run(() => ownerA.run(releaseA));

ownerA.dispose();
await ownerB.run(async () => assert.equal((await readResidentSignature("same")).status, "local"));
const missing = createActivationScope();
await ownerB.run(() =>
  assert.rejects(
    missing.run(() => generateResidentSignature("same", action)),
    /not configured/,
  ),
);
ownerB.run(() => ownerB.run(releaseB));

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
        languageModels: {
          resolveForRequest: async () => {
            throw new Error("Signatures must not resolve System");
          },
        },
        persistence: { documents: villageFixtureDocuments(api) },
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
        assert.equal(activationScope(), one);
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
        uploadOwners.push(activationScope());
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
