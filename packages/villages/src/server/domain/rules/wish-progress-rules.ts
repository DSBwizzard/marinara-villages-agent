import { readSemanticWishCriteria } from "./semantic-contract.js";
import { semanticContinued } from "./semantic-continuity.js";
import type { VenueLine, VenueRecordEvent } from "../models/scene-model.js";
import type { PreparedWishVerdict, WishBatchInput, WishCheckInput, WishProposal } from "../models/wish-check-model.js";
import type { WishCriteria } from "../models/wish-interpretation-model.js";
import type { VillageState, VillageWish } from "../models/world.js";
import { asRecord, asTrimmedString } from "./coerce.js";
import { validDecisionEvidence } from "./decision-candidates.js";
import { createProgressTask, type ProgressTask, revealProgress, submitProgressEvidence } from "./progress-engine.js";

import { localWishRequirements } from "./wish-admission.js";
import { wishExpired } from "./wish-definition.js";
import { sceneWishProtected } from "./scene-wish-protection.js";
import { captureSceneWishEffect } from "./scene-continuity.js";
import {
  addWishFacts,
  bindWishFacts,
  wishJournal,
  knownWish,
  rememberWishEvidence,
  wishConditionRevision,
} from "./wish-journal.js";
import { matchingWishReceipts, wishFingerprint, wishReceiptRecords } from "./wish-interpretation-rules.js";
import { fulfillResidentWish } from "./wish-lifecycle-rules.js";

export function formatWishNotice(
  id: string,
  name: string,
  wish: Pick<VillageWish, "id" | "wish">,
  state: "revealed" | "progress" | "fulfilled",
): VenueRecordEvent {
  const labels = { revealed: "Wish shared", progress: "Wish progressed", fulfilled: "Wish fulfilled" };
  return {
    id,
    kind: "wish",
    text: labels[state] + " · " + name,
    detail:
      state === "progress"
        ? wish.wish + "\n\nNew witnessed evidence was accepted. Other conditions may still remain."
        : wish.wish,
    wishUpdate: { wishId: wish.id, state },
  };
}

export const WISH_PROPOSAL_INSTRUCTION =
  'Return wishChanges:[] or [{actorId:"resident ID",wishId:"listed Wish ID",intent:"reveal|journal|progress|check",evidence:["player",0],facts:[{kind:"goal|condition",quote:"short exact resident speech",evidence:[0],supersedes:"optional existing fact ID"}]}]. Cite only this exchange. Reveal requires the resident telling the player their existing wish. Journal records only exact owner statements that materially clarify this goal (kind goal) or explicit essential conditions. Ordinary preferences, concerns and possible approaches belong solely in memoryChanges. A goal clarification does not impose a new requirement. Facts are optional, at most four, with exact resident quotes of at most 320 characters. A concern is not a condition. Conditions require explicit necessity, must clarify the same desired outcome, and apply only prospectively. Never invent hidden requirements or change a goal. Supersede only an explicitly corrected existing fact. Progress/check is for actual new fulfillment evidence, not merely learning preferences or arranging an approach. Promises and plans cannot establish physical results. Physical results use verified action receipts. Leave hidden wishes hidden and record only player-witnessed speech. Do not expose a solution checklist or require the first approach to be completed.';

export function bindWishProposals(
  value: unknown,
  state: VillageState,
  lines: VenueLine[],
  playerLineId: string,
  replyLineIds: string[],
  contexts?: { actorId: string; wishId: string; fingerprint: string }[],
  semantic = false,
): { proposals: WishProposal[]; error: string } {
  if (!Array.isArray(value))
    return {
      proposals: [],
      error:
        "Required wishChanges metadata is missing or invalid; replay saved output or explicitly retry interpretation",
    };
  const proposals: WishProposal[] = [];
  const errors: string[] = [];
  for (const item of value.slice(0, 16)) {
    const raw = asRecord(item),
      actorId = asTrimmedString(raw.actorId),
      wishId = asTrimmedString(raw.wishId);
    const wish = state.villagers
      .find((resident) => resident.characterId === actorId)
      ?.agenda?.wishes.find((wish) => wish.id === wishId);
    const refs = Array.isArray(raw.evidence) ? raw.evidence : [];
    const lineIds = [
      ...new Set(
        refs.map((ref) =>
          ref === "player"
            ? playerLineId
            : Number.isInteger(ref) && Number(ref) >= 0
              ? replyLineIds[Number(ref)]
              : typeof ref === "string" && (ref === playerLineId || replyLineIds.includes(ref))
                ? ref
                : "",
        ),
      ),
    ];
    const evidence = lineIds.map((id) => lines.find((line) => line.id === id));
    if (
      !wish ||
      (contexts &&
        !contexts.some(
          (context) =>
            context.actorId === actorId && context.wishId === wishId && context.fingerprint === wishFingerprint(wish),
        )) ||
      !["reveal", "journal", "progress", "check"].includes(String(raw.intent)) ||
      !refs.length ||
      refs.length > 8 ||
      (["journal", "reveal"].includes(String(raw.intent)) &&
        evidence.some((line) => line?.contactHidden || line?.kind === "whisper")) ||
      evidence.some((line) => !line || !line.heardBy.includes(actorId) || line.contactReport || line.kind === "side")
    ) {
      errors.push("Wish proposal has an unknown Wish, missing evidence or wrong witness");
      continue;
    }
    if (
      raw.intent === "reveal" &&
      !evidence.some(
        (line) =>
          line?.speakerId === actorId &&
          line.kind !== "narration" &&
          line.kind !== "whisper" &&
          !line.contactHidden &&
          (semantic || !/\b(?:if|perhaps|maybe|quoted|said that)\b/iu.test(line.content)),
      )
    ) {
      errors.push("Wish disclosure needs this resident's own speech heard by the player");
      continue;
    }
    const existing = proposals.find(
      (proposal) =>
        proposal.actorId === actorId &&
        proposal.wishId === wishId &&
        (proposal.intent === raw.intent ||
          (["check", "progress"].includes(proposal.intent) && ["check", "progress"].includes(String(raw.intent)))),
    );
    const semanticCriteria = semantic && wish ? readSemanticWishCriteria(raw.criteria, wish.wish) : undefined;
    if (semantic && ["check", "progress"].includes(String(raw.intent)) && !semanticCriteria) {
      errors.push("System Wish classification is missing or invalid; retry interpretation");
      continue;
    }
    if (existing) {
      existing.lineIds = [...new Set([...existing.lineIds, ...lineIds])];
      existing.facts = [
        ...(existing.facts ?? []),
        ...bindWishFacts(
          raw.facts,
          actorId,
          lines,
          (ref) =>
            ref === "player"
              ? playerLineId
              : Number.isInteger(ref) && Number(ref) >= 0
                ? (replyLineIds[Number(ref)] ?? "")
                : typeof ref === "string" && (ref === playerLineId || replyLineIds.includes(ref))
                  ? ref
                  : "",
          semantic,
        ),
      ].slice(0, 4);
      continue;
    }
    proposals.push({
      ...(semantic &&
      semanticCriteria?.kind === "conversation" &&
      !semanticCriteria.requiresPhysical &&
      asRecord(raw.verdict).completeContext === true &&
      ["none", "progress", "fulfilled"].includes(String(asRecord(raw.verdict).outcome)) &&
      Array.isArray(asRecord(raw.verdict).evidence)
        ? {
            semanticVerdict: {
              outcome: asRecord(raw.verdict).outcome as "none" | "progress" | "fulfilled",
              evidenceIds: (asRecord(raw.verdict).evidence as unknown[]).map((ref) =>
                Number.isSafeInteger(ref) && Number(ref) >= 0 ? (replyLineIds[Number(ref)] ?? "") : "",
              ),
              reason: asTrimmedString(asRecord(raw.verdict).reason).slice(0, 320),
            },
          }
        : {}),
      actorId,
      wishId,
      fingerprint: wishFingerprint(wish),
      facts: bindWishFacts(
        raw.facts,
        actorId,
        lines,
        (ref) =>
          ref === "player"
            ? playerLineId
            : Number.isInteger(ref) && Number(ref) >= 0
              ? (replyLineIds[Number(ref)] ?? "")
              : typeof ref === "string" && (ref === playerLineId || replyLineIds.includes(ref))
                ? ref
                : "",
        semantic,
      ),
      ...(semanticCriteria ? { semanticCriteria } : {}),
      intent: raw.intent as WishProposal["intent"],
      lineIds,
    });
  }
  for (const proposal of [...proposals])
    if (["check", "progress"].includes(proposal.intent) && proposal.facts?.length)
      proposals.push({ ...proposal, intent: "journal" });
  return { proposals, error: errors.join("; ").slice(0, 500) };
}

export const batchItems = (input: WishCheckInput | WishBatchInput) => ("items" in input ? input.items : [input]);

export const effectId = (sceneId: string, submissionId: string, proposal: WishProposal) =>
  `wish-change:${sceneId}:${submissionId}:${proposal.wishId}:${proposal.intent}`;

export const taskId = (proposal: WishProposal) => `wish:${proposal.actorId}:${proposal.wishId}:${proposal.fingerprint}`;

export function currentWish(state: VillageState, proposal: WishProposal, now = Date.now(), sceneId?: string) {
  const wish = state.villagers
    .find((resident) => resident.characterId === proposal.actorId)
    ?.agenda?.wishes.find((wish) => wish.id === proposal.wishId);
  return wish &&
    wishFingerprint(wish) === proposal.fingerprint &&
    (!wishExpired(wish, now) || (!!sceneId && sceneWishProtected(state, proposal.actorId, wish, sceneId))) &&
    (proposal.conditionRevision === undefined ||
      wishConditionRevision(state, proposal.actorId, wish, proposal.conditionAt) === proposal.conditionRevision)
    ? wish
    : null;
}

function ensureTask(
  state: VillageState,
  proposal: WishProposal,
  wish: VillageWish,
  criteria: WishCriteria,
): ProgressTask {
  let task = state.progressTasks.find((task) => task.definition.id === taskId(proposal));
  if (!task) {
    // A compound goal is ONE conjunctive requirement: no single clause can settle the whole wish.
    task = createProgressTask(
      {
        id: taskId(proposal),
        revision: 1,
        owner: { kind: "wish", id: wish.id },
        resolver: "wish.fulfill",
        phases: [
          {
            id: "conditions",
            title: "All Wish conditions",
            requirements: [
              {
                id: "all",
                title: wish.wish,
                routes: [
                  {
                    id: "verified",
                    verifier: "wish.prepared-verdict",
                    params: { fingerprint: proposal.fingerprint, criteria: JSON.stringify(criteria) },
                  },
                ],
              },
            ],
          },
        ],
      },
      "",
      wish.addedAt || "1970-01-01T00:00:00.000Z",
    );
    state.progressTasks.push(task);
  }
  if (wish.learnedAt) revealProgress(task, wish.learnedAt);
  return task;
}

export function applyPreparedWishVerdict(
  state: VillageState,
  input: WishCheckInput,
  verdict: PreparedWishVerdict,
  now = Date.now(),
): void {
  const id = effectId(input.sceneId, input.submissionId, input.proposal);
  if (semanticContinued(state, input.sceneId, input.submissionId, "wishes")) return;
  if (state.exchangeReceipts[id] || state.seed !== input.seed) return;
  const wish = currentWish(state, input.proposal, now, input.sceneId);
  if (verdict.decision) {
    const { check, result } = verdict.decision;
    const facts = asRecord(check.facts);
    if (
      !validDecisionEvidence(check, result) ||
      facts.actorId !== input.proposal.actorId ||
      facts.wishFingerprint !== input.proposal.fingerprint ||
      result.outcome !== verdict.outcome ||
      JSON.stringify(result.evidenceIds) !== JSON.stringify(verdict.evidenceIds) ||
      JSON.stringify(facts.criteria) !== JSON.stringify(verdict.criteria) ||
      check.evidence.some(
        (line) =>
          line.kind !== "claim" &&
          line.kind !== "receipt" &&
          ![
            ...input.context.evidence,
            ...(input.context.knowledgeByWish?.[input.proposal.wishId]?.evidence ??
              input.context.knowledge?.evidence ??
              []),
          ].some(
            (actual) => actual.id === line.id && actual.speakerId === line.speakerId && actual.content === line.content,
          ),
      )
    )
      return;
  }
  if (
    !wish ||
    (verdict.criteria.conditionRevision ?? input.proposal.conditionRevision ?? 0) !==
      wishConditionRevision(state, input.proposal.actorId, wish, input.proposal.conditionAt)
  )
    return;
  const matching = matchingWishReceipts(
    verdict.criteria,
    { actorId: input.proposal.actorId, receipts: wishReceiptRecords(state, input.proposal.actorId) },
    wish,
  );
  const requirements = localWishRequirements(wish, input.proposal.semanticCriteria);
  const requiresPhysical =
    verdict.criteria.requiresPhysical ||
    (verdict.outcome === "fulfilled" && requirements.criteria.requiresPhysical) ||
    (verdict.outcome === "progress" && requirements.physicalOnly);
  const physical = !requiresPhysical || matching.some((receipt) => verdict.receiptIds.includes(receipt.id));
  const supported =
    verdict.evidenceIds.length > 0 &&
    verdict.evidenceIds.every(
      (id) =>
        input.context.evidence.some(
          (line) => line.id === id && (!wish.addedAt || (line.at && line.at >= wish.addedAt)),
        ) || matching.some((receipt) => `receipt:${receipt.id}` === id),
    );
  const playerWitnessed =
    verdict.evidenceIds.length > 0 && verdict.evidenceIds.every((id) => input.context.playerEvidenceIds?.includes(id));
  const playerKnows =
    !!knownWish(state, input.proposal.actorId, wish.id) ||
    Object.values(state.exchangeReceipts).some(
      (row) =>
        row.sceneId === input.sceneId &&
        row.submissionId === input.submissionId &&
        row.wishId === wish.id &&
        row.actorId === input.proposal.actorId &&
        row.status === "applied" &&
        row.wishDisclosure,
    );
  let fulfilled = false;
  let reason = verdict.reason,
    notice: VenueRecordEvent | undefined;
  const task = ensureTask(state, input.proposal, wish, verdict.criteria);
  if (!physical && (verdict.outcome === "fulfilled" || verdict.outcome === "progress"))
    reason = "Required transfer or physical action receipt absent";
  else if (!supported && (verdict.outcome === "fulfilled" || verdict.outcome === "progress"))
    reason = "Required witnessed evidence absent or obsolete";
  else if (verdict.outcome === "fulfilled") {
    const memoryId = id;
    const result = submitProgressEvidence(
      task,
      "all",
      "verified",
      {
        id,
        kind: "prepared-wish-verdict",
        at: input.at,
        sourceId: input.submissionId,
        grade: "cited-interpretation",
        interpretationVersion: 1,
        excerpt: verdict.criteria.goal,
      },
      state,
      {
        verifiers: { "wish.prepared-verdict": () => ({ status: "accepted" }) },
        resolvers: {
          "wish.fulfill": () => {
            const resident = state.villagers.find((resident) => resident.characterId === input.proposal.actorId)!;
            rememberWishEvidence(
              (wish.goalJournal ??= { facts: [], evidence: [] }),
              input.context.evidence.filter((line) => verdict.evidenceIds.includes(line.id)),
              input.sceneId,
              input.submissionId,
            );
            for (const receipt of matching.filter((receipt) => verdict.receiptIds.includes(receipt.id)))
              addWishFacts(
                state,
                input.proposal.actorId,
                wish,
                [{ kind: "result", quote: receipt.text.slice(0, 320), lineIds: ["receipt:" + receipt.id] }],
                input.sceneId,
                input.submissionId,
                input.at,
              );
            fulfilled = !!fulfillResidentWish(resident, wish.id, input.at, memoryId);
          },
        },
      },
    );
    if (result.status === "accepted" && playerWitnessed && playerKnows)
      notice = formatWishNotice(id, input.context.card.name, wish, "fulfilled");
    reason = result.status === "accepted" ? "All faithful Wish conditions confirmed" : result.reason;
  } else if (verdict.outcome === "progress" && playerWitnessed && playerKnows) {
    const previous = Object.values(state.exchangeReceipts).some(
      (receipt) =>
        receipt.domain === "wishes" &&
        receipt.actorId === input.proposal.actorId &&
        receipt.wishId === wish.id &&
        receipt.reason === "New Wish evidence accepted" &&
        receipt.evidenceIds.length === verdict.evidenceIds.length &&
        receipt.evidenceIds.every((id) => verdict.evidenceIds.includes(id)),
    );
    if (!previous) notice = formatWishNotice(id, input.context.card.name, wish, "progress");
    reason = "New Wish evidence accepted";
  }
  const journal = wishJournal(state, input.proposal.actorId, wish.id);
  if (journal && supported && physical && verdict.outcome === "progress") {
    rememberWishEvidence(
      journal,
      input.context.evidence.filter((line) => verdict.evidenceIds.includes(line.id)),
      input.sceneId,
      input.submissionId,
    );
    for (const receipt of matching.filter((receipt) => verdict.receiptIds.includes(receipt.id)))
      addWishFacts(
        state,
        input.proposal.actorId,
        wish,
        [{ kind: "result", quote: receipt.text.slice(0, 320), lineIds: ["receipt:" + receipt.id] }],
        input.sceneId,
        input.submissionId,
        input.at,
      );
  }
  if (notice) notice.wishUpdate = { ...notice.wishUpdate!, actorId: input.proposal.actorId };
  state.exchangeReceipts[id] = {
    actorId: input.proposal.actorId,
    wishId: wish.id,
    status: fulfilled || (supported && physical && verdict.outcome === "progress") ? "applied" : "rejected",
    id,
    sceneId: input.sceneId,
    submissionId: input.submissionId,
    domain: "wishes",
    at: input.at,
    evidenceIds: verdict.evidenceIds,
    reason,
    wishOutcome: fulfilled ? "fulfilled" : undefined,
    wishGoal: fulfilled ? wish.wish : undefined,
    wishAudience: fulfilled
      ? [input.proposal.actorId, ...(playerWitnessed && playerKnows ? ["player"] : [])]
      : undefined,
    sceneFacts: {
      ...captureSceneWishEffect(state, input.proposal.actorId, wish.id),
    },
    ...(notice ? { notice } : {}),
  };
}
