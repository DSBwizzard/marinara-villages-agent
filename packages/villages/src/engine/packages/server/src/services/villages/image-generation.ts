import { asRecord, asTrimmedString } from "./coerce.js";
import { villagesImageConnectionChoice } from "./connections.js";
import { villageEngineJson } from "./engine-loopback.js";
import { badRequest } from "./errors.js";
import { type DecodedVillageImage, decodeVillageImageDataUrl } from "./image-files.js";

// Villages — the shared boundary for user-triggered image generation.
//
// Every generated image in Villages comes through this file. It validates the
// cheap facts first, resolves the connection once, makes one generation call,
// and validates the returned bytes before a caller stores them. Map art uses it
// today; venue interiors share this path. Finished sprites use image-files.ts only.

export { decodeVillageImageDataUrl, inspectVillageImage } from "./image-files.js";

const IMAGE_GENERATION_PATH = "/api/characters/avatar-generation";
const MAX_IMAGE_PROMPT_LENGTH = 4_000;
const MAX_IMAGE_DIMENSION = 4_096;
const MAX_IMAGE_PIXELS = 16_000_000;

export function imagePromptId(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);
  return `avatar:${slug || "character"}`;
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
