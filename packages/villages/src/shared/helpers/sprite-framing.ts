import { SPRITE_CANVAS, type SpriteFrame } from "../contracts/sprites.js";

export type SpritePixels = { width: number; height: number; data: Uint8ClampedArray };
export function initialSpriteFrame(width: number, height: number): SpriteFrame {
  return { x: 0, y: 0, width, height, scale: 1, offsetX: 0, offsetY: 0 };
}
export function validateSpriteFrame(frame: SpriteFrame, source: Pick<SpritePixels, "width" | "height">) {
  if (
    ![frame.x, frame.y, frame.width, frame.height].every(Number.isInteger) ||
    frame.x < 0 ||
    frame.y < 0 ||
    frame.width < 1 ||
    frame.height < 1 ||
    frame.x + frame.width > source.width ||
    frame.y + frame.height > source.height
  )
    throw new Error("Choose a crop inside the original image.");
  if (
    ![frame.scale, frame.offsetX, frame.offsetY].every(Number.isFinite) ||
    frame.scale < 0.05 ||
    frame.scale > 10 ||
    Math.abs(frame.offsetX) > 1024 ||
    Math.abs(frame.offsetY) > 1536
  )
    throw new Error("Choose a scale from 0.05 to 10 and offsets inside the canvas.");
  if (
    (frame.headY !== undefined &&
      (!Number.isFinite(frame.headY) || frame.headY < frame.y || frame.headY >= frame.y + frame.height)) ||
    (frame.footY !== undefined &&
      (!Number.isFinite(frame.footY) || frame.footY <= frame.y || frame.footY > frame.y + frame.height)) ||
    (frame.headY !== undefined && frame.footY !== undefined && frame.headY >= frame.footY)
  )
    throw new Error("Head and foot markers must be in the crop, with the head above the feet.");
}
/** Shared browser/server framing. Alpha is never removed or inferred from color. */
export function renderSpritePixels(source: SpritePixels, frame: SpriteFrame) {
  validateSpriteFrame(frame, source);
  let left = source.width,
    top = source.height,
    right = -1,
    bottom = -1,
    transparent = false;
  for (let y = frame.y; y < frame.y + frame.height; y++)
    for (let x = frame.x; x < frame.x + frame.width; x++) {
      const alpha = source.data[(y * source.width + x) * 4 + 3]!;
      if (alpha < 255) transparent = true;
      if (alpha <= 0) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  if (right < left) throw new Error("The crop contains no visible artwork.");
  const w = right - left + 1,
    h = bottom - top + 1;
  const head = frame.headY ?? top,
    foot = frame.footY ?? bottom + 1;
  if (foot <= head) throw new Error("Place the foot marker below the head marker.");
  const marked = frame.headY !== undefined || frame.footY !== undefined;
  const base = marked
    ? SPRITE_CANVAS.bodyHeight / (foot - head)
    : Math.min(SPRITE_CANVAS.bodyHeight / h, 960 / w, 1472 / h);
  const scale = base * frame.scale;
  const x = (1024 - w * scale) / 2 + frame.offsetX;
  const y = SPRITE_CANVAS.baseline - (foot - top) * scale + frame.offsetY;
  const clipped = x < 32 - 0.001 || y < 32 - 0.001 || x + w * scale > 992.001 || y + h * scale > 1504.001;
  const warnings: string[] = [];
  if (!transparent)
    warnings.push(
      "This artwork has an opaque background. It will remain visible; prepare transparency elsewhere if desired.",
    );
  if (scale > 1.01) warnings.push("The source is smaller than its displayed artwork. Enlarging it may look soft.");
  if (clipped)
    warnings.push("Artwork exceeds the safe margin. Reduce scale or adjust the crop and position before saving.");
  const output: SpritePixels = { width: 1024, height: 1536, data: new Uint8ClampedArray(1024 * 1536 * 4) };
  for (let dy = Math.max(0, Math.floor(y)); dy < Math.min(1536, Math.ceil(y + h * scale)); dy++)
    for (let dx = Math.max(0, Math.floor(x)); dx < Math.min(1024, Math.ceil(x + w * scale)); dx++) {
      const sx = left + (dx + 0.5 - x) / scale - 0.5,
        sy = top + (dy + 0.5 - y) / scale - 0.5;
      const x0 = Math.floor(sx),
        y0 = Math.floor(sy),
        fx = sx - x0,
        fy = sy - y0;
      let alpha = 0;
      const colors = [0, 0, 0];
      for (const [px, py, weight] of [
        [x0, y0, (1 - fx) * (1 - fy)],
        [x0 + 1, y0, fx * (1 - fy)],
        [x0, y0 + 1, (1 - fx) * fy],
        [x0 + 1, y0 + 1, fx * fy],
      ]) {
        if (px! < frame.x || py! < frame.y || px! >= frame.x + frame.width || py! >= frame.y + frame.height) continue;
        const pos = (py! * source.width + px!) * 4,
          a = source.data[pos + 3]! * weight!;
        alpha += a;
        for (let c = 0; c < 3; c++) colors[c]! += source.data[pos + c]! * a;
      }
      const dest = (dy * 1024 + dx) * 4;
      output.data[dest + 3] = alpha;
      if (alpha) for (let c = 0; c < 3; c++) output.data[dest + c] = colors[c]! / alpha;
    }
  return { image: output, clipped, warnings };
}
