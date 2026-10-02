import { PNG } from "pngjs";
import { decodeVillageImageDataUrl } from "./image-generation.js";
import { studioAsset, studioCleanup } from "./sprite-studio-engine.js";
import {
  processStudioCell,
  validateStudioExport,
  STUDIO_PROCESSING_VERSION,
  type StudioPixels,
} from "./sprite-studio-pixels.js";
import { validateStudioCell, type StudioCell, type StudioSheet } from "./sprite-studio-model.js";

export function decodeStudioPng(image: string): StudioPixels {
  const decoded = decodeVillageImageDataUrl(image, { label: "sprite", maxBase64Length: 16000000 });
  const header = new DataView(decoded.bytes.buffer, decoded.bytes.byteOffset, decoded.bytes.byteLength);
  if (
    decoded.mime !== "image/png" ||
    decoded.bytes.length < 24 ||
    header.getUint32(16) * header.getUint32(20) > 16000000 ||
    header.getUint32(16) > 8192 ||
    header.getUint32(20) > 8192
  )
    throw new Error("Choose a safe PNG image for sprite processing.");
  const png = PNG.sync.read(Buffer.from(decoded.bytes));
  return { width: png.width, height: png.height, data: new Uint8ClampedArray(png.data) };
}
export function encodeStudioPng(image: StudioPixels) {
  return (
    "data:image/png;base64," +
    PNG.sync.write({ width: image.width, height: image.height, data: Buffer.from(image.data) }).toString("base64")
  );
}
export async function decodeStudioSource(image: string): Promise<StudioPixels> {
  if (image.startsWith("data:image/png;")) return decodeStudioPng(image);
  const decoded = decodeVillageImageDataUrl(image, { label: "sprite source", maxBase64Length: 16000000 });
  // Existing optional runtime dependency, never installed or modified by Villages.
  const { default: sharp } = await import("sharp");
  const { data, info } = await sharp(Buffer.from(decoded.bytes), { limitInputPixels: 16000000 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { width: info.width, height: info.height, data: new Uint8ClampedArray(data) };
}
export async function processedStudioCell(
  sheet: StudioSheet,
  cell: StudioCell,
  engine: "studio" | "builtin" | "backgroundremover" = cell.cleanupEngine ?? "studio",
  raw?: string,
  decodedSource?: StudioPixels,
) {
  validateStudioCell(cell, sheet);
  const original = raw ?? (await studioAsset(sheet.url));
  const source =
    decodedSource ??
    (await decodeStudioSource(
      engine === "studio" || cell.cleanup === false ? original : await studioCleanup(original, engine),
    ));
  if (source.width !== sheet.width || source.height !== sheet.height)
    throw new Error("Saved source dimensions changed.");
  // A successful host response can still contain the requested chroma backdrop.
  // Always run the shared, evidenced local cleanup before bounds and export.
  const result = processStudioCell(source, sheet, cell);
  return { image: encodeStudioPng(result.image), validation: result.validation, version: STUDIO_PROCESSING_VERSION };
}
export function validateStudioPng(image: string) {
  return validateStudioExport(decodeStudioPng(image));
}
