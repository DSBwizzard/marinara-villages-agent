import { inspectVillageImage } from "../../adapters/engine/image-files.js";
import { readVillageVisualLoreEntries } from "../../adapters/engine/lorebooks.js";
import { badRequest } from "../../domain/rules/errors.js";
import { readSelectedLorebookIds } from "../../domain/rules/lore-policy.js";
import { VILLAGE_SHARED_SETTING_RULE } from "../../domain/rules/narrative-grounding.js";
import {
  MAX_SETTING_LENGTH,
  MAX_TOWN_MAP_IMAGE_LENGTH,
  TOWN_MAP_EXPECTED_HEIGHT,
  TOWN_MAP_EXPECTED_WIDTH,
} from "../../domain/rules/prompt-preset.js";
import { coerceScenarioImprint } from "../../domain/rules/scenario-rules.js";
import { readSceneryStyle } from "../../domain/rules/scenery-context.js";
import {
  DEFAULT_TOWN_MAP_LAYOUT_PROMPT,
  DEFAULT_TOWN_MAP_NEGATIVE_PROMPT,
} from "../../domain/rules/town-map-prompts.js";
import { generateVillageImage } from "./image-generation.js";

// Villages — generation rules for the founding map.
//
// Navigation requirements always apply; authored layout supplements them.

// Individual inputs also share a final 4,000-character prompt allowance.
export const MAX_TOWN_MAP_GENERATION_PROMPT_LENGTH = 1_500;
const MAX_MAP_PROMPT_LENGTH = 4_000;

export type TownMapChoice = "auto" | "include" | "exclude";
export type TownMapOptions = { roads: TownMapChoice; structures: TownMapChoice; water: TownMapChoice };
export const DEFAULT_TOWN_MAP_OPTIONS: TownMapOptions = { roads: "auto", structures: "auto", water: "auto" };

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
  lore: string | readonly string[] = "",
  scenarioImprint?: unknown,
  style = "",
): string {
  const rules = DEFAULT_TOWN_MAP_LAYOUT_PROMPT;
  const layout =
    structure === undefined || structure === null || structure === "" || structure === DEFAULT_TOWN_MAP_LAYOUT_PROMPT
      ? ""
      : readRequiredText(structure, "Map layout", MAX_TOWN_MAP_GENERATION_PROMPT_LENGTH);
  const world = readRequiredText(setting, "Village description", MAX_SETTING_LENGTH);
  const chosen = readOptions(options);
  const elements = [
    chosen.roads === "include"
      ? "Include setting-appropriate corridors, walkways, streets, trails or bridges."
      : chosen.roads === "exclude"
        ? "Do not add decorative outdoor routes; retain essential access and interior circulation required by the setting."
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
  const imprint = coerceScenarioImprint(scenarioImprint);
  const prompt = [
    rules,
    VILLAGE_SHARED_SETTING_RULE,
    "Priority: navigation and explicit preferences, then authored setting/layout, then reviewed context and compatible lore. Style must preserve spatial readability. Follow the village description for water, paths, and existing structures unless explicit preferences say otherwise.",
    ...elements,
    "Village description: " + world,
    layout ? "Authored layout: " + layout : "",
    ...(imprint?.worldFacts ?? []).map((fact) => "Reviewed world fact: " + fact),
    style
      ? "Art style for this scenery: " + readSceneryStyle(style)
      : "Illustrated overhead scenery with clear spatial organization.",
  ]
    .filter(Boolean)
    .join("\n");
  if (prompt.length > MAX_MAP_PROMPT_LENGTH)
    throw badRequest(
      "The combined map prompt is " +
        (prompt.length - MAX_MAP_PROMPT_LENGTH) +
        " characters over the 4,000-character allowance. Shorten the layout, setting or art style; no image request was made.",
    );
  const optional = [
    ...(imprint?.visualCues ?? []).map((cue) => "Reviewed visual cue: " + cue),
    ...(Array.isArray(lore) ? lore : lore ? [lore] : []).map((entry) => "Compatible visual lore: " + entry),
  ];
  return fitMapContext(prompt, optional);
}

function fitMapContext(prompt: string, entries: readonly string[]): string {
  for (const entry of entries) if (prompt.length + entry.length + 1 <= MAX_MAP_PROMPT_LENGTH) prompt += "\n" + entry;
  return prompt;
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
    chosen.roads === "exclude" ? "decorative outdoor routes" : "",
    chosen.structures === "exclude" ? "decorative buildings, decorative structures" : "",
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
    throw badRequest("The generated map exceeds the 8 million character storage limit. Try another image connection.");
  }
  const size = await inspectVillageImage(generated.dataUrl);
  return { image: generated.dataUrl, ...size };
}
