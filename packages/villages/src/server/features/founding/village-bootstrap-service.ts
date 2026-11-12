import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import { recordLoreUse } from "../../adapters/observability/runtime-debug.js";
import type { LoreUse } from "../../../shared/contracts/lore.js";

import type { villagesLanguageModels } from "../../adapters/models/language-models.js";
import { badRequest } from "../../domain/rules/errors.js";
import { extractModelJsonObject } from "../../domain/rules/json-reply.js";
import { boundText, MAX_VENUE_DESCRIPTION_LENGTH, MAX_VENUE_NAME_LENGTH } from "../../domain/rules/prompt-preset.js";

import type { completeWithRoom } from "../generation/model-requests.js";
import type { villagesConnectionIdFor } from "../settings/connections.js";

export type VillageBootstrapServicePorts = {
  villagesLanguageModels: typeof villagesLanguageModels;
  villagesConnectionIdFor: typeof villagesConnectionIdFor;
  completeWithRoom: typeof completeWithRoom;
};
/** Cold recipe: awaited stages retain one application's model and storage connections. */
export function createVillageBootstrap(ports: VillageBootstrapServicePorts) {
  const { villagesLanguageModels, villagesConnectionIdFor, completeWithRoom } = ports;

  async function draftVillageVenueDescriptions(
    setting: string,
    venues: readonly { id: string; name: string; classes: readonly string[]; homeKind?: string | null }[],
    lore: readonly string[] = [],
    loreUse: readonly LoreUse[] = [],
  ): Promise<Record<string, string>> {
    if (!setting.trim() || venues.length === 0 || venues.length > 12)
      throw badRequest("Choose places and a setting first.");
    const rows = venues.map((venue) => ({
      id: boundText(venue.id, 100),
      name: boundText(venue.name, MAX_VENUE_NAME_LENGTH),
      classes: venue.classes,
      homeKind: boundText(venue.homeKind, 60),
    }));
    if (rows.some((row) => !row.id || !row.name)) throw badRequest("Each place needs a name before describing it.");
    const model = await villagesLanguageModels().resolveForRequest({
      connectionId: await villagesConnectionIdFor("system"),
    });
    const messages: CapabilityLanguageModelMessage[] = [
      {
        role: "system",
        content: [
          "Write one concrete, sensory description of each venue in this fictional village.",
          "Keep architecture, materials, climate and technology consistent with the setting and established lore.",
          "Describe the place itself, including visible non-feature furnishings when supplied. Do not invent named people or contradict supplied facts.",
          'Return JSON only: {"descriptions":[{"id":"...","text":"..."}]}. Each text is 2-4 sentences, under 1000 characters.',
        ].join("\n"),
      },
      { role: "user", content: JSON.stringify({ setting, lore, venues: rows }) },
    ];
    const fitted = model.fitContext(messages, { maxTokens: Math.min(model.maxOutputTokens ?? 2_500, 2_500) });
    if (JSON.stringify(fitted.messages) !== JSON.stringify(messages))
      throw badRequest("The complete place description does not fit the System connection. No request was sent.");
    await recordLoreUse(loreUse, "Venue descriptions");
    const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? 2_500, {
      responseFormat: { type: "json_object" },
      temperature: 0.7,
    });
    const payload = extractModelJsonObject(completion);
    const descriptions = Array.isArray(payload?.descriptions) ? payload.descriptions : [];
    const known = new Set(rows.map((row) => row.id));
    const result: Record<string, string> = {};
    for (const entry of descriptions) {
      if (!entry || typeof entry !== "object") continue;
      const record = entry as Record<string, unknown>;
      const id = typeof record.id === "string" ? record.id : "";
      if (!known.has(id)) continue;
      const text = boundText(record.text, MAX_VENUE_DESCRIPTION_LENGTH).trim();
      if (text) result[id] = text;
    }
    return result;
  }

  return { draftVillageVenueDescriptions };
}
export type VillageBootstrapService = ReturnType<typeof createVillageBootstrap>;
