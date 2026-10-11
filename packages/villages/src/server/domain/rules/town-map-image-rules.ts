import { badRequest } from "./errors.js";
import { MAX_SETTING_LENGTH } from "./prompt-preset.js";
import { VILLAGE_SHARED_SETTING_RULE } from "./narrative-grounding.js";
import { coerceScenarioImprint } from "./scenario-rules.js";
import { readSceneryStyle } from "./scenery-context.js";
import { DEFAULT_TOWN_MAP_LAYOUT_PROMPT, DEFAULT_TOWN_MAP_NEGATIVE_PROMPT } from "./town-map-prompts.js";

export const MAX_TOWN_MAP_GENERATION_PROMPT_LENGTH = 1_500;

const MAX_MAP_PROMPT_LENGTH = 4_000;

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
  lore: string | readonly string[] = "",
  scenarioImprint?: unknown,
  style = "",
): string {
  const rules = DEFAULT_TOWN_MAP_LAYOUT_PROMPT;
  const layout =
    structure === undefined || structure === null || structure === "" || structure === DEFAULT_TOWN_MAP_LAYOUT_PROMPT
      ? ""
      : readRequiredText(structure, "Map details", MAX_TOWN_MAP_GENERATION_PROMPT_LENGTH);
  const world = readRequiredText(setting, "Village description", MAX_SETTING_LENGTH);
  const imprint = coerceScenarioImprint(scenarioImprint);
  const prompt = [
    rules,
    VILLAGE_SHARED_SETTING_RULE,
    "Map details take priority over conflicting Village description, reviewed context, lore and default scenery-content guidance. Follow Map details for what to include, arrange or omit; follow the Village description for anything Map details leave unspecified. Preserve overhead navigation and spatial readability.",
    "Village description: " + world,
    layout ? "Map details: " + layout : "",
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
        " characters over the 4,000-character allowance. Shorten the map details, setting or art style; no image request was made.",
    );
  const optional = [
    ...(imprint?.visualCues ?? []).map((cue) => "Reviewed visual cue: " + cue),
    ...(Array.isArray(lore) ? lore : lore ? [lore] : []).map((entry) => "Compatible visual lore: " + entry),
  ];
  return fitMapContext(prompt, optional);
}

export function fitMapContext(prompt: string, entries: readonly string[]): string {
  for (const entry of entries) if (prompt.length + entry.length + 1 <= MAX_MAP_PROMPT_LENGTH) prompt += "\n" + entry;
  return prompt;
}

export function buildTownMapNegativePrompt(negative?: unknown): string {
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
  ]
    .filter(Boolean)
    .join(", ");
}
