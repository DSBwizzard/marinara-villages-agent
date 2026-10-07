import type { villagesDebugAgentsEnabled, villagesLogger } from "../../adapters/engine/runtime-host.js";
import type { villagesLanguageModels } from "../../adapters/models/language-models.js";
import type { backgroundCalls } from "../../adapters/operations/background-context.js";
import type { VillageHappening } from "../../domain/models/world.js";
import { badRequest } from "../../domain/rules/errors.js";
import { extractJsonObject } from "../../domain/rules/json-reply.js";
import { VILLAGE_SHARED_SETTING_RULE } from "../../domain/rules/narrative-grounding.js";
import {
  boundText,
  MAX_HAPPENINGS_PER_WRITE,
  MAX_SETTING_LENGTH,
  MAX_VENUE_DESCRIPTION_LENGTH,
  MAX_VENUE_NAME_LENGTH,
} from "../../domain/rules/prompt-preset.js";
import { responseDiagnostics } from "../../domain/rules/response-diagnostics.js";
import { fitVenueWritingMessages } from "../../domain/rules/venue-writing.js";
import { completionFailure as typedCompletionFailure, WorkFailureError } from "../../domain/rules/work-failure.js";
import type { completeWithRoom } from "../generation/model-requests.js";
import type { villagesConnectionIdFor } from "../settings/connections.js";
import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";

import {
  BOOTSTRAP_MAX_TOKENS,
  BOOTSTRAP_TEMPERATURE,
  type VillageBootstrapProposal,
  buildBootstrapMessages,
  coerceProposal,
  TICK_MAX_TOKENS,
  TICK_TEMPERATURE,
  type VillageTickContext,
  type VillageTickProposal,
  buildTickMessages,
  coerceHappeningList,
  coerceOpportunityHappenings,
  readHousingRequests,
  REACTION_MAX_TOKENS,
  REACTION_TEMPERATURE,
  type VillageReactionContext,
  buildReactionMessages,
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
      { role: "user", content: JSON.stringify({ setting: setting.slice(0, MAX_SETTING_LENGTH), lore, venues: rows }) },
    ];
    const fitted = model.fitContext(messages, { maxTokens: Math.min(model.maxOutputTokens ?? 2_500, 2_500) });
    const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? 2_500, { temperature: 0.7 });
    const payload = extractJsonObject(completion.content ?? "");
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
      temperature: BOOTSTRAP_TEMPERATURE,
      debugMode: debugEnabled,
      signal: options.signal,
    });

    const payload = extractJsonObject(completion.content ?? "");
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
          "Suggest exactly three alternative names for one shared gathering venue in the authored setting.",
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
      temperature: BOOTSTRAP_TEMPERATURE,
    });
    const payload = extractJsonObject(completion.content ?? "");
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

  async function proposeHappenings(
    context: VillageTickContext,
    options: { signal?: AbortSignal } = {},
  ): Promise<VillageTickProposal> {
    const model = await villagesLanguageModels().resolveForRequest({
      connectionId: await villagesConnectionIdFor("system"),
    });
    const requestedMaxTokens = Math.min(model.maxOutputTokens ?? TICK_MAX_TOKENS, TICK_MAX_TOKENS);
    const messages = buildTickMessages(context);
    const fitted = fitVenueWritingMessages(
      model,
      [{ text: String(messages[0].content) }],
      String(messages[1].content),
      requestedMaxTokens,
      "System",
    );
    const debugEnabled = !backgroundCalls.getStore() && villagesDebugAgentsEnabled();
    villagesLogger().debugOverride(debugEnabled, "[villages] creative prompt: %s", JSON.stringify(fitted.messages));

    const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? requestedMaxTokens, {
      responseFormat: { type: "json_object" },
      retryEmpty: false,
      temperature: TICK_TEMPERATURE,
      debugMode: debugEnabled,
      signal: options.signal,
    });

    const payload = extractJsonObject(completion.content ?? "");
    const diagnostics = responseDiagnostics(model, completion, fitted.maxTokens ?? requestedMaxTokens, payload);
    const fail = (missing = false) =>
      new WorkFailureError({
        ...(typedCompletionFailure(completion, "events-response", fitted.maxTokens ?? requestedMaxTokens) ?? {
          cause: missing ? ("missing_result" as const) : ("invalid_json" as const),
          stage: "events-response",
          message: "",
        }),
        message:
          typedCompletionFailure(completion, "events-response", fitted.maxTokens ?? requestedMaxTokens)?.message ??
          (missing
            ? "Village Events returned JSON without usable happenings. Explicitly retry unfinished work."
            : "Village Events returned no usable JSON. Explicitly retry unfinished work."),
        finishReason: completion.finishReason,
        requestedOutputTokens: fitted.maxTokens ?? requestedMaxTokens,
        responseDiagnostics: { ...diagnostics, missingFields: missing ? ["happenings"] : [] },
      });
    if (!payload) throw fail();
    const proposal = {
      // Admit only current visual and structured proposal fields.
      happenings: coerceOpportunityHappenings(
        payload.happenings,
        new Set(context.recent.map((line) => line.trim().toLowerCase())),
        context.moment,
        context.opportunities,
      ),
      routineIdea:
        payload.routineIdea && typeof payload.routineIdea === "object" && !Array.isArray(payload.routineIdea)
          ? (payload.routineIdea as VillageTickProposal["routineIdea"])
          : undefined,
      housingRequests: readHousingRequests(payload.housingRequests, context),
      social:
        context.social && payload.social && typeof payload.social === "object"
          ? (payload.social as VillageTickProposal["social"])
          : undefined,
    };
    // A usable visual entry is required; structured proposals are optional.
    if (proposal.happenings.length === 0) throw fail(true);
    return { ...proposal, model: model.model };
  }

  async function proposeReaction(
    context: VillageReactionContext,
    options: { signal?: AbortSignal } = {},
  ): Promise<{ happenings: VillageHappening[]; model: string }> {
    const model = await villagesLanguageModels().resolveForRequest({
      connectionId: await villagesConnectionIdFor("system"),
    });
    const requestedMaxTokens = Math.min(model.maxOutputTokens ?? REACTION_MAX_TOKENS, REACTION_MAX_TOKENS);
    const fitted = model.fitContext(buildReactionMessages(context), { maxTokens: requestedMaxTokens });
    const debugEnabled = !backgroundCalls.getStore() && villagesDebugAgentsEnabled();
    villagesLogger().debugOverride(debugEnabled, "[villages] reaction prompt: %s", JSON.stringify(fitted.messages));

    const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? requestedMaxTokens, {
      temperature: REACTION_TEMPERATURE,
      debugMode: debugEnabled,
      signal: options.signal,
    });

    const payload = extractJsonObject(completion.content ?? "");
    if (!payload) throw new Error("The village did not say what it saw.");
    // Seeded with the window and with the deed itself, so the one line that must
    // never come back as news is the thing that just happened, which the village
    // has already written down somewhere else.
    const seen = new Set(context.recent.map((line) => line.trim().toLowerCase()));
    seen.add(context.deed.trim().toLowerCase());
    return {
      happenings: coerceHappeningList(payload.happenings, seen, context.moment, MAX_HAPPENINGS_PER_WRITE),
      model: model.model,
    };
  }

  return { draftVillageVenueDescriptions, proposeVillage, proposePublicVenueNames, proposeHappenings, proposeReaction };
}
export type VillageBootstrapService = ReturnType<typeof createVillageBootstrap>;
