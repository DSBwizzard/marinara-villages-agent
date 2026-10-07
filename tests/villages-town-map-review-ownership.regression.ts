import assert from "node:assert/strict";
import {
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageState, VillageSnapshot } from "../packages/villages/src/server/domain/models/world.js";
import { DEFAULT_TOWN_MAP_VIEW } from "../packages/villages/src/server/domain/rules/prompt-preset.js";
import { venueDraft } from "../packages/villages/src/server/domain/rules/venue-authoring.js";
import { createTownMapReview } from "../packages/villages/src/server/features/media/town-map-review-service.js";
import {
  configureTownMapReview,
  replaceVillageTownMap,
  readVillageTownMapImage,
  readTownMapSubmission,
} from "../packages/villages/src/server/features/media/town-map-review.js";

const stamp = "2026-10-06T12:00:00.000Z";
const image = (name: string) => `data:image/png;base64,${Buffer.from(name).toString("base64")}`;
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function fixture(name: string) {
  const state = defaultVillageState();
  state.name = name;
  state.setupAt = state.foundedAt = stamp;
  state.townMapImage = image(name);
  state.townMapImageSetAt = stamp;
  state.venues = [
    venueDraft(
      {
        id: "same",
        name: "Cabin",
        form: "Cabin",
        description: "A cabin",
        classes: ["residence"],
        presentation: { x: 0.2, y: 0.3 },
      },
      null,
    ),
  ];
  const calls: string[] = [],
    owners: unknown[] = [],
    attempts: VillageState[] = [];
  const entered = deferred(),
    gate = deferred();
  let pause = false,
    failure: Error | undefined,
    retry: ((state: VillageState) => void) | undefined;
  const note = (call: string) => {
    calls.push(call);
    owners.push(scopedActivation());
  };
  const service = createTownMapReview({
    async readVillageState() {
      note("read");
      return structuredClone(state);
    },
    async inspectVillageImage(value) {
      note("inspect:" + value);
      if (pause) {
        pause = false;
        entered.resolve();
        await gate.promise;
        owners.push(scopedActivation());
      }
      if (failure) throw failure;
      return { width: 1400, height: 900 };
    },
    async mutateVillageState(update) {
      note("mutate");
      const first = structuredClone(state);
      update(first);
      attempts.push(first);
      if (retry) {
        retry(state);
        retry = undefined;
        const second = structuredClone(state);
        update(second);
        attempts.push(second);
        Object.assign(state, second);
      } else Object.assign(state, first);
      return structuredClone(state);
    },
    async buildVillageSnapshot() {
      note("snapshot");
      return { village: { name } } as VillageSnapshot;
    },
  });
  assert.deepEqual(calls, [], "Map review construction performs no inspection, storage or projection.");
  return {
    state,
    service,
    calls,
    owners,
    attempts,
    entered,
    gate,
    pause() {
      pause = true;
    },
    failWith(error: Error) {
      failure = error;
    },
    retryWith(change: (state: VillageState) => void) {
      retry = change;
    },
  };
}
function replacement(name: string) {
  return {
    image: image(name),
    expectedMapSetAt: stamp,
    view: DEFAULT_TOWN_MAP_VIEW,
    placements: [{ venueId: "same", fromX: 0.2, fromY: 0.3, x: 0.4, y: 0.5 }],
  };
}

const direct = fixture("Direct");
assert.deepEqual(await direct.service.readVillageTownMapImage(), { image: image("Direct") });
assert.deepEqual(direct.calls, ["read"]);
const blank = await direct.service.readTownMapSubmission("", { panX: 100 });
assert.deepEqual(blank, { image: "", size: null, view: DEFAULT_TOWN_MAP_VIEW });
assert.deepEqual(direct.calls, ["read"], "Explicit empty submission performs no inspection.");
await assert.rejects(direct.service.readTownMapSubmission(null), /explicit empty choice/);
await assert.rejects(direct.service.readTownMapSubmission("data:text/plain;base64,AA=="), /base64 image/);
assert.deepEqual(direct.calls, ["read"]);
const validated = await direct.service.readTownMapSubmission(image("Inspected"));
assert.deepEqual(validated.size, { width: 1400, height: 900 });
assert.equal(direct.state.townMapImage, image("Direct"), "Submission validation alone is read-only.");
const saved = await direct.service.replaceVillageTownMap(replacement("Replacement"));
assert.equal(saved.village.name, "Direct");
assert.equal(direct.state.townMapImage, image("Replacement"));
assert.equal(direct.state.townMapCanvasWidth, 1400);
assert.equal(direct.state.townMapCanvasHeight, 900);
assert(Date.parse(direct.state.townMapImageSetAt) > Date.parse(stamp));
assert.deepEqual([direct.state.venues[0]!.presentation.x, direct.state.venues[0]!.presentation.y], [0.4, 0.5]);
assert.deepEqual(direct.calls.slice(-3), ["inspect:" + image("Replacement"), "mutate", "snapshot"]);
const stale = fixture("Stale");
stale.retryWith((state) => {
  state.townMapImageSetAt = "newer-stamp";
  state.townMapImage = image("Concurrent");
  state.name = "Saved concurrent metadata";
});
await assert.rejects(stale.service.replaceVillageTownMap(replacement("Losing")), /map changed/);
assert.equal(stale.attempts[0]!.townMapImage, image("Losing"));
assert.equal(stale.state.townMapImage, image("Concurrent"));
assert.equal(stale.state.name, "Saved concurrent metadata");
assert.deepEqual([stale.state.venues[0]!.presentation.x, stale.state.venues[0]!.presentation.y], [0.2, 0.3]);
assert(!stale.calls.includes("snapshot"));
const unchanged = fixture("Unchanged");
await assert.rejects(
  unchanged.service.replaceVillageTownMap(replacement("Unchanged")),
  /replacement map before moving/,
);
assert.equal(unchanged.state.townMapImage, image("Unchanged"));
assert(!unchanged.calls.includes("snapshot"));
const badPlacement = fixture("Bad placement");
await assert.rejects(
  badPlacement.service.replaceVillageTownMap({
    ...replacement("New"),
    placements: [{ ...replacement("New").placements[0], y: null }],
  }),
  /both coordinates/,
);
assert(!badPlacement.calls.includes("mutate"));
const unreadable = fixture("Unreadable"),
  failure = Error("Inspection unavailable");
unreadable.failWith(failure);
await assert.rejects(unreadable.service.replaceVillageTownMap(replacement("Failed")), (error) => error === failure);
assert.deepEqual(unreadable.calls, ["inspect:" + image("Failed")]);

const a = createActivationScope(),
  b = createActivationScope();
const original = fixture("Original"),
  current = fixture("Current");
const releaseA = a.run(() => configureTownMapReview(original.service)),
  releaseB = b.run(() => configureTownMapReview(current.service));
const clearA = installDefaultActivation(a, () => {});
original.pause();
const pending = replaceVillageTownMap(replacement("Original replacement"));
await original.entered.promise;
const clearB = installDefaultActivation(b, () => {});
assert.equal((await readVillageTownMapImage()).image, image("Current"));
original.gate.resolve();
assert.equal((await pending).village.name, "Original");
assert.equal(original.state.townMapImage, image("Original replacement"));
assert.equal(current.state.townMapImage, image("Current"));
assert(original.owners.every((owner) => owner === a));
assert(current.owners.every((owner) => owner === b));
a.run(releaseA);
a.dispose();
clearA();
assert.equal((await readVillageTownMapImage()).image, image("Current"));
const missing = createActivationScope();
await assert.rejects(
  missing.run(() => readTownMapSubmission("")),
  /not configured/,
);
b.run(releaseB);
b.dispose();
clearB();
await assert.rejects(
  b.run(() => readVillageTownMapImage()),
  /not configured/,
);
console.log(
  "Town map review ownership: inert ports, shared read-only validation, atomic image/pins, save retry and inspection failures, originating activation and cleanup passed (mocked storage/projection/image inspection).",
);
