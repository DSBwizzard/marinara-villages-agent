import { sceneContinuityView } from "../../domain/rules/scene-continuity.js";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { VILLAGES_PACKAGE_ID } from "../../adapters/engine/runtime-host.js";

import {
  continueSemanticDomain,
  semanticContinuationKey,
  semanticContinued,
  semanticAuthorityDomain,
} from "../../domain/rules/semantic-continuity.js";
import type { ExchangeDomain } from "../../domain/models/exchange-model.js";
import { unfinishedExchange } from "../../domain/decoding/exchange-codec.js";
import type { VenueScene } from "../../domain/models/scene-model.js";
import type { VillageState } from "../../domain/models/world.js";
import { asRecord } from "../../domain/rules/coerce.js";
import { badRequest, conflict, notFound } from "../../domain/rules/errors.js";
import { coerceResponseDiagnostics } from "../../domain/rules/response-diagnostics.js";
import { sceneProcessingSummary } from "../../domain/rules/scene-public.js";
import { filterRelationshipNotices, relationshipChangeNotices } from "../../domain/rules/relationship-presentation.js";
import { workFailureSummary } from "../../domain/rules/work-failure.js";
export interface SceneChangesPorts {
  withSceneWork?<T>(id: string, work: () => Promise<T>): Promise<T>;
  finishSemanticScene?(id: string): Promise<void>;
  mutateRelationships?: typeof import("../residents/relationship-store.js").mutateRelationships;
  changeSession?: typeof import("../../adapters/storage/scene-store.js").changeSession;
  readSession(id: string): Promise<VenueScene>;
  readVillageSnapshot(): Promise<VillageState>;
  readVillageState(): Promise<VillageState>;
  mutateVillageState(update: (state: VillageState) => void): Promise<VillageState>;
  villagesDocuments(): Pick<CapabilityDocumentStore, "list">;
  processSavedExchange(sessionId: string, submissionId: string): Promise<void>;
  readTerminal?(id: string): Promise<import("../../domain/models/scene-terminal-model.js").SceneTerminal | null>;
  venueRequestMetrics: typeof import("../../adapters/operations/operation-context.js").venueRequestMetrics;
}
/** Inert saved diagnostics, dismissal and explicit replay with originating connections. */
export function createSceneChanges({
  withSceneWork,
  finishSemanticScene,
  mutateRelationships,
  readSession,
  changeSession,
  readVillageSnapshot,
  readVillageState,
  mutateVillageState,
  villagesDocuments,
  processSavedExchange,
  readTerminal,
  venueRequestMetrics,
}: SceneChangesPorts) {
  /** Privileged diagnostics use the saved record only. A read never starts interpretation or recovery. */
  async function readSceneChanges(id: string, cursor = "", limit = 20) {
    const scene = await readSession(id);
    const village = await readVillageSnapshot();
    const presentation = sceneContinuityView(village, scene);
    if (scene.villageSeed && scene.villageSeed !== village.seed)
      throw conflict("This Scene belongs to a previous village.");
    const parts = (cursor || "0:0").split(":").map(Number);
    if (parts.length > 3 || parts.some((part) => !Number.isSafeInteger(part) || part < 0))
      throw badRequest("Invalid changes cursor.");
    const [afterScene, afterNotice = 0, afterRelationship = 0] = parts;
    const size = Math.max(1, Math.min(50, Math.floor(Number(limit) || 20)));
    const changed = scene.submissions
      .map((turn, index) => ({ turn, sequence: turn.changeSequence || index + 1 }))
      .filter(({ turn }) => turn.semanticProvenance?.version !== 2 || turn.semanticReady === true)
      .filter((entry) => entry.sequence > afterScene)
      .sort((a, b) => a.sequence - b.sequence);
    const turns = changed.slice(0, size);
    const effects = [...Object.values(village.exchangeReceipts), ...Object.values(village.memoryReceipts)];
    const effectsBySubmission = new Map<string, typeof effects>();
    for (const receipt of effects)
      if (receipt.sceneId === id) {
        const rows = effectsBySubmission.get(receipt.submissionId) ?? [];
        rows.push(receipt);
        effectsBySubmission.set(receipt.submissionId, rows);
      }
    const projectReceiptIndex = new Map(
      village.progressTasks.flatMap((task) => task.receipts.map((receipt) => [receipt.id, receipt] as const)),
    );
    const notices = effects
      .filter(
        (receipt) =>
          receipt.sceneId === id &&
          receipt.notice &&
          (receipt.noticeSequence ?? 0) > afterNotice &&
          !village.dismissedNoticeIds.includes(receipt.id),
      )
      .sort((a, b) => (a.noticeSequence ?? 0) - (b.noticeSequence ?? 0));
    const page = notices.slice(0, size);
    const relationshipState = village.relationshipContext;
    const relationshipReceipts = Object.values(relationshipState?.receipts ?? {})
      .filter(
        (receipt) =>
          (receipt.sceneId === id || (!receipt.sceneId && receipt.sourceId === id)) &&
          (receipt.noticeSequence ?? 0) > afterRelationship,
      )
      .sort((a, b) => a.noticeSequence! - b.noticeSequence!);
    const relationshipPage = relationshipReceipts.slice(0, size);
    const relationshipNotices = relationshipState
      ? relationshipChangeNotices(
          relationshipPage,
          presentation.relationshipContext ?? relationshipState,
          presentation,
        ).filter((event) => !village.dismissedNoticeIds.includes(event.id))
      : [];
    const relationshipCursor =
      relationshipReceipts.length > relationshipPage.length
        ? relationshipPage.at(-1)!.noticeSequence!
        : (relationshipState?.noticeSequence ?? afterRelationship);
    const backgroundChecks = (await villagesDocuments().list(VILLAGES_PACKAGE_ID, "background-work"))
      .map((record) => asRecord(record.data))
      .filter(
        (job) =>
          job.seed === village.seed &&
          job.kind === "wish-check" &&
          (asRecord(job.input).sceneId === id ||
            String(job.subjectId).startsWith(`wish-change:${id}:`) ||
            String(job.subjectId).startsWith(`wish-batch:${id}:`)),
      )
      .sort(
        (a, b) =>
          Number(["queued", "running"].includes(String(b.status))) -
          Number(["queued", "running"].includes(String(a.status))),
      )
      .slice(0, 50)
      .map((job) => ({
        id: job.id,
        subjectId: job.subjectId,
        status: job.status,
        requests: job.requests,
        tokens: job.usageComplete ? job.tokens : null,
        error: job.error,
      }));
    const sceneCursor = turns.at(-1)?.sequence ?? afterScene;
    const noticeCursor = notices.length > page.length ? page.at(-1)!.noticeSequence! : village.noticeSequence;
    return {
      sceneId: id,
      backgroundChecks,
      notificationDelivery: [...page, ...relationshipPage]
        .filter((receipt) => receipt.committedAt)
        .map((receipt) => ({
          receiptId: receipt.id,
          committedAt: receipt.committedAt,
          commitToFeedMs: Math.max(0, Date.now() - Date.parse(receipt.committedAt!)),
        })),
      activeRequest: {
        status: scene.operation?.status,
        error: scene.operation?.error,
        failure: scene.operation?.failure,
        timing: scene.operation?.timing,
        requests: venueRequestMetrics(scene.operation),
      },
      changes: turns.map(({ turn }) => ({
        submissionId: turn.id,
        timing: turn.timing,
        at: turn.at,
        processing: turn.processing ?? null,
        receipts: {
          physical: turn.action ?? null,
          movement: turn.movement ?? null,
          domainEffects: effectsBySubmission.get(turn.id) ?? [],
          relationships: (turn.processing?.domains.relationships.receiptIds ?? []).flatMap((id) =>
            relationshipState?.receipts[id] ? [relationshipState.receipts[id]] : [],
          ),
          projects: (turn.processing?.domains.projects.receiptIds ?? []).flatMap((id) =>
            projectReceiptIndex.has(id) ? [projectReceiptIndex.get(id)!] : [],
          ),
          memories: village.memories.records.filter(
            (row) => row.origin.sceneId === id && row.origin.id === id + ":" + turn.id,
          ),
        },
        requests: turn.requestMetrics ?? null,
        responseDiagnostics: coerceResponseDiagnostics(turn.liveProposals?.responseDiagnostics) ?? null,
        interpretationHistory: turn.interpretationHistory ?? [],
        notices: filterRelationshipNotices(turn.recordEvents ?? [], presentation.relationshipContext).filter(
          (event) => !village.dismissedNoticeIds.includes(event.id),
        ),
        evidence: scene.lines.filter(
          (line) => turn.processing?.lineIds.includes(line.id) || turn.liveProposals?.earlierLineIds.includes(line.id),
        ),
        interpretations: {
          source: turn.movement
            ? "confirmed movement; code transition"
            : (turn.interpretationHistory?.at(-1)?.source ?? "saved narration reply"),
          version: turn.processing?.interpretationVersion,
          memory: turn.liveProposals?.memoryChanges,
          relationship: turn.liveProposals?.relationshipChanges,
          wishes: turn.wishProposals,
          memoryContexts: turn.liveProposals?.memoryContexts,
        },
      })),
      notices: filterRelationshipNotices(
        [...page.flatMap((receipt) => (receipt.notice ? [receipt.notice] : [])), ...relationshipNotices],
        presentation.relationshipContext,
      ),
      dismissedNoticeIds: village.dismissedNoticeIds,
      unresolved: scene.submissions
        .flatMap((turn) =>
          Object.entries(turn.processing?.domains ?? {})
            .filter(([, result]) => ["pending", "failed", "rejected"].includes(result.status))
            .map(([domain, result]) => ({
              submissionId: turn.id,
              domain,
              status: result.status,
              continued: turn.semanticContinuedDomains?.includes(domain as ExchangeDomain) ?? false,
              canContinue:
                turn.semanticProvenance?.version === 2 &&
                turn.semanticReady === true &&
                result.status === "failed" &&
                !semanticAuthorityDomain(turn, domain as ExchangeDomain),
              at: turn.at,
              reason:
                result.status === "pending"
                  ? "This proposed update is still being checked."
                  : result.failure
                    ? workFailureSummary(result.failure)
                    : result.status === "rejected"
                      ? /evidence|witness|heard/iu.test(result.reason ?? "")
                        ? "The proposed world change cited speech or actions that were not witnessed by everyone it would affect. It wasn’t saved; the conversation remains in the transcript."
                        : "The proposed world change did not meet the requirements for saving. The conversation remains in the transcript; saved diagnostics contain the validation result."
                      : "World changes could not be applied. Replay saved work first; inspect saved diagnostics if it persists.",
            })),
        )
        .sort((left, right) => {
          const priority = (status: string) => (status === "failed" ? 0 : status === "pending" ? 1 : 2);
          return priority(left.status) - priority(right.status) || (right.at ?? "").localeCompare(left.at ?? "");
        })
        .slice(0, 50),
      processingSummary: sceneProcessingSummary(scene),
      nextCursor: `${sceneCursor}:${noticeCursor}:${relationshipCursor}`,
      hasMore:
        changed.length > turns.length ||
        notices.length > page.length ||
        relationshipReceipts.length > relationshipPage.length,
    };
  }

  async function dismissSceneNotice(id: string, noticeId: string) {
    const scene = await readSession(id).catch(async (error: unknown) => {
      if ((error as { statusCode?: number })?.statusCode !== 404 || !readTerminal) throw error;
      const terminal = await readTerminal(id);
      if (!terminal) throw error;
      return terminal;
    });
    const village = await readVillageState();
    if (scene.villageSeed && scene.villageSeed !== village.seed) throw conflict("Village identity changed.");
    const known =
      ("recordEvents" in scene
        ? scene.recordEvents.some((event) => event.id === noticeId)
        : scene.submissions.some((turn) => turn.recordEvents?.some((event) => event.id === noticeId))) ||
      !!village.exchangeReceipts[noticeId]?.notice ||
      !!(
        village.relationshipContext &&
        relationshipChangeNotices(
          Object.values(village.relationshipContext.receipts).filter((receipt) => receipt.id === noticeId),
          village.relationshipContext,
          village,
        ).length
      );
    if (!known) throw notFound("That saved notice is unavailable.");
    await mutateVillageState((state) => {
      if (state.seed !== village.seed) throw conflict("Village identity changed.");
      if (!state.dismissedNoticeIds.includes(noticeId)) state.dismissedNoticeIds.push(noticeId);
    });
    return { dismissed: true };
  }

  /** Explicit recovery applies saved results in their existing order. */
  async function replaySceneChanges(id: string) {
    const work = () => replaySceneChangesOnce(id);
    return withSceneWork ? withSceneWork(id, work) : work();
  }
  async function replaySceneChangesOnce(id: string) {
    const scene = await readSession(id);
    for (const turn of scene.submissions.filter((turn) => turn.processing && unfinishedExchange(turn.processing)))
      await processSavedExchange(id, turn.id);
    await finishSemanticScene?.(id);
    return readSceneChanges(id);
  }

  async function continueSceneChange(id: string, submissionId: string, domain: ExchangeDomain) {
    const work = () => continueSceneChangeOnce(id, submissionId, domain);
    return withSceneWork ? withSceneWork(id, work) : work();
  }
  async function continueSceneChangeOnce(id: string, submissionId: string, domain: ExchangeDomain) {
    if (!changeSession) throw badRequest("Scene continuation is unavailable.");
    const saved = await readSession(id);
    const original = saved.submissions.find((row) => row.id === submissionId);
    if (!original) throw notFound("No saved exchange.");
    // Validate before writing either document. Wish tombstones fence delayed background application.
    const recoverAccepted = semanticContinued(await readVillageState(), id, submissionId, domain);
    continueSemanticDomain(structuredClone(original), domain, recoverAccepted);
    const key = semanticContinuationKey(id, submissionId);
    if (domain === "relationships" && !mutateRelationships)
      throw badRequest("Relationship continuation is unavailable.");
    await mutateVillageState((state) => {
      if (state.seed !== saved.villageSeed) throw conflict("Village identity changed.");
      state.semanticContinuations ??= {};
      state.semanticContinuations[key] = [...new Set([...(state.semanticContinuations[key] ?? []), domain])];
    });
    if (domain === "relationships")
      await mutateRelationships!(saved.villageSeed!, (state) => {
        state.applied[key] = true;
      });
    if (domain === "wishes")
      await mutateVillageState((state) => {
        if (state.seed !== saved.villageSeed) throw conflict("Village identity changed.");
        for (const proposal of original.wishProposals ?? []) {
          const receiptId = `wish-change:${id}:${submissionId}:${proposal.wishId}:${proposal.intent}`;
          state.exchangeReceipts[receiptId] ??= {
            id: receiptId,
            sceneId: id,
            submissionId,
            domain: "wishes",
            at: original.at,
            status: "rejected",
            evidenceIds: proposal.lineIds,
            reason: "Continued without this failed update",
          };
        }
      });
    await changeSession(id, (scene) => {
      const turn = scene.submissions.find((row) => row.id === submissionId);
      if (!turn) throw notFound("No saved exchange.");
      continueSemanticDomain(turn, domain, recoverAccepted);
    });
    await finishSemanticScene?.(id);
    return readSceneChanges(id);
  }
  return { readSceneChanges, dismissSceneNotice, replaySceneChanges, continueSceneChange };
}
export type SceneChanges = ReturnType<typeof createSceneChanges>;
