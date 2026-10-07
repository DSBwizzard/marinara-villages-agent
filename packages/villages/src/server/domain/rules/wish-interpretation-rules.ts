import { createHash } from "node:crypto";
import type { InterpretationCheck, InterpretationResult } from "../models/interpretation-check-model.js";
import type { VenueScene } from "../models/scene-model.js";
import type { WishCriteria, WishInterpretationContext, WishReceipt } from "../models/wish-interpretation-model.js";
import type { VillageState, VillageWish } from "../models/world.js";
import { asRecord } from "./coerce.js";
import { physicalVenueEvents } from "./venue-scene-state.js";

export function wishReceiptRecords(state: VillageState, actorId: string, scene?: VenueScene): WishReceipt[] {
  return [
    ...physicalVenueEvents(state).flatMap((event) => {
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
      if (project.status !== "complete" || flow?.phase !== "complete" || !flow.completedAt || !task?.resolvedAt)
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
      criteria: {
        ...criteria,
        conditionRevision: context.knowledge?.conditionRevision ?? wish.conditionRevision ?? 0,
        conditionAt: context.knowledge?.asOf,
      },
      conditions: context.knowledge?.conditions ?? [],
      discoveries: context.knowledge?.discoveries ?? [],
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
        at: event.at,
        submissionId: event.actionReceipt?.submissionId,
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
      "Judge the desired outcome, not completion of a particular approach. Discoveries and preparations are context, never mandatory steps. Only facts.conditions are explicitly expressed essential conditions; each applies to results after its at time, never retroactively; a condition spoken in an action's reply cannot constrain physical results from that same submissionId. Concerns do not imply requirements. A different route may fulfill the same wish directly. Never invent secret preferences, tools, instructors, places or step counts. The original facts.wishText is the authoritative goal; never invent conditions such as physical takeover for spoken recognition. Fulfilled must establish EVERY original condition. Progress may establish a real conversational part of a mixed goal without completing physical work. Promises, plans, repetition, gratitude and claims are not physical results. Positive answers must include details:{proofKind:conversation|physical}; explain the conditions actually established briefly in reason, not extra details fields or a future intention. For any physical result cite an authoritative matching receipt. For conversational results cite actual player/resident interaction. Earlier exact relevant evidence can establish earlier conditions, but a new event needs a current citation. Unknown meaning is unresolved, not refusal.",
  };
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
