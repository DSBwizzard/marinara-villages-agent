import assert from "node:assert/strict";
import { removeStudioMatte } from "../packages/villages/src/engine/packages/server/src/services/villages/sprite-studio-matte.ts";

const width = 40,
  height = 60;
type Color = [number, number, number, number];
const magenta: Color = [255, 0, 255, 255];
const paper: Color = [244, 236, 214, 255];
const blue: Color = [50, 100, 190, 255];
function fixture(background: Color, frame?: Color) {
  const rgba = new Uint8ClampedArray(width * height * 4);
  const set = (x: number, y: number, color: Color) => rgba.set(color, (y * width + x) * 4);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const outside = x < 2 || x >= width - 2 || y < 2 || y >= height - 2;
      set(x, y, outside && frame ? frame : background);
      if (x >= 14 && x <= 25 && y >= 10 && y <= 49) set(x, y, paper);
      if (x >= 16 && x <= 23 && y >= 12 && y <= 47) set(x, y, blue);
    }
  return { rgba, set, pixel: (x: number, y: number) => [...rgba.slice((y * width + x) * 4, (y * width + x) * 4 + 4)] };
}
for (const frame of [undefined, [0, 0, 0, 0] as Color, [20, 20, 20, 255] as Color]) {
  const image = fixture(magenta, frame);
  image.set(19, 30, magenta); // enclosed gap between the arm and torso
  assert.equal(removeStudioMatte(image.rgba, width, height), true);
  assert.equal(image.pixel(3, 3)[3], 0, "background inside margins is removed");
  assert.equal(image.pixel(0, 0)[3], 0, "thin cell frames are removed");
  assert.equal(image.pixel(19, 30)[3], 0, "enclosed chroma pocket is removed");
  assert.deepEqual(image.pixel(14, 20), paper, "intentional light outline is preserved");
  assert.deepEqual(image.pixel(16, 20), blue, "costume colors are preserved");
  const cleaned = image.rgba.slice();
  removeStudioMatte(image.rgba, width, height);
  assert.deepEqual(image.rgba, cleaned, "cleanup is idempotent");
}
for (const background of [
  [0, 255, 0, 255],
  [0, 255, 255, 255],
] as Color[]) {
  const image = fixture(background, [0, 0, 0, 0]);
  removeStudioMatte(image.rgba, width, height);
  assert.equal(image.pixel(3, 3)[3], 0, "host-selected green/cyan mattes work too");
  assert.deepEqual(image.pixel(16, 20), blue);
}
const fringe = fixture(magenta);
fringe.set(13, 20, [250, 118, 235, 255]); // 50% matte, 50% intentional light outline
removeStudioMatte(fringe.rgba, width, height);
assert.ok(fringe.pixel(13, 20)[3]! > 100 && fringe.pixel(13, 20)[3]! < 160, "edge coverage becomes partial alpha");
assert.ok(fringe.pixel(13, 20)[1]! > 220, "magenta is unmixed from the light outline");
assert.deepEqual(fringe.pixel(14, 20), paper);
const transparent = fixture([0, 0, 0, 0]);
transparent.set(19, 30, magenta); // intentional costume detail on an already transparent sprite
const native = transparent.rgba.slice();
assert.equal(removeStudioMatte(transparent.rgba, width, height), false);
assert.deepEqual(transparent.rgba, native, "native transparency and saturated character details remain intact");
const nonuniform = fixture([30, 40, 80, 255]);
const original = nonuniform.rgba.slice();
assert.equal(removeStudioMatte(nonuniform.rgba, width, height), false);
assert.deepEqual(nonuniform.rgba, original, "unrecognized scenery is not guessed away");
console.log(
  "Sprite matte regression passed: inset mattes, frames, pockets, fringes, three chroma colors, outlines, native alpha and idempotence.",
);
