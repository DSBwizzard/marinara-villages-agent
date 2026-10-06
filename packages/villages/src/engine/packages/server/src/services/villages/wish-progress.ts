import { backgroundCalls, backgroundSetting } from "./background-context.js";
import {
  backgroundRevision,
  backgroundStatus,
  queueBackgroundJob,
  registerBackgroundHandler,
} from "./background-work.js";
import { readEffectiveVillagerCard } from "./catalog.js";
import { asRecord, asTrimmedString } from "./coerce.js";
import type { DomainProcessing } from "./exchange-processing.js";
import { writeInterpretationDiagnostics } from "./interpretation-diagnostics.js";
import { outsideVenueOperation } from "./operation-context.js";
import { createProgressTask, type ProgressTask, revealProgress, submitProgressEvidence } from "./progress-engine.js";
import { sceneQueries } from "./scene-queries.js";
import type { VillageState, VillageWish } from "./types.js";
import type { VenueLine, VenueRecordEvent, VenueScene } from "./venue-session.js";
import { deriveVillageMoment } from "./village-clock.js";
import { readPlayerIdentity } from "./village-projections.js";
import { mutateVillageState, readVillageState } from "./village-store.js";
import { localWishRequirements, wishEvidenceAdmission } from "./wish-admission.js";
import { wishExpired } from "./wish-definition.js";
import {
  cachedWishCriteria,
  interpretWishBatch,
  matchingWishReceipts,
  type WishCriteria,
  wishFingerprint,
  type WishInterpretationContext,
  wishReceiptRecords,
} from "./wish-interpretation.js";
import {
  addWishFacts,
  bindWishFacts,
  discloseWish,
  knownWish,
  rememberWishEvidence,
  setWishJournalStatus,
  wishCheckKnowledge,
  wishConditionRevision,
  type WishFactCandidate,
} from "./wish-journal.js";
import { fulfillResidentWish } from "./wish-lifecycle.js";
import { metadataFailure, type WorkFailure, WorkFailureError } from "./work-failure.js";

export type ExchangeEffectReceipt = {
  committedAt?: string;
  noticeSequence?: number;
  status?: "applied" | "rejected";
  actorId?: string;
  wishId?: string;
  id: string;
  sceneId: string;
  submissionId: string;
  domain: "wishes" | "memories" | "physical";
  physicalOutcome?: import("./types.js").VillageVenueEvent;
  at: string;
  evidenceIds: string[];
  reason: string;
  notice?: VenueRecordEvent;
};
/** Format only saved, player-known outcomes; never request prose for a notice. */
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
export type WishProposal = {
  conditionRevision?: number;
  conditionAt?: string;
  facts?: WishFactCandidate[];
  receiptIds?: string[];
  actorId: string;
  wishId: string;
  fingerprint: string;
  intent: "reveal" | "journal" | "progress" | "check";
  lineIds: string[];
};
export const WISH_PROPOSAL_INSTRUCTION =
  'Return wishChanges:[] or [{actorId:"resident ID",wishId:"listed Wish ID",intent:"reveal|journal|progress|check",evidence:["player",0],facts:[{kind:"preference|concern|possibility|condition",quote:"short exact resident speech",evidence:[0],supersedes:"optional existing fact ID"}]}]. Cite only this exchange. Reveal requires the resident telling the player their existing wish. Journal records discoveries, not fulfillment, and makes no check request; use it for preferences, concerns, mentioned approaches or explicit essential conditions. Facts are optional, at most four, with exact resident quotes of at most 320 characters. A concern is not a condition. Conditions require explicit necessity, must clarify the same desired outcome, and apply only prospectively. Never invent hidden requirements or change a goal. Supersede only an explicitly corrected existing fact. Progress/check is for actual new fulfillment evidence, not merely learning preferences or arranging an approach. Promises and plans cannot establish physical results. Physical results use verified action receipts. Leave hidden wishes hidden and record only player-witnessed speech. Do not expose a solution checklist or require the first approach to be completed.';

export function bindWishProposals(
  value: unknown,
  state: VillageState,
  lines: VenueLine[],
  playerLineId: string,
  replyLineIds: string[],
  contexts?: { actorId: string; wishId: string; fingerprint: string }[],
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
          !/\b(?:if|perhaps|maybe|quoted|said that)\b/iu.test(line.content),
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
    if (existing) {
      existing.lineIds = [...new Set([...existing.lineIds, ...lineIds])];
      existing.facts = [
        ...(existing.facts ?? []),
        ...bindWishFacts(raw.facts, actorId, lines, (ref) =>
          ref === "player"
            ? playerLineId
            : Number.isInteger(ref) && Number(ref) >= 0
              ? (replyLineIds[Number(ref)] ?? "")
              : typeof ref === "string" && (ref === playerLineId || replyLineIds.includes(ref))
                ? ref
                : "",
        ),
      ].slice(0, 4);
      continue;
    }
    proposals.push({
      actorId,
      wishId,
      fingerprint: wishFingerprint(wish),
      facts: bindWishFacts(raw.facts, actorId, lines, (ref) =>
        ref === "player"
          ? playerLineId
          : Number.isInteger(ref) && Number(ref) >= 0
            ? (replyLineIds[Number(ref)] ?? "")
            : typeof ref === "string" && (ref === playerLineId || replyLineIds.includes(ref))
              ? ref
              : "",
      ),
      intent: raw.intent as WishProposal["intent"],
      lineIds,
    });
  }
  for (const proposal of [...proposals])
    if (["check", "progress"].includes(proposal.intent) && proposal.facts?.length)
      proposals.push({ ...proposal, intent: "journal" });
  return { proposals, error: errors.join("; ").slice(0, 500) };
}

type WishCheckInput = {
  contractVersion?: 2;
  sceneId: string;
  submissionId: string;
  seed: string;
  proposal: WishProposal;
  wish: VillageWish;
  at: string;
  context: WishInterpretationContext;
};
type PreparedWishVerdict = {
  criteria: WishCriteria;
  outcome: string;
  evidenceIds: string[];
  reason: string;
  memory: string;
  receiptIds: string[];
};
type WishBatchInput = {
  contractVersion?: 2;
  sceneId: string;
  submissionId: string;
  seed: string;
  items: WishCheckInput[];
};
type PreparedWishBatch = { items: { id: string; verdict: PreparedWishVerdict }[]; failures?: WorkFailure[] };
const batchItems = (input: WishCheckInput | WishBatchInput) => ("items" in input ? input.items : [input]);
const effectId = (sceneId: string, submissionId: string, proposal: WishProposal) =>
  `wish-change:${sceneId}:${submissionId}:${proposal.wishId}:${proposal.intent}`;
const taskId = (proposal: WishProposal) => `wish:${proposal.actorId}:${proposal.wishId}:${proposal.fingerprint}`;
function currentWish(state: VillageState, proposal: WishProposal, now = Date.now()) {
  const wish = state.villagers
    .find((resident) => resident.characterId === proposal.actorId)
    ?.agenda?.wishes.find((wish) => wish.id === proposal.wishId);
  return wish &&
    wishFingerprint(wish) === proposal.fingerprint &&
    !wishExpired(wish, now) &&
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
): void {
  const id = effectId(input.sceneId, input.submissionId, input.proposal);
  if (state.exchangeReceipts[id] || state.seed !== input.seed) return;
  const wish = currentWish(state, input.proposal);
  if (
    !wish ||
    (verdict.criteria.conditionRevision ?? input.proposal.conditionRevision ?? 0) !==
      wishConditionRevision(state, input.proposal.actorId, wish, input.proposal.conditionAt)
  )
    return;
  if (state.correctedWishMemoryIds.includes(`${input.sceneId}:wish:${wish.id}`)) return;
  const matching = matchingWishReceipts(
    verdict.criteria,
    { actorId: input.proposal.actorId, receipts: wishReceiptRecords(state, input.proposal.actorId) },
    wish,
  );
  const requirements = localWishRequirements(wish);
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
  let reason = verdict.reason,
    notice: VenueRecordEvent | undefined;
  const task = ensureTask(state, input.proposal, wish, verdict.criteria);
  if (!physical && (verdict.outcome === "fulfilled" || verdict.outcome === "progress"))
    reason = "Required transfer or physical action receipt absent";
  else if (!supported && (verdict.outcome === "fulfilled" || verdict.outcome === "progress"))
    reason = "Required witnessed evidence absent or obsolete";
  else if (verdict.outcome === "fulfilled") {
    const memoryId = `${input.sceneId}:wish:${wish.id}`;
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
            if (state.correctedWishMemoryIds.includes(memoryId)) return;
            const resident = state.villagers.find((resident) => resident.characterId === input.proposal.actorId)!;
            fulfillResidentWish(resident, wish.id, input.at, memoryId);
            const moment = deriveVillageMoment({
              foundedAt: state.foundedAt,
              seed: state.seed,
              now: new Date(input.at),
            });
            if (!state.chronicle.some((entry) => entry.id === memoryId))
              state.chronicle.unshift({
                id: memoryId,
                dayIndex: moment.dayIndex,
                clock: moment.dayPhase,
                occurredAt: input.at,
                timePrecision: "exact",
                scope: "private",
                actors: [{ id: resident.characterId, name: resident.cardSnapshot.name }],
                kind: "favour",
                weight: wish.intensity,
                text: verdict.memory || `${resident.cardSnapshot.name}'s wish was fulfilled: ${wish.wish}`,
                sourceVisitId: input.sceneId,
                sourceLineIds: verdict.evidenceIds,
                knownByCharacterIds: [resident.characterId],
              });
          },
        },
      },
    );
    if (result.status === "accepted" && !state.correctedWishMemoryIds.includes(memoryId) && wish.learnedAt)
      notice = formatWishNotice(id, input.context.card.name, wish, "fulfilled");
    reason = result.status === "accepted" ? "All faithful Wish conditions confirmed" : result.reason;
  } else if (verdict.outcome === "progress" && wish.learnedAt) {
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
  const journal = knownWish(state, input.proposal.actorId, wish.id);
  if (journal && supported && physical && ["progress", "fulfilled"].includes(verdict.outcome)) {
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
    if (verdict.outcome === "fulfilled") setWishJournalStatus(state, input.proposal.actorId, wish.id, "fulfilled");
  }
  if (notice) notice.wishUpdate = { ...notice.wishUpdate!, actorId: input.proposal.actorId };
  state.exchangeReceipts[id] = {
    actorId: input.proposal.actorId,
    wishId: wish.id,
    status:
      notice || (supported && physical && ["progress", "fulfilled"].includes(verdict.outcome)) ? "applied" : "rejected",
    id,
    sceneId: input.sceneId,
    submissionId: input.submissionId,
    domain: "wishes",
    at: input.at,
    evidenceIds: verdict.evidenceIds,
    reason,
    ...(notice ? { notice } : {}),
  };
}

registerBackgroundHandler("wish-check", {
  valid: (state, input: WishCheckInput | WishBatchInput) =>
    state.seed === input.seed && batchItems(input).some((item) => !!currentWish(state, item.proposal)),
  async generate(input: WishCheckInput | WishBatchInput): Promise<PreparedWishVerdict | PreparedWishBatch> {
    const compact = input.contractVersion === 2;
    const all = batchItems(input);
    const state = await readVillageState();
    const ids = compact
      ? await backgroundSetting("wishRows:" + (backgroundCalls.getStore()?.metadata?.attempt ?? 0), () =>
          all
            .filter(
              (item) =>
                !state.exchangeReceipts[effectId(item.sceneId, item.submissionId, item.proposal)] &&
                currentWish(state, item.proposal),
            )
            .map((item) => effectId(item.sceneId, item.submissionId, item.proposal)),
        )
      : all.map((item) => effectId(item.sceneId, item.submissionId, item.proposal));
    const items = all.filter((item) => ids.includes(effectId(item.sceneId, item.submissionId, item.proposal)));
    if (!items.length) return { items: [] };
    const batch = await interpretWishBatch(
      items.map((item) => item.context),
      input.sceneId,
      `live:${input.submissionId}`,
      true,
      compact,
    );
    await writeInterpretationDiagnostics(input.sceneId, batch.traces);
    const failures: WorkFailure[] = [];
    const prepared = items.flatMap((item, index) => {
      const check = batch.checks[index],
        result = batch.results[index];
      const failure =
        result?.failure ??
        (!result
          ? {
              cause: "missing_result" as const,
              stage: "interpretation",
              message: "Wish interpretation missing; explicit retry required",
            }
          : undefined);
      if (failure) {
        if (!compact) throw new WorkFailureError(failure);
        failures.push({ ...failure, checkIds: [effectId(item.sceneId, item.submissionId, item.proposal)] });
        return [];
      }
      const facts = asRecord(check.facts);
      return [
        {
          id: effectId(item.sceneId, item.submissionId, item.proposal),
          verdict: {
            criteria: facts.criteria as WishCriteria,
            outcome: result.outcome,
            evidenceIds: result.evidenceIds,
            reason:
              result.outcome === "unresolved"
                ? `Clarification needed: ${result.reason || "Wish meaning remains uncertain"}`
                : result.reason || "No Wish change",
            memory: "",
            receiptIds: (facts.matchingReceiptIds as string[]).filter((id) =>
              result.evidenceIds.includes(`receipt:${id}`),
            ),
          },
        },
      ];
    });
    return compact || "items" in input ? { items: prepared, failures } : prepared[0].verdict;
  },
  apply(state, input: WishCheckInput | WishBatchInput, result: PreparedWishVerdict | PreparedWishBatch) {
    for (const item of batchItems(input)) {
      const verdict =
        "items" in result
          ? result.items.find((entry) => entry.id === effectId(item.sceneId, item.submissionId, item.proposal))?.verdict
          : result;
      if (verdict) applyPreparedWishVerdict(state, item, verdict);
    }
    if ("items" in result && result.failures?.length) {
      const active = result.failures.filter((failure) =>
        failure.checkIds?.some((id) =>
          batchItems(input).some(
            (item) =>
              effectId(item.sceneId, item.submissionId, item.proposal) === id &&
              currentWish(state, item.proposal) &&
              !state.exchangeReceipts[id],
          ),
        ),
      );
      if (active.length)
        return {
          ...active[0],
          checkIds: active.flatMap((failure) => failure.checkIds ?? []),
          message: active.length + " Wish check(s) need explicit retry. Valid results were saved. " + active[0].message,
        };
    }
  },
  async afterApply(input: WishCheckInput | WishBatchInput) {
    if (input.sceneId.startsWith("project:")) return;
    const { processSavedExchange } = sceneQueries();
    await processSavedExchange(input.sceneId, input.submissionId);
  },
  async afterFailure(input: WishCheckInput | WishBatchInput | null) {
    if (!input || input.sceneId.startsWith("project:")) return;
    const { processSavedExchange } = sceneQueries();
    await processSavedExchange(input.sceneId, input.submissionId);
  },
});

/** Opening a Project saves this finite outbox alongside its physical result. No periodic Wish completion scan. */
export async function processProjectWishOutbox(): Promise<void> {
  const state = await readVillageState();
  const cached = await cachedWishCriteria();
  for (const event of state.projectWishOutbox.slice(0, 32)) {
    const project = state.projects.find((project) => project.id === event.projectId && project.status === "complete");
    if (project) {
      const routingWords = (
        `${project.title} ${project.plan?.need ?? ""} ${project.venueDraft?.description ?? ""}`
          .toLocaleLowerCase()
          .match(/[\p{L}\p{N}]{4,}/gu) ?? []
      ).filter(
        (word) =>
          ![
            "project",
            "village",
            "building",
            "build",
            "with",
            "that",
            "this",
            "will",
            "have",
            "from",
            "into",
            "their",
          ].includes(word),
      );
      for (const resident of state.villagers)
        for (const wish of resident.agenda?.wishes ?? []) {
          // Routing only; the System check must still establish ALL conditions using canonical completion receipts.
          const criteria = cached.get(`${resident.characterId}:${wishFingerprint(wish)}`);
          if (
            !routingWords.some((word) => wish.wish.toLocaleLowerCase().includes(word)) &&
            !(criteria?.requiresPhysical && criteria.venueId && criteria.venueId === project.venueId)
          )
            continue;
          const receipt = wishReceiptRecords(state, resident.characterId).find(
            (receipt) => receipt.completedProject && receipt.actionReceipt?.submissionId === `project:${project.id}`,
          );
          if (!receipt) continue;
          const player = readPlayerIdentity(state),
            fingerprint = wishFingerprint(wish);
          const proposal: WishProposal = {
            actorId: resident.characterId,
            wishId: wish.id,
            fingerprint,
            intent: "check",
            lineIds: [],
            receiptIds: [receipt.id],
          };
          const sceneId = `project:${project.id}`,
            submissionId = receipt.id,
            id = effectId(sceneId, submissionId, proposal);
          if (state.exchangeReceipts[id]) continue;
          const context: WishInterpretationContext = {
            actorId: resident.characterId,
            village: state.name,
            setting: state.setting,
            moment: deriveVillageMoment({ foundedAt: state.foundedAt, seed: state.seed, now: new Date(event.at) }),
            card: readEffectiveVillagerCard(resident),
            playerName: player.name,
            playerDescription: player.description,
            wishes: [wish],
            claim: "Check this newly completed authoritative Project against every Wish condition",
            evidence: [],
            receipts: [receipt],
            transcript: [],
            happenings: [],
            memory: [],
            worldState: [],
          };
          const input: WishCheckInput = {
            contractVersion: 2,
            sceneId,
            submissionId,
            seed: state.seed,
            proposal,
            wish,
            at: event.at,
            context,
          };
          await outsideVenueOperation(() =>
            queueBackgroundJob({
              kind: "wish-check",
              subjectId: id,
              residentId: resident.characterId,
              seed: state.seed,
              revision: backgroundRevision([state.seed, receipt.id, fingerprint]),
              finite: true,
              label: `Check ${resident.cardSnapshot.name}'s Wish after ${project.title}`,
              input,
            }),
          );
        }
    }
    await mutateVillageState((live) => {
      if (live.seed === state.seed)
        live.projectWishOutbox = live.projectWishOutbox.filter(
          (entry) => entry.projectId !== event.projectId || entry.at !== event.at,
        );
    });
  }
}

export async function processWishExchange(scene: VenueScene, submissionId: string): Promise<Partial<DomainProcessing>> {
  const turn = scene.submissions.find((turn) => turn.id === submissionId)!;
  let state = await readVillageState();
  if (turn.mode === "act" && !turn.actionReplyDone)
    return { status: "pending", reason: "Waiting for saved action narration" };
  if (state.seed !== scene.villageSeed) return { status: "rejected", reason: "Village identity changed" };
  const lineIndex = new Map(scene.lines.map((line) => [line.id, line]));
  const proposals = [
    ...new Map(
      (turn.wishProposals ?? []).map((proposal) => [
        `${proposal.actorId}:${proposal.wishId}:${["progress", "check"].includes(proposal.intent) ? "check" : proposal.intent}`,
        proposal,
      ]),
    ).values(),
  ].sort(
    (a, b) =>
      ({ reveal: 0, journal: 1, progress: 2, check: 2 })[a.intent] -
      { reveal: 0, journal: 1, progress: 2, check: 2 }[b.intent],
  );
  if (turn.action?.happened) {
    const cached = await cachedWishCriteria();
    for (const resident of state.villagers) {
      for (const wish of resident.agenda?.wishes ?? []) {
        const fingerprint = wishFingerprint(wish),
          prepared = cached.get(`${resident.characterId}:${fingerprint}`),
          criteria = prepared?.goal === wish.wish ? prepared : localWishRequirements(wish).criteria;
        if (!criteria.requiresPhysical) continue;
        const receipts = matchingWishReceipts(
          criteria,
          { actorId: resident.characterId, receipts: wishReceiptRecords(state, resident.characterId, scene) },
          wish,
        ).filter((receipt) => receipt.actionReceipt?.submissionId === turn.id);
        const words = wish.wish.toLocaleLowerCase().match(/[\p{L}\p{N}]{4,}/gu) ?? [];
        const relevant = receipts.filter(
          (receipt) =>
            criteria.kind !== "complex" ||
            words.some(
              (word) =>
                !["have", "with", "that", "this", "here", "where", "inside", "find", "their", "make"].includes(word) &&
                `${receipt.text} ${receipt.actionReceipt?.narration ?? ""}`.toLocaleLowerCase().includes(word),
            ),
        );
        if (
          !relevant.length ||
          proposals.some((proposal) => proposal.wishId === wish.id && proposal.intent !== "reveal")
        )
          continue;
        proposals.push({
          actorId: resident.characterId,
          wishId: wish.id,
          fingerprint,
          intent: "check",
          lineIds: [],
          receiptIds: relevant.map((receipt) => receipt.id),
        });
      }
    }
  }
  const receiptIds: string[] = [],
    pending: string[] = [];
  const batchInputs: WishCheckInput[] = [];
  for (const proposal of proposals) {
    const id = effectId(scene.id, turn.id, proposal),
      prior = state.exchangeReceipts[id];
    if (prior) {
      receiptIds.push(id);
      continue;
    }
    const wish = currentWish(state, proposal);
    if (!wish) continue;
    const cited = proposal.lineIds.flatMap((id) => (lineIndex.has(id) ? [lineIndex.get(id)!] : []));
    if (
      (!cited.length && !proposal.receiptIds?.length) ||
      cited.length !== proposal.lineIds.length ||
      cited.some((line) => !line.heardBy.includes(proposal.actorId))
    )
      continue;
    const resident = state.villagers.find((resident) => resident.characterId === proposal.actorId)!;
    if (proposal.intent === "reveal") {
      await mutateVillageState((live) => {
        const current = currentWish(live, proposal);
        if (live.seed !== scene.villageSeed || !current || live.exchangeReceipts[id]) return;
        const fresh = !current.learnedAt;
        discloseWish(live, proposal.actorId, current, turn.at!, proposal.lineIds);
        addWishFacts(live, proposal.actorId, current, proposal.facts ?? [], scene.id, turn.id, turn.at!);
        rememberWishEvidence(
          knownWish(live, proposal.actorId, current.id)!,
          cited.map((line) => ({
            id: line.id,
            speakerId: line.speakerId,
            name: line.name,
            content: line.content,
            kind: line.kind ?? "dialogue",
            at: line.at,
          })),
          scene.id,
          turn.id,
        );
        const task = live.progressTasks.find((task) => task.definition.id === taskId(proposal));
        if (task) revealProgress(task, current.learnedAt!);
        live.exchangeReceipts[id] = {
          status: "applied",
          actorId: proposal.actorId,
          wishId: current.id,
          id,
          sceneId: scene.id,
          submissionId: turn.id,
          domain: "wishes",
          at: turn.at!,
          evidenceIds: proposal.lineIds,
          reason: "Wish disclosed through witnessed speech",
          ...(fresh
            ? {
                notice: {
                  ...formatWishNotice(id, resident.cardSnapshot.name, current, "revealed"),
                  wishUpdate: { wishId: current.id, actorId: resident.characterId, state: "revealed" },
                },
              }
            : {}),
        };
      });
      receiptIds.push(id);
      state = await readVillageState();
      continue;
    }
    if (proposal.intent === "journal") {
      await mutateVillageState((live) => {
        const current = currentWish(live, proposal);
        if (!current || live.exchangeReceipts[id] || !current.learnedAt) return;
        const added = addWishFacts(live, proposal.actorId, current, proposal.facts ?? [], scene.id, turn.id, turn.at!);
        const entry = knownWish(live, proposal.actorId, current.id);
        if (added && entry)
          rememberWishEvidence(
            entry,
            cited.map((line) => ({
              id: line.id,
              speakerId: line.speakerId,
              name: line.name,
              content: line.content,
              kind: line.kind ?? "dialogue",
              at: line.at,
            })),
            scene.id,
            turn.id,
          );
        live.exchangeReceipts[id] = {
          id,
          sceneId: scene.id,
          submissionId: turn.id,
          actorId: proposal.actorId,
          wishId: current.id,
          domain: "wishes",
          at: turn.at!,
          evidenceIds: proposal.lineIds,
          status: "applied",
          reason: "Wish discoveries recorded locally",
          ...(added
            ? {
                notice: {
                  ...formatWishNotice(id, resident.cardSnapshot.name, current, "progress"),
                  text: "Wish discovery · " + resident.cardSnapshot.name,
                  detail: current.wish,
                  wishUpdate: { wishId: current.id, actorId: resident.characterId, state: "progress" as const },
                },
              }
            : {}),
        };
      });
      receiptIds.push(id);
      state = await readVillageState();
      continue;
    }
    const current = currentWish(state, proposal);
    if (!current) continue;
    proposal.conditionAt = turn.at;
    proposal.conditionRevision = wishConditionRevision(state, proposal.actorId, current, turn.at);
    // Old per-Wish jobs remain recoverable; discovering them never authorizes replacement paid work.
    const player = readPlayerIdentity(state);
    const currentIds = new Set([...(turn.processing?.lineIds ?? proposal.lineIds), ...(turn.replyLineIds ?? [])]);
    const witnessed = scene.lines.filter(
      (line) =>
        (currentIds.has(line.id) || (!!line.at && line.at <= turn.at!)) &&
        line.heardBy.includes(proposal.actorId) &&
        !line.contactReport &&
        line.kind !== "side" &&
        (!line.contactHidden || proposal.lineIds.includes(line.id)),
    );
    const priorAccepted = Object.values(state.exchangeReceipts)
      .filter(
        (receipt) => receipt.actorId === proposal.actorId && receipt.wishId === wish.id && receipt.status === "applied",
      )
      .flatMap((receipt) => receipt.evidenceIds);
    const pinned = new Set([...proposal.lineIds, ...priorAccepted]);
    const recent = witnessed.filter((line) => !currentIds.has(line.id)).slice(-2);
    const evidence = witnessed.filter(
      (line) => pinned.has(line.id) || currentIds.has(line.id) || recent.includes(line),
    );
    const receipts = wishReceiptRecords(state, proposal.actorId, scene).filter(
      (receipt) => receipt.at <= turn.at! || receipt.actionReceipt?.submissionId === turn.id,
    );
    const newReceipts = receipts.filter(
      (receipt) => proposal.receiptIds?.includes(receipt.id) || receipt.actionReceipt?.submissionId === turn.id,
    );
    const knowledge = wishCheckKnowledge(state, proposal.actorId, wish.id, turn.at);
    const context: WishInterpretationContext = {
      knowledge,
      actorId: proposal.actorId,
      village: state.name,
      setting: state.setting,
      moment: deriveVillageMoment({ foundedAt: state.foundedAt, seed: state.seed, now: new Date(turn.at!) }),
      card: readEffectiveVillagerCard(resident),
      playerName: player.name,
      playerDescription: player.description,
      wishes: [wish],
      claim: "Check the new cited evidence against this existing Wish",
      evidence: [
        ...knowledge.evidence.filter((old) => !evidence.some((line) => line.id === old.id)),
        ...evidence.map((line) => ({
          id: line.id,
          speakerId: line.role === "user" ? "player" : line.speakerId,
          name: line.role === "user" ? player.name : line.name,
          content: line.content,
          kind: line.kind,
          at: line.at,
          current: currentIds.has(line.id),
        })),
      ],
      receipts,
      currentReceiptIds: newReceipts.map((receipt) => receipt.id),
      transcript: [],
      happenings: [],
      memory: [],
      worldState: [],
    };
    const input: WishCheckInput = {
      sceneId: scene.id,
      submissionId: turn.id,
      seed: state.seed,
      proposal,
      wish,
      at: turn.at!,
      context,
    };
    const admission = wishEvidenceAdmission(
      wish,
      context.evidence.filter((line) => !line.current || proposal.lineIds.includes(line.id)),
      newReceipts.map((receipt) => receipt.id),
    );
    if (!admission.admitted) {
      await mutateVillageState((live) =>
        applyPreparedWishVerdict(live, input, {
          criteria: admission.criteria,
          outcome: "none",
          evidenceIds: [],
          reason: admission.reason,
          memory: "",
          receiptIds: [],
        }),
      );
      receiptIds.push(id);
      continue;
    }
    const legacyStatus = await backgroundStatus("wish-check", id);
    if (legacyStatus && legacyStatus !== "obsolete") {
      pending.push(`${legacyStatus}: saved Wish check`);
      continue;
    }
    batchInputs.push(input);
  }
  if (batchInputs.length) {
    const subjectId = `wish-batch:${scene.id}:${turn.id}`;
    await outsideVenueOperation(() =>
      queueBackgroundJob({
        kind: "wish-check",
        subjectId,
        residentId: batchInputs[0].proposal.actorId,
        residentIds: [...new Set(batchInputs.map((item) => item.proposal.actorId))],
        seed: state.seed,
        revision: backgroundRevision([
          state.seed,
          scene.id,
          turn.id,
          batchInputs.map((item) => [item.proposal.fingerprint, item.proposal.intent]),
        ]),
        finite: true,
        label: `Check ${batchInputs.length} relevant Scene Wishes`,
        input: {
          sceneId: scene.id,
          submissionId: turn.id,
          seed: state.seed,
          items: batchInputs,
          contractVersion: 2,
        } satisfies WishBatchInput,
      }),
    );
    const status = await backgroundStatus("wish-check", subjectId);
    if (status !== "obsolete") pending.push(`${status ?? "queued"}: relevant Wish evidence checking`);
  }
  if (pending.length)
    return {
      status: pending.some((status) => /^(?:failed|interrupted):/u.test(status)) ? "failed" : "pending",
      receiptIds,
      reason: pending.join("; ") + "; replay saved work; a further paid attempt requires explicit retry",
    };
  if (turn.wishProposalError) {
    const missing = turn.wishProposalError.startsWith("Required wishChanges");
    const reason = missing
      ? "Wish proposals missing or invalid. Replay cannot reconstruct missing metadata; explicitly retry Wishes interpretation."
      : turn.wishProposalError;
    const failure = metadataFailure(reason, turn.liveProposals?.responseDiagnostics);
    if (!missing) failure.cause = "invalid_citation";
    return { status: "failed", receiptIds, reason, failure };
  }
  const committed = await readVillageState();
  const rejected = receiptIds
    .map((id) => committed.exchangeReceipts[id])
    .filter((receipt) => receipt?.status === "rejected");
  return {
    ...(receiptIds.length > 0 && rejected.length === receiptIds.length ? { status: "rejected" as const } : {}),
    receiptIds,
    reason: rejected.length
      ? rejected
          .map((receipt) => receipt.reason)
          .join("; ")
          .slice(0, 500)
      : proposals.length
        ? "Saved Wish proposals checked against current definitions and evidence"
        : "No relevant Wish evidence proposed",
  };
}
