// Villages — the shared boundary for user-triggered image generation.
//
// Every generated image in Villages comes through this file. It validates the
// cheap facts first, resolves the connection once, makes one generation call,
// and validates the returned bytes before a caller stores them. Map art uses it
// today; venue interiors and character sheets can use the same path later.

import { villagesImageConnectionChoice } from "./connections.js";
import { asRecord, asTrimmedString } from "./coerce.js";
import { villageEngineJson } from "./engine-loopback.js";
import { badRequest, VillagesRequestError } from "./errors.js";

const IMAGE_GENERATION_PATH = "/api/characters/avatar-generation";
const MAX_IMAGE_PROMPT_LENGTH = 4_000;
const MAX_IMAGE_DIMENSION = 4_096;
const MAX_IMAGE_PIXELS = 16_000_000;

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

export function imagePromptId(name: string, purpose: "avatar" | "character-sheet" = "avatar"): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);
  return `${purpose === "character-sheet" ? "character-sheet" : "avatar"}:${slug || "character"}`;
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
  const binary = atob(encoded);
  if (binary.length === 0) throw badRequest(`The ${options.label} is empty.`);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return { dataUrl: text, mime: match[1]!.toLowerCase(), bytes };
}

export async function resolveVillageImageConnectionId(explicit = ""): Promise<string> {
  const trimmed = explicit.trim();
  if (trimmed.length > 0) return trimmed;

  const choice = await villagesImageConnectionChoice();
  if (!choice.enabled) throw badRequest("Image generation is disabled for this village.");
  const chosen = choice.connectionId ?? "";
  if (chosen.trim().length > 0) return chosen.trim();

  const listed = await villageEngineJson<unknown>("/api/connections");
  const rows = Array.isArray(listed) ? listed.map(asRecord) : [];
  const imageRows = rows.filter((row) => asTrimmedString(row.provider) === "image_generation");
  const preferred = imageRows.find((row) => row.isDefault === true || row.isDefault === "true") ?? imageRows[0];
  const id = preferred ? asTrimmedString(preferred.id) : "";
  if (id.length > 0) return id;
  throw badRequest("No image connection is set up. Add one in the Engine's settings, or upload an image instead.");
}

function readPrompt(value: unknown): string {
  const prompt = typeof value === "string" ? value.trim() : "";
  if (prompt.length === 0) throw badRequest("The image prompt cannot be blank.");
  if (prompt.length > MAX_IMAGE_PROMPT_LENGTH) {
    throw badRequest(`The image prompt can be at most ${MAX_IMAGE_PROMPT_LENGTH} characters.`);
  }
  return prompt;
}

function readDimension(value: number, label: string): number {
  if (!Number.isInteger(value) || value <= 0 || value > MAX_IMAGE_DIMENSION) {
    throw badRequest(`${label} must be a positive integer no larger than ${MAX_IMAGE_DIMENSION}.`);
  }
  return value;
}

export async function generateVillageImage(input: {
  connectionId?: string;
  name: string;
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  maxBase64Length: number;
}): Promise<DecodedVillageImage> {
  const prompt = readPrompt(input.prompt);
  const width = readDimension(input.width, "Image width");
  const height = readDimension(input.height, "Image height");
  if (width * height > MAX_IMAGE_PIXELS) {
    throw badRequest(`Image dimensions can cover at most ${MAX_IMAGE_PIXELS.toLocaleString()} pixels.`);
  }
  const connectionId = await resolveVillageImageConnectionId(input.connectionId);
  const name = input.name.trim() || "Village image";
  const answer = asRecord(
    await villageEngineJson<unknown>(IMAGE_GENERATION_PATH, {
      body: {
        connectionId,
        name,
        appearance: prompt,
        purpose: "avatar",
        width,
        height,
        promptOverrides: [
          {
            id: imagePromptId(name),
            prompt,
            negativePrompt: input.negativePrompt?.trim() || undefined,
          },
        ],
      },
    }),
  );
  return decodeVillageImageDataUrl(answer.image, {
    label: "generated image",
    maxBase64Length: input.maxBase64Length,
  });
}
