// Regenerates the Villages catalog cover. Run manually:
//   node packages/villages/build/cover.mjs
//
// The Home tab icon source is artwork/villages-icon.svg.
//
// The catalog validator requires a 512x512 cover.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Raster, makeRng, upscale } from "./png.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "../../..");

const INK = "#22261f";

// Golden-hour hamlet, side view. 64x64 source.
function drawCover() {
  const S = 64;
  const art = new Raster(S, S);
  const rng = makeRng(0x5a17c0de);

  // Dusk sky, light gathering towards the horizon.
  const sky = ["#3f5f9c", "#4f76b4", "#6389c4", "#7d9fd2", "#9bb8dd", "#bdd2e8"];
  for (let y = 0; y < 34; y++) {
    const hex = sky[Math.min(sky.length - 1, Math.floor((y / 34) * sky.length))];
    art.rect(0, y, S, 1, hex);
  }

  // Low sun on the right.
  art.disc(50, 12, 7, "#f4b96a");
  art.disc(50, 12, 5, "#ffd98a");
  art.disc(50, 12, 3, "#fff3c8");

  // Two flat clouds catching the light.
  for (const [cx, cy, w] of [
    [14, 8, 16],
    [30, 16, 13],
  ]) {
    art.rect(cx, cy, w, 3, "#d5e2ef");
    art.rect(cx + 2, cy - 2, w - 5, 2, "#e8f0f8");
    art.rect(cx + 3, cy + 3, w - 6, 1, "#b8cadd");
  }

  // Distant ridge, then the near hill the village sits on.
  for (let x = 0; x < S; x++) {
    const crest = 31 + Math.round(Math.sin(x / 9) * 2);
    for (let y = crest; y < 40; y++) art.px(x, y, rng() < 0.12 ? "#6d8f74" : "#5f8367");
  }
  for (let x = 0; x < S; x++) {
    const crest = 38 + Math.round(Math.sin(x / 13 + 2) * 2);
    for (let y = crest; y < S; y++) {
      const r = rng();
      art.px(x, y, r < 0.08 ? "#4c8a52" : r < 0.16 ? "#356b3c" : "#3e7a44");
    }
  }

  // Windmill on the near ridge, left of centre.
  art.rect(10, 28, 5, 14, "#ded3b8");
  art.rect(10, 28, 1, 14, "#b9ae95");
  for (let row = 0; row < 4; row++) art.rect(9 + row, 24 + row, 7 - row * 2, 1, "#8a6a4a");
  art.rect(12, 33, 1, 4, "#6b4a30");
  for (const [dx, dy] of [
    [1, -1],
    [-1, -1],
    [1, 1],
    [-1, 1],
  ]) {
    for (let step = 1; step <= 6; step++) art.px(12 + dx * step, 27 + dy * step, "#9c7c58");
  }
  art.px(12, 27, "#6b4a30");

  // Cottage helper: plaster walls, timber, red roof, warm window.
  const cottage = (x, y, w, h) => {
    art.rect(x, y, w, h, "#e6dcc3");
    art.rect(x, y + h - 1, w, 1, "#c4b79a");
    for (let row = 0; row < Math.ceil(w / 2); row++) {
      art.rect(x - 1 + row, y - 1 - row, w + 2 - row * 2, 1, row % 2 ? "#a04a38" : "#b0553f");
    }
    art.rect(x + Math.floor(w / 2) - 1, y + h - 5, 3, 5, "#6b4a30");
    art.rect(x + 1, y + 2, 3, 3, "#ffd98a");
    art.px(x + 2, y + 2, "#8a5a2a");
    if (w > 9) {
      art.rect(x + w - 4, y + 2, 3, 3, "#ffd98a");
      art.px(x + w - 3, y + 2, "#8a5a2a");
    }
  };
  cottage(22, 38, 10, 8);
  cottage(36, 41, 12, 8);

  // Lane running from the village down to the front of the frame.
  for (let y = 44; y < S; y++) {
    const width = 4 + Math.round((y - 44) / 3);
    const cx = 33 + Math.round(Math.sin(y / 6) * 1.5);
    for (let x = cx - width; x <= cx + width; x++) {
      art.px(x, y, rng() < 0.14 ? "#c7ab74" : "#b39764");
    }
  }

  // Riverside band on the right, with a little footbridge.
  for (let y = 47; y < 52; y++) {
    for (let x = 46; x < S; x++) art.px(x, y, rng() < 0.1 ? "#8fc4e2" : "#5f9fc9");
  }
  art.rect(48, 46, 12, 2, "#8a6a4a");
  art.rect(48, 51, 12, 1, "#8a6a4a");
  for (const x of [49, 53, 57]) art.rect(x, 46, 1, 6, "#6b4a30");

  // Trees framing the right side.
  const tree = (x, baseY) => {
    art.rect(x + 2, baseY - 4, 3, 4, "#5b4432");
    const cy = baseY - 8;
    for (let y = -5; y <= 5; y++) {
      for (let xx = -5; xx <= 5; xx++) {
        if (xx * xx + (y * y) / 1.25 < 24) art.px(x + 3 + xx, cy + y, rng() < 0.22 ? "#5aa25e" : "#2c5a33");
      }
    }
  };
  tree(52, 58);
  tree(59, 54);
  tree(2, 50);

  // Three villagers out on the lane: standing, walking, and one waving.
  const villager = (x, y, tunic, hair) => {
    art.rect(x, y, 4, 2, hair);
    art.rect(x, y + 2, 4, 2, "#e0b48a");
    art.px(x + 1, y + 3, INK);
    art.px(x + 2, y + 3, INK);
    art.rect(x, y + 4, 4, 4, tunic);
    art.rect(x + 1, y + 8, 1, 3, "#5d4530");
    art.rect(x + 3, y + 8, 1, 3, "#5d4530");
  };
  villager(30, 52, "#93404a", "#22261f");
  villager(37, 55, "#3f6ea8", "#7a4a2a");
  villager(26, 58, "#6b7f3a", "#c9a24a");
  art.rect(40, 55, 1, 4, "#e0b48a"); // the wave

  // Ink border.
  art.rect(0, 0, S, 2, INK);
  art.rect(0, S - 2, S, 2, INK);
  art.rect(0, 0, 2, S, INK);
  art.rect(S - 2, 0, 2, S, INK);

  return upscale(art, 8);
}

const path = join(repoRoot, "artwork/agent-covers/villages.png");
const image = drawCover();
mkdirSync(dirname(path), { recursive: true });
if (image.w !== 512 || image.h !== 512) throw new Error(`${path} must be 512x512, got ${image.w}x${image.h}`);
writeFileSync(path, image.toPng());
console.log(`wrote ${path} (${image.w}x${image.h})`);
