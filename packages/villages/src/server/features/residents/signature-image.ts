import { type DecodedVillageImage, inspectVillageImage } from "../../adapters/engine/image-files.js";
import { badRequest } from "../../domain/rules/errors.js";
import { PNG } from "pngjs";

/** Preserve provider bytes; prepare the reusable color derivative. */
export async function prepareSignatureImage(decoded: DecodedVillageImage) {
  const size = await inspectVillageImage(decoded.dataUrl);
  const { default: sharp } = await import("sharp");
  let pixels: { width: number; height: number; data: Uint8Array };
  if (decoded.mime === "image/png") {
    const png = PNG.sync.read(Buffer.from(decoded.bytes));
    if (png.width !== size.width || png.height !== size.height) throw badRequest("Signature dimensions changed.");
    pixels = png;
  } else {
    const { data, info } = await sharp(Buffer.from(decoded.bytes), { limitInputPixels: 16_000_000 })
      .rotate()
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    pixels = { ...info, data };
  }
  const trimmed = trimSignaturePixels(pixels);
  // A provider's canvas request is advisory. Fit the actual mark locally to
  // four times the CSS display size; initials fill height, long hands fill width.
  const { data, info } = await sharp(trimmed.bytes)
    .resize(1120, 960, { fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer({ resolveWithObject: true });
  return { originalSize: size, bytes: data, width: info.width, height: info.height };
}

export function trimSignaturePixels(pixels: { width: number; height: number; data: Uint8Array }) {
  const { width, height, data } = pixels;
  let left = width,
    top = height,
    right = -1,
    bottom = -1;
  // Preserve native transparency. Only an opaque canvas needs white extraction.
  const background = new Uint8Array(width * height);
  const opaque = data.every((value, index) => index % 4 !== 3 || value === 255);
  if (opaque) {
    const queue = new Uint32Array(width * height);
    let count = 0;
    const visit = (index: number) => {
      if (background[index]) return;
      const offset = index * 4;
      if (data[offset]! < 245 || data[offset + 1]! < 245 || data[offset + 2]! < 245) return;
      background[index] = 1;
      queue[count++] = index;
    };
    for (let x = 0; x < width; x++) {
      visit(x);
      visit((height - 1) * width + x);
    }
    for (let y = 0; y < height; y++) {
      visit(y * width);
      visit(y * width + width - 1);
    }
    for (let cursor = 0; cursor < count; cursor++) {
      const index = queue[cursor]!,
        x = index % width;
      if (x > 0) visit(index - 1);
      if (x < width - 1) visit(index + 1);
      if (index >= width) visit(index - width);
      if (index < width * (height - 1)) visit(index + width);
    }
  }
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      if (!background[index] && data[index * 4 + 3]) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  if (right < left) throw badRequest("The generated signature is blank. Your local signature is still available.");
  const padding = Math.max(2, Math.round(Math.min(right - left + 1, bottom - top + 1) * 0.06));
  left = Math.max(0, left - padding);
  top = Math.max(0, top - padding);
  right = Math.min(width - 1, right + padding);
  bottom = Math.min(height - 1, bottom + padding);
  const result = new PNG({ width: right - left + 1, height: bottom - top + 1 });
  for (let y = top; y <= bottom; y++)
    for (let x = left; x <= right; x++) {
      const offset = ((y - top) * result.width + x - left) * 4;
      const source = (y * width + x) * 4;
      result.data[offset] = data[source]!;
      result.data[offset + 1] = data[source + 1]!;
      result.data[offset + 2] = data[source + 2]!;
      result.data[offset + 3] = background[y * width + x] ? 0 : data[source + 3]!;
    }
  return { bytes: PNG.sync.write(result), width: result.width, height: result.height };
}
