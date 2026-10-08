import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { DocumentSlot } from "../../../adapters/storage/document-store.js";
import type { InterpretationBatch } from "../../../domain/models/interpretation-model.js";
import type { WishCriteria, WishInterpretationContext } from "../../../domain/models/wish-interpretation-model.js";
import { asRecord } from "../../../domain/rules/coerce.js";
import { localWishRequirements, wishEvidenceAdmission } from "../../../domain/rules/wish-admission.js";
import {
  matchingWishReceipts,
  wishInterpretationCheck,
  validateWishInterpretation,
} from "../../../domain/rules/wish-interpretation-rules.js";
import type { interpretChecks } from "../../generation/interpretation.js";
import type { systemInterpretations } from "../../generation/system-interpretation.js";
export type WishInterpretationPorts = {
  VILLAGES_PACKAGE_ID: string;
  villagesDocuments(): Pick<CapabilityDocumentStore, "getById">;
  interpretChecks: typeof interpretChecks;
  systemInterpretations: typeof systemInterpretations;
  bindCallback<T extends (...args: never[]) => unknown>(callback: T): T;
};
/** Finite Wish interpretation keeps cached reads and deferred System work with its originating activation. */
export function createWishInterpretation(ports: WishInterpretationPorts) {
  const { VILLAGES_PACKAGE_ID, villagesDocuments, interpretChecks, systemInterpretations, bindCallback } = ports;

  const criteriaSlot: DocumentSlot<{ entries: { key: string; criteria: WishCriteria }[] }> = {
    kind: "wish-interpretation-criteria",
    name: "Wish interpretation criteria",
    description: "Bounded native condition preparation",
    coerce: (value) => ({
      entries: Array.isArray(asRecord(value).entries)
        ? (asRecord(value).entries as { key: string; criteria: WishCriteria }[]).slice(-100)
        : [],
    }),
    label: () => "Wish interpretation criteria",
  };

  const criteriaDocument = "villages-wish-interpretation-criteria";

  async function cachedWishCriteria(): Promise<Map<string, WishCriteria>> {
    const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, criteriaDocument);
    return new Map(criteriaSlot.coerce(record?.data).entries.map((entry) => [entry.key, entry.criteria]));
  }

  async function interpretWishBatch(
    contexts: WishInterpretationContext[],
    sceneId: string,
    key: string,
    allowProgress = true,
    compactWish = true,
  ): Promise<InterpretationBatch> {
    const checks = contexts.flatMap((context) =>
      context.wishes.map((wish) => {
        const knowledge = context.knowledgeByWish?.[wish.id] ?? context.knowledge;
        const joined = {
          ...context,
          knowledge,
          evidence: [
            ...(knowledge?.evidence ?? []).filter((old) => !context.evidence.some((line) => line.id === old.id)),
            ...context.evidence,
          ],
        };
        const { criteria, physicalOnly } = localWishRequirements(wish);
        const check = wishInterpretationCheck(joined, wish, criteria, `${key}:${context.actorId}`, allowProgress);
        const admission = wishEvidenceAdmission(
          wish,
          check.evidence,
          matchingWishReceipts(criteria, context, wish)
            .filter((receipt) => !context.currentReceiptIds || context.currentReceiptIds.includes(receipt.id))
            .map((receipt) => receipt.id),
        );
        return {
          ...check,
          decisionEligible: false,
          decisionReason: "One cited System batch; no preparatory request",
          facts: {
            ...asRecord(check.facts),
            physicalOnly,
            admission: admission.admitted,
            admissionReason: admission.reason,
          },
        };
      }),
    );
    const batch = await interpretChecks(
      checks,
      `wish-v2:${key}`,
      sceneId,
      bindCallback(async (pending, signal) => {
        const paid = pending.filter((check) => asRecord(check.facts).admission);
        const judged = paid.length ? await systemInterpretations(paid, signal, compactWish) : [];
        return pending.map(
          (check) =>
            judged[paid.indexOf(check)] ?? {
              outcome: "none",
              source: "system" as const,
              evidenceIds: [],
              reason: String(asRecord(check.facts).admissionReason),
            },
        );
      }),
    );
    for (const [index, result] of batch.results.entries()) {
      const check = batch.checks[index],
        facts = asRecord(check.facts);
      const original = facts.criteria as WishCriteria;
      const proofKind = asRecord(result.details).proofKind;
      // Only partial CONVERSATIONAL progress can bypass a mixed goal's eventual physical requirement.
      if (result.outcome === "progress" && proofKind === "conversation" && !facts.physicalOnly)
        facts.criteria = { ...original, requiresPhysical: false, kind: "complex" };
      else if (proofKind === "physical") facts.criteria = { ...original, requiresPhysical: true };
      let reason = validateWishInterpretation(check, result);
      if (
        ["progress", "fulfilled"].includes(result.outcome) &&
        original.kind === "complex" &&
        !["conversation", "physical"].includes(String(proofKind))
      )
        reason = "Positive complex Wish result lacks a proof kind";
      if (reason) {
        result.outcome = "none";
        result.reason = reason;
        batch.traces[index].applied = `Rejected: ${reason}`;
      }
    }
    return batch;
  }

  return { cachedWishCriteria, interpretWishBatch };
}
export type WishInterpretationService = ReturnType<typeof createWishInterpretation>;
