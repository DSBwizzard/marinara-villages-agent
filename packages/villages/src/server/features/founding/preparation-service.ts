import type { FoundingRetry, FoundingTaskKind } from "../../../shared/contracts/founding-tasks.js";
import type { villagesLogger } from "../../adapters/engine/runtime-host.js";
import { villageNow } from "../../adapters/time/clock-gate.js";
import type { VillageSnapshot } from "../../domain/models/world.js";
import { connectionFailureKind } from "../../domain/rules/connection-failure.js";
import { badRequest, conflict, safeFailureMessage } from "../../domain/rules/errors.js";
import { foundingReadyForPlay, foundingSlot, foundingTaskRevision } from "../../domain/rules/founding-tasks.js";
import { asRecord } from "../../domain/rules/coerce.js";

import { randomVillageSeed } from "../../domain/rules/village-clock.js";
import type {
  backgroundJobSnapshot,
  backgroundWorkSummaries,
  retryBackgroundJob,
  settleBackgroundWork,
} from "../../jobs/background-work.js";
import type { preparePrivateSpaces } from "../../jobs/private-space-preparation.js";
import { privatePreparationRooms } from "../../jobs/private-space-preparation.js";
import type { readFoundingResidentContext } from "../residents/resident-agendas.js";
import type { queueFoundingWish } from "../residents/wishes/service.js";
import type { buildVillageSnapshot } from "../world/snapshot.js";
import type { mutateVillageState, readVillageState } from "../world/village-store.js";

import type { reportFoundingProgress } from "./founding-progress.js";
export interface FoundingPreparationPorts {
  backgroundJobSnapshot: typeof backgroundJobSnapshot;
  readFoundingResidentContext: typeof readFoundingResidentContext;
  queueFoundingWish: typeof queueFoundingWish;
  readVillageState: typeof readVillageState;
  mutateVillageState: typeof mutateVillageState;
  buildVillageSnapshot: typeof buildVillageSnapshot;
  villagesLogger: typeof villagesLogger;
  reportFoundingProgress: typeof reportFoundingProgress;
  preparePrivateSpaces: typeof preparePrivateSpaces;
  backgroundWorkSummaries: typeof backgroundWorkSummaries;
  retryBackgroundJob: typeof retryBackgroundJob;
  settleBackgroundWork: typeof settleBackgroundWork;
  queueVillagerAgenda(characterId: string, finite?: boolean, origin?: "founding"): Promise<void>;
}
/** One application owns the first-founding sequence and its deliberate retries. */
export function createFoundingPreparation(ports: FoundingPreparationPorts) {
  const {
    backgroundJobSnapshot,
    readFoundingResidentContext,
    queueFoundingWish,
    readVillageState,
    mutateVillageState,
    buildVillageSnapshot,
    villagesLogger,
    reportFoundingProgress,
    preparePrivateSpaces,
    backgroundWorkSummaries,
    retryBackgroundJob,
    settleBackgroundWork,
    queueVillagerAgenda,
  } = ports;
  let foundingWork: Promise<void> | null = null;
  let retryAdmissions = 0;
  function prepareFoundedVillage(): Promise<void> {
    if (foundingWork) return foundingWork;
    let seed: string | undefined;
    foundingWork = (async () => {
      const initial = await readVillageState();
      seed = initial.seed;
      if (initial.foundingPreparation?.status !== "pending") return;
      await initializeTasks(initial.seed);
      const targeted = !!initial.foundingPreparation.selectedTasks?.length;
      try {
        if ((await readVillageState()).seed !== initial.seed) return;
        await reportFoundingProgress(initial.seed, {
          phase: "private-spaces",
          stage: "queued",
          currentId: "",
          attempt: undefined,
        });
        if (!targeted) await preparePrivateSpaces();
        const prepared = await readVillageState();
        if (prepared.seed !== initial.seed) return;
        const blocked = privatePreparationRooms(prepared).find(({ zone }) => zone.preparation?.status !== "ready");
        if (blocked)
          throw new Error(
            blocked.zone.preparation?.error || `${blocked.zone.name} needs preparation. Retry to continue.`,
          );
      } catch (error) {
        await mutateVillageState((state) => {
          if (state.seed === initial.seed && state.foundingPreparation?.status === "pending") {
            state.foundingPreparation.error = safeFailureMessage(error).slice(0, 300);
          }
        });
      }
      await initializeTasks(initial.seed);
      let connectionBlocked = false;
      for (const kind of ["routine", "wish"] as const) {
        for (const villager of initial.villagers) {
          const latest = await readVillageState({ wishes: [villager.characterId] }),
            marker = latest.foundingPreparation,
            id = villager.characterId;
          if (latest.seed !== initial.seed || marker?.status !== "pending") return;
          const task = marker.tasks?.[id]?.[kind];
          if (
            !task ||
            task.status === "completed" ||
            (marker.selectedTasks?.length && !marker.selectedTasks.includes(kind + ":" + id))
          )
            continue;
          if (connectionBlocked) continue;
          await reportFoundingProgress(initial.seed, {
            phase: "residents",
            currentId: id,
            currentTask: kind,
            currentVenueId: "",
            currentZoneId: "",
            stage: "reading",
            attempt: undefined,
            modelName: undefined,
            loreEntryCount: undefined,
          });
          try {
            const prior = await backgroundJobSnapshot(kind === "routine" ? "agenda" : "wish", id);
            await mutateVillageState((state) => {
              const current = state.foundingPreparation?.tasks?.[id]?.[kind];
              if (state.seed === initial.seed && current && current.status !== "completed") {
                current.status = "running";
                current.attempt =
                  prior && prior.revision === current.revision
                    ? prior.attempt + (["failed", "interrupted", "paused"].includes(prior.status) ? 1 : 0)
                    : (prior?.attempt ?? 0) + 1;
                state.foundingPreparation!.attempt = current.attempt;
              }
            });
            const retryable =
              prior && prior.revision === task?.revision && ["failed", "interrupted", "paused"].includes(prior.status);
            if (retryable && marker.retryActions?.length)
              await retryBackgroundJob(task!.jobId, prior.attempt, marker.retryActions.at(-1)!, prior.instanceId);
            else if (kind === "routine") await queueVillagerAgenda(id, true, "founding");
            else {
              const context = await readFoundingResidentContext(id);
              if (!context) throw new Error("Character identity is unavailable.");
              await queueFoundingWish(id, context);
            }
            await settleBackgroundWork();
            const jobs = await backgroundWorkSummaries(),
              summary = jobs.find((job) => job.id === foundingSlot(kind, id));
            await mutateVillageState((state) => {
              if (state.seed !== initial.seed || state.foundingPreparation?.status !== "pending") return;
              const saved = state.foundingPreparation.tasks?.[id]?.[kind];
              if (!saved) return;
              saved.attempt = summary?.attempt ?? saved.attempt;
              if (saved.status !== "completed") {
                saved.status = "failed";
                saved.error = summary?.error
                  ? safeFailureMessage(new Error(summary.error)).slice(0, 300)
                  : "Preparation interrupted. Retry deliberately.";
              }
            });
            // Only definitive connection configuration/auth failures stop the pass.
            connectionBlocked =
              summary?.failure?.connectionIssue === "configuration" ||
              connectionFailureKind(summary?.error ?? "", true) === "configuration" ||
              (summary?.status === "paused" && summary.connectionPaused);
          } catch (error) {
            await mutateVillageState((state) => {
              const task = state.foundingPreparation?.tasks?.[id]?.[kind];
              if (state.seed === initial.seed && task && task.status !== "completed") {
                task.status = "failed";
                task.error = safeFailureMessage(error).slice(0, 300);
              }
            });
            connectionBlocked = connectionFailureKind(error, true) === "configuration";
          }
        }
      }
      await mutateVillageState((state) => {
        const marker = state.foundingPreparation;
        if (state.seed !== initial.seed || marker?.status !== "pending") return;
        marker.completedIds = state.villagers
          .filter((row) =>
            ["routine", "wish"].every(
              (kind) => marker.tasks?.[row.characterId]?.[kind as FoundingTaskKind]?.status === "completed",
            ),
          )
          .map((row) => row.characterId);
        const residentIds = Object.keys(marker.tasks ?? {}).filter((id) =>
          state.villagers.some((resident) => resident.characterId === id),
        );
        const spacesReady = privatePreparationRooms(state).every(({ zone }) => zone.preparation?.status === "ready");
        marker.status = spacesReady && marker.completedIds.length === residentIds.length ? "ready" : "failed";
        marker.error =
          marker.status === "ready"
            ? ""
            : !spacesReady
              ? privatePreparationRooms(state).find(({ zone }) => zone.preparation?.status !== "ready")?.zone
                  .preparation?.error || "Interior preparation incomplete."
              : "Resident preparation incomplete.";
        marker.currentId = "";
        marker.currentTask = undefined;
        marker.stage = undefined;
        marker.selectedTasks = undefined;
      });
    })()
      .catch(async (error) => {
        villagesLogger().warn("[villages] founding preparation stopped: %s", String(error));
        try {
          await mutateVillageState((state) => {
            if (state.seed !== seed || state.foundingPreparation?.status !== "pending") return;
            state.foundingPreparation.status = "failed";
            state.foundingPreparation.error = safeFailureMessage(error).slice(0, 300);
          });
        } catch (writeError) {
          villagesLogger().warn(
            "[villages] founding preparation failure could not be recorded: %s",
            String(writeError),
          );
        }
      })
      .finally(() => {
        foundingWork = null;
      });
    return foundingWork;
  }
  async function retryFoundedVillagePreparation(input: FoundingRetry = {}): Promise<VillageSnapshot> {
    await recoverFoundingPreparation();
    const requested = await readVillageState(),
      marker = requested.foundingPreparation;
    if (!marker) return buildVillageSnapshot();
    if (input.actionId && marker.retryActions?.includes(input.actionId)) return buildVillageSnapshot();
    if (marker.status !== "failed") return buildVillageSnapshot();
    const targeted = input.characterId !== undefined || input.task !== undefined;
    if (
      targeted &&
      (!input.characterId ||
        !["routine", "wish"].includes(input.task ?? "") ||
        !Number.isInteger(input.expectedAttempt))
    )
      throw badRequest("Invalid preparation retry.");
    const actionId = input.actionId ?? randomVillageSeed();
    if (!/^[a-zA-Z0-9-]{1,100}$/.test(actionId)) throw badRequest("Invalid preparation retry.");
    const selected = input.characterId && input.task ? marker.tasks?.[input.characterId]?.[input.task] : undefined;
    if (targeted && (!selected || selected.status === "completed" || selected.attempt !== input.expectedAttempt))
      throw conflict("Preparation changed. Refresh before retrying.");
    let admitted = false;
    retryAdmissions++;
    try {
      await mutateVillageState((state) => {
        const live = state.foundingPreparation;
        admitted = false;
        if (state.seed !== requested.seed || live?.status !== "failed" || live.retryActions?.includes(actionId)) return;
        if (targeted && live.tasks?.[input.characterId!]?.[input.task!]?.attempt !== input.expectedAttempt)
          throw conflict("Preparation changed. Refresh before retrying.");
        admitted = true;
        live.retryActions = [...(live.retryActions ?? []), actionId].slice(-32);
        if (!targeted)
          for (const { zone } of privatePreparationRooms(state))
            if (zone.preparation?.status === "failed")
              zone.preparation = { status: "pending", attempt: zone.preparation.attempt };
        live.selectedTasks = targeted ? [input.task + ":" + input.characterId] : undefined;
        live.status = "pending";
        live.error = "";
        live.attempt = undefined;
        live.stage = "queued";
        live.stageStartedAt = villageNow().toISOString();
      });
      if (!admitted) return buildVillageSnapshot();
      await initializeTasks(requested.seed);
      void prepareFoundedVillage();
      return buildVillageSnapshot();
    } finally {
      retryAdmissions--;
    }
  }
  async function recoverFoundingPreparation(): Promise<void> {
    // A read after restart may report interruption, but never authorizes a new request.
    const current = await readVillageState();
    if (!foundingWork && !retryAdmissions && current.foundingPreparation?.status === "pending")
      await mutateVillageState((state) => {
        const marker = state.foundingPreparation;
        if (foundingWork || retryAdmissions || marker?.status !== "pending") return;
        marker.status = "failed";
        marker.error = "Preparation interrupted. Retry deliberately.";
        for (const tasks of Object.values(marker.tasks ?? {}))
          for (const task of Object.values(tasks)) if (task.status === "running") task.status = "failed";
      });
  }
  async function foundingPreparationSnapshot(): Promise<VillageSnapshot> {
    return buildVillageSnapshot();
  }
  async function assertFoundedVillageReady(): Promise<void> {
    if (!foundingReadyForPlay(await readVillageState()))
      throw conflict("The Village needs usable places and local routines before entering.");
  }

  async function initializeTasks(seed: string) {
    const initial = await readVillageState();
    const retained = new Map<string, { revision: string; context: unknown }>();
    if (initial.seed === seed)
      for (const [id, tasks] of Object.entries(initial.foundingPreparation?.tasks ?? {}))
        for (const kind of ["routine", "wish"] as const) {
          const task = tasks[kind];
          if (!task || task.status === "completed" || task.revision === foundingTaskRevision(initial, id, kind))
            continue;
          const job = await backgroundJobSnapshot(kind === "routine" ? "agenda" : "wish", id);
          if (job?.seed === seed && job.revision === task.revision)
            retained.set(kind + ":" + id, { revision: task.revision, context: asRecord(job.input).context });
        }
    await mutateVillageState(
      (live) => {
        const marker = live.foundingPreparation;
        if (live.seed !== seed || marker?.status !== "pending") return;
        const residentIds =
          live.opening?.residentIds ??
          (marker.tasksVersion === 1
            ? Object.keys(marker.tasks ?? {})
            : live.villagers.map((resident) => resident.characterId));
        marker.tasksVersion = 1;
        marker.tasks ??= {};
        for (const resident of live.villagers.filter((resident) => residentIds.includes(resident.characterId)))
          for (const kind of ["routine", "wish"] as const) {
            marker.tasks[resident.characterId] ??= {};
            const revision = foundingTaskRevision(live, resident.characterId, kind),
              prior = marker.tasks[resident.characterId][kind];
            if (prior?.status === "completed" || prior?.revision === revision) continue;
            const saved = retained.get(kind + ":" + resident.characterId);
            if (
              saved &&
              prior?.revision === saved.revision &&
              foundingTaskRevision(live, resident.characterId, kind, saved.context) === saved.revision
            )
              continue;
            marker.tasks[resident.characterId][kind] = {
              contract: 1,
              revision,
              jobId: foundingSlot(kind, resident.characterId),
              status: "pending",
              attempt: 0,
              error: "",
            };
          }
      },
      { wishes: true },
    );
  }
  return {
    prepareFoundedVillage,
    retryFoundedVillagePreparation,
    foundingPreparationSnapshot,
    recoverFoundingPreparation,
    assertFoundedVillageReady,
  };
}
export type FoundingPreparationService = ReturnType<typeof createFoundingPreparation>;
