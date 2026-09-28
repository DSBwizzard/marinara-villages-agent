// Villages — generation rules for the founding map.
//
// The navigation rules live here. Only the testing editor can override them.

import { badRequest } from "./errors.js";
import { generateVillageImage, inspectVillageImage } from "./image-generation.js";
import { readSelectedLorebookIds, readVillageVisualLore } from "./lorebooks.js";
import { coerceScenarioImprint } from "./scenario-imprint.js";
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
  "Use the village description for the surroundings and visual character. Show varied, coherent, traversable terrain " +
  "and natural landmarks. Distribute many visually distinct, usable places for future venue placements " +
  "across the image, with clear separation. These should read as natural clearings, terraces, platforms, " +
  "or other setting-appropriate open spaces, never outlined lots, square plots, zones, or a grid. Avoid clutter and " +
  "large unusable empty regions. Keep useful places clear of the image edges. This is uninterrupted scenery, with " +
  "no readable marks, writing, numerals, labels, signs, icons, legend, watermark, or UI elements.";

export type TownMapChoice = "auto" | "include" | "exclude";
export type TownMapOptions = { roads: TownMapChoice; structures: TownMapChoice; water: TownMapChoice };
export const DEFAULT_TOWN_MAP_OPTIONS: TownMapOptions = { roads: "auto", structures: "auto", water: "auto" };

export const DEFAULT_TOWN_MAP_NEGATIVE_PROMPT =
  "text, letters, writing, numerals, digits, numbers, labels, captions, signs, icons, markers, UI, interface elements, legend, compass rose, watermark, border, people, characters, square plots, outlined lots, zoning grid, crowded composition, blurry, low quality";

function readOptions(value: unknown): TownMapOptions {
  if (value === undefined) return { ...DEFAULT_TOWN_MAP_OPTIONS };
  if (!value || typeof value !== "object" || Array.isArray(value)) throw badRequest("Map options must be an object.");
  const options = value as Record<string, unknown>;
  const selected = { ...DEFAULT_TOWN_MAP_OPTIONS };
  for (const key of ["roads", "structures", "water"] as const) {
    const choice = options[key];
    if (choice === undefined) continue;
    if (choice !== "auto" && choice !== "include" && choice !== "exclude" && typeof choice !== "boolean")
      throw badRequest(`The ${key} map option must be Auto, Include, or Exclude.`);
    selected[key] = choice === true ? "include" : choice === false ? "exclude" : choice;
  }
  return selected;
}

function readRequiredText(value: unknown, label: string, maxLength: number): string {
  if (typeof value !== "string") throw badRequest(`${label} must be text.`);
  const text = value.trim();
  if (text.length === 0) throw badRequest(`${label} cannot be blank.`);
  if (text.length > maxLength) throw badRequest(`${label} can be at most ${maxLength} characters.`);
  return text;
}

export function buildTownMapPrompt(
  structure: unknown,
  setting: unknown,
  options?: unknown,
  lore = "",
  scenarioImprint?: unknown,
): string {
  const rules =
    structure === undefined || structure === null || structure === ""
      ? DEFAULT_TOWN_MAP_LAYOUT_PROMPT
      : readRequiredText(structure, "The DEBUG map layout prompt", MAX_TOWN_MAP_GENERATION_PROMPT_LENGTH);
  const world = readRequiredText(setting, "Village description", MAX_SETTING_LENGTH);
  const chosen = readOptions(options);
  const elements = [
    chosen.roads === "include"
      ? "Include setting-appropriate streets, roads, trails, paths, or bridges connecting usable areas."
      : chosen.roads === "exclude"
        ? "Do not include streets, roads, trails, paths, or bridges."
        : "",
    chosen.structures === "include"
      ? "Decorative buildings may appear, but must not occupy or obscure future locations."
      : chosen.structures === "exclude"
        ? "Do not include buildings or other decorative structures."
        : "",
    chosen.water === "include"
      ? "Include setting-appropriate water features."
      : chosen.water === "exclude"
        ? "Do not include water, including oceans, rivers, ponds, canals, or waterfalls."
        : "",
  ].filter(Boolean);
  let base = `${rules}\n\nFollow the village description for water, paths, and existing structures unless an explicit map preference below says otherwise. Leave room for future village places.${elements.length ? `\n\nExplicit map preferences:\n${elements.join("\n")}` : ""}\n\nImage-only rule: draw scenery without any writing, numerals, glyphs, map symbols, labels, signs, or interface graphics.\n\nVillage description: ${world}`;
  if (base.length > 4_000)
    throw badRequest("The combined map prompt is too long. Shorten the DEBUG layout prompt or village description.");
  const imprint = coerceScenarioImprint(scenarioImprint);
  const visual = [...(imprint?.worldFacts ?? []), ...(imprint?.visualCues ?? [])].join("; ");
  const visualPrefix = "\nReviewed founding visual context (map controls above always win): ";
  if (visual && base.length + visualPrefix.length < 4_000)
    base += visualPrefix + visual.slice(0, 4_000 - base.length - visualPrefix.length);
  const lorePrefix =
    "\nVisual details from selected lore (follow only where consistent with the setting and map controls): ";
  const room = 4_000 - base.length - lorePrefix.length;
  return lore && room > 0 ? `${base}${lorePrefix}${lore.slice(0, room)}` : base;
}

export function buildTownMapNegativePrompt(options?: unknown, negative?: unknown): string {
  const chosen = readOptions(options);
  return [
    DEFAULT_TOWN_MAP_NEGATIVE_PROMPT,
    negative === undefined || negative === null || negative === ""
      ? ""
      : (() => {
          const extra = readRequiredText(
            negative,
            "The DEBUG negative map prompt",
            MAX_TOWN_MAP_GENERATION_PROMPT_LENGTH,
          );
          return extra === DEFAULT_TOWN_MAP_NEGATIVE_PROMPT ? "" : extra;
        })(),
    chosen.roads === "exclude" ? "streets, roads, trails, paths, bridges" : "",
    chosen.structures === "exclude" ? "buildings, decorative structures" : "",
    chosen.water === "exclude" ? "ocean, sea, lake, river, pond, canal, waterfall, water" : "",
  ]
    .filter(Boolean)
    .join(", ");
}

export async function generateVillageTownMap(input: {
  structure?: unknown;
  setting?: unknown;
  options?: unknown;
  negative?: unknown;
  connectionId?: unknown;
  selectedLorebookIds?: unknown;
  scenarioImprint?: unknown;
}): Promise<{ image: string; width: number; height: number }> {
  const ids = readSelectedLorebookIds(input.selectedLorebookIds ?? []);
  const lore = await readVillageVisualLore(ids, typeof input.setting === "string" ? input.setting : "", 260);
  const prompt = buildTownMapPrompt(input.structure, input.setting, input.options, lore, input.scenarioImprint);
  const negativePrompt = buildTownMapNegativePrompt(input.options, input.negative);
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
