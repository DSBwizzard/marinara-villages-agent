import { PNG } from "pngjs";
import { badRequest } from "../../domain/rules/errors.js";
import { decodeVillageImageDataUrl } from "../../adapters/engine/image-files.js";
import type { SpritePixels } from "../../../shared/helpers/sprite-framing.js";

/** Image inspection belongs to the caller's Engine connection. */
export function createSpriteImageDecoder(
  inspectVillageImage: (image: string) => Promise<{ width: number; height: number }>,
) {
  async function decodeSpriteImage(image: string): Promise<SpritePixels> {
    const decoded = decodeVillageImageDataUrl(image, { label: "sprite", maxBase64Length: 16_000_000 });
    if (!["image/png", "image/jpeg", "image/webp"].includes(decoded.mime))
      throw badRequest("Choose a PNG, WebP, or JPEG image.");
    const size = await inspectVillageImage(image);
    try {
      if (decoded.mime === "image/png") {
        const png = PNG.sync.read(Buffer.from(decoded.bytes));
        if (png.width !== size.width || png.height !== size.height) throw new Error("Image dimensions changed");
        return { ...size, data: new Uint8ClampedArray(png.data) };
      }
      const { default: sharp } = await import("sharp");
      const { data, info } = await sharp(Buffer.from(decoded.bytes), { limitInputPixels: 16_000_000 })
        .rotate()
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      return { width: info.width, height: info.height, data: new Uint8ClampedArray(data) };
    } catch {
      throw badRequest("This image is corrupt or could not be decoded. Choose another PNG, WebP, or JPEG.");
    }
  }

  return decodeSpriteImage;
}

export function spritePng(image: SpritePixels) {
  return (
    "data:image/png;base64," +
    PNG.sync
      .write({ width: image.width, height: image.height, data: Buffer.from(image.data) } as PNG)
      .toString("base64")
  );
}
