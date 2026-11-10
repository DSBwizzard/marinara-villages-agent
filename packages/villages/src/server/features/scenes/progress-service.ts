import { villageNow } from "../../adapters/time/clock-gate.js";
import {
  acceptedNarrationEpisode,
  abandonNarration,
  narrationIsAbandoned,
} from "../../domain/rules/narration-acceptance.js";
import { acceptNarration } from "../../domain/rules/narration-native.js";
import { mutableSceneSubmission } from "../../domain/rules/scene-submissions.js";
import { memoryHash, memoryRequire } from "../../domain/rules/memory-integrity.js";
import type { VenueScene } from "../../domain/models/scene-model.js";

export interface SceneProgressPorts {
  withSceneWork?<T>(id: string, work: () => Promise<T>): Promise<T>;
  onSettled?(id: string): void;
  onRecoveryFinished?(): void;
  readSession: typeof import("../../adapters/storage/scene-store.js").readSession;
  readVillageAuthority(): Promise<import("../../domain/models/world.js").VillageState>;
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
  readVillageAuthority,
  mutateVillageState,
  changeSession,
  measurePipeline,
  assertVenueOwnership,
  sceneQueries,
  villagesLogger,
}: SceneProgressPorts) {
  async function applySavedExchange(scene: VenueScene, submissionId: string, startup: boolean) {
    const turn = scene.submissions.find((row) => row.id === submissionId);
    if (!turn || turn.acceptance.status === "applied" || turn.acceptance.status === "abandoned") return;
    const publication = turn.narration;
    memoryRequire(publication, "saved narration purchase is missing");
    const identity = memoryHash(publication);
    let result: ReturnType<typeof acceptNarration> | undefined;
    let abandoned = false;
    let validationFailure: unknown;
    try {
      if (startup && turn.acceptance.status === "held") {
        const state = await readVillageAuthority();
        if (acceptedNarrationEpisode(state, publication, turn.id))
          result = acceptNarration(state, publication, turn.id, publication.readset.capturedAt);
        else abandoned = narrationIsAbandoned(state, publication, turn.id);
        if (!result && !abandoned) return;
      }
      if (!result && !abandoned)
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
      memoryRequire(result || abandoned, "narration acceptance returned no result");
      const accepted = result;
      await changeSession(scene.id, (saved) => {
        const entry = mutableSceneSubmission(saved, turn.id);
        memoryRequire(
          entry && (entry.acceptance.status === "applied" || memoryHash(entry.narration) === identity),
          "saved narration changed during publication",
        );
        if (entry.acceptance.status === "applied") return;
        if (abandoned) {
          entry.acceptance = { ...entry.acceptance, status: "abandoned" };
          return;
        }
        memoryRequire(accepted, "narration acceptance returned no result");
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
        const operation = saved.operation;
        if (
          operation?.id === publication.readset.source.operationId &&
          operation.status === "interrupted" &&
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
    } catch (error) {
      try {
        await changeSession(scene.id, (saved) => {
          const entry = mutableSceneSubmission(saved, turn.id);
          if (entry && (entry.acceptance.status === "pending" || entry.acceptance.status === "held")) {
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
      if (!turn) return;
      await measurePipeline("saved narration", { sceneId: sessionId, submissionId }, () =>
        applySavedExchange(scene, submissionId, startup),
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
      const publication = turn.narration;
      memoryRequire(publication, "saved narration purchase is missing");
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
