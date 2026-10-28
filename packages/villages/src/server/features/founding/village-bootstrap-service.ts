import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import { createHash } from "node:crypto";
import type { villagesDebugAgentsEnabled, villagesLogger } from "../../adapters/engine/runtime-host.js";
import type { villagesLanguageModels } from "../../adapters/models/language-models.js";
import type { backgroundCalls } from "../../adapters/operations/background-context.js";
import { badRequest } from "../../domain/rules/errors.js";
import { extractModelJsonObject } from "../../domain/rules/json-reply.js";
import { VILLAGE_SHARED_SETTING_RULE } from "../../domain/rules/narrative-grounding.js";
import { boundText, MAX_VENUE_DESCRIPTION_LENGTH, MAX_VENUE_NAME_LENGTH } from "../../domain/rules/prompt-preset.js";
import { RELATIONSHIP_REVIEW_INSTRUCTION } from "../../domain/rules/relationship-review.js";
import { SCENE_MEMORY_INSTRUCTION } from "../../domain/rules/scene-memories.js";
import { readSocialWishChanges, SOCIAL_WISH_INSTRUCTION } from "../../domain/rules/social-wishes.js";
import type { completeWithRoom } from "../generation/model-requests.js";
import type { villagesConnectionIdFor } from "../settings/connections.js";

import {
  BOOTSTRAP_MAX_TOKENS,
  BOOTSTRAP_TEMPERATURE,
  buildBootstrapMessages,
  coerceProposal,
  type VillageBootstrapProposal,
} from "../../domain/rules/village-bootstrap-rules.js";

export type VillageBootstrapServicePorts = {
  villagesLanguageModels: typeof villagesLanguageModels;
  villagesConnectionIdFor: typeof villagesConnectionIdFor;
  completeWithRoom: typeof completeWithRoom;
  backgroundCalls: Pick<typeof backgroundCalls, "getStore">;
  villagesDebugAgentsEnabled: typeof villagesDebugAgentsEnabled;
  villagesLogger: () => Pick<ReturnType<typeof villagesLogger>, "debugOverride">;
};
/** Cold recipe: awaited stages retain one application's model and storage connections. */
export function createVillageBootstrap(ports: VillageBootstrapServicePorts) {
  const {
    villagesLanguageModels,
    villagesConnectionIdFor,
    completeWithRoom,
    backgroundCalls,
    villagesDebugAgentsEnabled,
    villagesLogger,
  } = ports;

  async function draftVillageVenueDescriptions(
    setting: string,
    venues: readonly { id: string; name: string; classes: readonly string[]; homeKind?: string | null }[],
    lore: readonly string[] = [],
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
    const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? 2_500, {
      responseFormat: { type: "json_object" },
      retryEmpty: false,
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

  async function proposeVillage(
    setting: string,
    options: { signal?: AbortSignal; lore?: readonly string[] } = {},
  ): Promise<VillageBootstrapProposal> {
    const world = setting.trim();
    if (world.length === 0) throw badRequest("Write what the village is like before asking for places.");

    const model = await villagesLanguageModels().resolveForRequest({
      connectionId: await villagesConnectionIdFor("system"),
    });
    const requestedMaxTokens = Math.min(model.maxOutputTokens ?? BOOTSTRAP_MAX_TOKENS, BOOTSTRAP_MAX_TOKENS);
    const fitted = model.fitContext(buildBootstrapMessages(world, options.lore ?? []), {
      maxTokens: requestedMaxTokens,
    });
    const debugEnabled = !backgroundCalls.getStore() && villagesDebugAgentsEnabled();
    villagesLogger().debugOverride(debugEnabled, "[villages] bootstrap prompt: %s", JSON.stringify(fitted.messages));

    const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? requestedMaxTokens, {
      responseFormat: { type: "json_object" },
      retryEmpty: false,
      temperature: BOOTSTRAP_TEMPERATURE,
      debugMode: debugEnabled,
      signal: options.signal,
    });

    const payload = extractModelJsonObject(completion);
    if (!payload) throw new Error("The village did not suggest any places. Try again, or write them yourself.");

    const proposal = coerceProposal(payload);
    if (proposal.venues.length === 0) {
      throw new Error("The village did not suggest any places. Try again, or write them yourself.");
    }
    return { ...proposal, model: model.model };
  }

  async function proposePublicVenueNames(setting: string, lore: readonly string[] = []): Promise<string[]> {
    const world = setting.trim();
    if (!world) throw badRequest("Describe the place and world before asking for names.");
    const model = await villagesLanguageModels().resolveForRequest({
      connectionId: await villagesConnectionIdFor("system"),
    });
    const requestedMaxTokens = Math.min(model.maxOutputTokens ?? BOOTSTRAP_MAX_TOKENS, BOOTSTRAP_MAX_TOKENS);
    const messages: CapabilityLanguageModelMessage[] = [
      {
        role: "system",
        content: [
          "Suggest exactly three alternative names for one shared community venue in the authored setting.",
          VILLAGE_SHARED_SETTING_RULE,
          "These are choices for the same venue, not three separate places. Keep each name short and distinct.",
          "Stay consistent with the setting and established lore. Do not introduce unsupported technology or geography.",
          'Answer with JSON only: {"names":["...","...","..."]}.',
          `Setting: ${world}`,
          lore.length ? `Established lore: ${lore.join("\n")}` : "",
        ]
          .filter(Boolean)
          .join("\n\n"),
      },
      { role: "user", content: "What could we name the village's one public venue?" },
    ];
    const fitted = model.fitContext(messages, { maxTokens: requestedMaxTokens });
    const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? requestedMaxTokens, {
      responseFormat: { type: "json_object" },
      retryEmpty: false,
      temperature: BOOTSTRAP_TEMPERATURE,
    });
    const payload = extractModelJsonObject(completion);
    const names = [
      ...new Set(
        (Array.isArray(payload?.names) ? payload.names : [])
          .map((name) => boundText(name, MAX_VENUE_NAME_LENGTH).trim())
          .filter(Boolean),
      ),
    ].slice(0, 3);
    if (names.length !== 3)
      throw new Error("The village could not suggest three names. Try again, or name the venue yourself.");
    return names;
  }

  async function interpretSocialSource(
    lines: unknown,
    context: {
      state?: import("../../domain/models/relationship-types.js").RelationshipState;
      candidates: unknown[];
      relationships: string[];
      residents: Pick<
        import("../../domain/models/world.js").VillageVillager,
        "characterId" | "cardSnapshot" | "wishes"
      >[];
      memory?: ReturnType<typeof import("../../domain/rules/scene-memories.js").sceneMemoryContext>;
      at: string;
    },
    mail: boolean,
    options: { signal?: AbortSignal } = {},
  ) {
    const model = await villagesLanguageModels().resolveForRequest({
      connectionId: await villagesConnectionIdFor("system"),
    });
    const reviewMessages = [
      {
        role: "system" as const,
        content:
          RELATIONSHIP_REVIEW_INSTRUCTION +
          " Return JSON only. Independently interpret these supplied exact lines. Return a memoryChanges array using the native Memory contract supplied below, grounded only in actual witnessed dialogue; use an empty array when none are supported. Use zero-based numeric lineIds into lines for social citations. For an encounter the player is absent: disclosures must be empty. For personal mail the recipient is player; save its disclosures for reading. The captured and live social baseline is context.state; absent pair revisions are 0. sceneAfter and liveAfter coincide for this automatic source. Mail cannot grant access or create actionable invitations; return permissions:[] for mail. Do not invent physical deeds or player consent. Private reasons and intentions remain private. " +
          SCENE_MEMORY_INSTRUCTION +
          "\n" +
          SOCIAL_WISH_INSTRUCTION,
      },
      {
        role: "user" as const,
        content: JSON.stringify({ lines, mode: mail ? "mail" : "encounter", context, now: context.at }),
      },
    ];
    const fittedReview = model.fitContext(reviewMessages, { maxTokens: 4096 });
    if (fittedReview.trimmed || JSON.stringify(fittedReview.messages) !== JSON.stringify(reviewMessages))
      throw new Error("Offscreen semantic evidence does not fit System context.");
    const judged = await completeWithRoom(model, reviewMessages, Math.min(fittedReview.maxTokens ?? 4096, 4096), {
      responseFormat: { type: "json_object" },
      retryEmpty: false,
      temperature: 0.1,
      reasoningEffort: "low",
      debugMode: false,
      usagePurpose: "checks",
      signal: options.signal,
    });
    const interpreted = extractModelJsonObject(judged);
    const review = interpreted?.relationshipReview as Record<string, unknown> | undefined;
    if (
      judged.finishReason === "length" ||
      !review ||
      !Array.isArray(interpreted?.wishChanges) ||
      interpreted.wishChanges.length > 16 ||
      !Array.isArray(interpreted?.memoryChanges) ||
      interpreted.memoryChanges.length > 16 ||
      !["changes", "permissions", "disclosures"].every((key) => Array.isArray(review[key]))
    )
      throw new Error("Offscreen interpretation is incomplete; explicit retry required.");
    const record: Record<string, unknown> = { relationshipReview: review };
    if (context.memory) record.memoryContexts = { [context.memory.saved.protection.fingerprint]: context.memory.saved };
    record.semanticVersion = 2;
    record.memoryChanges = interpreted!.memoryChanges;
    record.wishChanges = readSocialWishChanges(interpreted!.wishChanges);
    record.semanticSourceHash = createHash("sha256").update(JSON.stringify(reviewMessages)).digest("hex");
    return record;
  }

  return { draftVillageVenueDescriptions, proposeVillage, proposePublicVenueNames, interpretSocialSource };
}
export type VillageBootstrapService = ReturnType<typeof createVillageBootstrap>;
