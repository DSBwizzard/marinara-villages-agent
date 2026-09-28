import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import { asTrimmedString } from "./coerce.js";
import { villagesConnectionIdFor } from "./connections.js";
import { badRequest } from "./errors.js";
import { readLoreTokenBudget, readSelectedLorebookIds, readVillageLore } from "./lorebooks.js";
import { completeWithRoom, villagesLanguageModels } from "./package-runtime.js";
import type { VillageScenarioImprint } from "./types.js";
import { extractJsonObject } from "./village-bootstrap.js";

const LIMITS = { origin: 400, worldFacts: 160, openingConditions: 160, visualCues: 120 } as const;
const MAX_ITEMS = 4;
type ListKey = "worldFacts" | "openingConditions" | "visualCues";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function lines(value: unknown, key: ListKey, strict: boolean): string[] {
  if (strict && !Array.isArray(value)) throw badRequest(`Scenario ${key} must be a list.`);
  if (!Array.isArray(value)) return [];
  if (strict && value.length > MAX_ITEMS) throw badRequest(`Scenario ${key} can have at most four entries.`);
  if (strict && value.some((item: unknown) => typeof item !== "string" || item.length > LIMITS[key]))
    throw badRequest(`Scenario ${key} entries must be short text.`);
  return value
    .slice(0, MAX_ITEMS)
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, LIMITS[key]))
    .filter(Boolean);
}

/** Accept a player's reviewed draft. The original premise is not silently substituted. */
export function readScenarioImprint(value: unknown): VillageScenarioImprint {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw badRequest("Review the starting details.");
  const raw = record(value);
  if (typeof raw.origin !== "string" || raw.origin.length > LIMITS.origin)
    throw badRequest("Scenario origin can be at most 400 characters.");
  for (const key of ["worldFacts", "openingConditions", "visualCues"] as const) {
    if (
      !Array.isArray(raw[key]) ||
      raw[key].some((item: unknown) => typeof item !== "string" || item.length > LIMITS[key])
    )
      throw badRequest(`Scenario ${key} entries must be short text.`);
  }
  const imprint: VillageScenarioImprint = {
    origin: raw.origin.trim(),
    worldFacts: lines(raw.worldFacts, "worldFacts", true),
    openingConditions: lines(raw.openingConditions, "openingConditions", true),
    visualCues: lines(raw.visualCues, "visualCues", true),
  };
  if (!imprint.origin && !imprint.worldFacts.length && !imprint.openingConditions.length && !imprint.visualCues.length)
    throw badRequest("Add at least one starting detail.");
  return imprint;
}

/** Older village records never acquire generated facts during a read. */
export function coerceScenarioImprint(value: unknown): VillageScenarioImprint | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = record(value);
  const imprint: VillageScenarioImprint = {
    origin: asTrimmedString(raw.origin).slice(0, LIMITS.origin),
    worldFacts: lines(raw.worldFacts, "worldFacts", false),
    openingConditions: lines(raw.openingConditions, "openingConditions", false),
    visualCues: lines(raw.visualCues, "visualCues", false),
  };
  return imprint.origin || imprint.worldFacts.length || imprint.openingConditions.length || imprint.visualCues.length
    ? imprint
    : null;
}

export function readWorldFacts(value: unknown): string[] {
  return lines(value, "worldFacts", true);
}

export function coerceWorldFacts(value: unknown): string[] {
  return lines(value, "worldFacts", false);
}

/** One side-effect-free proposal; the player edits and approves it before setup writes anything. */
export async function draftScenarioImprint(value: unknown): Promise<{ imprint: VillageScenarioImprint }> {
  const input = record(value);
  const premise = asTrimmedString(input.foundingDetails);
  const setting = asTrimmedString(input.setting);
  if (!premise || premise.length > 2_000) throw badRequest("Describe Day 1 in at most 2,000 characters.");
  if (!setting || setting.length > 2_000) throw badRequest("Describe what the village is like first.");
  const direction = asTrimmedString(input.foundingGuidance).slice(0, 500);
  const ids = readSelectedLorebookIds(input.selectedLorebookIds ?? []);
  const budget = input.loreTokenBudget === undefined ? 800 : readLoreTokenBudget(input.loreTokenBudget);
  const lore = await readVillageLore(ids, `${setting}\n${premise}`, undefined, budget);
  const model = await villagesLanguageModels().resolveForRequest({
    connectionId: await villagesConnectionIdFor("system"),
  });
  const messages: CapabilityLanguageModelMessage[] = [
    {
      role: "system",
      content: [
        "Propose compact, editable details for Day 1 of a fictional village.",
        "The village begins on Day 1. Distinguish events before the village existed, lasting present world facts, temporary Day 1 conditions, and visual cues.",
        "Leave origin empty unless the player describes earlier background. Never claim the village was already founded before Day 1.",
        "An Open beginning has no preset story, but the player's Day 1 description is authoritative.",
        "Treat the player's text and established lore as authoritative. Do not invent named people, relationships, possessions, or completed events.",
        "Offer specific, grounded suggestions without making every resident or venue repeat the same theme.",
        'Return JSON only: {"origin":"","worldFacts":[],"openingConditions":[],"visualCues":[]}.',
        "Origin is at most 400 characters. Each list has at most four short strings.",
      ].join("\n"),
    },
    { role: "user", content: JSON.stringify({ scenario: input.foundingReason, premise, direction, setting, lore }) },
  ];
  const fitted = model.fitContext(messages, { maxTokens: Math.min(model.maxOutputTokens ?? 1400, 1400) });
  const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? 1400, {
    temperature: 0.4,
    debugMode: false,
  });
  const payload = extractJsonObject(completion.content ?? "");
  if (!payload) throw badRequest("The starting-details draft was incomplete. Retry or write it yourself.");
  return { imprint: readScenarioImprint(payload) };
}
