import { villageNow } from "../../adapters/time/clock-gate.js";
import { appendSceneInput } from "../../domain/rules/scene-input.js";
import { applyAcceptedSceneDelta } from "../../domain/rules/scene-delta.js";
import { appendVisitorIntroductionTutorial } from "../../domain/rules/visitor-introduction.js";
import {
  acceptedNarrationEpisode,
  abandonNarration,
  narrationIsAbandoned,
} from "../../domain/rules/narration-acceptance.js";
import { acceptNarration } from "../../domain/rules/narration-native.js";
import { narrationSceneNotices } from "../../domain/rules/narration-notices.js";
import { mutableSceneSubmission } from "../../domain/rules/scene-submissions.js";
import { memoryHash, memoryRequire } from "../../domain/rules/memory-integrity.js";
import type { VenueRecordEvent, VenueScene, VenueSubmission } from "../../domain/models/scene-model.js";
import type { VillageState } from "../../domain/models/world.js";
import type { SceneRetryCapture } from "../../domain/models/scene-retry.js";
import { savedOperationReference } from "../../adapters/storage/operation-evidence.js";
import { retryableEpisode, sceneRetryAuthority } from "../../domain/rules/scene-retry.js";
import { sceneEpisodeId } from "../../domain/rules/episode-sources.js";
import { badGateway, safeFailureMessage, VillagesRequestError } from "../../domain/rules/errors.js";
import { ZodError } from "zod";
import { findLocation } from "../../domain/rules/places.js";

export interface SceneProgressPorts {
  withSceneWork?<T>(id: string, work: () => Promise<T>): Promise<T>;
  onSettled?(id: string): void;
  onRecoveryFinished?(): void;
  readSession: typeof import("../../adapters/storage/scene-store.js").readSession;
  withCommittedVillageAuthority<T>(work: (state: VillageState) => Promise<T>): Promise<T>;
  mutateVillageState: typeof import("../world/village-store.js").mutateVillageState;
  changeSession: typeof import("../../adapters/storage/scene-store.js").changeSession;
  measurePipeline: typeof import("../../adapters/observability/pipeline-metrics.js").measurePipeline;
  assertVenueOwnership: typeof import("../../adapters/operations/operation-context.js").assertVenueOwnership;
  sceneQueries(): Pick<import("./services.js").SceneQueries, "progressBacklog">;
  villagesLogger: typeof import("../../adapters/engine/runtime-host.js").villagesLogger;
}

function matchesSceneRequest(scene: VenueScene, turn: VenueSubmission) {
  const source = turn.narration?.readset.source;
  return (
    source?.scene.id === scene.id && source.scene.villageSeed === scene.villageSeed && source.input === turn.message
  );
}

/** The Scene is the existing replay outbox; one Village CAS accepts native effects and common continuity. */
export function createSceneProgress({
  withSceneWork,
  onSettled,
  onRecoveryFinished,
  readSession,
  withCommittedVillageAuthority,
  mutateVillageState,
  changeSession,
  measurePipeline,
  assertVenueOwnership,
  sceneQueries,
  villagesLogger,
}: SceneProgressPorts) {
  async function applySavedExchange(
    scene: VenueScene,
    submissionId: string,
    startup: boolean,
    transient?: VenueSubmission["narration"],
  ) {
    const turn = scene.submissions.find((row) => row.id === submissionId);
    if (!turn || turn.acceptance.status === "applied" || turn.acceptance.status === "abandoned") return;
    const publication = transient ?? turn.narration;
    const marker = turn.replyCommit;
    memoryRequire(publication || marker, "saved narration identity is missing");
    const identity = memoryHash(marker ?? publication);
    const matchesScene = publication
      ? matchesSceneRequest(scene, { ...turn, narration: publication }) &&
        (!marker ||
          (marker.episodeId === publication.readset.source.episodeId &&
            marker.digest === memoryHash([publication.responseDigest, publication.raw, publication.readset])))
      : true;
    const committedEpisode = (state: VillageState) => {
      if (!marker) return acceptedNarrationEpisode(state, publication!, turn.id);
      memoryRequire(
        scene.villageSeed === state.seed &&
          marker.setupAt === state.setupAt &&
          marker.episodeId === sceneEpisodeId(state.seed, scene.id, turn.id),
        "Scene reply commitment changed",
      );
      const episode = state.episodes.records.find((row) => row.id === marker.episodeId);
      if (episode)
        memoryRequire(
          episode.sceneId === scene.id &&
            episode.operationId === marker.episodeId &&
            episode.submissionId === turn.id &&
            episode.privateInput === turn.message &&
            episode.responseDigest === marker.digest,
          "committed Scene reply changed",
        );
      return episode;
    };
    let result: ReturnType<typeof acceptNarration> | undefined;
    let abandoned = false;
    let validationFailure: unknown;
    try {
      if (!matchesScene) {
        validationFailure = new Error("Memory: saved narration request identity changed");
        throw validationFailure;
      }
      if (!publication) {
        const state = await withCommittedVillageAuthority(async (current) => current);
        const episode = committedEpisode(state);
        if (episode)
          result = { held: false, episode, rejected: episode.rejectedEffects ?? [], acceptedIds: [], replayed: true };
        else abandoned = true;
      } else if (startup && turn.acceptance.status === "held") {
        const state = await withCommittedVillageAuthority(async (current) => current);
        if (acceptedNarrationEpisode(state, publication, turn.id))
          result = acceptNarration(state, publication, turn.id, publication.readset.capturedAt);
        else abandoned = narrationIsAbandoned(state, publication, turn.id);
        if (!result && !abandoned) return;
      }
      if (publication && !result && !abandoned) {
        let capture: SceneRetryCapture | null | undefined;
        const readset = publication.readset;
        const original =
          scene.operation?.id === readset.source.operationId &&
          Object.entries(scene.operation.checkpoints).find(([stage]) => stage.startsWith("writing-request:"))?.[1];
        const request = original && typeof original === "object" ? savedOperationReference(original, scene) : undefined;
        await mutateVillageState(
          (state) => {
            capture = undefined;
            try {
              const prior = acceptedNarrationEpisode(state, publication, turn.id);
              if (!prior) {
                abandoned = narrationIsAbandoned(state, publication, turn.id);
                if (abandoned) return;
                assertVenueOwnership(scene);
                memoryRequire(
                  !startup ||
                    scene.operation?.id !== publication.readset.source.operationId ||
                    scene.operation.status !== "complete",
                  "cancelled narration requires explicit saved-result recovery",
                );
                memoryRequire(
                  scene.sceneRevision === publication.readset.sceneRevision,
                  "the admitted Scene changed before narration acceptance",
                );
              }
              const authority =
                !prior &&
                !marker &&
                request &&
                turn.mode === "chat" &&
                turn.id !== "greeting" &&
                readset.continuityRevision === state.continuity.revision &&
                readset.retryEpisodeRevision === state.episodes.revision
                  ? sceneRetryAuthority(state)
                  : undefined;
              result = acceptNarration(
                state,
                publication,
                turn.id,
                villageNow(state.clock?.advanceMs ?? 0).toISOString(),
              );
              if (!prior && result.episode) {
                const episode = result.episode;
                capture =
                  authority && request && retryableEpisode(state, episode, authority)
                    ? {
                        sceneId: scene.id,
                        submissionId: turn.id,
                        episodeId: episode.id,
                        request,
                        sceneRevision: scene.sceneRevision + 1,
                        originalOperationId: readset.source.operationId,
                      }
                    : null;
              }
            } catch (error) {
              validationFailure = error;
              throw error;
            }
          },
          { memories: true, captureSceneRetry: () => capture },
        );
      }
      memoryRequire(result || abandoned, "narration acceptance returned no result");
      const accepted = result;
      const episode = accepted?.episode;
      const publish = (notices: VenueRecordEvent[], authority?: VillageState) =>
        changeSession(scene.id, (saved) => {
          const entry = mutableSceneSubmission(saved, turn.id);
          memoryRequire(
            entry &&
              (entry.acceptance.status === "applied" || memoryHash(entry.replyCommit ?? entry.narration) === identity),
            "saved narration changed during publication",
          );
          if (entry.acceptance.status === "applied") return;
          if (abandoned) {
            entry.acceptance = { ...entry.acceptance, status: "abandoned" };
            if (marker && saved.operation?.id === turn.id && saved.operation.status !== "complete") {
              saved.operation.status = "complete";
              saved.operation.stage = "reply";
              saved.operation.error = "The reply was interrupted. Choose Retry to try again.";
            }
            return;
          }
          memoryRequire(accepted, "narration acceptance returned no result");
          if (accepted.held) {
            entry.acceptance = marker
              ? { status: "abandoned", rejected: [] }
              : { status: "held", rejected: accepted.rejected };
            entry.progressError = accepted.rejected
              .map((row) => row.reason)
              .join("; ")
              .slice(0, 300);
            return;
          }
          memoryRequire(episode, "narration acceptance returned no episode");
          applyAcceptedSceneDelta(saved, episode);
          const accessChanged = episode.commandReceipts.some(
            (receipt) =>
              receipt.kind === "access" && receipt.targetId === saved.placeId && receipt.witnesses.includes("player"),
          );
          if (authority && accessChanged && saved.continuity) {
            const continuity = structuredClone(saved.continuity);
            const captured = findLocation(continuity.facts, saved.placeId);
            const current = findLocation(authority, saved.placeId);
            if (captured && current) {
              captured.access = structuredClone(current.access);
              for (const zone of captured.zones ?? []) {
                const live = current.zones?.find(({ id }) => id === zone.id);
                if (live) zone.access = structuredClone(live.access);
              }
              saved.continuity = continuity;
            }
          }
          appendSceneInput(saved, entry);
          for (const line of episode.segments) {
            const prior = saved.lines.find((row) => row.id === line.id);
            memoryRequire(!prior || memoryHash(prior) === memoryHash(line), "published Scene line identity changed");
            if (!prior) saved.lines.push(structuredClone(line));
          }
          entry.replyLineIds = episode.segments.map((line) => line.id);
          entry.episodeId = episode.id;
          if (notices.length) entry.recordEvents = notices;
          else delete entry.recordEvents;
          entry.acceptance = { status: "applied", rejected: accepted.rejected };
          if (entry.id === "greeting") {
            appendVisitorIntroductionTutorial(
              saved,
              publication?.readset.visitorIntroductionFarewell ? episode.segments.at(-1)!.id : undefined,
            );
            if (saved.status === "opening") saved.status = "active";
            delete saved.visitEvent;
          }
          entry.progressProcessedAt = episode.acceptedAt;
          entry.progressError = "";
          delete entry.narration;
          delete entry.replyCommit;
          saved.lastActivityAt = episode.acceptedAt;
          const operation = saved.operation;
          if (
            operation?.id === (publication?.readset.source.operationId ?? turn.id) &&
            (operation.status === "interrupted" || (!publication && operation.status === "running")) &&
            !Object.values(operation.attempts).some((attempt) => attempt.status === "dispatching") &&
            !Object.keys(operation.checkpointClaims ?? {}).length
          ) {
            operation.status = "complete";
            operation.stage = "complete";
            operation.error = "";
            delete operation.failure;
            operation.snapshot = null;
            operation.checkpoints = {};
            operation.attempts = {};
          }
        });
      if (!episode) await publish([]);
      else
        await withCommittedVillageAuthority(async (state) => {
          const committed = committedEpisode(state);
          memoryRequire(
            state.seed === scene.villageSeed &&
              (!publication || state.setupAt === publication.readset.setupAt) &&
              committed?.id === episode.id &&
              committed.sceneId === scene.id &&
              committed.acceptedAt === episode.acceptedAt,
            "the committed narration changed before Scene publication",
          );
          return publish(
            committed.continuityVersionIds.length || committed.commandReceipts.length
              ? narrationSceneNotices(state, committed, scene.placeId)
              : [],
            state,
          );
        });
    } catch (error) {
      try {
        await changeSession(scene.id, (saved) => {
          const entry = mutableSceneSubmission(saved, turn.id);
          if (
            entry &&
            (entry.acceptance.status === "pending" || entry.acceptance.status === "held") &&
            memoryHash(entry.replyCommit ?? entry.narration) === identity
          ) {
            entry.progressError =
              marker && validationFailure === error
                ? "The reply contradicted the Scene rules. Choose Retry to try again."
                : String(error).slice(0, 300);
            if (validationFailure === error)
              entry.acceptance = marker
                ? { status: "abandoned", rejected: [] }
                : {
                    status: "held",
                    rejected: [{ id: "narration", reason: String(error).slice(0, 2000) }],
                  };
          }
        });
      } catch (bookkeepingError) {
        villagesLogger().warn(
          "[villages] narration error receipt could not be saved for %s: %s",
          turn.id,
          String(bookkeepingError),
        );
      }
      if (marker && validationFailure === error && !(error instanceof VillagesRequestError)) {
        if (error instanceof ZodError) throw badGateway("The reply used an invalid format. Choose Retry to try again.");
        if (error instanceof Error && error.message.startsWith("Memory: "))
          throw badGateway(safeFailureMessage(error).slice(8) + ". Choose Retry to try again.");
      }
      throw error;
    }
  }
  async function processSavedExchange(
    sessionId: string,
    submissionId: string,
    startup = false,
    transient?: VenueSubmission["narration"],
  ) {
    const work = async () => {
      const scene = await readSession(sessionId),
        turn = scene.submissions.find((row) => row.id === submissionId);
      if (!turn) return;
      await measurePipeline("saved narration", { sceneId: sessionId, submissionId }, () =>
        applySavedExchange(scene, submissionId, startup, transient),
      );
      onSettled?.(sessionId);
    };
    await (withSceneWork ? withSceneWork(sessionId, work) : work());
  }
  async function abandonSavedExchange(
    expected: VenueScene,
    operationId: string,
  ): Promise<"absent" | "applied" | "abandoned"> {
    const sessionId = expected.id;
    const expectedTurn = expected.submissions.find(
      (row) => row.id === operationId || row.narration?.readset.source.operationId === operationId,
    );
    const work = async () => {
      const scene = await readSession(sessionId);
      memoryRequire(
        expected.operation?.id === operationId &&
          scene.operation?.id === operationId &&
          expected.operation.attemptId === scene.operation.attemptId &&
          expected.operation.token === scene.operation.token &&
          expected.sceneRevision === scene.sceneRevision,
        "the failed request changed before abandonment",
      );
      const turn = scene.submissions.find(
        (row) => row.id === operationId || row.narration?.readset.source.operationId === operationId,
      );
      memoryRequire(
        !!turn === !!expectedTurn && (!turn || memoryHash(turn) === memoryHash(expectedTurn)),
        "saved narration changed before abandonment",
      );
      if (!turn) return "absent" as const;
      if (turn.acceptance.status === "applied" || turn.acceptance.status === "abandoned") return turn.acceptance.status;
      if (turn.replyCommit) {
        await applySavedExchange(scene, turn.id, false);
        const settled = (await readSession(sessionId)).submissions.find((row) => row.id === turn.id);
        memoryRequire(
          settled?.acceptance.status === "applied" || settled?.acceptance.status === "abandoned",
          "Scene reply commitment did not settle",
        );
        return settled.acceptance.status;
      }
      const publication = turn.narration;
      memoryRequire(publication, "saved narration purchase is missing");
      memoryRequire(matchesSceneRequest(scene, turn), "saved narration request identity changed");
      const identity = memoryHash(publication);
      let accepted = false;
      await mutateVillageState(
        (state) => {
          accepted = !!abandonNarration(state, publication, turn.id);
        },
        { memories: true },
      );
      if (accepted) {
        await applySavedExchange(scene, turn.id, false);
        return "applied" as const;
      }
      await changeSession(sessionId, (saved) => {
        const entry = mutableSceneSubmission(saved, turn.id);
        memoryRequire(
          entry && memoryHash(entry.narration) === identity && entry.acceptance.status !== "applied",
          "saved narration changed during abandonment",
        );
        entry.acceptance = { ...entry.acceptance, status: "abandoned" };
      });
      onSettled?.(sessionId);
      return "abandoned" as const;
    };
    return withSceneWork ? withSceneWork(sessionId, work) : work();
  }
  function startProgressRecovery(): () => void {
    let stopped = false,
      timer: ReturnType<typeof setTimeout> | undefined;
    const start = async () => {
      try {
        const queue = await sceneQueries().progressBacklog();
        const batch = async () => {
          for (const turn of queue.splice(0, 8)) {
            if (stopped) return;
            try {
              await processSavedExchange(turn.sessionId, turn.submissionId, true);
            } catch (error) {
              if (!stopped)
                villagesLogger().warn(
                  "[villages] narration replay failed for %s: %s",
                  turn.submissionId,
                  String(error),
                );
            }
          }
          if (!stopped && queue.length) timer = setTimeout(() => void batch(), 25);
          else if (!stopped) onRecoveryFinished?.();
        };
        if (!stopped && queue.length) timer = setTimeout(() => void batch(), 0);
        else if (!stopped) onRecoveryFinished?.();
      } catch (error) {
        if (!stopped) villagesLogger().warn("[villages] narration recovery could not read Scenes: %s", String(error));
      }
    };
    void start();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }
  return { processSavedExchange, abandonSavedExchange, startProgressRecovery };
}
export type SceneProgress = ReturnType<typeof createSceneProgress>;
