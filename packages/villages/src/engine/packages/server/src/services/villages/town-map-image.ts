// Villages — generation rules for the founding map.
//
// The navigation rules live here. Only the testing editor can override them.

import { badRequest } from "./errors.js";
import { generateVillageImage, inspectVillageImage } from "./image-generation.js";
import { readSelectedLorebookIds, readVillageVisualLore } from "./lorebooks.js";
import {
  MAX_SETTING_LENGTH,
  MAX_TOWN_MAP_IMAGE_LENGTH,
  TOWN_MAP_EXPECTED_HEIGHT,
  TOWN_MAP_EXPECTED_WIDTH,
} from "./prompt-preset.js";

// Leaves room under the shared 4,000-character image-prompt ceiling for the
// village's separate 2,000-character setting and the small `Setting:` join.
export const MAX_TOWN_MAP_GENERATION_PROMPT_LENGTH = 1_500;

export const DEFAULT_TOWN_MAP_LAYOUT_PROMPT =
  "Create a wide landscape, top-down or three-quarter-view illustrated game navigation map. " +
  "Use the Setting and Theme for the art style, tone, and surroundings. Show varied, coherent, traversable terrain " +
  "and natural landmarks. Distribute at least 36 visually distinct, usable places for future structures and clickable " +
  "markers across the image, with clear separation. These should read as natural clearings, terraces, platforms, " +
  "or other setting-appropriate open spaces, never outlined lots, square plots, zones, or a grid. Avoid clutter and " +
  "large unusable empty regions. Keep useful places clear of the image edges. No numbers, labels, words, icons, " +
  "markers, legend, watermark, or UI elements.";

export type TownMapOptions = { roads: boolean; structures: boolean; water: boolean };
export const DEFAULT_TOWN_MAP_OPTIONS: TownMapOptions = { roads: true, structures: false, water: false };

const TOWN_MAP_NEGATIVE_PROMPT =
  "text, labels, numbers, captions, icons, markers, UI, interface elements, legend, compass rose, watermark, border, people, characters, square plots, outlined lots, zoning grid, crowded composition, blurry, low quality";

function readOptions(value: unknown): TownMapOptions {
  if (value === undefined) return { ...DEFAULT_TOWN_MAP_OPTIONS };
  if (!value || typeof value !== "object" || Array.isArray(value)) throw badRequest("Map options must be an object.");
  const options = value as Record<string, unknown>;
  for (const key of ["roads", "structures", "water"] as const) {
    if (typeof options[key] !== "boolean") throw badRequest(`The ${key} map option must be true or false.`);
  }
  return {
    roads: options.roads as boolean,
    structures: options.structures as boolean,
    water: options.water as boolean,
  };
}

function readRequiredText(value: unknown, label: string, maxLength: number): string {
  if (typeof value !== "string") throw badRequest(`${label} must be text.`);
  const text = value.trim();
  if (text.length === 0) throw badRequest(`${label} cannot be blank.`);
  if (text.length > maxLength) throw badRequest(`${label} can be at most ${maxLength} characters.`);
  return text;
}

export function buildTownMapPrompt(structure: unknown, setting: unknown, options?: unknown, lore = ""): string {
  const rules =
    structure === undefined || structure === null || structure === ""
      ? DEFAULT_TOWN_MAP_LAYOUT_PROMPT
      : readRequiredText(structure, "The DEBUG map layout prompt", MAX_TOWN_MAP_GENERATION_PROMPT_LENGTH);
  const world = readRequiredText(setting, "Setting and Theme", MAX_SETTING_LENGTH);
  const chosen = readOptions(options);
  const elements = [
    chosen.roads
      ? "Include streets, roads, trails, paths, or bridges appropriate to the setting, connecting usable areas."
      : "Do not include streets, roads, trails, paths, or bridges.",
    chosen.structures
      ? "Decorative buildings may appear anywhere, but must not occupy or obscure the 36 future locations."
      : "Do not include buildings or other decorative structures.",
    chosen.water
      ? "Include setting-appropriate water features."
      : "Do not include water, including oceans, rivers, ponds, canals, or waterfalls.",
  ];
  const base = `${rules}\n\nRequired map elements:\n${elements.join("\n")}\n\nSetting and Theme (follow only where consistent with the required map elements): ${world}`;
  if (base.length > 4_000)
    throw badRequest("The combined map prompt is too long. Shorten the DEBUG layout prompt or Setting and Theme.");
  const lorePrefix =
    "\nVisual details from selected lore (follow only where consistent with the setting and map controls): ";
  const room = 4_000 - base.length - lorePrefix.length;
  return lore && room > 0 ? `${base}${lorePrefix}${lore.slice(0, room)}` : base;
}

export async function generateVillageTownMap(input: {
  structure?: unknown;
  setting?: unknown;
  options?: unknown;
  connectionId?: unknown;
  selectedLorebookIds?: unknown;
}): Promise<{ image: string; width: number; height: number }> {
  const ids = readSelectedLorebookIds(input.selectedLorebookIds ?? []);
  const lore = await readVillageVisualLore(ids, typeof input.setting === "string" ? input.setting : "", 260);
  const prompt = buildTownMapPrompt(input.structure, input.setting, input.options, lore);
  const chosen = readOptions(input.options);
  const negativePrompt = [
    TOWN_MAP_NEGATIVE_PROMPT,
    chosen.roads ? "" : "streets, roads, trails, paths, bridges",
    chosen.structures ? "" : "buildings, decorative structures",
    chosen.water ? "" : "ocean, sea, lake, river, pond, canal, waterfall, water",
  ]
    .filter(Boolean)
    .join(", ");
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
    throw badRequest("The generated map exceeds the 8 million character storage limit. Try another image connection.");
  }
  const size = await inspectVillageImage(generated.dataUrl);
  return { image: generated.dataUrl, ...size };
}
