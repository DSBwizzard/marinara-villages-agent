import assert from "node:assert/strict";
import { photoPinFits } from "../packages/villages/src/engine/packages/client/src/villages-photo-pin-layout.ts";

const points = [0.12, 0.37, 0.62, 0.87].flatMap((y) => [0.12, 0.37, 0.62, 0.87].map((x) => ({ x, y })));

for (const layout of [
  { map: { width: 320, height: 213 }, card: { width: 24, height: 37 } },
  { map: { width: 600, height: 400 }, card: { width: 33, height: 46 } },
  { map: { width: 1000, height: 667 }, card: { width: 44, height: 57 } },
  { map: { width: 900, height: 600 }, card: { width: 27, height: 45 } },
]) {
  const placed: typeof points = [];
  for (const point of points) {
    assert.equal(photoPinFits(point, placed, layout.map, layout.card), true);
    placed.push(point);
  }
  assert.equal(placed.length, 16);
  assert.equal(photoPinFits({ x: 0.125, y: 0.125 }, placed, layout.map, layout.card), false);
}

console.log("Villages photograph layout: 16 separated pins and collision rejection passed");
