import { createHash, randomUUID } from "node:crypto";
import type { CapabilityLanguageModelCompletion as Completion } from "@marinara-engine/shared";
import type { mutateDocument } from "../../adapters/storage/document-store.js";
import type { VillageCompletionOptions } from "../../domain/models/completion-model.js";
import { retainPrivateDiagnostic } from "../../adapters/observability/private-diagnostics.js";

type Response = { token: string; digest: string; result: Completion };
const usageFields = ["promptTokens", "completionTokens", "completionReasoningTokens", "totalTokens"] as const;
type UsageField = (typeof usageFields)[number];
type Receipt = {
  format: 1;
  purpose: "standalone-generation";
  fingerprint: string;
  dispatched: number;
  settled: number;
  rejected: number;
  pending: string[];
  usage: Record<UsageField, { known: number; unknown: number }>;
  settledDigest: string;
  selected?: Response;
  candidate?: Response;
};
const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const replayDigest = (result: Completion) =>
  digest([
    result.content,
    result.finishReason,
    result.usage ? usageFields.map((field) => result.usage?.[field] ?? null) : null,
  ]);

/** Only conclusively settled attempts lose their body; replay and uncertainty have no expiry. */
export async function claimSavedResponse(
  mutate: typeof mutateDocument,
  request: NonNullable<VillageCompletionOptions["savedRequest"]>,
  messages: unknown,
  warn: () => void,
) {
  const id = "villages-generation-response-" + createHash("sha256").update(request.key).digest("hex");
  const fingerprint = digest(messages);
  const token = randomUUID();
  const slot = {
    kind: "generation-response",
    name: "Saved generation response",
    description: "Private replay response and unresolved dispatch identities",
    label: () => "Saved generation response",
    coerce: (raw: unknown): Receipt => {
      if (raw === undefined)
        return {
          format: 1,
          purpose: "standalone-generation",
          fingerprint,
          dispatched: 0,
          settled: 0,
          rejected: 0,
          pending: [],
          settledDigest: "",
          usage: Object.fromEntries(usageFields.map((key) => [key, { known: 0, unknown: 0 }])) as Receipt["usage"],
        };
      const row = structuredClone(raw) as Receipt;
      const response = (value: Response | undefined) =>
        value === undefined ||
        (typeof value.token === "string" &&
          !!value.token &&
          /^[a-f0-9]{64}$/.test(value.digest) &&
          !!value.result &&
          (typeof value.result.content === "string" || value.result.content === null) &&
          typeof value.result.finishReason === "string" &&
          replayDigest(value.result) === value.digest);
      if (
        !row ||
        row.format !== 1 ||
        row.purpose !== "standalone-generation" ||
        typeof row.fingerprint !== "string" ||
        !/^[a-f0-9]{64}$/.test(row.fingerprint) ||
        ![row.dispatched, row.settled, row.rejected].every((n) => Number.isSafeInteger(n) && n >= 0) ||
        !Array.isArray(row.pending) ||
        !row.pending.every((value) => typeof value === "string" && value) ||
        new Set(row.pending).size !== row.pending.length ||
        row.settled + row.pending.length !== row.dispatched ||
        row.rejected > row.settled ||
        typeof row.settledDigest !== "string" ||
        (row.settled === 0 ? row.settledDigest !== "" : !/^[a-f0-9]{64}$/.test(row.settledDigest)) ||
        !row.usage ||
        !usageFields.every(
          (key) =>
            row.usage[key] &&
            [row.usage[key].known, row.usage[key].unknown].every((n) => Number.isSafeInteger(n) && n >= 0),
        ) ||
        !response(row.selected) ||
        !response(row.candidate) ||
        (row.selected && row.candidate) ||
        (!!(row.selected ?? row.candidate) &&
          (!row.settled || row.pending.includes((row.selected ?? row.candidate)!.token)))
      )
        throw new Error("The saved generation receipt is unreadable. The response is preserved.");
      return row;
    },
  };
  let cached: Completion | undefined;
  await mutate(id, slot, (receipt) => {
    cached = undefined;
    if (receipt.fingerprint !== fingerprint)
      throw new Error("Saved generation inputs changed. The response is preserved.");
    if (receipt.selected) {
      cached = structuredClone(receipt.selected.result);
      return false;
    }
    if (receipt.candidate) {
      receipt.selected = receipt.candidate;
      delete receipt.candidate;
      cached = structuredClone(receipt.selected.result);
      return;
    }
    if (receipt.dispatched && !request.retry)
      throw new Error("The previous request may have been billed. Retry explicitly.");
    receipt.dispatched++;
    receipt.pending.push(token);
  });

  async function retain(result: Completion, adopt: boolean): Promise<Completion> {
    let valid = false;
    let replay = result;
    try {
      valid = !request.valid || request.valid(result);
      if (valid && request.replayContent) replay = { ...result, content: request.replayContent(result) };
    } catch {
      // A projection is the application parser too; its rejection cannot authorize effects or reuse.
      valid = false;
    }
    let returned = result;
    let rejected = false;
    await mutate(id, slot, (receipt) => {
      returned = result;
      rejected = false;
      if (receipt.fingerprint !== fingerprint) throw new Error("Saved generation identity changed.");
      if (receipt.selected) returned = structuredClone(receipt.selected.result);
      const index = receipt.pending.indexOf(token);
      if (index < 0) {
        if (adopt && !receipt.selected)
          throw new Error("The response attempt already settled. Reopen its saved result.");
        return false;
      }
      receipt.pending.splice(index, 1);
      receipt.settled++;
      const responseDigest = digest(result);
      receipt.settledDigest = digest([receipt.settledDigest, token, responseDigest]);
      for (const field of usageFields) {
        const value = result.usage?.[field];
        if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) receipt.usage[field].known += value;
        else receipt.usage[field].unknown++;
      }
      if (!valid) {
        receipt.rejected++;
        rejected = true;
      } else if (!receipt.selected) {
        if (adopt) {
          receipt.selected = { token, digest: replayDigest(replay), result: structuredClone(replay) };
          delete receipt.candidate;
        } else receipt.candidate ??= { token, digest: replayDigest(replay), result: structuredClone(replay) };
      }
      if (adopt && !receipt.selected && receipt.candidate) {
        receipt.selected = receipt.candidate;
        delete receipt.candidate;
      }
      if (receipt.selected) returned = structuredClone(receipt.selected.result);
    });
    if (rejected) {
      try {
        const content = result.content ?? "";
        const entry = {
          requestId: id,
          token,
          fingerprint,
          capturedAt: new Date().toISOString(),
          responseDigest: digest(result),
          finishReason: result.finishReason,
          usage: result.usage,
          responseLength: content.length,
          content,
        };
        await retainPrivateDiagnostic(mutate, "generation", entry);
      } catch {
        warn();
      }
    }
    return returned;
  }
  return { cached, retain };
}
