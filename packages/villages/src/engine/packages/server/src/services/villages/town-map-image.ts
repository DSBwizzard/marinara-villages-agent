import { readSceneryStyle, sceneryPrompt } from "./scenery-context.js";
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
  "Create a landscape game navigation map on a three-to-two canvas, wider than tall but not panoramic. Use a top-down or three-quarter view. " +
  "Use cutaways or floor layouts indoors, and terrain and landmarks outdoors. " +
  "Distribute visually distinct usable areas for venue pins, including rooms within larger structures. " +
  "Pins need not represent detached buildings. Never add outlined lots or a zoning grid. Keep usable areas uncluttered and clear of edges.";

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
  style = "",
): string {
  const rules =
    structure === undefined || structure === null || structure === ""
      ? DEFAULT_TOWN_MAP_LAYOUT_PROMPT
      : readRequiredText(structure, "The DEBUG map layout prompt", MAX_TOWN_MAP_GENERATION_PROMPT_LENGTH);
  const world = readRequiredText(setting, "Village description", MAX_SETTING_LENGTH);
  const chosen = readOptions(options);
  const elements = [
    chosen.roads === "include"
      ? "Include setting-appropriate connecting routes, such as corridors, walkways, streets, trails, or bridges."
      : chosen.roads === "exclude"
        ? "Do not add streets, roads, trails, paths, or bridges; retain interior circulation required by the setting."
        : "",
    chosen.structures === "include"
      ? "Include setting-appropriate structures or interior architecture without obscuring usable areas."
      : chosen.structures === "exclude"
        ? "Do not add decorative buildings or structures; retain enclosing architecture required by the setting."
        : "",
    chosen.water === "include"
      ? "Include setting-appropriate water features."
      : chosen.water === "exclude"
        ? "Do not include water features."
        : "",
  ].filter(Boolean);
  const base = `${rules}\n\nFollow the village description for water, paths, and existing structures unless explicit preferences below say otherwise.${elements.length ? `\n\nExplicit map preferences:\n${elements.join("\n")}` : ""}\n\nDraw scenery without any writing, numerals, labels, signs, icons, legend, watermark, or UI.\n\nVillage description: ${world}`;
  if (base.length > 4_000)
    throw badRequest("The combined map prompt is too long. Shorten the DEBUG layout prompt or village description.");
  const imprint = coerceScenarioImprint(scenarioImprint);
  return sceneryPrompt(
    [base],
    [
      style ? "" : "Illustrated game navigation map scenery.",
      ...(imprint?.worldFacts ?? []).map((fact) => "Reviewed founding world fact (map controls always win): " + fact),
      ...(imprint?.visualCues ?? []).map((cue) => "Reviewed founding visual context (map controls always win): " + cue),
      lore ? "Visual details from selected lore (consistent with setting and map controls): " + lore : "",
    ],
    style,
  );
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
    chosen.structures === "exclude" ? "additional standalone buildings, decorative structures" : "",
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
  sceneryArtStyle?: unknown;
  useVisualLore?: unknown;
}): Promise<{ image: string; width: number; height: number }> {
  const ids = readSelectedLorebookIds(input.selectedLorebookIds ?? []);
  if (input.useVisualLore !== undefined && typeof input.useVisualLore !== "boolean")
    throw badRequest("Visual lore must be on or off.");
  const style = input.sceneryArtStyle === undefined ? "" : readSceneryStyle(input.sceneryArtStyle);
  const lore =
    input.useVisualLore === false
      ? ""
      : await readVillageVisualLore(
          ids,
          [input.setting, JSON.stringify(coerceScenarioImprint(input.scenarioImprint))].filter(Boolean).join("\n"),
          900,
        );
  const prompt = buildTownMapPrompt(
    input.structure,
    typeof input.setting === "string" ? input.setting.slice(0, style ? 1500 : 2000) : input.setting,
    input.options,
    lore,
    input.scenarioImprint,
    style,
  );
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
