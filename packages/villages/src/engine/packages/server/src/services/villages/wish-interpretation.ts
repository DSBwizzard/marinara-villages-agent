import { createHash } from "node:crypto";
import type { VillageWish, VillageVenueEvent, VillageState } from "./types.js";
import type { VenueScene } from "./venue-session.js";
import type { VillageWishClaimContext, VillageWishVerdictResult } from "./wishes.js";
import { asRecord, asTrimmedString } from "./coerce.js";
import { villagesDocuments, VILLAGES_PACKAGE_ID } from "./package-runtime.js";
import type { DocumentSlot } from "./village-store.js";
import { localWishRequirements, wishEvidenceAdmission } from "./wish-admission.js";
import {
  interpretChecks,
  systemInterpretations,
  type InterpretationBatch,
  type InterpretationCheck,
  type InterpretationEvidence,
  type InterpretationResult,
} from "./interpretation.js";
export type WishCriteria = {
  kind: "conversation" | "transfer" | "action" | "complex";
  goal: string;
  requiresPhysical: boolean;
  itemName?: string;
  predicate?: "item-added" | "item-removed" | "trace-resolved";
  target?: string;
  venueId?: string;
};
export function coerceWishApplicationProof(value: unknown): {
  fingerprint: string;
  criteria: WishCriteria;
  receiptIds: string[];
} {
  const row = asRecord(value),
    criteria = readWishCriteria({ ...asRecord(row.criteria), complete: true }, { wish: "" } as VillageWish);
  return {
    fingerprint: /^[a-f0-9]{64}$/u.test(asTrimmedString(row.fingerprint))
      ? asTrimmedString(row.fingerprint)
      : "invalid",
    criteria: criteria || { kind: "complex", goal: "Invalid stored proof", requiresPhysical: true },
    receiptIds: Array.isArray(row.receiptIds)
      ? row.receiptIds.filter((id): id is string => typeof id === "string" && id.length <= 200).slice(0, 200)
      : [],
  };
}
type WishReceipt = VillageVenueEvent & { completedProject?: boolean };
export type WishInterpretationContext = VillageWishClaimContext & {
  currentReceiptIds?: string[];
  actorId: string;
  evidence: InterpretationEvidence[];
  receipts: WishReceipt[];
};
/** Public completed Projects are physical facts; prose or an unfinished task cannot create this proof. */
export function wishReceiptRecords(state: VillageState, actorId: string, scene?: VenueScene): WishReceipt[] {
  return [
    ...state.venueEvents.flatMap((event) => {
      const proof = event.actionReceipt;
      if (!proof?.happened) return [];
      const saved = scene?.submissions.find(
        (turn) => turn.id === proof.submissionId && turn.action?.happened && turn.activeIdsAtTurn?.includes(actorId),
      );
      return proof.witnessIds?.includes(actorId)
        ? [event]
        : saved
          ? [{ ...event, actionReceipt: { ...proof, witnessIds: [...saved.activeIdsAtTurn!] } }]
          : [];
    }),
    ...state.projects.flatMap((project) => {
      const flow = project.lifecycle;
      const task = state.progressTasks.find((item) => item.definition.owner.id === project.id);
      if (
        project.status !== "complete" ||
        flow?.phase !== "complete" ||
        !flow.completedAt ||
        (state.progressEngineVersion === 1 && !task?.resolvedAt)
      )
        return [];
      const venue = state.venues.find((item) => item.id === project.venueId);
      if (!venue || venue.constructionStatus === "worksite") return [];
      const text = `Verified completed Project: ${project.title}, at ${venue.name}; builder: ${flow.builderId}.`;
      const completedAt = task?.resolvedAt || project.updatedAt;
      return [
        {
          id: `completed-project:${project.id}:${completedAt}`,
          venueId: venue.id,
          venueName: venue.name,
          text,
          at: completedAt,
          completedProject: true,
          actionReceipt: { submissionId: `project:${project.id}`, happened: true, narration: text },
        },
      ];
    }),
  ];
}
export const wishFingerprint = (wish: VillageWish) =>
  createHash("sha256")
    .update(
      JSON.stringify({
        id: wish.id,
        wish: wish.wish,
        addedAt: wish.addedAt,
        expiresAt: wish.expiresAt,
        tell: wish.tell,
        need: wish.need,
      }),
    )
    .digest("hex");
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
/** Local cached preparation lookup for routing new receipts; never prepares or interprets on a read. */
export async function cachedWishCriteria(): Promise<Map<string, WishCriteria>> {
  const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, criteriaDocument);
  return new Map(criteriaSlot.coerce(record?.data).entries.map((entry) => [entry.key, entry.criteria]));
}
export function readWishCriteria(value: unknown, wish: VillageWish): WishCriteria | null {
  const row = asRecord(value);
  if (
    row.complete !== true ||
    !["conversation", "transfer", "action", "complex"].includes(String(row.kind)) ||
    typeof row.requiresPhysical !== "boolean" ||
    !asTrimmedString(row.goal) ||
    asTrimmedString(row.goal).length > 1000
  )
    return null;
  const kind = row.kind as WishCriteria["kind"];
  if (kind === "conversation" && row.requiresPhysical !== false) return null;
  if ((kind === "transfer" || kind === "action") && row.requiresPhysical !== true) return null;
  if (kind === "transfer" && !asTrimmedString(row.itemName)) return null;
  if (
    kind === "action" &&
    (!["item-added", "item-removed", "trace-resolved"].includes(String(row.predicate)) || !asTrimmedString(row.target))
  )
    return null;
  return {
    kind,
    goal: asTrimmedString(row.goal) || wish.wish,
    requiresPhysical: row.requiresPhysical,
    itemName: asTrimmedString(row.itemName).slice(0, 200),
    predicate: row.predicate as WishCriteria["predicate"],
    target: asTrimmedString(row.target).slice(0, 200),
    venueId: asTrimmedString(row.venueId),
  };
}
export function matchingWishReceipts(
  criteria: WishCriteria,
  context: Pick<WishInterpretationContext, "actorId" | "receipts">,
  wish: VillageWish,
) {
  return context.receipts.filter((event) => {
    const proof = event.actionReceipt;
    if (
      !proof?.happened ||
      (wish.addedAt && event.at < wish.addedAt) ||
      ((!event.completedProject || criteria.kind !== "complex") && !proof.witnessIds?.includes(context.actorId)) ||
      (criteria.venueId && criteria.venueId !== event.venueId)
    )
      return false;
    if (criteria.kind === "transfer")
      return (
        proof.itemTransfer?.recipientId === context.actorId &&
        proof.itemTransfer.itemName === criteria.itemName &&
        proof.removeItem === criteria.itemName
      );
    if (criteria.kind === "action")
      return criteria.predicate === "item-added"
        ? proof.addItem === criteria.target
        : criteria.predicate === "item-removed"
          ? proof.removeItem === criteria.target
          : proof.resolveTraceId === criteria.target;
    return true; // Complex physical meaning stays System; these are actual receipts, never narrative claims.
  });
}
export function wishInterpretationCheck(
  context: WishInterpretationContext,
  wish: VillageWish,
  criteria: WishCriteria,
  key: string,
  allowProgress = false,
): InterpretationCheck {
  const receipts = matchingWishReceipts(criteria, context, wish);
  return {
    id: `${key}:${wish.id}`,
    domain: "wish",
    question: `Did this Scene fulfill ${context.card.name}'s wish?`,
    outcomes: [
      {
        id: "fulfilled",
        statement: `The witnessed record establishes every condition of this wish for ${context.card.name}, rather than merely a promise, attempt, claim, gratitude or unrelated kindness.`,
      },
      ...(allowProgress
        ? [
            {
              id: "progress",
              statement:
                "The cited new witnessed exchange establishes a meaningful part of this Wish's faithful goal without meeting every condition. Mere repetition, greetings, promises, claims and gratitude are not progress. Physical progress requires an actual relevant physical receipt.",
            },
          ]
        : []),
    ],
    facts: {
      actorId: context.actorId,
      wishId: wish.id,
      wishFingerprint: wishFingerprint(wish),
      wishText: wish.wish,
      criteria,
      claim: context.claim,
      playerName: context.playerName,
      matchingReceiptIds: receipts.map((event) => event.id),
      wishAddedAt: wish.addedAt,
      worldState: context.worldState,
    },
    evidence: [
      ...context.evidence.map((line) => ({
        ...line,
        current: line.current ?? (!wish.addedAt || (!!line.at && line.at >= wish.addedAt)),
      })),
      ...receipts.map((event) => ({
        id: `receipt:${event.id}`,
        speakerId: "player",
        name: "Verified action",
        kind: "receipt",
        content: event.text,
        current: context.currentReceiptIds ? context.currentReceiptIds.includes(event.id) : true,
      })),
      { id: "wish-claim", speakerId: "player", name: context.playerName, kind: "claim", content: context.claim },
    ],
    decisionEligible:
      !allowProgress &&
      criteria.kind !== "complex" &&
      (criteria.requiresPhysical
        ? receipts.length > 0
        : context.evidence.some(
            (line) =>
              line.speakerId === "player" &&
              line.kind !== "claim" &&
              (!wish.addedAt || (!!line.at && line.at >= wish.addedAt)),
          )),
    decisionReason: allowProgress
      ? "Live progress and completion use the journaled System check"
      : criteria.kind === "complex"
        ? "Complex wish conditions use System"
        : criteria.requiresPhysical
          ? "No matching authoritative physical receipt; using System"
          : "No witnessed player interaction; using System",
    systemInstruction:
      "The original facts.wishText is the authoritative goal; never invent conditions such as physical takeover for spoken recognition. Fulfilled must establish EVERY original condition. Progress may establish a real conversational part of a mixed goal without completing physical work. Promises, plans, repetition, gratitude and claims are not physical results. Positive answers must include details:{proofKind:conversation|physical}; label the conditions actually established, not a future intention. For any physical result cite an authoritative matching receipt. For conversational results cite actual player/resident interaction. Earlier exact relevant evidence can establish earlier conditions, but a new event needs a current citation. Unknown meaning is unresolved, not refusal.",
  };
}
/** One bounded semantic request shares evidence across residents; criteria preparation makes no API call. */
export async function interpretWishBatch(
  contexts: WishInterpretationContext[],
  sceneId: string,
  key: string,
  allowProgress = true,
): Promise<InterpretationBatch> {
  const checks = contexts.flatMap((context) =>
    context.wishes.map((wish) => {
      const { criteria, physicalOnly } = localWishRequirements(wish);
      const check = wishInterpretationCheck(context, wish, criteria, `${key}:${context.actorId}`, allowProgress);
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
  const batch = await interpretChecks(checks, `wish-v2:${key}`, sceneId, async (pending, signal) => {
    const paid = pending.filter((check) => asRecord(check.facts).admission);
    const judged = paid.length ? await systemInterpretations(paid, signal) : [];
    return pending.map(
      (check) =>
        judged[paid.indexOf(check)] ?? {
          outcome: "none",
          source: "system" as const,
          evidenceIds: [],
          reason: String(asRecord(check.facts).admissionReason),
        },
    );
  });
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
export function validateWishInterpretation(check: InterpretationCheck, result: InterpretationResult): string {
  if (result.outcome !== "fulfilled" && result.outcome !== "progress") return "";
  const facts = asRecord(check.facts),
    criteria = facts.criteria as WishCriteria;
  if (criteria.requiresPhysical) {
    const ids = Array.isArray(facts.matchingReceiptIds) ? (facts.matchingReceiptIds as string[]) : [];
    if (!ids.length || !result.evidenceIds.some((id) => ids.some((receipt) => id === `receipt:${receipt}`)))
      return "No matching witnessed physical receipt";
  } else if (
    !result.evidenceIds.some((id) =>
      check.evidence.some(
        (line) =>
          line.id === id &&
          line.current &&
          line.speakerId === "player" &&
          line.kind !== "claim" &&
          line.kind !== "receipt" &&
          line.content.trim(),
      ),
    )
  )
    return "No actual player interaction supports the conversational wish";
  return "";
}
export async function interpretWishClaim(
  context: WishInterpretationContext,
  sceneId: string,
  key: string,
  allowProgress = false,
): Promise<VillageWishVerdictResult & { batch: InterpretationBatch }> {
  const batch = await interpretWishBatch([context], sceneId, key, allowProgress);
  const checks = batch.checks;
  let selected = -1;
  for (const [index, result] of batch.results.entries()) {
    const reason = validateWishInterpretation(checks[index], result);
    if (reason) {
      batch.traces[index].applied = `Rejected: ${reason}`;
      result.outcome = "none";
      result.reason = reason;
      continue;
    }
    if (result.outcome === "fulfilled" && selected < 0) selected = index;
  }
  if (selected >= 0) {
    const wish = context.wishes[selected];
    for (const [index, trace] of batch.traces.entries())
      trace.applied =
        index === selected
          ? "Wish supported; awaiting current-state application"
          : batch.results[index].outcome === "fulfilled"
            ? "Supported; one wish is applied per claim and this wish remains active"
            : trace.applied === "Not yet applied"
              ? "No wish change"
              : trace.applied;
    return {
      batch,
      wish,
      verdict: {
        fulfilled: true,
        reason: batch.results[selected].reason || "The witnessed record satisfies this wish.",
      },
      memory:
        asTrimmedString(asRecord(batch.results[selected].details).memory).slice(0, 600) ||
        `${context.card.name} saw ${context.playerName} fulfill their wish: ${wish.wish}`,
    };
  }
  const unresolved = batch.results.some((result) => result.outcome === "unresolved");
  for (const trace of batch.traces)
    if (trace.applied === "Not yet applied")
      trace.applied =
        trace.result.outcome === "unresolved" ? "Unresolved: natural clarification needed" : "No wish change";
  return {
    batch,
    wish: null,
    memory: "",
    verdict: {
      fulfilled: false,
      reason: unresolved
        ? "It is still unclear whether that settles the wish; clarify what happened."
        : batch.results[0]?.reason || "The record does not yet satisfy that wish.",
    },
    ...(unresolved ? { interpretationStatus: "unresolved" as const } : {}),
  };
}
