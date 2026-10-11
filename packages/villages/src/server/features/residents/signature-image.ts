import { type DecodedVillageImage, inspectVillageImage } from "../../adapters/engine/image-files.js";
import { badRequest } from "../../domain/rules/errors.js";
import { PNG } from "pngjs";

/** Preserve provider bytes; normalize only the reusable dark-ink derivative. */
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
    .resize(880, 280, { fit: "inside" })
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
  const alpha = new Uint8Array(width * height);
  let borderInk = 0;
  // A broad opaque mid-gray plateau is a matte, not black pen ink. Its
  // darkest common shade becomes the removal threshold (also inside margins).
  const shades = new Uint32Array(20);
  for (let offset = 0; offset < data.length; offset += 4) {
    const luminance = 0.2126 * data[offset]! + 0.7152 * data[offset + 1]! + 0.0722 * data[offset + 2]!;
    if (data[offset + 3]! >= 240 && luminance >= 40 && luminance < 160) shades[Math.floor(luminance / 8)]!++;
  }
  let matte = 160;
  for (let shade = 5; shade < shades.length; shade++) {
    if (shades[shade]! > width * height * 0.1) {
      matte = shade * 8;
      break;
    }
  }
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const index = y * width + x,
        offset = index * 4;
      const luminance = 0.2126 * data[offset]! + 0.7152 * data[offset + 1]! + 0.0722 * data[offset + 2]!;
      // Black-ink artwork: discard light matte/checkerboard shades rather than
      // converting every non-white pixel into a translucent brown rectangle.
      // Keep native alpha (including antialiased strokes) multiplicatively.
      const ink = Math.round(
        data[offset + 3]! * Math.max(0, Math.min(1, (matte - luminance) / Math.max(1, matte - 40))),
      );
      alpha[index] = ink < 12 ? 0 : ink;
      if (alpha[index] && (x === 0 || y === 0 || x === width - 1 || y === height - 1)) borderInk++;
    }
  if (borderInk > (2 * width + 2 * height - 4) * 0.2)
    throw badRequest(
      "The generated signature has a dark background or cropped strokes. Your previous signature is still available; try generating again.",
    );

  // Ignore isolated compression specks when finding bounds. Detached dots and
  // doodles survive as independent components; there is no largest-blob crop.
  const visited = new Uint8Array(width * height);
  const minimum = Math.max(2, Math.min(8, Math.round((width * height) / 500_000)));
  for (let start = 0; start < alpha.length; start++) {
    if (!alpha[start] || visited[start]) continue;
    const component = [start];
    visited[start] = 1;
    for (let cursor = 0; cursor < component.length; cursor++) {
      const index = component[cursor]!,
        x = index % width,
        y = Math.floor(index / width);
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx,
            ny = y + dy;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          const next = ny * width + nx;
          if (alpha[next] && !visited[next]) {
            visited[next] = 1;
            component.push(next);
          }
        }
    }
    if (component.length < minimum) {
      for (const index of component) alpha[index] = 0;
      continue;
    }
    for (const index of component) {
      const x = index % width,
        y = Math.floor(index / width);
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }
  if (right < left)
    throw badRequest("The generated signature is blank or too faint. Your local signature is still available.");
  const area = (right - left + 1) * (bottom - top + 1);
  if (area > width * height * 0.25) {
    let solid = 0;
    for (const value of alpha) if (value >= 240) solid++;
    if (solid > area * 0.9)
      throw badRequest(
        "The generated signature is a solid background rather than an ink mark. Your previous signature is still available; try generating again.",
      );
  }
  if (left === 0 || top === 0 || right === width - 1 || bottom === height - 1)
    throw badRequest(
      "The generated signature reaches the canvas edge and may be cropped. Your previous signature is still available; try generating again.",
    );
  const padding = Math.max(2, Math.round(Math.min(right - left + 1, bottom - top + 1) * 0.06));
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
