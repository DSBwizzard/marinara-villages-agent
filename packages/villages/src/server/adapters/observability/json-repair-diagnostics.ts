import { mutateDocument } from "../storage/document-store.js";
import { villagesLogger } from "../engine/runtime-host.js";
import { venueDebugContext } from "../operations/operation-context.js";
import { readModelJsonObject } from "../../domain/rules/json-reply.js";
import { retainPrivateDiagnostic } from "./private-diagnostics.js";

/** Private candidate evidence only. Validation decides acceptance; never changes the completion or retries. */
export async function retainJsonRepair(
  model: { model: string; connectionId: string },
  completion: { content: string | null; finishReason?: string },
  requestedOutputTokens?: number,
): Promise<void> {
  try {
    const parsed = readModelJsonObject(completion);
    if (!parsed.repaired) return;
    const context = venueDebugContext();
    const content = completion.content ?? "";
    const entry = {
      model: model.model.slice(0, 160),
      connectionId: model.connectionId.slice(0, 160),
      capturedAt: new Date().toISOString(),
      finishReason: completion.finishReason,
      requestedOutputTokens,
      operationId: context.operationId,
      attemptId: context.attemptId,
      stage: context.stage,
      edits: parsed.edits,
      status: "candidate",
      responseLength: content.length,
      content,
      truncated: content.length > 24000,
    };
    await retainPrivateDiagnostic(mutateDocument, "json-repair", entry);
  } catch {
    try {
      villagesLogger().warn("[villages] Could not retain private JSON-repair diagnostics");
    } catch {
      /* Diagnostics cannot change a provider result. */
    }
  }
}
