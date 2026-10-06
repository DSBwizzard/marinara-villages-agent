import { type DecodedVillageImage, inspectVillageImage } from "../../adapters/engine/image-files.js";
import { badRequest } from "../../domain/rules/errors.js";
import { PNG } from "pngjs";

/** Preserve the original separately; the reusable derivative is dark ink on transparency. */
export async function prepareSignatureImage(decoded: DecodedVillageImage) {
  const size = await inspectVillageImage(decoded.dataUrl);
  let pixels: { width: number; height: number; data: Uint8Array };
  if (decoded.mime === "image/png") {
    const png = PNG.sync.read(Buffer.from(decoded.bytes));
    if (png.width !== size.width || png.height !== size.height) throw badRequest("Signature dimensions changed.");
    pixels = png;
  } else {
    const { default: sharp } = await import("sharp");
    const { data, info } = await sharp(Buffer.from(decoded.bytes), { limitInputPixels: 16_000_000 })
      .rotate()
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    pixels = { ...info, data };
  }
  return { originalSize: size, ...trimSignaturePixels(pixels) };
}

export function trimSignaturePixels(pixels: { width: number; height: number; data: Uint8Array }) {
  const { width, height, data } = pixels;
  let left = width,
    top = height,
    right = -1,
    bottom = -1;
  const alpha = new Uint8Array(width * height);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const index = y * width + x,
        offset = index * 4;
      const luminance = 0.2126 * data[offset]! + 0.7152 * data[offset + 1]! + 0.0722 * data[offset + 2]!;
      const ink = Math.round(data[offset + 3]! * Math.min(1, (255 - luminance) / 200));
      alpha[index] = ink < 18 ? 0 : ink;
      if (alpha[index]) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  if (right < left) throw badRequest("The generated signature is blank. Your local signature is still available.");
  const padding = Math.max(4, Math.round(Math.max(right - left, bottom - top) * 0.03));
  left = Math.max(0, left - padding);
  top = Math.max(0, top - padding);
  right = Math.min(width - 1, right + padding);
  bottom = Math.min(height - 1, bottom + padding);
  const result = new PNG({ width: right - left + 1, height: bottom - top + 1 });
  for (let y = top; y <= bottom; y++)
    for (let x = left; x <= right; x++) {
      const offset = ((y - top) * result.width + x - left) * 4;
      result.data[offset] = 48;
      result.data[offset + 1] = 43;
      result.data[offset + 2] = 35;
      result.data[offset + 3] = alpha[y * width + x]!;
    }
  return { bytes: PNG.sync.write(result), width: result.width, height: result.height };
}
