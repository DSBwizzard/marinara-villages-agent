import type { FoundingRetry, FoundingTaskKind } from "../../../shared/contracts/founding-tasks.js";
import type { villagesLogger } from "../../adapters/engine/runtime-host.js";
import { villageNow } from "../../adapters/time/clock-gate.js";
import type { VillageSnapshot } from "../../domain/models/world.js";
import { backgroundRevision } from "../../domain/rules/background-revision.js";
import { connectionFailureKind } from "../../domain/rules/connection-failure.js";
import { badRequest, conflict, safeFailureMessage } from "../../domain/rules/errors.js";
import { foundingReadyForPlay, foundingSlot, foundingTaskRevision } from "../../domain/rules/founding-tasks.js";
import { readOpeningProposal } from "../../domain/rules/opening-project.js";
import { proposalSourceCompatible } from "../../domain/rules/opening-proposal-source.js";
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
import type { proposeOpeningIdea } from "./founding-compact.js";
import type { seedFoundingVenueDetails } from "./founding-drafts.js";
import type { reportFoundingProgress } from "./founding-progress.js";
export interface FoundingPreparationPorts {
  proposeOpeningIdea?: typeof proposeOpeningIdea;
  backgroundJobSnapshot: typeof backgroundJobSnapshot;
  readFoundingResidentContext: typeof readFoundingResidentContext;
  queueFoundingWish: typeof queueFoundingWish;
  readVillageState: typeof readVillageState;
  mutateVillageState: typeof mutateVillageState;
  buildVillageSnapshot: typeof buildVillageSnapshot;
  villagesLogger: typeof villagesLogger;
  seedFoundingVenueDetails: typeof seedFoundingVenueDetails;
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
    seedFoundingVenueDetails,
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
      if (!targeted && !initial.foundingPreparation.venueDetailsSeeded) {
        try {
          await reportFoundingProgress(initial.seed, {
            phase: "venues",
            stage: "lore",
            currentId: "",
            currentVenueId: "",
            currentZoneId: "",
          });
          const details = await seedFoundingVenueDetails(initial, (progress) =>
            reportFoundingProgress(initial.seed, progress),
          );
          await reportFoundingProgress(initial.seed, { stage: "saving" });
          await mutateVillageState((state) => {
            if (
              state.seed !== initial.seed ||
              state.foundingPreparation?.status !== "pending" ||
              state.foundingPreparation.venueDetailsSeeded
            )
              return;
            for (const venue of state.venues) {
              const seed = details[venue.id];
              if (!seed) continue;
              const original = initial.venues.find((row) => row.id === venue.id);
              const source =
                original?.zones?.find((zone) => zone.kind === "public" || zone.kind === "shared-residence") ??
                original?.zones?.find((zone) => zone.kind === "exterior");
              const space = venue.zones?.find((zone) => zone.id === source?.id);
              const physicalSource = (place: typeof venue) => [
                place.form,
                place.classes,
                place.zones?.map((zone) => [
                  zone.id,
                  zone.name,
                  zone.kind,
                  zone.ownerId,
                  zone.description,
                  zone.state.revision,
                ]),
              ];
              if (
                !original ||
                !source ||
                !space ||
                backgroundRevision(physicalSource(original)) !== backgroundRevision(physicalSource(venue))
              )
                throw conflict(
                  "The founding Zone changed while its details were prepared. Its saved response is retained.",
                );
              if (seed.addition) {
                const description = [space.description, seed.addition].filter(Boolean).join("\n");
                if (description.length > 4000) throw badRequest("The complete initial Zone description is too long.");
                space.description = description;
                space.state = {
                  revision: space.state.revision + 1,
                  updatedAt: villageNow().toISOString(),
                  recent: null,
                };
              }
            }
            state.foundingPreparation.venueDetailsSeeded = true;
          });
        } catch (error) {
          villagesLogger().warn("[villages] initial venue details unavailable: %s", String(error));
          await mutateVillageState((state) => {
            if (state.seed === initial.seed && state.foundingPreparation?.status === "pending")
              state.foundingPreparation.error = safeFailureMessage(error).slice(0, 300);
          });
        }
      }
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
      // Opening ideas are independent of Routine/Wish parsing and commit one resident at a time.
      let openingError = "";
      if (!targeted && !connectionBlocked && initial.opening?.version === 2) {
        for (const id of initial.opening?.residentIds ?? []) {
          try {
            const live = await readVillageState();
            if (live.seed !== initial.seed || live.opening?.id !== initial.opening?.id) return;
            if (
              live.opening.stage !== "gathering" ||
              live.opening.proposals.some((row) => row.residentId === id) ||
              !live.villagers.some((row) => row.characterId === id)
            )
              continue;
            const context = await readFoundingResidentContext(id);
            if (!context || !ports.proposeOpeningIdea) throw new Error("Opening idea preparation is unavailable.");
            if (!proposalSourceCompatible({ input: { context } }, live, id))
              throw new Error("Opening context changed. Retry preparation.");
            const source = backgroundRevision([context.sourceRevision, context.circumstances]);
            const proposal = await ports.proposeOpeningIdea(
              context,
              `opening:${live.seed}:${live.opening.id}:${source}:${id}`,
              !!live.foundingPreparation?.retryActions?.length,
            );
            await mutateVillageState((state) => {
              if (
                state.seed !== live.seed ||
                state.opening?.id !== live.opening?.id ||
                state.opening?.stage !== "gathering" ||
                !proposalSourceCompatible({ input: { context } }, state, id) ||
                !state.villagers.some((row) => row.characterId === id)
              )
                throw new Error("Opening changed. Saved idea is preserved.");
              if (!state.opening.proposals.some((row) => row.residentId === id))
                state.opening.proposals.push(readOpeningProposal(proposal, id));
            });
          } catch (error) {
            openingError ||= safeFailureMessage(error).slice(0, 300);
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
        const ideasReady =
          state.opening?.version !== 2 ||
          !state.opening.residentIds.some(
            (id) =>
              state.villagers.some((row) => row.characterId === id) &&
              !state.opening!.proposals.some((row) => row.residentId === id),
          );
        const spacesReady = privatePreparationRooms(state).every(({ zone }) => zone.preparation?.status === "ready");
        marker.status =
          marker.venueDetailsSeeded && spacesReady && ideasReady && marker.completedIds.length === residentIds.length
            ? "ready"
            : "failed";
        marker.error =
          marker.status === "ready"
            ? ""
            : !marker.venueDetailsSeeded
              ? "Venue preparation incomplete."
              : !spacesReady
                ? privatePreparationRooms(state).find(({ zone }) => zone.preparation?.status !== "ready")?.zone
                    .preparation?.error || "Interior preparation incomplete."
                : !ideasReady
                  ? openingError || "Opening ideas incomplete. Retry preparation."
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
