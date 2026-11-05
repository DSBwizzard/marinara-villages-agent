import { guardedClockGeneration } from "../../adapters/time/clock-gate.js";
import { readSceneryStyleProfileId } from "../../domain/rules/image-style-profiles.js";
import type { loadEngineImageStyleSupport } from "../../adapters/engine/image-style-profiles.js";
import type { villageEngineJson } from "../../adapters/engine/engine-loopback.js";
import type { decodeVillageImageDataUrl, DecodedVillageImage } from "../../adapters/engine/image-files.js";
import type { readLoreImageReferences } from "../../adapters/engine/lore-image-references.js";
import { asRecord, asTrimmedString } from "../../domain/rules/coerce.js";
import { badRequest } from "../../domain/rules/errors.js";
import { imageEditSupport } from "../../domain/rules/image-edit-support.js";
import {
  imagePromptId,
  readPrompt,
  readDimension,
  MAX_IMAGE_PIXELS,
} from "../../domain/rules/image-generation-rules.js";
import type { villagesImageConnectionChoice } from "../settings/connections.js";
export type ImageGenerationPorts = {
  loadEngineImageStyleSupport?: typeof loadEngineImageStyleSupport;
  villageEngineJson: typeof villageEngineJson;
  villagesImageConnectionChoice: typeof villagesImageConnectionChoice;
  decodeVillageImageDataUrl: typeof decodeVillageImageDataUrl;
  readLoreImageReferences?: typeof readLoreImageReferences;
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

  async function styleSupport() {
    if (!ports.loadEngineImageStyleSupport)
      throw badRequest("Engine image styles are unavailable. Use a custom description.");
    return ports.loadEngineImageStyleSupport();
  }
  async function readProfiles() {
    const response = asRecord(await villageEngineJson<unknown>("/api/app-settings/ui"));
    let ui: Record<string, unknown> = {};
    try {
      if (typeof response.value === "string") ui = asRecord(JSON.parse(response.value));
    } catch {
      /* Engine also uses default profiles for malformed synced UI settings. */
    }
    const support = await styleSupport();
    return { support, settings: support.normalizeImageStyleProfileSettings(ui.imageStyleProfiles) };
  }
  async function readVillageImageStyleCatalog() {
    const { settings } = await readProfiles();
    return {
      defaultProfileId: settings.defaultProfileId,
      profiles: settings.profiles.map(({ id, name }) => ({ id, name })),
    };
  }
  async function generateVillageImage(input: {
    referenceImages?: string[];
    loreImages?: Parameters<typeof readLoreImageReferences>[0];
    beforeDispatch?: () => Promise<void>;
    connectionId?: string;
    sceneryStyleProfileId?: unknown;
    name: string;
    prompt: string;
    negativePrompt?: string;
    width: number;
    height: number;
    maxBase64Length: number;
  }): Promise<DecodedVillageImage> {
    let prompt = readPrompt(input.prompt);
    let negativePrompt = input.negativePrompt?.trim() || "";
    const profileId = readSceneryStyleProfileId(input.sceneryStyleProfileId);
    if (profileId !== null) {
      const { support, settings } = await readProfiles();
      const id = profileId || settings.defaultProfileId;
      if (!settings.profiles.some((row) => row.id === id))
        throw badRequest(
          "That image style profile is no longer available. Choose another Art style or Engine default.",
        );
      const compiled = support.compileImagePrompt({
        kind: "background",
        prompt,
        styleProfiles: settings,
        styleProfileId: id,
        hardNegative: negativePrompt,
        // Villages owns map/Zone geometry. Generic subject tags must not introduce a competing composition.
        omitProfileSubjectTags: true,
      });
      prompt = compiled.prompt;
      negativePrompt = compiled.negativePrompt;
      // The authored source retains its existing 4k limit; profiles have separate Engine-normalized bounds.
      if (!prompt.trim() || prompt.length > 16000 || negativePrompt.length > 16000)
        throw badRequest(
          "The Engine image style makes this prompt too long. Shorten the profile in Generation settings.",
        );
    }
    const width = readDimension(input.width, "Image width");
    const height = readDimension(input.height, "Image height");
    if (width * height > MAX_IMAGE_PIXELS) {
      throw badRequest(`Image dimensions can cover at most ${MAX_IMAGE_PIXELS.toLocaleString()} pixels.`);
    }
    const connectionId = await resolveVillageImageConnectionId(input.connectionId);
    let referenceImages = input.referenceImages;
    if (input.loreImages?.length) {
      const images = [...new Map(input.loreImages.map((image) => [image.path, image])).values()];
      const count = images.length + (referenceImages?.length ?? 0);
      if (count > 4)
        throw badRequest(
          `This artwork needs ${count} reference images; Engine accepts at most 4. Reduce the matching Lorebook images and retry. No image request was made.`,
        );
      const support = await resolveVillageImageEditing(connectionId);
      if (!support || count > support.maxReferences)
        throw badRequest(
          "The image connection or its fallback cannot use these Lorebook reference images. Choose a connection that supports them, then retry. No image request was made.",
        );
      if (!ports.readLoreImageReferences)
        throw badRequest("Lorebook reference images are unavailable. Reload Villages and retry.");
      referenceImages = [...(referenceImages ?? []), ...(await ports.readLoreImageReferences(images))];
      if ((await resolveVillageImageEditing(connectionId))?.signature !== support.signature)
        throw badRequest(
          "The image connection changed while loading Lorebook images. Retry artwork deliberately. No image request was made.",
        );
    }
    const name = input.name.trim() || "Village image";
    await input.beforeDispatch?.();
    const answer = asRecord(
      await guardedClockGeneration(() =>
        villageEngineJson<unknown>(IMAGE_GENERATION_PATH, {
          body: {
            connectionId,
            referenceImages,
            name,
            appearance: prompt,
            purpose: "avatar",
            width,
            height,
            promptOverrides: [
              {
                id: imagePromptId(name),
                prompt,
                negativePrompt: negativePrompt || undefined,
              },
            ],
          },
        }),
      ),
    );
    return decodeVillageImageDataUrl(answer.image, {
      label: "generated image",
      maxBase64Length: input.maxBase64Length,
    });
  }

  async function resolveVillageImageEditing(explicit = "") {
    if (!explicit) {
      const choice = await villagesImageConnectionChoice();
      if (!choice.enabled) return null;
    }
    const connectionId = await resolveVillageImageConnectionId(explicit);
    const listed = await villageEngineJson<unknown>("/api/connections");
    if (!Array.isArray(listed)) return null;
    const rows = listed.map(asRecord);
    const primary = rows.find((row) => row.id === connectionId);
    if (!primary || imageEditSupport(primary).status !== "supported") return null;
    const fallbacks = rows.filter(
      (row) =>
        row.provider === "image_generation" &&
        (row.fallbackForAgents === true || row.fallbackForAgents === "true") &&
        row.profileImportReviewRequired !== true &&
        row.profileImportReviewRequired !== "true" &&
        row.id !== connectionId,
    );
    if (fallbacks.some((row) => imageEditSupport(row).status !== "supported")) return null;
    const relevant = [primary, ...fallbacks];
    return {
      connectionId,
      multiple: relevant.every((row) => imageEditSupport(row).multiple),
      maxReferences: Math.min(...relevant.map((row) => imageEditSupport(row).maxReferences)),
      signature: JSON.stringify(
        relevant.map((row) => [
          row.id,
          row.model,
          row.baseUrl,
          row.imageService,
          row.imageGenerationSource,
          row.comfyuiWorkflow,
          row.defaultParameters,
        ]),
      ),
    };
  }
  return {
    resolveVillageImageConnectionId,
    generateVillageImage,
    readVillageImageStyleCatalog,
    resolveVillageImageEditing,
  };
}
export type ImageGenerationService = ReturnType<typeof createImageGeneration>;
