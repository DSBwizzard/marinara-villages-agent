import { ingestSavedProgressEvent } from "../../domain/rules/progress-runtime.js";
import { physicalVenueEvents } from "../../domain/rules/venue-scene-state.js";
import type { VenueScene, VenueSubmission, VenueRecordEvent } from "../../domain/models/scene-model.js";
export interface SceneReplayEffects {
  applySavedAccessEvents(scene: VenueScene, turn: VenueSubmission): Promise<void>;
  recordSpokenInvitation(scene: VenueScene, signal: NonNullable<VenueSubmission["invitationSignal"]>): Promise<void>;
  applyVenueTurnChange(scene: VenueScene, turn: VenueSubmission): Promise<void>;
  receiptForTurn(scene: VenueScene, turn: VenueSubmission, persist?: boolean): Promise<VenueRecordEvent[]>;
}
export interface SceneProgressPorts {
  readVillageState: typeof import("../world/village-store.js").readVillageState;
  readSession: typeof import("../../adapters/storage/scene-store.js").readSession;
  processProjectSpeechTurn: typeof import("../projects/project-evidence.js").processProjectSpeechTurn;
  mutateVillageState: typeof import("../world/village-store.js").mutateVillageState;
  changeSession: typeof import("../../adapters/storage/scene-store.js").changeSession;
  measurePipeline: typeof import("../../adapters/observability/pipeline-metrics.js").measurePipeline;
  applySavedAccessEvents: SceneReplayEffects["applySavedAccessEvents"];
  recordSpokenInvitation: SceneReplayEffects["recordSpokenInvitation"];
  createLiveEvidenceContext: typeof import("../residents/live-memory.js").createLiveEvidenceContext;
  applyVenueTurnChange: SceneReplayEffects["applyVenueTurnChange"];
  applyProjectPickup: typeof import("../projects/project-checks.js").applyProjectPickup;
  processWishExchange: typeof import("../residents/wishes/wish-progress.js").processWishExchange;
  processLiveMemories: typeof import("../residents/live-memory.js").processLiveMemories;
  processLiveRelationships: typeof import("../residents/live-memory.js").processLiveRelationships;
  runtimeDebug: typeof import("../../adapters/observability/runtime-debug.js").runtimeDebug;
  receiptForTurn: SceneReplayEffects["receiptForTurn"];
  dispatchExchange: typeof import("./exchange-processing.js").dispatchExchange;
  processProjectWishOutbox: typeof import("../residents/wishes/wish-progress.js").processProjectWishOutbox;
  sceneQueries(): Pick<import("./services.js").SceneQueries, "progressBacklog">;
  villagesLogger: typeof import("../../adapters/engine/runtime-host.js").villagesLogger;
}
/** Inert saved-exchange replay and startup batching with explicit originating connections. */
export function createSceneProgress({
  readVillageState,
  readSession,
  processProjectSpeechTurn,
  mutateVillageState,
  changeSession,
  measurePipeline,
  applySavedAccessEvents,
  recordSpokenInvitation,
  createLiveEvidenceContext,
  applyVenueTurnChange,
  applyProjectPickup,
  processWishExchange,
  processLiveMemories,
  processLiveRelationships,
  runtimeDebug,
  receiptForTurn,
  dispatchExchange,
  processProjectWishOutbox,
  sceneQueries,
  villagesLogger,
}: SceneProgressPorts) {
  /** The Scene document is the outbox. Village receipts are idempotent if the second write is interrupted. */
  async function processSavedProgressSubmission(sessionId: string, submissionId: string): Promise<void> {
    const village = await readVillageState();

    const session = await readSession(sessionId);
    const submission = session.submissions.find((entry) => entry.id === submissionId);
    if (
      !submission ||
      submission.movement ||
      submission.progressProcessedAt ||
      !submission.at ||
      (village.foundedAt && Date.parse(submission.at) < Date.parse(village.foundedAt))
    )
      return;
    try {
      await processProjectSpeechTurn(sessionId, submissionId);
      const hasAutomaticRoute = village.progressTasks.some((task) =>
        task.definition.phases[task.phaseIndex]?.requirements.some((requirement) =>
          requirement.routes.some(
            (route) =>
              route.automatic &&
              route.evidenceKinds?.some(
                (kind) => kind === "saved-resident-line" || (kind === "saved-venue-action" && !!submission.action),
              ),
          ),
        ),
      );
      if (hasAutomaticRoute)
        await mutateVillageState((state) => {
          if (state.seed !== village.seed) return;
          for (const line of session.lines) {
            if (
              submission.replyLineIds?.includes(line.id) &&
              !line.contactHidden &&
              !line.contactReport &&
              (submission.activeIdsAtTurn?.includes(line.speakerId) ||
                submission.speechIdsAtTurn?.includes(line.speakerId)) &&
              session.participants.some((person) => person.characterId === line.speakerId)
            )
              ingestSavedProgressEvent(state, {
                id: `visit:${sessionId}:${submissionId}:${line.id}`,
                kind: "saved-resident-line",
                at: submission.at!,
                sourceId: submissionId,
                lineId: line.id,
                speakerId: line.speakerId,
                venueId: session.placeId,
                area: submission.areaAtTurn,
                excerpt: line.content,
              });
          }
          if (submission.action)
            ingestSavedProgressEvent(state, {
              id: `visit-action:${sessionId}:${submissionId}`,
              kind: "saved-venue-action",
              at: submission.at!,
              sourceId: submissionId,
              venueId: session.placeId,
              area: submission.areaAtTurn,
              excerpt: submission.message,
            });
        });
      await changeSession(sessionId, (saved) => {
        const turn = saved.submissions.find((entry) => entry.id === submissionId);
        if (turn) {
          turn.progressProcessedAt ||= new Date().toISOString();
          turn.progressError = "";
        }
      });
    } catch (error) {
      await changeSession(sessionId, (saved) => {
        const turn = saved.submissions.find((entry) => entry.id === submissionId);
        if (turn && !turn.progressProcessedAt) turn.progressError = String(error).slice(0, 300);
      });
      throw error;
    }
  }

  /** Replay only saved interpretations. Effects and duplicate receipts remain in their owning documents. */
  async function processSavedExchange(sessionId: string, submissionId: string): Promise<void> {
    return measurePipeline("saved exchange", { sceneId: sessionId, submissionId }, () =>
      applySavedExchange(sessionId, submissionId),
    );
  }

  async function applySavedExchange(sessionId: string, submissionId: string): Promise<void> {
    const scene = await readSession(sessionId);
    const turn = scene.submissions.find((entry) => entry.id === submissionId);
    if (turn?.accessEvents?.length) await applySavedAccessEvents(scene, turn);
    if (turn?.invitationSignal) await recordSpokenInvitation(scene, turn.invitationSignal);
    if (turn?.movement) return;
    if (!turn?.processing) return processSavedProgressSubmission(sessionId, submissionId);
    const village = await readVillageState();
    const processing = turn.processing;
    const evidenceContext = turn.liveProposals ? createLiveEvidenceContext(scene, turn.liveProposals) : undefined;
    const exchangeLineIds = new Set(processing.lineIds);
    const valid =
      village.seed === processing.seed &&
      scene.villageSeed === village.seed &&
      processing.sceneId === scene.id &&
      processing.submissionId === turn.id;
    const applyProjects = async () => {
      if (!valid)
        return { status: "rejected" as const, reason: "Village identity changed; saved effects cannot apply" };
      await applyVenueTurnChange(scene, turn);
      if (
        turn.physicalOutcomeVersion &&
        !physicalVenueEvents(await readVillageState()).some(
          (event) => event.id === `venue-chat:${scene.id}:${turn.id}` && event.actionReceipt?.happened,
        )
      )
        return {
          status: "rejected" as const,
          reason: "The physical outcome no longer meets current state restrictions",
        };
      if (turn.physicalOutcomeVersion && turn.action?.happened) await applyProjectPickup(scene.id, turn.id);
      await processSavedProgressSubmission(scene.id, turn.id);
      const current = await readVillageState();
      const receiptIds = current.progressTasks.flatMap((task) =>
        task.receipts
          .filter(
            (receipt) => receipt.evidence.sourceId === turn.id || exchangeLineIds.has(receipt.evidence.lineId ?? ""),
          )
          .map((receipt) => receipt.id),
      );
      return { reason: "Physical effects and saved Project interpretations checked", receiptIds };
    };
    const updates = new Map<keyof typeof processing.domains, typeof processing.domains.projects>();
    await dispatchExchange(
      processing,
      {
        projects: applyProjects,
        wishes: async () => {
          if (!valid) return { status: "rejected", reason: "Village identity changed" };
          if (
            turn.physicalOutcomeVersion &&
            !physicalVenueEvents(await readVillageState()).some(
              (event) => event.id === `venue-chat:${scene.id}:${turn.id}` && event.actionReceipt?.happened,
            )
          )
            return updates.get("projects")?.status === "rejected"
              ? { status: "rejected", reason: "Physical outcome rejected" }
              : { status: "pending", reason: "Waiting for the physical effect and receipt to commit" };
          return processWishExchange(scene, turn.id);
        },
        memories: async () =>
          valid
            ? processLiveMemories(scene, turn.id, evidenceContext)
            : { status: "rejected", reason: "Village identity changed" },
        relationships: async () =>
          valid
            ? processLiveRelationships(scene, turn.id, evidenceContext)
            : { status: "rejected", reason: "Village identity changed" },
      },
      async (domain, result) => {
        updates.set(domain, result);
        runtimeDebug("exchange processing", {
          sceneId: sessionId,
          submissionId,
          domain,
          interpretationVersion: processing.interpretationVersion,
          ...result,
        });
      },
    );
    const recordEvents = await receiptForTurn(scene, turn, false);
    if (updates.size)
      await changeSession(scene.id, (saved) => {
        const entry = saved.submissions.find((entry) => entry.id === turn.id);
        if (entry?.processing?.seed !== processing.seed) return;
        entry.recordEvents = recordEvents;
        for (const [domain, result] of updates) {
          const prior = entry.processing.domains[domain];
          if (
            (prior.status === "applied" || prior.status === "rejected") &&
            (result.status === "pending" || result.status === "failed")
          )
            continue;
          entry.processing.domains[domain] = result;
        }
      });
  }

  /** One startup scan, then bounded asynchronous batches; never part of the minute snapshot. */
  function startProgressRecovery(): () => void {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = async () => {
      try {
        await processProjectWishOutbox();
        const queue = await sceneQueries().progressBacklog();
        const batch = async () => {
          for (const turn of queue.splice(0, 8)) {
            if (stopped) return;
            try {
              await processSavedExchange(turn.sessionId, turn.submissionId);
            } catch (error) {
              villagesLogger().warn("[villages] progress replay failed for %s: %s", turn.submissionId, String(error));
            }
          }
          if (!stopped && queue.length) timer = setTimeout(() => void batch(), 25);
        };
        if (!stopped && queue.length) timer = setTimeout(() => void batch(), 0);
      } catch (error) {
        villagesLogger().warn("[villages] progress recovery could not read visits: %s", String(error));
      }
    };
    void start();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }
  return { processSavedProgressSubmission, processSavedExchange, startProgressRecovery };
}
export type SceneProgress = ReturnType<typeof createSceneProgress>;
