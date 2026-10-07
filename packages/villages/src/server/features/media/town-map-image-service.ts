import type { inspectVillageImage } from "../../adapters/engine/image-files.js";
import type { readVillageVisualLoreEntries } from "../../adapters/engine/lorebooks.js";
import { badRequest } from "../../domain/rules/errors.js";
import { readSelectedLorebookIds } from "../../domain/rules/lore-policy.js";
import {
  MAX_TOWN_MAP_IMAGE_LENGTH,
  TOWN_MAP_EXPECTED_HEIGHT,
  TOWN_MAP_EXPECTED_WIDTH,
} from "../../domain/rules/prompt-preset.js";
import { coerceScenarioImprint } from "../../domain/rules/scenario-rules.js";
import { readSceneryStyle } from "../../domain/rules/scenery-context.js";
import {
  buildTownMapPrompt,
  buildTownMapNegativePrompt,
  fitMapContext,
} from "../../domain/rules/town-map-image-rules.js";
import type { generateVillageImage } from "./image-generation.js";
export type TownMapImagePorts = {
  readVillageVisualLoreEntries: typeof readVillageVisualLoreEntries;
  generateVillageImage: typeof generateVillageImage;
  inspectVillageImage: typeof inspectVillageImage;
};
/** A founding map recipe keeps lore, generation and inspection with its originating activation. */
export function createTownMapImage(ports: TownMapImagePorts) {
  const { readVillageVisualLoreEntries, generateVillageImage, inspectVillageImage } = ports;

  async function generateVillageTownMap(input: {
    structure?: unknown;
    setting?: unknown;
    options?: unknown;
    negative?: unknown;
    connectionId?: unknown;
    selectedLorebookIds?: unknown;
    scenarioImprint?: unknown;
    sceneryArtStyle?: unknown;
    useVisualLore?: unknown;
  }): Promise<{ image: string; width: number; height: number }> {
    const ids = readSelectedLorebookIds(input.selectedLorebookIds ?? []);
    if (input.useVisualLore !== undefined && typeof input.useVisualLore !== "boolean")
      throw badRequest("Visual lore must be on or off.");
    const style = input.sceneryArtStyle === undefined ? "" : readSceneryStyle(input.sceneryArtStyle);
    // Validate required inputs before lore reads or image dispatch.
    const base = buildTownMapPrompt(input.structure, input.setting, input.options, "", input.scenarioImprint, style);
    const negativePrompt = buildTownMapNegativePrompt(input.options, input.negative);
    const lore =
      input.useVisualLore === false
        ? []
        : await readVillageVisualLoreEntries(
            ids,
            [input.setting, JSON.stringify(coerceScenarioImprint(input.scenarioImprint))].filter(Boolean).join("\n"),
            900,
          );
    const prompt = fitMapContext(
      base,
      lore.map((entry) => "Compatible visual lore: " + entry),
    );
    const generated = await generateVillageImage({
      connectionId: typeof input.connectionId === "string" ? input.connectionId : undefined,
      name: "Village map",
      prompt,
      negativePrompt,
      width: TOWN_MAP_EXPECTED_WIDTH,
      height: TOWN_MAP_EXPECTED_HEIGHT,
      maxBase64Length: MAX_TOWN_MAP_IMAGE_LENGTH,
    });
    if (generated.dataUrl.length > MAX_TOWN_MAP_IMAGE_LENGTH) {
      throw badRequest(
        "The generated map exceeds the 8 million character storage limit. Try another image connection.",
      );
    }
    const size = await inspectVillageImage(generated.dataUrl);
    return { image: generated.dataUrl, ...size };
  }

  return { generateVillageTownMap };
}
export type TownMapImageService = ReturnType<typeof createTownMapImage>;
