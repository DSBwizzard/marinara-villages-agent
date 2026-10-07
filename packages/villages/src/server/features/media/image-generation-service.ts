import type { villageEngineJson } from "../../adapters/engine/engine-loopback.js";
import type { decodeVillageImageDataUrl, DecodedVillageImage } from "../../adapters/engine/image-files.js";
import { asRecord, asTrimmedString } from "../../domain/rules/coerce.js";
import { badRequest } from "../../domain/rules/errors.js";
import {
  imagePromptId,
  readPrompt,
  readDimension,
  MAX_IMAGE_PIXELS,
} from "../../domain/rules/image-generation-rules.js";
import type { villagesImageConnectionChoice } from "../settings/connections.js";
export type ImageGenerationPorts = {
  villageEngineJson: typeof villageEngineJson;
  villagesImageConnectionChoice: typeof villagesImageConnectionChoice;
  decodeVillageImageDataUrl: typeof decodeVillageImageDataUrl;
};
/** Cheap validation, connection selection, one Engine dispatch and decoding share one owner. */
export function createImageGeneration(ports: ImageGenerationPorts) {
  const { villageEngineJson, villagesImageConnectionChoice, decodeVillageImageDataUrl } = ports;

  const IMAGE_GENERATION_PATH = "/api/characters/avatar-generation";

  async function resolveVillageImageConnectionId(explicit = ""): Promise<string> {
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

  async function generateVillageImage(input: {
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

  return { resolveVillageImageConnectionId, generateVillageImage };
}
export type ImageGenerationService = ReturnType<typeof createImageGeneration>;
