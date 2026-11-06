import assert from "node:assert/strict";
import { createActivationScope } from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import {
  configureTownMapReview,
  updateVillageMap,
} from "../packages/villages/src/server/features/media/town-map-review.js";
import { mapsFixture, image } from "./fixtures/maps.js";
const a = mapsFixture(),
  b = mapsFixture();
let entered!: () => void, resume!: () => void;
const waiting = new Promise<void>((resolve) => {
  entered = resolve;
});
const gate = new Promise<void>((resolve) => {
  resume = resolve;
});
a.inspect(async () => {
  entered();
  await gate;
  return { width: 1440, height: 900 };
});
const scopeA = createActivationScope(),
  scopeB = createActivationScope();
let releaseA!: () => void, releaseB!: () => void;
scopeA.run(() => {
  releaseA = configureTownMapReview(a.service);
});
scopeB.run(() => {
  releaseB = configureTownMapReview(b.service);
});

const pending = scopeA.run(() =>
  updateVillageMap("map-house", {
    expectedRevision: 1,
    image: image("A"),
    placements: [{ venueId: "home", x: 0.8, y: 0.8 }],
  }),
);
await waiting;

scopeB.run(() => resume());
await pending;
assert.equal(a.state.venues[0].presentation.x, 0.8);
assert.equal(b.state.venues[0].presentation.x, 0.3, "A's in-flight operation cannot mutate a later activation");
scopeB.run(() => releaseA());
await scopeB.run(() => updateVillageMap("map-house", { expectedRevision: 1, name: "B" }));
assert.equal(b.state.maps[0].name, "B");

releaseB();
console.log("Map operations remain owned by the activation that admitted them");
