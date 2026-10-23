import { bindOpeningRenovation } from "../../domain/rules/opening-renovation.js";
import { asRecord } from "../../domain/rules/coerce.js";
import { readOpeningProposal } from "../../domain/rules/opening-project.js";
import { extractModelJsonObject } from "../../domain/rules/json-reply.js";
import { foundingRequestMessages, OPENING_IDEA_FORMAT_VERSION } from "../../domain/rules/founding-requests.js";
import type { villagesDebugAgentsEnabled, villagesLogger } from "../../adapters/engine/runtime-host.js";
import type { villagesLanguageModels } from "../../adapters/models/language-models.js";
import type { completeWithRoom } from "../generation/model-requests.js";
import type { villagesConnectionIdFor } from "../settings/connections.js";

import {
  type CompactFoundingContext,
  type CompactFoundingResult,
  parseCompactFoundingCompletion,
} from "../../domain/rules/compact-founding-rules.js";

export type CompactFoundingServicePorts = {
  villagesLanguageModels: typeof villagesLanguageModels;
  villagesConnectionIdFor: typeof villagesConnectionIdFor;
  completeWithRoom: typeof completeWithRoom;
  villagesDebugAgentsEnabled: typeof villagesDebugAgentsEnabled;
  villagesLogger: () => Pick<ReturnType<typeof villagesLogger>, "debugOverride" | "info">;
};
/** Cold recipe: awaited stages retain one application's model and storage connections. */
export function createCompactFounding(ports: CompactFoundingServicePorts) {
  const {
    villagesLanguageModels,
    villagesConnectionIdFor,
    completeWithRoom,
    villagesDebugAgentsEnabled,
    villagesLogger,
  } = ports;

  async function proposeCompactFounding(
    context: CompactFoundingContext,
    onModelStart: (modelName: string) => Promise<void>,
    _jsonMode = true,
  ): Promise<CompactFoundingResult> {
    const messages = foundingRequestMessages(context, "routine");
    const model = await villagesLanguageModels().resolveForRequest({
      connectionId: await villagesConnectionIdFor("system"),
    });
    const requested = Math.min(model.maxOutputTokens ?? 2048, 2048);
    if (requested < 1024) throw new Error("The System model has too little output room for a complete Routine.");
    const fitted = model.fitContext(messages, { maxTokens: requested });
    if (Math.min(fitted.maxTokens ?? requested, requested) < 1024)
      throw new Error("The System model has too little output room for a complete Routine.");
    if (JSON.stringify(fitted.messages) !== JSON.stringify(messages))
      throw new Error("The System context cannot fit the complete Routine request.");
    const debugMode = villagesDebugAgentsEnabled();
    await onModelStart(model.name);
    const started = performance.now();
    const completion = await completeWithRoom(
      model,
      fitted.messages,
      Math.min(fitted.maxTokens ?? requested, requested),
      {
        responseFormat: { type: "json_object" },
        temperature: 0.3,
        reasoningEffort: "none",
        retryEmpty: false,
        usagePurpose: "background",
        checkpointId: context.contractVersion === 2 ? "founding-routine-v2" : "founding-routine-v1",
        debugMode,
      },
    );
    villagesLogger().info(
      "[villages] founding task=routine contract=1 model=%s resident=%s elapsedMs=%d inputTokens=%s outputTokens=%s",
      model.name,
      context.card.name,
      Math.round(performance.now() - started),
      completion.usage?.promptTokens ?? "unavailable",
      completion.usage?.completionTokens ?? "unavailable",
    );
    try {
      return parseCompactFoundingCompletion(completion, { ...context, allowInitialWish: false });
    } finally {
      villagesLogger().info(
        "[villages] founding task=routine contract=1 inputChars=%d outputAllowance=%d finish=%s",
        messages.reduce(
          (sum, row) =>
            sum + (typeof row.content === "string" ? row.content.length : JSON.stringify(row.content).length),
          0,
        ),
        requested,
        completion.finishReason ?? "unavailable",
      );
    }
  }

  async function proposeOpeningIdea(context: CompactFoundingContext, key: string, retry: boolean) {
    const model = await villagesLanguageModels().resolveForRequest({
      connectionId: await villagesConnectionIdFor("system"),
    });
    const messages = foundingRequestMessages(context, "opening");
    const requested = Math.min(model.maxOutputTokens ?? 1536, 1536);
    const fitted = model.fitContext(messages, { maxTokens: requested });
    if (
      requested < 1024 ||
      (fitted.maxTokens ?? requested) < 1024 ||
      JSON.stringify(fitted.messages) !== JSON.stringify(messages)
    )
      throw new Error("The System context cannot fit the complete opening idea request.");
    const read = (completion: Parameters<typeof parseCompactFoundingCompletion>[0]) => {
      if (["length", "max_tokens"].includes(completion.finishReason ?? ""))
        throw new Error("Opening idea was truncated.");
      const payload = extractModelJsonObject(completion);
      const row = asRecord(payload?.openingProposal);
      // Some responses put the explicitly supplied type beside the proposal.
      const proposal = readOpeningProposal(
        row.kind === undefined && payload?.kind !== undefined
          ? { ...row, kind: payload.kind, renovation: row.renovation ?? payload.renovation }
          : row,
        context.characterId ?? context.card.id,
      );
      if (context.openingVersion === 2 && !proposal.kind)
        throw new Error(
          "The generated opening idea does not say whether to create a place or improve an existing one. Retry failed preparation.",
        );
      return bindOpeningRenovation(proposal, context.venues);
    };
    const completion = await completeWithRoom(model, messages, requested, {
      responseFormat: { type: "json_object" },
      temperature: 0.3,
      reasoningEffort: "none",
      usagePurpose: "background",
      savedRequest: {
        key: `${key}:format:${OPENING_IDEA_FORMAT_VERSION}`,
        retry,
        valid: (completion) => {
          try {
            read(completion);
            return true;
          } catch {
            return false;
          }
        },
      },
    });
    return read(completion);
  }
  return { proposeCompactFounding, proposeOpeningIdea };
}
export type CompactFoundingService = ReturnType<typeof createCompactFounding>;
