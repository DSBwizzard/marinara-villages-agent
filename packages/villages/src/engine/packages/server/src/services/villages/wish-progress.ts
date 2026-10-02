import { asRecord, asTrimmedString } from "./coerce.js";
import { createProgressTask, revealProgress, submitProgressEvidence, type ProgressTask } from "./progress-engine.js";
import {
  backgroundRevision,
  backgroundStatus,
  queueBackgroundJob,
  registerBackgroundHandler,
} from "./background-work.js";
import { outsideVenueOperation } from "./venue-coordinator.js";
import {
  interpretWishClaim,
  wishFingerprint,
  wishReceiptRecords,
  matchingWishReceipts,
  cachedWishCriteria,
  type WishCriteria,
  type WishInterpretationContext,
} from "./wish-interpretation.js";
import { fulfillResidentWish } from "./wish-lifecycle.js";
import { mutateVillageState, readVillageState } from "./village-store.js";
import { readEffectiveVillagerCard } from "./catalog.js";
import { deriveVillageMoment } from "./village-clock.js";
import { readPlayerIdentity } from "./village.js";
import { writeInterpretationDiagnostics } from "./interpretation-diagnostics.js";
import type { VillageState, VillageWish } from "./types.js";
import type { VenueLine, VenueScene, VenueRecordEvent } from "./venue-session.js";
import type { DomainProcessing } from "./exchange-processing.js";

export type ExchangeEffectReceipt = {
  noticeSequence?: number;
  status?: "applied" | "rejected";
  actorId?: string;
  wishId?: string;
  id: string;
  sceneId: string;
  submissionId: string;
  domain: "wishes" | "memories";
  at: string;
  evidenceIds: string[];
  reason: string;
  notice?: VenueRecordEvent;
};
export type WishProposal = {
  receiptIds?: string[];
  actorId: string;
  wishId: string;
  fingerprint: string;
  intent: "reveal" | "progress" | "check";
  lineIds: string[];
};
export const WISH_PROPOSAL_INSTRUCTION =
  'Return wishChanges:[] or [{actorId:"resident ID",wishId:"listed Wish ID",intent:"reveal|progress|check",evidence:["player",0]}]. Cite only the current exchange. Reveal requires the wishing resident actually telling the player what they want. Progress/check identifies meaningful new witnessed evidence relevant to an EXISTING wish; never invent a wish or mark fulfillment yourself. Greetings, repetition, company unrelated to a wish, promises of physical work and quoted/conditional claims are not progress. Actual physical results come only from verified receipts. Leave hidden wishes hidden.';

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
      !["reveal", "progress", "check"].includes(String(raw.intent)) ||
      !refs.length ||
      refs.length > 8 ||
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
          !/\b(?:if|perhaps|maybe|would|quoted|said that)\b/iu.test(line.content),
      )
    ) {
      errors.push("Wish disclosure needs this resident's own speech heard by the player");
      continue;
    }
    proposals.push({
      actorId,
      wishId,
      fingerprint: wishFingerprint(wish),
      intent: raw.intent as WishProposal["intent"],
      lineIds,
    });
  }
  return { proposals, error: errors.join("; ").slice(0, 500) };
}

type WishCheckInput = {
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
const effectId = (sceneId: string, submissionId: string, proposal: WishProposal) =>
  `wish-change:${sceneId}:${submissionId}:${proposal.wishId}:${proposal.intent}`;
const taskId = (proposal: WishProposal) => `wish:${proposal.actorId}:${proposal.wishId}:${proposal.fingerprint}`;
function currentWish(state: VillageState, proposal: WishProposal, now = Date.now()) {
  const wish = state.villagers
    .find((resident) => resident.characterId === proposal.actorId)
    ?.agenda?.wishes.find((wish) => wish.id === proposal.wishId);
  return wish && wishFingerprint(wish) === proposal.fingerprint && (!wish.expiresAt || Date.parse(wish.expiresAt) > now)
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
  if (!wish) return;
  if (state.correctedWishMemoryIds.includes(`${input.sceneId}:wish:${wish.id}`)) return;
  const matching = matchingWishReceipts(
    verdict.criteria,
    { actorId: input.proposal.actorId, receipts: wishReceiptRecords(state, input.proposal.actorId) },
    wish,
  );
  const physical =
    !verdict.criteria.requiresPhysical || matching.some((receipt) => verdict.receiptIds.includes(receipt.id));
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
      notice = { id, kind: "wish", text: `${input.context.card.name}'s wish was fulfilled.` };
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
    if (!previous)
      notice = { id, kind: "wish", text: `New progress on ${input.context.card.name}'s wish was confirmed.` };
    reason = "New Wish evidence accepted";
  }
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
  valid: (state, input: WishCheckInput) => state.seed === input.seed && !!currentWish(state, input.proposal),
  async generate(input: WishCheckInput): Promise<PreparedWishVerdict> {
    const interpreted = await interpretWishClaim(
      input.context,
      input.sceneId,
      `live:${input.submissionId}:${input.wish.id}`,
      true,
    );
    const check = interpreted.batch.checks[0],
      result = interpreted.batch.results[0];
    await writeInterpretationDiagnostics(input.sceneId, interpreted.batch.traces);
    if (!result || result.outcome === "unresolved")
      throw new Error(result?.reason || "Wish interpretation unresolved; explicit retry required");
    const facts = asRecord(check.facts);
    return {
      criteria: facts.criteria as WishCriteria,
      outcome: result.outcome,
      evidenceIds: result.evidenceIds,
      reason: result.reason,
      memory: interpreted.memory,
      receiptIds: (facts.matchingReceiptIds as string[]).filter((id) => result.evidenceIds.includes(`receipt:${id}`)),
    };
  },
  apply: applyPreparedWishVerdict,
  async afterApply(input: WishCheckInput) {
    if (input.sceneId.startsWith("project:")) return;
    const { processSavedExchange } = await import("./venue-session.js");
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
  const state = await readVillageState();
  if (turn.mode === "act" && !turn.actionReplyDone)
    return { status: "pending", reason: "Waiting for saved action narration" };
  if (state.seed !== scene.villageSeed) return { status: "rejected", reason: "Village identity changed" };
  const proposals = turn.wishProposals ?? [];
  if (turn.action?.happened) {
    const cached = await cachedWishCriteria();
    for (const resident of state.villagers) {
      for (const wish of resident.agenda?.wishes ?? []) {
        const fingerprint = wishFingerprint(wish),
          criteria = cached.get(`${resident.characterId}:${fingerprint}`);
        if (!criteria?.requiresPhysical || criteria.kind === "complex") continue;
        const receipts = matchingWishReceipts(
          criteria,
          { actorId: resident.characterId, receipts: wishReceiptRecords(state, resident.characterId, scene) },
          wish,
        ).filter((receipt) => receipt.actionReceipt?.submissionId === turn.id);
        if (
          !receipts.length ||
          proposals.some((proposal) => proposal.wishId === wish.id && proposal.intent !== "reveal")
        )
          continue;
        proposals.push({
          actorId: resident.characterId,
          wishId: wish.id,
          fingerprint,
          intent: "check",
          lineIds: [],
          receiptIds: receipts.map((receipt) => receipt.id),
        });
      }
    }
  }
  const receiptIds: string[] = [],
    pending: string[] = [];
  for (const proposal of proposals) {
    const id = effectId(scene.id, turn.id, proposal),
      prior = state.exchangeReceipts[id];
    if (prior) {
      receiptIds.push(id);
      continue;
    }
    const wish = currentWish(state, proposal);
    if (!wish) continue;
    const cited = scene.lines.filter((line) => proposal.lineIds.includes(line.id));
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
        current.learnedAt ||= turn.at;
        current.learnedLineIds = [...new Set([...(current.learnedLineIds ?? []), ...proposal.lineIds])];
        const known = (live.wishKnowledge[proposal.actorId] ??= []);
        if (!known.some((wish) => wish.wishId === current.id && wish.text === current.wish))
          known.push({
            wishId: current.id,
            text: current.wish,
            learnedAt: current.learnedAt!,
            lineIds: [...proposal.lineIds],
          });
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
                  id,
                  kind: "wish",
                  text: `${resident.cardSnapshot.name} shared a wish.`,
                  detail: current.wish,
                },
              }
            : {}),
        };
      });
      receiptIds.push(id);
      continue;
    }
    const player = readPlayerIdentity(state);
    const evidence = scene.lines
      .filter(
        (line) =>
          line.heardBy.includes(proposal.actorId) &&
          !line.contactReport &&
          line.kind !== "side" &&
          (!line.contactHidden || proposal.lineIds.includes(line.id)),
      )
      .slice(-64);
    const context: WishInterpretationContext = {
      actorId: proposal.actorId,
      village: state.name,
      setting: state.setting,
      moment: deriveVillageMoment({ foundedAt: state.foundedAt, seed: state.seed, now: new Date(turn.at!) }),
      card: readEffectiveVillagerCard(resident),
      playerName: player.name,
      playerDescription: player.description,
      wishes: [wish],
      claim: "Check the new cited evidence against this existing Wish",
      evidence: evidence.map((line) => ({
        id: line.id,
        speakerId: line.role === "user" ? "player" : line.speakerId,
        name: line.role === "user" ? player.name : line.name,
        content: line.content,
        kind: line.kind,
        at: line.at,
      })),
      receipts: wishReceiptRecords(state, proposal.actorId, scene),
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
    await outsideVenueOperation(() =>
      queueBackgroundJob({
        kind: "wish-check",
        subjectId: id,
        residentId: proposal.actorId,
        seed: state.seed,
        revision: backgroundRevision([state.seed, scene.id, turn.id, proposal.fingerprint, proposal.intent]),
        finite: true,
        label: `Check ${resident.cardSnapshot.name}'s Wish`,
        input,
      }),
    );
    const status = await backgroundStatus("wish-check", id);
    if (status === "obsolete") continue;
    pending.push(`${status ?? "queued"}: relevant Wish evidence checking`);
  }
  if (pending.length)
    return {
      status: pending.some((status) => /^(?:failed|interrupted):/u.test(status)) ? "failed" : "pending",
      receiptIds,
      reason: pending.join("; ") + "; replay saved work; a further paid attempt requires explicit retry",
    };
  if (turn.wishProposalError) return { status: "failed", receiptIds, reason: turn.wishProposalError };
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
