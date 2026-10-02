import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  processStudioCell,
  analyzeStudioSheet,
  foregroundBounds,
  validateStudioExport,
  studioSheetScale,
} from "../packages/villages/src/engine/packages/server/src/services/villages/sprite-studio-pixels.ts";
import {
  decodeStudioPng,
  encodeStudioPng,
  processedStudioCell,
} from "../packages/villages/src/engine/packages/server/src/services/villages/sprite-studio-processing.ts";
import type { StudioPixels } from "../packages/villages/src/engine/packages/server/src/services/villages/sprite-studio-pixels.ts";
import type {
  StudioSheet,
  StudioCell,
} from "../packages/villages/src/engine/packages/server/src/services/villages/sprite-studio-model.ts";
function fixture(w = 100, h = 150): StudioPixels {
  return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) };
}
function rect(im: StudioPixels, x: number, y: number, w: number, h: number, color = [50, 100, 180, 255]) {
  for (let py = y; py < y + h; py++) for (let px = x; px < x + w; px++) im.data.set(color, (py * im.width + px) * 4);
}
const cell: StudioCell = {
  id: "test",
  label: "happy",
  pose: "wave",
  view: "front",
  x: 0,
  y: 0,
  width: 100,
  height: 150,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  cleanup: true,
  status: "candidate",
};
const sheet: StudioSheet = {
  assetId: "test",
  url: "",
  width: 100,
  height: 150,
  cells: [cell],
  attempts: 0,
  usage: null,
};
const full = fixture();
rect(full, 25, 15, 50, 120);
const clean = processStudioCell(full, sheet, cell);
assert.equal(clean.validation.status, "passed");
assert.deepEqual([clean.image.width, clean.image.height], [512, 768]);
assert.equal(foregroundBounds(clean.image).bottom, 751);
assert.deepEqual(decodeStudioPng(encodeStudioPng(clean.image)), clean.image, "PNG roundtrip preserves export pixels");
assert.equal(validateStudioExport(clean.image).status, "passed");
const offset = processStudioCell(full, sheet, { ...cell, offsetY: 1 });
assert.equal(offset.validation.status, "passed", "foot offset is automatically fitted inside the safe baseline");
const clipped = fixture();
rect(clipped, 25, 15, 50, 135);
const clippedResult = processStudioCell(clipped, sheet, cell);
assert.equal(clippedResult.validation.status, "needs-review");
assert.ok(clippedResult.validation.findings.some((f) => f.code === "source-edge"));
assert.equal(
  validateStudioExport(clippedResult.image).status,
  "passed",
  "fitting succeeds without clearing source clipping",
);
assert.equal(processStudioCell(fixture(), sheet, cell).validation.status, "blocked", "empty cells block exports");
const matte = fixture();
rect(matte, 0, 0, 100, 150, [255, 0, 255, 255]);
rect(matte, 25, 15, 50, 120);
assert.equal(
  processStudioCell(matte, { ...sheet, source: { kind: "generated-raw", matteHex: "#FF00FF" } }, cell).validation
    .status,
  "passed",
);
const residue = fixture();
rect(residue, 25, 15, 50, 120);
rect(residue, 40, 40, 10, 10, [255, 0, 255, 255]);
const retained = processStudioCell(residue, sheet, cell);
assert.ok(foregroundBounds(retained.image).count > 0, "internal costume colors do not block export");
const leftover = fixture();
rect(leftover, 2, 2, 96, 146, [255, 0, 255, 255]);
rect(leftover, 25, 15, 50, 120);
const expectedSheet = { ...sheet, source: { kind: "generated-raw" as const, matteHex: "#FF00FF" } };
const expectedClean = processStudioCell(leftover, expectedSheet, cell);
assert.deepEqual(
  expectedClean.validation.foreground,
  clean.validation.foreground,
  "inset host leftovers do not inflate bounds",
);
const partial = fixture();
rect(partial, 2, 2, 96, 146, [255, 0, 255, 255]);
rect(partial, 25, 15, 50, 120);
rect(partial, 0, 0, 20, 40, [0, 0, 0, 0]);
assert.deepEqual(processStudioCell(partial, expectedSheet, cell).validation.foreground, clean.validation.foreground);
void processedStudioCell(
  expectedSheet,
  { ...cell, cleanupEngine: "builtin" },
  "builtin",
  encodeStudioPng(leftover),
  leftover,
).then((result) => {
  assert.deepEqual(
    decodeStudioPng(result.image),
    expectedClean.image,
    "successful host cleanup still runs local matte removal",
  );
  assert.equal(result.validation.status, "passed");
});
const grid = fixture(200, 300),
  layout = { ...sheet, width: 200, height: 300, layout: { cols: 2, rows: 2, count: 3 } };
rect(grid, 25, 15, 50, 120);
rect(grid, 140, 170, 20, 50);
rect(grid, 98, 50, 5, 50);
const findings = analyzeStudioSheet(grid, layout).findings;
assert.ok(findings.some((f) => f.code === "unused-cell"));
assert.ok(findings.some((f) => f.code === "sheet-gutter"));
assert.throws(() => decodeStudioPng("data:image/png;base64,aW52YWxpZA=="));
const batchSource = fixture(200, 150);
rect(batchSource, 25, 15, 50, 120);
rect(batchSource, 125, 35, 50, 100);
const batchCells = [
  { ...cell, id: "neutral", label: "neutral" },
  { ...cell, id: "gesture", x: 100 },
];
const batchSheet = { ...sheet, width: 200, cells: batchCells, expectedHeight: 600 };
const sharedScale = studioSheetScale(batchSource, batchSheet);
assert.equal(sharedScale, 5, "neutral height anchors one sheet-wide scale");
const fitted = batchCells.map((c) => processStudioCell(batchSource, { ...batchSheet, baseScale: sharedScale }, c));
assert.equal(fitted[0].validation.framing!.scale, fitted[1].validation.framing!.scale);
assert.ok(fitted.every((result) => foregroundBounds(result.image).bottom === 751));
assert.ok(fitted.every((result) => validateStudioExport(result.image).status === "passed"));
const extreme = processStudioCell(full, sheet, { ...cell, scale: 3, offsetX: 500, offsetY: -500 });
assert.equal(extreme.validation.status, "passed", "oversized transforms are fitted automatically");
// Optional recorded-source check reads the installed data without changing it or committing personal artwork.
if (process.env.ROXIE_SPRITE_DATA) {
  const ids = [
    "3712da33-e188-41af-9d60-1a93bbf434ba",
    "65c3b912-4640-420c-900d-94777102dd1e",
    "7401d49f-e40d-41ea-aba7-7e40382a38a0",
    "a2bfda3d-788e-4263-89d7-1293d7732e3a",
    "6735d841-2590-4f32-bb9a-c17cfe9bea6e",
    "2694ac14-0492-4571-be78-268fab10b15e",
  ];
  for (const [i, id] of ids.entries()) {
    const raw = readFileSync(join(process.env.ROXIE_SPRITE_DATA, "villages-" + id, "original.png"));
    const source = decodeStudioPng("data:image/png;base64," + raw.toString("base64"));
    const c = { ...cell, width: source.width, height: source.height };
    const result = processStudioCell(source, { ...sheet, width: source.width, height: source.height }, c);
    assert.equal(validateStudioExport(result.image).status, "passed");
    if (i === 2)
      assert.ok(
        result.validation.findings.some((f) => f.code === "source-edge"),
        "recorded cropped sad image retains clipping finding",
      );
    console.log("Recorded Roxie", i, result.validation.status, result.validation.findings.map((f) => f.code).join(","));
  }
}
console.log(
  "Sprite pixel checks passed: safe bounds, clipping persistence, empty cells, costume colors, occupied gutters and unused cells.",
);
