import type { readVillageLore } from "../../adapters/engine/lorebooks.js";
import type { villagesLanguageModels } from "../../adapters/models/language-models.js";
import type { VillageScenarioImprint } from "../../domain/models/world.js";
import { asTrimmedString } from "../../domain/rules/coerce.js";
import { badRequest } from "../../domain/rules/errors.js";
import { extractJsonObject } from "../../domain/rules/json-reply.js";
import { readLoreTokenBudget, readSelectedLorebookIds } from "../../domain/rules/lore-policy.js";
import { VILLAGE_SHARED_SETTING_RULE } from "../../domain/rules/narrative-grounding.js";
import { readScenarioImprint, record } from "../../domain/rules/scenario-rules.js";
import type { completeWithRoom } from "../generation/model-requests.js";
import type { villagesConnectionIdFor } from "../settings/connections.js";
import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";

export type ScenarioImprintServicePorts = {
  readVillageLore: typeof readVillageLore;
  villagesLanguageModels: typeof villagesLanguageModels;
  villagesConnectionIdFor: typeof villagesConnectionIdFor;
  completeWithRoom: typeof completeWithRoom;
};
/** Cold recipe: awaited stages retain one application's model and storage connections. */
export function createScenarioImprint(ports: ScenarioImprintServicePorts) {
  const { readVillageLore, villagesLanguageModels, villagesConnectionIdFor, completeWithRoom } = ports;

  async function draftScenarioImprint(value: unknown): Promise<{ imprint: VillageScenarioImprint }> {
    const input = record(value);
    const premise = asTrimmedString(input.foundingDetails);
    const setting = asTrimmedString(input.setting);
    if (!premise || premise.length > 2_000)
      throw badRequest("Describe shared starting circumstances in at most 2,000 characters.");
    if (!setting || setting.length > 2_000) throw badRequest("Describe the place and world first.");
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
          "Propose compact, editable grounding for the start of play in a shared place.",
          VILLAGE_SHARED_SETTING_RULE,
          "Distinguish earlier background, ongoing world conditions, temporary starting conditions, and visual cues. Starting play does not mean the place or group has just been established.",
          "Leave origin empty unless the player describes earlier background. Do not invent arrivals, shared relationships, player actions, or completed events.",
          "No preset supplies no story. The player's shared starting circumstances are authoritative background, not a script or a guaranteed future.",
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

  return { draftScenarioImprint };
}
export type ScenarioImprintService = ReturnType<typeof createScenarioImprint>;
