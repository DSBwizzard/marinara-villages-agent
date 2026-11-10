import { villageNow } from "../../adapters/time/clock-gate.js";
import { acceptedNarrationEpisode } from "../../domain/rules/narration-acceptance.js";
import { acceptNarration } from "../../domain/rules/narration-native.js";
import { mutableSceneSubmission } from "../../domain/rules/scene-submissions.js";
import { memoryHash, memoryRequire } from "../../domain/rules/memory-integrity.js";
import type { VenueScene } from "../../domain/models/scene-model.js";

export interface SceneProgressPorts {
  withSceneWork?<T>(id: string, work: () => Promise<T>): Promise<T>;
  onSettled?(id: string): void;
  onRecoveryFinished?(): void;
  readSession: typeof import("../../adapters/storage/scene-store.js").readSession;
  mutateVillageState: typeof import("../world/village-store.js").mutateVillageState;
  changeSession: typeof import("../../adapters/storage/scene-store.js").changeSession;
  measurePipeline: typeof import("../../adapters/observability/pipeline-metrics.js").measurePipeline;
  assertVenueOwnership: typeof import("../../adapters/operations/operation-context.js").assertVenueOwnership;
  sceneQueries(): Pick<import("./services.js").SceneQueries, "progressBacklog">;
  villagesLogger: typeof import("../../adapters/engine/runtime-host.js").villagesLogger;
}

/** The Scene is the existing replay outbox; one Village CAS accepts native effects and common continuity. */
export function createSceneProgress({
  withSceneWork,
  onSettled,
  onRecoveryFinished,
  readSession,
  mutateVillageState,
  changeSession,
  measurePipeline,
  assertVenueOwnership,
  sceneQueries,
  villagesLogger,
}: SceneProgressPorts) {
  async function applySavedExchange(scene: VenueScene, submissionId: string, startup: boolean) {
    const turn = scene.submissions.find((row) => row.id === submissionId);
    if (!turn || turn.acceptance.status === "applied") return;
    const publication = turn.narration;
    memoryRequire(publication, "saved narration purchase is missing");
    const identity = memoryHash(publication);
    let result: ReturnType<typeof acceptNarration> | undefined;
    let validationFailure: unknown;
    try {
      await mutateVillageState(
        (state) => {
          try {
            memoryRequire(
              publication.readset.source.scene.id === scene.id &&
                publication.readset.source.scene.villageSeed === scene.villageSeed &&
                publication.readset.source.input === turn.message,
              "saved narration request identity changed",
            );
            if (!acceptedNarrationEpisode(state, publication, turn.id)) {
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
            result = acceptNarration(
              state,
              publication,
              turn.id,
              villageNow(state.clock?.advanceMs ?? 0).toISOString(),
            );
          } catch (error) {
            validationFailure = error;
            throw error;
          }
        },
        { memories: true },
      );
      memoryRequire(result, "narration acceptance returned no result");
      const accepted = result;
      await changeSession(scene.id, (saved) => {
        const entry = mutableSceneSubmission(saved, turn.id);
        memoryRequire(
          entry && (entry.acceptance.status === "applied" || memoryHash(entry.narration) === identity),
          "saved narration changed during publication",
        );
        if (entry.acceptance.status === "applied") return;
        if (accepted.held) {
          entry.acceptance = { status: "held", rejected: accepted.rejected };
          entry.progressError = accepted.rejected
            .map((row) => row.reason)
            .join("; ")
            .slice(0, 300);
          return;
        }
        const episode = accepted.episode!;
        for (const line of episode.segments) {
          const prior = saved.lines.find((row) => row.id === line.id);
          memoryRequire(!prior || memoryHash(prior) === memoryHash(line), "published Scene line identity changed");
          if (!prior) saved.lines.push(structuredClone(line));
        }
        entry.replyLineIds = episode.segments.map((line) => line.id);
        entry.episodeId = episode.id;
        entry.acceptance = { status: "applied", rejected: accepted.rejected };
        entry.progressProcessedAt = episode.acceptedAt;
        entry.progressError = "";
        delete entry.narration;
        saved.lastActivityAt = episode.acceptedAt;
      });
    } catch (error) {
      try {
        await changeSession(scene.id, (saved) => {
          const entry = mutableSceneSubmission(saved, turn.id);
          if (entry && entry.acceptance.status !== "applied") {
            entry.progressError = String(error).slice(0, 300);
            if (validationFailure === error)
              entry.acceptance = {
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
      throw error;
    }
  }
  async function processSavedExchange(sessionId: string, submissionId: string, startup = false) {
    const work = async () => {
      const scene = await readSession(sessionId),
        turn = scene.submissions.find((row) => row.id === submissionId);
      if (!turn || (startup && turn.acceptance.status === "held")) return;
      await measurePipeline("saved narration", { sceneId: sessionId, submissionId }, () =>
        applySavedExchange(scene, submissionId, startup),
      );
      onSettled?.(sessionId);
    };
    await (withSceneWork ? withSceneWork(sessionId, work) : work());
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
  return { processSavedExchange, startProgressRecovery };
}
export type SceneProgress = ReturnType<typeof createSceneProgress>;
