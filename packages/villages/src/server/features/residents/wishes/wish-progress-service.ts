import type { Handler } from "../../../domain/models/background-model.js";
import type { readEffectiveVillagerCard } from "../../../adapters/engine/catalog.js";
import type { backgroundCalls, backgroundSetting } from "../../../adapters/operations/background-context.js";
import type { outsideVenueOperation } from "../../../adapters/operations/operation-context.js";
import type { DomainProcessing } from "../../../domain/models/exchange-model.js";
import type { VenueScene } from "../../../domain/models/scene-model.js";
import type {
  PreparedWishBatch,
  PreparedWishVerdict,
  WishBatchInput,
  WishCheckInput,
  WishProposal,
} from "../../../domain/models/wish-check-model.js";
import type { WishCriteria, WishInterpretationContext } from "../../../domain/models/wish-interpretation-model.js";
import { asRecord } from "../../../domain/rules/coerce.js";
import { deriveVillageMoment } from "../../../domain/rules/village-clock.js";
import { readPlayerIdentity } from "../../../domain/rules/village-projections.js";
import { localWishRequirements, wishEvidenceAdmission } from "../../../domain/rules/wish-admission.js";
import {
  addWishFacts,
  discloseWish,
  knownWish,
  rememberWishEvidence,
  wishCheckKnowledge,
  wishConditionRevision,
} from "../../../domain/rules/wish-journal.js";
import { metadataFailure, type WorkFailure, WorkFailureError } from "../../../domain/rules/work-failure.js";
import { backgroundRevision } from "../../../jobs/background-work.js";
import type { backgroundStatus, queueBackgroundJob } from "../../../jobs/background-work.js";
import type { writeInterpretationDiagnostics } from "../../generation/interpretation-diagnostics.js";
import type { sceneQueries } from "../../scenes/services.js";
import type { mutateVillageState, readVillageState } from "../../world/village-store.js";
import type { cachedWishCriteria, interpretWishBatch } from "./wish-interpretation.js";
import {
  matchingWishReceipts,
  wishFingerprint,
  wishReceiptRecords,
} from "../../../domain/rules/wish-interpretation-rules.js";
import {
  applyPreparedWishVerdict,
  batchItems,
  currentWish,
  effectId,
  formatWishNotice,
  taskId,
} from "../../../domain/rules/wish-progress-rules.js";
import { revealProgress } from "../../../domain/rules/progress-engine.js";
export type WishProgressPorts = {
  readEffectiveVillagerCard: typeof readEffectiveVillagerCard;
  backgroundCalls: Pick<typeof backgroundCalls, "getStore">;
  backgroundSetting: typeof backgroundSetting;
  outsideVenueOperation: typeof outsideVenueOperation;
  backgroundStatus: typeof backgroundStatus;
  queueBackgroundJob: typeof queueBackgroundJob;
  writeInterpretationDiagnostics: typeof writeInterpretationDiagnostics;
  sceneQueries(): Pick<ReturnType<typeof sceneQueries>, "processSavedExchange">;
  mutateVillageState: typeof mutateVillageState;
  readVillageState: typeof readVillageState;
  cachedWishCriteria: typeof cachedWishCriteria;
  interpretWishBatch: typeof interpretWishBatch;
};
/** Finite Wish evidence and replay callbacks share their originating application's connections. */
export function createWishProgress(ports: WishProgressPorts) {
  const {
    readEffectiveVillagerCard,
    backgroundCalls,
    backgroundSetting,
    outsideVenueOperation,
    backgroundStatus,
    queueBackgroundJob,
    writeInterpretationDiagnostics,
    sceneQueries,
    mutateVillageState,
    readVillageState,
    cachedWishCriteria,
    interpretWishBatch,
  } = ports;

  const wishCheckBackgroundHandler: Handler = {
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
            ? result.items.find((entry) => entry.id === effectId(item.sceneId, item.submissionId, item.proposal))
                ?.verdict
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
            message:
              active.length + " Wish check(s) need explicit retry. Valid results were saved. " + active[0].message,
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
  };

  async function processProjectWishOutbox(): Promise<void> {
    const state = await readVillageState();
    const cached = await cachedWishCriteria();
    for (const event of state.projectWishOutbox.slice(0, 32)) {
      const project = state.projects.find((project) => project.id === event.projectId && project.status === "complete");
      if (project) {
        const routingWords = (
          `${project.title} ${project.venueDraft?.description ?? ""}`.toLocaleLowerCase().match(/[\p{L}\p{N}]{4,}/gu) ??
          []
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

  async function processWishExchange(scene: VenueScene, submissionId: string): Promise<Partial<DomainProcessing>> {
    const turn = scene.submissions.find((turn) => turn.id === submissionId)!;
    let state = await readVillageState();
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
                  !["have", "with", "that", "this", "here", "where", "inside", "find", "their", "make"].includes(
                    word,
                  ) && `${receipt.text} ${receipt.actionReceipt?.narration ?? ""}`.toLocaleLowerCase().includes(word),
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
          const added = addWishFacts(
            live,
            proposal.actorId,
            current,
            proposal.facts ?? [],
            scene.id,
            turn.id,
            turn.at!,
          );
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
          (receipt) =>
            receipt.actorId === proposal.actorId && receipt.wishId === wish.id && receipt.status === "applied",
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

  return { wishCheckBackgroundHandler, processProjectWishOutbox, processWishExchange };
}
export type WishProgressService = ReturnType<typeof createWishProgress>;
