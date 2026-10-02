import { removeStudioMatte } from "./sprite-studio-matte.js";
import type { StudioCell, StudioSheet, StudioValidation } from "./sprite-studio-model.js";

export const STUDIO_PROCESSING_VERSION = 4;
export const STUDIO_CANVAS = { width: 512, height: 768, left: 16, top: 16, right: 496, bottom: 752 };
export type StudioPixels = { width: number; height: number; data: Uint8ClampedArray };

export function foregroundBounds(image: StudioPixels) {
  let left = image.width,
    top = image.height,
    right = -1,
    bottom = -1,
    count = 0,
    edge = 0;
  for (let y = 0; y < image.height; y++)
    for (let x = 0; x < image.width; x++) {
      if (image.data[(y * image.width + x) * 4 + 3]! <= 16) continue;
      count++;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
      if (x === 0 || y === 0 || x === image.width - 1 || y === image.height - 1) edge++;
    }
  return { left, top, right, bottom, count, edge };
}

export function validateStudioExport(image: StudioPixels): StudioValidation {
  const b = foregroundBounds(image);
  const findings: StudioValidation["findings"] = [];
  if (image.width !== 512 || image.height !== 768)
    findings.push({ code: "dimensions", severity: "blocking", message: "Export must be 512 × 768." });
  if (!b.count) findings.push({ code: "empty", severity: "blocking", message: "No visible character remains." });
  if (b.count && (b.left < 16 || b.top < 16 || b.right >= 496 || b.bottom >= 752))
    findings.push({ code: "bounds", severity: "blocking", message: "Foreground exceeds the 480 × 736 safe region." });
  return { version: STUDIO_PROCESSING_VERSION, status: findings.length ? "blocked" : "passed", findings };
}

/** One pixel implementation for browser preview, server processing, and export. */
export function processStudioCell(source: StudioPixels, sheet: StudioSheet, cell: StudioCell) {
  const crop: StudioPixels = {
    width: cell.width,
    height: cell.height,
    data: new Uint8ClampedArray(cell.width * cell.height * 4),
  };
  for (let y = 0; y < cell.height; y++) {
    const start = ((cell.y + y) * source.width + cell.x) * 4;
    crop.data.set(source.data.subarray(start, start + cell.width * 4), y * cell.width * 4);
  }
  const hadAlpha = crop.data.some((value, i) => i % 4 === 3 && value <= 16);
  const cleaned = cell.cleanup ? removeStudioMatte(crop.data, crop.width, crop.height, sheet.source?.matteHex) : false;
  const b = foregroundBounds(crop);
  const findings: StudioValidation["findings"] = [...(sheet.validation?.findings ?? [])];
  if (!b.count) findings.push({ code: "empty", severity: "blocking", message: "No visible character remains." });
  if (b.edge)
    findings.push({
      code: "source-edge",
      severity: "review",
      message: "Artwork touches its source/cell edge; inspect for missing body parts or sprite bleed.",
    });
  if (cell.cleanup && !cleaned && !hadAlpha)
    findings.push({
      code: "matte",
      severity: "review",
      message: "Background could not be removed completely. Adjust or regenerate if needed.",
    });
  const gutter = Math.max(1, Math.round(Math.min(crop.width, crop.height) * 0.02));
  if (
    b.count &&
    (b.left < gutter || b.top < gutter || b.right >= crop.width - gutter || b.bottom >= crop.height - gutter)
  )
    findings.push({
      code: "gutter",
      severity: "review",
      message: "Character occupies the expected clear margin; review framing and adjacent cells.",
    });
  const output: StudioPixels = { width: 512, height: 768, data: new Uint8ClampedArray(512 * 768 * 4) };
  let framing = { x: 0, y: 0, width: 0, height: 0, scale: 0 };
  if (b.count) {
    const w = b.right - b.left + 1,
      h = b.bottom - b.top + 1;
    const base = sheet.baseScale ?? Math.min(512 / crop.width, 768 / crop.height);
    const scale = Math.min(base * cell.scale, 480 / w, 736 / h);
    const width = w * scale,
      height = h * scale;
    const x = Math.max(16, Math.min(496 - width, (512 - width) / 2 + cell.offsetX)),
      y = Math.max(16, Math.min(752 - height, 752 - height + cell.offsetY));
    framing = { x, y, width, height, scale };
    for (let dy = Math.max(0, Math.ceil(y)); dy < Math.min(768, Math.floor(y + height)); dy++)
      for (let dx = Math.max(0, Math.ceil(x)); dx < Math.min(512, Math.floor(x + width)); dx++) {
        // Premultiplied bilinear sampling avoids colored fringes around transparent edges.
        const sx = Math.max(b.left, Math.min(b.right, b.left + (dx + 0.5 - x) / scale - 0.5));
        const sy = Math.max(b.top, Math.min(b.bottom, b.top + (dy + 0.5 - y) / scale - 0.5));
        const x0 = Math.floor(sx),
          y0 = Math.floor(sy),
          fx = sx - x0,
          fy = sy - y0,
          to = (dy * 512 + dx) * 4;
        const samples = [
          [x0, y0, (1 - fx) * (1 - fy)],
          [Math.min(b.right, x0 + 1), y0, fx * (1 - fy)],
          [x0, Math.min(b.bottom, y0 + 1), (1 - fx) * fy],
          [Math.min(b.right, x0 + 1), Math.min(b.bottom, y0 + 1), fx * fy],
        ];
        let alpha = 0;
        const color = [0, 0, 0];
        for (const [px, py, weight] of samples) {
          const pos = (py * crop.width + px) * 4,
            a = crop.data[pos + 3] * weight;
          alpha += a;
          for (let c = 0; c < 3; c++) color[c] += crop.data[pos + c] * a;
        }
        output.data[to + 3] = alpha;
        if (alpha) for (let c = 0; c < 3; c++) output.data[to + c] = color[c] / alpha;
      }
  }
  findings.push(
    ...validateStudioExport(output).findings.filter((f) => !findings.some((prior) => prior.code === f.code)),
  );
  const validation: StudioValidation = {
    version: STUDIO_PROCESSING_VERSION,
    status: findings.some((f) => f.severity === "blocking") ? "blocked" : findings.length ? "needs-review" : "passed",
    findings,
    foreground: b,
    framing,
  };
  return { image: output, validation };
}

/** One scale for the entire sheet, fitted to its largest gesture and the neutral reference. */
export function studioSheetScale(source: StudioPixels, sheet: StudioSheet) {
  const bounds = sheet.cells
    .map((cell) => {
      const data = new Uint8ClampedArray(cell.width * cell.height * 4);
      for (let y = 0; y < cell.height; y++) {
        const start = ((cell.y + y) * source.width + cell.x) * 4;
        data.set(source.data.subarray(start, start + cell.width * 4), y * cell.width * 4);
      }
      if (cell.cleanup) removeStudioMatte(data, cell.width, cell.height, sheet.source?.matteHex);
      return { cell, bounds: foregroundBounds({ width: cell.width, height: cell.height, data }) };
    })
    .filter((item) => item.bounds.count);
  if (!bounds.length) return 1;
  const heights = bounds.map((item) => item.bounds.bottom - item.bounds.top + 1).sort((a, b) => a - b);
  const neutral = bounds.find((item) => item.cell.label === "neutral");
  const referenceHeight = neutral
    ? neutral.bounds.bottom - neutral.bounds.top + 1
    : heights[Math.floor(heights.length / 2)]!;
  return Math.min(
    (sheet.expectedHeight ?? 640) / referenceHeight,
    480 / Math.max(...bounds.map((item) => item.bounds.right - item.bounds.left + 1)),
    736 / heights.at(-1)!,
  );
}

export function analyzeStudioSheet(source: StudioPixels, sheet: StudioSheet): StudioValidation {
  const findings: StudioValidation["findings"] = [];
  const layout = sheet.layout;
  if (!layout) return { version: STUDIO_PROCESSING_VERSION, status: "passed", findings };
  const clean = source.data.slice();
  removeStudioMatte(clean, source.width, source.height, sheet.source?.matteHex);
  const cw = source.width / layout.cols,
    ch = source.height / layout.rows;
  let unused = 0,
    gutters = 0;
  for (let y = 0; y < source.height; y++)
    for (let x = 0; x < source.width; x++) {
      if (clean[(y * source.width + x) * 4 + 3] <= 16) continue;
      const col = Math.min(layout.cols - 1, Math.floor(x / cw)),
        row = Math.min(layout.rows - 1, Math.floor(y / ch));
      if (row * layout.cols + col >= layout.count) unused++;
      if (
        (col > 0 && x - col * cw < cw * 0.02) ||
        (col < layout.cols - 1 && (col + 1) * cw - x < cw * 0.02) ||
        (row > 0 && y - row * ch < ch * 0.02) ||
        (row < layout.rows - 1 && (row + 1) * ch - y < ch * 0.02)
      )
        gutters++;
    }
  if (unused > 10)
    findings.push({
      code: "unused-cell",
      severity: "review",
      message:
        "An expected empty sheet cell contains visible pixels. Inspect the entire source before approving slices.",
    });
  if (gutters > 10)
    findings.push({
      code: "sheet-gutter",
      severity: "review",
      message: "Visible pixels occupy shared sheet gutters. Slices may contain bleed or clipped gestures.",
    });
  return { version: STUDIO_PROCESSING_VERSION, status: findings.length ? "needs-review" : "passed", findings };
}
