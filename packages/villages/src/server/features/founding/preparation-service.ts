import { backgroundRevision } from "../../domain/rules/background-revision.js";
import { proposalSourceCompatible } from "../../domain/rules/opening-proposal-source.js";
import type { proposeOpeningIdea } from "./founding-compact.js";
import { readOpeningProposal } from "../../domain/rules/opening-project.js";
import { connectionFailureKind } from "../../domain/rules/connection-failure.js";
import { foundingIdentity } from "../../domain/rules/founding-requests.js";
import { readEffectiveVillagerCard } from "../../adapters/engine/catalog.js";
import { villageFoundingSetting, remapVenues } from "../../domain/rules/prompt-preset.js";
import { readSemanticWishCriteria } from "../../domain/rules/wish-criteria.js";
import { coerceWish } from "../../domain/rules/prompt-preset.js";
import type { FoundingRetry, FoundingTaskKind } from "../../../shared/contracts/founding-tasks.js";
import { foundingSlot, foundingTaskRevision } from "../../domain/rules/founding-tasks.js";
import { parseCompactFoundingCompletion } from "../../domain/rules/compact-founding-rules.js";
import { extractModelJsonObject } from "../../domain/rules/json-reply.js";
import { agendaRevision } from "../../domain/rules/agenda-revision.js";
import type {
  backgroundJobSnapshot,
  backgroundLegacyFounding,
  retireLegacyFounding,
} from "../../jobs/background-work.js";
import type { readFoundingResidentContext, adoptFoundingRoutine } from "../residents/resident-agendas.js";
import type { queueFoundingWish } from "../residents/wishes/wish-lifecycle.js";
import { villageNow } from "../../adapters/time/clock-gate.js";
import type { VillageSnapshot } from "../../domain/models/world.js";
import { badRequest, conflict, safeFailureMessage } from "../../domain/rules/errors.js";
import { randomVillageSeed } from "../../domain/rules/village-clock.js";
import { privatePreparationRooms } from "../../jobs/private-space-preparation.js";
import type { preparePrivateSpaces } from "../../jobs/private-space-preparation.js";
import type { backgroundWorkSummaries, retryBackgroundJob, settleBackgroundWork } from "../../jobs/background-work.js";
import type { villagesLogger } from "../../adapters/engine/runtime-host.js";
import type { readVillageState, mutateVillageState } from "../world/village-store.js";
import type { buildVillageSnapshot } from "../world/snapshot.js";
import type { seedFoundingVenueDetails } from "./founding-drafts.js";
import type { reportFoundingProgress } from "./founding-progress.js";
export interface FoundingPreparationPorts {
  proposeOpeningIdea?: typeof proposeOpeningIdea;
  backgroundJobSnapshot: typeof backgroundJobSnapshot;
  backgroundLegacyFounding: typeof backgroundLegacyFounding;
  retireLegacyFounding: typeof retireLegacyFounding;
  readFoundingResidentContext: typeof readFoundingResidentContext;
  adoptFoundingRoutine: typeof adoptFoundingRoutine;
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
  queueVillagerAgenda(characterId: string, finite?: boolean): Promise<void>;
}
/** One application owns the first-founding sequence and its deliberate retries. */
export function createFoundingPreparation(ports: FoundingPreparationPorts) {
  const {
    backgroundJobSnapshot,
    backgroundLegacyFounding,
    retireLegacyFounding,
    readFoundingResidentContext,
    adoptFoundingRoutine,
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
              const space = venue.spaces?.[0] ?? venue.zones?.find((zone) => zone.kind === "exterior");
              if (!space) continue;
              const features = seed.features.map((text) => ({
                id: randomVillageSeed(),
                text,
                sourceCharacterId: "",
                locked: false,
                updatedAt: "",
              }));
              space.state = {
                ...space.state,
                condition: seed.condition,
                items: seed.items,
                publicFacts: seed.publicFacts,
                features,
              };
              venue.state = {
                ...venue.state,
                condition: seed.condition,
                furniture: seed.items,
                publicFacts: seed.publicFacts,
                features,
              };
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
          const latest = await readVillageState(),
            marker = latest.foundingPreparation,
            id = villager.characterId;
          if (latest.seed !== initial.seed || marker?.status !== "pending") return;
          const task = marker.tasks?.[id]?.[kind];
          if (
            task?.status === "completed" ||
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
              prior &&
              (prior.input as any)?.foundingContract === 1 &&
              prior.revision === task?.revision &&
              ["failed", "interrupted", "paused"].includes(prior.status);
            if (retryable && marker.retryActions?.length)
              await retryBackgroundJob(task!.jobId, prior.attempt, marker.retryActions.at(-1)!);
            else if (kind === "routine") await queueVillagerAgenda(id, true);
            else {
              const context = await readFoundingResidentContext(id);
              if (!context) throw new Error("Character identity is unavailable.");
              const fresh = await readVillageState();
              const legacy =
                context.sourceRevision === foundingTaskRevision(fresh, id, "routine")
                  ? await compatibleLegacy(fresh, id)
                  : null;
              let savedProposal: Record<string, unknown> | undefined;
              if (legacy) {
                const response = legacy.steps.find(
                  (step) => step.key === "owned-routine-profile" && step.status === "completed",
                )?.response;
                const payload = response ? extractModelJsonObject(response) : null;
                if (
                  payload &&
                  !["length", "max_tokens"].includes(response?.finishReason ?? "") &&
                  (legacy.input as any)?.initialWishAttemptId ===
                    fresh.villagers.find((row) => row.characterId === id)?.wishLifecycle?.attempt?.id &&
                  (legacy.input as any)?.initialWishAttemptId &&
                  Array.isArray(payload.wishes) &&
                  payload.wishes.length <= 1
                ) {
                  const wish = payload.wishes[0];
                  if (!wish) savedProposal = { wish: null };
                  else if (
                    coerceWish(wish, "saved", new Date().toISOString())?.need &&
                    wish.need?.subject &&
                    wish.need?.action &&
                    ["lasting", "recurring"].includes(wish.need?.policy) &&
                    wish.neutralWording === true &&
                    readSemanticWishCriteria(wish.criteria, wish.wish)
                  )
                    savedProposal = { wish, neutralWording: true, matchedNeedId: "", certain: true };
                }
              }
              await queueFoundingWish(id, context, savedProposal);
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
      await salvageOpeningIdeas(await readVillageState());
      // Opening ideas are independent of Routine/Wish parsing and commit one resident at a time.
      let openingError = "";
      if (!targeted && !connectionBlocked) {
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
        const ideasReady = !state.opening?.residentIds.some(
          (id) =>
            state.villagers.some((row) => row.characterId === id) &&
            !state.opening!.proposals.some((row) => row.residentId === id),
        );
        const spacesReady = privatePreparationRooms(state).every(({ zone }) => zone.preparation?.status === "ready");
        marker.status =
          marker.venueDetailsSeeded &&
          spacesReady &&
          ideasReady &&
          marker.completedIds.length === state.villagers.length
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
  async function compatibleLegacy(state: Awaited<ReturnType<typeof readVillageState>>, id: string) {
    const job = await backgroundLegacyFounding(id, state.seed, agendaRevision(state, id)),
      context = (job?.input as any)?.context;
    if (context) {
      if (
        !Array.isArray(context.venues) ||
        !context.venues.every(
          (venue: any) =>
            venue && typeof venue.id === "string" && venue.state && Array.isArray(venue.state.publicFacts),
        ) ||
        !context.card ||
        typeof context.card !== "object"
      )
        return null;
      const resident = state.villagers.find((row) => row.characterId === id),
        home = state.venues.find((venue) => venue.occupancy.residentCharacterId === id);
      const homeText = home ? [home.name, home.form, home.state.condition].filter(Boolean).join("; ") : "";
      const facts = (venues: typeof state.venues) =>
        venues.map((venue) => [venue.id, venue.state.condition, venue.state.publicFacts.slice(0, 2)]);
      if (
        !resident ||
        context.setting !== villageFoundingSetting(state) ||
        context.home !== homeText ||
        JSON.stringify(foundingIdentity(context.card)) !==
          JSON.stringify(foundingIdentity(readEffectiveVillagerCard(resident))) ||
        JSON.stringify(facts(context.venues)) !== JSON.stringify(facts(remapVenues(state.venues)))
      )
        return null;
    }
    return job ? { ...job, compatibilitySourceRevision: foundingTaskRevision(state, id, "routine") } : null;
  }
  async function salvageOpeningIdeas(
    state: Awaited<ReturnType<typeof readVillageState>>,
    legacy: (readonly [string, Awaited<ReturnType<typeof compatibleLegacy>>])[] = [],
  ) {
    const seed = state.seed;
    for (const row of state.villagers) {
      const id = row.characterId;
      if (
        !state.opening?.residentIds.includes(id) ||
        state.opening.proposals.some((proposal) => proposal.residentId === id)
      )
        continue;
      const candidates = [
        await backgroundJobSnapshot("agenda", id),
        legacy.find(([residentId]) => residentId === id)?.[1],
      ];
      for (const job of candidates) {
        if (!job || job.seed !== state.seed || !(job.input as any)?.context?.openingProposal) continue;
        if (!proposalSourceCompatible(job, state, id)) continue;
        const capturedRevision = foundingTaskRevision(state, id, "routine");
        const saved = job.steps.find(
          (step) =>
            ["owned-routine-profile", "founding-routine-v1"].includes(step.key ?? "") && step.status === "completed",
        )?.response;
        if (!saved || ["length", "max_tokens"].includes(saved.finishReason ?? "")) continue;
        try {
          const proposal = readOpeningProposal(extractModelJsonObject(saved)?.openingProposal, id);
          await mutateVillageState((live) => {
            if (
              live.seed === seed &&
              live.opening?.id === state.opening?.id &&
              live.opening?.stage === "gathering" &&
              foundingTaskRevision(live, id, "routine") === capturedRevision &&
              proposalSourceCompatible(job, live, id) &&
              !live.opening.proposals.some((entry) => entry.residentId === id)
            )
              live.opening.proposals.push(proposal);
          });
          break;
        } catch {
          /* Invalid ideas never discard a valid saved Routine. */
        }
      }
    }
  }
  async function initializeTasks(seed: string) {
    const state = await readVillageState();
    if (state.seed !== seed) return;
    const legacy = await Promise.all(
      state.villagers.map(async (row) => [row.characterId, await compatibleLegacy(state, row.characterId)] as const),
    );
    await mutateVillageState((live) => {
      const marker = live.foundingPreparation;
      if (live.seed !== seed || marker?.status !== "pending") return;
      marker.tasksVersion = 1;
      marker.tasks ??= {};
      for (const row of live.villagers)
        for (const kind of ["routine", "wish"] as const) {
          marker.tasks[row.characterId] ??= {};
          const revision = foundingTaskRevision(live, row.characterId, kind),
            prior = marker.tasks[row.characterId][kind];
          // Wish completion changes its own need ledger; an applied receipt remains final.
          if (prior?.status === "completed" || prior?.revision === revision) continue;
          const old = legacy.find(([id]) => id === row.characterId)?.[1];
          const applied =
            !!old &&
            old.seed === live.seed &&
            old.compatibilitySourceRevision === foundingTaskRevision(live, row.characterId, "routine") &&
            old.revision === agendaRevision(live, row.characterId) &&
            old.status === "completed" &&
            live.backgroundReceipts[foundingSlot("routine", row.characterId)] === old.id &&
            !!row.agenda?.generatedAt &&
            !row.agenda.personalizationPending;
          const attempt = row.wishLifecycle?.attempt;
          const wishApplied =
            marker.completedIds.includes(row.characterId) ||
            attempt?.reason === "No initial wish today." ||
            (attempt?.reason === "Initial wish granted during preparation." &&
              !!attempt.candidate &&
              !!row.agenda?.wishes.some((wish) => wish.id === attempt.candidate!.id));
          marker.tasks[row.characterId][kind] = {
            contract: 1,
            revision,
            jobId: foundingSlot(kind, row.characterId),
            status: applied && (kind === "routine" || wishApplied) ? "completed" : "pending",
            attempt: 0,
            error: "",
            ...(applied && (kind === "routine" || wishApplied) ? { receipt: revision } : {}),
            ...(kind === "wish" && row.wishLifecycle?.attempt ? { allowanceId: row.wishLifecycle.attempt.id } : {}),
          };
        }
    });
    await salvageOpeningIdeas(state, legacy);
    // Salvage routine independently of any invalid legacy Wish, without provider work.
    for (const [id, old] of legacy) {
      if (
        !old ||
        (old.input as any)?.context === undefined ||
        (state.foundingPreparation?.selectedTasks?.length &&
          !state.foundingPreparation.selectedTasks.includes("routine:" + id))
      )
        continue;
      const response = old.steps.find(
        (step) => step.key === "owned-routine-profile" && step.status === "completed",
      )?.response;
      if (!response) continue;
      try {
        const result = parseCompactFoundingCompletion(response, {
          ...(old.input as any).context,
          allowInitialWish: false,
        });
        await mutateVillageState((live) => {
          const task = live.foundingPreparation?.tasks?.[id]?.routine;
          if (
            live.seed === seed &&
            old.seed === live.seed &&
            old.compatibilitySourceRevision === foundingTaskRevision(live, id, "routine") &&
            old.revision === agendaRevision(live, id) &&
            task?.status !== "completed" &&
            task?.revision === foundingTaskRevision(live, id, "routine")
          ) {
            adoptFoundingRoutine(live, id, result.agenda, task.revision);
          }
        });
        await retireLegacyFounding(old);
      } catch {
        /* Incomplete legacy routines need their own explicit replacement. */
      }
    }
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
    const marker = (await readVillageState()).foundingPreparation;
    if (marker && marker.status !== "ready")
      throw conflict("The village is still preparing. Retry any failed preparation before entering.");
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
