import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { VILLAGES_PACKAGE_ID } from "../../adapters/engine/runtime-host.js";

import { unfinishedExchange } from "../../domain/decoding/exchange-codec.js";
import type { VenueScene } from "../../domain/models/scene-model.js";
import type { VillageState } from "../../domain/models/world.js";
import { asRecord } from "../../domain/rules/coerce.js";
import { badRequest, conflict, notFound } from "../../domain/rules/errors.js";
import { coerceResponseDiagnostics } from "../../domain/rules/response-diagnostics.js";
import { sceneProcessingSummary } from "../../domain/rules/scene-public.js";
import { filterRelationshipNotices, relationshipChangeNotices } from "../../domain/rules/relationship-presentation.js";
import { knownWish } from "../../domain/rules/wish-journal.js";
export interface SceneChangesPorts {
  readSession(id: string): Promise<VenueScene>;
  readVillageSnapshot(): Promise<VillageState>;
  readVillageState(): Promise<VillageState>;
  mutateVillageState(update: (state: VillageState) => void): Promise<VillageState>;
  villagesDocuments(): Pick<CapabilityDocumentStore, "list">;
  processSavedExchange(sessionId: string, submissionId: string): Promise<void>;
  venueRequestMetrics: typeof import("../../adapters/operations/operation-context.js").venueRequestMetrics;
}
/** Inert saved diagnostics, dismissal and explicit replay with originating connections. */
export function createSceneChanges({
  readSession,
  readVillageSnapshot,
  readVillageState,
  mutateVillageState,
  villagesDocuments,
  processSavedExchange,
  venueRequestMetrics,
}: SceneChangesPorts) {
  /** Privileged diagnostics use the saved record only. A read never starts interpretation or recovery. */
  async function readSceneChanges(id: string, cursor = "", limit = 20) {
    const scene = await readSession(id);
    const village = await readVillageSnapshot();
    if (scene.villageSeed && scene.villageSeed !== village.seed)
      throw conflict("This Scene belongs to a previous village.");
    const parts = (cursor || "0:0").split(":").map(Number);
    if (parts.length > 3 || parts.some((part) => !Number.isSafeInteger(part) || part < 0))
      throw badRequest("Invalid changes cursor.");
    const [afterScene, afterNotice = 0, afterRelationship = 0] = parts;
    const size = Math.max(1, Math.min(50, Math.floor(Number(limit) || 20)));
    const changed = scene.submissions
      .map((turn, index) => ({ turn, sequence: turn.changeSequence || index + 1 }))
      .filter((entry) => entry.sequence > afterScene)
      .sort((a, b) => a.sequence - b.sequence);
    const turns = changed.slice(0, size);
    const effects = Object.values(village.exchangeReceipts);
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
          receipt.notice &&
          (receipt.noticeSequence ?? 0) > afterNotice &&
          !village.dismissedNoticeIds.includes(receipt.id),
      )
      .sort((a, b) => (a.noticeSequence ?? 0) - (b.noticeSequence ?? 0));
    const page = notices.slice(0, size);
    const relationshipState = village.relationshipContext;
    const relationshipReceipts = Object.values(relationshipState?.receipts ?? {})
      .filter((receipt) => (receipt.noticeSequence ?? 0) > afterRelationship)
      .sort((a, b) => a.noticeSequence! - b.noticeSequence!);
    const relationshipPage = relationshipReceipts.slice(0, size);
    const relationshipNotices = relationshipState
      ? relationshipChangeNotices(relationshipPage, relationshipState, village).filter(
          (event) => !village.dismissedNoticeIds.includes(event.id),
        )
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
          (asRecord(job.input).sceneId === id || String(job.subjectId).startsWith(`wish-change:${id}:`)),
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
        requests: venueRequestMetrics(scene.operation),
      },
      changes: turns.map(({ turn }) => ({
        submissionId: turn.id,
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
          memories: village.chronicle.filter(
            (memory) =>
              memory.sourceVisitId === id &&
              memory.sourceLineIds?.some((lineId) => turn.processing?.lineIds.includes(lineId)),
          ),
        },
        requests: turn.requestMetrics ?? null,
        responseDiagnostics: coerceResponseDiagnostics(turn.liveProposals?.responseDiagnostics) ?? null,
        interpretationHistory: turn.interpretationHistory ?? [],
        notices: filterRelationshipNotices(turn.recordEvents ?? [], village.relationshipContext)
          .filter(
            (event) =>
              event.kind !== "wish" ||
              (!!event.wishUpdate &&
                village.villagers.some((person) => knownWish(village, person.characterId, event.wishUpdate!.wishId))),
          )
          .filter((event) => !village.dismissedNoticeIds.includes(event.id)),
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
          memoryVersions: turn.liveProposals?.memoryVersions,
        },
      })),
      notices: filterRelationshipNotices(
        [...page.flatMap((receipt) => (receipt.notice ? [receipt.notice] : [])), ...relationshipNotices],
        village.relationshipContext,
      ),
      dismissedNoticeIds: village.dismissedNoticeIds,
      unresolved: scene.submissions
        .flatMap((turn) =>
          Object.entries(turn.processing?.domains ?? {})
            .filter(([, result]) => result.status === "failed")
            .map(([domain, result]) => ({
              submissionId: turn.id,
              domain,
              reason:
                result.failure?.cause === "missing_result" || result.failure?.cause === "output_limit"
                  ? "Required response metadata is missing or incomplete. Replay cannot reconstruct it; explicitly retry interpretation."
                  : "Saved changes could not be applied. Replay saved work first; inspect saved diagnostics if it persists.",
            })),
        )
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
    const scene = await readSession(id),
      village = await readVillageState();
    if (scene.villageSeed && scene.villageSeed !== village.seed) throw conflict("Village identity changed.");
    const known =
      scene.submissions.some((turn) => turn.recordEvents?.some((event) => event.id === noticeId)) ||
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
    const scene = await readSession(id);
    for (const turn of scene.submissions.filter((turn) => turn.processing && unfinishedExchange(turn.processing)))
      await processSavedExchange(id, turn.id);
    return readSceneChanges(id);
  }

  return { readSceneChanges, dismissSceneNotice, replaySceneChanges };
}
export type SceneChanges = ReturnType<typeof createSceneChanges>;
