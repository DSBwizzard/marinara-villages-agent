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
  const trimmed = await trimSignatureImage(pixels);
  // A provider's canvas request is advisory. Fit the actual mark locally to
  // four times the CSS display size; initials fill height, long hands fill width.
  const { data, info } = await sharp(trimmed.bytes)
    .resize(1120, 960, { fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer({ resolveWithObject: true });
  return { originalSize: size, bytes: data, width: info.width, height: info.height };
}

/** Estimate slowly varying light paper separately from the much thinner ink. */
export async function trimSignatureImage(pixels: { width: number; height: number; data: Uint8Array }) {
  const { default: sharp } = await import("sharp");
  const { width, height, data } = pixels;
  const paperSmall = await sharp(data, { raw: { width, height, channels: 4 } })
    .flatten({ background: "#fff" })
    .resize(256, 256, { fit: "inside", withoutEnlargement: true })
    .median(9)
    .png()
    .toBuffer();
  const paper = await sharp(paperSmall).resize(width, height).removeAlpha().raw().toBuffer();
  const normalized = new Uint8Array(data);
  for (let index = 0; index < width * height; index++) {
    const offset = index * 3;
    const low = Math.min(paper[offset]!, paper[offset + 1]!, paper[offset + 2]!);
    const high = Math.max(paper[offset]!, paper[offset + 1]!, paper[offset + 2]!);
    // Only light, near-neutral fields are plausible paper. Do not normalize
    // colored marks or estimate paper from a dark, solid part of the artwork.
    if (low < 180 || high - low > 15) continue;
    for (let channel = 0; channel < 3; channel++) {
      normalized[index * 4 + channel] = Math.min(
        255,
        Math.round((data[index * 4 + channel]! * 255) / paper[offset + channel]!),
      );
    }
  }
  return trimSignaturePixels({ width, height, data: normalized });
}

export function trimSignaturePixels(pixels: { width: number; height: number; data: Uint8Array }) {
  const { width, height, data } = pixels;
  let left = width,
    top = height,
    right = -1,
    bottom = -1;
  // These are ink marks on white paper, not filled illustrations. Remove the
  // white contribution everywhere, including enclosed holes and antialiased
  // strokes. Keeping the observed RGB would leave a pale fringe on the notebook.
  const alpha = new Uint8Array(width * height);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const index = y * width + x,
        offset = index * 4;
      const coverage = 255 - Math.min(data[offset]!, data[offset + 1]!, data[offset + 2]!);
      alpha[index] = coverage <= 10 ? 0 : Math.round((data[offset + 3]! * coverage) / 255);
      if (alpha[index]) {
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
      const coverage = 255 - Math.min(data[source]!, data[source + 1]!, data[source + 2]!);
      for (let channel = 0; channel < 3; channel++) {
        result.data[offset + channel] = alpha[y * width + x]
          ? Math.round((255 * (data[source + channel]! - (255 - coverage))) / coverage)
          : 0;
      }
      result.data[offset + 3] = alpha[y * width + x]!;
    }
  return { bytes: PNG.sync.write(result), width: result.width, height: result.height };
}
