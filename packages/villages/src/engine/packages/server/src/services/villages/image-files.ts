import { asRecord } from "./coerce.js";
import { villageEngineJson } from "./engine-transport.js";
import { badRequest, VillagesRequestError } from "./errors.js";

export type DecodedVillageImage = { dataUrl: string; mime: string; bytes: Uint8Array };

export async function inspectVillageImage(image: string): Promise<{ width: number; height: number }> {
  let answer: Record<string, unknown>;
  try {
    answer = asRecord(await villageEngineJson<unknown>("/api/image-metadata/inspect", { body: { image } }));
  } catch (error) {
    // The package also runs on earlier 2.4.6 hosts while this shared endpoint rolls out.
    if (!(error instanceof VillagesRequestError) || !error.message.includes("(404)")) throw error;
    const decoded = decodeVillageImageDataUrl(image, { label: "map image", maxBase64Length: 8_000_000 });
    const size = fallbackImageDimensions(decoded.bytes);
    if (!size)
      throw badRequest(
        "This Engine cannot inspect the image format. Update the Engine or use PNG, JPEG, WebP, or GIF.",
      );
    answer = size;
  }
  const width = answer.width;
  const height = answer.height;
  if (
    typeof width !== "number" ||
    typeof height !== "number" ||
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1 ||
    width > 8192 ||
    height > 8192 ||
    width * height > 16_000_000
  ) {
    throw badRequest("The Engine could not read safe dimensions from this image.");
  }
  return { width, height };
}

function fallbackImageDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length >= 24 && bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71) {
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }
  if (bytes.length >= 10 && bytes[0] === 71 && bytes[1] === 73 && bytes[2] === 70) {
    return { width: view.getUint16(6, true), height: view.getUint16(8, true) };
  }
  if (bytes.length >= 30 && bytes[0] === 82 && bytes[1] === 73 && bytes[8] === 87 && bytes[9] === 69) {
    const tag = String.fromCharCode(...bytes.subarray(12, 16));
    if (tag === "VP8X")
      return {
        width: 1 + bytes[24]! + (bytes[25]! << 8) + (bytes[26]! << 16),
        height: 1 + bytes[27]! + (bytes[28]! << 8) + (bytes[29]! << 16),
      };
    if (tag === "VP8 ") return { width: view.getUint16(26, true) & 0x3fff, height: view.getUint16(28, true) & 0x3fff };
    if (tag === "VP8L")
      return {
        width: 1 + (((bytes[22]! & 0x3f) << 8) | bytes[21]!),
        height: 1 + (((bytes[24]! & 0x0f) << 10) | (bytes[23]! << 2) | (bytes[22]! >> 6)),
      };
  }
  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) return null;
      const marker = bytes[offset + 1]!;
      const length = (bytes[offset + 2]! << 8) | bytes[offset + 3]!;
      if (marker === 0xda || marker === 0xd9 || length < 2 || offset + length + 2 > bytes.length) return null;
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return {
          width: (bytes[offset + 7]! << 8) | bytes[offset + 8]!,
          height: (bytes[offset + 5]! << 8) | bytes[offset + 6]!,
        };
      }
      offset += length + 2;
    }
  }
  return null;
}

export function decodeVillageImageDataUrl(
  value: unknown,
  options: { label: string; maxBase64Length: number; tooLargeMessage?: string },
): DecodedVillageImage {
  const text = typeof value === "string" ? value.trim() : "";
  if (text.length === 0) throw badRequest(`The ${options.label} is empty.`);
  const match = /^data:(image\/[a-z0-9.+-]+);base64,([a-z0-9+/]+=*)$/i.exec(text);
  if (!match) throw badRequest(`The ${options.label} is not a base64 image file.`);
  const encoded = match[2]!;
  if (encoded.length > options.maxBase64Length) {
    throw badRequest(options.tooLargeMessage ?? `The ${options.label} is too large to store.`);
  }
  let binary: string;
  try {
    binary = atob(encoded);
  } catch {
    throw badRequest(`The ${options.label} has invalid image data. Choose another file.`);
  }
  if (binary.length === 0) throw badRequest(`The ${options.label} is empty.`);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return { dataUrl: text, mime: match[1]!.toLowerCase(), bytes };
}
